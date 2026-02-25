# Changelog

**English** | [Español](CHANGELOG-es.md)

All notable changes to this project will be documented in this file.  
This project adheres to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2026-02-25

### Added
- Visual condition builder with add/remove rows, type selector, value input, and NOT toggle.
- AND / OR logic selector between conditions with parentheses-aware query generation.
- Real-time Gmail query generation from visual conditions.
- Natural language summary of the generated filter.
- One-click copy-to-clipboard button.
- "Open in Gmail" button that pre-fills the search bar with the generated query.
- Advanced editor mode: toggle between visual builder and raw query text input.
- Basic query parser for the advanced → visual round-trip.
- Example presets section with 5 ready-made filters and "Load" buttons.
- Gmail operator reference table with all supported operators and pro tips.
- Lightweight i18n engine using fetch + JSON locale files (no external dependency).
- English (`en.json`) and Spanish (`es.json`) locale files.
- Automatic locale detection from `navigator.language`.
- Language selector dropdown in the top app bar.
- Hash-based navigation between Builder, Examples, and Help sections.
- Developer support banner (configurable via `HIDE_SUPPORT` flag in `main.js`).
- Floating support toast (bottom-right, 5 s delay, "Don't show again" via localStorage).
- Header ❤️ donate button and footer donate link, both linking to PayPal.me.
- Material Design 3 inspired design system (CSS custom properties, tokens, elevation, shape).
- Responsive layout for desktop and mobile.
- GitHub Pages compatible structure (no build step, relative paths only).
- `README.md` with deploy guide, extension docs, and operator reference.
- Dark mode with automatic OS preference detection (`prefers-color-scheme`) and real-time tracking.
- Theme toggle button (🌙/☀️) in the top app bar. User preference persisted in `localStorage`.
- Gmail brand color tokens: Primary `#4285F4`, Error `#EA4335`, Tertiary `#34A853`, Yellow `#FBBC04`.
- Four-color Google gradient on the brand icon (Red → Yellow → Green → Blue).
- Example cards cycle through the four Gmail colors via `nth-child` (top border + code snippet accent).
- Help operator badges cycle through the four Gmail colors via `nth-child`.
- AND logic toggle renders in Gmail Yellow; OR logic toggle renders in Gmail Blue when active.
- `.gitignore` file excluding `Utilidades/`, `node_modules/`, build artifacts, `.env*`, and OS/editor files.
- Specialized "Guide" (Guía) tab with a 7-step illustrated tutorial for successfully creating filters in Gmail, targeting all user profiles.
- Added a direct "How to apply" (¿Cómo aplicarlo?) button in the Builder preview card that links straight to the Guide tab.
- Added a direct "How to apply" (¿Cómo aplicarlo?) button in the Builder preview card that links straight to the Guide tab.
- Highlighted the critical "Search options" (sliders) icon in the Gmail search bar within the guide to address common user friction (corrected from ▼ arrow based on latest Gmail UI).

### Changed
- Replaced header emojis (Donate ❤️ and Theme 🌙/☀️) with minimalist Material Design 3 SVG icons for a cleaner look.
- Donation links consolidated to a single PayPal.me URL (`https://www.paypal.com/paypalme/SalmonidasDEV`).
- Footer simplified (removed "Hecho con ♥ —" prefix; copyright notation updated to `YYYY ©`).

### Removed
- Standalone "Preview" navigation tab and `#section-preview` HTML section. The inline preview card within the Builder is the sole query visualization surface.

---

[1.0.0]: https://github.com/Salmonidas/gmail-filters/releases/tag/1.0.0
