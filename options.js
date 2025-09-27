/**
 * @file options.js
 * @description This script handles the logic for the extension's options page (options.html).
 * It manages loading and saving user settings, such as the OpenAI API key, selected AI model,
 * and custom prompts. It also includes functionality for validating the API key and dynamically
 * fetching available models from the OpenAI API.
 */
document.addEventListener('DOMContentLoaded', function () {
    const keyEl = document.getElementById('key');
    const modelEl = document.getElementById('model');
    const searchPromptEl = document.getElementById('searchPrompt');
    const analysisPromptEl = document.getElementById('analysisPrompt');
    const perPostPromptEl = document.getElementById('perPostPrompt');
    const pitchPromptEl = document.getElementById('pitchPrompt');
    const planPromptEl = document.getElementById('planPrompt');
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');
    const statusEl = document.getElementById('status');
    const testKeyBtn = document.getElementById('testKey');
    const keyStatusEl = document.getElementById('keyStatus');

    let validationTimeout;
    let isFormValid = false;

    /**
     * @const {object} defaultPrompts
     * @description An object containing the default prompt strings for various AI tasks.
     * These are used if the user has not provided their own custom prompts.
     */
    const defaultPrompts = {
        searchPrompt: `You are an expert at creating Google search queries to find relevant discussions about AI tools and productivity software.

For the topic "{topic}" on {platform}, create a Google search query that will find:
- User discussions, questions, and feedback
- Problems people are facing
- Tools they're looking for
- Feature requests and suggestions

The query should be specific to {platform} and use appropriate search operators.

Return only the search query, nothing else.`,
        analysisPrompt: `You are a product researcher analyzing discussions about AI tools and productivity software. Extract:
- Requested AI tools/tasks (what people want built)
- Issues/problems they're facing
- Pros/benefits they mention
- Emotional drivers (frustration, excitement, etc.)
- Overall sentiment
- Supporting quotes (max 5, under 200 chars each)
- MVP ideas based on the discussion

Be concise, non-speculative, and focus on actionable insights.`,
        perPostPrompt: `You are a product researcher analyzing user discussions. Extract specific insights from the thread below.

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

Be specific and extract real user statements. If no examples exist for a category, return an empty array.`,
        pitchPrompt: `You are a product strategist. Based ONLY on the SELECTED items below, generate 5 ultra-concise solution pitches.

Each pitch must be:
- Maximum 22 words
- Focus on ONE core value proposition
- Address a specific user need
- Be actionable and clear

Format: "Build [solution] for [target] who [problem] by [approach] to [outcome]"

Selected items: {items}

Generate 5 distinct pitches:`,
        planPrompt: `You are a senior product engineer. Create a detailed 1-day MVP plan based on the selected pitch and evidence.

Pitch: {pitch}
Evidence: {evidence}

Provide:
1. Target persona (demographics, pain points, goals)
2. Tech stack (frontend, backend, database, deployment)
3. Core features (MVP scope)
4. Development timeline (1-day breakdown)
5. Success metrics
6. Next steps

Be specific and actionable for immediate implementation.`
    };

    /**
     * Loads saved settings from `chrome.storage.local` when the page is opened.
     * If settings are not found, it populates the fields with default values.
     */
    chrome.storage.local.get([
        'OPENAI_API_KEY',
        'AI_MODEL',
        'SEARCH_PROMPT',
        'ANALYSIS_PROMPT',
        'PER_POST_PROMPT',
        'PITCH_PROMPT',
        'PLAN_PROMPT'
    ], async (result) => {
        if (result.OPENAI_API_KEY) {
            keyEl.value = result.OPENAI_API_KEY;
            await loadAvailableModels(result.OPENAI_API_KEY);
        }
        if (result.AI_MODEL) {
            modelEl.value = result.AI_MODEL;
        }
        searchPromptEl.value = result.SEARCH_PROMPT || defaultPrompts.searchPrompt;
        analysisPromptEl.value = result.ANALYSIS_PROMPT || defaultPrompts.analysisPrompt;
        perPostPromptEl.value = result.PER_POST_PROMPT || defaultPrompts.perPostPrompt;
        pitchPromptEl.value = result.PITCH_PROMPT || defaultPrompts.pitchPrompt;
        planPromptEl.value = result.PLAN_PROMPT || defaultPrompts.planPrompt;
    });

    /**
     * Handles the click event for the "Test API Key" button.
     * It validates the key and fetches the available AI models.
     */
    testKeyBtn.addEventListener('click', async () => {
        const apiKey = keyEl.value.trim();
        if (!apiKey) {
            showKeyStatus('Please enter an API key first', 'error');
            return;
        }

        testKeyBtn.disabled = true;
        testKeyBtn.innerHTML = '🧪 Testing...';
        showKeyStatus('Testing API key...', 'info');

        try {
            const { isValid, models, error } = await testAPIKeyAndGetModels(apiKey);
            if (isValid) {
                showKeyStatus('✅ API key is valid!', 'success');
                await loadAvailableModels(apiKey, models);
            } else {
                showKeyStatus(`❌ API key test failed: ${error}`, 'error');
            }
        } catch (error) {
            showKeyStatus(`❌ Error testing API key: ${error.message}`, 'error');
        } finally {
            testKeyBtn.disabled = false;
            testKeyBtn.innerHTML = '🧪 Test API Key';
        }
    });

    /**
     * Handles the click event for the "Save Settings" button.
     * It validates the form and saves all settings to `chrome.storage.local`.
     */
    saveBtn.addEventListener('click', async () => {
        if (!validateForm()) {
            return;
        }

        const apiKey = keyEl.value.trim();
        const model = modelEl.value;
        const searchPrompt = searchPromptEl.value.trim();
        const analysisPrompt = analysisPromptEl.value.trim();
        const perPostPrompt = perPostPromptEl.value.trim();
        const pitchPrompt = pitchPromptEl.value.trim();
        const planPrompt = planPromptEl.value.trim();

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="loading"></span> Saving...';

        try {
            const settings = {
                OPENAI_API_KEY: apiKey,
                AI_MODEL: model,
                SEARCH_PROMPT: searchPrompt,
                ANALYSIS_PROMPT: analysisPrompt,
                PER_POST_PROMPT: perPostPrompt,
                PITCH_PROMPT: pitchPrompt,
                PLAN_PROMPT: planPrompt
            };

            if (apiKey) {
                const { isValid } = await testAPIKeyAndGetModels(apiKey);
                if (!isValid) {
                    showStatus('Invalid API key. Please check your key and try again.', 'error', 8000);
                    return;
                }
            }

            await new Promise((resolve, reject) => {
                chrome.storage.local.set(settings, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });

            showStatus('✅ Settings saved successfully!', 'success', 5000);

        } catch (error) {
            console.error('Error saving settings:', error);
            showStatus('❌ Error saving settings: ' + error.message, 'error', 8000);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 Save Settings';
        }
    });

    /**
     * Validates the form fields, providing feedback for any errors.
     * @returns {boolean} True if the form is valid, otherwise false.
     */
    function validateForm() {
        const apiKey = keyEl.value.trim();
        const searchPrompt = searchPromptEl.value.trim();
        const analysisPrompt = analysisPromptEl.value.trim();

        clearValidationStates();
        let isValid = true;
        let errorMessage = '';

        if (!apiKey) {
            setFieldError(keyEl, 'API key is required');
            isValid = false;
            errorMessage = 'Please enter an API key';
        } else if (!apiKey.startsWith('sk-')) {
            setFieldError(keyEl, 'API key should start with "sk-"');
            isValid = false;
            errorMessage = 'API key should start with "sk-"';
        }

        if (!searchPrompt) {
            setFieldError(searchPromptEl, 'Search prompt is required');
            isValid = false;
            if (!errorMessage) errorMessage = 'Please enter a search prompt';
        }

        if (!analysisPrompt) {
            setFieldError(analysisPromptEl, 'Analysis prompt is required');
            isValid = false;
            if (!errorMessage) errorMessage = 'Please enter an analysis prompt';
        }

        if (!isValid) {
            showStatus('❌ ' + errorMessage, 'error', 5000);
        }

        isFormValid = isValid;
        return isValid;
    }

    /**
     * Tests an OpenAI API key by making a request to the /v1/models endpoint.
     * @param {string} apiKey - The API key to test.
     * @returns {Promise<{isValid: boolean, models: Array<object>, error: string|null}>} An object indicating validity, a list of models, and any error message.
     */
    async function testAPIKeyAndGetModels(apiKey) {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    isValid: false,
                    models: [],
                    error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
                };
            }

            const data = await response.json();
            return { isValid: true, models: data.data || [], error: null };
        } catch (error) {
            console.error('API key test failed:', error);
            return { isValid: false, models: [], error: error.message };
        }
    }

    /**
     * Fetches the list of available AI models from OpenAI and populates the model dropdown.
     * @param {string} apiKey - A valid OpenAI API key.
     * @param {Array<object>} [models=null] - An optional pre-fetched list of models.
     */
    async function loadAvailableModels(apiKey, models = null) {
        try {
            if (!models) {
                const result = await testAPIKeyAndGetModels(apiKey);
                if (!result.isValid) {
                    modelEl.innerHTML = '<option value="gpt-4o-mini">API key invalid</option>';
                    return;
                }
                models = result.models;
            }

            const chatModels = models
                .filter(model => model.id.includes('gpt'))
                .sort((a, b) => b.id.localeCompare(a.id)); // Sort to have newer models first

            modelEl.innerHTML = '';
            if (chatModels.length === 0) {
                modelEl.innerHTML = '<option value="gpt-4o-mini">No models available</option>';
                return;
            }

            chatModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.id;
                modelEl.appendChild(option);
            });

            const preferredModel = chatModels.find(m => m.id === 'gpt-4o-mini') || chatModels[0];
            if (preferredModel) {
                modelEl.value = preferredModel.id;
            }

        } catch (error) {
            console.error('Error loading models:', error);
            modelEl.innerHTML = '<option value="gpt-4o-mini">Error loading models</option>';
        }
    }

    /**
     * Displays a status message for the API key test.
     * @param {string} message - The message to display.
     * @param {string} type - The type of message ('success', 'error', 'info').
     */
    function showKeyStatus(message, type) {
        keyStatusEl.textContent = message;
        keyStatusEl.className = `status ${type}`;
        keyStatusEl.style.display = 'block';
        setTimeout(() => {
            keyStatusEl.style.display = 'none';
        }, 5000);
    }

    /**
     * Sets the visual error state for a form field.
     * @param {HTMLElement} field - The input or textarea element.
     * @param {string} message - The error message for the tooltip.
     */
    function setFieldError(field, message) {
        field.style.borderColor = '#f44336';
        field.setAttribute('data-error', message);
        field.classList.add('error-field');
    }

    /**
     * Clears all visual validation states from form fields.
     */
    function clearValidationStates() {
        [keyEl, searchPromptEl, analysisPromptEl, perPostPromptEl, pitchPromptEl, planPromptEl].forEach(field => {
            field.style.borderColor = '';
            field.removeAttribute('data-error');
            field.classList.remove('error-field');
        });
    }

    /**
     * Handles the click event for the "Reset" button.
     * It confirms with the user and then resets all settings to their default values.
     */
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings to defaults? This will clear your custom prompts and API key.')) {
            keyEl.value = '';
            modelEl.innerHTML = '<option value="gpt-4o-mini">gpt-4o-mini</option>';
            searchPromptEl.value = defaultPrompts.searchPrompt;
            analysisPromptEl.value = defaultPrompts.analysisPrompt;
            perPostPromptEl.value = defaultPrompts.perPostPrompt;
            pitchPromptEl.value = defaultPrompts.pitchPrompt;
            planPromptEl.value = defaultPrompts.planPrompt;
            clearValidationStates();
            showStatus('🔄 Settings reset to defaults', 'success', 3000);
        }
    });

    /**
     * Displays a status message to the user (e.g., "Settings saved").
     * @param {string} message - The message to display.
     * @param {string} type - The type of message ('success', 'error').
     * @param {number} [duration=3000] - The duration in milliseconds to show the message.
     */
    function showStatus(message, type, duration = 3000) {
        if (statusEl.timeoutId) {
            clearTimeout(statusEl.timeoutId);
        }
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.style.display = 'block';
        statusEl.timeoutId = setTimeout(() => {
            statusEl.style.display = 'none';
        }, duration);
    }

    /**
     * Sets up real-time validation listeners for form fields.
     */
    function setupRealTimeValidation() {
        [keyEl, searchPromptEl, analysisPromptEl].forEach(field => {
            field.addEventListener('input', () => {
                clearValidationStates();
                clearTimeout(validationTimeout);
                validationTimeout = setTimeout(validateForm, 500);
            });
            field.addEventListener('blur', validateForm);
        });
    }

    /**
     * Sets up keyboard shortcuts for saving (Ctrl/Cmd + S) and resetting (Ctrl/Cmd + R).
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    saveBtn.click();
                }
                return;
            }
            if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                saveBtn.click();
            } else if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                resetBtn.click();
            }
        });
    }

    // Initialize all features.
    setupRealTimeValidation();
    setupKeyboardShortcuts();
});