const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeLeetCodeData, parseSubmissionCalendar } = require('../js/leetcode-service.js');
const { normalizeGraphQLResponse } = require('../api/leetcode.js');

describe('LeetCode Response Normalizer & Models', () => {

  const sampleGraphQLResponse = {
    data: {
      matchedUser: {
        username: 'abhaysingh79',
        profile: {
          ranking: 1196872,
          userAvatar: 'https://assets.leetcode.com/users/abhaysingh79/avatar.png',
          realName: 'Abhay Singh',
          reputation: 0,
          countryName: 'India'
        },
        submitStatsGlobal: {
          acSubmissionNum: [
            { difficulty: 'All', count: 149, submissions: 193 },
            { difficulty: 'Easy', count: 83, submissions: 107 },
            { difficulty: 'Medium', count: 55, submissions: 69 },
            { difficulty: 'Hard', count: 11, submissions: 17 }
          ],
          totalSubmissionNum: [
            { difficulty: 'All', count: 151, submissions: 217 }
          ]
        },
        badges: [
          {
            id: '10894241',
            displayName: '100 Days Badge 2026',
            icon: 'https://assets.leetcode.com/static_assets/others/100_1080_1080.png',
            creationDate: '2026-10-12'
          }
        ],
        userCalendar: {
          activeYears: [2025, 2026],
          streak: 25,
          totalActiveDays: 129,
          submissionCalendar: '{"1765065600": 2, "1765152000": 1}'
        }
      },
      userContestRanking: null,
      allQuestionsCount: [
        { difficulty: 'All', count: 4082 },
        { difficulty: 'Easy', count: 971 },
        { difficulty: 'Medium', count: 2128 },
        { difficulty: 'Hard', count: 983 }
      ],
      recentAcSubmissionList: [
        {
          id: '2173935036',
          title: 'Subarrays Distinct Element Sum of Squares II',
          titleSlug: 'subarrays-distinct-element-sum-of-squares-ii',
          timestamp: '1792164220'
        }
      ]
    }
  };

  it('correctly normalizes LeetCode GraphQL payload', () => {
    const result = normalizeLeetCodeData(sampleGraphQLResponse, 'abhaysingh79', 'graphql');

    assert.equal(result.username, 'abhaysingh79');
    assert.equal(result.realName, 'Abhay Singh');
    assert.equal(result.ranking, 1196872);
    assert.equal(result.totalSolved, 149);
    assert.equal(result.totalQuestions, 4082);
    assert.equal(result.easySolved, 83);
    assert.equal(result.totalEasy, 971);
    assert.equal(result.mediumSolved, 55);
    assert.equal(result.totalMedium, 2128);
    assert.equal(result.hardSolved, 11);
    assert.equal(result.totalHard, 983);
    assert.equal(result.streak, 25);
    assert.equal(result.totalActiveDays, 129);
    assert.deepEqual(result.activeYears, [2025, 2026]);
    assert.equal(result.submissionCalendar['1765065600'], 2);
    assert.equal(result.badges.length, 1);
    assert.equal(result.badges[0].displayName, '100 Days Badge 2026');
    assert.equal(result.recentSubmissions.length, 1);
    assert.equal(result.recentSubmissions[0].title, 'Subarrays Distinct Element Sum of Squares II');
    assert.equal(result.contest, null);
    assert.equal(result.isStale, false);
  });

  it('correctly handles contest ranking when present', () => {
    const withContest = JSON.parse(JSON.stringify(sampleGraphQLResponse));
    withContest.data.userContestRanking = {
      attendedContestsCount: 15,
      rating: 1850.4,
      globalRanking: 12000,
      totalParticipants: 80000,
      topPercentage: 15.0,
      badge: { name: 'Knight' }
    };

    const result = normalizeLeetCodeData(withContest, 'abhaysingh79', 'graphql');
    assert.notEqual(result.contest, null);
    assert.equal(result.contest.attendedContestsCount, 15);
    assert.equal(result.contest.rating, 1850);
    assert.equal(result.contest.globalRanking, 12000);
    assert.equal(result.contest.badge, 'Knight');
  });

  it('correctly normalizes Faisal Shohag proxy payload', () => {
    const sampleFaisalPayload = {
      totalSolved: 149,
      easySolved: 83,
      mediumSolved: 55,
      hardSolved: 11,
      totalQuestions: 4082,
      totalEasy: 971,
      totalMedium: 2128,
      totalHard: 983,
      ranking: 1196872,
      submissionCalendar: { '1765065600': 2 },
      recentSubmissions: [
        {
          title: 'Subarrays Distinct Element Sum of Squares II',
          titleSlug: 'subarrays-distinct-element-sum-of-squares-ii',
          timestamp: '1792164220',
          statusDisplay: 'Accepted'
        }
      ],
      matchedUserStats: {
        acSubmissionNum: [{ difficulty: 'All', count: 149, submissions: 193 }]
      }
    };

    const result = normalizeLeetCodeData(sampleFaisalPayload, 'abhaysingh79', 'faisalshohag');
    assert.equal(result.totalSolved, 149);
    assert.equal(result.easySolved, 83);
    assert.equal(result.mediumSolved, 55);
    assert.equal(result.hardSolved, 11);
    assert.equal(result.submissionCalendar['1765065600'], 2);
    assert.equal(result.recentSubmissions.length, 1);
    assert.equal(result.recentSubmissions[0].statusDisplay, 'Accepted');
  });

  it('safely parses submission calendar whether string or object', () => {
    assert.deepEqual(parseSubmissionCalendar('{"123": 4}'), { '123': 4 });
    assert.deepEqual(parseSubmissionCalendar({ '456': 7 }), { '456': 7 });
    assert.deepEqual(parseSubmissionCalendar(null), {});
    assert.deepEqual(parseSubmissionCalendar('invalid json'), {});
  });

  it('throws descriptive error on invalid payload structure', () => {
    assert.throws(() => {
      normalizeLeetCodeData({ somethingUnrelated: true }, 'testuser');
    }, /Unrecognized LeetCode API response structure/);

    assert.throws(() => {
      normalizeLeetCodeData(null, 'testuser');
    }, /Invalid data payload received/);
  });

  it('api/leetcode.js normalizeGraphQLResponse throws when user does not exist', () => {
    assert.throws(() => {
      normalizeGraphQLResponse({ data: { matchedUser: null } }, 'ghost');
    }, /not found or is private/);
  });
});
