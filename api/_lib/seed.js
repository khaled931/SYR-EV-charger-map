'use strict';

const { FieldValue } = require('firebase-admin/firestore');

const GOVERNORATE_EN = {
  'دمشق': 'Damascus',
  'ريف دمشق': 'Rif Dimashq',
  'حلب': 'Aleppo',
  'حمص': 'Homs',
  'حماة': 'Hama',
  'إدلب': 'Idlib',
  'اللاذقية': 'Latakia',
  'طرطوس': 'Tartus',
  'درعا': 'Daraa',
  'السويداء': 'As-Suwayda',
  'القنيطرة': 'Quneitra',
  'دير الزور': 'Deir ez-Zor',
  'الرقة': 'Raqqa',
  'الحسكة': 'Al-Hasakah',
};

const SITE_TYPE_EN = {
  'شركة / مكتب': 'Company / office',
  'فندق': 'Hotel',
  'مركز تجاري': 'Mall / commercial',
  'استراحة / محطة خدمة': 'Rest area / service station',
  'محطة خدمة': 'Service station',
  'سفارة / جهة مؤسسية': 'Embassy / institution',
};

function list(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/[,،;/]+/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function bundledRowToRecord(row = {}, defaults = {}) {
  const id = String(row.id || row.suggested_id || '').trim();
  const connectors = list(row.connector_types || defaults.connector_types);
  const chargerType = connectors.join(' / ') || 'غير محدد';
  const governorateAr = String(row.governorate_ar || '').trim();
  const governorateEn = String(row.governorate_en || GOVERNORATE_EN[governorateAr] || governorateAr).trim();
  const cityAr = String(row.city_ar || governorateAr || '').trim();
  const cityEn = String(row.city_en || GOVERNORATE_EN[cityAr] || governorateEn || cityAr).trim();
  const siteTypeAr = String(row.site_type_ar || 'غير محدد').trim();
  const siteTypeEn = String(row.site_type_en || SITE_TYPE_EN[siteTypeAr] || siteTypeAr).trim();
  const company = String(row.operator || row.company_ar || 'غير محدد').trim();
  const mapsUrl = String(row.source_url || row.google_maps_url || '').trim();
  const chargerCount = Number(row.charger_count ?? row.charger_numbers ?? defaults.charger_count ?? 1);

  return {
    suggested_id: id,
    id,
    company_ar: company,
    company_en: String(row.operator_en || row.company_en || company).trim(),
    operator: company,
    operator_ar: company,
    operator_en: String(row.operator_en || row.company_en || company).trim(),
    governorate_ar: governorateAr,
    governorate_en: governorateEn,
    city_ar: cityAr,
    city_en: cityEn,
    site_name_ar: String(row.name_ar || row.site_name_ar || 'محطة غير مسماة').trim(),
    site_name_en: String(row.name_en || row.site_name_en || row.name_ar || 'Unnamed station').trim(),
    name_ar: String(row.name_ar || row.site_name_ar || 'محطة غير مسماة').trim(),
    name_en: String(row.name_en || row.site_name_en || row.name_ar || 'Unnamed station').trim(),
    charger_type_ar: String(row.charger_type_ar || chargerType).trim(),
    charger_type_en: String(row.charger_type_en || chargerType).trim(),
    connector_types: connectors,
    charger_numbers: Number.isInteger(chargerCount) && chargerCount > 0 ? chargerCount : 1,
    charger_count: Number.isInteger(chargerCount) && chargerCount > 0 ? chargerCount : 1,
    rated_power_kw: Number(row.rated_power_kw ?? defaults.rated_power_kw ?? 0) || 0,
    guns_per_charger: Number(row.guns_per_charger ?? defaults.guns_per_charger ?? 0) || 0,
    site_type_ar: siteTypeAr,
    site_type_en: siteTypeEn,
    google_maps_url: mapsUrl,
    source_url: mapsUrl,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    published: row.published !== false,
    status: String(row.status || defaults.status || 'listed'),
    data_quality: String(row.data_quality || defaults.data_quality || 'Medium Confidence'),
    needs_review: Boolean(row.needs_review),
    notes_ar: String(row.notes_ar || ''),
    notes_en: String(row.notes_en || ''),
    source_date: String(row.source_date || defaults.source_date || ''),
  };
}

async function seedBundledChargersIfEmpty(db, payload) {
  const enabled = String(process.env.FIREBASE_AUTO_SEED_FROM_JSON || 'true').toLowerCase() !== 'false';
  if (!enabled) return { seeded: false, reason: 'disabled', count: 0 };

  const collection = db.collection('ev_chargers');
  const existing = await collection.limit(1).get();
  if (!existing.empty) return { seeded: false, reason: 'not-empty', count: 0 };

  const rows = Array.isArray(payload?.chargers) ? payload.chargers : [];
  if (!rows.length) return { seeded: false, reason: 'no-bundled-records', count: 0 };
  if (rows.length > 450) throw new Error('Bundled charger migration exceeds the safe Firestore batch limit.');

  const batch = db.batch();
  const timestamp = FieldValue.serverTimestamp();
  rows.forEach((row) => {
    const record = bundledRowToRecord(row, payload.defaults || {});
    if (!record.suggested_id) return;
    batch.set(collection.doc(record.suggested_id), {
      ...record,
      created_at: timestamp,
      updated_at: timestamp,
      created_by: 'system:bundled-bootstrap',
      updated_by: 'system:bundled-bootstrap',
    });
  });

  batch.set(db.collection('ev_charger_audit').doc(), {
    action: 'bootstrap-migration',
    record_count: rows.length,
    actor_email: 'system:bundled-bootstrap',
    created_at: timestamp,
  });
  await batch.commit();

  return { seeded: true, reason: 'seeded', count: rows.length };
}

module.exports = {
  bundledRowToRecord,
  seedBundledChargersIfEmpty,
};
