(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initParallax() {
    if (reducedMotion) return;
    if (window.innerWidth < 768) return;

    const banner = document.querySelector('.banner');
    const media  = banner && banner.querySelector('.banner__media');
    if (!media) return;

    banner.classList.add('aurele-parallax-active');

    const rate = 0.28;
    let raf = null;

    function tick() {
      const scrollY = window.scrollY;
      const bottom  = banner.offsetTop + banner.offsetHeight;
      if (scrollY <= bottom) {
        media.style.transform = `translateY(${(scrollY * rate).toFixed(2)}px)`;
      }
      raf = null;
    }

    window.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  function initReveal() {
    if (reducedMotion || !('IntersectionObserver' in window)) return;

    const vh       = window.innerHeight;
    const sections = document.querySelectorAll(
      '.shopify-section:not(.shopify-section-header):not(.shopify-section-footer)'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.classList.add('aurele-reveal--visible');
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(section => {
      if (section.getBoundingClientRect().top >= vh * 0.85) {
        section.classList.add('aurele-reveal--section');
        observer.observe(section);
      }
    });
  }

  function initHeader() {
    const wrapper = document.querySelector('.header-wrapper');
    if (!wrapper) return;

    function sync() {
      wrapper.classList.toggle('aurele-scrolled', window.scrollY > 20);
    }
    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }

  const COLOR_MAP = {
    'schwarz':      '#1a1a1a',
    'black':        '#1a1a1a',
    'navy':         '#1c2b4a',
    'marine':       '#1c2b4a',
    'marineblau':   '#1c2b4a',
    'bleu marine':  '#1c2b4a',
    'beige':        '#d4c5a9',
    'sand':         '#c8b89a',
    'gold':         '#b8963e',
    'golden':       '#b8963e',
    'champagne':    '#c8a96e',
    'weiß':         '#f2f0eb',
    'weiss':        '#f2f0eb',
    'white':        '#f2f0eb',
    'silber':       '#b8b8b8',
    'silver':       '#b8b8b8',
    'rosé':         '#c9a09a',
    'rose':         '#c9a09a',
    'rose gold':    '#c89085',
    'braun':        '#6b4c3b',
    'brown':        '#6b4c3b',
  };

  const COLOR_LABEL_WORDS = ['farbe', 'color', 'colour', 'couleur', 'colore'];

  function resolveColor(name) {
    return COLOR_MAP[(name || '').toLowerCase().trim()] ?? null;
  }

  function isColorLabel(text) {
    const t = (text || '').toLowerCase();
    return COLOR_LABEL_WORDS.some(w => t.includes(w));
  }

  function syncGroup(group, activeValue) {
    group.querySelectorAll('.aurele-swatch').forEach(btn =>
      btn.setAttribute('aria-checked', btn.dataset.value === activeValue ? 'true' : 'false')
    );
  }

  function buildSwatch(value, displayText, color, isSelected) {
    const btn = document.createElement('button');
    btn.type  = 'button';
    btn.className = 'aurele-swatch';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    btn.setAttribute('title', displayText);
    btn.dataset.value = value;
    btn.style.setProperty('--swatch-color', color);

    const dot = document.createElement('span');
    dot.className = 'aurele-swatch__dot';
    dot.setAttribute('aria-hidden', 'true');

    const sr = document.createElement('span');
    sr.className = 'aurele-swatch__label';
    sr.textContent = displayText;

    btn.append(dot, sr);
    return btn;
  }

  function hideSelect(select) {
    Object.assign(select.style, {
      position:   'absolute',
      width:      '1px',
      height:     '1px',
      overflow:   'hidden',
      clip:       'rect(0,0,0,0)',
      whiteSpace: 'nowrap',
      border:     '0',
    });
    select.setAttribute('tabindex', '-1');
    select.setAttribute('aria-hidden', 'true');
  }

  function enhanceColorSelect(wrapper, select) {
    const coloredOpts = [...select.options].filter(o => resolveColor(o.value));
    if (coloredOpts.length < 2) return;

    const labelEl    = wrapper.querySelector('label');
    const groupLabel = (labelEl?.textContent ?? '').trim().split('\n')[0].trim();

    const group = document.createElement('div');
    group.className = 'aurele-swatches aurele-swatches--large';
    group.setAttribute('role', 'radiogroup');
    if (groupLabel) group.setAttribute('aria-label', groupLabel);

    coloredOpts.forEach(opt => {
      const btn = buildSwatch(opt.value, opt.text.trim(), resolveColor(opt.value), opt.selected);

      btn.addEventListener('click', () => {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncGroup(group, opt.value);
      });

      group.appendChild(btn);
    });

    hideSelect(select);
    select.addEventListener('change', () => syncGroup(group, select.value));
    wrapper.appendChild(group);
  }

  function initSwatches() {
    document.querySelectorAll('variant-selects, variant-radios').forEach(variantEl => {
      variantEl.querySelectorAll('.product-form__input').forEach(wrapper => {
        const labelEl = wrapper.querySelector('label');
        if (!isColorLabel(labelEl?.textContent)) return;
        const select = wrapper.querySelector('select');
        if (select) enhanceColorSelect(wrapper, select);
      });
    });
  }

  function boot() {
    initParallax();
    initReveal();
    initHeader();
    initSwatches();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();