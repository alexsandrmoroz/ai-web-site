/* ============================================================
   CodeBridge Foundation — Global JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Section Loader ───────────────────────────────────── */
  const BASE = 'https://alexsandrmoroz.github.io/ai-web-site';
  const SECTIONS = [
    BASE + '/global/nav.html',
    BASE + '/pages/home/hero.html',
    BASE + '/pages/home/mission.html',
    BASE + '/pages/home/services.html',
    BASE + '/pages/home/industries.html',
    BASE + '/pages/home/techstack.html',
    BASE + '/pages/home/team.html',
    BASE + '/pages/home/volunteer.html',
    BASE + '/pages/home/blog.html',
    BASE + '/pages/home/contact.html',
    BASE + '/pages/home/image.html',
    BASE + '/global/footer.html',
  ];

  async function loadSections() {
    const container = document.getElementById('cb-app') || document.body;
    for (const url of SECTIONS) {
      try {
        const res = await fetch(url);
        if (!res.ok) { console.warn('Could not load:', url); continue; }
        const html = await res.text();
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        container.appendChild(wrapper);
      } catch (e) {
        console.warn('Failed to fetch:', url, e);
      }
    }
    init();
  }

  /* ── CSS Loader ───────────────────────────────────────── */
  function loadCSS() {
    if (document.querySelector('link[data-cb-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE + '/global/main.css';
    link.setAttribute('data-cb-styles', '1');
    document.head.appendChild(link);
  }

  /* ── Kommo CRM ────────────────────────────────────────── */
  const KOMMO_FUNCTION_URL = 'https://us-central1-ai-forms-25ad9.cloudfunctions.net/submitLead';

  async function sendToKommo(data) {
    try {
      const res = await fetch(KOMMO_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) console.warn('Kommo CRM error:', json);
      else console.log('Kommo lead created:', json.leadId);
    } catch (err) {
      console.warn('Kommo CRM unreachable:', err);
    }
  }

  /* ── Firebase Config ──────────────────────────────────── */
  const firebaseConfig = {
    apiKey: "AIzaSyCZV7nDI1ej4xQgTwoM9shKweXt0-6pqQs",
    authDomain: "ai-forms-25ad9.firebaseapp.com",
    projectId: "ai-forms-25ad9",
    storageBucket: "ai-forms-25ad9.firebasestorage.app",
    messagingSenderId: "710083224092",
    appId: "1:710083224092:web:4c2d2279e5b4dae0ed35d9"
  };
  const COLLECTION_NAME = "codebridge-applications";

  /* ── Nav: Scroll Shadow ───────────────────────────────── */
  function initNavScroll() {
    const header = document.querySelector('.nav-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Nav: Services Dropdown ───────────────────────────── */
  function initDropdown() {
    const btn = document.querySelector('.nav-services-btn');
    const menu = document.querySelector('.nav-dropdown-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('open');
      menu.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });

    menu.addEventListener('click', (e) => e.stopPropagation());
  }

  /* ── Nav: Mobile Hamburger ────────────────────────────── */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const servicesToggle = document.querySelector('.mobile-services-toggle');
    const servicesSub = document.querySelector('.mobile-services-sub');

    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', !isOpen);
      hamburger.classList.toggle('open', !isOpen);
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.setAttribute('aria-hidden', String(isOpen));
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    if (servicesToggle && servicesSub) {
      servicesToggle.addEventListener('click', () => {
        servicesSub.classList.toggle('open');
      });
    }

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll Animations (IntersectionObserver) ─────────── */
  function initScrollAnimations() {
    const targets = document.querySelectorAll('.fade-up');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(el => observer.observe(el));
  }

  /* ── Firebase: Contact Form ───────────────────────────── */
  async function initContactForm() {
    const form = document.getElementById('guidance-form');
    if (!form) return;

    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js');
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js');

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('.form-submit');
        const msgEl = form.querySelector('.form-message');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
        if (msgEl) { msgEl.className = 'form-message'; msgEl.textContent = ''; }

        const data = {
          firstName: form.firstName?.value?.trim() || '',
          lastName:  form.lastName?.value?.trim()  || '',
          email:     form.email?.value?.trim()      || '',
          phone:     form.phone?.value?.trim()      || '',
          idea:      form.idea?.value?.trim()        || '',
          submittedAt: serverTimestamp()
        };

        try {
          await Promise.all([
            addDoc(collection(db, COLLECTION_NAME), data),
            sendToKommo({
              firstName: data.firstName,
              lastName:  data.lastName,
              email:     data.email,
              phone:     data.phone,
              idea:      data.idea,
            }),
          ]);
          if (msgEl) {
            msgEl.textContent = 'Thank you! We\'ll be in touch soon.';
            msgEl.className = 'form-message success';
          }
          form.reset();
        } catch (err) {
          console.error('Form submission error:', err);
          if (msgEl) {
            msgEl.textContent = 'Something went wrong. Please try again.';
            msgEl.className = 'form-message error';
          }
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      });
    } catch (err) {
      console.warn('Firebase could not be initialized:', err);
    }
  }

  /* ── Counter Animation ────────────────────────────────── */
  function animateCounter(el, target, duration = 1500) {
    const start = performance.now();
    const isDecimal = String(target).includes('.');
    const update = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = isDecimal
        ? value.toFixed(1)
        : Math.floor(value).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  /* ── Deploy Badge ─────────────────────────────────────── */
  function initDeployBadge() {
    const DEPLOY_TIME = new Date('2026-03-16T20:50:00Z');
    const label = DEPLOY_TIME.toLocaleString('uk-UA', {
      timeZone: 'Europe/Kyiv',
      day:    '2-digit',
      month:  '2-digit',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    });

    const badge = document.createElement('div');
    badge.id = 'cb-deploy-badge';
    badge.textContent = '🕐 ' + label;
    badge.style.cssText = [
      'position:fixed',
      'bottom:16px',
      'right:16px',
      'z-index:99999',
      'background:rgba(0,0,0,0.75)',
      'color:#a3e635',
      'font:600 11px/1 monospace',
      'padding:6px 10px',
      'border-radius:6px',
      'border:1px solid rgba(163,230,53,0.3)',
      'pointer-events:none',
      'backdrop-filter:blur(4px)',
    ].join(';');
    document.body.appendChild(badge);
  }

  /* ── Bootstrap ────────────────────────────────────────── */
  function init() {
    initNavScroll();
    initDropdown();
    initMobileMenu();
    initScrollAnimations();
    initContactForm();
    initCounters();
    initDeployBadge();
  }

  /* ── Entry Point ──────────────────────────────────────── */
  loadCSS();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSections);
  } else {
    loadSections();
  }
})();
