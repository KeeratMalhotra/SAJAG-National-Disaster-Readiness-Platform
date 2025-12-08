// document.addEventListener('DOMContentLoaded', () => {

//     const registerForm = document.getElementById('registerForm');
//     const loginForm = document.getElementById('loginForm');
//     const messageDiv = document.getElementById('message');

//     // --- REGISTRATION FORM LOGIC (MORE ROBUST) ---
//     if (registerForm) {
//         registerForm.addEventListener('submit', async (event) => {
//             event.preventDefault();
//             if (messageDiv) messageDiv.innerHTML = '';

//             const formData = new FormData(registerForm);
            
//             try {
//                 const response = await fetch('/api/auth/register', {
//                     method: 'POST',
//                     body: formData
//                 });

//                 if (!response.ok) {
//                     let errorMessage = 'Registration failed. Please check your details.'; // Default error message
//                     try {
//                         // Try to get a specific message from the server, but don't fail if it's not JSON
//                         const errorResult = await response.json();
//                         if (errorResult && errorResult.message) {
//                             errorMessage = errorResult.message;
//                         }
//                     } catch (e) {
//                         // This catch runs if the error response body is empty or not valid JSON.
//                         // We will just proceed with the default message.
//                         console.log('Could not parse registration error response as JSON.');
//                     }
//                     messageDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
//                     return;
//                 }

//                 // Success case
//                 const result = await response.json();
//                 messageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
//                 registerForm.reset();

//             } catch (networkError) {
//                 console.error('Registration network error:', networkError);
//                 messageDiv.innerHTML = `<div class="alert alert-danger">A network error occurred.</div>`;
//             }
//         });
//     }

//     // --- LOGIN FORM LOGIC (MORE ROBUST) ---
//     if (loginForm) {
//         loginForm.addEventListener('submit', async (event) => {
//             event.preventDefault();
//             if (messageDiv) messageDiv.innerHTML = '';

//             const formData = new FormData(loginForm);
//             const data = Object.fromEntries(formData.entries());

//             try {
//                 const response = await fetch('/api/auth/login', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(data)
//                 });

//                 if (!response.ok) {
//                     let errorMessage = 'Invalid email or password.'; // Default error message
//                     try {
//                         // Try to get a specific message from the server, but don't fail if it's not JSON
//                         const errorResult = await response.json();
//                         if (errorResult && errorResult.message) {
//                             errorMessage = errorResult.message;
//                         }
//                     } catch (e) {
//                         // This catch runs if the error response body is empty or not valid JSON.
//                         // We will just proceed with the default message.
//                         console.log('Could not parse login error response as JSON.');
//                     }
//                     messageDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
//                     return;
//                 }

//                 // Success case
//                 window.location.href = '/dashboard';

//             } catch (networkError) {
//                 console.error('Login network error:', networkError);
//                 messageDiv.innerHTML = `<div class="alert alert-danger">A network error occurred.</div>`;
//             }
//         });
//     }
// });


document.addEventListener('DOMContentLoaded', () => {

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    // --- REGISTRATION FORM LOGIC ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (messageDiv) messageDiv.innerHTML = '';

            const formData = new FormData(registerForm);
            
            // Optional: Show a loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Submitting...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    // Reset button state on error
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;

                    let errorMessage = 'Registration failed. Please check your details.'; 
                    try {
                        const errorResult = await response.json();
                        if (errorResult && errorResult.message) {
                            errorMessage = errorResult.message;
                        }
                    } catch (e) {
                        console.log('Could not parse registration error response as JSON.');
                    }
                    messageDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
                    return;
                }

                // --- SUCCESS CASE ---
                const result = await response.json();
                
                // 1. Hide the form so the user knows submission is done
                registerForm.style.display = 'none';

                // 2. Hide any other elements if necessary (like the "Already have an account?" links)
                const linksDiv = document.querySelector('.links');
                if(linksDiv) linksDiv.style.display = 'none';

                // 3. Show the Thank You message
                messageDiv.innerHTML = `
                    <div class="alert alert-success" style="text-align: center; padding: 2rem;">
                        <h3 style="margin-bottom: 1rem;">Thank You for Registering!</h3>
                        <p style="font-size: 1.1rem;">${result.message}</p>
                        <p style="margin-top: 1rem; color: #666;">Redirecting you to the login page...</p>
                    </div>
                `;

                // 4. Redirect to Login page after 3 seconds
                setTimeout(() => {
                    window.location.href = '/api/auth/login';
                }, 3000);

            } catch (networkError) {
                console.error('Registration network error:', networkError);
                messageDiv.innerHTML = `<div class="alert alert-danger">A network error occurred.</div>`;
                
                // Reset button state on network error
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // --- LOGIN FORM LOGIC (Unchanged) ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (messageDiv) messageDiv.innerHTML = '';

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    let errorMessage = 'Invalid email or password.';
                    try {
                        const errorResult = await response.json();
                        if (errorResult && errorResult.message) {
                            errorMessage = errorResult.message;
                        }
                    } catch (e) {
                        console.log('Could not parse login error response as JSON.');
                    }
                    messageDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
                    return;
                }

                window.location.href = '/dashboard';

            } catch (networkError) {
                console.error('Login network error:', networkError);
                messageDiv.innerHTML = `<div class="alert alert-danger">A network error occurred.</div>`;
            }
        });
    }
});