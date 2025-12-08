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
    ];

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
    });

    map.fitBounds(bounds, {
        padding: 20
    });

    // --- HOVER POPUP CONFIGURATION ---
    const hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: '300px',
        // Reduced offset so the popup is closer to the mouse/point
        offset: 10 
    });

    // --- GRACE PERIOD LOGIC ---
    let popupLeaveTimer;

    const clearPopupTimer = () => {
        if (popupLeaveTimer) {
            clearTimeout(popupLeaveTimer);
            popupLeaveTimer = null;
        }
    };

    const schedulePopupClose = () => {
        // Increased time to 500ms to give user plenty of time to catch the popup
        popupLeaveTimer = setTimeout(() => {
            hoverPopup.remove();
        }, 500); 
    };

    const attachPopupHoverListeners = () => {
        const popupElement = hoverPopup.getElement();
        if (!popupElement) return;

        // If mouse enters the popup, stop it from closing
        popupElement.addEventListener('mouseenter', clearPopupTimer);
        // If mouse leaves the popup, schedule close
        popupElement.addEventListener('mouseleave', schedulePopupClose);
    };

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

        fetch('/trainings/geojson')
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

                // HTML Builder
                const buildPopupHtml = (features) => {
                    const uniqueFeaturesMap = new Map();
                    features.forEach(feature => {
                        const key = feature.properties.id || Math.random();
                        uniqueFeaturesMap.set(key, feature);
                    });
                    const uniqueFeatures = Array.from(uniqueFeaturesMap.values());

                    let listContent = '';
                    uniqueFeatures.forEach((feature, index) => {
                        const props = feature.properties;
                        if (index > 0) listContent += '<hr class="my-2" style="opacity:0.3">';
                        listContent += `
                            <div class="mb-2">
                                <h6 class="mb-1" style="font-size:0.95rem; font-weight:600;">${props.title || 'Untitled'}</h6>
                                <p class="mb-1" style="font-size:0.85rem; color:#555;">Theme: ${props.theme}</p>
                                <span class="badge bg-primary" style="font-size:0.7rem;">${props.status}</span>
                                <div class="mt-2">
                                    <a href="/trainings/${props.id}" class="btn btn-sm btn-outline-primary py-0" style="font-size: 0.8rem;">View Details</a>
                                </div>
                            </div>
                        `;
                    });

                    const containerStyle = uniqueFeatures.length > 1 ?
                        'max-height: 220px; overflow-y: auto; padding-right: 5px;' : '';

                    return `
                        <div style="font-family: 'Inter', sans-serif;">
                            ${uniqueFeatures.length > 1 ? `<h5 class="mb-2 pb-1 border-bottom" style="font-size: 1rem;">${uniqueFeatures.length} Trainings</h5>` : ''}
                            <div style="${containerStyle}">
                                ${listContent}
                            </div>
                        </div>
                    `;
                };

                // --- CLUSTER HOVER ---
                map.on('mouseenter', 'clusters', (e) => {
                    map.getCanvas().style.cursor = 'pointer';
                    clearPopupTimer();

                    const clusterId = e.features[0].properties.cluster_id;
                    const pointCount = e.features[0].properties.point_count;
                    const coordinates = e.features[0].geometry.coordinates.slice();

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    map.getSource('trainings').getClusterLeaves(clusterId, pointCount, 0, (err, features) => {
                        if (err) return;
                        const html = buildPopupHtml(features);
                        hoverPopup.setLngLat(coordinates).setHTML(html).addTo(map);
                        attachPopupHoverListeners();
                    });
                });

                map.on('mouseleave', 'clusters', () => {
                    map.getCanvas().style.cursor = '';
                    schedulePopupClose();
                });

                map.on('click', 'clusters', (e) => {
                    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                    const clusterId = features[0].properties.cluster_id;
                    map.getSource('trainings').getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
                    });
                });

                // --- POINT HOVER ---
                map.on('mouseenter', 'unclustered-point', (e) => {
                    map.getCanvas().style.cursor = 'pointer';
                    clearPopupTimer();

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
                    attachPopupHoverListeners();
                });

                map.on('mouseleave', 'unclustered-point', () => {
                    map.getCanvas().style.cursor = '';
                    schedulePopupClose();
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