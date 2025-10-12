document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const accessToken = mapContainer.dataset.token;
    if (!accessToken) {
        console.error('Mapbox Access Token is missing!');
        return;
    }

    mapboxgl.accessToken = accessToken;

    const bounds = [ [68, 8], [98, 37] ];

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [78.9629, 20.5937],
        zoom: 4,
        minZoom: 3.5,
        maxBounds: bounds
    });

    map.on('load', () => {
        // Fetch the training data
        fetch('/trainings/geojson')
            .then(res => res.json())
            .then(data => {
                if (!data.features) return;

                // Loop through each training (feature)
                data.features.forEach(feature => {
                    const el = document.createElement('div');
                    
                    // Check the status and apply the correct CSS class
                    if (feature.properties.status === 'Ongoing') {
                        el.className = 'blinking-marker';
                    } else {
                        el.className = 'default-marker';
                    }

                    // Create the popup content
                    const popupContent = `
                        <h6>${feature.properties.title}</h6>
                        <p class="mb-1">Theme: ${feature.properties.theme}</p>
                        <span class="badge bg-primary">${feature.properties.status}</span>
                        <hr class="my-2">
                        <a href="/trainings/${feature.properties.id}" class="btn btn-sm btn-outline-primary">View Details</a>
                    `;

                    // Create the marker and add it to the map
                    new mapboxgl.Marker(el)
                        .setLngLat(feature.geometry.coordinates)
                        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
                        .addTo(map);
                });
            });
    });
});
