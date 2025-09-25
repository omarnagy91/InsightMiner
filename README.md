# Reddit AI Demand Miner Chrome Extension

A powerful Chrome extension that scrapes Reddit posts, analyzes them with OpenAI, and aggregates the most requested AI tools and MVP opportunities. Features a modern three-mode sidebar interface with Google extraction, Reddit scraping, and AI analysis capabilities.

## ✨ Features

### 🎨 Modern Three-Mode Sidebar Interface
- **Fixed Sidebar**: Persistent sidebar panel that stays open while browsing
- **Toggle Switcher**: Beautiful Google/Reddit/AI mode switcher with themed interfaces
- **Google Theme**: Blue gradient with Google-style icons and colors
- **Reddit Theme**: Orange gradient with Reddit-style icons and colors
- **AI Theme**: Gold gradient with AI analysis capabilities
- **Expanded Space**: More room for detailed AI analysis results and features
- **Responsive Design**: Optimized for all screen sizes
- **Real-time Updates**: Live progress tracking and status updates

### 🔍 Google Search Results Extraction
- Extracts titles, URLs, snippets, and domains from Google search results
- Automatically detects search queries
- Stores results with timestamps and position information
- Works across multiple search pages and queries
- Saves CSV files to Downloads folder
- **Enhanced UI**: Google-themed interface with familiar icons

### 🐹 Reddit Content Extraction
- Extract Reddit posts with titles, content, authors, and scores
- Extract Reddit comments with content, authors, and scores
- Automated Reddit extraction from CSV files
- Tab management for efficient resource usage
- JSON export for Reddit data
- **Stop-and-Save**: Save extracted data when stopping midway
- **Enhanced UI**: Reddit-themed interface with Reddit icons

### 🤖 AI Analysis with OpenAI
- **Two-layer GPT analysis**: Per-post analysis followed by aggregate insights
- **Structured outputs**: Guaranteed JSON schema compliance
- **Demand pattern identification**: Find most requested AI tools
- **MVP recommendations**: Generate actionable product ideas
- **Emotional driver analysis**: Understand user motivations
- **Action plan generation**: 24-hour implementation roadmap
- **Enhanced results display**: Detailed grid layout with categorized insights
- **Full-screen analysis tab**: Open detailed results in a dedicated browser tab
- **Interactive statistics**: Real-time metrics and confidence scores
- **Export capabilities**: JSON export with full analysis data
- **Share functionality**: Copy analysis summaries to clipboard
- **Report loading**: Open previously exported reports in the analysis tab
- **API key management**: Secure local storage of OpenAI credentials

### 📊 Advanced Data Management
- Temporary storage of all extracted data
- Real-time statistics display
- Export all collected data to CSV/JSON format
- Clear all data functionality
- Progress tracking with visual indicators
- Incremental data saving (no data loss)

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

## 🚀 Usage

### 🎯 Getting Started

1. **Install the extension** (see Installation section below)
2. **Set up OpenAI API key** (see AI Analysis Setup below)
3. **Click the extension icon** in your Chrome toolbar to open the sidebar
4. **Choose your mode**: Toggle between Google, Reddit, and AI Analysis modes
5. **Follow the themed interface** for your selected mode
6. **Keep the sidebar open** while browsing for continuous access to features

### 🔍 Google Mode - Search Results Extraction

1. **Navigate to Google** and perform a search
2. **Switch to Google mode** (blue theme with Google icons)
3. **Click "Extract Current Page Results"** to collect all visible search results
4. **Navigate to other pages** or perform new searches
5. **Repeat the extraction process** for additional results
6. **Click "Export All to CSV"** when ready to download all collected data

### 🐹 Reddit Mode - Content Extraction

1. **First, export your Google search results to CSV** (as described above)
2. **Switch to Reddit mode** (orange theme with Reddit icons)
3. **Select a CSV file** with Reddit URLs using the file picker
4. **Configure extraction options**:
   - **Close tabs after extraction**: Saves system resources
   - **Extract comments**: Include comment data in extraction
