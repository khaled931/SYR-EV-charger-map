import { test, expect } from '@playwright/test';

test('unified shell and EV map work on the Vercel Preview', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#platformHeader .sr-site-header')).toBeVisible();
  await expect(page.locator('#platformFooter .sr-site-footer')).toBeVisible();
  await expect(page.locator('#map')).toBeVisible();
  await expect(page.locator('#chargerList .ev-card').first()).toBeVisible({ timeout: 25_000 });

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

  await expect(page.locator('#searchInput')).toBeVisible();
  await expect(page.locator('#governorateFilter')).toBeVisible();
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
  expect(await admin.text()).toContain('id="loginForm"');
});
