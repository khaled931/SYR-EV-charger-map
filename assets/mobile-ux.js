(() => {
  'use strict';
  const id = 'sr-ev-mobile-performance-overrides';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .ev-map { min-height: 560px !important; height: min(72dvh, 760px) !important; }
    #filtersPanel, .ev-sidebar { overscroll-behavior: contain !important; -webkit-overflow-scrolling: touch; }
    @media (max-width: 980px) {
      .ev-map { min-height: 480px !important; height: min(68dvh, 700px) !important; }
    }
    @media (max-width: 759px) {
      .ev-map { min-height: 440px !important; height: clamp(440px, 64dvh, 620px) !important; }
      .ev-map-card, .ev-panel, .ev-notes, .ev-card, .ev-stat {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      #filtersPanel, .ev-sidebar {
        top: max(8px, env(safe-area-inset-top)) !important;
        bottom: max(8px, env(safe-area-inset-bottom)) !important;
        max-height: calc(100dvh - max(16px, env(safe-area-inset-top)) - max(16px, env(safe-area-inset-bottom))) !important;
      }
      .leaflet-popup-content { margin: 12px 14px !important; }
      .leaflet-control-attribution { font-size: 9px !important; max-width: 72vw; }
      .ev-share__grid { gap: 7px !important; }
      .ev-share-btn { min-height: 34px !important; }
    }
    @media (max-width: 420px) {
      .ev-map { min-height: 420px !important; height: clamp(420px, 61dvh, 560px) !important; }
    }
    @media (prefers-reduced-motion: reduce) {
      .ev-card, .ev-marker, .map-floating-button, #filtersPanel, .ev-sidebar { transition: none !important; }
    }
  `;
  document.head.appendChild(style);
})();
