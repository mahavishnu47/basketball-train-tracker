// Polling interval in milliseconds (15 minutes)
const POLLING_INTERVAL = 60000*15;

// Function to format time
function formatTime(time) {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
}

// Function to create station card
function createStationCard(station, index) {
    const arrivalTime = formatTime(station.scheduled_arrival);
    const departureTime = formatTime(station.scheduled_departure);
    const expectedArrival = formatTime(station.expected_arrival);
    
    return `
        <div class="station-card" onclick="toggleStationDetails(${index})">
            <div class="station-header">
                <div class="station-basic-info">
                    <span class="icon">🚉</span>
                    <h3 class="station-name">${station.station_name}</h3>
                    <span class="station-code">${station.station_code}</span>
                </div>
                <div class="station-time">
                    <span class="icon">⏰</span>
                    <span>ETA: ${expectedArrival}</span>
                </div>
                <span class="expand-icon" id="expand-${index}">▼</span>
            </div>
            <div class="station-details" id="details-${index}">
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="icon">📍</span>
                        <span class="label">Distance:</span>
                        <span>${station.distance_from_start} km</span>
                    </div>
                    <div class="detail-item">
                        <span class="icon">⏱️</span>
                        <span class="label">Scheduled:</span>
                        <span>${arrivalTime} - ${departureTime}</span>
                    </div>
                    <div class="detail-item">
                        <span class="icon">⌛</span>
                        <span class="label">Halt Time:</span>
                        <span>${station.halt_time}</span>
                    </div>
                    <div class="detail-item">
                        <span class="icon">🎯</span>
                        <span class="label">Platform:</span>
                        <span>${station.platform_number}</span>
                    </div>
                    ${station.has_food ? `
                        <div class="detail-item">
                            <span class="icon">🍱</span>
                            <span class="label">Food Available</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Function to toggle station details
function toggleStationDetails(index) {
    const detailsElement = document.getElementById(`details-${index}`);
    const expandIcon = document.getElementById(`expand-${index}`);
    
    if (detailsElement && expandIcon) {
        if (detailsElement.style.maxHeight) {
            detailsElement.style.maxHeight = null;
            expandIcon.style.transform = 'rotate(0deg)';
        } else {
            detailsElement.style.maxHeight = detailsElement.scrollHeight + 'px';
            expandIcon.style.transform = 'rotate(180deg)';
        }
    }
}

// Function to update the train status with gentler transitions
function updateTrainStatus() {
    console.log('Fetching train status...');
    fetch('/get_update')
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data);
            const elements = {
                statusContainer: document.getElementById('status-container'),
                messageContainer: document.getElementById('message-container'),
                stationsList: document.getElementById('upcoming-stations'),
                trainInfo: document.getElementById('train-info')
            };

            // Verify all elements are found
            Object.entries(elements).forEach(([key, element]) => {
                if (!element) {
                    console.error(`Element not found: ${key}`);
                }
            });

            // Add fade transition class
            Object.values(elements).forEach(el => {
                if (el) {
                    el.classList.add('fade-transition');
                    el.style.opacity = '0';
                }
            });

            setTimeout(() => {
                // Clear previous content
                Object.values(elements).forEach(el => {
                    if (el) el.innerHTML = '';
                });

                if (data.error) {
                    console.error('Error from API:', data.error);
                    if (elements.statusContainer) {
                        elements.statusContainer.innerHTML = `
                            <div class="error">
                                <p>Unable to update train status. Please try again.</p>
                            </div>
                        `;
                    }
                    return;
                }

                // Special message or countdown
                if (elements.messageContainer) {
                    const messageHTML = `
                        <div class="special-message">
                            ${!data.is_active ? 
                                `<div class="countdown">${data.status}</div>` : 
                                ''
                            }
                            <span class="message-text">${data.train_info.message}</span>
                        </div>
                    `;
                    elements.messageContainer.innerHTML = messageHTML;
                }

                // Current Status
                if (elements.statusContainer) {
                    const statusHTML = `
                        <div class="status-box">
                            <h2>Train Status</h2>
                            <p class="current-station">
                                <span class="icon">📍</span>
                                Current Station: ${data.current_station}
                            </p>
                            <p class="status">
                                <span class="icon">ℹ️</span>
                                ${data.status}
                            </p>
                            <p class="last-update">
                                <span class="icon">⏱️</span>
                                Updated: ${data.last_update}
                            </p>
                        </div>
                    `;
                    elements.statusContainer.innerHTML = statusHTML;
                }

                // Train Info
                if (elements.trainInfo) {
                    const trainInfoHTML = `
                        <div class="status-box">
                            <h2>Journey Details</h2>
                            <p><span class="icon">🚂</span>${data.train_info.train_name}</p>
                            <p><span class="icon">🏁</span>From: ${data.train_info.source}</p>
                            <p><span class="icon">🎯</span>To: ${data.train_info.destination}</p>
                        </div>
                    `;
                    elements.trainInfo.innerHTML = trainInfoHTML;
                }

                console.log('Upcoming stations:', data.upcoming_stations);
                // Upcoming Stations
                if (data.upcoming_stations && data.upcoming_stations.length > 0 && elements.stationsList) {
                    console.log('Creating station cards...');
                    const stationsHTML = `
                        <div class="status-box">
                            <h2>Next Stops</h2>
                            <div class="stations-list">
                                ${data.upcoming_stations.map((station, index) => {
                                    console.log('Creating card for station:', station);
                                    return createStationCard(station, index);
                                }).join('')}
                            </div>
                        </div>
                    `;
                    elements.stationsList.innerHTML = stationsHTML;
                } else {
                    console.log('No upcoming stations data available');
                }

                // Gentle fade in
                Object.values(elements).forEach(el => {
                    if (el) el.style.opacity = '1';
                });
            }, 400);
        })
        .catch(error => {
            console.error('Error fetching train status:', error);
            const statusContainer = document.getElementById('status-container');
            if (statusContainer) {
                statusContainer.innerHTML = `
                    <div class="error">
                        <p>Unable to update train status. Please try again.</p>
                    </div>
                `;
            }
        });
}

// Initial update
console.log('Starting train status updates...');
updateTrainStatus();

// Set up polling
setInterval(updateTrainStatus, POLLING_INTERVAL);
