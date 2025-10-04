document.addEventListener('DOMContentLoaded', () => {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;

    // A simple lookup for state coordinates to center the map
    const stateCoordinates = {
        'Maharashtra': [19.7515, 75.7139],
        'Delhi': [28.7041, 77.1025],
        // Add other states as needed for testing
        'default': [20.5937, 78.9629] // Center of India
    };

    // We need to get the state name from the page. We'll add it as a data attribute.
    const state = mapDiv.dataset.state;
    const centerCoords = stateCoordinates[state] || stateCoordinates['default'];

    const map = L.map('map').setView(centerCoords, 7); // Zoom level 7 is good for a state

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Fetch only the trainings for this state
    fetch('/trainings/geojson/state')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                onEachFeature: (feature, layer) => {
                    if (feature.properties) {
                        const popupContent = `<strong>${feature.properties.title}</strong><br>Theme: ${feature.properties.theme}`;
                        layer.bindPopup(popupContent);
                    }
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error loading map data:', error));
});