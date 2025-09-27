/**
 * @file report_ui.js
 * @description This script powers the interactive report UI (report_ui.html).
 * It loads processed analysis data, renders it into categorized sections,
 * and allows the user to filter, sort, and select items. It also orchestrates
 * the generation of solution pitches and final MVP plans based on user selections.
 */
document.addEventListener('DOMContentLoaded', function () {
    let extractedData = null;
    let selectedItems = new Set();
    let generatedPitches = null;
    let selectedPitch = null;

    // DOM elements
    const sectionsGrid = document.getElementById('sectionsGrid');
    const platformFilter = document.getElementById('platformFilter');
    const sortBy = document.getElementById('sortBy');
    const showMerged = document.getElementById('showMerged');
    const selectedCount = document.getElementById('selectedCount');
    const selectAllVisible = document.getElementById('selectAllVisible');
    const clearSelection = document.getElementById('clearSelection');
    const generateControls = document.getElementById('generateControls');
    const finalSelectedCount = document.getElementById('finalSelectedCount');
    const generatePitchesBtn = document.getElementById('generatePitches');
    const pitchSection = document.getElementById('pitchSection');
    const pitchesList = document.getElementById('pitchesList');
    const regeneratePitchesBtn = document.getElementById('regeneratePitches');
    const selectPitchBtn = document.getElementById('selectPitch');
    const finalPlanSection = document.getElementById('finalPlanSection');
    const finalPlanContent = document.getElementById('finalPlanContent');
    const status = document.getElementById('status');

    /**
     * Initializes the report page by loading and processing analysis data from storage.
     */
    async function initializeReport() {
        try {
            showStatus('Loading analysis data...', 'info');
            const { per_post_analysis } = await chrome.storage.local.get(['per_post_analysis']);

            if (!per_post_analysis || per_post_analysis.length === 0) {
                showStatus('No analysis data found. Please run AI analysis first.', 'error');
                return;
            }

            extractedData = processExtractedData(per_post_analysis);
            renderSections();
            setupEventListeners();
            showStatus('Report loaded successfully!', 'success');
        } catch (error) {
            console.error('Error initializing report:', error);
            showStatus('Error loading report: ' + error.message, 'error');
        }
    }

    /**
     * Processes the raw per-post analysis data into a structured format for the report.
     * @param {Array<object>} perPostAnalysis - The raw analysis data from storage.
     * @returns {object} The processed data, categorized and scored.
     */
    function processExtractedData(perPostAnalysis) {
        const processed = { ideas: [], issues: [], missing_features: [], pros: [], cons: [], emotions: [] };

        perPostAnalysis.forEach(post => {
            if (post.items) {
                Object.keys(processed).forEach(category => {
                    if (post.items[category]) {
                        post.items[category].forEach(item => {
                            processed[category].push({ ...item, post_url: post.post_url, platform: post.platform, topic: post.topic });
                        });
                    }
                });
            }
        });

        Object.keys(processed).forEach(category => {
            processed[category] = calculateDemandScores(processed[category]);
            processed[category].sort((a, b) => b.demand_score - a.demand_score);
        });

        return processed;
    }

    /**
     * Calculates a demand score for each item based on various metrics.
     * @param {Array<object>} items - A list of insight items.
     * @returns {Array<object>} The items with `demand_score` and `mention_count` added.
     */
    function calculateDemandScores(items) {
        return items.map(item => {
            const mentionCount = items.filter(other => other.label === item.label || other.problem === item.problem).length;
            const engagementScore = Math.min((item.evidence || []).length / 3, 1.0);
            const emotionScore = item.intensity ? item.intensity / 5 : 0.5;
            const confidenceScore = item.confidence || 0.5;
            const demand_score = (0.5 * Math.log(1 + mentionCount)) + (0.2 * 1.0) + (0.15 * engagementScore) + (0.1 * emotionScore) + (0.05 * confidenceScore);
            return { ...item, demand_score, mention_count: mentionCount };
        });
    }

    /**
     * Renders all the sections and their items onto the page.
     */
    function renderSections() {
        const sections = [
            { key: 'ideas', title: '💡 Ideas', icon: '💡' },
            { key: 'issues', title: '⚠️ Issues', icon: '⚠️' },
            { key: 'missing_features', title: '🔧 Missing Features', icon: '🔧' },
            { key: 'pros', title: '✅ Pros', icon: '✅' },
            { key: 'cons', title: '❌ Cons', icon: '❌' },
            { key: 'emotions', title: '😊 Emotional Drivers', icon: '😊' }
        ];
        sectionsGrid.innerHTML = '';
        sections.forEach(section => {
            const items = getFilteredItems(section.key);
            const sectionElement = createSectionElement(section, items);
            sectionsGrid.appendChild(sectionElement);
        });
        updateSelectionCount();
    }

    /**
     * Filters and sorts items for a given category based on the UI controls.
     * @param {string} category - The category key (e.g., 'ideas').
     * @returns {Array<object>} The filtered and sorted list of items.
     */
    function getFilteredItems(category) {
        let items = extractedData[category] || [];
        const platformFilterValue = platformFilter.value;
        if (platformFilterValue) {
            items = items.filter(item => item.platform === platformFilterValue);
        }
        const sortByValue = sortBy.value;
        items.sort((a, b) => (b[sortByValue] || 0) - (a[sortByValue] || 0));
        return items;
    }

    /**
     * Creates the HTML element for a single section.
     * @param {object} section - The section configuration object.
     * @param {Array<object>} items - The items to render within the section.
     * @returns {HTMLElement} The created section element.
     */
    function createSectionElement(section, items) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section';
        sectionDiv.innerHTML = `
            <div class="section-header">
                <div class="section-title">${section.icon} ${section.title}<span class="section-count">${items.length}</span></div>
                <div class="section-controls">
                    <button class="btn btn-secondary btn-small select-all-section" data-category="${section.key}">Select All</button>
                    <button class="btn btn-secondary btn-small clear-section" data-category="${section.key}">Clear</button>
                </div>
            </div>
            <div class="items-list" id="items-${section.key}">${items.map(item => createItemElement(item, section.key)).join('')}</div>`;
        return sectionDiv;
    }

    /**
     * Creates the HTML string for a single item element.
     * @param {object} item - The item data.
     * @param {string} category - The category the item belongs to.
     * @returns {string} The HTML string for the item.
     */
    function createItemElement(item, category) {
        const itemId = `${category}-${item.id || Math.random().toString(36).substr(2, 9)}`;
        const isSelected = selectedItems.has(itemId);
        const title = item.label || item.problem || item.feature || item.praise || item.complaint || item.driver;
        const description = item.what ? `${item.what} - For ${item.who} because ${item.why}` : (item.context || item.why_needed || item.tool_or_flow || `Intensity: ${item.intensity}/5`);
        return `
            <div class="item ${isSelected ? 'selected' : ''}" data-item-id="${itemId}">
                <div class="item-header">
                    <input type="checkbox" class="item-checkbox" ${isSelected ? 'checked' : ''} data-item-id="${itemId}" data-category="${category}">
                    <div class="item-content">
                        <div class="item-title">${title}</div>
                        <div class="item-description">${description}</div>
                        <div class="item-meta">
                            <span>📊 Score: ${item.demand_score.toFixed(2)}</span>
                            <span>💬 Mentions: ${item.mention_count}</span>
                            <span>🎯 Confidence: ${Math.round((item.confidence || 0.5) * 100)}%</span>
                            <span>🌐 ${item.platform}</span>
                            <div class="evidence-popover">
                                <span class="evidence-trigger" data-item-id="${itemId}">📝 Evidence</span>
                                <div class="evidence-content" id="evidence-${itemId}">${(item.evidence || []).map(e => `<div class="evidence-quote">"${e.quote}"</div><div class="evidence-source">${e.source || 'Anonymous'} - <a href="${e.url}" target="_blank">View Source</a></div>`).join('')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    /**
     * Sets up all the event listeners for the report UI controls.
     */
    function setupEventListeners() {
        platformFilter.addEventListener('change', renderSections);
        sortBy.addEventListener('change', renderSections);
        showMerged.addEventListener('change', renderSections);
        selectAllVisible.addEventListener('click', selectAllVisibleItems);
        clearSelection.addEventListener('click', clearAllSelection);

        document.addEventListener('click', e => {
            if (e.target.classList.contains('select-all-section')) selectAllInSection(e.target.dataset.category);
            if (e.target.classList.contains('clear-section')) clearSection(e.target.dataset.category);
            if (e.target.closest('.item')) {
                const item = e.target.closest('.item');
                const checkbox = item.querySelector('.item-checkbox');
                if (checkbox && !e.target.classList.contains('evidence-trigger')) {
                    checkbox.checked = !checkbox.checked;
                    toggleItemSelection(checkbox.dataset.itemId, checkbox.dataset.category, checkbox.checked);
                }
            }
            if (e.target.classList.contains('evidence-trigger')) {
                const popover = document.getElementById(`evidence-${e.target.dataset.itemId}`);
                popover.classList.toggle('show');
            }
            if (!e.target.closest('.evidence-popover')) {
                document.querySelectorAll('.evidence-content.show').forEach(p => p.classList.remove('show'));
            }
        });

        document.addEventListener('change', e => {
            if (e.target.classList.contains('item-checkbox')) {
                toggleItemSelection(e.target.dataset.itemId, e.target.dataset.category, e.target.checked);
            }
        });

        generatePitchesBtn.addEventListener('click', handleGeneratePitches);
        regeneratePitchesBtn.addEventListener('click', handleGeneratePitches);
        selectPitchBtn.addEventListener('click', handleSelectPitch);
    }

    /**
     * Toggles the selection state of an item.
     * @param {string} itemId - The unique ID of the item.
     * @param {string} category - The category of the item.
     * @param {boolean} isSelected - Whether the item is being selected or deselected.
     */
    function toggleItemSelection(itemId, category, isSelected) {
        if (isSelected) selectedItems.add(itemId);
        else selectedItems.delete(itemId);
        document.querySelector(`[data-item-id="${itemId}"]`)?.classList.toggle('selected', isSelected);
        updateSelectionCount();
    }

    /**
     * Selects all items currently visible on the page.
     */
    function selectAllVisibleItems() {
        document.querySelectorAll('.item-checkbox:not(:checked)').forEach(cb => {
            cb.checked = true;
            toggleItemSelection(cb.dataset.itemId, cb.dataset.category, true);
        });
    }

    /**
     * Clears the entire selection.
     */
    function clearAllSelection() {
        selectedItems.clear();
        document.querySelectorAll('.item-checkbox:checked').forEach(cb => cb.checked = false);
        document.querySelectorAll('.item.selected').forEach(item => item.classList.remove('selected'));
        updateSelectionCount();
    }

    /**
     * Selects all items within a specific category.
     * @param {string} category - The category key.
     */
    function selectAllInSection(category) {
        document.querySelectorAll(`#items-${category} .item-checkbox:not(:checked)`).forEach(cb => {
            cb.checked = true;
            toggleItemSelection(cb.dataset.itemId, category, true);
        });
    }

    /**
     * Clears the selection within a specific category.
     * @param {string} category - The category key.
     */
    function clearSection(category) {
        document.querySelectorAll(`#items-${category} .item-checkbox:checked`).forEach(cb => {
            cb.checked = false;
            toggleItemSelection(cb.dataset.itemId, category, false);
        });
    }

    /**
     * Updates the UI element that displays the count of selected items.
     */
    function updateSelectionCount() {
        const count = selectedItems.size;
        selectedCount.textContent = `${count} items selected`;
        finalSelectedCount.textContent = `${count} items selected`;
        generateControls.style.display = count > 0 ? 'flex' : 'none';
        if (count === 0) {
            pitchSection.classList.remove('show');
            finalPlanSection.classList.remove('show');
        }
    }

    /**
     * Handles the request to generate solution pitches from the selected items.
     */
    async function handleGeneratePitches() {
        if (selectedItems.size === 0) {
            showStatus('Please select at least one item to generate pitches.', 'error');
            return;
        }
        try {
            generatePitchesBtn.disabled = true;
            generatePitchesBtn.innerHTML = '<div class="loading"></div>Generating Pitches...';
            showStatus('Generating solution pitches...', 'info');
            const selectedItemsData = getSelectedItemsData();
            const response = await chrome.runtime.sendMessage({ type: 'GENERATE_PITCHES', selectedItems: selectedItemsData });
            if (response.success) {
                generatedPitches = response.pitches;
                renderPitches();
                pitchSection.classList.add('show');
                showStatus('Pitches generated successfully!', 'success');
            } else {
                throw new Error(response.error || 'Failed to generate pitches');
            }
        } catch (error) {
            console.error('Error generating pitches:', error);
            showStatus('Error generating pitches: ' + error.message, 'error');
        } finally {
            generatePitchesBtn.disabled = false;
            generatePitchesBtn.innerHTML = '<span>Generate Solution Pitches</span>';
        }
    }

    /**
     * Gathers the full data objects for all currently selected items.
     * @returns {Array<object>} An array of the selected item data.
     */
    function getSelectedItemsData() {
        const selectedData = [];
        selectedItems.forEach(itemId => {
            const [category, id] = itemId.split(/-(.*)/s);
            const item = (extractedData[category] || []).find(i => (i.id || Math.random().toString(36).substr(2, 9)) === id);
            if (item) selectedData.push({ category, ...item });
        });
        return selectedData;
    }

    /**
     * Renders the list of generated pitches.
     */
    function renderPitches() {
        pitchesList.innerHTML = '';
        generatedPitches.forEach((pitch, index) => {
            const pitchElement = document.createElement('div');
            pitchElement.className = 'pitch-item';
            pitchElement.dataset.pitchIndex = index;
            pitchElement.innerHTML = `<div class="pitch-text">${pitch.pitch}</div><div class="pitch-reasoning">${pitch.reasoning}</div>`;
            pitchElement.addEventListener('click', () => {
                document.querySelectorAll('.pitch-item.selected').forEach(item => item.classList.remove('selected'));
                pitchElement.classList.add('selected');
                selectedPitch = pitch.pitch;
                selectPitchBtn.style.display = 'inline-flex';
            });
            pitchesList.appendChild(pitchElement);
        });
    }

    /**
     * Handles the request to generate the final MVP plan based on the selected pitch.
     */
    async function handleSelectPitch() {
        if (!selectedPitch) {
            showStatus('Please select a pitch first.', 'error');
            return;
        }
        try {
            selectPitchBtn.disabled = true;
            selectPitchBtn.innerHTML = '<div class="loading"></div>Generating Plan...';
            showStatus('Generating final MVP plan...', 'info');
            const selectedItemsData = getSelectedItemsData();
            const response = await chrome.runtime.sendMessage({ type: 'GENERATE_FINAL_PLAN', chosenPitch: selectedPitch, selectedItems: selectedItemsData });
            if (response.success) {
                renderFinalPlan(response.finalPlan);
                finalPlanSection.classList.add('show');
                showStatus('Final plan generated successfully!', 'success');
            } else {
                throw new Error(response.error || 'Failed to generate final plan');
            }
        } catch (error) {
            console.error('Error generating final plan:', error);
            showStatus('Error generating final plan: ' + error.message, 'error');
        } finally {
            selectPitchBtn.disabled = false;
            selectPitchBtn.innerHTML = '<span>Generate Final Plan</span>';
        }
    }

    /**
     * Renders the final generated MVP plan into the UI.
     * @param {object} finalPlan - The final plan object returned from the background script.
     */
    function renderFinalPlan(finalPlan) {
        finalPlanContent.innerHTML = `
            <div class="plan-section"><h3>🎯 Elevator Pitch</h3><div class="plan-content">${finalPlan.elevator_pitch}</div></div>
            <div class="plan-section"><h3>👤 Target User Persona</h3><div class="plan-content"><p><strong>Name:</strong> ${finalPlan.target_user_persona.name}</p><p><strong>Role:</strong> ${finalPlan.target_user_persona.role}</p><p><strong>Context:</strong> ${finalPlan.target_user_persona.context}</p><p><strong>Goals:</strong></p><ul class="plan-list">${finalPlan.target_user_persona.goals.map(g => `<li>${g}</li>`).join('')}</ul><p><strong>Pain Points:</strong></p><ul class="plan-list">${finalPlan.target_user_persona.pain_points.map(p => `<li>${p}</li>`).join('')}</ul></div></div>
            <div class="plan-section"><h3>⚙️ Tech Stack</h3><div class="plan-content"><p><strong>Frontend:</strong> ${finalPlan.tech_stack.frontend.join(', ')}</p><p><strong>Backend:</strong> ${finalPlan.tech_stack.backend.join(', ')}</p><p><strong>Why:</strong> ${finalPlan.tech_stack.why_this_stack}</p></div></div>
            <div class="plan-section"><h3>🚀 MVP Scope</h3><div class="plan-content"><p><strong>Features:</strong></p><ul class="plan-list">${finalPlan.prd.scope_mvp.map(f => `<li><strong>${f.feature}</strong><ul>${f.acceptance_criteria.map(ac => `<li>${ac}</li>`).join('')}</ul></li>`).join('')}</ul><p><strong>Out of scope:</strong></p><ul class="plan-list">${finalPlan.prd.out_of_scope.map(item => `<li>${item}</li>`).join('')}</ul></div></div>
            <div class="plan-section"><h3>⏰ 1-Day Implementation Plan</h3><div class="plan-content"><ol class="plan-list">${finalPlan.prd["1_day_plan"].map(step => `<li>${step}</li>`).join('')}</ol></div></div>`;
    }

    /**
     * Displays a status message to the user.
     * @param {string} message - The message to display.
     * @param {string} type - The type of message ('success', 'error', 'info').
     */
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        if (type !== 'info') {
            setTimeout(() => { status.style.display = 'none'; }, 5000);
        }
    }

    // Initialize the report when the DOM is loaded.
    initializeReport();
});