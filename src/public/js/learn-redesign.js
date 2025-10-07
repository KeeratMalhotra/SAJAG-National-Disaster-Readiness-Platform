document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.disaster-section');
    const navLinks = document.querySelectorAll('.disaster-nav a');

    // This function removes the 'active' class from all nav links
    const removeActiveLinks = () => {
        navLinks.forEach(link => link.classList.remove('active'));
    };

    const observerOptions = {
        root: null, // observes intersections relative to the viewport
        rootMargin: '0px',
        threshold: 0.8 // Trigger when 40% of the section is visible
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Add/remove 'is-active' class for animations
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');

                // Update the active state in the sticky navigation
                const currentId = entry.target.id;
                removeActiveLinks();
                const activeLink = document.querySelector(`.disaster-nav a[href="#${currentId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }

            } else {
                // Remove class when it goes out of view to allow re-animation
                entry.target.classList.remove('is-active');
            }
        });
    }, observerOptions);

    // Observe each disaster section
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});
