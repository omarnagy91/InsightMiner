# Changelog

All notable changes to the InsightMiner Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-01-XX

### Added
- **GPT-5 Model Support**: Added support for GPT-5 and GPT-5 Turbo models when available
- **Real-time Analysis Streaming**: Implemented streaming API calls for real-time analysis updates
- **Custom Analysis Prompts**: Added customizable prompts for per-post analysis, pitch generation, and MVP planning
- **Batch Processing Improvements**: Enhanced batch processing for large datasets with configurable batch sizes and delays
- **API Key Validation**: Added real-time API key testing with model availability checking
- **Dynamic Model Loading**: Models are now loaded dynamically based on API key access
- **Enhanced Debugging**: Comprehensive logging for AI analysis debugging and troubleshooting
- **Simplified Analysis Options**: Replaced complex demand scoring weights with intuitive "Analysis Depth" and "Focus Area" dropdowns

### Changed
- **Rebranded to InsightMiner**: Complete rebranding with new name, description, and icon
- **Updated OpenAI API Integration**: Migrated from Responses API to Chat Completions API
- **Improved Error Handling**: Enhanced error handling with exponential backoff and retry logic
- **Better Progress Tracking**: More accurate progress indicators for extraction and analysis
- **Enhanced UI/UX**: Simplified analysis options and improved user experience
- **Increased Concurrency**: Raised concurrent API call limit from 2 to 3 for better performance

### Fixed
- **AI Analysis Empty Results**: Fixed issue where AI analysis was returning empty arrays by simplifying JSON schema and enhancing prompts
- **Google Search Multi-Page Extraction**: Now extracts results from multiple search result pages (up to 3 pages) with proper pagination
- **Extraction Progress UI**: Fixed progress indicator staying at zero during Reddit extraction with proper 1-based indexing
- **Automatic Data Flow**: Fixed workflow to automatically load search results into extraction mode without manual CSV handling
- **AI Analysis Setup**: Fixed automatic setup of AI analysis mode with extracted data using correct storage keys
- **Infinite Loop Issues**: Resolved infinite loop in AI analysis setup with smart periodic refresh and setup flags
- **TypeError Fixes**: Fixed "Cannot read properties of undefined" errors in UI updates with null safety checks
- **Syntax Errors**: Fixed extra closing brace causing syntax errors in sidepanel.js
- **Storage Key Mismatch**: Fixed extractionState storage key mismatch between background and sidepanel scripts
- **Content Script Communication**: Improved communication between background and content scripts with fallback mechanisms
- **API Response Format**: Fixed OpenAI API response format from json_schema to json_object for Chat Completions API
- **JavaScript DOM Errors**: Fixed null element reference errors when accessing removed weight control elements
- **OpenAI API Integration**: Migrated from Responses API to Chat Completions API with proper request/response format
- **Google Search Extraction**: Fixed content script not returning results and enhanced with fallback extraction methods
- **Progress Tracking**: Fixed extraction completion state not being properly set and communicated to UI

### Technical Improvements
- **Modular Architecture**: Split monolithic background.js into focused modules
- **Enhanced Constants Management**: Centralized constants in dedicated module
- **Improved Storage Management**: Better versioned storage and data persistence
- **Advanced Deduplication**: Enhanced fuzzy merging for near-duplicate items
- **Better Content Controls**: Implemented comment capping and content truncation
- **Error Tracking**: Added failed URL tracking with UI exposure and export
- **Security Enhancements**: Added API key handling warnings and minimized permissions

### Detailed Technical Fixes

#### **AI Analysis & OpenAI Integration**
- **Schema Simplification**: Reduced complex nested JSON schema to simple `{text, quote}` structure for better AI compliance
- **API Migration**: Switched from OpenAI Responses API to Chat Completions API for better stability
- **Request Format**: Updated from `input` array to `messages` array format
- **Response Parsing**: Changed from `data?.output?.[0]?.content?.[0]?.text` to `data?.choices?.[0]?.message?.content`
- **Model Names**: Fixed invalid model name from `gpt-4.1-mini` to `gpt-4o-mini`
- **Response Format**: Updated from `body.text.format` to `body.response_format` parameter

#### **Google Search Extraction**
- **Multi-Page Support**: Added pagination with `start` parameter (0, 10, 20) for up to 3 pages per query
- **Content Script Response**: Fixed to return actual results instead of just `{success: true}`
- **Enhanced Selectors**: Added comprehensive CSS selectors (`.MjjYud`, `.hlcw0c`, `.g .yuRUbf`, `.g .tF2Cxc`)
- **Fallback Extraction**: Implemented backup method scanning all external links when primary selectors fail
- **Result Filtering**: Added filtering to remove Google internal links and common non-result domains

#### **Extraction Progress & UI**
- **Progress Calculation**: Fixed from 0-based to 1-based indexing (`progress: i + 1`)
- **Completion State**: Added proper `completed: true` flag and end time tracking
- **Storage Keys**: Fixed mismatch between `'dataExtraction'` and `'extractionState'` keys
- **Automatic Setup**: Added automatic AI Analysis mode configuration when extraction completes
- **Periodic Refresh**: Implemented smart refresh that only runs during active extraction

