/**
 * @file content-reddit.js
 * @description This content script is injected into Reddit pages. It is responsible for
 * extracting data from posts and comments, handling various Reddit layouts (old and new),
 * and sending the extracted data back to the background script for processing and storage.
 */
(function () {
    'use strict';

    /**
     * Extracts all visible Reddit posts on the current page.
     * It uses a list of selectors to be resilient to changes in Reddit's DOM structure.
     * @returns {Array<object>} An array of post objects, each containing details like title,
     * content, author, score, etc.
     */
    function extractRedditPosts() {
        const posts = [];

        // Selector for Reddit posts - using new Reddit structure
        const postElements = document.querySelectorAll('shreddit-post, [data-testid="post-container"], .Post');

        postElements.forEach((element, index) => {
            try {
                // Extract post title - using new Reddit structure
                const titleSelectors = [
                    'h1[id*="post-title"]',
                    '[slot="title"]',
                    '[data-testid="post-title"]',
                    'h1',
                    'h3',
                    '.title'
                ];

                let title = '';
                for (const selector of titleSelectors) {
                    const titleElement = element.querySelector(selector);
                    if (titleElement) {
                        title = titleElement.textContent.trim();
                        break;
                    }
                }

                // Extract post content/selftext - using new Reddit structure
                const contentSelectors = [
                    '[slot="text-body"] .md',
                    '[slot="text-body"]',
                    '[data-testid="post-content"]',
                    '.usertext-body',
                    '.md'
                ];

                let content = '';
                for (const selector of contentSelectors) {
                    const contentElement = element.querySelector(selector);
                    if (contentElement) {
                        content = contentElement.textContent.trim();
                        break;
                    }
                }

                // Extract author - using new Reddit structure
                const authorSelectors = [
                    '.author-name',
                    '[data-testid="post-author"]',
                    '.author',
                    '.username'
                ];

                let author = '';
                for (const selector of authorSelectors) {
                    const authorElement = element.querySelector(selector);
                    if (authorElement) {
                        author = authorElement.textContent.trim();
                        break;
                    }
                }

                // Extract subreddit - using new Reddit structure
                const subredditSelectors = [
                    '.subreddit-name',
                    '[data-testid="subreddit-name"]',
                    '.subreddit'
                ];

                let subreddit = '';
                for (const selector of subredditSelectors) {
                    const subredditElement = element.querySelector(selector);
                    if (subredditElement) {
                        subreddit = subredditElement.textContent.trim();
                        break;
                    }
                }

                // Extract score/upvotes - using new Reddit structure
                const scoreSelectors = [
                    '[data-testid="vote-arrows"]',
                    '.score',
                    '.upvotes'
                ];

                let score = '';
                for (const selector of scoreSelectors) {
                    const scoreElement = element.querySelector(selector);
                    if (scoreElement) {
                        score = scoreElement.textContent.trim();
                        break;
                    }
                }

                // Extract timestamp - using new Reddit structure
                const timeSelectors = [
                    'faceplate-timeago time',
                    'time[datetime]',
                    '[data-testid="post-timestamp"]'
                ];

                let timestamp = '';
                for (const selector of timeSelectors) {
                    const timeElement = element.querySelector(selector);
                    if (timeElement) {
                        timestamp = timeElement.getAttribute('datetime') || timeElement.textContent.trim();
                        break;
                    }
                }

                // Extract URL
                const linkElement = element.querySelector('a[href*="/r/"]');
                const url = linkElement ? linkElement.href : window.location.href;

                // Extract post flair
                const flairSelectors = [
                    '[slot="post-flair"] .flair-content',
                    '.flair',
                    '.post-flair'
                ];

                let flair = '';
                for (const selector of flairSelectors) {
                    const flairElement = element.querySelector(selector);
                    if (flairElement) {
                        flair = flairElement.textContent.trim();
                        break;
                    }
                }

                // Extract post type
                const postType = element.getAttribute('post-type') || 'unknown';

                // Extract comment count
                const commentCount = element.getAttribute('comment-count') || '0';

                if (title) {
                    posts.push({
                        title: title,
                        content: content,
                        author: author,
                        subreddit: subreddit,
                        score: score,
                        timestamp: timestamp,
                        flair: flair,
                        postType: postType,
                        commentCount: commentCount,
                        url: url,
                        position: index + 1,
                        type: 'post',
                        source: 'Reddit',
                        extractedAt: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('Error extracting Reddit post:', error);
            }
        });

        return posts;
    }

    /**
     * Extracts all visible comments on the current Reddit page.
     * It uses a list of selectors to handle different Reddit DOM structures.
     * @returns {Array<object>} An array of comment objects, each with content, author, score, etc.
     */
    function extractRedditComments() {
        const comments = [];

        // Selector for Reddit comments - using new Reddit structure
        const commentElements = document.querySelectorAll('shreddit-comment, [data-testid="comment"], .Comment');

        commentElements.forEach((element, index) => {
            try {
                // Extract comment content - using new Reddit structure
                const contentSelectors = [
                    '[slot="comment"] .md',
                    '[slot="comment"]',
                    '[data-testid="comment-content"]',
                    '.usertext-body',
                    '.md'
                ];

                let content = '';
                for (const selector of contentSelectors) {
                    const contentElement = element.querySelector(selector);
                    if (contentElement) {
                        content = contentElement.textContent.trim();
                        break;
                    }
                }

                // Extract author - using new Reddit structure
                const authorSelectors = [
                    '.author-name-meta .author-name',
                    '[data-testid="comment-author"]',
                    '.author',
                    '.username'
                ];

                let author = '';
                for (const selector of authorSelectors) {
                    const authorElement = element.querySelector(selector);
                    if (authorElement) {
                        author = authorElement.textContent.trim();
                        break;
                    }
                }

                // Extract score - using new Reddit structure
                const scoreSelectors = [
                    '[data-testid="vote-arrows"]',
                    '.score',
                    '.upvotes'
                ];

                let score = '';
                for (const selector of scoreSelectors) {
                    const scoreElement = element.querySelector(selector);
                    if (scoreElement) {
                        score = scoreElement.textContent.trim();
                        break;
                    }
                }

                // Extract timestamp - using new Reddit structure
                const timeSelectors = [
                    'faceplate-timeago time',
                    'time[datetime]',
                    '[data-testid="comment-timestamp"]'
                ];

                let timestamp = '';
                for (const selector of timeSelectors) {
                    const timeElement = element.querySelector(selector);
                    if (timeElement) {
                        timestamp = timeElement.getAttribute('datetime') || timeElement.textContent.trim();
                        break;
                    }
                }

                // Extract comment depth/level
                const depth = element.getAttribute('depth') || '0';

                // Extract comment ID
                const commentId = element.getAttribute('thingid') || element.getAttribute('comment-id') || '';

                // Extract parent comment ID if it's a reply
                const parentId = element.getAttribute('parentid') || '';

                // Extract permalink
                const permalink = element.getAttribute('permalink') || '';

                if (content && content.length > 10) { // Only include substantial comments
                    comments.push({
                        content: content,
                        author: author,
                        score: score,
                        timestamp: timestamp,
                        depth: depth,
                        commentId: commentId,
                        parentId: parentId,
                        permalink: permalink,
                        position: index + 1,
                        type: 'comment',
                        source: 'Reddit',
                        extractedAt: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('Error extracting Reddit comment:', error);
            }
        });

        return comments;
    }

    /**
     * Saves the extracted posts and comments to `chrome.storage.local`.
     * It appends the new data to any existing search results.
     * @param {Array<object>} posts - An array of extracted post objects.
     * @param {Array<object>} comments - An array of extracted comment objects.
     */
    async function saveResultsToStorage(posts, comments) {
        try {
            // Get existing results
            const stored = await chrome.storage.local.get(['searchResults']);
            const existingResults = stored.searchResults || [];

            // Add new results
            const allResults = [...existingResults, ...posts, ...comments];

            // Save back to storage
            await chrome.storage.local.set({ searchResults: allResults });

            console.log(`Saved ${posts.length} posts and ${comments.length} comments. Total: ${allResults.length}`);

            // Notify background script
            chrome.runtime.sendMessage({
                type: 'RESULTS_EXTRACTED',
                count: posts.length + comments.length,
                total: allResults.length
            });

        } catch (error) {
            console.error('Error saving Reddit results:', error);
        }
    }

    /**
     * Orchestrates the extraction and saving process for Reddit content.
     */
    async function extractAndSave() {
        const posts = extractRedditPosts();
        const comments = extractRedditComments();

        if (posts.length > 0 || comments.length > 0) {
            await saveResultsToStorage(posts, comments);

            // Show notification to user
            showExtractionNotification(posts.length, comments.length);
        } else {
            console.log('No Reddit content found to extract');
        }
    }

    /**
     * Extracts data from the current Reddit page, including the main post and its comments.
     * This function is typically called by the background script.
     * @param {boolean} [extractComments=true] - Whether to extract comments along with the post.
     * @returns {Promise<object>} A promise that resolves to an object containing the extracted post and comments.
     */
    async function extractRedditData(extractComments = true) {
        const post = extractSingleRedditPost();
        const comments = extractComments ? extractRedditComments() : [];

        // Debug logging
        console.log('Reddit Extraction Debug:');
        console.log('Post extracted:', post);
        console.log('Comments extracted:', comments.length);
        console.log('Comments:', comments);

        return {
            post: post,
            comments: comments
        };
    }

    /**
     * Extracts the data for the single main post on the current page.
     * @returns {object|null} The extracted post object, or null if no post is found.
     */
    function extractSingleRedditPost() {
        try {
            // Try to find the main post content using new Reddit selectors
            const postSelectors = [
                'shreddit-post',
                '[data-testid="post-container"]',
                '.Post',
                '[data-click-id="body"]',
                '.thing[data-type="link"]'
            ];

            let postElement = null;
            let foundSelector = '';
            for (const selector of postSelectors) {
                postElement = document.querySelector(selector);
                if (postElement) {
                    foundSelector = selector;
                    break;
                }
            }

            console.log('Post element search - Found selector:', foundSelector);
            console.log('Post element:', postElement);

            if (!postElement) {
                console.log('No post element found with any selector');
                return null;
            }

            // Extract post title - using new Reddit structure
            const titleSelectors = [
                'h1[id*="post-title"]',
                '[slot="title"]',
                '[data-testid="post-title"]',
                'h1',
                '.title',
                'a[data-click-id="body"]'
            ];

            let title = '';
            let foundTitleSelector = '';
            for (const selector of titleSelectors) {
                const titleElement = postElement.querySelector(selector);
                if (titleElement) {
                    title = titleElement.textContent.trim();
                    foundTitleSelector = selector;
                    break;
                }
            }

            console.log('Title extraction - Found selector:', foundTitleSelector);
            console.log('Title extracted:', title);

            // Extract post content/selftext - using new Reddit structure
            const contentSelectors = [
                '[slot="text-body"] .md',
                '[slot="text-body"]',
                '[data-testid="post-content"]',
                '.usertext-body',
                '.md',
                '.expando',
                '.selftext'
            ];

            let content = '';
            for (const selector of contentSelectors) {
                const contentElement = postElement.querySelector(selector);
                if (contentElement) {
                    content = contentElement.textContent.trim();
                    break;
                }
            }

            // Extract author - using new Reddit structure
            const authorSelectors = [
                '.author-name',
                '[data-testid="post-author"]',
                '.author',
                '.username',
                'a[href*="/user/"]'
            ];

            let author = '';
            for (const selector of authorSelectors) {
                const authorElement = postElement.querySelector(selector);
                if (authorElement) {
                    author = authorElement.textContent.trim();
                    break;
                }
            }

            // Extract subreddit - using new Reddit structure
            const subredditSelectors = [
                '.subreddit-name',
                '[data-testid="subreddit-name"]',
                '.subreddit',
                'a[href*="/r/"]'
            ];

            let subreddit = '';
            for (const selector of subredditSelectors) {
                const subredditElement = postElement.querySelector(selector);
                if (subredditElement) {
                    subreddit = subredditElement.textContent.trim();
                    break;
                }
            }

            // Extract score/upvotes - using new Reddit structure
            const scoreSelectors = [
                '[data-testid="vote-arrows"]',
                '.score',
                '.upvotes',
                '.score-unvoted'
            ];

            let score = '';
            for (const selector of scoreSelectors) {
                const scoreElement = postElement.querySelector(selector);
                if (scoreElement) {
                    score = scoreElement.textContent.trim();
                    break;
                }
            }

            // Extract timestamp - using new Reddit structure
            const timeSelectors = [
                'faceplate-timeago time',
                'time[datetime]',
                '[data-testid="post-timestamp"]',
                '.live-timestamp'
            ];

            let timestamp = '';
            for (const selector of timeSelectors) {
                const timeElement = postElement.querySelector(selector);
                if (timeElement) {
                    timestamp = timeElement.getAttribute('datetime') || timeElement.textContent.trim();
                    break;
                }
            }

            // Extract post flair
            const flairSelectors = [
                '[slot="post-flair"] .flair-content',
                '.flair',
                '.post-flair'
            ];

            let flair = '';
            for (const selector of flairSelectors) {
                const flairElement = postElement.querySelector(selector);
                if (flairElement) {
                    flair = flairElement.textContent.trim();
                    break;
                }
            }

            // Extract post type (image, text, link, etc.)
            const postType = postElement.getAttribute('post-type') || 'unknown';

            // Extract comment count
            const commentCount = postElement.getAttribute('comment-count') || '0';

            // Extract URL
            const url = window.location.href;

            // Extract media/image URLs if present
            const mediaSelectors = [
                '[slot="post-media-container"] img',
                '.post-media img',
                '.media img'
            ];

            let mediaUrls = [];
            for (const selector of mediaSelectors) {
                const mediaElements = postElement.querySelectorAll(selector);
                mediaElements.forEach(img => {
                    if (img.src && !img.src.includes('avatar') && !img.src.includes('icon')) {
                        mediaUrls.push(img.src);
                    }
                });
            }

            return {
                title: title,
                content: content,
                author: author,
                subreddit: subreddit,
                score: score,
                timestamp: timestamp,
                flair: flair,
                postType: postType,
                commentCount: commentCount,
                mediaUrls: mediaUrls,
                url: url,
                extractedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error extracting Reddit post:', error);
            return null;
        }
    }

    /**
     * Displays a temporary notification on the page to inform the user about the extraction success.
     * @param {number} postCount - The number of posts extracted.
     * @param {number} commentCount - The number of comments extracted.
     */
    function showExtractionNotification(postCount, commentCount) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FF4500;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        notification.textContent = `Extracted ${postCount} posts and ${commentCount} comments!`;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Listens for messages from the background script or popup.
     * Handles the 'extract' action to scrape all content on the page,
     * and the 'extractRedditData' action to scrape a single post and its comments.
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            if (request.action === 'extract') {
                extractAndSave().then(() => {
                    sendResponse({ success: true });
                }).catch((error) => {
                    sendResponse({ success: false, error: error.message });
                });
                return true;
            } else if (request.action === 'extractRedditData') {
                extractRedditData(request.extractComments).then((data) => {
                    sendResponse({ success: true, ...data });
                }).catch((error) => {
                    sendResponse({ success: false, error: error.message });
                });
                return true;
            }
        } catch (error) {
            console.error('Error in Reddit content script message listener:', error);
            sendResponse({ success: false, error: error.message });
        }
    });

    console.log('Reddit Content Extractor loaded');
})();