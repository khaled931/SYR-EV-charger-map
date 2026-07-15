import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
  browserSessionPersistence,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

const els = Object.fromEntries([
  'loginView', 'dashboardView', 'loginForm', 'loginEmail', 'loginPassword', 'loginMessage',
  'adminIdentity', 'logoutButton', 'refreshButton', 'recordCount', 'publishedCount',
  'governorateCount', 'companyCount', 'chargerForm', 'editingId', 'formTitle', 'resetFormButton',
  'cancelEditButton', 'saveButton', 'formMessage', 'resolveMapsButton', 'mapsMessage',
  'recordsTableBody', 'recordsSearch', 'recordsMessage', 'importFile', 'importMode',
  'previewImportButton', 'commitImportButton', 'downloadTemplateButton', 'importMessage',
  'importPreview', 'exportXlsxButton', 'exportCsvButton', 'exportJsonButton',
].map((id) => [id, document.getElementById(id)]));

const state = {
  auth: null,
  user: null,
  records: [],
  filteredRecords: [],
  importRecords: [],
  importErrors: [],
};

const importHeaders = [
  'Suggested_ID', 'Company_AR', 'Company_EN', 'Governorate_AR', 'Governorate_EN',
  'City_AR', 'City_EN', 'Site_Name_AR', 'Site_Name_EN', 'Charger_Type_AR',
  'Charger_Type_EN', 'Charger_Numbers', 'Site_Type_AR', 'Site_Type_EN',
  'Google_Maps_URL', 'Latitude', 'Longitude', 'Published', 'Rated_Power_kW',
  'Guns_Per_Charger', 'Status', 'Data_Quality',
];

const siteTypeEnglish = {
  'شركة / مكتب': 'Company / office',
  'فندق': 'Hotel',
  'مركز تجاري': 'Mall / commercial',
  'استراحة / محطة خدمة': 'Rest area / service station',
  'محطة خدمة': 'Service station',
  'سفارة / جهة مؤسسية': 'Embassy / institution',
};

boot().catch((error) => {
  setMessage(els.loginMessage, error.message || 'تعذر تشغيل لوحة الإدارة.', 'error');
});

async function boot() {
  bindEvents();
  const response = await fetch('/api/firebase-config', { cache: 'no-store', credentials: 'same-origin' });
  const config = await response.json();
  if (!response.ok) throw new Error(config.error || 'إعدادات Firebase غير مكتملة على الخادم.');

  state.auth = getAuth(initializeApp(config));
  await setPersistence(state.auth, browserSessionPersistence);
  onAuthStateChanged(state.auth, handleAuthState);
}

function bindEvents() {
  els.loginForm.addEventListener('submit', login);
  els.logoutButton.addEventListener('click', () => signOut(state.auth));
  els.refreshButton.addEventListener('click', loadRecords);
  els.chargerForm.addEventListener('submit', saveRecord);
  els.resetFormButton.addEventListener('click', resetForm);
  els.cancelEditButton.addEventListener('click', resetForm);
  els.resolveMapsButton.addEventListener('click', resolveFormCoordinates);
  els.recordsSearch.addEventListener('input', filterRecords);
  els.previewImportButton.addEventListener('click', previewImport);
  els.commitImportButton.addEventListener('click', commitImport);
  els.downloadTemplateButton.addEventListener('click', downloadTemplate);
  els.exportXlsxButton.addEventListener('click', () => exportRecords('xlsx'));
  els.exportCsvButton.addEventListener('click', () => exportRecords('csv'));
  els.exportJsonButton.addEventListener('click', () => exportRecords('json'));
}

