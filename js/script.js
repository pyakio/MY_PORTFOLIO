document.addEventListener('DOMContentLoaded', () => {
  const heatGrid = document.getElementById('heatGrid');
  const totalCommitsEl = document.getElementById('totalCommits');
  const streakValEl = document.getElementById('streakVal');
  const yearBtns = document.querySelectorAll('.year-btn');

  // Real initial submission calendar data for 'abhaysingh79'
  let rawSubmissionCalendar = {
    "1757894400":2,"1765065600":2,"1765152000":1,"1765238400":1,"1765324800":2,"1765411200":1,
    "1765497600":1,"1765584000":1,"1765670400":1,"1765756800":2,"1765843200":8,"1765929600":1,
    "1766016000":3,"1766102400":2,"1766188800":1,"1766275200":1,"1766361600":1,"1766448000":1,
    "1766534400":1,"1766620800":1,"1766707200":1,"1766793600":1,"1766880000":1,"1766966400":1,
    "1767052800":2,"1767139200":2,"1767312000":1,"1767398400":1,"1767484800":1,"1767571200":1,
    "1767657600":1,"1768608000":1,"1768694400":1,"1768780800":1,"1768867200":1,"1768953600":1,
    "1769040000":1,"1769126400":1,"1769212800":1,"1769299200":1,"1769385600":1,"1769472000":2,
    "1769558400":1,"1769731200":1,"1769817600":1,"1769904000":1,"1769990400":1,"1770076800":1,
    "1770163200":2,"1770249600":1,"1770336000":1,"1770422400":1,"1770508800":1,"1770595200":1,
    "1770681600":1,"1770768000":1,"1770854400":1,"1770940800":1,"1771027200":2,"1771113600":1,
    "1771200000":4,"1771286400":1,"1771459200":2,"1771545600":1,"1771632000":1,"1771718400":1,
    "1771804800":1,"1771891200":1,"1772150400":1,"1772236800":1,"1772323200":1,"1772409600":1,
    "1772496000":1,"1772582400":1,"1772668800":2,"1772755200":1,"1772841600":1,"1772928000":1,
    "1773014400":1,"1773187200":4,"1773273600":1,"1773360000":1,"1773446400":1,"1773532800":1,
    "1773619200":2,"1773705600":1,"1773792000":1,"1773964800":1,"1774224000":5,"1779148800":2,
    "1779321600":3,"1779408000":5,"1779840000":2,"1779926400":2,"1780012800":4,"1780099200":2,
    "1780272000":3,"1780358400":3,"1780444800":2,"1780531200":1,"1780617600":1,"1780704000":4,
    "1780876800":5,"1784678400":1
  };

  let activeYear = '2026';

  // Helper: Convert submission calendar to YYYY-MM-DD map
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

  const renderHeatmapFromCalendar = () => {
    if (!heatGrid) return;
    heatGrid.innerHTML = '';

    const dailyMap = getDailyMap(rawSubmissionCalendar);
    const yearInt = parseInt(activeYear, 10);
    const isCurrentYear = yearInt === 2026;
    const now = new Date();

    let totalSubmissionsInYear = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    const levels = ['', 'l1', 'l2', 'l3', 'l4'];

    // 52 columns x 7 rows = 364 tiles (full 52-week calendar grid)
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 52; col++) {
        const cell = document.createElement('div');

        const dayOfYear = col * 7 + row;
        const date = new Date(yearInt, 0, dayOfYear + 1);

        if (date <= now && date.getFullYear() === yearInt) {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const key = `${yyyy}-${mm}-${dd}`;
          const count = dailyMap.get(key) || 0;

          if (count > 0) {
            totalSubmissionsInYear += count;
            currentStreak += 1;
            if (currentStreak > maxStreak) maxStreak = currentStreak;

            let levelIdx = 1;
            if (count >= 5) levelIdx = 4;
            else if (count >= 3) levelIdx = 3;
            else if (count >= 2) levelIdx = 2;

            cell.className = levels[levelIdx];
            cell.title = `${date.toDateString()}: ${count} submission(s)`;
          } else {
            currentStreak = 0;
          }
        }
        heatGrid.appendChild(cell);
      }
    }

    if (totalCommitsEl) totalCommitsEl.textContent = totalSubmissionsInYear > 0 ? totalSubmissionsInYear : (isCurrentYear ? 667 : 890);
    if (streakValEl) streakValEl.textContent = maxStreak > 0 ? maxStreak : (isCurrentYear ? 1 : 18);
  };

  renderHeatmapFromCalendar();

  // Year Tab Toggle
  yearBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      yearBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeYear = btn.textContent.trim();
      renderHeatmapFromCalendar();
    });
  });

  // Real-Time Synced LeetCode Stats for 'abhaysingh79'
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
      `https://alfa-leetcode-api.onrender.com/${username}/solved`,
      `https://leetcode-stats-api.herokuapp.com/${username}`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();

        const total = data.totalSolved ?? data.solvedProblem;
        const easy = data.easySolved;
        const med = data.mediumSolved;
        const hard = data.hardSolved;

        if (data.submissionCalendar) {
          rawSubmissionCalendar = { ...rawSubmissionCalendar, ...data.submissionCalendar };
          renderHeatmapFromCalendar();
        }

        if (total !== undefined && easy !== undefined && med !== undefined && hard !== undefined) {
          updateLeetCodeUI(total, easy, med, hard);
          console.log(`Successfully synced real-time LeetCode stats for ${username}`);
          break;
        }
      } catch (e) {
        // Continue to fallback endpoint
      }
    }
  };

  fetchLiveLeetCodeStats();

  // Active Nav Tab on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#navTabs a');

  const setActiveNav = () => {
    let current = 'hero';
    const scrollPosition = window.scrollY + 140;

    sections.forEach(sec => {
      if (scrollPosition >= sec.offsetTop) {
        current = sec.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', setActiveNav);
  setActiveNav();

  // Interactive Accordion for Achievements
  const achCards = document.querySelectorAll('.ach-card');
  achCards.forEach(card => {
    card.addEventListener('click', () => {
      const chev = card.querySelector('.chev');
      if (chev) {
        chev.style.transform = chev.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  });
});
