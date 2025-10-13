// // public/js/learn-animations.js - REFINED FOR LIGHT THEME

// document.addEventListener('DOMContentLoaded', () => {

//     // Observer for triggering animations as sections scroll into view
//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 // Add 'in-view' class to the section to trigger CSS transitions
//                 entry.target.classList.add('in-view');
                
//                 // Use anime.js to choreograph the text and card animations
//                 const timeline = anime.timeline({
//                     easing: 'easeOutExpo',
//                     duration: 1200
//                 });

//                 timeline
//                     .add({
//                         targets: entry.target.querySelectorAll('.anim-slide-up'),
//                         translateY: [50, 0],
//                         opacity: [0, 1],
//                         delay: anime.stagger(150)
//                     })
//                     .add({
//                         targets: entry.target.querySelector('.anim-card-in'),
//                         translateY: [30, 0],
//                         opacity: [0, 1],
//                     }, '-=800'); // Overlap animations for a fluid feel

//                 // Unobserve after animation to prevent re-triggering
//                 observer.unobserve(entry.target);
//             }
//         });
//     }, {
//         threshold: 0.35 // Trigger when 35% of the section is visible
//     });

//     // Observe all sections
//     const sections = document.querySelectorAll('.disaster-section');
//     sections.forEach(section => {
//         observer.observe(section);
//     });
// });

// public/js/learn-animations.js - FOCUS + TRANSLUCENT SECTIONS

document.addEventListener('DOMContentLoaded', () => {

    const sections = document.querySelectorAll('.disaster-section');

    // Observer for triggering animations as sections scroll into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {

                // Add in-view for active section
                entry.target.classList.add('in-view');

                // Make other sections translucent
                sections.forEach(s => {
                    if (s !== entry.target) s.style.opacity = 0.3;
                    else s.style.opacity = 1;
                });

                // Use anime.js for animations (text/cards)
                const timeline = anime.timeline({
                    easing: 'easeOutExpo',
                    duration: 1200
                });

                timeline
                    .add({
                        targets: entry.target.querySelectorAll('.anim-slide-up'),
                        translateY: [50, 0],
                        opacity: [0, 1],
                        delay: anime.stagger(150)
                    })
                    .add({
                        targets: entry.target.querySelector('.anim-card-in'),
                        translateY: [30, 0],
                        opacity: [0, 1],
                    }, '-=800');

                // Unobserve after animation to prevent repeat
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.35 // Trigger when 35% of section is visible
    });

    // Observe all sections
    sections.forEach(section => observer.observe(section));

});
