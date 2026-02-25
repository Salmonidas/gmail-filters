/**
 * query-builder.js – Pure functions for building Gmail search queries.
 *
 * All functions are stateless: they receive condition objects and return strings.
 * Conditions have this shape:
 *   {
 *     id:      string,   // unique identifier
 *     type:    string,   // one of CONDITION_TYPES keys
 *     value:   string,   // user-provided value (may be empty for boolean types)
 *     negate:  boolean,  // prefix with - (NOT)
 *     logic:   'AND'|'OR', // how to combine with the previous condition
 *   }
 *
 * To add a new condition type:
 *   1. Add a key to CONDITION_TYPES with { label, hasValue, valueType, operator }.
 *   2. Optionally handle special rendering in _buildFragment().
 */

export const CONDITION_TYPES = {
  from:         { hasValue: true,  valueType: 'email',  operator: 'from:' },
  to:           { hasValue: true,  valueType: 'email',  operator: 'to:' },
  cc:           { hasValue: true,  valueType: 'email',  operator: 'cc:' },
  bcc:          { hasValue: true,  valueType: 'email',  operator: 'bcc:' },
  subject:      { hasValue: true,  valueType: 'text',   operator: 'subject:' },
  body:         { hasValue: true,  valueType: 'text',   operator: '' },
  has_attachment:{ hasValue: false, valueType: null,    operator: 'has:attachment' },
  filename:     { hasValue: true,  valueType: 'text',   operator: 'filename:' },
  label:        { hasValue: true,  valueType: 'text',   operator: 'label:' },
  in:           { hasValue: true,  valueType: 'text',   operator: 'in:' },
  is_read:      { hasValue: false, valueType: null,     operator: 'is:read' },
  is_unread:    { hasValue: false, valueType: null,     operator: 'is:unread' },
  is_starred:   { hasValue: false, valueType: null,     operator: 'is:starred' },
  is_important: { hasValue: false, valueType: null,     operator: 'is:important' },
  date_after:   { hasValue: true,  valueType: 'date',   operator: 'after:' },
  date_before:  { hasValue: true,  valueType: 'date',   operator: 'before:' },
  newer_than:   { hasValue: true,  valueType: 'text',   operator: 'newer_than:' },
  older_than:   { hasValue: true,  valueType: 'text',   operator: 'older_than:' },
  size_larger:  { hasValue: true,  valueType: 'text',   operator: 'larger:' },
  size_smaller: { hasValue: true,  valueType: 'text',   operator: 'smaller:' },
};

/**
 * Wrap a value in parentheses only when it contains a space or OR.
 */
function _wrap(value) {
  const needsWrap = /\s|OR/i.test(value);
  return needsWrap ? `(${value})` : value;
}

/**
 * Format a date input value (YYYY-MM-DD) to Gmail's expected format (YYYY/MM/DD).
 */
function _formatDate(value) {
  return value.replace(/-/g, '/');
}

/**
 * Build the Gmail query fragment for a single condition.
 * Returns an empty string if the condition is incomplete.
 */
function _buildFragment(condition) {
  const { type, value, negate } = condition;
  const def = CONDITION_TYPES[type];
  if (!def) return '';

  let fragment = '';

  if (!def.hasValue) {
    fragment = def.operator;
  } else {
    const trimmed = (value || '').trim();
    if (!trimmed) return '';

    let formatted = trimmed;
    if (def.valueType === 'date') formatted = _formatDate(trimmed);

    fragment = `${def.operator}${_wrap(formatted)}`;
  }

  return negate ? `-${fragment}` : fragment;
}

/**
 * Build the full Gmail query from an array of conditions
 * and a global default logic operator ('AND' | 'OR').
 *
 * @param {Array}  conditions – array of condition objects
 * @param {boolean} groupAll  – wrap the whole query in parentheses (for OR groups)
 * @returns {string} the Gmail search query
 */
export function buildQuery(conditions, groupAll = false) {
  if (!conditions || conditions.length === 0) return '';

  const parts = [];

  conditions.forEach((cond, idx) => {
    const fragment = _buildFragment(cond);
    if (!fragment) return;

    if (idx === 0 || parts.length === 0) {
      parts.push(fragment);
    } else {
      const logic = cond.logic || 'AND';
      if (logic === 'OR') {
        parts.push(`OR ${fragment}`);
      } else {
        parts.push(fragment);
      }
    }
  });

  const query = parts.join(' ');
  return groupAll ? `(${query})` : query;
}

/**
 * Parse a raw query string into a conditions array (best-effort).
 * Useful for the "manual edit → back to visual" flow.
 *
 * Note: This is a basic parser and may not handle all edge cases perfectly.
 * It is intentionally limited to the operators in CONDITION_TYPES.
 */
export function parseQuery(raw) {
  if (!raw || !raw.trim()) return [];
  const conditions = [];
  const tokenRegex = /(-?)(\w[\w:]*:?)\(?([^()]*)\)?/g;
  let match;
  while ((match = tokenRegex.exec(raw)) !== null) {
    const [, neg, op, val] = match;
    const cleaned = op.replace(/:$/, '');
    const entry = Object.entries(CONDITION_TYPES).find(([, def]) =>
      def.operator.replace(/:$/, '') === cleaned ||
      def.operator === `${cleaned}:` ||
      def.operator === cleaned
    );
    if (entry) {
      conditions.push({
        id: crypto.randomUUID(),
        type: entry[0],
        value: entry[1].hasValue ? val.trim() : '',
        negate: neg === '-',
        logic: 'AND',
      });
    }
  }
  return conditions;
}

/**
 * Generate a plain-English summary of what a query does.
 * Depends on the i18n module for locale-aware descriptions.
 *
 * @param {Array}  conditions
 * @param {Function} t – i18n translation function
 * @returns {string}
 */
export function buildSummary(conditions, t) {
  const valid = conditions.map(c => ({
    ...c,
    fragment: _buildFragment(c),
  })).filter(c => c.fragment);

  if (valid.length === 0) return '';

  const prefix = t('summary.prefix');
  const descriptions = valid.map((c, idx) => {
    const keyBase = `summary.${c.type}`;
    let desc = t(keyBase, { value: c.value });
    if (c.negate) desc = `${t('summary.negate_prefix')} ${desc}`;

    if (idx > 0) {
      const connector = c.logic === 'OR'
        ? t('summary.or_connector')
        : t('summary.and_connector');
      return connector + desc;
    }
    return desc;
  });

  return `${prefix} ${descriptions.join('')}.`;
}
