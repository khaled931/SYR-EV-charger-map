(() => {
  'use strict';

  const DATA_URL = 'data/chargers.v2.json';
  const DEFAULT_CENTER = [34.8021, 38.9968];
  const DEFAULT_ZOOM = 6;

  const labels = {
    status: {
      operational: 'عاملة',
      listed: 'مدرجة — بانتظار تحقق',
      needs_verification: 'تحتاج تحقق',
      partially_operational: 'عاملة جزئياً',
      planned: 'مخططة',
      under_construction: 'قيد الإنشاء',
      unavailable: 'غير متاحة',
      unknown: 'غير معروف'
    },
    quality: {
      Verified: 'موثق',
      'High Confidence': 'ثقة عالية',
      'Medium Confidence': 'ثقة متوسطة',
      'Low Confidence': 'ثقة منخفضة',
      Estimated: 'تقديري',
      Unverified: 'غير موثق'
    }
  };

  const state = {
    meta: {},
    chargers: [],
    filtered: [],
    markers: new Map(),
    map: null,
    layer: null
  };

  const $ = (id) => document.getElementById(id);
  const ui = {
    search: $('searchInput'),
    governorate: $('governorateFilter'),
    operator: $('operatorFilter'),
    connector: $('connectorFilter'),
    status: $('statusFilter'),
    type: $('siteTypeFilter'),
    reset: $('resetFilters'),
    list: $('chargerList'),
    count: $('resultCount'),
    locations: $('totalLocations'),
    chargers: $('totalChargers'),
    guns: $('totalGuns'),
    power: $('totalPower'),
    governorates: $('coveredGovernorates'),
    updated: $('lastUpdated'),
    note: $('dataNote')
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    initMap();
    bindEvents();
    await loadData();
  }

  function initMap() {
    if (!window.L) {
      showError('تعذر تحميل مكتبة الخريطة. تحقق من الاتصال بالإنترنت ثم أعد تحميل الصفحة.');
      return;
    }

    state.map = L.map('map', { preferCanvas: true }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.map);
    state.layer = L.layerGroup().addTo(state.map);
  }

  async function loadData() {
    ui.list.innerHTML = '<div class="ev-loading">جاري تحميل بيانات الشواحن…</div>';

    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`تعذر تحميل البيانات: ${response.status}`);

      const payload = await response.json();
      const defaults = payload.defaults || {};
      state.meta = payload.metadata || {};
      state.chargers = (payload.chargers || []).map((row, index) => normalize(row, defaults, index)).filter(validLocation);
      state.filtered = [...state.chargers];

      renderMeta();
      buildFilters();
      applyFilters(true);
    } catch (error) {
      showError(error.message || 'حدث خطأ أثناء تحميل البيانات.');
    }
  }

  function normalize(row, defaults, index) {
    const chargerCount = positive(row.charger_count ?? defaults.charger_count ?? 0);
    const ratedPower = positive(row.rated_power_kw ?? defaults.rated_power_kw ?? 0);
    const gunsPerCharger = positive(row.guns_per_charger ?? defaults.guns_per_charger ?? 0);
    const connectors = normalizeArray(row.connector_types || defaults.connector_types);

    return {
      id: String(row.id || `charger-${index + 1}`),
      nameAr: row.name_ar || row.name_en || 'محطة غير مسماة',
      nameEn: row.name_en || '',
      operator: row.operator || 'غير محدد',
      governorateAr: row.governorate_ar || 'غير محدد',
      governorateEn: row.governorate_en || '',
      cityAr: row.city_ar || '',
      typeAr: row.site_type_ar || 'غير محدد',
      lat: Number(row.latitude),
      lng: Number(row.longitude),
      chargerCount,
      connectors,
      ratedPower,
      gunsPerCharger,
      totalGuns: chargerCount * gunsPerCharger,
      totalPower: chargerCount * ratedPower,
      status: row.status || defaults.status || 'unknown',
      quality: row.data_quality || defaults.data_quality || 'Unverified',
      sourceUrl: row.source_url || '',
      sourceDate: row.source_date || defaults.source_date || '',
      accessAr: row.access_ar || defaults.access_ar || 'غير محدد',
      priceNoteAr: row.price_note_ar || defaults.price_note_ar || 'غير متوفر',
      needsReview: Boolean(row.needs_review),
      notesAr: row.notes_ar || ''
    };
  }

  function validLocation(item) {
    return Number.isFinite(item.lat) && Number.isFinite(item.lng);
  }

  function positive(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function normalizeArray(value) {
    if (Array.isArray(value)) return value.map(String).map((x) => x.trim()).filter(Boolean);
    if (typeof value === 'string') return value.split(/[,،;/]+/).map((x) => x.trim()).filter(Boolean);
    return [];
  }

  function renderMeta() {
    ui.updated.textContent = state.meta.last_updated
      ? `آخر تحديث للبيانات: ${formatDate(state.meta.last_updated)}`
      : 'آخر تحديث للبيانات: غير محدد';
    ui.note.textContent = state.meta.data_quality_note_ar || 'تعرض الخريطة البيانات المتاحة مع توضيح جودة كل سجل.';
  }

  function buildFilters() {
    fillSelect(ui.governorate, unique(state.chargers.map((x) => x.governorateAr)), 'كل المحافظات');
    fillSelect(ui.operator, unique(state.chargers.map((x) => x.operator)), 'كل المشغلين');
    fillSelect(ui.connector, unique(state.chargers.flatMap((x) => x.connectors)), 'كل المقابس');
    fillSelect(ui.status, unique(state.chargers.map((x) => x.status)), 'كل الحالات', (value) => labels.status[value] || value);
    fillSelect(ui.type, unique(state.chargers.map((x) => x.typeAr)), 'كل الأنواع');
  }

  function fillSelect(select, values, allLabel, mapper = (x) => x) {
    select.textContent = '';
    select.append(new Option(allLabel, 'all'));
    values.forEach((value) => select.append(new Option(mapper(value), value)));
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'ar'));
  }

  function bindEvents() {
    [ui.search, ui.governorate, ui.operator, ui.connector, ui.status, ui.type].forEach((element) => {
      element.addEventListener('input', () => applyFilters(true));
      element.addEventListener('change', () => applyFilters(true));
    });

    ui.reset.addEventListener('click', () => {
      ui.search.value = '';
      [ui.governorate, ui.operator, ui.connector, ui.status, ui.type].forEach((select) => { select.value = 'all'; });
      applyFilters(true);
    });
  }

  function applyFilters(fitMap = false) {
    const term = clean(ui.search.value);
    const filters = {
      governorate: ui.governorate.value,
      operator: ui.operator.value,
      connector: ui.connector.value,
      status: ui.status.value,
      type: ui.type.value
    };

    state.filtered = state.chargers.filter((item) => {
      const searchText = clean([
        item.nameAr, item.nameEn, item.operator, item.governorateAr, item.cityAr,
        item.typeAr, item.connectors.join(' '), item.notesAr
      ].join(' '));

      return (!term || searchText.includes(term)) &&
        (filters.governorate === 'all' || item.governorateAr === filters.governorate) &&
        (filters.operator === 'all' || item.operator === filters.operator) &&
        (filters.connector === 'all' || item.connectors.includes(filters.connector)) &&
        (filters.status === 'all' || item.status === filters.status) &&
        (filters.type === 'all' || item.typeAr === filters.type);
    });

    renderStats();
    renderMarkers(fitMap);
    renderList();
  }

  function clean(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[\u064B-\u065F]/g, '')
      .trim();
  }

  function renderStats() {
    const totalChargers = sum('chargerCount');
    const totalGuns = sum('totalGuns');
    const totalPower = sum('totalPower');
    const governorates = new Set(state.filtered.map((x) => x.governorateAr)).size;

    ui.locations.textContent = formatNumber(state.filtered.length);
    ui.chargers.textContent = formatNumber(totalChargers);
    ui.guns.textContent = formatNumber(totalGuns);
    ui.power.textContent = `${formatNumber(totalPower)} kW`;
    ui.governorates.textContent = formatNumber(governorates);
    ui.count.textContent = state.filtered.length
      ? `${formatNumber(state.filtered.length)} موقع مطابق للفلاتر الحالية.`
      : 'لا توجد مواقع مطابقة للفلاتر الحالية.';
  }

  function sum(field) {
    return state.filtered.reduce((total, item) => total + (Number(item[field]) || 0), 0);
  }

  function renderMarkers(fitMap) {
    if (!state.layer) return;

    state.layer.clearLayers();
    state.markers.clear();
    const bounds = [];
    const groups = groupByCoordinates(state.filtered);

    groups.forEach((items) => {
      items.forEach((item, index) => {
        const coordinate = offset(item.lat, item.lng, index, items.length);
        const marker = L.marker(coordinate, {
          title: item.nameAr,
          icon: markerIcon(item)
        }).bindPopup(popupHtml(item), { maxWidth: 330 });

        marker.addTo(state.layer);
        state.markers.set(item.id, marker);
        bounds.push(coordinate);
      });
    });

    if (!fitMap || !bounds.length) return;
    if (bounds.length === 1) state.map.setView(bounds[0], 13);
    else state.map.fitBounds(bounds, { padding: [42, 42], maxZoom: 12 });
  }

  function groupByCoordinates(items) {
    const groups = new Map();
    items.forEach((item) => {
      const key = `${item.lat.toFixed(5)},${item.lng.toFixed(5)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return groups;
  }

  function offset(lat, lng, index, total) {
    if (total <= 1) return [lat, lng];
    const radius = 35;
    const angle = (2 * Math.PI * index) / total;
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = Math.max(1, metersPerDegreeLat * Math.cos(lat * Math.PI / 180));
    return [lat + (Math.sin(angle) * radius) / metersPerDegreeLat, lng + (Math.cos(angle) * radius) / metersPerDegreeLng];
  }

  function markerIcon(item) {
    const cssClass = item.needsReview ? 'ev-marker ev-marker--warning' : 'ev-marker';
    const text = item.chargerCount > 1 ? item.chargerCount : '⚡';
    return L.divIcon({
      className: '',
      html: `<div class="${cssClass}"><span>${escapeHtml(text)}</span></div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -34]
    });
  }

  function popupHtml(item) {
    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${item.lat},${item.lng}`)}`;
    return `
      <div class="ev-popup">
        <h3>${escapeHtml(item.nameAr)}</h3>
        <p><strong>الموقع:</strong> ${escapeHtml([item.cityAr, item.governorateAr].filter(Boolean).join('، '))}</p>
        <p><strong>المشغل:</strong> ${escapeHtml(item.operator)}</p>
        <p><strong>المقبس:</strong> ${escapeHtml(list(item.connectors))}</p>
        <p><strong>الشواحن:</strong> ${formatNumber(item.chargerCount)} / <strong>المخارج:</strong> ${formatNumber(item.totalGuns)}</p>
        <p><strong>القدرة:</strong> ${formatNumber(item.ratedPower)} kW لكل شاحن / ${formatNumber(item.totalPower)} kW إجمالي اسمي</p>
        <p><strong>الحالة:</strong> ${escapeHtml(statusLabel(item.status))}</p>
        <p><strong>جودة البيانات:</strong> ${escapeHtml(labels.quality[item.quality] || item.quality)}</p>
        ${item.needsReview ? '<p class="ev-warning-text">هذه النقطة تحتاج تحققاً مكانياً إضافياً.</p>' : ''}
        <p class="ev-popup__actions"><a class="ev-source" href="${safeUrl(mapsUrl)}" target="_blank" rel="noopener">Google Maps</a>${item.sourceUrl ? ` <a class="ev-source" href="${safeUrl(item.sourceUrl)}" target="_blank" rel="noopener">المصدر</a>` : ''}</p>
      </div>`;
  }

  function renderList() {
    ui.list.textContent = '';
    if (!state.filtered.length) {
      ui.list.innerHTML = '<div class="ev-empty">لا توجد نتائج مطابقة. جرّب تعديل الفلاتر أو البحث.</div>';
      return;
    }

    const fragment = document.createDocumentFragment();
    state.filtered.forEach((item) => fragment.appendChild(card(item)));
    ui.list.appendChild(fragment);
  }

  function card(item) {
    const article = document.createElement('article');
    article.className = `ev-card ${item.needsReview ? 'ev-card--review' : ''}`;
    article.tabIndex = 0;
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `عرض ${item.nameAr} على الخريطة`);
    article.innerHTML = `
      <div class="ev-card__top">
        <div><h3>${escapeHtml(item.nameAr)}</h3><p>${escapeHtml([item.cityAr, item.governorateAr].filter(Boolean).join('، '))}</p></div>
        <span class="ev-chip ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
      </div>
      <div class="ev-chip-row">
        <span class="ev-chip">${escapeHtml(list(item.connectors))}</span>
        <span class="ev-chip">${formatNumber(item.chargerCount)} شاحن</span>
        <span class="ev-chip">${formatNumber(item.ratedPower)} kW لكل شاحن</span>
        <span class="ev-chip">${formatNumber(item.totalGuns)} مخارج</span>
      </div>
      <p><strong>المشغل:</strong> ${escapeHtml(item.operator)}</p>
      <p><strong>نوع الموقع:</strong> ${escapeHtml(item.typeAr)}</p>
      ${item.needsReview ? '<p class="ev-warning-text">تنبيه: يلزم التحقق من الإحداثيات قبل الاعتماد النهائي.</p>' : ''}
      ${item.notesAr ? `<p>${escapeHtml(item.notesAr)}</p>` : ''}
      <div class="ev-card__footer"><span>جودة البيانات: ${escapeHtml(labels.quality[item.quality] || item.quality)}</span>${item.sourceUrl ? `<a class="ev-source" href="${safeUrl(item.sourceUrl)}" target="_blank" rel="noopener">المصدر</a>` : ''}</div>`;

    article.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      focusMarker(item.id);
    });
    article.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      focusMarker(item.id);
    });
    return article;
  }

  function focusMarker(id) {
    const marker = state.markers.get(id);
    if (!marker || !state.map) return;
    state.map.setView(marker.getLatLng(), 14, { animate: true });
    marker.openPopup();
  }

  function statusLabel(value) { return labels.status[value] || value || 'غير معروف'; }
  function statusClass(value) {
    return ({ operational: 'ev-chip--success', listed: 'ev-chip--info', needs_verification: 'ev-chip--warning', unavailable: 'ev-chip--danger' })[value] || 'ev-chip--neutral';
  }
  function list(values) { return values.length ? values.join('، ') : 'غير محدد'; }
  function formatNumber(value) { return new Intl.NumberFormat('ar-SY', { maximumFractionDigits: 0 }).format(Number(value) || 0); }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }
  function showError(message) { ui.list.innerHTML = `<div class="ev-error">${escapeHtml(message)}</div>`; }
  function safeUrl(value) { return /^(https?:\/\/|#)/i.test(String(value)) ? escapeHtml(value) : '#'; }
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
