const DATA_URL = 'data/chargers.json';

const state = {
  chargers: [],
  filtered: [],
  markers: new Map(),
  map: null,
  markerLayer: null,
};

const els = {
  searchInput: document.getElementById('searchInput'),
  governorateFilter: document.getElementById('governorateFilter'),
  connectorFilter: document.getElementById('connectorFilter'),
  statusFilter: document.getElementById('statusFilter'),
  resetFilters: document.getElementById('resetFilters'),
  chargerList: document.getElementById('chargerList'),
  resultCount: document.getElementById('resultCount'),
  totalStations: document.getElementById('totalStations'),
  operationalStations: document.getElementById('operationalStations'),
  totalPower: document.getElementById('totalPower'),
  coveredGovernorates: document.getElementById('coveredGovernorates'),
};

const statusLabels = {
  operational: 'عاملة',
  partially_operational: 'عاملة جزئياً',
  planned: 'مخططة',
  under_construction: 'قيد الإنشاء',
  unavailable: 'غير متاحة',
  unknown: 'غير معروف',
};

const qualityLabels = {
  Verified: 'موثق',
  'High Confidence': 'ثقة عالية',
  'Medium Confidence': 'ثقة متوسطة',
  'Low Confidence': 'ثقة منخفضة',
  Estimated: 'تقديري',
  Unverified: 'غير موثق',
};

function initMap() {
  state.map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([34.8021, 38.9968], 6);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(state.map);

  state.markerLayer = L.layerGroup().addTo(state.map);
}

async function loadData() {
  renderLoading();
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`تعذر تحميل ملف البيانات: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('ملف البيانات يجب أن يكون مصفوفة JSON.');
    }
    state.chargers = normalizeData(data);
    state.filtered = [...state.chargers];
    populateFilters();
    applyFilters();
  } catch (error) {
    renderError(error.message);
  }
}

function normalizeData(data) {
  return data
    .map((item, index) => ({
      id: item.id || `charger-${index + 1}`,
      name_ar: item.name_ar || item.name || 'محطة غير مسماة',
      name_en: item.name_en || '',
      operator: item.operator || 'غير محدد',
      governorate: item.governorate || 'غير محدد',
      city: item.city || '',
      address: item.address || '',
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      connectors: Array.isArray(item.connectors) ? item.connectors : [],
      power_kw: Number(item.power_kw) || 0,
      guns: Number(item.guns) || 0,
      status: item.status || 'unknown',
      access: item.access || '',
      price_note: item.price_note || '',
      source_name: item.source_name || '',
      source_url: item.source_url || '',
      source_date: item.source_date || '',
      last_verified: item.last_verified || '',
      data_quality: item.data_quality || 'Unverified',
      notes: item.notes || '',
    }))
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
}

function populateFilters() {
  const governorates = uniqueSorted(state.chargers.map((item) => item.governorate));
  const connectors = uniqueSorted(state.chargers.flatMap((item) => item.connectors));
  const statuses = uniqueSorted(state.chargers.map((item) => item.status));

  setOptions(els.governorateFilter, governorates, 'كل المحافظات');
  setOptions(els.connectorFilter, connectors, 'كل المقابس');
  setOptions(els.statusFilter, statuses, 'كل الحالات', (value) => statusLabels[value] || value);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'ar'));
}

function setOptions(select, values, allLabel, labelMapper = (value) => value) {
  select.innerHTML = `<option value="all">${allLabel}</option>`;
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = labelMapper(value);
    select.appendChild(option);
  });
}

function applyFilters() {
  const searchTerm = normalizeText(els.searchInput.value);
  const governorate = els.governorateFilter.value;
  const connector = els.connectorFilter.value;
  const status = els.statusFilter.value;

  state.filtered = state.chargers.filter((item) => {
    const searchable = normalizeText([
      item.name_ar,
      item.name_en,
      item.operator,
      item.governorate,
      item.city,
      item.address,
      item.connectors.join(' '),
      item.status,
      item.notes,
    ].join(' '));

    const matchesSearch = !searchTerm || searchable.includes(searchTerm);
    const matchesGovernorate = governorate === 'all' || item.governorate === governorate;
    const matchesConnector = connector === 'all' || item.connectors.includes(connector);
    const matchesStatus = status === 'all' || item.status === status;

    return matchesSearch && matchesGovernorate && matchesConnector && matchesStatus;
  });

  renderStats();
  renderMarkers();
  renderList();
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

function renderStats() {
  const totalPower = state.filtered.reduce((sum, item) => sum + item.power_kw, 0);
  const operationalCount = state.filtered.filter((item) => item.status === 'operational').length;
  const governorateCount = new Set(state.filtered.map((item) => item.governorate).filter(Boolean)).size;

  els.totalStations.textContent = formatNumber(state.filtered.length);
  els.operationalStations.textContent = formatNumber(operationalCount);
  els.totalPower.textContent = formatNumber(totalPower);
  els.coveredGovernorates.textContent = formatNumber(governorateCount);
  els.resultCount.textContent = state.filtered.length
    ? `${formatNumber(state.filtered.length)} نتيجة مطابقة للفلاتر الحالية.`
    : 'لا توجد نتائج مطابقة للفلاتر الحالية.';
}

function renderMarkers() {
  state.markerLayer.clearLayers();
  state.markers.clear();

  const bounds = [];
  state.filtered.forEach((item) => {
    const marker = L.marker([item.latitude, item.longitude], {
      icon: L.divIcon({
        className: '',
        html: '<div class="ev-marker"><span>⚡</span></div>',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -30],
      }),
      title: item.name_ar,
    }).bindPopup(createPopup(item));

    marker.addTo(state.markerLayer);
    state.markers.set(item.id, marker);
    bounds.push([item.latitude, item.longitude]);
  });

  if (bounds.length === 1) {
    state.map.setView(bounds[0], 13);
  } else if (bounds.length > 1) {
    state.map.fitBounds(bounds, { padding: [38, 38], maxZoom: 12 });
  }
}

function createPopup(item) {
  const connectors = item.connectors.length ? item.connectors.join('، ') : 'غير محدد';
  const source = item.source_url
    ? `<a class="ev-source" href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener">المصدر</a>`
    : escapeHtml(item.source_name || 'مصدر غير محدد');

  return `
    <div class="ev-popup">
      <h3>${escapeHtml(item.name_ar)}</h3>
      <p><strong>الموقع:</strong> ${escapeHtml([item.city, item.governorate].filter(Boolean).join('، '))}</p>
      <p><strong>المشغل:</strong> ${escapeHtml(item.operator)}</p>
      <p><strong>المقبس:</strong> ${escapeHtml(connectors)}</p>
      <p><strong>القدرة:</strong> ${formatNumber(item.power_kw)} kW</p>
      <p><strong>عدد المخارج:</strong> ${formatNumber(item.guns)}</p>
      <p><strong>الحالة:</strong> ${escapeHtml(statusLabels[item.status] || item.status)}</p>
      <p><strong>جودة البيانات:</strong> ${escapeHtml(qualityLabels[item.data_quality] || item.data_quality)}</p>
      <p>${source}</p>
    </div>
  `;
}

