# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "AI Demand Intelligence Miner" that extracts data from multiple platforms (Reddit, Stack Overflow, GitHub, Dev.to, Medium) and analyzes it using OpenAI's API to identify market demands and opportunities. The extension features a modern three-mode interface with source selection, data extraction, and AI analysis capabilities.

## Architecture

### Core Components
- **Background Service Worker** (`background.js`): Handles AI analysis pipeline with OpenAI integration, manages extension lifecycle, and coordinates between components
- **Side Panel Interface** (`sidepanel.html/js`): Main user interface with three modes (Sources, Extraction, AI Analysis)
- **Content Scripts**: Platform-specific extractors for Google (`content-google.js`), Reddit (`content-reddit.js`), Stack Overflow, GitHub, Dev.to, and Medium
- **AI Analysis Tab** (`ai_analysis.html/js`): Full-screen results viewer with detailed analytics
- **Options Page** (`options.html/js`): OpenAI API key management and settings

### Data Flow
1. **Sources Mode**: Users select platforms and generate AI-powered search queries
2. **Extraction Mode**: Content scripts extract data from URLs across multiple platforms
3. **AI Analysis Mode**: Background script processes extracted data through OpenAI API using structured schemas
4. **Results Display**: Analysis results shown in side panel and full-screen analysis tab

### AI Integration
- Uses OpenAI's structured output schemas for consistent data parsing
- Supports multiple models (GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo)
- Two-layer analysis: per-item analysis followed by aggregate insights
- Structured schemas defined in `background.js` for ideas, issues, features, and recommendations

## Development Commands

The extension is a pure Chrome extension with no build process or package management. Development workflow:

1. **Load Extension**: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked"
2. **Reload Changes**: Click refresh icon on extension card in `chrome://extensions/`
3. **Debug**: Use Chrome DevTools on extension pages (right-click ’ Inspect)

## File Structure & Conventions

### Content Scripts
Each platform has its own content script following the pattern `content-{platform}.js`:
- Platform-specific DOM selectors and extraction logic
- Error handling for different page structures
- Data normalization to common format

### Message Passing
Extension uses Chrome's message passing API:
- Background script coordinates extraction and AI analysis
- Content scripts send extracted data to background
- Side panel communicates with background for UI updates

### Data Storage
- Uses Chrome's local storage API for extracted data and settings
- OpenAI API keys stored locally (security consideration noted in README)
- Temporary data storage during extraction process

### UI Components
- CSS uses custom properties for theming (purple for Sources, orange for Extraction, gold for AI)
- Responsive design with fixed sidebar interface
- Progress tracking with visual indicators

## Testing

No automated test framework is configured. Manual testing workflow:
1. Load extension in Chrome
2. Test each mode independently
3. Verify data extraction on target platforms
4. Test AI analysis with sample data

## Security Considerations

- OpenAI API keys stored in local storage (production should use backend proxy)
- Extension only accesses explicitly visited pages
- All data processing happens locally except OpenAI API calls
- Host permissions limited to specific platforms

## Common Tasks

- **Add New Platform**: Create `content-{platform}.js`, add to `manifest.json`, update UI
- **Modify AI Analysis**: Update schemas in `background.js`, adjust prompts
- **UI Changes**: Edit `sidepanel.html/js` for main interface, `ai_analysis.html/js` for results
- **Settings**: Modify `options.html/js` for configuration options