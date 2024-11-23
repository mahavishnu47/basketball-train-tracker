from flask import Flask, render_template, jsonify
import os
from datetime import datetime, timezone
import pytz
import requests
import json
import random
import traceback

app = Flask(__name__)

def calculate_start_day():
    # Set the target date to November 23rd, 2024
    target_date = datetime(2024, 11, 23).date()
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
    return min(days_since_start, 2)

def fetch_train_status():
    try:
        print("Starting fetch_train_status...")  # Debug log
        url = "https://irctc1.p.rapidapi.com/api/v3/liveTrainStatus"
        
        querystring = {
            "trainNo": "12002",
            "startDay": "0"
        }
        
        headers = {
            "X-RapidAPI-Key": os.getenv('RAPIDAPI_KEY'),
            "X-RapidAPI-Host": os.getenv('RAPIDAPI_HOST')
        }
        
        print(f"Making API request with headers: {headers}")  # Debug log
        response = requests.get(url, headers=headers, params=querystring)
        print(f"API Response status: {response.status_code}")  # Debug log
        
        if response.status_code != 200:
            print(f"API Error Response: {response.text}")  # Debug log
            raise Exception(f"API request failed with status {response.status_code}")
            
        data = response.json()
        print(f"Raw API response data: {data}")  # Debug log
        
        if not data.get("data"):
            print("No data in API response")  # Debug log
            raise Exception("No data received from API")
            
        train_data = data.get("data", {})
        print(f"Processed train data: {train_data}")  # Debug log
        
        # Process upcoming stations
        upcoming_stations = []
        print(f"Processing upcoming stations from: {train_data.get('upcoming_stations', [])}")  # Debug log
        
        for station in train_data.get("upcoming_stations", []):
            if station.get("station_name") == "VIDISHA":
                break
                
            upcoming_stations.append({
                "station_name": station.get("station_name", "Unknown"),
                "station_code": station.get("station_code", ""),
                "distance": f"{station.get('distance', 0)} km",
                "scheduled_arrival": station.get("sta", "00:00"),
                "scheduled_departure": station.get("std", "00:00"),
                "expected_arrival": station.get("eta", "00:00"),
                "platform_number": station.get("platform_number", "TBD"),
                "has_food": station.get("has_food", False),
                "halt_time": f"{station.get('halt', 0)} mins"
            })
        
        print(f"Processed upcoming stations: {upcoming_stations}")  # Debug log

        result = {
            "status": "success",
            "is_active": True,
            "current_station": train_data.get("current_station_name", "Unknown"),
            "upcoming_stations": upcoming_stations,
            "last_update": datetime.now().strftime("%I:%M %p"),
            "train_info": {
                "train_name": "NEW DELHI - BHOPAL SHATABDI",
                "source": "NEW DELHI",
                "destination": "BHOPAL",
                "next_station": upcoming_stations[0]["station_name"] if upcoming_stations else "N/A",
                "distance_covered": f"{train_data.get('distance_from_source', 0)} km",
                "total_distance": "800 km to Bhopal",
                "speed": f"{train_data.get('speed', 0)} km/h",
                "journey_time": f"{train_data.get('journey_time', 0)} minutes",
            },
            "status_as_of": train_data.get("status_as_of", "Unknown")
        }
        
        print(f"Final response: {result}")  # Debug log
        return result

    except Exception as e:
        print(f"Error in fetch_train_status: {str(e)}\nTraceback: {traceback.format_exc()}")  # Debug log with traceback
        return {
            "status": "error",
            "error": str(e),
            "is_active": False
        }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/get_update')
def get_update():
    try:
        print("Starting get_update request...")  # Debug log
        data = fetch_train_status()
        print(f"Fetch train status response: {data}")  # Debug log
        return jsonify(data)
    except Exception as e:
        print(f"Error in get_update: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
