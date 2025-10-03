// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize the map and set its view to the center of India
    const map = L.map('map').setView([20.5937, 78.9629], 5);

    // 2. Add the base map layer (tile layer) from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 3. Fetch the training data from our GeoJSON endpoint
    fetch('/trainings/geojson')
        .then(response => response.json())
        .then(data => {
            // 4. Add the GeoJSON data to the map
            L.geoJSON(data, {
                // This function is called for each feature (each training point)
                onEachFeature: (feature, layer) => {
                    if (feature.properties) {
                        // Create a popup with the training's title and theme
                        const popupContent = `
                            <strong>${feature.properties.title}</strong>
                            <br>
                            Theme: ${feature.properties.theme}
                        `;
                        layer.bindPopup(popupContent);
                    }
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error loading map data:', error));
});