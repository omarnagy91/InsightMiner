// Background script for AI Demand Intelligence Miner
let MODEL = "gpt-4o"; // Default model, can be changed in settings

// ---- Structured Output schemas (OpenAI "Structured Outputs") ----
const PER_POST_SCHEMA = {
    type: "object",
    properties: {
        requested_tools: { type: "array", items: { type: "string" } },
        issues: { type: "array", items: { type: "string" } },
        pros: { type: "array", items: { type: "string" } },
        emotional_drivers: { type: "array", items: { type: "string" } },
        sentiment_summary: { type: "string" },
        confidence_score: { type: "number" },
        supporting_quotes: { type: "array", items: { type: "string" } },
        suggested_mvp_ideas: { type: "array", items: { type: "string" } }
    },
    required: ["requested_tools", "issues", "pros", "emotional_drivers", "sentiment_summary"],
    additionalProperties: false
};

const AGG_SCHEMA = {
    type: "object",
    properties: {
        top_requested_tools: { type: "array", items: { type: "string" } },
        tool_request_counts: { type: "object", additionalProperties: { type: "number" } },
        common_issues: { type: "array", items: { type: "string" } },
        common_pros: { type: "array", items: { type: "string" } },
        top_emotional_drivers: { type: "array", items: { type: "string" } },
        mvp_recommendations: { type: "array", items: { type: "string" } },
        short_action_plan: { type: "string" }
    },
    required: ["top_requested_tools", "tool_request_counts"],
    additionalProperties: true
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Demand Intelligence Miner installed');

    // Set up side panel behavior
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
        console.error('Error setting side panel behavior:', error);
    });

    // Initialize storage
    chrome.storage.local.set({
        selectedSources: ['reddit'],
        searchResults: [],
        extractionStats: {
            totalExtracted: 0,
            lastExtraction: null
        },
        dataExtraction: {
            isRunning: false,
            currentTask: null,
            progress: 0,
            total: 0,
            extractedData: []
        },
        aiAnalysis: {
            isRunning: false,
            progress: 0,
            total: 0,
            perPostResults: [],
            aggregateResults: null
        }
    });
});

// ---- OpenAI API Helpers ----
async function getKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['OPENAI_API_KEY'], (result) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result.OPENAI_API_KEY);
            }
        });
    });
}

async function getModel() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['AI_MODEL'], (result) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result.AI_MODEL || MODEL);
            }
        });
    });
}

async function getSearchPrompt() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['SEARCH_PROMPT'], (result) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result.SEARCH_PROMPT || getDefaultSearchPrompt());
            }
        });
    });
}

async function getAnalysisPrompt() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['ANALYSIS_PROMPT'], (result) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result.ANALYSIS_PROMPT || getDefaultAnalysisPrompt());
            }
        });
    });
}

function getDefaultSearchPrompt() {
    return `You are an expert at creating Google search queries to find relevant discussions about AI tools and productivity software.

For the topic "{topic}" on {platform}, create a Google search query that will find:
- User discussions, questions, and feedback
- Problems people are facing
- Tools they're looking for
- Feature requests and suggestions

The query should be specific to {platform} and use appropriate search operators.

Return only the search query, nothing else.`;
}

function getDefaultAnalysisPrompt() {
    return `You are a product researcher analyzing discussions about AI tools and productivity software. Extract:
- Requested AI tools/tasks (what people want built)
- Issues/problems they're facing
- Pros/benefits they mention
- Emotional drivers (frustration, excitement, etc.)
- Overall sentiment
- Supporting quotes (max 5, under 200 chars each)
- MVP ideas based on the discussion

Be concise, non-speculative, and focus on actionable insights.`;
}

