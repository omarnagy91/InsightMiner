/**
 * @file openai.js
 * @description This file contains client utilities for interacting with the OpenAI Chat Completions API.
 * It handles API calls with structured JSON outputs, automatic retries with exponential backoff,
 * response validation against a schema, and streaming support.
 */

/**
 * @const {string} OPENAI_ENDPOINT
 * @description The URL for the OpenAI Chat Completions API.
 */
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
/**
 * @const {number} MAX_RETRIES
 * @description The maximum number of times to retry a failed API request.
 */
const MAX_RETRIES = 5;
/**
 * @const {number} BASE_DELAY_MS
 * @description The base delay in milliseconds for exponential backoff before retrying a request.
 */
const BASE_DELAY_MS = 500;
/**
 * @const {number} MAX_DELAY_MS
 * @description The maximum delay in milliseconds between retries.
 */
const MAX_DELAY_MS = 4000;

/**
 * Generates a random jitter value to add to retry delays, preventing thundering herd issues.
 * @param {number} [ms=200] - The maximum jitter value in milliseconds.
 * @returns {number} A random integer between 0 and `ms`.
 */
function randomJitter(ms = 200) {
    return Math.floor(Math.random() * ms);
}

/**
 * Creates a promise that resolves after a specified delay.
 * @param {number} ms - The delay in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retrieves the OpenAI API key from local storage.
 * @returns {Promise<string|null>} A promise that resolves to the API key, or null if not found.
 */
async function getApiKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['OPENAI_API_KEY'], (result) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result.OPENAI_API_KEY || null);
            }
        });
    });
}

/**
 * Retrieves the selected AI model from local storage, falling back to a default if not set.
 * @param {string} [defaultModel="gpt-4o-mini"] - The default model to use if none is set in storage.
 * @returns {Promise<string>} A promise that resolves to the selected AI model name.
 */
async function getModel(defaultModel = "gpt-4o-mini") {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['AI_MODEL'], (result) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result.AI_MODEL || defaultModel);
            }
        });
    });
}

/**
 * Makes a non-streaming call to the OpenAI Chat Completions API.
 * Handles JSON mode, retries with exponential backoff, and schema validation.
 * @param {object} params - The parameters for the API call.
 * @param {string} params.system - The system prompt.
 * @param {string} params.user - The user prompt.
 * @param {string} [params.model] - The specific model to use.
 * @param {object} [params.schema] - The JSON schema for the expected response (enables JSON mode).
 * @param {number} [params.temperature=0] - The sampling temperature.
 * @param {number} [params.maxRetries=MAX_RETRIES] - The maximum number of retries.
 * @param {function} [params.onRetry=()=>{}] - A callback function for retry attempts.
 * @param {object} [params.metadata={}] - Optional metadata (not sent to API, used for logging).
 * @returns {Promise<object|string>} A promise that resolves to the parsed JSON object if a schema is provided, otherwise the raw text response.
 */
