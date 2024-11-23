// Polling interval in milliseconds (15 minutes)
const POLLING_INTERVAL = 60000*15;

// Message index trackers
let lastKRPMessageIndex = -1;
let usedKRPMessageIndices = [];
let lastBasketballMessageIndex = -1;
let usedBasketballMessageIndices = [];
let lastLoadingMessageIndex = -1;
let usedLoadingMessageIndices = [];

// Loading messages for KRP
const LOADING_MESSAGES = [
    "Sending virtual hugs to KRP while loading... 🤗",
    "Chasing trains with thoughts of KRP... 🚂💭",
    "Collecting stars for KRP's journey... ⭐️✨",
    "Spreading love on the tracks for KRP... 💝🛤️",
    "Painting the sky with KRP's favorite colors... 🎨🌈",
    "Counting heartbeats until data arrives... 💗💓",
    "Wrapping this update with care for KRP... 🎁💝",
    "Sprinkling magic on the train tracks... ✨🚂",
    "Loading love letters to KRP... 💌💕",
    "Gathering sunshine for KRP's journey... ☀️💫",
    "Dancing with clouds while fetching data... 🌥️💃",
    "Sending sweet thoughts to KRP... 🍯💭",
    "Weaving dreams along the railway... 🌙✨",
    "Catching butterflies for KRP... 🦋💝",
    "Blowing kisses through the stations... 😘💨",
    "Creating rainbows for KRP's path... 🌈✨",
    "Collecting moonbeams for the journey... 🌕💫",
    "Spreading flower petals on the tracks... 🌸🛤️",
    "Sending gentle breezes to KRP... 🍃💕",
    "Crafting a path of hearts... 💖💖💖",
    "Whispering sweet nothings to the train... 🚂💭",
    "Brewing a potion of pure joy... ✨🧪",
    "Planting love seeds along the way... 🌱💗",
    "Knitting a blanket of warm thoughts... 🧶💝",
    "Collecting dewdrops of happiness... 💧✨",
    "Painting the clouds with thoughts of you... ☁️🎨",
    "Sending paper planes of love... ✈️💌",
    "Creating a symphony of heart beats... 💓🎵",
    "Wrapping this moment in stardust... ⭐️✨",
    "Brewing a cup of sweet memories... ☕️💭",
    "Dancing with fireflies for KRP... 🌟💃",
    "Weaving a tapestry of tender moments... 🕊️💝",
    "Collecting seashells of happiness... 🐚💫",
    "Blowing bubbles of joy... 🫧💕",
    "Creating a constellation of love... 🌟✨",
    "Sending waves of affection... 🌊💗",
    "Planting kisses in the garden of love... 💋🌸",
    "Crafting a rainbow bridge to you... 🌈💫",
    "Painting hearts on passing clouds... ☁️💖",
    "Sending butterflies of happiness... 🦋💝",
    "Weaving moonbeams into your journey... 🌙✨",
    "Creating a pathway of starlight... ⭐️🌟",
    "Sending gentle whispers through the wind... 🍃💭",
    "Crafting a bouquet of sweet moments... 💐💝",
    "Dancing with shadows of love... 👥💃",
    "Painting dreams in pastel colors... 🎨💫",
    "Sending love notes through time... 📝💌",
    "Creating a melody of heartbeats... 💓🎵",
    "Weaving sunshine into your day... ☀️💕",
    "Crafting a crown of digital flowers... 👑🌸"
];

// Sweet messages for KRP
const KRP_MESSAGES = [
    "Hey KRP! Hope your journey is as amazing as you are! ",
    "Counting down the minutes until you reach Bhopal, KRP! ",
    "Every station brings you closer to your destination, just like you're close to my heart! ",
    "KRP, you make every journey special! ",
    "Safe travels, KRP! You're always in my thoughts! ",
    "Distance means so little when someone means so much! Thinking of you, KRP! ",
    "Like this train, my thoughts are always running towards you, KRP! ",
    "KRP, you're the destination that makes every journey worthwhile! ",
    "Hope you're enjoying the view, KRP! Though not as beautiful as your smile! ",
    "Missing you already, KRP! Have a wonderful journey! ",
    "Every mile of track leads to you, KRP! ",
    "Your journey is my journey, KRP! We're connected by heart! ",
    "Sending you warm thoughts on your train ride, KRP! ",
    "May your journey be as wonderful as you are, KRP! ",
    "Can't wait to hear about your adventure, KRP! ",
    "Thinking of you at every station, KRP! ",
    "Your happiness is my destination, KRP! ",
    "Like this train, my heart runs on KRP time! ",
    "You make every journey magical, KRP! ",
    "The best part of any journey is knowing it leads to you, KRP! "
];