async function login(event) {
  event.preventDefault();
  setMessage(els.loginMessage, 'جاري التحقق من الحساب…');
  try {
    const credential = await signInWithEmailAndPassword(state.auth, els.loginEmail.value.trim(), els.loginPassword.value);
    if (!credential.user.emailVerified) {
      await sendEmailVerification(credential.user);
      await signOut(state.auth);
      throw new Error('تم إرسال رسالة تحقق إلى البريد الإلكتروني. افتح الرابط ثم أعد تسجيل الدخول.');
    }
  } catch (error) {
    setMessage(els.loginMessage, friendlyAuthError(error), 'error');
  } finally {
    els.loginPassword.value = '';
  }
}

async function handleAuthState(user) {
  state.user = user;
  if (!user) {
    els.loginView.hidden = false;
    els.dashboardView.hidden = true;
    state.records = [];
    return;
  }

  els.loginView.hidden = true;
  els.dashboardView.hidden = false;
  els.adminIdentity.textContent = `الحساب الإداري: ${user.email}`;
  await loadRecords();
}

async function apiFetch(url, options = {}) {
  if (!state.user) throw new Error('انتهت جلسة الدخول.');
  const token = await state.user.getIdToken();
  const response = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) await signOut(state.auth);
    const error = new Error(payload.error || `Request failed (${response.status}).`);
    error.payload = payload;
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function loadRecords() {
  setMessage(els.recordsMessage, 'جاري تحميل السجلات…');
  try {
    const payload = await apiFetch('/api/admin/chargers');
    state.records = Array.isArray(payload.records) ? payload.records : [];
    filterRecords();
    renderStats();
    setMessage(els.recordsMessage, `تم تحميل ${formatNumber(state.records.length)} سجل.`, 'success');
  } catch (error) {
    setMessage(els.recordsMessage, error.message, 'error');
  }
}

function renderStats() {
  els.recordCount.textContent = formatNumber(state.records.length);
  els.publishedCount.textContent = formatNumber(state.records.filter((record) => record.published !== false).length);
  els.governorateCount.textContent = formatNumber(new Set(state.records.map((record) => record.governorate_ar).filter(Boolean)).size);
  els.companyCount.textContent = formatNumber(new Set(state.records.map((record) => record.company_ar || record.operator).filter(Boolean)).size);
}

function filterRecords() {
  const term = normalizeText(els.recordsSearch.value);
  state.filteredRecords = state.records.filter((record) => !term || normalizeText([
    record.suggested_id, record.site_name_ar, record.site_name_en, record.company_ar,
    record.company_en, record.governorate_ar, record.governorate_en, record.city_ar,
    record.city_en, record.charger_type_ar, record.charger_type_en,
  ].join(' ')).includes(term));
  renderRecords();
}

function renderRecords() {
  els.recordsTableBody.replaceChildren();
  if (!state.filteredRecords.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 8;
    cell.textContent = 'لا توجد سجلات مطابقة.';
    row.appendChild(cell);
    els.recordsTableBody.appendChild(row);
    return;
  }

  state.filteredRecords.forEach((record) => {
    const row = document.createElement('tr');
    row.append(
      cellWithCode(record.suggested_id),
      textCell(record.site_name_ar || record.name_ar),
      textCell(record.company_ar || record.operator),
      textCell(record.governorate_ar),
      textCell(record.charger_type_ar || record.charger_type_en),
      textCell(formatNumber(record.charger_numbers ?? record.charger_count ?? 0)),
      statusCell(record.published !== false),
      actionCell(record),
    );
    els.recordsTableBody.appendChild(row);
  });
}

function cellWithCode(value) {
  const cell = document.createElement('td');
  const code = document.createElement('code');
  code.textContent = value || '—';
  cell.appendChild(code);
  return cell;
}

function textCell(value) {
  const cell = document.createElement('td');
  cell.textContent = value || '—';
  return cell;
}

function statusCell(published) {
  const cell = document.createElement('td');
  const pill = document.createElement('span');
  pill.className = `status-pill${published ? '' : ' status-pill--off'}`;
  pill.textContent = published ? 'منشور' : 'مسودة';
  cell.appendChild(pill);
  return cell;
}

