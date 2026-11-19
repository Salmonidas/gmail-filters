/**
 * query-builder.js – Stateless Gmail query engine (v2 tree + flat compatibility).
 */

export const CONDITION_GROUPS = [
  'people',
  'content',
  'attachments',
  'calendar_headers',
  'organization',
  'status',
  'date_size',
];

export const CONDITION_TYPES = {
  from: { group: 'people', hasValue: true, valueType: 'email', operator: 'from:', filterSafety: 'safe' },
  to: { group: 'people', hasValue: true, valueType: 'email', operator: 'to:', filterSafety: 'safe', noteKey: 'builder.to_note' },
  cc: { group: 'people', hasValue: true, valueType: 'email', operator: 'cc:', filterSafety: 'safe' },
  bcc: { group: 'people', hasValue: true, valueType: 'email', operator: 'bcc:', filterSafety: 'caution', noteKey: 'builder.bcc_note' },
  deliveredto: { group: 'people', hasValue: true, valueType: 'email', operator: 'deliveredto:', filterSafety: 'safe', noteKey: 'builder.deliveredto_note' },
  list: { group: 'people', hasValue: true, valueType: 'text', operator: 'list:', filterSafety: 'safe' },

  subject: { group: 'content', hasValue: true, valueType: 'text', operator: 'subject:', filterSafety: 'safe' },
  body: { group: 'content', hasValue: true, valueType: 'text', operator: '', filterSafety: 'safe' },
  exact_phrase: { group: 'content', hasValue: true, valueType: 'phrase', operator: '', filterSafety: 'safe', noteKey: 'builder.exact_phrase_note' },
  exact_word: { group: 'content', hasValue: true, valueType: 'word', operator: '+', filterSafety: 'safe', noteKey: 'builder.exact_word_note' },
  around: { group: 'content', hasValue: true, valueType: 'around', operator: 'AROUND', filterSafety: 'safe', noteKey: 'builder.around_note' },

  has_attachment: { group: 'attachments', hasValue: false, valueType: null, operator: 'has:attachment', filterSafety: 'safe', noteKey: 'builder.has_attachment_note' },
  filename: { group: 'attachments', hasValue: true, valueType: 'text', operator: 'filename:', filterSafety: 'safe', datalist: ['pdf', 'docx', 'xlsx', 'pptx', 'csv', 'zip', 'ics', 'png', 'jpg'] },
  has_drive: { group: 'attachments', hasValue: false, valueType: null, operator: 'has:drive', filterSafety: 'safe' },
  has_document: { group: 'attachments', hasValue: false, valueType: null, operator: 'has:document', filterSafety: 'safe' },
  has_spreadsheet: { group: 'attachments', hasValue: false, valueType: null, operator: 'has:spreadsheet', filterSafety: 'safe' },
  has_presentation: { group: 'attachments', hasValue: false, valueType: null, operator: 'has:presentation', filterSafety: 'safe' },
  has_youtube: { group: 'attachments', hasValue: false, valueType: null, operator: 'has:youtube', filterSafety: 'safe' },

  header_calendar: {
    group: 'calendar_headers',
    hasValue: true,
    valueType: 'select',
    operator: 'header:X-Google-Calendar-Notification:',
    filterSafety: 'safe',
    noteKey: 'builder.header_calendar_note',
    options: [
      'eventCreated',
      'eventCancelled',
      'timeOrRecurrenceUpdated',
      'roomAdded',
      'roomRemoved',
      'locationUpdated',
      'titleUpdated',
      'descriptionUpdated',
      'attachmentAdded',
      'attachmentRemoved',
      'conferenceUpdated',
      'rsvpAccepted',
      'rsvpDeclined',
      'rsvpTentative',
      'rsvpWithNote',
      'rsvpProposeNewTime',
      'roomAccepted',
      'roomDeclined',
    ],
  },
  rfc822msgid: { group: 'calendar_headers', hasValue: true, valueType: 'text', operator: 'rfc822msgid:', filterSafety: 'safe' },

  category: {
    group: 'organization',
    hasValue: true,
    valueType: 'select',
    operator: 'category:',
    filterSafety: 'caution',
    noteKey: 'builder.category_note',
    options: ['primary', 'social', 'promotions', 'updates', 'forums', 'reservations', 'purchases'],
  },
  label: { group: 'organization', hasValue: true, valueType: 'label', operator: 'label:', filterSafety: 'search_only', noteKey: 'builder.label_note' },
  in: {
    group: 'organization',
    hasValue: true,
    valueType: 'text',
    operator: 'in:',
    filterSafety: 'search_only',
    noteKey: 'builder.in_note',
    datalist: ['inbox', 'sent', 'drafts', 'spam', 'trash', 'anywhere', 'snoozed', 'scheduled', 'chats'],
  },
  has_userlabels: { group: 'organization', hasValue: false, valueType: null, operator: 'has:userlabels', filterSafety: 'search_only' },
  has_nouserlabels: { group: 'organization', hasValue: false, valueType: null, operator: 'has:nouserlabels', filterSafety: 'search_only' },
  label_encryptedmail: { group: 'organization', hasValue: false, valueType: null, operator: 'label:encryptedmail', filterSafety: 'search_only', noteKey: 'builder.label_encryptedmail_note' },

  is_read: { group: 'status', hasValue: false, valueType: null, operator: 'is:read', filterSafety: 'search_only', noteKey: 'builder.is_read_note' },
  is_unread: { group: 'status', hasValue: false, valueType: null, operator: 'is:unread', filterSafety: 'search_only', noteKey: 'builder.is_unread_note' },
  is_starred: { group: 'status', hasValue: false, valueType: null, operator: 'is:starred', filterSafety: 'search_only', noteKey: 'builder.is_starred_note' },
  has_star: {
    group: 'status',
    hasValue: true,
    valueType: 'select',
    operator: 'has:',
    filterSafety: 'search_only',
    options: [
      'yellow-star',
      'orange-star',
      'red-star',
      'purple-star',
      'blue-star',
      'green-star',
      'red-bang',
      'orange-guillemet',
      'yellow-bang',
      'green-check',
      'blue-info',
      'purple-question',
    ],
  },
  is_important: { group: 'status', hasValue: false, valueType: null, operator: 'is:important', filterSafety: 'search_only', noteKey: 'builder.is_important_note' },
  is_muted: { group: 'status', hasValue: false, valueType: null, operator: 'is:muted', filterSafety: 'search_only', noteKey: 'builder.is_muted_note' },

  date_after: { group: 'date_size', hasValue: true, valueType: 'date', operator: 'after:', filterSafety: 'search_only', noteKey: 'builder.date_after_note' },
  date_before: { group: 'date_size', hasValue: true, valueType: 'date', operator: 'before:', filterSafety: 'search_only', noteKey: 'builder.date_before_note' },
  newer_than: { group: 'date_size', hasValue: true, valueType: 'relative_date', operator: 'newer_than:', filterSafety: 'search_only', datalist: ['1d', '7d', '14d', '1m', '3m', '6m', '1y'] },
  older_than: { group: 'date_size', hasValue: true, valueType: 'relative_date', operator: 'older_than:', filterSafety: 'search_only', datalist: ['7d', '30d', '3m', '6m', '1y', '2y'] },
  size_larger: { group: 'date_size', hasValue: true, valueType: 'size', operator: 'larger:', filterSafety: 'safe', datalist: ['500K', '1M', '5M', '10M', '25M'] },
  size_smaller: { group: 'date_size', hasValue: true, valueType: 'size', operator: 'smaller:', filterSafety: 'safe', datalist: ['100K', '500K', '1M', '5M'] },
  size_exact: { group: 'date_size', hasValue: true, valueType: 'size_bytes', operator: 'size:', filterSafety: 'safe', datalist: ['100000', '1048576', '5242880'] },
};

