document.addEventListener('DOMContentLoaded', () => {
    const announcementForm = document.getElementById('announcementForm');
    const formMessage = document.getElementById('announcement-message');

    if (announcementForm) {
        announcementForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(announcementForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/admin/announcements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    formMessage.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
                    announcementForm.reset();
                } else {
                    formMessage.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
                }
            } catch (error) {
                formMessage.innerHTML = `<div class="alert alert-danger">A network error occurred.</div>`;
            }
        });
    }
});