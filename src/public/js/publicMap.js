// document.addEventListener('DOMContentLoaded', () => {
//     const mapContainer = document.getElementById('map');
//     if (!mapContainer) return;

//     const accessToken = mapContainer.dataset.token;
//     if (!accessToken) {
//         console.error('Mapbox Access Token is missing!');
//         return;
//     }

    

//     mapboxgl.accessToken = accessToken;

//     const bounds = [
//         [68, 8],
//         [98, 37]
//     ]; // Define the geographic bounds for India

//     const map = new mapboxgl.Map({
//         container: 'map',
//         style: 'mapbox://styles/mapbox/satellite-streets-v12',
//     });

//     window.viewOnMap = function(lat, lng) {
//         // 1. Scroll to the map section
//         document.querySelector('.map-card').scrollIntoView({ 
//             behavior: 'smooth',
//             block: 'center'
//         });

//         map.flyTo({
//             center: [lng, lat],
//             zoom: 12,
//             essential: true // this animation is considered essential with respect to prefers-reduced-motion
//         });

//         new mapboxgl.Popup({ closeOnClick: true, closeButton: false })
//             .setLngLat([lng, lat])
//             .setHTML('<div style="color:#333; font-weight:bold; padding:5px;">Selected Training Location</div>')
//             .addTo(map);
//         };
//     map.fitBounds(bounds, {
//         padding: 20
// });


//     // Create a global popup instance for hover interactions
//     const hoverPopup = new mapboxgl.Popup({
//         closeButton: false,
//         closeOnClick: false,
//         maxWidth: '300px'
//     });

//     let allTrainingsData = null;

//     map.on('load', () => {
//         map.addSource('india-boundary', {
//             'type': 'geojson',
//             'data': '/data/india.geojson'
//         });

//         map.addLayer({
//             'id': 'india-boundary-layer',
//             'type': 'line',
//             'source': 'india-boundary',
//             'layout': {},
//             'paint': {
//                 'line-color': '#003366',
//                 'line-width': 2.5,
//                 'line-opacity': 0.9
//             }
//         });

//         fetch('/geojson')
//             .then(res => res.json())
//             .then(data => {
//                 allTrainingsData = data;
//                 if (!allTrainingsData.features) return;

//                 map.addSource('trainings', {
//                     type: 'geojson',
//                     data: allTrainingsData,
//                     cluster: true,
//                     clusterMaxZoom: 14,
//                     clusterRadius: 15,
//                     clusterProperties: {
//                         'total': ['+', 1]
//                     }
//                 });

//                 map.addLayer({
//                     id: 'clusters',
//                     type: 'circle',
//                     source: 'trainings',
//                     filter: ['has', 'point_count'],
//                     paint: {
//                         'circle-color': '#FF9933',
//                         'circle-radius': ['step', ['get', 'total'], 20, 100, 30, 750, 40],
//                         'circle-stroke-width': 2,
//                         'circle-stroke-color': '#fff'
//                     }
//                 });

//                 map.addLayer({
//                     id: 'cluster-count',
//                     type: 'symbol',
//                     source: 'trainings',
//                     filter: ['has', 'point_count'],
//                     layout: {
//                         'text-field': ['get', 'total'],
//                         'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
//                         'text-size': 14
//                     },
//                     paint: {
//                         'text-color': '#ffffff'
//                     }
//                 });

//                 map.addLayer({
//                     id: 'unclustered-point',
//                     type: 'circle',
//                     source: 'trainings',
//                     filter: ['!', ['has', 'point_count']],
//                     paint: {
//                         'circle-color': [
//                             'match',
//                             ['get', 'theme'],
//                             'Earthquake', '#D97706',
//                             'Flood', '#2563EB',
//                             'Cyclone', '#4B5563',
//                             'Landslide', '#6D28D9',
//                             'Fire Safety', '#DC2626',
//                             '#1F2937'
//                         ],
//                         'circle-radius': 8,
//                         'circle-stroke-width': 2,
//                         'circle-stroke-color': '#fff'
//                     }
//                 });

//                 // Helper to build HTML for popups
//                 const buildPopupHtml = (features) => {
//                     const uniqueFeaturesMap = new Map();
//                     features.forEach(feature => {
//                         uniqueFeaturesMap.set(feature.properties.id, feature);
//                     });
//                     const uniqueFeatures = Array.from(uniqueFeaturesMap.values());

