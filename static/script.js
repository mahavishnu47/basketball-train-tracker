// Polling interval in milliseconds (30 seconds)
const POLLING_INTERVAL = 30000;

// Function to update the train status
function updateTrainStatus() {
    fetch('/get_update')
        .then(response => response.json())
        .then(data => {
            const statusContainer = document.getElementById('status-container');
            const messageContainer = document.getElementById('message-container');
            const stationsList = document.getElementById('upcoming-stations');
            const trainInfo = document.getElementById('train-info');

            // Clear previous content
            statusContainer.innerHTML = '';
            messageContainer.innerHTML = '';
            stationsList.innerHTML = '';
            trainInfo.innerHTML = '';

            if (data.error) {
                statusContainer.innerHTML = `<div class="error">${data.error}</div>`;
                return;
            }

            // Add special message with animation
            if (data.train_info && data.train_info.message) {
                messageContainer.innerHTML = `
                    <div class="special-message">
                        <span class="message-text">${data.train_info.message}</span>
                    </div>
                `;
            }

            // Current Status Section
            const statusHTML = `
                <div class="status-box ${data.is_active ? 'active' : 'inactive'}">
                    <h2>Current Status</h2>
                    <p class="current-station">🚉 Current Station: ${data.current_station}</p>
                    <p class="status">📍 Status: ${data.status}</p>
                    <p class="last-update">🕒 Last Updated: ${data.last_update}</p>
                </div>
            `;
            statusContainer.innerHTML = statusHTML;

            // Train Info Section
            if (data.train_info) {
                const trainInfoHTML = `
                    <div class="train-info-box">
                        <h2>Train Information</h2>
                        <p>🚂 Train: ${data.train_info.train_name}</p>
                        <p>🏁 From: ${data.train_info.source}</p>
                        <p>🎯 To: ${data.train_info.destination}</p>
                        <p>⏱️ Delay: ${data.train_info.delay}</p>
                        <p>🎯 Platform: ${data.train_info.platform}</p>
                        <p>⏰ ETA: ${data.train_info.eta}</p>
                        <p>🛤️ Distance Covered: ${data.train_info.distance_covered}</p>
                        <p>🚄 Speed: ${data.train_info.speed}</p>
                    </div>
                `;
                trainInfo.innerHTML = trainInfoHTML;
            }

            // Upcoming Stations Section
            if (data.upcoming_stations && data.upcoming_stations.length > 0) {
                const stationsHTML = data.upcoming_stations.map(station => `
                    <div class="station-card">
                        <h3>${station.name}</h3>
                        <p>🕒 ETA: ${station.eta}</p>
                        <p>📍 Platform: ${station.platform}</p>
                        <p>📏 Distance: ${station.distance} km</p>
                        <p>⏸️ Halt: ${station.halt} mins</p>
                    </div>
                `).join('');
                
                stationsList.innerHTML = `
                    <div class="stations-box">
                        <h2>Next Stations (${data.stations_remaining} remaining)</h2>
                        <div class="stations-grid">
                            ${stationsHTML}
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('status-container').innerHTML = `
                <div class="error">
                    Failed to fetch train status. Please try again later.
                </div>
            `;
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