function actionCell(record) {
  const cell = document.createElement('td');
  const wrapper = document.createElement('div');
  wrapper.className = 'row-actions';
  const edit = button('تعديل', 'button button--secondary button--small', () => editRecord(record));
  const remove = button('حذف', 'button button--danger-ghost button--small', () => deleteRecord(record));
  wrapper.append(edit, remove);
  cell.appendChild(wrapper);
  return cell;
}

function button(label, className, handler) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = className;
  element.textContent = label;
  element.addEventListener('click', handler);
  return element;
}

async function resolveFormCoordinates() {
  const url = els.chargerForm.elements.google_maps_url.value.trim();
  if (!url) return setMessage(els.mapsMessage, 'أدخل رابط Google Maps أولاً.', 'error');
  els.resolveMapsButton.disabled = true;
  setMessage(els.mapsMessage, 'جاري استخراج الإحداثيات من الرابط…');
  try {
    const result = await resolveMapsUrl(url);
    els.chargerForm.elements.latitude.value = result.latitude;
    els.chargerForm.elements.longitude.value = result.longitude;
    setMessage(els.mapsMessage, `تم تحديد الموقع: ${result.latitude}, ${result.longitude}`, 'success');
  } catch (error) {
    setMessage(els.mapsMessage, `${error.message} استخدم حقلي Latitude وLongitude أدناه.`, 'warning');
  } finally {
    els.resolveMapsButton.disabled = false;
  }
}

