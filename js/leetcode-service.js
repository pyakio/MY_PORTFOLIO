/**
 * LeetCode Data Service & Model
 * Handles: Multi-tier API fetching, response normalization, client-side caching (localStorage),
 * request deduplication, timeouts, and error handling.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LeetCodeService = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Global Configurable Username
  const DEFAULT_USERNAME = 'abhaysingh79';
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes client cache

  // In-flight request promise map for deduplication
  const inFlightRequests = new Map();

  /**
   * Safely parse submission calendar which may be a JSON string or object
   */
  function parseSubmissionCalendar(rawCalendar) {
    if (!rawCalendar) return {};
    if (typeof rawCalendar === 'object') return rawCalendar;
    if (typeof rawCalendar === 'string') {
      try {
        return JSON.parse(rawCalendar);
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  /**
   * Universal normalizer for all LeetCode payload sources.
   * Produces a guaranteed consistent schema.
   */
  function normalizeLeetCodeData(raw, username, sourceName = 'unknown') {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid data payload received');
    }

    // 1. If payload is from /api/leetcode (already normalized)
    if (raw.source === 'official_graphql' && typeof raw.totalSolved === 'number') {
      return {
        ...raw,
        username: raw.username || username,
        isStale: !!raw._stale,
        source: 'api_proxy'
      };
    }

    // 2. If payload is direct LeetCode GraphQL
    if (raw.data && raw.data.matchedUser) {
      const user = raw.data.matchedUser;
      const profile = user.profile || {};
      const acStats = user.submitStatsGlobal?.acSubmissionNum || [];
      const totalSubStats = user.submitStatsGlobal?.totalSubmissionNum || [];
      const allCounts = raw.data.allQuestionsCount || [];
      const contest = raw.data.userContestRanking || null;
      const userCalendar = user.userCalendar || {};
      const badges = user.badges || [];
      const recentAc = raw.data.recentAcSubmissionList || [];

      const getCount = (list, diff) => {
        const item = list.find(x => x.difficulty.toLowerCase() === diff.toLowerCase());
        return item ? item.count : 0;
      };
      const getSubmissions = (list, diff) => {
        const item = list.find(x => x.difficulty.toLowerCase() === diff.toLowerCase());
        return item ? (item.submissions || 0) : 0;
      };

      return {
        username: user.username || username,
        realName: profile.realName || user.username || username,
        userAvatar: profile.userAvatar || '',
        ranking: typeof profile.ranking === 'number' ? profile.ranking : null,
        reputation: typeof profile.reputation === 'number' ? profile.reputation : 0,
        country: profile.countryName || '',
        profileUrl: `https://leetcode.com/u/${user.username || username}/`,

        totalSolved: getCount(acStats, 'All'),
        totalQuestions: getCount(allCounts, 'All'),
        easySolved: getCount(acStats, 'Easy'),
        totalEasy: getCount(allCounts, 'Easy'),
        mediumSolved: getCount(acStats, 'Medium'),
        totalMedium: getCount(allCounts, 'Medium'),
        hardSolved: getCount(acStats, 'Hard'),
        totalHard: getCount(allCounts, 'Hard'),

        totalAcSubmissions: getSubmissions(acStats, 'All'),
        totalSubmissions: getSubmissions(totalSubStats, 'All'),

        streak: typeof userCalendar.streak === 'number' ? userCalendar.streak : 0,
        totalActiveDays: typeof userCalendar.totalActiveDays === 'number' ? userCalendar.totalActiveDays : 0,
        activeYears: Array.isArray(userCalendar.activeYears) ? userCalendar.activeYears : [new Date().getFullYear()],
        submissionCalendar: parseSubmissionCalendar(userCalendar.submissionCalendar),

        contest: contest ? {
          attendedContestsCount: contest.attendedContestsCount || 0,
          rating: Math.round(contest.rating || 0),
          globalRanking: contest.globalRanking || null,
          totalParticipants: contest.totalParticipants || null,
          topPercentage: contest.topPercentage || null,
          badge: contest.badge?.name || null
        } : null,

        badges: badges.map(b => ({
          id: String(b.id || ''),
          displayName: b.displayName || '',
          icon: b.icon?.startsWith('http') ? b.icon : (b.icon ? `https://leetcode.com${b.icon}` : ''),
          creationDate: b.creationDate || ''
        })),

        recentSubmissions: recentAc.map(item => ({
          id: String(item.id || ''),
          title: item.title || '',
          titleSlug: item.titleSlug || '',
          difficulty: item.difficulty || '',
          timestamp: parseInt(item.timestamp, 10),
          statusDisplay: 'Accepted',
          url: `https://leetcode.com/problems/${item.titleSlug}/`
        })),

        lastSynced: Date.now(),
        isStale: false,
        source: 'graphql'
      };
    }

    // 3. If payload is from leetcode-api-faisalshohag.vercel.app
    if (typeof raw.totalSolved === 'number' || typeof raw.solvedProblem === 'number') {
      const totalSolved = raw.totalSolved ?? raw.solvedProblem ?? 0;
      const easySolved = raw.easySolved ?? 0;
      const mediumSolved = raw.mediumSolved ?? 0;
      const hardSolved = raw.hardSolved ?? 0;

      // Extract total available questions if available
      const totalQuestions = raw.totalQuestions ?? 4082;
      const totalEasy = raw.totalEasy ?? 971;
      const totalMedium = raw.totalMedium ?? 2128;
      const totalHard = raw.totalHard ?? 983;

      const matchedStats = raw.matchedUserStats || {};
      const acList = matchedStats.acSubmissionNum || [];
      const totalSubList = matchedStats.totalSubmissionNum || [];

      const getSubs = (list) => {
        const allItem = list.find(x => x.difficulty === 'All');
        return allItem ? allItem.submissions : totalSolved;
      };

      const calendar = parseSubmissionCalendar(raw.submissionCalendar);
      const recentSubs = Array.isArray(raw.recentSubmissions) ? raw.recentSubmissions.map((s, idx) => ({
        id: String(s.id || idx),
        title: s.title || '',
        titleSlug: s.titleSlug || '',
        difficulty: s.difficulty || '',
        timestamp: parseInt(s.timestamp, 10) || Math.floor(Date.now() / 1000),
        statusDisplay: s.statusDisplay || 'Accepted',
        url: s.titleSlug ? `https://leetcode.com/problems/${s.titleSlug}/` : ''
      })) : [];

      return {
        username: raw.username || username,
        realName: raw.name || raw.realName || username,
        userAvatar: raw.avatar || raw.userAvatar || '',
        ranking: typeof raw.ranking === 'number' ? raw.ranking : null,
        reputation: typeof raw.reputation === 'number' ? raw.reputation : 0,
        country: raw.country || '',
        profileUrl: `https://leetcode.com/u/${username}/`,

        totalSolved,
        totalQuestions,
        easySolved,
        totalEasy,
        mediumSolved,
        totalMedium,
        hardSolved,
        totalHard,

        totalAcSubmissions: getSubs(acList),
        totalSubmissions: getSubs(totalSubList),

        streak: typeof raw.streak === 'number' ? raw.streak : 0,
        totalActiveDays: typeof raw.totalActiveDays === 'number' ? raw.totalActiveDays : 0,
        activeYears: Array.isArray(raw.activeYears) ? raw.activeYears : [new Date().getFullYear()],
        submissionCalendar: calendar,

        contest: null,
        badges: Array.isArray(raw.badges) ? raw.badges : [],
        recentSubmissions: recentSubs,

        lastSynced: Date.now(),
        isStale: false,
        source: sourceName
      };
    }

    throw new Error('Unrecognized LeetCode API response structure');
  }

  /**
   * Helper to fetch with timeout
   */
  async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Reads cached profile from localStorage
   */
  function getCachedProfile(username) {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`leetcode_cache_${username}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.data || typeof parsed.timestamp !== 'number') return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  /**
   * Writes cached profile to localStorage
   */
  function setCachedProfile(username, data) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(`leetcode_cache_${username}`, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (e) {
      // Storage quota or privacy mode error - safely ignore
    }
  }

  /**
   * Fetches profile data from alfa-leetcode-api aggregator
   */
  async function fetchFromAlfaApi(username, timeoutMs = 12000) {
    const base = `https://alfa-leetcode-api.onrender.com/${username}`;
    
    // Concurrently fetch profile and calendar/badges
    const [userRes, solvedRes, calRes, badgesRes] = await Promise.allSettled([
      fetchWithTimeout(base, {}, timeoutMs),
      fetchWithTimeout(`${base}/solved`, {}, timeoutMs),
      fetchWithTimeout(`${base}/calendar`, {}, timeoutMs),
      fetchWithTimeout(`${base}/badges`, {}, timeoutMs)
    ]);

    let solvedData = {};
    if (solvedRes.status === 'fulfilled' && solvedRes.value.ok) {
      solvedData = await solvedRes.value.json();
    } else {
      throw new Error('alfa-leetcode-api solved endpoint failed');
    }

    let userData = {};
    if (userRes.status === 'fulfilled' && userRes.value.ok) {
      userData = await userRes.value.json().catch(() => ({}));
    }

    let calData = {};
    if (calRes.status === 'fulfilled' && calRes.value.ok) {
      calData = await calRes.value.json().catch(() => ({}));
    }

    let badgesData = {};
    if (badgesRes.status === 'fulfilled' && badgesRes.value.ok) {
      badgesData = await badgesRes.value.json().catch(() => ({}));
    }

    const merged = {
      username,
      name: userData.name || username,
      avatar: userData.avatar || '',
      ranking: userData.ranking || null,
      country: userData.country || '',
      totalSolved: solvedData.solvedProblem ?? 0,
      easySolved: solvedData.easySolved ?? 0,
      mediumSolved: solvedData.mediumSolved ?? 0,
      hardSolved: solvedData.hardSolved ?? 0,
      totalQuestions: 4082,
      totalEasy: 971,
      totalMedium: 2128,
      totalHard: 983,
      streak: calData.streak || 0,
      totalActiveDays: calData.totalActiveDays || 0,
      activeYears: calData.activeYears || [new Date().getFullYear()],
      submissionCalendar: calData.submissionCalendar || {},
      badges: (badgesData.badges || []).map(b => ({
        id: String(b.id || ''),
        displayName: b.displayName || '',
        icon: b.icon || '',
        creationDate: b.creationDate || ''
      }))
    };

    return normalizeLeetCodeData(merged, username, 'alfa_leetcode_api');
  }

  /**
   * Main service function: Fetches profile statistics with caching and resilient fallbacks.
   * 
   * @param {Object} options
   * @param {string} [options.username] - LeetCode username (defaults to DEFAULT_USERNAME)
   * @param {boolean} [options.forceRefresh=false] - If true, bypasses client cache
   * @param {number} [options.timeout=10000] - Request timeout in ms
   * @returns {Promise<{ data: Object, source: string, isStale: boolean, error?: string }>}
   */
  async function getLeetCodeProfile(options = {}) {
    const username = (options.username || DEFAULT_USERNAME).trim();
    const forceRefresh = !!options.forceRefresh;
    const timeout = options.timeout || 10000;

    // 1. Check local cache if not forcing refresh
    const cachedEntry = getCachedProfile(username);
    const now = Date.now();

    if (!forceRefresh && cachedEntry) {
      const age = now - cachedEntry.timestamp;
      if (age < CACHE_TTL_MS) {
        return {
          data: cachedEntry.data,
          source: 'cache',
          isStale: false
        };
      }
    }

    // 2. Prevent concurrent duplicate requests for the same username
    const inFlightKey = `${username}_${forceRefresh}`;
    if (inFlightRequests.has(inFlightKey)) {
      return inFlightRequests.get(inFlightKey);
    }

    const fetchPromise = (async () => {
      let lastError = null;

      // Tier 1: Relative Serverless Proxy (/api/leetcode)
      // Works if hosted on Vercel, Netlify, or local Node server
      try {
        const proxyUrl = `/api/leetcode?username=${encodeURIComponent(username)}`;
        const res = await fetchWithTimeout(proxyUrl, { headers: { 'Accept': 'application/json' } }, 8000);
        if (res.ok) {
          const json = await res.json();
          const normalized = normalizeLeetCodeData(json, username, 'api_proxy');
          setCachedProfile(username, normalized);
          return { data: normalized, source: 'api_proxy', isStale: false };
        }
      } catch (err) {
        lastError = err;
        // Proceed to next tier
      }

      // Tier 2: Public Proxy 1 (faisalshohag Vercel API)
      try {
        const url = `https://leetcode-api-faisalshohag.vercel.app/${encodeURIComponent(username)}`;
        const res = await fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, 7000);
        if (res.ok) {
          const json = await res.json();
          if (json && !json.errors && (typeof json.totalSolved === 'number')) {
            const normalized = normalizeLeetCodeData(json, username, 'faisalshohag_proxy');
            setCachedProfile(username, normalized);
            return { data: normalized, source: 'faisalshohag_proxy', isStale: false };
          }
        }
      } catch (err) {
        lastError = err;
        // Proceed to next tier
      }

      // Tier 3: Alfa LeetCode API (Render)
      try {
        const normalized = await fetchFromAlfaApi(username, 12000);
        if (normalized && normalized.totalSolved > 0) {
          setCachedProfile(username, normalized);
          return { data: normalized, source: 'alfa_proxy', isStale: false };
        }
      } catch (err) {
        lastError = err;
      }

      // If all tiers failed:
      // Check if we have stale cached data
      if (cachedEntry && cachedEntry.data) {
        return {
          data: { ...cachedEntry.data, isStale: true },
          source: 'cache_stale',
          isStale: true,
          error: lastError ? lastError.message : 'Network sync failed'
        };
      }

      // No cache and all network sources failed: Throw honest error
      throw new Error(
        `Unable to retrieve LeetCode profile for '${username}'. ` +
        `Please check internet connectivity or try again in a few moments.`
      );
    })();

    inFlightRequests.set(inFlightKey, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      inFlightRequests.delete(inFlightKey);
    }
  }

  return {
    DEFAULT_USERNAME,
    CACHE_TTL_MS,
    normalizeLeetCodeData,
    parseSubmissionCalendar,
    getCachedProfile,
    setCachedProfile,
    getLeetCodeProfile
  };
});
