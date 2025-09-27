/**
 * @file background.js
 * @description This is the service worker for the InsightMiner Chrome extension.
 * It handles all core background tasks, including:
 * - Extension initialization and setup.
 * - Communication with content scripts and UI components (side panel, options page).
 * - Orchestrating the multi-step process of search, extraction, and analysis.
 * - AI-powered search query generation.
 * - Data extraction from various platforms by managing tabs and content scripts.
 * - Interaction with the OpenAI API for data analysis, pitch generation, and final plan creation.
 * - State management for ongoing processes (search, extraction, analysis).
 * - Handling user notifications and context menu interactions.
 */

import { callOpenAI } from './background/openai.js';
import {
    PLATFORM_LABELS,
    STORAGE_KEYS,
    FILE_PREFIXES,
    DEMAND_SCORING_DEFAULTS
} from './background/constants.js';
import {
    buildQueries,
    saveSearchSession,
    storeSearchResults
} from './background/search.js';
import {
    truncateContent,
    limitComments,
    persistFailedUrl,
    saveFailedUrlsReport,
    recordExtractionRun
} from './background/scrape.js';
import { analyzePosts } from './background/analyze.js';

const PER_POST_SCHEMA = {
    type: "object",
    properties: {
        post_url: { type: "string" },
        topic: { type: "string" },
        platform: { type: "string" },
        items: {
            type: "object",
            properties: {
                ideas: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            text: { type: "string" },
                            quote: { type: "string" }
                        },
                        required: ["text", "quote"]
                    }
                },
                issues: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            text: { type: "string" },
                            quote: { type: "string" }
                        },
                        required: ["text", "quote"]
                    }
                },
                missing_features: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            text: { type: "string" },
                            quote: { type: "string" }
                        },
                        required: ["text", "quote"]
                    }
                },
                pros: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            text: { type: "string" },
                            quote: { type: "string" }
                        },
                        required: ["text", "quote"]
                    }
                },
                cons: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            text: { type: "string" },
                            quote: { type: "string" }
                        },
                        required: ["text", "quote"]
                    }
                },
                emotions: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            text: { type: "string" },
                            quote: { type: "string" }
                        },
                        required: ["text", "quote"]
                    }
                },
                sentiment: { type: "string", enum: ["positive", "negative", "neutral", "mixed"] }
            },
            required: ["ideas", "issues", "missing_features", "pros", "cons", "emotions", "sentiment"]
        }
    },
    required: ["post_url", "topic", "platform", "items"]
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

/**
 * Initializes the extension upon installation.
 * Sets up the side panel to open on action click and initializes local storage with default values.
 */
chrome.runtime.onInstalled.addListener(() => {
    console.log('InsightMiner installed');

    // Set up side panel behavior
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
        console.error('Error setting side panel behavior:', error);
    });

    // Initialize storage
    chrome.storage.local.set({
        selectedSources: ['reddit'],
        [STORAGE_KEYS.searchResults]: [],
        extractionStats: {
            totalExtracted: 0,
            lastExtraction: null
        },
        [STORAGE_KEYS.extractionState]: {
            isRunning: false,
            currentTask: null,
            progress: 0,
            total: 0,
            extractedData: []
        },
        [STORAGE_KEYS.analysisState]: {
            isRunning: false,
            progress: 0,
            total: 0,
            perPostResults: [],
            aggregateResults: null
        }
    });
});

/**
 * Displays a Chrome notification to the user.
 * @param {string} title - The title of the notification.
 * @param {string} message - The main message content of the notification.
 * @param {string} [type='basic'] - The type of notification (e.g., 'basic', 'list').
 */
function showNotification(title, message, type = 'basic') {
    chrome.notifications.create({
        type: type,
        iconUrl: 'icons/icon48.png',
        title: title,
        message: message,
        buttons: [
            { title: 'Open Extension' },
            { title: 'Dismiss' }
        ]
    });
}

/**
 * Handles clicks on notifications. Opens the side panel and clears the notification.
 */
