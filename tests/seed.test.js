'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { bundledRowToRecord } = require('../api/_lib/seed');

test('normalizes bundled charger data into bilingual Firestore records', () => {
  const record = bundledRowToRecord({
    id: 'SY-DI-DAM-TEST-001',
    name_ar: 'محطة اختبار',
    name_en: 'Test Station',
    operator: 'Example Co',
    governorate_ar: 'دمشق',
    city_ar: 'دمشق',
    site_type_ar: 'مركز تجاري',
    latitude: 33.51,
    longitude: 36.29,
    charger_count: 2,
    source_url: 'https://www.google.com/maps?q=33.51,36.29',
  }, {
    connector_types: ['CCS2'],
    rated_power_kw: 120,
    guns_per_charger: 2,
    status: 'listed',
    data_quality: 'Medium Confidence',
  });

  assert.equal(record.suggested_id, 'SY-DI-DAM-TEST-001');
  assert.equal(record.governorate_en, 'Damascus');
  assert.equal(record.city_en, 'Damascus');
  assert.equal(record.site_type_en, 'Mall / commercial');
  assert.equal(record.charger_type_en, 'CCS2');
  assert.equal(record.charger_numbers, 2);
  assert.equal(record.rated_power_kw, 120);
  assert.equal(record.guns_per_charger, 2);
  assert.equal(record.published, true);
});

test('preserves unknown device count and announced site capacity', () => {
  const record = bundledRowToRecord({
    id: 'SY-RD-DAM-AIRPORT-001',
    name_ar: 'محطة شحن مطار دمشق الدولي',
    charger_count: 0,
    total_power_kw: 120,
    rated_power_kw: null,
    connector_types: [],
    needs_review: true,
  });
  assert.equal(record.charger_count, 0);
  assert.equal(record.charger_numbers, 0);
  assert.equal(record.total_power_kw, 120);
  assert.equal(record.rated_power_kw, null);
  assert.deepEqual(record.connector_types, []);
  assert.equal(record.needs_review, true);
});


test('keeps Harasta member-only hours, phone and separate charger ratings', () => {
  const record = bundledRowToRecord({
    id: 'SY-RD-HAR-HARASTA-001',
    name_ar: 'محطة حرستا',
    operator: 'سوبر تاج',
    charger_count: 2,
    charger_units_kw: [60, 120],
    total_power_kw: 180,
    contact_phone: '+963 982 238 371',
    opening_hours_ar: 'على مدار 24 ساعة',
    visibility: 'members',
  });
  assert.deepEqual(record.charger_units_kw, [60, 120]);
  assert.equal(record.total_power_kw, 180);
  assert.equal(record.contact_phone, '+963 982 238 371');
  assert.equal(record.opening_hours_ar, 'على مدار 24 ساعة');
  assert.equal(record.visibility, 'members');
});

test('retains charging bays without inventing charger hardware at airport', () => {
  const record = bundledRowToRecord({
    id: 'SY-RD-DAM-AIRPORT-001', charger_count: 0,
    fast_charging_bays: 2, slow_charging_bays: 3, visibility: 'members'
  });
  assert.equal(record.fast_charging_bays, 2);
  assert.equal(record.slow_charging_bays, 3);
  assert.equal(record.charger_count, 0);
  assert.equal(record.visibility, 'members');
});
