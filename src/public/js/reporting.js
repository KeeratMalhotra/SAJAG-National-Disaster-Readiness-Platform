document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadReportBtn');
    const reportContent = document.getElementById('report-content');

    if (downloadBtn && reportContent) {
        downloadBtn.addEventListener('click', () => {
            // Show a temporary loading message
            downloadBtn.textContent = 'Generating...';
            downloadBtn.disabled = true;

            html2canvas(reportContent, {
                scale: 2 // Render at a higher resolution for better quality
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;

                // Create a PDF in landscape mode for wider content
                const pdf = new jsPDF('l', 'mm', 'a4'); 
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('sajag-report.pdf');

                // Reset the button
                downloadBtn.textContent = 'Download Report';
                downloadBtn.disabled = false;
            });
        });
    }
});