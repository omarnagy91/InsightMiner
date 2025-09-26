import { callOpenAI } from './openai.js';
import { CONCURRENCY_LIMIT, STORAGE_KEYS, DEMAND_SCORING_DEFAULTS, DEMAND_SCORE_SETTINGS } from './constants.js';
import { saveAnalysisRun } from './storage.js';
import { mergeItems } from './dedupe.js';

function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

async function analyzePost({ post, schema, buildPrompt }) {
    const { system, user } = buildPrompt(post);
    const metadata = {
        post_url: post.post?.url || post.url || 'unknown',
        platform: post.platform || 'unknown'
    };

    return callOpenAI({
        system,
        user,
        schema,
        temperature: 0,
        metadata
    });
}

async function processWithConcurrency(items, handler, limit = CONCURRENCY_LIMIT, onProgress = () => {
}) {
    const queue = [...items];
    const active = [];
    const results = [];

    async function runNext() {
        if (queue.length === 0) {
            return Promise.resolve();
        }

        const item = queue.shift();
        const promise = handler(item)
            .then(result => {
                results.push(result);
                onProgress(results.length, items.length);
            })
            .catch(error => {
                console.error('Handler error:', error);
            })
            .finally(() => {
                const index = active.indexOf(promise);
                if (index >= 0) {
                    active.splice(index, 1);
                }
            });

        active.push(promise);

        let nextPromise = Promise.resolve();
        if (active.length >= limit) {
            nextPromise = Promise.race(active);
        }

        await nextPromise;
        return runNext();
    }

    await runNext();
    await Promise.all(active);
    return results;
}

function calculateDemandScore(item, groupItems, weights) {
    const {
        frequency: freqWeight,
        recency: recencyWeight,
        engagement: engagementWeight,
        emotion: emotionWeight,
        confidence: confidenceWeight
    } = weights;

    const mentionCount = groupItems.filter(other => other.fingerprint === item.fingerprint).length;
    const recencyScore = 1;
    const engagementScore = Math.min((item.evidence || []).length / 3, 1.0);
    const emotionScore = item.intensity ? item.intensity / 5 : 0.5;
    const confidenceScore = item.confidence || 0.5;

    return freqWeight * Math.log(1 + mentionCount) +
        recencyWeight * recencyScore +
        engagementWeight * engagementScore +
        emotionWeight * emotionScore +
        confidenceWeight * confidenceScore;
}

function attachDemandScores(groups, weights) {
    const scored = {};
    for (const [category, items] of Object.entries(groups)) {
        scored[category] = items.map(item => ({
            ...item,
            demand_score: calculateDemandScore(item, items, weights),
            mention_count: items.filter(other => other.fingerprint === item.fingerprint).length
        })).sort((a, b) => b.demand_score - a.demand_score);
    }
    return scored;
}

async function analyzePosts({
    posts,
    schema,
    buildPrompt,
    onProgress = () => {
    },
    weights = DEMAND_SCORING_DEFAULTS
}) {
    const enriched = await processWithConcurrency(posts, (post) => analyzePost({ post, schema, buildPrompt }), CONCURRENCY_LIMIT, onProgress);

    const merged = mergeItems(enriched, DEMAND_SCORE_SETTINGS.maxEvidenceStored);
    const scored = attachDemandScores(merged, weights);

    const run = {
        id: `analysis_${Date.now()}`,
        startedAt: new Date().toISOString(),
        postsAnalyzed: posts.length,
        perPost: enriched,
        merged: scored,
        weights
    };

    await chrome.storage.local.set({
        [STORAGE_KEYS.analysisState]: {
            isRunning: false,
            progress: posts.length,
            total: posts.length,
            perPostResults: enriched,
            aggregateResults: scored
        },
        per_post_analysis: enriched,
        aggregated_analysis: scored
    });

    await saveAnalysisRun(run);
    return run;
}

export {
    analyzePosts
};

