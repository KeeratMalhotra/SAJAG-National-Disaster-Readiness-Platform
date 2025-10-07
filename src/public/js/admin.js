document.addEventListener('DOMContentLoaded', () => {
    // Look for the new container ID instead of the old table ID
    const container = document.getElementById('pending-list-container');

    if (container) {
        container.addEventListener('click', async (event) => {
            // Find the closest button if an icon inside it was clicked
            const button = event.target.closest('.update-status-btn');

            if (button) { // If a button was clicked
                const userId = button.dataset.userid;
                const status = button.dataset.status;
                const actionText = status === 'active' ? 'approve' : 'reject';

                if (confirm(`Are you sure you want to ${actionText} this user?`)) {
                    try {
                        const response = await fetch(`/api/admin/partners/${userId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: status })
                        });

                        if (response.ok) {
                            // On success, remove the card from the list
                            document.getElementById(`user-row-${userId}`).remove();
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