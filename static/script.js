let lastStationsRemaining = null;

function updateTrainStatus() {
    fetch('/train-status')
        .then(response => response.json())
        .then(data => {
            document.getElementById('currentStation').textContent = data.current_station || 'N/A';
            document.getElementById('stationsRemaining').textContent = data.stations_remaining || '0';
            document.getElementById('trainStatus').textContent = data.status || 'Status unavailable';
            document.getElementById('lastUpdate').textContent = data.last_update || '';

            // Update train info
            const trainInfo = data.train_info || {};
            document.getElementById('trainName').textContent = trainInfo.train_name || 'N/A';
            document.getElementById('source').textContent = trainInfo.source || 'N/A';
            document.getElementById('destination').textContent = trainInfo.destination || 'N/A';
            document.getElementById('delay').textContent = trainInfo.delay || 'On time';
            document.getElementById('eta').textContent = trainInfo.eta || 'N/A';
            document.getElementById('platform').textContent = trainInfo.platform || 'TBD';
            document.getElementById('nextStation').textContent = trainInfo.next_station || 'N/A';
            document.getElementById('distanceCovered').textContent = trainInfo.distance_covered || '0 km';
            document.getElementById('totalDistance').textContent = trainInfo.total_distance || '0 km';
            document.getElementById('speed').textContent = trainInfo.speed || '0 km/h';

            // Store upcoming stations data
            window.upcomingStations = data.upcoming_stations || [];

            // If service is inactive, update less frequently
            if (!data.is_active) {
                clearInterval(updateInterval);
                setTimeout(updateTrainStatus, 10 * 60 * 1000); // Check every 10 minutes when inactive
                return;
            }

            // Check if stations_remaining has changed and is a valid number
            if (lastStationsRemaining !== null && 
                lastStationsRemaining !== data.stations_remaining &&
                !isNaN(data.stations_remaining)) {
                showMotivationalMessage(data.stations_remaining);
            }
            lastStationsRemaining = data.stations_remaining;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('trainStatus').textContent = 'Error connecting to server';
        });
}

function showMotivationalMessage(stationsLeft) {
    const messages = [
        "SLAM DUNK! ",
        "YOU'RE ON FIRE! ",
        "NOTHING BUT NET! ",
        "KEEP PUSHING! ",
        "YOU'RE A CHAMPION! ",
        "FULL COURT PRESS! ",
        "THREE-POINTER! 3",
        "FAST BREAK! ",
        "ALLEY-OOP! "
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const notification = document.createElement('div');
    notification.className = 'motivation-popup';
    notification.innerHTML = `
        <h3>${randomMessage}</h3>
        <p>${stationsLeft} stations to go, champ!</p>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles dynamically
    const styles = document.createElement('style');
    styles.textContent = `
        .motivation-popup {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--basketball-orange);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            text-align: center;
            animation: slideDown 0.5s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        @keyframes slideDown {
            from { transform: translate(-50%, -100%); }
            to { transform: translate(-50%, 0); }
        }
        
        @keyframes fadeOut {
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(styles);
    
    // Remove notification after animation
    setTimeout(() => {
        notification.remove();
        styles.remove();
    }, 3000);
}

function showStationsList() {
    const stationsList = document.querySelector('.stations-list');
    stationsList.innerHTML = ''; // Clear existing content

    if (!window.upcomingStations || window.upcomingStations.length === 0) {
        stationsList.innerHTML = '<p class="no-stations">No upcoming stations information available</p>';
        modal.style.display = 'block';
        return;
    }

    // Create table for stations
    const table = document.createElement('table');
    table.className = 'stations-table';
    
    // Add table header
    const header = table.createTHead();
    const headerRow = header.insertRow();
    const headers = ['Station', 'ETA', 'Platform', 'Distance', 'Halt'];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    // Add stations data
    const tbody = table.createTBody();
    window.upcomingStations.forEach(station => {
        const row = tbody.insertRow();
        row.insertCell().textContent = station.name;
        row.insertCell().textContent = station.eta;
        row.insertCell().textContent = `Platform ${station.platform}`;
        row.insertCell().textContent = `${station.distance} km`;
        row.insertCell().textContent = `${station.halt} min`;
    });

    stationsList.appendChild(table);
    modal.style.display = 'block';
}

// Global variables for modal handling
const modal = document.getElementById('stationsModal');
const closeBtn = document.querySelector('.close');

// Close modal when clicking the close button
closeBtn.onclick = function() {
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Update status every 20 seconds
const updateInterval = setInterval(updateTrainStatus, 20000);

// Initial update
updateTrainStatus();
