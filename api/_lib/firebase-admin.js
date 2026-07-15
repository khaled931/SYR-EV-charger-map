'use strict';

const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const DEFAULT_ADMIN_EMAIL = 'khaled.alassad@syrianrenewables.com';

function hasFirebaseAdminConfig() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  if (!hasFirebaseAdminConfig()) {
    const error = new Error('Firebase Admin environment variables are not configured.');
    error.code = 'firebase/not-configured';
    throw error;
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

function getDb() {
  return getFirestore(getAdminApp());
}

function getAdminAuth() {
  return getAuth(getAdminApp());
}

function allowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAIL)
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function requireAdmin(req) {
  const authorization = String(req.headers.authorization || '');
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    const error = new Error('Authentication is required.');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(match[1], true);
  } catch {
    const error = new Error('The authentication session is invalid or expired.');
    error.statusCode = 401;
    throw error;
  }

  const email = String(decoded.email || '').trim().toLowerCase();
  if (!email || !allowedAdminEmails().includes(email)) {
    const error = new Error('This account is not authorized to access the administration panel.');
    error.statusCode = 403;
    throw error;
  }

  const requireVerified = String(process.env.ADMIN_REQUIRE_EMAIL_VERIFIED || 'true').toLowerCase() !== 'false';
  if (requireVerified && decoded.email_verified !== true) {
    const error = new Error('The administrator email address must be verified.');
    error.statusCode = 403;
    error.code = 'auth/email-not-verified';
    throw error;
  }

  return { uid: decoded.uid, email };
}

module.exports = {
  allowedAdminEmails,
  getAdminAuth,
  getDb,
  hasFirebaseAdminConfig,
  requireAdmin,
};
