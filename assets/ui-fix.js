(() => {
  'use strict';

  const STYLE_ID = 'sr-ev-final-ui-fix-style';
  const CONTROLS_ID = 'mapFloatingControls';

  function isArabic() {
    return document.documentElement.lang !== 'en';
  }

  function labels() {
    return isArabic()
      ? { filters: 'الفلاتر', list: 'قائمة الشواحن', close: 'إغلاق', listTitle: 'قائمة الشواحن' }
      : { filters: 'Filters', list: 'Chargers list', close: 'Close', listTitle: 'Chargers list' };
  }

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

      .ev-layout {
        grid-template-columns: minmax(0, 1fr) !important;
      }
      .ev-map-card {
        position: relative !important;
        overflow: hidden !important;
      }
      .ev-map {
        min-height: 650px !important;
        height: calc(100vh - 124px) !important;
      }
      .ev-panel {
        margin-top: 10px !important;
      }
      .ev-notes {
        margin-top: 10px !important;
      }

      #mapFloatingControls {
        position: absolute !important;
        top: 54px !important;
        left: 14px !important;
        z-index: 900 !important;
        display: grid !important;
        gap: 8px !important;
        width: min(245px, calc(100% - 28px)) !important;
        pointer-events: none !important;
      }
      html[dir="ltr"] #mapFloatingControls {
        left: 14px !important;
        right: auto !important;
      }
      .map-floating-button {
        pointer-events: auto !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        min-height: 42px !important;
        padding: 0 14px !important;
        border: 1px solid rgba(33,122,141,.26) !important;
        border-radius: 14px !important;
        color: #0f5362 !important;
        background: rgba(255,255,255,.92) !important;
        box-shadow: 0 14px 34px rgba(35,43,43,.16) !important;
        backdrop-filter: blur(18px) saturate(1.18) !important;
        -webkit-backdrop-filter: blur(18px) saturate(1.18) !important;
        cursor: pointer !important;
        font-size: 13px !important;
        font-weight: 900 !important;
      }
      html[data-theme="dark"] .map-floating-button {
        color: #d8f9ff !important;
        background: rgba(16,40,47,.92) !important;
      }
      .map-floating-button:hover,
      .map-floating-button:focus-visible {
        border-color: #217A8D !important;
        transform: translateY(-1px) !important;
        outline: none !important;
      }
      .map-floating-button span:first-child {
        display: inline-grid !important;
        width: 22px !important;
        height: 22px !important;
        place-items: center !important;
        border-radius: 8px !important;
        color: #fff !important;
        background: #217A8D !important;
        font-family: Arial, sans-serif !important;
      }

      #filtersOverlay[hidden], #listOverlay[hidden] { display: none !important; }
      #filtersOverlay, #listOverlay {
        position: fixed !important;
        inset: 0 !important;
        z-index: 99980 !important;
        display: block;
        background: rgba(10, 25, 30, .32) !important;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }

      #filtersPanel, .ev-sidebar {
        position: fixed !important;
        top: 66px !important;
        bottom: 16px !important;
        width: min(430px, calc(100vw - 32px)) !important;
        max-width: 430px !important;
        height: auto !important;
        z-index: 99990 !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        padding: 0 !important;
        border: 1px solid rgba(33,122,141,.22) !important;
        border-radius: 24px !important;
        background: rgba(255,255,255,.94) !important;
        box-shadow: 0 24px 75px rgba(35,43,43,.25) !important;
        backdrop-filter: blur(22px) saturate(1.18) !important;
        -webkit-backdrop-filter: blur(22px) saturate(1.18) !important;
        transition: transform .24s ease, opacity .18s ease !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      html[data-theme="dark"] #filtersPanel,
      html[data-theme="dark"] .ev-sidebar {
        background: rgba(16,40,47,.96) !important;
      }

      #filtersPanel {
        left: 16px !important;
        right: auto !important;
        transform: translate3d(calc(-100% - 36px), 0, 0) !important;
      }
      .ev-sidebar {
        right: 16px !important;
        left: auto !important;
        transform: translate3d(calc(100% + 36px), 0, 0) !important;
        max-height: none !important;
      }
      html[dir="ltr"] .ev-sidebar {
        right: 16px !important;
        left: auto !important;
      }

      html.filters-open #filtersPanel,
      html.list-open .ev-sidebar {
        transform: translate3d(0, 0, 0) !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      #filtersPanel .ev-filters-panel__head,
      .ev-sidebar__header {
        position: sticky !important;
        top: 0 !important;
        z-index: 2 !important;
        margin: 0 !important;
        padding: 14px 16px !important;
        background: inherit !important;
        border-bottom: 1px solid rgba(33,122,141,.18) !important;
      }
      #filtersPanel {
        overflow: auto !important;
        padding: 16px !important;
      }
      #filtersPanel .ev-filters-panel__head {
        margin: -16px -16px 14px !important;
      }
      #filtersPanel .ev-filters {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
      .ev-sidebar .ev-list {
        overflow: auto !important;
        padding: 12px !important;
      }
      .drawer-close-button {
        display: inline-grid !important;
        width: 34px !important;
        height: 34px !important;
        place-items: center !important;
        border: 1px solid rgba(33,122,141,.22) !important;
        border-radius: 12px !important;
        background: rgba(255,255,255,.55) !important;
        color: inherit !important;
        cursor: pointer !important;
        font-weight: 900 !important;
      }
      html[data-theme="dark"] .drawer-close-button {
        background: rgba(16,40,47,.65) !important;
      }
      .ev-sidebar__header {
        display: grid !important;
        grid-template-columns: 1fr auto !important;
        align-items: start !important;
        gap: 8px !important;
      }
      .ev-sidebar__header h2,
      .ev-sidebar__header p {
        grid-column: 1 !important;
      }
      .ev-sidebar__header .drawer-close-button {
        grid-column: 2 !important;
        grid-row: 1 / span 2 !important;
      }

      @media (max-width: 980px) {
        .ev-map { min-height: 540px !important; height: calc(100vh - 108px) !important; }
      }
      @media (max-width: 760px) {
        #filtersPanel, .ev-sidebar {
          top: 8px !important;
          bottom: 8px !important;
          width: min(92vw, 390px) !important;
          border-radius: 22px !important;
        }
        #filtersPanel { left: 8px !important; }
        .ev-sidebar { right: 8px !important; }
        #mapFloatingControls {
          top: 52px !important;
          left: 10px !important;
          width: min(220px, calc(100% - 20px)) !important;
        }
        .map-floating-button {
          min-height: 38px !important;
          font-size: 12px !important;
          padding: 0 12px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureOverlay(id) {
    let overlay = document.getElementById(id);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = id;
      overlay.hidden = true;
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function portalFilters() {
    const overlay = document.getElementById('filtersOverlay') || ensureOverlay('filtersOverlay');
    const panel = document.getElementById('filtersPanel');
    if (!panel) return false;
    if (overlay.parentElement !== document.body) document.body.appendChild(overlay);
    if (panel.parentElement !== document.body) document.body.appendChild(panel);
    overlay.hidden = !document.documentElement.classList.contains('filters-open');
    panel.setAttribute('aria-hidden', document.documentElement.classList.contains('filters-open') ? 'false' : 'true');
    return true;
  }

  function portalList() {
    const sidebar = document.querySelector('.ev-sidebar');
    const overlay = ensureOverlay('listOverlay');
    if (!sidebar) return false;
    if (sidebar.parentElement !== document.body) document.body.appendChild(sidebar);
    overlay.hidden = !document.documentElement.classList.contains('list-open');
    sidebar.setAttribute('aria-hidden', document.documentElement.classList.contains('list-open') ? 'false' : 'true');
    ensureListCloseButton(sidebar);
    return true;
  }

  function ensureListCloseButton(sidebar) {
    const header = sidebar.querySelector('.ev-sidebar__header');
    if (!header || header.querySelector('[data-close-list]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'drawer-close-button';
    button.setAttribute('data-close-list', 'true');
    button.setAttribute('aria-label', labels().close);
    button.textContent = '×';
    header.appendChild(button);
  }

  function ensureFloatingControls() {
    const mapCard = document.querySelector('.ev-map-card');
    if (!mapCard) return false;

    let controls = document.getElementById(CONTROLS_ID);
    if (!controls) {
      controls = document.createElement('div');
      controls.id = CONTROLS_ID;
      controls.innerHTML = `
        <button class="map-floating-button" id="mapFiltersButton" type="button"><span>☰</span><b data-floating-label="filters"></b></button>
        <button class="map-floating-button" id="mapListButton" type="button"><span>⚡</span><b data-floating-label="list"></b></button>
      `;
      mapCard.appendChild(controls);
    }
    syncFloatingLabels();
    return true;
  }

  function syncFloatingLabels() {
    const dict = labels();
    document.querySelectorAll('[data-floating-label="filters"]').forEach((el) => { el.textContent = dict.filters; });
    document.querySelectorAll('[data-floating-label="list"]').forEach((el) => { el.textContent = dict.list; });
    document.querySelectorAll('[data-close-list]').forEach((el) => { el.setAttribute('aria-label', dict.close); });
  }

  function closeFilters() {
    const overlay = document.getElementById('filtersOverlay');
    const panel = document.getElementById('filtersPanel');
    document.documentElement.classList.remove('filters-open');
    if (overlay) overlay.hidden = true;
    if (panel) panel.setAttribute('aria-hidden', 'true');
  }

  function openFilters() {
    portalFilters();
    closeList();
    const overlay = document.getElementById('filtersOverlay');
    const panel = document.getElementById('filtersPanel');
    document.documentElement.classList.add('filters-open');
    if (overlay) overlay.hidden = false;
    if (panel) {
      panel.setAttribute('aria-hidden', 'false');
      const firstField = panel.querySelector('input, select, button');
      setTimeout(() => firstField && firstField.focus({ preventScroll: true }), 80);
    }
  }

  function closeList() {
    const overlay = document.getElementById('listOverlay');
    const sidebar = document.querySelector('.ev-sidebar');
    document.documentElement.classList.remove('list-open');
    if (overlay) overlay.hidden = true;
    if (sidebar) sidebar.setAttribute('aria-hidden', 'true');
  }

  function openList() {
    portalList();
    closeFilters();
    const overlay = document.getElementById('listOverlay');
    const sidebar = document.querySelector('.ev-sidebar');
    document.documentElement.classList.add('list-open');
    if (overlay) overlay.hidden = false;
    if (sidebar) {
      sidebar.setAttribute('aria-hidden', 'false');
      setTimeout(() => sidebar.querySelector('.ev-card, button, a')?.focus?.({ preventScroll: true }), 80);
    }
  }

  function bindDrawer() {
    document.addEventListener('click', (event) => {
      const filterButton = event.target.closest('#mobileFiltersToggle, #desktopFiltersToggle, #mapFiltersButton');
      const listButton = event.target.closest('#mapListButton');
      const filterClose = event.target.closest('#closeFiltersButton');
      const listClose = event.target.closest('[data-close-list]');
      const filterOverlay = event.target.id === 'filtersOverlay';
      const listOverlay = event.target.id === 'listOverlay';

      if (filterButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        document.documentElement.classList.contains('filters-open') ? closeFilters() : openFilters();
        return;
      }
      if (listButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        document.documentElement.classList.contains('list-open') ? closeList() : openList();
        return;
      }
      if (filterClose || filterOverlay) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeFilters();
        return;
      }
      if (listClose || listOverlay) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeList();
      }
    }, true);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeFilters();
        closeList();
      }
    });
  }

  function boot() {
    injectStyle();
    portalFilters();
    portalList();
    ensureFloatingControls();
    bindDrawer();
    const observer = new MutationObserver(() => {
      portalFilters();
      portalList();
      ensureFloatingControls();
      syncFloatingLabels();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'lang', 'dir', 'data-theme'] });
    setTimeout(() => { portalFilters(); portalList(); ensureFloatingControls(); }, 250);
    setTimeout(() => { portalFilters(); portalList(); ensureFloatingControls(); }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
