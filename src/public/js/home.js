document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Animated Stats Counter on Scroll
    const statsBanner = document.querySelector('.stats-banner-section');
    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                document.querySelectorAll('.stat-number').forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    
                    anime({
                        targets: counter,
                        innerText: [0, target],
                        round: 1,
                        easing: 'easeInOutQuad',
                        duration: 2000,
                        update: function(anim) {
                            counter.innerHTML = `${Math.round(anim.animations[0].currentValue).toLocaleString()}+`;
                        }
                    });
                });
                hasAnimated = true;
                observer.unobserve(statsBanner);
            }
        });
    }, { threshold: 0.5 });

    if(statsBanner) {
        observer.observe(statsBanner);
    }
    
    // 2. Scroll-triggered animations for other sections
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Apply animation to new learn cards
    document.querySelectorAll('.learn-card-wrapper').forEach(card => {
        scrollObserver.observe(card);
    });

    // 3. Navbar background change on scroll
    const navbar = document.getElementById('sajagNavbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

});