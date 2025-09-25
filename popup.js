// Enhanced popup script with mode switching
document.addEventListener('DOMContentLoaded', function () {
    // Mode switching elements
    const modeSwitcher = document.querySelector('.mode-switcher');
    const modeOptions = document.querySelectorAll('.mode-option');
    const sourcesMode = document.getElementById('sourcesMode');
    const extractionMode = document.getElementById('extractionMode');
    const aiMode = document.getElementById('aiMode');

    // Sources mode elements
    const selectedSourcesCount = document.getElementById('selectedSourcesCount');
    const lastAnalysis = document.getElementById('lastAnalysis');
    const sourceCheckboxes = document.querySelectorAll('input[id^="source"]');
    const generateDorks = document.getElementById('generateDorks');
    const sourcesStatus = document.getElementById('sourcesStatus');

    // Extraction mode elements
    const totalUrls = document.getElementById('totalUrls');
    const extractionStatusSpan = document.getElementById('extractionStatus');
    const csvFileInput = document.getElementById('csvFileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const urlCount = document.getElementById('urlCount');
    const sourceBreakdown = document.getElementById('sourceBreakdown');
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
    const resultsPreview = document.getElementById('resultsPreview');

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

    // Initialize popup
    initializePopup();

    // Event listeners
    setupModeSwitching();
    setupSourcesMode();
    setupExtractionMode();
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
        sourcesMode.classList.toggle('active', mode === 'sources');
        extractionMode.classList.toggle('active', mode === 'extraction');
        aiMode.classList.toggle('active', mode === 'ai');

        // Update body theme
        if (mode === 'sources') {
            document.body.className = 'sources-theme';
        } else if (mode === 'extraction') {
            document.body.className = 'extraction-theme';
        } else if (mode === 'ai') {
            document.body.className = 'ai-theme';
        }
    }

    // Sources mode setup
    function setupSourcesMode() {
        // Add event listeners for source checkboxes
        sourceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedSourcesCount);
        });
        
        generateDorks.addEventListener('click', generateSearchQueries);
        
        // Initialize source count
        updateSelectedSourcesCount();
    }

    // Extraction mode setup
    function setupExtractionMode() {
        csvFileInput.addEventListener('change', handleFileSelect);
        startExtraction.addEventListener('click', startExtractionProcess);
        stopExtraction.addEventListener('click', stopExtractionProcess);
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

    // Initialize popup data
    async function initializePopup() {
        try {
            // Load stored data
            const stored = await chrome.storage.local.get([
                'selectedSources', 
                'extractionStats', 
                'dataExtraction', 
                'aiAnalysis', 
                'per_post_analysis', 
                'aggregated_analysis'
            ]);
            
            updateSourcesStats(stored.selectedSources || []);
            updateExtractionStatus(stored.dataExtraction || {});
            updateAIStatus(stored.aiAnalysis || {}, stored.per_post_analysis || [], stored.aggregated_analysis || null);

        } catch (error) {
            console.error('Error initializing popup:', error);
            showSourcesStatus('Error initializing extension', 'error');
        }
    }

    // Update selected sources count
    function updateSelectedSourcesCount() {
        const selectedCount = Array.from(sourceCheckboxes).filter(cb => cb.checked).length;
        selectedSourcesCount.textContent = selectedCount;
        
        // Store selected sources
        const selectedSources = Array.from(sourceCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.id.replace('source', '').toLowerCase());
        
        chrome.storage.local.set({ selectedSources });
    }

    // Update sources statistics
    function updateSourcesStats(sources) {
        selectedSourcesCount.textContent = sources.length;
        
        // Update checkboxes based on stored sources
        sourceCheckboxes.forEach(checkbox => {
            const sourceName = checkbox.id.replace('source', '').toLowerCase();
            checkbox.checked = sources.includes(sourceName);
        });
    }

    // Update extraction status
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

    // Generate AI-powered search queries
    async function generateSearchQueries() {
        try {
            const selectedSources = Array.from(sourceCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.id.replace('source', '').toLowerCase());

            if (selectedSources.length === 0) {
                showSourcesStatus('Please select at least one data source', 'error');
                return;
            }

            generateDorks.disabled = true;
            generateDorks.innerHTML = '<div class="loading"></div>Generating...';
            showSourcesStatus('Generating AI-powered search queries...', 'success');

            // Get user input for the topic/field
            const topic = prompt('Enter the topic or field you want to analyze (e.g., "AI tools for developers", "productivity software", "automation tools"):');
            if (!topic) {
                generateDorks.disabled = false;
                generateDorks.innerHTML = '<div class="mode-icon ai-icon"></div>Generate AI-Powered Search Queries';
                return;
            }

            // Send message to background script to generate dorks
            const response = await chrome.runtime.sendMessage({
                type: 'GENERATE_SEARCH_QUERIES',
                topic: topic,
                sources: selectedSources
            });

            if (response.success) {
                showSourcesStatus('Search queries generated successfully! Check the Extraction tab.', 'success');
                // Switch to extraction mode
                switchMode('extraction');
            } else {
                throw new Error(response.error || 'Failed to generate search queries');
            }

        } catch (error) {
            console.error('Error generating search queries:', error);
            showSourcesStatus('Error: ' + error.message, 'error');
        } finally {
            generateDorks.disabled = false;
            generateDorks.innerHTML = '<div class="mode-icon ai-icon"></div>Generate AI-Powered Search Queries';
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

    // Handle file selection (Extraction mode)
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            const reader = new FileReader();
            reader.onload = function (e) {
                const csvContent = e.target.result;
                const urls = extractUrlsFromCSV(csvContent);
                const sourceBreakdown = getSourceBreakdown(urls);

                fileName.textContent = file.name;
                urlCount.textContent = urls.length;
                sourceBreakdown.textContent = Object.entries(sourceBreakdown)
                    .map(([source, count]) => `${source}: ${count}`)
                    .join(', ');
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
                           url.includes('github.com') || url.includes('dev.to') || url.includes('medium.com'))) {
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
            if (url.includes('reddit.com')) breakdown.reddit = (breakdown.reddit || 0) + 1;
            else if (url.includes('stackoverflow.com')) breakdown.stackoverflow = (breakdown.stackoverflow || 0) + 1;
            else if (url.includes('github.com')) breakdown.github = (breakdown.github || 0) + 1;
            else if (url.includes('dev.to')) breakdown.devto = (breakdown.devto || 0) + 1;
            else if (url.includes('medium.com')) breakdown.medium = (breakdown.medium || 0) + 1;
        });
        return breakdown;
    }

    // Start data extraction process
    async function startExtractionProcess() {
        if (!window.selectedUrls || window.selectedUrls.length === 0) {
            showExtractionStatus('Please select a CSV file with URLs', 'error');
            return;
        }

        try {
            startExtraction.disabled = true;
            startExtraction.innerHTML = '<div class="loading"></div>Starting...';

            showExtractionStatus('Starting data extraction...', 'success');

            // Send message to background script to start extraction
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

    // Stop extraction process
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

    // Show status in Google mode
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';

        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Show status in sources mode
    function showSourcesStatus(message, type) {
        sourcesStatus.textContent = message;
        sourcesStatus.className = `status ${type}`;
        sourcesStatus.style.display = 'block';

        setTimeout(() => {
            sourcesStatus.style.display = 'none';
        }, 5000);
    }

    // Show status in extraction mode
    function showExtractionStatus(message, type) {
        extractionStatus.textContent = message;
        extractionStatus.className = `status ${type}`;
        extractionStatus.style.display = 'block';

        setTimeout(() => {
            extractionStatus.style.display = 'none';
        }, 5000);
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

    // Start AI analysis process
    async function startAIAnalysisProcess() {
        try {
            // Check if API key is set
            const { OPENAI_API_KEY } = await chrome.storage.local.get(['OPENAI_API_KEY']);
            if (!OPENAI_API_KEY) {
                showAIStatus('Please set your OpenAI API key in the extension options first', 'error');
                return;
            }

            // Get extracted Reddit data
            const { redditExtraction } = await chrome.storage.local.get(['redditExtraction']);
            if (!redditExtraction.extractedData || redditExtraction.extractedData.length === 0) {
                showAIStatus('No Reddit data found. Please extract Reddit data first.', 'error');
                return;
            }

            startAIAnalysis.disabled = true;
            startAIAnalysis.innerHTML = '<div class="loading"></div>Starting Analysis...';
            showAIStatus('Starting AI analysis...', 'success');

            // Send message to background script to start AI analysis
            const response = await chrome.runtime.sendMessage({
                type: 'ANALYZE',
                posts: redditExtraction.extractedData
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

    // Show analysis results
    function showAnalysisResults(aggregateResults) {
        analysisResults.style.display = 'block';

        const preview = `
            <div style="margin-bottom: 15px;">
                <strong>🎯 Top Requested Tools:</strong><br>
                ${(aggregateResults.top_requested_tools || []).slice(0, 5).map(tool => `• ${tool}`).join('<br>')}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>💡 MVP Recommendations:</strong><br>
                ${(aggregateResults.mvp_recommendations || []).slice(0, 3).map(rec => `• ${rec}`).join('<br>')}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>📋 Action Plan:</strong><br>
                ${aggregateResults.short_action_plan || 'No action plan generated'}
            </div>
        `;

        resultsPreview.innerHTML = preview;
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
            if (changes.selectedSources) {
                const sources = changes.selectedSources.newValue;
                updateSourcesStats(sources);
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
                    // Don't show status here as it's already handled in stopExtractionProcess
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