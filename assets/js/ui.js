import {
  CONDITION_GROUPS,
  CONDITION_TYPES,
  createRootGroup,
  createGroup,
  createCondition,
  normalizeFilterTree,
  hasAnyCondition,
  buildQuery,
  buildSummary,
  parseQuery,
  analyzeQuery,
} from './query-builder.js';

function safeStorageGet(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function copyTextSafe(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

export function initUI(i18n, state, deps = {}) {
  const els = {
    conditionsList: document.getElementById('conditions-list'),
    emptyState: document.getElementById('empty-state'),
    addBtn: document.getElementById('btn-add-condition'),
    addGroupBtn: document.getElementById('btn-add-group'),
    clearBtn: document.getElementById('btn-clear-all'),
    queryOutput: document.getElementById('query-output'),
    queryEmpty: document.getElementById('query-empty'),
    queryText: document.getElementById('query-text'),
    charCount: document.getElementById('char-count'),
    diagnostics: document.getElementById('query-diagnostics'),
    copyBtn: document.getElementById('btn-copy'),
    shareBtn: document.getElementById('btn-share'),
    saveBtn: document.getElementById('btn-save'),
    openGmailBtn: document.getElementById('btn-open-gmail'),
    summaryText: document.getElementById('summary-text'),
    summaryEmpty: document.getElementById('summary-empty'),
    advancedToggle: document.getElementById('btn-advanced-toggle'),
    advancedEditor: document.getElementById('advanced-editor'),
    advancedInput: document.getElementById('advanced-query-input'),
    visualBuilder: document.getElementById('visual-builder'),
    langSelect: document.getElementById('lang-select'),
    headerDonateBtn: document.getElementById('header-donate-btn'),
    footerDonateLink: document.getElementById('footer-donate-link'),
    toast: document.getElementById('support-toast'),
    btnViewGuide: document.getElementById('btn-view-guide'),
    saveOverlay: document.getElementById('save-filter-overlay'),
    saveNameInput: document.getElementById('save-filter-name'),
    saveCancel: document.getElementById('save-filter-cancel'),
    saveConfirm: document.getElementById('save-filter-confirm'),
    saveSnackbar: document.getElementById('save-snackbar'),
    saveSnackbarMsg: document.getElementById('save-snackbar-msg'),
    saveSnackbarAct: document.getElementById('save-snackbar-action'),
    deleteOverlay: document.getElementById('delete-confirm-overlay'),
    deleteCancel: document.getElementById('delete-confirm-cancel'),
    deleteConfirm: document.getElementById('delete-confirm-btn'),
    pwaInstallBtn: document.getElementById('btn-pwa-install'),
    iosPwaHint: document.getElementById('ios-pwa-hint'),
    donationOverlay: document.getElementById('donation-overlay'),
  };

  let isAdvancedMode = false;
  let snackbarTimer = null;
  let deferredPrompt = null;

  const GITHUB_SPONSORS_URL = 'https://github.com/sponsors/Salmonidas';
  const LEMON_CHECKOUT_URL = 'https://salmonidas.lemonsqueezy.com/checkout/buy/61c04df0-3855-4fff-87ca-fe084713823e?embed=1';

  function getTree() {
    if (!state.filterTree || state.filterTree.kind !== 'group' || !Array.isArray(state.filterTree.children)) {
      state.filterTree = normalizeFilterTree(state.filterTree);
    }
    return state.filterTree;
  }

  function showSaveDialog() {
    if (!els.saveOverlay || !els.saveNameInput) return;
    els.saveNameInput.value = '';
    els.saveOverlay.classList.remove('hidden');
    els.saveNameInput.focus();
  }

  function doSave() {
    const query = (state.currentQuery || '').trim();
    if (!query) return;

    const title = els.saveNameInput?.value.trim() || i18n.t('saved_filters.default_name');
    els.saveOverlay?.classList.add('hidden');

    let saved = [];
    try {
      const raw = JSON.parse(safeStorageGet('savedFilters', '[]'));
      if (Array.isArray(raw)) saved = raw;
    } catch {
      saved = [];
    }

    const treeSnapshot = isAdvancedMode
      ? parseQuery(query)
      : JSON.parse(JSON.stringify(getTree()));

    saved.push({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title,
      query,
      tree: treeSnapshot,
      isRaw: isAdvancedMode,
    });
    safeStorageSet('savedFilters', JSON.stringify(saved));

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

    const cleanup = () => {
      els.deleteConfirm?.removeEventListener('click', handleConfirm);
      els.deleteCancel?.removeEventListener('click', handleCancel);
      els.deleteOverlay?.removeEventListener('click', handleBackdrop);
      document.removeEventListener('keydown', handleEscape);
    };

    const handleConfirm = () => {
      cleanup();
      doCancel();
      onConfirm();
    };

    const handleCancel = () => {
      cleanup();
      doCancel();
    };

    const handleBackdrop = e => {
      if (e.target === els.deleteOverlay) handleCancel();
    };

    const handleEscape = e => {
      if (e.key === 'Escape') handleCancel();
    };

    els.deleteConfirm?.addEventListener('click', handleConfirm);
    els.deleteCancel?.addEventListener('click', handleCancel);
    els.deleteOverlay.addEventListener('click', handleBackdrop);
    document.addEventListener('keydown', handleEscape);
    els.deleteCancel?.focus();
  }

  function closeDonationModal() {
    els.donationOverlay?.classList.add('hidden');
  }

  function openDonationModal(e) {
    if (e) e.preventDefault();
    if (!els.donationOverlay) return;
    els.donationOverlay.classList.remove('hidden');

    if (!els.donationOverlay.dataset.bound) {
      els.donationOverlay.dataset.bound = 'true';
      document.getElementById('donation-cancel')?.addEventListener('click', closeDonationModal);
      els.donationOverlay.addEventListener('click', ev => {
        if (ev.target === els.donationOverlay) closeDonationModal();
      });
      document.addEventListener('keydown', ev => {
        if (ev.key === 'Escape' && !els.donationOverlay.classList.contains('hidden')) {
          closeDonationModal();
        }
      });
      document.querySelector('.donation-option[data-choice="lemonsqueezy"]')?.addEventListener('click', handleLemonSqueezyClick);
      document.querySelector('.donation-option[data-choice="github"]')?.addEventListener('click', handleGithubClick);
    }
  }

  function handleGithubClick() {
    window.open(GITHUB_SPONSORS_URL, '_blank', 'noopener,noreferrer');
    closeDonationModal();
  }

  function handleLemonSqueezyClick() {
    if (typeof window !== 'undefined' && window.createLemonSqueezy) {
      window.createLemonSqueezy();
      if (window.LemonSqueezy) {
        window.LemonSqueezy.Url.Open(LEMON_CHECKOUT_URL);
        closeDonationModal();
        return;
      }
    }
    window.open(LEMON_CHECKOUT_URL, '_blank', 'noopener,noreferrer');
    closeDonationModal();
  }

  function initPWAInstall() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

    if (isIOS && !isStandalone) {
      els.iosPwaHint?.classList.remove('hidden');
    }

    window.addEventListener('beforeinstallprompt', e => {
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

    if (els.saveSnackbarMsg) els.saveSnackbarMsg.textContent = i18n.t('saved_filters.snackbar_msg');
    if (els.saveSnackbarAct) els.saveSnackbarAct.textContent = i18n.t('saved_filters.snackbar_action');

    els.saveSnackbar.classList.remove('hidden');

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
          }, 200);
        }
      });
    }

    snackbarTimer = setTimeout(() => {
      els.saveSnackbar?.classList.add('hidden');
      snackbarTimer = null;
    }, 5000);
  }

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
  }

  function updateDonateLinks() {
    [els.headerDonateBtn, els.footerDonateLink].forEach(el => {
      if (!el) return;
      const fresh = el.cloneNode(true);
      el.replaceWith(fresh);
      if (el === els.headerDonateBtn) els.headerDonateBtn = fresh;
      else els.footerDonateLink = fresh;

      fresh.href = '#';
      fresh.title = i18n.t('support.header_title');
      fresh.setAttribute('aria-label', i18n.t('support.header_title'));
      if (fresh === els.footerDonateLink) fresh.textContent = i18n.t('footer.donate');
      fresh.addEventListener('click', openDonationModal);
    });
  }

  function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const attr = el.dataset.i18nAttr;
      const val = i18n.t(key);
      if (attr) {
        el.setAttribute(attr, val);
      } else if (typeof val === 'string') {
        el.textContent = val;
      }
    });

    const toggleLabel = els.advancedToggle?.querySelector('[data-i18n]');
    if (toggleLabel) {
      toggleLabel.dataset.i18n = isAdvancedMode ? 'builder.visual_mode' : 'builder.advanced_mode';
      toggleLabel.textContent = i18n.t(toggleLabel.dataset.i18n);
    }

    updateDonateLinks();
    renderFilterTree();
    renderPreview();
    buildLangSelect();
  }

  function buildLogicToggleHTML(logic, scopeLabel) {
    const logicLabel = escapeHtml(i18n.t('builder.logic_label'));
    const logicAnd = escapeHtml(i18n.t('builder.logic_and'));
    const logicOr = escapeHtml(i18n.t('builder.logic_or'));
    return `
      <span class="logic-label">${logicLabel}:</span>
      <div class="logic-toggle" role="group" aria-label="${escapeHtml(scopeLabel)}">
        <button type="button" class="logic-btn ${logic !== 'OR' ? 'active' : ''}" data-logic="AND">${logicAnd}</button>
        <button type="button" class="logic-btn ${logic === 'OR' ? 'active' : ''}" data-logic="OR">${logicOr}</button>
      </div>
    `;
  }

  function buildTypeOptionsHTML(selectedType) {
    return CONDITION_GROUPS.map(groupKey => {
      const entries = Object.entries(CONDITION_TYPES).filter(([, def]) => def.group === groupKey);
      const opts = entries
        .map(([key]) => {
          const label = i18n.t(`builder.types.${key}`);
          const selected = key === selectedType ? 'selected' : '';
          return `<option value="${key}" ${selected}>${escapeHtml(label)}</option>`;
        })
        .join('');
      return `<optgroup label="${escapeHtml(i18n.t(`builder.groups.${groupKey}`))}">${opts}</optgroup>`;
    }).join('');
  }

  function getOptionLabel(type, value) {
    const key = `builder.options.${type}.${value}`;
    const translated = i18n.t(key);
    return translated !== key ? translated : value;
  }

  function buildValueFieldHTML(cond, def) {
    const valId = `val-${cond.id}`;
    const valueLabel = escapeHtml(i18n.t('builder.condition.value_label'));
    const noteText = def.noteKey ? i18n.t(def.noteKey) : '';

    if (!def.hasValue) {
      return `<div class="condition-field">${noteText ? `<p class="condition-note">${escapeHtml(noteText)}</p>` : ''}</div>`;
    }

    if (def.valueType === 'select' && Array.isArray(def.options)) {
      if (!cond.value || !def.options.includes(cond.value)) {
        cond.value = def.options[0];
      }
      const optionsHTML = def.options
        .map(opt => {
          const selected = opt === cond.value ? 'selected' : '';
          return `<option value="${escapeHtml(opt)}" ${selected}>${escapeHtml(getOptionLabel(cond.type, opt))}</option>`;
        })
        .join('');
      return `
        <div class="condition-field condition-value-field">
          <label class="condition-label" for="${valId}">${valueLabel}</label>
          <div class="select-wrapper">
            <select id="${valId}" class="condition-value-select md-select">
              ${optionsHTML}
            </select>
          </div>
        </div>
      `;
    }

    if (def.valueType === 'around') {
      const dist = Math.max(1, parseInt(cond.meta?.distance, 10) || 5);
      const word2 = cond.meta?.word2 || '';
      const ordered = Boolean(cond.meta?.ordered);
      return `
        <div class="condition-field condition-value-field">
          <label class="condition-label" for="${valId}">${valueLabel}</label>
          <div class="around-inputs">
            <input
              id="${valId}"
              type="text"
              class="around-word1 md-input"
              placeholder="${escapeHtml(i18n.t('builder.around_word1'))}"
              value="${escapeHtml(cond.value || '')}"
              aria-label="${escapeHtml(i18n.t('builder.around_word1'))}"
            />
            <span class="around-sep">AROUND</span>
            <input
              type="number"
              min="1"
              max="99"
              class="around-distance md-input"
              value="${dist}"
              aria-label="${escapeHtml(i18n.t('builder.around_distance'))}"
              title="${escapeHtml(i18n.t('builder.around_distance'))}"
            />
            <input
              type="text"
              class="around-word2 md-input"
              placeholder="${escapeHtml(i18n.t('builder.around_word2'))}"
              value="${escapeHtml(word2)}"
              aria-label="${escapeHtml(i18n.t('builder.around_word2'))}"
            />
            <label class="md-chip around-ordered-chip ${ordered ? 'active' : ''}">
              <input type="checkbox" class="around-ordered" ${ordered ? 'checked' : ''} />
              <span>${escapeHtml(i18n.t('builder.around_ordered'))}</span>
            </label>
          </div>
        </div>
      `;
    }

    if (def.valueType === 'date') {
      const trimmedVal = (cond.value || '').trim();
      const isEpoch = Boolean(cond.meta?.epoch) || /^\d{9,11}$/.test(trimmedVal);
      if (isEpoch) cond.meta = { ...cond.meta, epoch: true };
      const inputType = isEpoch ? 'text' : 'date';
      const placeholder = isEpoch ? escapeHtml(i18n.t('builder.epoch_placeholder')) : '';
      let displayVal = trimmedVal;
      if (!isEpoch) {
        const dm = displayVal.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
        if (dm) displayVal = `${dm[1]}-${dm[2].padStart(2, '0')}-${dm[3].padStart(2, '0')}`;
      }
      return `
        <div class="condition-field condition-value-field">
          <label class="condition-label" for="${valId}">${valueLabel}</label>
          <div class="date-epoch-row">
            <input
              id="${valId}"
              type="${inputType}"
              ${isEpoch ? 'inputmode="numeric"' : ''}
              class="condition-value-input md-input"
              placeholder="${placeholder}"
              value="${escapeHtml(displayVal)}"
            />
            <button type="button" class="md-btn md-btn-tonal epoch-toggle-btn ${isEpoch ? 'active' : ''}" aria-pressed="${isEpoch}">
              ${escapeHtml(i18n.t('builder.epoch_toggle'))}
            </button>
          </div>
        </div>
      `;
    }

    const rawPlaceholder = i18n.t(`builder.placeholders.${cond.type}`);
    const placeholder = rawPlaceholder !== `builder.placeholders.${cond.type}` ? rawPlaceholder : '';
    const dlId = `dl-${cond.id}`;
    const datalistHTML = Array.isArray(def.datalist)
      ? `<datalist id="${dlId}">${def.datalist.map(v => `<option value="${escapeHtml(v)}"></option>`).join('')}</datalist>`
      : '';

    return `
      <div class="condition-field condition-value-field">
        <label class="condition-label" for="${valId}">${valueLabel}</label>
        <input
          id="${valId}"
          type="text"
          class="condition-value-input md-input"
          placeholder="${escapeHtml(placeholder)}"
          value="${escapeHtml(cond.value || '')}"
          ${datalistHTML ? `list="${dlId}"` : ''}
        />
        ${datalistHTML}
      </div>
    `;
  }

  function buildConditionRowHTML(cond, isFirst = false) {
    const def = CONDITION_TYPES[cond.type] || CONDITION_TYPES.from;
    const typeId = `type-${cond.id}`;
    const noteText = def.hasValue && def.noteKey ? i18n.t(def.noteKey) : '';

    return `
      <div class="condition-logic ${isFirst ? 'hidden' : ''}">
        ${buildLogicToggleHTML(cond.logic, i18n.t('builder.logic_label'))}
      </div>
      <div class="condition-header">
        <div class="condition-field">
          <label class="condition-label" for="${typeId}">${escapeHtml(i18n.t('builder.condition.type_label'))}</label>
          <div class="select-wrapper">
            <select id="${typeId}" class="condition-type-select md-select">
              ${buildTypeOptionsHTML(cond.type)}
            </select>
          </div>
        </div>

        ${buildValueFieldHTML(cond, def)}

        <div class="condition-actions">
          <label class="negate-label md-chip ${cond.negate ? 'active' : ''}">
            <input type="checkbox" class="condition-negate" ${cond.negate ? 'checked' : ''} />
            <span>${escapeHtml(i18n.t('builder.condition.negate'))}</span>
          </label>
          <button type="button" class="icon-btn condition-remove"
            aria-label="${escapeHtml(i18n.t('builder.condition.remove'))}"
            title="${escapeHtml(i18n.t('builder.condition.remove'))}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      ${noteText ? `<p class="condition-note">${escapeHtml(noteText)}</p>` : ''}
    `;
  }

  const TEXT_VALUE_TYPES = new Set(['email', 'text', 'phrase', 'word', 'label']);

  function bindConditionRowEvents(row, cond, parentGroup, isFirst = false) {
    row.querySelector('.condition-type-select')?.addEventListener('change', e => {
      const prevDef = CONDITION_TYPES[cond.type];
      cond.type = e.target.value;
      const def = CONDITION_TYPES[cond.type];
      cond.meta = {};
      if (!def?.hasValue) {
        cond.value = '';
      } else if (def.valueType === 'select' && Array.isArray(def.options)) {
        cond.value = def.options[0];
      } else if (!(TEXT_VALUE_TYPES.has(prevDef?.valueType) && TEXT_VALUE_TYPES.has(def.valueType))) {
        cond.value = '';
      }
      row.innerHTML = buildConditionRowHTML(cond, isFirst);
      bindConditionRowEvents(row, cond, parentGroup, isFirst);
      row.querySelector('.condition-type-select')?.focus();
      renderPreview();
    });

    row.querySelector('.condition-value-input')?.addEventListener('input', e => {
      cond.value = e.target.value;
      renderPreview();
    });

    row.querySelector('.condition-value-select')?.addEventListener('change', e => {
      cond.value = e.target.value;
      renderPreview();
    });

    row.querySelector('.epoch-toggle-btn')?.addEventListener('click', () => {
      const trimmed = (cond.value || '').trim();
      const nextEpoch = !(Boolean(cond.meta?.epoch) || /^\d{9,11}$/.test(trimmed));
      cond.meta = { ...cond.meta, epoch: nextEpoch };

      if (nextEpoch) {
        const dm = trimmed.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
        if (dm) {
          const d = new Date(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]), 0, 0, 0);
          cond.value = !Number.isNaN(d.getTime()) ? String(Math.floor(d.getTime() / 1000)) : '';
        } else if (/^\d{9,11}$/.test(trimmed)) {
          cond.value = trimmed;
        } else {
          cond.value = '';
        }
      } else {
        if (/^\d{9,11}$/.test(trimmed)) {
          const d = new Date(Number(trimmed) * 1000);
          cond.value = !Number.isNaN(d.getTime())
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            : '';
        } else {
          const dm = trimmed.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
          cond.value = dm ? `${dm[1]}-${dm[2].padStart(2, '0')}-${dm[3].padStart(2, '0')}` : '';
        }
      }

      row.innerHTML = buildConditionRowHTML(cond, isFirst);
      bindConditionRowEvents(row, cond, parentGroup, isFirst);
      row.querySelector('.condition-value-input')?.focus();
      renderPreview();
    });

    const w1 = row.querySelector('.around-word1');
    const distInput = row.querySelector('.around-distance');
    const w2 = row.querySelector('.around-word2');
    const orderedInput = row.querySelector('.around-ordered');

    w1?.addEventListener('input', e => {
      cond.value = e.target.value;
      renderPreview();
    });
    distInput?.addEventListener('input', e => {
      cond.meta = { ...cond.meta, distance: Math.max(1, parseInt(e.target.value, 10) || 5) };
      renderPreview();
    });
    w2?.addEventListener('input', e => {
      cond.meta = { ...cond.meta, word2: e.target.value };
      renderPreview();
    });
    orderedInput?.addEventListener('change', e => {
      cond.meta = { ...cond.meta, ordered: e.target.checked };
      row.querySelector('.around-ordered-chip')?.classList.toggle('active', e.target.checked);
      renderPreview();
    });

    row.querySelector('.condition-negate')?.addEventListener('change', e => {
      cond.negate = e.target.checked;
      row.querySelector('.negate-label')?.classList.toggle('active', cond.negate);
      renderPreview();
    });

    row.querySelector('.condition-remove')?.addEventListener('click', () => {
      parentGroup.children = parentGroup.children.filter(c => c.id !== cond.id);
      if (parentGroup !== state.filterTree && parentGroup.children.length === 0) {
        state.filterTree.children = state.filterTree.children.filter(g => g.id !== parentGroup.id);
      }
      renderFilterTree();
      renderPreview();
    });

    row.querySelectorAll('.condition-logic .logic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cond.logic = btn.dataset.logic;
        row.querySelectorAll('.condition-logic .logic-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderPreview();
      });
    });
  }

  function createConditionRow(cond, parentGroup, isFirst = false) {
    const row = document.createElement('div');
    row.className = 'condition-row';
    row.setAttribute('role', 'listitem');
    row.dataset.id = cond.id;
    row.innerHTML = buildConditionRowHTML(cond, isFirst);
    bindConditionRowEvents(row, cond, parentGroup, isFirst);
    return row;
  }

  function createSubgroupCard(group, isFirstInRoot = false) {
    const card = document.createElement('div');
    card.className = 'filter-group';
    card.setAttribute('role', 'listitem');
    card.dataset.id = group.id;

    card.innerHTML = `
      <div class="group-header">
        <div class="group-logic-control ${isFirstInRoot ? 'hidden' : ''}">
          ${buildLogicToggleHTML(group.logic, i18n.t('builder.logic_label'))}
        </div>
        <div class="group-header-actions">
          <label class="negate-label md-chip ${group.negate ? 'active' : ''}">
            <input type="checkbox" class="group-negate" ${group.negate ? 'checked' : ''} />
            <span>${escapeHtml(i18n.t('builder.exclude_group'))}</span>
          </label>
          <button type="button" class="icon-btn group-remove"
            aria-label="${escapeHtml(i18n.t('builder.remove_group'))}"
            title="${escapeHtml(i18n.t('builder.remove_group'))}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="group-children" role="list"></div>
      <div class="group-footer">
        <button type="button" class="md-btn md-btn-tonal group-add-cond-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>${escapeHtml(i18n.t('builder.add_condition_to_group'))}</span>
        </button>
      </div>
    `;

    const childrenList = card.querySelector('.group-children');
    group.children.forEach((cond, idx) => {
      childrenList.appendChild(createConditionRow(cond, group, idx === 0));
    });

    card.querySelectorAll('.group-logic-control .logic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.logic = btn.dataset.logic;
        card.querySelectorAll('.group-logic-control .logic-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderPreview();
      });
    });

    card.querySelector('.group-negate')?.addEventListener('change', e => {
      group.negate = e.target.checked;
      card.querySelector('.group-header-actions .negate-label')?.classList.toggle('active', group.negate);
      renderPreview();
    });

    card.querySelector('.group-remove')?.addEventListener('click', () => {
      state.filterTree.children = state.filterTree.children.filter(c => c.id !== group.id);
      renderFilterTree();
      renderPreview();
    });

    card.querySelector('.group-add-cond-btn')?.addEventListener('click', () => {
      const cond = createCondition({ logic: 'AND' });
      const isFirst = group.children.length === 0;
      group.children.push(cond);
      const row = createConditionRow(cond, group, isFirst);
      childrenList.appendChild(row);
      row.querySelector('.condition-value-input, .condition-value-select, .condition-type-select')?.focus();
      renderPreview();
    });

    return card;
  }

  function renderFilterTree() {
    if (!els.conditionsList) return;
    const tree = getTree();
    els.conditionsList.innerHTML = '';

    tree.children.forEach((item, idx) => {
      const isFirst = idx === 0;
      if (item.kind === 'group') {
        els.conditionsList.appendChild(createSubgroupCard(item, isFirst));
      } else {
        els.conditionsList.appendChild(createConditionRow(item, tree, isFirst));
      }
    });

    const isEmpty = tree.children.length === 0;
    els.emptyState?.classList.toggle('hidden', !isEmpty);
    els.conditionsList.classList.toggle('hidden', isEmpty);
  }

  function applyOneClickOrNegationFix() {
    const tree = getTree();

    const extractNegatedFromList = (list) => {
      const runs = [];
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (i === 0 || item.logic !== 'OR') {
          runs.push([item]);
        } else {
          runs[runs.length - 1].push(item);
        }
      }

      const kept = [];
      const extracted = [];
      for (const run of runs) {
        if (run.length >= 2 && run.some(item => item.negate)) {
          let firstInKeptRun = true;
          for (const item of run) {
            if (item.negate) {
              item.logic = 'AND';
              extracted.push(item);
            } else {
              item.logic = firstInKeptRun ? 'AND' : 'OR';
              firstInKeptRun = false;
              kept.push(item);
            }
          }
        } else {
          kept.push(...run);
        }
      }

      if (kept.length > 0) {
        kept[0].logic = 'AND';
      }
      return { kept, extracted };
    };

    const nextRoot = [];
    for (const child of tree.children) {
      if (child.kind === 'group') {
        const { kept, extracted } = extractNegatedFromList(child.children);
        if (kept.length > 1) {
          child.children = kept;
          nextRoot.push(child);
        } else if (kept.length === 1) {
          kept[0].logic = child.logic;
          nextRoot.push(kept[0]);
        }
        nextRoot.push(...extracted);
      } else {
        nextRoot.push(child);
      }
    }

    const rootFixed = extractNegatedFromList(nextRoot);
    state.filterTree.children = [...rootFixed.kept, ...rootFixed.extracted];
    state.filterTree = normalizeFilterTree(state.filterTree);

    renderFilterTree();
    renderPreview();
  }

  function renderDiagnostics(analysis) {
    if (!els.diagnostics) return;
    const { warnings } = analysis;
    if (!warnings || warnings.length === 0) {
      els.diagnostics.innerHTML = '';
      els.diagnostics.classList.add('hidden');
      return;
    }

    els.diagnostics.classList.remove('hidden');
    els.diagnostics.innerHTML = '';

    warnings.forEach(w => {
      const box = document.createElement('div');
      box.className = `diagnostic-item diagnostic-${w.severity}`;
      const iconText = w.severity === 'error' ? '⛔' : w.severity === 'warn' ? '⚠' : 'ℹ';
      const msg = i18n.t(`diagnostics.${w.code}`, w.params);

      const iconSpan = document.createElement('span');
      iconSpan.className = 'diagnostic-icon';
      iconSpan.setAttribute('aria-hidden', 'true');
      iconSpan.textContent = iconText;

      const textSpan = document.createElement('span');
      textSpan.className = 'diagnostic-text';
      textSpan.textContent = msg;

      box.appendChild(iconSpan);
      box.appendChild(textSpan);

      if (w.code === 'or_negation_trap' && !isAdvancedMode) {
        const fixBtn = document.createElement('button');
        fixBtn.type = 'button';
        fixBtn.className = 'md-btn md-btn-tonal diagnostic-fix-btn';
        fixBtn.textContent = i18n.t('diagnostics.fix_or_negation_btn');
        fixBtn.addEventListener('click', applyOneClickOrNegationFix);
        box.appendChild(fixBtn);
      }

      els.diagnostics.appendChild(box);
    });
  }

  function renderPreview() {
    const query = isAdvancedMode ? (state.currentQuery || '') : buildQuery(getTree());

    if (!query) {
      els.queryOutput?.classList.add('hidden');
      els.queryEmpty?.classList.remove('hidden');
      els.summaryText?.classList.add('hidden');
      els.summaryEmpty?.classList.remove('hidden');
      if (els.diagnostics) {
        els.diagnostics.innerHTML = '';
        els.diagnostics.classList.add('hidden');
      }
      state.currentQuery = '';
      syncStateToURL();
      return;
    }

    state.currentQuery = query;
    const analysisTree = isAdvancedMode ? parseQuery(query) : getTree();
    const analysis = analyzeQuery(analysisTree, query);

    els.queryEmpty?.classList.add('hidden');
    els.queryOutput?.classList.remove('hidden');
    if (els.queryText) els.queryText.textContent = query;

    if (els.charCount) {
      els.charCount.textContent = i18n.t('preview.char_count', { count: analysis.charCount });
      els.charCount.classList.toggle('char-warn', analysis.charSeverity === 'warn');
      els.charCount.classList.toggle('char-error', analysis.charSeverity === 'error');
    }

    if (els.openGmailBtn) {
      els.openGmailBtn.href = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`;
    }

    renderDiagnostics(analysis);

    const summary = buildSummary(analysisTree, i18n.t.bind(i18n));
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

    if (isAdvancedMode && els.advancedInput && els.advancedInput.value !== query) {
      els.advancedInput.value = query;
    }

    syncStateToURL();
  }

  function serializeNode(node) {
    if (node.kind === 'group') {
      return {
        k: 'g',
        l: node.logic === 'OR' ? 1 : 0,
        gl: node.groupLogic === 'OR' ? 1 : 0,
        n: node.negate ? 1 : 0,
        c: node.children.map(serializeNode),
      };
    }
    const obj = {
      t: node.type,
      v: node.value || '',
      n: node.negate ? 1 : 0,
      l: node.logic === 'OR' ? 1 : 0,
    };
    if (node.meta && Object.keys(node.meta).length > 0) obj.m = node.meta;
    return obj;
  }

  function hydrateNode(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (raw.k === 'g') {
      const sub = Array.isArray(raw.c) ? raw.c.map(hydrateNode).filter(Boolean) : [];
      const groupDefault = raw.gl !== undefined ? (raw.gl ? 'OR' : 'AND') : (raw.l ? 'OR' : 'AND');
      const combineLogic = raw.gl !== undefined ? (raw.l ? 'OR' : 'AND') : 'AND';
      return createGroup(groupDefault, sub, Boolean(raw.n), null, combineLogic);
    }
    return createCondition({
      type: raw.t || 'from',
      value: raw.v || '',
      negate: Boolean(raw.n),
      logic: raw.l === undefined ? undefined : (raw.l ? 'OR' : 'AND'),
      meta: raw.m || {},
    });
  }

  function syncStateToURL() {
    const baseHash = window.location.hash.split('?')[0] || '#builder';

    if (isAdvancedMode) {
      const qRaw = (state.currentQuery || '').trim();
      if (!qRaw) {
        window.history.replaceState(null, '', window.location.pathname + baseHash);
        return;
      }
      try {
        const b64 = btoa(encodeURIComponent(qRaw));
        window.history.replaceState(null, '', `${baseHash}?raw=${b64}`);
      } catch {}
      return;
    }

    const tree = getTree();
    if (!hasAnyCondition(tree)) {
      window.history.replaceState(null, '', window.location.pathname + baseHash);
      return;
    }

    try {
      const payload = {
        v: 2,
        l: tree.logic === 'OR' ? 1 : 0,
        c: tree.children.map(serializeNode),
      };
      const b64 = btoa(encodeURIComponent(JSON.stringify(payload)));
      window.history.replaceState(null, '', `${baseHash}?q=${b64}`);
    } catch {}
  }

  function loadStateFromURL() {
    try {
      const hash = window.location.hash;
      if (!hash.includes('?')) return false;
      const params = new URLSearchParams(hash.split('?')[1]);

      const rawParam = params.get('raw');
      if (rawParam) {
        const decoded = decodeURIComponent(atob(rawParam));
        state.currentQuery = decoded;
        state.filterTree = parseQuery(decoded);
        isAdvancedMode = true;
        els.visualBuilder?.classList.add('hidden');
        els.advancedEditor?.classList.remove('hidden');
        if (els.advancedInput) els.advancedInput.value = decoded;
        const label = els.advancedToggle?.querySelector('[data-i18n]');
        if (label) {
          label.dataset.i18n = 'builder.visual_mode';
          label.textContent = i18n.t('builder.visual_mode');
        }
        return true;
      }

      const qParam = params.get('q');
      if (!qParam) return false;
      const parsed = JSON.parse(decodeURIComponent(atob(qParam)));

      if (Array.isArray(parsed)) {
        state.filterTree = normalizeFilterTree(parsed);
        return true;
      }

      if (parsed && parsed.v === 2 && Array.isArray(parsed.c)) {
        const children = parsed.c.map(hydrateNode).filter(Boolean);
        state.filterTree = normalizeFilterTree(
          createRootGroup(parsed.l ? 'OR' : 'AND', children)
        );
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  function initToast() {
    const toast = els.toast;
    if (!toast || state.hideSupportBanner) return;
    if (safeStorageGet('supportDismissed') === 'permanent') return;

    function renderToast() {
      const titleEl = toast.querySelector('.toast-title');
      const descEl = toast.querySelector('.toast-desc');
      const linksEl = toast.querySelector('.toast-links');
      const dismissEl = toast.querySelector('.toast-dismiss');

      if (titleEl) titleEl.textContent = i18n.t('support.toast_title');
      if (descEl) descEl.textContent = i18n.t('support.toast_desc');
      if (dismissEl) dismissEl.textContent = i18n.t('support.dismiss_permanent');

      if (linksEl) {
        linksEl.innerHTML = '';
        const btn = document.createElement('a');
        btn.href = '#';
        btn.className = 'toast-cta-link';
        btn.textContent = i18n.t('support.toast_cta');
        btn.addEventListener('click', openDonationModal);
        linksEl.appendChild(btn);
      }
    }

    renderToast();
    i18n.onChange(() => renderToast());

    function showToast() {
      toast.classList.add('toast-visible');
    }

    function hideToast(permanent = false) {
      toast.classList.remove('toast-visible');
      if (permanent) {
        safeStorageSet('supportDismissed', 'permanent');
        showDismissConfirm();
      }
    }

    function showDismissConfirm() {
      const overlay = document.getElementById('dismiss-confirm-overlay');
      const titleEl = document.getElementById('dismiss-confirm-title');
      const descEl = document.getElementById('dismiss-confirm-desc');
      const okBtn = document.getElementById('dismiss-confirm-ok');
      if (!overlay) return;

      titleEl.textContent = i18n.t('support.dismiss_dialog_title');
      descEl.textContent = i18n.t('support.dismiss_dialog_desc');
      okBtn.textContent = i18n.t('support.dismiss_dialog_ok');

      overlay.classList.remove('hidden');

      function close() {
        overlay.classList.add('hidden');
        okBtn.removeEventListener('click', close);
        overlay.removeEventListener('click', handleOverlayClick);
        document.removeEventListener('keydown', handleEscape);
      }
      function handleOverlayClick(e) {
        if (e.target === overlay) close();
      }
      function handleEscape(e) {
        if (e.key === 'Escape') close();
      }
      okBtn.addEventListener('click', close);
      overlay.addEventListener('click', handleOverlayClick);
      document.addEventListener('keydown', handleEscape);
    }

    setTimeout(showToast, 5000);

    toast.querySelector('.toast-close-btn')?.addEventListener('click', () => hideToast(false));
    toast.querySelector('.toast-dismiss')?.addEventListener('click', () => hideToast(true));
  }

  function setAdvancedMode(enabled) {
    isAdvancedMode = enabled;
    els.visualBuilder?.classList.toggle('hidden', isAdvancedMode);
    els.advancedEditor?.classList.toggle('hidden', !isAdvancedMode);

    const label = els.advancedToggle?.querySelector('[data-i18n]');
    if (label) {
      label.dataset.i18n = isAdvancedMode ? 'builder.visual_mode' : 'builder.advanced_mode';
      label.textContent = i18n.t(label.dataset.i18n);
    }
  }

  function bindGlobalEvents() {
    els.addBtn?.addEventListener('click', () => {
      const tree = getTree();
      const cond = createCondition({ logic: 'AND' });
      tree.children.push(cond);
      renderFilterTree();
      renderPreview();
      const newRow = els.conditionsList?.querySelector(`.condition-row[data-id="${cond.id}"]`);
      newRow?.querySelector('.condition-value-input, .condition-type-select')?.focus();
    });

    els.addGroupBtn?.addEventListener('click', () => {
      const tree = getTree();
      const initialCond = createCondition({ logic: 'AND' });
      const grp = createGroup('AND', [initialCond], false, null, 'AND');
      tree.children.push(grp);
      renderFilterTree();
      renderPreview();
      const newRow = els.conditionsList?.querySelector(`.condition-row[data-id="${initialCond.id}"]`);
      newRow?.querySelector('.condition-value-input, .condition-type-select')?.focus();
    });

    els.clearBtn?.addEventListener('click', () => {
      state.filterTree = createRootGroup('AND', []);
      renderFilterTree();
      renderPreview();
    });

    els.copyBtn?.addEventListener('click', async () => {
      if (!state.currentQuery) return;
      const ok = await copyTextSafe(state.currentQuery);
      if (!ok) return;
      const label = els.copyBtn.querySelector('[data-i18n]');
      if (label) {
        label.textContent = i18n.t('preview.copied');
        setTimeout(() => { label.textContent = i18n.t('preview.copy'); }, 2000);
      }
    });

    els.shareBtn?.addEventListener('click', async () => {
      const ok = await copyTextSafe(window.location.href);
      if (!ok) return;
      const label = els.shareBtn.querySelector('[data-i18n]');
      if (label) {
        label.textContent = i18n.t('preview.share_copied');
        setTimeout(() => { label.textContent = i18n.t('preview.share'); }, 2000);
      }
    });

    els.saveBtn?.addEventListener('click', () => {
      if (!state.currentQuery || !state.currentQuery.trim()) return;
      showSaveDialog();
    });

    els.advancedToggle?.addEventListener('click', () => {
      const next = !isAdvancedMode;
      setAdvancedMode(next);

      if (next && els.advancedInput) {
        els.advancedInput.value = state.currentQuery;
        renderPreview();
      } else if (!next && els.advancedInput) {
        state.filterTree = parseQuery(els.advancedInput.value);
        renderFilterTree();
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
      if (deps.navigateToSection) deps.navigateToSection('guide');
      window.location.hash = '#guide';
    });

    els.saveConfirm?.addEventListener('click', doSave);
    els.saveCancel?.addEventListener('click', doCancel);
    els.saveOverlay?.addEventListener('click', e => {
      if (e.target === els.saveOverlay) doCancel();
    });
    els.saveNameInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') doSave();
      if (e.key === 'Escape') doCancel();
    });
  }

  function loadFilter(filterData) {
    setAdvancedMode(false);

    if (filterData && filterData.isRaw && filterData.query) {
      const parsed = parseQuery(filterData.query);
      if (!hasAnyCondition(parsed)) {
        state.currentQuery = filterData.query;
        setAdvancedMode(true);
        if (els.advancedInput) els.advancedInput.value = filterData.query;
      } else {
        state.filterTree = parsed;
      }
    } else {
      const rawTree = filterData?.tree || filterData?.conditions || filterData;
      state.filterTree = normalizeFilterTree(rawTree);
    }

    if (deps.navigateToSection) {
      deps.navigateToSection('builder');
    }
    history.replaceState(null, '', '#builder');

    renderFilterTree();
    renderPreview();
    document.getElementById('section-builder')?.scrollIntoView({ behavior: 'smooth' });
  }

  return {
    init() {
      buildLangSelect();
      bindGlobalEvents();
      loadStateFromURL();
      translateUI();
      initToast();
      i18n.onChange(() => translateUI());
    },
    loadFilter,
    loadConditions: loadFilter,
    renderPreview,
    initPWAInstall,
    showDeleteConfirmation,
  };
}
