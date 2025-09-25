// Content script for Medium
console.log('Medium content script loaded');

// Listen for messages from background script
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

function extractArticle(extractMetadata = true) {
    try {
        const title = document.querySelector('h1')?.textContent?.trim();
        const content = document.querySelector('article')?.textContent?.trim() || 
                       document.querySelector('.postArticle-content')?.textContent?.trim();
        const author = document.querySelector('.authorName')?.textContent?.trim() ||
                      document.querySelector('.bylineName')?.textContent?.trim();
        const publication = document.querySelector('.publicationName')?.textContent?.trim();

        const article = {
            title: title || '',
            content: content || '',
            author: author || '',
            publication: publication || ''
        };

        if (extractMetadata) {
            const publishedDate = document.querySelector('time')?.getAttribute('datetime');
            const readingTime = document.querySelector('.readingTime')?.textContent?.trim();
            const claps = document.querySelector('.clapCount')?.textContent?.trim();
            const responsesCount = document.querySelector('.responsesCount')?.textContent?.trim();

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

function extractResponses(extractMetadata = true) {
    try {
        const responseElements = document.querySelectorAll('.response');
        const responses = [];

        responseElements.forEach((responseElement, index) => {
            const content = responseElement.querySelector('.responseContent')?.textContent?.trim();
            const author = responseElement.querySelector('.responseAuthor')?.textContent?.trim();

            if (content) {
                const response = {
                    content: content,
                    author: author || '',
                    order: index + 1
                };

                if (extractMetadata) {
                    const date = responseElement.querySelector('time')?.getAttribute('datetime');
                    const claps = responseElement.querySelector('.clapCount')?.textContent?.trim();

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
