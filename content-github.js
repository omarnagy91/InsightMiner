// Content script for GitHub
console.log('GitHub content script loaded');

// Listen for messages from background script
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

function extractPullRequestComments(extractMetadata = true) {
    // Similar to issue comments
    return extractIssueComments(extractMetadata);
}

function extractDiscussionComments(extractMetadata = true) {
    // Similar to issue comments
    return extractIssueComments(extractMetadata);
}

function extractReleaseComments(extractMetadata = true) {
    // Similar to issue comments
    return extractIssueComments(extractMetadata);
}

function extractReactions(element = document) {
    try {
        const reactionElements = element.querySelectorAll('.reaction-summary-item');
        const reactions = {};

        reactionElements.forEach(reaction => {
            const emoji = reaction.querySelector('.emoji')?.textContent?.trim();
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
