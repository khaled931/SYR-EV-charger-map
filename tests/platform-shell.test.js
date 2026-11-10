const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('public page keeps EV controls and the canonical platform shell', () => {
  const html = read('index.html');
  for (const id of ['platformHeader','platformFooter','languageToggle','themeToggle','map','searchInput','governorateFilter','operatorFilter','connectorFilter','statusFilter','siteTypeFilter','fitMapButton','locateButton','pendingLocations']) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  assert.match(html, /meta name="sr-platform-main-site" content="https:\/\/syrianrenewables\.com"/);
  assert.doesNotMatch(html, /www\.syrian-renewables\.com/);
});

test('main-site links and navigation mirror the current Syrian Renewables structure', () => {
  const shell = read('platform-shell.js');
  const integration = read('platform-integration.js');
  assert.match(integration, /CANONICAL_MAIN_SITE_URL = 'https:\/\/syrianrenewables\.com'/);
  assert.doesNotMatch(integration, /syrian-renewables-web\.vercel\.app/);
  assert.match(shell, /_key: 'news', href: '\/news'/);
  assert.match(shell, /_key: 'useful-tools'/);
  assert.match(shell, /_key: 'energy-contracts'/);
  assert.match(shell, /_key: 'energy-market'/);
  assert.match(shell, /_key: 'ev-map'/);
  assert.match(shell, /\$\{cleanBase\(mainSiteUrl\)\}\/\$\{locale\}\$\{suffix\}/);
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

test('preserves workbook chargers and adds an airport record without inventing technical details', () => {
  const payload = JSON.parse(read('data/chargers.v2.json'));
  assert.equal(payload.chargers.length, 20);
  assert.equal(payload.chargers.reduce((sum, row) => sum + row.charger_count, 0), 29);
  assert.equal(payload.chargers.reduce((sum, row) => sum + (row.total_power_kw || 0), 0), 2780);
  assert.equal(payload.chargers.filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude)).length, 19);
  const airport = payload.chargers.find((row) => row.id === 'SY-RD-DAM-AIRPORT-001');
  assert.ok(airport);
  assert.equal(airport.charger_count, 0);
  assert.equal(airport.fast_charging_bays, 2);
  assert.equal(airport.slow_charging_bays, 3);
  assert.equal(airport.total_power_kw, 120);
  assert.equal(airport.operator, 'Green Road');
  assert.equal(airport.data_quality, 'Verified');
  assert.equal(airport.status, 'listed');
  assert.equal(airport.published, true);
  assert.equal(airport.visibility, 'members');
  assert.equal(airport.needs_review, false);
  assert.deepEqual(airport.connector_types, []);
  assert.match(airport.notes_ar, /ليست الموقع الدقيق للشاحن/);
  const harasta = payload.chargers.find((row) => row.id === 'SY-RD-HAR-HARASTA-001');
  assert.ok(harasta);
  assert.equal(harasta.operator, 'سوبر تاج');
  assert.equal(harasta.published, true);
  assert.equal(harasta.visibility, 'members');
  assert.equal(harasta.data_quality, 'Verified');
  assert.equal(harasta.charger_count, 2);
  assert.deepEqual(harasta.charger_units_kw, [60, 120]);
  assert.equal(harasta.total_power_kw, 180);
  assert.equal(harasta.contact_phone, '+963 982 238 371');
  assert.equal(harasta.latitude, 33.5581426);
  assert.equal(harasta.longitude, 36.3556189);
  const fsd = payload.chargers.find((row) => row.id === 'SY-TBD-TBD-FSD-001');
  assert.ok(fsd); assert.equal(fsd.latitude, null); assert.equal(fsd.longitude, null); assert.equal(fsd.needs_review, true);
  const jallab = payload.chargers.find((row) => row.id === 'SY-RD-DAM-JALLAB-001');
  assert.ok(jallab); assert.equal(jallab.governorate_en, 'Rural Damascus'); assert.equal(jallab.city_en, 'Al-Nabek'); assert.equal(jallab.needs_review, true);
  for (const id of ['SY-GR-DAM-MEZZAMALL-001','SY-GR-DAM-UPTOWN-001','SY-GR-DAM-DUMMARUPTOWN-001','SY-GR-ALE-LAIRAMOUN-001','SY-RD-QAL-QALAMOUNMALL-001']) assert.ok(payload.chargers.some((row) => row.id === id), `missing ${id}`);
});

test('map keeps coordinate-pending records in the list and pins only mappable records', () => {
  const app = read('assets/app.v2.js');
  assert.match(app, /hasCoordinates: lat !== null && lng !== null/);
  assert.match(app, /state\.filtered\.filter\(\(item\) => item\.hasCoordinates\)/);
  assert.match(app, /coordinatesPending/);
  assert.doesNotMatch(app, /\.map\(\(row, index\) => normalize\(row, defaults, index\)\)\.filter/);
});

test('members-only stations are excluded from guest sampling', () => {
  const code = read('api/chargers.js');
  assert.match(code, /publicChargers = chargers\.filter\(\(row\) => !isMembersOnly\(row\)\)/);
  assert.match(code, /signedInMemberStations/);
  assert.match(code, /membersOnlyIds = new Set\(\['SY-RD-DAM-AIRPORT-001'\]\)/);
});

test('mobile map uses dynamic viewport sizing and compact footer logo', () => {
  const mobile = read('assets/mobile-ux.js');
  const additions = read('assets/app.v3.css');
  assert.match(mobile, /100dvh|64dvh|61dvh|58dvh/);
  assert.match(mobile, /backdrop-filter: none !important/);
  assert.match(additions, /#platformFooter \.sr-footer-logo-plate[\s\S]*width: 116px/);
});
