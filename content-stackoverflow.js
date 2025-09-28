/**
 * @file content-stackoverflow.js
 * @description This content script is injected into Stack Overflow question pages.
 * It is responsible for extracting the question, answers, and comments from the page
 * and sending this structured data back to the background script for analysis.
 */
(function() {
    'use strict';

    console.log('Stack Overflow content script loaded');

    /**
     * Listens for messages from the background script.
     * When an 'extractStackOverflowData' action is received, it triggers the data extraction process.
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractStackOverflowData') {
            try {
                const data = extractStackOverflowData(request.extractComments, request.extractMetadata);
                sendResponse({ success: true, data: data });
            } catch (error) {
                console.error('Error extracting Stack Overflow data:', error);
                sendResponse({ success: false, error: error.message });
            }
        }
    });

    /**
     * Orchestrates the extraction of all relevant data from a Stack Overflow page.
     * It calls specific functions to extract the question, answers, and comments.
     * @param {boolean} [extractComments=true] - Whether to extract answers and comments.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like scores and dates.
     * @returns {object} An object containing all the extracted data from the page.
     */
    function extractStackOverflowData(extractComments = true, extractMetadata = true) {
        const data = {
            platform: 'stackoverflow',
            url: window.location.href,
            extractedAt: new Date().toISOString()
        };

        // Extract question data
        const question = extractQuestion(extractMetadata);
        if (question) {
            data.question = question;
        }

        // Extract answers if requested
        if (extractComments) {
            const answers = extractAnswers(extractMetadata);
            if (answers && answers.length > 0) {
                data.answers = answers;
            }
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
     * Extracts the main question from the page, including its title, content, author, and tags.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like score, views, and date.
     * @returns {object|null} The extracted question object, or null if the question cannot be found.
     */
    function extractQuestion(extractMetadata = true) {
        try {
            const questionElement = document.querySelector('#question');
            if (!questionElement) return null;

            const title = document.querySelector('h1[data-cy="question-title"]')?.textContent?.trim();
            const content = questionElement.querySelector('.s-prose')?.textContent?.trim();
            const author = questionElement.querySelector('.user-details a')?.textContent?.trim();
            const tags = Array.from(document.querySelectorAll('.post-tag')).map(tag => tag.textContent.trim());

            const question = {
                title: title || '',
                content: content || '',
                author: author || '',
                tags: tags || []
            };

            if (extractMetadata) {
                const score = questionElement.querySelector('.js-vote-count')?.textContent?.trim();
                const views = document.querySelector('.s-badge__label')?.textContent?.trim();
                const date = questionElement.querySelector('.user-action-time time')?.getAttribute('datetime');

                question.metadata = {
                    score: score ? parseInt(score, 10) : 0,
                    views: views || '',
                    date: date || '',
                    url: window.location.href
                };
            }

            return question;
        } catch (error) {
            console.error('Error extracting question:', error);
            return null;
        }
    }

    /**
     * Extracts all answers from the page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata for each answer, like score and date.
     * @returns {Array<object>} An array of answer objects.
     */
    function extractAnswers(extractMetadata = true) {
        try {
            const answerElements = document.querySelectorAll('.answer');
            const answers = [];

            answerElements.forEach((answerElement, index) => {
                const content = answerElement.querySelector('.s-prose')?.textContent?.trim();
                const author = answerElement.querySelector('.user-details a')?.textContent?.trim();
                const isAccepted = answerElement.classList.contains('accepted-answer');

                if (content) {
                    const answer = {
                        content: content,
                        author: author || '',
                        isAccepted: isAccepted,
                        order: index + 1
                    };

                    if (extractMetadata) {
                        const score = answerElement.querySelector('.js-vote-count')?.textContent?.trim();
                        const date = answerElement.querySelector('.user-action-time time')?.getAttribute('datetime');

                        answer.metadata = {
                            score: score ? parseInt(score, 10) : 0,
                            date: date || ''
                        };
                    }

                    answers.push(answer);
                }
            });

            return answers;
        } catch (error) {
            console.error('Error extracting answers:', error);
            return [];
        }
    }

    /**
     * Extracts all comments from the page, both on the question and on the answers.
     * @returns {Array<object>} An array of comment objects.
     */
    function extractAllComments() {
        try {
            const commentElements = document.querySelectorAll('.comment');
            const comments = [];

            commentElements.forEach((commentElement, index) => {
                const content = commentElement.querySelector('.comment-copy')?.textContent?.trim();
                const author = commentElement.querySelector('.comment-user')?.textContent?.trim();

                if (content) {
                    const comment = {
                        content: content,
                        author: author || '',
                        order: index + 1
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
})();