'use strict';

const { isGoogleMapsUrl, isValidCoordinatePair, isWithinSyriaBounds } = require('./maps');

const MAX_TEXT = 180;
const MAX_ID = 90;

function cleanText(value, maxLength = MAX_TEXT) {
  return String(value ?? '')
    .replace(/[<>\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function cleanId(value) {
  return cleanText(value, MAX_ID).replace(/\s+/g, '-');
}

function booleanValue(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  if (value === 0 || String(value).toLowerCase() === 'false' || String(value).toLowerCase() === 'no') return false;
  if (value === 1 || String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'yes') return true;
  return fallback;
}

function firstValue(input, keys) {
  for (const key of keys) {
    if (input[key] !== undefined && input[key] !== null && input[key] !== '') return input[key];
  }
  return '';
}

function normalizeInput(input = {}) {
  const suggestedId = cleanId(firstValue(input, ['suggested_id', 'Suggested_ID', 'id', 'ID']));
  const companyAr = cleanText(firstValue(input, ['company_ar', 'Company_AR', 'Company', 'operator_ar', 'operator']));
  const companyEn = cleanText(firstValue(input, ['company_en', 'Company_EN', 'operator_en', 'operator']));
  const governorateAr = cleanText(firstValue(input, ['governorate_ar', 'Governorate_AR', 'Governorate']));
  const governorateEn = cleanText(firstValue(input, ['governorate_en', 'Governorate_EN']));
  const cityAr = cleanText(firstValue(input, ['city_ar', 'City_AR', 'City']));
  const cityEn = cleanText(firstValue(input, ['city_en', 'City_EN']));
  const siteNameAr = cleanText(firstValue(input, ['site_name_ar', 'Site_Name_AR', 'Site_Name_(POI)', 'name_ar']));
  const siteNameEn = cleanText(firstValue(input, ['site_name_en', 'Site_Name_EN', 'name_en']));
  const chargerTypeAr = cleanText(firstValue(input, ['charger_type_ar', 'Charger_Type_AR', 'Charger type', 'charger_type']));
  const chargerTypeEn = cleanText(firstValue(input, ['charger_type_en', 'Charger_Type_EN', 'charger_type']));
  const siteTypeAr = cleanText(firstValue(input, ['site_type_ar', 'Site_Type_AR', 'Site_Type']));
  const siteTypeEn = cleanText(firstValue(input, ['site_type_en', 'Site_Type_EN']));
  const googleMapsUrl = cleanText(firstValue(input, ['google_maps_url', 'Google_Maps_URL', 'source_url']), 700);
  const latitude = Number(firstValue(input, ['latitude', 'Latitude']));
  const longitude = Number(firstValue(input, ['longitude', 'Longitude']));
  const chargerNumbers = Number(firstValue(input, ['charger_numbers', 'Charger_Numbers', 'Charger numbers', 'charger_count']));
  const ratedPowerKw = Number(firstValue(input, ['rated_power_kw', 'Rated_Power_kW', 'power_kw']));
  const gunsPerCharger = Number(firstValue(input, ['guns_per_charger', 'Guns_Per_Charger', 'guns']));

  return {
    suggested_id: suggestedId,
    id: suggestedId,
    company_ar: companyAr,
    company_en: companyEn,
    operator: companyAr,
    operator_ar: companyAr,
    operator_en: companyEn,
    governorate_ar: governorateAr,
    governorate_en: governorateEn,
    city_ar: cityAr,
    city_en: cityEn,
    site_name_ar: siteNameAr,
    site_name_en: siteNameEn,
    name_ar: siteNameAr,
    name_en: siteNameEn,
    charger_type_ar: chargerTypeAr,
    charger_type_en: chargerTypeEn,
    connector_types: [chargerTypeEn || chargerTypeAr].filter(Boolean),
    charger_numbers: chargerNumbers,
    charger_count: chargerNumbers,
    rated_power_kw: Number.isFinite(ratedPowerKw) && ratedPowerKw >= 0 ? ratedPowerKw : 0,
    guns_per_charger: Number.isFinite(gunsPerCharger) && gunsPerCharger >= 0 ? gunsPerCharger : 0,
    site_type_ar: siteTypeAr,
    site_type_en: siteTypeEn,
    google_maps_url: googleMapsUrl,
    source_url: googleMapsUrl,
    latitude,
    longitude,
    published: booleanValue(firstValue(input, ['published', 'Published']), true),
    status: cleanText(input.status || 'listed', 40),
    data_quality: cleanText(input.data_quality || 'Medium Confidence', 40),
    needs_review: Boolean(input.needs_review),
  };
}

function validateRecord(input) {
  const record = normalizeInput(input);
  const errors = [];
  const required = [
    ['suggested_id', 'Suggested_ID'],
    ['company_ar', 'Company (Arabic)'],
    ['company_en', 'Company (English)'],
    ['governorate_ar', 'Governorate (Arabic)'],
    ['governorate_en', 'Governorate (English)'],
    ['city_ar', 'City (Arabic)'],
    ['city_en', 'City (English)'],
    ['site_name_ar', 'Site name (Arabic)'],
    ['site_name_en', 'Site name (English)'],
    ['charger_type_ar', 'Charger type (Arabic)'],
    ['charger_type_en', 'Charger type (English)'],
    ['site_type_ar', 'Site type (Arabic)'],
    ['site_type_en', 'Site type (English)'],
    ['google_maps_url', 'Google Maps URL'],
  ];

  required.forEach(([key, label]) => {
    if (!record[key]) errors.push(`${label} is required.`);
  });

  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,89}$/.test(record.suggested_id)) {
    errors.push('Suggested_ID must contain 3–90 Latin letters, numbers, hyphens, or underscores and start with a letter or number.');
  }
  if (!Number.isInteger(record.charger_numbers) || record.charger_numbers < 1 || record.charger_numbers > 200) {
    errors.push('Charger numbers must be an integer between 1 and 200.');
  }
  if (record.google_maps_url && !isGoogleMapsUrl(record.google_maps_url)) {
    errors.push('Google_Maps_URL must be a valid HTTPS Google Maps link.');
  }
  if (!isValidCoordinatePair(record.latitude, record.longitude)) {
    errors.push('Valid latitude and longitude are required.');
  } else if (!isWithinSyriaBounds(record.latitude, record.longitude)) {
    errors.push('Coordinates are outside the accepted Syria bounding box (32–38 latitude, 35–43 longitude).');
  }

  return { valid: errors.length === 0, errors, record };
}

function publicRecord(record) {
  return {
    id: record.suggested_id || record.id,
    suggested_id: record.suggested_id || record.id,
    name_ar: record.site_name_ar || record.name_ar,
    name_en: record.site_name_en || record.name_en,
    operator: record.company_ar || record.operator,
    operator_ar: record.company_ar || record.operator_ar || record.operator,
    operator_en: record.company_en || record.operator_en || record.operator,
    governorate_ar: record.governorate_ar,
    governorate_en: record.governorate_en,
    city_ar: record.city_ar,
    city_en: record.city_en,
    site_type_ar: record.site_type_ar,
    site_type_en: record.site_type_en,
    charger_type_ar: record.charger_type_ar,
    charger_type_en: record.charger_type_en,
    connector_types: record.connector_types || [record.charger_type_en || record.charger_type_ar].filter(Boolean),
    latitude: Number(record.latitude),
    longitude: Number(record.longitude),
    charger_count: Number(record.charger_numbers ?? record.charger_count ?? 0),
    rated_power_kw: Number(record.rated_power_kw ?? 0),
    guns_per_charger: Number(record.guns_per_charger ?? 0),
    status: record.status || 'listed',
    data_quality: record.data_quality || 'Medium Confidence',
    needs_review: Boolean(record.needs_review),
    source_url: record.google_maps_url || record.source_url || '',
  };
}

module.exports = {
  normalizeInput,
  publicRecord,
  validateRecord,
};
