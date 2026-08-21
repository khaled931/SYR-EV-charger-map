const SVG_NS = 'http://www.w3.org/2000/svg';
const BRAND = {
  name: { ar: 'بوابة الطاقة المتجددة في سورية', en: 'Syrian Renewables' },
  email: 'khaled.alassad@syrianrenewables.com', newsletter: 'https://syrian-renewables.kit.com/newsletterlandpage', organizationNumber: '920833128',
  social: { linkedin: 'https://www.linkedin.com/company/syrianrenewables/', facebook: 'https://www.facebook.com/syrianrenewables', x: 'https://x.com/SyrianRenew', instagram: 'https://www.instagram.com/syrianrenewables/', youtube: 'https://www.youtube.com/channel/UCRWZ3b0AR9QcYcsRMRZs68w', tiktok: 'https://www.tiktok.com/@syrianrenewables?_r=1&_t=ZN-977WRXV1gak', whatsapp: 'https://whatsapp.com/channel/0029VayODloK5cD9gUAPoj0m' }
};
const NAVIGATION = [
  { _key: 'home', href: '/', label: { ar: 'الصفحة الرئيسية', en: 'Home' } },
  { _key: 'news', href: '/news', label: { ar: 'أخبار الطاقة في سورية', en: 'Syria Energy News' } },
  { _key: 'renewables', label: { ar: 'الطاقات المتجددة', en: 'Renewable Energy' }, children: [
    { _key: 'storage-batteries', href: '/storage-and-batteries', label: { ar: 'أنظمة التخزين والبطاريات', en: 'Storage Systems & Batteries' } },
    { _key: 'solar-energy', href: '/solar-energy', label: { ar: 'الطاقة الشمسية', en: 'Solar Energy' } },
    { _key: 'wind-energy', href: '/wind-energy', label: { ar: 'طاقة الرياح', en: 'Wind Energy' } },
    { _key: 'hydropower', href: '/hydropower', label: { ar: 'الطاقة الكهرومائية', en: 'Hydropower' } },
    { _key: 'biogas', href: '/biogas', label: { ar: 'الغاز الحيوي', en: 'Biogas' } }
  ]},
  { _key: 'services', label: { ar: 'خدماتنا', en: 'Our Services' }, children: [
    { _key: 'emissions-climate', href: 'https://climate.syrianrenewables.com/', external: true, openInNewTab: true, label: { ar: 'الانبعاثات والمناخ', en: 'Emissions and Climate' } },
    { _key: 'reports-research', href: '/reports', label: { ar: 'التقارير والأبحاث', en: 'Reports and Research' } },
    { _key: 'ev-map', href: 'https://ev.syrianrenewables.com/', external: true, openInNewTab: true, label: { ar: 'خريطة شواحن السيارات الكهربائية', en: 'EV Charging Map' } },
    { _key: 'fuel-price-tracker', href: 'https://fuel-prices.syrianrenewables.com/', external: true, openInNewTab: true, label: { ar: 'متتبع أسعار الوقود في سورية', en: 'Syrian Fuel Price Tracker' } },
    { _key: 'policy-tracker', href: 'https://policies.syrianrenewables.com/', external: true, openInNewTab: true, label: { ar: 'متتبع سياسات الطاقة', en: 'Energy Policy Tracker' } },
    { _key: 'project-tracker', href: 'https://projects.syrianrenewables.com/', external: true, openInNewTab: true, label: { ar: 'متتبع مشاريع الطاقة', en: 'Energy Project Tracker' } },
    { _key: 'energy-tenders', href: 'https://tender.syrianrenewables.com/', external: true, openInNewTab: true, label: { ar: 'متتبع مناقصات الطاقة', en: 'Energy Tenders Tracker' } },
    { _key: 'major-projects', href: 'https://major-projects.syrianrenewables.com/', external: true, openInNewTab: true, label: { ar: 'مشاريع كبرى', en: 'Major Projects' } },
    { _key: 'energy-jobs', href: 'https://syr-res-jobs.vercel.app/', external: true, openInNewTab: true, label: { ar: 'وظائف الطاقة', en: 'Energy Jobs' } },
    { _key: 'energy-contracts', href: 'https://contracts.syrianrenewables.com', external: true, openInNewTab: false, label: { ar: 'اتفاقيات وعقود الطاقة', en: 'Energy Agreements & Contracts' } },
    { _key: 'energy-market', href: 'https://market.syrianrenewables.com', external: true, openInNewTab: false, label: { ar: 'سوق الطاقة', en: 'Energy Market' } }
  ]},
  { _key: 'useful-tools', label: { ar: 'أدوات مفيدة', en: 'Useful Tools' }, children: [
    { _key: 'solar-calculator', href: 'https://solarist.syrianrenewables.com/', external: true, openInNewTab: false, label: { ar: 'حاسبة الطاقة الشمسية', en: 'Solar Energy Calculator' } },
    { _key: 'power-plant-map', href: 'https://syr-res-power-plant-map.vercel.app/', external: true, openInNewTab: true, label: { ar: 'خرائط محطات الطاقة', en: 'Power Plant Maps' } },
    { _key: 'ninja-simulator', href: 'https://syr-res-ninja-app.vercel.app/', external: true, openInNewTab: true, label: { ar: 'محاكاة الطاقة الشمسية والريحية في سورية', en: 'Solar and Wind Energy Simulation in Syria' } }
  ]},
  { _key: 'official-institutions', label: { ar: 'هيئات ومؤسسات رسمية', en: 'Official Institutions' }, children: [
    { _key: 'ministry-energy', href: '/ministry-of-energy', label: { ar: 'وزارة الطاقة السورية', en: 'Syrian Ministry of Energy' } },
    { _key: 'syrian-petroleum-company', href: '/syrian-petroleum-company', label: { ar: 'الشركة السورية للبترول', en: 'Syrian Petroleum Company' } },
    { _key: 'syrian-electricity-company', href: '/syrian-electricity-company', label: { ar: 'الشركة السورية للكهرباء', en: 'Syrian Electricity Company' } },
    { _key: 'renewable-energy-support-fund', href: '/renewable-energy-support-fund', label: { ar: 'صندوق دعم الطاقات المتجددة', en: 'Renewable Energy Support Fund' } },
    { _key: 'nerc', href: '/nerc', label: { ar: 'المركز الوطني لبحوث الطاقة NERC', en: 'National Energy Research Center (NERC)' } }
  ]},
  { _key: 'about-platform', label: { ar: 'عن المنصة', en: 'About the Platform' }, children: [
    { _key: 'about-us', href: '/about-us', label: { ar: 'من نحن', en: 'Who We Are' } },
    { _key: 'contact', href: '/contact', label: { ar: 'تواصل معنا', en: 'Contact Us' } },
    { _key: 'join-team', href: '/join-our-team', label: { ar: 'انضم إلى فريقنا', en: 'Join Our Team' } },
    { _key: 'privacy-policy', href: '/privacy-policy', label: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' } },
    { _key: 'partnerships', href: '/partnerships', label: { ar: 'شراكات', en: 'Partnerships' } }
  ]}
];
const ICON_PATHS = { chevron: ['m6 9 6 6 6-6'], external: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'], menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'], close: ['M18 6 6 18', 'm6 6 12 12'], moon: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z'], sun: ['M12 2v2', 'M12 20v2', 'm4.93 4.93 1.42 1.42', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'], mail: ['M2 7l8.97 5.7a1.94 1.94 0 0 0 2.06 0L22 7'], send: ['m22 2-7 20-4-9-9-4Z', 'M22 2 11 13'] };
const SOCIAL_MARKS = { linkedin: 'in', facebook: 'f', x: 'X', instagram: '◎', youtube: '▶', tiktok: '♪', whatsapp: 'WA' };
function el(tag, className = '', text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
function icon(name, size = 18, className = '') {
  const svg = document.createElementNS(SVG_NS, 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); svg.setAttribute('width', String(size)); svg.setAttribute('height', String(size)); svg.setAttribute('aria-hidden', 'true'); if (className) svg.setAttribute('class', className);
  if (name === 'sun') { const circle = document.createElementNS(SVG_NS, 'circle'); circle.setAttribute('cx', '12'); circle.setAttribute('cy', '12'); circle.setAttribute('r', '4'); svg.append(circle); }
  if (name === 'mail') { const rect = document.createElementNS(SVG_NS, 'rect'); rect.setAttribute('width', '20'); rect.setAttribute('height', '16'); rect.setAttribute('x', '2'); rect.setAttribute('y', '4'); rect.setAttribute('rx', '2'); svg.append(rect); }
  for (const d of ICON_PATHS[name] || []) { const path = document.createElementNS(SVG_NS, 'path'); path.setAttribute('d', d); svg.append(path); } return svg;
}
function cleanBase(value) { return String(value || '').replace(/\/+$/, ''); }
function localized(value, locale) { return value?.[locale] || value?.ar || value?.en || ''; }
function resolveHref(href, locale, mainSiteUrl) { if (/^https?:\/\//i.test(href)) return href; const suffix = href === '/' ? '' : (href.startsWith('/') ? href : `/${href}`); return `${cleanBase(mainSiteUrl)}/${locale}${suffix}`; }
function createLogo(locale, mainSiteUrl, logoSrc, footer = false) {
  const link = el('a', footer ? '' : 'sr-brand-link'); link.href = `${cleanBase(mainSiteUrl)}/${locale}`; link.setAttribute('aria-label', localized(BRAND.name, locale));
  const plate = el('span', footer ? 'sr-footer-logo-plate' : 'sr-logo-plate'); const image = document.createElement('img'); image.src = logoSrc; image.alt = 'Syrian Renewables — بوابة الطاقة المتجددة في سورية'; image.width = 217; image.height = 298; image.decoding = 'async'; plate.append(image); link.append(plate); return link;
}
function preparedNavigation(locale) { const collator = new Intl.Collator(locale === 'ar' ? 'ar' : 'en', { sensitivity: 'base', ignorePunctuation: true }); return NAVIGATION.map((item) => item._key !== 'services' ? item : ({ ...item, children: [...(item.children || [])].sort((a, b) => collator.compare(localized(a.label, locale), localized(b.label, locale))) })); }
function mountHeader({ target, locale, mainSiteUrl, logoSrc, activeKey, onLocaleChange, onThemeToggle }) {
  let menuOpen = false; let expandedKey = null; const header = el('header', 'sr-platform sr-site-header'); header.dir = locale === 'ar' ? 'rtl' : 'ltr'; const inner = el('div', 'sr-shell sr-header-inner'); const nav = el('nav', 'sr-main-nav'); nav.id = 'sr-primary-navigation'; nav.setAttribute('aria-label', locale === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'); const menu = el('button', 'sr-menu-button'); menu.type = 'button'; menu.setAttribute('aria-controls', nav.id);
  function renderState() { nav.classList.toggle('is-open', menuOpen); menu.setAttribute('aria-expanded', String(menuOpen)); menu.setAttribute('aria-label', menuOpen ? (locale === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (locale === 'ar' ? 'فتح القائمة' : 'Open menu')); menu.replaceChildren(icon(menuOpen ? 'close' : 'menu', 22)); nav.querySelectorAll('.sr-nav-item').forEach((node) => { const expanded = node.dataset.key === expandedKey; node.classList.toggle('is-expanded', expanded); const button = node.querySelector(':scope > button.sr-top-link'); if (button) button.setAttribute('aria-expanded', String(expanded)); }); }
  function closeNavigation() { menuOpen = false; expandedKey = null; renderState(); }
  function createNavLink(item, child = false, submenuId) {
    const hasChildren = Boolean(item.children?.length); const node = el(item.href ? 'a' : 'button', `sr-nav-link ${child ? 'sr-child-link' : 'sr-top-link'}`); node.append(el('span', '', localized(item.label, locale))); if (hasChildren) node.append(icon('chevron', 16, 'sr-chevron')); if (item.external && child) node.append(icon('external', 13, 'sr-external-icon'));
    if (item.href) { node.href = resolveHref(item.href, locale, mainSiteUrl); if (item._key === activeKey) { node.classList.add('is-active'); node.setAttribute('aria-current', 'page'); } if (item.openInNewTab) { node.target = '_blank'; node.rel = 'noreferrer'; } node.addEventListener('click', closeNavigation); }
    else { node.type = 'button'; if (hasChildren) { node.setAttribute('aria-haspopup', 'true'); node.setAttribute('aria-controls', submenuId); node.setAttribute('aria-expanded', 'false'); node.addEventListener('click', () => { expandedKey = expandedKey === item._key ? null : item._key; renderState(); }); } }
    return node;
  }
  preparedNavigation(locale).forEach((item, index) => { const wrapper = el('div', 'sr-nav-item'); wrapper.dataset.key = item._key; const submenuId = item.children?.length ? `sr-primary-submenu-${index}` : undefined; wrapper.append(createNavLink(item, false, submenuId)); if (item.children?.length) { const dropdown = el('div', 'sr-dropdown'); dropdown.id = submenuId; dropdown.setAttribute('aria-label', localized(item.label, locale)); item.children.forEach((child) => { const childWrapper = el('div'); const childLink = createNavLink(child, true); if (child._key === activeKey) wrapper.classList.add('has-active-child'); childWrapper.append(childLink); dropdown.append(childWrapper); }); wrapper.append(dropdown); } nav.append(wrapper); });
  const tools = el('div', 'sr-header-tools'); const language = el('button', 'sr-language-switch', locale === 'ar' ? 'EN' : 'ع'); language.type = 'button'; language.setAttribute('aria-label', locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'); language.addEventListener('click', () => onLocaleChange?.(locale === 'ar' ? 'en' : 'ar')); const theme = el('button', 'sr-icon-button'); theme.type = 'button'; theme.setAttribute('aria-label', locale === 'ar' ? 'تبديل الوضع اللوني' : 'Toggle color theme'); theme.append(icon('moon', 18, 'sr-theme-icon sr-theme-icon--moon'), icon('sun', 18, 'sr-theme-icon sr-theme-icon--sun')); theme.addEventListener('click', () => onThemeToggle?.()); menu.addEventListener('click', () => { menuOpen = !menuOpen; if (!menuOpen) expandedKey = null; renderState(); }); tools.append(language, theme, menu); inner.append(createLogo(locale, mainSiteUrl, logoSrc), nav, tools); header.append(inner); target.replaceChildren(header); renderState();
  const outsideHandler = (event) => { if (!header.contains(event.target)) closeNavigation(); }; const keyboardHandler = (event) => { if (event.key === 'Escape') closeNavigation(); }; document.addEventListener('pointerdown', outsideHandler); document.addEventListener('keydown', keyboardHandler);
  return () => { document.removeEventListener('pointerdown', outsideHandler); document.removeEventListener('keydown', keyboardHandler); header.remove(); };
}
function mountFooter({ target, locale, mainSiteUrl, logoSrc }) {
  const footer = el('footer', 'sr-platform sr-site-footer'); footer.dir = locale === 'ar' ? 'rtl' : 'ltr'; const grid = el('div', 'sr-shell sr-footer-grid'); const brandSection = el('section', 'sr-footer-brand'); brandSection.append(createLogo(locale, mainSiteUrl, logoSrc, true)); brandSection.append(el('p', '', locale === 'ar' ? 'منصة مستقلة للبيانات والتحليل والأخبار المتخصصة بقطاع الطاقة السوري.' : 'An independent platform for data, analysis, and specialist reporting on Syria’s energy sector.')); const email = el('a', 'sr-footer-email', BRAND.email); email.href = `mailto:${BRAND.email}`; email.prepend(icon('mail', 18)); brandSection.append(email);
  const linksSection = el('section'); linksSection.append(el('h3', '', locale === 'ar' ? 'روابط المنصة' : 'Platform')); const links = el('div', 'sr-footer-links'); [
    { href: '/', label: { ar: 'الصفحة الرئيسية', en: 'Home' } }, { href: '/news', label: { ar: 'أخبار الطاقة في سورية', en: 'Syria Energy News' } }, { href: '/about-us', label: { ar: 'من نحن', en: 'Who We Are' } }, { href: '/contact', label: { ar: 'تواصل معنا', en: 'Contact Us' } }, { href: '/privacy-policy', label: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' } }
  ].forEach((item) => { const link = el('a', '', localized(item.label, locale)); link.href = resolveHref(item.href, locale, mainSiteUrl); links.append(link); }); linksSection.append(links);
  const newsletter = el('section', 'sr-newsletter-card'); newsletter.append(icon('send', 24)); newsletter.append(el('h3', '', locale === 'ar' ? 'اشترك في النشرة' : 'Subscribe to the newsletter')); newsletter.append(el('p', '', locale === 'ar' ? 'ملخصات وتحليلات وتقارير دورية تصل مباشرة إلى بريدك.' : 'Periodic briefs, analysis, and reports delivered to your inbox.')); const subscribe = el('a', 'sr-button sr-button--light', locale === 'ar' ? 'صفحة الاشتراك' : 'Subscribe'); subscribe.href = BRAND.newsletter; subscribe.target = '_blank'; subscribe.rel = 'noreferrer'; newsletter.append(subscribe); grid.append(brandSection, linksSection, newsletter);
  const bottom = el('div', 'sr-shell sr-footer-bottom'); const socials = el('div', 'sr-social-links'); Object.entries(BRAND.social).forEach(([key, url]) => { const link = el('a'); link.href = url; link.target = '_blank'; link.rel = 'noreferrer'; link.setAttribute('aria-label', key); link.append(el('span', '', SOCIAL_MARKS[key] || key.slice(0, 2))); socials.append(link); }); bottom.append(socials, el('p', '', `© ${new Date().getFullYear()} Syrian Renewables · Norway organization no. ${BRAND.organizationNumber}`)); footer.append(grid, bottom); target.replaceChildren(footer); return () => footer.remove();
}
export function mountPlatformShell(options) { const destroyHeader = mountHeader(options); const destroyFooter = mountFooter(options); return () => { destroyHeader(); destroyFooter(); }; }