async function openaiJSON({ system, user, schema, model = null }) {
    const apiKey = await getKey();
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");

    // Get model from settings or use default
    const modelToUse = model || await getModel();

    const body = {
        model: modelToUse,
        messages: [
            { role: "system", content: system },
            { role: "user", content: user }
        ],
        // Structured outputs: guarantee schema-conformant JSON
        response_format: { type: "json_schema", json_schema: { name: "schema", schema } },
        temperature: 0
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return JSON.parse(text);
}

// ---- Text sanitization ----
function sanitizeText(text) {
    if (!text) return "";

    return text
        // Remove excessive whitespace and newlines
        .replace(/\s+/g, ' ')
        // Remove special characters that don't add value
        .replace(/[^\w\s.,!?;:()\-'"]/g, '')
        // Remove multiple punctuation
        .replace(/([.!?]){2,}/g, '$1')
        // Remove URLs (they consume tokens without adding value for analysis)
        .replace(/https?:\/\/[^\s]+/g, '[URL]')
        // Remove Reddit-specific formatting
        .replace(/\[deleted\]/g, '[deleted]')
        .replace(/\[removed\]/g, '[removed]')
        .replace(/u\/\w+/g, '[user]')
        .replace(/r\/\w+/g, '[subreddit]')
        // Trim and limit length to save tokens
        .trim()
        .substring(0, 2000); // Limit to 2000 chars per post/comment
}

// ---- Per-post analysis ----
function buildPerPostPrompt(postObj) {
    const title = sanitizeText(postObj?.post?.title ?? "");
    const post = sanitizeText(postObj?.post?.content ?? "");
    const comments = (postObj?.comments ?? [])
        .map(c => `${c.author || "anon"}: ${sanitizeText(c.content || "")}`)
        .filter(c => c.length > 10) // Filter out very short comments
        .slice(0, 10) // Limit to 10 most relevant comments
        .join(" | ");

    const combined = `Title: ${title} | Post: ${post} | Comments: ${comments}`;
    const system = `You are a product researcher analyzing Reddit discussions about AI tools and productivity. Extract:
- Requested AI tools/tasks (what people want built)
- Issues/problems they're facing
- Pros/benefits they mention
- Emotional drivers (frustration, excitement, etc.)
- Overall sentiment
- Supporting quotes (max 5, under 200 chars each)
- MVP ideas based on the discussion

Be concise, non-speculative, and focus on actionable insights.`;
    return { system, user: combined };
}

async function analyzePosts(posts) {
    const perPost = [];

    // Update analysis status
    await chrome.storage.local.set({
        aiAnalysis: {
            isRunning: true,
            progress: 0,
            total: posts.length,
            perPostResults: [],
            aggregateResults: null
        }
    });

    for (let i = 0; i < posts.length; i++) {
        try {
            const { system, user } = buildPerPostPrompt(posts[i]);
            // Truncate if too long to avoid token limits
            const truncatedUser = user.length > 65000 ?
                user.slice(0, 32000) + "\n...[truncated]...\n" + user.slice(-32000) : user;

            const result = await openaiJSON({ system, user: truncatedUser, schema: PER_POST_SCHEMA });
            result._meta = {
                post_url: posts[i]?.post?.url ?? posts[i]?.url ?? null,
                analyzedAt: new Date().toISOString()
            };
            perPost.push(result);

            // Update progress
            await chrome.storage.local.set({
                aiAnalysis: {
                    isRunning: true,
                    progress: i + 1,
                    total: posts.length,
                    perPostResults: perPost,
                    aggregateResults: null
                }
            });

            // Brief pause to avoid rate limiting
            await new Promise(r => setTimeout(r, 250));

        } catch (error) {
            console.error(`Error analyzing post ${i + 1}:`, error);
            // Continue with other posts even if one fails
        }
    }

    return perPost;
}

// ---- Aggregation layer ----
function localTally(perPost) {
    const toLower = s => (s || "").trim().toLowerCase();
    const counts = (arr) => arr.reduce((m, x) => (x ? (m[toLower(x)] = (m[toLower(x)] || 0) + 1, m) : m), {});

    const tools = {};
    const issues = {};
    const pros = {};
    const emos = {};

    for (const r of perPost) {
        Object.assign(tools, counts(r.requested_tools || []));
        Object.assign(issues, counts(r.issues || []));
        Object.assign(pros, counts(r.pros || []));
        Object.assign(emos, counts(r.emotional_drivers || []));
    }

    // Top-N lists (keys only)
    const topN = (obj, n = 20) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);

    return {
        top_tools: topN(tools, 20),
        tool_counts: Object.fromEntries(Object.entries(tools).sort((a, b) => b[1] - a[1]).slice(0, 50)),
        top_issues: topN(issues, 20),
        top_pros: topN(pros, 20),
        top_emos: topN(emos, 20)
    };
}

async function aggregateWithGPT(perPost) {
    const summary = localTally(perPost);
    const system = "You are a pragmatic product strategist. Analyze Reddit data to identify MVP opportunities. Be concise and actionable.";
    const user = `Aggregate these Reddit-derived insights to create a strategic action plan:

1) Top 10 MVP ideas (1-line each; why they rank; feasible in 1 day)
2) Top 6 problems to solve
3) Top 6 praised features to emulate  
4) Top 6 emotional drivers to emphasize
5) A 5-step 24h action plan

Data summary:
${JSON.stringify(summary, null, 2)}`;

    const agg = await openaiJSON({ system, user, schema: AGG_SCHEMA });
    agg._counters = summary;
    agg._meta = { generatedAt: new Date().toISOString() };
    return agg;
}

// ---- Search Query Generation ----
async function generateSearchQueries(topic, sources) {
    try {
        const searchPrompt = await getSearchPrompt();
        const queries = [];

        for (const source of sources) {
            const platformName = getPlatformDisplayName(source);
            const systemPrompt = searchPrompt.replace('{platform}', platformName);
            const userPrompt = `Topic: ${topic}`;

            const query = await openaiText({ system: systemPrompt, user: userPrompt });
            queries.push({
                source: source,
                platform: platformName,
                query: query.trim(),
                topic: topic
            });
        }

        // Save generated queries
        await chrome.storage.local.set({
            generatedQueries: queries,
            lastQueryGeneration: new Date().toISOString()
        });

        return queries;
    } catch (error) {
        console.error('Error generating search queries:', error);
        throw error;
    }
}

async function openaiText({ system, user }) {
    const apiKey = await getKey();
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");

    const modelToUse = await getModel();

    const body = {
        model: modelToUse,
        messages: [
            { role: "system", content: system },
            { role: "user", content: user }
        ],
        temperature: 0.3
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}

function getPlatformDisplayName(source) {
    const names = {
        'reddit': 'Reddit',
        'stackoverflow': 'Stack Overflow',
        'github': 'GitHub',
        'devto': 'Dev.to',
        'medium': 'Medium'
    };
    return names[source] || source;
}

// ---- Message handling ----
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        try {
            if (request.type === 'GENERATE_SEARCH_QUERIES') {
                // Generate AI-powered search queries
                const queries = await generateSearchQueries(request.topic, request.sources);
                sendResponse({ success: true, queries });

            } else if (request.type === 'ANALYZE') {
                // Start AI analysis
                const perPost = await analyzePosts(request.posts || []);
                const aggregate = await aggregateWithGPT(perPost);

                // Save results
                await chrome.storage.local.set({
                    per_post_analysis: perPost,
                    aggregated_analysis: aggregate,
                    aiAnalysis: {
                        isRunning: false,
                        progress: perPost.length,
                        total: perPost.length,
                        perPostResults: perPost,
                        aggregateResults: aggregate
                    }
                });

                sendResponse({ ok: true, perPost, aggregate });

            } else if (request.type === 'RESULTS_EXTRACTED') {
                // Update extraction stats
                chrome.storage.local.get(['extractionStats'], (result) => {
                    const stats = result.extractionStats || { totalExtracted: 0, lastExtraction: null };
                    stats.totalExtracted += request.count;
                    stats.lastExtraction = new Date().toISOString();
                    chrome.storage.local.set({ extractionStats: stats });
                });

            } else if (request.type === 'START_DATA_EXTRACTION') {
                // Handle data extraction request
                handleDataExtraction(request, sendResponse);
                return true; // Keep message channel open for async response

            } else if (request.type === 'DATA_EXTRACTED') {
                // Handle extracted data
                handleDataExtracted(request);

            } else if (request.type === 'STOP_AND_SAVE_EXTRACTION') {
                // Handle stop and save request
                handleStopAndSave(sendResponse);
                return true; // Keep message channel open for async response

            } else {
                sendResponse({ ok: false, error: "Unknown message type" });
            }
        } catch (error) {
            console.error('Error in message listener:', error);
            sendResponse({ ok: false, error: error.message });
        }
    })();

    // Return true to keep the message channel open for async sendResponse
    return true;
});