chrome.notifications.onClicked.addListener((notificationId) => {
    chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT }).catch(() => {
        // Fallback: try to open in any available window
        chrome.windows.getCurrent().then(window => {
            chrome.sidePanel.open({ windowId: window.id });
        }).catch(() => {
            console.log('Could not open sidepanel');
        });
    });
    chrome.notifications.clear(notificationId);
});

/**
 * Handles clicks on notification buttons.
 * Opens the side panel if the "Open Extension" button is clicked.
 */
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (buttonIndex === 0) {
        // Open Extension button
        chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT }).catch(() => {
            // Fallback: try to open in any available window
            chrome.windows.getCurrent().then(window => {
                chrome.sidePanel.open({ windowId: window.id });
            }).catch(() => {
                console.log('Could not open sidepanel');
            });
        });
    }
    chrome.notifications.clear(notificationId);
});

/**
 * Cleans and sanitizes text content to optimize for AI analysis.
 * Removes excessive whitespace, special characters, URLs, and platform-specific formatting.
 * Also truncates the text to a reasonable length to conserve tokens.
 * @param {string} text - The input text to sanitize.
 * @returns {string} The sanitized text.
 */
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

/**
 * Constructs the prompt for analyzing a single post with the OpenAI API.
 * It combines the post title, content, and comments into a structured prompt
 * for the AI to extract specific insights.
 * @param {object} postObj - The post object containing details like title, content, and comments.
 * @param {string} [postObj.topic] - The topic of the post.
 * @param {string} [postObj.platform] - The platform the post is from.
 * @param {object} [postObj.post] - The main post content.
 * @param {string} [postObj.post.url] - The URL of the post.
 * @param {string} [postObj.post.title] - The title of the post.
 * @param {string} [postObj.post.content] - The body content of the post.
 * @param {Array<object>} [postObj.comments] - An array of comments on the post.
 * @returns {{system: string, user: string}} An object containing the system and user prompts for the AI.
 */
function buildPerPostPrompt(postObj) {
    console.log('=== buildPerPostPrompt Debug ===');
    console.log('Post object structure:', JSON.stringify(postObj, null, 2));

    const title = sanitizeText(postObj?.post?.title ?? "");
    const post = truncateContent(sanitizeText(postObj?.post?.content ?? ""));
    const comments = limitComments(postObj?.comments ?? [])
        .map(c => `${c.author || "anon"}: ${sanitizeText(c.content || "")}`)
        .join(" | ");

    console.log('Title:', title);
    console.log('Post content length:', post.length);
    console.log('Comments count:', postObj?.comments?.length || 0);
    console.log('Comments preview:', comments.substring(0, 200));

    const user = `Topic: ${postObj.topic || "unknown"}\nPlatform: ${postObj.platform || "unknown"}\nURL: ${postObj.post?.url || postObj.url || "unknown"}\n\nThread:\nTitle: ${title}\n${post}\n\nComments:${comments ? ` ${comments}` : ' none'}`;

    console.log('Final user prompt length:', user.length);
    console.log('=== End buildPerPostPrompt Debug ===');

    return {
        system: `You are a product researcher analyzing user discussions. Extract specific insights from the thread below.

For each category, find concrete examples mentioned by users:
- ideas: What tools, features, or solutions do users want?
- issues: What problems or frustrations do users mention?
- missing_features: What functionality is users asking for?
- pros: What do users like or praise?
- cons: What complaints or criticisms do users have?
- emotions: What emotional reactions do users express?

For each item you find, provide:
- text: A clear description of the insight
- quote: The exact quote from the discussion that supports it

Be specific and extract real user statements. If no examples exist for a category, return an empty array.

IMPORTANT: You must return a valid JSON object with this exact structure:
{
  "post_url": "string",
  "topic": "string", 
  "platform": "string",
  "items": {
    "ideas": [{"text": "string", "quote": "string"}],
    "issues": [{"text": "string", "quote": "string"}],
    "missing_features": [{"text": "string", "quote": "string"}],
    "pros": [{"text": "string", "quote": "string"}],
    "cons": [{"text": "string", "quote": "string"}],
    "emotions": [{"text": "string", "quote": "string"}],
    "sentiment": "positive|negative|neutral|mixed"
  }
}

Do not return empty arrays unless there truly are no examples.`,
        user
    };
}

