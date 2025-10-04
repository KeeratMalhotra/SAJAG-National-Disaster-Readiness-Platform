document.addEventListener('DOMContentLoaded', () => {
    const qrModal = document.getElementById('qrModal');
    const qrcodeContainer = document.getElementById('qrcode');
    const qrTrainingTitle = document.getElementById('qrTrainingTitle');
    const qrLink = document.getElementById('qrLink');

    // Listen for clicks on any "Show QR Code" button
    document.querySelectorAll('.show-qr-btn').forEach(button => {
        button.addEventListener('click', () => {
            const url = button.dataset.url;
            const title = button.dataset.title;

            // Clear any previous QR code
            qrcodeContainer.innerHTML = '';
            
            // Generate the new QR code
            const qr = qrcode(0, 'M');
            qr.addData(url);
            qr.make();
            
            // Display it as an image
            qrcodeContainer.innerHTML = qr.createImgTag(5, 5);
            qrTrainingTitle.textContent = title;
            qrLink.textContent = url;
        });
    });
});