//                     let popupContent = '';
//                     uniqueFeatures.forEach((feature, index) => {
//                         const properties = feature.properties;
//                         if (index > 0) popupContent += '<hr class="my-2">';
//                         popupContent += `
//                             <h6>${properties.title}</h6>
//                             <p class="mb-1">Theme: ${properties.theme}</p>
//                             <span class="badge bg-primary">${properties.status}</span>
//                             <br>
//                         `;
//                     });

//                     if (uniqueFeatures.length > 1) {
//                         return `
//                             <h5 class="mb-2" style="font-size: 1.1rem;">${uniqueFeatures.length} Trainings</h5>
//                             <div style="max-height: 220px; overflow-y: auto; padding-right: 10px;">
//                                 ${popupContent}
//                             </div>
//                         `;
//                     }
//                     return popupContent;
//                 };

//                 // --- CHANGED: Hover interaction for CLUSTERS ---
//                 map.on('mouseenter', 'clusters', (e) => {
//                     map.getCanvas().style.cursor = 'pointer';
                    
//                     const clusterId = e.features[0].properties.cluster_id;
//                     const pointCount = e.features[0].properties.point_count;
//                     const coordinates = e.features[0].geometry.coordinates.slice();

//                     // Fetch all points in this cluster
//                     map.getSource('trainings').getClusterLeaves(clusterId, pointCount, 0, (err, features) => {
//                         if (err) return;

//                         // Ensure we account for map wrapping
//                         while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
//                             coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
//                         }

//                         const html = buildPopupHtml(features);
//                         hoverPopup.setLngLat(coordinates).setHTML(html).addTo(map);
//                     });
//                 });

//                 map.on('mouseleave', 'clusters', () => {
//                     map.getCanvas().style.cursor = '';
//                     hoverPopup.remove();
//                 });

//                 // Keep click on clusters to zoom in (optional but recommended UX)
//                 map.on('click', 'clusters', (e) => {
//                     const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
//                     const clusterId = features[0].properties.cluster_id;
//                     map.getSource('trainings').getClusterExpansionZoom(clusterId, (err, zoom) => {
//                         if (err) return;
//                         map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
//                     });
//                 });

//                 // --- CHANGED: Hover interaction for UNCLUSTERED POINTS ---
//                 map.on('mouseenter', 'unclustered-point', (e) => {
//                     map.getCanvas().style.cursor = 'pointer';

//                     const coordinates = e.features[0].geometry.coordinates.slice();
//                     const allFeatures = map.queryRenderedFeatures(e.point, {
//                         layers: ['unclustered-point']
//                     });

//                     if (!allFeatures.length) return;

//                     while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
//                         coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
//                     }

//                     const html = buildPopupHtml(allFeatures);
//                     hoverPopup.setLngLat(coordinates).setHTML(html).addTo(map);
//                 });

//                 map.on('mouseleave', 'unclustered-point', () => {
//                     map.getCanvas().style.cursor = '';
//                     hoverPopup.remove();
//                 });
//             });
//     });

//     const filterGroup = document.getElementById('map-filter-group');
//     if (filterGroup) {
//         filterGroup.addEventListener('click', (e) => {
//             if (e.target.tagName !== 'BUTTON') return;

//             const filter = e.target.dataset.filter;

//             if (filter === 'All') {
//                 map.getSource('trainings').setData(allTrainingsData);
//             } else {
//                 const filteredData = {
//                     ...allTrainingsData,
//                     features: allTrainingsData.features.filter(f => f.properties.theme === filter)
//                 };
//                 map.getSource('trainings').setData(filteredData);
//             }

//             document.querySelectorAll('#map-filter-group button').forEach(btn => {
//                 btn.classList.remove('active', 'btn-primary');
//                 btn.classList.add('btn-outline-secondary');
//             });

