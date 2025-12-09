document.addEventListener('DOMContentLoaded', () => {
    const assessmentForm = document.getElementById('assessmentForm');

    if (assessmentForm) {
        assessmentForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(assessmentForm);
            
            // Prepare the data for submission
            const submissionData = {
                assessmentId: formData.get('assessmentId'),
                trainingId: formData.get('trainingId'),
                participantEmail: formData.get('participantEmail'), // Get email separately
                answers: {}
            };

            // Collect only the question answers
            for (let [key, value] of formData.entries()) {
                // Check if the key is a UUID (i.e., a question ID)
                if (key.length > 30) { // A simple way to identify UUIDs vs other fields
                    submissionData.answers[key] = value;
                }
            }

            try {
                const response = await fetch('/api/assessments/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(submissionData)
                });

                const result = await response.json();

                if (response.ok) {
                    // If successful, display the results
                    displayResults(result);
                } else {
                    alert(`Error: ${result.message}`);
                }

            } catch (error) {
                console.error('Error submitting assessment:', error);
                alert('A network error occurred.');
            }
        });
    }
});

function displayResults(result) {
    const assessmentCard = document.getElementById('assessmentCard');
    
    // Check if eligible for certificate
    let certificateHtml = '';
    if (result.score >= 60 && result.submissionId) {
        certificateHtml = `
            <div class="mt-4">
                <div class="alert alert-success">🎉 Congratulations! You have passed.</div>
                <a href="/assessment/certificate/${result.submissionId}" class="btn btn-success btn-lg">
                    <i class="fas fa-file-download"></i> Download Certificate
                </a>
            </div>
        `;
    } else {
        certificateHtml = `
            <div class="mt-4">
                <div class="alert alert-warning">You need 60% to earn a certificate. Keep learning!</div>
            </div>
        `;
    }

    assessmentCard.innerHTML = `
        <div class="card-header">
            <h2>Assessment Results</h2>
        </div>
        <div class="card-body text-center">
            <h3 class="card-title">You Scored</h3>
            <p class="display-1 fw-bold text-primary">${parseFloat(result.score).toFixed(1)}%</p>
            <p class="lead">You answered ${result.correctAnswers || 'some'} questions correctly.</p>
            
            ${certificateHtml}

            <a href="/dashboard" class="btn btn-secondary mt-3">Back to Dashboard</a>
        </div>
    `;
}