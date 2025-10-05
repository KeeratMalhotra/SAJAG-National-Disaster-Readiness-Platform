// Wait for the HTML document to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm'); // Get the login form
    const messageDiv = document.getElementById('message');

    // --- REGISTRATION FORM LOGIC ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Create a FormData object directly from the form
            // This will include all text fields AND the selected file
            const formData = new FormData(registerForm);
            
            try {
                // When sending FormData, DO NOT set the Content-Type header.
                // The browser will do it for you automatically.
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    body: formData // Send the FormData object directly
                });

                const result = await response.json();

                if (response.ok) {
                    messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
                    registerForm.reset();
                } else {
                    messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
                }
            } catch (error) {
                console.error('Registration error:', error);
                messageDiv.innerHTML = `<div class="alert alert-danger">A network error occurred.</div>`;
            }
        });
    }

    // --- LOGIN FORM LOGIC (NEW CODE) ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok) {
                    // On successful login, redirect to the dashboard
                    window.location.href = '/dashboard'; 
                } else {
                    messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
                }
            } catch (error) {
                messageDiv.innerHTML = `<div class="alert alert-danger">A network error occurred.</div>`;
            }
        });
    }
});