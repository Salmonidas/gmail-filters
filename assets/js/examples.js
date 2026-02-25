/**
 * examples.js – Preset example filter definitions and loader UI.
 *
 * Each example corresponds to an entry in the locale file under examples.items[].
 * The `conditions` array represents the pre-built state for the visual builder.
 *
 * To add a new example:
 *   1. Add an entry to the examples.items array in each locale file.
 *   2. Add a matching entry here in EXAMPLE_CONDITIONS with the same `id`.
 */

export const EXAMPLE_CONDITIONS = {
  invoices_last_month: [
    { type: 'from',        value: 'billing@acme.com OR invoices@supplier.com', negate: false, logic: 'AND' },
    { type: 'subject',     value: 'invoice -draft',                             negate: false, logic: 'AND' },
    { type: 'newer_than',  value: '1m',                                         negate: false, logic: 'AND' },
  ],
  meeting_cc: [
    { type: 'cc',      value: 'me',                  negate: false, logic: 'AND' },
    { type: 'subject', value: 'meeting -cancelled',  negate: false, logic: 'AND' },
  ],
  pdf_attachments: [
    { type: 'from',           value: 'reports@company.com', negate: false, logic: 'AND' },
    { type: 'has_attachment', value: '',                     negate: false, logic: 'AND' },
    { type: 'filename',       value: 'pdf',                 negate: false, logic: 'AND' },
  ],
  unread_starred: [
    { type: 'is_unread',  value: '', negate: false, logic: 'AND' },
    { type: 'is_starred', value: '', negate: false, logic: 'AND' },
  ],
  newsletter_unsubscribe: [
    { type: 'in',   value: 'promotions', negate: false, logic: 'AND' },
    { type: 'body', value: 'unsubscribe', negate: false, logic: 'AND' },
  ],
};

/**
 * Render the examples section cards.
 *
 * @param {HTMLElement} container  – the examples grid element
 * @param {Function} t             – i18n translation function
 * @param {Function} onLoad        – callback(conditions[]) when user clicks "Load"
 */
export function renderExamples(container, t, onLoad) {
  if (!container) return;
  const items = t('examples.items');
  if (!Array.isArray(items)) return;

  container.innerHTML = '';

  items.forEach(item => {
    const conditions = EXAMPLE_CONDITIONS[item.id] || [];
    const card = document.createElement('div');
    card.className = 'example-card';
    card.innerHTML = `
      <div class="example-card-body">
        <h3 class="example-card-title">${item.title}</h3>
        <p class="example-card-desc">${item.description}</p>
        <code class="example-card-query">${item.query}</code>
      </div>
      <div class="example-card-footer">
        <button class="md-btn md-btn-tonal example-load-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          ${t('examples.load')}
        </button>
      </div>
    `;
    card.querySelector('.example-load-btn').addEventListener('click', () => {
      onLoad(conditions);
    });
    container.appendChild(card);
  });
}

/**
 * Render the help / operator reference section.
 *
 * @param {HTMLElement} container
 * @param {Function} t
 */
export function renderHelp(container, t) {
  if (!container) return;
  const operators = t('help.operators');
  const tips = t('help.tips');

  if (Array.isArray(operators)) {
    const tbody = container.querySelector('.help-operators-tbody');
    if (tbody) {
      tbody.innerHTML = operators.map(row =>
        `<tr><td class="op-cell"><code>${row.op}</code></td><td>${row.desc}</td></tr>`
      ).join('');
    }
  }

  if (Array.isArray(tips)) {
    const tipsList = container.querySelector('.help-tips-list');
    if (tipsList) {
      tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
    }
  }
}

/**
 * Render the step-by-step guide section (how to apply a filter in Gmail).
 *
 * @param {HTMLElement} container
 * @param {Function} t
 */
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
          <span class="guide-tip-label">⚠ ${t('guide.tip_label')}</span>
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
          <h2 id="guide-heading" class="card-title">${t('guide.title')}</h2>
        </div>
      </div>
      <div class="card-body">
        <p class="section-intro">${t('guide.intro')}</p>
        <div class="guide-steps">
          ${stepsHTML}
        </div>
        <div class="guide-done-card" role="status">
          <span class="guide-done-icon">✅</span>
          <p>${t('guide.done')}</p>
        </div>
      </div>
    </div>
  `;
} 
