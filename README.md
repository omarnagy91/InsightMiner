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

## Development

This extension is built with standard HTML, CSS, and JavaScript, with no external build tools required, making it easy to modify and extend.

### Core Concepts

The extension is architected around three main types of scripts:

*   **Service Worker (`background.js` & `background/`):** This is the brain of the extension. It runs persistently in the background, manages the extension's state, handles all communication with the OpenAI API, orchestrates the data extraction process across multiple tabs, and listens for messages from other parts of the extension.
*   **Content Scripts (`content-*.js`):** These are the arms and legs. They are injected directly into the web pages of the supported platforms (Google, Reddit, etc.). Their sole purpose is to scrape the required data from the page's DOM and send it back to the service worker for processing.
*   **UI Scripts (`sidepanel.js`, `options.js`, etc.):** These scripts control the user-facing components, such as the side panel and options page. They handle user input, display data and progress updates, and send commands to the service worker to initiate tasks.

### Debugging Tips

*   **Service Worker:** To debug the background script, navigate to `chrome://extensions/`, find the InsightMiner extension, and click the "Service Worker" link. This will open a dedicated DevTools window where you can view console logs, inspect network requests, and debug the script.
*   **Side Panel:** To debug the side panel UI, right-click anywhere inside the panel and select "Inspect". This will open a DevTools window for the side panel's HTML and JavaScript context.
*   **Content Scripts:** To debug a content script, open the DevTools on the target website (e.g., a Reddit post). Console logs from the content script will appear in the site's main console. You can also find the script's source code under the "Sources" tab > "Content scripts" to set breakpoints.

### Running Tests

The repository includes several files for testing:
*   `test-background-modules.js`: Unit tests for individual background modules.
*   `test-functionality.js`: High-level checks for core extension functionality.
*   `test-integration.js`: An integration test suite that verifies the end-to-end workflow.
*   `test-modules.js`: A simple script to verify that all modules load correctly.

These tests are designed for developer verification and can be run in a browser console or a Node.js environment.

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