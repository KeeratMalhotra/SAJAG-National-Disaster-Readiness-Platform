document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // **1. Fetch and display our training data as a heatmap**
    fetch('/trainings/geojson')
        .then(response => response.json())
        .then(data => {
            const heatPoints = data.features.map(feature => {
                // The heatmap plugin needs [lat, lon, intensity]
                return [feature.geometry.coordinates[1], feature.geometry.coordinates[0], 0.5];
            });
            if (heatPoints.length > 0) {
                L.heatLayer(heatPoints, { radius: 25 }).addTo(map);
            }
        })
        .catch(error => console.error('Error loading training data:', error));

    // **2. Fetch and display live disaster alerts as markers**
    fetch('/api/alerts')
        .then(response => response.json())
        .then(alerts => {
            alerts.forEach(alert => {
                const marker = L.marker([alert.lat, alert.lon]).addTo(map);
                marker.bindPopup(`
                    <strong>${alert.eventType}: ${alert.title}</strong>
                    <br><hr>
                    ${alert.description}
                    <br><a href="${alert.link}" target="_blank">More Info</a>
                `);
            });
        })
        .catch(error => console.error('Error loading alert data:', error));
});