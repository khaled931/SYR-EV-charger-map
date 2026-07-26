(() => {
  'use strict';

  function apply() {
    if (document.getElementById('sr-ev-platform-runtime-fixes')) return;
    const style = document.createElement('style');
    style.id = 'sr-ev-platform-runtime-fixes';
    style.textContent = `
      html[lang='ar'] { --sr-font: var(--sr-font-arabic) !important; }
      html[lang='en'] { --sr-font: var(--sr-font-latin) !important; }
      body, .ev-app, .ev-app *, .leaflet-container, .leaflet-container *, button, input, select, textarea {
        font-family: var(--sr-font) !important;
      }
      .ev-map {
        min-height: 560px !important;
        height: calc(100vh - 230px) !important;
      }
      #filtersPanel, .ev-sidebar {
        top: 92px !important;
        border-color: var(--sr-border) !important;
        background: color-mix(in srgb, var(--sr-surface-raised) 96%, transparent) !important;
      }
      .map-floating-button {
        color: var(--sr-primary-strong) !important;
        border-color: color-mix(in srgb, var(--sr-primary) 30%, var(--sr-border)) !important;
        background: color-mix(in srgb, var(--sr-surface-raised) 94%, transparent) !important;
      }
      html[data-theme='dark'] .map-floating-button {
        color: #d8f9ff !important;
        background: color-mix(in srgb, var(--sr-surface-raised) 94%, transparent) !important;
      }
      @media (max-width: 980px) {
        .ev-map { min-height: 500px !important; height: 58vh !important; }
      }
      @media (max-width: 760px) {
        #filtersPanel, .ev-sidebar { top: 8px !important; }
        .ev-map { min-height: 430px !important; height: calc(100vh - 210px) !important; }
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
