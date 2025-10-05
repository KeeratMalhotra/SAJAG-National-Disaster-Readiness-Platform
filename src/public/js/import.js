document.addEventListener('DOMContentLoaded', () => {
    const importForm = document.getElementById('importForm');
    const importMessage = document.getElementById('import-message');

    if (importForm) {
        importForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(importForm);
            
            // Show a processing message
            importMessage.innerHTML = `<div class="alert alert-info">Processing your file... Please wait.</div>`;
            
            try {
                const response = await fetch('/api/import/trainings', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    importMessage.innerHTML = `
                        <div class="alert alert-success">
                            <strong>Import Complete!</strong><br>
                            Successfully imported: ${result.successCount} records.<br>
                            Failed records: ${result.errorCount}.
                        </div>`;
                } else {
                    importMessage.innerHTML = `<div class="alert alert-danger">${result.message || 'An unknown error occurred.'}</div>`;
                }
            } catch (error) {
                importMessage.innerHTML = `<div class="alert alert-danger">A network error occurred. Please try again.</div>`;
            }
        });
    }
});