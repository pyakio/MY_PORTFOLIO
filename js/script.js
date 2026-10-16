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
  const LEETCODE_USERNAME = window.PORTFOLIO_CONFIG?.LEETCODE_USERNAME || 'abhaysingh79';

  const heatGrid = document.getElementById('heatGrid');
  const totalSubmissionsEl = document.getElementById('totalSubmissions');
  const streakValEl = document.getElementById('streakVal');
  const yearBtns = document.querySelectorAll('.year-btn');
  const statsFallbackMsg = document.getElementById('statsFallbackMsg');
  const lcRefreshBtn = document.getElementById('lcRefreshBtn');
  const lcRetryBtn = document.getElementById('lcRetryBtn');

  let activeYear = '2026';
  let currentLeetCodeProfile = null;
  let isSyncing = false;
  let autoSyncIntervalId = null;

  // Format relative time helper (e.g., 'Just now', '5m ago', '2h ago')
  const formatRelativeTime = (timestampMs) => {
    if (!timestampMs) return '';
    const diffSec = Math.floor((Date.now() - timestampMs) / 1000);
    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  };

  // Format submission date helper
  const formatSubmissionDate = (ts) => {
    if (!ts) return '';
    const date = new Date(parseInt(ts, 10) * 1000);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Convert raw submissionCalendar timestamps to daily Map (YYYY-MM-DD -> count)
  const getDailyMap = (calendarObj) => {
    const map = new Map();
    if (!calendarObj || typeof calendarObj !== 'object') return map;
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

  // Render weekly-aligned 53-col x 7-row LeetCode heatmap
  const renderHeatmap = (calendarObj = {}, streakOverride = null) => {
    if (!heatGrid) return;
    heatGrid.innerHTML = '';

    const dailyMap = getDailyMap(calendarObj);
    const yearInt = parseInt(activeYear, 10);
    const now = new Date();

    const jan1 = new Date(yearInt, 0, 1);
    const jan1Day = jan1.getDay(); // 0 = Sunday, 6 = Saturday

    let totalInYear = 0;
    let currentStreakInYear = 0;
    let maxStreakInYear = 0;

    const levels = ['l0', 'l1', 'l2', 'l3', 'l4'];

    // Standard 53 weeks x 7 weekdays (Sunday to Saturday)
    for (let col = 0; col < 53; col++) {
      for (let row = 0; row < 7; row++) {
        const cell = document.createElement('div');
        const dayOffset = (col * 7 + row) - jan1Day;
        const cellDate = new Date(yearInt, 0, 1 + dayOffset);

        if (cellDate.getFullYear() === yearInt) {
          const yyyy = cellDate.getFullYear();
          const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
          const dd = String(cellDate.getDate()).padStart(2, '0');
          const key = `${yyyy}-${mm}-${dd}`;
          const count = dailyMap.get(key) || 0;

          if (cellDate <= now) {
            if (count > 0) {
              totalInYear += count;
              currentStreakInYear += 1;
              if (currentStreakInYear > maxStreakInYear) maxStreakInYear = currentStreakInYear;

              let levelIdx = 1;
              if (count >= 5) levelIdx = 4;
              else if (count >= 3) levelIdx = 3;
              else if (count >= 2) levelIdx = 2;

              cell.className = `heat-cell ${levels[levelIdx]}`;
              cell.title = `${cellDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: ${count} submission${count > 1 ? 's' : ''}`;
            } else {
              currentStreakInYear = 0;
              cell.className = 'heat-cell l0';
              cell.title = `${cellDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: No submissions`;
            }
          } else {
            // Future date in current year
            cell.className = 'heat-cell l-future';
            cell.title = `${cellDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: Future`;
          }
        } else {
          // Empty padding cell outside the target year
          cell.className = 'heat-cell l-empty';
        }

        heatGrid.appendChild(cell);
      }
    }

    if (totalSubmissionsEl) {
      totalSubmissionsEl.textContent = totalInYear.toLocaleString();
    }
    if (streakValEl) {
      const displayStreak = (streakOverride !== null && streakOverride !== undefined && streakOverride > 0)
        ? streakOverride
        : maxStreakInYear;
      streakValEl.textContent = `${displayStreak} day${displayStreak === 1 ? '' : 's'}`;
    }
  };

  yearBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      yearBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      activeYear = btn.getAttribute('data-year') || btn.textContent.trim();
      renderHeatmap(
        currentLeetCodeProfile?.submissionCalendar || {},
        currentLeetCodeProfile?.streak
      );
    });
  });

  /* ==========================================================================
     5. LIVE LEETCODE STATS FETCH & UI CONTROLLER
     ========================================================================== */
  const updateSyncStatusUI = (status, text, lastSynced) => {
    const syncDot = document.getElementById('lcSyncDot');
    const syncText = document.getElementById('lcSyncText');
    const syncTime = document.getElementById('lcLastSynced');

    if (syncDot) {
      syncDot.className = `sync-dot ${status}`;
    }
    if (syncText) {
      syncText.textContent = text;
    }
    if (syncTime) {
      syncTime.textContent = lastSynced ? `Synced ${formatRelativeTime(lastSynced)}` : '';
    }
  };

  const updateLeetCodeUI = (profile) => {
    if (!profile) return;

    // Elements
    const lcTotalEl = document.getElementById('lcTotal');
    const lcTotalLabelEl = document.getElementById('lcTotalLabel');
    const lcEasyEl = document.getElementById('lcEasy');
    const lcMedEl = document.getElementById('lcMed');
    const lcHardEl = document.getElementById('lcHard');

    const lcEasyProgress = document.getElementById('lcEasyProgress');
    const lcMedProgress = document.getElementById('lcMedProgress');
    const lcHardProgress = document.getElementById('lcHardProgress');

    const easyBar = document.getElementById('lcEasyBar');
    const medBar = document.getElementById('lcMedBar');
    const hardBar = document.getElementById('lcHardBar');

    const lcAvatar = document.getElementById('lcAvatar');
    const lcRealName = document.getElementById('lcRealName');
    const lcUsername = document.getElementById('lcUsername');
    const lcGlobalRank = document.getElementById('lcGlobalRank');
    const lcContestRating = document.getElementById('lcContestRating');
    const lcProfileLink = document.getElementById('lcProfileLink');

    const lcBadgesSection = document.getElementById('lcBadgesSection');
    const lcBadgesGrid = document.getElementById('lcBadgesGrid');
    const lcRecentSection = document.getElementById('lcRecentSection');
    const lcRecentList = document.getElementById('lcRecentList');

    const total = profile.totalSolved || 0;
    const totalQ = profile.totalQuestions || 4082;
    const easy = profile.easySolved || 0;
    const totalEasy = profile.totalEasy || 971;
    const med = profile.mediumSolved || 0;
    const totalMed = profile.totalMedium || 2128;
    const hard = profile.hardSolved || 0;
    const totalHard = profile.totalHard || 983;

    // 1. Solved counts & overall progress
    if (lcTotalEl) lcTotalEl.textContent = total.toLocaleString();
    if (lcTotalLabelEl) {
      const overallPct = totalQ > 0 ? ((total / totalQ) * 100).toFixed(1) : '0.0';
      lcTotalLabelEl.textContent = `Problems Solved out of ${totalQ.toLocaleString()} (${overallPct}%)`;
    }

    // 2. Difficulty Breakdown Counts & Individual Progress Bars
    if (lcEasyEl) lcEasyEl.textContent = `${easy.toLocaleString()} / ${totalEasy.toLocaleString()}`;
    if (lcMedEl) lcMedEl.textContent = `${med.toLocaleString()} / ${totalMed.toLocaleString()}`;
    if (lcHardEl) lcHardEl.textContent = `${hard.toLocaleString()} / ${totalHard.toLocaleString()}`;

    if (lcEasyProgress) lcEasyProgress.style.width = `${((easy / totalEasy) * 100).toFixed(1)}%`;
    if (lcMedProgress) lcMedProgress.style.width = `${((med / totalMed) * 100).toFixed(1)}%`;
    if (lcHardProgress) lcHardProgress.style.width = `${((hard / totalHard) * 100).toFixed(1)}%`;

    // 3. Composite Difficulty Distribution Bar
    if (total > 0) {
      if (easyBar) easyBar.style.width = `${((easy / total) * 100).toFixed(1)}%`;
      if (medBar) medBar.style.width = `${((med / total) * 100).toFixed(1)}%`;
      if (hardBar) hardBar.style.width = `${((hard / total) * 100).toFixed(1)}%`;
    }

    // 4. Profile Information Snippet
    if (lcRealName && profile.realName) lcRealName.textContent = profile.realName;
    if (lcUsername && profile.username) lcUsername.textContent = `@${profile.username}`;
    if (lcAvatar && profile.userAvatar) lcAvatar.src = profile.userAvatar;
    if (lcProfileLink && profile.profileUrl) lcProfileLink.href = profile.profileUrl;

    if (lcGlobalRank) {
      lcGlobalRank.textContent = profile.ranking ? `Rank #${profile.ranking.toLocaleString()}` : 'Unranked';
    }

    if (lcContestRating) {
      if (profile.contest && profile.contest.rating) {
        lcContestRating.textContent = `Rating: ${profile.contest.rating}`;
      } else {
        lcContestRating.textContent = 'Contest: Unrated';
      }
    }

    // 5. Badges
    if (lcBadgesSection && lcBadgesGrid) {
      if (Array.isArray(profile.badges) && profile.badges.length > 0) {
        lcBadgesGrid.innerHTML = '';
        profile.badges.forEach(b => {
          const badgeEl = document.createElement('div');
          badgeEl.className = 'lc-badge-item';
          badgeEl.title = b.displayName;
          if (b.icon) {
            const img = document.createElement('img');
            img.src = b.icon;
            img.alt = b.displayName;
            img.width = 20;
            img.height = 20;
            img.loading = 'lazy';
            badgeEl.appendChild(img);
          }
          const span = document.createElement('span');
          span.textContent = b.displayName;
          badgeEl.appendChild(span);
          lcBadgesGrid.appendChild(badgeEl);
        });
        lcBadgesSection.style.display = 'block';
      } else {
        lcBadgesSection.style.display = 'none';
      }
    }

    // 6. Recent Accepted Submissions
    if (lcRecentSection && lcRecentList) {
      if (Array.isArray(profile.recentSubmissions) && profile.recentSubmissions.length > 0) {
        lcRecentList.innerHTML = '';
        profile.recentSubmissions.slice(0, 5).forEach(sub => {
          const a = document.createElement('a');
          a.className = 'lc-recent-item';
          a.href = sub.url || `https://leetcode.com/problems/${sub.titleSlug}/`;
          a.target = '_blank';
          a.rel = 'noopener';

          const titleSpan = document.createElement('span');
          titleSpan.className = 'lc-recent-title';
          titleSpan.textContent = sub.title;

          const metaSpan = document.createElement('span');
          metaSpan.className = 'lc-recent-meta';
          metaSpan.textContent = formatSubmissionDate(sub.timestamp);

          a.appendChild(titleSpan);
          a.appendChild(metaSpan);
          lcRecentList.appendChild(a);
        });
        lcRecentSection.style.display = 'block';
      } else {
        lcRecentSection.style.display = 'none';
      }
    }

    // 7. Render Heatmap with verified calendar
    renderHeatmap(profile.submissionCalendar || {}, profile.streak);
  };

  // Main synchronization controller
  const syncLeetCodeData = async ({ forceRefresh = false } = {}) => {
    if (isSyncing) return;
    isSyncing = true;

    if (lcRefreshBtn) {
      lcRefreshBtn.disabled = true;
      lcRefreshBtn.classList.add('spinning');
    }

    updateSyncStatusUI('syncing', 'Syncing with LeetCode...', currentLeetCodeProfile?.lastSynced);

    const errorBanner = document.getElementById('lcErrorBanner');
    const errorMsg = document.getElementById('lcErrorMsg');

    try {
      if (typeof window.LeetCodeService === 'undefined') {
        throw new Error('LeetCodeService module is not loaded');
      }

      const result = await window.LeetCodeService.getLeetCodeProfile({
        username: LEETCODE_USERNAME,
        forceRefresh
      });

      currentLeetCodeProfile = result.data;
      updateLeetCodeUI(currentLeetCodeProfile);

      if (errorBanner) errorBanner.style.display = 'none';
      if (statsFallbackMsg) statsFallbackMsg.style.display = 'none';

      if (result.isStale) {
        updateSyncStatusUI('stale', 'Cached Profile Metrics (Offline)', currentLeetCodeProfile.lastSynced);
      } else {
        updateSyncStatusUI('live', 'Live Synced with LeetCode API', currentLeetCodeProfile.lastSynced);
      }
    } catch (err) {
      console.warn('LeetCode live sync failed:', err.message);

      if (currentLeetCodeProfile) {
        // We already have cached data on screen: keep displaying it
        updateSyncStatusUI('stale', 'Cached Profile Metrics', currentLeetCodeProfile.lastSynced);
      } else {
        // No cached data available at all: show honest error state
        updateSyncStatusUI('error', 'Sync Unavailable', null);
        if (errorBanner) {
          if (errorMsg) errorMsg.textContent = 'Could not sync live LeetCode stats. Check network connection.';
          errorBanner.style.display = 'flex';
        }
        if (statsFallbackMsg) statsFallbackMsg.style.display = 'flex';
      }
    } finally {
      isSyncing = false;
      if (lcRefreshBtn) {
        lcRefreshBtn.disabled = false;
        lcRefreshBtn.classList.remove('spinning');
      }
    }
  };

  // Wire manual refresh and retry controls
  if (lcRefreshBtn) {
    lcRefreshBtn.addEventListener('click', () => {
      syncLeetCodeData({ forceRefresh: true });
    });
  }

  if (lcRetryBtn) {
    lcRetryBtn.addEventListener('click', () => {
      syncLeetCodeData({ forceRefresh: true });
    });
  }

  // Initial load: render cache immediately for instant UI paint, then background sync
  if (typeof window.LeetCodeService !== 'undefined') {
    const cached = window.LeetCodeService.getCachedProfile(LEETCODE_USERNAME);
    if (cached && cached.data) {
      currentLeetCodeProfile = cached.data;
      updateLeetCodeUI(currentLeetCodeProfile);
      updateSyncStatusUI('live', 'Cached Profile Metrics', cached.timestamp);
    }
  }

  // Trigger sync
  syncLeetCodeData({ forceRefresh: false });

  // Automatic periodic sync every 10 minutes when tab is visible
  if (autoSyncIntervalId) clearInterval(autoSyncIntervalId);
  autoSyncIntervalId = setInterval(() => {
    if (!document.hidden) {
      syncLeetCodeData({ forceRefresh: false });
    }
  }, 10 * 60 * 1000);

  // Tab visibility change: sync if data is stale when user re-focuses tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && currentLeetCodeProfile) {
      const age = Date.now() - (currentLeetCodeProfile.lastSynced || 0);
      if (age > 10 * 60 * 1000) {
        syncLeetCodeData({ forceRefresh: false });
      }
    }
  });

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
