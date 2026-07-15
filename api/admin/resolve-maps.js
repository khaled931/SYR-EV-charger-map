'use strict';

const { requireAdmin } = require('../_lib/firebase-admin');
const { assertJsonSize, ensureSameOrigin, handleError, methodNotAllowed, sendJson } = require('../_lib/http');
const { isWithinSyriaBounds, resolveGoogleMapsUrl } = require('../_lib/maps');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    ensureSameOrigin(req);
    assertJsonSize(req, 50_000);
    await requireAdmin(req);
    const url = String((req.body || {}).url || '').trim();
    const result = await resolveGoogleMapsUrl(url);

    if (!isWithinSyriaBounds(result.latitude, result.longitude)) {
      return sendJson(res, 422, {
        error: 'The extracted coordinates are outside Syria. Verify the Google Maps link or enter coordinates manually.',
        coordinates: result,
      });
    }

    return sendJson(res, 200, result, { 'Cache-Control': 'no-store' });
  } catch (error) {
    return handleError(res, error);
  }
};
