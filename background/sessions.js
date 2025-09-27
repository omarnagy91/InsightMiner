/**
 * @file sessions.js
 * @description This file contains functions for creating and managing session metadata,
 * specifically for search sessions.
 */

/**
 * Builds a metadata object for a completed search session.
 * This object includes the topic, timestamp, total results, and a breakdown of results per platform.
 * @param {object} params - The parameters for building the search metadata.
 * @param {string} params.topic - The topic of the search session.
 * @param {Array<object>} params.queries - The array of query objects that were executed.
 * @param {Array<object>} params.results - The array of search results obtained.
 * @returns {object} A metadata object representing the search session.
 */
function buildSearchMetadata({ topic, queries, results }) {
    const timestamp = new Date().toISOString();
    const perPlatform = queries.map(query => ({
        platform: query.platform,
        platformLabel: query.platformLabel,
        query: query.query,
        synonyms: query.synonyms,
        resultCount: results.filter(r => r.platform === query.platform).length
    }));

    return {
        id: `search_${timestamp.replace(/[:.]/g, '-')}`,
        topic,
        generatedAt: timestamp,
        totalResults: results.length,
        perPlatform
    };
}

export {
    buildSearchMetadata
};