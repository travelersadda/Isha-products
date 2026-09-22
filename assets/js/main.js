/* ==========================================================================
   Isha Products — Site Interactions & Motion
   ========================================================================== */

(function () {
  'use strict';

  const PHONE = '8217860154';
  const PHONE_INTL = '918217860154';

  document.addEventListener('DOMContentLoaded', () => {
    initAmbientLayers();
    initHeader();
    initMobileNav();
    initRevealObserver();
    initCounters();
    initWaterCanvas();
    initOrbParallax();
    initTilt();
    initMagneticButtons();
    initFaq();
    initForms();
    initWhatsAppLinks();
    initYear();
    initActiveNav();
  });

  /* ---------------- Ambient background + cursor glow (injected once) ---------------- */
  function initAmbientLayers() {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div class="aurora-bg" aria-hidden="true"><span class="a1"></span><span class="a2"></span><span class="a3"></span></div>' +
        '<div class="cursor-glow" aria-hidden="true"></div>'
    );

    const glow = document.querySelector('.cursor-glow');
    const glowZones = document.querySelectorAll('.hero, .page-hero, .testi-section');
    if (!glow || !glowZones.length) return;

    let targetX = window.innerWidth / 2;
    let targetY = 200;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener(
      'mousemove',
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
      },
      { passive: true }
    );

    glowZones.forEach((zone) => {
      zone.addEventListener('mouseenter', () => glow.classList.add('active'));
      zone.addEventListener('mouseleave', () => glow.classList.remove('active'));
    });

    (function loop() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- Header scroll state ---------------- */
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 30) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- Mobile nav drawer ---------------- */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const drawer = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.nav-overlay');
    if (!toggle || !drawer) return;

    const close = () => {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      overlay && overlay.classList.remove('open');
      document.body.style.overflow = '';
    };
    const open = () => {
      toggle.classList.add('open');
      drawer.classList.add('open');
      overlay && overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    toggle.addEventListener('click', () => {
      toggle.classList.contains('open') ? close() : open();
    });
    overlay && overlay.addEventListener('click', close);
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }

  /* ---------------- Scroll reveal ---------------- */
  function initRevealObserver() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------------- Animated counters ---------------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const animate = (el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = (target % 1 === 0 ? Math.floor(value) : value.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => io.observe(el));
  }

  /* ---------------- Interactive water canvas: bubbles + mouse/click ripples ---------------- */
  function initWaterCanvas() {
    const canvases = document.querySelectorAll('.hero-bg-canvas');
    if (!canvases.length) return;

    canvases.forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      let w, h, bubbles, ripples, pointerInside;
      const host = canvas.parentElement;

      function resize() {
        const rect = host.getBoundingClientRect();
        w = canvas.width = rect.width;
        h = canvas.height = rect.height;
      }

      const palette = ['28,163,236', '255,159,28', '76,175,80'];
      const pickColor = () => palette[Math.floor(Math.random() * palette.length)];

      function makeBubbles() {
        const count = Math.max(16, Math.floor(w / 70));
        bubbles = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: h + Math.random() * h,
          r: 3 + Math.random() * 12,
          speed: 0.25 + Math.random() * 0.8,
          drift: (Math.random() - 0.5) * 0.5,
          alpha: 0.16 + Math.random() * 0.2,
          color: pickColor(),
        }));
      }

      ripples = [];
      function spawnRipple(x, y, big) {
        ripples.push({
          x, y,
          r: big ? 6 : 2,
          maxR: big ? 220 : 110,
          alpha: big ? 0.55 : 0.4,
          speed: big ? 3.2 : 2.2,
          color: pickColor(),
        });
        if (ripples.length > 40) ripples.shift();
      }

      let lastSpawn = 0;
      host.addEventListener('mousemove', (e) => {
        pointerInside = true;
        const now = performance.now();
        if (now - lastSpawn > 140) {
          lastSpawn = now;
          const rect = host.getBoundingClientRect();
          spawnRipple(e.clientX - rect.left, e.clientY - rect.top, false);
        }
      });
      host.addEventListener('mouseleave', () => { pointerInside = false; });
      host.addEventListener('click', (e) => {
        const rect = host.getBoundingClientRect();
        spawnRipple(e.clientX - rect.left, e.clientY - rect.top, true);
      });

      function tick() {
        ctx.clearRect(0, 0, w, h);

        bubbles.forEach((b) => {
          b.y -= b.speed;
          b.x += Math.sin(b.y * 0.01) * b.drift;
          if (b.y < -20) {
            b.y = h + 20;
            b.x = Math.random() * w;
          }
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${b.color},${b.alpha})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.fillStyle = `rgba(${b.color},${b.alpha * 0.3})`;
          ctx.fill();
        });

        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.r += r.speed;
          r.alpha *= 0.965;
          if (r.r >= r.maxR || r.alpha < 0.01) {
            ripples.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r.color},${r.alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        requestAnimationFrame(tick);
      }

      resize();
      makeBubbles();
      tick();
      window.addEventListener('resize', () => {
        resize();
        makeBubbles();
      });
    });
  }

  /* ---------------- Hero orb: floaty motion + mouse-driven 3D parallax tilt ---------------- */
  function initOrbParallax() {
    const hero = document.querySelector('.hero');
    const orb = document.querySelector('.hero-orb');
    if (!hero || !orb) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let curRotX = 0;
    let curRotY = 0;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = px * 22;
      targetRotX = -py * 22;
    });
    hero.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
    });

    const start = performance.now();
    (function loop() {
      curRotX += (targetRotX - curRotX) * 0.06;
      curRotY += (targetRotY - curRotY) * 0.06;
      const floatOffset = Math.sin((performance.now() - start) / 900) * 12;
      orb.style.transform = `perspective(1000px) translateY(${floatOffset}px) rotateX(${curRotX}deg) rotateY(${curRotY}deg)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-dark, .btn-whatsapp, .btn-outline');
    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px) scale(1.03)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0) scale(1)';
      });
    });
  }

  /* ---------------- 3D tilt on hover ---------------- */
  function initTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach((card) => {
      const strength = parseFloat(card.getAttribute('data-tilt')) || 10;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateY(0)';
      });
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  function initFaq() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach((item) => {
      const q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        items.forEach((i) => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  /* ---------------- Forms → WhatsApp lead capture ---------------- */
  function initForms() {
    const forms = document.querySelectorAll('form[data-lead-form]');
    forms.forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const name = (data.get('name') || '').toString().trim();
        const phone = (data.get('phone') || '').toString().trim();
        const service = (data.get('service') || '').toString().trim();
        const message = (data.get('message') || '').toString().trim();

        if (!name || !phone) {
          form.reportValidity ? form.reportValidity() : null;
          return;
        }

        const lines = [
          `Hi Isha Products, I'd like a free consultation.`,
          `Name: ${name}`,
          `Phone: ${phone}`,
          service ? `Service: ${service}` : null,
          message ? `Message: ${message}` : null,
        ].filter(Boolean);

        const waUrl = `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(lines.join('\n'))}`;

        const successBox = form.parentElement.querySelector('.form-success') || document.querySelector('.form-success');
        if (successBox) {
          successBox.classList.add('show');
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        form.reset();
        window.open(waUrl, '_blank', 'noopener');
      });
    });
  }

  /* ---------------- WhatsApp / tel quick links ---------------- */
  function initWhatsAppLinks() {
    document.querySelectorAll('[data-wa]').forEach((el) => {
      const text = el.getAttribute('data-wa') || "Hi Isha Products, I'm interested in your water solutions.";
      el.setAttribute('href', `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(text)}`);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
    document.querySelectorAll('[data-tel]').forEach((el) => {
      el.setAttribute('href', `tel:+91${PHONE}`);
    });
  }

  /* ---------------- Footer year ---------------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------------- Active nav link ---------------- */
  function initActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }
})();
