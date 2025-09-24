// Background script for data management
chrome.runtime.onInstalled.addListener(() => {
    console.log('Search Results Extractor installed');

    // Initialize storage
    chrome.storage.local.set({
        searchResults: [],
        extractionStats: {
            totalExtracted: 0,
            lastExtraction: null
        },
        redditExtraction: {
            isRunning: false,
            currentTask: null,
            progress: 0,
            total: 0,
            extractedData: []
        }
    });
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.type === 'RESULTS_EXTRACTED') {
            // Update extraction stats
            chrome.storage.local.get(['extractionStats'], (result) => {
                const stats = result.extractionStats || { totalExtracted: 0, lastExtraction: null };
                stats.totalExtracted += request.count;
                stats.lastExtraction = new Date().toISOString();

                chrome.storage.local.set({ extractionStats: stats });
            });
        } else if (request.type === 'START_REDDIT_EXTRACTION') {
            // Handle Reddit extraction request
            handleRedditExtraction(request, sendResponse);
            return true; // Keep message channel open for async response
        } else if (request.type === 'REDDIT_DATA_EXTRACTED') {
            // Handle extracted Reddit data
            handleRedditDataExtracted(request);
        } else if (request.type === 'STOP_AND_SAVE_REDDIT') {
            // Handle stop and save request
            handleStopAndSave(sendResponse);
            return true; // Keep message channel open for async response
        }
    } catch (error) {
        console.error('Error in message listener:', error);
        if (sendResponse) {
            sendResponse({ success: false, error: error.message });
        }
    }
});

// Context menu for easy access (optional)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'extractResults',
        title: 'Extract Search Results',
        contexts: ['page'],
        documentUrlPatterns: ['https://www.google.com/search*']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'extractResults') {
        // Send message to content script to extract results
        chrome.tabs.sendMessage(tab.id, { action: 'extract' });
    }
});

