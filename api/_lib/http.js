'use strict';

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), payment=()');
}

function sendJson(res, statusCode, payload, headers = {}) {
  applySecurityHeaders(res);
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.status(statusCode).json(payload);
}

function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  return sendJson(res, 405, { error: 'Method not allowed.' });
}

function ensureSameOrigin(req) {
  const origin = String(req.headers.origin || '').trim();
  if (!origin) return;

  const forwardedProto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const requestOrigin = host ? `${forwardedProto}://${host}` : '';
  const configuredOrigins = String(process.env.APP_ORIGINS || '')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (origin.replace(/\/$/, '') !== requestOrigin.replace(/\/$/, '') && !configuredOrigins.includes(origin.replace(/\/$/, ''))) {
    const error = new Error('Cross-origin requests are not allowed.');
    error.statusCode = 403;
    throw error;
  }
}

function assertJsonSize(req, maxBytes = 1_500_000) {
  const contentLength = Number(req.headers['content-length'] || 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    const error = new Error('The request body is too large.');
    error.statusCode = 413;
    throw error;
  }
}

function handleError(res, error) {
  const statusCode = Number(error.statusCode) || 500;
  const publicMessage = statusCode >= 500 ? 'The server could not complete the request.' : error.message;
  if (statusCode >= 500) console.error(error);
  return sendJson(res, statusCode, {
    error: publicMessage,
    code: error.code || undefined,
  });
}

module.exports = {
  applySecurityHeaders,
  assertJsonSize,
  ensureSameOrigin,
  handleError,
  methodNotAllowed,
  sendJson,
};
