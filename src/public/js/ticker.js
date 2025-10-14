document.addEventListener('DOMContentLoaded', () => {
    const tickerContent = document.querySelector('.ticker-content span');
    if (!tickerContent) return;

    fetch('/api/public/ticker-data')
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                // Join the items with a separator and update the ticker
                const tickerText = data.join(' &nbsp; • &nbsp; ');
                tickerContent.innerHTML = tickerText;
            }
        })
        .catch(error => console.error('Error fetching ticker data:', error));
});