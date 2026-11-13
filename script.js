/* IRZA Portfolio — Native JavaScript, tanpa library. */
(() => {
  'use strict';
  const header = document.querySelector('#header');
  const nav = document.querySelector('#navigation');
  const toggle = document.querySelector('.menu-toggle');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  const progress = document.querySelector('.scroll-progress');
  const hero = document.querySelector('#home');
  const heroBg = document.querySelector('.hero-bg');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 760px)');

  // 1. Menu mobile: tutup saat memilih link, klik luar, Escape atau resize.
  function setMenu(open, returnFocus = false) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  mobile.addEventListener('change', () => setMenu(false));

  // 2. Animasi reveal sekali saat elemen masuk viewport.
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
    document.documentElement.classList.add('js-ready');
    reveals.forEach(element => observer.observe(element));
    reduced.addEventListener('change', event => {
      if (event.matches) {
        observer.disconnect();
        reveals.forEach(element => element.classList.add('is-visible'));
      }
    });
  }

  // 3. Scrollspy, tema navbar, progress bar, dan parallax ringan.
  let pending = false;
  function updateScroll() {
    const y = window.scrollY;
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const headerHeight = header.offsetHeight;
    const marker = y + headerHeight + 60;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top + y <= marker) active = section;
    }
    if (max > 0 && y >= max - 4) active = sections.at(-1);
    links.forEach(link => {
      const current = link.hash === '#' + active.id;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const dark = active.classList.contains('dark-section');
    header.classList.toggle('is-dark', dark);
    header.classList.toggle('is-light', !dark);
    header.classList.toggle('scrolled', y > 25);
    progress.style.transform = `scaleX(${max ? Math.min(1, y / max) : 0})`;
    const offset = !reduced.matches && !mobile.matches && y < hero.offsetHeight ? Math.min(22, y * 0.035) : 0;
    heroBg.style.setProperty('--hero-offset', `${offset}px`);
    pending = false;
  }
  function requestUpdate() {
    if (!pending) { pending = true; requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate);
  reduced.addEventListener('change', requestUpdate);
  mobile.addEventListener('change', requestUpdate);
  updateScroll();

  // 4. Lightbox foto dan sertifikat, dengan navigasi keyboard.
  const dialog = document.querySelector('#lightbox');
  const image = document.querySelector('#lightbox-image');
  const caption = document.querySelector('#lightbox-caption');
  const prev = dialog.querySelector('.lightbox-prev');
  const next = dialog.querySelector('.lightbox-next');
  const close = dialog.querySelector('.lightbox-close');
  const media = [...document.querySelectorAll('[data-lightbox]')];
  let items = [], index = 0, opener = null;
  function showItem() {
    const item = items[index];
    image.src = item.href;
    image.alt = item.querySelector('img')?.alt || item.dataset.caption || 'Preview';
    caption.textContent = `${item.dataset.caption || image.alt} · ${index + 1}/${items.length}`;
    prev.hidden = next.hidden = items.length < 2;
  }
  function move(step) {
    index = (index + step + items.length) % items.length;
    showItem();
  }
  media.forEach(item => item.addEventListener('click', event => {
    if (typeof dialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const group = item.closest('.gallery') ? '.gallery' : '.cert-list';
    items = [...item.closest(group).querySelectorAll('[data-lightbox]')];
    index = items.indexOf(item);
    opener = item;
    showItem();
    dialog.showModal();
    document.body.classList.add('modal-open');
    close.focus();
  }));
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
  // 5. Tahun footer otomatis.
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
