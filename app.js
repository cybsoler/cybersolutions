/* ============================================
   CyberSolutions Hub — Main JavaScript
   3D Scene, Animations, Interactions
   ============================================ */

// =============================================
// 1. PRELOADER
// =============================================
const hidePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('loaded');
};

window.addEventListener('load', () => {
    setTimeout(hidePreloader, window.innerWidth <= 768 ? 700 : 1400);
});

// Do not leave mobile visitors behind a loader if a third-party asset stalls.
setTimeout(hidePreloader, 3500);

// =============================================
// 2. THREE.JS — 3D PARTICLE BACKGROUND
// =============================================
(function init3DScene() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (prefersReducedMotion) {
        canvas.style.display = 'none';
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isSmallScreen });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmallScreen ? 1.25 : 2));

    camera.position.z = 30;

    // --- Floating Particle Field ---
    const particleCount = isSmallScreen ? 400 : 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalette = [
        new THREE.Color(0x6C63FF), // Purple
        new THREE.Color(0x00D4FF), // Cyan
        new THREE.Color(0xA855F7), // Violet
        new THREE.Color(0x4ECDC4), // Teal
        new THREE.Color(0xFF6B6B), // Coral
    ];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 2 + 0.5;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // --- Wireframe Geometry Shapes ---
    const geometries = [];

    // Rotating Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(4, 1);
    const icoMat = new THREE.MeshBasicMaterial({
        color: 0x6C63FF,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    icosahedron.position.set(18, 8, -15);
    scene.add(icosahedron);
    geometries.push(icosahedron);

    // Rotating Torus
    const torusGeo = new THREE.TorusGeometry(5, 1.5, 8, 24);
    const torusMat = new THREE.MeshBasicMaterial({
        color: 0x00D4FF,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(-20, -10, -20);
    scene.add(torus);
    geometries.push(torus);

    // Rotating Octahedron
    const octGeo = new THREE.OctahedronGeometry(3, 0);
    const octMat = new THREE.MeshBasicMaterial({
        color: 0xA855F7,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
    });
    const octahedron = new THREE.Mesh(octGeo, octMat);
    octahedron.position.set(-15, 12, -10);
    scene.add(octahedron);
    geometries.push(octahedron);

    // Rotating Dodecahedron
    const dodGeo = new THREE.DodecahedronGeometry(3.5, 0);
    const dodMat = new THREE.MeshBasicMaterial({
        color: 0x4ECDC4,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
    });
    const dodecahedron = new THREE.Mesh(dodGeo, dodMat);
    dodecahedron.position.set(15, -12, -18);
    scene.add(dodecahedron);
    geometries.push(dodecahedron);

    // --- Connection Lines between nearby particles ---
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0x6C63FF,
        transparent: true,
        opacity: 0.04,
    });

    const maxLineCount = isSmallScreen ? 0 : 300;
    const lineSampleCount = isSmallScreen ? 0 : 200;
    const linesGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxLineCount * 6);
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(lines);

    // Mouse tracking
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    if (hasFinePointer) {
        document.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    // Scroll tracking
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        if (document.hidden) return;

        const elapsed = clock.getElapsedTime();

        // Smooth mouse follow
        mouseX += (targetMouseX - mouseX) * 0.03;
        mouseY += (targetMouseY - mouseY) * 0.03;

        // Rotate particles
        particles.rotation.x = elapsed * 0.02 + mouseY * 0.1;
        particles.rotation.y = elapsed * 0.03 + mouseX * 0.1;

        // Animate individual particle positions
        const pos = particleGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const ix = i * 3;
            pos[ix + 1] += Math.sin(elapsed * 0.5 + i * 0.01) * 0.005;
        }
        particleGeometry.attributes.position.needsUpdate = true;

        // Rotate geometries
        icosahedron.rotation.x = elapsed * 0.3;
        icosahedron.rotation.y = elapsed * 0.2;
        icosahedron.position.y = 8 + Math.sin(elapsed * 0.5) * 2;

        torus.rotation.x = elapsed * 0.2;
        torus.rotation.z = elapsed * 0.15;
        torus.position.y = -10 + Math.cos(elapsed * 0.4) * 2;

        octahedron.rotation.x = elapsed * 0.4;
        octahedron.rotation.z = elapsed * 0.25;
        octahedron.position.y = 12 + Math.sin(elapsed * 0.6) * 1.5;

        dodecahedron.rotation.y = elapsed * 0.35;
        dodecahedron.rotation.z = elapsed * 0.2;
        dodecahedron.position.y = -12 + Math.cos(elapsed * 0.45) * 2;

        // Update connection lines
        let lineIndex = 0;
        const linePos = linesGeometry.attributes.position.array;
        const maxDist = 8;

        for (let i = 0; i < lineSampleCount && lineIndex < maxLineCount; i++) {
            for (let j = i + 1; j < lineSampleCount && lineIndex < maxLineCount; j++) {
                const dx = pos[i * 3] - pos[j * 3];
                const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDist) {
                    linePos[lineIndex * 6] = pos[i * 3];
                    linePos[lineIndex * 6 + 1] = pos[i * 3 + 1];
                    linePos[lineIndex * 6 + 2] = pos[i * 3 + 2];
                    linePos[lineIndex * 6 + 3] = pos[j * 3];
                    linePos[lineIndex * 6 + 4] = pos[j * 3 + 1];
                    linePos[lineIndex * 6 + 5] = pos[j * 3 + 2];
                    lineIndex++;
                }
            }
        }
        // Clear remaining
        for (let i = lineIndex; i < maxLineCount; i++) {
            linePos[i * 6] = 0;
            linePos[i * 6 + 1] = 0;
            linePos[i * 6 + 2] = 0;
            linePos[i * 6 + 3] = 0;
            linePos[i * 6 + 4] = 0;
            linePos[i * 6 + 5] = 0;
        }
        linesGeometry.attributes.position.needsUpdate = true;

        // Parallax camera based on scroll
        camera.position.y = -(scrollY * 0.005);
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();
})();