/**
 * Generates concise solution pitches based on selected insights using the OpenAI API.
 * @param {Array<object>} selectedItems - An array of selected insight items (ideas, issues, etc.).
 * @returns {Promise<Array<object>>} A promise that resolves to an array of generated pitches, each with a pitch and reasoning.
 */
async function generatePitches(selectedItems) {
    const system = `You are a product strategist. Based ONLY on the SELECTED items below, generate 5 ultra-concise solution pitches.

Constraints:
- One sentence each, ≤ 22 words.
- Format: "Build [WHAT] for [WHO] to [OUTCOME], because [WHY this matters]."
- No buzzwords; concrete, user-facing benefits.
- Each pitch must address at least one selected idea/issue/emotion.
- Avoid overlap; make 5 distinct directions.`;

    const user = `Selected Evidence (JSON):
${JSON.stringify(selectedItems, null, 2)}`;

    const pitchSchema = {
        type: "object",
        properties: {
            pitches: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        pitch: { type: "string" },
                        reasoning: { type: "string" }
                    },
                    required: ["pitch", "reasoning"]
                },
                minItems: 5,
                maxItems: 5
            }
        },
        required: ["pitches"]
    };

    const result = await callOpenAI({
        system,
        user,
        schema: pitchSchema,
        temperature: 0.6
    });
    return result.pitches;
}

/**
 * Generates a detailed final plan including a tech stack, user persona, and PRD based on a chosen pitch and evidence.
 * @param {string} chosenPitch - The selected elevator pitch to build the plan around.
 * @param {Array<object>} selectedItems - The evidence (insights) supporting the pitch.
 * @returns {Promise<object>} A promise that resolves to a comprehensive final plan object.
 */
