document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('pending-partners-table');

    if (table) {
        table.addEventListener('click', async (event) => {
            if (event.target.classList.contains('update-status-btn')) {
                const button = event.target;
                const userId = button.dataset.userid;
                const status = button.dataset.status;

                if (confirm(`Are you sure you want to ${status} this user?`)) {
                    try {
                        const response = await fetch(`/api/admin/partners/${userId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: status })
                        });

                        if (response.ok) {
                            // On success, remove the row from the table
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