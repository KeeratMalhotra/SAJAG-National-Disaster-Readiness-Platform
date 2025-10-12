document.addEventListener('DOMContentLoaded', () => {
    // Find the main container that holds ALL the tab content
    const tabContent = document.getElementById('partnerTabsContent');

    if (tabContent) {
        // Attach a single, smart event listener to the parent container
        tabContent.addEventListener('click', async (event) => {
            
            // Check if the click happened on a button with the correct class
            const actionButton = event.target.closest('.update-status-btn');

            if (actionButton) {
                const userId = actionButton.dataset.userid;
                const status = actionButton.dataset.status;
                
                // --- THIS IS THE CORRECTED LINE ---
                // It now looks for either .partner-name OR .partner-name-link
                const userName = actionButton.closest('.partner-card').querySelector('.partner-name, .partner-name-link').textContent.trim();
                
                let confirmationMessage = `Are you sure you want to ${status} the user "${userName}"?`;
                if (status === 'rejected') {
                    confirmationMessage = `Are you sure you want to discontinue this partner: "${userName}"? Their status will be set to 'rejected'.`;
                } else if (status === 'active') {
                    confirmationMessage = `Are you sure you want to re-approve this partner: "${userName}"?`;
                }

                if (confirm(confirmationMessage)) {
                    try {
                        const response = await fetch(`/api/admin/partners/${userId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: status })
                        });

                        const result = await response.json();

                        if (response.ok) {
                            // On success, simply reload the page to show the user in the correct tab
                            window.location.reload();
                        } else {
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