async function resolveMapsUrl(url) {
  return apiFetch('/api/admin/resolve-maps', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

async function saveRecord(event) {
  event.preventDefault();
  if (!els.chargerForm.reportValidity()) return;
  const record = formRecord();
  const editingId = els.editingId.value;
  els.saveButton.disabled = true;
  setMessage(els.formMessage, editingId ? 'جاري حفظ التعديلات…' : 'جاري إضافة السجل…');
  try {
    await apiFetch('/api/admin/chargers', {
      method: editingId ? 'PUT' : 'POST',
      body: JSON.stringify(editingId ? { id: editingId, record } : { record, mode: 'insert' }),
    });
    setMessage(els.formMessage, editingId ? 'تم تحديث السجل بنجاح.' : 'تمت إضافة السجل ونشره بنجاح.', 'success');
    resetForm(false);
    await loadRecords();
  } catch (error) {
    setMessage(els.formMessage, formatApiValidationError(error), 'error');
  } finally {
    els.saveButton.disabled = false;
  }
}

function formRecord() {
  const form = els.chargerForm.elements;
  return {
    suggested_id: form.suggested_id.value.trim(),
    company_ar: form.company_ar.value.trim(),
    company_en: form.company_en.value.trim(),
    governorate_ar: form.governorate_ar.value.trim(),
    governorate_en: form.governorate_en.value.trim(),
    city_ar: form.city_ar.value.trim(),
    city_en: form.city_en.value.trim(),
    site_name_ar: form.site_name_ar.value.trim(),
    site_name_en: form.site_name_en.value.trim(),
    charger_type_ar: form.charger_type_ar.value.trim(),
    charger_type_en: form.charger_type_en.value.trim(),
    charger_numbers: Number(form.charger_numbers.value),
    site_type_ar: form.site_type_ar.value.trim(),
    site_type_en: form.site_type_en.value.trim(),
    google_maps_url: form.google_maps_url.value.trim(),
    latitude: Number(form.latitude.value),
    longitude: Number(form.longitude.value),
    published: form.published.checked,
  };
}

function editRecord(record) {
  const form = els.chargerForm.elements;
  els.editingId.value = record.suggested_id;
  form.suggested_id.value = record.suggested_id || '';
  form.company_ar.value = record.company_ar || record.operator_ar || record.operator || '';
  form.company_en.value = record.company_en || record.operator_en || record.operator || '';
  form.governorate_ar.value = record.governorate_ar || '';
  form.governorate_en.value = record.governorate_en || '';
  form.city_ar.value = record.city_ar || '';
  form.city_en.value = record.city_en || record.governorate_en || '';
  form.site_name_ar.value = record.site_name_ar || record.name_ar || '';
  form.site_name_en.value = record.site_name_en || record.name_en || '';
  form.charger_type_ar.value = record.charger_type_ar || record.connector_types?.[0] || '';
  form.charger_type_en.value = record.charger_type_en || record.connector_types?.[0] || '';
  form.charger_numbers.value = record.charger_numbers ?? record.charger_count ?? 1;
  form.site_type_ar.value = record.site_type_ar || '';
  form.site_type_en.value = record.site_type_en || siteTypeEnglish[record.site_type_ar] || '';
  form.google_maps_url.value = record.google_maps_url || record.source_url || '';
  form.latitude.value = record.latitude ?? '';
  form.longitude.value = record.longitude ?? '';
  form.published.checked = record.published !== false;
  els.formTitle.textContent = `تعديل: ${record.site_name_ar || record.name_ar || record.suggested_id}`;
  els.saveButton.textContent = 'حفظ التعديلات';
  els.cancelEditButton.hidden = false;
  setMessage(els.formMessage, '');
  window.scrollTo({ top: els.chargerForm.closest('.panel').offsetTop - 20, behavior: 'smooth' });
}

async function deleteRecord(record) {
  const label = record.site_name_ar || record.name_ar || record.suggested_id;
  if (!window.confirm(`سيتم حذف السجل «${label}» نهائياً. هل تريد المتابعة؟`)) return;
  setMessage(els.recordsMessage, 'جاري حذف السجل…');
  try {
    await apiFetch('/api/admin/chargers', {
      method: 'DELETE',
      body: JSON.stringify({ id: record.suggested_id }),
    });
    if (els.editingId.value === record.suggested_id) resetForm();
    await loadRecords();
    setMessage(els.recordsMessage, 'تم حذف السجل.', 'success');
  } catch (error) {
    setMessage(els.recordsMessage, error.message, 'error');
  }
}

function resetForm(clearMessage = true) {
  els.chargerForm.reset();
  els.chargerForm.elements.published.checked = true;
  els.editingId.value = '';
  els.formTitle.textContent = 'إضافة موقع شحن جديد';
  els.saveButton.textContent = 'حفظ ونشر السجل';
  els.cancelEditButton.hidden = true;
  setMessage(els.mapsMessage, '');
  if (clearMessage) setMessage(els.formMessage, '');
}

async function previewImport() {
  const file = els.importFile.files?.[0];
  if (!file) return setMessage(els.importMessage, 'اختر ملفاً أولاً.', 'error');
  els.previewImportButton.disabled = true;
  els.commitImportButton.disabled = true;
  state.importRecords = [];
  state.importErrors = [];
  setMessage(els.importMessage, 'جاري قراءة الملف وفحص السجلات…');

  try {
    const rawRows = await readImportFile(file);
    if (!rawRows.length) throw new Error('الملف لا يحتوي على سجلات.');
    if (rawRows.length > 300) throw new Error('الحد الأقصى للاستيراد في العملية الواحدة هو 300 سجل.');

    for (let index = 0; index < rawRows.length; index += 1) {
      setMessage(els.importMessage, `فحص السجل ${index + 1} من ${rawRows.length}…`);
      const record = canonicalImportRecord(rawRows[index]);
      if ((!Number.isFinite(record.latitude) || !Number.isFinite(record.longitude)) && record.google_maps_url) {
        try {
          const resolved = await resolveMapsUrl(record.google_maps_url);
          record.latitude = resolved.latitude;
          record.longitude = resolved.longitude;
        } catch (error) {
          state.importErrors.push({ row: index + 2, errors: [error.message] });
        }
      }
      const errors = clientValidation(record);
      if (errors.length) state.importErrors.push({ row: index + 2, errors });
      state.importRecords.push(record);
    }

    renderImportPreview();
    if (state.importErrors.length) {
      setMessage(els.importMessage, `تم العثور على أخطاء في ${state.importErrors.length} سجل. أصلح الملف ثم أعد المعاينة.`, 'error');
    } else {
      setMessage(els.importMessage, `الملف صالح: ${state.importRecords.length} سجل جاهز للاستيراد.`, 'success');
      els.commitImportButton.disabled = false;
    }
  } catch (error) {
    setMessage(els.importMessage, error.message, 'error');
    els.importPreview.hidden = true;
  } finally {
    els.previewImportButton.disabled = false;
  }
}

async function commitImport() {
  if (!state.importRecords.length || state.importErrors.length) return;
  els.commitImportButton.disabled = true;
  setMessage(els.importMessage, 'جاري كتابة البيانات إلى Firebase…');
  try {
    const result = await apiFetch('/api/admin/chargers', {
      method: 'POST',
      body: JSON.stringify({ records: state.importRecords, mode: els.importMode.value }),
    });
    setMessage(els.importMessage, `تم استيراد ${result.count} سجل بنجاح.`, 'success');
    state.importRecords = [];
    els.importFile.value = '';
    els.importPreview.hidden = true;
    await loadRecords();
  } catch (error) {
    setMessage(els.importMessage, formatApiValidationError(error), 'error');
  } finally {
    els.commitImportButton.disabled = false;
  }
}

async function readImportFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension === 'json') {
    const parsed = JSON.parse(await file.text());
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.records)) return parsed.records;
    if (Array.isArray(parsed.chargers)) {
      const defaults = parsed.defaults || {};
      return parsed.chargers.map((row) => ({ ...defaults, ...row }));
    }
    throw new Error('JSON must contain an array, records[], or chargers[].');
  }
  if (!window.XLSX) throw new Error('تعذر تحميل مكتبة Excel. أعد تحميل الصفحة.');
  const workbook = window.XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return window.XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
}