// =============================================
// 3. CUSTOM CURSOR
// =============================================
(function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    const supportsCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!dot || !ring || !supportsCustomCursor) return;

    let cursorX = 0, cursorY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        dot.style.left = cursorX + 'px';
        dot.style.top = cursorY + 'px';
    });

    function animateRing() {
        ringX += (cursorX - ringX) * 0.15;
        ringY += (cursorY - ringY) * 0.15;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Enlarge cursor on interactive elements
    const interactives = document.querySelectorAll('a, button, .service-card, .portfolio-card, .team-card, input, textarea, select');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.style.width = '12px';
            dot.style.height = '12px';
            dot.style.background = '#00D4FF';
            ring.style.width = '52px';
            ring.style.height = '52px';
            ring.style.borderColor = 'rgba(0, 212, 255, 0.5)';
        });
        el.addEventListener('mouseleave', () => {
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.background = '#6C63FF';
            ring.style.width = '36px';
            ring.style.height = '36px';
            ring.style.borderColor = 'rgba(108, 99, 255, 0.5)';
        });
    });
})();

// =============================================
// 4. NAVIGATION
// =============================================
(function initNavigation() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const navLinks = document.querySelectorAll('.nav-link');

    const closeMobileMenu = () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const openMobileMenu = () => {
        toggle.classList.add('active');
        mobileMenu.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Mobile toggle
    if (toggle) {
        toggle.addEventListener('click', () => {
            if (mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Close mobile on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    mobileMenu.addEventListener('click', (event) => {
        if (event.target === mobileMenu) closeMobileMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
            toggle.focus();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
})();

// =============================================
// 5. STAT COUNTER ANIMATION
// =============================================
(function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    let animated = false;

    function animateStats() {
        if (animated) return;

        const heroSection = document.querySelector('.hero-stats');
        if (!heroSection) return;

        const rect = heroSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            animated = true;

            stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                const duration = 2000;
                const start = performance.now();

                function updateCount(currentTime) {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    stat.textContent = Math.round(target * eased);

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    }
                }

                requestAnimationFrame(updateCount);
            });
        }
    }

    window.addEventListener('scroll', animateStats);
    animateStats(); // Check on load
})();

// =============================================
// 6. SCROLL REVEAL ANIMATIONS
// =============================================
(function initScrollReveal() {
    const revealElements = [
        ...document.querySelectorAll('.section-header'),
        ...document.querySelectorAll('.about-card'),
        ...document.querySelectorAll('.service-card'),
        ...document.querySelectorAll('.process-step'),
        ...document.querySelectorAll('.portfolio-card'),
        ...document.querySelectorAll('.team-card'),
        ...document.querySelectorAll('.contact-info-card'),
        ...document.querySelectorAll('.contact-form'),
        ...document.querySelectorAll('.cta-card'),
        ...document.querySelectorAll('.testimonial-card'),
    ];

    revealElements.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${(i % 6) * 0.08}s`;
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach(el => observer.observe(el));

    // Process steps special animation
    const processSteps = document.querySelectorAll('.process-step');
    const processObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.3 }
    );

    processSteps.forEach(step => processObserver.observe(step));
})();

// =============================================
// 7. TESTIMONIAL CAROUSEL
// =============================================
(function initTestimonials() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    let currentIndex = 0;
    let interval;

    function showTestimonial(index) {
        cards.forEach((card, i) => {
            card.classList.remove('active');
            card.style.transform = i < index ? 'translateX(-60px)' : 'translateX(60px)';
        });
        dots.forEach(dot => dot.classList.remove('active'));

        cards[index].classList.add('active');
        cards[index].style.transform = 'translateX(0)';
        dots[index].classList.add('active');
    }

    function nextTestimonial() {
        currentIndex = (currentIndex + 1) % cards.length;
        showTestimonial(currentIndex);
    }

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentIndex = i;
            showTestimonial(currentIndex);
            clearInterval(interval);
            interval = setInterval(nextTestimonial, 5000);
        });
    });

    interval = setInterval(nextTestimonial, 5000);
})();

// =============================================
// 8. CONTACT FORM
// =============================================
(function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const btn = form.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('span');
    const status = document.getElementById('contactFormStatus');
    const originalText = btnText.textContent;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        btnText.textContent = 'Sending...';
        btn.disabled = true;
        btn.style.opacity = '0.7';
        status.textContent = 'Sending your message...';
        status.className = 'form-status';

        try {
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData);
            delete payload.redirect;

            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || 'Unable to send your message.');
            }

            btnText.textContent = 'Message Sent!';
            btn.style.background = 'linear-gradient(135deg, #4ECDC4, #44CF6C)';
            status.textContent = 'Thank you! Your message has been sent successfully.';
            status.className = 'form-status form-status-success';
            form.reset();
        } catch (error) {
            console.error('Contact form submission failed:', error);
            btnText.textContent = 'Try Again';
            status.textContent = error.message || 'Something went wrong. Please try again or email us directly.';
            status.className = 'form-status form-status-error';
        } finally {
            btn.disabled = false;
            btn.style.opacity = '1';
            setTimeout(() => {
                btnText.textContent = originalText;
                btn.style.background = '';
            }, 3000);
        }
    });
})();

// =============================================
// 9. SMOOTH SCROLL
// =============================================
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
})();

// =============================================
// 10. TILT EFFECT ON SERVICE CARDS
// =============================================
(function initTiltEffect() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const cards = document.querySelectorAll('.service-card, .portfolio-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / centerY * -4;
            const rotateY = (x - centerX) / centerX * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
})();

// =============================================
// 11. PARALLAX EFFECT ON SECTIONS
// =============================================
(function initParallax() {
    if (window.innerWidth <= 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroContent = document.querySelector('.hero-content');

        if (heroContent) {
            const heroRect = heroContent.getBoundingClientRect();
            if (heroRect.bottom > 0) {
                heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
                heroContent.style.opacity = Math.max(1 - scrolled / 800, 0);
            }
        }
    });
})();

// =============================================
// 12. MAGNETIC BUTTON EFFECT
// =============================================
(function initMagneticButtons() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const btns = document.querySelectorAll('.btn-primary, .nav-cta');

    btns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
})();

// =============================================
// 13. TEXT SCRAMBLE EFFECT (Section Tags)
// =============================================
(function initTextScramble() {
    if (window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#_____';
            this.update = this.update.bind(this);
        }

        setText(newText) {
            const oldText = this.el.textContent;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise(resolve => this.resolve = resolve);
            this.queue = [];

            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 20);
                const end = start + Math.floor(Math.random() * 20);
                this.queue.push({ from, to, start, end });
            }

            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }

        update() {
            let output = '';
            let complete = 0;

            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];

                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.chars[Math.floor(Math.random() * this.chars.length)];
                        this.queue[i].char = char;
                    }
                    output += char;
                } else {
                    output += from;
                }
            }

            this.el.textContent = output;

            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
    }

    // Apply scramble to section tags on scroll
    const tags = document.querySelectorAll('.section-tag');
    const tagObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent;
                const scramble = new TextScramble(entry.target);
                scramble.setText(text);
                tagObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    tags.forEach(tag => tagObserver.observe(tag));
})();

// =============================================
// 14. FLOATING GRADIENT ORB BEHIND CURSOR
// =============================================
(function initGradientOrb() {
    if (window.innerWidth < 768) return;

    const orb = document.createElement('div');
    orb.style.cssText = `
        position: fixed;
        width: 500px;
        height: 500px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(108, 99, 255, 0.08) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
        transform: translate(-50%, -50%);
        transition: left 0.8s cubic-bezier(0.16, 1, 0.3, 1), top 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    document.body.appendChild(orb);

    document.addEventListener('mousemove', (e) => {
        orb.style.left = e.clientX + 'px';
        orb.style.top = e.clientY + 'px';
    });
})();

// =============================================
// 15. TYPING EFFECT FOR HERO
// =============================================
(function initTypingEffect() {
    const badge = document.querySelector('.hero-badge span:last-child');
    if (!badge) return;

    if (window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const originalText = badge.textContent;
    badge.textContent = '';

    setTimeout(() => {
        let i = 0;
        const typingInterval = setInterval(() => {
            badge.textContent += originalText[i];
            i++;
            if (i === originalText.length) {
                clearInterval(typingInterval);
            }
        }, 30);
    }, 2200); // After preloader
})();

console.log('%c🚀 CyberSolutions Hub', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #6C63FF, #00D4FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cBuilt with ❤️ by CyberSolutions Hub — Bhiwani & Jaipur', 'font-size: 12px; color: #888;');
