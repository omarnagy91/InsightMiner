# Contributing to Reddit AI Demand Miner

Thank you for your interest in contributing to the Reddit AI Demand Miner Chrome Extension! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

If you find a bug or have a feature request, please:

1. **Check existing issues** first to avoid duplicates
2. **Use the issue templates** when creating new issues
3. **Provide detailed information**:
   - Chrome version and OS
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Screenshots or error messages if applicable

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing feature requests** first
2. **Describe the use case** and how it would benefit users
3. **Consider the scope** and complexity of the feature
4. **Provide mockups or examples** if possible

### Code Contributions

#### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/chrome-extractor.git
   cd chrome-extractor
   ```
3. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Setup

1. **Load the extension** in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder

2. **Make your changes** and test thoroughly

3. **Test across different scenarios**:
   - Different Reddit subreddits
   - Various Google search queries
   - Different OpenAI API responses
   - Edge cases and error conditions

#### Code Style Guidelines

- **Use consistent formatting** (prettier recommended)
- **Follow existing naming conventions**
- **Add comments** for complex logic
- **Keep functions focused** and single-purpose
- **Handle errors gracefully** with user-friendly messages

#### File Structure

```
chrome-extractor/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content-*.js           # Content scripts
├── popup.html/js          # Popup interface
├── sidepanel.html/js      # Sidebar interface
├── ai_analysis.html/js    # AI analysis tab
├── options.html/js        # Settings page
└── icons/                 # Extension icons
```

#### Testing Your Changes

1. **Test all three modes**: Google, Reddit, and AI Analysis
2. **Verify data persistence** across browser sessions
3. **Check error handling** with invalid inputs
4. **Test on different websites** and Reddit subreddits
5. **Verify API key security** and storage

#### Submitting Changes

1. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "Add feature: enhanced AI analysis export"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots or demo videos if applicable
   - Testing notes

## 🏗️ Development Guidelines

### Architecture

The extension follows a modular architecture:

- **Background Script**: Handles API calls, data processing, and storage
- **Content Scripts**: Extract data from web pages
- **UI Components**: Popup, sidebar, and analysis tab interfaces
- **Storage**: Local browser storage for data persistence

### Key Technologies

- **Chrome Extensions API**: Manifest V3
- **OpenAI API**: GPT-4 for analysis
- **Modern JavaScript**: ES6+ features
- **CSS Grid/Flexbox**: Responsive layouts
- **Local Storage**: Data persistence

### Security Considerations

- **API Keys**: Stored locally, never transmitted to third parties
- **Data Privacy**: All data stays in user's browser
- **Permissions**: Minimal required permissions
- **Content Security**: Sanitized inputs and outputs

## 🧪 Testing

### Manual Testing Checklist

- [ ] Google search extraction works on various queries
- [ ] Reddit extraction handles different post types
- [ ] AI analysis processes data correctly
- [ ] Export functions generate valid files
- [ ] Error handling works for edge cases
- [ ] UI is responsive on different screen sizes
- [ ] Data persists across browser restarts

### Automated Testing

While we don't have automated tests yet, consider adding:

- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for user workflows

## 📝 Documentation

### Code Documentation

- **Comment complex functions** with JSDoc
- **Update README.md** for new features
- **Document API changes** in pull requests
- **Maintain changelog** for releases

### User Documentation

- **Keep README.md updated** with new features
- **Add screenshots** for UI changes
- **Update installation instructions** if needed
- **Document breaking changes** clearly

## 🚀 Release Process

### Version Numbering

We follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes or major feature additions
- **MINOR**: New features or significant improvements
- **PATCH**: Bug fixes and minor improvements

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Version number is incremented
- [ ] Changelog is updated
- [ ] Extension is tested in Chrome Web Store

## 🤔 Questions?

If you have questions about contributing:

1. **Check existing issues** and discussions
2. **Join our community** (if available)
3. **Open a discussion** for general questions
4. **Create an issue** for specific problems

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to make Reddit AI Demand Miner better for everyone! 🎉
