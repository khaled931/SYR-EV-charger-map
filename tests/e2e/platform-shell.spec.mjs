import { test, expect } from '@playwright/test';

test('the old map URL preserves station links and an explicitly selected language', async ({ request }) => {
  await expect(async () => {
    const response = await request.get('/?charger=SY-DI-DAM-SHERATON-001', { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    const target = new URL(response.headers().location);
    expect(target.origin).toBe('https://syrianrenewables.com');
    expect(target.pathname).toBe('/ar/ev-chargers');
    expect(target.searchParams.get('charger')).toBe('SY-DI-DAM-SHERATON-001');
  }).toPass({ timeout: 90000, intervals: [2000, 5000] });

  const response = await request.get('/?lang=en&charger=SY-DI-DAM-SHERATON-001', { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const target = new URL(response.headers().location);
  expect(target.pathname).toBe('/en/ev-chargers');
  expect(target.searchParams.get('charger')).toBe('SY-DI-DAM-SHERATON-001');
});

test('charger data and the protected admin entry remain available on the original domain', async ({ request }) => {
  const api = await request.get('/api/chargers');
  expect(api.ok()).toBeTruthy();
  const payload = await api.json();
  expect(Array.isArray(payload.chargers)).toBeTruthy();
  expect(payload.chargers.length).toBeGreaterThan(0);
  expect(payload.chargers.some((row) => row.id === 'SY-RD-HAR-HARASTA-001')).toBe(false);
  expect(payload.chargers.some((row) => row.id === 'SY-RD-DAM-AIRPORT-001')).toBe(false);

  const admin = await request.get('/admin');
  expect(admin.ok()).toBeTruthy();
  const adminHtml = await admin.text();
  expect(adminHtml).toContain('id="loginForm"');
  expect(adminHtml).toContain('id="importFile"');
});
