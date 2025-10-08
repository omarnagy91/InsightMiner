# InsightMiner Chrome Extension v2.0

**InsightMiner** is an open-source Chrome extension that mines real market demand directly from user discussions across Reddit, Stack Overflow, GitHub, Quora, Product Hunt, Hacker News, Dev.to, and Medium.

It automatically:
- Generates precise search queries (Google dorks) per platform to surface high-signal user discussions
- Extracts posts, comments, and metadata with efficient tab management, error tracking, and versioned storage
- Runs multi-layer AI analysis (using OpenAI Chat Completions API) with structured outputs to identify ideas, problems, missing features, pros, cons, and emotional drivers
- Provides an interactive report interface where you can select relevant insights, auto-generate short elevator pitches, and trigger final plans with user personas, tech stacks, and lean PRDs for 1-day MVP builds

**InsightMiner turns raw community chatter into actionable product blueprints**—helping makers, founders, and researchers validate opportunities in hours, not weeks.

## ✨ Features

### 🎨 Modern Three-Mode Interface
- **Sources Mode**: Select and configure data sources (Reddit, Stack Overflow, GitHub, Dev.to, Medium)
- **Extraction Mode**: Extract content from URLs found by AI-generated search queries
- **AI Analysis Mode**: Analyze extracted data with customizable AI models and prompts
- **Themed Interfaces**: Sources (purple), Extraction (orange), and AI (gold) themed UIs
- **Site-Specific Icons**: Beautiful icons for each supported platform
- **Responsive Design**: Optimized for all screen sizes
- **Real-time Updates**: Live progress tracking and status updates

### 🎯 AI-Powered Search Query Generation (v2.0)
- **Dork Template Registry**: Pre-built search templates for each platform with demand phrases
- **Synonym Injection**: AI generates 1-2 relevant synonyms for each topic automatically
- **Platform-Specific Queries**: Tailored search terms for Reddit, Stack Overflow, GitHub, Dev.to, Medium, Product Hunt, Quora, and Hacker News
- **Multi-Page Search**: Automatically extracts results from multiple Google search pages
- **Topic-Based Generation**: Enter any topic to generate relevant search queries
- **Real-time Progress**: Live tracking of Google search execution
- **Structured Results**: Organized search results with platform categorization

### 📊 Multi-Platform Data Extraction (v2.0)
- **Reddit**: Extract posts, comments, scores, and metadata
- **Stack Overflow**: Extract questions, answers, comments, and votes
- **GitHub**: Extract issues, pull requests, discussions, and releases
- **Dev.to**: Extract articles, comments, and reactions
- **Medium**: Extract articles and responses
- **Product Hunt**: Extract product discussions and feedback
- **Quora**: Extract questions, answers, and discussions
- **Hacker News**: Extract posts, comments, and discussions
- **Content Controls**: Comment capping (top 10), content truncation (32k chars)
- **Error Tracking**: Failed URL reporting with detailed error analysis
- **Automated Extraction**: Process URLs from AI-generated search results
- **Tab Management**: Efficient resource usage with automatic tab closing
- **Versioned Storage**: Organized data persistence with run metadata
- **Stop-and-Save**: Save extracted data when stopping midway

### 🤖 Advanced AI Analysis with OpenAI (v2.0)
- **Multiple AI Models**: Choose from GPT-4o, GPT-4o Mini, GPT-4 Turbo, or GPT-3.5 Turbo
- **Responses API Integration**: Structured JSON outputs with schema validation
- **Concurrency Control**: Optimized API calls with retry logic and exponential backoff
- **Two-layer Analysis**: Per-item analysis followed by aggregate insights
- **Fuzzy Deduplication**: Smart merging of near-duplicate items with evidence tracking
- **Configurable Demand Scoring**: Customizable weights for frequency, recency, engagement, emotion, and confidence
- **Demand Pattern Identification**: Find most requested AI tools across all platforms
- **MVP Recommendations**: Generate actionable product ideas
- **Emotional Driver Analysis**: Understand user motivations and pain points
- **Action Plan Generation**: 24-hour implementation roadmap
- **Continue from Last Analysis**: Resume previous analysis sessions
- **Regeneration Controls**: Regenerate pitches and final plans
- **Enhanced Results Display**: Detailed grid layout with categorized insights
- **Full-Screen Analysis Tab**: Open detailed results in a dedicated browser tab
- **Interactive Statistics**: Real-time metrics and confidence scores
- **Multiple Export Formats**: JSON and Markdown export options
- **Share Functionality**: Copy analysis summaries to clipboard
- **Report Loading**: Open previously exported reports in the analysis tab
- **Secure API Key Management**: Local storage with customizable settings

