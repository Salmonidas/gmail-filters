import i18n            from './i18n.js';
import { initUI }      from './ui.js';
import { renderExamples, renderHelp, renderGuide, renderSavedFilters } from './examples.js';

const CONFIG = {
  INITIAL_LOCALE: null,
  HIDE_SUPPORT:   false,
};

const state = {
  conditions:        [],
  currentQuery:      '',
  hideSupportBanner: CONFIG.HIDE_SUPPORT,
};

function detectLocale() {
  if (CONFIG.INITIAL_LOCALE) return CONFIG.INITIAL_LOCALE;
  const preferred = navigator.language?.split('-')[0] || 'en';
  const available = i18n.availableLocales().map(l => l.code);
  return available.includes(preferred) ? preferred : 'en';
}

function initTheme() {
  const root = document.documentElement;
  const btn  = document.getElementById('theme-toggle-btn');
  const mq   = window.matchMedia('(prefers-color-scheme: dark)');

  const svgs = {
    dark: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"/></svg>'
  };

  function applyTheme(dark) {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (btn) btn.innerHTML = dark ? svgs.light : svgs.dark;
  }

  const saved = localStorage.getItem('theme');
  applyTheme(saved ? saved === 'dark' : mq.matches);

  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') !== 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  });

  mq.addEventListener('change', e => {
    if (!localStorage.getItem('theme')) applyTheme(e.matches);
  });
}

async function boot() {
  initTheme();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn('SW Registration failed:', err);
      });
    });
  }

  try {
    await i18n.load(detectLocale());
  } catch {
    await i18n.load('en');
  }

  const ui = initUI(i18n, state);
  ui.init();
  ui.initPWAInstall();

  const examplesContainer     = document.getElementById('examples-grid');
  const savedFiltersContainer = document.getElementById('saved-filters-grid');
  const helpContainer     = document.getElementById('help-container');
  const guideContainer    = document.getElementById('guide-container');

  function updateSavedLibrary() {
    const saved = JSON.parse(localStorage.getItem('savedFilters') || '[]');
    renderSavedFilters(savedFiltersContainer, saved, i18n.t.bind(i18n), conditions => {
      ui.loadConditions(conditions);
    }, id => {
      ui.showDeleteConfirmation(() => {
        const remaining = saved.filter(f => f.id !== id);
        localStorage.setItem('savedFilters', JSON.stringify(remaining));
        updateSavedLibrary();
      });
    });
  }

  function refreshDynamicSections() {
    updateSavedLibrary();
    renderExamples(examplesContainer, i18n.t.bind(i18n), conditions => {
      ui.loadConditions(conditions);
    });
    renderHelp(helpContainer, i18n.t.bind(i18n));
    renderGuide(guideContainer, i18n.t.bind(i18n));
  }

  refreshDynamicSections();
  
  window.addEventListener('filters-updated', () => updateSavedLibrary());
  i18n.onChange(() => refreshDynamicSections());

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const initialSection = window.location.hash.slice(1).split('?')[0] || 'builder';
  navigateToSection(initialSection);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      navigateToSection(sectionId);
      history.pushState(null, '', `#${sectionId}`);
    });
  });

  window.addEventListener('hashchange', () => {
    const currentSection = window.location.hash.slice(1).split('?')[0] || 'builder';
    navigateToSection(currentSection);
  });
}

function navigateToSection(sectionId) {
  document.querySelectorAll('.main-section').forEach(s => s.classList.toggle('hidden', s.id !== `section-${sectionId}`));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section === sectionId));
}

boot(); 
