document.addEventListener('DOMContentLoaded', () => {
    const mapElement = document.getElementById('map');
    const mapboxToken = mapElement.dataset.token;
    
    if (!mapboxToken || mapboxToken.length < 10) { // Basic check for token
        mapElement.innerHTML = '<div class="alert alert-danger">Mapbox Access Token is missing or invalid. Please configure it in your .env file.</div>';
        return;
    }

    // Define the geographic bounds for India
    const bounds = [
        [68.1, 6.0], // Southwest coordinates (slightly adjusted)
        [97.4, 37.1]  // Northeast coordinates
    ];

    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11', // A clean, light style
        center: [78.9629, 22.5937], 
        zoom: 4.2,
        maxBounds: bounds // Set the maximum bounds to keep the map focused on India
    });

    map.on('load', () => {
        // Fetch GeoJSON for India's border
        fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
        .then(response => response.json())
        .then(indiaData => {
            map.addSource('india-boundary', {
                'type': 'geojson',
                'data': indiaData
            });

            // Add the bold Saffron outline layer for the "pop out" effect
            map.addLayer({
                'id': 'india-outline',
                'type': 'line',
                'source': 'india-boundary',
                'layout': {},
                'paint': {
                    'line-color': '#FF9933', // Saffron
                    'line-width': 2.5
                }
            });
        });

        // Fetch our training data and add it as a heatmap
        fetch('/trainings/geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('trainings', {
                    'type': 'geojson',
                    'data': data
                });

                map.addLayer({
                    'id': 'trainings-heat',
                    'type': 'heatmap',
                    'source': 'trainings',
                    'paint': {
                        'heatmap-weight': 1,
                        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
                        'heatmap-color': [
                            'interpolate', ['linear'], ['heatmap-density'],
                            0, 'rgba(255, 153, 51, 0)',
                            0.2, 'rgba(255, 153, 51, 0.2)',
                            0.5, 'rgba(255, 153, 51, 0.5)',
                            0.8, 'rgba(255, 153, 51, 0.7)',
                            1, 'rgba(208, 114, 0, 0.9)'
                        ],
                        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
                        'heatmap-opacity': 0.8
                    }
                });

                map.addLayer({
                    'id': 'trainings-point',
                    'type': 'circle',
                    'source': 'trainings',
                    'paint': {
                        'circle-radius': 5,
                        'circle-color': '#003366', // Navy Blue points
                        'circle-stroke-color': 'white',
                        'circle-stroke-width': 1
                    }
                });
                 
                const popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false
                });

                map.on('mouseenter', 'trainings-point', (e) => {
                    map.getCanvas().style.cursor = 'pointer';
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const properties = e.features[0].properties;
                    const popupContent = `<strong>${properties.title}</strong><br>Theme: ${properties.theme}`;
                    popup.setLngLat(coordinates).setHTML(popupContent).addTo(map);
                });

                map.on('mouseleave', 'trainings-point', () => {
                    map.getCanvas().style.cursor = '';
                    popup.remove();
                });
            });
    });
});