### 📊 Advanced Data Management (v2.0)
- **Versioned Storage**: Organized data persistence with run metadata and timestamps
- **Real-time Statistics**: Live updates of extraction progress and results
- **Multiple Export Formats**: CSV, JSON, and Markdown export options
- **Failed URL Tracking**: Comprehensive error reporting with downloadable reports
- **Platform Counts**: Detailed extraction metadata with success rates
- **Progress Tracking**: Visual indicators with real-time updates
- **Incremental Data Saving**: No data loss with automatic versioning
- **Security Warning**: Dismissible privacy notice for transparency

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

## 🚀 Usage

### 🎯 Getting Started (v2.0)

1. **Install the extension** (see Installation section below)
2. **Set up OpenAI API key** (see AI Analysis Setup below)
3. **Click the extension icon** in your Chrome toolbar to open the sidebar
4. **Choose your mode**: Toggle between Sources, Extraction, and AI Analysis modes
5. **Follow the themed interface** for your selected mode
6. **Keep the sidebar open** while browsing for continuous access to features

### 🆕 What's New in v2.0

- **AI-Powered Search Generation**: Enter any topic to generate optimized search queries
- **Multi-Page Google Search**: Automatically extracts results from multiple search pages
- **Enhanced Platform Support**: Added Product Hunt, Quora, and Hacker News
- **Smart Content Processing**: Comment capping and content truncation for efficiency
- **Advanced Error Tracking**: Failed URL reporting with detailed analysis
- **Configurable Demand Scoring**: Customize how demand is calculated
- **Continue & Regenerate**: Resume analysis sessions and regenerate results
- **Multiple Export Formats**: JSON and Markdown export options
- **Security Transparency**: Clear privacy notices and minimal permissions

### 🎯 Sources Mode - AI-Powered Search Generation (v2.0)

1. **Switch to Sources mode** (purple theme with source icons)
2. **Select platforms** you want to search (Reddit, Stack Overflow, GitHub, etc.)
3. **Enter your topic** in the input field (e.g., "AI tools for developers")
4. **Click "Generate AI-Powered Search Queries"**
5. **Monitor progress** as the extension automatically:
   - Generates optimized search queries for each platform
   - Executes Google searches with multi-page extraction
   - Categorizes results by platform
6. **Switch to Extraction mode** when search is complete

### 📊 Extraction Mode - Multi-Platform Content Extraction (v2.0)

1. **Switch to Extraction mode** (orange theme with extraction icons)
2. **Export search results** from Sources mode if needed
3. **Select a CSV file** with URLs using the file picker
4. **Configure extraction options**:
   - **Close tabs after extraction**: Saves system resources
   - **Extract comments**: Include comment data in extraction
   - **Extract metadata**: Include additional platform metadata
5. **Click "Start Data Extraction"**
6. **Monitor progress** with real-time progress tracking
7. **View failed URLs** if any extraction errors occur
8. **Stop anytime** - all extracted data will be saved automatically

### 🤖 AI Analysis Mode - Advanced OpenAI Integration (v2.0)

1. **Set up your OpenAI API key** (see setup instructions below)
2. **Extract data first** (using Extraction mode)
3. **Switch to AI Analysis mode** (gold theme with AI icons)
4. **Configure demand scoring weights** (optional):
   - Adjust frequency, recency, engagement, emotion, and confidence weights
   - Use sliders to customize how demand is calculated
