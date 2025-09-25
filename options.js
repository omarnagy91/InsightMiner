// Options page JavaScript for Reddit AI Demand Miner
document.addEventListener('DOMContentLoaded', function () {
    const keyEl = document.getElementById('key');
    const saveBtn = document.getElementById('save');
    const statusEl = document.getElementById('status');

    // Load existing API key
    chrome.storage.local.get(['OPENAI_API_KEY'], ({ OPENAI_API_KEY }) => {
        if (OPENAI_API_KEY) {
            keyEl.value = OPENAI_API_KEY;
        }
    });

    // Save API key
    saveBtn.addEventListener('click', () => {
        const apiKey = keyEl.value.trim();

        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            showStatus('API key should start with "sk-"', 'error');
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        chrome.storage.local.set({ OPENAI_API_KEY: apiKey }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving API key:', chrome.runtime.lastError);
                showStatus('Error saving API key: ' + chrome.runtime.lastError.message, 'error');
            } else {
                console.log('API key saved successfully');
                showStatus('API key saved successfully!', 'success');
            }
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save API Key';
        });
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
