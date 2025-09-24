// Enhanced popup script with mode switching
document.addEventListener('DOMContentLoaded', function () {
    // Mode switching elements
    const modeSwitcher = document.querySelector('.mode-switcher');
    const modeOptions = document.querySelectorAll('.mode-option');
    const googleMode = document.getElementById('googleMode');
    const redditMode = document.getElementById('redditMode');

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

    // Initialize popup
    initializePopup();

    // Event listeners
    setupModeSwitching();
    setupGoogleMode();
    setupRedditMode();

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

        // Update body theme
        document.body.className = mode === 'google' ? 'google-theme' : 'reddit-theme';
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

    // Initialize popup data
    async function initializePopup() {
        try {
            // Get current tab info
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            updateCurrentPageInfo(tab.url);

            // Load stored data
            const stored = await chrome.storage.local.get(['searchResults', 'extractionStats', 'redditExtraction']);
            updateGoogleStats(stored.searchResults || [], stored.extractionStats || {});
            updateRedditStatus(stored.redditExtraction || {});

            // Check if current page is Google search
            if (tab.url && tab.url.includes('google.com/search')) {
                extractBtn.disabled = false;
                extractBtn.innerHTML = '<div class="mode-icon google-icon"></div>Extract Current Page Results';
            } else {
                extractBtn.disabled = true;
                extractBtn.innerHTML = '<div class="mode-icon google-icon"></div>Navigate to Google Search First';
            }

        } catch (error) {
            console.error('Error initializing popup:', error);
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
        }
    });
});