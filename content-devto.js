// Content script for Dev.to
console.log('Dev.to content script loaded');

// Listen for messages from background script
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
        const comments = extractComments();
        if (comments && comments.length > 0) {
            data.comments = comments;
        }
    }

    return data;
}

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

function extractComments() {
    try {
        const commentElements = document.querySelectorAll('.comment');
        const comments = [];

        commentElements.forEach((commentElement, index) => {
            const content = commentElement.querySelector('.comment-body')?.textContent?.trim();
            const author = commentElement.querySelector('.comment-author')?.textContent?.trim();

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

function extractReactions() {
    try {
        const reactionElements = document.querySelectorAll('.reaction-button');
        const reactions = {};

        reactionElements.forEach(reaction => {
            const emoji = reaction.querySelector('.reaction-emoji')?.textContent?.trim();
            const count = reaction.querySelector('.reaction-count')?.textContent?.trim();
            if (emoji && count) {
                reactions[emoji] = parseInt(count) || 0;
            }
        });

        return reactions;
    } catch (error) {
        console.error('Error extracting reactions:', error);
        return {};
    }
}

function extractCommentReactions(commentElement) {
    try {
        const reactionElements = commentElement.querySelectorAll('.reaction-button');
        const reactions = {};

        reactionElements.forEach(reaction => {
            const emoji = reaction.querySelector('.reaction-emoji')?.textContent?.trim();
            const count = reaction.querySelector('.reaction-count')?.textContent?.trim();
            if (emoji && count) {
                reactions[emoji] = parseInt(count) || 0;
            }
        });

        return reactions;
    } catch (error) {
        console.error('Error extracting comment reactions:', error);
        return {};
    }
}
