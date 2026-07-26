import { test, expect } from '@playwright/test';

test('unified shell and EV map work on the Vercel Preview', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#platformHeader .sr-site-header')).toBeVisible();
  await expect(page.locator('#platformFooter .sr-site-footer')).toBeVisible();
  await expect(page.locator('#map')).toBeVisible();
  await expect(page.locator('#chargerList .ev-card').first()).toBeVisible({ timeout: 25_000 });

  const cards = page.locator('#chargerList .ev-card');
  const initialCardCount = await cards.count();
  expect(initialCardCount).toBeGreaterThan(1);

  const search = page.locator('#searchInput');
  if (!(await search.isVisible())) await page.locator('#mobileFiltersToggle').click();
  await expect(search).toBeVisible();
  await search.fill('حلب');
  await expect.poll(() => cards.count()).toBeLessThan(initialCardCount);
  expect(await cards.count()).toBeGreaterThan(0);
  await search.fill('');
  await expect.poll(() => cards.count()).toBe(initialCardCount);

  const governorateFilter = page.locator('#governorateFilter');
  const governorateValues = await governorateFilter.locator('option').evaluateAll((options) => options.map((option) => option.value));
  expect(governorateValues.length).toBeGreaterThan(1);
  await governorateFilter.selectOption(governorateValues[1]);
  await expect.poll(() => cards.count()).toBeLessThan(initialCardCount);
  await page.locator('#resetFilters').evaluate((button) => button.click());
  await expect.poll(() => cards.count()).toBe(initialCardCount);

  const closeFilters = page.locator('#closeFiltersButton');
  if (await closeFilters.isVisible()) await closeFilters.click();

  const mobileMenu = page.locator('.sr-menu-button');
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
    await expect(page.locator('.sr-main-nav')).toHaveClass(/is-open/);
  }

  const services = page.getByRole('button', { name: /خدماتنا|Our Services/ });
  const servicesItem = services.locator('xpath=..');
  await expect(servicesItem.locator('.sr-dropdown')).not.toBeVisible();
  await services.click();
  await expect(servicesItem).toHaveClass(/is-expanded/);
  await expect(servicesItem.locator('.sr-dropdown')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(servicesItem).not.toHaveClass(/is-expanded/);

  if (await mobileMenu.isVisible()) await mobileMenu.click();
  await services.click();
  await page.locator('#main-content').click({ position: { x: 8, y: 8 } });
  await expect(servicesItem).not.toHaveClass(/is-expanded/);

  const originalTheme = await page.locator('html').getAttribute('data-theme');
  await page.locator('.sr-icon-button').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', originalTheme || 'light');

  await page.locator('.sr-language-switch').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#platformHeader .sr-main-nav a[href$="/en/news"]')).toHaveAttribute('href', /\/en\/news$/);

  await expect(page.locator('#fitMapButton')).toBeVisible();
});

test('public API and protected admin entry remain available', async ({ request }) => {
  const api = await request.get('/api/chargers');
  expect(api.ok()).toBeTruthy();
  const payload = await api.json();
  expect(Array.isArray(payload.chargers)).toBeTruthy();
  expect(payload.chargers.length).toBeGreaterThan(0);

  const admin = await request.get('/admin/');
  expect(admin.ok()).toBeTruthy();
  const adminHtml = await admin.text();
  expect(adminHtml).toContain('id="loginForm"');
  expect(adminHtml).toContain('id="importFile"');
  expect(adminHtml).toContain('id="exportXlsxButton"');
});
