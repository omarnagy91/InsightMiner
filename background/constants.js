/**
 * @file constants.js
 * @description This file exports constant values used throughout the extension's background scripts.
 * This includes configuration for search queries, platform labels, AI analysis, storage, and processing limits.
 */

/**
 * @const {object} PLATFORM_DORKS
 * @description An object containing Google dork templates for searching specific platforms.
 * Each key is a platform name, and the value is a search query string with placeholders for topic and synonyms.
 */
export const PLATFORM_DORKS = {
    reddit: '(site:reddit.com OR site:old.reddit.com) inurl:comments ("{topic}" OR "{syn1}" OR "{syn2}") ("looking for" OR "is there a" OR "recommend" OR "best * for" OR "tool for" OR "how do I") -site:reddit.com/r/announcements -site:reddit.com/r/help',
    stackoverflow: 'site:stackoverflow.com/questions ("{topic}" OR "{syn1}" OR "{syn2}") (intitle:"how do i" OR intitle:"best way" OR intitle:"error" OR "feature request")',
    github: 'site:github.com inurl:/issues ("{topic}" OR "{syn1}" OR "{syn2}") ("feature request" OR "proposal" OR "bug" OR "discussion") -inurl:/pull/',
    quora: 'site:quora.com ("{topic}" OR "{syn1}" OR "{syn2}") (intitle:"how do" OR intitle:"which is the best" OR "recommend" OR "looking for")',
    hackernews: 'site:news.ycombinator.com ("{topic}" OR "{syn1}" OR "{syn2}") (intitle:"Ask HN:" OR intitle:"Show HN:" OR "recommend" OR "looking for")',
    producthunt: 'site:producthunt.com (inurl:discussions OR inurl:posts) ("{topic}" OR "{syn1}" OR "{syn2}") ("looking for" OR "recommend" OR "feature request")'
};

/**
 * @const {object} PLATFORM_LABELS
 * @description A mapping from platform keys to human-readable labels.
 */
export const PLATFORM_LABELS = {
    reddit: 'Reddit',
    stackoverflow: 'Stack Overflow',
    github: 'GitHub Issues',
    quora: 'Quora',
    hackernews: 'Hacker News',
    producthunt: 'Product Hunt'
};

/**
 * @const {object} DEMAND_SCORING_DEFAULTS
 * @description Default weights for calculating the demand score of an insight.
 */
export const DEMAND_SCORING_DEFAULTS = {
    frequency: 0.5,
    recency: 0.2,
    engagement: 0.15,
    emotion: 0.1,
    confidence: 0.05
};

/**
 * @const {number} COMMENT_LIMIT
 * @description The maximum number of comments to process per post.
 */
export const COMMENT_LIMIT = 10;

/**
 * @const {number} PER_POST_CHAR_LIMIT
 * @description The maximum number of characters to use from a single post's content to limit token usage.
 */
export const PER_POST_CHAR_LIMIT = 32000;

/**
 * @const {object} STORAGE_KEYS
 * @description An object containing the keys used for storing data in `chrome.storage.local`.
 */
export const STORAGE_KEYS = {
    searchResults: 'searchResults',
    generatedQueries: 'generatedQueries',
    searchSessions: 'searchSessions',
    extractionState: 'extractionState',
    extractionRuns: 'extractionRuns',
    analysisState: 'aiAnalysis',
    analysisRuns: 'analysisRuns',
    reportRuns: 'reportRuns',
    failedUrls: 'failedExtractionUrls',
    demandWeights: 'demandWeights'
};

/**
 * @const {object} FILE_PREFIXES
 * @description Prefixes used for naming downloaded files based on their content type.
 */
export const FILE_PREFIXES = {
    search: 'search',
    extraction: 'extracted',
    analysis: 'analysis',
    report: 'report',
    brief: 'brief'
};

/**
 * @const {object} DEMAND_SCORE_SETTINGS
 * @description Settings related to demand scoring and evidence storage.
 */
export const DEMAND_SCORE_SETTINGS = {
    minEvidence: 1,
    maxEvidenceStored: 3
};

/**
 * @const {number} CONCURRENCY_LIMIT
 * @description The maximum number of concurrent API requests or other async operations.
 */
export const CONCURRENCY_LIMIT = 3; // Increased for better performance

/**
 * @const {number} BATCH_SIZE
 * @description The number of items to process in a single batch.
 */
export const BATCH_SIZE = 10; // Process posts in batches

/**
 * @const {number} BATCH_DELAY
 * @description The delay in milliseconds between processing batches to avoid rate limiting.
 */
export const BATCH_DELAY = 1000; // Delay between batches (ms)

/**
 * @const {Array<number>} RETRYABLE_STATUS
 * @description A list of HTTP status codes that indicate a request should be retried.
 */
export const RETRYABLE_STATUS = [429, 500, 502, 503, 504];