function canonicalImportRecord(row) {
  const value = (...keys) => {
    for (const key of keys) if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key];
    return '';
  };
  const governorateEn = String(value('Governorate_EN', 'governorate_en') || '').trim();
  const siteTypeAr = String(value('Site_Type_AR', 'Site_Type', 'site_type_ar') || '').trim();
  const connector = Array.isArray(row.connector_types) ? row.connector_types[0] : '';
  return {
    suggested_id: String(value('Suggested_ID', 'suggested_id', 'id', 'ID') || '').trim(),
    company_ar: String(value('Company_AR', 'Company', 'company_ar', 'operator_ar', 'operator') || '').trim(),
    company_en: String(value('Company_EN', 'company_en', 'operator_en', 'operator') || '').trim(),
    governorate_ar: String(value('Governorate_AR', 'Governorate', 'governorate_ar') || '').trim(),
    governorate_en: governorateEn,
    city_ar: String(value('City_AR', 'City', 'city_ar') || '').trim(),
    city_en: String(value('City_EN', 'city_en') || governorateEn).trim(),
    site_name_ar: String(value('Site_Name_AR', 'Site_Name_(POI)', 'site_name_ar', 'name_ar') || '').trim(),
    site_name_en: String(value('Site_Name_EN', 'site_name_en', 'name_en') || '').trim(),
    charger_type_ar: String(value('Charger_Type_AR', 'Charger type', 'charger_type_ar', 'charger_type', 'connector_type') || connector).trim(),
    charger_type_en: String(value('Charger_Type_EN', 'charger_type_en', 'charger_type', 'connector_type') || connector).trim(),
    charger_numbers: Number(value('Charger_Numbers', 'Charger numbers', 'charger_numbers', 'charger_count')),
    site_type_ar: siteTypeAr,
    site_type_en: String(value('Site_Type_EN', 'site_type_en') || siteTypeEnglish[siteTypeAr] || '').trim(),
    google_maps_url: String(value('Google_Maps_URL', 'google_maps_url', 'source_url') || '').trim(),
    latitude: numberOrNaN(value('Latitude', 'latitude')),
    longitude: numberOrNaN(value('Longitude', 'longitude')),
    published: parseBoolean(value('Published', 'published'), true),
    rated_power_kw: Number(value('Rated_Power_kW', 'rated_power_kw', 'power_kw')) || 0,
    guns_per_charger: Number(value('Guns_Per_Charger', 'guns_per_charger', 'guns')) || 0,
    status: String(value('Status', 'status') || 'listed').trim(),
    data_quality: String(value('Data_Quality', 'data_quality') || 'Medium Confidence').trim(),
  };
}

