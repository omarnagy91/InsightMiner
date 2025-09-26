import { saveReportRun } from './storage.js';
import { FILE_PREFIXES } from './constants.js';

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

