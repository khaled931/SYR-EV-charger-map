'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isGoogleMapsUrl, isWithinSyriaBounds, parseCoordinates } = require('../api/_lib/maps');

test('parses coordinates from common Google Maps URL formats', () => {
  assert.deepEqual(parseCoordinates('https://www.google.com/maps/@33.5138,36.2765,15z'), { latitude: 33.5138, longitude: 36.2765 });
  assert.deepEqual(parseCoordinates('https://www.google.com/maps?q=34.72361,36.69641'), { latitude: 34.72361, longitude: 36.69641 });
  assert.deepEqual(parseCoordinates('https://www.google.com/maps/place/x/data=!3d35.1!4d37.2'), { latitude: 35.1, longitude: 37.2 });
});

test('allows only Google Maps HTTPS URLs', () => {
  assert.equal(isGoogleMapsUrl('https://maps.app.goo.gl/example'), true);
  assert.equal(isGoogleMapsUrl('https://www.google.com/maps?q=33,36'), true);
  assert.equal(isGoogleMapsUrl('http://www.google.com/maps?q=33,36'), false);
  assert.equal(isGoogleMapsUrl('https://example.com/maps?q=33,36'), false);
});

test('uses a conservative Syria bounding box', () => {
  assert.equal(isWithinSyriaBounds(35.1, 38.2), true);
  assert.equal(isWithinSyriaBounds(33.5, -84.3), false);
});