// Basketball motivational messages
const BASKETBALL_MESSAGES = [
    "I've failed over and over in my life. And that is why I succeed. - Michael Jordan",
    "Everything negative – pressure, challenges – is all an opportunity to rise. - Kobe Bryant",
    "If you're afraid to fail, then you're probably going to fail. - Kobe Bryant",
    "I don't know what's better: getting to the top or the journey. I'm going to say the journey. - Stephen Curry",
    "Hard work beats talent when talent fails to work hard. - Kevin Durant",
    "The most important thing is to try and inspire people so that they can be great in whatever they want to do. - Kobe Bryant",
    "Success is not an accident, success is a choice. - Stephen Curry",
    "Excellence is not a singular act but a habit. You are what you do repeatedly. - Shaquille O'Neal",
    "I've never been afraid of big moments. I get butterflies... but I think those are a good thing. - Michael Jordan",
    "The strength of the team is each individual member. The strength of each member is the team. - Phil Jackson",
    "You can't be afraid to fail. It's the only way you succeed. You're not gonna succeed all the time and I know that. - LeBron James",
    "When you're not practicing, someone else is getting better. - Allen Iverson",
    "Push yourself again and again. Don't give an inch until the final buzzer sounds. - Larry Bird",
    "If you do the work, you get rewarded. There are no shortcuts in life. - Michael Jordan",
    "I'm going to make mistakes. I just have to learn from them and move forward. - Derrick Rose",
    "The only way to prove that you're a good sport is to lose. - Ernie Banks",
    "What do you do with a mistake: recognize it, admit it, learn from it, forget it. - Dean Smith",
    "It's not whether you get knocked down; it's whether you get back up. - Vince Lombardi",
    "You have to expect things of yourself before you can do them. - Michael Jordan",
    "Never let the fear of striking out keep you from playing the game. - Babe Ruth"
];

// Function to get a random loading message ensuring all messages are used
function getLoadingMessage() {
    // If we've used all messages, reset the tracking array
    if (usedLoadingMessageIndices.length === LOADING_MESSAGES.length) {
        usedLoadingMessageIndices = [];
    }

    // Get available indices (ones we haven't used yet)
    const availableIndices = LOADING_MESSAGES.map((_, index) => index)
        .filter(index => !usedLoadingMessageIndices.includes(index));

    // Get a random index from available ones
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const selectedIndex = availableIndices[randomIndex];

    // Track this index as used
    usedLoadingMessageIndices.push(selectedIndex);
    lastLoadingMessageIndex = selectedIndex;

    // Return the selected message
    return LOADING_MESSAGES[selectedIndex];
}

// Function to get a random KRP message ensuring all messages are used
function getKRPMessage() {
    // If we've used all messages, reset the tracking array
    if (usedKRPMessageIndices.length === KRP_MESSAGES.length) {
        usedKRPMessageIndices = [];
    }

    // Get available indices (ones we haven't used yet)
    const availableIndices = KRP_MESSAGES.map((_, index) => index)
        .filter(index => !usedKRPMessageIndices.includes(index));

    // Get a random index from available ones
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const selectedIndex = availableIndices[randomIndex];

    // Track this index as used
    usedKRPMessageIndices.push(selectedIndex);
    lastKRPMessageIndex = selectedIndex;

    // Return the selected message
    return KRP_MESSAGES[selectedIndex];
}

