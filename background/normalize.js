/**
 * @file normalize.js
 * @description This file contains text normalization utilities.
 * Normalization is a crucial step for accurately comparing and grouping text-based insights.
 */

/**
 * @const {RegExp} PUNCT_RE
 * @description A regular expression to match and remove punctuation and symbols from text.
 * It uses Unicode property escapes to cover a wide range of characters.
 */
const PUNCT_RE = /[\p{P}\p{S}]/gu;

/**
 * Normalizes a string by converting it to lowercase, removing punctuation and symbols,
 * and standardizing whitespace. This is essential for creating consistent fingerprints for text.
 * @param {string} [text=''] - The input string to normalize.
 * @returns {string} The normalized string.
 */
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