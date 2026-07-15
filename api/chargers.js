'use strict';

const fallbackPayload = require('../data/chargers.v2.json');
const { getDb, hasFirebaseAdminConfig } = require('./_lib/firebase-admin');
const { methodNotAllowed, sendJson } = require('./_lib/http');
const { seedBundledChargersIfEmpty } = require('./_lib/seed');
const { publicRecord } = require('./_lib/validation');

function timestampToIso(value) {
  if (!value) return '';
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function fallback(reason) {
  return {
    ...fallbackPayload,
    metadata: {
      ...fallbackPayload.metadata,
      storage: 'repository-fallback',
      fallback_reason: reason,
    },
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  if (!hasFirebaseAdminConfig()) {
    return sendJson(res, 200, fallback('Firebase Admin credentials are not configured.'), {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    });
  }

  try {
    const db = getDb();
    let snapshot = await db.collection('ev_chargers').get();
    let seedResult = { seeded: false, count: 0, reason: 'not-needed' };

    if (snapshot.empty) {
      seedResult = await seedBundledChargersIfEmpty(db, fallbackPayload);
      if (seedResult.seeded) snapshot = await db.collection('ev_chargers').get();
    }

    const rows = snapshot.docs
      .map((doc) => ({ ...doc.data(), suggested_id: doc.id }))
      .filter((row) => row.published !== false)
      .sort((a, b) => String(a.suggested_id).localeCompare(String(b.suggested_id), 'en'));

    if (!rows.length && String(process.env.FIREBASE_FALLBACK_TO_JSON || 'true').toLowerCase() !== 'false') {
      return sendJson(res, 200, fallback('Firestore contains no published charger records.'), {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      });
    }

    const latestUpdate = rows
      .map((row) => timestampToIso(row.updated_at || row.created_at))
      .filter(Boolean)
      .sort()
      .at(-1);

    return sendJson(res, 200, {
      metadata: {
        version: '3.1.0',
        storage: 'firebase-firestore',
        bootstrap_seeded: seedResult.seeded,
        bootstrap_record_count: seedResult.count,
        last_updated: latestUpdate ? latestUpdate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        data_quality_note_ar: 'تُعرض السجلات المنشورة من لوحة الإدارة، مع إبقاء حالة التحقق وجودة البيانات منفصلتين عن حالة التشغيل.',
      },
      defaults: {
        connector_types: [],
        rated_power_kw: 0,
        guns_per_charger: 0,
        status: 'listed',
        access_ar: 'غير محدد',
        price_note_ar: 'غير متوفر',
        data_quality: 'Medium Confidence'
      },
      chargers: rows.map(publicRecord),
    }, {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    });
  } catch (error) {
    console.error('Firestore public read/bootstrap failed:', error);
    return sendJson(res, 200, fallback('Firestore could not be reached.'), {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      'X-Data-Source': 'repository-fallback',
    });
  }
};
