(() => {
  'use strict';

  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    try {
      const rawUrl = typeof input === 'string' ? input : input?.url;
      const url = new URL(rawUrl || '', window.location.href);
      const isLegacyChargerDataRequest =
        url.origin === window.location.origin &&
        url.pathname === '/data/chargers.v2.json';

      if (!isLegacyChargerDataRequest) return nativeFetch(input, init);

      const apiUrl = new URL('/api/chargers', window.location.origin);
      apiUrl.searchParams.set('locale', document.documentElement.lang === 'en' ? 'en' : 'ar');
      apiUrl.searchParams.set('_ts', String(Date.now()));

      return nativeFetch(apiUrl.toString(), {
        ...init,
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          ...(init.headers || {}),
        },
      });
    } catch (_) {
      return nativeFetch(input, init);
    }
  };
})();
