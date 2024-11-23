// Polling interval in milliseconds (20 seconds)
const POLLING_INTERVAL = 20000;

function updateTrainStatus() {
    fetch('/get_update')
        .then(response => response.json())
        .then(data => {
            // Update train status
            document.getElementById('current-station').textContent = data.current_station || 'N/A';
            document.getElementById('stations-remaining').textContent = data.stations_remaining || 0;
            document.getElementById('last-update').textContent = data.last_update || 'N/A';
            document.getElementById('status').textContent = data.status || 'Status unavailable';

            // Update train info
            if (data.train_info) {
                document.getElementById('train-name').textContent = data.train_info.train_name || 'N/A';
                document.getElementById('source').textContent = data.train_info.source || 'N/A';
                document.getElementById('destination').textContent = data.train_info.destination || 'N/A';
                document.getElementById('delay').textContent = data.train_info.delay || 'N/A';
                document.getElementById('eta').textContent = data.train_info.eta || 'N/A';
                document.getElementById('platform').textContent = data.train_info.platform || 'TBD';
                document.getElementById('next-station').textContent = data.train_info.next_station || 'N/A';
                document.getElementById('distance-covered').textContent = data.train_info.distance_covered || 'N/A';
                document.getElementById('total-distance').textContent = data.train_info.total_distance || 'N/A';
                document.getElementById('speed').textContent = data.train_info.speed || 'N/A';
                document.getElementById('journey-time').textContent = data.train_info.journey_time || 'N/A';
            }

            // Update stations list if available
            if (data.upcoming_stations && data.upcoming_stations.length > 0) {
                const stationsList = document.getElementById('stations-list');
                stationsList.innerHTML = '';
                
                data.upcoming_stations.forEach(station => {
                    const li = document.createElement('li');
                    li.className = 'station-item';
                    li.innerHTML = `
                        <div class="station-name">${station.name} (${station.code})</div>
                        <div class="station-details">
                            <span>ETA: ${station.eta}</span>
                            <span>Platform: ${station.platform}</span>
                            <span>Distance: ${station.distance}km</span>
                            <span>Halt: ${station.halt}min</span>
                        </div>
                    `;
                    stationsList.appendChild(li);
                });
            }

            // Handle service status
            if (!data.is_active) {
                document.getElementById('status').classList.add('inactive');
            } else {
                document.getElementById('status').classList.remove('inactive');
            }
        })
        .catch(error => {
            console.error('Error fetching train status:', error);
            document.getElementById('status').textContent = 'Error fetching train status';
        });
}

// Initial update
updateTrainStatus();

// Set up polling
setInterval(updateTrainStatus, POLLING_INTERVAL);

// Modal functionality
document.getElementById('show-stations').addEventListener('click', function() {
    document.getElementById('stations-modal').style.display = 'block';
});

document.getElementsByClassName('close')[0].addEventListener('click', function() {
    document.getElementById('stations-modal').style.display = 'none';
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('stations-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});