function renderList() {
  els.chargerList.innerHTML = '';

  if (!state.chargers.length) {
    els.chargerList.innerHTML = `
      <div class="ev-empty">
        لم يتم إدخال بيانات الشواحن بعد. أضف السجلات إلى ملف <code>data/chargers.json</code> وسيتم عرضها تلقائياً على الخريطة.
      </div>
    `;
    return;
  }

  if (!state.filtered.length) {
    els.chargerList.innerHTML = '<div class="ev-empty">لا توجد نتائج مطابقة. جرّب تعديل الفلاتر أو البحث.</div>';
    return;
  }

  state.filtered.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'ev-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `عرض ${item.name_ar} على الخريطة`);
    card.innerHTML = createCard(item);
    card.addEventListener('click', () => focusMarker(item.id));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        focusMarker(item.id);
      }
    });
    els.chargerList.appendChild(card);
  });
}

function createCard(item) {
  const statusClass = item.status === 'operational'
    ? 'ev-chip--success'
    : item.status === 'planned' || item.status === 'under_construction'
      ? 'ev-chip--warning'
      : '';
  const connectorText = item.connectors.length ? item.connectors.join('، ') : 'غير محدد';
  const source = item.source_url
    ? `<a class="ev-source" href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">رابط المصدر</a>`
    : escapeHtml(item.source_name || 'مصدر غير محدد');

  return `
    <div class="ev-card__top">
      <div>
        <h3>${escapeHtml(item.name_ar)}</h3>
        <p>${escapeHtml([item.city, item.governorate].filter(Boolean).join('، '))}</p>
      </div>
      <span class="ev-chip ${statusClass}">${escapeHtml(statusLabels[item.status] || item.status)}</span>
    </div>
    <div class="ev-chip-row">
      <span class="ev-chip">${escapeHtml(connectorText)}</span>
      <span class="ev-chip">${formatNumber(item.power_kw)} kW</span>
      <span class="ev-chip">${formatNumber(item.guns)} مخارج</span>
      <span class="ev-chip">${escapeHtml(qualityLabels[item.data_quality] || item.data_quality)}</span>
    </div>
    <p><strong>المشغل:</strong> ${escapeHtml(item.operator)}</p>
    ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ''}
    <p><strong>آخر تحقق:</strong> ${escapeHtml(item.last_verified || 'غير محدد')}</p>
    <p><strong>المصدر:</strong> ${source}</p>
  `;
}

function focusMarker(id) {
  const item = state.filtered.find((charger) => charger.id === id);
  const marker = state.markers.get(id);
  if (!item || !marker) return;
  state.map.setView([item.latitude, item.longitude], 14, { animate: true });
  marker.openPopup();
}

function renderLoading() {
  els.chargerList.innerHTML = '<div class="ev-loading">جاري تحميل بيانات الشواحن…</div>';
}

function renderError(message) {
  els.chargerList.innerHTML = `<div class="ev-error">${escapeHtml(message)}</div>`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('ar-SY', { maximumFractionDigits: 0 }).format(value || 0);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function bindEvents() {
  [els.searchInput, els.governorateFilter, els.connectorFilter, els.statusFilter].forEach((element) => {
    element.addEventListener('input', applyFilters);
    element.addEventListener('change', applyFilters);
  });

  els.resetFilters.addEventListener('click', () => {
    els.searchInput.value = '';
    els.governorateFilter.value = 'all';
    els.connectorFilter.value = 'all';
    els.statusFilter.value = 'all';
    applyFilters();
  });
}

initMap();
bindEvents();
loadData();
