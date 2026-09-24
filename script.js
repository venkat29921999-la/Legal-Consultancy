/* =========================================================
   STACKLY LEGAL — main.js
========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('done'), 350);
  });
  // fallback in case 'load' already fired
  setTimeout(() => preloader && preloader.classList.add('done'), 2500);

  /* ---------- Sticky header ---------- */
  const header = document.getElementById('siteHeader');
  const scrollTopBtn = document.getElementById('scrollTop');

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(navLinks).map(l => {
    const href = l.getAttribute('href') || '';
    if (!href.startsWith('#')) return null; // cross-page link (e.g. "index.html#home") — not a scroll target on this page
    try { return document.querySelector(href); } catch (err) { return null; }
  });
  const hasInPageTargets = sections.some(Boolean);
  function updateActiveNav() {
    if (!hasInPageTargets) return; // this page has its own fixed "active" link (e.g. about.html)
    let current = sections[0];
    const y = window.scrollY + 140;
    sections.forEach(sec => { if (sec && sec.offsetTop <= y) current = sec; });
    navLinks.forEach(l => {
      l.classList.toggle('active', current && l.getAttribute('href') === '#' + current.id);
    });
  }

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    scrollTopBtn.classList.toggle('show', y > 600);
    updateActiveNav();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Hamburger / mobile drawer ---------- */
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');

  function openDrawer() {
    hamburger.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  overlay.addEventListener('click', closeDrawer);
  document.querySelectorAll('.mnav-link, .mobile-login').forEach(l =>
    l.addEventListener('click', closeDrawer)
  );
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* ---------- Animated counters (Intersection Observer) ---------- */
  const counters = document.querySelectorAll('.num[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Testimonial slider ---------- */
  const track = document.getElementById('testiTrack');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  if (track) {
    const scrollAmount = () => track.querySelector('.testi-card').offsetWidth + 26;
    nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
    prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
  }

  /* ---------- Smooth-scroll for in-page anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const offset = window.innerWidth < 860 ? 74 : 90;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------- Contact form (demo submit) ---------- */
  /* ---------- Contact form (demo submit) ---------- */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = '<span>Request sent</span><i class="fa-solid fa-check"></i>';
      form.reset();
      setTimeout(() => { window.location.href = '404.html'; }, 800);   // <-- added line
      setTimeout(() => { btn.innerHTML = original; }, 2600);
    });
  }

  /* =========================================================
     GSAP — creative, section-by-section animation system
     Replaces the old generic AOS fades entirely. Every section
     below has its own distinct entrance treatment; a single
     generic catch-all covers anything not bespoke-handled.
  ========================================================= */
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktopHover = window.matchMedia('(hover:hover) and (min-width:861px)').matches;
    const isDesktop = window.matchMedia('(min-width:861px)').matches;

    if (!reduceMotion) {

      /* ---------- tracks which [data-aos] elements got bespoke treatment ---------- */
      const handled = new Set();
      const markHandled = (nodeList) => {
        (nodeList.length !== undefined ? Array.from(nodeList) : [nodeList]).forEach(el => el && handled.add(el));
      };

      /* ---------- split element text into word spans (keeps <br> etc. intact) ---------- */
      function splitWords(el) {
        const nodes = Array.from(el.childNodes);
        el.innerHTML = '';
        nodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent.split(/(\s+)/).forEach(chunk => {
              if (chunk.trim() === '') { el.appendChild(document.createTextNode(chunk)); return; }
              const span = document.createElement('span');
              span.className = 'split-word';
              span.textContent = chunk;
              el.appendChild(span);
            });
          } else {
            el.appendChild(node.cloneNode(true));
          }
        });
        return el.querySelectorAll('.split-word');
      }

      /* =======================================================
         MAGNETIC BUTTONS (desktop, hover-capable only)
      ======================================================= */
      if (desktopHover) {
        document.querySelectorAll('.btn-primary, .btn-ghost, .sc-link, .testi-controls button').forEach(btn => {
          btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            gsap.to(btn, {
              x: (e.clientX - r.left - r.width / 2) * 0.3,
              y: (e.clientY - r.top - r.height / 2) * 0.4,
              duration: 0.5, ease: 'power3.out'
            });
          });
          btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
          });
        });

        /* ---------- Custom cursor ---------- */
        document.body.classList.add('cursor-ready');
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        const ring = document.createElement('div');
        ring.className = 'cursor-ring';
        document.body.append(dot, ring);
        window.addEventListener('mousemove', e => {
          gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1 });
          gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power3.out' });
        });
        document.querySelectorAll('a, button, .service-card, .why-card, .blog-card, .testi-card, .team-card').forEach(el => {
          el.addEventListener('mouseenter', () => ring.classList.add('grow'));
          el.addEventListener('mouseleave', () => ring.classList.remove('grow'));
        });
      }

      /* =======================================================
         1. HERO — orchestrated intro + ambient depth
      ======================================================= */
      const heroTl = gsap.timeline({ delay: 0.5, defaults: { ease: 'power3.out' } });
      heroTl.from('#heroLine1', { yPercent: 120, duration: 0.9 })
        .from('#heroLine2', { yPercent: 120, duration: 0.9 }, '-=0.65')
        .from('#heroLine3', { yPercent: 120, duration: 0.9 }, '-=0.65')
        .from('.hv-main', { opacity: 0, scale: 0.92, duration: 1.1, ease: 'power2.out' }, '-=0.9')
        .from('#hvCard1', { opacity: 0, x: -40, y: 20, duration: 0.8 }, '-=0.6')
        .from('#hvCard2', { opacity: 0, x: -30, y: -20, duration: 0.8 }, '-=0.55')
        .from('#hvBadge', { opacity: 0, x: 30, scale: 0.9, duration: 0.7 }, '-=0.5');

      gsap.to('#hvCard1', { y: '+=14', duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('#hvCard2', { y: '-=12', duration: 3.9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('#hvBadge', { y: '+=10', duration: 3.1, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      const heroVisual = document.querySelector('.hero-visual');
      if (heroVisual && isDesktop) {
        heroVisual.addEventListener('mousemove', (e) => {
          const rect = heroVisual.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to('#hvCard1', { x: px * 22, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
          gsap.to('#hvCard2', { x: px * -18, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
          gsap.to('#hvBadge', { x: px * 16, y: py * 16, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        });
        gsap.to('.hv-frame', {
          rotateX: -6, rotateY: 3, transformPerspective: 1000, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
        });
      }

      gsap.to('.hero-bg-shape', { yPercent: 20, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
      gsap.to('.hero-bg-shape', { scale: 1.15, opacity: 0.7, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      /* =======================================================
         SECTION TITLES — word-stamp reveal (site-wide)
      ======================================================= */
      gsap.utils.toArray('.section-title').forEach(title => {
        const words = splitWords(title);
        gsap.from(words, {
          yPercent: 130, rotateZ: 5, opacity: 0,
          duration: 0.85, ease: 'power4.out', stagger: 0.045,
          scrollTrigger: { trigger: title, start: 'top 88%' }
        });
        markHandled(title);
      });

      /* =======================================================
         2. ABOUT — curtain image reveal + flourishes
      ======================================================= */
      const aboutImg = document.querySelector('.about-img');
      if (aboutImg) {
        gsap.fromTo(aboutImg,
          { clipPath: 'inset(0 100% 0 0)', scale: 1.12 },
          { clipPath: 'inset(0 0% 0 0)', scale: 1, duration: 1.3, ease: 'power4.inOut',
            scrollTrigger: { trigger: aboutImg, start: 'top 82%' } }
        );
      }
      gsap.from('.about-tag', {
        scale: 0.5, opacity: 0, duration: 0.9, ease: 'back.out(2.2)',
        scrollTrigger: { trigger: '.about-tag', start: 'top 90%' }
      });
      gsap.from('.point i', {
        rotate: -180, scale: 0, duration: 0.7, ease: 'back.out(2.5)', stagger: 0.15,
        scrollTrigger: { trigger: '.about-points', start: 'top 85%' }
      });
      gsap.from('.strip-item', {
        opacity: 0, y: 16, rotateX: -60, transformOrigin: 'top center', duration: 0.6, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.about-strip', start: 'top 90%' }
      });

      /* =======================================================
         3. SERVICES — flip-up cards, curtain media, tilt-on-hover
      ======================================================= */
      gsap.utils.toArray('.service-card').forEach(card => {
        gsap.from(card, {
          rotateX: 65, y: 60, opacity: 0, transformOrigin: 'bottom center', duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%' }
        });
        const img = card.querySelector('.sc-media img');
        if (img) gsap.fromTo(img, { clipPath: 'inset(0 0 100% 0)' }, {
          clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power4.out',
          scrollTrigger: { trigger: card, start: 'top 85%' }
        });
        const icon = card.querySelector('.sc-icon');
        if (icon) gsap.from(icon, {
          scale: 0, rotate: -90, duration: 0.6, ease: 'back.out(3)', delay: 0.25,
          scrollTrigger: { trigger: card, start: 'top 85%' }
        });
        if (desktopHover) {
          card.style.transformStyle = 'preserve-3d';
          card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(card, { rotateY: px * 10, rotateX: -py * 10, duration: 0.4, ease: 'power2.out', transformPerspective: 800, overwrite: 'auto' });
          });
          card.addEventListener('mouseleave', () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' }));
        }
        markHandled(card);
      });

      /* =======================================================
         4. WHY — scale/rotate stagger + floating icons
      ======================================================= */
      gsap.from('.why-card', {
        scale: 0.75, opacity: 0, rotate: -4, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.12,
        scrollTrigger: { trigger: '.why-grid', start: 'top 85%' }
      });
      markHandled(document.querySelectorAll('.why-card'));
      document.querySelectorAll('.why-card i').forEach((icon, i) => {
        gsap.to(icon, { y: -6, duration: 1.6 + (i % 3) * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.2 });
      });

      /* =======================================================
         5. PROCESS — alternating slide-in + progress bar per step
      ======================================================= */
      gsap.utils.toArray('.pstep').forEach((step, i) => {
        gsap.from(step, {
          x: i % 2 === 0 ? -50 : 50, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 88%' }
        });
        const num = step.querySelector('.pnum');
        if (num) gsap.from(num, {
          rotateX: -90, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.15,
          scrollTrigger: { trigger: step, start: 'top 88%' }
        });
        const bar = document.createElement('span');
        bar.className = 'pstep-bar';
        step.appendChild(bar);
        gsap.to(bar, {
          scaleX: 1, duration: 0.9, ease: 'power2.out', delay: 0.3,
          scrollTrigger: { trigger: step, start: 'top 85%' }
        });
        markHandled(step);
      });

      /* =======================================================
         6. TEAM — curtain portrait reveal (swipe down)
      ======================================================= */
      gsap.utils.toArray('.team-card').forEach(card => {
        gsap.from(card, {
          y: 50, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%' }
        });
        const img = card.querySelector('.tc-media img');
        if (img) gsap.fromTo(img, { clipPath: 'inset(100% 0 0 0)' }, {
          clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power4.out', delay: 0.1,
          scrollTrigger: { trigger: card, start: 'top 85%' }
        });
        markHandled(card);
      });

      /* =======================================================
         7. RESULTS — focus pull-in + slow background zoom
      ======================================================= */
      gsap.from('.rstat', {
        opacity: 0, y: 30, filter: 'blur(8px)', duration: 0.9, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: '.results-grid', start: 'top 85%' }
      });
      markHandled(document.querySelectorAll('.rstat'));
      gsap.to('.results-bg', {
        scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: '.results', start: 'top bottom', end: 'bottom top', scrub: true }
      });

      /* =======================================================
         8. TESTIMONIALS — tilted flip-in
      ======================================================= */
      gsap.from('.testi-card', {
        rotateY: -30, opacity: 0, x: 40, transformOrigin: 'left center', duration: 0.9, ease: 'power3.out', stagger: 0.15,
        scrollTrigger: { trigger: '.testi-track-wrap', start: 'top 82%' }
      });

      /* =======================================================
         9. BLOG — rise with skew-correct + curtain media
      ======================================================= */
      gsap.utils.toArray('.blog-card').forEach(card => {
        gsap.from(card, {
          y: 70, skewY: 4, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%' }
        });
        const img = card.querySelector('.bc-media img');
        if (img) gsap.fromTo(img, { clipPath: 'inset(0 100% 0 0)' }, {
          clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power4.out',
          scrollTrigger: { trigger: card, start: 'top 85%' }
        });
        markHandled(card);
      });

      /* =======================================================
         10. CTA — background zoom + breathing button
      ======================================================= */
      gsap.to('.cta-bg', { scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.cta .btn-primary', {
        scale: 1.045, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: 'center'
      });

      /* =======================================================
         11. CONTACT — staggered info + form
      ======================================================= */
      gsap.from('.ci-item', {
        x: -30, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: '.contact-info', start: 'top 88%' }
      });
      gsap.from('.contact-map', {
        opacity: 0, scale: 0.94, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: '.contact-map', start: 'top 90%' }
      });
      gsap.from('.form-field', {
        y: 24, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.07,
        scrollTrigger: { trigger: '.contact-form', start: 'top 85%' }
      });

      /* =======================================================
         FOOTER — soft rise
      ======================================================= */
      gsap.from('.footer-brand, .footer-col', {
        y: 24, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: '.footer-top', start: 'top 92%' }
      });

      /* =======================================================
         GENERIC CATCH-ALL — every remaining [data-aos] element
         (labels, paragraphs, ctas, containers) gets a clean
         directional reveal matched to its original data-aos value.
      ======================================================= */
      document.querySelectorAll('[data-aos]').forEach(el => {
        if (handled.has(el)) return;
        const type = el.getAttribute('data-aos');
        const delay = (parseInt(el.getAttribute('data-aos-delay') || '0', 10) / 1000) + (el.closest('.hero') ? 0.8 : 0);
        const vars = { opacity: 0, duration: 0.8, ease: 'power3.out', delay };
        if (type === 'fade-right') vars.x = -50;
        else if (type === 'fade-left') vars.x = 50;
        else if (type === 'zoom-in') vars.scale = 0.88;
        else vars.y = 40; // fade-up and default
        gsap.from(el, { ...vars, scrollTrigger: { trigger: el, start: 'top 88%' } });
      });

      /* ---------- Safety net: images load async and can shift layout,
         throwing off trigger positions further down the page. Re-sync once
         everything (including images) has actually finished loading. ---------- */
      window.addEventListener('load', () => ScrollTrigger.refresh());
    }
  }

  /* =========================================================
     CREATIVE ANIMATION SYSTEM v2
     New, section-specific mechanics layered on top of the
     existing entrance animations above.
  ========================================================= */
  const reduceMotion2 = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopHover2 = window.matchMedia('(hover:hover) and (min-width:861px)').matches;
  const hasGsap = !!window.gsap;

  /* ---------- 1. Global scroll progress bar ---------- */
  const progressWrap = document.createElement('div');
  progressWrap.className = 'scroll-progress';
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  progressWrap.appendChild(progressBar);
  document.body.appendChild(progressWrap);
  function updateProgress() {
    const h = document.documentElement;
    const scrolled = h.scrollTop || document.body.scrollTop;
    const height = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ---------- 2. Hero ambient particles ---------- */
  const particleHost = document.getElementById('heroParticles');
  if (particleHost && !reduceMotion2) {
    const COUNT = 16;
    const particles = [];
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('span');
      p.className = 'hero-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      const size = 2 + Math.random() * 4;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      particleHost.appendChild(p);
      particles.push(p);
    }
    if (hasGsap) {
      particles.forEach(p => {
        gsap.to(p, {
          y: `+=${(Math.random() * 60 + 30) * (Math.random() > 0.5 ? 1 : -1)}`,
          x: `+=${(Math.random() * 40 + 10) * (Math.random() > 0.5 ? 1 : -1)}`,
          opacity: Math.random() * 0.5 + 0.2,
          duration: 4 + Math.random() * 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 2
        });
      });
    }
  }

  /* ---------- 3. Process: scroll-synced connecting line ---------- */
  const lineWrap = document.getElementById('processLineWrap');
  const lineFill = document.getElementById('processLineFill');
  const lineDot = document.getElementById('processLineDot');
  if (lineWrap && lineFill && lineDot && hasGsap && window.ScrollTrigger) {
    gsap.to([lineFill], {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: '.process-steps', start: 'top 75%', end: 'bottom 60%', scrub: 0.4
      }
    });
    gsap.to(lineDot, {
      left: '100%', ease: 'none',
      scrollTrigger: {
        trigger: '.process-steps', start: 'top 75%', end: 'bottom 60%', scrub: 0.4
      }
    });
  }

  /* ---------- 4. Results: animated fill bars under each stat ---------- */
  document.querySelectorAll('.rstat').forEach(stat => {
    const bar = document.createElement('span');
    bar.className = 'rstat-bar';
    stat.appendChild(bar);
    if (hasGsap && window.ScrollTrigger) {
      gsap.to(bar, {
        scaleX: 1, duration: 1.1, ease: 'power2.out', delay: 0.2,
        scrollTrigger: { trigger: stat, start: 'top 85%' }
      });
    }
  });

  /* ---------- 5. Testimonials: dots, autoplay, drag/swipe ---------- */
  (function testimonialUpgrade() {
    const track = document.getElementById('testiTrack');
    const dotsHost = document.getElementById('testiDots');
    const prevBtn = document.getElementById('testiPrev');
    const nextBtn = document.getElementById('testiNext');
    if (!track || !dotsHost) return;

    const cards = Array.from(track.querySelectorAll('.testi-card'));
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => scrollToCard(i));
      dotsHost.appendChild(dot);
    });
    const dots = Array.from(dotsHost.children);

    function cardWidth() { return cards[0] ? cards[0].offsetWidth + 26 : 0; }
    function currentIndex() {
      return Math.round(track.scrollLeft / (cardWidth() || 1));
    }
    function scrollToCard(i) {
      track.scrollTo({ left: i * cardWidth(), behavior: 'smooth' });
    }
    function refreshDots() {
      const idx = Math.min(currentIndex(), dots.length - 1);
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
    track.addEventListener('scroll', () => {
      window.clearTimeout(track._dotTimer);
      track._dotTimer = window.setTimeout(refreshDots, 80);
    }, { passive: true });

    if (nextBtn) nextBtn.addEventListener('click', () => {
      const idx = Math.min(currentIndex() + 1, cards.length - 1);
      scrollToCard(idx);
    });
    if (prevBtn) prevBtn.addEventListener('click', () => {
      const idx = Math.max(currentIndex() - 1, 0);
      scrollToCard(idx);
    });

    /* Autoplay, pauses on hover/focus/touch */
    let autoplayTimer = null;
    function startAutoplay() {
      if (reduceMotion2) return;
      stopAutoplay();
      autoplayTimer = window.setInterval(() => {
        const next = (currentIndex() + 1) % cards.length;
        scrollToCard(next);
      }, 5200);
    }
    function stopAutoplay() {
      if (autoplayTimer) { window.clearInterval(autoplayTimer); autoplayTimer = null; }
    }
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);
    track.addEventListener('touchstart', stopAutoplay, { passive: true });
    startAutoplay();

    /* Drag-to-scroll (desktop pointer) */
    let isDown = false, startX = 0, startScroll = 0;
    track.addEventListener('pointerdown', (e) => {
      isDown = true; startX = e.clientX; startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
      stopAutoplay();
    });
    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.clientX - startX);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt =>
      track.addEventListener(evt, () => {
        if (!isDown) return;
        isDown = false;
        const idx = currentIndex();
        scrollToCard(Math.max(0, Math.min(idx, cards.length - 1)));
        startAutoplay();
      })
    );
  })();

  /* ---------- 6. Blog: magnetic image shift inside card ---------- */
  if (desktopHover2 && hasGsap) {
    document.querySelectorAll('.blog-card').forEach(card => {
      const img = card.querySelector('.bc-media img');
      if (!img) return;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(img, { x: px * 16, y: py * 12, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(img, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  }

  /* ---------- 7. Footer social icons: staggered pop-in ---------- */
  if (hasGsap && window.ScrollTrigger && !reduceMotion2) {
    gsap.from('.footer-social a', {
      scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2.4)', stagger: 0.08,
      scrollTrigger: { trigger: '.footer-social', start: 'top 92%' }
    });
  }
});
/* =========================================================================
   ABOUT PAGE — bespoke animation engine for about.html's 7 sections.
   Every block below no-ops safely if its markup isn't present, so this
   file still runs unmodified on index.html.
========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotionAB = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsapAB = !!window.gsap && !!window.ScrollTrigger;
  if (hasGsapAB) gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. ABOUT HERO — split characters into spans, staggered chromatic reveal ---------- */
  document.querySelectorAll('.ah-title .ah-row').forEach(row => {
    const text = row.textContent;
    row.textContent = '';
    text.split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      row.appendChild(span);
    });
  });
  if (hasGsapAB && !reduceMotionAB && document.querySelector('.ah-title')) {
    const tl = gsap.timeline({ delay: 0.4 });
    tl.from('.ah-title .char', {
      opacity: 0, yPercent: 100, rotateZ: 8, color: '#AD8642',
      duration: 0.6, ease: 'power3.out', stagger: 0.018
    })
    .from('.ah-desc, .ah-cta', { opacity: 0, y: 18, duration: 0.7, ease: 'power2.out', stagger: 0.12 }, '-=0.2')
    .from('.ahc-1', { opacity: 0, scale: 0.92, duration: 0.9, ease: 'power2.out' }, '-=0.5')
    .from('.ahc-2', { opacity: 0, x: -24, y: 16, duration: 0.7 }, '-=0.5')
    .from('.ahc-3', { opacity: 0, x: -20, y: -16, duration: 0.7 }, '-=0.55')
    .from('.ah-badge', { opacity: 0, x: 20, scale: 0.9, duration: 0.7 }, '-=0.5')
    .from('.ah-orbit, .ah-orbit-2', { opacity: 0, scale: 0.7, duration: 1 }, '-=0.6');

    gsap.to('.ahc-2', { y: '+=10', duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.ahc-3', { y: '-=10', duration: 3.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.ah-badge', { y: '+=8', duration: 3.1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  } else if (!hasGsapAB) {
    document.querySelectorAll('.ah-title .char, .ah-desc, .ah-cta, .ahc-1, .ahc-2, .ahc-3, .ah-badge').forEach(el => {
      el.style.opacity = 1;
    });
  }

  /* ---------- 2. STORY — draw the vertical SVG line on scroll + pop each dot ---------- */
  const storyPath = document.getElementById('storyLinePath');
  if (storyPath) {
    const len = storyPath.getTotalLength();
    storyPath.style.strokeDasharray = len;
    storyPath.style.strokeDashoffset = len;
    if (hasGsapAB && !reduceMotionAB) {
      gsap.to(storyPath, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: '.story-track', start: 'top 75%', end: 'bottom 85%', scrub: 0.5 }
      });
      gsap.utils.toArray('.story-item').forEach((item, i) => {
        gsap.from(item, {
          opacity: 0, x: i % 2 === 0 ? -40 : 40, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: item, start: 'top 85%' }
        });
        const dot = item.querySelector('.story-dot');
        if (dot) gsap.to(dot, {
          scale: 1, duration: 0.5, ease: 'back.out(3)',
          scrollTrigger: { trigger: item, start: 'top 80%' }
        });
      });
    } else {
      storyPath.style.strokeDashoffset = 0;
      document.querySelectorAll('.story-dot').forEach(d => d.style.transform = 'scale(1)');
    }
  }

  /* ---------- 3. VALUES — alternating "double door" 3D entrance + tap-to-flip on touch ---------- */
  const valueCards = document.querySelectorAll('.value-card');
  if (valueCards.length) {
    if (hasGsapAB && !reduceMotionAB) {
      valueCards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0, rotateY: i % 2 === 0 ? -85 : 85, transformPerspective: 900,
          duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.values-grid', start: 'top 82%' },
          delay: i * 0.12
        });
      });
    }
    const isTouch = window.matchMedia('(hover:none)').matches;
    if (isTouch) {
      valueCards.forEach(card => {
        card.addEventListener('click', () => {
          valueCards.forEach(c => { if (c !== card) c.classList.remove('flipped'); });
          card.classList.toggle('flipped');
        });
      });
    }
  }

  /* ---------- 4. LEADERSHIP — cards start stacked as a deck, then fan out on scroll ---------- */
  const leaderCards = document.querySelectorAll('.leader-card');
  if (leaderCards.length) {
    const isDesktopAB = window.matchMedia('(min-width:721px)').matches;
    if (isDesktopAB && hasGsapAB && !reduceMotionAB) {
      const spread = [-320, -108, 108, 320];
      const rot = [-9, -3, 3, 9];
      leaderCards.forEach((card, i) => {
        gsap.set(card, { x: 0, y: 30, rotate: (i - 1.5) * 2, scale: 0.9, zIndex: i });
      });
      gsap.timeline({
        scrollTrigger: { trigger: '.leadership-deck', start: 'top 70%' }
      }).to(leaderCards, {
        x: (i) => spread[i], y: 0, rotate: (i) => rot[i], scale: 1,
        duration: 0.9, ease: 'back.out(1.3)', stagger: 0.12
      });
    } else {
      leaderCards.forEach(card => { card.style.position = 'relative'; card.style.left = 'auto'; card.style.marginLeft = '0'; });
      if (hasGsapAB && !reduceMotionAB) {
        gsap.from(leaderCards, {
          opacity: 0, y: 40, duration: 0.7, ease: 'power2.out', stagger: 0.12,
          scrollTrigger: { trigger: '.leadership-deck', start: 'top 85%' }
        });
      }
    }
  }

  /* ---------- 5. MILESTONES — SVG ring fill + odometer digit roll, synced to scroll ---------- */
  document.querySelectorAll('.ms-card').forEach(card => {
    const target = parseInt(card.getAttribute('data-target'), 10) || 0;
    const ring = card.querySelector('.ms-ring-fill');
    const reelHost = card.querySelector('.ms-reel');
    if (!reelHost) return;

    const digits = String(target).split('');
    reelHost.innerHTML = '';
    const strips = [];
    digits.forEach(d => {
      const digitWrap = document.createElement('span');
      digitWrap.className = 'ms-reel-digit';
      const strip = document.createElement('span');
      strip.className = 'ms-reel-strip';
      for (let n = 0; n <= parseInt(d, 10); n++) {
        const s = document.createElement('span');
        s.textContent = n;
        strip.appendChild(s);
      }
      digitWrap.appendChild(strip);
      reelHost.appendChild(digitWrap);
      strips.push({ strip, final: parseInt(d, 10) });
    });
    const suffix = card.getAttribute('data-suffix');
    if (suffix) {
      const plus = document.createElement('span');
      plus.className = 'ms-plus';
      plus.textContent = suffix;
      reelHost.appendChild(plus);
    }

    const circumference = ring ? 2 * Math.PI * 54 : 0;
    if (ring) {
      ring.style.strokeDasharray = circumference;
      ring.style.strokeDashoffset = circumference;
    }

    function runReel() {
      strips.forEach((item, i) => {
        if (hasGsapAB && !reduceMotionAB) {
          gsap.to(item.strip, {
            y: `-${item.final}em`, duration: 1.1, ease: 'power2.inOut', delay: i * 0.1
          });
        } else {
          item.strip.style.transform = `translateY(-${item.final}em)`;
        }
      });
      if (ring) {
        const pct = Math.min(target / (target > 100 ? target * 1.05 : 100), 1);
        if (hasGsapAB && !reduceMotionAB) {
          gsap.to(ring, { strokeDashoffset: circumference * (1 - pct), duration: 1.3, ease: 'power2.out' });
        } else {
          ring.style.strokeDashoffset = circumference * (1 - pct);
        }
      }
    }

    if (hasGsapAB && window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: card, start: 'top 85%', once: true, onEnter: runReel });
    } else {
      runReel();
    }
  });

  if (hasGsapAB && !reduceMotionAB) {
    gsap.to('.ms-shape-1', { rotate: 360, duration: 40, ease: 'none', repeat: -1 });
    gsap.to('.ms-shape-2', { rotate: -360, duration: 32, ease: 'none', repeat: -1 });
    gsap.to('.ms-shape-1, .ms-shape-2', { y: '+=18', duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  /* ---------- 6. CULTURE — diagonal clip-path wipe reveal, staggered ---------- */
  document.querySelectorAll('.culture-item').forEach((item, i) => {
    const veil = item.querySelector('.cu-veil');
    if (!veil) return;
    if (hasGsapAB && !reduceMotionAB) {
      gsap.fromTo(veil,
        { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
        {
          clipPath: 'polygon(0 0, 100% 0, 0 100%, 0 100%)',
          duration: 0.01, delay: 0
        }
      );
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 88%' } })
        .fromTo(item.querySelector('img'), { opacity: 0.2, scale: 1.15 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' })
        .fromTo(veil,
          { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
          { clipPath: 'polygon(0 0, 0 0, 100% 100%, 0 100%)', duration: 0.75, ease: 'power3.inOut' },
          '<'
        )
        .set(veil, { clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)' });
    } else {
      veil.style.display = 'none';
    }
  });

  /* ---------- 7. JOIN — ripple-on-click for the CTA button ---------- */
  const joinBtn = document.querySelector('.join .btn-primary');
  if (joinBtn) {
    joinBtn.addEventListener('click', (e) => {
      const r = joinBtn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(r.width, r.height) * 1.2;
      ripple.className = 'join-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
      joinBtn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  }
  if (hasGsapAB && !reduceMotionAB) {
    gsap.from('.join-title, .join-sub, .join .btn-primary', {
      opacity: 0, y: 26, duration: 0.8, ease: 'power2.out', stagger: 0.12,
      scrollTrigger: { trigger: '.join-inner', start: 'top 85%' }
    });
  }

  window.addEventListener('load', () => { if (hasGsapAB) ScrollTrigger.refresh(); });
});/* =========================================================================
   SERVICES PAGE — bespoke animation engine for services.html's 7 sections.
   Every block below no-ops safely if its markup isn't present, so this
   file still runs unmodified on index.html / about.html.
========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotionSV = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopSV = window.matchMedia('(min-width:861px)').matches;
  const hasGsapSV = !!window.gsap && !!window.ScrollTrigger;
  if (hasGsapSV) gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. SERVICES HERO — 3D word-flip title, cursor spotlight, fanned photo deck ---------- */
  const svh = document.getElementById('svh-top');
  if (svh) {
    if (hasGsapSV && !reduceMotionSV) {
      const heroTlSV = gsap.timeline({ delay: 0.3, defaults: { ease: 'power4.out' } });
      heroTlSV.from('.svh-word', {
          opacity: 0, yPercent: 100, rotateX: -70, transformOrigin: '50% 100%',
          duration: 0.8, stagger: 0.07
        })
        .from('.svh-desc, .svh-cta, .svh-stats', { opacity: 0, y: 20, duration: 0.7, stagger: 0.1 }, '-=0.5')
        .from('.svh-card-2', { opacity: 0, scale: 0.8, rotate: 0, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.9')
        .from('.svh-card-1', { opacity: 0, x: 40, rotate: -9, duration: 0.7, ease: 'power3.out' }, '-=0.6')
        .from('.svh-card-3', { opacity: 0, x: -40, rotate: 9, duration: 0.7, ease: 'power3.out' }, '-=0.65')
        .from('.svh-tag', { opacity: 0, y: 14, duration: 0.5 }, '-=0.3');

      gsap.to('.svh-card-1', { y: '+=12', rotate: '+=1.5', duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });
      gsap.to('.svh-card-3', { y: '-=12', rotate: '-=1.5', duration: 4.1, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });
      gsap.to('.svh-card-2', { y: '+=8', duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });
    } else {
      document.querySelectorAll('.svh-word, .svh-card').forEach(el => { el.style.opacity = 1; });
    }

    /* ---------- scramble-text eyebrow ---------- */
    const scrambleEl = document.getElementById('svhScramble');
    if (scrambleEl && !reduceMotionSV) {
      const finalText = scrambleEl.textContent;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let frame = 0;
      const totalFrames = 22;
      const scrambleTimer = setInterval(() => {
        frame++;
        scrambleEl.textContent = finalText.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          const reveal = (frame / totalFrames) * finalText.length;
          if (i < reveal) return finalText[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if (frame >= totalFrames) { scrambleEl.textContent = finalText; clearInterval(scrambleTimer); }
      }, 35);
    }

    /* ---------- cursor-follow spotlight ---------- */
    const svhSpotlight = document.getElementById('svhSpotlight');
    if (svhSpotlight && desktopSV) {
      svh.addEventListener('mousemove', (e) => {
        const r = svh.getBoundingClientRect();
        svhSpotlight.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%');
        svhSpotlight.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    }

    /* ---------- photo deck: tilt on pointer move + hover swaps the floating tag ---------- */
    const svhDeck = document.getElementById('svhDeck');
    const svhTag = document.getElementById('svhTag');
    if (svhDeck && desktopSV && hasGsapSV) {
      svhDeck.addEventListener('mousemove', (e) => {
        const r = svhDeck.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to('.svh-card-1', { x: px * 14 - 70, y: py * 10, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.svh-card-3', { x: px * 14 + 70, y: py * 10, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.svh-card-2', { x: px * 8, y: py * 8, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
      });
    }
    if (svhDeck && svhTag) {
      svhDeck.querySelectorAll('.svh-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
          svhTag.querySelector('i').className = 'fa-solid ' + card.dataset.icon;
          svhTag.querySelector('span').textContent = card.dataset.label;
        });
      });
    }
  }

  /* ---------- 2. PILLARS MARQUEE — pause + nudge on tap (touch devices) ---------- */
  const pillarsTrack = document.getElementById('pillarsTrack');
  if (pillarsTrack && !desktopSV) {
    pillarsTrack.style.animationDuration = '18s';
  }

  /* ---------- 3. DEEP-DIVE STACK — incoming card dims/scales the one beneath it ---------- */
  const deepCards = document.querySelectorAll('.deep-card');
  if (deepCards.length && hasGsapSV && !reduceMotionSV) {
    deepCards.forEach((card, i) => {
      if (i === deepCards.length - 1) return;
      gsap.to(card, {
        scale: 0.94, filter: 'brightness(0.75)', ease: 'none',
        scrollTrigger: {
          trigger: deepCards[i + 1], start: 'top bottom', end: 'top top', scrub: true
        }
      });
    });
    gsap.utils.toArray('.deep-card').forEach(card => {
      gsap.from(card, {
        opacity: 0, y: 60, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 92%' }
      });
    });
  }

  /* ---------- 4. PROCESS — pinned horizontal scroll (desktop); snap-scroll fallback (mobile) ---------- */
  const flowTrack = document.getElementById('flowTrack');
  const flowPin = document.getElementById('flowPin');
  if (flowTrack && flowPin && hasGsapSV && !reduceMotionSV && desktopSV) {
    requestAnimationFrame(() => {
      const distance = () => Math.max(flowTrack.scrollWidth - window.innerWidth + 80, 0);
      gsap.to(flowTrack, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.flow', start: 'top top', end: () => '+=' + distance(),
          scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true
        }
      });
      gsap.from('.flow-card', {
        opacity: 0, y: 30, duration: 0.6, stagger: 0.12,
        scrollTrigger: { trigger: '.flow', start: 'top 70%' }
      });
    });
  } else if (flowTrack) {
    gsap && gsap.utils && gsap.utils.toArray('.flow-card').forEach(card => {
      if (hasGsapSV && !reduceMotionSV) {
        gsap.from(card, { opacity: 0, y: 24, duration: 0.6, scrollTrigger: { trigger: card, start: 'top 90%' } });
      }
    });
  }

  /* ---------- 5. ENGAGEMENT MODELS — 3D tilt + glow follow, flip-in entrance ---------- */
  const tierCards = document.querySelectorAll('.tier-card');
  if (tierCards.length) {
    if (desktopSV) {
      tierCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', (px * 100) + '%');
          card.style.setProperty('--my', (py * 100) + '%');
          if (hasGsapSV) {
            gsap.to(card, {
              rotateY: (px - 0.5) * 10, rotateX: (0.5 - py) * 10,
              duration: 0.5, ease: 'power2.out', overwrite: 'auto',
              transformPerspective: 900
            });
          }
        });
        card.addEventListener('mouseleave', () => {
          if (hasGsapSV) gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
        });
      });
    }
    if (hasGsapSV && !reduceMotionSV) {
      gsap.from(tierCards, {
        opacity: 0, y: 50, rotateX: -12, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.tiers-grid', start: 'top 82%' }
      });
    }
  }

  /* ---------- 6. INDUSTRIES — staggered pop-in on scroll ---------- */
  const indCards = document.querySelectorAll('.ind-card');
  if (indCards.length && hasGsapSV && !reduceMotionSV) {
    gsap.from(indCards, {
      opacity: 0, y: 34, scale: 0.92, duration: 0.6, stagger: 0.06, ease: 'power2.out',
      scrollTrigger: { trigger: '.ind-grid', start: 'top 85%' }
    });
  }

  /* ---------- 7. FINAL CTA — floating particle field + entrance ---------- */
  const svctaParticles = document.getElementById('svctaParticles');
  if (svctaParticles && !reduceMotionSV) {
    const COUNT = 18;
    for (let i = 0; i < COUNT; i++) {
      const dot = document.createElement('span');
      dot.className = 'svcta-dot';
      const size = 2 + Math.random() * 4;
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.left = Math.random() * 100 + '%';
      dot.style.top = Math.random() * 100 + '%';
      svctaParticles.appendChild(dot);
      if (hasGsapSV) {
        gsap.to(dot, {
          y: `+=${(Math.random() * 70 + 30) * (Math.random() > 0.5 ? 1 : -1)}`,
          x: `+=${(Math.random() * 50 + 10) * (Math.random() > 0.5 ? 1 : -1)}`,
          opacity: Math.random() * 0.4 + 0.15,
          duration: 5 + Math.random() * 4, ease: 'sine.inOut', yoyo: true, repeat: -1,
          delay: Math.random() * 2
        });
      }
    }
  }
  const svcta = document.getElementById('svcta');
  if (svcta && hasGsapSV && !reduceMotionSV) {
    gsap.from('.svcta-title, .svcta-sub, .svcta-cta', {
      opacity: 0, y: 26, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.svcta-inner', start: 'top 85%' }
    });
  }

  window.addEventListener('load', () => { if (hasGsapSV) ScrollTrigger.refresh(); });
});

/* =========================================================================
   NEW HERO ENHANCEMENTS — home (index.html) + about (about.html).
   Purely additive: no-ops safely if its markup isn't present, and doesn't
   touch any of the animation blocks above.
========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotionHE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopHE = window.matchMedia('(hover:hover) and (min-width:861px)').matches;
  const hasGsapHE = !!window.gsap;

  /* ---------- home hero: cursor-follow spotlight ---------- */
  const heroSection = document.querySelector('.hero');
  const heroSpotlight = document.getElementById('heroSpotlight');
  if (heroSection && heroSpotlight && desktopHE) {
    heroSection.addEventListener('mousemove', (e) => {
      const r = heroSection.getBoundingClientRect();
      heroSpotlight.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%');
      heroSpotlight.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* ---------- about hero: signature underline draw-on (CSS clip-path reveal;
     delayed so it lands just after the char-split title animation settles) ---------- */
  const ahAccent = document.querySelector('.ah-title .accent');
  if (ahAccent) {
    setTimeout(() => ahAccent.classList.add('drawn'), reduceMotionHE ? 0 : 1500);
  }

  /* ---------- about hero: parallax tilt on the photo stack ---------- */
  const ahVisual = document.querySelector('.ah-visual');
  if (ahVisual && desktopHE && hasGsapHE) {
    ahVisual.addEventListener('mousemove', (e) => {
      const r = ahVisual.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to('.ahc-1', { x: px * 10, y: py * 10, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
      gsap.to('.ahc-2', { x: px * 22 - 24, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
      gsap.to('.ahc-3', { x: px * 18 - 20, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
    });
  }
});

/* =========================================================================
   BLOG PAGE — 7 bespoke animations. Appended below; nothing above is touched.
   Every block is guarded by an element id unique to blog.html, so this runs
   only there and never interferes with index/about/services.
========================================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. BLOG HERO — curtain-wipe reveal + magnetic floating tags ---------- */
  const blh = document.getElementById('blh-top');
  if (blh) {
    requestAnimationFrame(() => requestAnimationFrame(() => blh.classList.add('in')));

    const blhVisual = document.getElementById('blhVisual');
    if (blhVisual) {
      const tags = blhVisual.querySelectorAll('.blh-tag');
      let mx = 0, my = 0, tmx = 0, tmy = 0, t = 0;
      blhVisual.addEventListener('mousemove', (e) => {
        const r = blhVisual.getBoundingClientRect();
        tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      blhVisual.addEventListener('mouseleave', () => { tmx = 0; tmy = 0; });
      (function loop() {
        t += 0.015;
        mx += (tmx - mx) * 0.06;
        my += (tmy - my) * 0.06;
        tags.forEach((tag, i) => {
          const depth = parseFloat(tag.dataset.depth) || 30;
          const bob = Math.sin(t + i * 1.7) * 8;
          const px = mx * depth;
          const py = my * depth * 0.6 + bob;
          tag.style.transform = `translate(${px}px, ${py}px)`;
        });
        requestAnimationFrame(loop);
      })();
    }
  }

  /* ---------- 2. EDITOR'S PICK — circular clip-path reveal + slow zoom, on scroll ---------- */
  const blfCard = document.getElementById('blfCard');
  if (blfCard) {
    const blfObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { blfCard.classList.add('in'); blfObserver.unobserve(blfCard); } });
    }, { threshold: 0.3 });
    blfObserver.observe(blfCard);
  }

  /* ---------- 3. ARTICLE GRID — 3D unfold reveal on scroll + live category filter ---------- */
  const blgGrid = document.getElementById('blgGrid');
  if (blgGrid) {
    const blgCards = blgGrid.querySelectorAll('.blg-card');
    const blgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in'); blgObserver.unobserve(entry.target); } });
    }, { threshold: 0.15 });
    blgCards.forEach(c => blgObserver.observe(c));

    const blgChips = document.getElementById('blgChips');
    if (blgChips) {
      blgChips.querySelectorAll('.blg-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          blgChips.querySelectorAll('.blg-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const filter = chip.dataset.filter;
          blgCards.forEach(card => {
            const match = filter === 'all' || card.dataset.cat === filter;
            card.classList.toggle('blg-hide', !match);
          });
        });
      });
    }
  }

  /* ---------- 4. TRENDING — pause dual marquee rows on tap (touch devices) ---------- */
  const blt = document.getElementById('blt');
  if (blt) {
    blt.addEventListener('click', () => {
      const rows = blt.querySelectorAll('.blt-row');
      const paused = rows[0].style.animationPlayState === 'paused';
      rows.forEach(r => { r.style.animationPlayState = paused ? 'running' : 'paused'; });
    });
  }

  /* ---------- 5. MEET THE WRITERS — tap-to-flip for touch devices ---------- */
  const blaTrack = document.getElementById('blaTrack');
  if (blaTrack) {
    blaTrack.querySelectorAll('.bla-card').forEach(card => {
      card.addEventListener('click', () => card.classList.toggle('flipped'));
    });
  }

  /* ---------- 6. NEWSLETTER — paper-plane launch on submit ---------- */
  const blnForm = document.getElementById('blnForm');
  if (blnForm) {
    blnForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = blnForm.querySelector('.bln-btn');
      const note = document.getElementById('blnNote');
      btn.classList.add('sent');
      if (note) note.textContent = "Thanks — check your inbox to confirm.";
      setTimeout(() => { btn.classList.remove('sent'); blnForm.reset(); }, 900);
    });
  }

  /* ---------- 7. FINAL CTA — split title into words + mouse-parallax scattered marks ---------- */
  const blc = document.getElementById('blc');
  if (blc) {
    const blcTitle = document.getElementById('blcTitle');
    if (blcTitle) {
      const words = blcTitle.textContent.trim().split(' ');
      blcTitle.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}">${w}&nbsp;</span>`).join('');
    }
    const marks = blc.querySelectorAll('.blc-marks span');
    blc.addEventListener('mousemove', (e) => {
      const r = blc.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      marks.forEach((m, i) => {
        const depth = (i + 1) * 5;
        m.style.transform = `translate(${mx * depth}px, ${my * depth}px)`;
      });
    });
    blc.addEventListener('mouseleave', () => {
      marks.forEach(m => m.style.transform = 'translate(0,0)');
    });
  }

});


