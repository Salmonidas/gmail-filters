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
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'ca', label: 'Català' },
    { code: 'de-DE', label: 'Deutsch' },
    { code: 'en-AU', label: 'English (Australia)' },
    { code: 'en-CA', label: 'English (Canada)' },
    { code: 'en', label: 'English (Generic)' },
    { code: 'en-IN', label: 'English (India)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'es-US', label: 'Español (EE. UU.)' },
    { code: 'es-ES', label: 'Español (España)' },
    { code: 'es', label: 'Español (Genérico)' },
    { code: 'es-419', label: 'Español (Latinoamérica)' },
    { code: 'eu-ES', label: 'Euskara' },
    { code: 'fr-CA', label: 'Français (Canada)' },
    { code: 'fr-FR', label: 'Français (France)' },
    { code: 'gl-ES', label: 'Galego' },
    { code: 'it-IT', label: 'Italiano' },
    { code: 'ca-ES-mallorca', label: 'Mallorquí' },
    { code: 'pt-BR', label: 'Português (Brasil)' },
    { code: 'pt-PT', label: 'Português (Portugal)' },
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'tr-TR', label: 'Türkçe' },
    { code: 'ca-ES-valencia', label: 'Valencià' },
    
    // Non-Latin Scripts
    { code: 'ru-RU', label: 'Русский' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi-IN', label: 'हिन्दी' },
    { code: 'th', label: 'ไทย' },
    { code: 'zh-CN', label: '简体中文' },
    { code: 'ja-JP', label: '日本語' },
    { code: 'ko-KR', label: '한국어' }
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
    document.documentElement.dir = locale.startsWith('ar') ? 'rtl' : 'ltr';
    try { localStorage.setItem('preferredLocale', locale); } catch (_) {}
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
