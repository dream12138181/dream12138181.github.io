/* ===== Butterfly Custom JS ===== */
(function() {
  'use strict';

  /* --- Staggered card entrance animation --- */
  function checkCardVisibility() {
    const cards = document.querySelectorAll('.recent-post-item');
    if (cards.length === 0) return;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight - 50;
      if (isVisible) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      }
    });
  }

  /* --- Smooth scroll for navigation links --- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* --- Page transition fade effect --- */
  function initPageTransition() {
    const mainContent = document.querySelector('#content-inner');
    if (mainContent) {
      mainContent.style.animation = 'fadeInUp 0.6s ease both';
    }
  }

  /* --- Scroll progress indicator for posts --- */
  function initScrollProgress() {
    const goUp = document.getElementById('go-up');
    if (!goUp) return;

    window.addEventListener('scroll', function() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        const progress = Math.round((scrollTop / scrollHeight) * 100);
        const percentEl = goUp.querySelector('.scroll-percent');
        if (percentEl) {
          percentEl.textContent = progress + '%';
        }
      }
    });
  }

  /* --- Initialize all enhancements --- */
  document.addEventListener('DOMContentLoaded', function() {
    initSmoothScroll();
    initScrollProgress();
  });

  /* --- Re-run on PJAX navigation (if enabled) --- */
  window.addEventListener('pjax:complete', function() {
    initPageTransition();
    checkCardVisibility();
  });

  /* --- Initial page load transition --- */
  window.addEventListener('load', function() {
    initPageTransition();
    setTimeout(checkCardVisibility, 300);
  });

  /* --- Check visibility on scroll --- */
  window.addEventListener('scroll', function() {
    checkCardVisibility();
  }, { passive: true });

})();
