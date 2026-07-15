'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRecord } = require('../api/_lib/validation');

const validRecord = {
  Suggested_ID: 'SY-RD-QALAMOUN-MALL-001',
  Company_AR: 'شركة تجريبية',
  Company_EN: 'Example Company',
  Governorate_AR: 'ريف دمشق',
  Governorate_EN: 'Rif Dimashq',
  City_AR: 'القلمون',
  City_EN: 'Qalamoun',
  Site_Name_AR: 'القلمون مول',
  Site_Name_EN: 'Qalamoun Mall',
  Charger_Type_AR: 'صيني',
  Charger_Type_EN: 'GB/T',
  Charger_Numbers: 1,
  Site_Type_AR: 'مركز تجاري',
  Site_Type_EN: 'Shopping mall',
  Google_Maps_URL: 'https://www.google.com/maps?q=33.8,36.5',
  Latitude: 33.8,
  Longitude: 36.5,
};

test('normalizes the bilingual import format', () => {
  const result = validateRecord(validRecord);
  assert.equal(result.valid, true);
  assert.equal(result.record.suggested_id, 'SY-RD-QALAMOUN-MALL-001');
  assert.equal(result.record.name_ar, 'القلمون مول');
  assert.deepEqual(result.record.connector_types, ['GB/T']);
});

test('rejects coordinates outside Syria', () => {
  const result = validateRecord({ ...validRecord, Longitude: -84.3 });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /outside the accepted Syria bounding box/);
});
