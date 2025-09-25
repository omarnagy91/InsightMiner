// Content script for Stack Overflow
console.log('Stack Overflow content script loaded');

// Listen for messages from background script
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
        const comments = extractComments();
        if (comments && comments.length > 0) {
            data.comments = comments;
        }
    }

    return data;
}

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
                score: score ? parseInt(score) : 0,
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
                        score: score ? parseInt(score) : 0,
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

function extractComments() {
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