async function generateFinalPlan(chosenPitch, selectedItems) {
    const system = `You are a senior product engineer. Based ONLY on the chosen pitch and the SELECTED evidence below:
1) Propose a fast, pragmatic tech stack that a single dev can ship in 1 day.
2) Define a tight persona capturing the target user.
3) Produce a crisp PRD focused on a 1-day MVP (cut scope aggressively).

Constraints:
- No vague language; everything must be shippable and testable in 24 hours.
- Every feature in scope must have acceptance criteria.
- Keep data model minimal but explicit.
- Include 3–5 API endpoints max.
- Favor serverless/hosted options to reduce ops.`;

    const user = `Input:
- Elevator pitch: "${chosenPitch}"
- Selected items (JSON): ${JSON.stringify(selectedItems, null, 2)}

Return JSON exactly matching the provided schema.`;

    const finalSchema = {
        type: "object",
        properties: {
            elevator_pitch: { type: "string" },
            target_user_persona: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    role: { type: "string" },
                    context: { type: "string" },
                    goals: { type: "array", items: { type: "string" } },
                    pain_points: { type: "array", items: { type: "string" } },
                    success_criteria: { type: "array", items: { type: "string" } }
                },
                required: ["name", "role", "context", "goals", "pain_points", "success_criteria"]
            },
            tech_stack: {
                type: "object",
                properties: {
                    frontend: { type: "array", items: { type: "string" } },
                    backend: { type: "array", items: { type: "string" } },
                    data: { type: "array", items: { type: "string" } },
                    auth: { type: "string" },
                    ai: { type: "array", items: { type: "string" } },
                    infra: { type: "array", items: { type: "string" } },
                    why_this_stack: { type: "string" }
                },
                required: ["frontend", "backend", "data", "auth", "ai", "infra", "why_this_stack"]
            },
            prd: {
                type: "object",
                properties: {
                    problem: { type: "string" },
                    goals: { type: "array", items: { type: "string" } },
                    primary_user_jtbd: { type: "array", items: { type: "string" } },
                    scope_mvp: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                feature: { type: "string" },
                                acceptance_criteria: { type: "array", items: { type: "string" } }
                            },
                            required: ["feature", "acceptance_criteria"]
                        }
                    },
                    out_of_scope: { type: "array", items: { type: "string" } },
                    user_flows: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                steps: { type: "array", items: { type: "string" } }
                            },
                            required: ["name", "steps"]
                        }
                    },
                    data_model: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                entity: { type: "string" },
                                fields: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string" },
                                            type: { type: "string" },
                                            notes: { type: "string" }
                                        },
                                        required: ["name", "type"]
                                    }
                                }
                            },
                            required: ["entity", "fields"]
                        }
                    },
                    apis: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                method: { type: "string" },
                                path: { type: "string" },
                                request: { type: "string" },
                                response: { type: "string" }
                            },
                            required: ["method", "path", "request", "response"]
                        }
                    },
                    non_functional: {
                        type: "object",
                        properties: {
                            perf: { type: "string" },
                            privacy: { type: "string" },
                            costs: { type: "string" }
                        },
                        required: ["perf", "privacy", "costs"]
                    },
                    success_metrics: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                metric: { type: "string" },
                                target: { type: "string" }
                            },
                            required: ["metric", "target"]
                        }
                    },
                    risks: { type: "array", items: { type: "string" } },
                    "1_day_plan": { type: "array", items: { type: "string" } }
                },
                required: ["problem", "goals", "primary_user_jtbd", "scope_mvp", "out_of_scope", "user_flows", "data_model", "apis", "non_functional", "success_metrics", "risks", "1_day_plan"]
            }
        },
        required: ["elevator_pitch", "target_user_persona", "tech_stack", "prd"]
    };

    const result = await callOpenAI({
        system,
        user,
        schema: finalSchema,
        temperature: 0.3
    });
    return result;
}

/**
 * Orchestrates the generation of search queries, executes them on Google, and stores the results.
 * @param {string} topic - The central topic for which to generate search queries.
 * @param {Array<string>} sources - A list of platforms to target (e.g., 'reddit', 'github').
 * @returns {Promise<{queries: Array<object>, results: Array<object>, session: object}>} A promise that resolves to an object containing the generated queries, search results, and session information.
 */
async function generateSearchQueries(topic, sources) {
    try {
        const queries = await buildQueries({ topic, sources });

        await chrome.storage.local.set({
            [STORAGE_KEYS.generatedQueries]: queries,
            [STORAGE_KEYS.searchResults]: [],
            lastQueryGeneration: new Date().toISOString(),
            lastSearchTopic: topic,
            lastSearchSynonyms: queries[0]?.synonyms || []
        });

        showNotification(
            'Search Queries Generated',
            `Generated ${queries.length} focused queries for ${sources.length} platforms. Gathering results...`,
            'basic'
        );

        const results = await executeGoogleSearches(queries);
        console.log(`Total results collected: ${results.length}`);
        console.log('Results sample:', results.slice(0, 2));

        await storeSearchResults(results);
        const session = await saveSearchSession({ topic, queries, results });

        return { queries, results, session };
    } catch (error) {
        console.error('Error generating search queries:', error);
        throw error;
    }
}

/**
 * Executes a series of Google searches based on the provided queries.
 * It opens tabs in the background, extracts results from multiple pages, and closes the tabs.
 * @param {Array<object>} queries - An array of query objects to execute.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of search result objects.
 */
