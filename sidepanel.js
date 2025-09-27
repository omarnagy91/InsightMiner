/**
 * @file sidepanel.js
 * @description This script controls the main user interface of the extension's side panel.
 * It manages the three main modes (Sources, Extraction, AI Analysis), handles user input,
 * communicates with the background script to initiate tasks, and displays real-time progress and status updates.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Mode switching elements
    const modeSwitcher = document.querySelector('.mode-switcher');
    const modeOptions = document.querySelectorAll('.mode-option');
    const sourcesMode = document.getElementById('sourcesMode');
    const extractionMode = document.getElementById('extractionMode');
    const aiMode = document.getElementById('aiMode');

    // Add keyboard navigation support
    let currentModeIndex = 0;
    const modes = ['sources', 'extraction', 'ai'];

    // Sources mode elements
    const selectedSourcesCount = document.getElementById('selectedSourcesCount');
    const lastAnalysis = document.getElementById('lastAnalysis');
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

    // Google search progress elements
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

    // Progress tracking elements
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
    const aiCurrentTask = document.getElementById('aiCurrentTask');
    const analysisResults = document.getElementById('analysisResults');

    // File selection elements
    const jsonFileInput = document.getElementById('jsonFileInput');
    const jsonFileInfo = document.getElementById('jsonFileInfo');
    const jsonFileName = document.getElementById('jsonFileName');
    const jsonItemCount = document.getElementById('jsonItemCount');
    const reportFileInput = document.getElementById('reportFileInput');
    const reportFileInfo = document.getElementById('reportFileInfo');
    const reportFileName = document.getElementById('reportFileName');
    const reportType = document.getElementById('reportType');
    const dataSourceRadios = document.querySelectorAll('input[name="dataSource"]');
    const openReportBtn = document.getElementById('openReport');

    // Enhanced AI results elements
    const topToolsList = document.getElementById('topToolsList');
    const mvpList = document.getElementById('mvpList');
    const issuesList = document.getElementById('issuesList');
    const prosList = document.getElementById('prosList');
    const actionPlanText = document.getElementById('actionPlanText');

    // Initialize sidepanel with enhanced setup
    initializeSidepanel();

    // Event listeners
    setupModeSwitching();
    setupSourcesMode();
    setupExtractionMode();
    setupAIMode();
    setupTooltips();
    setupKeyboardShortcuts();
    setupSecurityWarning();

    /**
     * @description Sets up event listeners for the main mode switcher (Sources, Extraction, AI).
     */
    function setupModeSwitching() {
        modeOptions.forEach((option, index) => {
            option.addEventListener('click', () => {
                const mode = option.dataset.mode;
                switchMode(mode, index);
            });

            // Add keyboard support
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const mode = option.dataset.mode;
                    switchMode(mode, index);
                }
            });
        });

        // Add global keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        switchMode('sources', 0);
                        break;
                    case '2':
                        e.preventDefault();
                        switchMode('extraction', 1);
                        break;
                    case '3':
                        e.preventDefault();
                        switchMode('ai', 2);
                        break;
                }
            }
        });
    }

    /**
     * @description Switches the visible content area and theme based on the selected mode.
     * @param {string} mode - The mode to switch to ('sources', 'extraction', 'ai').
     * @param {number} [index=null] - The index of the selected mode option.
     */
    function switchMode(mode, index = null) {
        // Update current mode index
        if (index !== null) {
            currentModeIndex = index;
        }

        // Add smooth transition effect
        const activeContent = document.querySelector('.content-area.active');
        if (activeContent) {
            activeContent.style.opacity = '0';
            activeContent.style.transform = 'translateY(10px)';
        }

        setTimeout(() => {
            // Update active mode option with enhanced animation
            modeOptions.forEach((option, i) => {
                const isActive = option.dataset.mode === mode;
                option.classList.toggle('active', isActive);

                // Add focus for accessibility
                if (isActive) {
                    option.focus();
                }
            });

            // Show/hide content areas with animation
            sourcesMode.classList.toggle('active', mode === 'sources');
            extractionMode.classList.toggle('active', mode === 'extraction');
            aiMode.classList.toggle('active', mode === 'ai');

            // Update body theme with smooth transition
            document.body.style.transition = 'background 0.3s ease';
            if (mode === 'sources') {
                document.body.className = 'sources-theme';
            } else if (mode === 'extraction') {
                document.body.className = 'extraction-theme';
            } else if (mode === 'ai') {
                document.body.className = 'ai-theme';
            }

            // Animate in the new content
            const newActiveContent = document.querySelector('.content-area.active');
            if (newActiveContent) {
                newActiveContent.style.opacity = '1';
                newActiveContent.style.transform = 'translateY(0)';
            }
        }, 150);
    }

    /**
     * @description Sets up event listeners for the "Sources" mode UI elements.
     */
    function setupSourcesMode() {
        // Setup source checkboxes
        Object.values(sourceCheckboxes).forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedSourcesCount);
        });

        generateDorks.addEventListener('click', generateSearchQueries);
    }

    /**
     * @description Sets up event listeners for the "Extraction" mode UI elements.
     */
    function setupExtractionMode() {
        csvFileInput.addEventListener('change', handleFileSelect);
        exportSearchResults.addEventListener('click', exportSearchResultsToCSV);
        startExtraction.addEventListener('click', startExtractionProcess);
        stopExtraction.addEventListener('click', stopExtractionProcess);

        // Add periodic refresh to check extraction status (only when extraction is running)
        let refreshInterval = null;

        // Start periodic refresh only when needed
        function startPeriodicRefresh() {
            if (!refreshInterval) {
                refreshInterval = setInterval(async () => {
                    const { extractionState } = await chrome.storage.local.get(['extractionState']);
                    if (!extractionState || !extractionState.isRunning) {
                        // Stop refresh when extraction is not running
                        clearInterval(refreshInterval);
                        refreshInterval = null;
                        return;
                    }
                    refreshExtractionStatus();
                }, 3000); // Check every 3 seconds
            }
        }

        // Listen for extraction start to begin periodic refresh
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (changes.extractionState && changes.extractionState.newValue?.isRunning) {
                startPeriodicRefresh();
            }
        });
    }

    /**
     * @description Sets up event listeners for the "AI Analysis" mode UI elements.
     */
    function setupAIMode() {
        startAIAnalysis.addEventListener('click', startAIAnalysisProcess);
        viewResults.addEventListener('click', viewAnalysisResults);
        openReportUI.addEventListener('click', openReportUIPage);
        exportAnalysis.addEventListener('click', exportAnalysisResults);

        // Continue and regeneration buttons
        const continueFromLastAnalysis = document.getElementById('continueFromLastAnalysis');
        const regeneratePitches = document.getElementById('regeneratePitches');
        const regeneratePlan = document.getElementById('regeneratePlan');

        continueFromLastAnalysis.addEventListener('click', continueFromLastAnalysisProcess);
        regeneratePitches.addEventListener('click', regeneratePitchesProcess);
        regeneratePlan.addEventListener('click', regeneratePlanProcess);

        // File selection setup
        jsonFileInput.addEventListener('change', handleJSONFileSelect);
        reportFileInput.addEventListener('change', handleReportFileSelect);
        openReportBtn.addEventListener('click', openReportInAnalysisTab);
        dataSourceRadios.forEach(radio => {
            radio.addEventListener('change', handleDataSourceChange);
        });

        // Weight controls setup
        setupWeightControls();
    }

    /**
     * @description Initializes the side panel by setting up event listeners and loading initial state from storage.
     */
    async function initializeSidepanel() {
        try {
            // Load stored data using new storage keys
            const stored = await chrome.storage.local.get([
                'selectedSources',
                'extractionState',
                'analysisState',
                'per_post_analysis',
                'aggregated_analysis',
                'searchResults',
                'failedUrls',
                'demandWeights',
                'lastExtractionRun',
                'lastAnalysisRun'
            ]);

            updateSelectedSourcesCount();
            updateSourcesStats(stored.selectedSources || ['reddit']);
            updateExtractionStatus(stored.extractionState || {});
            updateAIStatus(stored.analysisState || {}, stored.per_post_analysis || [], stored.aggregated_analysis || null);

            // Show export button if we have search results
            if (stored.searchResults && stored.searchResults.length > 0) {
                exportSearchResults.style.display = 'block';

                // Automatically set up extraction mode with stored search results
                setupExtractionWithStoredResults(stored.searchResults);
            }

            // Show failed URLs if any
            if (stored.failedUrls && stored.failedUrls.length > 0) {
                showFailedUrlsNotification(stored.failedUrls.length);
            }

            // Set up AI Analysis mode with extracted data if available
            if (stored.extractionState?.extractedData && stored.extractionState.extractedData.length > 0) {
                setupAIAnalysisWithExtractedData(stored.extractionState.extractedData);
            }

            // Check for ongoing Google search progress
            if (stored.googleSearchProgress) {
                const progress = stored.googleSearchProgress;
                if (progress.current < progress.total) {
                    showGoogleSearchProgress(progress.total);
                    updateGoogleSearchProgress(progress.current, progress.total, progress.currentQuery);
                }
            }

        } catch (error) {
            console.error('Error initializing sidepanel:', error);
            showSourcesStatus('Error initializing extension', 'error');
        }
    }

    /**
     * @description Updates the count of selected sources displayed in the UI and stores the selection.
     */
    function updateSelectedSourcesCount() {
        const selectedSources = [];
        Object.entries(sourceCheckboxes).forEach(([source, checkbox]) => {
            if (checkbox.checked) {
                selectedSources.push(source);
            }
        });

        selectedSourcesCount.textContent = selectedSources.length;

        // Store selected sources
        chrome.storage.local.set({ selectedSources });
    }

    /**
     * @description Updates the source checkboxes based on stored preferences.
     * @param {Array<string>} sources - An array of selected source keys.
     */
    function updateSourcesStats(sources) {
        // Update checkboxes based on stored preferences
        Object.entries(sourceCheckboxes).forEach(([source, checkbox]) => {
            checkbox.checked = sources.includes(source);
        });
        selectedSourcesCount.textContent = sources.length;
    }

    /**
     * @description Initiates the AI-powered search query generation process.
     */
    async function generateSearchQueries() {
        const topic = topicInput.value.trim();
        if (!topic) {
            showSourcesStatus('Please enter a topic for analysis', 'error');
            topicInput.focus();
            return;
        }

        const selectedSources = [];
        Object.entries(sourceCheckboxes).forEach(([source, checkbox]) => {
            if (checkbox.checked) {
                selectedSources.push(source);
            }
        });

        if (selectedSources.length === 0) {
            showSourcesStatus('Please select at least one source', 'error');
            return;
        }

        try {
            generateDorks.disabled = true;
            generateDorks.innerHTML = '<div class="loading"></div>Generating Queries...';
            showSourcesStatus('Generating AI-powered search queries...', 'success');

            const response = await chrome.runtime.sendMessage({
                type: 'GENERATE_SEARCH_QUERIES',
                topic,
                sources: selectedSources
            });

            if (response && response.success) {
                showSourcesStatus(`Generated ${selectedSources.length} search queries! Now executing Google searches...`, 'success');
                // Store the generated queries
                await chrome.storage.local.set({ generatedQueries: response.queries });

                // Show Google search progress
                showGoogleSearchProgress(selectedSources.length);

                // Switch to extraction mode
                switchMode('extraction');
            } else {
                throw new Error(response?.error || 'Failed to generate search queries');
            }

        } catch (error) {
            console.error('Error generating search queries:', error);
            if (error.message.includes('Extension context invalidated')) {
                showSourcesStatus('Extension needs to be reloaded. Please refresh the page and try again.', 'error');
            } else {
                showSourcesStatus('Error: ' + error.message, 'error');
            }
        } finally {
            generateDorks.disabled = false;
            generateDorks.innerHTML = '<div class="mode-icon sources-icon"></div>Generate AI-Powered Search Queries';
        }
    }

    /**
     * @description Updates the UI to reflect the current status of the data extraction process.
     * @param {object} extraction - The extraction state object from storage.
     */
    function updateExtractionStatus(extraction) {
        console.log('updateExtractionStatus called with:', extraction);

        if (extraction.isRunning) {
            console.log('Setting status to Running');
            extractionStatusSpan.textContent = 'Running';
            showProgressTracking(extraction);
        } else if (extraction.completed) {
            console.log('Setting status to Completed');
            extractionStatusSpan.textContent = 'Completed';
        } else if (extraction.stopped) {
            console.log('Setting status to Stopped');
            extractionStatusSpan.textContent = 'Stopped';
        } else {
            console.log('Setting status to Ready');
            extractionStatusSpan.textContent = 'Ready';
        }
    }

    /**
     * @description Exports the collected search results to a CSV file.
     */
    async function exportSearchResultsToCSV() {
        try {
            exportSearchResults.disabled = true;
            exportSearchResults.innerHTML = '<div class="loading"></div>Exporting...';

            const stored = await chrome.storage.local.get(['searchResults']);
            const results = stored.searchResults || [];

            if (results.length === 0) {
                showExtractionStatus('No search results to export', 'error');
                return;
            }

            // Generate CSV content
            const csvContent = generateCSV(results);

            // Create data URL for download
            const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;

            // Use Chrome downloads API to save file
            await chrome.downloads.download({
                url: dataUrl,
                filename: `search_results_${new Date().toISOString().split('T')[0]}.csv`,
                conflictAction: 'overwrite',
                saveAs: true
            });

            showExtractionStatus(`Exported ${results.length} search results to Downloads folder`, 'success');

        } catch (error) {
            console.error('Error exporting CSV:', error);
            showExtractionStatus('Error exporting CSV: ' + error.message, 'error');
        } finally {
            exportSearchResults.disabled = false;
            exportSearchResults.innerHTML = '<div class="mode-icon extraction-icon"></div>Export Search Results to CSV';
        }
    }

    /**
     * @description Generates CSV-formatted string from an array of result objects.
     * @param {Array<object>} results - The array of search result objects.
     * @returns {string} The CSV content as a string.
     */
    function generateCSV(results) {
        if (results.length === 0) return '';

        // CSV headers
        const headers = [
            'Title',
            'URL',
            'Snippet',
            'Domain',
            'Position',
            'Search Query',
            'Platform',
            'Platform Name',
            'Topic',
            'Timestamp',
            'Source'
        ];

        // Escape CSV field
        function escapeCSVField(field) {
            if (field === null || field === undefined) return '';
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }

        // Create CSV rows
        const csvRows = [headers.join(',')];

        results.forEach(result => {
            const row = [
                escapeCSVField(result.title),
                escapeCSVField(result.url),
                escapeCSVField(result.snippet),
                escapeCSVField(result.domain),
                escapeCSVField(result.position),
                escapeCSVField(result.searchQuery),
                escapeCSVField(result.platform),
                escapeCSVField(result.platformName),
                escapeCSVField(result.topic),
                escapeCSVField(result.timestamp),
                escapeCSVField(result.source)
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    /**
     * @description Handles the selection of a CSV file for URL extraction.
     * @param {Event} event - The file input change event.
     */
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            const reader = new FileReader();
            reader.onload = function (e) {
                const csvContent = e.target.result;
                const urls = extractUrlsFromCSV(csvContent);
                const breakdown = getSourceBreakdown(urls);

                fileName.textContent = file.name;
                urlCount.textContent = urls.length;
                totalUrls.textContent = urls.length;

                // Show source breakdown
                sourceBreakdown.innerHTML = Object.entries(breakdown)
                    .map(([source, count]) => `<p>${source}: ${count} URLs</p>`)
                    .join('');

                fileInfo.style.display = 'block';

                // Store the URLs for extraction
                window.selectedUrls = urls;
            };
            reader.readAsText(file);
        } else {
            showExtractionStatus('Please select a valid CSV file', 'error');
        }
    }

    /**
     * @description Configures the extraction UI with URLs from previously stored search results.
     * @param {Array<object>} searchResults - The search results from storage.
     */
    function setupExtractionWithStoredResults(searchResults) {
        if (!searchResults || searchResults.length === 0) {
            return;
        }

        // Extract URLs from search results
        const urls = searchResults.map(result => result.url).filter(Boolean);

        if (urls.length > 0) {
            // Store the URLs for extraction
            window.selectedUrls = urls;

            // Update the UI to show that we have URLs ready for extraction
            updateExtractionUIWithStoredResults(urls, searchResults);

            console.log(`Set up extraction with ${urls.length} URLs from stored search results`);
        }
    }

    // Flag to prevent repeated AI Analysis setup
    let aiAnalysisSetupComplete = false;

    /**
     * @description Configures the AI Analysis UI with previously extracted data.
     * @param {Array<object>} extractedData - The array of extracted data items.
     */
    function setupAIAnalysisWithExtractedData(extractedData) {
        if (!extractedData || extractedData.length === 0 || aiAnalysisSetupComplete) {
            return;
        }

        // Set the data source to extracted data
        const extractedRadio = document.querySelector('input[name="dataSource"][value="extracted"]');
        if (extractedRadio) {
            extractedRadio.checked = true;
        }

        // Show success message
        showAIStatus(`Ready to analyze ${extractedData.length} extracted items`, 'success');

        // Mark as complete to prevent repeated setup
        aiAnalysisSetupComplete = true;

        console.log(`Set up AI Analysis with ${extractedData.length} extracted items`);
    }

    /**
     * @description Manually refreshes the extraction status from storage.
     */
    async function refreshExtractionStatus() {
        try {
            const { extractionState } = await chrome.storage.local.get(['extractionState']);
            console.log('Manual refresh - extraction state:', extractionState);

            if (extractionState) {
                updateExtractionStatus(extractionState);

                if (extractionState.completed && extractionState.extractedData && extractionState.extractedData.length > 0) {
                    console.log('Manual refresh - setting up AI Analysis');
                    setupAIAnalysisWithExtractedData(extractionState.extractedData);
                }
            }
        } catch (error) {
            console.error('Error refreshing extraction status:', error);
        }
    }

    /**
     * @description Updates the extraction UI to show details about stored search results.
     * @param {Array<string>} urls - An array of URLs from the stored results.
     * @param {Array<object>} searchResults - The full search result objects.
     */
    function updateExtractionUIWithStoredResults(urls, searchResults) {
        // Update total URLs count
        totalUrls.textContent = urls.length;

        // Show file info with stored results
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const urlCount = document.getElementById('urlCount');
        const sourceBreakdown = document.getElementById('sourceBreakdown');

        fileName.textContent = 'Stored Search Results';
        urlCount.textContent = urls.length;

        // Calculate source breakdown
        const platformCounts = {};
        searchResults.forEach(result => {
            const platform = result.platform || 'unknown';
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });

        const breakdownHtml = Object.entries(platformCounts)
            .map(([platform, count]) => `<span class="platform-tag">${platform}: ${count}</span>`)
            .join(' ');

        sourceBreakdown.innerHTML = breakdownHtml;
        fileInfo.style.display = 'block';

        // Show auto-load message
        const autoLoadMessage = document.getElementById('autoLoadMessage');
        if (autoLoadMessage) {
            autoLoadMessage.style.display = 'block';
        }

        // Show success message
        showExtractionStatus(`Ready to extract from ${urls.length} URLs found in search results`, 'success');
    }

    /**
     * @description Extracts URLs from a CSV file content string.
     * @param {string} csvContent - The content of the CSV file.
     * @returns {Array<string>} An array of extracted URLs.
     */
    function extractUrlsFromCSV(csvContent) {
        const lines = csvContent.split('\n');
        const urls = [];

        for (let i = 1; i < lines.length; i++) { // Skip header
            const columns = lines[i].split(',');
            if (columns.length >= 2) {
                const url = columns[1].replace(/"/g, ''); // Remove quotes
                if (url && (url.includes('reddit.com') || url.includes('stackoverflow.com') ||
                    url.includes('github.com') || url.includes('dev.to') ||
                    url.includes('medium.com'))) {
                    urls.push(url);
                }
            }
        }

        return urls;
    }

    /**
     * @description Gets a count of URLs per platform.
     * @param {Array<string>} urls - An array of URLs.
     * @returns {object} An object with platform names as keys and URL counts as values.
     */
    function getSourceBreakdown(urls) {
        const breakdown = {};
        urls.forEach(url => {
            if (url.includes('reddit.com')) {
                breakdown['Reddit'] = (breakdown['Reddit'] || 0) + 1;
            } else if (url.includes('stackoverflow.com')) {
                breakdown['Stack Overflow'] = (breakdown['Stack Overflow'] || 0) + 1;
            } else if (url.includes('github.com')) {
                breakdown['GitHub'] = (breakdown['GitHub'] || 0) + 1;
            } else if (url.includes('dev.to')) {
                breakdown['Dev.to'] = (breakdown['Dev.to'] || 0) + 1;
            } else if (url.includes('medium.com')) {
                breakdown['Medium'] = (breakdown['Medium'] || 0) + 1;
            }
        });
        return breakdown;
    }

    /**
     * @description Starts the data extraction process by sending a message to the background script.
     */
    async function startExtractionProcess() {
        if (!window.selectedUrls || window.selectedUrls.length === 0) {
            showExtractionStatus('Please select a CSV file with URLs first', 'error');
            return;
        }

        try {
            startExtraction.disabled = true;
            startExtraction.innerHTML = '<div class="loading"></div>Starting...';

            showExtractionStatus('Starting multi-platform data extraction...', 'success');

            // Send message to background script to start data extraction
            const response = await chrome.runtime.sendMessage({
                type: 'START_DATA_EXTRACTION',
                urls: window.selectedUrls,
                closeTabs: document.getElementById('closeTabs').checked,
                extractComments: document.getElementById('extractComments').checked,
                extractMetadata: document.getElementById('extractMetadata').checked
            });

            if (response.success) {
                showExtractionStatus('Data extraction started successfully!', 'success');
                // Show progress tracking
                setTimeout(() => {
                    checkExtractionStatus();
                }, 1000);
            } else {
                throw new Error(response.error || 'Failed to start extraction');
            }

        } catch (error) {
            console.error('Error starting data extraction:', error);
            showExtractionStatus('Error: ' + error.message, 'error');
        } finally {
            startExtraction.disabled = false;
            startExtraction.innerHTML = '<div class="mode-icon extraction-icon"></div>Start Data Extraction';
        }
    }

    /**
     * @description Checks the status of an ongoing extraction from storage.
     */
    async function checkExtractionStatus() {
        try {
            const stored = await chrome.storage.local.get(['dataExtraction']);
            const extraction = stored.dataExtraction || {};

            if (extraction.isRunning) {
                showProgressTracking(extraction);
            } else if (extraction.completed) {
                showExtractionStatus('Data extraction completed!', 'success');
                hideProgressTracking();
            }
        } catch (error) {
            console.error('Error checking extraction status:', error);
        }
    }

    /**
     * @description Shows the progress tracking UI for an ongoing extraction.
     * @param {object} extraction - The extraction state object.
     */
    function showProgressTracking(extraction) {
        extractionProgress.style.display = 'block';
        updateProgress(extraction);
    }

    /**
     * @description Hides the progress tracking UI.
     */
    function hideProgressTracking() {
        extractionProgress.style.display = 'none';
    }

    /**
     * @description Updates the progress bar UI with the current progress.
     * @param {object} extraction - The extraction state object.
     */
    function updateProgress(extraction) {
        const progress = extraction.progress || 0;
        const total = extraction.total || 0;
        const currentTask = extraction.currentUrl ? `Current: ${extraction.currentUrl}` : null;

        updateProgressWithAnimation(
            extractionProgress,
            progressFill,
            progressText,
            progressPercent,
            progress,
            total,
            currentTask
        );
    }

    /**
     * @description Stops the ongoing data extraction process.
     */
    async function stopExtractionProcess() {
        try {
            stopExtraction.disabled = true;
            stopExtraction.innerHTML = '<div class="loading"></div>Stopping...';

            // Send message to background script to stop and save
            const response = await chrome.runtime.sendMessage({
                type: 'STOP_AND_SAVE_EXTRACTION'
            });

            if (response.success) {
                showExtractionStatus(response.message, 'success');
            } else {
                showExtractionStatus('Error: ' + response.error, 'error');
            }

            hideProgressTracking();
        } catch (error) {
            console.error('Error stopping extraction:', error);
            showExtractionStatus('Error stopping extraction: ' + error.message, 'error');
        } finally {
            stopExtraction.disabled = false;
            stopExtraction.innerHTML = 'Stop Extraction';
        }
    }

    /**
     * @description Updates the UI to reflect the status of the AI analysis process.
     * @param {object} analysis - The analysis state object.
     * @param {Array<object>} perPostResults - The array of per-post analysis results.
     * @param {object} aggregateResults - The aggregated analysis results.
     */
    function updateAIStatus(analysis, perPostResults, aggregateResults) {
        // Handle undefined perPostResults
        const resultsCount = perPostResults ? perPostResults.length : 0;
        itemsAnalyzed.textContent = resultsCount;

        if (analysis && analysis.isRunning) {
            analysisStatus.textContent = 'Running';
            showAIAnalysisProgress(analysis);
        } else if (aggregateResults) {
            analysisStatus.textContent = 'Completed';
            showAnalysisResults(aggregateResults);
        } else {
            analysisStatus.textContent = 'Ready';
        }
    }

    /**
     * @description Handles the change event for the data source radio buttons in AI Analysis mode.
     */
    function handleDataSourceChange() {
        const selectedSource = document.querySelector('input[name="dataSource"]:checked').value;

        // Hide all file inputs and info sections
        jsonFileInput.style.display = 'none';
        jsonFileInfo.style.display = 'none';
        reportFileInput.style.display = 'none';
        reportFileInfo.style.display = 'none';
        openReportBtn.style.display = 'none';

        if (selectedSource === 'file') {
            jsonFileInput.style.display = 'block';
        } else if (selectedSource === 'report') {
            reportFileInput.style.display = 'block';
        }
    }

    /**
     * @description Handles the selection of a local JSON file for analysis.
     * @param {Event} event - The file input change event.
     */
    function handleJSONFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    let itemCount = 0;

                    // Handle different JSON structures
                    if (Array.isArray(jsonData)) {
                        itemCount = jsonData.length;
                    } else if (jsonData.data) {
                        itemCount = jsonData.data.length;
                    } else if (jsonData.extractedData) {
                        itemCount = jsonData.extractedData.length;
                    } else if (jsonData.posts) {
                        itemCount = jsonData.posts.length;
                    }

                    jsonFileName.textContent = file.name;
                    jsonItemCount.textContent = itemCount;
                    jsonFileInfo.style.display = 'block';

                    // Store the parsed data for analysis
                    window.selectedJSONData = jsonData;
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    showAIStatus('Error parsing JSON file. Please ensure it\'s a valid JSON file.', 'error');
                }
            };
            reader.readAsText(file);
        } else {
            showAIStatus('Please select a valid JSON file', 'error');
        }
    }

    /**
     * @description Handles the selection of a local report file to view.
     * @param {Event} event - The file input change event.
     */
    function handleReportFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const reportData = JSON.parse(e.target.result);

                    // Validate that this is an AI analysis report
                    if (reportData.aggregated_analysis || reportData.per_post_analysis) {
                        reportFileName.textContent = file.name;
                        reportType.textContent = 'AI Analysis Report';
                        reportFileInfo.style.display = 'block';
                        openReportBtn.style.display = 'block';

                        // Store the report data for opening
                        window.selectedReportData = reportData;
                    } else {
                        showAIStatus('Invalid report file. Please select a valid AI analysis report.', 'error');
                    }
                } catch (error) {
                    console.error('Error parsing report file:', error);
                    showAIStatus('Error parsing report file. Please ensure it\'s a valid JSON file.', 'error');
                }
            };
            reader.readAsText(file);
        } else {
            showAIStatus('Please select a valid JSON report file', 'error');
        }
    }

    /**
     * @description Opens a selected local report file in the full analysis view.
     */
    async function openReportInAnalysisTab() {
        if (!window.selectedReportData) {
            showAIStatus('Please select a report file first', 'error');
            return;
        }

        try {
            // Store the report data in browser storage temporarily
            await chrome.storage.local.set({
                'temp_report_data': window.selectedReportData,
                'report_source': 'file_upload'
            });

            // Open AI analysis tab
            chrome.tabs.create({
                url: chrome.runtime.getURL('ai_analysis.html')
            });

            showAIStatus('Opening report in analysis tab...', 'success');
        } catch (error) {
            console.error('Error opening report:', error);
            showAIStatus('Error opening report: ' + error.message, 'error');
        }
    }

    /**
     * @description Starts the AI analysis process by sending data to the background script.
     */
    async function startAIAnalysisProcess() {
        try {
            // Reset the AI Analysis setup flag for new analysis
            aiAnalysisSetupComplete = false;

            // Check if API key is set
            const { OPENAI_API_KEY } = await chrome.storage.local.get(['OPENAI_API_KEY']);
            if (!OPENAI_API_KEY) {
                showAIStatus('Please set your OpenAI API key in the extension options first', 'error');
                return;
            }

            // Get data based on selected source
            const selectedSource = document.querySelector('input[name="dataSource"]:checked').value;
            let itemsToAnalyze = [];

            if (selectedSource === 'extracted') {
                // Get extracted data from new storage system
                const { extractionState } = await chrome.storage.local.get(['extractionState']);
                if (!extractionState?.extractedData || extractionState.extractedData.length === 0) {
                    showAIStatus('No extracted data found. Please extract data first or select a JSON file.', 'error');
                    return;
                }
                itemsToAnalyze = extractionState.extractedData;
            } else if (selectedSource === 'file') {
                // Use uploaded JSON file
                if (!window.selectedJSONData) {
                    showAIStatus('Please select a JSON file first', 'error');
                    return;
                }

                // Extract items from different JSON structures
                if (Array.isArray(window.selectedJSONData)) {
                    itemsToAnalyze = window.selectedJSONData;
                } else if (window.selectedJSONData.data) {
                    itemsToAnalyze = window.selectedJSONData.data;
                } else if (window.selectedJSONData.extractedData) {
                    itemsToAnalyze = window.selectedJSONData.extractedData;
                } else if (window.selectedJSONData.posts) {
                    itemsToAnalyze = window.selectedJSONData.posts;
                } else {
                    showAIStatus('Invalid JSON structure. Expected array of items or object with data/extractedData/posts property.', 'error');
                    return;
                }
            }

            if (itemsToAnalyze.length === 0) {
                showAIStatus('No items found in the selected data source', 'error');
                return;
            }

            startAIAnalysis.disabled = true;
            startAIAnalysis.innerHTML = '<div class="loading"></div>Starting Analysis...';
            showAIStatus(`Starting AI analysis of ${itemsToAnalyze.length} items...`, 'success');

            // Send message to background script to start AI analysis
            const response = await chrome.runtime.sendMessage({
                type: 'ANALYZE',
                posts: itemsToAnalyze
            });

            if (response.ok) {
                showAIStatus('AI analysis completed successfully!', 'success');
                updateAIStatus({ isRunning: false }, response.perPost || [], response.aggregate || null);
                viewResults.style.display = 'block';
                openReportUI.style.display = 'block';
                exportAnalysis.style.display = 'block';
            } else {
                throw new Error(response.error || 'Analysis failed');
            }

        } catch (error) {
            console.error('Error starting AI analysis:', error);
            showAIStatus('Error: ' + error.message, 'error');
        } finally {
            startAIAnalysis.disabled = false;
            startAIAnalysis.innerHTML = '<div class="mode-icon ai-icon"></div>Start AI Analysis';
        }
    }

    /**
     * @description Shows the progress UI for an ongoing AI analysis.
     * @param {object} analysis - The analysis state object.
     */
    function showAIAnalysisProgress(analysis) {
        aiProgress.style.display = 'block';
        updateAIAnalysisProgress(analysis);
    }

    /**
     * @description Updates the AI analysis progress bar UI.
     * @param {object} analysis - The analysis state object.
     */
    function updateAIAnalysisProgress(analysis) {
        const progress = analysis.progress || 0;
        const total = analysis.total || 0;
        const currentTask = analysis.currentTask ? `Current: ${analysis.currentTask}` : null;

        updateProgressWithAnimation(
            aiProgress,
            aiProgressFill,
            aiProgressText,
            aiProgressPercent,
            progress,
            total,
            currentTask
        );
    }

    /**
     * @description Displays a summary of the analysis results in the side panel.
     * @param {object} aggregateResults - The aggregated analysis data.
     */
    function showAnalysisResults(aggregateResults) {
        analysisResults.style.display = 'block';

        // Populate top tools
        const topTools = (aggregateResults.top_requested_tools || []).slice(0, 5);
        topToolsList.innerHTML = topTools.map(tool => `<li>${tool}</li>`).join('');

        // Populate MVP recommendations
        const mvpRecs = (aggregateResults.mvp_recommendations || []).slice(0, 5);
        mvpList.innerHTML = mvpRecs.map(rec => `<li>${rec}</li>`).join('');

        // Populate common issues
        const issues = (aggregateResults.common_issues || []).slice(0, 5);
        issuesList.innerHTML = issues.map(issue => `<li>${issue}</li>`).join('');

        // Populate praised features
        const pros = (aggregateResults.common_pros || []).slice(0, 5);
        prosList.innerHTML = pros.map(pro => `<li>${pro}</li>`).join('');

        // Populate action plan
        actionPlanText.textContent = aggregateResults.short_action_plan || 'No action plan generated';
    }

    /**
     * @description Opens the detailed analysis results in a new tab.
     */
    function viewAnalysisResults() {
        try {
            // Open AI analysis in a new tab
            chrome.tabs.create({
                url: chrome.runtime.getURL('ai_analysis.html')
            });
            showAIStatus('Opening detailed results in new tab...', 'success');
        } catch (error) {
            console.error('Error opening analysis tab:', error);
            showAIStatus('Error opening analysis tab: ' + error.message, 'error');
        }
    }

    /**
     * @description Opens the interactive report UI in a new tab.
     */
    function openReportUIPage() {
        try {
            // Open report UI in a new tab
            chrome.tabs.create({
                url: chrome.runtime.getURL('report_ui.html')
            });
            showAIStatus('Opening report selection interface...', 'success');
        } catch (error) {
            console.error('Error opening report UI:', error);
            showAIStatus('Error opening report UI: ' + error.message, 'error');
        }
    }

    /**
     * @description Exports the analysis results to a file.
     */
    async function exportAnalysisResults() {
        try {
            const { per_post_analysis, aggregated_analysis } = await chrome.storage.local.get(['per_post_analysis', 'aggregated_analysis']);

            if (!aggregated_analysis) {
                showAIStatus('No analysis results to export', 'error');
                return;
            }

            // Create export options dialog
            const exportFormat = await showExportFormatDialog();
            if (!exportFormat) return;

            const exportData = {
                timestamp: new Date().toISOString(),
                per_post_analysis: per_post_analysis || [],
                aggregated_analysis: aggregated_analysis
            };

            if (exportFormat === 'json') {
                const jsonData = JSON.stringify(exportData, null, 2);
                const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`;

                await chrome.downloads.download({
                    url: dataUrl,
                    filename: `ai_analysis_${new Date().toISOString().split('T')[0]}.json`,
                    conflictAction: 'overwrite',
                    saveAs: true
                });
            } else if (exportFormat === 'markdown') {
                const markdownData = generateMarkdownReport(exportData);
                const dataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdownData)}`;

                await chrome.downloads.download({
                    url: dataUrl,
                    filename: `ai_analysis_report_${new Date().toISOString().split('T')[0]}.md`,
                    conflictAction: 'overwrite',
                    saveAs: true
                });
            }

            showAIStatus(`Analysis results exported as ${exportFormat.toUpperCase()} successfully!`, 'success');

        } catch (error) {
            console.error('Error exporting analysis:', error);
            showAIStatus('Error exporting analysis: ' + error.message, 'error');
        }
    }

    /**
     * @description Shows a dialog to the user to select an export format.
     * @returns {Promise<string|null>} A promise that resolves to the selected format ('json' or 'markdown') or null if canceled.
     */
    function showExportFormatDialog() {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;

            dialog.innerHTML = `
                <div style="background: white; padding: 24px; border-radius: 12px; max-width: 400px; width: 90%;">
                    <h3 style="margin: 0 0 16px 0; color: #333;">Export Format</h3>
                    <p style="margin: 0 0 20px 0; color: #666;">Choose the format for your analysis export:</p>
                    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                        <button id="exportJson" style="flex: 1; padding: 12px; border: 2px solid #4285F4; background: white; color: #4285F4; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            JSON
                        </button>
                        <button id="exportMarkdown" style="flex: 1; padding: 12px; border: 2px solid #4285F4; background: white; color: #4285F4; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Markdown
                        </button>
                    </div>
                    <button id="cancelExport" style="width: 100%; padding: 12px; border: 1px solid #ccc; background: #f5f5f5; color: #333; border-radius: 8px; cursor: pointer;">
                        Cancel
                    </button>
                </div>
            `;

            document.body.appendChild(dialog);

            dialog.querySelector('#exportJson').addEventListener('click', () => {
                document.body.removeChild(dialog);
                resolve('json');
            });

            dialog.querySelector('#exportMarkdown').addEventListener('click', () => {
                document.body.removeChild(dialog);
                resolve('markdown');
            });

            dialog.querySelector('#cancelExport').addEventListener('click', () => {
                document.body.removeChild(dialog);
                resolve(null);
            });
        });
    }

    /**
     * @description Generates a Markdown-formatted report from the analysis data.
     * @param {object} data - The full analysis data object.
     * @returns {string} The generated Markdown string.
     */
    function generateMarkdownReport(data) {
        const { aggregated_analysis, timestamp } = data;
        const date = new Date(timestamp).toLocaleDateString();

        let markdown = `# AI Demand Intelligence Analysis Report\n\n`;
        markdown += `**Generated:** ${date}\n\n`;
        markdown += `---\n\n`;

        // Executive Summary
        markdown += `## 📊 Executive Summary\n\n`;
        if (aggregated_analysis.short_action_plan) {
            markdown += `${aggregated_analysis.short_action_plan}\n\n`;
        }

        // Top Requested Tools
        if (aggregated_analysis.top_requested_tools && aggregated_analysis.top_requested_tools.length > 0) {
            markdown += `## 🎯 Top Requested Tools\n\n`;
            aggregated_analysis.top_requested_tools.forEach((tool, index) => {
                markdown += `${index + 1}. ${tool}\n`;
            });
            markdown += `\n`;
        }

        // MVP Recommendations
        if (aggregated_analysis.mvp_recommendations && aggregated_analysis.mvp_recommendations.length > 0) {
            markdown += `## 💡 MVP Recommendations\n\n`;
            aggregated_analysis.mvp_recommendations.forEach((rec, index) => {
                markdown += `${index + 1}. ${rec}\n`;
            });
            markdown += `\n`;
        }

        // Common Issues
        if (aggregated_analysis.common_issues && aggregated_analysis.common_issues.length > 0) {
            markdown += `## ⚠️ Common Issues\n\n`;
            aggregated_analysis.common_issues.forEach((issue, index) => {
                markdown += `${index + 1}. ${issue}\n`;
            });
            markdown += `\n`;
        }

        // Praised Features
        if (aggregated_analysis.common_pros && aggregated_analysis.common_pros.length > 0) {
            markdown += `## ✅ Praised Features\n\n`;
            aggregated_analysis.common_pros.forEach((pro, index) => {
                markdown += `${index + 1}. ${pro}\n`;
            });
            markdown += `\n`;
        }

        // Action Plan
        if (aggregated_analysis.short_action_plan) {
            markdown += `## 📋 Action Plan\n\n`;
            markdown += `${aggregated_analysis.short_action_plan}\n\n`;
        }

        markdown += `---\n\n`;
        markdown += `*Report generated by AI Demand Intelligence Miner v2.0*\n`;

        return markdown;
    }

    /**
     * @description Shows the progress UI for an ongoing Google search.
     * @param {number} totalQueries - The total number of queries to be executed.
     */
    function showGoogleSearchProgress(totalQueries) {
        googleSearchProgress.style.display = 'block';
        googleProgressFill.style.width = '0%';
        googleProgressText.textContent = `0 / ${totalQueries}`;
        googleProgressPercent.textContent = '0%';
        googleCurrentQuery.textContent = 'Starting Google searches...';
    }

    /**
     * @description Updates the Google search progress bar UI.
     * @param {number} current - The number of queries completed.
     * @param {number} total - The total number of queries.
     * @param {string} currentQuery - The text of the query currently being executed.
     */
    function updateGoogleSearchProgress(current, total, currentQuery) {
        const currentTask = currentQuery ? `Current: ${currentQuery}` : 'Processing...';

        updateProgressWithAnimation(
            googleSearchProgress,
            googleProgressFill,
            googleProgressText,
            googleProgressPercent,
            current,
            total,
            currentTask
        );
    }

    /**
     * @description Hides the Google search progress UI.
     */
    function hideGoogleSearchProgress() {
        googleSearchProgress.style.display = 'none';
    }

    /**
     * @description Displays a status message in the Sources mode status element.
     * @param {string} message - The message to display.
     * @param {string} type - The type of message ('success', 'error', 'info').
     * @param {number} [duration=3000] - How long to display the message.
     */
    function showSourcesStatus(message, type, duration = 3000) {
        showStatus(sourcesStatus, message, type, duration);
    }

    /**
     * @description Displays a status message in the Extraction mode status element.
     * @param {string} message - The message to display.
     * @param {string} type - The type of message ('success', 'error', 'info').
     * @param {number} [duration=5000] - How long to display the message.
     */
    function showExtractionStatus(message, type, duration = 5000) {
        showStatus(extractionStatus, message, type, duration);
    }

    /**
     * @description Displays a status message in the AI Analysis mode status element.
     * @param {string} message - The message to display.
     * @param {string} type - The type of message ('success', 'error', 'info').
     * @param {number} [duration=5000] - How long to display the message.
     */
    function showAIStatus(message, type, duration = 5000) {
        showStatus(aiStatus, message, type, duration);
    }

    /**
     * @description Displays a status message to the user.
     * @param {HTMLElement} statusElement - The element to display the status in.
     * @param {string} message - The message text.
     * @param {string} type - The type of message ('success', 'error', 'info').
     * @param {number} duration - How long to display the message.
     */
    function showStatus(statusElement, message, type, duration) {
        // Clear any existing timeout
        if (statusElement.timeoutId) {
            clearTimeout(statusElement.timeoutId);
        }

        // Update content and styling
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;

        // Add enhanced animation
        statusElement.style.display = 'block';
        statusElement.style.opacity = '0';
        statusElement.style.transform = 'translateY(-10px)';

        // Animate in
        requestAnimationFrame(() => {
            statusElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            statusElement.style.opacity = '1';
            statusElement.style.transform = 'translateY(0)';
        });

        // Auto-hide with animation
        statusElement.timeoutId = setTimeout(() => {
            statusElement.style.opacity = '0';
            statusElement.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                statusElement.style.display = 'none';
                statusElement.timeoutId = null;
            }, 300);
        }, duration);
    }

    /**
     * @description Updates a progress bar UI with animation.
     * @param {HTMLElement} progressElement - The container for the progress bar.
     * @param {HTMLElement} progressFill - The progress bar fill element.
     * @param {HTMLElement} progressText - The element for text like "X / Y".
     * @param {HTMLElement} progressPercent - The element for the percentage text.
     * @param {number} current - The current progress value.
     * @param {number} total - The total value.
     * @param {string} [currentTask=null] - The text describing the current task.
     */
    function updateProgressWithAnimation(progressElement, progressFill, progressText, progressPercent, current, total, currentTask = null) {
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;

        // Animate progress bar
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${current} / ${total}`;
        progressPercent.textContent = `${percent}%`;

        // Update current task with animation
        if (currentTask && progressElement.querySelector('.current-task')) {
            const taskElement = progressElement.querySelector('.current-task');
            taskElement.style.opacity = '0';
            setTimeout(() => {
                taskElement.textContent = currentTask;
                taskElement.style.opacity = '1';
            }, 150);
        }

        // Add pulse effect for active progress
        if (current < total) {
            progressFill.classList.add('pulse');
        } else {
            progressFill.classList.remove('pulse');
        }
    }

    /**
     * @description Shows a notification about failed URL extractions.
     * @param {number} count - The number of failed URLs.
     */
    function showFailedUrlsNotification(count) {
        const notification = document.createElement('div');
        notification.className = 'failed-urls-notification';
        notification.innerHTML = `
            <div style="background: rgba(244, 67, 54, 0.15); border: 1px solid rgba(244, 67, 54, 0.4);
                        padding: 12px; border-radius: 8px; margin: 12px 0; font-size: 13px;">
                <strong>⚠️ ${count} URLs failed to extract</strong>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="float: right; background: none; border: none; color: #f44336; cursor: pointer;">×</button>
                <div style="margin-top: 8px;">
                    <button onclick="downloadFailedUrlsReport()"
                            style="background: #f44336; color: white; border: none; padding: 4px 8px;
                                   border-radius: 4px; cursor: pointer; font-size: 12px;">
                        Download Report
                    </button>
                </div>
            </div>
        `;

        // Insert after the extraction status
        const extractionStatus = document.getElementById('extractionStatus');
        extractionStatus.parentNode.insertBefore(notification, extractionStatus.nextSibling);
    }

    /**
     * @description Initiates the download of the failed URLs report.
     */
    async function downloadFailedUrlsReport() {
        try {
            await chrome.runtime.sendMessage({ type: 'SAVE_FAILED_URLS_REPORT' });
            showExtractionStatus('Failed URLs report downloaded!', 'success');
        } catch (error) {
            console.error('Error downloading failed URLs report:', error);
            showExtractionStatus('Error downloading report: ' + error.message, 'error');
        }
    }

    /**
     * @description Listens for storage changes to update the UI in real-time.
     */
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.selectedSources) {
                updateSourcesStats(changes.selectedSources.newValue);
            }

            if (changes.searchResults) {
                const results = changes.searchResults.newValue || [];
                showSourcesStatus(`Google searches completed! Found ${results.length} total results.`, 'success');

                // Show export button if we have results
                if (results.length > 0) {
                    exportSearchResults.style.display = 'block';

                    // Automatically set up extraction mode with new search results
                    setupExtractionWithStoredResults(results);
                }

                // Hide Google search progress when completed
                hideGoogleSearchProgress();
            }

            if (changes.googleSearchProgress) {
                const progress = changes.googleSearchProgress.newValue;
                if (progress) {
                    updateGoogleSearchProgress(progress.current, progress.total, progress.currentQuery);
                }
            }

            if (changes.extractionState) {
                const extraction = changes.extractionState.newValue;
                console.log('Extraction state changed:', extraction);
                updateExtractionStatus(extraction);

                if (extraction.isRunning) {
                    console.log('Extraction is running, updating progress');
                    updateProgress(extraction);
                } else if (extraction.completed) {
                    console.log('Extraction completed, updating UI');
                    showExtractionStatus('Data extraction completed!', 'success');
                    hideProgressTracking();

                    // Automatically set up AI Analysis mode with extracted data
                    if (extraction.extractedData && extraction.extractedData.length > 0) {
                        console.log('Setting up AI Analysis with', extraction.extractedData.length, 'items');
                        setupAIAnalysisWithExtractedData(extraction.extractedData);
                    }
                } else if (extraction.stopped) {
                    console.log('Extraction stopped');
                    hideProgressTracking();
                }
            }

            if (changes.analysisState) {
                const analysis = changes.analysisState.newValue;
                updateAIStatus(analysis, analysis.perPostResults || [], analysis.aggregateResults || null);

                if (analysis.isRunning) {
                    updateAIAnalysisProgress(analysis);
                }
            }

            if (changes.per_post_analysis || changes.aggregated_analysis) {
                const perPost = changes.per_post_analysis ? changes.per_post_analysis.newValue : [];
                const aggregate = changes.aggregated_analysis ? changes.aggregated_analysis.newValue : null;
                updateAIStatus({ isRunning: false }, perPost || [], aggregate || null);
            }

            if (changes.failedUrls) {
                const failedUrls = changes.failedUrls.newValue || [];
                if (failedUrls.length > 0) {
                    showFailedUrlsNotification(failedUrls.length);
                }
            }
        }
    });

    /**
     * @description Sets up tooltips for elements with the `data-tooltip` attribute.
     */
    function setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
        });
    }

    /**
     * @description Shows a tooltip for a given element.
     * @param {MouseEvent} e - The mouseenter event.
     */
    function showTooltip(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.textContent = e.target.getAttribute('data-tooltip');
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        document.body.appendChild(tooltip);

        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
        });

        e.target.tooltipElement = tooltip;
    }

    /**
     * @description Hides the tooltip for a given element.
     * @param {MouseEvent} e - The mouseleave event.
     */
    function hideTooltip(e) {
        if (e.target.tooltipElement) {
            e.target.tooltipElement.style.opacity = '0';
            setTimeout(() => {
                if (e.target.tooltipElement && e.target.tooltipElement.parentNode) {
                    e.target.tooltipElement.parentNode.removeChild(e.target.tooltipElement);
                }
                e.target.tooltipElement = null;
            }, 200);
        }
    }

    /**
     * @description Sets up keyboard shortcuts for the side panel.
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'Escape':
                    // Close any open modals or clear status messages
                    document.querySelectorAll('.status').forEach(status => {
                        if (status.style.display === 'block') {
                            status.style.display = 'none';
                        }
                    });
                    break;
                case 'r':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Refresh current mode data
                        location.reload();
                    }
                    break;
            }
        });
    }

    /**
     * @description A generic error handler for the side panel.
     * @param {Error} error - The error object.
     * @param {string} [context=''] - The context in which the error occurred.
     */
    function handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);

        let userMessage = 'An unexpected error occurred. Please try again.';

        if (error.message.includes('Extension context invalidated')) {
            userMessage = 'Extension needs to be reloaded. Please refresh the page and try again.';
        } else if (error.message.includes('API key')) {
            userMessage = 'Please check your OpenAI API key in the extension options.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            userMessage = 'Network error. Please check your internet connection and try again.';
        }

        // Show error in current active mode
        const activeMode = document.querySelector('.content-area.active');
        if (activeMode.id === 'sourcesMode') {
            showSourcesStatus(userMessage, 'error', 8000);
        } else if (activeMode.id === 'extractionMode') {
            showExtractionStatus(userMessage, 'error', 8000);
        } else if (activeMode.id === 'aiMode') {
            showAIStatus(userMessage, 'error', 8000);
        }
    }

    /**
     * @description Sets up event listeners for the analysis options controls.
     */
    function setupWeightControls() {
        const analysisDepthSelect = document.getElementById('analysisDepth');
        const focusAreaSelect = document.getElementById('focusArea');
        const resetWeightsBtn = document.getElementById('resetWeights');

        // Load saved settings
        loadAnalysisSettings();

        // Add event listeners for option changes
        if (analysisDepthSelect) {
            analysisDepthSelect.addEventListener('change', () => {
                saveAnalysisSettings();
            });
        }

        if (focusAreaSelect) {
            focusAreaSelect.addEventListener('change', () => {
                saveAnalysisSettings();
            });
        }

        // Reset button
        if (resetWeightsBtn) {
            resetWeightsBtn.addEventListener('click', () => {
                resetAnalysisSettings();
            });
        }
    }

    /**
     * @description Loads analysis settings from storage and updates the UI controls.
     */
    async function loadAnalysisSettings() {
        try {
            const { analysisSettings } = await chrome.storage.local.get(['analysisSettings']);
            if (analysisSettings) {
                const analysisDepthSelect = document.getElementById('analysisDepth');
                const focusAreaSelect = document.getElementById('focusArea');

                if (analysisDepthSelect && analysisSettings.depth) {
                    analysisDepthSelect.value = analysisSettings.depth;
                }
                if (focusAreaSelect && analysisSettings.focus) {
                    focusAreaSelect.value = analysisSettings.focus;
                }
            }
        } catch (error) {
            console.error('Error loading analysis settings:', error);
        }
    }

    /**
     * @description Saves the current analysis settings to storage.
     */
    async function saveAnalysisSettings() {
        try {
            const settings = {
                depth: document.getElementById('analysisDepth')?.value || 'standard',
                focus: document.getElementById('focusArea')?.value || 'all'
            };

            await chrome.storage.local.set({ analysisSettings: settings });
        } catch (error) {
            console.error('Error saving analysis settings:', error);
        }
    }

    /**
     * @description Resets the analysis settings to their default values.
     */
    async function resetAnalysisSettings() {
        try {
            const analysisDepthSelect = document.getElementById('analysisDepth');
            const focusAreaSelect = document.getElementById('focusArea');

            if (analysisDepthSelect) {
                analysisDepthSelect.value = 'standard';
            }
            if (focusAreaSelect) {
                focusAreaSelect.value = 'all';
            }

            const defaultSettings = {
                depth: 'standard',
                focus: 'all'
            };

            await chrome.storage.local.set({ analysisSettings: defaultSettings });
            showAIStatus('Analysis settings reset to defaults', 'success', 3000);
        } catch (error) {
            console.error('Error resetting analysis settings:', error);
        }
    }

    /**
     * @description Continues the AI analysis process from the last saved analysis run.
     */
    async function continueFromLastAnalysisProcess() {
        try {
            const { lastAnalysisRun, aggregated_analysis } = await chrome.storage.local.get(['lastAnalysisRun', 'aggregated_analysis']);

            if (!aggregated_analysis) {
                showAIStatus('No previous analysis found to continue from', 'error');
                return;
            }

            showAIStatus('Continuing from last analysis...', 'success');
            updateAIStatus({ isRunning: false }, [], aggregated_analysis || null);

            // Show relevant buttons
            document.getElementById('regeneratePitches').style.display = 'block';
            document.getElementById('regeneratePlan').style.display = 'block';
            document.getElementById('viewResults').style.display = 'block';
            document.getElementById('openReportUI').style.display = 'block';
            document.getElementById('exportAnalysis').style.display = 'block';

        } catch (error) {
            console.error('Error continuing from last analysis:', error);
            showAIStatus('Error continuing from last analysis: ' + error.message, 'error');
        }
    }

    /**
     * @description Regenerates solution pitches based on the last analysis results.
     */
    async function regeneratePitchesProcess() {
        try {
            const { aggregated_analysis } = await chrome.storage.local.get(['aggregated_analysis']);

            if (!aggregated_analysis || !aggregated_analysis.top_requested_tools) {
                showAIStatus('No analysis data found to regenerate pitches from', 'error');
                return;
            }

            const regenerateBtn = document.getElementById('regeneratePitches');
            regenerateBtn.disabled = true;
            regenerateBtn.innerHTML = '<div class="loading"></div>Regenerating...';

            // Select top items for pitch generation
            const selectedItems = aggregated_analysis.top_requested_tools.slice(0, 5).map(tool => ({
                text: tool,
                type: 'idea',
                evidence: [{ quote: 'From previous analysis', url: 'internal' }]
            }));

            const response = await chrome.runtime.sendMessage({
                type: 'GENERATE_PITCHES',
                selectedItems: selectedItems
            });

            if (response.success) {
                showAIStatus('Pitches regenerated successfully!', 'success');
                // Store new pitches
                await chrome.storage.local.set({
                    lastGeneratedPitches: response.pitches,
                    lastPitchGeneration: new Date().toISOString()
                });
            } else {
                throw new Error(response.error || 'Failed to regenerate pitches');
            }

        } catch (error) {
            console.error('Error regenerating pitches:', error);
            showAIStatus('Error regenerating pitches: ' + error.message, 'error');
        } finally {
            const regenerateBtn = document.getElementById('regeneratePitches');
            regenerateBtn.disabled = false;
            regenerateBtn.innerHTML = '🔄 Regenerate Pitches';
        }
    }

    /**
     * @description Regenerates the final MVP plan based on the last generated pitches.
     */
    async function regeneratePlanProcess() {
        try {
            const { lastGeneratedPitches, aggregated_analysis } = await chrome.storage.local.get(['lastGeneratedPitches', 'aggregated_analysis']);

            if (!lastGeneratedPitches || lastGeneratedPitches.length === 0) {
                showAIStatus('No pitches found. Please generate pitches first.', 'error');
                return;
            }

            const regenerateBtn = document.getElementById('regeneratePlan');
            regenerateBtn.disabled = true;
            regenerateBtn.innerHTML = '<div class="loading"></div>Regenerating...';

            // Use the first pitch as default
            const chosenPitch = lastGeneratedPitches[0];
            const selectedItems = aggregated_analysis?.top_requested_tools?.slice(0, 5).map(tool => ({
                text: tool,
                type: 'idea',
                evidence: [{ quote: 'From previous analysis', url: 'internal' }]
            })) || [];

            const response = await chrome.runtime.sendMessage({
                type: 'GENERATE_FINAL_PLAN',
                chosenPitch: chosenPitch,
                selectedItems: selectedItems
            });

            if (response.success) {
                showAIStatus('Final plan regenerated successfully!', 'success');
                // Store new plan
                await chrome.storage.local.set({
                    lastGeneratedPlan: response.finalPlan,
                    lastPlanGeneration: new Date().toISOString()
                });
            } else {
                throw new Error(response.error || 'Failed to regenerate final plan');
            }

        } catch (error) {
            console.error('Error regenerating final plan:', error);
            showAIStatus('Error regenerating final plan: ' + error.message, 'error');
        } finally {
            const regenerateBtn = document.getElementById('regeneratePlan');
            regenerateBtn.disabled = false;
            regenerateBtn.innerHTML = '🔄 Regenerate Final Plan';
        }
    }

    /**
     * @description Sets up the dismissible security warning.
     */
    function setupSecurityWarning() {
        const securityWarning = document.getElementById('securityWarning');
        const dismissBtn = document.getElementById('dismissSecurityWarning');

        // Check if user has already dismissed the warning
        chrome.storage.local.get(['securityWarningDismissed'], (result) => {
            if (!result.securityWarningDismissed) {
                securityWarning.style.display = 'block';
            }
        });

        // Dismiss button functionality
        dismissBtn.addEventListener('click', () => {
            securityWarning.style.display = 'none';
            chrome.storage.local.set({ securityWarningDismissed: true });
        });
    }

    /**
     * @description Logs the duration of an operation to the console for performance monitoring.
     * @param {string} operation - The name of the operation.
     * @param {number} startTime - The start time of the operation, from `performance.now()`.
     */
    function logPerformance(operation, startTime) {
        const duration = performance.now() - startTime;
        console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
    }
});