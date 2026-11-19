# Gmail Filter Builder

**English** | [Español](README-es.md)

> Build advanced Gmail search filters visually — no syntax memorisation needed. Real-time query generation, per-condition/per-group `AND`/`OR` logic with 2-level grouping (`+ Add Group`), live Gmail diagnostics, plain-language summary, offline PWA, and 31 supported languages/regional variants. No backend, no build step.

[![Use Now - Live Demo](https://img.shields.io/badge/Use_Now-Live_Demo-blue?logo=googlechrome)](https://salmonidas.github.io/gmail-filters/)

---

## 🛑 The Gmail Problem
Gmail's search is powerful, but creating complex filters (e.g., `(label:work OR subject:urgent) -subject:Day`) requires knowing exact operator syntax, operator precedence rules (such as `OR` binding tighter than spaces and exclusions), and hidden limitations (`~1,500` character cap, Search-only operators vs. incoming mail filters, no `*` wildcards).

## ✨ The Solution
**Gmail Filter Builder** is a free, zero-dependency, client-side web app (and installable PWA) running in your browser:

1. **Add conditions & groups:** Choose from 39 Gmail operators organized by category, toggle exclusions (`NOT`), set per-condition or per-group `AND`/`OR` logic, and add optional 2-level sub-groups (`+ Add Group`).
2. **Real-time diagnostics & summary:** Detects Gmail traps (`OR` + exclusion bypasses with a 1-click fix, ~1,500 character filter limit warnings, Search-only operator alerts, invalid `in:archive` / `deliveredto:me`, negated compound groups, `*` wildcards, lowercase `or`).
3. **Copy, Save, Share & Apply:** Save filters locally in your Library, share filters via URL hash, or click **Open in Gmail** and follow the integrated 7-step Guide.

---

## 🚀 Main Features
- **39 Official Gmail Operators:** Covers people/lists (`from:`, `to:`, `cc:`, `bcc:`, `deliveredto:`, `list:`), exact/proximity text (`"..."`, `+word`, `AROUND`), attachments & Drive (`has:attachment`, `filename:`, `has:drive`, `has:document`, `has:spreadsheet`, `has:presentation`, `has:youtube`), Calendar & headers (`header:X-Google-Calendar-Notification:*` with 18 tokens, `rfc822msgid:`), organization (`category:`, `label:`, `in:`, `has:userlabels`, `has:nouserlabels`, `label:encryptedmail`), status & 12 Superstars (`is:*`, `has:<star>`), and dates/sizes (incl. Unix epoch & bytes).
- **2-Level Progressive Grouping:** Clean flat rows by default with per-condition and per-group `AND`/`OR` toggles, plus `+ Add Group` for nested mixed boolean logic without parenthesis confusion (auto-parenthesizing mixed `AND`/`OR` runs and flattening `-(A OR B)` via De Morgan `-A -B`).
- **Full Round-Trip Manual Editor:** Edit raw Gmail queries manually and parse them back into visual conditions/groups cleanly.
- **100% Private & Offline PWA:** Zero backend, zero tracking cookies, works offline via Service Worker, RTL layout support (`ar`), and 31 localized interfaces.

---

## 📚 Supported Operators
| Operator | Description |
|---|---|
| `from:` / `to:` / `cc:` / `bcc:` | Sender & recipients (`to:` matches To, CC, and sent BCC) |
| `deliveredto:` / `list:` | Envelope `Delivered-To` (`+aliases`) & `List-Id` mailing lists |
| `subject:` / body / `"..."` / `+` / `AROUND` | Subject, body, exact phrase, unstemmed word, word proximity |
| `has:attachment` / `filename:` | Attachments (incl. inline images) & file extensions (no `*`) |
| `has:drive` / `document` / `spreadsheet` / `presentation` / `youtube` | Embedded Google Drive, Docs, Sheets, Slides, YouTube |
| `header:X-Google-Calendar-Notification:` / `rfc822msgid:` | Official Calendar notifications (18 tokens) & Message-ID |
| `category:` | Official inbox tabs (`primary`, `social`, `promotions`, `updates`, `forums`, `reservations`, `purchases`) |
| `label:` / `has:userlabels` / `has:nouserlabels` / `label:encryptedmail` | Custom labels, unlabeled messages, Client-Side Encryption (Search) |
| `in:` | System locations (`inbox`, `sent`, `drafts`, `spam`, `trash`, `anywhere`, `snoozed`, `scheduled`, `chats` — Gmail has no `in:archive`) |
| `is:read` / `unread` / `starred` / `important` / `muted` / `has:<star>` | Read state, muted threads, and 12 Superstars (Search) |
| `after:` / `before:` / `newer_than:` / `older_than:` | Absolute (`YYYY/MM/DD` or Unix epoch) & relative dates (`7d`, `2m`, `1y`) |
| `larger:` / `smaller:` / `size:` | Message size (`5M`, `500K`, or minimum bytes: `size:` = larger than N bytes) |
| `OR` / `{ }` / `-term` / `(…)` | Logical OR, exclusions, and parenthesized grouping |

---

## 🛠️ For Developers
Built with Vanilla HTML, CSS (M3 design system + RTL logical properties), and ES6 JavaScript modules — zero build tools, zero npm runtime dependencies, AGPL-3.0 licensed (see [LICENSE](LICENSE)).

---

License: AGPL-3.0 © 2026
