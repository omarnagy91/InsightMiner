/**
 * @file report.js
 * @description This file contains functions related to saving and managing final analysis reports.
 */

import { saveReportRun } from './storage.js';
import { FILE_PREFIXES } from './constants.js';

/**
 * Saves a generated report to local storage as a versioned run.
 * @param {object} report - The report data to be saved.
 * @returns {Promise<object>} A promise that resolves to the saved run object, which includes an ID, the data, and a timestamp.
 */
async function saveReportData(report) {
    const run = {
        id: `${FILE_PREFIXES.report}_${Date.now()}`,
        data: report,
        savedAt: new Date().toISOString()
    };

    await saveReportRun(run);
    return run;
}

export {
    saveReportData
};