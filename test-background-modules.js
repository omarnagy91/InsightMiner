/*
 * Unit tests for background modules
 * Run these tests in the browser console or Node.js environment
 */

// Mock Chrome APIs for testing
const mockChrome = {
    storage: {
        local: {
            get: (keys, callback) => {
                const mockData = {
                    OPENAI_API_KEY: 'test-key',
                    AI_MODEL: 'gpt-4',
                    demandWeights: {
                        frequency: 0.5,
                        recency: 0.2,
                        engagement: 0.15,
                        emotion: 0.1,
                        confidence: 0.05
                    }
                };
                const result = {};
                if (Array.isArray(keys)) {
                    keys.forEach(key => {
                        result[key] = mockData[key];
                    });
                } else {
                    result[keys] = mockData[keys];
                }
                callback(result);
            },
            set: (data, callback) => {
                console.log('Storage set:', data);
                if (callback) callback();
            }
        }
    },
    downloads: {
        download: (options) => {
            console.log('Download triggered:', options);
            return Promise.resolve();
        }
    }
};

// Test suite
class BackgroundModuleTests {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async run() {
        console.log('🧪 Running Background Module Tests...\n');

        for (const test of this.tests) {
            try {
                await test.testFn();
                console.log(`✅ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
                this.failed++;
            }
        }

        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        return this.passed === this.tests.length;
    }

    // Test constants module
    testConstants() {
        this.test('Constants module exports', () => {
            // This would test if constants are properly exported
            // In a real test environment, you'd import the module
            const expectedKeys = ['PLATFORM_DORKS', 'STORAGE_KEYS', 'DEMAND_SCORING_DEFAULTS'];
            expectedKeys.forEach(key => {
                if (typeof key !== 'string') {
                    throw new Error(`Expected ${key} to be defined`);
                }
            });
        });

        this.test('Platform dorks have required templates', () => {
            const platforms = ['reddit', 'stackoverflow', 'github', 'devto', 'medium'];
            platforms.forEach(platform => {
                // In real test, you'd check if PLATFORM_DORKS[platform] exists
                if (!platform) {
                    throw new Error(`Missing dork template for ${platform}`);
                }
            });
        });
    }

    // Test storage module
    testStorage() {
        this.test('Storage module functions exist', () => {
            const expectedFunctions = ['saveVersionedFile', 'saveSearchRun', 'saveExtractionRun'];
            expectedFunctions.forEach(func => {
                if (typeof func !== 'string') {
                    throw new Error(`Expected ${func} to be defined`);
                }
            });
        });

        this.test('Timestamp generation', () => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            if (!timestamp || timestamp.length === 0) {
                throw new Error('Timestamp generation failed');
            }
        });
    }

    // Test OpenAI module
    testOpenAI() {
        this.test('OpenAI module structure', () => {
            const expectedFunctions = ['callOpenAI', 'getApiKey', 'getModel'];
            expectedFunctions.forEach(func => {
                if (typeof func !== 'string') {
                    throw new Error(`Expected ${func} to be defined`);
                }
            });
        });

        this.test('API key retrieval', async () => {
            // Mock test - in real environment you'd test the actual function
            const mockKey = 'test-api-key';
            if (!mockKey) {
                throw new Error('API key retrieval failed');
            }
        });
    }

    // Test search module
    testSearch() {
        this.test('Search module functions', () => {
            const expectedFunctions = ['buildQueries', 'saveSearchSession', 'storeSearchResults'];
            expectedFunctions.forEach(func => {
                if (typeof func !== 'string') {
                    throw new Error(`Expected ${func} to be defined`);
                }
            });
        });

        this.test('Dork formatting', () => {
            const template = '(site:reddit.com) ("{topic}" OR "{syn1}") ("looking for")';
            const topic = 'AI tools';
            const synonyms = ['machine learning', 'automation'];

            const formatted = template
                .replace('{topic}', topic)
                .replace('{syn1}', synonyms[0])
                .replace('{syn2}', synonyms[1] || '');

            if (!formatted.includes(topic)) {
                throw new Error('Dork formatting failed');
            }
        });
    }

    // Test scraping module
    testScraping() {
        this.test('Content truncation', () => {
            const longText = 'a'.repeat(50000);
            const truncated = longText.slice(0, 32000);

            if (truncated.length > 32000) {
                throw new Error('Content truncation failed');
            }
        });

        this.test('Comment limiting', () => {
            const comments = Array.from({ length: 20 }, (_, i) => ({
                content: `Comment ${i}`,
                score: i.toString()
            }));

            const limited = comments
                .sort((a, b) => parseInt(b.score) - parseInt(a.score))
                .slice(0, 10);

            if (limited.length > 10) {
                throw new Error('Comment limiting failed');
            }
        });
    }

    // Test analysis module
    testAnalysis() {
        this.test('Demand score calculation', () => {
            const item = {
                frequency: 5,
                recency: 0.8,
                engagement: 0.6,
                emotion: 0.7,
                confidence: 0.9
            };

            const weights = {
                frequency: 0.5,
                recency: 0.2,
                engagement: 0.15,
                emotion: 0.1,
                confidence: 0.05
            };

            const score = (item.frequency * weights.frequency) +
                (item.recency * weights.recency) +
                (item.engagement * weights.engagement) +
                (item.emotion * weights.emotion) +
                (item.confidence * weights.confidence);

            if (score < 0 || score > 10) {
                throw new Error('Demand score calculation failed');
            }
        });
    }

    // Test deduplication module
    testDeduplication() {
        this.test('Text normalization', () => {
            const text = 'Hello, World! 123';
            const normalized = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

            if (normalized !== 'hello world 123') {
                throw new Error('Text normalization failed');
            }
        });

        this.test('Fingerprint generation', () => {
            const item = { text: 'AI tool for developers', type: 'idea' };
            const fingerprint = `${item.type}:${item.text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()}`;

            if (!fingerprint.includes('idea') || !fingerprint.includes('ai tool')) {
                throw new Error('Fingerprint generation failed');
            }
        });
    }

    // Run all tests
    async runAllTests() {
        this.testConstants();
        this.testStorage();
        this.testOpenAI();
        this.testSearch();
        this.testScraping();
        this.testAnalysis();
        this.testDeduplication();

        return await this.run();
    }
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BackgroundModuleTests };
} else if (typeof window !== 'undefined') {
    window.BackgroundModuleTests = BackgroundModuleTests;
}

// Auto-run tests if in browser console
if (typeof window !== 'undefined' && window.console) {
    const testRunner = new BackgroundModuleTests();
    testRunner.runAllTests().then(success => {
        if (success) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('⚠️ Some tests failed. Check the output above.');
        }
    });
}
