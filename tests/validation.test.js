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

test('supports a known site power with unknown number of devices', () => {
  const result = validateRecord({ ...validRecord, Charger_Numbers: 0, Total_Power_kW: 120 });
  assert.equal(result.valid, true);
  assert.equal(result.record.charger_numbers, 0);
  assert.equal(result.record.total_power_kw, 120);
});

test('rejects coordinates outside Syria', () => {
  const result = validateRecord({ ...validRecord, Longitude: -84.3 });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /outside the accepted Syria bounding box/);
});


test('accepts Harasta contact, hours, members-only visibility and power values', () => {
  const result = validateRecord({
    ...validRecord,
    Visibility: 'members',
    Contact_Phone: '+963 982 238 371',
    Opening_Hours_AR: 'على مدار 24 ساعة',
    Charger_Units_kW: '60, 120',
    Total_Power_kW: 180,
  });
  assert.equal(result.valid, true);
  assert.equal(result.record.visibility, 'members');
  assert.equal(result.record.contact_phone, '+963 982 238 371');
  assert.deepEqual(result.record.charger_units_kw, [60, 120]);
  assert.equal(result.record.total_power_kw, 180);
});
