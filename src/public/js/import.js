document.addEventListener('DOMContentLoaded', () => {
    const importForm = document.getElementById('importForm');
    const importMessage = document.getElementById('import-message');

    if (importForm) {
        importForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(importForm);
            
            const submitBtn = importForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
            importMessage.innerHTML = `<div class="alert alert-info">File upload ho rahi hai aur process ho rahi hai. Kripya wait karein...</div>`;
            
            try {
                const response = await fetch('/api/import/trainings', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                if (response.ok) {
                    
                    let errorHtml = '';
                    
                    if (result.errors && result.errors.length > 0) {
                        errorHtml = `
                            <div class="mt-3 p-3 border rounded bg-white" style="max-height: 200px; overflow-y: auto;">
                                <strong class="text-danger d-block mb-2">Failed Rows Details:</strong>
                                <ul class="text-danger small mb-0 ps-3">
                                    ${result.errors.map(err => `<li>${err}</li>`).join('')}
                                </ul>
                            </div>`;
                    }

                    const alertClass = result.errorCount > 0 ? 'warning' : 'success';
                    const iconClass = result.errorCount > 0 ? 'exclamation-triangle-fill' : 'check-circle-fill';

                    importMessage.innerHTML = `
                        <div class="alert alert-${alertClass} alert-dismissible fade show shadow-sm" role="alert">
                            <h5 class="alert-heading"><i class="bi bi-${iconClass}"></i> Import Completed!</h5>
                            <hr>
                            <div class="row">
                                <div class="col-md-6">
                                    <p class="mb-0 text-success fw-bold">
                                        <i class="bi bi-check-lg"></i> Successfully Saved: ${result.successCount}
                                    </p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-0 text-danger fw-bold">
                                        <i class="bi bi-x-lg"></i> Failed Records: ${result.errorCount}
                                    </p>
                                </div>
                            </div>
                            ${errorHtml}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                    
                    if (result.successCount > 0) {
                        importForm.reset();
                    }

                } else {
                    importMessage.innerHTML = `<div class="alert alert-danger shadow-sm">
                        <i class="bi bi-exclamation-octagon-fill"></i> Error: ${result.message || 'An unknown error occurred.'}
                    </div>`;
                }

            } catch (error) {
                console.error('Import Error:', error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                importMessage.innerHTML = `<div class="alert alert-danger shadow-sm">
                    <i class="bi bi-wifi-off"></i> Network Error. Server se connect nahi ho pa raha hai. Please try again.
                </div>`;
            }
        });
    }
// new for email

    // File: src/public/js/import.js (Naya code add karein)

document.addEventListener('DOMContentLoaded', () => {
    // ... (Existing importForm listener code - UNCHANGED)
    // ... (Existing importForm listener code - UNCHANGED)

    // --- NEW LOGIC: NGO Invitation Import Handler ---
    const ngoImportForm = document.getElementById('ngoImportForm'); 
    const importMessage = document.getElementById('import-message'); // Reuse existing message div

    if (ngoImportForm) {
        ngoImportForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(ngoImportForm);
            
            const submitBtn = ngoImportForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending Invitations...';
            importMessage.innerHTML = `<div class="alert alert-info shadow-sm">File upload ho rahi hai aur invitations bhejey jaa rahe hain. Kripya wait karein...</div>`;
            
            try {
                // Fetch call to the new API endpoint
                const response = await fetch('/api/import/ngo-invitations', { 
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                if (response.ok) {
                    
                    let errorHtml = '';
                    
                    if (result.errors && result.errors.length > 0) {
                        errorHtml = `
                            <div class="mt-3 p-3 border rounded bg-light" style="max-height: 200px; overflow-y: auto;">
                                <strong class="text-danger d-block mb-2">Failed Invitations Details:</strong>
                                <ul class="text-danger small mb-0 ps-3">
                                    ${result.errors.map(err => `<li>${err}</li>`).join('')}
                                </ul>
                            </div>`;
                    }

                    const alertClass = result.errorCount > 0 ? 'warning' : 'success';
                    const iconClass = result.errorCount > 0 ? 'exclamation-triangle-fill' : 'check-circle-fill';

                    importMessage.innerHTML = `
                        <div class="alert alert-${alertClass} alert-dismissible fade show shadow-sm" role="alert">
                            <h5 class="alert-heading"><i class="bi bi-${iconClass}"></i> Invitation Process Completed!</h5>
                            <hr>
                            <div class="row">
                                <div class="col-md-6">
                                    <p class="mb-0 text-success fw-bold">
                                        <i class="bi bi-check-lg"></i> Successfully Sent: ${result.successCount}
                                    </p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-0 text-danger fw-bold">
                                        <i class="bi bi-x-lg"></i> Failed to Send: ${result.errorCount}
                                    </p>
                                </div>
                            </div>
                            ${errorHtml}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                    
                    if (result.successCount > 0) {
                        ngoImportForm.reset(); // Reset form on success
                    }

                } else {
                    importMessage.innerHTML = `<div class="alert alert-danger shadow-sm">
                        <i class="bi bi-exclamation-octagon-fill"></i> Error: ${result.message || 'An unknown error occurred during import.'}
                    </div>`;
                }

            } catch (error) {
                console.error('NGO Import Error:', error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                importMessage.innerHTML = `<div class="alert alert-danger shadow-sm">
                    <i class="bi bi-wifi-off"></i> Network Error. Server se connect nahi ho pa raha hai. Please try again.
                </div>`;
            }
        });
    }
});
});