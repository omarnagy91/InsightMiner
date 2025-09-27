/**
 * @file search.js
 * @description This file contains functions related to generating search queries (Google dorks),
 * managing search sessions, and storing search results. It integrates with the OpenAI API
 * to generate synonyms for enriching the search queries.
 */

import { PLATFORM_DORKS, PLATFORM_LABELS, STORAGE_KEYS, FILE_PREFIXES } from './constants.js';
import { generateSynonyms } from './synonyms.js';
import { callOpenAI } from './openai.js';
import { saveVersionedFile } from './storage.js';
import { buildSearchMetadata } from './sessions.js';

/**
 * Formats a Google dork template with the given topic and synonyms.
 * @param {string} template - The dork string template with placeholders like {topic}, {syn1}, {syn2}.
 * @param {string} topic - The main topic to insert into the template.
 * @param {Array<string>} [synonyms=[]] - An array of synonyms to insert.
 * @returns {string} The formatted, ready-to-use search query string.
 */
function formatDork(template, topic, synonyms = []) {
    const [syn1, syn2] = synonyms;
    return template
        .replaceAll('{topic}', topic)
        .replaceAll('{syn1}', syn1 || topic)
        .replaceAll('{syn2}', syn2 || topic);
}

/**
 * Builds a list of search query objects for the specified sources and topic.
 * It generates synonyms for the topic to create more comprehensive queries.
 * @param {object} params - The parameters for building the queries.
 * @param {string} params.topic - The central topic for the search.
 * @param {Array<string>} params.sources - An array of platform keys (e.g., 'reddit', 'github').
 * @returns {Promise<Array<object>>} A promise that resolves to an array of query objects.
 */
async function buildQueries({ topic, sources }) {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
        throw new Error('Topic is required');
    }

    const synonyms = await generateSynonyms(trimmedTopic);
    const queries = [];

    for (const source of sources) {
        const template = PLATFORM_DORKS[source];
        if (!template) {
            continue;
        }

        const query = formatDork(template, trimmedTopic, synonyms);
        queries.push({
            platform: source,
            platformLabel: PLATFORM_LABELS[source] || source,
            query,
            topic: trimmedTopic,
            synonyms
        });
    }

    if (queries.length === 0) {
        throw new Error('No supported platforms selected');
    }

    return queries;
}

/**
 * Saves the results of a search session, including metadata, to local storage and as a downloadable file.
 * @param {object} params - The parameters for the search session.
 * @param {string} params.topic - The topic of the search.
 * @param {Array<object>} params.queries - The queries that were executed.
 * @param {Array<object>} params.results - The search results that were found.
 * @returns {Promise<object>} A promise that resolves to the saved session object.
 */
async function saveSearchSession({ topic, queries, results }) {
    const session = buildSearchMetadata({ topic, queries, results });

    const { searchSessions = [] } = await chrome.storage.local.get([STORAGE_KEYS.searchSessions]);
    const updatedSessions = [session, ...searchSessions].slice(0, 20);

    await chrome.storage.local.set({ [STORAGE_KEYS.searchSessions]: updatedSessions });

    await saveVersionedFile({
        prefix: FILE_PREFIXES.search,
        data: session
    });

    return session;
}

/**
 * Stores the collected search results in local storage.
 * @param {Array<object>} results - The array of search result objects to store.
 * @returns {Promise<void>} A promise that resolves when the results have been stored.
 */
async function storeSearchResults(results) {
    const trimmedResults = results.map((result) => ({
        ...result,
        snippet: (result.snippet || '').slice(0, 500)
    }));

    await chrome.storage.local.set({
        [STORAGE_KEYS.searchResults]: trimmedResults,
        lastSearchResultsAt: new Date().toISOString()
    });
}

/**
 * A wrapper function that generates queries and stores them, ready for execution.
 * @param {object} params - The parameters for the operation.
 * @param {string} params.topic - The search topic.
 * @param {Array<string>} params.sources - The list of platforms to search.
 * @returns {Promise<Array<object>>} A promise that resolves to the array of generated query objects.
 */
async function generateQueriesAndSearch({ topic, sources }) {
    const queries = await buildQueries({ topic, sources });

    await chrome.storage.local.set({
        [STORAGE_KEYS.generatedQueries]: queries,
        lastQueryGeneration: new Date().toISOString()
    });

    // Note: Execution of searches is handled by the background script, which opens tabs and injects content scripts.
    return queries;
}

export {
    buildQueries,
    generateQueriesAndSearch,
    saveSearchSession,
    storeSearchResults
};