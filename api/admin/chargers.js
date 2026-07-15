'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const { getDb, requireAdmin } = require('../_lib/firebase-admin');
const { assertJsonSize, ensureSameOrigin, handleError, methodNotAllowed, sendJson } = require('../_lib/http');
const { validateRecord } = require('../_lib/validation');

const COLLECTION = 'ev_chargers';
const MAX_BULK_RECORDS = 300;

function serializeTimestamp(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return value;
}

function serializeRecord(doc) {
  const data = doc.data();
  return {
    ...data,
    suggested_id: doc.id,
    created_at: serializeTimestamp(data.created_at),
    updated_at: serializeTimestamp(data.updated_at),
  };
}

async function listRecords(res) {
  const snapshot = await getDb().collection(COLLECTION).get();
  const records = snapshot.docs.map(serializeRecord).sort((a, b) => String(a.suggested_id).localeCompare(String(b.suggested_id), 'en'));
  return sendJson(res, 200, { records }, { 'Cache-Control': 'no-store' });
}

async function createRecords(req, res, admin) {
  assertJsonSize(req);
  const body = req.body || {};
  const rawRecords = Array.isArray(body.records) ? body.records : [body.record || body];
  const mode = body.mode === 'upsert' ? 'upsert' : 'insert';

  if (!rawRecords.length || rawRecords.length > MAX_BULK_RECORDS) {
    const error = new Error(`Import must contain between 1 and ${MAX_BULK_RECORDS} records.`);
    error.statusCode = 400;
    throw error;
  }

  const validated = rawRecords.map((raw, index) => ({ index, ...validateRecord(raw) }));
  const invalid = validated.filter((item) => !item.valid).map((item) => ({ row: item.index + 1, errors: item.errors }));
  if (invalid.length) {
    return sendJson(res, 422, { error: 'One or more records failed validation.', invalid });
  }

  const ids = validated.map((item) => item.record.suggested_id);
  if (new Set(ids).size !== ids.length) {
    return sendJson(res, 409, { error: 'The submitted records contain duplicate Suggested_ID values.' });
  }

  const db = getDb();
  const refs = ids.map((id) => db.collection(COLLECTION).doc(id));
  const existing = await db.getAll(...refs);
  if (mode === 'insert') {
    const conflicts = existing.filter((snapshot) => snapshot.exists).map((snapshot) => snapshot.id);
    if (conflicts.length) return sendJson(res, 409, { error: 'Some Suggested_ID values already exist.', conflicts });
  }

  const batch = db.batch();
  validated.forEach(({ record }, index) => {
    const ref = refs[index];
    const audit = {
      updated_at: FieldValue.serverTimestamp(),
      updated_by: admin.email,
    };
    if (!existing[index].exists) {
      audit.created_at = FieldValue.serverTimestamp();
      audit.created_by = admin.email;
    }
    batch.set(ref, { ...record, ...audit }, { merge: mode === 'upsert' });
  });
  await batch.commit();
  await db.collection('ev_charger_audit').add({
    action: mode === 'insert' ? 'create' : 'upsert',
    record_ids: ids,
    record_count: ids.length,
    actor_email: admin.email,
    actor_uid: admin.uid,
    created_at: FieldValue.serverTimestamp(),
  });

  return sendJson(res, mode === 'insert' ? 201 : 200, { success: true, count: validated.length, mode });
}

async function updateRecord(req, res, admin) {
  assertJsonSize(req);
  const body = req.body || {};
  const originalId = String(body.id || '').trim();
  if (!originalId) return sendJson(res, 400, { error: 'The existing record id is required.' });

  const { valid, errors, record } = validateRecord(body.record || body);
  if (!valid) return sendJson(res, 422, { error: 'The record failed validation.', invalid: [{ row: 1, errors }] });

  const db = getDb();
  const existingRef = db.collection(COLLECTION).doc(originalId);
  const existing = await existingRef.get();
  if (!existing.exists) return sendJson(res, 404, { error: 'The charger record was not found.' });

  if (record.suggested_id !== originalId) {
    const targetRef = db.collection(COLLECTION).doc(record.suggested_id);
    const target = await targetRef.get();
    if (target.exists) return sendJson(res, 409, { error: 'The new Suggested_ID already exists.' });

    const batch = db.batch();
    batch.set(targetRef, {
      ...record,
      created_at: existing.data().created_at || FieldValue.serverTimestamp(),
      created_by: existing.data().created_by || admin.email,
      updated_at: FieldValue.serverTimestamp(),
      updated_by: admin.email,
    });
    batch.delete(existingRef);
    await batch.commit();
  } else {
    await existingRef.set({
      ...record,
      updated_at: FieldValue.serverTimestamp(),
      updated_by: admin.email,
    }, { merge: true });
  }

  await db.collection('ev_charger_audit').add({
    action: 'update',
    record_id: record.suggested_id,
    previous_record_id: originalId,
    actor_email: admin.email,
    actor_uid: admin.uid,
    created_at: FieldValue.serverTimestamp(),
  });

  return sendJson(res, 200, { success: true, id: record.suggested_id });
}

async function deleteRecord(req, res, admin) {
  assertJsonSize(req, 50_000);
  const id = String((req.body || {}).id || req.query.id || '').trim();
  if (!id) return sendJson(res, 400, { error: 'The record id is required.' });

  const ref = getDb().collection(COLLECTION).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) return sendJson(res, 404, { error: 'The charger record was not found.' });
  await ref.delete();
  await getDb().collection('ev_charger_audit').add({
    action: 'delete',
    record_id: id,
    actor_email: admin.email,
    actor_uid: admin.uid,
    created_at: FieldValue.serverTimestamp(),
  });
  return sendJson(res, 200, { success: true, id });
}

module.exports = async function handler(req, res) {
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);

  try {
    ensureSameOrigin(req);
    const admin = await requireAdmin(req);
    if (req.method === 'GET') return await listRecords(res);
    if (req.method === 'POST') return await createRecords(req, res, admin);
    if (req.method === 'PUT') return await updateRecord(req, res, admin);
    return await deleteRecord(req, res, admin);
  } catch (error) {
    return handleError(res, error);
  }
};
