from flask import Flask, render_template, jsonify
import os
from datetime import datetime
import pytz
import requests
import json

app = Flask(__name__)

def fetch_train_status():
    try:
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
            "startDay": "1"
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
            "last_update": datetime.now(pytz.timezone('Asia/Kolkata')).strftime("%I:%M %p"),
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
                "journey_time": f"{data.get('journey_time', 0)} minutes"
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
