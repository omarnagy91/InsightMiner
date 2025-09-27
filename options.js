// Enhanced Options page JavaScript for InsightMiner
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

    // Enhanced validation and feedback
    let validationTimeout;
    let isFormValid = false;

    // Default prompts
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

    // Load existing settings
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
            // Load models for existing API key
            await loadAvailableModels(result.OPENAI_API_KEY);
        }
        if (result.AI_MODEL) {
            modelEl.value = result.AI_MODEL;
        }
        if (result.SEARCH_PROMPT) {
            searchPromptEl.value = result.SEARCH_PROMPT;
        } else {
            searchPromptEl.value = defaultPrompts.searchPrompt;
        }
        if (result.ANALYSIS_PROMPT) {
            analysisPromptEl.value = result.ANALYSIS_PROMPT;
        } else {
            analysisPromptEl.value = defaultPrompts.analysisPrompt;
        }
        if (result.PER_POST_PROMPT) {
            perPostPromptEl.value = result.PER_POST_PROMPT;
        } else {
            perPostPromptEl.value = defaultPrompts.perPostPrompt;
        }
        if (result.PITCH_PROMPT) {
            pitchPromptEl.value = result.PITCH_PROMPT;
        } else {
            pitchPromptEl.value = defaultPrompts.pitchPrompt;
        }
        if (result.PLAN_PROMPT) {
            planPromptEl.value = result.PLAN_PROMPT;
        } else {
            planPromptEl.value = defaultPrompts.planPrompt;
        }
    });

    // Test API key button
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

    // Enhanced save settings with validation
    saveBtn.addEventListener('click', async () => {
        if (!validateForm()) {
            return;
        }

        const apiKey = keyEl.value.trim();
        const model = modelEl.value;
        const searchPrompt = searchPromptEl.value.trim();
        const analysisPrompt = analysisPromptEl.value.trim();

        // Show loading state
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="loading"></span> Saving...';

        try {
            const settings = {
                OPENAI_API_KEY: apiKey,
                AI_MODEL: model,
                SEARCH_PROMPT: searchPrompt,
                ANALYSIS_PROMPT: analysisPrompt,
                PER_POST_PROMPT: perPostPromptEl.value.trim(),
                PITCH_PROMPT: pitchPromptEl.value.trim(),
                PLAN_PROMPT: planPromptEl.value.trim()
            };

            // Test API key if provided
            if (apiKey) {
                const isValidKey = await testAPIKey(apiKey);
                if (!isValidKey) {
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

            // Add success animation
            saveBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            setTimeout(() => {
                saveBtn.style.background = '';
            }, 2000);

        } catch (error) {
            console.error('Error saving settings:', error);
            showStatus('❌ Error saving settings: ' + error.message, 'error', 8000);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 Save Settings';
        }
    });

    // Enhanced form validation
    function validateForm() {
        const apiKey = keyEl.value.trim();
        const searchPrompt = searchPromptEl.value.trim();
        const analysisPrompt = analysisPromptEl.value.trim();

        // Clear previous validation states
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
        } else if (apiKey.length < 20) {
            setFieldError(keyEl, 'API key appears to be too short');
            isValid = false;
            errorMessage = 'API key appears to be too short';
        }

        if (!searchPrompt) {
            setFieldError(searchPromptEl, 'Search prompt is required');
            isValid = false;
            if (!errorMessage) errorMessage = 'Please enter a search prompt';
        } else if (searchPrompt.length < 50) {
            setFieldError(searchPromptEl, 'Search prompt should be more detailed');
            isValid = false;
            if (!errorMessage) errorMessage = 'Search prompt should be more detailed';
        }

        if (!analysisPrompt) {
            setFieldError(analysisPromptEl, 'Analysis prompt is required');
            isValid = false;
            if (!errorMessage) errorMessage = 'Please enter an analysis prompt';
        } else if (analysisPrompt.length < 50) {
            setFieldError(analysisPromptEl, 'Analysis prompt should be more detailed');
            isValid = false;
            if (!errorMessage) errorMessage = 'Analysis prompt should be more detailed';
        }

        if (!isValid) {
            showStatus('❌ ' + errorMessage, 'error', 5000);
        }

        isFormValid = isValid;
        return isValid;
    }

    // Test API key validity and get available models
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
            const models = data.data || [];

            return {
                isValid: true,
                models: models,
                error: null
            };
        } catch (error) {
            console.error('API key test failed:', error);
            return {
                isValid: false,
                models: [],
                error: error.message
            };
        }
    }

    // Test API key validity (legacy function for save button)
    async function testAPIKey(apiKey) {
        const result = await testAPIKeyAndGetModels(apiKey);
        return result.isValid;
    }

    // Load available models into dropdown
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

            // Filter for chat completion models
            const chatModels = models.filter(model =>
                model.id.includes('gpt-5') ||
                model.id.includes('gpt-4') ||
                model.id.includes('gpt-3.5') ||
                model.id.includes('o1')
            ).sort((a, b) => {
                // Sort by preference: gpt-5 first, then gpt-4o, then others
                const order = {
                    'gpt-5': 1,
                    'gpt-5-turbo': 2,
                    'gpt-4o': 3,
                    'gpt-4o-mini': 4,
                    'gpt-4-turbo': 5,
                    'gpt-3.5-turbo': 6
                };
                return (order[a.id] || 99) - (order[b.id] || 99);
            });

            // Clear and populate dropdown
            modelEl.innerHTML = '';

            if (chatModels.length === 0) {
                modelEl.innerHTML = '<option value="gpt-4o-mini">No models available</option>';
                return;
            }

            chatModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;

                // Add friendly names and descriptions
                let displayName = model.id;
                if (model.id === 'gpt-5') displayName = 'GPT-5 (Latest & Most Capable)';
                else if (model.id === 'gpt-5-turbo') displayName = 'GPT-5 Turbo (Fast & Powerful)';
                else if (model.id === 'gpt-4o') displayName = 'GPT-4o (Most Capable)';
                else if (model.id === 'gpt-4o-mini') displayName = 'GPT-4o Mini (Fast & Cheap)';
                else if (model.id === 'gpt-4-turbo') displayName = 'GPT-4 Turbo';
                else if (model.id === 'gpt-3.5-turbo') displayName = 'GPT-3.5 Turbo';

                option.textContent = displayName;
                modelEl.appendChild(option);
            });

            // Set default to gpt-5 if available, then gpt-4o-mini, otherwise first model
            const defaultModel = chatModels.find(m => m.id === 'gpt-5') ||
                chatModels.find(m => m.id === 'gpt-4o-mini') ||
                chatModels[0];
            if (defaultModel) {
                modelEl.value = defaultModel.id;
            }

        } catch (error) {
            console.error('Error loading models:', error);
            modelEl.innerHTML = '<option value="gpt-4o-mini">Error loading models</option>';
        }
    }

    // Show key status
    function showKeyStatus(message, type) {
        keyStatusEl.textContent = message;
        keyStatusEl.className = `status ${type}`;
        keyStatusEl.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            keyStatusEl.style.display = 'none';
        }, 5000);
    }

    // Set field error state
    function setFieldError(field, message) {
        field.style.borderColor = '#f44336';
        field.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';

        // Add error tooltip
        field.setAttribute('data-error', message);
        field.classList.add('error-field');
    }

    // Clear validation states
    function clearValidationStates() {
        const fields = [keyEl, searchPromptEl, analysisPromptEl];
        fields.forEach(field => {
            field.style.borderColor = '';
            field.style.boxShadow = '';
            field.removeAttribute('data-error');
            field.classList.remove('error-field');
        });
    }

    // Enhanced reset to defaults
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings to defaults? This will clear your custom prompts and API key.')) {
            // Clear all fields
            keyEl.value = '';
            modelEl.value = 'gpt-4o';
            searchPromptEl.value = defaultPrompts.searchPrompt;
            analysisPromptEl.value = defaultPrompts.analysisPrompt;
            perPostPromptEl.value = defaultPrompts.perPostPrompt;
            pitchPromptEl.value = defaultPrompts.pitchPrompt;
            planPromptEl.value = defaultPrompts.planPrompt;

            // Clear validation states
            clearValidationStates();

            // Show success message
            showStatus('🔄 Settings reset to defaults', 'success', 3000);

            // Add reset animation
            resetBtn.style.background = 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
            setTimeout(() => {
                resetBtn.style.background = '';
            }, 1000);
        }
    });

    // Enhanced status display with animations
    function showStatus(message, type, duration = 3000) {
        // Clear any existing timeout
        if (statusEl.timeoutId) {
            clearTimeout(statusEl.timeoutId);
        }

        statusEl.textContent = message;
        statusEl.className = `status ${type}`;

        // Add animation
        statusEl.style.display = 'block';
        statusEl.style.opacity = '0';
        statusEl.style.transform = 'translateY(-10px)';

        requestAnimationFrame(() => {
            statusEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            statusEl.style.opacity = '1';
            statusEl.style.transform = 'translateY(0)';
        });

        // Auto-hide with animation
        statusEl.timeoutId = setTimeout(() => {
            statusEl.style.opacity = '0';
            statusEl.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                statusEl.style.display = 'none';
                statusEl.timeoutId = null;
            }, 300);
        }, duration);
    }

    // Real-time validation
    function setupRealTimeValidation() {
        const fields = [keyEl, searchPromptEl, analysisPromptEl];

        fields.forEach(field => {
            field.addEventListener('input', () => {
                // Clear validation states on input
                clearValidationStates();

                // Debounce validation
                clearTimeout(validationTimeout);
                validationTimeout = setTimeout(() => {
                    validateForm();
                }, 500);
            });

            field.addEventListener('blur', () => {
                validateForm();
            });
        });
    }

    // Enhanced keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    saveBtn.click();
                }
                return;
            }

            switch (e.key) {
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        saveBtn.click();
                    }
                    break;
                case 'r':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        resetBtn.click();
                    }
                    break;
                case 'Escape':
                    // Clear status messages
                    if (statusEl.style.display === 'block') {
                        statusEl.style.display = 'none';
                    }
                    break;
            }
        });
    }

    // Initialize enhanced features
    setupRealTimeValidation();
    setupKeyboardShortcuts();

    // Add loading spinner CSS
    const style = document.createElement('style');
    style.textContent = `
        .loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .error-field {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
});