5. **Configure analysis options**:
   - **Include comments**: Analyze comment data for deeper insights
   - **Generate MVP recommendations**: Create actionable product ideas
6. **Click "Start AI Analysis"** or **"Continue from Last Analysis"**
7. **Monitor progress** with real-time analysis tracking
8. **View results** with top requested tools and MVP recommendations
9. **Use regeneration controls** to regenerate pitches and final plans
10. **Click "View Detailed Results"** to open the full-screen analysis tab
11. **Export analysis** in JSON or Markdown format

### 🔑 AI Analysis Setup

1. **Get OpenAI API Key**:
   - Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Sign in to your OpenAI account
   - Click "Create new secret key"
   - Copy the key (starts with "sk-")

2. **Configure Extension**:
   - Right-click the extension icon → "Options"
   - Paste your API key in the settings page
   - Select your preferred AI model (GPT-4o, GPT-4o Mini, etc.)
   - Customize analysis prompts if desired
   - Click "Save Settings"

3. **Security Note**: Your API key is stored locally and never shared. For production use, consider using a backend proxy.

### 🖥️ AI Analysis Tab - Full-Screen Results

The AI Analysis Tab provides a comprehensive, full-screen view of your multi-platform analysis results with enhanced visualizations and export capabilities:

#### Features:
- **📊 Interactive Statistics Dashboard**: Real-time metrics including items analyzed, unique tools identified, MVP count, and average confidence scores
- **🎯 Categorized Results**: Organized display of top requested tools, MVP recommendations, common issues, and praised features
- **📋 Detailed Action Plan**: Step-by-step 24-hour implementation roadmap with clear priorities
- **📤 Advanced Export Options**: 
  - Full JSON export with complete analysis data
  - PDF export (coming soon)
  - Shareable summary for team collaboration
- **🔄 Real-time Updates**: Automatically refreshes when new analysis data is available
- **📱 Responsive Design**: Optimized for all screen sizes and devices

#### How to Access:
1. Complete an AI analysis using the extension sidebar
2. Click "View Detailed Results" button in the AI Analysis mode
3. A new browser tab will open with the full analysis interface
4. Use the export and share features to distribute insights

#### Opening Previously Exported Reports:
1. In the AI Analysis mode, select "Open previously exported report"
2. Click "Choose File" and select a previously exported JSON report
3. Click "Open Report in Analysis Tab" to view the report in full-screen
4. The report will load with all original analysis data and visualizations

### 🎨 Interface Features

- **Fixed Sidebar**: Persistent panel that stays open while browsing
- **Mode Toggle**: Beautiful switcher between Google, Reddit, and AI Analysis modes
- **Themed Interfaces**: Google (blue), Reddit (orange), and AI (gold) themed UIs
- **Enhanced AI Results**: Detailed grid layout with categorized insights
- **Real-time Stats**: Live updates of extraction progress and results
- **Progress Tracking**: Visual progress bars and status indicators
- **Auto-detection**: Automatically detects Google search pages
- **Batch Collection**: Collect results from multiple searches and pages
- **Smart File Management**: Organized downloads with clear naming

## File Structure

```
.
├── manifest.json          # Extension configuration, permissions, and scripts
├── background.js          # Main service worker, acts as a central controller
├── background/            # Modules for handling specific background tasks (AI, search, scraping)
├── content-*.js           # Content scripts for data extraction from different websites
├── sidepanel.html / .js   # UI and logic for the main extension side panel
├── ai_analysis.html / .js # UI and logic for the full-screen analysis report
├── report_ui.html / .js   # UI and logic for the interactive insights report
├── options.html / .js     # UI and logic for the extension's settings page
├── icons/                 # Extension icons in various sizes
└── README.md              # This file
```

## 📁 Export Formats