function _uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 11)}-${Date.now().toString(36)}`;
}

export function createCondition(overrides = {}) {
  const type = overrides.type && CONDITION_TYPES[overrides.type] ? overrides.type : 'from';
  const logic = overrides.logic === 'OR' ? 'OR' : (overrides.logic === 'AND' ? 'AND' : undefined);
  return {
    id: overrides.id || _uuid(),
    kind: 'condition',
    type,
    value: typeof overrides.value === 'string' ? overrides.value : '',
    negate: Boolean(overrides.negate),
    logic,
    meta: overrides.meta && typeof overrides.meta === 'object' ? { ...overrides.meta } : {},
  };
}

export function createGroup(groupLogic = 'AND', children = [], negate = false, id = null, combineLogic = undefined) {
  return {
    id: id || _uuid(),
    kind: 'group',
    logic: combineLogic === 'OR' ? 'OR' : (combineLogic === 'AND' ? 'AND' : undefined),
    groupLogic: groupLogic === 'OR' ? 'OR' : 'AND',
    negate: Boolean(negate),
    children: Array.isArray(children) ? children : [],
  };
}

export function createRootGroup(logic = 'AND', children = []) {
  return createGroup(logic, children, false);
}

function _flattenSubgroupChildren(items) {
  const result = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    if (item.kind === 'group') {
      result.push(..._flattenSubgroupChildren(item.children || []));
    } else if (CONDITION_TYPES[item.type]) {
      result.push(createCondition(item));
    }
  }
  return result;
}

function _legacyArrayToTree(arr) {
  const valid = arr.filter(c => c && typeof c === 'object' && CONDITION_TYPES[c.type]);
  if (valid.length === 0) return createRootGroup('AND', []);
  return createRootGroup('AND', valid.map((c, idx) => createCondition({
    ...c,
    logic: idx === 0 ? 'AND' : (c.logic === 'OR' ? 'OR' : 'AND'),
  })));
}

export function normalizeFilterTree(input) {
  if (!input) return createRootGroup('AND', []);
  if (Array.isArray(input)) return _legacyArrayToTree(input);

  if (input.kind === 'group') {
    const rootDefault = input.groupLogic === 'OR' || input.logic === 'OR' ? 'OR' : 'AND';
    const rawChildren = Array.isArray(input.children) ? input.children : [];
    const children = [];
    for (let i = 0; i < rawChildren.length; i++) {
      const item = rawChildren[i];
      if (!item || typeof item !== 'object') continue;
      const itemLogic = i === 0 ? 'AND' : (item.logic === 'OR' ? 'OR' : (item.logic === 'AND' ? 'AND' : rootDefault));
      if (item.kind === 'group') {
        const subDefault = item.groupLogic === 'OR' || (!item.groupLogic && item.logic === 'OR') ? 'OR' : 'AND';
        const subRaw = _flattenSubgroupChildren(item.children || []);
        const subChildren = subRaw.map((c, j) => createCondition({
          ...c,
          logic: j === 0 ? 'AND' : (c.logic === 'OR' ? 'OR' : (c.logic === 'AND' ? 'AND' : subDefault)),
        }));
        children.push(createGroup(subDefault, subChildren, item.negate, item.id, itemLogic));
      } else if (CONDITION_TYPES[item.type]) {
        children.push(createCondition({ ...item, logic: itemLogic }));
      }
    }
    return createGroup(rootDefault, children, false, input.id, 'AND');
  }

  return createRootGroup('AND', []);
}

export function hasAnyCondition(input) {
  const tree = normalizeFilterTree(input);
  return tree.children.some(child =>
    child.kind === 'group' ? child.children.length > 0 : true
  );
}

function _isBalancedWrapped(str) {
  if (!str || str.length < 2) return false;
  const first = str[0];
  const last = str[str.length - 1];

  if (first === '"' && last === '"') {
    return str.indexOf('"', 1) === str.length - 1;
  }

  if ((first === '(' && last === ')') || (first === '{' && last === '}')) {
    const open = first;
    const close = last;
    let depth = 0;
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (!inQuotes) {
        if (ch === open) depth++;
        else if (ch === close) {
          depth--;
          if (depth === 0 && i < str.length - 1) return false;
          if (depth < 0) return false;
        }
      }
    }
    return depth === 0;
  }

  return false;
}

function _stripOuterQuotes(str) {
  if (str.length >= 2 && str[0] === '"' && str[str.length - 1] === '"') {
    return str.slice(1, -1);
  }
  return str;
}

function _formatLabelToken(token) {
  const cleaned = _stripOuterQuotes(token.trim());
  if (!cleaned) return '';
  if (cleaned.startsWith('^')) return cleaned;
  return cleaned.replace(/\s+/g, '-');
}

function _formatLabelValue(value) {
  const trimmed = value.trim();
  const unwrapped =
    trimmed.startsWith('(') && trimmed.endsWith(')') && _isBalancedWrapped(trimmed)
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  const parts = unwrapped
    .split(/\s+\bOR\b\s+/)
    .map(_formatLabelToken)
    .filter(Boolean);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `(${parts.join(' OR ')})`;
}

function _stripAngleToken(token) {
  const t = token.trim();
  if (!t) return '';
  if (t.startsWith('"') && t.endsWith('"') && t.length >= 2) {
    const inner = t.slice(1, -1).trim().replace(/^<+|>+$/g, '').trim();
    return inner ? `"${inner}"` : '';
  }
  return t.replace(/^<+|>+$/g, '').trim();
}

function _stripAngleBrackets(value) {
  const trimmed = value.trim();
  const unwrapped =
    trimmed.startsWith('(') && trimmed.endsWith(')') && _isBalancedWrapped(trimmed)
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  const parts = unwrapped
    .split(/\s+\bOR\b\s+/)
    .map(_stripAngleToken)
    .filter(Boolean);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `(${parts.join(' OR ')})`;
}

function _formatDate(value) {
  const trimmed = value.trim();
  if (/^\d{9,11}$/.test(trimmed)) return trimmed;
  return trimmed.replace(/-/g, '/');
}

function _formatSizeBytes(value) {
  const trimmed = value.trim();
  const mMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*[Mm]$/);
  if (mMatch) return String(Math.round(parseFloat(mMatch[1]) * 1048576));
  const kMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*[Kk]$/);
  if (kMatch) return String(Math.round(parseFloat(kMatch[1]) * 1024));
  const bMatch = trimmed.match(/^(\d+)\s*[Bb]$/);
  if (bMatch) return bMatch[1];
  return trimmed;
}

function _wrap(value, type, def) {
  if (_isBalancedWrapped(value)) return value;

  if (def.valueType === 'text' && !/\s/.test(value) && value.includes('+') && !value.includes('@')) {
    return `"${value}"`;
  }

  if (type === 'body') {
    if (/\bOR\b/.test(value)) return `(${value})`;
    return value;
  }

  const needsWrap = /\s|\bOR\b/.test(value);
  return needsWrap ? `(${value})` : value;
}

function _buildFragmentMeta(condition) {
  const { type, value, negate, meta } = condition;
  const def = CONDITION_TYPES[type];
  if (!def) return null;

  let core = '';
  let isAround = false;

  if (!def.hasValue) {
    core = def.operator;
  } else if (def.valueType === 'around') {
    const w1 = (value || '').trim();
    const w2 = (meta?.word2 || '').trim();
    const dist = Math.max(1, parseInt(meta?.distance, 10) || 5);
    const ordered = Boolean(meta?.ordered);
    if (!w1 || !w2) return null;
    const expr = `${w1} AROUND ${dist} ${w2}`;
    core = ordered ? `"${expr}"` : expr;
    isAround = true;
  } else {
    const trimmed = (value || '').trim();
    if (!trimmed) return null;

    if (def.valueType === 'phrase') {
      const inner = _stripOuterQuotes(trimmed).trim();
      if (!inner) return null;
      core = `"${inner}"`;
    } else if (def.valueType === 'word') {
      const withoutPlus = trimmed.replace(/^\++/, '').trim();
      if (!withoutPlus) return null;
      const inner = _stripOuterQuotes(withoutPlus).trim();
      if (!inner) return null;
      core = /\s/.test(withoutPlus) || withoutPlus.startsWith('"') ? `+"${inner}"` : `+${inner}`;
    } else if (def.valueType === 'label') {
      const formattedLabel = _formatLabelValue(trimmed);
      if (!formattedLabel) return null;
      core = `${def.operator}${formattedLabel}`;
    } else if (type === 'rfc822msgid' || type === 'list') {
      const cleanedId = _stripAngleBrackets(trimmed);
      if (!cleanedId) return null;
      core = `${def.operator}${_wrap(cleanedId, type, def)}`;
    } else if (def.valueType === 'date') {
      core = `${def.operator}${_wrap(_formatDate(trimmed), type, def)}`;
    } else if (def.valueType === 'size_bytes') {
      core = `${def.operator}${_wrap(_formatSizeBytes(trimmed), type, def)}`;
    } else {
      core = `${def.operator}${_wrap(trimmed, type, def)}`;
    }
  }

  if (!core) return null;

  let text = core;
  if (negate) {
    if (isAround && !core.startsWith('"')) {
      text = `-(${core})`;
    } else if (type === 'body' && /\s/.test(core) && !_isBalancedWrapped(core)) {
      text = `-(${core})`;
    } else {
      text = `-${core}`;
    }
  }

  return {
    text,
    isGroup: false,
    isNegated: Boolean(negate),
    isAround,
    type,
    isFlattenedNegatedOr: false,
  };
}

function _splitOrRuns(items) {
  const runs = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i === 0 || item.logic !== 'OR') {
      runs.push([item]);
    } else {
      runs[runs.length - 1].push(item);
    }
  }
  return runs;
}

function _negateFragment(item) {
  if (item.isNegated) return item.text;
  if (item.isAround && !item.text.startsWith('"')) return `-(${item.text})`;
  if (item.type === 'body' && /\s/.test(item.text) && !_isBalancedWrapped(item.text)) {
    return `-(${item.text})`;
  }
  return `-${item.text}`;
}

function _formatOrChild(item) {
  if (item.isGroup) {
    if ((item.isFlattenedNegatedOr || item.isNegated) && !_isBalancedWrapped(item.text)) {
      return `(${item.text})`;
    }
    return item.text;
  }
  if (item.isNegated) return `(${item.text})`;
  if (item.isAround && !item.text.startsWith('"')) return `(${item.text})`;
  if (item.type === 'body' && /\s/.test(item.text) && !_isBalancedWrapped(item.text)) {
    return `(${item.text})`;
  }
  return item.text;
}

function _buildGroupQuery(group, isRoot) {
  const valid = [];
  for (const child of group.children) {
    if (child.kind === 'group') {
      const sub = _buildGroupQuery(child, false);
      if (sub) valid.push({ ...sub, logic: child.logic });
    } else {
      const frag = _buildFragmentMeta(child);
      if (frag) valid.push({ ...frag, logic: child.logic });
    }
  }

  if (valid.length === 0) return null;

  const runs = _splitOrRuns(valid);
  const hasMultipleRuns = runs.length > 1;
  const runStrings = runs.map(run => {
    if (run.length === 1) return run[0].text;
    const orText = run.map(_formatOrChild).join(' OR ');
    return hasMultipleRuns ? `(${orText})` : orText;
  });

  const joined = runStrings.join(' ');
  let text = joined;
  let isFlattenedNegatedOr = false;

  if (group.negate) {
    if (valid.length === 1 && !valid[0].isGroup) {
      text = valid[0].isNegated ? `-(${joined})` : _negateFragment(valid[0]);
    } else if (runs.length === 1 && runs[0].length > 1 && runs[0].every(c => !c.isNegated && !c.isGroup)) {
      text = runs[0].map(_negateFragment).join(' ');
      isFlattenedNegatedOr = true;
    } else {
      text = `-(${joined})`;
    }
  } else if (!isRoot && valid.length > 1 && !_isBalancedWrapped(joined)) {
    text = `(${joined})`;
  }

  return {
    text,
    isGroup: true,
    isNegated: Boolean(group.negate),
    isAround: false,
    type: 'group',
    isFlattenedNegatedOr,
  };
}

export function buildQuery(input, groupAll = false) {
  const tree = normalizeFilterTree(input);
  const built = _buildGroupQuery(tree, true);
  if (!built) return '';
  if (groupAll && !_isBalancedWrapped(built.text)) return `(${built.text})`;
  return built.text;
}

function _translateOption(type, value, t) {
  const key = `builder.options.${type}.${value}`;
  const translated = t(key);
  return translated !== key ? translated : value;
}

function _buildConditionSummary(condition, t) {
  const frag = _buildFragmentMeta(condition);
  if (!frag) return '';

  const def = CONDITION_TYPES[condition.type];
  let desc;
  if (condition.type === 'around') {
    const dist = Math.max(1, parseInt(condition.meta?.distance, 10) || 5);
    const orderedSuffix = condition.meta?.ordered ? ` ${t('summary.around_ordered_suffix')}` : '';
    desc = `${t('summary.around', {
      word1: (condition.value || '').trim(),
      distance: dist,
      word2: (condition.meta?.word2 || '').trim(),
    })}${orderedSuffix}`;
  } else if (def.valueType === 'select') {
    const optionLabel = _translateOption(condition.type, condition.value, t);
    desc = t(`summary.${condition.type}`, { value: optionLabel });
  } else {
    desc = t(`summary.${condition.type}`, { value: (condition.value || '').trim() });
  }

  if (condition.negate) {
    return `${t('summary.negate_prefix')} ${desc}`;
  }
  return desc;
}

function _buildGroupSummary(group, t, isRoot) {
  const parts = [];
  for (const child of group.children) {
    if (child.kind === 'group') {
      const sub = _buildGroupSummary(child, t, false);
      if (sub) parts.push({ text: sub, logic: child.logic });
    } else {
      const s = _buildConditionSummary(child, t);
      if (s) parts.push({ text: s, logic: child.logic });
    }
  }
  if (parts.length === 0) return '';

  const runs = _splitOrRuns(parts);
  const hasMultipleRuns = runs.length > 1;
  const runStrings = runs.map(run => {
    if (run.length === 1) return run[0].text;
    const orText = run.map(r => r.text).join(t('summary.or_connector'));
    return hasMultipleRuns ? `(${orText})` : orText;
  });

  const joined = runStrings.join(t('summary.and_connector'));

  if (group.negate) {
    return `${t('summary.negate_group_prefix')} (${joined})`;
  }
  if (!isRoot && parts.length > 1) {
    return `(${joined})`;
  }
  return joined;
}

export function buildSummary(input, t) {
  const tree = normalizeFilterTree(input);
  const body = _buildGroupSummary(tree, t, true);
  if (!body) return '';
  return `${t('summary.prefix')} ${body}.`;
}

const BOOLEAN_OPERATORS = {
  'has:attachment': 'has_attachment',
  'has:drive': 'has_drive',
  'has:document': 'has_document',
  'has:spreadsheet': 'has_spreadsheet',
  'has:presentation': 'has_presentation',
  'has:youtube': 'has_youtube',
  'has:userlabels': 'has_userlabels',
  'has:nouserlabels': 'has_nouserlabels',
  'label:encryptedmail': 'label_encryptedmail',
  'is:read': 'is_read',
  'is:unread': 'is_unread',
  'is:starred': 'is_starred',
  'is:important': 'is_important',
  'is:muted': 'is_muted',
};

const PREFIX_OPERATORS = {
  'header:x-google-calendar-notification:': 'header_calendar',
  'from:': 'from',
  'to:': 'to',
  'cc:': 'cc',
  'bcc:': 'bcc',
  'deliveredto:': 'deliveredto',
  'list:': 'list',
  'subject:': 'subject',
  'filename:': 'filename',
  'category:': 'category',
  'label:': 'label',
  'in:': 'in',
  'has:': 'has_star',
  'after:': 'date_after',
  'before:': 'date_before',
  'newer:': 'date_after',
  'older:': 'date_before',
  'newer_than:': 'newer_than',
  'older_than:': 'older_than',
  'larger:': 'size_larger',
  'smaller:': 'size_smaller',
  'size:': 'size_exact',
  'rfc822msgid:': 'rfc822msgid',
};

const ORDERED_PREFIXES = Object.keys(PREFIX_OPERATORS).sort((a, b) => b.length - a.length);

function _tokenize(raw) {
  const tokens = [];
  let i = 0;
  const n = raw.length;

  const readBalanced = (startIdx, openCh, closeCh) => {
    let depth = 0;
    let inQuotes = false;
    let j = startIdx;
    while (j < n) {
      const ch = raw[j];
      if (ch === '"') inQuotes = !inQuotes;
      else if (!inQuotes) {
        if (ch === openCh) depth++;
        else if (ch === closeCh) {
          depth--;
          if (depth === 0) return j + 1;
        }
      }
      j++;
    }
    return n;
  };

  const readQuoted = (startIdx) => {
    let j = startIdx + 1;
    while (j < n && raw[j] !== '"') j++;
    return j < n ? j + 1 : n;
  };

  while (i < n) {
    while (i < n && /\s/.test(raw[i])) i++;
    if (i >= n) break;

    const ch = raw[i];
    if (ch === '(' || ch === ')' || ch === '{' || ch === '}') {
      tokens.push({ kind: ch, raw: ch });
      i++;
      continue;
    }

    if (ch === '|') {
      tokens.push({ kind: 'OR', raw: '|' });
      i++;
      continue;
    }

    if (ch === '"') {
      const end = readQuoted(i);
      tokens.push({ kind: 'QUOTED', raw: raw.slice(i, end) });
      i = end;
      continue;
    }

    if (ch === '-' && i + 1 < n && (raw[i + 1] === '(' || raw[i + 1] === '{' || raw[i + 1] === '"')) {
      tokens.push({ kind: 'NEG_PREFIX', raw: '-' });
      i++;
      continue;
    }

    let j = i;
    while (
      j < n &&
      !/\s/.test(raw[j]) &&
      raw[j] !== '(' &&
      raw[j] !== ')' &&
      raw[j] !== '{' &&
      raw[j] !== '}' &&
      raw[j] !== '|'
    ) {
      if (raw[j] === '"') {
        j = readQuoted(j);
      } else if (raw[j] === ':' && j + 1 < n && (raw[j + 1] === '(' || raw[j + 1] === '{')) {
        j = readBalanced(j + 1, raw[j + 1], raw[j + 1] === '(' ? ')' : '}');
        break;
      } else {
        j++;
      }
    }

    const word = raw.slice(i, j);
    if (word === 'OR' || word === 'AND' || word === 'NOT') {
      tokens.push({ kind: word, raw: word });
    } else if (word === '-') {
      tokens.push({ kind: 'NEG_PREFIX', raw: '-' });
    } else {
      tokens.push({ kind: 'TERM', raw: word });
    }
    i = j;
  }

  return tokens;
}

function _parseTermToken(rawTerm, initialNegate = false) {
  let negate = initialNegate;
  let body = rawTerm;
  if (body.startsWith('-') && body.length > 1) {
    negate = !negate;
    body = body.slice(1);
  }

  const lower = body.toLowerCase();
  if (BOOLEAN_OPERATORS[lower]) {
    return createCondition({ type: BOOLEAN_OPERATORS[lower], value: '', negate });
  }

  if (body.startsWith('+') && body.length > 1) {
    const rest = body.slice(1);
    return createCondition({
      type: 'exact_word',
      value: _stripOuterQuotes(rest),
      negate,
    });
  }

  for (const prefix of ORDERED_PREFIXES) {
    if (lower.startsWith(prefix)) {
      const type = PREFIX_OPERATORS[prefix];
      let val = body.slice(prefix.length);

      if (type === 'header_calendar') {
        const cleaned = _stripOuterQuotes(val.replace(/^\((.*)\)$/, '$1')).trim();
        if (CONDITION_TYPES.header_calendar.options.includes(cleaned)) {
          return createCondition({ type, value: cleaned, negate });
        }
        return createCondition({ type: 'body', value: body, negate });
      }

      if (type === 'has_star') {
        const cleaned = _stripOuterQuotes(val.replace(/^\((.*)\)$/, '$1')).trim().toLowerCase();
        if (CONDITION_TYPES.has_star.options.includes(cleaned)) {
          return createCondition({ type, value: cleaned, negate });
        }
        return createCondition({ type: 'body', value: body, negate });
      }

      if (type === 'category') {
        const cleaned = _stripOuterQuotes(val.replace(/^\((.*)\)$/, '$1')).trim().toLowerCase();
        if (CONDITION_TYPES.category.options.includes(cleaned)) {
          return createCondition({ type, value: cleaned, negate });
        }
        return createCondition({ type: 'body', value: body, negate });
      }

      if (val.startsWith('(') && val.endsWith(')') && _isBalancedWrapped(val)) {
        const inner = val.slice(1, -1).trim();
        if (/^-[^\s()]+$/.test(inner)) {
          val = inner.slice(1);
          negate = !negate;
        } else {
          val = inner;
        }
      } else if (val.startsWith('{') && val.endsWith('}') && _isBalancedWrapped(val)) {
        const inner = val.slice(1, -1).trim();
        const splitItems = inner.split(/\s+/).filter(Boolean);
        val = splitItems.length > 1 ? splitItems.join(' OR ') : inner;
      } else if (type === 'label') {
        val = _stripOuterQuotes(val);
      }

      if (type === 'rfc822msgid' || type === 'list') {
        val = _stripAngleBrackets(val);
      }

      if (type === 'date_after' || type === 'date_before') {
        const cleanDate = _stripOuterQuotes(val).trim();
        if (/^\d{9,11}$/.test(cleanDate)) {
          return createCondition({ type, value: cleanDate, negate, meta: { epoch: true } });
        }
        const dm = cleanDate.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
        if (dm) {
          val = `${dm[1]}-${dm[2].padStart(2, '0')}-${dm[3].padStart(2, '0')}`;
        }
      }

      return createCondition({ type, value: val, negate });
    }
  }

  return createCondition({ type: 'body', value: body, negate });
}

function _mergeAdjacentBodyAnd(items) {
  const merged = [];
  for (const item of items) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.kind === 'condition' &&
      item.kind === 'condition' &&
      prev.type === 'body' &&
      item.type === 'body' &&
      !prev.negate &&
      !item.negate
    ) {
      prev.value = `${prev.value} ${item.value}`;
    } else {
      merged.push(item);
    }
  }
  return merged;
}

export function parseQuery(raw) {
  if (!raw || !raw.trim()) return createRootGroup('AND', []);
  const tokens = _tokenize(raw);
  let pos = 0;

  const peek = () => tokens[pos] || null;
  const consume = () => tokens[pos++];

  const parsePrimary = () => {
    let negate = false;
    while (peek() && (peek().kind === 'NEG_PREFIX' || peek().kind === 'NOT')) {
      negate = !negate;
      consume();
    }

    const tok = peek();
    if (!tok) return null;

    if (tok.kind === '(' || tok.kind === '{') {
      const closeKind = tok.kind === '(' ? ')' : '}';
      const defaultLogic = tok.kind === '{' ? 'OR' : 'AND';
      consume();
      const inner = parseSequence(closeKind, defaultLogic);
      if (peek() && peek().kind === closeKind) consume();

      if (inner.length === 0) return null;
      if (inner.length === 1) {
        const single = inner[0];
        if (negate) single.negate = !single.negate;
        return single;
      }
      const logic = tok.kind === '{' ? 'OR' : inner._inferredLogic || 'AND';
      return createGroup(logic, inner, negate);
    }

    if (tok.kind === 'QUOTED') {
      consume();
      const inner = _stripOuterQuotes(tok.raw).trim();
      const aroundMatch = inner.match(/^(\S+)\s+AROUND(?:\s+(\d+)|\((\d+)\))\s+(\S+)$/);
      if (aroundMatch) {
        return createCondition({
          type: 'around',
          value: aroundMatch[1],
          negate,
          meta: { distance: parseInt(aroundMatch[2] || aroundMatch[3], 10), word2: aroundMatch[4], ordered: true },
        });
      }
      return createCondition({ type: 'exact_phrase', value: inner, negate });
    }

    if (tok.kind === 'TERM') {
      const t1 = consume();
      const next1 = tokens[pos];
      const next2 = tokens[pos + 1];
      const next3 = tokens[pos + 2];
      const next4 = tokens[pos + 3];
      const next5 = tokens[pos + 4];
      if (!t1.raw.includes(':') && next1 && next1.kind === 'TERM') {
        let dist = null;
        let w2Tok = null;
        const inlineMatch = next1.raw.match(/^AROUND\((\d+)\)$/);

        if (inlineMatch && next2 && (next2.kind === 'TERM' || next2.kind === 'QUOTED')) {
          consume();
          dist = parseInt(inlineMatch[1], 10);
          w2Tok = consume();
        } else if (
          next1.raw === 'AROUND' &&
          next2 &&
          next2.kind === 'TERM' &&
          /^\d+$/.test(next2.raw) &&
          next3 &&
          (next3.kind === 'TERM' || next3.kind === 'QUOTED')
        ) {
          consume();
          dist = parseInt(consume().raw, 10);
          w2Tok = consume();
        } else if (
          next1.raw === 'AROUND' &&
          next2?.kind === '(' &&
          next3?.kind === 'TERM' &&
          /^\d+$/.test(next3.raw) &&
          next4?.kind === ')' &&
          next5 &&
          (next5.kind === 'TERM' || next5.kind === 'QUOTED')
        ) {
          consume();
          consume();
          dist = parseInt(consume().raw, 10);
          consume();
          w2Tok = consume();
        }

        if (dist !== null && w2Tok) {
          let word1 = t1.raw;
          let condNegate = negate;
          if (word1.startsWith('-') && word1.length > 1) {
            condNegate = !condNegate;
            word1 = word1.slice(1);
          }
          return createCondition({
            type: 'around',
            value: word1,
            negate: condNegate,
            meta: { distance: dist, word2: w2Tok.raw, ordered: false },
          });
        }
      }
      return _parseTermToken(t1.raw, negate);
    }

    consume();
    return null;
  };

  const parseOrUnit = () => {
    const first = parsePrimary();
    if (!first) return null;
    first.logic = 'AND';
    const items = [first];
    while (peek() && peek().kind === 'OR') {
      consume();
      const next = parsePrimary();
      if (next) {
        next.logic = 'OR';
        items.push(next);
      }
    }
    if (items.length === 1) return items[0];
    return createGroup('OR', items, false);
  };

  const parseSequence = (stopKind = null, groupLogic = 'AND') => {
    const items = [];
    while (peek() && peek().kind !== stopKind && peek().kind !== ')' && peek().kind !== '}') {
      if (peek().kind === 'AND') {
        consume();
        continue;
      }
      if (groupLogic === 'OR') {
        const item = parsePrimary();
        if (item) {
          item.logic = items.length === 0 ? 'AND' : 'OR';
          items.push(item);
        }
      } else {
        const unit = parseOrUnit();
        if (unit) {
          unit.logic = 'AND';
          items.push(unit);
        }
      }
    }

    if (groupLogic === 'OR') {
      items._inferredLogic = 'OR';
      return items;
    }

    if (items.length === 1 && items[0].kind === 'group' && !items[0].negate) {
      const inner = items[0];
      const arr = [...inner.children];
      arr._inferredLogic = inner.groupLogic || inner.logic;
      return arr;
    }

    const merged = _mergeAdjacentBodyAnd(items);
    merged._inferredLogic = 'AND';
    return merged;
  };

  const rootItems = parseSequence(null, 'AND');
  const rootLogic = rootItems._inferredLogic === 'OR' ? 'OR' : 'AND';
  const cleanChildren = [...rootItems];
  return normalizeFilterTree(createRootGroup(rootLogic, cleanChildren));
}

function _collectConditions(tree) {
  const list = [];
  for (const child of tree.children) {
    if (child.kind === 'group') {
      for (const sub of child.children) {
        if (sub.kind === 'condition') list.push({ cond: sub, groupLogic: child.logic });
      }
    } else {
      list.push({ cond: child, groupLogic: tree.logic });
    }
  }
  return list;
}

export function analyzeQuery(input, queryStr = '') {
  const tree = normalizeFilterTree(input);
  const query = typeof queryStr === 'string' && queryStr.length > 0 ? queryStr : buildQuery(tree);
  const charCount = query.length;
  const charSeverity = charCount >= 1450 ? 'error' : charCount >= 1200 ? 'warn' : 'ok';

  const warnings = [];
  const seenCodes = new Set();
  const pushWarning = (code, severity, params = {}) => {
    if (seenCodes.has(code)) return;
    seenCodes.add(code);
    warnings.push({ code, severity, params });
  };

  if (charSeverity === 'error') {
    pushWarning('char_limit_exceeded', 'error', { count: charCount });
  } else if (charSeverity === 'warn') {
    pushWarning('char_limit_warn', 'warn', { count: charCount });
  }

  const allEntries = _collectConditions(tree);
  const searchOnlyOps = [];
  let hasNegation = false;
  let hasOrNegationTrap = false;

  const inspectGroupForOrTrap = (group) => {
    const valid = group.children.filter(c =>
      c.kind === 'group' ? Boolean(_buildGroupQuery(c, false)) : Boolean(_buildFragmentMeta(c))
    );
    if (valid.length < 2) return false;
    const runs = _splitOrRuns(valid);
    return runs.some(run => run.length >= 2 && run.some(c => c.negate));
  };

  if (inspectGroupForOrTrap(tree)) hasOrNegationTrap = true;
  for (const child of tree.children) {
    if (child.kind === 'group') {
      if (child.negate) {
        hasNegation = true;
        const validSubs = child.children.filter(sub => Boolean(_buildFragmentMeta(sub)));
        if (validSubs.some(sub => sub.negate)) {
          pushWarning('double_negation', 'warn');
        }
        const subRuns = _splitOrRuns(validSubs);
        const isFlattenableOr =
          subRuns.length === 1 && subRuns[0].length > 1 && subRuns[0].every(c => !c.negate);
        if (validSubs.length >= 2 && !isFlattenableOr) {
          pushWarning('negated_group_caution', 'warn');
        }
      }
      if (inspectGroupForOrTrap(child)) hasOrNegationTrap = true;
    }
  }

  if (hasOrNegationTrap) {
    pushWarning('or_negation_trap', 'warn');
  }

  for (const { cond } of allEntries) {
    const def = CONDITION_TYPES[cond.type];
    if (!def) continue;

    if (cond.negate) hasNegation = true;
    const val = (cond.value || '').trim();
    const w2 = (cond.meta?.word2 || '').trim();
    const hasPayload = !def.hasValue || Boolean(val) || (cond.type === 'around' && Boolean(val && w2));

    if (!hasPayload) continue;

    if (def.filterSafety === 'search_only') {
      const opLabel = def.operator || cond.type;
      if (!searchOnlyOps.includes(opLabel)) searchOnlyOps.push(opLabel);
    } else if (cond.type === 'bcc') {
      pushWarning('caution_bcc', 'info');
    } else if (cond.type === 'category') {
      pushWarning('caution_category', 'info');
    }

    if (cond.type === 'deliveredto' && /(?:^|[\s(])me(?:$|[\s)])/i.test(val)) {
      pushWarning('deliveredto_me_unsupported', 'warn');
    }

    if (cond.type === 'in' && /(?:^|[\s(])archive(?:$|[\s)])/i.test(val)) {
      pushWarning('in_archive_unsupported', 'warn');
    }

    if (val.includes('*') || w2.includes('*')) {
      pushWarning('wildcard_unsupported', 'warn');
    }

    if (
      ['email', 'label', 'text', 'relative_date', 'size'].includes(def.valueType) &&
      /(?:^|\s)or(?:\s|$)/.test(val)
    ) {
      pushWarning('lowercase_or', 'warn');
    }

    if (def.valueType === 'phrase' || (val.startsWith('"') && val.endsWith('"'))) {
      const inner = _stripOuterQuotes(val);
      if (inner.includes('"')) {
        pushWarning('unescaped_inner_quote', 'warn');
      }
    }

    if (
      ['subject', 'from', 'to', 'cc', 'bcc', 'deliveredto'].includes(cond.type) &&
      /(?:^|\s)-\S+/.test(val)
    ) {
      pushWarning('negation_inside_operator', 'warn');
    }

    if (cond.type === 'around' && (/\bOR\b/.test(val) || /\bOR\b/.test(w2) || /[{}]/.test(val + w2))) {
      pushWarning('around_with_or', 'warn');
    }
  }

  if (searchOnlyOps.length > 0) {
    pushWarning('search_only_operators', 'warn', { operators: searchOnlyOps.join(', ') });
  }

  if (hasNegation) {
    pushWarning('conversation_view_negation', 'info');
  }

  return { charCount, charSeverity, warnings };
}