// Handle Reddit extraction process
async function handleRedditExtraction(request, sendResponse) {
    try {
        const { redditUrls, closeTabs, extractComments } = request;

        if (!redditUrls || redditUrls.length === 0) {
            throw new Error('No Reddit URLs provided');
        }

        // Update extraction status
        await chrome.storage.local.set({
            redditExtraction: {
                isRunning: true,
                currentTask: 'Reddit Extraction',
                progress: 0,
                total: redditUrls.length,
                currentUrl: '',
                startTime: new Date().toISOString(),
                extractedData: []
            }
        });

        // Start extraction process
        startRedditExtractionProcess(redditUrls, closeTabs, extractComments);

        sendResponse({ success: true, message: `Starting extraction of ${redditUrls.length} Reddit URLs` });

    } catch (error) {
        console.error('Error starting Reddit extraction:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Read CSV file content
async function readCSVFile(filename) {
    return new Promise((resolve, reject) => {
        // Since we can't directly read files, we'll need to use a different approach
        // For now, we'll extract URLs from the download history
        chrome.downloads.search({ filename: filename }, (downloads) => {
            if (downloads.length > 0) {
                // This is a simplified approach - in a real implementation,
                // you might need to use the File System Access API or other methods
                // For now, return a placeholder that will trigger sample URLs
                resolve({ placeholder: true });
            } else {
                reject(new Error('File not found'));
            }
        });
    });
}

// Extract Reddit URLs from CSV content
function extractRedditUrlsFromCSV(csvContent) {
    // If it's a placeholder, return sample URLs for testing
    if (csvContent && csvContent.placeholder) {
        return [
            'https://www.reddit.com/r/programming/comments/example1/',
            'https://www.reddit.com/r/webdev/comments/example2/',
            'https://www.reddit.com/r/javascript/comments/example3/'
        ];
    }

    if (!csvContent || typeof csvContent !== 'string') {
        return [];
    }

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
async function startRedditExtractionProcess(urls, closeTabs, extractComments) {
    let currentTab = null;

    for (let i = 0; i < urls.length; i++) {
        try {
            // Check if extraction was stopped before processing each URL
            const currentState = await chrome.storage.local.get(['redditExtraction']);
            if (!currentState.redditExtraction.isRunning) {
                console.log('Extraction stopped by user - terminating process');
                // Close any open tab before breaking
                if (currentTab) {
                    try {
                        await chrome.tabs.remove(currentTab.id);
                    } catch (closeError) {
                        console.error(`Error closing tab ${currentTab.id}:`, closeError);
                    }
                }
                break;
            }

            // Update progress with current URL
            await chrome.storage.local.set({
                redditExtraction: {
                    ...currentState.redditExtraction,
                    progress: i,
                    currentUrl: urls[i],
                    currentIndex: i + 1
                }
            });

            console.log(`Processing URL ${i + 1}/${urls.length}: ${urls[i]}`);

            // Open tab and extract data
            currentTab = await chrome.tabs.create({ url: urls[i], active: false });

            // Wait for page to load with periodic checks for stop signal
            let loadTime = 0;
            const maxLoadTime = 5000;
            const checkInterval = 500;

            while (loadTime < maxLoadTime) {
                await new Promise(resolve => setTimeout(resolve, checkInterval));
                loadTime += checkInterval;

                // Check if extraction was stopped during loading
                const stopCheck = await chrome.storage.local.get(['redditExtraction']);
                if (!stopCheck.redditExtraction.isRunning) {
                    console.log('Extraction stopped during page load - terminating process');
                    if (currentTab) {
                        try {
                            await chrome.tabs.remove(currentTab.id);
                        } catch (closeError) {
                            console.error(`Error closing tab ${currentTab.id}:`, closeError);
                        }
                    }
                    return; // Exit the entire function
                }
            }

            // Check again before extracting data
            const preExtractState = await chrome.storage.local.get(['redditExtraction']);
            if (!preExtractState.redditExtraction.isRunning) {
                console.log('Extraction stopped before data extraction - terminating process');
                if (currentTab) {
                    try {
                        await chrome.tabs.remove(currentTab.id);
                    } catch (closeError) {
                        console.error(`Error closing tab ${currentTab.id}:`, closeError);
                    }
                }
                return; // Exit the entire function
            }

            // Inject content script and extract data
            try {
                const results = await chrome.tabs.sendMessage(currentTab.id, {
                    action: 'extractRedditData',
                    extractComments: extractComments
                });

                // Check if extraction was stopped after data extraction
                const postExtractState = await chrome.storage.local.get(['redditExtraction']);
                if (!postExtractState.redditExtraction.isRunning) {
                    console.log('Extraction stopped after data extraction - terminating process');
                    if (currentTab) {
                        try {
                            await chrome.tabs.remove(currentTab.id);
                        } catch (closeError) {
                            console.error(`Error closing tab ${currentTab.id}:`, closeError);
                        }
                    }
                    return; // Exit the entire function
                }

                if (results && results.success) {
                    const newData = {
                        url: urls[i],
                        post: results.post,
                        comments: results.comments || []
                    };

                    // Add to extracted data and save immediately
                    const updatedData = [...(postExtractState.redditExtraction.extractedData || []), newData];
                    await chrome.storage.local.set({
                        redditExtraction: {
                            ...postExtractState.redditExtraction,
                            extractedData: updatedData
                        }
                    });

                    console.log(`Successfully extracted data from ${urls[i]}`);
                } else {
                    console.log(`Failed to extract data from ${urls[i]}`);
                }
            } catch (messageError) {
                console.error(`Error sending message to tab ${currentTab.id}:`, messageError);
            }

            // Close tab if requested
            if (closeTabs) {
                try {
                    await chrome.tabs.remove(currentTab.id);
                    currentTab = null;
                } catch (closeError) {
                    console.error(`Error closing tab ${currentTab.id}:`, closeError);
                }
            }

        } catch (error) {
            console.error(`Error extracting from ${urls[i]}:`, error);
            // Close tab on error if it exists
            if (currentTab) {
                try {
                    await chrome.tabs.remove(currentTab.id);
                    currentTab = null;
                } catch (closeError) {
                    console.error(`Error closing tab ${currentTab.id}:`, closeError);
                }
            }
        }
    }

    // Check if extraction was completed normally or stopped
    const finalState = await chrome.storage.local.get(['redditExtraction']);
    if (finalState.redditExtraction.isRunning) {
        // Save extracted data as JSON (normal completion)
        await saveRedditDataAsJSON(finalState.redditExtraction.extractedData);

        // Update extraction status - completed
        await chrome.storage.local.set({
            redditExtraction: {
                isRunning: false,
                currentTask: null,
                progress: urls.length,
                total: urls.length,
                currentUrl: '',
                currentIndex: urls.length,
                completed: true,
                endTime: new Date().toISOString(),
                extractedData: []
            }
        });

        console.log(`Reddit extraction completed. Extracted ${finalState.redditExtraction.extractedData.length} posts.`);
    }
}

// Save Reddit data as JSON
async function saveRedditDataAsJSON(data, isStopped = false) {
    const timestamp = new Date().toISOString().split('T')[0];
    const suffix = isStopped ? '_stopped' : '_completed';
    const filename = `reddit_extraction_${timestamp}${suffix}.json`;

    // Create data URL instead of blob URL (works in service workers)
    const jsonData = JSON.stringify(data, null, 2);
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`;

    await chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        conflictAction: 'overwrite',
        saveAs: true
    });
}

// Handle extracted Reddit data
function handleRedditDataExtracted(request) {
    console.log('Reddit data extracted:', request.data);
    // Additional processing if needed
}

// Handle stop and save request
async function handleStopAndSave(sendResponse) {
    try {
        const currentState = await chrome.storage.local.get(['redditExtraction']);

        if (!currentState.redditExtraction.isRunning) {
            sendResponse({ success: false, error: 'No extraction is currently running' });
            return;
        }

        console.log('Stopping Reddit extraction process...');

        // Stop the extraction immediately
        await chrome.storage.local.set({
            redditExtraction: {
                ...currentState.redditExtraction,
                isRunning: false,
                stopped: true,
                endTime: new Date().toISOString()
            }
        });

        // Close any open tabs that might be related to the extraction
        try {
            const tabs = await chrome.tabs.query({ url: 'https://www.reddit.com/*' });
            for (const tab of tabs) {
                // Only close tabs that are not the current active tab
                if (!tab.active) {
                    try {
                        await chrome.tabs.remove(tab.id);
                        console.log(`Closed extraction tab: ${tab.url}`);
                    } catch (closeError) {
                        console.error(`Error closing tab ${tab.id}:`, closeError);
                    }
                }
            }
        } catch (tabError) {
            console.error('Error querying tabs:', tabError);
        }

        // Save the current extracted data
        if (currentState.redditExtraction.extractedData && currentState.redditExtraction.extractedData.length > 0) {
            await saveRedditDataAsJSON(currentState.redditExtraction.extractedData, true);

            // Clear the extracted data
            await chrome.storage.local.set({
                redditExtraction: {
                    isRunning: false,
                    currentTask: null,
                    progress: 0,
                    total: 0,
                    currentUrl: '',
                    stopped: true,
                    endTime: new Date().toISOString(),
                    extractedData: []
                }
            });

            sendResponse({
                success: true,
                message: `Extraction stopped and saved ${currentState.redditExtraction.extractedData.length} posts`
            });
        } else {
            // Clear the extraction state even if no data was extracted
            await chrome.storage.local.set({
                redditExtraction: {
                    isRunning: false,
                    currentTask: null,
                    progress: 0,
                    total: 0,
                    currentUrl: '',
                    stopped: true,
                    endTime: new Date().toISOString(),
                    extractedData: []
                }
            });

            sendResponse({
                success: true,
                message: 'Extraction stopped but no data was extracted yet'
            });
        }

    } catch (error) {
        console.error('Error stopping and saving extraction:', error);
        sendResponse({ success: false, error: error.message });
    }
}