function clientValidation(record) {
  const errors = [];
  const required = [
    ['suggested_id', 'Suggested_ID'], ['company_ar', 'Company_AR'], ['company_en', 'Company_EN'],
    ['governorate_ar', 'Governorate_AR'], ['governorate_en', 'Governorate_EN'], ['city_ar', 'City_AR'],
    ['city_en', 'City_EN'], ['site_name_ar', 'Site_Name_AR'], ['site_name_en', 'Site_Name_EN'],
    ['charger_type_ar', 'Charger_Type_AR'], ['charger_type_en', 'Charger_Type_EN'],
    ['site_type_ar', 'Site_Type_AR'], ['site_type_en', 'Site_Type_EN'], ['google_maps_url', 'Google_Maps_URL'],
  ];
  required.forEach(([key, label]) => { if (!record[key]) errors.push(`${label} مفقود.`); });
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,89}$/.test(record.suggested_id)) errors.push('صيغة Suggested_ID غير صالحة.');
  if (!Number.isInteger(record.charger_numbers) || record.charger_numbers < 1 || record.charger_numbers > 200) errors.push('Charger_Numbers يجب أن يكون عدداً صحيحاً بين 1 و200.');
  if (!Number.isFinite(record.latitude) || record.latitude < 32 || record.latitude > 38) errors.push('Latitude غير صالح أو خارج سورية.');
  if (!Number.isFinite(record.longitude) || record.longitude < 35 || record.longitude > 43) errors.push('Longitude غير صالح أو خارج سورية.');
  return errors;
}

function renderImportPreview() {
  els.importPreview.hidden = false;
  els.importPreview.replaceChildren();
  if (state.importErrors.length) {
    const list = document.createElement('ul');
    list.className = 'preview-errors';
    state.importErrors.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `السطر ${item.row}: ${[...new Set(item.errors)].join(' | ')}`;
      list.appendChild(li);
    });
    els.importPreview.appendChild(list);
    return;
  }

  const table = document.createElement('table');
  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['Suggested_ID', 'Site', 'Company', 'Governorate', 'Coordinates'].forEach((label) => headRow.appendChild(textHeader(label)));
  head.appendChild(headRow);
  const body = document.createElement('tbody');
  state.importRecords.slice(0, 20).forEach((record) => {
    const row = document.createElement('tr');
    row.append(textCell(record.suggested_id), textCell(record.site_name_ar), textCell(record.company_ar), textCell(record.governorate_ar), textCell(`${record.latitude}, ${record.longitude}`));
    body.appendChild(row);
  });
  table.append(head, body);
  els.importPreview.appendChild(table);
  if (state.importRecords.length > 20) {
    const note = document.createElement('p');
    note.className = 'muted';
    note.textContent = `تظهر أول 20 سجلاً من أصل ${state.importRecords.length}.`;
    els.importPreview.appendChild(note);
  }
}

function textHeader(label) {
  const th = document.createElement('th');
  th.textContent = label;
  return th;
}

