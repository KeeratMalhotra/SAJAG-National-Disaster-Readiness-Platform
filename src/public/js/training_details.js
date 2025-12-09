document.addEventListener('DOMContentLoaded', () => {
    const qrcodeContainer = document.getElementById('qrcode');
    const linkElement = document.getElementById('assessment-link');

    if (qrcodeContainer && linkElement) {
        // 1. Construct the Dynamic URL (Works for Localhost & Production)
        const relativePath = linkElement.getAttribute('data-path');
        const fullUrl = window.location.origin + relativePath;

        // 2. Display the text link
        linkElement.textContent = fullUrl;

        // 3. Generate the QR code
        const qr = qrcode(0, 'M');
        qr.addData(fullUrl);
        qr.make();
        
        // Display it as an image
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