async function executeGoogleSearches(queries) {
    const results = [];
    const maxPagesPerQuery = 3; // Extract from up to 3 pages per query

    await chrome.storage.local.set({
        googleSearchProgress: {
            current: 0,
            total: queries.length * maxPagesPerQuery,
            currentQuery: 'Starting...'
        }
    });

    for (let i = 0; i < queries.length; i++) {
        const query = queries[i];

        for (let page = 0; page < maxPagesPerQuery; page++) {
            const startParam = page * 10; // Google shows 10 results per page
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.query)}&start=${startParam}`;

            await chrome.storage.local.set({
                googleSearchProgress: {
                    current: (i * maxPagesPerQuery) + page,
                    total: queries.length * maxPagesPerQuery,
                    currentQuery: `${query.query} (Page ${page + 1})`
                }
            });

            const tab = await chrome.tabs.create({ url: searchUrl, active: false });
            await new Promise(resolve => setTimeout(resolve, 3500));

            try {
                const extraction = await chrome.tabs.sendMessage(tab.id, {
                    action: 'extract',
                    searchQuery: query.query,
                    platform: query.platform,
                    page: page + 1
                });

                if (extraction?.success && Array.isArray(extraction.results)) {
                    const decorated = extraction.results.map(result => ({
                        ...result,
                        platform: query.platform,
                        platformLabel: query.platformLabel,
                        topic: query.topic,
                        query: query.query,
                        page: page + 1,
                        timestamp: new Date().toISOString()
                    }));
                    results.push(...decorated);
                    console.log(`Extracted ${extraction.results.length} results from page ${page + 1} of ${query.platform}`);
                    console.log('Sample result:', decorated[0]);
                } else {
                    console.log(`No results found on page ${page + 1} for ${query.platform}`);
                    console.log('Extraction response:', extraction);
                    console.log(`No results found on page ${page + 1} for ${query.platform}, stopping pagination`);
                    break; // Stop pagination if no results found
                }
            } catch (error) {
                console.error(`Search extraction failed for ${query.platform} page ${page + 1}:`, error);
            }

            try {
                await chrome.tabs.remove(tab.id);
            } catch (closeError) {
                console.error('Error closing search tab:', closeError);
            }

            // Small delay between pages
            await new Promise(resolve => setTimeout(resolve, 1200));
        }
    }

    await chrome.storage.local.set({
        googleSearchProgress: {
            current: queries.length * maxPagesPerQuery,
            total: queries.length * maxPagesPerQuery,
            currentQuery: 'Completed!'
        }
    });

    showNotification(
        'Google Searches Completed',
        `Collected ${results.length} results from multiple pages. You can jump straight to Extraction or reuse them later.`,
        'basic'
    );

    console.log(`Total results extracted: ${results.length}`);
    return results;
}

/**
 * Gets the user-friendly display name for a given platform source key.
 * @param {string} source - The platform key (e.g., 'stackoverflow').
 * @returns {string} The display name (e.g., 'Stack Overflow').
 */
function getPlatformDisplayName(source) {
    const names = {
        'reddit': 'Reddit',
        'stackoverflow': 'Stack Overflow',
        'github': 'GitHub',
        'devto': 'Dev.to',
        'medium': 'Medium',
        'producthunt': 'Product Hunt',
        'quora': 'Quora',
        'hackernews': 'Hacker News',
        'hn': 'Hacker News'
    };
    return names[source] || source;
}

/**
 * Main message listener for the extension.
 * Routes messages from other parts of the extension (UI, content scripts) to the appropriate handlers.
 * This is the central hub for all extension communication.
 * @param {object} request - The message object.
 * @param {string} request.type - The type of action to perform.
 * @param {object} sender - Information about the sender of the message.
 * @param {function} sendResponse - Function to call to send a response.
 * @returns {boolean} - Returns true to indicate that the response will be sent asynchronously.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        try {
            if (request.type === 'GENERATE_SEARCH_QUERIES') {
                // Generate AI-powered search queries
                const { queries, results, session } = await generateSearchQueries(request.topic, request.sources);
                sendResponse({ success: true, queries, results, session });

            } else if (request.type === 'ANALYZE') {
                const { posts = [], weights = DEMAND_SCORING_DEFAULTS } = request;

                await chrome.storage.local.set({
                    [STORAGE_KEYS.analysisState]: {
                        isRunning: true,
                        progress: 0,
                        total: posts.length,
                        perPostResults: [],
                        aggregateResults: null
                    }
                });

                const run = await analyzePosts({
                    posts,
                    schema: PER_POST_SCHEMA,
                    buildPrompt: buildPerPostPrompt,
                    weights,
                    onProgress: async (current) => {
                        await chrome.storage.local.set({
                            [STORAGE_KEYS.analysisState]: {
                                isRunning: true,
                                progress: current,
                                total: posts.length,
                                perPostResults: [],
                                aggregateResults: null
                            }
                        });
                    }
                });

                sendResponse({ ok: true, run });

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

            } else if (request.type === 'GENERATE_PITCHES') {
                // Generate pitches from selected items
                const pitches = await generatePitches(request.selectedItems);
                sendResponse({ success: true, pitches });

            } else if (request.type === 'GENERATE_FINAL_PLAN') {
                // Generate final plan from chosen pitch
                const finalPlan = await generateFinalPlan(request.chosenPitch, request.selectedItems);
                sendResponse({ success: true, finalPlan });

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

/**
 * Handles the initial request to start the data extraction process.
 * Sets up the extraction state and initiates the process.
 * @param {object} request - The message request object from the content script or UI.
 * @param {Array<string>} request.urls - The URLs to extract data from.
 * @param {boolean} request.closeTabs - Whether to close tabs after extraction.
 * @param {boolean} request.extractComments - Whether to extract comments.
 * @param {boolean} request.extractMetadata - Whether to extract metadata.
 * @param {function} sendResponse - The function to call to send a response.
 */
async function handleDataExtraction(request, sendResponse) {
    try {
        const { urls, closeTabs, extractComments, extractMetadata } = request;

        if (!urls || urls.length === 0) {
            throw new Error('No URLs provided');
        }

        // Update extraction status
        await chrome.storage.local.set({
            [STORAGE_KEYS.extractionState]: {
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

/**
 * Reads the content of a CSV file from the browser's downloads.
 * Note: This is a placeholder and does not actually read file content due to security restrictions.
 * It confirms the file's existence.
 * @param {string} filename - The name of the file to look for in the downloads.
 * @returns {Promise<object>} A promise that resolves with a placeholder object if the file exists.
 */
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

/**
 * Extracts Reddit URLs from CSV content.
 * Note: This is a placeholder function that returns example URLs if a placeholder object is passed.
 * In a real scenario, it would parse CSV content to find URLs.
 * @param {string|object} csvContent - The CSV file content as a string, or a placeholder object.
 * @returns {Array<string>} An array of Reddit URLs.
 */
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

/**
 * Manages the core data extraction loop, iterating through URLs and dispatching extraction tasks.
 * It opens tabs, injects content scripts, and handles success or failure for each URL.
 * It also manages the extraction state, including progress and stopping conditions.
 * @param {Array<string>} urls - The list of URLs to extract data from.
 * @param {boolean} closeTabs - Whether to close tabs after extraction.
 * @param {boolean} extractComments - Whether to extract comments/replies.
 * @param {boolean} extractMetadata - Whether to extract additional metadata.
 */
async function startDataExtractionProcess(urls, closeTabs, extractComments, extractMetadata) {
    let currentTab = null;

    // Show notification that extraction has started
    showNotification(
        'Data Extraction Started',
        `Starting extraction of ${urls.length} URLs from multiple platforms. You'll be notified if manual intervention is needed.`,
        'basic'
    );

    for (let i = 0; i < urls.length; i++) {
        try {
            // Check if extraction was stopped before processing each URL
            const currentState = await chrome.storage.local.get([STORAGE_KEYS.extractionState]);
            const extractionState = currentState[STORAGE_KEYS.extractionState];
            if (!extractionState?.isRunning) {
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
                [STORAGE_KEYS.extractionState]: {
                    ...extractionState,
                    progress: i + 1, // Progress should be 1-based
                    currentUrl: urls[i],
                    currentIndex: i + 1,
                    currentTask: `Extracting from ${urls[i]}`
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
                const stopCheck = await chrome.storage.local.get([STORAGE_KEYS.extractionState]);
                if (!stopCheck[STORAGE_KEYS.extractionState]?.isRunning) {
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
            const preExtractState = await chrome.storage.local.get([STORAGE_KEYS.extractionState]);
            if (!preExtractState[STORAGE_KEYS.extractionState]?.isRunning) {
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
                console.log(`Sending extraction message to tab ${currentTab.id} for platform ${platform}`);

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
                } else {
                    // Generic extraction for unknown platforms
                    results = await chrome.tabs.sendMessage(currentTab.id, {
                        action: 'extract',
                        platform: platform,
                        extractComments: extractComments,
                        extractMetadata: extractMetadata
                    });
                }

                console.log(`Received response from tab ${currentTab.id} for ${platform}:`, results);
            } catch (extractError) {
                console.error(`Error extracting data from ${urls[i]}:`, extractError);

                // Try fallback extraction with generic action
                try {
                    console.log(`Trying fallback extraction for ${platform}`);
                    results = await chrome.tabs.sendMessage(currentTab.id, {
                        action: 'extract',
                        platform: platform,
                        extractComments: extractComments,
                        extractMetadata: extractMetadata
                    });
                    console.log(`Fallback extraction successful for ${platform}:`, results);
                } catch (fallbackError) {
                    console.error(`Fallback extraction also failed for ${platform}:`, fallbackError);
                }

                // Check if it's a CAPTCHA or manual intervention issue
                if (extractError.message.includes('Could not establish connection') ||
                    extractError.message.includes('Extension context invalidated')) {

                    // Show notification for manual intervention
                    showNotification(
                        'Manual Intervention Required',
                        `Please check the tab for ${platform} - may need to solve CAPTCHA or login. Click to open extension.`,
                        'basic'
                    );

                    // Wait for user to resolve the issue
                    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

                    // Try to extract again
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
                    } catch (retryError) {
                        console.error(`Retry failed for ${urls[i]}:`, retryError);
                        results = null;
                    }
                } else {
                    results = null;
                }
            }

            // Check if extraction was stopped after data extraction
            const postExtractState = await chrome.storage.local.get([STORAGE_KEYS.extractionState]);
            const extractionAfter = postExtractState[STORAGE_KEYS.extractionState];
            if (!extractionAfter?.isRunning) {
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
                const updatedData = [...(extractionAfter?.extractedData || []), newData];
                await chrome.storage.local.set({
                    [STORAGE_KEYS.extractionState]: {
                        ...extractionAfter,
                        extractedData: updatedData,
                        progress: i + 1, // Update progress after successful extraction
                        currentTask: `Extracted ${updatedData.length} items`
                    }
                });

                console.log(`Successfully extracted data from ${urls[i]} (${platform}) - Total extracted: ${updatedData.length}`);
            } else {
                persistFailedUrl(urls[i], results?.error || 'Unknown error');
                console.log(`Failed to extract data from ${urls[i]} (${platform})`);
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
    const finalState = await chrome.storage.local.get([STORAGE_KEYS.extractionState]);
    const extractionState = finalState[STORAGE_KEYS.extractionState];
    if (extractionState?.isRunning) {
        const run = {
            id: `extraction_${Date.now()}`,
            startedAt: finalState[STORAGE_KEYS.extractionState]?.startTime || new Date().toISOString(),
            completedAt: new Date().toISOString(),
            total: urls.length,
            extracted: extractionState.extractedData.length,
            items: extractionState.extractedData
        };

        await recordExtractionRun(run);
        await saveFailedUrlsReport();

        // Update extraction state to mark as completed
        await chrome.storage.local.set({
            [STORAGE_KEYS.extractionState]: {
                ...extractionState,
                isRunning: false,
                completed: true,
                progress: urls.length,
                total: urls.length,
                currentTask: 'Completed',
                endTime: new Date().toISOString()
            }
        });

        console.log(`Data extraction completed. Extracted ${run.extracted} items.`);

        showNotification(
            'Data Extraction Completed',
            `Successfully extracted ${run.extracted} items from ${urls.length} URLs. Switch to AI Analysis mode to analyze the data.`,
            'basic'
        );
    }
}

/**
 * Determines the platform name from a given URL.
 * @param {string} url - The URL to analyze.
 * @returns {string} The platform name (e.g., 'reddit', 'github') or 'unknown'.
 */
function getPlatformFromUrl(url) {
    if (url.includes('reddit.com')) return 'reddit';
    if (url.includes('stackoverflow.com')) return 'stackoverflow';
    if (url.includes('github.com')) return 'github';
    if (url.includes('dev.to')) return 'devto';
    if (url.includes('medium.com')) return 'medium';
    return 'unknown';
}

/**
 * Saves the extracted data to a versioned run in local storage.
 * @param {object|Array} data - The data to save. Can be an array of items or a run object.
 * @param {boolean} [isStopped=false] - Whether the extraction was stopped prematurely.
 */
async function saveDataAsJSON(data, isStopped = false) {
    // Use the new storage system for versioned saves
    const run = {
        id: `extraction_${Date.now()}${isStopped ? '_stopped' : '_completed'}`,
        startedAt: new Date().toISOString(),
        endTime: new Date().toISOString(),
        totalUrls: Array.isArray(data) ? data.length : (data.totalUrls || 0),
        extractedCount: Array.isArray(data) ? data.length : (data.extractedCount || 0),
        failedCount: 0,
        extractedData: Array.isArray(data) ? data : (data.extractedData || []),
        failedUrls: data.failedUrls || []
    };

    await recordExtractionRun(run);
}

/**
 * Placeholder function to handle successfully extracted Reddit data. Currently just logs the data.
 * @param {object} request - The message request object containing the extracted data.
 */
function handleRedditDataExtracted(request) {
    console.log('Reddit data extracted:', request.data);
}

/**
 * Handles the request to stop an ongoing data extraction process and save the progress.
 * Updates the extraction state and saves any data collected so far.
 * @param {function} sendResponse - The function to call to send a response.
 */
async function handleStopAndSave(sendResponse) {
    try {
        const currentState = await chrome.storage.local.get([STORAGE_KEYS.extractionState]);
        const extractionState = currentState[STORAGE_KEYS.extractionState];

        if (!extractionState?.isRunning) {
            sendResponse({ success: false, error: 'No extraction is currently running' });
            return;
        }

        console.log('Stopping data extraction process...');

        // Stop the extraction immediately
        await chrome.storage.local.set({
            [STORAGE_KEYS.extractionState]: {
                ...extractionState,
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
        if (extractionState.extractedData && extractionState.extractedData.length > 0) {
            await recordExtractionRun({
                id: `extraction_${Date.now()}`,
                stopped: true,
                savedAt: new Date().toISOString(),
                extracted: extractionState.extractedData.length,
                items: extractionState.extractedData
            });

            sendResponse({
                success: true,
                message: `Extraction stopped and saved ${extractionState.extractedData.length} items`
            });
        } else {
            // Clear the extraction state even if no data was extracted
            await chrome.storage.local.set({
                [STORAGE_KEYS.extractionState]: {
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

/**
 * Creates a context menu item for easy access to search result extraction on Google search pages.
 */
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'extractResults',
        title: 'Extract Search Results',
        contexts: ['page'],
        documentUrlPatterns: ['https://www.google.com/search*']
    });
});

/**
 * Handles clicks on the context menu item.
 * Sends a message to the content script of the active tab to initiate extraction.
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'extractResults') {
        // Send message to content script to extract results
        chrome.tabs.sendMessage(tab.id, { action: 'extract' });
    }
});