### 📊 CSV Export Format (Google Search Results)
The exported CSV includes the following columns:
- **Title**: Search result title
- **URL**: Full URL of the result
- **Snippet**: Description/snippet text
- **Domain**: Website domain
- **Position**: Position in search results
- **Search Query**: Original search query
- **Timestamp**: When the result was extracted
- **Source**: Always "Google Search"

### 📄 JSON Export Format (Multi-Platform Data)
The exported JSON includes an array of items from all platforms, each containing:
- **Platform-specific data**: title, content, author, platform, score, timestamp, url
- **Comments/Answers array**: Each comment/answer with content, author, score, timestamp
- **Metadata**: extraction timestamp, source URL, platform type
- **File naming**: `data_extraction_YYYY-MM-DD_completed.json` or `data_extraction_YYYY-MM-DD_stopped.json`

### 🤖 AI Analysis Export Format
The exported AI analysis JSON includes:
- **Per-item analysis**: Individual analysis of each platform item
- **Aggregated insights**: Top requested tools, MVP recommendations, action plans
- **Metadata**: Analysis timestamp, model used, confidence scores
- **File naming**: `ai_analysis_YYYY-MM-DD.json`

## AI Analysis Schema

### Per-Item Analysis
Each platform item is analyzed for:
- **Requested tools**: AI tools/tasks people want built
- **Issues**: Problems they're facing
- **Pros**: Benefits they mention
- **Emotional drivers**: Frustration, excitement, etc.
- **Sentiment summary**: Overall sentiment analysis
- **Supporting quotes**: Key quotes (max 5, under 200 chars)
- **MVP ideas**: Suggested product ideas based on discussion

### Aggregate Analysis
The final analysis provides:
- **Top requested tools**: Most frequently mentioned AI tools
- **Tool request counts**: Frequency analysis of tool requests
- **Common issues**: Most discussed problems
- **Common pros**: Most praised features
- **Top emotional drivers**: Key user motivations
- **MVP recommendations**: Prioritized product opportunities
- **Action plan**: 5-step 24-hour implementation roadmap

## Permissions

The extension requires the following permissions:
- `activeTab`: To access the current tab's content
- `storage`: To store extracted data and API keys locally
- `scripting`: To inject content scripts
- `downloads`: To save CSV and JSON files to specific directories
- `tabs`: To manage tabs for multi-platform extraction
- `https://www.google.com/*`: To extract Google search results
- `https://www.reddit.com/*`: To extract Reddit posts and comments
- `https://stackoverflow.com/*`: To extract Stack Overflow questions and answers
- `https://github.com/*`: To extract GitHub issues and discussions
- `https://dev.to/*`: To extract Dev.to articles and comments
- `https://medium.com/*`: To extract Medium articles and responses
- `sidePanel`: To display the fixed sidebar interface
- Host permissions for `google.com`, `reddit.com`, `stackoverflow.com`, `github.com`, `dev.to`, `medium.com`, and `platform.openai.com`

## 👨‍💻 Development Guide

This extension is built with vanilla HTML, CSS, and JavaScript using modern Chrome Extension Manifest V3 architecture. No external build tools or frameworks are required, making it easy to modify and extend.

### 🏗️ Architecture Overview

The extension follows a modular, event-driven architecture with clear separation of concerns:

#### Core Components

**Service Worker (`background.js` & `background/`)**
- Central controller and state manager
- Handles all external API communications (OpenAI)
- Orchestrates cross-tab data extraction workflows
- Manages message routing between extension components
- Implements retry logic and error handling
- Coordinates concurrent processing with rate limiting

**Content Scripts (`content-*.js`)**
- Platform-specific DOM scrapers injected into target websites
- Extract structured data using CSS selectors and DOM traversal
- Handle dynamic content loading and SPA navigation
- Communicate extraction results back to service worker
- Implement fallback extraction strategies

**UI Components**
- `sidepanel.js`: Main extension interface with three-mode design
- `options.js`: Settings and configuration management
- `ai_analysis.js`: Full-screen analysis results viewer
- `report_ui.js`: Interactive insights report interface

