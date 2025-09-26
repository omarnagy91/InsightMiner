const PUNCT_RE = /[\p{P}\p{S}]/gu;

function normalizeText(text = '') {
    return text
        .toLowerCase()
        .normalize('NFKD')
        .replace(PUNCT_RE, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export {
    normalizeText
};

