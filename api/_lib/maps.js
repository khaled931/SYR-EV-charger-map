'use strict';

const GOOGLE_HOST_PATTERNS = [
  /(^|\.)google\.[a-z.]+$/i,
  /(^|\.)maps\.app\.goo\.gl$/i,
  /(^|\.)goo\.gl$/i,
];

function isGoogleMapsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && GOOGLE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname));
  } catch {
    return false;
  }
}

function isValidCoordinatePair(latitude, longitude) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function isWithinSyriaBounds(latitude, longitude) {
  return latitude >= 32 && latitude <= 38 && longitude >= 35 && longitude <= 43;
}

function normalizePair(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!isValidCoordinatePair(lat, lng)) return null;
  return { latitude: Number(lat.toFixed(7)), longitude: Number(lng.toFixed(7)) };
}

function parseCoordinates(value) {
  if (!value) return null;
  const raw = String(value).replace(/&amp;/g, '&');
  let text = raw;
  try { text = decodeURIComponent(raw); } catch { text = raw; }
  const patterns = [
    /@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)(?:,|z|\/)/i,
    /!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/i,
    /(?:[?&](?:q|query|ll|center)=)(-?\d{1,2}(?:\.\d+)?)[,%20+ ]+(-?\d{1,3}(?:\.\d+)?)/i,
    /"latitude"\s*:\s*(-?\d{1,2}(?:\.\d+)?)[\s\S]{0,80}?"longitude"\s*:\s*(-?\d{1,3}(?:\.\d+)?)/i,
    /\[null,null,(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)\]/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const pair = normalizePair(match[1], match[2]);
      if (pair) return pair;
    }
  }
  return null;
}

async function resolveGoogleMapsUrl(value) {
  if (!isGoogleMapsUrl(value)) {
    const error = new Error('Only valid Google Maps HTTPS links are accepted.');
    error.statusCode = 400;
    throw error;
  }

  const direct = parseCoordinates(value);
  if (direct) return { ...direct, resolvedUrl: value, method: 'url' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(value, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SyrianRenewablesMapBot/1.0; +https://syrianrenewables.com/)',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
      },
    });

    const finalUrl = response.url || value;
    const fromFinalUrl = parseCoordinates(finalUrl);
    if (fromFinalUrl) return { ...fromFinalUrl, resolvedUrl: finalUrl, method: 'redirect' };

    const body = (await response.text()).slice(0, 1_500_000);
    const fromBody = parseCoordinates(body);
    if (fromBody) return { ...fromBody, resolvedUrl: finalUrl, method: 'page' };

    const error = new Error('Coordinates could not be extracted from this Google Maps link. Enter latitude and longitude manually.');
    error.statusCode = 422;
    throw error;
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Google Maps link resolution timed out. Enter coordinates manually.');
      timeoutError.statusCode = 422;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  isGoogleMapsUrl,
  isValidCoordinatePair,
  isWithinSyriaBounds,
  parseCoordinates,
  resolveGoogleMapsUrl,
};
