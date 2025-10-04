document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('scoresByThemeChart');
    // The themeScores data is passed from our EJS file
    if (ctx && typeof themeScores !== 'undefined' && themeScores.length > 0) {

        const labels = themeScores.map(item => item.theme);
        const data = themeScores.map(item => parseFloat(item.average_score));

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Readiness Score',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
});