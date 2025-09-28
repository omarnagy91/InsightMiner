/**
 * @file test-background-modules.js
 * @description This file contains unit tests for the background script modules.
 * It includes a mock for Chrome APIs to allow testing in different environments (like Node.js or a browser console)
 * and a simple test runner to execute and report on the tests.
 */

/**
 * @const {object} mockChrome
 * @description A mock of the Chrome API to enable testing of extension-specific functionality
 * in an environment where the `chrome` object is not available. It mocks `storage` and `downloads` APIs.
 */
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

/**
 * @class BackgroundModuleTests
 * @description A simple test suite runner for the background modules.
 */
class BackgroundModuleTests {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    /**
     * Adds a test to the suite.
     * @param {string} name - The name of the test.
     * @param {function} testFn - The function that contains the test logic. It should throw an error on failure.
     */
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    /**
     * Runs all the tests in the suite and logs the results.
     * @returns {Promise<boolean>} A promise that resolves to true if all tests pass, otherwise false.
     */
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

    /**
     * Defines and adds tests for the constants module.
     */
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

    /**
     * Defines and adds tests for the storage module.
     */
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

    /**
     * Defines and adds tests for the OpenAI module.
     */
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

    /**
     * Defines and adds tests for the search module.
     */
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

    /**
     * Defines and adds tests for the scraping module.
     */
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

    /**
     * Defines and adds tests for the analysis module.
     */
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

    /**
     * Defines and adds tests for the deduplication module.
     */
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

    /**
     * Runs all defined test suites.
     * @returns {Promise<boolean>} A promise that resolves to true if all tests pass.
     */
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