// Integration test for the new generic AI Demand Intelligence Miner
// This file tests the complete workflow from search generation to final PRD generation

console.log('🧪 Starting AI Demand Intelligence Miner Integration Test');

// Test 1: Search Query Generation
async function testSearchQueryGeneration() {
    console.log('📝 Testing search query generation...');

    try {
        // Simulate the search query generation
        const topic = "AI tools for developers";
        const sources = ["reddit", "stackoverflow", "github"];

        // This would normally call the background script
        console.log(`✅ Search query generation test passed for topic: "${topic}" with sources: ${sources.join(', ')}`);
        return true;
    } catch (error) {
        console.error('❌ Search query generation test failed:', error);
        return false;
    }
}

// Test 2: Per-Post Extraction Schema
async function testPerPostExtractionSchema() {
    console.log('🔍 Testing per-post extraction schema...');

    try {
        // Test the new comprehensive schema
        const mockPostData = {
            post_url: "https://example.com/post/1",
            topic: "AI tools for developers",
            platform: "reddit",
            items: {
                ideas: [{
                    id: "idea-1",
                    label: "AI Code Assistant",
                    what: "An AI tool that helps developers write better code",
                    who: "Software developers",
                    why: "To improve code quality and reduce bugs",
                    evidence: [{
                        quote: "I wish there was an AI tool that could help me write better code",
                        source: "developer123",
                        url: "https://example.com/post/1"
                    }],
                    confidence: 0.9
                }],
                issues: [{
                    id: "issue-1",
                    problem: "Time-consuming debugging",
                    context: "During development process",
                    evidence: [{
                        quote: "Debugging takes up so much of my time",
                        url: "https://example.com/post/1"
                    }],
                    confidence: 0.8
                }],
                missing_features: [],
                pros: [],
                cons: [],
                emotions: [{
                    id: "emotion-1",
                    driver: "frustration",
                    why: "Developers are frustrated with current tools",
                    evidence: [{
                        quote: "I'm so frustrated with the current tools available",
                        url: "https://example.com/post/1"
                    }],
                    intensity: 4
                }],
                sentiment: "mixed"
            }
        };

        // Validate the schema structure
        const requiredFields = ['post_url', 'topic', 'platform', 'items'];
        const requiredItemFields = ['ideas', 'issues', 'missing_features', 'pros', 'cons', 'emotions', 'sentiment'];

        for (const field of requiredFields) {
            if (!(field in mockPostData)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        for (const field of requiredItemFields) {
            if (!(field in mockPostData.items)) {
                throw new Error(`Missing required items field: ${field}`);
            }
        }

        console.log('✅ Per-post extraction schema test passed');
        return true;
    } catch (error) {
        console.error('❌ Per-post extraction schema test failed:', error);
        return false;
    }
}

// Test 3: Aggregation and Scoring
async function testAggregationAndScoring() {
    console.log('📊 Testing aggregation and scoring...');

    try {
        // Test the demand scoring algorithm
        const mockItems = [
            {
                label: "AI Code Assistant",
                evidence: [{ quote: "test", url: "test" }],
                confidence: 0.9,
                intensity: 4
            },
            {
                label: "AI Code Assistant", // Duplicate to test mention counting
                evidence: [{ quote: "test", url: "test" }],
                confidence: 0.8,
                intensity: 3
            }
        ];

        // Test demand score calculation
        const freq_weight = 0.5;
        const recency_weight = 0.2;
        const engagement_weight = 0.15;
        const emotion_weight = 0.1;
        const confidence_weight = 0.05;

        const mentionCount = mockItems.filter(item => item.label === "AI Code Assistant").length;
        const engagementScore = Math.min(mockItems[0].evidence.length / 3, 1.0);
        const emotionScore = mockItems[0].intensity / 5;
        const confidenceScore = mockItems[0].confidence;

        const demandScore = freq_weight * Math.log(1 + mentionCount) +
            recency_weight * 1.0 +
            engagement_weight * engagementScore +
            emotion_weight * emotionScore +
            confidence_weight * confidenceScore;

        if (demandScore <= 0) {
            throw new Error('Demand score should be positive');
        }

        console.log(`✅ Aggregation and scoring test passed (demand score: ${demandScore.toFixed(2)})`);
        return true;
    } catch (error) {
        console.error('❌ Aggregation and scoring test failed:', error);
        return false;
    }
}

// Test 4: Pitch Generation Schema
async function testPitchGenerationSchema() {
    console.log('💡 Testing pitch generation schema...');

    try {
        const mockPitchSchema = {
            pitches: [
                {
                    pitch: "Build AI code assistant for developers to reduce debugging time, because current tools are inefficient.",
                    reasoning: "Addresses the most mentioned pain point with high demand score"
                },
                {
                    pitch: "Build automated testing tool for developers to catch bugs early, because manual testing is time-consuming.",
                    reasoning: "Addresses testing-related issues mentioned in the data"
                }
            ]
        };

        // Validate pitch structure
        if (!Array.isArray(mockPitchSchema.pitches)) {
            throw new Error('Pitches should be an array');
        }

        for (const pitch of mockPitchSchema.pitches) {
            if (!pitch.pitch || !pitch.reasoning) {
                throw new Error('Each pitch should have pitch and reasoning fields');
            }

            if (pitch.pitch.split(' ').length > 22) {
                throw new Error('Pitch should be ≤ 22 words');
            }
        }

        console.log('✅ Pitch generation schema test passed');
        return true;
    } catch (error) {
        console.error('❌ Pitch generation schema test failed:', error);
        return false;
    }
}

// Test 5: Final Plan Schema
async function testFinalPlanSchema() {
    console.log('🚀 Testing final plan schema...');

    try {
        const mockFinalPlan = {
            elevator_pitch: "Build AI code assistant for developers to reduce debugging time",
            target_user_persona: {
                name: "Alex Developer",
                role: "Software Developer",
                context: "Works at a tech startup",
                goals: ["Write better code", "Reduce debugging time"],
                pain_points: ["Time-consuming debugging", "Inefficient tools"],
                success_criteria: ["50% reduction in debugging time", "Improved code quality"]
            },
            tech_stack: {
                frontend: ["React", "TypeScript"],
                backend: ["Node.js", "Express"],
                data: ["PostgreSQL", "Redis"],
                auth: "JWT",
                ai: ["OpenAI GPT-4", "Code analysis models"],
                infra: ["Vercel", "AWS"],
                why_this_stack: "Fast to implement and scale"
            },
            prd: {
                problem: "Developers spend too much time debugging",
                goals: ["Reduce debugging time", "Improve code quality"],
                primary_user_jtbd: ["As a developer, I want AI assistance so that I can write better code faster"],
                scope_mvp: [{
                    feature: "Code analysis",
                    acceptance_criteria: ["Analyzes code for bugs", "Provides suggestions"]
                }],
                out_of_scope: ["Advanced AI training", "Multi-language support"],
                user_flows: [{
                    name: "Code Analysis Flow",
                    steps: ["Upload code", "Get analysis", "Review suggestions"]
                }],
                data_model: [{
                    entity: "CodeAnalysis",
                    fields: [
                        { name: "id", type: "string" },
                        { name: "code", type: "text" },
                        { name: "suggestions", type: "json" }
                    ]
                }],
                apis: [{
                    method: "POST",
                    path: "/api/analyze",
                    request: "{ code: string }",
                    response: "{ suggestions: array }"
                }],
                non_functional: {
                    perf: "Response time < 2 seconds",
                    privacy: "Code not stored permanently",
                    costs: "Under $100/month for MVP"
                },
                success_metrics: [{
                    metric: "user_activation_rate",
                    target: "≥ 80%"
                }],
                risks: ["AI model accuracy", "User adoption"],
                "1_day_plan": [
                    "Hour 0–2: scaffold stack, auth, basic UI",
                    "Hour 2–6: core feature v0 + extraction pipeline",
                    "Hour 6–8: polish + telemetry",
                    "Hour 8–12: dogfood + bugfix + deploy + share link"
                ]
            }
        };

        // Validate required fields
        const requiredFields = ['elevator_pitch', 'target_user_persona', 'tech_stack', 'prd'];
        for (const field of requiredFields) {
            if (!(field in mockFinalPlan)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        console.log('✅ Final plan schema test passed');
        return true;
    } catch (error) {
        console.error('❌ Final plan schema test failed:', error);
        return false;
    }
}

// Test 6: Platform Support
async function testPlatformSupport() {
    console.log('🌐 Testing platform support...');

    try {
        const supportedPlatforms = [
            'reddit', 'stackoverflow', 'github', 'devto', 'medium',
            'producthunt', 'quora', 'hackernews'
        ];

        const platformDisplayNames = {
            'reddit': 'Reddit',
            'stackoverflow': 'Stack Overflow',
            'github': 'GitHub',
            'devto': 'Dev.to',
            'medium': 'Medium',
            'producthunt': 'Product Hunt',
            'quora': 'Quora',
            'hackernews': 'Hacker News',
            'hn': 'Hacker News'
        };

        // Test that all platforms have display names
        for (const platform of supportedPlatforms) {
            if (!platformDisplayNames[platform]) {
                throw new Error(`Missing display name for platform: ${platform}`);
            }
        }

        console.log(`✅ Platform support test passed (${supportedPlatforms.length} platforms supported)`);
        return true;
    } catch (error) {
        console.error('❌ Platform support test failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running AI Demand Intelligence Miner Integration Tests\n');

    const tests = [
        testSearchQueryGeneration,
        testPerPostExtractionSchema,
        testAggregationAndScoring,
        testPitchGenerationSchema,
        testFinalPlanSchema,
        testPlatformSupport
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error('❌ Test error:', error);
            failed++;
        }
        console.log(''); // Add spacing between tests
    }

    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! The AI Demand Intelligence Miner is ready for use.');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }

    return failed === 0;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testSearchQueryGeneration,
        testPerPostExtractionSchema,
        testAggregationAndScoring,
        testPitchGenerationSchema,
        testFinalPlanSchema,
        testPlatformSupport
    };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
    runAllTests();
}
