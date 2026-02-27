/**
 * ui.js – DOM manipulation, event binding, and all UI rendering.
 *
 * Key responsibilities:
 *  - Render and bind condition rows (always re-renders on type change to keep placeholder in sync)
 *  - Real-time query preview + natural-language summary
 *  - Copy-to-clipboard, Open-in-Gmail, Advanced editor toggle
 *  - Language selector
 *  - Support toast (5s delay, localStorage "don't show again", close button)
 *  - Header donate button href + footer donate link (rendered from i18n)
 *
 * To add a new condition type: edit query-builder.js and locale files only.
 */

import { CONDITION_TYPES, buildQuery, buildSummary, parseQuery } from './query-builder.js';

export function initUI(i18n, state) {

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const els = {
    conditionsList:   document.getElementById('conditions-list'),
    emptyState:       document.getElementById('empty-state'),
    addBtn:           document.getElementById('btn-add-condition'),
    clearBtn:         document.getElementById('btn-clear-all'),
    queryOutput:      document.getElementById('query-output'),
    queryEmpty:       document.getElementById('query-empty'),
    queryText:        document.getElementById('query-text'),
    charCount:        document.getElementById('char-count'),
    copyBtn:          document.getElementById('btn-copy'),
    shareBtn:         document.getElementById('btn-share'),
    saveBtn:          document.getElementById('btn-save'),
    openGmailBtn:     document.getElementById('btn-open-gmail'),
    summaryText:      document.getElementById('summary-text'),
    summaryEmpty:     document.getElementById('summary-empty'),
    advancedToggle:   document.getElementById('btn-advanced-toggle'),
    advancedEditor:   document.getElementById('advanced-editor'),
    advancedInput:    document.getElementById('advanced-query-input'),
    visualBuilder:    document.getElementById('visual-builder'),
    langSelect:       document.getElementById('lang-select'),
    headerDonateBtn:  document.getElementById('header-donate-btn'),
    footerDonateLink: document.getElementById('footer-donate-link'),
    toast:            document.getElementById('support-toast'),
    btnViewGuide:     document.getElementById('btn-view-guide'),
    saveOverlay:      document.getElementById('save-filter-overlay'),
    saveNameInput:    document.getElementById('save-filter-name'),
    saveCancel:       document.getElementById('save-filter-cancel'),
    saveConfirm:      document.getElementById('save-filter-confirm'),
    saveSnackbar:     document.getElementById('save-snackbar'),
    saveSnackbarMsg:  document.getElementById('save-snackbar-msg'),
    saveSnackbarAct:  document.getElementById('save-snackbar-action'),
    deleteOverlay:    document.getElementById('delete-confirm-overlay'),
    deleteCancel:     document.getElementById('delete-confirm-cancel'),
    deleteConfirm:    document.getElementById('delete-confirm-btn'),
    pwaInstallBtn:    document.getElementById('btn-pwa-install'),
    iosPwaHint:       document.getElementById('ios-pwa-hint'),
  };

  let isAdvancedMode = false;
  let snackbarTimer  = null;

  // ── Internal Helpers ───────────────────────────────────────────────────────
  function showSaveDialog() {
    if (!els.saveOverlay || !els.saveNameInput) return;
    els.saveNameInput.value = '';
    els.saveOverlay.classList.remove('hidden');
    setTimeout(() => els.saveNameInput.focus(), 50);
  }

  function doSave() {
    const title = els.saveNameInput?.value.trim() || i18n.t('saved_filters.default_name');
    els.saveOverlay?.classList.add('hidden');
    
    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('savedFilters') || '[]');
    saved.push({ 
      id: crypto.randomUUID(), 
      title, 
      query: state.currentQuery, 
      conditions: JSON.parse(JSON.stringify(state.conditions)) 
    });
    localStorage.setItem('savedFilters', JSON.stringify(saved));
    
    // Notify app
    window.dispatchEvent(new Event('filters-updated'));
    showSnackbar();
  }

  function doCancel() {
    els.saveOverlay?.classList.add('hidden');
    els.deleteOverlay?.classList.add('hidden');
  }

  function showDeleteConfirmation(onConfirm) {
    if (!els.deleteOverlay) return;
    els.deleteOverlay.classList.remove('hidden');

    const handleConfirm = () => {
      onConfirm();
      doCancel();
      cleanup();
    };

    const handleCancel = () => {
      doCancel();
      cleanup();
    };

    function cleanup() {
      els.deleteConfirm?.removeEventListener('click', handleConfirm);
      els.deleteCancel?.removeEventListener('click', handleCancel);
    }

    els.deleteConfirm?.addEventListener('click', handleConfirm);
    els.deleteCancel?.addEventListener('click', handleCancel);
  }

  let deferredPrompt = null;
  function initPWAInstall() {
    // 1. Detect iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      els.iosPwaHint?.classList.remove('hidden');
    }

    // 2. Standard PWA Prompt (Chrome/Android/macOS Chrome)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      els.pwaInstallBtn?.classList.remove('hidden');
    });

    els.pwaInstallBtn?.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        els.pwaInstallBtn?.classList.add('hidden');
      }
      deferredPrompt = null;
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      els.pwaInstallBtn?.classList.add('hidden');
    });
  }

  function showSnackbar() {
    if (!els.saveSnackbar) return;
    if (snackbarTimer) clearTimeout(snackbarTimer);
    
    // Update texts
    if (els.saveSnackbarMsg) els.saveSnackbarMsg.textContent = i18n.t('saved_filters.snackbar_msg');
    if (els.saveSnackbarAct) els.saveSnackbarAct.textContent = i18n.t('saved_filters.snackbar_action');
    
    // Show it
    els.saveSnackbar.classList.remove('hidden');

    // Clone & replace button to clear old listeners safely
    if (els.saveSnackbarAct) {
      const freshBtn = els.saveSnackbarAct.cloneNode(true);
      els.saveSnackbarAct.replaceWith(freshBtn);
      els.saveSnackbarAct = freshBtn; 
      
      els.saveSnackbarAct.addEventListener('click', () => {
        els.saveSnackbar.classList.add('hidden');
        const examplesLink = document.querySelector('[data-section="examples"]');
        if (examplesLink) {
          examplesLink.click();
          setTimeout(() => {
            const target = document.getElementById('saved-filters-card');
            if (target) {
              target.style.display = 'block';
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 250);
        }
      });
    }

    snackbarTimer = setTimeout(() => {
      els.saveSnackbar?.classList.add('hidden');
      snackbarTimer = null;
    }, 5000);
  }

  // ── Language selector ─────────────────────────────────────────────────────
  function buildLangSelect() {
    if (!els.langSelect) return;
    els.langSelect.innerHTML = '';
    i18n.availableLocales().forEach(({ code, label }) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = label;
      if (code === i18n.currentLocale()) opt.selected = true;
      els.langSelect.appendChild(opt);
    });
    els.langSelect.addEventListener('change', async () => {
      await i18n.load(els.langSelect.value);
    });
  }

  // ── Translate static UI strings ───────────────────────────────────────────
  function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key  = el.dataset.i18n;
      const attr = el.dataset.i18nAttr;
      const val  = i18n.t(key);
      if (attr) {
        el.setAttribute(attr, val);
      } else if (typeof val === 'string') {
        el.textContent = val;
      }
    });

    updateDonateLinks();
    renderAllConditions();
    renderPreview();
    buildLangSelect();
  }

  // ── Donate links (header + footer) ────────────────────────────────────────
  function updateDonateLinks() {
    const links = i18n.t('support.links');
    const primaryUrl = Array.isArray(links) && links[0] ? links[0].url : '#';

    if (els.headerDonateBtn) {
      els.headerDonateBtn.href  = primaryUrl;
      els.headerDonateBtn.title = i18n.t('support.header_title');
      els.headerDonateBtn.setAttribute('aria-label', i18n.t('support.header_title'));
    }
    if (els.footerDonateLink) {
      els.footerDonateLink.href        = primaryUrl;
      els.footerDonateLink.textContent = i18n.t('footer.donate');
    }
  }

  // ── Condition rows ─────────────────────────────────────────────────────────
  function createConditionRow(cond) {
    const row = document.createElement('div');
    row.className = 'condition-row';
    row.dataset.id = cond.id;
    row.innerHTML = buildConditionRowHTML(cond);
    bindConditionRowEvents(row, cond);
    return row;
  }

  function getNoteKey(type) {
    const noteTypes = ['has_attachment', 'is_read', 'is_unread', 'is_starred', 'is_important'];
    return noteTypes.includes(type) ? `builder.${type}_note` : null;
  }

  function buildConditionRowHTML(cond) {
    const types      = Object.entries(CONDITION_TYPES);
    const typeOptions = types.map(([key]) => {
      const label    = i18n.t(`builder.types.${key}`);
      const selected = key === cond.type ? 'selected' : '';
      return `<option value="${key}" ${selected}>${label}</option>`;
    }).join('');

    const def        = CONDITION_TYPES[cond.type];
    const needsValue = def && def.hasValue;
    const placeholder = i18n.t(`builder.placeholders.${cond.type}`) || '';
    const isDate     = def && def.valueType === 'date';
    const inputType  = isDate ? 'date' : 'text';
    const noteKey    = getNoteKey(cond.type);
    const note       = noteKey ? `<p class="condition-note">${i18n.t(noteKey)}</p>` : '';

    const isFirstInList = state.conditions.indexOf(cond) === 0;

    return `
      <div class="condition-header">
        <div class="condition-field">
          <label class="condition-label">${i18n.t('builder.condition.type_label')}</label>
          <div class="select-wrapper">
            <select class="condition-type-select md-select" aria-label="${i18n.t('builder.condition.type_label')}">
              ${typeOptions}
            </select>
          </div>
        </div>

        ${needsValue ? `
        <div class="condition-field condition-value-field">
          <label class="condition-label">${i18n.t('builder.condition.value_label')}</label>
          <input
            type="${inputType}"
            class="condition-value-input md-input"
            placeholder="${escapeHtml(placeholder)}"
            value="${escapeHtml(cond.value || '')}"
            aria-label="${i18n.t('builder.condition.value_label')}"
          />
        </div>` : `<div class="condition-field">${note}</div>`}

        <div class="condition-actions">
          <label class="negate-label md-chip ${cond.negate ? 'active' : ''}">
            <input type="checkbox" class="condition-negate" ${cond.negate ? 'checked' : ''} />
            ${i18n.t('builder.condition.negate')}
          </label>
          <button class="icon-btn condition-remove"
            aria-label="${i18n.t('builder.condition.remove')}"
            title="${i18n.t('builder.condition.remove')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      ${needsValue && note ? note : ''}

      <div class="condition-logic ${isFirstInList ? 'hidden' : ''}">
        <span class="logic-label">${i18n.t('builder.logic_label')}:</span>
        <div class="logic-toggle" role="group">
          <button class="logic-btn ${cond.logic !== 'OR' ? 'active' : ''}" data-logic="AND">
            ${i18n.t('builder.logic_and')}
          </button>
          <button class="logic-btn ${cond.logic === 'OR' ? 'active' : ''}" data-logic="OR">
            ${i18n.t('builder.logic_or')}
          </button>
        </div>
      </div>
    `;
  }

  function bindConditionRowEvents(row, cond) {
    // Always re-render on type change so input type AND placeholder update correctly
    row.querySelector('.condition-type-select').addEventListener('change', e => {
      cond.type = e.target.value;
      const def = CONDITION_TYPES[cond.type];
      if (!def?.hasValue) cond.value = '';
      row.innerHTML = buildConditionRowHTML(cond);
      bindConditionRowEvents(row, cond);
      renderPreview();
    });

    const valInput = row.querySelector('.condition-value-input');
    if (valInput) {
      valInput.addEventListener('input', e => {
        cond.value = e.target.value;
        renderPreview();
      });
    }

    row.querySelector('.condition-negate').addEventListener('change', e => {
      cond.negate = e.target.checked;
      row.querySelector('.negate-label').classList.toggle('active', cond.negate);
      renderPreview();
    });

    row.querySelector('.condition-remove').addEventListener('click', () => {
      state.conditions = state.conditions.filter(c => c.id !== cond.id);
      row.remove();
      checkEmptyState();
      renderPreview();
    });

    row.querySelectorAll('.logic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cond.logic = btn.dataset.logic;
        row.querySelectorAll('.logic-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderPreview();
      });
    });
  }

  function renderAllConditions() {
    if (!els.conditionsList) return;
    els.conditionsList.innerHTML = '';
    state.conditions.forEach(cond => {
      els.conditionsList.appendChild(createConditionRow(cond));
    });
    checkEmptyState();
  }

  function checkEmptyState() {
    const empty = state.conditions.length === 0;
    if (els.emptyState)       els.emptyState.classList.toggle('hidden', !empty);
    if (els.conditionsList)   els.conditionsList.classList.toggle('hidden', empty);
  }

  // ── Preview panel ──────────────────────────────────────────────────────────
  function renderPreview() {
    const query = isAdvancedMode ? (state.currentQuery || '') : buildQuery(state.conditions);

    if (!query) {
      els.queryOutput?.classList.add('hidden');
      els.queryEmpty?.classList.remove('hidden');
      els.summaryText?.classList.add('hidden');
      els.summaryEmpty?.classList.remove('hidden');
      state.currentQuery = '';
      return;
    }

    state.currentQuery = query;

    els.queryEmpty?.classList.add('hidden');
    els.queryOutput?.classList.remove('hidden');
    if (els.queryText)  els.queryText.textContent  = query;
    if (els.charCount)  els.charCount.textContent  = i18n.t('preview.char_count', { count: query.length });
    if (els.openGmailBtn) {
      els.openGmailBtn.href = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`;
    }

    const summary = isAdvancedMode ? '' : buildSummary(state.conditions, i18n.t.bind(i18n));
    if (summary) {
      els.summaryEmpty?.classList.add('hidden');
      if (els.summaryText) {
        els.summaryText.classList.remove('hidden');
        els.summaryText.textContent = summary;
      }
    } else {
      els.summaryText?.classList.add('hidden');
      els.summaryEmpty?.classList.remove('hidden');
    }

    if (isAdvancedMode && els.advancedInput) els.advancedInput.value = query;
    syncStateToURL();
  }

  // ── URL State Sync ─────────────────────────────────────────────────────────
  function syncStateToURL() {
    if (isAdvancedMode) return;
    if (state.conditions.length === 0) {
      window.history.replaceState(null, '', window.location.pathname + (window.location.hash.split('?')[0] || ''));
      return;
    }
    const mini = state.conditions.map(c => ({
      t: c.type,
      v: c.value,
      n: c.negate ? 1 : 0,
      l: c.logic === 'OR' ? 1 : 0
    }));
    try {
      const b64 = btoa(encodeURIComponent(JSON.stringify(mini)));
      const baseHash = window.location.hash.split('?')[0] || '#builder';
      window.history.replaceState(null, '', `${baseHash}?q=${b64}`);
    } catch(e) { console.error('Error syncing state', e); }
  }

  function loadStateFromURL() {
    try {
      const hash = window.location.hash;
      if (!hash.includes('?q=')) return false;
      
      const q = new URLSearchParams(hash.split('?')[1]).get('q');
      if (!q) return false;
      
      const mini = JSON.parse(decodeURIComponent(atob(q)));
      if (!Array.isArray(mini)) return false;
      
      state.conditions = mini.map(m => ({
        id: crypto.randomUUID(),
        type: m.t || 'from',
        value: m.v || '',
        negate: !!m.n,
        logic: m.l ? 'OR' : 'AND'
      }));
      return true;
    } catch(e) {
      console.error('Failed to parse URL state', e);
      return false;
    }
  }

  // ── Support toast ──────────────────────────────────────────────────────────
  function initToast() {
    const toast = els.toast;
    if (!toast || state.hideSupportBanner) return;
    if (localStorage.getItem('supportDismissed') === 'permanent') return;

    // Populate toast content from i18n
    function renderToast() {
      const titleEl = toast.querySelector('.toast-title');
      const descEl  = toast.querySelector('.toast-desc');
      const linksEl = toast.querySelector('.toast-links');
      const dismissEl = toast.querySelector('.toast-dismiss');

      if (titleEl)   titleEl.textContent = i18n.t('support.toast_title');
      if (descEl)    descEl.textContent  = i18n.t('support.toast_desc');
      if (dismissEl) dismissEl.textContent = i18n.t('support.dismiss_permanent');

      const links = i18n.t('support.links');
      if (linksEl && Array.isArray(links)) {
        linksEl.innerHTML = links.map(l =>
          `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="toast-cta-link">${l.label}</a>`
        ).join('');
      }
    }

    renderToast();
    i18n.onChange(() => renderToast());

    function showToast() {
      toast.classList.add('toast-visible');
    }
    function hideToast(permanent = false) {
      toast.classList.remove('toast-visible');
      if (permanent) localStorage.setItem('supportDismissed', 'permanent');
    }

    setTimeout(showToast, 5000);

    toast.querySelector('.toast-close-btn')?.addEventListener('click', () => hideToast(false));
    toast.querySelector('.toast-dismiss')?.addEventListener('click', () => hideToast(true));
  }

  // ── Toolbar buttons ────────────────────────────────────────────────────────
  function bindGlobalEvents() {
    els.addBtn?.addEventListener('click', () => {
      const cond = {
        id:     crypto.randomUUID(),
        type:   'from',
        value:  '',
        negate: false,
        logic:  'AND',
      };
      state.conditions.push(cond);
      const row = createConditionRow(cond);
      if (els.conditionsList) {
        els.conditionsList.classList.remove('hidden');
        els.conditionsList.appendChild(row);
      }
      els.emptyState?.classList.add('hidden');
      row.querySelector('.condition-value-input, .condition-type-select')?.focus();
    });

    els.clearBtn?.addEventListener('click', () => {
      state.conditions = [];
      renderAllConditions();
      renderPreview();
    });

    els.copyBtn?.addEventListener('click', async () => {
      if (!state.currentQuery) return;
      await navigator.clipboard.writeText(state.currentQuery);
      const label = els.copyBtn.querySelector('[data-i18n]');
      if (label) {
        const orig = label.textContent;
        label.textContent = i18n.t('preview.copied');
        setTimeout(() => { label.textContent = orig; }, 2000);
      }
    });

    els.shareBtn?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(window.location.href);
      const label = els.shareBtn.querySelector('[data-i18n]');
      if (label) {
        const orig = label.textContent;
        label.textContent = i18n.t('preview.share_copied');
        setTimeout(() => { label.textContent = orig; }, 2000);
      }
    });

    els.saveBtn?.addEventListener('click', () => {
      if (!state.currentQuery || state.conditions.length === 0) return;
      showSaveDialog();
    });

    els.advancedToggle?.addEventListener('click', () => {
      isAdvancedMode = !isAdvancedMode;
      els.visualBuilder?.classList.toggle('hidden', isAdvancedMode);
      els.advancedEditor?.classList.toggle('hidden', !isAdvancedMode);

      const label = els.advancedToggle.querySelector('[data-i18n]');
      if (label) {
        label.dataset.i18n = isAdvancedMode ? 'builder.visual_mode' : 'builder.advanced_mode';
        label.textContent  = i18n.t(label.dataset.i18n);
      }

      if (isAdvancedMode && els.advancedInput) {
        els.advancedInput.value = state.currentQuery;
      } else if (!isAdvancedMode && els.advancedInput) {
        const parsed = parseQuery(els.advancedInput.value);
        if (parsed.length > 0) {
          state.conditions = parsed;
          renderAllConditions();
        }
        renderPreview();
      }
    });

    els.advancedInput?.addEventListener('input', e => {
      state.currentQuery = e.target.value;
      renderPreview();
    });

    els.langSelect?.addEventListener('change', async () => {
      await i18n.load(els.langSelect.value);
    });

    els.btnViewGuide?.addEventListener('click', () => {
      window.location.hash = '#guide';
    });

    // Save Filter Modal Events (attached once)
    els.saveConfirm?.addEventListener('click', doSave);
    els.saveCancel?.addEventListener('click', doCancel);
    els.saveOverlay?.addEventListener('click', e => {
      if (e.target === els.saveOverlay) doCancel();
    });
    els.saveNameInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter')  doSave();
      if (e.key === 'Escape') doCancel();
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    init() {
      buildLangSelect();
      translateUI();
      bindGlobalEvents();
      
      loadStateFromURL();
      renderAllConditions();
      renderPreview();
      
      initToast();
      i18n.onChange(() => translateUI());
    },
    loadConditions(conditions) {
      state.conditions = conditions.map(c => ({ ...c, id: crypto.randomUUID() }));
      renderAllConditions();
      renderPreview();
      document.getElementById('section-builder')?.scrollIntoView({ behavior: 'smooth' });
    },
    renderPreview,
    initPWAInstall,
    showDeleteConfirmation,
  };

}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
} 
