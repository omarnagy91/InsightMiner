# Search Results Extractor Chrome Extension

A modern Chrome extension with dual-mode functionality for extracting Google search results and Reddit posts/comments. Features a beautiful toggle interface with Google and Reddit themed modes, real-time progress tracking, and intelligent data management.

## ✨ Features

### 🎨 Modern Dual-Mode Interface
- **Toggle Switcher**: Beautiful Google/Reddit mode switcher with themed interfaces
- **Google Theme**: Blue gradient with Google-style icons and colors
- **Reddit Theme**: Orange gradient with Reddit-style icons and colors
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
2. **Click the extension icon** in your Chrome toolbar
3. **Choose your mode**: Toggle between Google and Reddit extraction modes
4. **Follow the themed interface** for your selected mode

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

### 🎨 Interface Features

- **Mode Toggle**: Beautiful switcher between Google and Reddit modes
- **Themed Interfaces**: Google (blue) and Reddit (orange) themed UIs
- **Real-time Stats**: Live updates of extraction progress and results
- **Progress Tracking**: Visual progress bars and status indicators
- **Auto-detection**: Automatically detects Google search pages
- **Batch Collection**: Collect results from multiple searches and pages
- **Smart File Management**: Organized downloads with clear naming

## File Structure

```
chrome-extractor/
├── manifest.json          # Extension configuration with icons
├── background.js          # Background service worker with extraction logic
├── content-google.js      # Google search results extraction
├── content-reddit.js      # Reddit content extraction
├── popup.html            # Modern dual-mode popup interface
├── popup.js              # Enhanced popup with mode switching
├── icons/                # Extension icons (16px, 32px, 48px, 128px)
├── README.md             # This file
└── INSTALLATION.md       # Installation guide
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

## Permissions

The extension requires the following permissions:
- `activeTab`: To access the current tab's content
- `storage`: To store extracted data locally
- `scripting`: To inject content scripts
- `downloads`: To save CSV and JSON files to specific directories
- `tabs`: To manage tabs for Reddit extraction
- Host permissions for `google.com` and `reddit.com`

## Development

To modify or extend the extension:

1. Make your changes to the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Future Enhancements

- Additional search engines support
- Data filtering and search capabilities
- Export to other formats (Excel, XML)
- Cloud storage integration
- Batch processing improvements
- Real-time extraction progress display

## Privacy

This extension:
- Stores all data locally in your browser
- Does not send any data to external servers
- Only accesses pages you explicitly visit
- Allows you to clear all data at any time

## License

This project is open source and available under the MIT License.
