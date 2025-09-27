import { callOpenAI } from './openai.js';

const FALLBACK_SYNONYMS = {
    ai: ["artificial intelligence", "machine learning"],
    productivity: ["efficiency", "workflow"],
    developer: ["programmer", "engineer"],
    marketing: ["promotion", "growth"],
    analytics: ["insights", "metrics"],
    automation: ["auto", "bot"],
    research: ["analysis", "study"]
};

function tokenizeTopic(topic) {
    return topic.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

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
            temperature: 1 // Use default temperature to avoid model restrictions
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

