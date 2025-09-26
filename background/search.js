import { PLATFORM_DORKS, PLATFORM_LABELS, STORAGE_KEYS, FILE_PREFIXES } from './constants.js';
import { generateSynonyms } from './synonyms.js';
import { callOpenAI } from './openai.js';
import { saveVersionedFile } from './storage.js';
import { buildSearchMetadata } from './sessions.js';

function formatDork(template, topic, synonyms = []) {
    const [syn1, syn2] = synonyms;
    return template
        .replaceAll('{topic}', topic)
        .replaceAll('{syn1}', syn1 || topic)
        .replaceAll('{syn2}', syn2 || topic);
}

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

async function generateQueriesAndSearch({ topic, sources }) {
    const queries = await buildQueries({ topic, sources });

    await chrome.storage.local.set({
        [STORAGE_KEYS.generatedQueries]: queries,
        lastQueryGeneration: new Date().toISOString()
    });

    // Execute searches via content scripts (existing implementation)
    return queries;
}

export {
    buildQueries,
    generateQueriesAndSearch,
    saveSearchSession,
    storeSearchResults
};

