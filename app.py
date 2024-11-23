from flask import Flask, render_template, jsonify
import os
from datetime import datetime, timezone
import pytz
import requests
import json

app = Flask(__name__)

def calculate_start_day():
    # Set the target date to November 23rd, 2024
    target_date = datetime(2024, 11, 22).date()
    current_date = datetime.now().date()
    
    # If we're before the journey date, return 0 (start of journey)
    if current_date < target_date:
        return 0
        
    # Calculate days since start
    days_since_start = (current_date - target_date).days
    
    # The API expects 0-4 where:
    # 0 = start of journey
    # 1 = one day ago
    # 2 = two days ago
    # 3 = three days ago
    # 4 = four days ago
    return min(days_since_start, 4)

def fetch_train_status():
    try:
        # Get current time in IST
        ist = pytz.timezone('Asia/Kolkata')
        current_time = datetime.now(ist)
        current_date = current_time.date()
        target_date = datetime(2024, 11, 23).date()
        
        # Calculate start day (0-4) for API
        start_day = calculate_start_day()
        
        # Check if journey hasn't started
        if current_date < target_date:
            days_until = (target_date - current_date).days
            return {
                "is_active": False,
                "status": f"Journey starts in {days_until} days",
                "train_info": {
                    "train_name": "ASR Express (11057)",
                    "source": "MUMBAI CSMT",
                    "destination": "BHOPAL JN",
                    "message": "Counting down the days until your special journey! 🏀❤️"
                }
            }

        # Prepare headers for RapidAPI
        url = "https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus"
        
        # Get API credentials from environment variables
        api_key = os.getenv('RAPIDAPI_KEY')
        api_host = os.getenv('RAPIDAPI_HOST', 'irctc1.p.rapidapi.com')
        
        if not api_key:
            raise Exception("API key not found in environment variables")
            
        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": api_host
        }

        # Query parameters for the train
        querystring = {
            "trainNo": "11057",
            "startDay": str(start_day)  # API expects 0-4
        }

        print(f"Making API request with headers: {headers}")
        print(f"Query parameters: {querystring}")
        
        # Make API request with increased timeout
        response = requests.get(url, headers=headers, params=querystring, timeout=30)
        
        if response.status_code != 200:
            print(f"API returned status code: {response.status_code}")
            print(f"Response content: {response.text}")
            raise Exception(f"API returned status code {response.status_code}")

        data = response.json()
        print(f"API Response: {data}")
        
        if not data or "data" not in data:
            raise Exception("Invalid response format from API")
            
        train_data = data.get("data", {})
        
        # Process upcoming stations
        upcoming_stations = []
        for station in train_data.get("upcoming_stations", []):
            if station.get("station_name") == "BHOPAL JN":
                break
                
            upcoming_stations.append({
                "station_name": station.get("station_name", "Unknown"),
                "station_code": station.get("station_code", ""),
                "day": station.get("day", 1),
                "distance_from_start": station.get("distance_from_source", 0),
                "scheduled_arrival": station.get("sta", "00:00"),
                "scheduled_departure": station.get("std", "00:00"),
                "expected_arrival": station.get("eta", "00:00"),
                "platform_number": station.get("platform_number", "TBD"),
                "has_food": station.get("has_food", False),
                "halt_time": f"{station.get('halt', 0)} mins"
            })

        return {
            "is_active": True,
            "error": None,
            "status": train_data.get("current_status", "Status unavailable"),
            "current_station": train_data.get("current_station_name", "Unknown"),
            "last_update": current_time.strftime("%I:%M %p"),
            "upcoming_stations": upcoming_stations,
            "train_info": {
                "train_name": "ASR Express (11057)",
                "source": "MUMBAI CSMT",
                "destination": "BHOPAL JN",
                "delay": train_data.get("delay_text", "No information"),
                "eta": train_data.get("eta", "Not available"),
                "platform": f"Platform {train_data.get('platform_number', 'TBD')}",
                "next_station": upcoming_stations[0]["station_name"] if upcoming_stations else "N/A",
                "distance_covered": f"{train_data.get('distance_from_source', 0)} km",
                "total_distance": "800 km to Bhopal",
                "speed": f"{train_data.get('speed', 0)} km/h",
                "journey_time": f"{train_data.get('journey_time', 0)} minutes",
                "message": "Your journey is progressing smoothly! 🏀❤️"
            }
        }

    except Exception as e:
        print(f"Error in fetch_train_status: {str(e)}")  # Log the error
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
