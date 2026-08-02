import { mountPlatformShell } from './platform-shell.js';

const FALLBACK_MAIN_SITE_URL = 'https://www.syrian-renewables.com';

function resolveMainSiteUrl(value) {
  const configured = String(value || '').trim();
  if (!configured) return FALLBACK_MAIN_SITE_URL;
  try {
    const parsed = new URL(configured);
    if (parsed.hostname.toLowerCase().endsWith('.vercel.app')) return FALLBACK_MAIN_SITE_URL;
    return configured.replace(/\/+$/, '');
  } catch {
    return FALLBACK_MAIN_SITE_URL;
  }
}

const configuredMainSite = window.SR_PLATFORM_MAIN_SITE_URL
  || document.querySelector('meta[name="sr-platform-main-site"]')?.content;
const MAIN_SITE_URL = resolveMainSiteUrl(configuredMainSite);
const LOGO_SRC = `${MAIN_SITE_URL}/brand/syrian-renewables-logo-fixed.svg`;
const LANG_KEY = 'sr-ev-language';
const SHARED_THEME_KEY = 'sr-theme';
const LEGACY_THEME_KEY = 'sr-ev-theme';

let destroyShell = null;

function getLocale() {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === 'ar' || stored === 'en') return stored;
  return document.documentElement.lang === 'en' ? 'en' : 'ar';
}

function setThemeStorage(theme) {
  const normalized = theme === 'dark' ? 'dark' : 'light';
  if (document.documentElement.dataset.theme !== normalized) {
    document.documentElement.dataset.theme = normalized;
  }
  try {
    localStorage.setItem(SHARED_THEME_KEY, normalized);
    localStorage.setItem(LEGACY_THEME_KEY, normalized);
  } catch (_) {
    // Storage can be unavailable in hardened browsing contexts.
  }
}

function mount() {
  destroyShell?.();
  const locale = getLocale();
  destroyShell = mountPlatformShell({
    target: {
      replaceChildren(node) {
        const isHeader = node.classList.contains('sr-site-header');
        const target = document.getElementById(isHeader ? 'platformHeader' : 'platformFooter');
        target?.replaceChildren(node);
      }
    },
    locale,
    activeKey: 'ev-map',
    mainSiteUrl: MAIN_SITE_URL,
    logoSrc: LOGO_SRC,
    onLocaleChange(nextLocale) {
      if (nextLocale === locale) return;
      const legacyToggle = document.getElementById('languageToggle');
      if (legacyToggle) legacyToggle.click();
      else {
        localStorage.setItem(LANG_KEY, nextLocale);
        document.documentElement.lang = nextLocale;
        document.documentElement.dir = nextLocale === 'ar' ? 'rtl' : 'ltr';
      }
      requestAnimationFrame(mount);
    },
    onThemeToggle() {
      const legacyToggle = document.getElementById('themeToggle');
      if (legacyToggle) legacyToggle.click();
      else {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        setThemeStorage(next);
      }
      setThemeStorage(document.documentElement.dataset.theme);
    }
  });
}

function reconcileTheme() {
  const shared = localStorage.getItem(SHARED_THEME_KEY);
  const legacy = localStorage.getItem(LEGACY_THEME_KEY);
  const desired = shared === 'dark' || shared === 'light'
    ? shared
    : (legacy === 'dark' || legacy === 'light' ? legacy : document.documentElement.dataset.theme);
  setThemeStorage(desired);
}

mount();
reconcileTheme();

new MutationObserver(() => {
  setThemeStorage(document.documentElement.dataset.theme);
}).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir', 'data-theme'] });
