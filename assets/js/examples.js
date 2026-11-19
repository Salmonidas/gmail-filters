import {
  buildQuery,
  normalizeFilterTree,
  createRootGroup,
  createGroup,
  createCondition,
} from './query-builder.js';

export const EXAMPLE_CONDITIONS = {
  invoices_last_month: createRootGroup('AND', [
    createCondition({ type: 'from', value: 'billing@acme.com OR invoices@supplier.com' }),
    createCondition({ type: 'subject', value: 'invoice' }),
    createCondition({ type: 'subject', value: 'draft', negate: true }),
    createCondition({ type: 'newer_than', value: '1m' }),
  ]),
  meeting_cc: createRootGroup('AND', [
    createCondition({ type: 'cc', value: 'me' }),
    createCondition({ type: 'subject', value: 'meeting' }),
    createCondition({ type: 'subject', value: 'cancelled', negate: true }),
  ]),
  pdf_attachments: createRootGroup('AND', [
    createCondition({ type: 'from', value: 'reports@company.com' }),
    createCondition({ type: 'has_attachment' }),
    createCondition({ type: 'filename', value: 'pdf' }),
  ]),
  unread_starred: createRootGroup('AND', [
    createCondition({ type: 'is_unread' }),
    createCondition({ type: 'is_starred' }),
  ]),
  newsletter_unsubscribe: createRootGroup('AND', [
    createCondition({ type: 'category', value: 'promotions' }),
    createCondition({ type: 'body', value: 'unsubscribe' }),
  ]),
  or_with_exclusion: createRootGroup('AND', [
    createGroup('OR', [
      createCondition({ type: 'label', value: 'work' }),
      createCondition({ type: 'subject', value: 'urgent', logic: 'OR' }),
    ]),
    createCondition({ type: 'subject', value: 'Day', negate: true, logic: 'AND' }),
  ]),
  calendar_rsvps: createRootGroup('OR', [
    createCondition({ type: 'header_calendar', value: 'rsvpAccepted' }),
    createCondition({ type: 'header_calendar', value: 'rsvpDeclined', logic: 'OR' }),
    createCondition({ type: 'header_calendar', value: 'rsvpTentative', logic: 'OR' }),
  ]),
  bulk_unsub_cleanup: createRootGroup('AND', [
    createCondition({ type: 'label', value: '^unsub' }),
    createCondition({ type: 'older_than', value: '30d' }),
  ]),
  direct_to_me: createRootGroup('AND', [
    createCondition({ type: 'to', value: 'me' }),
    createCondition({ type: 'cc', value: 'me', negate: true }),
  ]),
  received_bcc: createRootGroup('AND', [
    createCondition({ type: 'deliveredto', value: 'you@gmail.com' }),
    createCondition({ type: 'to', value: 'me', negate: true }),
    createCondition({ type: 'cc', value: 'me', negate: true }),
  ]),
  unlabeled_drive: createRootGroup('AND', [
    createCondition({ type: 'has_drive' }),
    createCondition({ type: 'has_nouserlabels' }),
  ]),
};