function exportRows() {
  return state.records.map((record) => ({
    Suggested_ID: record.suggested_id || record.id || '',
    Company_AR: record.company_ar || record.operator_ar || record.operator || '',
    Company_EN: record.company_en || record.operator_en || record.operator || '',
    Governorate_AR: record.governorate_ar || '',
    Governorate_EN: record.governorate_en || '',
    City_AR: record.city_ar || '',
    City_EN: record.city_en || '',
    Site_Name_AR: record.site_name_ar || record.name_ar || '',
    Site_Name_EN: record.site_name_en || record.name_en || '',
    Charger_Type_AR: record.charger_type_ar || record.connector_types?.[0] || '',
    Charger_Type_EN: record.charger_type_en || record.connector_types?.[0] || '',
    Charger_Numbers: record.charger_numbers ?? record.charger_count ?? '',
    Site_Type_AR: record.site_type_ar || '',
    Site_Type_EN: record.site_type_en || '',
    Google_Maps_URL: record.google_maps_url || record.source_url || '',
    Latitude: record.latitude ?? '',
    Longitude: record.longitude ?? '',
    Published: record.published !== false,
    Rated_Power_kW: record.rated_power_kw ?? '',
    Guns_Per_Charger: record.guns_per_charger ?? '',
    Status: record.status || 'listed',
    Data_Quality: record.data_quality || 'Medium Confidence',
  }));
}

function exportRecords(format) {
  const rows = exportRows();
  if (!rows.length) return setMessage(els.recordsMessage, 'لا توجد بيانات لتصديرها.', 'warning');
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === 'json') {
    downloadBlob(JSON.stringify(rows, null, 2), `syrian-ev-chargers-${stamp}.json`, 'application/json;charset=utf-8');
    return;
  }
  if (!window.XLSX) return setMessage(els.recordsMessage, 'تعذر تحميل مكتبة Excel.', 'error');
  const worksheet = window.XLSX.utils.json_to_sheet(rows, { header: importHeaders });
  if (format === 'csv') {
    const csv = window.XLSX.utils.sheet_to_csv(worksheet);
    downloadBlob(`\ufeff${csv}`, `syrian-ev-chargers-${stamp}.csv`, 'text/csv;charset=utf-8');
    return;
  }
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, 'EV Chargers');
  window.XLSX.writeFile(workbook, `syrian-ev-chargers-${stamp}.xlsx`);
}

function downloadTemplate() {
  if (!window.XLSX) return setMessage(els.importMessage, 'تعذر تحميل مكتبة Excel.', 'error');
  const worksheet = window.XLSX.utils.aoa_to_sheet([importHeaders]);
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Template');
  window.XLSX.writeFile(workbook, 'ev-chargers-import-template.xlsx');
}

function downloadBlob(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function numberOrNaN(value) {
  if (value === '' || value === null || value === undefined) return Number.NaN;
  const number = Number(value);
  return Number.isFinite(number) ? number : Number.NaN;
}

function parseBoolean(value, fallback) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value ?? '').trim().toLowerCase();
  if (['false', 'no', '0', 'غير منشور', 'مسودة'].includes(normalized)) return false;
  if (['true', 'yes', '1', 'منشور'].includes(normalized)) return true;
  return fallback;
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();
}

function setMessage(element, message, type = '') {
  element.textContent = message || '';
  element.classList.remove('is-error', 'is-success', 'is-warning');
  if (type) element.classList.add(`is-${type}`);
}

function formatApiValidationError(error) {
  const invalid = error.payload?.invalid;
  if (!Array.isArray(invalid) || !invalid.length) return error.message;
  return `${error.message} ${invalid.map((item) => `السطر ${item.row}: ${item.errors.join('، ')}`).join(' | ')}`;
}

function friendlyAuthError(error) {
  const code = String(error.code || '');
  if (code.includes('invalid-credential')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  if (code.includes('too-many-requests')) return 'تم إيقاف المحاولات مؤقتاً بسبب كثرة المحاولات. حاول لاحقاً.';
  if (code.includes('network-request-failed')) return 'تعذر الاتصال بخدمة تسجيل الدخول.';
  return error.message || 'تعذر تسجيل الدخول.';
}

function formatNumber(value) {
  return new Intl.NumberFormat('ar-SY').format(Number(value) || 0);
}