// ---- Data Extraction Functions ----
async function handleDataExtraction(request, sendResponse) {
    try {
        const { urls, closeTabs, extractComments, extractMetadata } = request;

        if (!urls || urls.length === 0) {
            throw new Error('No URLs provided');
        }

        // Update extraction status
        await chrome.storage.local.set({
            dataExtraction: {
                isRunning: true,
                currentTask: 'Data Extraction',
                progress: 0,
                total: urls.length,
                currentUrl: '',
                startTime: new Date().toISOString(),
                extractedData: []
            }
        });

        // Start extraction process
        startDataExtractionProcess(urls, closeTabs, extractComments, extractMetadata);

        sendResponse({ success: true, message: `Starting extraction of ${urls.length} URLs` });

    } catch (error) {
        console.error('Error starting data extraction:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Read CSV file content
async function readCSVFile(filename) {
    return new Promise((resolve, reject) => {
        chrome.downloads.search({ filename: filename }, (downloads) => {
            if (downloads.length > 0) {
                resolve({ placeholder: true });
            } else {
                reject(new Error('File not found'));
            }
        });
    });
}

// Extract Reddit URLs from CSV content
function extractRedditUrlsFromCSV(csvContent) {
    if (csvContent && csvContent.placeholder) {
        return [
            'https://www.reddit.com/r/programming/comments/example1/',
            'https://www.reddit.com/r/webdev/comments/example2/',
            'https://www.reddit.com/r/javascript/comments/example3/'
        ];
    }

    if (!csvContent || typeof csvContent !== 'string') {
        return [];
    }

    const lines = csvContent.split('\n');
    const redditUrls = [];

    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns.length >= 2) {
            const url = columns[1].replace(/"/g, '');
            if (url.includes('reddit.com')) {
                redditUrls.push(url);
            }
        }
    }

    return redditUrls;
}

// Start data extraction process
async function startDataExtractionProcess(urls, closeTabs, extractComments, extractMetadata) {
    let currentTab = null;

    for (let i = 0; i < urls.length; i++) {
        try {
            // Check if extraction was stopped before processing each URL
            const currentState = await chrome.storage.local.get(['dataExtraction']);
            if (!currentState.dataExtraction.isRunning) {
                console.log('Extraction stopped by user - terminating process');
                if (currentTab) {
                    try {
                        await chrome.tabs.remove(currentTab.id);
                    } catch (closeError) {
                        console.error(`Error closing tab ${currentTab.id}:`, closeError);
                    }
                }
                break;
            }

            // Update progress with current URL
            await chrome.storage.local.set({
                dataExtraction: {
                    ...currentState.dataExtraction,
                    progress: i,
                    currentUrl: urls[i],
                    currentIndex: i + 1
                }
            });

            console.log(`Processing URL ${i + 1}/${urls.length}: ${urls[i]}`);

            // Open tab and extract data
            currentTab = await chrome.tabs.create({ url: urls[i], active: false });

            // Wait for page to load with periodic checks for stop signal
            let loadTime = 0;
            const maxLoadTime = 5000;
            const checkInterval = 500;

            while (loadTime < maxLoadTime) {
                await new Promise(resolve => setTimeout(resolve, checkInterval));
                loadTime += checkInterval;

                // Check if extraction was stopped during loading
                const stopCheck = await chrome.storage.local.get(['dataExtraction']);
                if (!stopCheck.dataExtraction.isRunning) {
                    console.log('Extraction stopped during page load - terminating process');
                    if (currentTab) {
                        try {
                            await chrome.tabs.remove(currentTab.id);
                        } catch (closeError) {
                            console.error(`Error closing tab ${currentTab.id}:`, closeError);
                        }
                    }
                    return;
                }
            }

            // Check again before extracting data
            const preExtractState = await chrome.storage.local.get(['dataExtraction']);
            if (!preExtractState.dataExtraction.isRunning) {
                console.log('Extraction stopped before data extraction - terminating process');
                if (currentTab) {
                    try {
                        await chrome.tabs.remove(currentTab.id);
                    } catch (closeError) {
                        console.error(`Error closing tab ${currentTab.id}:`, closeError);
                    }
                }
                return;
            }

            // Determine the platform and extract data accordingly
            const platform = getPlatformFromUrl(urls[i]);
            let results = null;

            try {
                if (platform === 'reddit') {
                    results = await chrome.tabs.sendMessage(currentTab.id, {
                        action: 'extractRedditData',
                        extractComments: extractComments,
                        extractMetadata: extractMetadata
                    });
                } else if (platform === 'stackoverflow') {
                    results = await chrome.tabs.sendMessage(currentTab.id, {
                        action: 'extractStackOverflowData',
                        extractComments: extractComments,
                        extractMetadata: extractMetadata
                    });
                } else if (platform === 'github') {
                    results = await chrome.tabs.sendMessage(currentTab.id, {
                        action: 'extractGitHubData',
                        extractComments: extractComments,
                        extractMetadata: extractMetadata
                    });
                } else if (platform === 'devto') {
                    results = await chrome.tabs.sendMessage(currentTab.id, {
                        action: 'extractDevToData',
                        extractComments: extractComments,
                        extractMetadata: extractMetadata
                    });
                } else if (platform === 'medium') {
                    results = await chrome.tabs.sendMessage(currentTab.id, {
                        action: 'extractMediumData',
                        extractComments: extractComments,
                        extractMetadata: extractMetadata
                    });
                }

                // Check if extraction was stopped after data extraction
                const postExtractState = await chrome.storage.local.get(['dataExtraction']);
                if (!postExtractState.dataExtraction.isRunning) {
                    console.log('Extraction stopped after data extraction - terminating process');
                    if (currentTab) {
                        try {
                            await chrome.tabs.remove(currentTab.id);
                        } catch (closeError) {
                            console.error(`Error closing tab ${currentTab.id}:`, closeError);
                        }
                    }
                    return;
                }

                if (results && results.success) {
                    const newData = {
                        url: urls[i],
                        platform: platform,
                        data: results.data || results,
                        extractedAt: new Date().toISOString()
                    };

                    // Add to extracted data and save immediately
                    const updatedData = [...(postExtractState.dataExtraction.extractedData || []), newData];
                    await chrome.storage.local.set({
                        dataExtraction: {
                            ...postExtractState.dataExtraction,
                            extractedData: updatedData
                        }
                    });

                    console.log(`Successfully extracted data from ${urls[i]} (${platform})`);
                } else {
                    console.log(`Failed to extract data from ${urls[i]} (${platform})`);
                }
            } catch (messageError) {
                console.error(`Error sending message to tab ${currentTab.id}:`, messageError);
            }

            // Close tab if requested
            if (closeTabs) {
                try {
                    await chrome.tabs.remove(currentTab.id);
                    currentTab = null;
                } catch (closeError) {
                    console.error(`Error closing tab ${currentTab.id}:`, closeError);
                }
            }

        } catch (error) {
            console.error(`Error extracting from ${urls[i]}:`, error);
            // Close tab on error if it exists
            if (currentTab) {
                try {
                    await chrome.tabs.remove(currentTab.id);
                    currentTab = null;
                } catch (closeError) {
                    console.error(`Error closing tab ${currentTab.id}:`, closeError);
                }
            }
        }
    }

    // Check if extraction was completed normally or stopped
    const finalState = await chrome.storage.local.get(['dataExtraction']);
    if (finalState.dataExtraction.isRunning) {
        // Save extracted data as JSON (normal completion)
        await saveDataAsJSON(finalState.dataExtraction.extractedData);

        // Update extraction status - completed
        await chrome.storage.local.set({
            dataExtraction: {
                isRunning: false,
                currentTask: null,
                progress: urls.length,
                total: urls.length,
                currentUrl: '',
                currentIndex: urls.length,
                completed: true,
                endTime: new Date().toISOString(),
                extractedData: []
            }
        });

        console.log(`Data extraction completed. Extracted ${finalState.dataExtraction.extractedData.length} items.`);
    }
}

// Helper function to determine platform from URL
function getPlatformFromUrl(url) {
    if (url.includes('reddit.com')) return 'reddit';
    if (url.includes('stackoverflow.com')) return 'stackoverflow';
    if (url.includes('github.com')) return 'github';
    if (url.includes('dev.to')) return 'devto';
    if (url.includes('medium.com')) return 'medium';
    return 'unknown';
}

// Save extracted data as JSON
async function saveDataAsJSON(data, isStopped = false) {
    const timestamp = new Date().toISOString().split('T')[0];
    const suffix = isStopped ? '_stopped' : '_completed';
    const filename = `data_extraction_${timestamp}${suffix}.json`;

    // Create data URL instead of blob URL (works in service workers)
    const jsonData = JSON.stringify(data, null, 2);
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`;

    await chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        conflictAction: 'overwrite',
        saveAs: true
    });
}

// Handle extracted Reddit data
function handleRedditDataExtracted(request) {
    console.log('Reddit data extracted:', request.data);
}

// Handle stop and save request
async function handleStopAndSave(sendResponse) {
    try {
        const currentState = await chrome.storage.local.get(['dataExtraction']);

        if (!currentState.dataExtraction.isRunning) {
            sendResponse({ success: false, error: 'No extraction is currently running' });
            return;
        }

        console.log('Stopping data extraction process...');

        // Stop the extraction immediately
        await chrome.storage.local.set({
            dataExtraction: {
                ...currentState.dataExtraction,
                isRunning: false,
                stopped: true,
                endTime: new Date().toISOString()
            }
        });

        // Close any open tabs that might be related to the extraction
        try {
            const tabUrls = [
                'https://www.reddit.com/*',
                'https://stackoverflow.com/*',
                'https://github.com/*',
                'https://dev.to/*',
                'https://medium.com/*'
            ];
            
            for (const urlPattern of tabUrls) {
                const tabs = await chrome.tabs.query({ url: urlPattern });
                for (const tab of tabs) {
                    // Only close tabs that are not the current active tab
                    if (!tab.active) {
                        try {
                            await chrome.tabs.remove(tab.id);
                            console.log(`Closed extraction tab: ${tab.url}`);
                        } catch (closeError) {
                            console.error(`Error closing tab ${tab.id}:`, closeError);
                        }
                    }
                }
            }
        } catch (tabError) {
            console.error('Error querying tabs:', tabError);
        }

        // Save the current extracted data
        if (currentState.dataExtraction.extractedData && currentState.dataExtraction.extractedData.length > 0) {
            await saveDataAsJSON(currentState.dataExtraction.extractedData, true);

            // Clear the extracted data
            await chrome.storage.local.set({
                dataExtraction: {
                    isRunning: false,
                    currentTask: null,
                    progress: 0,
                    total: 0,
                    currentUrl: '',
                    stopped: true,
                    endTime: new Date().toISOString(),
                    extractedData: []
                }
            });

            sendResponse({
                success: true,
                message: `Extraction stopped and saved ${currentState.dataExtraction.extractedData.length} items`
            });
        } else {
            // Clear the extraction state even if no data was extracted
            await chrome.storage.local.set({
                dataExtraction: {
                    isRunning: false,
                    currentTask: null,
                    progress: 0,
                    total: 0,
                    currentUrl: '',
                    stopped: true,
                    endTime: new Date().toISOString(),
                    extractedData: []
                }
            });

            sendResponse({
                success: true,
                message: 'Extraction stopped but no data was extracted yet'
            });
        }

    } catch (error) {
        console.error('Error stopping and saving extraction:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Context menu for easy access
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'extractResults',
        title: 'Extract Search Results',
        contexts: ['page'],
        documentUrlPatterns: ['https://www.google.com/search*']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'extractResults') {
        // Send message to content script to extract results
        chrome.tabs.sendMessage(tab.id, { action: 'extract' });
    }
});