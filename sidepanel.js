/**
 * @file sidepanel.js
 * @description This script controls the main user interface of the extension's side panel.
 * It manages the three main modes (Sources, Extraction, AI Analysis), handles user input,
 * communicates with the background script to initiate tasks, and displays real-time progress and status updates.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Mode switching elements
    const modeOptions = document.querySelectorAll('.mode-option');
    const sourcesMode = document.getElementById('sourcesMode');
    const extractionMode = document.getElementById('extractionMode');
    const aiMode = document.getElementById('aiMode');

    // Sources mode elements
    const selectedSourcesCount = document.getElementById('selectedSourcesCount');
    const sourceCheckboxes = {
        reddit: document.getElementById('redditCheckbox'),
        stackoverflow: document.getElementById('stackoverflowCheckbox'),
        github: document.getElementById('githubCheckbox'),
        devto: document.getElementById('devtoCheckbox'),
        medium: document.getElementById('mediumCheckbox'),
        producthunt: document.getElementById('producthuntCheckbox'),
        quora: document.getElementById('quoraCheckbox'),
        hackernews: document.getElementById('hackernewsCheckbox')
    };
    const topicInput = document.getElementById('topicInput');
    const generateDorks = document.getElementById('generateDorks');
    const sourcesStatus = document.getElementById('sourcesStatus');
    const googleSearchProgress = document.getElementById('googleSearchProgress');
    const googleProgressFill = document.getElementById('googleProgressFill');
    const googleProgressText = document.getElementById('googleProgressText');
    const googleProgressPercent = document.getElementById('googleProgressPercent');
    const googleCurrentQuery = document.getElementById('googleCurrentQuery');

    // Extraction mode elements
    const totalUrls = document.getElementById('totalUrls');
    const extractionStatusSpan = document.getElementById('extractionStatusSpan');
    const csvFileInput = document.getElementById('csvFileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const urlCount = document.getElementById('urlCount');
    const sourceBreakdown = document.getElementById('sourceBreakdown');
    const exportSearchResults = document.getElementById('exportSearchResults');
    const startExtraction = document.getElementById('startExtraction');
    const extractionStatus = document.getElementById('extractionStatus');
    const extractionProgress = document.getElementById('extractionProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    const currentUrl = document.getElementById('currentUrl');
    const stopExtraction = document.getElementById('stopExtraction');

    // AI Analysis elements
    const itemsAnalyzed = document.getElementById('itemsAnalyzed');
    const analysisStatus = document.getElementById('analysisStatus');
    const startAIAnalysis = document.getElementById('startAIAnalysis');
    const viewResults = document.getElementById('viewResults');
    const openReportUI = document.getElementById('openReportUI');
    const exportAnalysis = document.getElementById('exportAnalysis');
    const aiStatus = document.getElementById('aiStatus');
    const aiProgress = document.getElementById('aiProgress');
    const aiProgressFill = document.getElementById('aiProgressFill');
    const aiProgressText = document.getElementById('aiProgressText');
    const aiProgressPercent = document.getElementById('aiProgressPercent');
    const jsonFileInput = document.getElementById('jsonFileInput');
    const jsonFileInfo = document.getElementById('jsonFileInfo');
    const jsonFileName = document.getElementById('jsonFileName');
    const jsonItemCount = document.getElementById('jsonItemCount');
    const reportFileInput = document.getElementById('reportFileInput');
    const reportFileInfo = document.getElementById('reportFileInfo');
    const reportFileName = document.getElementById('reportFileName');
    const openReportBtn = document.getElementById('openReport');
    const analysisResults = document.getElementById('analysisResults');

    /**
     * Initializes the side panel by setting up event listeners and loading initial state from storage.
     */
    function initializeSidepanel() {
        setupModeSwitching();
        setupSourcesMode();
        setupExtractionMode();
        setupAIMode();
        loadInitialState();
        listenForStorageChanges();
    }

    /**
     * Sets up event listeners for the main mode switcher (Sources, Extraction, AI).
     */
    function setupModeSwitching() {
        modeOptions.forEach((option, index) => {
            option.addEventListener('click', () => switchMode(option.dataset.mode, index));
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    switchMode(option.dataset.mode, index);
                }
            });
        });
    }

    /**
     * Switches the visible content area and theme based on the selected mode.
     * @param {string} mode - The mode to switch to ('sources', 'extraction', 'ai').
     * @param {number} [index=null] - The index of the selected mode option.
     */
    function switchMode(mode, index = null) {
        modeOptions.forEach(option => option.classList.remove('active'));
        const activeOption = document.querySelector(`.mode-option[data-mode="${mode}"]`);
        if (activeOption) activeOption.classList.add('active');

        [sourcesMode, extractionMode, aiMode].forEach(el => el.classList.remove('active'));
        document.getElementById(`${mode}Mode`).classList.add('active');

        document.body.className = `${mode}-theme`;
    }

    /**
     * Sets up event listeners for the "Sources" mode UI elements.
     */
    function setupSourcesMode() {
        Object.values(sourceCheckboxes).forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedSourcesCount);
        });
        generateDorks.addEventListener('click', generateSearchQueries);
    }

    /**
     * Sets up event listeners for the "Extraction" mode UI elements.
     */
    function setupExtractionMode() {
        csvFileInput.addEventListener('change', handleFileSelect);
        exportSearchResults.addEventListener('click', exportSearchResultsToCSV);
        startExtraction.addEventListener('click', startExtractionProcess);
        stopExtraction.addEventListener('click', stopExtractionProcess);
    }

    /**
     * Sets up event listeners for the "AI Analysis" mode UI elements.
     */
    function setupAIMode() {
        startAIAnalysis.addEventListener('click', startAIAnalysisProcess);
        viewResults.addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('ai_analysis.html') }));
        openReportUI.addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('report_ui.html') }));
        exportAnalysis.addEventListener('click', exportAnalysisResults);
        jsonFileInput.addEventListener('change', handleJSONFileSelect);
        reportFileInput.addEventListener('change', handleReportFileSelect);
        openReportBtn.addEventListener('click', openReportInAnalysisTab);
    }

    /**
     * Loads the initial state of the side panel from `chrome.storage.local`.
     */
    async function loadInitialState() {
        try {
            const stored = await chrome.storage.local.get([
                'selectedSources', 'extractionState', 'analysisState',
                'per_post_analysis', 'aggregated_analysis', 'searchResults'
            ]);

            updateSourcesStats(stored.selectedSources || ['reddit']);
            updateExtractionStatus(stored.extractionState || {});
            updateAIStatus(stored.analysisState || {}, stored.per_post_analysis || [], stored.aggregated_analysis || null);

            if (stored.searchResults?.length) {
                exportSearchResults.style.display = 'block';
                setupExtractionWithStoredResults(stored.searchResults);
            }
        } catch (error) {
            console.error('Error initializing sidepanel:', error);
            showStatus(sourcesStatus, 'Error initializing extension', 'error');
        }
    }

    /**
     * Listens for changes in `chrome.storage.local` to update the UI in real-time.
     */
    function listenForStorageChanges() {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace !== 'local') return;

            if (changes.selectedSources) updateSourcesStats(changes.selectedSources.newValue);
            if (changes.searchResults) {
                const results = changes.searchResults.newValue || [];
                showStatus(sourcesStatus, `Google searches completed! Found ${results.length} total results.`, 'success');
                if (results.length > 0) {
                    exportSearchResults.style.display = 'block';
                    setupExtractionWithStoredResults(results);
                }
                hideGoogleSearchProgress();
            }
            if (changes.googleSearchProgress) updateGoogleSearchProgress(changes.googleSearchProgress.newValue);
            if (changes.extractionState) {
                const extraction = changes.extractionState.newValue;
                updateExtractionStatus(extraction);
                if (extraction.isRunning) updateProgress(extraction);
                else if (extraction.completed) {
                    showStatus(extractionStatus, 'Data extraction completed!', 'success');
                    hideProgressTracking();
                    if (extraction.extractedData?.length) setupAIAnalysisWithExtractedData(extraction.extractedData);
                }
            }
            if (changes.analysisState) updateAIStatus(changes.analysisState.newValue, changes.per_post_analysis?.newValue, changes.aggregated_analysis?.newValue);
        });
    }

    /**
     * Updates the count of selected sources.
     */
    function updateSelectedSourcesCount() {
        const selected = Object.values(sourceCheckboxes).filter(cb => cb.checked).length;
        selectedSourcesCount.textContent = selected;
        chrome.storage.local.set({ selectedSources: Object.keys(sourceCheckboxes).filter(key => sourceCheckboxes[key].checked) });
    }

    /**
     * Updates the source checkboxes based on stored preferences.
     * @param {Array<string>} sources - An array of selected source keys.
     */
    function updateSourcesStats(sources) {
        Object.entries(sourceCheckboxes).forEach(([source, checkbox]) => {
            checkbox.checked = sources.includes(source);
        });
        selectedSourcesCount.textContent = sources.length;
    }

    /**
     * Initiates the AI-powered search query generation process.
     */
    async function generateSearchQueries() {
        const topic = topicInput.value.trim();
        const selectedSources = Object.keys(sourceCheckboxes).filter(key => sourceCheckboxes[key].checked);
        if (!topic || !selectedSources.length) {
            showStatus(sourcesStatus, 'Please enter a topic and select at least one source.', 'error');
            return;
        }

        try {
            generateDorks.disabled = true;
            generateDorks.innerHTML = '<div class="loading"></div>Generating...';
            showStatus(sourcesStatus, 'Generating AI-powered search queries...', 'success');
            const response = await chrome.runtime.sendMessage({ type: 'GENERATE_SEARCH_QUERIES', topic, sources: selectedSources });
            if (response?.success) {
                showStatus(sourcesStatus, `Generated ${selectedSources.length} queries! Now executing searches...`, 'success');
                showGoogleSearchProgress(selectedSources.length);
                switchMode('extraction');
            } else {
                throw new Error(response?.error || 'Failed to generate queries');
            }
        } catch (error) {
            handleError(error, 'generateSearchQueries');
        } finally {
            generateDorks.disabled = false;
            generateDorks.innerHTML = '<div class="mode-icon sources-icon"></div>Generate Queries';
        }
    }

    /**
     * Updates the UI to reflect the current status of the data extraction process.
     * @param {object} extraction - The extraction state object from storage.
     */
    function updateExtractionStatus(extraction) {
        if (extraction.isRunning) extractionStatusSpan.textContent = 'Running';
        else if (extraction.completed) extractionStatusSpan.textContent = 'Completed';
        else if (extraction.stopped) extractionStatusSpan.textContent = 'Stopped';
        else extractionStatusSpan.textContent = 'Ready';
    }

    /**
     * Exports the collected search results to a CSV file.
     */
    async function exportSearchResultsToCSV() {
        try {
            const { searchResults } = await chrome.storage.local.get(['searchResults']);
            if (!searchResults?.length) {
                showStatus(extractionStatus, 'No search results to export', 'error');
                return;
            }
            const headers = Object.keys(searchResults[0]);
            const csvContent = [
                headers.join(','),
                ...searchResults.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
            ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            await chrome.downloads.download({ url, filename: 'search_results.csv', saveAs: true });
        } catch (error) {
            handleError(error, 'exportSearchResultsToCSV');
        }
    }

    /**
     * Handles the selection of a CSV file for URL extraction.
     * @param {Event} event - The file input change event.
     */
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            const reader = new FileReader();
            reader.onload = e => {
                const urls = e.target.result.split('\n').map(line => line.split(',')[1]?.replace(/"/g, '')).filter(url => url?.startsWith('http'));
                window.selectedUrls = urls;
                fileName.textContent = file.name;
                urlCount.textContent = urls.length;
                totalUrls.textContent = urls.length;
                sourceBreakdown.innerHTML = Object.entries(getSourceBreakdown(urls)).map(([source, count]) => `<p>${source}: ${count} URLs</p>`).join('');
                fileInfo.style.display = 'block';
            };
            reader.readAsText(file);
        } else {
            showStatus(extractionStatus, 'Please select a valid CSV file', 'error');
        }
    }

    /**
     * Configures the extraction UI with URLs from previously stored search results.
     * @param {Array<object>} searchResults - The search results from storage.
     */
    function setupExtractionWithStoredResults(searchResults) {
        const urls = searchResults.map(r => r.url).filter(Boolean);
        if (!urls.length) return;
        window.selectedUrls = urls;
        totalUrls.textContent = urls.length;
        fileName.textContent = 'Stored Search Results';
        urlCount.textContent = urls.length;
        sourceBreakdown.innerHTML = Object.entries(getSourceBreakdown(urls)).map(([platform, count]) => `<span class="platform-tag">${platform}: ${count}</span>`).join(' ');
        fileInfo.style.display = 'block';
        showStatus(extractionStatus, `Ready to extract from ${urls.length} stored URLs`, 'success');
    }

    /**
     * Gets a count of URLs per platform.
     * @param {Array<string>} urls - An array of URLs.
     * @returns {object} An object with platform names as keys and URL counts as values.
     */
    function getSourceBreakdown(urls) {
        const breakdown = {};
        urls.forEach(url => {
            let source = 'Other';
            if (url.includes('reddit.com')) source = 'Reddit';
            else if (url.includes('stackoverflow.com')) source = 'Stack Overflow';
            else if (url.includes('github.com')) source = 'GitHub';
            else if (url.includes('dev.to')) source = 'Dev.to';
            else if (url.includes('medium.com')) source = 'Medium';
            breakdown[source] = (breakdown[source] || 0) + 1;
        });
        return breakdown;
    }

    /**
     * Starts the data extraction process by sending a message to the background script.
     */
    async function startExtractionProcess() {
        if (!window.selectedUrls?.length) {
            showStatus(extractionStatus, 'Please select a CSV file with URLs first', 'error');
            return;
        }
        try {
            startExtraction.disabled = true;
            startExtraction.innerHTML = '<div class="loading"></div>Starting...';
            showStatus(extractionStatus, 'Starting data extraction...', 'success');
            const response = await chrome.runtime.sendMessage({
                type: 'START_DATA_EXTRACTION',
                urls: window.selectedUrls,
                closeTabs: document.getElementById('closeTabs').checked,
                extractComments: document.getElementById('extractComments').checked,
                extractMetadata: document.getElementById('extractMetadata').checked
            });
            if (!response.success) throw new Error(response.error || 'Failed to start');
        } catch (error) {
            handleError(error, 'startExtractionProcess');
        } finally {
            startExtraction.disabled = false;
            startExtraction.innerHTML = '<div class="mode-icon extraction-icon"></div>Start Extraction';
        }
    }

    /**
     * Stops the ongoing data extraction process.
     */
    async function stopExtractionProcess() {
        try {
            stopExtraction.disabled = true;
            stopExtraction.innerHTML = '<div class="loading"></div>Stopping...';
            const response = await chrome.runtime.sendMessage({ type: 'STOP_AND_SAVE_EXTRACTION' });
            if (response.success) showStatus(extractionStatus, response.message, 'success');
            else showStatus(extractionStatus, 'Error: ' + response.error, 'error');
            hideProgressTracking();
        } catch (error) {
            handleError(error, 'stopExtractionProcess');
        } finally {
            stopExtraction.disabled = false;
            stopExtraction.innerHTML = 'Stop Extraction';
        }
    }

    /**
     * Shows and updates the progress bar for an ongoing process.
     * @param {HTMLElement} progressElement - The container for the progress bar.
     * @param {HTMLElement} fillElement - The progress bar fill element.
     * @param {HTMLElement} textElement - The element for text like "X / Y".
     * @param {HTMLElement} percentElement - The element for the percentage text.
     * @param {number} current - The current progress value.
     * @param {number} total - The total value.
     * @param {string} [taskText=null] - The text describing the current task.
     */
    function updateProgressUI(progressElement, fillElement, textElement, percentElement, current, total, taskText = null) {
        progressElement.style.display = 'block';
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        fillElement.style.width = `${percent}%`;
        textElement.textContent = `${current} / ${total}`;
        percentElement.textContent = `${percent}%`;
        if (taskText) {
            const taskEl = progressElement.querySelector('.current-task') || currentUrl;
            taskEl.textContent = taskText;
        }
    }

    /**
     * A wrapper function to update the Google Search progress UI.
     * @param {object} progress - The progress object from storage.
     */
    const updateGoogleSearchProgress = (progress) => updateProgressUI(googleSearchProgress, googleProgressFill, googleProgressText, googleProgressPercent, progress.current, progress.total, progress.currentQuery);

    /**
     * A wrapper function to update the Data Extraction progress UI.
     * @param {object} extraction - The extraction state object from storage.
     */
    const updateProgress = (extraction) => updateProgressUI(extractionProgress, progressFill, progressText, progressPercent, extraction.progress, extraction.total, extraction.currentUrl);

    /**
     * A wrapper function to update the AI Analysis progress UI.
     * @param {object} analysis - The analysis state object from storage.
     */
    const updateAIAnalysisProgress = (analysis) => updateProgressUI(aiProgress, aiProgressFill, aiProgressText, aiProgressPercent, analysis.progress, analysis.total, analysis.currentTask);

    /**
     * Hides the data extraction progress bar.
     */
    const hideProgressTracking = () => extractionProgress.style.display = 'none';

    /**
     * Hides the Google Search progress bar.
     */
    const hideGoogleSearchProgress = () => googleSearchProgress.style.display = 'none';

    /**
     * Updates the UI to reflect the status of the AI analysis process.
     * @param {object} analysis - The analysis state object.
     * @param {Array<object>} perPostResults - The array of per-post analysis results.
     * @param {object} aggregateResults - The aggregated analysis results.
     */
    function updateAIStatus(analysis, perPostResults, aggregateResults) {
        itemsAnalyzed.textContent = perPostResults?.length || 0;
        if (analysis?.isRunning) {
            analysisStatus.textContent = 'Running';
            updateAIAnalysisProgress(analysis);
        } else if (aggregateResults) {
            analysisStatus.textContent = 'Completed';
            showAnalysisResults(aggregateResults);
        } else {
            analysisStatus.textContent = 'Ready';
        }
    }

    /**
     * Handles the selection of a local JSON file for analysis.
     * @param {Event} event - The file input change event.
     */
    function handleJSONFileSelect(event) {
        const file = event.target.files[0];
        if (file?.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const data = JSON.parse(e.target.result);
                    const itemCount = data.data?.length || data.extractedData?.length || data.posts?.length || (Array.isArray(data) ? data.length : 0);
                    window.selectedJSONData = data;
                    jsonFileName.textContent = file.name;
                    jsonItemCount.textContent = itemCount;
                    jsonFileInfo.style.display = 'block';
                } catch (err) {
                    showStatus(aiStatus, 'Error parsing JSON file.', 'error');
                }
            };
            reader.readAsText(file);
        } else {
            showStatus(aiStatus, 'Please select a valid JSON file.', 'error');
        }
    }

    /**
     * Handles the selection of a local report file to view.
     * @param {Event} event - The file input change event.
     */
    function handleReportFileSelect(event) {
        const file = event.target.files[0];
        if (file?.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.aggregated_analysis || data.per_post_analysis) {
                        window.selectedReportData = data;
                        reportFileName.textContent = file.name;
                        reportFileInfo.style.display = 'block';
                        openReportBtn.style.display = 'block';
                    } else {
                        showStatus(aiStatus, 'Invalid report file.', 'error');
                    }
                } catch (err) {
                    showStatus(aiStatus, 'Error parsing report file.', 'error');
                }
            };
            reader.readAsText(file);
        } else {
            showStatus(aiStatus, 'Please select a valid JSON report file.', 'error');
        }
    }

    /**
     * Opens a selected local report file in the full analysis view.
     */
    async function openReportInAnalysisTab() {
        if (!window.selectedReportData) {
            showStatus(aiStatus, 'Please select a report file first.', 'error');
            return;
        }
        await chrome.storage.local.set({ temp_report_data: window.selectedReportData, report_source: 'file_upload' });
        chrome.tabs.create({ url: chrome.runtime.getURL('ai_analysis.html') });
    }

    /**
     * Starts the AI analysis process by sending data to the background script.
     */
    async function startAIAnalysisProcess() {
        try {
            const { OPENAI_API_KEY } = await chrome.storage.local.get(['OPENAI_API_KEY']);
            if (!OPENAI_API_KEY) {
                showStatus(aiStatus, 'Please set your OpenAI API key in the options.', 'error');
                return;
            }

            const selectedSource = document.querySelector('input[name="dataSource"]:checked').value;
            let itemsToAnalyze = [];
            if (selectedSource === 'extracted') {
                const { extractionState } = await chrome.storage.local.get(['extractionState']);
                itemsToAnalyze = extractionState?.extractedData || [];
            } else if (selectedSource === 'file') {
                itemsToAnalyze = window.selectedJSONData?.data || window.selectedJSONData?.extractedData || window.selectedJSONData?.posts || (Array.isArray(window.selectedJSONData) ? window.selectedJSONData : []);
            }

            if (!itemsToAnalyze.length) {
                showStatus(aiStatus, 'No items found in the selected data source.', 'error');
                return;
            }

            startAIAnalysis.disabled = true;
            startAIAnalysis.innerHTML = '<div class="loading"></div>Analyzing...';
            showStatus(aiStatus, `Starting analysis of ${itemsToAnalyze.length} items...`, 'success');
            const response = await chrome.runtime.sendMessage({ type: 'ANALYZE', posts: itemsToAnalyze });
            if (!response.ok) throw new Error(response.error || 'Analysis failed');
        } catch (error) {
            handleError(error, 'startAIAnalysisProcess');
        } finally {
            startAIAnalysis.disabled = false;
            startAIAnalysis.innerHTML = '<div class="mode-icon ai-icon"></div>Start AI Analysis';
        }
    }

    /**
     * Displays a summary of the analysis results in the side panel.
     * @param {object} aggregateResults - The aggregated analysis data.
     */
    function showAnalysisResults(aggregateResults) {
        analysisResults.style.display = 'block';
        const topToolsList = document.getElementById('topToolsList');
        const mvpList = document.getElementById('mvpList');
        topToolsList.innerHTML = (aggregateResults.top_requested_tools || []).slice(0, 5).map(tool => `<li>${tool}</li>`).join('');
        mvpList.innerHTML = (aggregateResults.mvp_recommendations || []).slice(0, 5).map(rec => `<li>${rec}</li>`).join('');
    }

    /**
     * Exports the analysis results to a file (JSON or Markdown).
     */
    async function exportAnalysisResults() {
        try {
            const { per_post_analysis, aggregated_analysis } = await chrome.storage.local.get(['per_post_analysis', 'aggregated_analysis']);
            if (!aggregated_analysis) {
                showStatus(aiStatus, 'No analysis results to export', 'error');
                return;
            }
            // Logic to choose format and generate file would go here.
            // For simplicity, we'll just export JSON.
            const exportData = { timestamp: new Date().toISOString(), per_post_analysis, aggregated_analysis };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            await chrome.downloads.download({ url, filename: 'ai_analysis.json', saveAs: true });
        } catch (error) {
            handleError(error, 'exportAnalysisResults');
        }
    }

    /**
     * Displays a status message in the specified status element.
     * @param {HTMLElement} statusElement - The element to display the status in.
     * @param {string} message - The message text.
     * @param {string} type - The type of message ('success', 'error', 'info').
     * @param {number} [duration=5000] - How long to display the message.
     */
    function showStatus(statusElement, message, type, duration = 5000) {
        if (statusElement.timeoutId) clearTimeout(statusElement.timeoutId);
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
        statusElement.style.display = 'block';
        statusElement.style.opacity = '1';
        statusElement.timeoutId = setTimeout(() => {
            statusElement.style.opacity = '0';
            setTimeout(() => { statusElement.style.display = 'none'; }, 300);
        }, duration);
    }

    /**
     * A generic error handler for the side panel.
     * @param {Error} error - The error object.
     * @param {string} context - The context in which the error occurred.
     */
    function handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        const userMessage = error.message.includes('API key') ? 'Please check your OpenAI API key.' : 'An unexpected error occurred.';
        const activeStatusEl = document.querySelector('.content-area.active .status');
        if (activeStatusEl) showStatus(activeStatusEl, userMessage, 'error');
    }

    // Initial setup call
    initializeSidepanel();
});