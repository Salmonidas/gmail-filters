/**
 * legal-i18n.js – Standalone i18n engine for legal pages.
 *
 * This is a lightweight, self-contained script (no ES module) that:
 *   1. Detects the user's preferred locale via navigator.language.
 *   2. Fetches the corresponding locales/<code>.json file.
 *   3. Applies translations to all elements with [data-i18n] attributes.
 *   4. Uses innerHTML (not textContent) to preserve embedded HTML tags
 *      like <strong>, <a>, <em>, etc.
 *   5. Sets the document lang and dir (for RTL languages).
 */
(function () {
  'use strict';

  var AVAILABLE = [
    'es','es-ES','es-419','es-US',
    'ca','ca-ES-valencia','ca-ES-mallorca',
    'eu-ES','gl-ES',
    'en','en-US','en-GB','en-CA','en-AU','en-IN',
    'fr-FR','fr-CA','de-DE','it-IT',
    'pt-PT','pt-BR','ru-RU','tr-TR',
    'ar','zh-CN','ja-JP','ko-KR','hi-IN',
    'vi','id','th'
  ];

  function detectLocale() {
    // 0. User's persisted choice (saved by main app when they pick a language)
    try {
      var saved = localStorage.getItem('preferredLocale');
      if (saved && AVAILABLE.indexOf(saved) !== -1) return saved;
    } catch (_) {}

    var preferred = navigator.language || 'en';

    // Exact match
    if (AVAILABLE.indexOf(preferred) !== -1) return preferred;

    var lower = preferred.toLowerCase();

    // Regional maps
    if (lower.indexOf('es-') === 0) {
      if (lower === 'es-es') return 'es-ES';
      if (lower === 'es-us') return 'es-US';
      return 'es-419';
    }
    if (lower.indexOf('en-') === 0) {
      if (lower === 'en-gb') return 'en-GB';
      if (lower === 'en-ca') return 'en-CA';
      if (lower === 'en-au') return 'en-AU';
      if (lower === 'en-in') return 'en-IN';
      return 'en-US';
    }
    if (lower.indexOf('fr-') === 0) {
      return lower === 'fr-ca' ? 'fr-CA' : 'fr-FR';
    }
    if (lower.indexOf('pt-') === 0) {
      return lower === 'pt-br' ? 'pt-BR' : 'pt-PT';
    }
    if (lower.indexOf('ca-') === 0) {
      if (lower.indexOf('valencia') !== -1) return 'ca-ES-valencia';
      if (lower.indexOf('mallorca') !== -1) return 'ca-ES-mallorca';
      return 'ca';
    }

    // Prefix match (e.g. "de" -> "de-DE")
    var prefix = preferred.split('-')[0];
    for (var i = 0; i < AVAILABLE.length; i++) {
      if (AVAILABLE[i] === prefix || AVAILABLE[i].split('-')[0] === prefix) {
        return AVAILABLE[i];
      }
    }

    return 'en';
  }

  function getNestedValue(obj, path) {
    var keys = path.split('.');
    var current = obj;
    for (var i = 0; i < keys.length; i++) {
      if (current == null || typeof current !== 'object') return null;
      current = current[keys[i]];
    }
    return current != null ? current : null;
  }

  var LEGAL_HUB_URL = 'https://salmonidas-dev.vercel.app/legal-identity';

  function applyTranslations(strings) {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      var val = getNestedValue(strings, key);
      if (val != null && typeof val === 'string') {
        // Use innerHTML to preserve HTML tags like <strong>, <a>, <em>
        el.innerHTML = val;
      }
    }
    // Also set <title>
    var titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      var titleKey = titleEl.getAttribute('data-i18n');
      var titleVal = getNestedValue(strings, titleKey);
      if (titleVal) document.title = titleVal;
    }
    // Fix legal hub links: translated strings have href="#" placeholders
    fixLegalLinks();
  }

  function fixLegalLinks() {
    // Fix all links that were injected with href="#" from translation strings
    var allLinks = document.querySelectorAll('.legal-container a[href="#"]');
    for (var i = 0; i < allLinks.length; i++) {
      allLinks[i].href = LEGAL_HUB_URL;
    }
    // Also fix by known IDs
    var ids = ['hub-legal-link', 'hub-legal-link-2'];
    for (var j = 0; j < ids.length; j++) {
      var el = document.getElementById(ids[j]);
      if (el) el.href = LEGAL_HUB_URL;
    }
    // Fix by class
    var byClass = document.querySelectorAll('.hub-legal-link-class');
    for (var k = 0; k < byClass.length; k++) {
      byClass[k].href = LEGAL_HUB_URL;
    }
    // Also fix the statically-placed ones (from fallback HTML)
    var staticLinks = document.querySelectorAll('a.hub-legal-link');
    for (var l = 0; l < staticLinks.length; l++) {
      if (!staticLinks[l].href || staticLinks[l].getAttribute('href') === '#') {
        staticLinks[l].href = LEGAL_HUB_URL;
      }
    }
  }

  function init() {
    var locale = detectLocale();

    // Build path to locales/ relative to the current page
    // Legal pages are at /legal/foo.html, so locales are at ../locales/
    // Main page is at /, so locales are at ./locales/
    var isSubdir = window.location.pathname.indexOf('/legal/') !== -1;
    var localesBase = isSubdir ? '../locales/' : './locales/';

    // Set lang and dir
    document.documentElement.lang = locale;
    document.documentElement.dir = locale.indexOf('ar') === 0 ? 'rtl' : 'ltr';

    fetch(localesBase + locale + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Locale not found: ' + locale);
        return res.json();
      })
      .then(function (strings) {
        applyTranslations(strings);
      })
      .catch(function () {
        // Fallback: try loading 'en'
        if (locale !== 'en') {
          fetch(localesBase + 'en.json')
            .then(function (res) { return res.json(); })
            .then(function (strings) { applyTranslations(strings); })
            .catch(function () { /* Keep static HTML fallback */ });
        }
      });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
