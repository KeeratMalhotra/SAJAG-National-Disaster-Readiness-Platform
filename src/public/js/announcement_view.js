document.addEventListener('DOMContentLoaded', () => {
    // --- 1. MARKDOWN CONVERSION (Your existing code) ---
    const converter = new showdown.Converter();
    const announcementBodies = document.querySelectorAll('.announcement-card .card-body');

    announcementBodies.forEach(body => {
        // A small safety check to prevent errors if a <p> tag is missing
        const pTag = body.querySelector('p');
        if (pTag) {
            const rawMarkdown = pTag.textContent;
            const formattedHtml = converter.makeHtml(rawMarkdown);
            body.innerHTML = formattedHtml;
        }
    });

    // --- 2. DELETE BUTTON LOGIC (The new code) ---
    const announcementGrid = document.querySelector('.announcement-grid');
    if (announcementGrid) {
        announcementGrid.addEventListener('click', async (event) => {
            // Check if the click was on a delete button or its icon inside
            const deleteButton = event.target.closest('.delete-announcement-btn');
            
            if (deleteButton) {
                const announcementId = deleteButton.dataset.id;
                const card = deleteButton.closest('.announcement-card');

                if (confirm('Are you sure you want to permanently delete this announcement?')) {
                    try {
                        const response = await fetch(`/api/admin/announcements/${announcementId}`, {
                            method: 'DELETE'
                        });
                        
                        if (response.ok) {
                            // On success, smoothly fade out and remove the card
                            card.style.transition = 'opacity 0.5s ease';
                            card.style.opacity = '0';
                            setTimeout(() => card.remove(), 500);
                        } else {
                            const result = await response.json();
                            alert(`Error: ${result.message}`);
                        }
                    } catch (error) {
                        alert('A network error occurred.');
                    }
                }
            }
        });
    }
});