#### Modular Background Architecture

The background script is organized into focused modules:

- `background/constants.js`: Configuration constants and platform mappings
- `background/openai.js`: OpenAI API client with structured outputs
- `background/search.js`: Search query generation and session management
- `background/scrape.js`: Data extraction utilities and content processing
- `background/analyze.js`: AI analysis orchestration and demand scoring
- `background/storage.js`: Versioned data persistence and file management
- `background/sessions.js`: Session metadata and tracking
- `background/dedupe.js`: Duplicate detection and evidence merging
- `background/normalize.js`: Text normalization for consistent processing
- `background/synonyms.js`: AI-powered synonym generation
- `background/report.js`: Report generation and management

### 🔄 Data Flow

1. **Search Generation**: User input → AI query generation → Google search execution
2. **Data Extraction**: URLs → Platform detection → Content script injection → Data extraction
3. **AI Analysis**: Raw data → Per-post analysis → Aggregation → Demand scoring
4. **Report Generation**: Analysis results → Interactive visualization → Export options

### 💾 Storage Strategy

- **Local Storage**: Chrome storage API for settings, session data, and results
- **Versioned Runs**: Each extraction/analysis creates a timestamped run
- **File Downloads**: Automatic CSV/JSON export with organized naming
- **State Persistence**: Maintain UI state across browser sessions

### 🔧 Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/omarnagy91/InsightMiner
   cd chrome-extractor
   ```

2. **Load Extension**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" → Select project folder

3. **Development Workflow**
   - Edit source files directly (no build step required)
   - Reload extension in Chrome for service worker changes
   - Refresh pages for content script changes
   - UI changes reflect immediately

### 🧪 Testing & Debugging

#### Unit Tests
- `test-background-modules.js`: Background module unit tests
- `test-functionality.js`: Core functionality verification
- `test-integration.js`: End-to-end workflow tests
- `test-modules.js`: Module loading verification

#### Running Tests
```javascript
// In browser console or Node.js
const tests = new BackgroundModuleTests();
tests.runAllTests();
```

#### Debugging Tools
- **Service Worker**: `chrome://extensions/` → "Service Worker" link
- **Side Panel**: Right-click panel → "Inspect"
- **Content Scripts**: Target site DevTools → Sources → Content scripts
- **Storage**: DevTools → Application → Storage → Extensions

### 📝 Code Style & Conventions

#### JSDoc Documentation
All public functions include comprehensive JSDoc comments:
```javascript
/**
 * Extracts search results from Google search pages using multiple CSS selectors.
 * Handles various Google layouts and provides fallback extraction methods.
 * 
 * @param {string} searchQuery - The search query used to find results
 * @param {boolean} includeFallback - Whether to use fallback extraction
 * @returns {Promise<Array<object>>} Array of search result objects
 */
async function extractGoogleResults(searchQuery, includeFallback = true) {
    // Implementation...
}
```

#### Message Passing Patterns
```javascript
// Service Worker → Content Script
chrome.tabs.sendMessage(tabId, { 
    action: 'extractData',
    options: { extractComments: true }
});

// Content Script → Service Worker
chrome.runtime.sendMessage({
    action: 'DATA_EXTRACTED',
    data: extractedData
});

// UI → Service Worker
chrome.runtime.sendMessage({
    action: 'START_ANALYSIS',
    payload: analysisConfig
});
```

#### Error Handling
```javascript
// Consistent error handling with retry logic
async function callWithRetry(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await delay(Math.pow(2, i) * 1000); // Exponential backoff
        }
    }
}
```

### 🔌 API Integration

#### OpenAI Integration
```javascript
// Structured API calls with schema validation
const result = await callOpenAI({
    messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ],
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    schema: PER_POST_SCHEMA, // JSON schema validation
    temperature: 0.3
});
```

