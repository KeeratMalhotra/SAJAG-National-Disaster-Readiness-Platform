document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const accessToken = mapContainer.dataset.token;
    if (!accessToken) {
        console.error('Mapbox Access Token is missing!');
        return;
    }

    mapboxgl.accessToken = accessToken;

    const bounds = [
        [68, 8],
        [98, 37]
    ]; // Define the geographic bounds for India

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
    });

    map.fitBounds(bounds, {
        padding: 20
    });

    // Create a global popup instance for hover interactions
    const hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: '300px'
    });

    let allTrainingsData = null;

    map.on('load', () => {
        map.addSource('india-boundary', {
            'type': 'geojson',
            'data': '/data/india.geojson'
        });

        map.addLayer({
            'id': 'india-boundary-layer',
            'type': 'line',
            'source': 'india-boundary',
            'layout': {},
            'paint': {
                'line-color': '#003366',
                'line-width': 2.5,
                'line-opacity': 0.9
            }
        });

        fetch('/geojson')
            .then(res => res.json())
            .then(data => {
                allTrainingsData = data;
                if (!allTrainingsData.features) return;

                map.addSource('trainings', {
                    type: 'geojson',
                    data: allTrainingsData,
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 15,
                    clusterProperties: {
                        'total': ['+', 1]
                    }
                });

                map.addLayer({
                    id: 'clusters',
                    type: 'circle',
                    source: 'trainings',
                    filter: ['has', 'point_count'],
                    paint: {
                        'circle-color': '#FF9933',
                        'circle-radius': ['step', ['get', 'total'], 20, 100, 30, 750, 40],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff'
                    }
                });

                map.addLayer({
                    id: 'cluster-count',
                    type: 'symbol',
                    source: 'trainings',
                    filter: ['has', 'point_count'],
                    layout: {
                        'text-field': ['get', 'total'],
                        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                        'text-size': 14
                    },
                    paint: {
                        'text-color': '#ffffff'
                    }
                });

                map.addLayer({
                    id: 'unclustered-point',
                    type: 'circle',
                    source: 'trainings',
                    filter: ['!', ['has', 'point_count']],
                    paint: {
                        'circle-color': [
                            'match',
                            ['get', 'theme'],
                            'Earthquake', '#D97706',
                            'Flood', '#2563EB',
                            'Cyclone', '#4B5563',
                            'Landslide', '#6D28D9',
                            'Fire Safety', '#DC2626',
                            '#1F2937'
                        ],
                        'circle-radius': 8,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff'
                    }
                });

                // Helper to build HTML for popups
                const buildPopupHtml = (features) => {
                    const uniqueFeaturesMap = new Map();
                    features.forEach(feature => {
                        uniqueFeaturesMap.set(feature.properties.id, feature);
                    });
                    const uniqueFeatures = Array.from(uniqueFeaturesMap.values());

                    let popupContent = '';
                    uniqueFeatures.forEach((feature, index) => {
                        const properties = feature.properties;
                        if (index > 0) popupContent += '<hr class="my-2">';
                        popupContent += `
                            <h6>${properties.title}</h6>
                            <p class="mb-1">Theme: ${properties.theme}</p>
                            <span class="badge bg-primary">${properties.status}</span>
                            <br>
                        `;
                    });

                    if (uniqueFeatures.length > 1) {
                        return `
                            <h5 class="mb-2" style="font-size: 1.1rem;">${uniqueFeatures.length} Trainings</h5>
                            <div style="max-height: 220px; overflow-y: auto; padding-right: 10px;">
                                ${popupContent}
                            </div>
                        `;
                    }
                    return popupContent;
                };

                // --- CHANGED: Hover interaction for CLUSTERS ---
                map.on('mouseenter', 'clusters', (e) => {
                    map.getCanvas().style.cursor = 'pointer';
                    
                    const clusterId = e.features[0].properties.cluster_id;
                    const pointCount = e.features[0].properties.point_count;
                    const coordinates = e.features[0].geometry.coordinates.slice();

                    // Fetch all points in this cluster
                    map.getSource('trainings').getClusterLeaves(clusterId, pointCount, 0, (err, features) => {
                        if (err) return;

                        // Ensure we account for map wrapping
                        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                        }

                        const html = buildPopupHtml(features);
                        hoverPopup.setLngLat(coordinates).setHTML(html).addTo(map);
                    });
                });

                map.on('mouseleave', 'clusters', () => {
                    map.getCanvas().style.cursor = '';
                    hoverPopup.remove();
                });

                // Keep click on clusters to zoom in (optional but recommended UX)
                map.on('click', 'clusters', (e) => {
                    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                    const clusterId = features[0].properties.cluster_id;
                    map.getSource('trainings').getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
                    });
                });

                // --- CHANGED: Hover interaction for UNCLUSTERED POINTS ---
                map.on('mouseenter', 'unclustered-point', (e) => {
                    map.getCanvas().style.cursor = 'pointer';

                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const allFeatures = map.queryRenderedFeatures(e.point, {
                        layers: ['unclustered-point']
                    });

                    if (!allFeatures.length) return;

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    const html = buildPopupHtml(allFeatures);
                    hoverPopup.setLngLat(coordinates).setHTML(html).addTo(map);
                });

                map.on('mouseleave', 'unclustered-point', () => {
                    map.getCanvas().style.cursor = '';
                    hoverPopup.remove();
                });
            });
    });

    const filterGroup = document.getElementById('map-filter-group');
    if (filterGroup) {
        filterGroup.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') return;

            const filter = e.target.dataset.filter;

            if (filter === 'All') {
                map.getSource('trainings').setData(allTrainingsData);
            } else {
                const filteredData = {
                    ...allTrainingsData,
                    features: allTrainingsData.features.filter(f => f.properties.theme === filter)
                };
                map.getSource('trainings').setData(filteredData);
            }

            document.querySelectorAll('#map-filter-group button').forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-secondary');
            });

            e.target.classList.remove('btn-outline-secondary');
            e.target.classList.add('active', 'btn-primary');
        });
    }
});