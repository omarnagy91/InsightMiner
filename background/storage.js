import { STORAGE_KEYS, FILE_PREFIXES } from './constants.js';

function timestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-');
}

async function saveVersionedFile({ prefix, data }) {
    const time = timestamp();
    const filename = `${prefix}_${time}.json`;
    const jsonData = JSON.stringify(data, null, 2);

    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`;

    await chrome.downloads.download({
        url: dataUrl,
        filename,
        conflictAction: 'uniquify',
        saveAs: false
    });
}

async function appendVersionedRun({ key, prefix, data }) {
    const { [key]: existing = [] } = await chrome.storage.local.get([key]);
    const run = {
        id: `${prefix}_${timestamp()}`,
        data,
        savedAt: new Date().toISOString()
    };

    const updated = [run, ...existing].slice(0, 50);
    await chrome.storage.local.set({ [key]: updated });
    return run;
}

async function saveSearchRun(run) {
    return appendVersionedRun({
        key: STORAGE_KEYS.searchSessions,
        prefix: FILE_PREFIXES.search,
        data: run
    });
}

async function saveExtractionRun(run) {
    return appendVersionedRun({
        key: STORAGE_KEYS.extractionRuns,
        prefix: FILE_PREFIXES.extraction,
        data: run
    });
}

async function saveAnalysisRun(run) {
    return appendVersionedRun({
        key: STORAGE_KEYS.analysisRuns,
        prefix: FILE_PREFIXES.analysis,
        data: run
    });
}

async function saveReportRun(run) {
    return appendVersionedRun({
        key: STORAGE_KEYS.reportRuns,
        prefix: FILE_PREFIXES.report,
        data: run
    });
}

export {
    saveVersionedFile,
    saveSearchRun,
    saveExtractionRun,
    saveAnalysisRun,
    saveReportRun
};

