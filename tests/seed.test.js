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