#### **JavaScript & DOM Issues**
- **Null Safety**: Added null checks for all DOM element access to prevent `addEventListener` errors
- **Element References**: Updated to reference new analysis option elements instead of removed weight controls
- **Syntax Errors**: Removed extra closing brace `});` at end of sidepanel.js file
- **Function Updates**: Renamed `setupWeightControls` to `setupAnalysisOptionsControls` with new logic

#### **Workflow Integration**
- **Seamless Data Flow**: Automatic handoff from search results to extraction mode
- **Storage Integration**: Direct use of stored search results without manual CSV export/import
- **UI Feedback**: Added auto-load messages and platform breakdown displays
- **Error Handling**: Enhanced with fallback mechanisms and comprehensive logging

## [2.0.0] - 2024-12-XX

### Added
- **Multi-Platform Search Generation**: AI-powered search query generation with platform-specific dorks
- **Synonym Injection**: Automatic synonym generation for search queries (max 2 per query)
- **Multi-Page Search Extraction**: Extract results from multiple Google search result pages
- **Content Size Controls**: Comment capping (top 10) and content truncation (32k char limit)
- **Error Tracking**: Failed URL tracking with UI exposure and export capabilities
- **Configurable Demand Scoring**: Simplified scoring with "Analysis Depth" and "Focus Area" options
- **Continue/Regenerate Options**: Ability to continue or regenerate analysis at any step
- **Markdown Export**: Added Markdown export for brief analysis summaries
- **Versioned Storage**: Implemented versioned saves for all data types
- **Security Warnings**: Added API key handling warnings in options page

### Changed
- **Workflow Integration**: Seamless data flow between search, extraction, and analysis modes
- **UI Simplification**: Replaced complex demand scoring weights with intuitive dropdowns
- **Progress Indicators**: More accurate and detailed progress tracking
- **Error Handling**: Enhanced error handling with user-friendly messages
- **Storage Architecture**: Improved data persistence and retrieval

### Fixed
- **Google Search Extraction**: Fixed extraction of all search result pages, not just the first
- **Reddit Extraction Progress**: Fixed progress UI showing correct extraction status
- **AI Analysis Workflow**: Fixed automatic data handoff between extraction and analysis
- **Content Script Issues**: Improved communication and error handling
- **UI State Management**: Fixed various UI state synchronization issues

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Reddit AI Demand Miner Chrome Extension
- Three-mode sidebar interface (Google, Reddit, AI Analysis)
- Google search results extraction with CSV export
- Reddit content extraction with JSON export
- OpenAI GPT-4 integration for AI analysis
- Structured output analysis with demand pattern identification
- MVP recommendations and action plan generation
- Real-time progress tracking and statistics
- Local data storage and management
- API key management for OpenAI integration
- Context menu integration for Google search pages
- Stop-and-save functionality for Reddit extraction
- Comprehensive error handling and user feedback
- Modern gradient-based UI themes for each mode
- Responsive design for different screen sizes
- Export functionality for all data types
- Installation and usage documentation

### Technical Features
- Chrome Extensions Manifest V3 compliance
- Service worker architecture for background processing
- Content script injection for data extraction
- Local storage for data persistence
- Chrome Downloads API integration
- Side panel API for persistent interface
- Structured OpenAI API integration with JSON schemas
- Token optimization and rate limiting
- Data sanitization and validation
- Cross-origin request handling

### Security & Privacy
- Local-only data storage
- Secure API key management
- Minimal permission requirements
- No third-party data transmission
- User-controlled data export and deletion

## [0.9.0] - 2024-01-XX (Beta)

### Added
- Beta version with core functionality
- Basic Google search extraction
- Initial Reddit content scraping
- OpenAI integration prototype
- Simple popup interface
- Basic data export capabilities

### Changed
- Refined extraction algorithms
- Improved error handling
- Enhanced user interface

### Fixed
- Various bug fixes and stability improvements
- Better handling of edge cases
- Improved data validation

---

## Version History Summary

- **v1.0.0**: Full-featured release with three-mode interface and AI analysis
- **v0.9.0**: Beta release with core extraction functionality

## Future Roadmap

### Planned Features
- [ ] PDF export for analysis results
- [ ] Additional AI models support (Claude, Gemini)
- [ ] Real-time analysis streaming
- [ ] Advanced filtering and search capabilities
- [ ] Cloud storage integration
- [ ] Team collaboration features
- [ ] Custom analysis prompts
- [ ] Batch processing improvements
- [ ] Backend proxy for secure API key management
- [ ] Automated testing suite
- [ ] Performance optimizations
- [ ] Multi-language support

### Known Issues
- PDF export feature is placeholder (coming soon)
- Some edge cases in Reddit extraction may need refinement
- Large datasets may require performance optimization

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Support

For support, feature requests, or bug reports, please open an issue on the GitHub repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
