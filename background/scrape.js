/**
 * @file scrape.js
 * @description This file contains utility functions for the data scraping process.
 * It includes functions for content manipulation (truncating, limiting comments),
 * handling failed URL persistence, and recording the results of an extraction run.
 */

import { STORAGE_KEYS, COMMENT_LIMIT, PER_POST_CHAR_LIMIT } from './constants.js';
import { saveExtractionRun } from './storage.js';

/**
 * Truncates a string to a specified character limit, preserving the beginning and end.
 * This is useful for saving tokens when sending large text content to the AI.
 * @param {string} text - The text to truncate.
 * @param {number} [limit=PER_POST_CHAR_LIMIT] - The maximum character limit.
 * @returns {string} The truncated text, or the original text if it's within the limit.
 */
function truncateContent(text, limit = PER_POST_CHAR_LIMIT) {
    if (!text) {
        return '';
    }
    if (text.length <= limit) {
        return text;
    }
    const head = text.slice(0, Math.floor(limit / 2));
    const tail = text.slice(-Math.floor(limit / 2));
    return `${head}\n...[truncated]...\n${tail}`;
}

/**
 * Limits the number of comments from a post, sorting them by score first to keep the most relevant ones.
 * It also truncates the content of each comment.
 * @param {Array<object>} [comments=[]] - An array of comment objects.
 * @returns {Array<object>} A new array containing the top, truncated comments.
 */
function limitComments(comments = []) {
    return comments
        .sort((a, b) => {
            const scoreA = parseInt(a.score || '0', 10);
            const scoreB = parseInt(b.score || '0', 10);
            return scoreB - scoreA;
        })
        .slice(0, COMMENT_LIMIT)
        .map(comment => ({
            ...comment,
            content: truncateContent(comment.content || '')
        }));
}

/**
 * Saves a failed URL and the reason for failure to local storage.
 * @param {string} url - The URL that failed to be extracted.
 * @param {string} reason - The reason for the failure.
 */
function persistFailedUrl(url, reason) {
    chrome.storage.local.get([STORAGE_KEYS.failedUrls], (result) => {
        const failed = result[STORAGE_KEYS.failedUrls] || [];
        const updated = [{ url, reason, timestamp: new Date().toISOString() }, ...failed].slice(0, 100);
        chrome.storage.local.set({ [STORAGE_KEYS.failedUrls]: updated });
    });
}

/**
 * Saves a report of all failed URLs to a JSON file in the user's downloads.
 */
async function saveFailedUrlsReport() {
    const { [STORAGE_KEYS.failedUrls]: failed = [] } = await chrome.storage.local.get([STORAGE_KEYS.failedUrls]);
    if (failed.length === 0) {
        return;
    }

    const jsonData = JSON.stringify(failed, null, 2);
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`;
    await chrome.downloads.download({
        url: dataUrl,
        filename: `failed_urls_${new Date().toISOString().split('T')[0]}.json`,
        conflictAction: 'overwrite',
        saveAs: false
    });
}

/**
 * Records the results of a completed data extraction run, including metadata and statistics.
 * @param {object} run - The extraction run object containing the collected data.
 */
async function recordExtractionRun(run) {
    // Calculate platform counts and failure metadata
    const platformCounts = {};
    const failureReasons = {};

    if (run.extractedData) {
        run.extractedData.forEach(item => {
            const platform = item.platform || 'unknown';
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });
    }

    if (run.failedUrls) {
        run.failedUrls.forEach(failure => {
            const reason = failure.reason || 'Unknown error';
            failureReasons[reason] = (failureReasons[reason] || 0) + 1;
        });
    }

    // Enhanced run metadata
    const enhancedRun = {
        ...run,
        platformCounts,
        failureReasons,
        successRate: run.total > 0 ? (((run.extractedCount || 0) / run.total) * 100).toFixed(1) : 0,
        metadata: {
            recordedAt: new Date().toISOString(),
            version: '2.0'
        }
    };

    await chrome.storage.local.set({
        lastExtractionRun: enhancedRun,
        [STORAGE_KEYS.extractionState]: {
            isRunning: false,
            progress: run.total,
            total: run.total,
            currentTask: null,
            extractedData: []
        }
    });

    await saveExtractionRun(enhancedRun);
}

export {
    truncateContent,
    limitComments,
    persistFailedUrl,
    saveFailedUrlsReport,
    recordExtractionRun
};