#### Chrome APIs Used
- `chrome.storage.local`: Data persistence
- `chrome.tabs`: Tab management for extraction
- `chrome.scripting`: Content script injection
- `chrome.downloads`: File export functionality
- `chrome.notifications`: User notifications
- `chrome.sidePanel`: Persistent sidebar interface

### 📁 Detailed File Structure

```
chrome-extractor/
├── manifest.json                 # Extension configuration and permissions
├── background.js                 # Main service worker (central controller)
├── background/                   # Modular background script components
│   ├── constants.js             # Configuration constants and mappings
│   ├── openai.js               # OpenAI API client with structured outputs
│   ├── search.js               # Search query generation and management
│   ├── scrape.js               # Data extraction utilities
│   ├── analyze.js              # AI analysis orchestration
│   ├── storage.js              # Versioned data persistence
│   ├── sessions.js             # Session metadata management
│   ├── dedupe.js               # Duplicate detection and merging
│   ├── normalize.js            # Text normalization utilities
│   ├── synonyms.js             # AI-powered synonym generation
│   └── report.js               # Report generation and management
├── content-google.js            # Google search results extraction
├── content-reddit.js           # Reddit posts and comments extraction
├── content-stackoverflow.js    # Stack Overflow Q&A extraction
├── content-github.js           # GitHub issues and discussions extraction
├── content-devto.js            # Dev.to articles and comments extraction
├── content-medium.js           # Medium articles and responses extraction
├── sidepanel.html              # Main extension UI layout
├── sidepanel.js                # Main extension UI logic and state management
├── options.html                # Settings page layout
├── options.js                  # Settings page logic and API key management
├── ai_analysis.html            # Full-screen analysis results layout
├── ai_analysis.js              # Analysis results viewer logic
├── report_ui.html              # Interactive insights report layout
├── report_ui.js                # Interactive report logic and visualization
├── icons/                      # Extension icons (16px, 32px, 48px, 128px)
├── test-background-modules.js  # Background module unit tests
├── test-functionality.js       # Core functionality tests
├── test-integration.js         # End-to-end workflow tests
├── test-modules.js             # Module loading verification
└── README.md                   # This comprehensive documentation
```

### 🚀 Getting Started for Developers

#### First-Time Setup
1. **Prerequisites**: Chrome browser with developer mode enabled
2. **Clone and Load**: Follow the installation instructions above
3. **Set up OpenAI API**: Get an API key from OpenAI for testing AI features
4. **Explore the Code**: Start with `manifest.json` to understand permissions and entry points

#### Key Entry Points
- `background.js`: Main service worker - start here to understand the architecture
- `sidepanel.js`: Main UI logic - understand user interactions and state management
- `content-*.js`: Platform-specific scrapers - see how data extraction works
- `background/`: Modular components - deep dive into specific functionality

#### Development Workflow
1. **Make Changes**: Edit source files directly (no build process)
2. **Test Changes**: 
   - Service worker changes: Reload extension in `chrome://extensions/`
   - Content script changes: Refresh target web pages
   - UI changes: Close and reopen extension panel
3. **Debug**: Use Chrome DevTools as described in debugging section
4. **Test**: Run unit tests and integration tests
5. **Document**: Update JSDoc comments for any new functions

#### Contributing Guidelines
- **Code Style**: Follow existing JSDoc patterns and error handling conventions
- **Testing**: Add tests for new functionality
- **Documentation**: Update README.md for new features or breaking changes
- **Modularity**: Keep background script modules focused and cohesive
- **Error Handling**: Implement retry logic and user-friendly error messages

### 🔧 Platform Extension Guide

#### Adding a New Platform
1. **Create Content Script**: `content-newplatform.js`
   ```javascript
   // Extract platform-specific data
   function extractNewPlatformData(extractComments = true, extractMetadata = true) {
       // Implementation for new platform
   }
   
   // Message listener
   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
       if (request.action === 'extractNewPlatformData') {
           // Handle extraction request
       }
   });
   ```

