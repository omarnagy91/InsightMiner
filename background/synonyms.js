/**
 * @file synonyms.js
 * @description This file contains functions for generating synonyms for a given topic.
 * It uses the OpenAI API as the primary method and includes a fallback mechanism with pre-defined synonyms for common terms.
 */

import { callOpenAI } from './openai.js';

/**
 * @const {object} FALLBACK_SYNONYMS
 * @description A dictionary of pre-defined synonyms for common keywords. This is used as a fallback
 * when the OpenAI API call for synonym generation fails or returns no results.
 */
const FALLBACK_SYNONYMS = {
    ai: ["artificial intelligence", "machine learning"],
    productivity: ["efficiency", "workflow"],
    developer: ["programmer", "engineer"],
    marketing: ["promotion", "growth"],
    analytics: ["insights", "metrics"],
    automation: ["auto", "bot"],
    research: ["analysis", "study"]
};

/**
 * Splits a topic string into an array of lowercase alphanumeric tokens.
 * @param {string} topic - The topic string to tokenize.
 * @returns {Array<string>} An array of tokens.
 */
function tokenizeTopic(topic) {
    return topic.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Finds pre-defined synonyms for a topic from the `FALLBACK_SYNONYMS` list.
 * @param {string} topic - The topic to find fallback synonyms for.
 * @returns {Array<string>} An array of found synonyms.
 */
function findFallbackSynonyms(topic) {
    const tokens = tokenizeTopic(topic);
    const synonyms = new Set();

    for (const token of tokens) {
        if (FALLBACK_SYNONYMS[token]) {
            FALLBACK_SYNONYMS[token].forEach(s => synonyms.add(s));
        }
    }

    return Array.from(synonyms);
}

/**
 * Generates up to two synonyms for a given topic.
 * It first attempts to use the OpenAI API. If that fails, it uses the local fallback list.
 * @param {string} topic - The topic for which to generate synonyms.
 * @returns {Promise<Array<string>>} A promise that resolves to an array containing up to two synonyms.
 */
async function generateSynonyms(topic) {
    try {
        const response = await callOpenAI({
            system: 'You produce short synonym suggestions. Return two comma-separated alternatives for the given topic.',
            user: `Topic: ${topic}. Respond with two synonyms or related phrases separated by commas.`,
            schema: {
                type: 'object',
                properties: {
                    synonyms: {
                        type: 'array',
                        items: { type: 'string' },
                        minItems: 0,
                        maxItems: 2
                    }
                },
                required: ['synonyms']
            },
            temperature: 1
        });

        if (response && Array.isArray(response.synonyms) && response.synonyms.length > 0) {
            return response.synonyms.filter(Boolean).slice(0, 2);
        }
    } catch (error) {
        console.warn('Synonym generation failed, using fallback:', error);
    }

    const fallback = findFallbackSynonyms(topic);
    if (fallback.length > 0) {
        return fallback.slice(0, 2);
    }

    return [];
}

export {
    generateSynonyms
};