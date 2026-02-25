# Gmail Filter Builder

**English** | [Español](README-es.md)

> Build advanced Gmail search queries visually — no syntax memorisation required.

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?logo=github)](https://salmonidas.github.io/gmail-filters/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## What is this?

**Gmail Filter Builder** is a free, open-source static web app that helps you construct powerful Gmail search queries using a visual, no-code interface.

Instead of memorising Gmail's operator syntax, you select filter conditions from dropdowns, fill in values, and the tool generates the correct query in real time — ready to paste into Gmail's search bar or filter creation wizard.

---

## Features

- 🔍 **Visual condition builder** — add/remove rows, each with type + value + NOT toggle
- 🔗 **AND / OR logic** — combine conditions with implicit AND or explicit OR
- 📋 **One-click copy** — copy the query directly to the clipboard
- 🔗 **Open in Gmail** — jump straight into Gmail with the query pre-filled
- 💬 **Plain-English summary** — see a human-readable explanation of what the filter does
- 🛠️ **Advanced editor** — switch to raw query editing and back to visual mode
- 🌍 **i18n** — fully internationalised, ships with English and Spanish; easy to extend
- ⭐ **Example presets** — 5 ready-made filters you can load and customise
- 📖 **Operator reference** — built-in help table with all supported Gmail operators

---

## Gmail Operators Supported

| Operator | Description |
|---|---|
| `from:` | Sender address |
| `to:` | Primary recipient |
| `cc:` / `bcc:` | CC / BCC recipients |
| `subject:` | Subject line |
| `has:attachment` | Has any attachment |
| `filename:` | Attachment name or extension |
| `label:` | Gmail label |
| `in:` | Folder / category (inbox, spam, promotions…) |
| `is:read` / `is:unread` | Read status |
| `is:starred` / `is:important` | Flag status |
| `after:` / `before:` | Date range (YYYY/MM/DD) |
| `newer_than:` / `older_than:` | Relative date (1d, 2m, 1y) |
| `larger:` / `smaller:` | Message size |
| `OR` | Logical OR |
| `-term` | Exclude / NOT |
| `(…)` | Grouping |

---

## Project Structure

```
gmail-filters/
├── index.html               # Single-page app shell
├── assets/
│   ├── css/
│   │   └── styles.css       # Material Design 3 stylesheet
│   └── js/
│       ├── main.js          # Entry point — boots i18n and binds everything
│       ├── i18n.js          # Lightweight i18n engine (fetch + JSON)
│       ├── query-builder.js # Pure query construction functions (stateless)
│       ├── ui.js            # DOM manipulation and event handling
│       └── examples.js      # Preset examples data and renderers
├── locales/
│   ├── en.json              # English strings
│   └── es.json              # Spanish strings
└── Utilidades/              # Project documentation (dev only)
    ├── Contexto_Global.md
    ├── Roadtrip.txt
    ├── Funcional.txt
    └── Commit.txt
```

---

## Deploying to GitHub Pages

1. Fork or clone this repository.
2. Push to `main` (or your default branch).
3. Go to **Settings → Pages** and set the source to `main` / `(root)`.
4. Your site will be live at `https://salmonidas.github.io/gmail-filters/`.

No build step required. Pure HTML/CSS/JS served directly.

---

## Adding a New Language

1. Copy `locales/en.json` → `locales/<code>.json` (e.g. `fr.json`).
2. Translate all string values (keep keys intact).
3. Open `assets/js/i18n.js` and add your locale to `AVAILABLE_LOCALES`:
   ```js
   { code: 'fr', label: 'Français' },
   ```
4. Done — the language selector will appear automatically.

---

## Adding a New Condition Type

1. Open `assets/js/query-builder.js` and add an entry to `CONDITION_TYPES`.
2. Add translation keys under `builder.types.<key>` and `builder.placeholders.<key>` in each locale file.
3. Add a summary description under `summary.<key>` in each locale file.

---

## Configuring the Developer Support Banner

Open `assets/js/main.js` and find the `CONFIG` object:

```js
const CONFIG = {
  HIDE_SUPPORT: false,   // set true to hide the banner entirely
};
```

Update the banner links in each locale file under `support.links[]`.

---

## License

MIT © 2026 — see [LICENSE](LICENSE).
