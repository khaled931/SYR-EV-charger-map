(() => {
  'use strict';

  const STYLE_ID = 'sr-ev-final-ui-fix-style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @import url('https://fonts.googleapis.com/earlyaccess/droidarabicnaskh.css');
      @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700;8..60,900&display=swap');

      html[lang="ar"] { --sr-font: 'Droid Arabic Naskh', Tahoma, Arial, sans-serif !important; }
      html[lang="en"] { --sr-font: 'Source Serif 4', 'Source Serif Pro', Georgia, serif !important; }
      body, .ev-app, .ev-app *, .leaflet-container, .leaflet-container *, button, input, select, textarea {
        font-family: var(--sr-font) !important;
      }
      .leaflet-control-zoom a { font-family: Arial, sans-serif !important; }

      #filtersOverlay[hidden] { display: none !important; }
      #filtersOverlay {
        position: fixed !important;
        inset: 0 !important;
        z-index: 99980 !important;
        display: block;
        background: rgba(10, 25, 30, .32) !important;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }

      #filtersPanel {
        position: fixed !important;
        top: 66px !important;
        left: 16px !important;
        right: auto !important;
        bottom: 16px !important;
        width: min(420px, calc(100vw - 32px)) !important;
        max-width: 420px !important;
        height: auto !important;
        z-index: 99990 !important;
        display: block !important;
        overflow: auto !important;
        padding: 16px !important;
        border: 1px solid rgba(33,122,141,.22) !important;
        border-radius: 24px !important;
        background: rgba(255,255,255,.94) !important;
        box-shadow: 0 24px 75px rgba(35,43,43,.25) !important;
        backdrop-filter: blur(22px) saturate(1.18) !important;
        -webkit-backdrop-filter: blur(22px) saturate(1.18) !important;
        transform: translate3d(calc(-100% - 36px), 0, 0) !important;
        transition: transform .24s ease, opacity .18s ease !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      html[data-theme="dark"] #filtersPanel {
        background: rgba(16,40,47,.96) !important;
      }
      html.filters-open #filtersPanel {
        transform: translate3d(0, 0, 0) !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      html[dir="ltr"] #filtersPanel {
        left: 16px !important;
        right: auto !important;
        transform: translate3d(calc(-100% - 36px), 0, 0) !important;
      }
      html[dir="ltr"].filters-open #filtersPanel,
      html[dir="rtl"].filters-open #filtersPanel {
        transform: translate3d(0, 0, 0) !important;
      }
      #filtersPanel .ev-filters-panel__head {
        position: sticky;
        top: -16px;
        z-index: 2;
        margin: -16px -16px 14px;
        padding: 14px 16px;
        background: inherit;
        border-bottom: 1px solid rgba(33,122,141,.18);
      }
      #filtersPanel .ev-filters {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }

      @media (max-width: 760px) {
        #filtersPanel {
          top: 8px !important;
          left: 8px !important;
          bottom: 8px !important;
          width: min(92vw, 390px) !important;
          border-radius: 22px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function portalFilters() {
    const overlay = document.getElementById('filtersOverlay');
    const panel = document.getElementById('filtersPanel');
    if (!overlay || !panel) return false;

    if (overlay.parentElement !== document.body) document.body.appendChild(overlay);
    if (panel.parentElement !== document.body) document.body.appendChild(panel);

    overlay.hidden = !document.documentElement.classList.contains('filters-open');
    panel.setAttribute('aria-hidden', document.documentElement.classList.contains('filters-open') ? 'false' : 'true');
    return true;
  }

  function closeFilters() {
    const overlay = document.getElementById('filtersOverlay');
    const panel = document.getElementById('filtersPanel');
    document.documentElement.classList.remove('filters-open');
    if (overlay) overlay.hidden = true;
    if (panel) panel.setAttribute('aria-hidden', 'true');
  }

  function openFilters() {
    const overlay = document.getElementById('filtersOverlay');
    const panel = document.getElementById('filtersPanel');
    portalFilters();
    document.documentElement.classList.add('filters-open');
    if (overlay) overlay.hidden = false;
    if (panel) {
      panel.setAttribute('aria-hidden', 'false');
      const firstField = panel.querySelector('input, select, button');
      setTimeout(() => firstField && firstField.focus({ preventScroll: true }), 80);
    }
  }

  function bindDrawer() {
    document.addEventListener('click', (event) => {
      const menuButton = event.target.closest('#mobileFiltersToggle, #desktopFiltersToggle');
      const closeButton = event.target.closest('#closeFiltersButton');
      const overlay = event.target.id === 'filtersOverlay';

      if (menuButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        document.documentElement.classList.contains('filters-open') ? closeFilters() : openFilters();
        return;
      }
      if (closeButton || overlay) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeFilters();
      }
    }, true);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeFilters();
    });
  }

  function boot() {
    injectStyle();
    portalFilters();
    bindDrawer();
    const observer = new MutationObserver(() => portalFilters());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'lang', 'dir', 'data-theme'] });
    setTimeout(portalFilters, 250);
    setTimeout(portalFilters, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
