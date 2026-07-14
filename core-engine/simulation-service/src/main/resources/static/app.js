// Constants for Leaflet coordinate projection
const centerLat = 40.752885;
const centerLng = -73.981804;
const ANGLE = 29 * Math.PI / 180; // 29 degrees Manhattan grid rotation
const SCALE_M = 0.35; // meters per pixel
const METERS_PER_LAT = 111139;
const METERS_PER_LNG = 84000;

// Coordinate transformation: Simulator (0-600) to lat/lng
function simulatorToLatLng(x, y) {
    const dx = x - 300;
    const dy = 300 - y; // invert Y since simulator Y increases Southward
    
    // Scale to meters
    const dx_m = dx * SCALE_M;
    const dy_m = dy * SCALE_M;
    
    // Rotate by Manhattan grid angle (29 degrees clockwise)
    const rx = dx_m * Math.cos(ANGLE) + dy_m * Math.sin(ANGLE);
    const ry = -dx_m * Math.sin(ANGLE) + dy_m * Math.cos(ANGLE);
    
    // Convert to Lat/Lng offsets
    const lat = centerLat + (ry / METERS_PER_LAT);
    const lng = centerLng + (rx / METERS_PER_LNG);
    return [lat, lng];
}

// Initialize Leaflet Map centered at 5th Ave & 42nd St
const map = L.map('map', {
    center: [centerLat, centerLng],
    zoom: 18,
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: false,
    boxZoom: false
});

// Add beautiful Dark Mode CartoDB tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20
}).addTo(map);

// Add custom zoom control at a nicer place
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Draw Centerlines as glowing dashed polylines
const nsPath = L.polyline([
    simulatorToLatLng(300, 0),
    simulatorToLatLng(300, 600)
], {
    color: '#3b82f6',
    weight: 3,
    opacity: 0.3,
    dashArray: '10, 15'
}).addTo(map);

const ewPath = L.polyline([
    simulatorToLatLng(0, 300),
    simulatorToLatLng(600, 300)
], {
    color: '#f59e0b',
    weight: 3,
    opacity: 0.3,
    dashArray: '10, 15'
}).addTo(map);

// Draw White Stoplines
const stoplines = [
    L.polyline([simulatorToLatLng(260, 240), simulatorToLatLng(300, 240)], { color: '#ffffff', weight: 4, opacity: 0.8 }), // SB Stopline
    L.polyline([simulatorToLatLng(300, 360), simulatorToLatLng(340, 360)], { color: '#ffffff', weight: 4, opacity: 0.8 }), // NB Stopline
    L.polyline([simulatorToLatLng(240, 300), simulatorToLatLng(240, 340)], { color: '#ffffff', weight: 4, opacity: 0.8 }), // EB Stopline
    L.polyline([simulatorToLatLng(360, 260), simulatorToLatLng(360, 300)], { color: '#ffffff', weight: 4, opacity: 0.8 })  // WB Stopline
];
stoplines.forEach(line => line.addTo(map));

// Initialize Traffic Lights
const trafficLights = {
    NS1: null, // SB stopline light (North side of crossing)
    NS2: null, // NB stopline light (South side)
    EW1: null, // EB stopline light (West side)
    EW2: null  // WB stopline light (East side)
};

const stoplinePositions = {
    NS1: simulatorToLatLng(250, 230),
    NS2: simulatorToLatLng(350, 370),
    EW1: simulatorToLatLng(230, 350),
    EW2: simulatorToLatLng(370, 250)
};

