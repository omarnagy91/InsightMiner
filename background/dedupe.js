/**
 * @file dedupe.js
 * @description This file provides functions for deduplicating and merging analysis results.
 * It uses a fingerprinting technique to identify similar items and merges their evidence.
 */

import { normalizeText } from './normalize.js';

/**
 * Creates a consistent, shortened fingerprint for a given label or text.
 * This is used to identify and group similar items.
 * @param {string} label - The text to fingerprint.
 * @returns {string} The generated fingerprint.
 */
function fingerprintLabel(label) {
    return normalizeText(label).slice(0, 120);
}

/**
 * Merges two arrays of evidence objects, ensuring no duplicates and respecting a maximum size.
 * @param {Array<object>} [existingEvidence=[]] - The array of existing evidence.
 * @param {Array<object>} [newEvidence=[]] - The array of new evidence to add.
 * @param {number} [maxEvidence=3] - The maximum number of evidence items to store.
 * @returns {Array<object>} The merged and truncated array of evidence.
 */
function mergeEvidence(existingEvidence = [], newEvidence = [], maxEvidence = 3) {
    const combined = [...existingEvidence];
    for (const evidence of newEvidence) {
        if (combined.length >= maxEvidence) {
            break;
        }
        if (!combined.some(existing => existing.quote === evidence.quote && existing.url === evidence.url)) {
            combined.push(evidence);
        }
    }
    return combined.slice(0, maxEvidence);
}

/**
 * Merges and deduplicates items from per-post analysis results into aggregated categories.
 * It iterates through all posts and their analyzed items (ideas, issues, etc.),
 * groups them by a generated fingerprint, and merges their evidence.
 * @param {Array<object>} perPostResults - An array of analysis results for each post.
 * @param {number} [maxEvidence=3] - The maximum number of evidence items to store for each merged item.
 * @returns {object} An object containing the merged items, categorized by type (ideas, issues, etc.).
 */
function mergeItems(perPostResults, maxEvidence = 3) {
    const categories = ['ideas', 'issues', 'missing_features', 'pros', 'cons', 'emotions'];
    const merged = {};

    for (const category of categories) {
        const items = [];
        const seen = new Map();

        for (const post of perPostResults) {
            const perPostItems = post.items?.[category] || [];
            for (const item of perPostItems) {
                const primary = item.label || item.problem || item.feature || item.praise || item.complaint || item.driver;
                const fingerprint = fingerprintLabel(primary || JSON.stringify(item));
                const key = `${fingerprint}`;

                if (!seen.has(key)) {
                    seen.set(key, {
                        ...item,
                        fingerprint,
                        evidence: mergeEvidence([], item.evidence || [], maxEvidence)
                    });
                } else {
                    const existing = seen.get(key);
                    seen.set(key, {
                        ...existing,
                        evidence: mergeEvidence(existing.evidence, item.evidence || [], maxEvidence),
                        confidence: Math.max(existing.confidence || 0, item.confidence || 0)
                    });
                }
            }
        }

        merged[category] = Array.from(seen.values());
    }

    return merged;
}

export {
    mergeItems
};