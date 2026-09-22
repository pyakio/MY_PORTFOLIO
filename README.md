# Portfolio — Abhay Narayan Singh

A fast, accessible, lightweight personal portfolio website engineered with semantic HTML5, modern CSS3 design tokens, and clean vanilla JavaScript.

---

## Features

- **Linear / Vercel Dark Aesthetic**: Restrained dark theme using CSS design tokens, subtle borders, clean typography, and performance-conscious ambient accents.
- **Hero & Profile**: Focused developer presentation highlighting core capabilities, direct repository access, and contact CTAs.
- **About Section**: Concise background detailing technical specializations, design philosophy, and primary stack.
- **Featured Projects**: Product-focused cards for major work (*DocMind AI* and *MailPilot*) with technology badges, direct repository links, and interactive product case studies.
- **Interactive Case Studies**: Built-in, accessible modal dialogs detailing problem statements, system architecture, engineering challenges, and current project status.
- **Continuous Coding Activity**: Real-time synced LeetCode metrics and an interactive 52-week submission heatmap with year filtering (2024, 2025, 2026), dynamic streak calculation, and graceful offline fallbacks.
- **Achievements & Accreditations**: Verified credentials with high-resolution certificate viewing and PDF downloads for AWS certifications, alongside semantic expandable accordions for coursework milestones.
- **Responsive & Accessible**: Native mobile navigation drawer with keyboard trap (Escape key dismiss), skip-to-content links, `:focus-visible` states, and `prefers-reduced-motion` support across viewports from 320px to 1920px.

---

## Tech Stack

- **Frontend**: HTML5 (Semantic Structure), CSS3 (Custom Variables, Flexbox, Grid), JavaScript (ES6+)
- **Typography**: Plus Jakarta Sans, JetBrains Mono
- **Live Data**: LeetCode Public REST APIs (active submission history & difficulty breakdown)
- **Deployment**: Zero build-step static site ready for GitHub Pages, Vercel, Netlify, or Cloudflare Pages

---

## Project Structure

```
portfolio/
├── index.html              # Main HTML markup & semantic structure
├── css/
│   └── style.css           # Complete design system tokens, responsive layout, & modals
├── js/
│   └── script.js           # Heatmap renderer, LeetCode live sync, modals & mobile nav
├── assets/
│   ├── images/             # Profile avatar, project screenshots, footer artwork
│   ├── certificates/       # Verified certification PDFs
│   └── resume/             # Resume / CV PDF storage
├── .gitignore              # Ignored operating system, editor, and log files
└── README.md               # Technical project documentation
```

---

## Running Locally

Because this project uses vanilla web standards with no compilation or package bundling steps, you can serve it locally using any lightweight static server:

```bash
# Option 1: Using Python 3
python3 -m http.server 8000

# Option 2: Using Node.js (npx serve)
npx serve .
```

Then open `http://localhost:8000` in your web browser.

---

## Deployment

### GitHub Pages
1. Push the repository to GitHub.
2. In your repository settings, navigate to **Pages**.
3. Under **Build and deployment**, set the branch to `main` and root directory to `/ (root)`.
4. Save to deploy.

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
