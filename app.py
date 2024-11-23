from flask import Flask, render_template, jsonify
import os
from datetime import datetime, timezone
import pytz
import requests
import json

app = Flask(__name__)

def calculate_start_day():
    # Define the train start date
    train_start_date = datetime(2024, 11, 23, tzinfo=pytz.timezone('Asia/Kolkata'))
    current_date = datetime.now(pytz.timezone('Asia/Kolkata'))
    
    # If we're before the train start date, return None
    if current_date < train_start_date:
        return None
        
    # Calculate days since train start
    days_since_start = (current_date.date() - train_start_date.date()).days
    
    # The API expects 1-7 for the current week
    # Convert the days since start to a number between 1-7
    start_day = (days_since_start % 7) + 1
    
    return start_day

def fetch_train_status():
    try:
        # Get the current date and time in India
        india_tz = pytz.timezone('Asia/Kolkata')
        current_date = datetime.now(india_tz)
        train_start = datetime(2024, 11, 23, tzinfo=india_tz)
        train_end = datetime(2024, 11, 28, 23, 59, 59, tzinfo=india_tz)

        # Check if we're within the valid date range
        if current_date < train_start:
            days_until_start = (train_start - current_date).days
            hours_until_start = ((train_start - current_date).seconds // 3600)
            return {
                "current_station": "Not Started",
                "stations_remaining": "N/A",
                "status": f"Train journey begins in {days_until_start} days and {hours_until_start} hours",
                "last_update": current_date.strftime("%I:%M %p"),
                "is_active": False,
                "upcoming_stations": [],
                "train_info": {
                    "train_name": "Mumbai CSMT - Amritsar Express",
                    "source": "MUMBAI CSMT",
                    "destination": "AMRITSAR JN",
                    "message": "Waiting for the special journey to begin! ❤️"
                }
            }
        
        if current_date > train_end:
            return {
                "current_station": "Journey Completed",
                "stations_remaining": 0,
                "status": "Train journey has ended",
                "last_update": current_date.strftime("%I:%M %p"),
                "is_active": False,
                "upcoming_stations": [],
                "train_info": {
                    "train_name": "Mumbai CSMT - Amritsar Express",
                    "source": "MUMBAI CSMT",
                    "destination": "AMRITSAR JN",
                    "message": "The journey has concluded. Hope it was memorable! ❤️"
                }
            }

        start_day = calculate_start_day()
        if start_day is None:
            return {
                "error": "Invalid date range",
                "status": "Service not active yet"
            }

        url = "https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus"
        api_key = os.environ.get("RAPIDAPI_KEY")
        api_host = os.environ.get("RAPIDAPI_HOST", "irctc1.p.rapidapi.com")
        
        if not api_key:
            return {
                "error": "API configuration missing",
                "status": "Configuration Error"
            }

        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": api_host
        }
        
        params = {
            "trainNo": "11057",
            "startDay": str(start_day)
        }

        response = requests.get(url, headers=headers, params=params, timeout=10)
        response_data = response.json()
        
        if response.status_code != 200:
            return {
                "error": f"API Error: {response_data.get('message', 'Unknown error')}",
                "status": "API Error"
            }

        data = response_data.get("data", {})
        if not data or not data.get("success"):
            return {
                "error": "No train information available",
                "status": "Data Error"
            }

        # Get upcoming stations
        upcoming_stations = []
        for i in range(1, 36):
            station_key = str(i)
            if station_key in data.get("upcoming_stations", {}) and data["upcoming_stations"][station_key]:
                station = data["upcoming_stations"][station_key]
                upcoming_stations.append({
                    "name": station.get("station_name", ""),
                    "code": station.get("station_code", ""),
                    "eta": datetime.strptime(station.get("eta", "00:00"), "%H:%M").strftime("%I:%M %p") if station.get("eta") else "N/A",
                    "platform": station.get("platform_number", "TBD"),
                    "distance": station.get("distance_from_current_station", 0),
                    "halt": station.get("halt", 0)
                })

        # Calculate basic info
        current_station_index = int(data.get("stoppage_number", 0))
        stations_remaining = max(0, 46 - current_station_index)
        delay_mins = data.get("delay", 0)
        delay_text = f"{delay_mins} minutes delayed" if delay_mins > 0 else "On time"
        platform = data.get("platform_number", 0)
        platform_text = f"Platform {platform}" if platform > 0 else "TBD"

        return {
            "current_station": data.get("current_station_name", "N/A").replace("'", ""),
            "stations_remaining": stations_remaining,
            "status": data.get("status", "Status unavailable"),
            "last_update": current_date.strftime("%I:%M %p"),
            "is_active": True,
            "upcoming_stations": upcoming_stations,
            "train_info": {
                "train_name": data.get("train_name", "Mumbai CSMT - Amritsar Express"),
                "source": data.get("source_stn_name", "MUMBAI CSMT"),
                "destination": data.get("dest_stn_name", "AMRITSAR JN"),
                "delay": delay_text,
                "eta": datetime.strptime(data.get("eta", "00:00"), "%H:%M").strftime("%I:%M %p") if data.get("eta") else "N/A",
                "platform": platform_text,
                "next_station": upcoming_stations[0]["name"] if upcoming_stations else "N/A",
                "distance_covered": f"{data.get('distance_from_source', 0)} km",
                "total_distance": f"{data.get('total_distance', 0)} km",
                "speed": f"{data.get('avg_speed', 0)} km/h",
                "journey_time": f"{data.get('journey_time', 0)} minutes",
                "message": "Tracking your special journey with ❤️"
            }
        }
    except Exception as e:
        return {
            "error": f"System Error: {str(e)}",
            "status": "Error"
        }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now(pytz.timezone('Asia/Kolkata')).strftime("%Y-%m-%d %H:%M:%S"),
        "env_check": {
            "RAPIDAPI_KEY": "present" if os.environ.get("RAPIDAPI_KEY") else "missing",
            "RAPIDAPI_HOST": "present" if os.environ.get("RAPIDAPI_HOST") else "missing"
        }
    })

@app.route('/get_update')
def get_update():
    return jsonify(fetch_train_status())

if __name__ == '__main__':
    app.run()
