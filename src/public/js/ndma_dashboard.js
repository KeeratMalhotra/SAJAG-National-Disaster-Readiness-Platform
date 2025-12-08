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


// --- ASSESSMENT ANALYTICS LOGIC ---

async function saveAssessmentLink() {
    const theme = document.getElementById('assessmentTheme').value;
    const link = document.getElementById('assessmentLink').value;

    if (!link) {
        alert('Please paste a Google Form link first.');
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
            alert('✅ Link saved successfully!');
        } else {
            alert('❌ Error: ' + result.message);
        }
    } catch (error) {
        console.error(error);
        alert('Something went wrong.');
    }
}

async function fetchAnalytics() {
    const theme = document.getElementById('assessmentTheme').value;
    
    // UI Updates
    document.getElementById('analyticsResult').style.display = 'none';
    document.getElementById('analyticsEmpty').style.display = 'none';
    document.getElementById('analyticsLoading').style.display = 'block';

    try {
        const response = await fetch(`/assessment/analytics/${theme}`);
        const result = await response.json();

        document.getElementById('analyticsLoading').style.display = 'none';

        if (result.success && result.data.length > 0) {
            // Show Table
            document.getElementById('analyticsResult').style.display = 'block';
            const tbody = document.getElementById('analyticsTableBody');
            tbody.innerHTML = ''; // Clear old data

            result.data.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.question}</td>
                        <td class="text-center font-weight-bold text-danger">${item.wrongCount} / ${item.totalAttempts}</td>
                        <td class="text-center">${item.wrongPercentage}%</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            document.getElementById('analyticsEmpty').style.display = 'block';
            if (!result.success) alert(result.message);
        }
    } catch (error) {
        console.error(error);
        document.getElementById('analyticsLoading').style.display = 'none';
        alert('Failed to fetch analytics.');
    }
}




// ==========================================
//  NEW: ASSESSMENT ANALYTICS LOGIC
// ==========================================

async function saveAssessmentLink() {
    const theme = document.getElementById('assessmentTheme').value;
    const link = document.getElementById('assessmentLink').value;

    if (!link) {
        alert('Please paste a Google Form link first.');
        return;
    }

    // Basic validation to check if it looks like a google form
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
                // Optional: Alert if it's a specific error
                console.log(result.message);
            }
        }
    } catch (error) {
        console.error(error);
        document.getElementById('analyticsLoading').style.display = 'none';
        alert('Failed to fetch analytics from Google.');
    }
}