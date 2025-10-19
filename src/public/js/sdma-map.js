document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // --- START OF CHANGES ---

    // 1. Add a lookup object for state-specific map views.
    const stateViews = {
        'Delhi':       { center: [77.1025, 28.7041], zoom: 9 },
        'Maharashtra': { center: [75.7139, 19.7515], zoom: 6 },
        'Punjab':      { center: [75.3412, 31.1471], zoom: 7 },
        'Kerala':      { center: [76.2711, 10.8505], zoom: 7 },
        // Add other states here...
        'default':     { center: [78.9629, 20.5937], zoom: 4 } // Fallback view for India
    };

    const accessToken = mapContainer.dataset.token;
    // 2. Get the state name from the map container's data attribute.
    const stateName = mapContainer.dataset.state;

    if (!accessToken) {
        console.error('Mapbox Access Token is missing!');
        return;
    }

    // 3. Select the correct view settings for the current state.
    const view = stateViews[stateName] || stateViews['default'];

    mapboxgl.accessToken = accessToken;

    // 4. Initialize the map using the state-specific center and zoom.
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: view.center,
        zoom: view.zoom
    });

    // NOTE: The original `map.fitBounds` call for India has been removed.

    let allTrainingsData = null;

    function filterByState(geoData, stateName) {
        const filteredFeatures = geoData.features.filter(
            feature => feature.properties.NAME_1.toLowerCase() === stateName.toLowerCase()
        );
        return { ...geoData, features: filteredFeatures };
    }
    map.on('load', () => {
       fetch('/data/india_district.geojson')
        .then(response => response.json())
        .then(geoData => {
            // Filter the GeoJSON by stateName (same as before)
            const filteredGeoData = filterByState(geoData, stateName);

            // <<< CHANGE START: Create and add the mask layer >>>

            // 1. Use Turf.js to create the inverse polygon (the mask)
            // This creates a shape of the whole world with a hole for your state
            const maskPolygon = turf.mask(filteredGeoData);

            // 2. Add a new source for this mask data
            map.addSource('state-mask-source', {
                'type': 'geojson',
                'data': maskPolygon
            });

            // 3. Add the fill layer to darken the outside area
            // This layer MUST be added before your boundary lines
            map.addLayer({
                'id': 'state-mask-layer',
                'type': 'fill',
                'source': 'state-mask-source',
                'layout': {},
                'paint': {
                    'fill-color': '#000000', // Black color
                    'fill-opacity': 0.5      // 50% transparency
                }
            });

            // <<< CHANGE END >>>


            // --- The boundary line code remains the same ---

            // Add the main data source for the boundary line
            map.addSource('india-boundary', {
                'type': 'geojson',
                'data': filteredGeoData
            });

            // Layer 1: The Casing (Wider, darker line underneath)
            map.addLayer({
                'id': 'state-boundary-casing',
                'type': 'line',
                'source': 'india-boundary',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#000000',
                    'line-width': 5
                }
            });

            // Layer 2: The Main Line (Thinner, white line on top)
            map.addLayer({
                'id': 'state-boundary-main',
                'type': 'line',
                'source': 'india-boundary',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#FFFFFF',
                    'line-width': 2.5
                }
            });
        });

       // 5. Update fetch URL to get data for the specific state.
        fetch(`/trainings/geojson?state=${encodeURIComponent(stateName)}`)
            .then(res => res.json())
            .then(data => {
                // --- END OF CHANGES ---

                allTrainingsData = data;
                if (!allTrainingsData.features) return;
                
                // --- NEW FIX: Add a "count" property to each feature ---
                allTrainingsData.features.forEach(feature => {
                    if (feature.properties) {
                        feature.properties.count = 1;
                    } else {
                        feature.properties = { count: 1 };
                    }
                });

                // Create a data source with clustering enabled
                map.addSource('trainings', {
                    type: 'geojson',
                    data: allTrainingsData,
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 15,
                    // --- NEW CLUSTER PROPERTIES ---
                    clusterProperties: {
                        'sum': ['+', ['get', 'count']]
                    }
                });

              // Layer for the clusters (circles with numbers)
                map.addLayer({
                    id: 'clusters',
                    type: 'circle',
                    source: 'trainings',
                    filter: ['has', 'point_count'],
                    paint: {
                        'circle-color': '#FF9933', // Saffron
                        // --- UPDATED: Use 'sum' instead of 'point_count' ---
                        'circle-radius': ['step', ['get', 'sum'], 20, 100, 30, 750, 40],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff'
                    }
                });

                // Layer for the cluster count text
               // Layer for the cluster count text
                map.addLayer({
                    id: 'cluster-count',
                    type: 'symbol',
                    source: 'trainings',
                    filter: ['has', 'point_count'],
                    layout: {
                         // --- UPDATED: Use 'sum' instead of 'point_count' ---
                        'text-field': ['get', 'sum'],
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
                // Click event for individual points (to show popup)
                map.on('click', 'unclustered-point', (e) => {
                    // Use queryRenderedFeatures to get ALL features at the click point
                    const features = map.queryRenderedFeatures(e.point, {
                        layers: ['unclustered-point']
                    });

                    if (!features.length) {
                        return;
                    }

                    // All features at this point share the same coordinate
                    const coordinates = features[0].geometry.coordinates.slice();
                    
                    let popupContent = '';

                    // Generate HTML for each feature
                    features.forEach((feature, index) => {
                        const properties = feature.properties;

                        // Add a separator, but not before the first item
                        if (index > 0) {
                            popupContent += '<hr class="my-2">';
                        }

                        popupContent += `
                            <h6>${properties.title}</h6>
                            <p class="mb-1">Theme: ${properties.theme}</p>
                            <span class="badge bg-primary">${properties.status}</span>
                            <br>
                            <a href="/trainings/${properties.id}" class="btn btn-sm btn-outline-primary mt-2">View Details</a>
                        `;
                    });

                    // If there's more than one feature, wrap it in a scrollable container
                    if (features.length > 1) {
                        popupContent = `
                            <h5 class="mb-2" style="font-size: 1.1rem;">${features.length} Trainings at this Location</h5>
                            <div style="max-height: 220px; overflow-y: auto; padding-right: 10px;">
                                ${popupContent}
                            </div>
                        `;
                    }

                    // Create and show the popup
                    new mapboxgl.Popup({ maxWidth: '300px' })
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

    // --- INTERACTIVE FILTER LOGIC (UNCHANGED) ---
    const filterGroup = document.getElementById('map-filter-group');
    if(filterGroup){
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