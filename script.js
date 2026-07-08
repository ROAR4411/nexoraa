/* ===================================================================
   CADENCE — script.js
   Vanilla JS, no dependencies. Organized as small independent modules,
   each guarded so a missing element never throws and blocks the rest.
   Table of contents:
     1. Utilities
     2. Loading screen
     3. Scroll progress bar
     4. Mouse glow (pointer only, respects reduced motion)
     5. Theme toggle (persisted to localStorage)
     6. Announcement bar (dismiss, persisted for the session)
     7. Navbar scroll state + mobile menu
     8. Hero typing effect + console log lines
     9. Animated counters (IntersectionObserver)
     10. Product showcase tabs
     11. AI workflow / scroll reveal (IntersectionObserver)
     12. Pricing monthly/yearly toggle
     13. FAQ accordion
     14. Contact form validation
     15. Newsletter form validation
     16. Copy-to-clipboard buttons
     17. Back to top button
     18. Sticky CTA
     19. Cookie banner
   =================================================================== */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const announce = (msg) => {
    const region = $('#live-region');
    if (region) region.textContent = msg;
  };

  /* ---------------- 1. UTILITIES ---------------- */
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ---------------- 2. LOADING SCREEN ---------------- */
  function initLoadingScreen() {
    const screen = $('#loading-screen');
    if (!screen) return;
    const hide = () => {
      screen.classList.add('is-hidden');
      screen.addEventListener('transitionend', () => screen.remove(), { once: true });
      // Safety: remove even if transitionend never fires (e.g. reduced motion)
      setTimeout(() => screen.remove(), 700);
    };
    if (document.readyState === 'complete') {
      setTimeout(hide, 250);
    } else {
      window.addEventListener('load', () => setTimeout(hide, 250));
      // Hard safety net so the page is never stuck behind the loader
      setTimeout(hide, 3000);
    }
  }

  /* ---------------- 3. SCROLL PROGRESS BAR ---------------- */
  function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      const pct = height > 0 ? (scrollTop / height) * 100 : 0;
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    };
    document.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  }

  /* ---------------- 4. MOUSE GLOW ---------------- */
  function initMouseGlow() {
    const glow = $('#mouse-glow');
    if (!glow || prefersReducedMotion || matchMedia('(pointer: coarse)').matches) {
      if (glow) glow.remove();
      return;
    }
    let raf = null;
    document.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        glow.style.setProperty('--mx', e.clientX + 'px');
        glow.style.setProperty('--my', e.clientY + 'px');
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------------- 5. THEME TOGGLE ---------------- */
  function initThemeToggle() {
    const toggle = $('#theme-toggle');
    const root = document.documentElement;
    const STORAGE_KEY = 'cadence-theme';

    const setTheme = (theme, persist) => {
      if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme');
      }
      if (toggle) {
        toggle.setAttribute('aria-pressed', String(theme === 'light'));
        toggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      }
      if (persist) {
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* private mode: ignore */ }
      }
    };

    // The inline <head> script already applied the correct theme pre-paint;
    // this just syncs the toggle's ARIA state to match on load.
    setTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);

    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      setTheme(next, true);
      announce(next === 'light' ? 'Light mode enabled' : 'Dark mode enabled');
    });
  }

  /* ---------------- 6. ANNOUNCEMENT BAR ---------------- */
  function initAnnouncementBar() {
    const bar = $('#announcement-bar');
    const close = $('#announcement-close');
    if (!bar || !close) return;
    const KEY = 'cadence-announcement-dismissed';
    try {
      if (sessionStorage.getItem(KEY) === '1') bar.classList.add('is-hidden');
    } catch (e) { /* ignore */ }
    close.addEventListener('click', () => {
      bar.classList.add('is-hidden');
      try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
    });
  }

  /* ---------------- 7. NAVBAR + MOBILE MENU ---------------- */
  function initNavbar() {
    const navbar = $('#navbar');
    const navToggle = $('#nav-toggle');
    const navLinks = $('#navbar-links');
    if (navbar) {
      const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 8);
      document.addEventListener('scroll', debounce(onScroll, 10), { passive: true });
      onScroll();
    }
    if (!navToggle || !navLinks) return;
    const closeMenu = () => {
      navToggle.classList.remove('is-open');
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    // Close the mobile menu after choosing a link, or on Escape
    navLinks.addEventListener('click', (e) => { if (e.target.tagName === 'A') closeMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------------- 8. HERO TYPING EFFECT ---------------- */
  function initTypingEffect() {
    const target = $('#typing-target');
    const log = $('#console-log');
    if (!target) return;

    const line = 'Draft a reply for Jonah Terrace and update the CRM stage.';
    const logEntries = [
      'Matched Jonah Terrace to Enterprise pricing tier',
      'Drafted reply in your team\u2019s tone \u2014 queued for review',
      'CRM stage updated: Qualified \u2192 Meeting booked'
    ];

    if (prefersReducedMotion) {
      target.textContent = line;
      if (log) log.innerHTML = logEntries.map((t) => `<li>${t}</li>`).join('');
      return;
    }

    let i = 0;
    (function type() {
      if (i <= line.length) {
        target.textContent = line.slice(0, i);
        i++;
        setTimeout(type, 28);
      } else if (log) {
        logEntries.forEach((text, idx) => {
          const li = document.createElement('li');
          li.textContent = text;
          li.style.animationDelay = (idx * 0.35) + 's';
          log.appendChild(li);
        });
      }
    })();
  }

  /* ---------------- 9. ANIMATED COUNTERS ---------------- */
  function initCounters() {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseFloat(el.getAttribute('data-target') || '0');
      const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const divisor = Math.pow(10, decimals);
      const displayTarget = target / divisor;

      if (prefersReducedMotion) {
        el.textContent = displayTarget.toFixed(decimals) + suffix;
        return;
      }

      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const value = (target * eased) / divisor;
        el.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => io.observe(el));
  }

  /* ---------------- 10. PRODUCT SHOWCASE TABS ---------------- */
  function initShowcaseTabs() {
    const tabs = $$('.showcase-tab');
    const views = $$('.showcase-view');
    if (!tabs.length) return;

    const activate = (tab) => {
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
        t.setAttribute('tabindex', active ? '0' : '-1');
      });
      views.forEach((v) => v.classList.toggle('is-active', v.getAttribute('data-view') === tab.getAttribute('data-tab')));
    };

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          const next = tabs[(idx + dir + tabs.length) % tabs.length];
          next.focus();
          activate(next);
        }
      });
    });
  }

  /* ---------------- 11. SCROLL REVEAL ---------------- */
  function initScrollReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------------- 12. PRICING TOGGLE ---------------- */
  function initPricingToggle() {
    const toggle = $('#pricing-switch');
    const values = $$('.price-value');
    const labels = $$('.pricing-toggle-label');
    if (!toggle || !values.length) return;

    const setPeriod = (yearly) => {
      toggle.setAttribute('aria-checked', String(yearly));
      labels.forEach((l) => l.classList.toggle('is-active', l.getAttribute('data-label') === (yearly ? 'yearly' : 'monthly')));
      values.forEach((v) => {
        const price = yearly ? v.getAttribute('data-yearly') : v.getAttribute('data-monthly');
        if (!price) return;
        v.classList.add('is-updating');
        v.textContent = price;
        setTimeout(() => v.classList.remove('is-updating'), 220);
      });
    };

    toggle.addEventListener('click', () => setPeriod(toggle.getAttribute('aria-checked') !== 'true'));
    labels.forEach((label) => {
      label.style.cursor = 'pointer';
      label.addEventListener('click', () => setPeriod(label.getAttribute('data-label') === 'yearly'));
    });
  }

  /* ---------------- 13. FAQ ACCORDION ---------------- */
  function initFaqAccordion() {
    const items = $$('.faq-item');
    if (!items.length) return;

    items.forEach((item, idx) => {
      const question = $('.faq-question', item);
      const answer = $('.faq-answer', item);
      if (!question || !answer) return;

      // Wire up ARIA relationship + collapsed height at runtime
      const id = 'faq-answer-' + idx;
      answer.id = id;
      question.setAttribute('aria-controls', id);

      question.addEventListener('click', () => {
        const isOpen = question.getAttribute('aria-expanded') === 'true';
        // Close any other open item for a cleaner single-open accordion
        items.forEach((other) => {
          if (other === item) return;
          const q = $('.faq-question', other);
          const a = $('.faq-answer', other);
          if (q && q.getAttribute('aria-expanded') === 'true') {
            q.setAttribute('aria-expanded', 'false');
            if (a) a.style.maxHeight = null;
          }
        });
        question.setAttribute('aria-expanded', String(!isOpen));
        answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
      });
    });
  }

  /* ---------------- 14. CONTACT FORM VALIDATION ---------------- */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    const success = $('#form-success');

    const validators = {
      'cf-name': (v) => v.trim().length > 1,
      'cf-email': (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      'cf-company': (v) => v.trim().length > 1,
      'cf-message': (v) => v.trim().length > 9
    };

    const validateField = (input) => {
      const rule = validators[input.id];
      if (!rule) return true;
      const valid = rule(input.value);
      const field = input.closest('.form-field');
      if (field) field.classList.toggle('is-invalid', !valid);
      input.setAttribute('aria-invalid', String(!valid));
      return valid;
    };

    $$('input, textarea', form).forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.closest('.form-field')?.classList.contains('is-invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = $$('input, textarea', form);
      const allValid = inputs.map(validateField).every(Boolean);
      if (!allValid) {
        const firstInvalid = form.querySelector('.is-invalid input, .is-invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        announce('There are errors in the form. Please review the highlighted fields.');
        return;
      }
      // No backend is wired up in this template — simulate a successful send.
      if (success) {
        success.hidden = false;
        announce('Message sent. A Cadence specialist will reply within one business day.');
      }
      form.reset();
    });
  }

  /* ---------------- 15. NEWSLETTER FORM ---------------- */
  function initNewsletterForm() {
    const form = $('#newsletter-form');
    const status = $('#newsletter-status');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#newsletter-email', form);
      const valid = input && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!valid) {
        if (status) status.textContent = 'Please enter a valid email address.';
        input?.focus();
        return;
      }
      if (status) status.textContent = 'Subscribed — welcome to the Cadence journal.';
      form.reset();
    });
  }

  /* ---------------- 16. COPY TO CLIPBOARD ---------------- */
  function initCopyButtons() {
    const buttons = $$('.copy-btn');
    if (!buttons.length) return;
    buttons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.getAttribute('data-copy');
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
        } catch (e) {
          // Fallback for browsers without Clipboard API permissions
          const temp = document.createElement('textarea');
          temp.value = text;
          temp.style.position = 'fixed';
          temp.style.opacity = '0';
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        }
        btn.classList.add('is-copied');
        announce(text + ' copied to clipboard');
        setTimeout(() => btn.classList.remove('is-copied'), 1600);
      });
    });
  }

  /* ---------------- 17. BACK TO TOP ---------------- */
  function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('is-visible', window.scrollY > 600);
    document.addEventListener('scroll', debounce(onScroll, 10), { passive: true });
    onScroll();
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------- 18. STICKY CTA ---------------- */
  function initStickyCta() {
    const cta = $('#sticky-cta');
    const close = $('#sticky-cta-close');
    if (!cta) return;
    const KEY = 'cadence-sticky-cta-dismissed';
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* ignore */ }

    const pricing = $('#pricing');
    const onScroll = () => {
      if (dismissed) return;
      const pastHero = window.scrollY > window.innerHeight * 1.2;
      const beforePricing = !pricing || window.scrollY < pricing.offsetTop - 200;
      cta.classList.toggle('is-visible', pastHero && beforePricing);
    };
    document.addEventListener('scroll', debounce(onScroll, 20), { passive: true });

    if (close) {
      close.addEventListener('click', () => {
        dismissed = true;
        cta.classList.remove('is-visible');
        try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
      });
    }
  }

  /* ---------------- 19. COOKIE BANNER ---------------- */
  function initCookieBanner() {
    const banner = $('#cookie-banner');
    if (!banner) return;
    const KEY = 'cadence-cookie-choice';
    let choice = null;
    try { choice = localStorage.getItem(KEY); } catch (e) { /* ignore */ }

    if (!choice) {
      setTimeout(() => banner.classList.add('is-visible'), 1200);
    }
    const decide = (value) => {
      banner.classList.remove('is-visible');
      try { localStorage.setItem(KEY, value); } catch (e) { /* ignore */ }
    };
    $('#cookie-accept')?.addEventListener('click', () => decide('accepted'));
    $('#cookie-decline')?.addEventListener('click', () => decide('declined'));
  }

  /* ---------------- INIT ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initScrollProgress();
    initMouseGlow();
    initThemeToggle();
    initAnnouncementBar();
    initNavbar();
    initTypingEffect();
    initCounters();
    initShowcaseTabs();
    initScrollReveal();
    initPricingToggle();
    initFaqAccordion();
    initContactForm();
    initNewsletterForm();
    initCopyButtons();
    initBackToTop();
    initStickyCta();
    initCookieBanner();
  });
})();
