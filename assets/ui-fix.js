(() => {
  'use strict';

  const CONTROLS_ID = 'mapFloatingControls';

  function isArabic() {
    return document.documentElement.lang !== 'en';
  }

  function labels() {
    return isArabic()
      ? { list: 'قائمة الشواحن', close: 'إغلاق' }
      : { list: 'Chargers list', close: 'Close' };
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
    const layout = document.querySelector('.ev-layout');
    if (!layout) return false;

    let controls = document.getElementById(CONTROLS_ID);
    if (!controls) {
      controls = document.createElement('div');
      controls.id = CONTROLS_ID;
      controls.innerHTML = '<button class="map-floating-button" id="mapListButton" type="button"><span>⚡</span><b data-floating-label="list"></b></button>';
    }
    if (controls.parentElement !== layout) layout.appendChild(controls);
    syncFloatingLabels();
    return true;
  }

  function syncFloatingLabels() {
    const dict = labels();
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
      const filterButton = event.target.closest('#mobileFiltersToggle, #desktopFiltersToggle');
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
