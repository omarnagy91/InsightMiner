/**
 * @file content-google.js
 * @description This content script is injected into Google search result pages.
 * It is responsible for extracting search result data (titles, URLs, snippets)
 * from the DOM, handling various page layouts, and communicating the results
 * back to the background script. It also provides on-page notifications to the user.
 */
(function () {
    'use strict';

    /**
     * Extracts search results from the Google search page by trying a series of CSS selectors.
     * This approach makes the script resilient to frequent changes in Google's HTML structure.
     * @returns {Array<object>} An array of extracted search result objects. Each object includes
     * title, url, snippet, domain, position, searchQuery, timestamp, and source.
     */
    function extractGoogleResults() {
        const results = [];

        // Multiple selectors to catch different Google search result structures
        const selectors = [
            '.g', // Main result container
            '.tF2Cxc', // Alternative result container
            '.yuRUbf', // Another result container
            '[data-ved]', // Results with data-ved attribute
            '.rc', // Classic result container
            '.r', // Simple result container
            '.MjjYud', // New Google layout
            '.hlcw0c', // Another new layout
            '.g .yuRUbf', // Nested structure
            '.g .tF2Cxc' // Nested structure
        ];

        let resultElements = [];

        // Try each selector until we find results
        for (const selector of selectors) {
            resultElements = document.querySelectorAll(selector);
            if (resultElements.length > 0) {
                console.log(`Found ${resultElements.length} results using selector: ${selector}`);
                break;
            }
        }

        if (resultElements.length === 0) {
            console.log('No result containers found. Available elements:', {
                totalDivs: document.querySelectorAll('div').length,
                hasSearchResults: !!document.querySelector('#search'),
                hasMainContent: !!document.querySelector('#main'),
                pageTitle: document.title,
                pageUrl: window.location.href,
                allSelectors: selectors.map(s => ({ selector: s, count: document.querySelectorAll(s).length }))
            });
            return results;
        }

        resultElements.forEach((resultContainer, index) => {
            try {
                // Skip if this looks like an ad or non-organic result
                if (resultContainer.querySelector('[data-text-ad], .ads, .ad, [aria-label*="Ad"]')) {
                    return;
                }

                // Extract title - try multiple selectors
                const titleSelectors = ['h3', '.LC20lb', '.DKV0Md', 'a h3'];
                let title = '';
                let titleElement = null;

                for (const selector of titleSelectors) {
                    titleElement = resultContainer.querySelector(selector);
                    if (titleElement) {
                        title = titleElement.textContent.trim();
                        break;
                    }
                }

                // Extract URL - try multiple selectors
                const linkSelectors = ['a[href]', 'h3 a', '.yuRUbf a'];
                let url = '';
                let linkElement = null;

                for (const selector of linkSelectors) {
                    linkElement = resultContainer.querySelector(selector);
                    if (linkElement && linkElement.href && !linkElement.href.includes('google.com/search')) {
                        url = linkElement.href;
                        break;
                    }
                }

                // Extract snippet/description - try multiple selectors
                const snippetSelectors = ['.VwiC3b', '.s3v9rd', '.st', '.IsZvec', '.VwiC3b yXK7lf'];
                let snippet = '';

                for (const selector of snippetSelectors) {
                    const snippetElement = resultContainer.querySelector(selector);
                    if (snippetElement) {
                        snippet = snippetElement.textContent.trim();
                        break;
                    }
                }

                // Extract domain
                const domain = url ? new URL(url).hostname : '';

                // Only add if we have meaningful data
                if (title && url && !url.includes('google.com/search') && !url.includes('google.com/url')) {
                    results.push({
                        title: title,
                        url: url,
                        snippet: snippet,
                        domain: domain,
                        position: index + 1,
                        searchQuery: getCurrentSearchQuery(),
                        timestamp: new Date().toISOString(),
                        source: 'Google Search'
                    });
                }
            } catch (error) {
                console.error('Error extracting result:', error);
            }
        });

        console.log(`Extracted ${results.length} valid results from ${resultElements.length} containers`);
        return results;
    }

    /**
     * A fallback extraction method that scrapes all external links from the page.
     * This is used when the primary `extractGoogleResults` function fails to find structured results.
     * @returns {Array<object>} An array of unique search result objects found via the fallback method.
     */
    function extractGoogleResultsFallback() {
        const results = [];
        console.log('Trying fallback extraction method...');

        // Try to find any external links on the page
        const allLinks = document.querySelectorAll('a[href]');
        console.log(`Found ${allLinks.length} total links on page`);

        allLinks.forEach((link, index) => {
            try {
                const url = link.href;
                const title = link.textContent.trim() || link.title || 'No title';

                // Skip Google internal links and common non-result links
                if (url &&
                    !url.includes('google.com') &&
                    !url.includes('youtube.com/watch') &&
                    !url.includes('maps.google.com') &&
                    !url.includes('translate.google.com') &&
                    !url.includes('accounts.google.com') &&
                    url.startsWith('http') &&
                    title.length > 3) {

                    const domain = new URL(url).hostname;

                    // Skip common non-result domains
                    if (!domain.includes('google') &&
                        !domain.includes('youtube') &&
                        !domain.includes('facebook') &&
                        !domain.includes('twitter') &&
                        !domain.includes('instagram')) {

                        results.push({
                            title: title,
                            url: url,
                            snippet: '',
                            domain: domain,
                            position: results.length + 1,
                            searchQuery: getCurrentSearchQuery(),
                            timestamp: new Date().toISOString(),
                            source: 'Google Search (Fallback)'
                        });
                    }
                }
            } catch (error) {
                console.error('Error processing fallback link:', error);
            }
        });

        // Remove duplicates based on URL
        const uniqueResults = results.filter((result, index, self) =>
            index === self.findIndex(r => r.url === result.url)
        );

        console.log(`Fallback extraction found ${uniqueResults.length} unique results`);
        return uniqueResults;
    }

    /**
     * Retrieves the current search query from the search input box on the page.
     * @returns {string} The current search query.
     */
    function getCurrentSearchQuery() {
        const searchInput = document.querySelector('input[name="q"]');
        return searchInput ? searchInput.value : '';
    }

    /**
     * Saves the extracted search results to `chrome.storage.local`.
     * It appends the new results to any existing ones.
     * @param {Array<object>} results - The array of new search result objects to save.
     */
    async function saveResultsToStorage(results) {
        try {
            // Get existing results
            const stored = await chrome.storage.local.get(['searchResults']);
            const existingResults = stored.searchResults || [];

            // Add new results
            const allResults = [...existingResults, ...results];

            // Save back to storage
            await chrome.storage.local.set({ searchResults: allResults });

            console.log(`Saved ${results.length} new results. Total: ${allResults.length}`);

            // Notify background script
            chrome.runtime.sendMessage({
                type: 'RESULTS_EXTRACTED',
                count: results.length,
                total: allResults.length
            });

        } catch (error) {
            console.error('Error saving results:', error);
        }
    }

    /**
     * Orchestrates the extraction and saving process. It waits for the page to load,
     * calls the extraction function, and then saves the results. Includes a retry mechanism.
     */
    async function extractAndSave() {
        // Wait a bit for dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        const results = extractGoogleResults();
        if (results.length > 0) {
            await saveResultsToStorage(results);

            // Show notification to user
            showExtractionNotification(results.length);
        } else {
            console.log('No search results found to extract');

            // Try again after a longer delay in case content is still loading
            setTimeout(async () => {
                console.log('Retrying extraction after delay...');
                const retryResults = extractGoogleResults();
                if (retryResults.length > 0) {
                    await saveResultsToStorage(retryResults);
                    showExtractionNotification(retryResults.length);
                } else {
                    console.log('Still no results found after retry');
                }
            }, 3000);
        }
    }

    /**
     * Displays a temporary notification on the page to inform the user about the extraction.
     * @param {number} count - The number of results that were extracted.
     */
    function showExtractionNotification(count) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        notification.textContent = `Extracted ${count} search results!`;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Listens for messages from the background script or popup.
     * Handles the 'extract' action by initiating the extraction process.
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            if (request.action === 'extract') {
                console.log(`Google extraction requested for page ${request.page || 1}, query: ${request.searchQuery}`);

                // Wait a bit for dynamic content to load
                setTimeout(async () => {
                    try {
                        let results = extractGoogleResults();
                        console.log(`Extracted ${results.length} results from Google search`);

                        if (results.length === 0) {
                            console.log('No search results found with primary method, trying fallback...');
                            results = extractGoogleResultsFallback();
                        }

                        if (results.length > 0) {
                            await saveResultsToStorage(results);
                            showExtractionNotification(results.length);
                        } else {
                            console.log('No search results found with any method.');
                        }

                        sendResponse({ success: true, results: results });

                    } catch (error) {
                        console.error('Error in extraction:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                }, 1000);

                return true; // Keep message channel open for async response
            }
        } catch (error) {
            console.error('Error in content script message listener:', error);
            sendResponse({ success: false, error: error.message });
        }
    });

    /**
     * Sets up a MutationObserver to detect when search results are dynamically added to the page.
     * This is important for single-page applications where content changes without a full page reload.
     * @returns {MutationObserver} The configured observer instance.
     */
    function setupMutationObserver() {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };

        const callback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // Check if search results are present
                    const results = document.querySelectorAll('.g, .tF2Cxc, .yuRUbf');
                    if (results.length > 0) {
                        console.log('Search results detected via MutationObserver');
                        // Don't disconnect, keep observing for more results
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);

        return observer;
    }

    // Initialize observer when the script loads.
    let mutationObserver = null;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            mutationObserver = setupMutationObserver();
        });
    } else {
        mutationObserver = setupMutationObserver();
    }

    console.log('Google Search Results Extractor loaded');
})();