5. **Click "Start Reddit Extraction"**
6. **Monitor progress** with the real-time progress bar
7. **Stop anytime** - all extracted data will be saved automatically

### 🤖 AI Analysis Mode - OpenAI Integration

1. **Set up your OpenAI API key** (see setup instructions below)
2. **Extract Reddit data first** (using Reddit mode)
3. **Switch to AI Analysis mode** (gold theme with AI icons)
4. **Configure analysis options**:
   - **Include comments**: Analyze comment data for deeper insights
   - **Generate MVP recommendations**: Create actionable product ideas
5. **Click "Start AI Analysis"**
6. **Monitor progress** with real-time analysis tracking
7. **View results** with top requested tools and MVP recommendations
8. **Click "View Detailed Results"** to open the full-screen analysis tab
9. **Export analysis** to JSON for further processing

### 🔑 AI Analysis Setup

1. **Get OpenAI API Key**:
   - Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Sign in to your OpenAI account
   - Click "Create new secret key"
   - Copy the key (starts with "sk-")

2. **Configure Extension**:
   - Right-click the extension icon → "Options"
   - Paste your API key in the settings page
   - Click "Save API Key"

3. **Security Note**: Your API key is stored locally and never shared. For production use, consider using a backend proxy.

### 🖥️ AI Analysis Tab - Full-Screen Results

The AI Analysis Tab provides a comprehensive, full-screen view of your analysis results with enhanced visualizations and export capabilities:

#### Features:
- **📊 Interactive Statistics Dashboard**: Real-time metrics including posts analyzed, unique tools identified, MVP count, and average confidence scores
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
chrome-extractor/
├── manifest.json          # Extension configuration with side panel setup
├── background.js          # Background service worker with AI analysis pipeline
├── content-google.js      # Google search results extraction
├── content-reddit.js      # Reddit content extraction
├── popup.html             # Enhanced popup interface (fallback)
├── popup.js               # Popup functionality
├── sidepanel.html         # Modern three-mode sidebar interface
├── sidepanel.js           # Enhanced sidebar with AI analysis
├── ai_analysis.html       # Full-screen AI analysis results page
├── ai_analysis.js         # AI analysis tab functionality
├── options.html           # OpenAI API key management page
├── options.js             # Options page functionality
├── icons/                 # Extension icons (16px, 32px, 48px, 128px)
├── README.md              # This file
└── INSTALLATION.md        # Installation guide
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

### 📄 JSON Export Format (Reddit Data)
The exported JSON includes an array of posts, each containing:
- **Post data**: title, content, author, subreddit, score, timestamp, url
- **Comments array**: Each comment with content, author, score, timestamp
- **Metadata**: extraction timestamp, source URL
- **File naming**: `reddit_extraction_YYYY-MM-DD_completed.json` or `reddit_extraction_YYYY-MM-DD_stopped.json`

### 🤖 AI Analysis Export Format
The exported AI analysis JSON includes:
- **Per-post analysis**: Individual analysis of each Reddit post
- **Aggregated insights**: Top requested tools, MVP recommendations, action plans
- **Metadata**: Analysis timestamp, model used, confidence scores
- **File naming**: `ai_analysis_YYYY-MM-DD.json`

## AI Analysis Schema

### Per-Post Analysis
Each Reddit post is analyzed for:
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
- `tabs`: To manage tabs for Reddit extraction
- `sidePanel`: To display the fixed sidebar interface
- Host permissions for `google.com`, `reddit.com`, and `platform.openai.com`

## Development

To modify or extend the extension:

1. Make your changes to the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Security & Privacy

This extension:
- Stores all data locally in your browser
- Stores OpenAI API keys locally (not recommended for production)
- Only accesses pages you explicitly visit
- Makes API calls to OpenAI with your credentials
- Allows you to clear all data at any time

**Important**: For production use, implement a backend proxy to keep your OpenAI API key secure.

## Future Enhancements

- Backend proxy for secure API key management
- Additional AI models support (Claude, Gemini)
- Real-time analysis streaming
- Advanced filtering and search capabilities
- Cloud storage integration
- Batch processing improvements
- Custom analysis prompts
- Team collaboration features

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.