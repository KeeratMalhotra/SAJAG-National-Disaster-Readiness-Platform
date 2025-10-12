document.addEventListener('DOMContentLoaded', () => {
        const getLocationBtn = document.getElementById('getLocationBtn');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');

    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', () => {
            if ("geolocation" in navigator) {
                getLocationBtn.innerHTML = '<i class="bi bi-geo-alt"></i> Fetching...';
                getLocationBtn.disabled = true;

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        latitudeInput.value = position.coords.latitude.toFixed(6);
                        longitudeInput.value = position.coords.longitude.toFixed(6);
                        getLocationBtn.innerHTML = '<i class="bi bi-geo-alt"></i> Get Location';
                        getLocationBtn.disabled = false;
                    },
                    (error) => {
                        alert(`Error getting location: ${error.message}`);
                        getLocationBtn.innerHTML = '<i class="bi bi-geo-alt"></i> Get Location';
                        getLocationBtn.disabled = false;
                    }
                );
            } else {
                alert("Geolocation is not supported by your browser.");
            }
        });
    }



    const newTrainingForm = document.getElementById('newTrainingForm');

    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', () => {
            // When the start date changes, set the minimum allowed end date
            endDateInput.min = startDateInput.value;
        });
    }

    if (newTrainingForm) {
        newTrainingForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(newTrainingForm);
            const data = {
                title: formData.get('title'),
                theme: formData.get('theme'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                location: formData.get('location'),
                latitude: formData.get('latitude'),
                longitude: formData.get('longitude')
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