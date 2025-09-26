// Enhanced sidepanel script with modern interactions and improved UX
document.addEventListener('DOMContentLoaded', function () {
    // Enhanced mode switching elements
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
    }

    // AI mode setup
    function setupAIMode() {
        startAIAnalysis.addEventListener('click', startAIAnalysisProcess);
        viewResults.addEventListener('click', viewAnalysisResults);
        openReportUI.addEventListener('click', openReportUIPage);
        exportAnalysis.addEventListener('click', exportAnalysisResults);

        // File selection setup
        jsonFileInput.addEventListener('change', handleJSONFileSelect);
        reportFileInput.addEventListener('change', handleReportFileSelect);
        openReportBtn.addEventListener('click', openReportInAnalysisTab);
        dataSourceRadios.forEach(radio => {
            radio.addEventListener('change', handleDataSourceChange);
        });
    }

    // Initialize sidepanel data
    async function initializeSidepanel() {
        try {
            // Load stored data
            const stored = await chrome.storage.local.get([
                'selectedSources',
                'dataExtraction',
                'aiAnalysis',
                'per_post_analysis',
                'aggregated_analysis',
                'searchResults'
            ]);

            updateSelectedSourcesCount();
            updateSourcesStats(stored.selectedSources || ['reddit']);
            updateExtractionStatus(stored.dataExtraction || {});
            updateAIStatus(stored.aiAnalysis || {}, stored.per_post_analysis || [], stored.aggregated_analysis || null);

            // Show export button if we have search results
            if (stored.searchResults && stored.searchResults.length > 0) {
                exportSearchResults.style.display = 'block';
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
        if (extraction.isRunning) {
            extractionStatusSpan.textContent = 'Running';
            showProgressTracking(extraction);
        } else if (extraction.completed) {
            extractionStatusSpan.textContent = 'Completed';
        } else if (extraction.stopped) {
            extractionStatusSpan.textContent = 'Stopped';
        } else {
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
        itemsAnalyzed.textContent = perPostResults.length;

        if (analysis.isRunning) {
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
                // Get extracted data
                const { dataExtraction } = await chrome.storage.local.get(['dataExtraction']);
                if (!dataExtraction.extractedData || dataExtraction.extractedData.length === 0) {
                    showAIStatus('No extracted data found. Please extract data first or select a JSON file.', 'error');
                    return;
                }
                itemsToAnalyze = dataExtraction.extractedData;
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
                updateAIStatus({ isRunning: false }, response.perPost, response.aggregate);
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

            const exportData = {
                timestamp: new Date().toISOString(),
                per_post_analysis: per_post_analysis || [],
                aggregated_analysis: aggregated_analysis
            };

            const jsonData = JSON.stringify(exportData, null, 2);
            const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`;

            await chrome.downloads.download({
                url: dataUrl,
                filename: `ai_analysis_${new Date().toISOString().split('T')[0]}.json`,
                conflictAction: 'overwrite',
                saveAs: true
            });

            showAIStatus('Analysis results exported successfully!', 'success');

        } catch (error) {
            console.error('Error exporting analysis:', error);
            showAIStatus('Error exporting analysis: ' + error.message, 'error');
        }
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

            if (changes.dataExtraction) {
                const extraction = changes.dataExtraction.newValue;
                updateExtractionStatus(extraction);

                if (extraction.isRunning) {
                    updateProgress(extraction);
                } else if (extraction.completed) {
                    showExtractionStatus('Data extraction completed!', 'success');
                    hideProgressTracking();
                } else if (extraction.stopped) {
                    hideProgressTracking();
                }
            }

            if (changes.aiAnalysis) {
                const analysis = changes.aiAnalysis.newValue;
                updateAIStatus(analysis, analysis.perPostResults || [], analysis.aggregateResults || null);

                if (analysis.isRunning) {
                    updateAIAnalysisProgress(analysis);
                }
            }

            if (changes.per_post_analysis || changes.aggregated_analysis) {
                const perPost = changes.per_post_analysis ? changes.per_post_analysis.newValue : [];
                const aggregate = changes.aggregated_analysis ? changes.aggregated_analysis.newValue : null;
                updateAIStatus({ isRunning: false }, perPost, aggregate);
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

    // Add performance monitoring
    function logPerformance(operation, startTime) {
        const duration = performance.now() - startTime;
        console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
    }
});