// --- Replace the entire content of this file with the code below ---

document.addEventListener('DOMContentLoaded', () => {
    const lookupCard = document.getElementById('lookupCard'); //
    if (lookupCard) {
        // Initial render of the form
        renderLookupForm(lookupCard);
    }
});

/**
 * Renders the initial email lookup form inside the lookupCard.
 */
function renderLookupForm(lookupCard) {
    // This HTML replaces what's inside the lookupCard
    lookupCard.innerHTML = `
        <form id="lookupForm">
            <div class="input-group">
                <input type="email" class="form-control form-control-md" name="email"
                    placeholder="Enter registered email..." required>
                <button class="btn btn-register btn-md" type="submit">
                    Get Results
                </button>
            </div>
        </form>
        <div id="lookupMessage" class="mt-2" style="font-size: 0.85rem;"></div>
    `;

    // Attach listener to the newly created form
    const lookupForm = document.getElementById('lookupForm');
    const lookupMessage = document.getElementById('lookupMessage');

    lookupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        lookupMessage.innerHTML = `<div class="alert alert-info">Checking for results...</div>`;
        const submitButton = lookupForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        const formData = new FormData(lookupForm);
        const data = Object.fromEntries(formData.entries());

        try {
            // Fetch from the new endpoint
            const response = await fetch('/api/participant/get-results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.submissions) {
                // Render the results
                renderLookupResults(lookupCard, result.submissions, data.email, result.message);
            } else {
                lookupMessage.innerHTML = `<div class="alert alert-danger">${result.message || 'An error occurred.'}</div>`;
                submitButton.disabled = false;
            }
        } catch (error) {
            lookupMessage.innerHTML = `<div class="alert alert-danger">A network error occurred. Please try again.</div>`;
            submitButton.disabled = false;
        }
    });
}

/**
 * Renders the results (or no-results message) inside the lookupCard.
 */
function renderLookupResults(lookupCard, submissions, email, message) {
    let resultsHtml = '';

    if (submissions.length === 0) {
        resultsHtml = `
            <div class="card-body text-center p-4">
                <h5 class="text-muted">No Results Found</h5>
                <p>${message}</p>
                <button id="checkAnotherBtn" class="btn btn-sm btn-outline-secondary mt-2">Check Another Email</button>
            </div>
        `;
    } else {
        resultsHtml = `
            <div class="card-body p-4">
                <h5 class="mb-3">Your Assessment Results</h5>
                <p class="text-muted small">Showing results for: ${email}</p>
                <ul class="list-group list-group-flush" style="max-height: 250px; overflow-y: auto;">
        `;
        
        submissions.forEach(sub => {
            const score = parseFloat(sub.score).toFixed(2);
            const date = new Date(sub.submitted_at).toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD
            resultsHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                    <div>
                        <strong class="d-block">${sub.training_title}</strong>
                        <small class="text-muted">Completed: ${date}</small>
                    </div>
                    <span class="badge bg-primary rounded-pill fs-6" style="min-width: 60px;">${score}%</span>
                </li>
            `;
        });
        
        resultsHtml += `
                </ul>
                <button id="checkAnotherBtn" class="btn btn-sm btn-outline-secondary mt-3">Check Another Email</button>
            </div>
        `;
    }
    
    lookupCard.innerHTML = resultsHtml;

    // Attach listener to the new "Check Another" button
    document.getElementById('checkAnotherBtn').addEventListener('click', () => {
        renderLookupForm(lookupCard);
    });
}