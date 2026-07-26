const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('public page mounts the canonical header and footer without removing EV controls', () => {
  const html = read('index.html');
  for (const id of [
    'platformHeader', 'platformFooter', 'languageToggle', 'themeToggle',
    'map', 'searchInput', 'governorateFilter', 'operatorFilter',
    'connectorFilter', 'statusFilter', 'siteTypeFilter', 'fitMapButton'
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  assert.doesNotMatch(html, /href=["']https:\/\/syrianrenewables\.com\/?["']/i);
});

test('main-site links are locale-aware and news stays on the new Sanity website', () => {
  const shell = read('platform-shell.js');
  const integration = read('platform-integration.js');
  assert.match(integration, /https:\/\/syrian-renewables-web\.vercel\.app/);
  assert.match(shell, /_key: 'news', href: '\/news'/);
  assert.match(shell, /\$\{cleanBase\(mainSiteUrl\)\}\/\$\{locale\}\$\{suffix\}/);
  assert.doesNotMatch(shell, /legacyWordPressSite|https:\/\/syrianrenewables\.com/);
});

test('submenus are click-only, closed by default, and keyboard dismissible', () => {
  const shell = read('platform-shell.js');
  const css = read('platform-shell.css');
  assert.match(shell, /let expandedKey = null/);
  assert.match(shell, /expandedKey = expandedKey === item\._key \? null : item\._key/);
  assert.match(shell, /event\.key === 'Escape'/);
  assert.match(shell, /!header\.contains\(event\.target\)/);
  assert.match(css, /\.sr-dropdown[\s\S]*visibility: hidden/);
  assert.match(css, /\.sr-nav-item\.is-expanded > \.sr-dropdown[\s\S]*visibility: visible/);
});

test('shared shell preserves bilingual direction and theme compatibility', () => {
  const integration = read('platform-integration.js');
  const tokens = read('platform-tokens.css');
  assert.match(integration, /document\.documentElement\.dir = nextLocale === 'ar' \? 'rtl' : 'ltr'/);
  assert.match(integration, /sr-theme/);
  assert.match(integration, /sr-ev-theme/);
  assert.match(tokens, /html\[data-theme='dark'\]/);
  assert.match(tokens, /--sr-font-arabic/);
  assert.match(tokens, /--sr-font-latin/);
});
