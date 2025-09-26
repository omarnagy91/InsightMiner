import { normalizeText } from './normalize.js';

function fingerprintLabel(label) {
    return normalizeText(label).slice(0, 120);
}

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