2. **Update Manifest**: Add host permissions and content script registration
   ```json
   {
       "host_permissions": ["https://newplatform.com/*"],
       "content_scripts": [{
           "matches": ["https://newplatform.com/*"],
           "js": ["content-newplatform.js"]
       }]
   }
   ```

3. **Update Constants**: Add platform configuration
   ```javascript
   // In background/constants.js
   PLATFORM_DORKS.newplatform = '(site:newplatform.com) "{topic}" ("{syn1}")';
   PLATFORM_LABELS.newplatform = 'New Platform';
   ```

4. **Update Background Logic**: Add platform detection and handling
   ```javascript
   // In background.js
   function getPlatformFromUrl(url) {
       if (url.includes('newplatform.com')) return 'newplatform';
       // ... existing platforms
   }
   ```

### 🧪 Advanced Testing

#### Performance Testing
```javascript
// Monitor extraction performance
function logPerformance(operation, startTime) {
    const duration = Date.now() - startTime;
    console.log(`${operation} completed in ${duration}ms`);
}

// Usage
const start = Date.now();
await extractData();
logPerformance('Data Extraction', start);
```

#### Load Testing
```javascript
// Test concurrent API calls
async function testConcurrency() {
    const promises = Array.from({ length: 10 }, () => 
        callOpenAI({ /* test payload */ })
    );
    const results = await Promise.allSettled(promises);
    console.log('Success rate:', results.filter(r => r.status === 'fulfilled').length / 10);
}
```

#### Integration Testing
```javascript
// Test complete workflow
async function testFullWorkflow() {
    const topic = 'test topic';
    const sources = ['reddit', 'github'];
    
    // 1. Generate queries
    const { queries } = await generateSearchQueries(topic, sources);
    
    // 2. Extract data
    const urls = queries.map(q => q.mockUrls).flat();
    const extractedData = await startDataExtractionProcess(urls);
    
    // 3. Analyze with AI
    const analysis = await analyzePosts({ posts: extractedData });
    
    console.log('Workflow test completed:', analysis);
}
```

### 🔍 Debugging and Troubleshooting

#### Service Worker Debugging
```javascript
// Add debug logging
console.log('🔧 Service Worker Debug:', { timestamp: new Date().toISOString(), data });

// Monitor message passing
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Message received:', message.action, message);
    // Handle message...
});

// Track storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log('💾 Storage changed:', changes);
});
```

#### Content Script Debugging
```javascript
// Debug extraction on target pages
function debugExtraction() {
    console.log('🎯 Starting extraction debug on:', window.location.href);
    console.log('🔍 Elements found:', document.querySelectorAll('.target-selector').length);
    
    // Test selectors
    const elements = document.querySelectorAll('.post-selector');
    elements.forEach((el, i) => {
        console.log(`📝 Post ${i}:`, {
            title: el.querySelector('.title')?.textContent,
            content: el.querySelector('.content')?.textContent?.slice(0, 100)
        });
    });
}

// Run in target site console
debugExtraction();
```

#### Error Tracking
```javascript
// Comprehensive error handling
function handleError(error, context = '') {
    const errorInfo = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location?.href
    };
    
    console.error('❌ Extension Error:', errorInfo);
    
    // Store for later analysis
    chrome.storage.local.get(['errors'], (result) => {
        const errors = result.errors || [];
        errors.push(errorInfo);
        chrome.storage.local.set({ errors: errors.slice(-50) }); // Keep last 50 errors
    });
}
```

### 📋 Development Checklist

#### Before Contributing
- [ ] Read through the codebase and understand the architecture
- [ ] Set up development environment and test the extension
- [ ] Run existing tests to ensure everything works
- [ ] Check JSDoc documentation standards in existing code

#### For New Features
- [ ] Add comprehensive JSDoc documentation
- [ ] Include unit tests for new functionality
- [ ] Update integration tests if workflow changes
- [ ] Test across different platforms (Reddit, GitHub, etc.)
- [ ] Update README.md with new feature documentation
- [ ] Verify Chrome extension permissions if new APIs used

