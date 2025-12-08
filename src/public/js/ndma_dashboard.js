document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. CHART.JS INITIALIZATION (Scores by Theme)
    // ==========================================

    const chartCanvas = document.getElementById('scoresByThemeChart');
    const chartDataEl = document.getElementById('chart-data');

    // Robustness Check: Exit gracefully if elements are missing
    if (!chartCanvas || !chartDataEl || !chartDataEl.dataset.scores) {
        console.warn('Chart elements not found. Skipping chart initialization.');
    } else {
        try {
            const themeScores = JSON.parse(chartDataEl.dataset.scores);

            // Data Check: Ensure we have data to display
            if (!Array.isArray(themeScores) || themeScores.length === 0) {
                const ctx = chartCanvas.getContext('2d');
                ctx.font = "14px Arial";
                ctx.fillText("No readiness data available to display.", 10, 50);
            } else {
                const labels = themeScores.map(item => item.theme);
                const data = themeScores.map(item => parseFloat(item.average_score));

                // Thematic Styling
                const computedStyle = getComputedStyle(document.documentElement);
                const primaryColor = computedStyle.getPropertyValue('--primary-accent').trim() || 'rgba(59, 130, 246, 1)';
                const primaryColorTransparent = primaryColor.replace('1)', '0.6)');

                new Chart(chartCanvas, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Average Readiness Score',
                            data: data,
                            backgroundColor: primaryColorTransparent,
                            borderColor: primaryColor,
                            borderWidth: 1,
                            borderRadius: 4,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                grid: { color: computedStyle.getPropertyValue('--border-color').trim() }
                            },
                            x: { grid: { display: false } }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: '#111827',
                                titleFont: { size: 14, weight: 'bold' },
                                bodyFont: { size: 12 },
                                padding: 10,
                                cornerRadius: 6,
                                displayColors: false,
                                callbacks: {
                                    label: function(context) {
                                        return `Score: ${context.parsed.y}%`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Failed to parse chart data or render chart:", error);
        }
    }
});


// ==========================================
// 2. ASSESSMENT ANALYTICS LOGIC (Google Forms)
// ==========================================

async function saveAssessmentLink() {
    const theme = document.getElementById('assessmentTheme').value;
    const link = document.getElementById('assessmentLink').value;

    if (!link) {
        alert('Please paste a Google Form link first.');
        return;
    }

    // Basic validation
    if (!link.includes('docs.google.com/forms')) {
        alert('Please enter a valid Google Form URL.');
        return;
    }

    try {
        const response = await fetch('/assessment/save-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme, link })
        });

        const result = await response.json();
        if (result.success) {
            alert('Link saved successfully for ' + theme + '!');
            document.getElementById('assessmentLink').value = ''; // Clear input
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error(error);
        alert('Something went wrong while saving the link.');
    }
}

async function fetchAnalytics() {
    const theme = document.getElementById('assessmentTheme').value;
    
    // UI Updates: Show loading state
    document.getElementById('analyticsResult').style.display = 'none';
    document.getElementById('analyticsEmpty').style.display = 'none';
    document.getElementById('analyticsLoading').style.display = 'block';

    try {
        const response = await fetch(`/assessment/analytics/${theme}`);
        const result = await response.json();

        // Hide loading
        document.getElementById('analyticsLoading').style.display = 'none';

        if (result.success && result.data && result.data.length > 0) {
            // Show Table with Data
            document.getElementById('analyticsResult').style.display = 'block';
            const tbody = document.getElementById('analyticsTableBody');
            tbody.innerHTML = ''; // Clear old data

            result.data.forEach(item => {
                // Color coding logic
                let badgeClass = 'text-danger';
                if(item.wrongPercentage < 30) badgeClass = 'text-warning';
                if(item.wrongPercentage < 10) badgeClass = 'text-success';

                const row = `
                    <tr>
                        <td>${item.question}</td>
                        <td class="text-center font-weight-bold ${badgeClass}">
                            ${item.wrongCount} / ${item.totalAttempts}
                        </td>
                        <td class="text-center font-weight-bold">
                            ${item.wrongPercentage}%
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            // Show Empty State
            document.getElementById('analyticsEmpty').style.display = 'block';
            if (!result.success && result.message) {
                console.log(result.message);
            }
        }
    } catch (error) {
        console.error(error);
        document.getElementById('analyticsLoading').style.display = 'none';
        alert('Failed to fetch analytics from Google.');
    }
}


// ==========================================
// 3. GAP ANALYSIS MAP LOGIC (The "God View")
// ==========================================

async function loadGapAnalysisLayer(map) {
    try {
        console.log("Fetching Gap Analysis...");
        const response = await fetch('/api/predictions/gaps');
        const gaps = await response.json();

        // We need coordinates for these districts. 
        // Quick Hack for Demo: Hardcode coordinates for districts in your risk_profiles.json
        const districtCoords = {
            "Punjab": [75.3412, 31.1471],
            "Maharashtra": [75.7139, 19.7515],
            "Guwahati": [91.7362, 26.1158],
            "Himachal Pradesh": [77.1734, 31.1048],
            "Delhi": [77.1025, 28.7041],
            "Uttarakhand": [79.0193, 30.0668],
            "West Bengal": [87.8550, 22.9868] // Added WB just in case
        };

        const features = gaps.map(gap => {
            const coords = districtCoords[gap.district];
            if (!coords) return null;

            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: coords
                },
                properties: {
                    title: `⚠️ GAP: ${gap.district}`,
                    description: `Priority Score: ${gap.priorityScore}\nReason: ${gap.reason}`,
                    score: parseFloat(gap.priorityScore)
                }
            };
        }).filter(f => f !== null);

        const gapGeoJSON = { type: 'FeatureCollection', features: features };

        // Add Source
        if (map.getSource('gaps')) {
            map.getSource('gaps').setData(gapGeoJSON);
        } else {
            map.addSource('gaps', {
                type: 'geojson',
                data: gapGeoJSON
            });

            // Add Heatmap-like Circles (Pulsing Red)
            map.addLayer({
                id: 'gap-circles',
                type: 'circle',
                source: 'gaps',
                paint: {
                    'circle-radius': 20,
                    'circle-color': '#ff0000',
                    'circle-opacity': 0.6,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });

            // Add Warning Labels
            map.addLayer({
                id: 'gap-labels',
                type: 'symbol',
                source: 'gaps',
                layout: {
                    'text-field': ['get', 'score'],
                    'text-size': 12,
                    'text-offset': [0, 0.5]
                },
                paint: {
                    'text-color': '#ffffff'
                }
            });
            
            // Add Popups
            map.on('click', 'gap-circles', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const { title, description } = e.features[0].properties;

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`<strong>${title}</strong><br><span style="white-space: pre-line">${description}</span>`)
                    .addTo(map);
            });
        }

    } catch (error) {
        console.error("Error loading gaps:", error);
    }
}

// --- AUTO-LOADER FOR MAP ---
// This checks if the Mapbox map is ready every 1 second and then loads the gap layer.
// Important: Ensure you expose 'window.map = map' in your sdma-map.js or map.js file.
const checkMapInterval = setInterval(() => {
    if (window.map && typeof window.map.getSource === 'function') {
        // Map is found!
        if (window.map.isStyleLoaded()) {
            console.log("Map found and loaded. Injecting Gap Analysis...");
            clearInterval(checkMapInterval);
            loadGapAnalysisLayer(window.map);
        }
    }
}, 1000);