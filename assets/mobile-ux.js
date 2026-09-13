(() => {
  'use strict';

  const STYLE_ID = 'sr-ev-mobile-ux-v2';
  const MOBILE_QUERY = '(max-width: 759px)';
  const media = window.matchMedia(MOBILE_QUERY);

  function isArabic() {
    return document.documentElement.lang !== 'en';
  }

  function labels() {
    return isArabic()
      ? {
          filters: 'الفلاتر',
          stations: 'المحطات',
          locate: 'موقعي',
          fit: 'الكل',
          locateTitle: 'إظهار موقعي الحالي',
          fitTitle: 'عرض جميع المواقع'
        }
      : {
          filters: 'Filters',
          stations: 'Stations',
          locate: 'My location',
          fit: 'Fit all',
          locateTitle: 'Show my current location',
          fitTitle: 'Fit all locations'
        };
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #filtersPanel, .ev-sidebar {
        overscroll-behavior: contain !important;
        -webkit-overflow-scrolling: touch;
      }

      [data-mobile-dock-extra] { display: none !important; }

      @media (max-width: 759px) {
        html.filters-open,
        html.list-open,
        html.filters-open body,
        html.list-open body {
          overflow: hidden !important;
          overscroll-behavior: none !important;
        }

        .ev-shell {
          padding: 6px 8px 14px !important;
        }

        .ev-map-tools {
          width: calc(100% - 16px) !important;
          min-height: 46px !important;
          margin: 8px auto 0 !important;
          padding: 8px 11px !important;
          align-items: center !important;
          border-radius: 16px !important;
          box-shadow: 0 8px 22px rgba(21, 69, 76, .07) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .ev-map-tools__title p,
        .ev-map-tools__actions {
          display: none !important;
        }

        .ev-map-tools__title h1 {
          margin: 0 !important;
          font-size: .95rem !important;
          line-height: 1.35 !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ev-layout {
          margin-top: 6px !important;
          gap: 8px !important;
        }

        .ev-map-card {
          border-radius: 18px !important;
          box-shadow: 0 10px 28px rgba(21, 69, 76, .10) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .ev-map-card__toolbar {
          display: none !important;
        }

        .ev-map {
          height: clamp(400px, 58dvh, 540px) !important;
          min-height: 400px !important;
        }

        .leaflet-bottom {
          bottom: 62px !important;
        }

        .leaflet-popup-content {
          margin: 11px 13px !important;
        }

        .leaflet-control-attribution {
          max-width: 70vw !important;
          font-size: 8px !important;
          line-height: 1.25 !important;
        }

        #mapFloatingControls {
          top: auto !important;
          right: 10px !important;
          bottom: 10px !important;
          left: 10px !important;
          z-index: 950 !important;
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 6px !important;
          width: auto !important;
          max-width: none !important;
          padding: 5px !important;
          border: 1px solid rgba(33, 122, 141, .20) !important;
          border-radius: 18px !important;
          background: rgba(255, 255, 255, .92) !important;
          box-shadow: 0 14px 38px rgba(21, 57, 65, .20) !important;
          backdrop-filter: blur(15px) saturate(1.08) !important;
          -webkit-backdrop-filter: blur(15px) saturate(1.08) !important;
          pointer-events: auto !important;
        }

        html[data-theme='dark'] #mapFloatingControls {
          background: rgba(16, 40, 47, .94) !important;
          border-color: rgba(143, 211, 223, .22) !important;
        }

        #mapFloatingControls .map-floating-button {
          position: relative !important;
          min-width: 0 !important;
          min-height: 48px !important;
          height: 48px !important;
          padding: 4px 3px !important;
          flex-direction: column !important;
          justify-content: center !important;
          gap: 1px !important;
          border: 0 !important;
          border-radius: 13px !important;
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          font-size: 10.5px !important;
          line-height: 1.15 !important;
          color: var(--sr-ink, #232b2b) !important;
        }

        html[data-theme='dark'] #mapFloatingControls .map-floating-button {
          color: #eaf8fa !important;
        }

        #mapFloatingControls .map-floating-button:active,
        #mapFloatingControls .map-floating-button:focus-visible {
          transform: none !important;
          background: rgba(33, 122, 141, .10) !important;
          outline: 2px solid rgba(33, 122, 141, .28) !important;
          outline-offset: 0 !important;
        }

        #mapFloatingControls .map-floating-button > span:first-child {
          display: grid !important;
          width: 24px !important;
          height: 22px !important;
          place-items: center !important;
          border-radius: 8px !important;
          color: #217a8d !important;
          background: transparent !important;
          font-size: 17px !important;
          line-height: 1 !important;
        }

        html[data-theme='dark'] #mapFloatingControls .map-floating-button > span:first-child {
          color: #8fd3df !important;
        }

        #mapFloatingControls .map-floating-button b,
        #mapFloatingControls .mobile-dock-label {
          display: block !important;
          max-width: 100% !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          font-size: 10px !important;
          font-weight: 800 !important;
        }

        [data-mobile-dock-extra] {
          display: inline-flex !important;
        }

        .mobile-dock-badge {
          position: absolute !important;
          top: 1px !important;
          inset-inline-end: 5px !important;
          display: none;
          min-width: 17px !important;
          height: 17px !important;
          padding: 0 4px !important;
          align-items: center !important;
          justify-content: center !important;
          border: 2px solid rgba(255,255,255,.96) !important;
          border-radius: 999px !important;
          color: #fff !important;
          background: #217a8d !important;
          font-family: Arial, sans-serif !important;
          font-size: 9px !important;
          font-weight: 700 !important;
          line-height: 1 !important;
        }

        html[data-theme='dark'] .mobile-dock-badge {
          border-color: #10282f !important;
        }

        .mobile-dock-badge[data-visible='true'] {
          display: inline-flex !important;
        }

        #filtersOverlay,
        #listOverlay {
          z-index: 99980 !important;
          background: rgba(8, 21, 25, .45) !important;
          backdrop-filter: blur(3px) !important;
          -webkit-backdrop-filter: blur(3px) !important;
        }

        #filtersPanel,
        .ev-sidebar {
          top: auto !important;
          right: 0 !important;
          bottom: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          max-width: none !important;
          height: auto !important;
          max-height: min(82dvh, 720px) !important;
          border-width: 1px 0 0 !important;
          border-radius: 24px 24px 0 0 !important;
          background: rgba(255, 255, 255, .985) !important;
          box-shadow: 0 -18px 50px rgba(15, 43, 50, .22) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          transform: translate3d(0, 105%, 0) !important;
          opacity: 1 !important;
          pointer-events: none !important;
          transition: transform .22s ease !important;
        }

        html[data-theme='dark'] #filtersPanel,
        html[data-theme='dark'] .ev-sidebar {
          background: #10282f !important;
          border-color: rgba(143, 211, 223, .22) !important;
        }

        html.filters-open #filtersPanel,
        html.list-open .ev-sidebar {
          transform: translate3d(0, 0, 0) !important;
          pointer-events: auto !important;
        }

        #filtersPanel::before,
        .ev-sidebar::before {
          content: '' !important;
          display: block !important;
          flex: 0 0 auto !important;
          width: 42px !important;
          height: 4px !important;
          margin: 8px auto 2px !important;
          border-radius: 999px !important;
          background: rgba(101, 114, 116, .35) !important;
        }

        #filtersPanel {
          padding: 0 14px calc(14px + env(safe-area-inset-bottom)) !important;
          overflow: auto !important;
        }

        #filtersPanel .ev-filters-panel__head,
        .ev-sidebar__header {
          position: sticky !important;
          top: 0 !important;
          z-index: 4 !important;
          padding: 9px 2px 10px !important;
          margin: 0 !important;
          background: inherit !important;
          border-bottom: 1px solid rgba(33, 122, 141, .14) !important;
        }

        #filtersPanel .ev-filters-panel__head {
          margin-bottom: 10px !important;
        }

        #filtersPanel .ev-filters {
          gap: 10px !important;
        }

        .ev-field {
          gap: 5px !important;
        }

        .ev-field span {
          font-size: 12px !important;
        }

        .ev-field input,
        .ev-field select {
          min-height: 46px !important;
          border-radius: 12px !important;
          font-size: 16px !important;
        }

        #resetFilters {
          min-height: 46px !important;
          margin-top: 2px !important;
          border-radius: 12px !important;
        }

        .ev-sidebar {
          overflow: hidden !important;
        }

        .ev-sidebar__header {
          padding: 8px 14px 10px !important;
        }

        .ev-sidebar__header h2 {
          font-size: 1rem !important;
        }

        .ev-sidebar__header p {
          margin-top: 2px !important;
          font-size: 11px !important;
        }

        .ev-sidebar .ev-list {
          gap: 8px !important;
          padding: 9px 10px calc(14px + env(safe-area-inset-bottom)) !important;
          overscroll-behavior: contain !important;
        }

        .drawer-close-button,
        #closeFiltersButton {
          width: 40px !important;
          min-width: 40px !important;
          height: 40px !important;
          border-radius: 12px !important;
        }

        .ev-card {
          gap: 7px !important;
          padding: 11px !important;
          border-radius: 15px !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          content-visibility: auto;
          contain-intrinsic-size: 250px;
        }

        .ev-card h3 {
          font-size: 14px !important;
          line-height: 1.45 !important;
        }

        .ev-card p {
          font-size: 11.5px !important;
          line-height: 1.6 !important;
        }

        .ev-card__top {
          gap: 7px !important;
        }

        .ev-chip-row {
          gap: 5px !important;
        }

        .ev-chip {
          padding: 3px 7px !important;
          font-size: 10px !important;
        }

        .ev-card__footer {
          gap: 6px 10px !important;
          padding-top: 6px !important;
          font-size: 10.5px !important;
        }

        .ev-card .ev-share {
          margin-top: 4px !important;
          padding-top: 6px !important;
        }

        .ev-card .ev-share strong {
          display: none !important;
        }

        .ev-card .ev-share-btn:not(.ev-share-btn--native):not(.ev-share-btn--copy) {
          display: none !important;
        }

        .ev-card .ev-share__grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 6px !important;
        }

        .ev-share-btn {
          min-height: 36px !important;
          font-size: 10.5px !important;
        }

        .ev-panel {
          margin-top: 8px !important;
          padding: 0 !important;
          overflow: visible !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .ev-stats {
          display: grid !important;
          grid-template-columns: none !important;
          grid-auto-flow: column !important;
          grid-auto-columns: minmax(124px, 38vw) !important;
          gap: 7px !important;
          padding: 1px 1px 7px !important;
          overflow-x: auto !important;
          overscroll-behavior-inline: contain !important;
          scroll-snap-type: inline proximity !important;
          scrollbar-width: none !important;
        }

        .ev-stats::-webkit-scrollbar {
          display: none !important;
        }

        .ev-stat {
          min-height: 68px !important;
          padding: 9px 10px !important;
          border-radius: 14px !important;
          scroll-snap-align: start !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .ev-stat span {
          font-size: 18px !important;
        }

        .ev-stat small {
          font-size: 9.5px !important;
          line-height: 1.35 !important;
        }

        .ev-membership-gate {
          margin: 8px 0 2px !important;
          padding: 10px 11px !important;
          grid-template-columns: 36px minmax(0, 1fr) !important;
          gap: 8px 10px !important;
          border-radius: 15px !important;
          box-shadow: 0 7px 20px rgba(21, 57, 65, .07) !important;
        }

        .ev-membership-gate__icon {
          width: 36px !important;
          height: 36px !important;
          border-radius: 11px !important;
        }

        .ev-membership-gate__icon svg {
          width: 20px !important;
          height: 20px !important;
        }

        .ev-membership-gate__eyebrow {
          display: none !important;
        }

        .ev-membership-gate h2 {
          font-size: .9rem !important;
          line-height: 1.35 !important;
        }

        .ev-membership-gate__content > p:last-child {
          display: -webkit-box !important;
          margin: 3px 0 0 !important;
          overflow: hidden !important;
          -webkit-box-orient: vertical !important;
          -webkit-line-clamp: 2 !important;
          font-size: .75rem !important;
          line-height: 1.45 !important;
        }

        .ev-membership-gate__actions {
          grid-column: 1 / -1 !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 6px !important;
        }

        .ev-membership-gate__button {
          min-height: 40px !important;
          padding: 7px 8px !important;
          border-radius: 10px !important;
          font-size: .75rem !important;
          text-align: center !important;
        }

        .ev-notes {
          margin-top: 8px !important;
          padding: 11px 12px !important;
          border-radius: 16px !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .ev-notes h2 {
          font-size: .95rem !important;
        }

        .ev-notes p {
          margin-top: 5px !important;
          font-size: 11px !important;
          line-height: 1.65 !important;
        }

        #platformFooter .sr-site-footer {
          margin-top: 28px !important;
        }
      }

      @media (max-width: 420px) {
        .ev-map {
          height: clamp(380px, 56dvh, 500px) !important;
          min-height: 380px !important;
        }

        #mapFloatingControls {
          right: 7px !important;
          bottom: 7px !important;
          left: 7px !important;
          gap: 3px !important;
          padding: 4px !important;
          border-radius: 16px !important;
        }

        #mapFloatingControls .map-floating-button {
          height: 46px !important;
          min-height: 46px !important;
          font-size: 9.5px !important;
        }

        #mapFloatingControls .map-floating-button b,
        #mapFloatingControls .mobile-dock-label {
          font-size: 9px !important;
        }

        .ev-stats {
          grid-auto-columns: minmax(118px, 42vw) !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #filtersPanel,
        .ev-sidebar,
        .map-floating-button,
        .ev-card {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function dock() {
    return document.getElementById('mapFloatingControls');
  }

  function ensureBadge(button, role) {
    if (!button) return null;
    let badge = button.querySelector(`.mobile-dock-badge[data-role="${role}"]`);
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'mobile-dock-badge';
      badge.dataset.role = role;
      badge.setAttribute('aria-hidden', 'true');
      button.appendChild(badge);
    }
    return badge;
  }

  function ensureExtraButton(id, icon, labelKey, titleKey, targetId) {
    const controls = dock();
    if (!controls) return null;
    let button = document.getElementById(id);
    if (!button) {
      button = document.createElement('button');
      button.id = id;
      button.type = 'button';
      button.className = 'map-floating-button';
      button.dataset.mobileDockExtra = 'true';
      button.dataset.targetId = targetId;
      button.innerHTML = `<span aria-hidden="true">${icon}</span><b class="mobile-dock-label" data-mobile-label="${labelKey}"></b>`;
      controls.appendChild(button);
    }
    button.dataset.labelKey = labelKey;
    button.dataset.titleKey = titleKey;
    return button;
  }

  function ensureMobileDock() {
    const controls = dock();
    if (!controls) return false;

    const filterButton = document.getElementById('mapFiltersButton');
    const listButton = document.getElementById('mapListButton');
    if (filterButton) ensureBadge(filterButton, 'filters');
    if (listButton) ensureBadge(listButton, 'stations');

    ensureExtraButton('mapLocateButtonMobile', '◎', 'locate', 'locateTitle', 'locateButton');
    ensureExtraButton('mapFitButtonMobile', '⌖', 'fit', 'fitTitle', 'fitMapButton');
    syncLabels();
    updateBadges();
    return true;
  }

  function syncLabels() {
    const dict = labels();
    const filterLabel = document.querySelector('[data-floating-label="filters"]');
    const listLabel = document.querySelector('[data-floating-label="list"]');
    if (filterLabel) filterLabel.textContent = dict.filters;
    if (listLabel) listLabel.textContent = dict.stations;

    document.querySelectorAll('[data-mobile-label]').forEach((node) => {
      const key = node.dataset.mobileLabel;
      if (key && dict[key]) node.textContent = dict[key];
    });

    document.querySelectorAll('[data-mobile-dock-extra]').forEach((button) => {
      const titleKey = button.dataset.titleKey;
      if (titleKey && dict[titleKey]) button.setAttribute('aria-label', dict[titleKey]);
    });
  }

  function activeFilterCount() {
    let count = 0;
    const search = document.getElementById('searchInput');
    if (search && String(search.value || '').trim()) count += 1;
    ['governorateFilter', 'operatorFilter', 'connectorFilter', 'statusFilter', 'siteTypeFilter'].forEach((id) => {
      const field = document.getElementById(id);
      if (field && field.value && field.value !== 'all') count += 1;
    });
    return count;
  }

  function updateBadges() {
    const filterBadge = document.querySelector('.mobile-dock-badge[data-role="filters"]');
    if (filterBadge) {
      const count = activeFilterCount();
      filterBadge.textContent = String(count);
      filterBadge.dataset.visible = count > 0 ? 'true' : 'false';
    }

    const listBadge = document.querySelector('.mobile-dock-badge[data-role="stations"]');
    if (listBadge) {
      const count = document.querySelectorAll('#chargerList .ev-card').length;
      listBadge.textContent = String(count);
      listBadge.dataset.visible = count > 0 ? 'true' : 'false';
    }
  }

  function triggerOriginal(targetId) {
    const target = document.getElementById(targetId);
    if (target && !target.disabled) target.click();
  }

  function bindDockActions() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mobile-dock-extra]');
      if (!button) return;
      event.preventDefault();
      const targetId = button.dataset.targetId;
      if (targetId) triggerOriginal(targetId);
    });

    const filterPanel = document.getElementById('filtersPanel');
    if (filterPanel) {
      filterPanel.addEventListener('input', updateBadges, { passive: true });
      filterPanel.addEventListener('change', updateBadges, { passive: true });
    }
  }

  function observeResults() {
    const list = document.getElementById('chargerList');
    if (!list) return;
    const observer = new MutationObserver(updateBadges);
    observer.observe(list, { childList: true, subtree: false });
  }

  function syncMapSize() {
    if (!media.matches) return;
    window.requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }

  function boot() {
    injectStyle();

    let attempts = 0;
    const ready = () => {
      attempts += 1;
      const ok = ensureMobileDock();
      if (!ok && attempts < 30) {
        window.setTimeout(ready, 60);
        return;
      }
      bindDockActions();
      observeResults();
      updateBadges();
      syncMapSize();
    };
    ready();

    const rootObserver = new MutationObserver(() => {
      ensureMobileDock();
      syncLabels();
    });
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang', 'dir', 'data-theme']
    });

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', () => {
        ensureMobileDock();
        updateBadges();
        syncMapSize();
      });
    }

    window.addEventListener('orientationchange', () => window.setTimeout(syncMapSize, 180), { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
