// Options page JavaScript for AI Demand Intelligence Miner
document.addEventListener('DOMContentLoaded', function () {
    const keyEl = document.getElementById('key');
    const modelEl = document.getElementById('model');
    const searchPromptEl = document.getElementById('searchPrompt');
    const analysisPromptEl = document.getElementById('analysisPrompt');
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');
    const statusEl = document.getElementById('status');

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

    // Save settings
    saveBtn.addEventListener('click', () => {
        const apiKey = keyEl.value.trim();
        const model = modelEl.value;
        const searchPrompt = searchPromptEl.value.trim();
        const analysisPrompt = analysisPromptEl.value.trim();

        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            showStatus('API key should start with "sk-"', 'error');
            return;
        }

        if (!searchPrompt) {
            showStatus('Please enter a search prompt', 'error');
            return;
        }

        if (!analysisPrompt) {
            showStatus('Please enter an analysis prompt', 'error');
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const settings = {
            OPENAI_API_KEY: apiKey,
            AI_MODEL: model,
            SEARCH_PROMPT: searchPrompt,
            ANALYSIS_PROMPT: analysisPrompt
        };

        chrome.storage.local.set(settings, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving settings:', chrome.runtime.lastError);
                showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
            } else {
                console.log('Settings saved successfully');
                showStatus('Settings saved successfully!', 'success');
            }
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Settings';
        });
    });

    // Reset to defaults
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings to defaults? This will clear your custom prompts.')) {
            modelEl.value = 'gpt-4o';
            searchPromptEl.value = defaultPrompts.searchPrompt;
            analysisPromptEl.value = defaultPrompts.analysisPrompt;
            showStatus('Settings reset to defaults', 'success');
        }
    });

    // Show status message
    function showStatus(message, type) {
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.style.display = 'block';

        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }

    // Allow Enter key to save
    keyEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });
});
