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
                answers: {}
            };

            // Collect the selected answers
            for (let [key, value] of formData.entries()) {
                if (key !== 'assessmentId' && key !== 'trainingId') {
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
    assessmentCard.innerHTML = `
        <div class="card-header">
            <h2>Assessment Results</h2>
        </div>
        <div class="card-body text-center">
            <h3 class="card-title">You Scored</h3>
            <p class="display-1 fw-bold text-primary">${result.score}%</p>
            <p class="lead">You answered ${result.correctAnswers} out of ${result.totalQuestions} questions correctly.</p>
            <a href="/dashboard" class="btn btn-secondary mt-3">Back to Dashboard</a>
        </div>
    `;
}