(() => {
  'use strict';

  const API_ORIGIN = 'https://syrianrenewables.com';
  const SERVICE_KEY = 'ev_chargers_map';
  const FALLBACK_LIMIT = 5;

  function locale() {
    return String(document.documentElement.lang || '').toLowerCase().startsWith('en') ? 'en' : 'ar';
  }

  function copy() {
    if (locale() === 'en') {
      return {
        eyebrow: 'Free account access',
        title: 'Preview: first 5 charging stations',
        body: 'Visitors can explore the first 5 stations. Sign in or create a free account to unlock the complete EV charging map.',
        login: 'Sign in',
        register: 'Create free account',
        unavailable: 'Full access could not be verified. The public 5-station preview remains available.'
      };
    }
    return {
      eyebrow: 'وصول الحساب المجاني',
      title: 'نسخة معاينة: أول 5 محطات شحن',
      body: 'يمكن للزوار استعراض أول 5 محطات. سجّل الدخول أو أنشئ حساباً مجانياً لفتح خريطة محطات الشحن كاملة.',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب مجاني',
      unavailable: 'تعذر التحقق من الوصول الكامل. ستبقى معاينة أول 5 محطات متاحة.'
    };
  }

  function fallbackLinks() {
    const lang = locale();
    const returnTo = window.location.href;
    const login = new URL(`/${lang}/account/login`, API_ORIGIN);
    const register = new URL(`/${lang}/account/register`, API_ORIGIN);
    login.searchParams.set('returnTo', returnTo);
    register.searchParams.set('returnTo', returnTo);
    return { login_url: login.toString(), register_url: register.toString() };
  }

  async function checkAccess() {
    const params = new URLSearchParams({
      service: SERVICE_KEY,
      action: 'view_full',
      locale: locale(),
      returnTo: window.location.href
    });
    const response = await fetch(`${API_ORIGIN}/api/access?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`Access check failed (${response.status})`);
    return response.json();
  }

  function removeGate() {
    document.getElementById('evMembershipGate')?.remove();
    document.documentElement.dataset.evAccess = 'full';
  }

  function renderGate(result, unavailable = false) {
    if (result?.allowed === true) {
      removeGate();
      return;
    }

    const existing = document.getElementById('evMembershipGate');
    if (existing) existing.remove();

    const text = copy();
    const links = { ...fallbackLinks(), ...(result || {}) };
    const limit = Number.isSafeInteger(Number(result?.guest_item_limit)) && Number(result.guest_item_limit) > 0
      ? Number(result.guest_item_limit)
      : FALLBACK_LIMIT;

    document.documentElement.dataset.evAccess = 'sample';

    const section = document.createElement('section');
    section.id = 'evMembershipGate';
    section.className = 'ev-membership-gate';
    section.setAttribute('aria-labelledby', 'evMembershipGateTitle');
    section.innerHTML = `
      <div class="ev-membership-gate__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false"><path d="M7 10V8a5 5 0 0 1 10 0v2h1.25A1.75 1.75 0 0 1 20 11.75v7.5A1.75 1.75 0 0 1 18.25 21H5.75A1.75 1.75 0 0 1 4 19.25v-7.5A1.75 1.75 0 0 1 5.75 10H7Zm2 0h6V8a3 3 0 0 0-6 0v2Zm3 3a1.5 1.5 0 0 0-.75 2.8V18h1.5v-2.2A1.5 1.5 0 0 0 12 13Z"/></svg>
      </div>
      <div class="ev-membership-gate__content">
        <p class="ev-membership-gate__eyebrow">${text.eyebrow}</p>
        <h2 id="evMembershipGateTitle">${text.title.replace('5', String(limit))}</h2>
        <p>${unavailable ? text.unavailable : (result?.[locale() === 'en' ? 'cta_en' : 'cta_ar'] || text.body).replace('5', String(limit))}</p>
      </div>
      <div class="ev-membership-gate__actions">
        <a class="ev-membership-gate__button ev-membership-gate__button--secondary" href="${links.login_url}">${text.login}</a>
        <a class="ev-membership-gate__button ev-membership-gate__button--primary" href="${links.register_url}">${text.register}</a>
      </div>
    `;

    const layout = document.querySelector('.ev-layout');
    if (layout?.parentNode) layout.parentNode.insertBefore(section, layout);
    else document.querySelector('#main-content')?.appendChild(section);
  }

  async function init() {
    try {
      const result = await checkAccess();
      renderGate(result, false);
    } catch (error) {
      console.warn('EV membership access UI check failed:', error);
      renderGate({ guest_item_limit: FALLBACK_LIMIT, ...fallbackLinks() }, true);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