/* =========================================================================
   CONTACT PAGE — 7 bespoke animations. Appended below; nothing above is
   touched. Every block is guarded by an element id unique to contact.html.
========================================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. CONTACT HERO — magnetic letter-repel title ---------- */
  const chTitle = document.getElementById('chTitle');
  if (chTitle) {
    const words = chTitle.textContent.trim().split(' ');
    chTitle.innerHTML = words.map(w =>
      '<span class="cw">' + w.split('').map(c => `<span class="cl">${c}</span>`).join('') + '&nbsp;</span>'
    ).join('');
    const letters = Array.from(chTitle.querySelectorAll('.cl'));
    const heroSection = document.getElementById('ch-top');
    heroSection.addEventListener('mousemove', (e) => {
      letters.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = cx - e.clientX, dy = cy - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 70;
        if (dist < radius) {
          const force = (1 - dist / radius) * 16;
          el.style.transform = `translate(${(dx / dist) * force}px, ${(dy / dist) * force}px)`;
        } else {
          el.style.transform = 'translate(0,0)';
        }
      });
    });
    heroSection.addEventListener('mouseleave', () => {
      letters.forEach(el => { el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------- 3. CONTACT FORM — trust checklist draw-in + wax-seal submit ---------- */
  const cfTrust = document.getElementById('cfTrust');
  if (cfTrust) {
    const cfTrustObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { cfTrust.classList.add('in'); cfTrustObserver.unobserve(cfTrust); } });
    }, { threshold: 0.4 });
    cfTrustObserver.observe(cfTrust);
  }
  const cfForm = document.getElementById('cfForm');
  if (cfForm) {
    cfForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('cfSubmit');
      btn.classList.add('sealed');
      setTimeout(() => { btn.classList.remove('sealed'); cfForm.reset(); }, 2000);
    });
  }

  /* ---------- 4. VISIT OUR OFFICE — scroll-linked depth parallax on the photo + radar pin (pure CSS) ---------- */
  const coSection = document.getElementById('co');
  if (coSection) {
    const coImg = document.getElementById('coImg');
    const coCopy = document.getElementById('coCopy');
    function updateCoParallax() {
      const rect = coSection.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const progress = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      const shift = (clamped - 0.5) * 50;
      if (coImg) coImg.style.transform = `translateY(${shift}px)`;
      if (coCopy) coCopy.style.transform = `translateY(${-shift * 0.35}px)`;
    }
    window.addEventListener('scroll', updateCoParallax, { passive: true });
    updateCoParallax();
  }

  /* ---------- 5. FAQ — single-open accordion with elastic bounce ---------- */
  const cqList = document.getElementById('cqList');
  if (cqList) {
    const items = cqList.querySelectorAll('.cq-item');
    items.forEach(item => {
      item.querySelector('.cq-q').addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ---------- 6. RESPONSE COMMITMENT — live NY clock + repel-on-hover chips ---------- */
  const crClock = document.getElementById('crClock');
  const crStatusText = document.getElementById('crStatusText');
  if (crClock) {
    function tickClock() {
      const now = new Date();
      const nyTime = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: true }).format(now);
      const nyHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false }).format(now), 10);
      crClock.textContent = nyTime + ' local time, New York';
      const isOpenNow = nyHour >= 8 && nyHour < 19;
      if (crStatusText) crStatusText.textContent = isOpenNow ? "We're online right now" : "We're away — leave a message";
    }
    tickClock();
    setInterval(tickClock, 30000);
  }
  const crChips = document.getElementById('crChips');
  if (crChips) {
    const chips = crChips.querySelectorAll('span');
    crChips.addEventListener('mousemove', (e) => {
      chips.forEach(chip => {
        const r = chip.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = cx - e.clientX, dy = cy - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 90;
        if (dist < radius) {
          const force = (1 - dist / radius) * 22;
          chip.style.transform = `translate(${(dx / dist) * force}px, ${(dy / dist) * force}px)`;
        } else {
          chip.style.transform = 'translate(0,0)';
        }
      });
    });
    crChips.addEventListener('mouseleave', () => { chips.forEach(c => c.style.transform = 'translate(0,0)'); });
  }

  /* ---------- 7. FINAL CTA — rotating headline swap + confetti burst on click ---------- */
  const ccRotate = document.getElementById('ccRotate');
  if (ccRotate) {
    const phrases = ['Ready to talk?', 'Have a question?', 'Need counsel now?'];
    let ccIdx = 0;
    setInterval(() => {
      ccRotate.classList.add('out');
      setTimeout(() => {
        ccIdx = (ccIdx + 1) % phrases.length;
        ccRotate.textContent = phrases[ccIdx];
        ccRotate.classList.remove('out');
      }, 450);
    }, 3200);
  }
  const ccBtn = document.getElementById('ccBtn');
  if (ccBtn) {
    ccBtn.addEventListener('click', () => {
      const rect = ccBtn.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const colors = ['#AD8642', '#C9A968', '#F1ECE0'];
      for (let i = 0; i < 16; i++) {
        const dot = document.createElement('span');
        dot.className = 'cc-confetti';
        dot.style.background = colors[i % colors.length];
        dot.style.left = originX + 'px';
        dot.style.top = originY + 'px';
        document.body.appendChild(dot);
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 90;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        dot.animate([
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: `translate(${dx - 4}px, ${dy - 4}px) scale(0)`, opacity: 0 }
        ], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.22,1,.36,1)' });
        setTimeout(() => dot.remove(), 1100);
      }
    });
  }

});