// Function to get a random basketball message ensuring all messages are used
function getRandomMessage() {
    // If we've used all messages, reset the tracking array
    if (usedBasketballMessageIndices.length === BASKETBALL_MESSAGES.length) {
        usedBasketballMessageIndices = [];
    }

    // Get available indices (ones we haven't used yet)
    const availableIndices = BASKETBALL_MESSAGES.map((_, index) => index)
        .filter(index => !usedBasketballMessageIndices.includes(index));

    // Get a random index from available ones
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const selectedIndex = availableIndices[randomIndex];

    // Track this index as used
    usedBasketballMessageIndices.push(selectedIndex);
    lastBasketballMessageIndex = selectedIndex;

    // Return the selected message
    return BASKETBALL_MESSAGES[selectedIndex];
}

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
async function updateTrainStatus() {
    try {
        // Show loading message
        const pageElements = {
            statusContainer: document.getElementById('status-container'),
            messageContainer: document.getElementById('message-container'),
            krpMessageContainer: document.getElementById('krp-message-container'),
            stationsList: document.getElementById('upcoming-stations'),
            trainInfo: document.getElementById('train-info'),
            loadingContainer: document.getElementById('loading-container')
        };

        // Show loading message
        if (pageElements.loadingContainer) {
            pageElements.loadingContainer.innerHTML = `
                <div class="loading-message">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${getLoadingMessage()}</div>
                </div>
            `;
            pageElements.loadingContainer.style.display = 'block';
        }

        const response = await fetch('/get_update', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        // Hide loading message
        if (pageElements.loadingContainer) {
            pageElements.loadingContainer.style.display = 'none';
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.is_active) {
            throw new Error('Train tracking is not active');
        }

        if (!data.upcoming_stations || data.upcoming_stations.length === 0) {
            if (pageElements.statusContainer) {
                pageElements.statusContainer.innerHTML = `
                    <div class="error">
                        <p>No upcoming stations data available.</p>
                    </div>
                `;
            }
            return;
        }

        // Verify all elements are found
        Object.entries(pageElements).forEach(([key, element]) => {
            if (!element) {
                console.error(`Element not found: ${key}`);
            }
        });

        // Fade out current content
        Object.values(pageElements).forEach(el => {
            if (el) {
                el.classList.add('fade-transition');
                el.style.opacity = '0';
            }
        });

        setTimeout(() => {
            // Clear previous content
            Object.values(pageElements).forEach(el => {
                if (el) el.innerHTML = '';
            });

            // KRP's special message
            if (pageElements.krpMessageContainer) {
                const krpMessageHTML = `
                    <div class="krp-special-message">
                        <div class="krp-message-text">${getKRPMessage()}</div>
                    </div>
                `;
                pageElements.krpMessageContainer.innerHTML = krpMessageHTML;
            }

            // Special message or countdown
            if (pageElements.messageContainer) {
                const messageHTML = `
                    <div class="special-message">
                        ${!data.is_active ? 
                            `<div class="countdown">${data.status}</div>` : 
                            ''
                        }
                        <span class="message-text">${getRandomMessage()}</span>
                    </div>
                `;
                pageElements.messageContainer.innerHTML = messageHTML;
            }

            // Current Status
            if (pageElements.statusContainer) {
                const statusHTML = `
                    <div class="status-box">
                        <h2>Train Status</h2>
                        <p class="current-station">
                            <span class="icon">📍</span>
                            Current Station: ${data.current_station}
                        </p>
                        <p class="status">
                            <span class="icon">ℹ️</span>
                            ${data.status_as_of}
                        </p>
                        <p class="last-update">
                            <span class="icon">⏱️</span>
                            Updated: ${data.last_update}
                        </p>
                    </div>
                `;
                pageElements.statusContainer.innerHTML = statusHTML;
            }

            // Train Info
            if (pageElements.trainInfo) {
                const trainInfoHTML = `
                    <div class="status-box">
                        <h2>Journey Details</h2>
                        <p><span class="icon">🚂</span>${data.train_info.train_name}</p>
                        <p><span class="icon">🏁</span>From: ${data.train_info.source}</p>
                        <p><span class="icon">🎯</span>To: ${data.train_info.destination}</p>
                    </div>
                `;
                pageElements.trainInfo.innerHTML = trainInfoHTML;
            }

            console.log('Upcoming stations:', data.upcoming_stations);
            // Upcoming Stations
            if (data.upcoming_stations && data.upcoming_stations.length > 0 && pageElements.stationsList) {
                console.log('Creating station cards...');
                const stationsHTML = `
                    <div class="status-box">
                        <h2>Next Stops</h2>
                        <div class="stations-list">
                            ${data.upcoming_stations.map((station, index) => {
                                return createStationCard(station, index);
                            }).join('')}
                        </div>
                    </div>
                `;
                pageElements.stationsList.innerHTML = stationsHTML;
            } else {
                console.log('No upcoming stations data available');
            }

            // Gentle fade in
            Object.values(pageElements).forEach(el => {
                if (el) el.style.opacity = '1';
            });
        }, 400);
    } catch (error) {
        console.error('Error fetching train status:', error);
        // Hide loading message on error too
        const loadingContainer = document.getElementById('loading-container');
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        
        const statusContainer = document.getElementById('status-container');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="error">
                    <p>Unable to update train status. Please try again.</p>
                    <p class="error-details">${error.message}</p>
                </div>
            `;
        }
    }
}

// Initial update
console.log('Starting train status updates...');
updateTrainStatus();

// Set up polling
setInterval(updateTrainStatus, POLLING_INTERVAL);
