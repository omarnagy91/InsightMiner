/**
 * @file content-medium.js
 * @description This content script is injected into Medium.com article pages.
 * It is responsible for extracting data from articles and their responses (comments),
 * and sending this structured information back to the background script for analysis.
 */
(function() {
    'use strict';

    console.log('Medium content script loaded');

    /**
     * Listens for messages from the background script.
     * When an 'extractMediumData' action is received, it triggers the data extraction process.
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractMediumData') {
            try {
                const data = extractMediumData(request.extractComments, request.extractMetadata);
                sendResponse({ success: true, data: data });
            } catch (error) {
                console.error('Error extracting Medium data:', error);
                sendResponse({ success: false, error: error.message });
            }
        }
    });

    /**
     * Orchestrates the extraction of data from a Medium page.
     * It calls functions to extract the main article and its responses.
     * @param {boolean} [extractComments=true] - Whether to extract responses (comments).
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like dates and clap counts.
     * @returns {object} An object containing all the extracted data from the page.
     */
    function extractMediumData(extractComments = true, extractMetadata = true) {
        const data = {
            platform: 'medium',
            url: window.location.href,
            extractedAt: new Date().toISOString()
        };

        // Extract article data
        const article = extractArticle(extractMetadata);
        if (article) {
            data.article = article;
        }

        // Extract responses (Medium's equivalent of comments) if requested
        if (extractComments) {
            const responses = extractResponses(extractMetadata);
            if (responses && responses.length > 0) {
                data.responses = responses;
            }
        }

        return data;
    }

    /**
     * Extracts the main article content from the page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like publish date, reading time, and claps.
     * @returns {object|null} The extracted article object, or null on error.
     */
    function extractArticle(extractMetadata = true) {
        try {
            const title = document.querySelector('h1')?.textContent?.trim();
            const content = document.querySelector('article')?.textContent?.trim() ||
                document.querySelector('.postArticle-content')?.textContent?.trim();
            const author = document.querySelector('a[href^="/@"]')?.textContent?.trim() ||
                document.querySelector('.ds-link')?.textContent?.trim();
            const publication = document.querySelector('a[data-testid="publicationName"]')?.textContent?.trim();

            const article = {
                title: title || '',
                content: content || '',
                author: author || '',
                publication: publication || ''
            };

            if (extractMetadata) {
                const publishedDate = document.querySelector('time')?.getAttribute('datetime');
                const readingTime = document.querySelector('span[title*="min read"]')?.textContent?.trim();
                const claps = document.querySelector('button[data-testid="claps-button"] span')?.textContent?.trim();
                const responsesCount = document.querySelector('a[href*="/responses"]')?.textContent?.trim().split(' ')[0];

                article.metadata = {
                    publishedDate: publishedDate || '',
                    readingTime: readingTime || '',
                    claps: claps || '',
                    responsesCount: responsesCount || '',
                    url: window.location.href
                };
            }

            return article;
        } catch (error) {
            console.error('Error extracting article:', error);
            return null;
        }
    }

    /**
     * Extracts all responses (comments) from the article page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata for each response, like date and claps.
     * @returns {Array<object>} An array of response objects.
     */
    function extractResponses(extractMetadata = true) {
        try {
            const responseElements = document.querySelectorAll('.pw-post-body');
            const responses = [];

            responseElements.forEach((responseElement, index) => {
                const content = responseElement.textContent?.trim();
                const author = responseElement.closest('article')?.querySelector('a[href^="/@"]')?.textContent?.trim();

                if (content) {
                    const response = {
                        content: content,
                        author: author || '',
                        order: index + 1
                    };

                    if (extractMetadata) {
                        const date = responseElement.closest('article')?.querySelector('time')?.getAttribute('datetime');
                        const claps = responseElement.closest('article')?.querySelector('button[data-testid="claps-button"] span')?.textContent?.trim();

                        response.metadata = {
                            date: date || '',
                            claps: claps || ''
                        };
                    }

                    responses.push(response);
                }
            });

            return responses;
        } catch (error) {
            console.error('Error extracting responses:', error);
            return [];
        }
    }
})();