/* =========================================================================
   CONTACT PAGE — 7 bespoke animations. Appended below; nothing above is
   touched. Every block is guarded by an id unique to contact.html, so this
   runs only there and never interferes with the other pages.
========================================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. CONTACT HERO — live New York clock ---------- */
  const cnhClockText = document.getElementById('cnhClockText');
  if (cnhClockText) {
    function tickClock() {
      const now = new Date();
      const nyTime = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York'
      }).format(now);
      cnhClockText.textContent = nyTime + ' in New York';
    }
    tickClock();
    setInterval(tickClock, 30000);
  }

  /* ---------- 2. CONTACT METHODS — SVG icon line-draw on scroll ---------- */
  const cnmGrid = document.getElementById('cnmGrid');
  if (cnmGrid) {
    const cnmCards = cnmGrid.querySelectorAll('.cnm-card');
    const cnmObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('in'), idx * 80);
          cnmObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    cnmCards.forEach(c => cnmObserver.observe(c));
  }

  /* ---------- 3. OFFICE / MAP SPOTLIGHT — scroll-linked parallax ---------- */
  const cnvMedia = document.getElementById('cnvMedia');
  const cnvImg = document.getElementById('cnvImg');
  if (cnvMedia && cnvImg) {
    const onCnvScroll = () => {
      const r = cnvMedia.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const progress = (r.top) / vh; // ~1 when entering from below, ~-1 when leaving above
      const shift = progress * 40; // px
      cnvImg.style.transform = `translateY(${shift}px)`;
    };
    window.addEventListener('scroll', onCnvScroll, { passive: true });
    onCnvScroll();
  }

  /* ---------- 4. ENQUIRY FORM — live completion progress bar ---------- */
  const cnfForm = document.getElementById('cnfForm');
  if (cnfForm) {
    const cnfFields = [document.getElementById('cnfName'), document.getElementById('cnfEmail'), document.getElementById('cnfArea'), document.getElementById('cnfMsg')];
    const cnfBar = document.getElementById('cnfProgressBar');
    function updateCnfProgress() {
      const filled = cnfFields.filter(f => f && f.value && f.value.trim() !== '').length;
      cnfBar.style.width = (filled / cnfFields.length * 100) + '%';
    }
    cnfFields.forEach(f => { if (f) { f.addEventListener('input', updateCnfProgress); f.addEventListener('change', updateCnfProgress); } });

    cnfForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.getElementById('cnfStatus');
      if (status) status.textContent = "Thanks — a partner will reply within one business day.";
      cnfBar.style.width = '100%';
      setTimeout(() => { cnfForm.reset(); updateCnfProgress(); }, 1200);
    });
  }

  /* ---------- 5. FAQ — accordion (single-open) ---------- */
  const cnqList = document.getElementById('cnqList');
  if (cnqList) {
    const items = cnqList.querySelectorAll('.cnq-item');
    items.forEach(item => {
      item.querySelector('.cnq-q').addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  /* ---------- 6. PICK A TIME — day/slot picker + confetti-burst ---------- */
  const cnsDays = document.getElementById('cnsDays');
  if (cnsDays) {
    const dayBtns = cnsDays.querySelectorAll('.cns-day:not(:disabled)');
    const slotBtns = document.querySelectorAll('#cnsSlots .cns-slot');
    const confirmEl = document.getElementById('cnsConfirm');
    const burstEl = document.getElementById('cnsBurst');

    dayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dayBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        slotBtns.forEach(s => s.classList.remove('picked'));
        if (confirmEl) confirmEl.textContent = '';
      });
    });

    function burstConfetti(x, y) {
      const colors = ['#AD8642', '#C9A968', '#14161B', '#F1ECE0'];
      for (let i = 0; i < 18; i++) {
        const p = document.createElement('span');
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 60;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.background = colors[i % colors.length];
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        p.style.animation = 'cnsBurstMove .8s ease-out forwards';
        burstEl.appendChild(p);
        setTimeout(() => p.remove(), 850);
      }
    }

    slotBtns.forEach(slot => {
      slot.addEventListener('click', (e) => {
        slotBtns.forEach(s => s.classList.remove('picked'));
        slot.classList.add('picked');
        const activeDay = cnsDays.querySelector('.cns-day.active');
        const dayLabel = activeDay ? activeDay.dataset.day : 'that day';
        if (confirmEl) confirmEl.textContent = `Held: ${dayLabel} at ${slot.textContent} — confirmation on its way by email.`;
        const rect = slot.getBoundingClientRect();
        const parentRect = burstEl.getBoundingClientRect();
        burstConfetti(rect.left - parentRect.left + rect.width / 2, rect.top - parentRect.top + rect.height / 2);
      });
    });
  }

  /* ---------- 7. FINAL CTA — split-flap (airport board) headline build ---------- */
  const cncBoard = document.getElementById('cncBoard');
  if (cncBoard) {
    const text = "TALK TO A PARTNER TODAY";
    let i = 0;
    text.split('').forEach(ch => {
      const flip = document.createElement('div');
      flip.className = ch === ' ' ? 'cnc-flip space' : 'cnc-flip';
      if (ch !== ' ') {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.setProperty('--i', i);
        const face = document.createElement('div');
        face.className = 'face';
        face.textContent = ch;
        card.appendChild(face);
        flip.appendChild(card);
      }
      cncBoard.appendChild(flip);
      i++;
    });

    const cncObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          cncBoard.querySelectorAll('.card').forEach(card => {
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = '';
          });
          cncObserver.unobserve(cncBoard);
        }
      });
    }, { threshold: 0.4 });
    cncObserver.observe(cncBoard);
  }

});