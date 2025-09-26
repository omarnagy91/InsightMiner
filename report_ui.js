// Report UI JavaScript for AI Demand Intelligence Miner
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
    const generatePitches = document.getElementById('generatePitches');
    const pitchSection = document.getElementById('pitchSection');
    const pitchesList = document.getElementById('pitchesList');
    const regeneratePitches = document.getElementById('regeneratePitches');
    const selectPitch = document.getElementById('selectPitch');
    const finalPlanSection = document.getElementById('finalPlanSection');
    const finalPlanContent = document.getElementById('finalPlanContent');
    const status = document.getElementById('status');

    // Initialize the report
    initializeReport();

    async function initializeReport() {
        try {
            showStatus('Loading analysis data...', 'info');

            // Get analysis data from storage
            const { per_post_analysis } = await chrome.storage.local.get(['per_post_analysis']);

            if (!per_post_analysis || per_post_analysis.length === 0) {
                showStatus('No analysis data found. Please run AI analysis first.', 'error');
                return;
            }

            // Process the data
            extractedData = processExtractedData(per_post_analysis);

            // Render the sections
            renderSections();

            // Setup event listeners
            setupEventListeners();

            showStatus('Report loaded successfully!', 'success');

        } catch (error) {
            console.error('Error initializing report:', error);
            showStatus('Error loading report: ' + error.message, 'error');
        }
    }

    function processExtractedData(perPostAnalysis) {
        const processed = {
            ideas: [],
            issues: [],
            missing_features: [],
            pros: [],
            cons: [],
            emotions: []
        };

        perPostAnalysis.forEach(post => {
            if (post.items) {
                Object.keys(processed).forEach(category => {
                    if (post.items[category]) {
                        post.items[category].forEach(item => {
                            processed[category].push({
                                ...item,
                                post_url: post.post_url,
                                platform: post.platform,
                                topic: post.topic
                            });
                        });
                    }
                });
            }
        });

        // Calculate demand scores and sort
        Object.keys(processed).forEach(category => {
            processed[category] = calculateDemandScores(processed[category]);
            processed[category].sort((a, b) => b.demand_score - a.demand_score);
        });

        return processed;
    }

    function calculateDemandScores(items) {
        return items.map(item => {
            const mentionCount = items.filter(other =>
                other.label === item.label || other.problem === item.problem ||
                other.feature === item.feature || other.praise === item.praise ||
                other.complaint === item.complaint || other.driver === item.driver
            ).length;

            const freq_weight = 0.5;
            const recency_weight = 0.2;
            const engagement_weight = 0.15;
            const emotion_weight = 0.1;
            const confidence_weight = 0.05;

            const engagementScore = Math.min(item.evidence.length / 3, 1.0);
            const emotionScore = item.intensity ? item.intensity / 5 : 0.5;
            const confidenceScore = item.confidence || 0.5;

            const demand_score = freq_weight * Math.log(1 + mentionCount) +
                recency_weight * 1.0 +
                engagement_weight * engagementScore +
                emotion_weight * emotionScore +
                confidence_weight * confidenceScore;

            return {
                ...item,
                demand_score,
                mention_count: mentionCount
            };
        });
    }

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

    function getFilteredItems(category) {
        let items = extractedData[category] || [];

        // Filter by platform
        const platformFilterValue = platformFilter.value;
        if (platformFilterValue) {
            items = items.filter(item => item.platform === platformFilterValue);
        }

        // Sort items
        const sortByValue = sortBy.value;
        items.sort((a, b) => {
            switch (sortByValue) {
                case 'demand_score':
                    return b.demand_score - a.demand_score;
                case 'mention_count':
                    return b.mention_count - a.mention_count;
                case 'confidence':
                    return (b.confidence || 0) - (a.confidence || 0);
                default:
                    return 0;
            }
        });

        return items;
    }

    function createSectionElement(section, items) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section';
        sectionDiv.innerHTML = `
            <div class="section-header">
                <div class="section-title">
                    ${section.icon} ${section.title}
                    <span class="section-count">${items.length}</span>
                </div>
                <div class="section-controls">
                    <button class="btn btn-secondary btn-small select-all-section" data-category="${section.key}">
                        Select All
                    </button>
                    <button class="btn btn-secondary btn-small clear-section" data-category="${section.key}">
                        Clear
                    </button>
                </div>
            </div>
            <div class="items-list" id="items-${section.key}">
                ${items.map(item => createItemElement(item, section.key)).join('')}
            </div>
        `;

        return sectionDiv;
    }

    function createItemElement(item, category) {
        const itemId = `${category}-${item.id}`;
        const isSelected = selectedItems.has(itemId);

        let title, description;
        switch (category) {
            case 'ideas':
                title = item.label;
                description = `${item.what} - For ${item.who} because ${item.why}`;
                break;
            case 'issues':
                title = item.problem;
                description = `Context: ${item.context}`;
                break;
            case 'missing_features':
                title = item.feature;
                description = `Why needed: ${item.why_needed}`;
                break;
            case 'pros':
                title = item.praise;
                description = `Tool/Flow: ${item.tool_or_flow}`;
                break;
            case 'cons':
                title = item.complaint;
                description = `Tool/Flow: ${item.tool_or_flow}`;
                break;
            case 'emotions':
                title = item.driver;
                description = `Why: ${item.why} (Intensity: ${item.intensity}/5)`;
                break;
        }

        return `
            <div class="item ${isSelected ? 'selected' : ''}" data-item-id="${itemId}">
                <div class="item-header">
                    <input type="checkbox" class="item-checkbox" ${isSelected ? 'checked' : ''} 
                           data-item-id="${itemId}" data-category="${category}">
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
                                <div class="evidence-content" id="evidence-${itemId}">
                                    ${item.evidence.map(evidence => `
                                        <div class="evidence-quote">"${evidence.quote}"</div>
                                        <div class="evidence-source">${evidence.source || 'Anonymous'} - <a href="${evidence.url}" target="_blank">View Source</a></div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function setupEventListeners() {
        // Filter controls
        platformFilter.addEventListener('change', renderSections);
        sortBy.addEventListener('change', renderSections);
        showMerged.addEventListener('change', renderSections);

        // Selection controls
        selectAllVisible.addEventListener('click', selectAllVisibleItems);
        clearSelection.addEventListener('click', clearAllSelection);

        // Section controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-all-section')) {
                const category = e.target.dataset.category;
                selectAllInSection(category);
            } else if (e.target.classList.contains('clear-section')) {
                const category = e.target.dataset.category;
                clearSection(category);
            }
        });

        // Item selection
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('item-checkbox')) {
                const itemId = e.target.dataset.itemId;
                const category = e.target.dataset.category;
                toggleItemSelection(itemId, category, e.target.checked);
            }
        });

        // Item click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.item')) {
                const item = e.target.closest('.item');
                const checkbox = item.querySelector('.item-checkbox');
                if (checkbox && !e.target.classList.contains('evidence-trigger')) {
                    checkbox.checked = !checkbox.checked;
                    const itemId = checkbox.dataset.itemId;
                    const category = checkbox.dataset.category;
                    toggleItemSelection(itemId, category, checkbox.checked);
                }
            }
        });

        // Evidence popover
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('evidence-trigger')) {
                const itemId = e.target.dataset.itemId;
                const popover = document.getElementById(`evidence-${itemId}`);
                popover.classList.toggle('show');
            }
        });

        // Close evidence popover when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.evidence-popover')) {
                document.querySelectorAll('.evidence-content').forEach(popover => {
                    popover.classList.remove('show');
                });
            }
        });

        // Generate pitches
        generatePitches.addEventListener('click', handleGeneratePitches);
        regeneratePitches.addEventListener('click', handleGeneratePitches);
        selectPitch.addEventListener('click', handleSelectPitch);
    }

    function toggleItemSelection(itemId, category, isSelected) {
        if (isSelected) {
            selectedItems.add(itemId);
        } else {
            selectedItems.delete(itemId);
        }

        // Update UI
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemElement) {
            itemElement.classList.toggle('selected', isSelected);
        }

        updateSelectionCount();
    }

    function selectAllVisibleItems() {
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            if (!checkbox.checked) {
                checkbox.checked = true;
                const itemId = checkbox.dataset.itemId;
                const category = checkbox.dataset.category;
                toggleItemSelection(itemId, category, true);
            }
        });
    }

    function clearAllSelection() {
        selectedItems.clear();
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('.item').forEach(item => {
            item.classList.remove('selected');
        });
        updateSelectionCount();
    }

    function selectAllInSection(category) {
        const checkboxes = document.querySelectorAll(`[data-category="${category}"] .item-checkbox`);
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                checkbox.checked = true;
                const itemId = checkbox.dataset.itemId;
                toggleItemSelection(itemId, category, true);
            }
        });
    }

    function clearSection(category) {
        const checkboxes = document.querySelectorAll(`[data-category="${category}"] .item-checkbox`);
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkbox.checked = false;
                const itemId = checkbox.dataset.itemId;
                toggleItemSelection(itemId, category, false);
            }
        });
    }

    function updateSelectionCount() {
        const count = selectedItems.size;
        selectedCount.textContent = `${count} items selected`;
        finalSelectedCount.textContent = `${count} items selected`;

        if (count > 0) {
            generateControls.style.display = 'flex';
        } else {
            generateControls.style.display = 'none';
            pitchSection.classList.remove('show');
            finalPlanSection.classList.remove('show');
        }
    }

    async function handleGeneratePitches() {
        if (selectedItems.size === 0) {
            showStatus('Please select at least one item to generate pitches.', 'error');
            return;
        }

        try {
            generatePitches.disabled = true;
            generatePitches.innerHTML = '<div class="loading"></div>Generating Pitches...';
            showStatus('Generating solution pitches...', 'info');

            // Get selected items data
            const selectedItemsData = getSelectedItemsData();

            // Send message to background script
            const response = await chrome.runtime.sendMessage({
                type: 'GENERATE_PITCHES',
                selectedItems: selectedItemsData
            });

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
            generatePitches.disabled = false;
            generatePitches.innerHTML = '<span>Generate Solution Pitches</span>';
        }
    }

    function getSelectedItemsData() {
        const selectedData = [];

        selectedItems.forEach(itemId => {
            const [category, id] = itemId.split('-');
            const items = extractedData[category] || [];
            const item = items.find(item => item.id === id);
            if (item) {
                selectedData.push({
                    category,
                    ...item
                });
            }
        });

        return selectedData;
    }

    function renderPitches() {
        pitchesList.innerHTML = '';

        generatedPitches.forEach((pitch, index) => {
            const pitchElement = document.createElement('div');
            pitchElement.className = 'pitch-item';
            pitchElement.dataset.pitchIndex = index;
            pitchElement.innerHTML = `
                <div class="pitch-text">${pitch.pitch}</div>
                <div class="pitch-reasoning">${pitch.reasoning}</div>
            `;

            pitchElement.addEventListener('click', () => {
                document.querySelectorAll('.pitch-item').forEach(item => {
                    item.classList.remove('selected');
                });
                pitchElement.classList.add('selected');
                selectedPitch = pitch.pitch;
                selectPitch.style.display = 'inline-flex';
            });

            pitchesList.appendChild(pitchElement);
        });
    }

    async function handleSelectPitch() {
        if (!selectedPitch) {
            showStatus('Please select a pitch first.', 'error');
            return;
        }

        try {
            selectPitch.disabled = true;
            selectPitch.innerHTML = '<div class="loading"></div>Generating Plan...';
            showStatus('Generating final MVP plan...', 'info');

            const selectedItemsData = getSelectedItemsData();

            const response = await chrome.runtime.sendMessage({
                type: 'GENERATE_FINAL_PLAN',
                chosenPitch: selectedPitch,
                selectedItems: selectedItemsData
            });

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
            selectPitch.disabled = false;
            selectPitch.innerHTML = '<span>Generate Final Plan</span>';
        }
    }

    function renderFinalPlan(finalPlan) {
        finalPlanContent.innerHTML = `
            <div class="plan-section">
                <h3>🎯 Elevator Pitch</h3>
                <div class="plan-content">${finalPlan.elevator_pitch}</div>
            </div>

            <div class="plan-section">
                <h3>👤 Target User Persona</h3>
                <div class="plan-content">
                    <p><strong>Name:</strong> ${finalPlan.target_user_persona.name}</p>
                    <p><strong>Role:</strong> ${finalPlan.target_user_persona.role}</p>
                    <p><strong>Context:</strong> ${finalPlan.target_user_persona.context}</p>
                    <p><strong>Goals:</strong></p>
                    <ul class="plan-list">
                        ${finalPlan.target_user_persona.goals.map(goal => `<li>${goal}</li>`).join('')}
                    </ul>
                    <p><strong>Pain Points:</strong></p>
                    <ul class="plan-list">
                        ${finalPlan.target_user_persona.pain_points.map(pain => `<li>${pain}</li>`).join('')}
                    </ul>
                    <p><strong>Success Criteria:</strong></p>
                    <ul class="plan-list">
                        ${finalPlan.target_user_persona.success_criteria.map(criteria => `<li>${criteria}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="plan-section">
                <h3>⚙️ Tech Stack</h3>
                <div class="plan-content">
                    <p><strong>Frontend:</strong> ${finalPlan.tech_stack.frontend.join(', ')}</p>
                    <p><strong>Backend:</strong> ${finalPlan.tech_stack.backend.join(', ')}</p>
                    <p><strong>Data:</strong> ${finalPlan.tech_stack.data.join(', ')}</p>
                    <p><strong>Auth:</strong> ${finalPlan.tech_stack.auth}</p>
                    <p><strong>AI:</strong> ${finalPlan.tech_stack.ai.join(', ')}</p>
                    <p><strong>Infrastructure:</strong> ${finalPlan.tech_stack.infra.join(', ')}</p>
                    <p><strong>Why this stack:</strong> ${finalPlan.tech_stack.why_this_stack}</p>
                </div>
            </div>

            <div class="plan-section">
                <h3>📋 PRD - Problem & Goals</h3>
                <div class="plan-content">
                    <p><strong>Problem:</strong> ${finalPlan.prd.problem}</p>
                    <p><strong>Goals:</strong></p>
                    <ul class="plan-list">
                        ${finalPlan.prd.goals.map(goal => `<li>${goal}</li>`).join('')}
                    </ul>
                    <p><strong>Primary User JTBD:</strong></p>
                    <ul class="plan-list">
                        ${finalPlan.prd.primary_user_jtbd.map(jtbd => `<li>${jtbd}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="plan-section">
                <h3>🚀 MVP Scope</h3>
                <div class="plan-content">
                    <p><strong>Features in scope:</strong></p>
                    <ul class="plan-list">
                        ${finalPlan.prd.scope_mvp.map(feature => `
                            <li>
                                <strong>${feature.feature}</strong>
                                <ul>
                                    ${feature.acceptance_criteria.map(criteria => `<li>${criteria}</li>`).join('')}
                                </ul>
                            </li>
                        `).join('')}
                    </ul>
                    <p><strong>Out of scope:</strong></p>
                    <ul class="plan-list">
                        ${finalPlan.prd.out_of_scope.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="plan-section">
                <h3>🔄 User Flows</h3>
                <div class="plan-content">
                    ${finalPlan.prd.user_flows.map(flow => `
                        <p><strong>${flow.name}:</strong></p>
                        <ol class="plan-list">
                            ${flow.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    `).join('')}
                </div>
            </div>

            <div class="plan-section">
                <h3>🗄️ Data Model</h3>
                <div class="plan-content">
                    ${finalPlan.prd.data_model.map(entity => `
                        <p><strong>${entity.entity}:</strong></p>
                        <ul class="plan-list">
                            ${entity.fields.map(field => `<li>${field.name} (${field.type})${field.notes ? ` - ${field.notes}` : ''}</li>`).join('')}
                        </ul>
                    `).join('')}
                </div>
            </div>

            <div class="plan-section">
                <h3>🔌 APIs</h3>
                <div class="plan-content">
                    ${finalPlan.prd.apis.map(api => `
                        <p><strong>${api.method} ${api.path}</strong></p>
                        <p><strong>Request:</strong> ${api.request}</p>
                        <p><strong>Response:</strong> ${api.response}</p>
                    `).join('')}
                </div>
            </div>

            <div class="plan-section">
                <h3>📊 Success Metrics & Risks</h3>
                <div class="plan-content">
                    <p><strong>Success Metrics:</strong></p>
                    <ul class="plan-list">
                        ${finalPlan.prd.success_metrics.map(metric => `<li>${metric.metric}: ${metric.target}</li>`).join('')}
                    </ul>
                    <p><strong>Risks:</strong></p>
                    <ul class="plan-list">
                        ${finalPlan.prd.risks.map(risk => `<li>${risk}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="plan-section">
                <h3>⏰ 1-Day Implementation Plan</h3>
                <div class="plan-content">
                    <ol class="plan-list">
                        ${finalPlan.prd["1_day_plan"].map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            </div>
        `;
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';

        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 5000);
        }
    }
});
