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

