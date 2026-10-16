/**
 * Serverless API Route: /api/leetcode
 * Description: Proxies requests to official LeetCode GraphQL API with server-side caching and CORS.
 * Compatible with: Vercel Serverless Functions, Netlify, and standard Node.js servers.
 */

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes in-memory cache

// In-memory cache for serverless container reuse
const memoryCache = new Map();

const LEETCODE_QUERY = `
query getUserFullProfile($username: String!) {
  matchedUser(username: $username) {
    username
    githubUrl
    profile {
      ranking
      userAvatar
      realName
      aboutMe
      school
      countryName
      reputation
      starRating
    }
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
      totalSubmissionNum {
        difficulty
        count
        submissions
      }
    }
    badges {
      id
      displayName
      icon
      hoverText
      creationDate
    }
    upcomingBadges {
      name
      icon
    }
    userCalendar {
      activeYears
      streak
      totalActiveDays
      submissionCalendar
    }
  }
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    totalParticipants
    topPercentage
    badge {
      name
    }
  }
  allQuestionsCount {
    difficulty
    count
  }
  recentAcSubmissionList(username: $username, limit: 10) {
    id
    title
    titleSlug
    timestamp
  }
}
`;

/**
 * Normalizes raw LeetCode GraphQL response into a clean, consistent data model.
 */
function normalizeGraphQLResponse(raw, username) {
  const matchedUser = raw?.data?.matchedUser;
  if (!matchedUser) {
    throw new Error(`LeetCode profile '${username}' was not found or is private.`);
  }

  const profile = matchedUser.profile || {};
  const acStats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
  const totalSubStats = matchedUser.submitStatsGlobal?.totalSubmissionNum || [];
  const allCounts = raw?.data?.allQuestionsCount || [];
  const contest = raw?.data?.userContestRanking || null;
  const userCalendar = matchedUser.userCalendar || {};
  const badges = matchedUser.badges || [];
  const recentAc = raw?.data?.recentAcSubmissionList || [];

  const getCount = (list, diff) => {
    const item = list.find(x => x.difficulty.toLowerCase() === diff.toLowerCase());
    return item ? item.count : 0;
  };

  const getSubmissions = (list, diff) => {
    const item = list.find(x => x.difficulty.toLowerCase() === diff.toLowerCase());
    return item ? (item.submissions || 0) : 0;
  };

  // Safe submission calendar parsing
  let parsedCalendar = {};
  if (userCalendar.submissionCalendar) {
    if (typeof userCalendar.submissionCalendar === 'string') {
      try {
        parsedCalendar = JSON.parse(userCalendar.submissionCalendar);
      } catch (e) {
        parsedCalendar = {};
      }
    } else if (typeof userCalendar.submissionCalendar === 'object') {
      parsedCalendar = userCalendar.submissionCalendar;
    }
  }

  return {
    username: matchedUser.username || username,
    realName: profile.realName || matchedUser.username || username,
    userAvatar: profile.userAvatar || '',
    ranking: typeof profile.ranking === 'number' ? profile.ranking : null,
    reputation: typeof profile.reputation === 'number' ? profile.reputation : 0,
    country: profile.countryName || '',
    profileUrl: `https://leetcode.com/u/${matchedUser.username || username}/`,
    
    // Problem stats
    totalSolved: getCount(acStats, 'All'),
    totalQuestions: getCount(allCounts, 'All'),
    easySolved: getCount(acStats, 'Easy'),
    totalEasy: getCount(allCounts, 'Easy'),
    mediumSolved: getCount(acStats, 'Medium'),
    totalMedium: getCount(allCounts, 'Medium'),
    hardSolved: getCount(acStats, 'Hard'),
    totalHard: getCount(allCounts, 'Hard'),

    // Submissions
    totalAcSubmissions: getSubmissions(acStats, 'All'),
    totalSubmissions: getSubmissions(totalSubStats, 'All'),

    // Activity & Streaks
    streak: typeof userCalendar.streak === 'number' ? userCalendar.streak : 0,
    totalActiveDays: typeof userCalendar.totalActiveDays === 'number' ? userCalendar.totalActiveDays : 0,
    activeYears: Array.isArray(userCalendar.activeYears) ? userCalendar.activeYears : [new Date().getFullYear()],
    submissionCalendar: parsedCalendar,

    // Contest
    contest: contest ? {
      attendedContestsCount: contest.attendedContestsCount || 0,
      rating: Math.round(contest.rating || 0),
      globalRanking: contest.globalRanking || null,
      totalParticipants: contest.totalParticipants || null,
      topPercentage: contest.topPercentage || null,
      badge: contest.badge?.name || null
    } : null,

    // Badges & Achievements
    badges: badges.map(b => ({
      id: String(b.id || ''),
      displayName: b.displayName || '',
      icon: b.icon?.startsWith('http') ? b.icon : (b.icon ? `https://leetcode.com${b.icon}` : ''),
      creationDate: b.creationDate || ''
    })),

    // Recent Accepted Submissions
    recentSubmissions: recentAc.map(item => ({
      id: String(item.id || ''),
      title: item.title || '',
      titleSlug: item.titleSlug || '',
      timestamp: parseInt(item.timestamp, 10),
      statusDisplay: 'Accepted',
      url: `https://leetcode.com/problems/${item.titleSlug}/`
    })),

    lastSynced: Date.now(),
    source: 'official_graphql'
  };
}

/**
 * Main HTTP Request Handler
 */
async function handler(req, res) {
  // CORS & Cache Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Parse username from query
  let username = 'abhaysingh79';
  if (req.query && req.query.username) {
    username = String(req.query.username).trim();
  } else if (req.url && req.url.includes('?')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    if (urlParams.get('username')) {
      username = urlParams.get('username').trim();
    }
  }

  if (!username) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Username query parameter is required' }));
    return;
  }

  // Check in-memory cache
  const cached = memoryCache.get(username);
  const now = Date.now();
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ...cached.data, _cached: true, _cacheAgeMs: now - cached.timestamp }));
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      },
      body: JSON.stringify({
        query: LEETCODE_QUERY,
        variables: { username }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`LeetCode GraphQL responded with HTTP ${response.status}`);
    }

    const json = await response.json();

    if (json.errors && (!json.data || !json.data.matchedUser)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: json.errors[0]?.message || `User '${username}' not found on LeetCode.`
      }));
      return;
    }

    const normalized = normalizeGraphQLResponse(json, username);

    // Save to memory cache
    memoryCache.set(username, {
      timestamp: now,
      data: normalized
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(normalized));

  } catch (err) {
    // If request failed but we have a stale cache, serve stale cache with warning
    if (cached) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        ...cached.data,
        _cached: true,
        _stale: true,
        _warning: 'Serving stale cached data due to LeetCode API timeout/error'
      }));
      return;
    }

    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Failed to fetch live LeetCode statistics',
      details: err.message
    }));
  }
}

module.exports = handler;
module.exports.default = handler;
module.exports.normalizeGraphQLResponse = normalizeGraphQLResponse;
