// document.addEventListener('DOMContentLoaded', () => {
//     const sections = document.querySelectorAll('.disaster-section');
//     const navLinks = document.querySelectorAll('.disaster-nav a');

//     // This function removes the 'active' class from all nav links
//     const removeActiveLinks = () => {
//         navLinks.forEach(link => link.classList.remove('active'));
//     };

//     const observerOptions = {
//         root: null,
//         rootMargin: '0px',
//         threshold: 0.6 
//     };

//     const sectionObserver = new IntersectionObserver((entries, observer) => {
//         entries.forEach(entry => {
//             // Add/remove 'is-active' class for animations
//             if (entry.isIntersecting) {
//                 entry.target.classList.add('is-active');

//                 // Update the active state in the sticky navigation
//                 const currentId = entry.target.id;
//                 removeActiveLinks();
//                 const activeLink = document.querySelector(`.disaster-nav a[href="#${currentId}"]`);
//                 if (activeLink) {
//                     activeLink.classList.add('active');
//                 }

//             } else {
//                 // Remove class when it goes out of view to allow re-animation
//                 entry.target.classList.remove('is-active');
//             }
//         });
//     }, observerOptions);

//     // Observe each disaster section
//     sections.forEach(section => {
//         sectionObserver.observe(section);
//     });
// });


document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.disaster-section');
    const navLinks = document.querySelectorAll('.disaster-nav a');

    const removeActiveLinks = () => navLinks.forEach(link => link.classList.remove('active'));

    const updatePeek = (currentIndex) => {
        sections.forEach(sec => sec.classList.remove('peek', 'is-active'));
        // Previous and next peek
        if (sections[currentIndex - 1]) sections[currentIndex - 1].classList.add('peek');
        if (sections[currentIndex + 1]) sections[currentIndex + 1].classList.add('peek');
        // Current active
        sections[currentIndex].classList.add('is-active');
        // Nav links
        removeActiveLinks();
        const activeLink = document.querySelector(`.disaster-nav a[href="#${sections[currentIndex].id}"]`);
        if (activeLink) activeLink.classList.add('active');
    };

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.6 };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentIndex = Array.from(sections).indexOf(entry.target);
                updatePeek(currentIndex);
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // Handle nav clicks for instant peek effect
    navLinks.forEach((link, idx) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.querySelector(link.getAttribute('href'));
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            updatePeek(idx);
        });
    });

    // 🔹 Initial page load: make first section peeked (slightly blurred)
    if (sections.length > 0) {
        sections[0].classList.add('peek');
    }
});