for (const [key, latlng] of Object.entries(stoplinePositions)) {
    const icon = L.divIcon({
        className: 'traffic-light-marker',
        html: `<div class="light-bulb red" id="light-${key}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
    trafficLights[key] = L.marker(latlng, { icon }).addTo(map);
}

// Vehicle tracking state
const vehicleMarkers = new Map();

// DOM elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const valAvgDelay = document.getElementById('avgDelay');
const valThroughput = document.getElementById('throughput');
const valNsQueue = document.getElementById('nsQueue');
const valEwQueue = document.getElementById('ewQueue');

const btnPlayPause = document.getElementById('btnPlayPause');
const btnReset = document.getElementById('btnReset');
const algorithmSelect = document.getElementById('algorithmSelect');
const arrivalRateSlider = document.getElementById('arrivalRateSlider');
const arrivalRateVal = document.getElementById('arrivalRateVal');

// Local Simulation State Cache
let isRunning = false;
let eventSource = null;

// Initialize Event Stream
function connectEventStream() {
    if (eventSource) {
        eventSource.close();
    }

    eventSource = new EventSource('/api/simulation/stream');

    eventSource.addEventListener('simulation-state', (event) => {
        const state = JSON.parse(event.data);
        updateUI(state);
        updateMapElements(state);
    });

    eventSource.onopen = () => {
        statusDot.style.backgroundColor = '#10b981';
        statusDot.style.boxShadow = '0 0 8px #10b981';
        statusText.textContent = isRunning ? 'Simulation Running' : 'Simulation Paused';
    };

    eventSource.onerror = (err) => {
        statusDot.style.backgroundColor = '#ef4444';
        statusDot.style.boxShadow = '0 0 8px #ef4444';
        statusText.textContent = 'Connection Offline';
        console.error('SSE connection error:', err);
    };
}

// Update DOM Metrics and Configurations
function updateUI(state) {
    isRunning = state.running;
    statusText.textContent = isRunning ? 'Simulation Running' : 'Simulation Paused';
    btnPlayPause.textContent = isRunning ? 'Pause' : 'Resume';
    btnPlayPause.className = isRunning ? 'btn-secondary' : 'btn-primary';

    valAvgDelay.textContent = state.averageDelay.toFixed(2);
    valThroughput.textContent = state.totalVehiclesPassed;
    valNsQueue.textContent = state.queueNS;
    valEwQueue.textContent = state.queueEW;

    // Keep inputs synced
    algorithmSelect.value = state.signalMode;
    arrivalRateSlider.value = state.arrivalRate;
    arrivalRateVal.textContent = `${state.arrivalRate} / min`;
    
    // Update Traffic Lights DOM colors
    updateTrafficLightColors(state.nsLightColor, state.ewLightColor);
}

function updateTrafficLightColors(nsColor, ewColor) {
    const nsClass = nsColor.toLowerCase(); // 'green', 'yellow', 'red'
    const ewClass = ewColor.toLowerCase();
    
    const ns1 = document.getElementById('light-NS1');
    const ns2 = document.getElementById('light-NS2');
    const ew1 = document.getElementById('light-EW1');
    const ew2 = document.getElementById('light-EW2');
    
    if (ns1) ns1.className = `light-bulb ${nsClass}`;
    if (ns2) ns2.className = `light-bulb ${nsClass}`;
    if (ew1) ew1.className = `light-bulb ${ewClass}`;
    if (ew2) ew2.className = `light-bulb ${ewClass}`;
}

// Leaflet Map Rendering and Updates
function updateMapElements(state) {
    const activeVehicles = state.vehicles || [];
    const activeIds = new Set();

    activeVehicles.forEach(v => {
        activeIds.add(v.id);
        const latlng = simulatorToLatLng(v.x, v.y);
        const heading = v.angle + 29; // rotate matching Manhattan's grid offset

        if (vehicleMarkers.has(v.id)) {
            // Update existing marker position & rotation angle
            const marker = vehicleMarkers.get(v.id);
            marker.setLatLng(latlng);
            
            const element = marker.getElement();
            if (element) {
                const body = element.querySelector('.vehicle-body');
                if (body) {
                    body.style.transform = `rotate(${heading}deg)`;
                }
            }
        } else {
            // Create a brand new vehicle marker
            const isNS = (v.direction === 'NORTHBOUND' || v.direction === 'SOUTHBOUND');
            const colorClass = isNS ? 'veh-ns' : 'veh-ew';
            
            const icon = L.divIcon({
                className: `vehicle-marker ${colorClass}`,
                html: `<div class="vehicle-body" style="transform: rotate(${heading}deg);"></div>`,
                iconSize: [12, 24],
                iconAnchor: [6, 12]
            });

            const marker = L.marker(latlng, { icon }).addTo(map);
            vehicleMarkers.set(v.id, marker);
        }
    });

    // Remove vehicles that are no longer in the system
    for (const [id, marker] of vehicleMarkers.entries()) {
        if (!activeIds.has(id)) {
            marker.remove();
            vehicleMarkers.delete(id);
        }
    }
}

// REST Control Triggers
async function togglePlayPause() {
    const endpoint = isRunning ? '/api/simulation/stop' : '/api/simulation/start';
    const res = await fetch(endpoint, { method: 'POST' });
    if (res.ok) {
        isRunning = !isRunning;
        btnPlayPause.textContent = isRunning ? 'Pause' : 'Resume';
        btnPlayPause.className = isRunning ? 'btn-secondary' : 'btn-primary';
    }
}

async function triggerReset() {
    const res = await fetch('/api/simulation/reset', { method: 'POST' });
    if (res.ok) {
        console.log('Simulation reset completed.');
        // Clear all vehicle markers on the map
        for (const marker of vehicleMarkers.values()) {
            marker.remove();
        }
        vehicleMarkers.clear();
    }
}

async function updateConfigurations() {
    const mode = algorithmSelect.value;
    const rate = parseFloat(arrivalRateSlider.value);
    arrivalRateVal.textContent = `${rate} / min`;

    const url = `/api/simulation/config?mode=${mode}&rate=${rate}`;
    await fetch(url, { method: 'POST' });
}

// Event Bindings
btnPlayPause.addEventListener('click', togglePlayPause);
btnReset.addEventListener('click', triggerReset);
algorithmSelect.addEventListener('change', updateConfigurations);
arrivalRateSlider.addEventListener('input', updateConfigurations);

// Initial bootstrap load
connectEventStream();
updateConfigurations(); // Push default config values to backend server