export function renderExamples(container, t, onLoad) {
  if (!container) return;
  const items = t('examples.items');
  if (!Array.isArray(items)) return;

  container.innerHTML = '';

  items.forEach(item => {
    const presetTree = EXAMPLE_CONDITIONS[item.id];
    const computedQuery = presetTree ? buildQuery(normalizeFilterTree(presetTree)) : (item.query || '');

    const card = document.createElement('div');
    card.className = 'example-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <div class="example-card-body">
        <h3 class="example-card-title">${escapeHtml(item.title)}</h3>
        <p class="example-card-desc">${escapeHtml(item.description)}</p>
        <code class="example-card-query">${escapeHtml(computedQuery)}</code>
      </div>
      <div class="example-card-footer">
        <button type="button" class="md-btn md-btn-tonal example-load-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          ${escapeHtml(t('examples.load'))}
        </button>
      </div>
    `;
    card.querySelector('.example-load-btn').addEventListener('click', () => {
      if (presetTree) onLoad(presetTree);
    });
    container.appendChild(card);
  });
}

export function renderSavedFilters(container, savedItems, t, onLoad, onDelete) {
  if (!container) return;
  const cardContainer = document.getElementById('saved-filters-card');
  if (cardContainer) cardContainer.style.display = 'block';

  if (!savedItems || savedItems.length === 0) {
    container.innerHTML = `
      <div class="library-empty-card">
        <div class="library-empty-icon" aria-hidden="true">📂</div>
        <h3 data-i18n="saved_filters.empty_library_title">${escapeHtml(t('saved_filters.empty_library_title'))}</h3>
        <p data-i18n="saved_filters.empty_library_desc">${escapeHtml(t('saved_filters.empty_library_desc'))}</p>
        <button type="button" class="md-btn md-btn-tonal" id="btn-library-to-builder" style="margin-top: 16px;">
          ${escapeHtml(t('saved_filters.empty_library_cta'))}
        </button>
      </div>
    `;
    container.querySelector('#btn-library-to-builder')?.addEventListener('click', () => {
      document.querySelector('[data-section="builder"]')?.click();
    });
    return;
  }

  container.innerHTML = '';

  savedItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'example-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <div class="example-card-body">
        <h3 class="example-card-title">${escapeHtml(item.title)}</h3>
        <code class="example-card-query">${escapeHtml(item.query)}</code>
      </div>
      <div class="example-card-footer" style="display: flex; gap: 8px;">
        <button type="button" class="md-btn md-btn-tonal example-load-btn" style="flex: 1; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          ${escapeHtml(t('examples.load'))}
        </button>
        <button type="button" class="md-btn md-btn-danger example-delete-btn" aria-label="${escapeHtml(t('saved_filters.delete'))}" title="${escapeHtml(t('saved_filters.delete'))}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon" style="margin: 0;" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </button>
      </div>
    `;
    card.querySelector('.example-load-btn').addEventListener('click', () => onLoad(item));
    card.querySelector('.example-delete-btn').addEventListener('click', e => {
      e.stopPropagation();
      onDelete(item.id);
    });
    container.appendChild(card);
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderHelp(container, t) {
  if (!container) return;
  const operators = t('help.operators');
  const tips = t('help.tips');

  if (Array.isArray(operators)) {
    const tbody = container.querySelector('.help-operators-tbody');
    if (tbody) {
      tbody.innerHTML = operators
        .map(row => `<tr><td class="op-cell"><code>${escapeHtml(row.op)}</code></td><td>${escapeHtml(row.desc)}</td></tr>`)
        .join('');
    }
  }

  if (Array.isArray(tips)) {
    const tipsList = container.querySelector('.help-tips-list');
    if (tipsList) {
      tipsList.innerHTML = tips.map(tip => `<li>${escapeHtml(tip)}</li>`).join('');
    }
  }
}

export function renderGuide(container, t) {
  if (!container) return;

  const STEPS = [
    { titleKey: 'guide.step1_title', descKey: 'guide.step1_desc', tip: null },
    { titleKey: 'guide.step2_title', descKey: 'guide.step2_desc', tip: null },
    { titleKey: 'guide.step3_title', descKey: 'guide.step3_desc', tip: null },
    { titleKey: 'guide.step4_title', descKey: 'guide.step4_desc', tip: null },
    { titleKey: 'guide.step5_title', descKey: 'guide.step5_desc', tip: 'guide.step5_tip' },
    { titleKey: 'guide.step6_title', descKey: 'guide.step6_desc', tip: null },
    { titleKey: 'guide.step7_title', descKey: 'guide.step7_desc', tip: null },
  ];

  const stepsHTML = STEPS.map((step, i) => `
    <div class="guide-step">
      <div class="guide-step-number">${i + 1}</div>
      <div class="guide-step-content">
        <h3 class="guide-step-title">${t(step.titleKey)}</h3>
        <p class="guide-step-desc">${t(step.descKey)}</p>
        ${step.tip ? `
        <div class="guide-tip-callout" role="note">
          <span class="guide-tip-label">⚠ ${escapeHtml(t('guide.tip_label'))}</span>
          <p>${t(step.tip)}</p>
        </div>` : ''}
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="md-card">
      <div class="card-header">
        <div class="card-header-left">
          <div class="card-header-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h2 id="guide-heading" class="card-title">${escapeHtml(t('guide.title'))}</h2>
        </div>
      </div>
      <div class="card-body">
        <p class="section-intro">${escapeHtml(t('guide.intro'))}</p>
        <div class="guide-steps">
          ${stepsHTML}
        </div>
        <div class="guide-done-card" role="status">
          <span class="guide-done-icon" aria-hidden="true">✅</span>
          <p>${escapeHtml(t('guide.done'))}</p>
        </div>
      </div>
    </div>
  `;
}
