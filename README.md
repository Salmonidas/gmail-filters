# Gmail Filter Builder

**English** | [Español](README-es.md)

> Build advanced Gmail search filters visually — no syntax memorisation needed. Real-time query generation, plain-English summary, copy-to-clipboard, and runs entirely in the browser. No backend, no build step. EN/ES.

[![Use Now - Live Demo](https://img.shields.io/badge/Use_Now-Live_Demo-blue?logo=googlechrome)](https://salmonidas.github.io/gmail-filters/)

---

## 🛑 The Gmail Problem
Gmail's search is incredibly powerful, but creating complex filters (e.g., "Emails with attachments, NOT from X person, with label Y") requires you to memorize a list of commands and symbols like `has:attachment -from:boss@company.com label:urgent`. Nobody has time to memorize that!

## ✨ The Solution
**Gmail Filter Builder** is a free, secure tool that runs in your browser. It lets you create complex searches simply by clicking dropdown menus.

1. **Add your rules:** Select what you want to filter by (Sender, Subject, Has attachment, Date...).
2. **Copy the result:** The tool generates the exact Gmail code instantly.
3. **Paste into Gmail:** Use the "Open in Gmail" button to test your search directly in your inbox, or use it to create an automated filter.

---

## 🚀 Main Features
- **Visual Interface:** Add as many conditions as you need, click buttons to combine them with "AND / OR", or check the "Exclude (NOT)" box to specify what you don't want.
- **Plain-English Summary:** As you build, the tool writes out a human-readable explanation of exactly which emails will match.
- **100% Private:** No passwords required, it does not connect to your Google account, and it runs entirely in your own browser. Your data is perfectly safe.
- **Step-by-step Guide:** Includes a dedicated "Guide" tab with screenshots showing you exactly where to paste this filter back into Gmail.
- **Ready-to-use Examples:** Load common filters (like "Clean up heavy newsletters") with one click so you don't have to start from scratch.

---

## 📚 Supported Operators
With this tool you can filter by:

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

## 🛠️ For Developers
If you are a developer looking to host your own version, contribute to the codebase (Vanilla HTML/JS/CSS, no build step, no dependencies), or check out the lightweight i18n engine: all source code is open under the MIT license. Just clone the repo and explore!

---

License: MIT © 2026 
