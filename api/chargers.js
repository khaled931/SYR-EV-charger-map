'use strict';

const fallbackPayload = require('../data/chargers.v2.json');
const { getDb, hasFirebaseAdminConfig } = require('./_lib/firebase-admin');
const { methodNotAllowed, sendJson } = require('./_lib/http');
const { seedBundledChargersIfEmpty } = require('./_lib/seed');
const { publicRecord } = require('./_lib/validation');

const ACCESS_API_URL = 'https://syrianrenewables.com/api/access';
const EV_APP_ORIGIN = 'https://ev.syrianrenewables.com';
const SERVICE_KEY = 'ev_chargers_map';
const FALLBACK_GUEST_LIMIT = 5;
const ACCESS_TIMEOUT_MS = 3000;

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

function requestLocale(req) {
  const queryLocale = String(req.query?.locale || req.query?.lang || '').toLowerCase();
  if (queryLocale === 'en') return 'en';
  if (queryLocale === 'ar') return 'ar';
  const acceptLanguage = String(req.headers['accept-language'] || '').toLowerCase();
  return acceptLanguage.startsWith('en') ? 'en' : 'ar';
}

function accountUrls(locale) {
  const returnTo = `${EV_APP_ORIGIN}/`;
  const login = new URL(`/${locale}/account/login`, 'https://syrianrenewables.com');
  const register = new URL(`/${locale}/account/register`, 'https://syrianrenewables.com');
  login.searchParams.set('returnTo', returnTo);
  register.searchParams.set('returnTo', returnTo);
  return { login_url: login.toString(), register_url: register.toString() };
}

function failClosedAccess(locale, reason = 'access_service_unavailable') {
  return {
    allowed: false,
    authenticated: false,
    reason,
    service_key: SERVICE_KEY,
    guest_mode: 'sample',
    member_mode: 'full',
    guest_item_limit: FALLBACK_GUEST_LIMIT,
    signup_required_after_limit: true,
    cta_ar: 'أنشئ حساباً مجانياً للاطلاع على جميع محطات شحن السيارات الكهربائية.',
    cta_en: 'Create a free account to access all EV charging stations.',
    ...accountUrls(locale),
  };
}

async function resolveCentralAccess(req) {
  const locale = requestLocale(req);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ACCESS_TIMEOUT_MS);

  try {
    const url = new URL(ACCESS_API_URL);
    url.searchParams.set('service', SERVICE_KEY);
    url.searchParams.set('action', 'view_full');
    url.searchParams.set('locale', locale);
    url.searchParams.set('returnTo', `${EV_APP_ORIGIN}/`);

    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Origin: EV_APP_ORIGIN,
        Cookie: String(req.headers.cookie || ''),
      },
    });

    if (!response.ok) return failClosedAccess(locale, `access_http_${response.status}`);
    const result = await response.json().catch(() => null);
    if (!result || typeof result !== 'object') return failClosedAccess(locale, 'access_invalid_response');
    return {
      ...failClosedAccess(locale, String(result.reason || 'authentication_required')),
      ...result,
    };
  } catch (error) {
    console.error('Central membership access check failed:', error);
    return failClosedAccess(locale);
  } finally {
    clearTimeout(timer);
  }
}

function guestLimitFrom(access) {
  const value = Number(access?.guest_item_limit);
  return Number.isSafeInteger(value) && value > 0 ? value : FALLBACK_GUEST_LIMIT;
}

function applyAccess(payload, access) {
  const chargers = Array.isArray(payload?.chargers) ? payload.chargers : [];
  const fullAccess = access?.allowed === true;
  const guestLimit = guestLimitFrom(access);
  const visibleChargers = fullAccess ? chargers : chargers.slice(0, guestLimit);

  return {
    ...payload,
    metadata: {
      ...(payload.metadata || {}),
      access: {
        service_key: SERVICE_KEY,
        authenticated: access?.authenticated === true,
        full_access: fullAccess,
        mode: fullAccess ? 'full' : 'sample',
        reason: String(access?.reason || 'authentication_required'),
        guest_item_limit: guestLimit,
        visible_count: visibleChargers.length,
        total_available: chargers.length,
        signup_required_after_limit: access?.signup_required_after_limit !== false,
        cta_ar: access?.cta_ar || failClosedAccess('ar').cta_ar,
        cta_en: access?.cta_en || failClosedAccess('en').cta_en,
        login_url: access?.login_url || accountUrls(requestLocale({ query: {}, headers: {} })).login_url,
        register_url: access?.register_url || accountUrls(requestLocale({ query: {}, headers: {} })).register_url,
      },
    },
    chargers: visibleChargers,
  };
}

async function buildPayload() {
  if (!hasFirebaseAdminConfig()) {
    return fallback('Firebase Admin credentials are not configured.');
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
      return fallback('Firestore contains no published charger records.');
    }

    const latestUpdate = rows
      .map((row) => timestampToIso(row.updated_at || row.created_at))
      .filter(Boolean)
      .sort()
      .at(-1);

    return {
      metadata: {
        version: '3.2.0',
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
        data_quality: 'Medium Confidence',
      },
      chargers: rows.map(publicRecord),
    };
  } catch (error) {
    console.error('Firestore public read/bootstrap failed:', error);
    return fallback('Firestore could not be reached.');
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const [payload, access] = await Promise.all([
    buildPayload(),
    resolveCentralAccess(req),
  ]);

  return sendJson(res, 200, applyAccess(payload, access), {
    'Cache-Control': 'private, no-store, max-age=0',
    Pragma: 'no-cache',
    Vary: 'Cookie, Accept-Language',
    'X-Data-Source': payload?.metadata?.storage || 'unknown',
    'X-Access-Mode': access?.allowed === true ? 'full' : 'sample',
  });
};
