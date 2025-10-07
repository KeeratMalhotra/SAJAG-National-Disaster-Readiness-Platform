document.addEventListener('DOMContentLoaded', () => {
    // --- PART 1: FORM SUBMISSION LOGIC (Your existing code) ---
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
                    formMessage.innerHTML = `<div class="alert alert-success">${result.message}. Page will refresh.</div>`;
                    // Refresh the page to show the new announcement
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    formMessage.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
                }
            } catch (error) {
                formMessage.innerHTML = `<div class="alert alert-danger">A network error occurred.</div>`;
            }
        });
    }

    // --- PART 2: NEW FILTERING LOGIC ---
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const announcementCards = document.querySelectorAll('.announcement-card');

    let activeScope = 'all';
    let searchTerm = '';

    const filterAnnouncements = () => {
        announcementCards.forEach(card => {
            const scope = card.dataset.scope;
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const content = card.querySelector('.card-body p').textContent.toLowerCase();

            const scopeMatch = activeScope === 'all' || scope === activeScope;
            const searchMatch = title.includes(searchTerm) || content.includes(searchTerm);

            if (scopeMatch && searchMatch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    };

    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            filterAnnouncements();
        });
    }

    // Filter button listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button style
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter
            activeScope = button.dataset.scope;
            filterAnnouncements();
        });
    });
});