#### For Bug Fixes
- [ ] Identify root cause and add debugging logs
- [ ] Create test case that reproduces the bug
- [ ] Implement fix with error handling
- [ ] Verify fix across affected platforms
- [ ] Add regression test to prevent future issues

### 🔐 Security Considerations

#### API Key Management
- Extension stores OpenAI API keys in local Chrome storage
- For production: implement backend proxy to secure API keys
- Keys are never transmitted except to OpenAI's API
- Users can clear stored keys through extension options

#### Data Privacy
- All data extraction happens locally in the browser
- No data is sent to external servers except OpenAI for analysis
- Users control which platforms and data to extract
- Extracted data is stored locally and can be deleted anytime

#### Permissions Audit
- `activeTab`: Required for content script injection
- `storage`: Required for local data persistence
- `tabs`: Required for multi-tab extraction workflow
- `downloads`: Required for CSV/JSON export functionality
- Host permissions: Limited to specific platforms for data extraction

### 🤝 Community and Support

#### Getting Help
- **Issues**: Report bugs and feature requests on GitHub Issues
- **Discussions**: Ask questions and share ideas in GitHub Discussions
- **Documentation**: This README covers most development questions
- **Code Examples**: Check existing content scripts for platform integration examples

#### Contributing
- **Fork and PR**: Standard GitHub workflow for contributions
- **Code Review**: All changes go through peer review
- **Testing**: Maintain test coverage for reliability
- **Documentation**: Keep JSDoc and README updated

#### Release Process
1. **Version Bump**: Update version in `manifest.json`
2. **Changelog**: Document changes in `CHANGELOG.md`
3. **Testing**: Run full test suite and manual verification
4. **Documentation**: Update README for any new features
5. **Release**: Create GitHub release with packaged extension

## Security & Privacy

This extension:
- Stores all data locally in your browser
- Stores OpenAI API keys locally (not recommended for production)
- Only accesses pages you explicitly visit
- Makes API calls to OpenAI with your credentials
- Allows you to clear all data at any time
- Enables you to choose your preferred AI model for analysis
- Allows customization of analysis prompts for specific use cases

**Important**: For production use, implement a backend proxy to keep your OpenAI API key secure.

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Google Search Extraction Issues
- **Problem**: Only getting results from first page
- **Solution**: v2.0 now automatically extracts from up to 3 pages per query
- **Problem**: No search results found
- **Solution**: Check browser console for extraction errors, ensure Google search page is fully loaded

#### Reddit Extraction Progress Issues
- **Problem**: Progress shows 0% and doesn't update
- **Solution**: v2.0 includes enhanced progress tracking with real-time updates
- **Problem**: Extraction fails silently
- **Solution**: Check browser console for detailed error messages, failed URLs are now tracked and reported

#### Content Script Communication Issues
- **Problem**: "Could not establish connection" errors
- **Solution**: v2.0 includes fallback extraction mechanisms and better error handling
- **Problem**: Tabs open but no data extracted
- **Solution**: Ensure content scripts are properly injected, check manifest permissions

#### AI Analysis Issues
- **Problem**: OpenAI API errors
- **Solution**: v2.0 includes exponential backoff retry logic and better error messages
- **Problem**: Analysis results not showing
- **Solution**: Check OpenAI API key in extension options, ensure sufficient API credits

### Debug Mode
Enable browser console logging to see detailed extraction progress and error messages:
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for messages starting with "AI Demand Intelligence Miner"

## Future Enhancements

- Backend proxy for secure API key management
- Additional AI models support (Claude, Gemini)
- Real-time analysis streaming
- Advanced filtering and search capabilities
- Cloud storage integration
- Batch processing improvements
- Custom analysis prompts
- Team collaboration features
- Support for additional platforms (Hacker News, Product Hunt, etc.)
- Automated trend detection
- Custom analysis templates
- API for third-party integrations

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
