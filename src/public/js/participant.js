document.addEventListener('DOMContentLoaded', () => {
    const lookupForm = document.getElementById('lookupForm');
    const lookupMessage = document.getElementById('lookupMessage');
    const lookupCard = document.getElementById('lookupCard');

    if (lookupForm) {
        lookupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(lookupForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/participant/request-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                
                // Show a success message and hide the form
                lookupCard.innerHTML = `
                    <div class="card-body text-center p-5">
                        <h3 class="text-success">Check Your Console!</h3>
                        <p class="lead">${result.message}</p>
                        <p>In a real application, this link would be emailed to you. For this demo, please copy the secure link from the server's terminal log.</p>
                    </div>
                `;
            } catch (error) {
                lookupMessage.innerHTML = `<div class="alert alert-danger">A network error occurred.</div>`;
            }
        });
    }
});