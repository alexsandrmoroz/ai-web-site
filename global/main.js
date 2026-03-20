/* ============================================================
   CodeBridge Foundation — Global JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Page Embed Loader ────────────────────────────────── */
  const BASE = 'https://cdn.jsdelivr.net/gh/alexsandrmoroz/ai-web-site@main';

  async function loadPageEmbed() {
    const embed = document.querySelector('[data-page]');
    if (!embed) { init(); return; }

    const slug = embed.getAttribute('data-page');
    const url  = BASE + '/pages/' + slug + '.html';

    try {
      const res = await fetch(url);
      if (!res.ok) { console.warn('Could not load page:', url); init(); return; }
      embed.innerHTML = await res.text();
    } catch (e) {
      console.warn('Failed to fetch page:', url, e);
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
  const KOMMO_API   = 'https://api-c.kommo.com/api/v4';
  const KOMMO_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjA5OWZhYmE3NWM3ZjI3NDEzNTdlZTRkMDk2OWMzMWQyNDViYzM1Njc3NTBiOWRlMjQwOTczZDA3MTY5ZDZiNDBhYTg1NWRlNDVhZGMxNDMzIn0.eyJhdWQiOiJkMTU5YzA5OC0xMjVjLTQxNTAtOTdiZC0xYzg1YjU3MjVmYjQiLCJqdGkiOiIwOTlmYWJhNzVjN2YyNzQxMzU3ZWU0ZDA5NjljMzFkMjQ1YmMzNTY3NTUwYjlkZTI0MDk3M2QwNzE2OWQ2YjQwYWE4NTVkZTQ1YWRjMTQzMyIsImlhdCI6MTc3Mzg2MzkzOSwibmJmIjoxNzczODYzOTM5LCJleHAiOjE3NzUwMDE2MDAsInN1YiI6IjE0OTc0Mzk5IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM2MjIyNjkxLCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiMzdkNTliYmMtYjU2Ni00YmFjLThjMzItNzQ5MjBmM2IyNDY5IiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.PqCcyAajOr8VwPP6ZtKwIxdTVcvzSgmmDFzqgR5gAyiH0kP3PopKxrQV8bmS2_jnp6QlPJ9F1UGolhB4xNxJynTvSXEtyLk7D1CIsKYPCMVox9nYyoVYZg0Wyw7WkYxDgU37-FgN1YxbAvylZicg9Wa-wFqiPluL5w4iTcMy9yQQQ-oH-EmJ4a1zjI3a8HKCbXqg7uvqUpdN0KZo90auaN-JDuVvuljQnvW0cV_7SPOSdv1T0-7Xyq_lWezc3ynfwBT02BixZF_ZF1U4i4NPvNE_lyBbRkfMQA2HcZb8pIbQw3Py77QxY2PSNi1IjzcFm-DDY39pwk1AslXzVVWzgQ';

  async function sendToKommo({ firstName, lastName, email, phone, idea }) {
    const headers = {
      Authorization: `Bearer ${KOMMO_TOKEN}`,
      'Content-Type': 'application/json',
    };

    try {
      /* 1. Create contact */
      const contactRes = await fetch(`${KOMMO_API}/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify([{
          first_name: firstName,
          last_name:  lastName,
          custom_fields_values: [
            email && { field_code: 'EMAIL', values: [{ value: email, enum_code: 'WORK' }] },
            phone && { field_code: 'PHONE', values: [{ value: phone, enum_code: 'WORK' }] },
          ].filter(Boolean),
        }]),
      });
      const contactData = await contactRes.json();
      const contactId   = contactData?._embedded?.contacts?.[0]?.id;

      /* 2. Create lead */
      const leadRes = await fetch(`${KOMMO_API}/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify([{
          name: `${firstName} ${lastName}`.trim() || email,
          _embedded: { contacts: contactId ? [{ id: contactId }] : [] },
          custom_fields_values: idea ? [
            { field_code: 'DESCRIPTION', values: [{ value: idea }] },
          ] : [],
        }]),
      });
      const leadData = await leadRes.json();
      const leadId   = leadData?._embedded?.leads?.[0]?.id;
      console.log('Kommo lead created:', leadId);
    } catch (err) {
      console.warn('Kommo CRM error:', err);
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
    const DEPLOY_TIME = new Date('2026-03-20T10:30:00Z');
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
    document.addEventListener('DOMContentLoaded', loadPageEmbed);
  } else {
    loadPageEmbed();
  }
})();
