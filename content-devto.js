/**
 * @file content-devto.js
 * @description This content script is injected into Dev.to article pages.
 * It is responsible for extracting data from articles and their comments,
 * and sending this information back to the background script for analysis.
 */
(function() {
    'use strict';

    console.log('Dev.to content script loaded');

    /**
     * Listens for messages from the background script.
     * When an 'extractDevToData' action is received, it triggers the data extraction process.
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractDevToData') {
            try {
                const data = extractDevToData(request.extractComments, request.extractMetadata);
                sendResponse({ success: true, data: data });
            } catch (error) {
                console.error('Error extracting Dev.to data:', error);
                sendResponse({ success: false, error: error.message });
            }
        }
    });

    /**
     * Orchestrates the extraction of data from a Dev.to page.
     * It calls functions to extract the main article and its comments.
     * @param {boolean} [extractComments=true] - Whether to extract comments.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like dates and reactions.
     * @returns {object} An object containing all the extracted data from the page.
     */
    function extractDevToData(extractComments = true, extractMetadata = true) {
        const data = {
            platform: 'devto',
            url: window.location.href,
            extractedAt: new Date().toISOString()
        };

        // Extract article data
        const article = extractArticle(extractMetadata);
        if (article) {
            data.article = article;
        }

        // Extract comments if requested
        if (extractComments) {
            const comments = extractAllComments();
            if (comments && comments.length > 0) {
                data.comments = comments;
            }
        }

        return data;
    }

    /**
     * Extracts the main article content from the page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like publish date, reading time, and reactions.
     * @returns {object|null} The extracted article object, or null on error.
     */
    function extractArticle(extractMetadata = true) {
        try {
            const title = document.querySelector('h1')?.textContent?.trim();
            const content = document.querySelector('#article-body')?.textContent?.trim() ||
                document.querySelector('.crayons-article__main')?.textContent?.trim();
            const author = document.querySelector('.crayons-article__subheader .crayons-link')?.textContent?.trim();
            const tags = Array.from(document.querySelectorAll('.crayons-tag')).map(tag => tag.textContent.trim());

            const article = {
                title: title || '',
                content: content || '',
                author: author || '',
                tags: tags || []
            };

            if (extractMetadata) {
                const publishedDate = document.querySelector('time')?.getAttribute('datetime');
                const readingTime = document.querySelector('.crayons-article__subheader .crayons-link')?.textContent?.trim();
                const reactions = extractReactions();
                const commentsCount = document.querySelector('.crayons-article__subheader .crayons-link')?.textContent?.trim();

                article.metadata = {
                    publishedDate: publishedDate || '',
                    readingTime: readingTime || '',
                    reactions: reactions,
                    commentsCount: commentsCount || '',
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
     * Extracts all comments from the article page.
     * @returns {Array<object>} An array of comment objects.
     */
    function extractAllComments() {
        try {
            const commentElements = document.querySelectorAll('.comment__root, .comment-thread');
            const comments = [];

            commentElements.forEach((commentElement, index) => {
                const content = commentElement.querySelector('.comment__body, .crayons-comment__body')?.textContent?.trim();
                const author = commentElement.querySelector('.comment__author, .crayons-comment__author-name')?.textContent?.trim();

                if (content) {
                    const comment = {
                        content: content,
                        author: author || '',
                        order: index + 1
                    };

                    // Try to extract comment metadata
                    const date = commentElement.querySelector('time')?.getAttribute('datetime');
                    const reactions = extractCommentReactions(commentElement);

                    comment.metadata = {
                        date: date || '',
                        reactions: reactions
                    };

                    comments.push(comment);
                }
            });

            return comments;
        } catch (error) {
            console.error('Error extracting comments:', error);
            return [];
        }
    }

    /**
     * Extracts reaction data (emojis and counts) for the main article.
     * @returns {object} An object where keys are reaction types and values are their counts.
     */
    function extractReactions() {
        try {
            const reactionElements = document.querySelectorAll('#reactions-container button');
            const reactions = {};

            reactionElements.forEach(reaction => {
                const reactionType = reaction.dataset.reaction;
                const count = reaction.querySelector('.reaction-count-count')?.textContent?.trim();
                if (reactionType && count) {
                    reactions[reactionType] = parseInt(count, 10) || 0;
                }
            });

            return reactions;
        } catch (error) {
            console.error('Error extracting reactions:', error);
            return {};
        }
    }

    /**
     * Extracts reaction data for a specific comment element.
     * @param {Element} commentElement - The parent comment element to search within for reactions.
     * @returns {object} An object where keys are reaction types and values are their counts.
     */
    function extractCommentReactions(commentElement) {
        try {
            const reactionElements = commentElement.querySelectorAll('.crayons-reaction-button');
            const reactions = {};

            reactionElements.forEach(reaction => {
                const reactionType = reaction.dataset.reaction;
                const count = reaction.querySelector('.crayons-reaction-button__count')?.textContent?.trim();
                if (reactionType && count) {
                    reactions[reactionType] = parseInt(count, 10) || 0;
                }
            });

            return reactions;
        } catch (error) {
            console.error('Error extracting comment reactions:', error);
            return {};
        }
    }
})();