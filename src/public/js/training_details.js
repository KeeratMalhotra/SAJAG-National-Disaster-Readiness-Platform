document.addEventListener('DOMContentLoaded', () => {
    const qrcodeContainer = document.getElementById('qrcode');
    if (qrcodeContainer) {
        // Get the URL from the <p> tag in the modal
        const url = document.querySelector('.modal-body small').textContent;

        // Generate the QR code
        const qr = qrcode(0, 'M');
        qr.addData(url);
        qr.make();
        
        // Display it as an image in the modal
        qrcodeContainer.innerHTML = qr.createImgTag(5, 5);
    }
    
    // Your existing delete button code
    const deleteBtn = document.getElementById('deleteTrainingBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const trainingId = deleteBtn.dataset.id;
            if (confirm('Are you sure you want to permanently delete this training? This action cannot be undone.')) {
                try {
                    const response = await fetch(`/api/trainings/${trainingId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    
                    if (response.ok) {
                        // --- THIS IS THE FIX ---
                        alert(result.message); // Show the success message
                        window.location.href = '/dashboard'; // Redirect to a safe page
                    } else {
                        alert(`Error: ${result.message}`);
                    }
                } catch (error) {
                    alert('A network error occurred.');
                }
            }
        });
    }
});