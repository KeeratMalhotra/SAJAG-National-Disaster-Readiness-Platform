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
});