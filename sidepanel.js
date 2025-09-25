// Enhanced sidepanel script with mode switching and expanded AI analysis
document.addEventListener('DOMContentLoaded', function () {
    // Mode switching elements
    const modeSwitcher = document.querySelector('.mode-switcher');
    const modeOptions = document.querySelectorAll('.mode-option');
    const googleMode = document.getElementById('googleMode');
    const redditMode = document.getElementById('redditMode');
    const aiMode = document.getElementById('aiMode');

    // Google mode elements
    const extractBtn = document.getElementById('extractBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const statusDiv = document.getElementById('status');
    const totalResultsSpan = document.getElementById('totalResults');
    const lastExtractionSpan = document.getElementById('lastExtraction');

    // Reddit mode elements
    const currentPageSpan = document.getElementById('currentPage');
    const extractionStatusSpan = document.getElementById('extractionStatus');
    const csvFileInput = document.getElementById('csvFileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const urlCount = document.getElementById('urlCount');
    const startRedditExtraction = document.getElementById('startRedditExtraction');
    const redditStatus = document.getElementById('redditStatus');

    // Progress tracking elements
    const redditProgress = document.getElementById('redditProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    const currentUrl = document.getElementById('currentUrl');
    const stopExtraction = document.getElementById('stopExtraction');

    // AI Analysis elements
    const postsAnalyzed = document.getElementById('postsAnalyzed');
    const analysisStatus = document.getElementById('analysisStatus');
    const startAIAnalysis = document.getElementById('startAIAnalysis');
    const viewResults = document.getElementById('viewResults');
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
    const jsonPostCount = document.getElementById('jsonPostCount');
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

    // Initialize sidepanel
    initializeSidepanel();

    // Event listeners
    setupModeSwitching();
    setupGoogleMode();
    setupRedditMode();
    setupAIMode();

    // Mode switching functionality
    function setupModeSwitching() {
        modeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const mode = option.dataset.mode;
                switchMode(mode);
            });
        });
    }

    function switchMode(mode) {
        // Update active mode option
        modeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.mode === mode);
        });

        // Show/hide content areas
        googleMode.classList.toggle('active', mode === 'google');
        redditMode.classList.toggle('active', mode === 'reddit');
        aiMode.classList.toggle('active', mode === 'ai');

        // Update body theme
        if (mode === 'google') {
            document.body.className = 'google-theme';
        } else if (mode === 'reddit') {
            document.body.className = 'reddit-theme';
        } else if (mode === 'ai') {
            document.body.className = 'ai-theme';
        }
    }

    // Google mode setup
    function setupGoogleMode() {
        extractBtn.addEventListener('click', extractCurrentPage);
        exportBtn.addEventListener('click', exportToCSV);
        clearBtn.addEventListener('click', clearAllData);
    }

    // Reddit mode setup
    function setupRedditMode() {
        csvFileInput.addEventListener('change', handleFileSelect);
        startRedditExtraction.addEventListener('click', startRedditExtractionProcess);
        stopExtraction.addEventListener('click', stopRedditExtraction);
    }

    // AI mode setup
    function setupAIMode() {
        startAIAnalysis.addEventListener('click', startAIAnalysisProcess);
        viewResults.addEventListener('click', viewAnalysisResults);
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
            // Get current tab info
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            updateCurrentPageInfo(tab.url);

            // Load stored data
            const stored = await chrome.storage.local.get(['searchResults', 'extractionStats', 'redditExtraction', 'aiAnalysis', 'per_post_analysis', 'aggregated_analysis']);
            updateGoogleStats(stored.searchResults || [], stored.extractionStats || {});
            updateRedditStatus(stored.redditExtraction || {});
            updateAIStatus(stored.aiAnalysis || {}, stored.per_post_analysis || [], stored.aggregated_analysis || null);

            // Check if current page is Google search
            if (tab.url && tab.url.includes('google.com/search')) {
                extractBtn.disabled = false;
                extractBtn.innerHTML = '<div class="mode-icon google-icon"></div>Extract Current Page Results';
            } else {
                extractBtn.disabled = true;
                extractBtn.innerHTML = '<div class="mode-icon google-icon"></div>Navigate to Google Search First';
            }

        } catch (error) {
            console.error('Error initializing sidepanel:', error);
            showStatus('Error initializing extension', 'error');
        }
    }

    // Update current page info
    function updateCurrentPageInfo(url) {
        if (url.includes('google.com/search')) {
            currentPageSpan.textContent = 'Google Search';
        } else if (url.includes('reddit.com')) {
            currentPageSpan.textContent = 'Reddit';
        } else {
            currentPageSpan.textContent = 'Other';
        }
    }

    // Update Google statistics display
    function updateGoogleStats(results, stats) {
        totalResultsSpan.textContent = results.length;

        if (stats.lastExtraction) {
            const date = new Date(stats.lastExtraction);
            lastExtractionSpan.textContent = date.toLocaleString();
        } else {
            lastExtractionSpan.textContent = 'Never';
        }
    }

    // Update Reddit status display
    function updateRedditStatus(extraction) {
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

    // Extract results from current page (Google mode)
    async function extractCurrentPage() {
        try {
            extractBtn.disabled = true;
            extractBtn.innerHTML = '<div class="loading"></div>Extracting...';
            showStatus('Extracting results...', 'success');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'extract' });

            if (response && response.success) {
                showStatus('Results extracted successfully!', 'success');

                // Refresh stats
                const stored = await chrome.storage.local.get(['searchResults', 'extractionStats']);
                updateGoogleStats(stored.searchResults || [], stored.extractionStats || {});
            } else {
                showStatus('Failed to extract results', 'error');
            }

        } catch (error) {
            console.error('Error extracting results:', error);
            showStatus('Error: ' + error.message, 'error');
        } finally {
            extractBtn.disabled = false;
            extractBtn.innerHTML = '<div class="mode-icon google-icon"></div>Extract Current Page Results';
        }
    }

    // Export all results to CSV (Google mode)
    async function exportToCSV() {
        try {
            exportBtn.disabled = true;
            exportBtn.innerHTML = '<div class="loading"></div>Exporting...';

            const stored = await chrome.storage.local.get(['searchResults']);
            const results = stored.searchResults || [];

            if (results.length === 0) {
                showStatus('No data to export', 'error');
                return;
            }

            // Generate CSV content
            const csvContent = generateCSV(results);

            // Create data URL for download
            const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;

            // Use Chrome downloads API to save file
            await chrome.downloads.download({
                url: dataUrl,
                filename: 'search_results_' + new Date().toISOString().split('T')[0] + '.csv',
                conflictAction: 'overwrite',
                saveAs: true
            });

            showStatus(`Exported ${results.length} results to Downloads folder`, 'success');

        } catch (error) {
            console.error('Error exporting CSV:', error);
            showStatus('Error exporting CSV: ' + error.message, 'error');
        } finally {
            exportBtn.disabled = false;
            exportBtn.innerHTML = 'Export All to CSV';
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
                escapeCSVField(result.timestamp),
                escapeCSVField(result.source)
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // Clear all stored data (Google mode)
    async function clearAllData() {
        if (confirm('Are you sure you want to clear all extracted data? This action cannot be undone.')) {
            try {
                await chrome.storage.local.set({
                    searchResults: [],
                    extractionStats: {
                        totalExtracted: 0,
                        lastExtraction: null
                    }
                });

                updateGoogleStats([], {});
                showStatus('All data cleared', 'success');

            } catch (error) {
                console.error('Error clearing data:', error);
                showStatus('Error clearing data', 'error');
            }
        }
    }

    // Handle file selection (Reddit mode)
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            const reader = new FileReader();
            reader.onload = function (e) {
                const csvContent = e.target.result;
                const redditUrls = extractRedditUrlsFromCSV(csvContent);

                fileName.textContent = file.name;
                urlCount.textContent = redditUrls.length;
                fileInfo.style.display = 'block';

                // Store the URLs for extraction
                window.selectedRedditUrls = redditUrls;
            };
            reader.readAsText(file);
        } else {
            showRedditStatus('Please select a valid CSV file', 'error');
        }
    }

    // Extract Reddit URLs from CSV content
    function extractRedditUrlsFromCSV(csvContent) {
        const lines = csvContent.split('\n');
        const redditUrls = [];

        for (let i = 1; i < lines.length; i++) { // Skip header
            const columns = lines[i].split(',');
            if (columns.length >= 2) {
                const url = columns[1].replace(/"/g, ''); // Remove quotes
                if (url.includes('reddit.com')) {
                    redditUrls.push(url);
                }
            }
        }

        return redditUrls;
    }

    // Start Reddit extraction process
    async function startRedditExtractionProcess() {
        if (!window.selectedRedditUrls || window.selectedRedditUrls.length === 0) {
            showRedditStatus('Please select a CSV file with Reddit URLs', 'error');
            return;
        }

        try {
            startRedditExtraction.disabled = true;
            startRedditExtraction.innerHTML = '<div class="loading"></span>Starting...';

            showRedditStatus('Starting Reddit extraction...', 'success');

            // Send message to background script to start Reddit extraction
            const response = await chrome.runtime.sendMessage({
                type: 'START_REDDIT_EXTRACTION',
                redditUrls: window.selectedRedditUrls,
                closeTabs: document.getElementById('closeTabs').checked,
                extractComments: document.getElementById('extractComments').checked
            });

            if (response.success) {
                showRedditStatus('Reddit extraction started successfully!', 'success');
                // Show progress tracking
                setTimeout(() => {
                    checkRedditExtractionStatus();
                }, 1000);
            } else {
                throw new Error(response.error || 'Failed to start extraction');
            }

        } catch (error) {
            console.error('Error starting Reddit extraction:', error);
            showRedditStatus('Error: ' + error.message, 'error');
        } finally {
            startRedditExtraction.disabled = false;
            startRedditExtraction.innerHTML = '<div class="mode-icon reddit-icon"></div>Start Reddit Extraction';
        }
    }

    // Check Reddit extraction status
    async function checkRedditExtractionStatus() {
        try {
            const stored = await chrome.storage.local.get(['redditExtraction']);
            const extraction = stored.redditExtraction || {};

            if (extraction.isRunning) {
                showProgressTracking(extraction);
            } else if (extraction.completed) {
                showRedditStatus('Reddit extraction completed!', 'success');
                hideProgressTracking();
            }
        } catch (error) {
            console.error('Error checking Reddit extraction status:', error);
        }
    }

    // Show progress tracking
    function showProgressTracking(extraction) {
        redditProgress.style.display = 'block';
        updateProgress(extraction);
    }

    // Hide progress tracking
    function hideProgressTracking() {
        redditProgress.style.display = 'none';
    }

    // Update progress display
    function updateProgress(extraction) {
        const progress = extraction.progress || 0;
        const total = extraction.total || 0;
        const percent = total > 0 ? Math.round((progress / total) * 100) : 0;

        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${progress} / ${total}`;
        progressPercent.textContent = `${percent}%`;

        if (extraction.currentUrl) {
            currentUrl.textContent = `Current: ${extraction.currentUrl}`;
        }
    }

    // Stop Reddit extraction
    async function stopRedditExtraction() {
        try {
            stopExtraction.disabled = true;
            stopExtraction.innerHTML = '<div class="loading"></div>Stopping...';

            // Send message to background script to stop and save
            const response = await chrome.runtime.sendMessage({
                type: 'STOP_AND_SAVE_REDDIT'
            });

            if (response.success) {
                showRedditStatus(response.message, 'success');
            } else {
                showRedditStatus('Error: ' + response.error, 'error');
            }

            hideProgressTracking();
        } catch (error) {
            console.error('Error stopping Reddit extraction:', error);
            showRedditStatus('Error stopping extraction: ' + error.message, 'error');
        } finally {
            stopExtraction.disabled = false;
            stopExtraction.innerHTML = 'Stop Extraction';
        }
    }

    // Update AI status display
    function updateAIStatus(analysis, perPostResults, aggregateResults) {
        postsAnalyzed.textContent = perPostResults.length;

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
                    let postCount = 0;

                    // Handle different JSON structures
                    if (Array.isArray(jsonData)) {
                        postCount = jsonData.length;
                    } else if (jsonData.extractedData) {
                        postCount = jsonData.extractedData.length;
                    } else if (jsonData.posts) {
                        postCount = jsonData.posts.length;
                    }

                    jsonFileName.textContent = file.name;
                    jsonPostCount.textContent = postCount;
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
            let postsToAnalyze = [];

            if (selectedSource === 'extracted') {
                // Get extracted Reddit data
                const { redditExtraction } = await chrome.storage.local.get(['redditExtraction']);
                if (!redditExtraction.extractedData || redditExtraction.extractedData.length === 0) {
                    showAIStatus('No Reddit data found. Please extract Reddit data first or select a JSON file.', 'error');
                    return;
                }
                postsToAnalyze = redditExtraction.extractedData;
            } else if (selectedSource === 'file') {
                // Use uploaded JSON file
                if (!window.selectedJSONData) {
                    showAIStatus('Please select a JSON file first', 'error');
                    return;
                }

                // Extract posts from different JSON structures
                if (Array.isArray(window.selectedJSONData)) {
                    postsToAnalyze = window.selectedJSONData;
                } else if (window.selectedJSONData.extractedData) {
                    postsToAnalyze = window.selectedJSONData.extractedData;
                } else if (window.selectedJSONData.posts) {
                    postsToAnalyze = window.selectedJSONData.posts;
                } else {
                    showAIStatus('Invalid JSON structure. Expected array of posts or object with extractedData/posts property.', 'error');
                    return;
                }
            }

            if (postsToAnalyze.length === 0) {
                showAIStatus('No posts found in the selected data source', 'error');
                return;
            }

            startAIAnalysis.disabled = true;
            startAIAnalysis.innerHTML = '<div class="loading"></div>Starting Analysis...';
            showAIStatus(`Starting AI analysis of ${postsToAnalyze.length} posts...`, 'success');

            // Send message to background script to start AI analysis
            const response = await chrome.runtime.sendMessage({
                type: 'ANALYZE',
                posts: postsToAnalyze
            });

            if (response.ok) {
                showAIStatus('AI analysis completed successfully!', 'success');
                updateAIStatus({ isRunning: false }, response.perPost, response.aggregate);
                viewResults.style.display = 'block';
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

    // Update AI analysis progress display
    function updateAIAnalysisProgress(analysis) {
        const progress = analysis.progress || 0;
        const total = analysis.total || 0;
        const percent = total > 0 ? Math.round((progress / total) * 100) : 0;

        aiProgressFill.style.width = `${percent}%`;
        aiProgressText.textContent = `${progress} / ${total}`;
        aiProgressPercent.textContent = `${percent}%`;

        if (analysis.currentTask) {
            aiCurrentTask.textContent = `Current: ${analysis.currentTask}`;
        }
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

    // Show status in Google mode
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';

        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Show status in Reddit mode
    function showRedditStatus(message, type) {
        redditStatus.textContent = message;
        redditStatus.className = `status ${type}`;
        redditStatus.style.display = 'block';

        setTimeout(() => {
            redditStatus.style.display = 'none';
        }, 5000);
    }

    // Show status in AI mode
    function showAIStatus(message, type) {
        aiStatus.textContent = message;
        aiStatus.className = `status ${type}`;
        aiStatus.style.display = 'block';

        setTimeout(() => {
            aiStatus.style.display = 'none';
        }, 5000);
    }

    // Listen for storage changes to update stats in real-time
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.searchResults || changes.extractionStats) {
                const results = changes.searchResults ? changes.searchResults.newValue : [];
                const stats = changes.extractionStats ? changes.extractionStats.newValue : {};
                updateGoogleStats(results, stats);
            }

            if (changes.redditExtraction) {
                const extraction = changes.redditExtraction.newValue;
                updateRedditStatus(extraction);

                if (extraction.isRunning) {
                    updateProgress(extraction);
                } else if (extraction.completed) {
                    showRedditStatus('Reddit extraction completed!', 'success');
                    hideProgressTracking();
                } else if (extraction.stopped) {
                    // Don't show status here as it's already handled in stopRedditExtraction
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
});
