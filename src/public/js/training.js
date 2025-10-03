document.addEventListener('DOMContentLoaded', () => {
    const newTrainingForm = document.getElementById('newTrainingForm');

    if (newTrainingForm) {
        newTrainingForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(newTrainingForm);
            const data = {
                title: formData.get('title'),
                theme: formData.get('theme'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                location: formData.get('location')
            };

            try {
                const response = await fetch('/trainings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    // If successful, redirect back to the dashboard
                    window.location.href = '/dashboard';
                } else {
                    const result = await response.json();
                    alert(`Error: ${result.message}`); // Show a simple alert for errors
                }
            } catch (error) {
                console.error('Error creating training:', error);
                alert('A network error occurred. Please try again.');
            }
        });
    }
});