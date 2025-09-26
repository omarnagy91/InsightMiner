/*
 * OpenAI client utilities for AI Demand Intelligence Miner
 * Handles Responses API calls, structured outputs, retries, and validation
 */

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 4000;

function randomJitter(ms = 200) {
    return Math.floor(Math.random() * ms);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function getModel(defaultModel = "gpt-4.1-mini") {
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
        input: [
            {
                role: "system",
                content: [
                    { type: "text", text: system }
                ]
            },
            {
                role: "user",
                content: [
                    { type: "text", text: user }
                ]
            }
        ],
        metadata
    };

    if (schema) {
        body.response_format = {
            type: "json_schema",
            json_schema: {
                name: "structured_output",
                schema
            }
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
            let text = data?.output?.[0]?.content?.[0]?.text;
            if (!text && Array.isArray(data?.output)) {
                text = data.output.map(part => part?.content?.map(chunk => chunk?.text || "").join(""))
                    .join("\n");
            }

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

export {
    callOpenAI,
    validateAgainstSchema
};

