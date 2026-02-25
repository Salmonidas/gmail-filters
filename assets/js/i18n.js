/**
 * i18n.js – Lightweight internationalisation engine.
 *
 * Usage:
 *   await i18n.load('en');          // load a locale
 *   i18n.t('builder.title');        // get a translated string
 *   i18n.t('preview.char_count', { count: 42 }); // with interpolation
 *
 * To add a new language:
 *   1. Create locales/<code>.json following the same key structure.
 *   2. Add an entry to i18n.AVAILABLE_LOCALES below.
 */

const i18n = (() => {
  const AVAILABLE_LOCALES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ];

  let _strings = {};
  let _currentLocale = 'en';
  const _listeners = [];

  function _get(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
  }

  function _interpolate(str, params = {}) {
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => (params[key] !== undefined ? params[key] : `{{${key}}}`));
  }

  async function load(locale) {
    const res = await fetch(`locales/${locale}.json`);
    if (!res.ok) throw new Error(`Locale "${locale}" not found.`);
    _strings = await res.json();
    _currentLocale = locale;
    document.documentElement.lang = locale;
    _listeners.forEach(fn => fn(locale));
  }

  function t(key, params) {
    const val = _get(_strings, key);
    if (val === null) return key;
    if (typeof val === 'string') return _interpolate(val, params);
    return val;
  }

  function currentLocale() { return _currentLocale; }
  function availableLocales() { return [...AVAILABLE_LOCALES]; }
  function onChange(fn) { _listeners.push(fn); }

  return { load, t, currentLocale, availableLocales, onChange };
})();

export default i18n;
