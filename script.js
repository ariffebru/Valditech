/**
 * ValdiTech Interactive Features
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navigation
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('nav-open');
        });
    }

    // Reset mobile menu class on resize ke desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks) {
            navLinks.classList.remove('nav-open');
        }
    });

    // 5a. Product Dropdown Toggle
    const productDropdown = document.getElementById('product-dropdown');
    const productBtn = productDropdown?.querySelector('.nav-dropdown-btn');

    // Open / close on button click
    productBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = productDropdown.classList.toggle('open');
        productBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when an item inside the dropdown is clicked
    productDropdown?.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            productDropdown.classList.remove('open');
            productBtn?.setAttribute('aria-expanded', 'false');
        });
    });

    // Close when clicking anywhere else on the page
    document.addEventListener('click', (e) => {
        if (!productDropdown?.contains(e.target)) {
            productDropdown?.classList.remove('open');
            productBtn?.setAttribute('aria-expanded', 'false');
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            productDropdown?.classList.remove('open');
            productBtn?.setAttribute('aria-expanded', 'false');
        }
    });

    // 3. Simple Tab Switching Logic (Certifications Section)
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');

            // In a real app, you would also filter the course cards here
            // based on the selected tab category.
        });
    });

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 5. Canvas Wave Animation — Hero Background
    initWaveAnimation('hero-wave-canvas');
    initWaveAnimation('solutions-wave-canvas');
});

/**
 * Draws animated flowing wave lines on a canvas overlay in the hero section.
 * Inspired by the reference image: dark navy/teal bg with pink/purple wave lattice.
 */
function initWaveAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Resize canvas to fill parent
    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const WAVE_COUNT = 22;       // number of horizontal wave lines
    const SPEED = 0.0006;        // animation speed
    const AMPLITUDE_BASE = 90;   // base amplitude in px
    let time = 0;

    // Each wave has slightly different frequency / phase / amplitude / color
    const waves = Array.from({ length: WAVE_COUNT }, (_, i) => {
        const t = i / (WAVE_COUNT - 1);          // 0 → 1
        // Color: interpolate from hot-pink (#e040fb) to violet (#7c3aed)
        const r = Math.round(224 - (224 - 124) * t);
        const g = Math.round(64 + (58 - 64) * t);
        const b = Math.round(251 - (251 - 237) * t);

        return {
            freqX: 1.2 + t * 1.5,           // spatial frequency multiplier
            freqY: 0.6 + t * 0.8,
            phaseX: (i * 0.45),              // phase offset
            phaseY: (i * 0.3),
            amplitude: AMPLITUDE_BASE * (0.4 + (1 - Math.abs(t - 0.5) * 2) * 0.6),
            color: `rgba(${r},${g},${b},`,
            opacity: 0.55 - Math.abs(t - 0.5) * 0.3,
        };
    });

    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += SPEED;

        const w = canvas.width;
        const h = canvas.height;
        const STEPS = 250; // path resolution

        waves.forEach((wave, wi) => {
            ctx.beginPath();

            for (let s = 0; s <= STEPS; s++) {
                const px = (s / STEPS) * w;
                // Vertical distribution: spread waves across the canvas
                const baseY = h * (0.15 + (wi / (WAVE_COUNT - 1)) * 0.75);

                // Multi-sine displacement
                const dy =
                    wave.amplitude *
                    Math.sin(wave.freqX * (s / STEPS) * Math.PI * 2 + time * 3.5 + wave.phaseX) *
                    Math.cos(wave.freqY * (s / STEPS) * Math.PI + time * 2.1 + wave.phaseY);

                const py = baseY + dy;

                if (s === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }

            ctx.strokeStyle = `${wave.color}${wave.opacity})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
        });

        requestAnimationFrame(drawFrame);
    }

    drawFrame();
}

