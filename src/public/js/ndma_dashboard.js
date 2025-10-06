// public/js/ndma_dashboard.js - IMPROVED VERSION

document.addEventListener('DOMContentLoaded', () => {
    // === Chart.js Initialization for Scores by Theme ===

    const chartCanvas = document.getElementById('scoresByThemeChart');
    const chartDataEl = document.getElementById('chart-data');

    // 1. Robustness Check: Exit gracefully if elements are missing
    if (!chartCanvas || !chartDataEl || !chartDataEl.dataset.scores) {
        console.warn('Chart elements not found. Skipping chart initialization.');
        return;
    }

    try {
        const themeScores = JSON.parse(chartDataEl.dataset.scores);

        // 2. Data Check: Ensure we have data to display
        if (!Array.isArray(themeScores) || themeScores.length === 0) {
            chartCanvas.getContext('2d').fillText("No readiness data available to display.", 10, 50);
            return;
        }

        const labels = themeScores.map(item => item.theme);
        const data = themeScores.map(item => parseFloat(item.average_score));

        // 3. Thematic Styling: Use CSS variables for colors to match the dashboard theme
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryColor = computedStyle.getPropertyValue('--primary-accent').trim() || 'rgba(59, 130, 246, 1)';
        const primaryColorTransparent = primaryColor.replace('1)', '0.6)'); // Make it semi-transparent

        new Chart(chartCanvas, {
            type: 'bar', // Consider 'horizontalBar' if you have long labels
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Readiness Score',
                    data: data,
                    backgroundColor: primaryColorTransparent,
                    borderColor: primaryColor,
                    borderWidth: 1,
                    borderRadius: 4, // Adds a modern touch
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: computedStyle.getPropertyValue('--border-color').trim()
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Legend is redundant for a single dataset
                    },
                    tooltip: {
                        backgroundColor: '#111827',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 6,
                        displayColors: false, // Hides the little color box
                        callbacks: {
                            label: function(context) {
                                return `Score: ${context.parsed.y}%`;
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Failed to parse chart data or render chart:", error);
    }
});