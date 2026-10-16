const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeLeetCodeData,
  parseSubmissionCalendar,
  getLeetCodeProfile
} = require('../js/leetcode-service.js');

describe('LeetCode Service & Caching Architecture', () => {

  // Simple in-memory mock for localStorage
  let mockStorage = {};
  global.localStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, val) => { mockStorage[key] = String(val); },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { mockStorage = {}; }
  };

  beforeEach(() => {
    mockStorage = {};
  });

  it('serves valid cached data without hitting network if within TTL', async () => {
    const cachedPayload = {
      username: 'abhaysingh79',
      realName: 'Abhay Singh',
      totalSolved: 149,
      totalQuestions: 4082,
      easySolved: 83,
      totalEasy: 971,
      mediumSolved: 55,
      totalMedium: 2128,
      hardSolved: 11,
      totalHard: 983,
      streak: 25,
      totalActiveDays: 129,
      submissionCalendar: { '1765065600': 2 },
      lastSynced: Date.now() - 60000 // 1 minute old
    };

    localStorage.setItem('leetcode_cache_abhaysingh79', JSON.stringify({
      timestamp: Date.now() - 60000,
      data: cachedPayload
    }));

    // global.fetch should not be called
    let fetchCalled = false;
    global.fetch = async () => {
      fetchCalled = true;
      throw new Error('Network should not have been called');
    };

    const result = await getLeetCodeProfile({ username: 'abhaysingh79', forceRefresh: false });
    assert.equal(fetchCalled, false, 'Fetch was erroneously called when fresh cache existed');
    assert.equal(result.source, 'cache');
    assert.equal(result.isStale, false);
    assert.equal(result.data.totalSolved, 149);
  });

  it('bypasses cache when forceRefresh is true', async () => {
    localStorage.setItem('leetcode_cache_abhaysingh79', JSON.stringify({
      timestamp: Date.now() - 60000,
      data: { username: 'abhaysingh79', totalSolved: 120 }
    }));

    let fetchTarget = '';
    global.fetch = async (url) => {
      fetchTarget = url;
      return {
        ok: true,
        json: async () => ({
          totalSolved: 149,
          totalQuestions: 4082,
          easySolved: 83,
          totalEasy: 971,
          mediumSolved: 55,
          totalMedium: 2128,
          hardSolved: 11,
          totalHard: 983,
          ranking: 1196872,
          submissionCalendar: {}
        })
      };
    };

    const result = await getLeetCodeProfile({ username: 'abhaysingh79', forceRefresh: true });
    assert.equal(result.data.totalSolved, 149);
    assert.notEqual(result.source, 'cache');
  });

  it('falls back to stale cache when network fails', async () => {
    const oldTimestamp = Date.now() - (20 * 60 * 1000); // 20 minutes old (expired)
    localStorage.setItem('leetcode_cache_abhaysingh79', JSON.stringify({
      timestamp: oldTimestamp,
      data: {
        username: 'abhaysingh79',
        totalSolved: 149,
        lastSynced: oldTimestamp
      }
    }));

    // Network completely fails
    global.fetch = async () => {
      throw new Error('Connection refused (offline)');
    };

    const result = await getLeetCodeProfile({ username: 'abhaysingh79', forceRefresh: true });
    assert.equal(result.isStale, true);
    assert.equal(result.source, 'cache_stale');
    assert.equal(result.data.totalSolved, 149);
  });

  it('throws honest error when all network sources fail and NO cache exists', async () => {
    // Empty storage
    mockStorage = {};

    global.fetch = async () => {
      throw new Error('All network requests failed');
    };

    await assert.rejects(
      async () => {
        await getLeetCodeProfile({ username: 'ghost_user', forceRefresh: true });
      },
      /Unable to retrieve LeetCode profile for 'ghost_user'/
    );
  });

  it('correctly maps all problem difficulties and verified counts without fabricating values', () => {
    const raw = {
      totalSolved: 149,
      easySolved: 83,
      mediumSolved: 55,
      hardSolved: 11,
      totalQuestions: 4082,
      totalEasy: 971,
      totalMedium: 2128,
      totalHard: 983,
      ranking: 1196872
    };

    const normalized = normalizeLeetCodeData(raw, 'abhaysingh79', 'test');
    assert.equal(normalized.totalSolved, 149);
    assert.equal(normalized.easySolved, 83);
    assert.equal(normalized.mediumSolved, 55);
    assert.equal(normalized.hardSolved, 11);
    assert.equal(normalized.totalQuestions, 4082);
    assert.equal(normalized.totalEasy, 971);
    assert.equal(normalized.totalMedium, 2128);
    assert.equal(normalized.totalHard, 983);
    assert.equal(normalized.contest, null); // Honest unrated, not fabricated!
  });
});
