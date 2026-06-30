(() => {
  'use strict';

  const DATA_URL = 'data/chargers.v2.json';
  const DEFAULT_CENTER = [34.8021, 38.9968];
  const DEFAULT_ZOOM = 6;
  const STORAGE_KEYS = { theme: 'sr-ev-theme', language: 'sr-ev-language' };

  const dictionary = {
    ar: {
      topbarTitle: 'خريطة شواحن السيارات الكهربائية في سوريا',
      badgeTitle: 'خريطة شواحن السيارات الكهربائية',
      kicker: 'Syrian Renewables Data Tool',
      title: 'خريطة شواحن السيارات الكهربائية في سوريا',
      lead: 'خريطة تفاعلية مبنية على OpenStreetMap لعرض مواقع الشواحن، المشغلين، نوع المقبس، القدرة الاسمية، وعدد مخارج الشحن في كل موقع.',
      filtersTitle: 'الفلاتر والمؤشرات',
      filtersSubtitle: 'استخدم البحث والفلاتر لتحديد المواقع حسب المحافظة أو المشغل أو نوع الموقع.',
      hideFilters: 'إخفاء الفلاتر', showFilters: 'إظهار الفلاتر',
      searchLabel: 'بحث', searchPlaceholder: 'ابحث بالاسم، المدينة، المشغل أو نوع الموقع…',
      governorateLabel: 'المحافظة', operatorLabel: 'المشغل', connectorLabel: 'نوع المقبس', statusLabel: 'الحالة', siteTypeLabel: 'نوع الموقع',
      resetFilters: 'إعادة ضبط', locationsStat: 'موقع شحن', chargersStat: 'شاحن', gunsStat: 'مخرج شحن', powerStat: 'قدرة اسمية إجمالية', governoratesStat: 'محافظة',
      mapProvider: 'الخريطة: OpenStreetMap', fitMap: 'عرض كل المواقع', listTitle: 'قائمة الشواحن', notesTitle: 'ملاحظات البيانات',
      duplicateNote: 'مواقع الشحن ذات الإحداثيات المتطابقة أو شبه المتطابقة تُعرض بإزاحة بصرية صغيرة حتى لا تختفي العلامات فوق بعضها، بينما تبقى الإحداثيات الأصلية محفوظة داخل ملف البيانات.',
      allGovernorates: 'كل المحافظات', allOperators: 'كل المشغلين', allConnectors: 'كل المقابس', allStatuses: 'كل الحالات', allTypes: 'كل الأنواع',
      updatedPrefix: 'آخر تحديث للبيانات:', connectorBadge: 'نوع المقبس المعروض: CCS2', loading: 'جاري تحميل بيانات الشواحن…', loadingResults: 'جاري تحميل النتائج…',
      noResults: 'لا توجد مواقع مطابقة للفلاتر الحالية.', results: 'موقع مطابق للفلاتر الحالية.', mapError: 'تعذر تحميل مكتبة الخريطة. أعد تحميل الصفحة أو تحقق من الاتصال بالإنترنت.', dataError: 'حدث خطأ أثناء تحميل البيانات.',
      source: 'المصدر', googleMaps: 'Google Maps', location: 'الموقع', operator: 'المشغل', connector: 'المقبس', chargers: 'الشواحن', guns: 'المخارج', power: 'القدرة', status: 'الحالة', quality: 'جودة البيانات', siteType: 'نوع الموقع',
      reviewWarning: 'تنبيه: يلزم التحقق من الإحداثيات قبل الاعتماد النهائي.', perCharger: 'لكل شاحن', totalNominal: 'إجمالي اسمي', closeFilters: 'إغلاق الفلاتر', openFilters: 'فتح الفلاتر', dark: 'الوضع الداكن', light: 'الوضع الفاتح',
      share: 'مشاركة هذا الشاحن', nativeShare: 'مشاركة', copyLink: 'نسخ الرابط', copiedLink: 'تم نسخ الرابط', facebook: 'فيسبوك', whatsapp: 'واتساب', telegram: 'تلغرام', x: 'X', instagram: 'إنستغرام', tiktok: 'تيك توك'
    },
    en: {
      topbarTitle: 'EV Charging Stations Map in Syria',
      badgeTitle: 'EV Charging Stations Map',
      kicker: 'Syrian Renewables Data Tool',
      title: 'EV Charging Stations Map in Syria',
      lead: 'An interactive OpenStreetMap-based tool showing EV charger locations, operators, connector type, nominal power, and charging outlets per site.',
      filtersTitle: 'Filters & Indicators', filtersSubtitle: 'Use search and filters to narrow locations by governorate, operator, connector, or site type.',
      hideFilters: 'Hide filters', showFilters: 'Show filters', searchLabel: 'Search', searchPlaceholder: 'Search by name, city, operator, or site type…',
      governorateLabel: 'Governorate', operatorLabel: 'Operator', connectorLabel: 'Connector', statusLabel: 'Status', siteTypeLabel: 'Site type', resetFilters: 'Reset',
      locationsStat: 'Charging sites', chargersStat: 'Chargers', gunsStat: 'Outlets', powerStat: 'Total nominal power', governoratesStat: 'Governorates',
      mapProvider: 'Map: OpenStreetMap', fitMap: 'Fit all sites', listTitle: 'Chargers list', notesTitle: 'Data notes',
      duplicateNote: 'Sites with identical or near-identical coordinates are displayed with a small visual offset so markers do not hide each other; the original coordinates remain unchanged in the data file.',
      allGovernorates: 'All governorates', allOperators: 'All operators', allConnectors: 'All connectors', allStatuses: 'All statuses', allTypes: 'All types',
      updatedPrefix: 'Data updated:', connectorBadge: 'Connector shown: CCS2', loading: 'Loading charger data…', loadingResults: 'Loading results…', noResults: 'No locations match the current filters.', results: 'location(s) match the current filters.',
      mapError: 'The map library could not be loaded. Please reload the page or check your internet connection.', dataError: 'An error occurred while loading the data.',
      source: 'Source', googleMaps: 'Google Maps', location: 'Location', operator: 'Operator', connector: 'Connector', chargers: 'Chargers', guns: 'Outlets', power: 'Power', status: 'Status', quality: 'Data quality', siteType: 'Site type',
      reviewWarning: 'Review required: coordinates should be verified before final publication.', perCharger: 'per charger', totalNominal: 'total nominal', closeFilters: 'Close filters', openFilters: 'Open filters', dark: 'Dark mode', light: 'Light mode',
      share: 'Share this charger', nativeShare: 'Share', copyLink: 'Copy link', copiedLink: 'Link copied', facebook: 'Facebook', whatsapp: 'WhatsApp', telegram: 'Telegram', x: 'X', instagram: 'Instagram', tiktok: 'TikTok'
    }
  };

  const labels = {
    status: {
      operational: { ar: 'عاملة', en: 'Operational' }, listed: { ar: 'مدرجة — بانتظار تحقق', en: 'Listed — pending verification' }, needs_verification: { ar: 'تحتاج تحقق', en: 'Needs verification' }, partially_operational: { ar: 'عاملة جزئياً', en: 'Partially operational' }, planned: { ar: 'مخططة', en: 'Planned' }, under_construction: { ar: 'قيد الإنشاء', en: 'Under construction' }, unavailable: { ar: 'غير متاحة', en: 'Unavailable' }, unknown: { ar: 'غير معروف', en: 'Unknown' }
    },
    quality: {
      Verified: { ar: 'موثق', en: 'Verified' }, 'High Confidence': { ar: 'ثقة عالية', en: 'High confidence' }, 'Medium Confidence': { ar: 'ثقة متوسطة', en: 'Medium confidence' }, 'Low Confidence': { ar: 'ثقة منخفضة', en: 'Low confidence' }, Estimated: { ar: 'تقديري', en: 'Estimated' }, Unverified: { ar: 'غير موثق', en: 'Unverified' }
    },
    siteType: {
      'شركة / مكتب': { ar: 'شركة / مكتب', en: 'Company / office' }, 'فندق': { ar: 'فندق', en: 'Hotel' }, 'مركز تجاري': { ar: 'مركز تجاري', en: 'Mall / commercial' }, 'استراحة / محطة خدمة': { ar: 'استراحة / محطة خدمة', en: 'Rest area / service station' }, 'محطة خدمة': { ar: 'محطة خدمة', en: 'Service station' }, 'سفارة / جهة مؤسسية': { ar: 'سفارة / جهة مؤسسية', en: 'Embassy / institution' }
    }
  };

  const state = { language: localStorage.getItem(STORAGE_KEYS.language) || 'ar', theme: localStorage.getItem(STORAGE_KEYS.theme) || 'light', meta: {}, chargers: [], filtered: [], markers: new Map(), map: null, layer: null, filtersCollapsed: false };
  const $ = (id) => document.getElementById(id);
  const ui = {};

  function boot() {
    cacheElements();
    applyTheme(state.theme);
    applyLanguage(state.language, false);
    bindEvents();
    waitForLeaflet(0).then(() => { initMap(); loadData(); }).catch(() => showError(t('mapError')));
  }

  function cacheElements() {
    Object.assign(ui, {
      search: $('searchInput'), governorate: $('governorateFilter'), operator: $('operatorFilter'), connector: $('connectorFilter'), status: $('statusFilter'), type: $('siteTypeFilter'), reset: $('resetFilters'), list: $('chargerList'), count: $('resultCount'), locations: $('totalLocations'), chargers: $('totalChargers'), guns: $('totalGuns'), power: $('totalPower'), governorates: $('coveredGovernorates'), updated: $('lastUpdated'), note: $('dataNote'), connectorBadge: $('connectorBadge'), languageToggle: $('languageToggle'), themeToggle: $('themeToggle'), zoomIn: $('zoomInButton'), zoomOut: $('zoomOutButton'), fitMap: $('fitMapButton'), mobileFiltersToggle: $('mobileFiltersToggle'), desktopFiltersToggle: $('desktopFiltersToggle'), closeFilters: $('closeFiltersButton'), filtersPanel: $('filtersPanel'), filtersOverlay: $('filtersOverlay')
    });
  }

  function waitForLeaflet(attempt) {
    return new Promise((resolve, reject) => {
      if (window.L) return resolve();
      if (attempt > 40) return reject(new Error('Leaflet failed to load'));
      setTimeout(() => waitForLeaflet(attempt + 1).then(resolve).catch(reject), 100);
    });
  }

  function initMap() {
    state.map = L.map('map', { zoomControl: false, preferCanvas: true, worldCopyJump: true }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    L.control.zoom({ position: state.language === 'ar' ? 'topleft' : 'topright' }).addTo(state.map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(state.map);
    state.layer = L.layerGroup().addTo(state.map);
    setTimeout(() => state.map.invalidateSize(), 250);
  }

  async function loadData() {
    ui.list.innerHTML = `<div class="ev-loading">${escapeHtml(t('loading'))}</div>`;
    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${t('dataError')} ${response.status}`);
      const payload = await response.json();
      const defaults = payload.defaults || {};
      state.meta = payload.metadata || {};
      state.chargers = (payload.chargers || []).map((row, index) => normalize(row, defaults, index)).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
      state.filtered = [...state.chargers];
      renderMeta();
      buildFilters();
      applyFilters(true);
      focusStationFromUrl();
    } catch (error) { showError(error.message || t('dataError')); }
  }

  function normalize(row, defaults, index) {
    const chargerCount = positive(row.charger_count ?? defaults.charger_count ?? 0);
    const ratedPower = positive(row.rated_power_kw ?? defaults.rated_power_kw ?? 0);
    const gunsPerCharger = positive(row.guns_per_charger ?? defaults.guns_per_charger ?? 0);
    return {
      id: String(row.id || `charger-${index + 1}`), nameAr: row.name_ar || row.name_en || 'محطة غير مسماة', nameEn: row.name_en || row.name_ar || 'Unnamed station', operator: row.operator || 'غير محدد', governorateAr: row.governorate_ar || 'غير محدد', governorateEn: row.governorate_en || row.governorate_ar || 'Unspecified', cityAr: row.city_ar || row.city_en || '', cityEn: row.city_en || row.city_ar || '', typeAr: row.site_type_ar || 'غير محدد', typeEn: label('siteType', row.site_type_ar || 'غير محدد', 'en'), lat: Number(row.latitude), lng: Number(row.longitude), chargerCount, connectors: normalizeArray(row.connector_types || defaults.connector_types), ratedPower, gunsPerCharger, totalGuns: chargerCount * gunsPerCharger, totalPower: chargerCount * ratedPower, status: row.status || defaults.status || 'unknown', quality: row.data_quality || defaults.data_quality || 'Unverified', sourceUrl: row.source_url || '', sourceDate: row.source_date || defaults.source_date || '', accessAr: row.access_ar || defaults.access_ar || 'غير محدد', priceNoteAr: row.price_note_ar || defaults.price_note_ar || 'غير متوفر', needsReview: Boolean(row.needs_review), notesAr: row.notes_ar || '', notesEn: row.notes_en || ''
    };
  }

  function bindEvents() {
    [ui.search, ui.governorate, ui.operator, ui.connector, ui.status, ui.type].forEach((element) => {
      element.addEventListener('input', () => applyFilters(true));
      element.addEventListener('change', () => applyFilters(true));
    });
    ui.reset.addEventListener('click', () => { ui.search.value = ''; [ui.governorate, ui.operator, ui.connector, ui.status, ui.type].forEach((select) => { select.value = 'all'; }); applyFilters(true); });
    ui.languageToggle.addEventListener('click', () => applyLanguage(state.language === 'ar' ? 'en' : 'ar', true));
    ui.themeToggle.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark'));
    ui.zoomIn.addEventListener('click', () => state.map && state.map.zoomIn());
    ui.zoomOut.addEventListener('click', () => state.map && state.map.zoomOut());
    ui.fitMap.addEventListener('click', () => renderMarkers(true));
    ui.mobileFiltersToggle.addEventListener('click', openFiltersDrawer);
    ui.closeFilters.addEventListener('click', closeFiltersDrawer);
    ui.filtersOverlay.addEventListener('click', closeFiltersDrawer);
    ui.desktopFiltersToggle.addEventListener('click', toggleDesktopFilters);
    document.addEventListener('click', handleShareClick);
    window.addEventListener('resize', () => { if (window.innerWidth >= 760) closeFiltersDrawer(); if (state.map) setTimeout(() => state.map.invalidateSize(), 120); });
  }

  function handleShareClick(event) {
    const button = event.target.closest('[data-share]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const item = state.chargers.find((charger) => charger.id === button.dataset.id);
    if (!item) return;
    shareItem(item, button.dataset.share, button);
  }

  async function shareItem(item, action, trigger) {
    const url = shareUrl(item);
    const text = shareText(item);
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${text}\n${url}`);
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`
    };

    if (action === 'native' && navigator.share) {
      try { await navigator.share({ title: name(item), text, url }); return; } catch (_) { return; }
    }
    if (links[action]) { window.open(links[action], '_blank', 'noopener,noreferrer,width=720,height=620'); return; }
    await copyShareLink(url, trigger);
  }

  async function copyShareLink(url, trigger) {
    try {
      await navigator.clipboard.writeText(url);
      if (trigger) {
        const original = trigger.textContent;
        trigger.textContent = t('copiedLink');
        setTimeout(() => { trigger.textContent = original; }, 1400);
      }
    } catch (_) {
      window.prompt(t('copyLink'), url);
    }
  }

  function shareUrl(item) {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?charger=${encodeURIComponent(item.id)}`;
  }

  function shareText(item) {
    const connector = list(item.connectors);
    if (state.language === 'ar') return `${name(item)} — ${place(item)}\n${connector}، ${formatNumber(item.ratedPower)} kW لكل شاحن، ${formatNumber(item.totalGuns)} مخارج شحن.`;
    return `${name(item)} — ${place(item)}\n${connector}, ${formatNumber(item.ratedPower)} kW per charger, ${formatNumber(item.totalGuns)} charging outlets.`;
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    if (ui.themeToggle) { ui.themeToggle.textContent = theme === 'dark' ? '☀' : '☾'; ui.themeToggle.setAttribute('aria-label', theme === 'dark' ? t('light') : t('dark')); }
  }

  function applyLanguage(language, shouldRender) {
    state.language = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEYS.language, language);
    document.querySelectorAll('[data-i18n]').forEach((element) => { const key = element.getAttribute('data-i18n'); if (dictionary[language][key]) element.textContent = dictionary[language][key]; });
    ui.languageToggle.textContent = language === 'ar' ? 'EN' : 'AR';
    ui.search.placeholder = t('searchPlaceholder');
    ui.mobileFiltersToggle.setAttribute('aria-label', t('openFilters'));
    ui.closeFilters.setAttribute('aria-label', t('closeFilters'));
    ui.connectorBadge.textContent = t('connectorBadge');
    ui.desktopFiltersToggle.textContent = state.filtersCollapsed ? t('showFilters') : t('hideFilters');
    applyTheme(state.theme);
    if (shouldRender && state.chargers.length) { renderMeta(); buildFilters(true); applyFilters(true); }
    if (state.map) setTimeout(() => state.map.invalidateSize(), 120);
  }

  function renderMeta() {
    ui.updated.textContent = state.meta.last_updated ? `${t('updatedPrefix')} ${formatDate(state.meta.last_updated)}` : `${t('updatedPrefix')} —`;
    ui.note.textContent = state.language === 'ar' ? (state.meta.data_quality_note_ar || '') : 'Listed status means the site is included in the project dataset, not independently field-verified as operational.';
  }

  function buildFilters(preserve = false) {
    const current = preserve ? filterValues() : null;
    fillSelect(ui.governorate, unique(state.chargers.map((x) => x.governorateAr)), t('allGovernorates'), (value) => governorateName(value));
    fillSelect(ui.operator, unique(state.chargers.map((x) => x.operator)), t('allOperators'));
    fillSelect(ui.connector, unique(state.chargers.flatMap((x) => x.connectors)), t('allConnectors'));
    fillSelect(ui.status, unique(state.chargers.map((x) => x.status)), t('allStatuses'), (value) => label('status', value));
    fillSelect(ui.type, unique(state.chargers.map((x) => x.typeAr)), t('allTypes'), (value) => label('siteType', value));
    if (current) Object.entries(current).forEach(([key, value]) => { if (ui[key] && [...ui[key].options].some((option) => option.value === value)) ui[key].value = value; });
  }

  function fillSelect(select, values, allLabel, mapper = (x) => x) { select.textContent = ''; select.append(new Option(allLabel, 'all')); values.forEach((value) => select.append(new Option(mapper(value), value))); }
  function filterValues() { return { governorate: ui.governorate.value, operator: ui.operator.value, connector: ui.connector.value, status: ui.status.value, type: ui.type.value }; }

  function applyFilters(fitMap = false) {
    const term = clean(ui.search.value);
    const filters = filterValues();
    state.filtered = state.chargers.filter((item) => {
      const searchText = clean([item.nameAr, item.nameEn, item.operator, item.governorateAr, item.governorateEn, item.cityAr, item.cityEn, item.typeAr, item.typeEn, item.connectors.join(' '), item.notesAr, item.notesEn].join(' '));
      return (!term || searchText.includes(term)) && (filters.governorate === 'all' || item.governorateAr === filters.governorate) && (filters.operator === 'all' || item.operator === filters.operator) && (filters.connector === 'all' || item.connectors.includes(filters.connector)) && (filters.status === 'all' || item.status === filters.status) && (filters.type === 'all' || item.typeAr === filters.type);
    });
    renderStats();
    renderMarkers(fitMap);
    renderList();
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
    ui.count.textContent = state.filtered.length ? `${formatNumber(state.filtered.length)} ${t('results')}` : t('noResults');
  }

  function renderMarkers(fitMap) {
    if (!state.layer || !state.map) return;
    state.layer.clearLayers();
    state.markers.clear();
    const bounds = [];
    groupByCoordinates(state.filtered).forEach((items) => {
      items.forEach((item, index) => {
        const coordinate = offset(item.lat, item.lng, index, items.length);
        const marker = L.marker(coordinate, { title: name(item), icon: markerIcon(item) }).bindPopup(popupHtml(item), { maxWidth: 360 });
        marker.addTo(state.layer);
        state.markers.set(item.id, marker);
        bounds.push(coordinate);
      });
    });
    if (!fitMap || !bounds.length) return;
    if (bounds.length === 1) state.map.setView(bounds[0], 13);
    else state.map.fitBounds(bounds, { padding: [42, 42], maxZoom: 12 });
    setTimeout(() => state.map.invalidateSize(), 120);
  }

  function renderList() {
    ui.list.textContent = '';
    if (!state.filtered.length) { ui.list.innerHTML = `<div class="ev-empty">${escapeHtml(t('noResults'))}</div>`; return; }
    const fragment = document.createDocumentFragment();
    state.filtered.forEach((item) => fragment.appendChild(card(item)));
    ui.list.appendChild(fragment);
  }

  function card(item) {
    const article = document.createElement('article');
    article.className = `ev-card ${item.needsReview ? 'ev-card--review' : ''}`;
    article.tabIndex = 0;
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `${t('location')}: ${name(item)}`);
    article.innerHTML = `
      <div class="ev-card__top"><div><h3>${escapeHtml(name(item))}</h3><p>${escapeHtml(place(item))}</p></div><span class="ev-chip ${statusClass(item.status)}">${escapeHtml(label('status', item.status))}</span></div>
      <div class="ev-chip-row"><span class="ev-chip">${escapeHtml(list(item.connectors))}</span><span class="ev-chip">${formatNumber(item.chargerCount)} ${t('chargers')}</span><span class="ev-chip">${formatNumber(item.ratedPower)} kW</span><span class="ev-chip">${formatNumber(item.totalGuns)} ${t('guns')}</span></div>
      <p><strong>${t('operator')}:</strong> ${escapeHtml(item.operator)}</p><p><strong>${t('siteType')}:</strong> ${escapeHtml(siteType(item))}</p>${item.needsReview ? `<p class="ev-warning-text">${escapeHtml(t('reviewWarning'))}</p>` : ''}${note(item) ? `<p>${escapeHtml(note(item))}</p>` : ''}
      <div class="ev-card__footer"><span>${t('quality')}: ${escapeHtml(label('quality', item.quality))}</span>${item.sourceUrl ? `<a class="ev-source" href="${safeUrl(item.sourceUrl)}" target="_blank" rel="noopener">${t('source')}</a>` : ''}</div>
      ${shareHtml(item, 'card')}`;
    article.addEventListener('click', (event) => { if (event.target.closest('a,button')) return; focusMarker(item.id); closeFiltersDrawer(); });
    article.addEventListener('keydown', (event) => { if (event.key !== 'Enter' && event.key !== ' ') return; event.preventDefault(); focusMarker(item.id); closeFiltersDrawer(); });
    return article;
  }

  function popupHtml(item) {
    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${item.lat},${item.lng}`)}`;
    return `<div class="ev-popup"><h3>${escapeHtml(name(item))}</h3><p><strong>${t('location')}:</strong> ${escapeHtml(place(item))}</p><p><strong>${t('operator')}:</strong> ${escapeHtml(item.operator)}</p><p><strong>${t('connector')}:</strong> ${escapeHtml(list(item.connectors))}</p><p><strong>${t('chargers')}:</strong> ${formatNumber(item.chargerCount)} / <strong>${t('guns')}:</strong> ${formatNumber(item.totalGuns)}</p><p><strong>${t('power')}:</strong> ${formatNumber(item.ratedPower)} kW ${t('perCharger')} / ${formatNumber(item.totalPower)} kW ${t('totalNominal')}</p><p><strong>${t('status')}:</strong> ${escapeHtml(label('status', item.status))}</p><p><strong>${t('quality')}:</strong> ${escapeHtml(label('quality', item.quality))}</p>${item.needsReview ? `<p class="ev-warning-text">${escapeHtml(t('reviewWarning'))}</p>` : ''}<p class="ev-popup__actions"><a class="ev-source" href="${safeUrl(mapsUrl)}" target="_blank" rel="noopener">${t('googleMaps')}</a>${item.sourceUrl ? ` <a class="ev-source" href="${safeUrl(item.sourceUrl)}" target="_blank" rel="noopener">${t('source')}</a>` : ''}</p>${shareHtml(item, 'popup')}</div>`;
  }

  function shareHtml(item) {
    const id = escapeHtml(item.id);
    return `<div class="ev-share" aria-label="${escapeHtml(t('share'))}"><strong>${escapeHtml(t('share'))}</strong><div class="ev-share__grid"><button class="ev-share-btn ev-share-btn--native" type="button" data-share="native" data-id="${id}">${escapeHtml(t('nativeShare'))}</button><button class="ev-share-btn ev-share-btn--whatsapp" type="button" data-share="whatsapp" data-id="${id}">${escapeHtml(t('whatsapp'))}</button><button class="ev-share-btn ev-share-btn--facebook" type="button" data-share="facebook" data-id="${id}">${escapeHtml(t('facebook'))}</button><button class="ev-share-btn ev-share-btn--telegram" type="button" data-share="telegram" data-id="${id}">${escapeHtml(t('telegram'))}</button><button class="ev-share-btn ev-share-btn--x" type="button" data-share="x" data-id="${id}">${escapeHtml(t('x'))}</button><button class="ev-share-btn ev-share-btn--instagram" type="button" data-share="instagram" data-id="${id}">${escapeHtml(t('instagram'))}</button><button class="ev-share-btn ev-share-btn--tiktok" type="button" data-share="tiktok" data-id="${id}">${escapeHtml(t('tiktok'))}</button><button class="ev-share-btn ev-share-btn--copy" type="button" data-share="copy" data-id="${id}">${escapeHtml(t('copyLink'))}</button></div></div>`;
  }

  function focusMarker(id) {
    const marker = state.markers.get(id);
    if (!marker || !state.map) return;
    const url = new URL(window.location.href);
    url.searchParams.set('charger', id);
    window.history.replaceState({}, '', url);
    state.map.setView(marker.getLatLng(), 14, { animate: true });
    marker.openPopup();
  }

  function focusStationFromUrl() {
    const id = new URLSearchParams(window.location.search).get('charger');
    if (!id) return;
    const exists = state.chargers.some((item) => item.id === id);
    if (!exists) return;
    setTimeout(() => focusMarker(id), 450);
  }

  function openFiltersDrawer() { document.documentElement.classList.add('filters-open'); ui.filtersOverlay.hidden = false; ui.filtersPanel.setAttribute('aria-hidden', 'false'); }
  function closeFiltersDrawer() { document.documentElement.classList.remove('filters-open'); ui.filtersOverlay.hidden = true; ui.filtersPanel.setAttribute('aria-hidden', 'true'); }
  function toggleDesktopFilters() { state.filtersCollapsed = !state.filtersCollapsed; document.documentElement.classList.toggle('filters-collapsed', state.filtersCollapsed); ui.desktopFiltersToggle.textContent = state.filtersCollapsed ? t('showFilters') : t('hideFilters'); setTimeout(() => state.map && state.map.invalidateSize(), 150); }

  function groupByCoordinates(items) { const groups = new Map(); items.forEach((item) => { const key = `${item.lat.toFixed(5)},${item.lng.toFixed(5)}`; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(item); }); return groups; }
  function offset(lat, lng, index, total) { if (total <= 1) return [lat, lng]; const radius = 35; const angle = (2 * Math.PI * index) / total; const metersPerDegreeLat = 111320; const metersPerDegreeLng = Math.max(1, metersPerDegreeLat * Math.cos(lat * Math.PI / 180)); return [lat + (Math.sin(angle) * radius) / metersPerDegreeLat, lng + (Math.cos(angle) * radius) / metersPerDegreeLng]; }
  function markerIcon(item) { const cssClass = item.needsReview ? 'ev-marker ev-marker--warning' : 'ev-marker'; const text = item.chargerCount > 1 ? item.chargerCount : '⚡'; return L.divIcon({ className: '', html: `<div class="${cssClass}"><span>${escapeHtml(text)}</span></div>`, iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -34] }); }
  function name(item) { return state.language === 'ar' ? item.nameAr : item.nameEn; }
  function place(item) { const parts = state.language === 'ar' ? [item.cityAr, item.governorateAr] : [item.cityEn, item.governorateEn]; return parts.filter(Boolean).join(state.language === 'ar' ? '، ' : ', '); }
  function siteType(item) { return state.language === 'ar' ? item.typeAr : item.typeEn; }
  function note(item) { return state.language === 'ar' ? item.notesAr : item.notesEn; }
  function governorateName(value) { const match = state.chargers.find((item) => item.governorateAr === value); return state.language === 'ar' ? value : (match?.governorateEn || value); }
  function label(group, value, forcedLanguage) { const language = forcedLanguage || state.language; return labels[group]?.[value]?.[language] || value || '—'; }
  function statusClass(value) { return ({ operational: 'ev-chip--success', listed: 'ev-chip--info', needs_verification: 'ev-chip--warning', unavailable: 'ev-chip--danger' })[value] || 'ev-chip--neutral'; }
  function t(key) { return dictionary[state.language][key] || dictionary.ar[key] || key; }
  function unique(values) { return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), state.language)); }
  function normalizeArray(value) { if (Array.isArray(value)) return value.map(String).map((x) => x.trim()).filter(Boolean); if (typeof value === 'string') return value.split(/[,،;/]+/).map((x) => x.trim()).filter(Boolean); return []; }
  function positive(value) { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : 0; }
  function sum(field) { return state.filtered.reduce((total, item) => total + (Number(item[field]) || 0), 0); }
  function list(values) { return values.length ? values.join(state.language === 'ar' ? '، ' : ', ') : '—'; }
  function clean(value) { return String(value || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[\u064B-\u065F]/g, '').trim(); }
  function formatNumber(value) { return new Intl.NumberFormat(state.language === 'ar' ? 'ar-SY' : 'en-US', { maximumFractionDigits: 0 }).format(Number(value) || 0); }
  function formatDate(value) { const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat(state.language === 'ar' ? 'ar-SY' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(date); }
  function showError(message) { ui.list.innerHTML = `<div class="ev-error">${escapeHtml(message)}</div>`; }
  function safeUrl(value) { return /^(https?:\/\/|#)/i.test(String(value)) ? escapeHtml(value) : '#'; }
  function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
