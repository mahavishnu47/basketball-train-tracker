from flask import Flask, render_template, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import requests
import json
from datetime import datetime, timedelta
import pytz
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Global variable to store train data
train_data = {
    "current_station": "",
    "stations_remaining": 0,
    "last_update": "",
    "status": "Loading...",
    "is_active": True,
    "train_info": {},
    "debug_info": {}  # Add debug information
}

# Define the date range
START_DATE = datetime(2024, 11, 22)
END_DATE = datetime(2024, 11, 28, 23, 59, 59)

def is_within_date_range():
    current_date = datetime.now(pytz.timezone('Asia/Kolkata'))
    return START_DATE <= current_date.replace(tzinfo=None) <= END_DATE

def calculate_stations_remaining(total_distance, distance_from_source):
    # Approximate number of stations based on distance
    # Average distance between major stations is roughly 50-60 km
    AVG_STATION_DISTANCE = 55
    return max(0, round((total_distance - distance_from_source) / AVG_STATION_DISTANCE))

def fetch_train_status():
    if not is_within_date_range():
        train_data["status"] = "Service inactive (Outside operational dates: Nov 22-28, 2024)"
        train_data["is_active"] = False
        return

    try:
        url = "https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus"
        
        headers = {
            "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY"),
            "X-RapidAPI-Host": os.getenv("RAPIDAPI_HOST")
        }
        
        params = {
            "trainNo": "11057",
            "startDay": "1"
        }
        
        response = requests.get(url, headers=headers, params=params)
        
        try:
            response_data = response.json()
            print(f"\n=== API Response ===\n{json.dumps(response_data, indent=2)}")
        except json.JSONDecodeError as je:
            print(f"Failed to parse JSON response: {response.text}")
            raise

        if response.status_code == 200 and response_data.get("status") is True:
            data = response_data.get("data", {})
            
            if data and data.get("success") is True:
                # Get the next station info
                upcoming_stations = data.get("upcoming_stations", {})
                next_station = None
                for i in range(1, 36):  # Check first 35 upcoming stations
                    if str(i) in upcoming_stations and upcoming_stations[str(i)]:
                        next_station = upcoming_stations[str(i)]
                        break

                # Get upcoming stations list
                upcoming_station_list = []
                for i in range(1, 36):  # Check first 35 upcoming stations
                    station_key = str(i)
                    if station_key in upcoming_stations and upcoming_stations[station_key]:
                        station = upcoming_stations[station_key]
                        upcoming_station_list.append({
                            "name": station.get("station_name", ""),
                            "code": station.get("station_code", ""),
                            "eta": datetime.strptime(station.get("eta", "00:00"), "%H:%M").strftime("%I:%M %p") if station.get("eta") else "N/A",
                            "platform": station.get("platform_number", "TBD"),
                            "distance": station.get("distance_from_current_station", 0),
                            "halt": station.get("halt", 0)
                        })

                # Calculate stations remaining
                current_station_index = int(data.get("stoppage_number", 0))
                total_stations = 46  # From the data structure
                stations_remaining = total_stations - current_station_index

                # Format delay
                delay_mins = data.get("delay", 0)
                delay_text = f"{delay_mins} minutes delayed" if delay_mins > 0 else "On time"

                # Format status time
                status_time = data.get("status_as_of", "")
                if "mins ago" in status_time.lower():
                    formatted_time = status_time
                else:
                    formatted_time = f"{status_time} ago" if status_time else ""

                # Get platform
                platform = data.get("platform_number", 0)
                platform_text = f"Platform {platform}" if platform > 0 else "TBD"

                # Update train data
                train_data.update({
                    "current_station": data.get("current_station_name", "N/A").replace("'", ""),
                    "stations_remaining": stations_remaining,
                    "status": f"{data.get('status', 'Status unavailable')} ({formatted_time})",
                    "last_update": datetime.now(pytz.timezone('Asia/Kolkata')).strftime("%I:%M %p"),
                    "upcoming_stations": upcoming_station_list,
                    "train_info": {
                        "train_name": data.get("train_name", "Mumbai CSMT - Amritsar Express"),
                        "source": data.get("source_stn_name", "MUMBAI CSMT"),
                        "destination": data.get("dest_stn_name", "AMRITSAR JN"),
                        "delay": delay_text,
                        "eta": datetime.strptime(data.get("eta", "00:00"), "%H:%M").strftime("%I:%M %p") if data.get("eta") else "N/A",
                        "platform": platform_text,
                        "next_station": next_station.get("station_name", "N/A") if next_station else "N/A",
                        "distance_covered": f"{data.get('distance_from_source', 0)} km",
                        "total_distance": f"{data.get('total_distance', 0)} km",
                        "speed": f"{data.get('avg_speed', 0)} km/h",
                        "journey_time": f"{data.get('journey_time', 0)} minutes"
                    }
                })

                print("\n=== Updated Train Data ===")
                print(json.dumps(train_data, indent=2))
            else:
                train_data["status"] = "No train information available"
        else:
            error_msg = "Unable to fetch train status"
            if response_data.get("message"):
                error_msg += f": {response_data.get('message')}"
            train_data["status"] = error_msg
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {str(e)}")
        train_data["status"] = f"Connection Error: {str(e)}"
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        train_data["status"] = f"System Error: {str(e)}"

# Initialize the scheduler with a random delay to avoid hitting exactly at the hour marks
initial_delay = timedelta(minutes=datetime.now().minute % 5)  # Small initial delay
scheduler = BackgroundScheduler()
scheduler.add_job(
    func=fetch_train_status, 
    trigger="interval", 
    minutes=20,
    start_date=datetime.now() + initial_delay
)
scheduler.start()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_update')
def get_update():
    return jsonify(train_data)

@app.route('/debug')
def debug():
    return jsonify(train_data["debug_info"])

if __name__ == '__main__':
    fetch_train_status()  # Initial fetch
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 3000)))

# Add this line for Vercel
app = app
