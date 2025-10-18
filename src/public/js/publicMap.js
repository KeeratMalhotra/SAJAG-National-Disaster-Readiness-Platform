document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const accessToken = mapContainer.dataset.token;
    if (!accessToken) {
        console.error('Mapbox Access Token is missing!');
        return;
    }

    mapboxgl.accessToken = accessToken;

    const bounds = [[68, 8], [98, 37]]; // Define the geographic bounds for India

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        // We no longer set center or zoom here
    });

    // THIS IS THE MAGIC: Fit the map to the bounds perfectly on load
    map.fitBounds(bounds, {
        padding: 20 // Adds a 20px buffer around the edges so it doesn't feel cramped
    });

    let allTrainingsData = null; // Variable to store all fetched data

    map.on('load', () => {
        map.addSource('india-boundary', {
        'type': 'geojson',
        // A publicly available GeoJSON for India's boundary
        'data': '/data/india.geojson'
    });

    // 2. Add the layer to draw the outline
    map.addLayer({
        'id': 'india-boundary-layer',
        'type': 'line',
        'source': 'india-boundary', // Link to the source above
        'layout': {},
        'paint': {
            'line-color': '#003366', // A dark blue that matches your theme
            'line-width': 2.5,        // Make it clearly visible
            'line-opacity': 0.9
        }
    });
        fetch('/geojson')
            .then(res => res.json())
            .then(data => {
                allTrainingsData = data; // Store the original data
                if (!allTrainingsData.features) return;

                // Create a data source with clustering enabled
                map.addSource('trainings', {
                    type: 'geojson',
                    data: allTrainingsData,
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 15
                });

                // Layer for the clusters (circles with numbers)
                map.addLayer({
                    id: 'clusters',
                    type: 'circle',
                    source: 'trainings',
                    filter: ['has', 'point_count'],
                    paint: {
                        'circle-color': '#FF9933', // Saffron
                        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff'
                    }
                });

                // Layer for the cluster count text
                map.addLayer({
                    id: 'cluster-count',
                    type: 'symbol',
                    source: 'trainings',
                    filter: ['has', 'point_count'],
                    layout: {
                        'text-field': '{point_count_abbreviated}',
                        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                        'text-size': 14
                    },
                    paint: {
                        'text-color': '#ffffff'
                    }
                });

                // Layer for the individual, unclustered points (custom icons)
                map.addLayer({
                    id: 'unclustered-point',
                    type: 'circle', // We use circle and paint it later, easier than custom markers
                    source: 'trainings',
                    filter: ['!', ['has', 'point_count']],
                    paint: {
                       'circle-color': [
                           'match',
                           ['get', 'theme'],
                           'Earthquake', '#D97706',
                           'Flood', '#2563EB',
                           'Cyclone', '#4B5563',
                           '#6D28D9' // Default color
                       ],
                       'circle-radius': 8,
                       'circle-stroke-width': 2,
                       'circle-stroke-color': '#fff'
                    }
                });
                
                // Click event for clusters (to zoom in)
                map.on('click', 'clusters', (e) => {
                    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                    const clusterId = features[0].properties.cluster_id;
                    map.getSource('trainings').getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
                    });
                });
                 // Click event for individual points (to show popup)
                map.on('click', 'unclustered-point', (e) => {
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const properties = e.features[0].properties;

                     const popupContent = `
                        <h6>${properties.title}</h6>
                        <p class="mb-1">Theme: ${properties.theme}</p>
                        <span class="badge bg-primary">${properties.status}</span>
                        <hr class="my-2">
                        <a href="/trainings/${properties.id}" class="btn btn-sm btn-outline-primary">View Details</a>
                    `;

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(popupContent)
                        .addTo(map);
                });
                // Change cursor to pointer on hover
                map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
                map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
                map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
                map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
            });
    });

// --- INTERACTIVE FILTER LOGIC ---
    const filterGroup = document.getElementById('map-filter-group');
    if(filterGroup){
        filterGroup.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') return;
            
            const filter = e.target.dataset.filter;

            // This part is the same - it correctly filters the data
            if (filter === 'All') {
                map.getSource('trainings').setData(allTrainingsData);
            } else {
                const filteredData = {
                    ...allTrainingsData,
                    features: allTrainingsData.features.filter(f => f.properties.theme === filter)
                };
                map.getSource('trainings').setData(filteredData);
            }
            
            // --- THIS IS THE NEW, CORRECTED UI LOGIC ---
            // First, reset all buttons to the default outline style
            document.querySelectorAll('#map-filter-group button').forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-secondary');
            });

            // Then, apply the primary style to the clicked button
            e.target.classList.remove('btn-outline-secondary');
            e.target.classList.add('active', 'btn-primary');
        });
    }
});