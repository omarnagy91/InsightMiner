// Enhanced Options page JavaScript for AI Demand Intelligence Miner
document.addEventListener('DOMContentLoaded', function () {
    const keyEl = document.getElementById('key');
    const modelEl = document.getElementById('model');
    const searchPromptEl = document.getElementById('searchPrompt');
    const analysisPromptEl = document.getElementById('analysisPrompt');
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');
    const statusEl = document.getElementById('status');

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

Be concise, non-speculative, and focus on actionable insights.`
    };

    // Load existing settings
    chrome.storage.local.get([
        'OPENAI_API_KEY',
        'AI_MODEL',
        'SEARCH_PROMPT',
        'ANALYSIS_PROMPT'
    ], (result) => {
        if (result.OPENAI_API_KEY) {
            keyEl.value = result.OPENAI_API_KEY;
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
                ANALYSIS_PROMPT: analysisPrompt
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

    // Test API key validity
    async function testAPIKey(apiKey) {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('API key test failed:', error);
            return false;
        }
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
