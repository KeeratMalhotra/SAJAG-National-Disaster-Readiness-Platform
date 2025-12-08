document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // --- 1. State-Specific View Settings ---
    const stateViews = {
    'Delhi':       { center: [77.1025, 28.7041], zoom: 9 }, // City-state, higher zoom
    'Assam':       { center: [92.9376, 26.2006], zoom: 6 }, // Wide state
    'Odisha':      { center: [85.0985, 20.9517], zoom: 6 }, // Large state
    'Gujarat':     { center: [71.1924, 22.2587], zoom: 6 }, // Large state
    'Uttarakhand': { center: [79.0193, 30.0668], zoom: 7 }, // Medium state
    'default':     { center: [78.9629, 20.5937], zoom: 4 }
};

    const accessToken = mapContainer.dataset.token;
    const stateName = mapContainer.dataset.state;

    if (!accessToken) {
        console.error('Mapbox Access Token is missing!');
        return;
    }

    const view = stateViews[stateName] || stateViews['default'];
    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: view.center,
        zoom: view.zoom
    });
    window.map = map;

    // --- 2. HOVER POPUP CONFIGURATION (The Magic Part) ---
    const hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: '300px',
        offset: 10 // Keep it close to the mouse
    });

    // --- 3. GRACE PERIOD LOGIC ---
    let popupLeaveTimer;

    const clearPopupTimer = () => {
        if (popupLeaveTimer) {
            clearTimeout(popupLeaveTimer);
            popupLeaveTimer = null;
        }
    };

    const schedulePopupClose = () => {
        // 500ms delay: Gives you time to move mouse from dot to popup
        popupLeaveTimer = setTimeout(() => {
            hoverPopup.remove();
        }, 500); 
    };

    // Keep popup open if the user hovers INSIDE the popup itself
    const attachPopupHoverListeners = () => {
        const popupElement = hoverPopup.getElement();
        if (!popupElement) return;

        popupElement.addEventListener('mouseenter', clearPopupTimer);
        popupElement.addEventListener('mouseleave', schedulePopupClose);
    };

    let allTrainingsData = null;

    // Helper to filter the GeoJSON boundary
    function filterByState(geoData, stateName) {
        const filteredFeatures = geoData.features.filter(
            feature => feature.properties.NAME_1.toLowerCase() === stateName.toLowerCase()
        );
        return { ...geoData, features: filteredFeatures };
    }

    map.on('load', () => {
        // --- Load Boundaries & Mask ---
       fetch('/data/india_district.geojson')
        .then(response => response.json())
        .then(geoData => {
            const filteredGeoData = filterByState(geoData, stateName);

            // 1. Create Mask (Darken outside area)
            // Ensure Turf.js is loaded in your layout file for this to work
            if (typeof turf !== 'undefined') {
                try {
                    const maskPolygon = turf.mask(filteredGeoData);
                    map.addSource('state-mask-source', {
                        'type': 'geojson',
                        'data': maskPolygon
                    });
                    map.addLayer({
                        'id': 'state-mask-layer',
                        'type': 'fill',
                        'source': 'state-mask-source',
                        'layout': {},
                        'paint': {
                            'fill-color': '#000000',
                            'fill-opacity': 0.5
                        }
                    });
                } catch (e) {
                    console.warn("Turf.js masking failed or not loaded:", e);
                }
            }

            // 2. Add State Boundary Lines
            map.addSource('india-boundary', {
                'type': 'geojson',
                'data': filteredGeoData
            });

            map.addLayer({
                'id': 'state-boundary-casing',
                'type': 'line',
                'source': 'india-boundary',
                'layout': { 'line-join': 'round', 'line-cap': 'round' },
                'paint': { 'line-color': '#000000', 'line-width': 5 }
            });

            map.addLayer({
                'id': 'state-boundary-main',
                'type': 'line',
                'source': 'india-boundary',
                'layout': { 'line-join': 'round', 'line-cap': 'round' },
                'paint': { 'line-color': '#FFFFFF', 'line-width': 2.5 }
            });
        });

        // --- Load Training Data ---
        fetch(`/trainings/geojson?state=${encodeURIComponent(stateName)}`)
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
                    clusterProperties: { 'total': ['+', 1] }
                });

                // Clusters Layer (Orange Circles)
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

                // Cluster Count Text
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
                    paint: { 'text-color': '#ffffff' }
                });

                // Unclustered Points Layer (Colored Dots)
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
                
                // --- HTML Builder for Popups ---
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

                // --- 4. CLUSTER HOVER HANDLERS ---
                map.on('mouseenter', 'clusters', (e) => {
                    map.getCanvas().style.cursor = 'pointer';
                    clearPopupTimer(); // Don't close if we just arrived

                    const clusterId = e.features[0].properties.cluster_id;
                    const pointCount = e.features[0].properties.point_count;
                    const coordinates = e.features[0].geometry.coordinates.slice();

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    // Get underlying data
                    map.getSource('trainings').getClusterLeaves(clusterId, pointCount, 0, (err, features) => {
                        if (err) return;
                        const html = buildPopupHtml(features);
                        hoverPopup.setLngLat(coordinates).setHTML(html).addTo(map);
                        attachPopupHoverListeners(); // Add logic to keep popup open
                    });
                });

                map.on('mouseleave', 'clusters', () => {
                    map.getCanvas().style.cursor = '';
                    schedulePopupClose(); // Start the countdown
                });

                // Click still zooms in
                map.on('click', 'clusters', (e) => {
                    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                    const clusterId = features[0].properties.cluster_id;
                    map.getSource('trainings').getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
                    });
                });

                // --- 5. UNCLUSTERED POINT HOVER HANDLERS ---
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

    // --- Filter Logic ---
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