//             e.target.classList.remove('btn-outline-secondary');
//             e.target.classList.add('active', 'btn-primary');
//         });
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Public Map Script Loaded!"); // Debugging Log

    // --- GLOBAL FUNCTION: View On Map ---
    // इसे सबसे ऊपर डिफाइन किया गया है ताकि यह हमेशा उपलब्ध रहे
    window.viewOnMap = function(lat, lng) {
        console.log(`📍 View button clicked: Lat=${lat}, Lng=${lng}`);

        // 1. Check if Map object exists
        if (typeof map === 'undefined') {
            alert("Map is not fully loaded yet or Token is missing.");
            return;
        }

        // 2. Check for valid coordinates
        if (!lat || !lng) {
            alert("Error: Invalid coordinates for this training.");
            console.error("Invalid coordinates:", lat, lng);
            return;
        }

        // 3. Scroll to Map
        const mapCard = document.querySelector('.map-card');
        if (mapCard) {
            mapCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // 4. Fly Animation
        try {
            map.flyTo({
                center: [lng, lat],
                zoom: 12,
                essential: true
            });

            // 5. Show Popup
            new mapboxgl.Popup({ closeOnClick: true, closeButton: false })
                .setLngLat([lng, lat])
                .setHTML('<div style="color:#333; font-weight:bold; padding:8px;">🎯 Selected Location</div>')
                .addTo(map);
                
        } catch (err) {
            console.error("Map FlyTo Error:", err);
        }
    };

    // --- MAP INITIALIZATION ---
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error("❌ Map container not found on page.");
        return;
    }

    const accessToken = mapContainer.dataset.token;
    if (!accessToken) {
        console.error("❌ Mapbox Access Token is missing in HTML data-token attribute!");
        alert("System Error: Map Token Missing");
        return;
    }

    mapboxgl.accessToken = accessToken;

    // Define map variable in scope accessible to event listeners
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
    });

    const bounds = [[68, 8], [98, 37]]; // India Bounds
    
    // Initial view
    map.fitBounds(bounds, { padding: 20 });

    const hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: '300px'
    });

    let allTrainingsData = null;

    map.on('load', () => {
        console.log("✅ Mapbox loaded successfully.");

        // India Boundary
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

        // Fetch Data
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
                    clusterProperties: { 'total': ['+', 1] }
                });

                // Clusters
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

                // Cluster Count
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

                // Unclustered Points
                map.addLayer({
                    id: 'unclustered-point',
                    type: 'circle',
                    source: 'trainings',
                    filter: ['!', ['has', 'point_count']],
                    paint: {
                        'circle-color': [
                            'match', ['get', 'theme'],
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

                // --- Interactions ---
                const buildPopupHtml = (features) => {
                    const uniqueFeaturesMap = new Map();
                    features.forEach(feature => uniqueFeaturesMap.set(feature.properties.id, feature));
                    const uniqueFeatures = Array.from(uniqueFeaturesMap.values());

                    let popupContent = '';
                    uniqueFeatures.forEach((feature, index) => {
                        const p = feature.properties;
                        if (index > 0) popupContent += '<hr class="my-2">';
                        popupContent += `<h6>${p.title}</h6><p class="mb-1">Theme: ${p.theme}</p><span class="badge bg-primary">${p.status}</span><br>`;
                    });
                    if (uniqueFeatures.length > 1) {
                        return `<h5 class="mb-2" style="font-size: 1.1rem;">${uniqueFeatures.length} Trainings</h5><div style="max-height: 220px; overflow-y: auto; padding-right: 10px;">${popupContent}</div>`;
                    }
                    return popupContent;
                };

                map.on('mouseenter', 'clusters', (e) => {
                    map.getCanvas().style.cursor = 'pointer';
                    const clusterId = e.features[0].properties.cluster_id;
                    const pointCount = e.features[0].properties.point_count;
                    const coordinates = e.features[0].geometry.coordinates.slice();

                    map.getSource('trainings').getClusterLeaves(clusterId, pointCount, 0, (err, features) => {
                        if (err) return;
                        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                        }
                        hoverPopup.setLngLat(coordinates).setHTML(buildPopupHtml(features)).addTo(map);
                    });
                });

                map.on('mouseleave', 'clusters', () => {
                    map.getCanvas().style.cursor = '';
                    hoverPopup.remove();
                });

                map.on('click', 'clusters', (e) => {
                    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                    const clusterId = features[0].properties.cluster_id;
                    map.getSource('trainings').getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) return;
                        map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
                    });
                });

                map.on('mouseenter', 'unclustered-point', (e) => {
                    map.getCanvas().style.cursor = 'pointer';
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
                    if (!features.length) return;
                    
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }
                    hoverPopup.setLngLat(coordinates).setHTML(buildPopupHtml(features)).addTo(map);
                });

                map.on('mouseleave', 'unclustered-point', () => {
                    map.getCanvas().style.cursor = '';
                    hoverPopup.remove();
                });
            })
            .catch(e => console.error("Error fetching geojson:", e));
    });

    // Filter Logic
    const filterGroup = document.getElementById('map-filter-group');
    if (filterGroup) {
        filterGroup.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') return;
            const filter = e.target.dataset.filter;
            if (!allTrainingsData) return;

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