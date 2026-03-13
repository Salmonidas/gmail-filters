# Changelog

**English** | [Español](CHANGELOG-es.md)

All notable changes to this project will be documented in this file.  
This project adheres to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.1] - 2026-03-13

### Added
- **Automated GitHub Sponsors Detection**: The "Sponsor" button now dynamically checks the GitHub API on click. If your Sponsors page is live, it redirects; otherwise, it shows a localized "Donations Paused" toast. Zero code changes required when going live.
- **Localized Pause Toast**: Added bilingual (EN/ES) toast messages for paused donor status.

### Changed
- **Minimalist Footer**: Removed "Made with ♥" prefix for a cleaner, professional open-source look.

### Removed
- **PayPal Integration**: Removed all hardcoded PayPal links and references from the UI and metadata in favour of GitHub Sponsors.

## [1.1.0] - 2026-02-27

### Added
- **Share Link**: Serialises the visual builder state (conditions, logic, values) to a compact Base64 fragment in the URL hash. Any shared URL automatically reconstructs the full filter on load.
- **My Filters** (Saved Local Library): A "Save filter" button stores the current filter name, query, and conditions in `localStorage`. Saved filters appear as cards above the factory examples and can be loaded or deleted independently.
- **Progressive Web App (PWA)**: Added `manifest.json` and a cache-first Service Worker (`sw.js`). The app is now fully installable on Android, iOS, and macOS (Chrome/Safari via manual hint).
- **Modernized Library (Biblioteca)**: Renamed "Examples" to "Library" and added user-saved filters.
- **Micro-animations**: Added smooth transitions for modals (fade+scale), snackbars (slide-up), and new library rows for a premium feel.
- **UX Refinements**: Implemented a "Delete Confirmation" modal to prevent accidental data loss and a "Premium Empty State" for the Library.
- Strict **Content Security Policy** (`Content-Security-Policy` meta tag) to block XSS payloads.
- `apple-touch-icon` and iOS-specific PWA meta tags for a native-like experience.

### Fixed
- Implemented comprehensive CSS Media Queries for 100% mobile responsiveness (swipeable nav tabs, fluid tables, overflow-x protection).

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
- Header ❤️ donate button and footer donate link for supporting the developer.
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
- Donation links consolidated to a single support URL.
- Footer simplified (removed "Hecho con ♥ —" prefix; copyright notation updated to `YYYY ©`).

### Removed
- Standalone "Preview" navigation tab and `#section-preview` HTML section. The inline preview card within the Builder is the sole query visualization surface.

---

[1.1.1]: https://github.com/Salmonidas/gmail-filters/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/Salmonidas/gmail-filters/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/Salmonidas/gmail-filters/releases/tag/1.0.0
