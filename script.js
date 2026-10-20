/* ═══════════════════════════════════════════════════════════
   WEDDING INVITATION — MAIN SCRIPT
   GSAP Animations, Scroll Triggers, Interactions
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Force scroll to top on page load/refresh ─── */
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  /* ─── Wait for GSAP to load ─── */
  function onReady(callback) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      callback();
    } else {
      window.addEventListener('load', callback);
    }
  }

  onReady(function () {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /* ═══════════════════════════════════════════
       1. PRELOADER
    ═══════════════════════════════════════════ */
    const preloader = document.getElementById('preloader');
    const preloaderLine = preloader.querySelector('.preloader-line');
    const preloaderText = preloader.querySelector('.preloader-text');

    // Animate preloader elements
    requestAnimationFrame(() => {
      preloaderLine.classList.add('animate');
      preloaderText.classList.add('animate');
    });

    // Dismiss preloader after delay
    const dismissPreloader = () => {
      preloader.classList.add('fade-out');
      document.body.style.overflow = '';
      setTimeout(() => {
        preloader.style.display = 'none';
        animateHero();
        initNavDots();
      }, 800);
    };

    // Lock scroll during preload
    document.body.style.overflow = 'hidden';

    // Wait for fonts + minimum display time
    Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise(resolve => setTimeout(resolve, 2200))
    ]).then(dismissPreloader);

    /* ═══════════════════════════════════════════
       2. PARTICLE CANVAS (Ambient Background)
    ═══════════════════════════════════════════ */
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.1,
          // Gold or emerald tinted
          color: Math.random() > 0.5
            ? `rgba(201, 168, 76, ${Math.random() * 0.4 + 0.1})`
            : `rgba(20, 160, 110, ${Math.random() * 0.3 + 0.05})`
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Move
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      // Draw subtle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(201, 168, 76, ${0.03 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        createParticles();
      }, 250);
    });

    /* ═══════════════════════════════════════════
       3. HERO SECTION ANIMATION
    ═══════════════════════════════════════════ */
    function animateHero() {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-pre-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1 }
      )
      .fromTo('.hero-name--groom',
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 1.2 },
        '-=0.5'
      )
      .fromTo('.hero-amp',
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.8 },
        '-=0.7'
      )
      .fromTo('.hero-name--bride',
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, duration: 1.2 },
        '-=0.6'
      )
      .fromTo('.hero-divider',
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.8 },
        '-=0.5'
      )
      .fromTo('.hero-tagline',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.4'
      )
      .fromTo('.hero-date',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.6'
      )
      .fromTo('.scroll-indicator',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.4'
      );
    }

    /* ═══════════════════════════════════════════
       4. SCROLL PROGRESS BAR
    ═══════════════════════════════════════════ */
    const scrollProgress = document.getElementById('scroll-progress');

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + '%';
    }, { passive: true });

    /* ═══════════════════════════════════════════
       5. NAVIGATION DOTS
    ═══════════════════════════════════════════ */
    const navDots = document.getElementById('nav-dots');
    const dots = document.querySelectorAll('.nav-dot');
    const sections = document.querySelectorAll('.section');

    function initNavDots() {
      // Show nav dots after hero
      ScrollTrigger.create({
        trigger: '#invitation',
        start: 'top 80%',
        onEnter: () => navDots.classList.add('visible'),
        onLeaveBack: () => navDots.classList.remove('visible')
      });

      // Click handlers
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          const target = dot.getAttribute('data-target');
          gsap.to(window, {
            scrollTo: { y: target, offsetY: 0 },
            duration: 1.2,
            ease: 'power2.inOut'
          });
        });
      });

      // Active state tracking
      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveDot(index),
          onEnterBack: () => setActiveDot(index)
        });
      });
    }

    function setActiveDot(index) {
      dots.forEach(d => d.classList.remove('active'));
      if (dots[index]) dots[index].classList.add('active');
    }

    /* ═══════════════════════════════════════════
       6. INVITATION SECTION ANIMATION
    ═══════════════════════════════════════════ */
    gsap.fromTo('#invitation .section-ornament',
      { opacity: 0, y: 20 },
      {
        opacity: 0.7, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '#invitation', start: 'top 75%', toggleActions: 'play none none reverse' }
      }
    );

    gsap.fromTo('.invitation-title',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '#invitation', start: 'top 70%', toggleActions: 'play none none reverse' }
      }
    );

    gsap.fromTo('.invitation-text',
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2,
        scrollTrigger: { trigger: '.invitation-text', start: 'top 80%', toggleActions: 'play none none reverse' }
      }
    );

    gsap.fromTo('.invitation-signature',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.8, delay: 0.4,
        scrollTrigger: { trigger: '.invitation-signature', start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );

    /* ═══════════════════════════════════════════
       7. TIMELINE / OUR STORY ANIMATIONS
       (Disabled — Story section removed from HTML)
    ═══════════════════════════════════════════ */

    /* ═══════════════════════════════════════════
       8. EVENT CARDS — STAGGERED ENTRANCE
    ═══════════════════════════════════════════ */
    gsap.fromTo('#events .section-title',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1,
        scrollTrigger: { trigger: '#events', start: 'top 70%', toggleActions: 'play none none reverse' }
      }
    );

    gsap.fromTo('.event-card',
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.events-grid',
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    /* ═══════════════════════════════════════════
       9. VENUE SECTION ANIMATION
    ═══════════════════════════════════════════ */
    if (window.innerWidth <= 768) {
      // Mobile: gentle vertical fade (no horizontal slide — clashes with snap)
      gsap.fromTo('.venue-info',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#venue', start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      );
      gsap.fromTo('.venue-map',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3,
          scrollTrigger: { trigger: '#venue', start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      );
    } else {
      // Desktop: horizontal slide-in
      gsap.fromTo('.venue-info',
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.venue-content', start: 'top 75%', toggleActions: 'play none none reverse' }
        }
      );
      gsap.fromTo('.venue-map',
        { opacity: 0, x: 50 },
        {
          opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.2,
          scrollTrigger: { trigger: '.venue-content', start: 'top 75%', toggleActions: 'play none none reverse' }
        }
      );
    }

    /* ═══════════════════════════════════════════
       10. GALLERY ANIMATIONS
       (Disabled — Gallery section removed from HTML)
    ═══════════════════════════════════════════ */

    /* ═══════════════════════════════════════════
       11. COUNTDOWN TIMER
    ═══════════════════════════════════════════ */
    const weddingDate = new Date('2026-06-07T17:00:00');
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMinutes = document.getElementById('cd-minutes');
    const cdSeconds = document.getElementById('cd-seconds');

    function updateCountdown() {
      const now = new Date();
      const diff = weddingDate - now;

      if (diff <= 0) {
        cdDays.textContent = '000';
        cdHours.textContent = '00';
        cdMinutes.textContent = '00';
        cdSeconds.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      // Animate digit changes
      animateDigit(cdDays, String(days).padStart(3, '0'));
      animateDigit(cdHours, String(hours).padStart(2, '0'));
      animateDigit(cdMinutes, String(minutes).padStart(2, '0'));
      animateDigit(cdSeconds, String(seconds).padStart(2, '0'));
    }

    const isMobile = window.innerWidth <= 768;

    function animateDigit(el, newVal) {
      if (el.textContent !== newVal) {
        if (isMobile) {
          // Simple update on mobile — no opacity animation to avoid conflicts
          el.textContent = newVal;
        } else {
          gsap.to(el, {
            y: -5,
            opacity: 0.5,
            duration: 0.15,
            ease: 'power2.in',
            onComplete: () => {
              el.textContent = newVal;
              gsap.fromTo(el,
                { y: 5, opacity: 0.5 },
                { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
              );
            }
          });
        }
      }
    }

    // Set initial values immediately (don't wait for animateDigit)
    (function setInitialCountdown() {
      const now = new Date();
      const diff = weddingDate - now;
      if (diff > 0) {
        cdDays.textContent = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(3, '0');
        cdHours.textContent = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
        cdMinutes.textContent = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
        cdSeconds.textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      }
    })();

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Countdown section animation (skip on mobile — handled by section fade)
    if (window.innerWidth > 768) {
      gsap.fromTo('.countdown-timer',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1,
          scrollTrigger: { trigger: '#countdown', start: 'top 70%', toggleActions: 'play none none reverse' }
        }
      );
    }

    /* ═══════════════════════════════════════════
       12. RSVP FORM
    ═══════════════════════════════════════════ */
    gsap.fromTo('.rsvp-form',
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '#rsvp', start: 'top 70%', toggleActions: 'play none none reverse' }
      }
    );

    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSubmit = document.getElementById('rsvp-submit');
    const rsvpSuccess = document.getElementById('rsvp-success');
    const rsvpAlready = document.getElementById('rsvp-already');
    const alreadyDetail = document.getElementById('already-detail');
    const rsvpUpdateBtn = document.getElementById('rsvp-update-btn');
    const RSVP_STORAGE_KEY = 'wedding_rsvp_submitted';

    // ─── Check if user has already submitted ───
    function checkExistingRsvp() {
      try {
        const stored = localStorage.getItem(RSVP_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          rsvpForm.style.display = 'none';
          rsvpAlready.hidden = false;
          const status = data.attendance === 'yes' ? 'Attending' : 'Not attending';
          alreadyDetail.textContent = `${data.name} — ${data.guests} guest(s) — ${status}`;
          return true;
        }
      } catch (_) { /* localStorage unavailable, allow submission */ }
      return false;
    }

    checkExistingRsvp();

    // ─── Allow user to update their response ───
    rsvpUpdateBtn.addEventListener('click', () => {
      try {
        const stored = JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY));
        if (stored) {
          document.getElementById('rsvp-name').value = stored.name || '';
          document.getElementById('rsvp-guests').value = stored.guests || '';
          const radio = rsvpForm.querySelector(`input[name="attendance"][value="${stored.attendance}"]`);
          if (radio) radio.checked = true;
        }
      } catch (_) { /* proceed with empty form */ }

      rsvpAlready.hidden = true;
      rsvpForm.style.display = '';
      rsvpSubmit.disabled = false;
      rsvpSubmit.querySelector('.btn-text').textContent = 'Update RSVP';

      gsap.fromTo(rsvpForm,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    });

    // ─── Show success state with animation ───
    function showSuccessState() {
      rsvpSubmit.classList.remove('loading');
      rsvpForm.style.display = 'none';
      rsvpSuccess.hidden = false;

      gsap.fromTo(rsvpSuccess,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo('.rsvp-success .success-icon',
        { scale: 0 },
        { scale: 1, duration: 0.6, ease: 'back.out(2)', delay: 0.2 }
      );
      gsap.fromTo('.rsvp-success-title',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: 'power3.out' }
      );
      gsap.fromTo('.rsvp-success-dua',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, delay: 0.7, ease: 'power3.out' }
      );
    }

    // ─── Form submission ───
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // If name field is focused and guests is empty, move to guests (iOS Go button triggers submit)
      const nameInput = document.getElementById('rsvp-name');
      const guestsInput = document.getElementById('rsvp-guests');
      
      if (document.activeElement === nameInput && !guestsInput.value) {
        guestsInput.focus();
        return;
      }
      if (document.activeElement === guestsInput) {
        guestsInput.blur();
        // Don't submit if attendance not chosen
        const attendance = rsvpForm.querySelector('input[name="attendance"]:checked');
        if (!attendance) return;
      }

      // Basic validation
      const name = nameInput.value.trim();
      const guests = guestsInput.value;
      const attendance = rsvpForm.querySelector('input[name="attendance"]:checked');

      if (!name || !guests || !attendance) {
        gsap.to(rsvpForm, {
          x: [-10, 10, -10, 10, 0],
          duration: 0.4,
          ease: 'power2.out'
        });
        return;
      }

      // Show loading
      rsvpSubmit.classList.add('loading');
      rsvpSubmit.disabled = true;

      // Submit to Netlify Forms
      const formData = new FormData(rsvpForm);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
      .then(response => {
        if (!response.ok) throw new Error('Submission failed');

        // Save to localStorage to prevent duplicate submissions
        try {
          localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify({
            name: name,
            guests: guests,
            attendance: attendance.value,
            submittedAt: new Date().toISOString()
          }));
        } catch (_) { /* localStorage full or unavailable */ }

        showSuccessState();
      })
      .catch(() => {
        rsvpSubmit.classList.remove('loading');
        rsvpSubmit.disabled = false;
        gsap.to(rsvpForm, {
          x: [-10, 10, -10, 10, 0],
          duration: 0.4,
          ease: 'power2.out'
        });
      });
    });

    // ─── Mobile keyboard fix: disable scroll-snap on focus ───
    (function() {
      var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      function scrollFormToTop() {
        // Instant scroll — no animation, no repeated attempts
        var formRect = rsvpForm.getBoundingClientRect();
        var targetY = window.pageYOffset + formRect.top - 10;
        window.scrollTo(0, targetY);
      }

      function enableKeyboardMode() {
        // Disable smooth scrolling for instant jump
        document.documentElement.style.setProperty('scroll-snap-type', 'none', 'important');
        document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
        document.documentElement.classList.add('keyboard-open');
      }

      function disableKeyboardMode() {
        document.documentElement.style.removeProperty('scroll-snap-type');
        document.documentElement.style.removeProperty('scroll-behavior');
        document.documentElement.classList.remove('keyboard-open');
      }

      // ─── Enter/Go/Next key moves to next field ───
      var nameInput = document.getElementById('rsvp-name');
      var guestsInput = document.getElementById('rsvp-guests');

      // Use both keydown and keyup + the submit event on the form for iOS
      function handleNameEnter(e) {
        if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
          e.preventDefault();
          e.stopPropagation();
          guestsInput.focus();
          return false;
        }
      }

      function handleGuestsEnter(e) {
        if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
          e.preventDefault();
          e.stopPropagation();
          guestsInput.blur();
          return false;
        }
      }

      nameInput.addEventListener('keydown', handleNameEnter, true);
      nameInput.addEventListener('keypress', handleNameEnter, true);
      guestsInput.addEventListener('keydown', handleGuestsEnter, true);
      guestsInput.addEventListener('keypress', handleGuestsEnter, true);

      // ─── Scroll form to top on focus ───
      var formInputs = rsvpForm.querySelectorAll('input[type="text"], input[type="number"]');
      formInputs.forEach(function(input) {
        input.addEventListener('focus', function() {
          enableKeyboardMode();
          // Instant scroll, no delay
          scrollFormToTop();
          // Re-scroll after keyboard appears (iOS pushes viewport)
          setTimeout(scrollFormToTop, 300);
        });
        input.addEventListener('blur', function() {
          setTimeout(function() {
            if (!rsvpForm.contains(document.activeElement) || document.activeElement === document.body) {
              disableKeyboardMode();
            }
          }, 200);
        });
      });

      // Also listen to visualViewport resize (works on iOS Safari 15+)
      if (window.visualViewport) {
        var lastHeight = window.visualViewport.height;
        window.visualViewport.addEventListener('resize', function() {
          var currentHeight = window.visualViewport.height;
          if (currentHeight < lastHeight && rsvpForm.contains(document.activeElement)) {
            scrollFormToTop();
          }
          lastHeight = currentHeight;
        });
      }
    })();

    // Ripple effect on buttons
    document.querySelectorAll('.btn-gold').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--ripple-x', x + '%');
        btn.style.setProperty('--ripple-y', y + '%');
      });
    });

    /* ═══════════════════════════════════════════
       13. CLOSING SECTION
    ═══════════════════════════════════════════ */
    gsap.fromTo('.closing-ornament',
      { opacity: 0 },
      {
        opacity: 1, duration: 1,
        scrollTrigger: { trigger: '#closing', start: 'top 70%', toggleActions: 'play none none reverse' }
      }
    );

    gsap.fromTo('.closing-title',
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '#closing', start: 'top 70%', toggleActions: 'play none none reverse' }
      }
    );

    gsap.fromTo('.closing-text',
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 1, delay: 0.2,
        scrollTrigger: { trigger: '.closing-text', start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );

    gsap.fromTo('.closing-quote',
      { opacity: 0 },
      {
        opacity: 1, duration: 1, delay: 0.4,
        scrollTrigger: { trigger: '.closing-quote', start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );

    gsap.fromTo('.closing-names',
      { opacity: 0, letterSpacing: '30px' },
      {
        opacity: 1, letterSpacing: '12px', duration: 1.2, ease: 'power3.out', delay: 0.5,
        scrollTrigger: { trigger: '.closing-names', start: 'top 90%', toggleActions: 'play none none reverse' }
      }
    );

    /* ═══════════════════════════════════════════
       14. PARALLAX EFFECTS (Subtle)
    ═══════════════════════════════════════════ */
    // Slight parallax on section ornaments
    document.querySelectorAll('.section-ornament').forEach(ornament => {
      gsap.to(ornament, {
        y: -20,
        scrollTrigger: {
          trigger: ornament,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });

    // Hero content subtle parallax
    gsap.to('.hero-content', {
      y: 80,
      opacity: 0.3,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    /* ═══════════════════════════════════════════
       15. MUSIC TOGGLE
    ═══════════════════════════════════════════ */
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;

    musicToggle.addEventListener('click', () => {
      if (isPlaying) {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
      } else {
        bgMusic.volume = 0.3;
        bgMusic.play().catch(() => {
          // Autoplay blocked — user will need to click again
        });
        musicToggle.classList.add('playing');
      }
      isPlaying = !isPlaying;
    });

    /* ═══════════════════════════════════════════
       16. SMOOTH SCROLL INDICATOR CLICK
    ═══════════════════════════════════════════ */
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', () => {
        gsap.to(window, {
          scrollTo: { y: '#invitation', offsetY: 0 },
          duration: 1.2,
          ease: 'power2.inOut'
        });
      });
      scrollIndicator.style.cursor = 'pointer';

      // Hide scroll indicator on scroll
      gsap.to(scrollIndicator, {
        opacity: 0,
        pointerEvents: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '+=100',
          scrub: true
        }
      });
    }

    /* ═══════════════════════════════════════════
       17. GENERAL SECTION REVEALS
    ═══════════════════════════════════════════ */
    // Fade in section ornaments and titles generically
    document.querySelectorAll('.section').forEach(section => {
      const ornament = section.querySelector('.section-ornament');
      const title = section.querySelector('.section-title');
      const subtitle = section.querySelector('.section-subtitle');

      if (ornament && !section.classList.contains('invitation')) {
        gsap.fromTo(ornament,
          { opacity: 0, y: 15 },
          {
            opacity: 0.7, y: 0, duration: 0.6,
            scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none reverse' }
          }
        );
      }

      if (subtitle) {
        gsap.fromTo(subtitle,
          { opacity: 0, y: 15 },
          {
            opacity: 1, y: 0, duration: 0.8, delay: 0.15,
            scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' }
          }
        );
      }
    });

    /* ═══════════════════════════════════════════
       18. FOOTER ANIMATION
    ═══════════════════════════════════════════ */
    gsap.fromTo('.footer-monogram',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.closing-footer', start: 'top 95%', toggleActions: 'play none none reverse' }
      }
    );

    /* ═══════════════════════════════════════════
       PERFORMANCE: Refresh ScrollTrigger on load
    ═══════════════════════════════════════════ */
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });

    /* ═══════════════════════════════════════════
       19. MOBILE: ONE-SECTION-AT-A-TIME FADE
    ═══════════════════════════════════════════ */
    if (window.innerWidth <= 768) {
      const allSections = document.querySelectorAll('.section');
      const lastSection = allSections[allSections.length - 1];

      allSections.forEach(section => {
        // Skip hero — it's already visible
        if (section.id === 'hero') return;

        // Start every non-hero section transparent
        gsap.set(section, { opacity: 0 });

        // Fade in when section snaps into view
        ScrollTrigger.create({
          trigger: section,
          start: 'top 90%',
          end: 'top 10%',
          onEnter: () => gsap.to(section, { opacity: 1, duration: 0.6, ease: 'power2.out' }),
          onLeaveBack: () => gsap.to(section, { opacity: 0, duration: 0.4, ease: 'power2.in' })
        });

        // Fade out when section scrolls away (skip last section)
        if (section !== lastSection) {
          ScrollTrigger.create({
            trigger: section,
            start: 'bottom 90%',
            end: 'bottom 10%',
            onLeave: () => gsap.to(section, { opacity: 0, duration: 0.4, ease: 'power2.in' }),
            onEnterBack: () => gsap.to(section, { opacity: 1, duration: 0.6, ease: 'power2.out' })
          });
        }
      });

      // Fade out hero on scroll
      const heroSection = document.getElementById('hero');
      ScrollTrigger.create({
        trigger: heroSection,
        start: 'bottom 80%',
        onLeave: () => gsap.to(heroSection, { opacity: 0, duration: 0.4, ease: 'power2.in' }),
        onEnterBack: () => gsap.to(heroSection, { opacity: 1, duration: 0.6, ease: 'power2.out' })
      });
    }

  }); // end onReady
})();
