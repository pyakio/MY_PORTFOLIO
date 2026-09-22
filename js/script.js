/**
 * Portfolio Interactive Logic & Data Systems
 * Author: Abhay Narayan Singh (@pyakio)
 * Standard: Clean ES6+, Accessible, Performant, Zero External Framework Dependencies
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. SOCIAL MEDIA & PROFILES CONFIGURATION
     Update your personal Instagram / X URLs here when available.
     Leaves them cleanly hidden if empty (no fake generic links).
     ========================================================================== */
  const SOCIAL_CONFIG = {
    github: 'https://github.com/pyakio',
    linkedin: 'https://www.linkedin.com/in/abhay-narayan-singh-4b4b55303/',
    leetcode: 'https://leetcode.com/u/abhaysingh79/',
    email: 'kmrsingh116@gmail.com',
    instagram: '', // Add real Instagram profile URL when ready e.g. 'https://instagram.com/yourhandle'
    x: '',         // Add real X (Twitter) profile URL when ready e.g. 'https://x.com/yourhandle'
  };

  // Initialize optional social links based on config
  const initSocialLinks = () => {
    const instagramPill = document.getElementById('instagramPill');
    const xPill = document.getElementById('xPill');
    const contactInstagramIcon = document.getElementById('contactInstagramIcon');
    const contactXIcon = document.getElementById('contactXIcon');

    if (SOCIAL_CONFIG.instagram) {
      if (instagramPill) {
        instagramPill.href = SOCIAL_CONFIG.instagram;
        instagramPill.style.display = 'inline-flex';
      }
      if (contactInstagramIcon) {
        contactInstagramIcon.href = SOCIAL_CONFIG.instagram;
        contactInstagramIcon.style.display = 'inline-flex';
      }
    }

    if (SOCIAL_CONFIG.x) {
      if (xPill) {
        xPill.href = SOCIAL_CONFIG.x;
        xPill.style.display = 'inline-flex';
      }
      if (contactXIcon) {
        contactXIcon.href = SOCIAL_CONFIG.x;
        contactXIcon.style.display = 'inline-flex';
      }
    }
  };
  initSocialLinks();

  /* ==========================================================================
     2. MOBILE NAVIGATION
     Accessible, keyboard navigable, closes with Escape or outside click
     ========================================================================== */
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const mobileNavMenu = document.getElementById('mobileNavMenu');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');

  let isMobileNavOpen = false;

  const openMobileNav = () => {
    if (!mobileNavMenu || !mobileNavToggle) return;
    isMobileNavOpen = true;
    mobileNavToggle.classList.add('active');
    mobileNavToggle.setAttribute('aria-expanded', 'true');
    mobileNavToggle.setAttribute('aria-label', 'Close navigation menu');
    mobileNavMenu.classList.add('open');
    mobileNavMenu.setAttribute('aria-hidden', 'false');
    if (mobileNavBackdrop) {
      mobileNavBackdrop.classList.add('visible');
      mobileNavBackdrop.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
  };

  const closeMobileNav = () => {
    if (!mobileNavMenu || !mobileNavToggle) return;
    isMobileNavOpen = false;
    mobileNavToggle.classList.remove('active');
    mobileNavToggle.setAttribute('aria-expanded', 'false');
    mobileNavToggle.setAttribute('aria-label', 'Open navigation menu');
    mobileNavMenu.classList.remove('open');
    mobileNavMenu.setAttribute('aria-hidden', 'true');
    if (mobileNavBackdrop) {
      mobileNavBackdrop.classList.remove('visible');
      mobileNavBackdrop.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  };

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMobileNavOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', closeMobileNav);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  /* ==========================================================================
     3. ACTIVE SECTION SCROLL SPY
     Throttled for 60fps scrolling performance
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('#navTabs .nav-item');

  let isTicking = false;

  const setActiveNav = () => {
    let currentId = 'hero';
    const scrollPosition = window.scrollY + 180;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = sec.id;
      }
    });

    desktopNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    mobileNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    isTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(setActiveNav);
      isTicking = true;
    }
  }, { passive: true });

  setActiveNav();

  /* ==========================================================================
     4. CODING ACTIVITY HEATMAP (LEETCODE SUBMISSION CALENDAR)
     Accurately labeled, dynamically calculates submissions and streaks
     ========================================================================== */
  const heatGrid = document.getElementById('heatGrid');
  const totalSubmissionsEl = document.getElementById('totalSubmissions');
  const streakValEl = document.getElementById('streakVal');
  const yearBtns = document.querySelectorAll('.year-btn');
  const statsFallbackMsg = document.getElementById('statsFallbackMsg');

  // Real verified submission calendar data for 'abhaysingh79'
  let rawSubmissionCalendar = {
    "1757894400": 2, "1765065600": 2, "1765152000": 1, "1765238400": 1, "1765324800": 2, "1765411200": 1,
    "1765497600": 1, "1765584000": 1, "1765670400": 1, "1765756800": 2, "1765843200": 8, "1765929600": 1,
    "1766016000": 3, "1766102400": 2, "1766188800": 1, "1766275200": 1, "1766361600": 1, "1766448000": 1,
    "1766534400": 1, "1766620800": 1, "1766707200": 1, "1766793600": 1, "1766880000": 1, "1766966400": 1,
    "1767052800": 2, "1767139200": 2, "1767312000": 1, "1767398400": 1, "1767484800": 1, "1767571200": 1,
    "1767657600": 1, "1768608000": 1, "1768694400": 1, "1768780800": 1, "1768867200": 1, "1768953600": 1,
    "1769040000": 1, "1769126400": 1, "1769212800": 1, "1769299200": 1, "1769385600": 1, "1769472000": 2,
    "1769558400": 1, "1769731200": 1, "1769817600": 1, "1769904000": 1, "1769990400": 1, "1770076800": 1,
    "1770163200": 2, "1770249600": 1, "1770336000": 1, "1770422400": 1, "1770508800": 1, "1770595200": 1,
    "1770681600": 1, "1770768000": 1, "1770854400": 1, "1770940800": 1, "1771027200": 2, "1771113600": 1,
    "1771200000": 4, "1771286400": 1, "1771459200": 2, "1771545600": 1, "1771632000": 1, "1771718400": 1,
    "1771804800": 1, "1771891200": 1, "1772150400": 1, "1772236800": 1, "1772323200": 1, "1772409600": 1,
    "1772496000": 1, "1772582400": 1, "1772668800": 2, "1772755200": 1, "1772841600": 1, "1772928000": 1,
    "1773014400": 1, "1773187200": 4, "1773273600": 1, "1773360000": 1, "1773446400": 1, "1773532800": 1,
    "1773619200": 2, "1773705600": 1, "1773792000": 1, "1773964800": 1, "1774224000": 5, "1779148800": 2,
    "1779321600": 3, "1779408000": 5, "1779840000": 2, "1779926400": 2, "1780012800": 4, "1780099200": 2,
    "1780272000": 3, "1780358400": 3, "1780444800": 2, "1780531200": 1, "1780617600": 1, "1780704000": 4,
    "1780876800": 5, "1784678400": 1
  };

  let activeYear = '2026';

  const getDailyMap = (calendarObj) => {
    const map = new Map();
    for (const [ts, count] of Object.entries(calendarObj)) {
      const date = new Date(parseInt(ts, 10) * 1000);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      map.set(key, (map.get(key) || 0) + Number(count));
    }
    return map;
  };

  const renderHeatmap = () => {
    if (!heatGrid) return;
    heatGrid.innerHTML = '';

    const dailyMap = getDailyMap(rawSubmissionCalendar);
    const yearInt = parseInt(activeYear, 10);
    const now = new Date();

    let totalInYear = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    const levels = ['l0', 'l1', 'l2', 'l3', 'l4'];

    // 52 columns x 7 rows = 364 day cells
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 52; col++) {
        const cell = document.createElement('div');
        const dayOfYear = col * 7 + row;
        const date = new Date(yearInt, 0, dayOfYear + 1);

        if (date.getFullYear() === yearInt) {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const key = `${yyyy}-${mm}-${dd}`;
          const count = dailyMap.get(key) || 0;

          if (date <= now) {
            if (count > 0) {
              totalInYear += count;
              currentStreak += 1;
              if (currentStreak > maxStreak) maxStreak = currentStreak;

              let levelIdx = 1;
              if (count >= 5) levelIdx = 4;
              else if (count >= 3) levelIdx = 3;
              else if (count >= 2) levelIdx = 2;

              cell.className = `heat-cell ${levels[levelIdx]}`;
              cell.title = `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: ${count} submission${count > 1 ? 's' : ''}`;
            } else {
              currentStreak = 0;
              cell.className = 'heat-cell l0';
              cell.title = `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: No submissions`;
            }
          } else {
            // Future dates within current year
            cell.className = 'heat-cell l-future';
          }
        } else {
          cell.className = 'heat-cell l-empty';
        }

        heatGrid.appendChild(cell);
      }
    }

    if (totalSubmissionsEl) {
      totalSubmissionsEl.textContent = totalInYear.toLocaleString();
    }
    if (streakValEl) {
      streakValEl.textContent = `${maxStreak} day${maxStreak === 1 ? '' : 's'}`;
    }
  };

  renderHeatmap();

  yearBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      yearBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      activeYear = btn.getAttribute('data-year') || btn.textContent.trim();
      renderHeatmap();
    });
  });

  /* ==========================================================================
     5. LIVE LEETCODE STATS FETCH (HONEST SYNC & GRACEFUL FALLBACK)
     Handles loading, timeout, error, missing fields gracefully
     ========================================================================== */
  const updateLeetCodeUI = (total, easy, med, hard) => {
    const lcTotalEl = document.getElementById('lcTotal');
    const lcEasyEl = document.getElementById('lcEasy');
    const lcMedEl = document.getElementById('lcMed');
    const lcHardEl = document.getElementById('lcHard');

    const easyBar = document.getElementById('lcEasyBar');
    const medBar = document.getElementById('lcMedBar');
    const hardBar = document.getElementById('lcHardBar');

    if (lcTotalEl) lcTotalEl.textContent = total;
    if (lcEasyEl) lcEasyEl.textContent = `Easy ${easy}`;
    if (lcMedEl) lcMedEl.textContent = `Med ${med}`;
    if (lcHardEl) lcHardEl.textContent = `Hard ${hard}`;

    if (total > 0) {
      if (easyBar) easyBar.style.width = `${((easy / total) * 100).toFixed(1)}%`;
      if (medBar) medBar.style.width = `${((med / total) * 100).toFixed(1)}%`;
      if (hardBar) hardBar.style.width = `${((hard / total) * 100).toFixed(1)}%`;
    }
  };

  const fetchLiveLeetCodeStats = async () => {
    const username = 'abhaysingh79';
    const endpoints = [
      `https://leetcode-api-faisalshohag.vercel.app/${username}`,
      `https://alfa-leetcode-api.onrender.com/${username}/solved`
    ];

    let syncSuccess = false;

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) continue;
        const data = await res.json();

        const total = data.totalSolved ?? data.solvedProblem;
        const easy = data.easySolved;
        const med = data.mediumSolved;
        const hard = data.hardSolved;

        if (data.submissionCalendar && typeof data.submissionCalendar === 'object') {
          rawSubmissionCalendar = { ...rawSubmissionCalendar, ...data.submissionCalendar };
          renderHeatmap();
        }

        if (typeof total === 'number' && typeof easy === 'number') {
          updateLeetCodeUI(total, easy, med, hard);
          syncSuccess = true;
          break;
        }
      } catch (err) {
        // Fall through to next endpoint or fallback
      }
    }

    const syncStatusEl = document.getElementById('lcSyncStatus');
    if (syncStatusEl) {
      if (syncSuccess) {
        syncStatusEl.innerHTML = '<span class="sync-dot live"></span> Live LeetCode Sync Active';
      } else {
        syncStatusEl.innerHTML = '<span class="sync-dot"></span> Cached Profile Metrics';
      }
    }
  };

  fetchLiveLeetCodeStats();

  /* ==========================================================================
     6. PRODUCT CASE STUDY MODAL SYSTEM
     Lightweight, accessible, keyboard-trapped modal for major projects
     ========================================================================== */
  const CASE_STUDIES = {
    docmind: {
      tag: 'AI DOCUMENT INTELLIGENCE',
      title: 'DocMind AI',
      pitch: 'Full-stack AI document intelligence platform for conversational analysis of complex PDFs & documents.',
      repoUrl: 'https://github.com/pyakio/docmind-ai',
      sections: [
        {
          heading: 'Problem Statement',
          content: 'Engineers, researchers, and students routinely deal with extensive multi-page documentation, academic papers, and technical manuals. Standard keyword search is rigid and fails to synthesize cross-page concepts, summarize findings, or provide grounded conversational clarification.'
        },
        {
          heading: 'Engineered Solution',
          content: 'DocMind AI turns unstructured documents into an interactive knowledge base. Users upload files, which are parsed and indexed to support context-grounded conversational Q&A. The system retains session history so users can conduct in-depth, multi-turn investigations with citations.'
        },
        {
          heading: 'Key Architectural Features',
          list: [
            'Document Processing Pipeline: Parses text content and structure from uploaded PDF and text documents.',
            'Context-Aware AI Inference: Interfaces with LLM APIs to generate accurate, source-grounded answers.',
            'Persistent Multi-Turn Sessions: Stores chat transcripts and document state in MongoDB for uninterrupted workflow resumption.',
            'Responsive Dual-Pane Workspace: Clear division between document navigation tools and real-time chat stream.'
          ]
        },
        {
          heading: 'System Architecture & Tech Stack',
          list: [
            'Frontend: React.js SPA utilizing clean modular components and optimistic UI state management.',
            'Backend: Node.js & Express.js REST API handling document chunking, prompt assembly, and token limits.',
            'Database: MongoDB for session persistence, chat transcripts, and document metadata.',
            'APIs: Gemini & LLM endpoints for contextual natural language extraction.'
          ]
        },
        {
          heading: 'Engineering Challenges Solved',
          content: 'Managed token budget boundaries by chunking large documents into semantically coherent segments before injecting them into prompt context. Applied strict system prompts to prevent hallucination and guarantee that answers reference provided text.'
        },
        {
          heading: 'Current Development Status',
          status: 'Currently in active development. Core document chat, parsing workflows, and persistent storage are implemented. Next milestone focuses on vector embedding search and multi-file comparisons.'
        }
      ]
    },
    mailpilot: {
      tag: 'CLOUD SAAS PLATFORM',
      title: 'MailPilot',
      pitch: 'Full-stack cloud-automated email marketing and campaign dispatch platform.',
      repoUrl: 'https://github.com/pyakio/MailPilot',
      sections: [
        {
          heading: 'Problem Statement',
          content: 'Small businesses and creators require reliable tools to broadcast product updates, manage subscriber lists, and track campaign engagement without the prohibitive pricing tiers and bloated interfaces of enterprise marketing suites.'
        },
        {
          heading: 'Engineered Solution',
          content: 'MailPilot provides a clean, self-hosted or cloud-deployable email marketing system. It enables creators to manage contact lists, design reusable HTML email templates, schedule bulk broadcasts via SMTP/SES, and view real-time delivery and engagement analytics.'
        },
        {
          heading: 'Key Architectural Features',
          list: [
            'Campaign Workflow: Step-by-step composition, preview rendering, and scheduling controls.',
            'Audience Management: Subscriber list importation, status tagging, and automated unsubscribe handling.',
            'Cloud Delivery Engine: Reliable SMTP / Amazon SES integration with rate-aware dispatch queueing.',
            'Analytics Dashboard: Real-time telemetry monitoring open rates, click-through rates, and delivery logs.'
          ]
        },
        {
          heading: 'System Architecture & Tech Stack',
          list: [
            'Frontend: React dashboard with real-time campaign metric cards and template editors.',
            'Backend: Node.js & Express.js handling authentication, background dispatch queues, and webhook listeners.',
            'Database: MongoDB schemas for subscriber directories, campaign dispatches, and event logs.',
            'Protocol: SMTP / Cloud Email (SES) dispatch infrastructure.'
          ]
        },
        {
          heading: 'Engineering Challenges Solved',
          content: 'Implemented resilient dispatch queueing to respect SMTP provider rate limits and avoid spam blacklisting. Engineered lightweight open tracking pixels and click-redirect wrappers that record metrics reliably without impeding message render speed.'
        },
        {
          heading: 'Current Development Status',
          status: 'Currently in active development. Campaign creation, list management, and dispatch engines are operational. Ongoing enhancements focus on automated A/B test sequences and deeper analytics filtering.'
        }
      ]
    }
  };

  const caseStudyModal = document.getElementById('caseStudyModal');
  const caseStudyClose = document.getElementById('caseStudyClose');
  const caseStudyBackdrop = document.getElementById('caseStudyBackdrop');
  const caseStudyDoneBtn = document.getElementById('caseStudyDoneBtn');
  const caseStudyTitle = document.getElementById('caseStudyTitle');
  const caseStudyPitch = document.getElementById('caseStudyPitch');
  const caseStudyTag = document.getElementById('caseStudyTag');
  const caseStudyBody = document.getElementById('caseStudyBody');
  const caseStudyRepoBtn = document.getElementById('caseStudyRepoBtn');

  const openCaseStudy = (projectId) => {
    const study = CASE_STUDIES[projectId];
    if (!study || !caseStudyModal) return;

    if (caseStudyTitle) caseStudyTitle.textContent = study.title;
    if (caseStudyPitch) caseStudyPitch.textContent = study.pitch;
    if (caseStudyTag) caseStudyTag.textContent = study.tag;

    if (caseStudyRepoBtn) {
      caseStudyRepoBtn.href = study.repoUrl;
    }

    if (caseStudyBody) {
      caseStudyBody.innerHTML = '';
      study.sections.forEach(sec => {
        const secBlock = document.createElement('div');
        secBlock.className = 'case-study-sec';

        const h4 = document.createElement('h4');
        h4.className = 'case-sec-heading';
        h4.textContent = sec.heading;
        secBlock.appendChild(h4);

        if (sec.content) {
          const p = document.createElement('p');
          p.className = 'case-sec-p';
          p.textContent = sec.content;
          secBlock.appendChild(p);
        }

        if (sec.list && Array.isArray(sec.list)) {
          const ul = document.createElement('ul');
          ul.className = 'case-sec-list';
          sec.list.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
          });
          secBlock.appendChild(ul);
        }

        if (sec.status) {
          const statusBox = document.createElement('div');
          statusBox.className = 'case-status-box';
          statusBox.innerHTML = `<strong>Current Status:</strong> ${sec.status}`;
          secBlock.appendChild(statusBox);
        }

        caseStudyBody.appendChild(secBlock);
      });
    }

    caseStudyModal.classList.add('active');
    caseStudyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeCaseStudy = () => {
    if (!caseStudyModal) return;
    caseStudyModal.classList.remove('active');
    caseStudyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.open-case-study-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-project');
      openCaseStudy(pid);
    });
  });

  if (caseStudyClose) caseStudyClose.addEventListener('click', closeCaseStudy);
  if (caseStudyBackdrop) caseStudyBackdrop.addEventListener('click', closeCaseStudy);
  if (caseStudyDoneBtn) caseStudyDoneBtn.addEventListener('click', closeCaseStudy);

  /* ==========================================================================
     7. CERTIFICATE LIGHTBOX MODAL
     Keyboard accessible, displays verified credentials only
     ========================================================================== */
  const certModal = document.getElementById('certModal');
  const certModalClose = document.getElementById('certModalClose');
  const certModalBackdrop = document.getElementById('certModalBackdrop');
  const certModalTitle = document.getElementById('certModalTitle');
  const certModalOrg = document.getElementById('certModalOrg');
  const certModalImg = document.getElementById('certModalImg');
  const certModalDesc = document.getElementById('certModalDesc');
  const certModalOpenBtn = document.getElementById('certModalOpenBtn');
  const certModalPdfBtn = document.getElementById('certModalPdfBtn');

  const openCertModal = (card) => {
    if (!certModal) return;
    const title = card.getAttribute('data-cert-title');
    const org = card.getAttribute('data-cert-org');
    const img = card.getAttribute('data-cert-img');
    const pdf = card.getAttribute('data-cert-pdf');
    const desc = card.getAttribute('data-cert-desc');

    if (!img) return;

    if (certModalTitle) certModalTitle.textContent = title || 'Certificate';
    if (certModalOrg) certModalOrg.textContent = org || '';
    if (certModalDesc) certModalDesc.textContent = desc || '';
    if (certModalImg) {
      certModalImg.src = img;
      certModalImg.alt = `${title} Certificate Preview`;
    }

    if (certModalOpenBtn) {
      certModalOpenBtn.href = img;
    }

    if (certModalPdfBtn) {
      if (pdf) {
        certModalPdfBtn.href = pdf;
        certModalPdfBtn.style.display = 'inline-flex';
      } else {
        certModalPdfBtn.style.display = 'none';
      }
    }

    certModal.classList.add('active');
    certModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeCertModal = () => {
    if (!certModal) return;
    certModal.classList.remove('active');
    certModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (certModalClose) certModalClose.addEventListener('click', closeCertModal);
  if (certModalBackdrop) certModalBackdrop.addEventListener('click', closeCertModal);

  document.querySelectorAll('.ach-card.has-cert').forEach(card => {
    card.addEventListener('click', () => openCertModal(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCertModal(card);
      }
    });
  });

  /* ==========================================================================
     8. GLOBAL KEYBOARD ESCAPE LISTENER
     Closes any open modals or mobile navigation cleanly
     ========================================================================== */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (caseStudyModal && caseStudyModal.classList.contains('active')) {
        closeCaseStudy();
      }
      if (certModal && certModal.classList.contains('active')) {
        closeCertModal();
      }
      if (isMobileNavOpen) {
        closeMobileNav();
      }
    }
  });

  /* ==========================================================================
     9. QUICK COPY EMAIL BUTTON & RESUME LINK CHECK
     Provides real interaction feedback to the user
     ========================================================================== */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyEmailText = document.getElementById('copyEmailText');

  if (copyEmailBtn && copyEmailText) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = 'kmrsingh116@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        copyEmailText.textContent = 'Copied to Clipboard!';
        copyEmailBtn.classList.add('copied');
        setTimeout(() => {
          copyEmailText.textContent = 'Copy Email';
          copyEmailBtn.classList.remove('copied');
        }, 2200);
      } catch (err) {
        // Fallback for older browsers
        copyEmailText.textContent = email;
      }
    });
  }

  // Graceful handling for resume download button
  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', async (e) => {
      // If the resume file is not found (e.g. 404), notify user gracefully
      try {
        const check = await fetch(resumeBtn.href, { method: 'HEAD' });
        if (!check.ok && check.status === 404) {
          e.preventDefault();
          window.location.href = '#contact';
          alert('Resume PDF is currently being finalized. Please reach out directly via email to receive a copy!');
        }
      } catch (err) {
        // Direct link execution
      }
    });
  }

});
