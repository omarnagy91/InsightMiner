/**
 * @file content-github.js
 * @description This content script is injected into GitHub pages. It is responsible for
 * extracting data from various page types, including issues, pull requests, discussions,
 * and releases. It identifies the page type and uses the appropriate extractor to
 * gather relevant information and sends it to the background script.
 */
(function() {
    'use strict';

    console.log('GitHub content script loaded');

    /**
     * Listens for messages from the background script.
     * When an 'extractGitHubData' action is received, it triggers the data extraction process.
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractGitHubData') {
            try {
                const data = extractGitHubData(request.extractComments, request.extractMetadata);
                sendResponse({ success: true, data: data });
            } catch (error) {
                console.error('Error extracting GitHub data:', error);
                sendResponse({ success: false, error: error.message });
            }
        }
    });

    /**
     * Orchestrates the extraction of data from a GitHub page.
     * It determines the type of page (issue, PR, discussion, etc.) based on the URL
     * and calls the corresponding extraction function.
     * @param {boolean} [extractComments=true] - Whether to extract comments and discussions.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like labels, reactions, and dates.
     * @returns {object} An object containing all the extracted data from the page.
     */
    function extractGitHubData(extractComments = true, extractMetadata = true) {
        const data = {
            platform: 'github',
            url: window.location.href,
            extractedAt: new Date().toISOString()
        };

        // Determine the type of GitHub page
        if (window.location.pathname.includes('/issues/')) {
            data.type = 'issue';
            data.issue = extractIssue(extractMetadata);
            if (extractComments) {
                data.comments = extractIssueComments(extractMetadata);
            }
        } else if (window.location.pathname.includes('/pull/')) {
            data.type = 'pull_request';
            data.pullRequest = extractPullRequest(extractMetadata);
            if (extractComments) {
                data.comments = extractPullRequestComments(extractMetadata);
            }
        } else if (window.location.pathname.includes('/discussions/')) {
            data.type = 'discussion';
            data.discussion = extractDiscussion(extractMetadata);
            if (extractComments) {
                data.comments = extractDiscussionComments(extractMetadata);
            }
        } else if (window.location.pathname.includes('/releases/')) {
            data.type = 'release';
            data.release = extractRelease(extractMetadata);
            if (extractComments) {
                data.comments = extractReleaseComments(extractMetadata);
            }
        } else {
            // Generic repository page
            data.type = 'repository';
            data.repository = extractRepositoryInfo(extractMetadata);
        }

        return data;
    }

    /**
     * Extracts data from a GitHub issue page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like issue number, date, and reactions.
     * @returns {object|null} The extracted issue object, or null on error.
     */
    function extractIssue(extractMetadata = true) {
        try {
            const title = document.querySelector('.js-issue-title')?.textContent?.trim();
            const content = document.querySelector('.comment-body')?.textContent?.trim();
            const author = document.querySelector('.timeline-comment-header .author')?.textContent?.trim();
            const state = document.querySelector('.State')?.textContent?.trim();
            const labels = Array.from(document.querySelectorAll('.IssueLabel')).map(label => label.textContent.trim());

            const issue = {
                title: title || '',
                content: content || '',
                author: author || '',
                state: state || '',
                labels: labels || []
            };

            if (extractMetadata) {
                const number = document.querySelector('.gh-header-number')?.textContent?.trim();
                const date = document.querySelector('relative-time')?.getAttribute('datetime');
                const reactions = extractReactions();

                issue.metadata = {
                    number: number || '',
                    date: date || '',
                    reactions: reactions,
                    url: window.location.href
                };
            }

            return issue;
        } catch (error) {
            console.error('Error extracting issue:', error);
            return null;
        }
    }

    /**
     * Extracts data from a GitHub pull request page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like PR number, date, and reactions.
     * @returns {object|null} The extracted pull request object, or null on error.
     */
    function extractPullRequest(extractMetadata = true) {
        try {
            const title = document.querySelector('.js-issue-title')?.textContent?.trim();
            const content = document.querySelector('.comment-body')?.textContent?.trim();
            const author = document.querySelector('.timeline-comment-header .author')?.textContent?.trim();
            const state = document.querySelector('.State')?.textContent?.trim();
            const labels = Array.from(document.querySelectorAll('.IssueLabel')).map(label => label.textContent.trim());

            const pullRequest = {
                title: title || '',
                content: content || '',
                author: author || '',
                state: state || '',
                labels: labels || []
            };

            if (extractMetadata) {
                const number = document.querySelector('.gh-header-number')?.textContent?.trim();
                const date = document.querySelector('relative-time')?.getAttribute('datetime');
                const reactions = extractReactions();

                pullRequest.metadata = {
                    number: number || '',
                    date: date || '',
                    reactions: reactions,
                    url: window.location.href
                };
            }

            return pullRequest;
        } catch (error) {
            console.error('Error extracting pull request:', error);
            return null;
        }
    }

    /**
     * Extracts data from a GitHub discussion page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like date and reactions.
     * @returns {object|null} The extracted discussion object, or null on error.
     */
    function extractDiscussion(extractMetadata = true) {
        try {
            const title = document.querySelector('.js-discussion-title')?.textContent?.trim();
            const content = document.querySelector('.comment-body')?.textContent?.trim();
            const author = document.querySelector('.timeline-comment-header .author')?.textContent?.trim();
            const category = document.querySelector('.discussion-sidebar-item .discussion-category')?.textContent?.trim();

            const discussion = {
                title: title || '',
                content: content || '',
                author: author || '',
                category: category || ''
            };

            if (extractMetadata) {
                const date = document.querySelector('relative-time')?.getAttribute('datetime');
                const reactions = extractReactions();

                discussion.metadata = {
                    date: date || '',
                    reactions: reactions,
                    url: window.location.href
                };
            }

            return discussion;
        } catch (error) {
            console.error('Error extracting discussion:', error);
            return null;
        }
    }

    /**
     * Extracts data from a GitHub release page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like date and reactions.
     * @returns {object|null} The extracted release object, or null on error.
     */
    function extractRelease(extractMetadata = true) {
        try {
            const title = document.querySelector('.release-header h1')?.textContent?.trim();
            const content = document.querySelector('.release-body')?.textContent?.trim();
            const author = document.querySelector('.release-header .author')?.textContent?.trim();
            const tag = document.querySelector('.release-header .tag')?.textContent?.trim();

            const release = {
                title: title || '',
                content: content || '',
                author: author || '',
                tag: tag || ''
            };

            if (extractMetadata) {
                const date = document.querySelector('relative-time')?.getAttribute('datetime');
                const reactions = extractReactions();

                release.metadata = {
                    date: date || '',
                    reactions: reactions,
                    url: window.location.href
                };
            }

            return release;
        } catch (error) {
            console.error('Error extracting release:', error);
            return null;
        }
    }

    /**
     * Extracts general information from a GitHub repository page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like stars, forks, and language.
     * @returns {object|null} The extracted repository info object, or null on error.
     */
    function extractRepositoryInfo(extractMetadata = true) {
        try {
            const name = document.querySelector('.repository-content .AppHeader-context-item-label')?.textContent?.trim();
            const description = document.querySelector('.repository-content .AppHeader-context-item-body')?.textContent?.trim();
            const owner = document.querySelector('.AppHeader-context-item-label')?.textContent?.trim();

            const repository = {
                name: name || '',
                description: description || '',
                owner: owner || ''
            };

            if (extractMetadata) {
                const stars = document.querySelector('#repo-stars-counter-star')?.textContent?.trim();
                const forks = document.querySelector('#repo-network-counter')?.textContent?.trim();
                const language = document.querySelector('.repository-content .AppHeader-context-item-body')?.textContent?.trim();

                repository.metadata = {
                    stars: stars || '',
                    forks: forks || '',
                    language: language || '',
                    url: window.location.href
                };
            }

            return repository;
        } catch (error) {
            console.error('Error extracting repository info:', error);
            return null;
        }
    }

    /**
     * Extracts all comments from a GitHub issue page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata like date and reactions for each comment.
     * @returns {Array<object>} An array of comment objects.
     */
    function extractIssueComments(extractMetadata = true) {
        try {
            const commentElements = document.querySelectorAll('.timeline-comment');
            const comments = [];

            commentElements.forEach((commentElement, index) => {
                const content = commentElement.querySelector('.comment-body')?.textContent?.trim();
                const author = commentElement.querySelector('.timeline-comment-header .author')?.textContent?.trim();

                if (content) {
                    const comment = {
                        content: content,
                        author: author || '',
                        order: index + 1
                    };

                    if (extractMetadata) {
                        const date = commentElement.querySelector('relative-time')?.getAttribute('datetime');
                        const reactions = extractReactions(commentElement);

                        comment.metadata = {
                            date: date || '',
                            reactions: reactions
                        };
                    }

                    comments.push(comment);
                }
            });

            return comments;
        } catch (error) {
            console.error('Error extracting issue comments:', error);
            return [];
        }
    }

    /**
     * Extracts all comments from a GitHub pull request page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata for each comment.
     * @returns {Array<object>} An array of comment objects.
     */
    function extractPullRequestComments(extractMetadata = true) {
        // The structure is similar to issue comments.
        return extractIssueComments(extractMetadata);
    }

    /**
     * Extracts all comments from a GitHub discussion page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata for each comment.
     * @returns {Array<object>} An array of comment objects.
     */
    function extractDiscussionComments(extractMetadata = true) {
        // The structure is similar to issue comments.
        return extractIssueComments(extractMetadata);
    }

    /**
     * Extracts all comments from a GitHub release page.
     * @param {boolean} [extractMetadata=true] - Whether to extract metadata for each comment.
     * @returns {Array<object>} An array of comment objects.
     */
    function extractReleaseComments(extractMetadata = true) {
        // The structure is similar to issue comments.
        return extractIssueComments(extractMetadata);
    }

    /**
     * Extracts reaction data (emojis and counts) from a given element.
     * @param {Element} [element=document] - The parent element to search within for reactions. Defaults to the whole document.
     * @returns {object} An object where keys are emojis and values are their counts.
     */
    function extractReactions(element = document) {
        try {
            const reactionElements = element.querySelectorAll('.reaction-summary-item');
            const reactions = {};

            reactionElements.forEach(reaction => {
                const emoji = reaction.querySelector('.emoji')?.textContent?.trim();
                const count = reaction.querySelector('.reaction-count')?.textContent?.trim();
                if (emoji && count) {
                    reactions[emoji] = parseInt(count, 10) || 0;
                }
            });

            return reactions;
        } catch (error) {
            console.error('Error extracting reactions:', error);
            return {};
        }
    }
})();