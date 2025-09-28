/**
 * @file analyze.js
 * @description This file contains the core logic for analyzing extracted data using the OpenAI API.
 * It manages concurrent API requests, batch processing, data aggregation, and demand scoring.
 */

import { callOpenAI } from './openai.js';
import { CONCURRENCY_LIMIT, BATCH_SIZE, BATCH_DELAY, STORAGE_KEYS, DEMAND_SCORING_DEFAULTS, DEMAND_SCORE_SETTINGS } from './constants.js';
import { saveAnalysisRun } from './storage.js';
import { mergeItems } from './dedupe.js';

/**
 * Splits an array into smaller chunks of a specified size.
 * @param {Array<any>} array - The array to split.
 * @param {number} size - The size of each chunk.
 * @returns {Array<Array<any>>} An array of chunks.
 */
function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Analyzes a single post using the OpenAI API.
 * It builds a prompt, calls the API, and returns the structured result.
 * @param {object} params - The parameters for analyzing the post.
 * @param {object} params.post - The post object to analyze.
 * @param {object} params.schema - The JSON schema for the expected AI response.
 * @param {function} params.buildPrompt - The function to build the AI prompt.
 * @returns {Promise<object>} A promise that resolves to the analysis result from the AI.
 */
async function analyzePost({ post, schema, buildPrompt }) {
    const { system, user } = buildPrompt(post);
    const metadata = {
        post_url: post.post?.url || post.url || 'unknown',
        platform: post.platform || 'unknown'
    };

    console.log('=== AI Analysis Debug ===');
    console.log('Post URL:', metadata.post_url);
    console.log('Platform:', metadata.platform);
    console.log('System Prompt:', system);
    console.log('User Input (first 500 chars):', user.substring(0, 500));
    console.log('Schema:', JSON.stringify(schema, null, 2));

    const result = await callOpenAI({
        system,
        user,
        schema,
        temperature: 1, // Use default temperature to avoid model restrictions
        metadata
    });

    console.log('AI Response:', JSON.stringify(result, null, 2));
    console.log('=== End Debug ===');

    return result;
}

/**
 * Processes an array of items concurrently with a specified limit.
 * @param {Array<any>} items - The array of items to process.
 * @param {function} handler - The async function to handle each item.
 * @param {number} [limit=CONCURRENCY_LIMIT] - The maximum number of concurrent operations.
 * @param {function} [onProgress=() => {}] - A callback function to report progress.
 * @returns {Promise<Array<any>>} A promise that resolves to an array of results.
 */
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

/**
 * Calculates a demand score for an item based on various weighted factors.
 * @param {object} item - The insight item to score.
 * @param {Array<object>} groupItems - All items in the same category for frequency calculation.
 * @param {object} weights - The weights for different scoring factors (frequency, recency, etc.).
 * @returns {number} The calculated demand score.
 */
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

/**
 * Attaches demand scores to all items within categorized groups.
 * @param {object} groups - An object where keys are categories and values are arrays of items.
 * @param {object} weights - The weights to use for scoring.
 * @returns {object} The groups object with demand scores added to each item.
 */
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

/**
 * Processes a large number of items in batches to avoid rate limiting and reduce memory usage.
 * @param {Array<any>} items - The array of items to process.
 * @param {function} handler - The async function to handle each item.
 * @param {number} [batchSize=BATCH_SIZE] - The number of items in each batch.
 * @param {number} [delay=BATCH_DELAY] - The delay in milliseconds between batches.
 * @param {function} [onProgress=() => {}] - A callback function to report progress.
 * @returns {Promise<Array<any>>} A promise that resolves to an array of results.
 */
async function processBatches(items, handler, batchSize = BATCH_SIZE, delay = BATCH_DELAY, onProgress = () => { }) {
    const batches = chunk(items, batchSize);
    const results = [];

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} items)`);

        const batchResults = await Promise.all(
            batch.map(item => handler(item))
        );

        results.push(...batchResults);

        // Update progress
        onProgress({
            current: (i + 1) * batchSize,
            total: items.length,
            batch: i + 1,
            totalBatches: batches.length
        });

        // Delay between batches to prevent rate limiting
        if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return results;
}

/**
 * Orchestrates the entire analysis process for a collection of posts.
 * It handles concurrency or batching, runs the analysis, merges duplicates, scores the results,
 * and saves the final analysis run.
 * @param {object} params - The parameters for the analysis.
 * @param {Array<object>} params.posts - The array of post objects to analyze.
 * @param {object} params.schema - The JSON schema for the per-post analysis.
 * @param {function} params.buildPrompt - The function to build the AI prompt for each post.
 * @param {function} [params.onProgress=() => {}] - A callback for reporting progress.
 * @param {object} [params.weights=DEMAND_SCORING_DEFAULTS] - The weights for demand scoring.
 * @param {boolean} [params.useBatching=true] - Whether to use batch processing for large datasets.
 * @returns {Promise<object>} A promise that resolves to the completed analysis run object.
 */
async function analyzePosts({
    posts,
    schema,
    buildPrompt,
    onProgress = () => {
    },
    weights = DEMAND_SCORING_DEFAULTS,
    useBatching = true
}) {
    let enriched;

    if (useBatching && posts.length > BATCH_SIZE) {
        console.log(`Using batch processing for ${posts.length} posts`);
        enriched = await processBatches(
            posts,
            (post) => analyzePost({ post, schema, buildPrompt }),
            BATCH_SIZE,
            BATCH_DELAY,
            onProgress
        );
    } else {
        enriched = await processWithConcurrency(posts, (post) => analyzePost({ post, schema, buildPrompt }), CONCURRENCY_LIMIT, onProgress);
    }

    const merged = mergeItems(enriched, DEMAND_SCORE_SETTINGS.maxEvidenceStored);
    const scored = attachDemandScores(merged, weights);

    const run = {
        id: `analysis_${Date.now()}`,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        postsAnalyzed: posts.length,
        itemsFound: Object.values(scored).reduce((sum, arr) => sum + arr.length, 0),
        perPost: enriched,
        merged: scored,
        weights,
        useBatching
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