import { STORAGE_KEYS, COMMENT_LIMIT, PER_POST_CHAR_LIMIT } from './constants.js';
import { saveExtractionRun } from './storage.js';

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

function persistFailedUrl(url, reason) {
    chrome.storage.local.get([STORAGE_KEYS.failedUrls], (result) => {
        const failed = result[STORAGE_KEYS.failedUrls] || [];
        const updated = [{ url, reason, timestamp: new Date().toISOString() }, ...failed].slice(0, 100);
        chrome.storage.local.set({ [STORAGE_KEYS.failedUrls]: updated });
    });
}

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
        successRate: run.total > 0 ? ((run.extractedCount || 0) / run.total * 100).toFixed(1) : 0,
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

