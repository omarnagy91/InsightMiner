export const PLATFORM_DORKS = {
    reddit: '(site:reddit.com OR site:old.reddit.com) inurl:comments ("{topic}" OR "{syn1}" OR "{syn2}") ("looking for" OR "is there a" OR "recommend" OR "best * for" OR "tool for" OR "how do I") -site:reddit.com/r/announcements -site:reddit.com/r/help',
    stackoverflow: 'site:stackoverflow.com/questions ("{topic}" OR "{syn1}" OR "{syn2}") (intitle:"how do i" OR intitle:"best way" OR intitle:"error" OR "feature request")',
    github: 'site:github.com inurl:/issues ("{topic}" OR "{syn1}" OR "{syn2}") ("feature request" OR "proposal" OR "bug" OR "discussion") -inurl:/pull/',
    quora: 'site:quora.com ("{topic}" OR "{syn1}" OR "{syn2}") (intitle:"how do" OR intitle:"which is the best" OR "recommend" OR "looking for")',
    hackernews: 'site:news.ycombinator.com ("{topic}" OR "{syn1}" OR "{syn2}") (intitle:"Ask HN:" OR intitle:"Show HN:" OR "recommend" OR "looking for")',
    producthunt: 'site:producthunt.com (inurl:discussions OR inurl:posts) ("{topic}" OR "{syn1}" OR "{syn2}") ("looking for" OR "recommend" OR "feature request")'
};

export const PLATFORM_LABELS = {
    reddit: 'Reddit',
    stackoverflow: 'Stack Overflow',
    github: 'GitHub Issues',
    quora: 'Quora',
    hackernews: 'Hacker News',
    producthunt: 'Product Hunt'
};

export const DEMAND_SCORING_DEFAULTS = {
    frequency: 0.5,
    recency: 0.2,
    engagement: 0.15,
    emotion: 0.1,
    confidence: 0.05
};

export const COMMENT_LIMIT = 10;
export const PER_POST_CHAR_LIMIT = 32000;

export const STORAGE_KEYS = {
    searchResults: 'searchResults',
    generatedQueries: 'generatedQueries',
    searchSessions: 'searchSessions',
    extractionState: 'dataExtraction',
    extractionRuns: 'extractionRuns',
    analysisState: 'aiAnalysis',
    analysisRuns: 'analysisRuns',
    reportRuns: 'reportRuns',
    failedUrls: 'failedExtractionUrls',
    demandWeights: 'demandWeights'
};

export const FILE_PREFIXES = {
    search: 'search',
    extraction: 'extracted',
    analysis: 'analysis',
    report: 'report',
    brief: 'brief'
};

export const DEMAND_SCORE_SETTINGS = {
    minEvidence: 1,
    maxEvidenceStored: 3
};

export const CONCURRENCY_LIMIT = 2;
export const RETRYABLE_STATUS = [429, 500, 502, 503, 504];

