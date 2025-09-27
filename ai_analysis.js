/**
 * @file ai_analysis.js
 * @description This script handles the functionality of the full-screen AI analysis results page (ai_analysis.html).
 * It loads the analysis data from `chrome.storage.local`, populates the statistics and content sections,
 * and manages user interactions like exporting data.
 */
document.addEventListener('DOMContentLoaded', function () {
    const loadingSection = document.getElementById('loadingSection');
    const errorSection = document.getElementById('errorSection');
    const noDataSection = document.getElementById('noDataSection');
    const analysisContent = document.getElementById('analysisContent');
    const errorMessage = document.getElementById('errorMessage');

    // Statistics elements
    const totalPosts = document.getElementById('totalPosts');
    const totalTools = document.getElementById('totalTools');
    const mvpCount = document.getElementById('mvpCount');
    const avgConfidence = document.getElementById('avgConfidence');
    const analysisTimestamp = document.getElementById('analysisTimestamp');

    // Content elements
    const topToolsList = document.getElementById('topToolsList');
    const mvpList = document.getElementById('mvpList');
    const issuesList = document.getElementById('issuesList');
    const prosList = document.getElementById('prosList');
    const actionPlanSteps = document.getElementById('actionPlanSteps');

    // Export buttons
    const exportJSON = document.getElementById('exportJSON');
    const exportSummary = document.getElementById('exportSummary');
    const shareResults = document.getElementById('shareResults');

    /**
     * Initializes the analysis page. It attempts to load data from local storage,
     * handling cases where data is from a file upload or from a regular analysis run.
     * It then calls the appropriate functions to display the data or show an error/no-data message.
     */
    async function initializePage() {
        try {
            showLoading();

            // Check if this is a report loaded from file upload
            const { temp_report_data, report_source } = await chrome.storage.local.get([
                'temp_report_data',
                'report_source'
            ]);

            if (report_source === 'file_upload' && temp_report_data) {
                // Load report data from file upload
                const { per_post_analysis, aggregated_analysis } = temp_report_data;

                if (!aggregated_analysis) {
                    showNoData();
                    return;
                }

                // Display the analysis results
                displayAnalysisResults(per_post_analysis || [], aggregated_analysis);

                // Clear temporary data
                await chrome.storage.local.remove(['temp_report_data', 'report_source']);

                hideLoading();
                showContent();
                return;
            }

            // Get analysis data from regular storage
            const { per_post_analysis, aggregated_analysis } = await chrome.storage.local.get([
                'per_post_analysis',
                'aggregated_analysis'
            ]);

            if (!aggregated_analysis) {
                showNoData();
                return;
            }

            // Display the analysis results
            displayAnalysisResults(per_post_analysis || [], aggregated_analysis);
            hideLoading();
            showContent();

        } catch (error) {
            console.error('Error initializing analysis page:', error);
            showError('Failed to load analysis results: ' + error.message);
        }
    }

    /**
     * Shows the loading spinner and hides other sections.
     */
    function showLoading() {
        loadingSection.style.display = 'block';
        errorSection.style.display = 'none';
        noDataSection.style.display = 'none';
        analysisContent.style.display = 'none';
    }

    /**
     * Hides the loading spinner.
     */
    function hideLoading() {
        loadingSection.style.display = 'none';
    }

    /**
     * Displays an error message.
     * @param {string} message - The error message to display.
     */
    function showError(message) {
        errorMessage.textContent = message;
        loadingSection.style.display = 'none';
        errorSection.style.display = 'block';
        noDataSection.style.display = 'none';
        analysisContent.style.display = 'none';
    }

    /**
     * Displays the "No Data" message.
     */
    function showNoData() {
        loadingSection.style.display = 'none';
        errorSection.style.display = 'none';
        noDataSection.style.display = 'block';
        analysisContent.style.display = 'none';
    }

    /**
     * Shows the main content section.
     */
    function showContent() {
        loadingSection.style.display = 'none';
        errorSection.style.display = 'none';
        noDataSection.style.display = 'none';
        analysisContent.style.display = 'block';
    }

    /**
     * Populates the entire page with the provided analysis results.
     * @param {Array<object>} perPostAnalysis - The array of per-post analysis results.
     * @param {object} aggregatedAnalysis - The aggregated analysis results.
     */
    function displayAnalysisResults(perPostAnalysis, aggregatedAnalysis) {
        // Update statistics
        updateStatistics(perPostAnalysis, aggregatedAnalysis);

        // Update content sections
        updateTopTools(aggregatedAnalysis.top_requested_tools || []);
        updateMVPRecommendations(aggregatedAnalysis.mvp_recommendations || []);
        updateCommonIssues(aggregatedAnalysis.common_issues || []);
        updatePraisedFeatures(aggregatedAnalysis.common_pros || []);
        updateActionPlan(aggregatedAnalysis.short_action_plan || '');

        // Update timestamp
        if (aggregatedAnalysis._meta && aggregatedAnalysis._meta.generatedAt) {
            const date = new Date(aggregatedAnalysis._meta.generatedAt);
            analysisTimestamp.textContent = `Generated on ${date.toLocaleString()}`;
        } else {
            analysisTimestamp.textContent = 'Generated recently';
        }
    }

    /**
     * Updates the statistics section of the page.
     * @param {Array<object>} perPostAnalysis - The array of per-post analysis results.
     * @param {object} aggregatedAnalysis - The aggregated analysis results.
     */
    function updateStatistics(perPostAnalysis, aggregatedAnalysis) {
        // Total posts analyzed
        totalPosts.textContent = perPostAnalysis.length;

        // Total unique tools
        const toolCounts = aggregatedAnalysis.tool_request_counts || {};
        totalTools.textContent = Object.keys(toolCounts).length;

        // MVP count
        const mvpRecs = aggregatedAnalysis.mvp_recommendations || [];
        mvpCount.textContent = mvpRecs.length;

        // Average confidence score
        if (perPostAnalysis.length > 0) {
            const totalConfidence = perPostAnalysis.reduce((sum, post) => {
                return sum + (post.confidence_score || 0);
            }, 0);
            const avgConf = Math.round((totalConfidence / perPostAnalysis.length) * 100);
            avgConfidence.textContent = `${avgConf}%`;
        } else {
            avgConfidence.textContent = '0%';
        }
    }

    /**
     * Populates the "Top Requested Tools" list.
     * @param {Array<string>} tools - An array of tool names.
     */
    function updateTopTools(tools) {
        topToolsList.innerHTML = '';

        if (tools.length === 0) {
            topToolsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No tools identified</p>';
            return;
        }

        tools.slice(0, 10).forEach((tool, index) => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="text">${tool}</span>
            `;
            topToolsList.appendChild(item);
        });
    }

    /**
     * Populates the "MVP Recommendations" list.
     * @param {Array<string>} mvpRecs - An array of MVP recommendation strings.
     */
    function updateMVPRecommendations(mvpRecs) {
        mvpList.innerHTML = '';

        if (mvpRecs.length === 0) {
            mvpList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No MVP recommendations</p>';
            return;
        }

        mvpRecs.slice(0, 8).forEach((rec, index) => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="text">${rec}</span>
            `;
            mvpList.appendChild(item);
        });
    }

    /**
     * Populates the "Common Issues" list.
     * @param {Array<string>} issues - An array of common issue strings.
     */
    function updateCommonIssues(issues) {
        issuesList.innerHTML = '';

        if (issues.length === 0) {
            issuesList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No common issues identified</p>';
            return;
        }

        issues.slice(0, 8).forEach((issue, index) => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="text">${issue}</span>
            `;
            issuesList.appendChild(item);
        });
    }

    /**
     * Populates the "Praised Features" list.
     * @param {Array<string>} pros - An array of praised feature strings.
     */
    function updatePraisedFeatures(pros) {
        prosList.innerHTML = '';

        if (pros.length === 0) {
            prosList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No praised features identified</p>';
            return;
        }

        pros.slice(0, 8).forEach((pro, index) => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="text">${pro}</span>
            `;
            prosList.appendChild(item);
        });
    }

    /**
     * Populates the "Action Plan" section.
     * @param {string} actionPlan - The action plan string, which may contain steps.
     */
    function updateActionPlan(actionPlan) {
        actionPlanSteps.innerHTML = '';

        if (!actionPlan) {
            actionPlanSteps.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No action plan available</p>';
            return;
        }

        // Split action plan into steps (assuming it's formatted with numbers or bullet points)
        const steps = actionPlan.split(/\n|\.\s*\d+\./).filter(step => step.trim().length > 0);

        if (steps.length === 0) {
            // If no clear steps, display as a single paragraph
            const stepDiv = document.createElement('div');
            stepDiv.className = 'action-step';
            stepDiv.innerHTML = `
                <div class="step-number">1</div>
                <div class="step-content">
                    <div class="step-description">${actionPlan}</div>
                </div>
            `;
            actionPlanSteps.appendChild(stepDiv);
        } else {
            steps.forEach((step, index) => {
                if (step.trim().length > 0) {
                    const stepDiv = document.createElement('div');
                    stepDiv.className = 'action-step';
                    stepDiv.innerHTML = `
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <div class="step-description">${step.trim()}</div>
                        </div>
                    `;
                    actionPlanSteps.appendChild(stepDiv);
                }
            });
        }
    }

    /**
     * Handles the click event for the "Export JSON" button.
     * It retrieves the full analysis data and triggers a download.
     */
    exportJSON.addEventListener('click', async () => {
        try {
            const { per_post_analysis, aggregated_analysis } = await chrome.storage.local.get([
                'per_post_analysis',
                'aggregated_analysis'
            ]);

            if (!aggregated_analysis) {
                alert('No analysis data available to export');
                return;
            }

            const exportData = {
                timestamp: new Date().toISOString(),
                per_post_analysis: per_post_analysis || [],
                aggregated_analysis: aggregated_analysis,
                export_info: {
                    exported_from: 'AI Analysis Tab',
                    version: '1.0.0'
                }
            };

            const jsonData = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `ai_analysis_detailed_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error exporting JSON:', error);
            alert('Error exporting data: ' + error.message);
        }
    });

    /**
     * Handles the click event for the "Export Summary" button.
     * Currently, it shows an alert as PDF generation is a future feature.
     */
    exportSummary.addEventListener('click', () => {
        // For now, just show an alert. In a real implementation, you'd use a PDF library
        alert('PDF export feature coming soon! For now, you can use the browser\'s print function (Ctrl+P) to save as PDF.');
    });

    /**
     * Handles the click event for the "Share Results" button.
     * It creates a text summary of the results and copies it to the clipboard.
     */
    shareResults.addEventListener('click', async () => {
        try {
            const { aggregated_analysis } = await chrome.storage.local.get(['aggregated_analysis']);

            if (!aggregated_analysis) {
                alert('No analysis data available to share');
                return;
            }

            // Create a shareable summary
            const summary = createShareableSummary(aggregated_analysis);

            // Copy to clipboard
            await navigator.clipboard.writeText(summary);
            alert('Analysis summary copied to clipboard! You can now paste it anywhere to share.');

        } catch (error) {
            console.error('Error sharing results:', error);
            alert('Error sharing results: ' + error.message);
        }
    });

    /**
     * Creates a concise, shareable text summary of the analysis results.
     * @param {object} analysis - The aggregated analysis data.
     * @returns {string} The formatted summary string.
     */
    function createShareableSummary(analysis) {
        const topTools = (analysis.top_requested_tools || []).slice(0, 5);
        const mvpRecs = (analysis.mvp_recommendations || []).slice(0, 3);

        return `🤖 AI Analysis Results - InsightMiner

🎯 Top Requested Tools:
${topTools.map((tool, i) => `${i + 1}. ${tool}`).join('\n')}

💡 Top MVP Recommendations:
${mvpRecs.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

📋 Action Plan:
${analysis.short_action_plan || 'No action plan available'}

Generated by InsightMiner Chrome Extension
#AI #ProductResearch #MultiPlatformAnalysis`;
    }

    /**
     * Listens for changes in `chrome.storage.local` and re-initializes the page
     * if the analysis data is updated, allowing for real-time updates.
     */
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.aggregated_analysis || changes.per_post_analysis) {
                // Reload the page when analysis data changes
                setTimeout(() => {
                    initializePage();
                }, 1000);
            }
        }
    });

    // Initial call to load the page data.
    initializePage();
});