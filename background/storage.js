/**
 * @file storage.js
 * @description This file contains utility functions for saving data to the user's local machine
 * and managing versioned "runs" of data (e.g., search sessions, extraction runs) in `chrome.storage.local`.
 */

import { STORAGE_KEYS, FILE_PREFIXES } from './constants.js';

/**
 * Generates a file-safe timestamp string from the current date and time.
 * @returns {string} The formatted timestamp (e.g., "2023-10-27T10-30-00-000Z").
 */
function timestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-');
}

/**
 * Saves data to a versioned JSON file in the user's downloads directory.
 * @param {object} params - The parameters for saving the file.
 * @param {string} params.prefix - The prefix for the filename (e.g., 'search', 'extraction').
 * @param {object|Array} params.data - The data to be saved as JSON.
 * @returns {Promise<void>} A promise that resolves when the download is initiated.
 */
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

/**
 * Appends a new data "run" to a versioned list in local storage.
 * This keeps a history of recent runs, limited to the last 50.
 * @param {object} params - The parameters for appending the run.
 * @param {string} params.key - The storage key where the list of runs is stored.
 * @param {string} params.prefix - The prefix for generating the run's unique ID.
 * @param {object|Array} params.data - The data for the new run.
 * @returns {Promise<object>} A promise that resolves to the newly created run object.
 */
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

/**
 * Saves a completed search session as a versioned run.
 * @param {object} run - The search run data.
 * @returns {Promise<object>} A promise that resolves to the saved run object.
 */
async function saveSearchRun(run) {
    return appendVersionedRun({
        key: STORAGE_KEYS.searchSessions,
        prefix: FILE_PREFIXES.search,
        data: run
    });
}

/**
 * Saves a completed data extraction as a versioned run.
 * @param {object} run - The extraction run data.
 * @returns {Promise<object>} A promise that resolves to the saved run object.
 */
async function saveExtractionRun(run) {
    return appendVersionedRun({
        key: STORAGE_KEYS.extractionRuns,
        prefix: FILE_PREFIXES.extraction,
        data: run
    });
}

/**
 * Saves a completed AI analysis as a versioned run.
 * @param {object} run - The analysis run data.
 * @returns {Promise<object>} A promise that resolves to the saved run object.
 */
async function saveAnalysisRun(run) {
    return appendVersionedRun({
        key: STORAGE_KEYS.analysisRuns,
        prefix: FILE_PREFIXES.analysis,
        data: run
    });
}

/**
 * Saves a generated report as a versioned run.
 * @param {object} run - The report run data.
 * @returns {Promise<object>} A promise that resolves to the saved run object.
 */
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