async function callOpenAI({
    system,
    user,
    model,
    schema,
    temperature = 0,
    maxRetries = MAX_RETRIES,
    onRetry = () => {
    },
    metadata = {}
}) {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY not set");
    }

    const resolvedModel = await getModel(model);

    const body = {
        model: resolvedModel,
        temperature,
        messages: [
            {
                role: "system",
                content: system
            },
            {
                role: "user",
                content: user
            }
        ],
        stream: false
    };

    if (schema) {
        body.response_format = {
            type: "json_object"
        };
    }

    let attempt = 0;
    let lastError = null;

    while (attempt <= maxRetries) {
        try {
            const response = await fetch(OPENAI_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const retryable = [429, 500, 502, 503, 504];
                const errorText = await response.text();
                if (retryable.includes(response.status) && attempt < maxRetries) {
                    const delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, attempt) + randomJitter(), MAX_DELAY_MS);
                    onRetry({ attempt, delayMs, status: response.status, errorText });
                    await delay(delayMs);
                    attempt += 1;
                    continue;
                }
                throw new Error(`OpenAI error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            let text = data?.choices?.[0]?.message?.content;

            if (!text) {
                throw new Error("OpenAI response missing text content");
            }

            if (!schema) {
                return text.trim();
            }

            const parsed = JSON.parse(text);
            const isValid = validateAgainstSchema(schema, parsed);
            if (!isValid.valid) {
                throw new Error(`Schema validation failed: ${isValid.reason}`);
            }

            return parsed;

        } catch (error) {
            lastError = error;
            const retryableMessages = ["rate limit", "timeout", "Temporary", "connection", "Schema validation failed"];
            const isRetryable = retryableMessages.some(msg => (error.message || "").toLowerCase().includes(msg.toLowerCase()));

            if (attempt < maxRetries && isRetryable) {
                const delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, attempt) + randomJitter(), MAX_DELAY_MS);
                onRetry({ attempt, delayMs, error });
                await delay(delayMs);
                attempt += 1;
                continue;
            }

            throw error;
        }
    }

    throw lastError || new Error("OpenAI call failed after retries");
}

/**
 * Recursively validates a data object against a given JSON schema.
 * @param {object} schema - The JSON schema to validate against.
 * @param {*} data - The data to validate.
 * @param {string} [path="root"] - The current path in the data structure, for error reporting.
 * @returns {{valid: boolean, reason?: string}} An object indicating if the data is valid. If not, a reason is provided.
 */
function validateAgainstSchema(schema, data, path = "root") {
    if (!schema || typeof schema !== "object") {
        return { valid: true };
    }

    if (schema.type === "object") {
        if (typeof data !== "object" || data === null || Array.isArray(data)) {
            return { valid: false, reason: `${path} expected object` };
        }

        if (Array.isArray(schema.required)) {
            for (const key of schema.required) {
                if (!(key in data)) {
                    return { valid: false, reason: `${path}.${key} missing` };
                }
            }
        }

        if (schema.properties) {
            for (const [key, propSchema] of Object.entries(schema.properties)) {
                if (key in data) {
                    const result = validateAgainstSchema(propSchema, data[key], `${path}.${key}`);
                    if (!result.valid) {
                        return result;
                    }
                }
            }
        }

        return { valid: true };
    }

    if (schema.type === "array") {
        if (!Array.isArray(data)) {
            return { valid: false, reason: `${path} expected array` };
        }

        if (schema.items) {
            for (let i = 0; i < data.length; i++) {
                const result = validateAgainstSchema(schema.items, data[i], `${path}[${i}]`);
                if (!result.valid) {
                    return result;
                }
            }
        }

        if (typeof schema.minItems === "number" && data.length < schema.minItems) {
            return { valid: false, reason: `${path} expected at least ${schema.minItems} items` };
        }

        if (typeof schema.maxItems === "number" && data.length > schema.maxItems) {
            return { valid: false, reason: `${path} expected at most ${schema.maxItems} items` };
        }

        return { valid: true };
    }

    if (schema.type === "number") {
        if (typeof data !== "number") {
            return { valid: false, reason: `${path} expected number` };
        }
        if (typeof schema.minimum === "number" && data < schema.minimum) {
            return { valid: false, reason: `${path} expected >= ${schema.minimum}` };
        }
        if (typeof schema.maximum === "number" && data > schema.maximum) {
            return { valid: false, reason: `${path} expected <= ${schema.maximum}` };
        }
        return { valid: true };
    }

    if (schema.type === "string") {
        if (typeof data !== "string") {
            return { valid: false, reason: `${path} expected string` };
        }
        if (schema.enum && !schema.enum.includes(data)) {
            return { valid: false, reason: `${path} not in enum` };
        }
        return { valid: true };
    }

    if (schema.type === "boolean") {
        if (typeof data !== "boolean") {
            return { valid: false, reason: `${path} expected boolean` };
        }
        return { valid: true };
    }

    // Default pass-through for unsupported types
    return { valid: true };
}

/**
 * Makes a streaming call to the OpenAI Chat Completions API.
 * Useful for real-time analysis and displaying results as they are generated.
 * @param {object} params - The parameters for the streaming API call.
 * @param {string} params.system - The system prompt.
 * @param {string} params.user - The user prompt.
 * @param {string} [params.model] - The specific model to use.
 * @param {number} [params.temperature=0] - The sampling temperature.
 * @param {number} [params.maxRetries=MAX_RETRIES] - The maximum number of retries.
 * @param {function} [params.onChunk=()=>{}] - A callback function for each received chunk of data.
 * @param {function} [params.onComplete=()=>{}] - A callback function when the stream is complete.
 * @param {function} [params.onError=()=>{}] - A callback function for errors.
 * @param {object} [params.metadata={}] - Optional metadata.
 * @returns {Promise<string>} A promise that resolves to the full response string once complete.
 */
async function callOpenAIStream({
    system,
    user,
    model,
    temperature = 0,
    maxRetries = MAX_RETRIES,
    onChunk = () => { },
    onComplete = () => { },
    onError = () => { },
    metadata = {}
}) {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY not set");
    }

    const resolvedModel = await getModel(model);

    const body = {
        model: resolvedModel,
        temperature,
        messages: [
            {
                role: "system",
                content: system
            },
            {
                role: "user",
                content: user
            }
        ],
        stream: true
    };

    let attempt = 0;
    let lastError = null;

    while (attempt <= maxRetries) {
        try {
            const response = await fetch(OPENAI_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenAI API error ${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            onComplete(fullResponse);
                            return fullResponse;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                fullResponse += content;
                                onChunk(content, fullResponse);
                            }
                        } catch (e) {
                            // Ignore parsing errors for incomplete chunks
                        }
                    }
                }
            }

            onComplete(fullResponse);
            return fullResponse;

        } catch (error) {
            lastError = error;
            attempt++;

            if (attempt <= maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                console.log(`OpenAI streaming attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    const error = new Error(`OpenAI streaming failed after ${maxRetries} retries: ${lastError?.message}`);
    onError(error);
    throw error;
}

export {
    callOpenAI,
    callOpenAIStream,
    validateAgainstSchema
};