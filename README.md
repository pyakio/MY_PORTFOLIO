# Portfolio — Abhay Narayan Singh

A fast, accessible, lightweight personal portfolio website engineered with semantic HTML5, modern CSS3 design tokens, and clean vanilla JavaScript.

---

## Features

- **Linear / Vercel Dark Aesthetic**: Restrained dark theme using CSS design tokens, subtle borders, clean typography, and performance-conscious ambient accents.
- **Hero & Profile**: Focused developer presentation highlighting core capabilities, direct repository access, and contact CTAs.
- **About Section**: Concise background detailing technical specializations, design philosophy, and primary stack.
- **Featured Projects**: Product-focused cards for major work (*DocMind AI* and *MailPilot*) with technology badges, direct repository links, and interactive product case studies.
- **Interactive Case Studies**: Built-in, accessible modal dialogs detailing problem statements, system architecture, engineering challenges, and current project status.
- **Live LeetCode Profile & Activity**: Real-time synced LeetCode metrics (total solved, easy/medium/hard breakdown, progress indicators, global rank, contest status, badges, and recent accepted submissions) paired with an interactive 53-week submission heatmap with year filtering (2024, 2025, 2026), dynamic streak calculation, and graceful offline fallbacks.
- **Achievements & Accreditations**: Verified credentials with high-resolution certificate viewing and PDF downloads for AWS certifications, alongside semantic expandable accordions for coursework milestones.
- **Responsive & Accessible**: Native mobile navigation drawer with keyboard trap (Escape key dismiss), skip-to-content links, `:focus-visible` states, and `prefers-reduced-motion` support across viewports from 320px to 1920px.

---

## Tech Stack

- **Frontend**: HTML5 (Semantic Structure), CSS3 (Custom Variables, Flexbox, Grid), JavaScript (ES6+)
- **Typography**: Plus Jakarta Sans, JetBrains Mono
- **Live Data**: Resilient multi-tier LeetCode integration:
  1. `/api/leetcode` (Vercel Serverless Function / Node GraphQL proxy with in-memory caching)
  2. Public CORS fallback proxies (`leetcode-api-faisalshohag.vercel.app`, `alfa-leetcode-api.onrender.com`)
  3. Client-side `localStorage` caching with 10-minute TTL, auto-refresh, and manual refresh controls.
- **Deployment**: Compatible with GitHub Pages, Vercel, Netlify, or Cloudflare Pages.

---

## Project Structure

```
portfolio/
├── index.html              # Main HTML markup & semantic structure
├── css/
│   └── style.css           # Complete design system tokens, responsive layout, & modals
├── js/
│   ├── leetcode-service.js # Reusable LeetCode API service, normalizer, and client cache
│   └── script.js           # Heatmap renderer, LeetCode UI controller, modals & navigation
├── api/
│   └── leetcode.js         # Serverless API proxy for official LeetCode GraphQL
├── tests/
│   ├── leetcode.test.js    # Data normalizer and schema unit tests
│   └── service-integration.test.js # Caching and fallback integration tests
├── server.js               # Zero-dependency local Node.js development server
├── package.json            # Scripts for test, lint, and start
├── assets/
│   ├── images/             # Profile avatar, project screenshots, footer artwork
│   ├── certificates/       # Verified certification PDFs
│   └── resume/             # Resume / CV PDF storage
├── .gitignore              # Ignored operating system, editor, and log files
└── README.md               # Technical project documentation
```

---

## Configuration

To customize or update the target LeetCode profile:
- Set `LEETCODE_USERNAME` in `js/script.js` (defaults to `'abhaysingh79'`).
- Or define `window.PORTFOLIO_CONFIG = { LEETCODE_USERNAME: 'yourhandle' };` before `js/script.js` loads.

---

## Running & Testing Locally

```bash
# 1. Run automated unit & integration tests
npm test

# 2. Run syntax / lint validation
npm run lint

# 3. Start local development server (serves static files + /api/leetcode proxy)
npm start
# Server will run at http://localhost:3000
```

---

## Deployment

### Vercel (Recommended for direct GraphQL Serverless API)
1. Push code to GitHub.
2. Import project into Vercel.
3. Vercel automatically deploys static assets and `/api/leetcode` serverless route.

### GitHub Pages (Static Host)
1. Push the repository to GitHub.
2. Navigate to **Repository Settings -> Pages**.
3. Under **Build and deployment**, set branch to `main` and directory to `/ (root)`.
4. The client automatically falls back to public CORS proxies and caches results in `localStorage`.

---

## Author

**Abhay Narayan Singh**
- **GitHub**: [@pyakio](https://github.com/pyakio)
- **LinkedIn**: [Abhay Narayan Singh](https://www.linkedin.com/in/abhay-narayan-singh-4b4b55303/)
- **LeetCode**: [@abhaysingh79](https://leetcode.com/u/abhaysingh79/)
- **Email**: kmrsingh116@gmail.com

---

## Links

- **Repository**: [https://github.com/pyakio/MY_PORTFOLIO](https://github.com/pyakio/MY_PORTFOLIO)
- **DocMind AI**: [https://github.com/pyakio/docmind-ai](https://github.com/pyakio/docmind-ai)
- **MailPilot**: [https://github.com/pyakio/MailPilot](https://github.com/pyakio/MailPilot)
