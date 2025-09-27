// Enhanced sidepanel script with modern interactions and improved UX
document.addEventListener('DOMContentLoaded', function () {
    // Enhanced mode switching elements
    const modeSwitcher = document.querySelector('.mode-switcher');
    const modeOptions = document.querySelectorAll('.mode-option');
    const sourcesMode = document.getElementById('sourcesMode');
    const extractionMode = document.getElementById('extractionMode');
    const aiMode = document.getElementById('aiMode');
    const automationMode = document.getElementById('automationMode');

    // Automation elements
    const startFullAutomationBtn = document.getElementById('startFullAutomation');
    const automationProgress = document.getElementById('automationProgress');
    const automationResults = document.getElementById('automationResults');

    // Add keyboard navigation support
    let currentModeIndex = 0;
    const modes = ['sources', 'extraction', 'ai', 'automation'];

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

    // Enhanced mode switching functionality
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
            automationMode.classList.toggle('active', mode === 'automation');

            // Update body theme with smooth transition
            document.body.style.transition = 'background 0.3s ease';
            if (mode === 'sources') {
                document.body.className = 'sources-theme';
            } else if (mode === 'extraction') {
                document.body.className = 'extraction-theme';
            } else if (mode === 'ai') {
                document.body.className = 'ai-theme';
            } else if (mode === 'automation') {
                document.body.className = 'automation-theme';
            }

            // Animate in the new content
            const newActiveContent = document.querySelector('.content-area.active');
            if (newActiveContent) {
                newActiveContent.style.opacity = '1';
                newActiveContent.style.transform = 'translateY(0)';
            }
        }, 150);
    }

    // Sources mode setup
    function setupSourcesMode() {
        // Setup source checkboxes
        Object.values(sourceCheckboxes).forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedSourcesCount);
        });

        generateDorks.addEventListener('click', generateSearchQueries);
    }

    // Extraction mode setup
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

    // AI mode setup
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

    // Initialize sidepanel data
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

    // Update selected sources count
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

    // Update sources stats
    function updateSourcesStats(sources) {
        // Update checkboxes based on stored preferences
        Object.entries(sourceCheckboxes).forEach(([source, checkbox]) => {
            checkbox.checked = sources.includes(source);
        });
        selectedSourcesCount.textContent = sources.length;
    }

    // Generate search queries for selected sources
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

    // Update extraction status display
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

    // Export search results to CSV
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

    // Generate CSV content from results
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

    // Handle file selection (Extraction mode)
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

    // Set up extraction mode with stored search results
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

    // Set up AI Analysis mode with extracted data
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

    // Manual refresh function to check extraction status
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

    // Update extraction UI to show stored results
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

    // Extract URLs from CSV content
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

    // Get source breakdown from URLs
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

    // Start extraction process
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

    // Check extraction status
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

    // Show progress tracking
    function showProgressTracking(extraction) {
        extractionProgress.style.display = 'block';
        updateProgress(extraction);
    }

    // Hide progress tracking
    function hideProgressTracking() {
        extractionProgress.style.display = 'none';
    }

    // Enhanced progress display with animations
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

    // Stop extraction
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

    // Update AI status display
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

    // Handle data source change
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

    // Handle JSON file selection
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

    // Handle report file selection
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

    // Open report in analysis tab
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

    // Start AI analysis process
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

    // Show AI analysis progress
    function showAIAnalysisProgress(analysis) {
        aiProgress.style.display = 'block';
        updateAIAnalysisProgress(analysis);
    }

    // Enhanced AI analysis progress display
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

    // Show enhanced analysis results
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

    // View analysis results
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

    // Open report UI page
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

    // Export analysis results
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

    // Show export format dialog
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

    // Generate Markdown report
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

    // Show Google search progress
    function showGoogleSearchProgress(totalQueries) {
        googleSearchProgress.style.display = 'block';
        googleProgressFill.style.width = '0%';
        googleProgressText.textContent = `0 / ${totalQueries}`;
        googleProgressPercent.textContent = '0%';
        googleCurrentQuery.textContent = 'Starting Google searches...';
    }

    // Enhanced Google search progress tracking
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

    // Hide Google search progress
    function hideGoogleSearchProgress() {
        googleSearchProgress.style.display = 'none';
    }

    // Enhanced status display functions with animations
    function showSourcesStatus(message, type, duration = 3000) {
        showStatus(sourcesStatus, message, type, duration);
    }

    function showExtractionStatus(message, type, duration = 5000) {
        showStatus(extractionStatus, message, type, duration);
    }

    function showAIStatus(message, type, duration = 5000) {
        showStatus(aiStatus, message, type, duration);
    }

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

    // Enhanced progress tracking with real-time updates
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

    // Show failed URLs notification
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

    // Download failed URLs report
    async function downloadFailedUrlsReport() {
        try {
            await chrome.runtime.sendMessage({ type: 'SAVE_FAILED_URLS_REPORT' });
            showExtractionStatus('Failed URLs report downloaded!', 'success');
        } catch (error) {
            console.error('Error downloading failed URLs report:', error);
            showExtractionStatus('Error downloading report: ' + error.message, 'error');
        }
    }

    // Listen for storage changes to update stats in real-time
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

    // Enhanced tooltip functionality
    function setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
        });
    }

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

    // Enhanced keyboard shortcuts
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

    // Enhanced error handling with user-friendly messages
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

    // Setup analysis options controls
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

    // Load analysis settings from storage
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

    // Save analysis settings to storage
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

    // Reset analysis settings to defaults
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

    // Continue from last analysis
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

    // Regenerate pitches
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

    // Regenerate final plan
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

    // Setup security warning
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

    // Add performance monitoring
    function logPerformance(operation, startTime) {
        const duration = performance.now() - startTime;
        console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
    }

    // Full Automation Mode
    let automationState = {
        isRunning: false,
        startTime: null,
        currentStep: 0,
        results: {
            searchResults: 0,
            extractedItems: 0,
            analysisItems: 0
        }
    };

    // Automation step management
    function updateAutomationStep(step, status, details = '') {
        const stepElement = document.getElementById(`step${step}`);
        const statusElement = stepElement.querySelector('.step-status');

        // Update step classes
        document.querySelectorAll('.step').forEach((el, index) => {
            el.classList.remove('active', 'completed');
            if (index + 1 < step) {
                el.classList.add('completed');
            } else if (index + 1 === step) {
                el.classList.add('active');
            }
        });

        // Update status text
        statusElement.textContent = status;
        if (details) {
            statusElement.textContent += ` - ${details}`;
        }

        // Update automation stage
        const stageElement = document.getElementById('automationStage');
        const stepNames = ['Search Generation', 'Data Extraction', 'AI Analysis', 'Report Generation', 'Download Reports'];
        stageElement.textContent = stepNames[step - 1] || 'Completed';
    }

    // Update automation timer
    function updateAutomationTimer() {
        if (!automationState.isRunning || !automationState.startTime) return;

        const elapsed = Date.now() - automationState.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('automationTime').textContent = timeString;
        document.getElementById('autoTotalTime').textContent = timeString;
    }

    // Start full automation
    async function startFullAutomation() {
        const topic = document.getElementById('autoTopic').value.trim();
        const selectedPlatforms = Array.from(document.querySelectorAll('#autoPlatforms input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        const analysisDepth = document.getElementById('autoAnalysisDepth').value;

        if (!topic) {
            alert('Please enter a research topic');
            return;
        }

        if (selectedPlatforms.length === 0) {
            alert('Please select at least one platform');
            return;
        }

        // Initialize automation state
        automationState = {
            isRunning: true,
            startTime: Date.now(),
            currentStep: 1,
            results: { searchResults: 0, extractedItems: 0, analysisItems: 0 }
        };

        // Show progress UI
        automationProgress.style.display = 'block';
        automationResults.style.display = 'none';
        startFullAutomationBtn.disabled = true;
        startFullAutomationBtn.querySelector('.btn-text').style.display = 'none';
        startFullAutomationBtn.querySelector('.btn-loading').style.display = 'block';

        // Start timer
        const timerInterval = setInterval(updateAutomationTimer, 1000);

        try {
            // Step 1: Search Generation
            updateAutomationStep(1, 'Running', 'Generating search queries...');
            const searchResponse = await chrome.runtime.sendMessage({
                action: 'generateSearchQueries',
                topic: topic,
                sources: selectedPlatforms
            });

            if (searchResponse.success) {
                automationState.results.searchResults = searchResponse.results.length;
                updateAutomationStep(1, 'Completed', `${searchResponse.results.length} results found`);
                document.getElementById('autoSearchCount').textContent = searchResponse.results.length;
            } else {
                throw new Error('Search generation failed');
            }

            // Step 2: Data Extraction
            updateAutomationStep(2, 'Running', 'Extracting content from URLs...');
            const extractionResponse = await chrome.runtime.sendMessage({
                action: 'startDataExtraction',
                urls: searchResponse.results.map(r => r.url)
            });

            if (extractionResponse.success) {
                // Wait for extraction to complete
                await waitForExtractionCompletion();
                automationState.results.extractedItems = extractionResponse.extractedCount || 0;
                updateAutomationStep(2, 'Completed', `${automationState.results.extractedItems} items extracted`);
                document.getElementById('autoExtractCount').textContent = automationState.results.extractedItems;
            } else {
                throw new Error('Data extraction failed');
            }

            // Step 3: AI Analysis
            updateAutomationStep(3, 'Running', 'Running AI analysis...');
            const analysisResponse = await chrome.runtime.sendMessage({
                action: 'startAIAnalysis',
                dataSource: 'extracted',
                analysisDepth: analysisDepth
            });

            if (analysisResponse.success) {
                // Wait for analysis to complete
                await waitForAnalysisCompletion();
                automationState.results.analysisItems = analysisResponse.analysisCount || 0;
                updateAutomationStep(3, 'Completed', `${automationState.results.analysisItems} insights generated`);
                document.getElementById('autoAnalysisCount').textContent = automationState.results.analysisItems;
            } else {
                throw new Error('AI analysis failed');
            }

            // Step 4: Report Generation
            updateAutomationStep(4, 'Running', 'Generating reports...');
            const reportResponse = await chrome.runtime.sendMessage({
                action: 'generateReport'
            });

            if (reportResponse.success) {
                updateAutomationStep(4, 'Completed', 'Reports generated');
            } else {
                throw new Error('Report generation failed');
            }

            // Step 5: Download Reports
            updateAutomationStep(5, 'Running', 'Downloading reports...');
            const downloadResponse = await chrome.runtime.sendMessage({
                action: 'downloadReports'
            });

            if (downloadResponse.success) {
                updateAutomationStep(5, 'Completed', 'Reports downloaded');
            } else {
                throw new Error('Download failed');
            }

            // Show results
            automationResults.style.display = 'block';
            updateAutomationStep(6, 'Completed', 'Full automation completed!');

        } catch (error) {
            console.error('Automation failed:', error);
            alert(`Automation failed: ${error.message}`);
        } finally {
            // Cleanup
            clearInterval(timerInterval);
            automationState.isRunning = false;
            startFullAutomationBtn.disabled = false;
            startFullAutomationBtn.querySelector('.btn-text').style.display = 'block';
            startFullAutomationBtn.querySelector('.btn-loading').style.display = 'none';
        }
    }

    // Wait for extraction to complete
    async function waitForExtractionCompletion() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(async () => {
                const { extractionState } = await chrome.storage.local.get(['extractionState']);
                if (extractionState && extractionState.completed) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 2000);
        });
    }

    // Wait for analysis to complete
    async function waitForAnalysisCompletion() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(async () => {
                const { analysisState } = await chrome.storage.local.get(['analysisState']);
                if (analysisState && !analysisState.isRunning) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 2000);
        });
    }

    // Event listeners for automation
    if (startFullAutomationBtn) {
        startFullAutomationBtn.addEventListener('click', startFullAutomation);
    }
});