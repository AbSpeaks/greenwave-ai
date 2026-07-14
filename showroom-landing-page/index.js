/* =============================================
   GREENWAVE — MAIN JAVASCRIPT (REFINED)
   SpaceX & Tesla Inspired Minimalist Layout
   ============================================= */

'use strict';

// ─── NAVBAR SCROLL EFFECT ─────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ─── SMOOTH SCROLL FOR NAV LINKS ──────────────
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

// ─── SCROLL REVEAL (INTERSECTION OBSERVER) ────
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

// ─── MODAL CONTROLLERS ─────────────────────────
function openModal(type) {
  const modal = document.getElementById(`modal-${type}`);
  if (!modal) return;

  // Reset form views in case of previous success submission
  const form = document.getElementById(`form-${type}`);
  const successMsg = document.getElementById(`success-${type}`);
  if (form) form.style.display = 'block';
  if (successMsg) successMsg.style.display = 'none';

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  // Focus trap focusable elements
  const focusable = modal.querySelectorAll('input, textarea, button');
  if (focusable.length) focusable[0].focus();
}

function closeModal(type) {
  const modal = document.getElementById(`modal-${type}`);
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

// Global modal overlay click handler (close on overlay click)
(function initModalOverlayClicks() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) {
        const id = this.id.replace('modal-', '');
        closeModal(id);
      }
    });
  });

  // Close on Escape key press
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        const id = activeModal.id.replace('modal-', '');
        closeModal(id);
      }
    }
  });
})();

// ─── FORM SUBMISSIONS HANDLER ─────────────────
function handleFormSubmit(event, type) {
  event.preventDefault();
  
  const form = document.getElementById(`form-${type}`);
  const successMsg = document.getElementById(`success-${type}`);
  
  if (!form || !successMsg) return;

  // Extract form details
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  console.log(`Submitted ${type} form successfully:`, data);

  // Transition form to success message block
  form.style.display = 'none';
  successMsg.style.display = 'block';

  // Reset fields for future opens
  form.reset();
}
