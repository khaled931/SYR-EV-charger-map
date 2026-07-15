'use strict';

const { methodNotAllowed, sendJson } = require('./_lib/http');

function numericSenderId(value, appId) {
  const raw = String(value || '').trim();
  if (/^\d+$/.test(raw)) return raw;
  const match = String(appId || '').match(/^1:(\d+):/);
  return match ? match[1] : '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const appId = process.env.FIREBASE_APP_ID || '';
  const config = {
    apiKey: process.env.FIREBASE_WEB_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    appId,
    messagingSenderId: numericSenderId(process.env.FIREBASE_MESSAGING_SENDER_ID, appId),
  };

  const missing = Object.entries(config)
    .filter(([key, value]) => ['apiKey', 'authDomain', 'projectId', 'appId'].includes(key) && !value)
    .map(([key]) => key);

  return sendJson(res, missing.length ? 503 : 200, missing.length ? {
    error: 'Firebase web configuration is incomplete.',
    missing,
  } : config, {
    'Cache-Control': 'no-store, max-age=0',
  });
};
