# Security Policy

## Supported Versions

We provide security updates for the following versions of Reddit AI Demand Miner:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT create a public issue

**Do not** create a public GitHub issue for security vulnerabilities. This could put users at risk.

### 2. Report privately

Please report security vulnerabilities privately by:

- **Email**: [security@example.com](mailto:security@example.com) (replace with actual email)
- **GitHub Security Advisories**: Use GitHub's private vulnerability reporting feature
- **Direct message**: Contact the maintainers directly

### 3. Include the following information

When reporting a vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Impact**: Potential impact and severity assessment
- **Environment**: Chrome version, OS, extension version
- **Proof of concept**: If applicable, provide a minimal proof of concept
- **Suggested fix**: If you have ideas for fixing the issue

### 4. Response timeline

We will:

- **Acknowledge** your report within 48 hours
- **Investigate** the issue within 7 days
- **Provide updates** on our progress
- **Release a fix** as soon as possible (typically within 30 days)
- **Credit** you in our security advisories (unless you prefer to remain anonymous)

## Security Considerations

### Data Privacy

- **Local Storage Only**: All data is stored locally in your browser
- **No Cloud Sync**: Data is never transmitted to external servers
- **User Control**: You can clear all data at any time
- **API Keys**: Stored locally and never shared

### Permissions

The extension requests minimal permissions:

- `activeTab`: Access current tab content for extraction
- `storage`: Store data locally in browser
- `scripting`: Inject content scripts for data extraction
- `downloads`: Save exported files to Downloads folder
- `tabs`: Manage tabs for Reddit extraction
- `sidePanel`: Display the sidebar interface
- `contextMenus`: Add context menu options

### API Security

- **OpenAI API**: Direct communication with OpenAI's servers
- **API Key Storage**: Stored locally in browser storage
- **No Proxy**: Direct API calls (consider using a proxy for production)
- **Rate Limiting**: Built-in delays to respect API limits

### Content Security

- **Input Sanitization**: All user inputs are sanitized
- **Output Validation**: All API responses are validated
- **Error Handling**: Graceful error handling prevents crashes
- **XSS Prevention**: Content is properly escaped and sanitized

## Best Practices for Users

### API Key Security

1. **Use a dedicated API key** for this extension
2. **Set usage limits** in your OpenAI account
3. **Monitor usage** regularly
4. **Regenerate keys** if compromised
5. **Never share** your API key

### Data Management

1. **Regular exports**: Export your data regularly
2. **Clear sensitive data**: Clear data when done
3. **Secure storage**: Keep exported files secure
4. **Backup important data**: Don't rely solely on browser storage

### Browser Security

1. **Keep Chrome updated**: Use the latest Chrome version
2. **Enable security features**: Use Chrome's built-in security features
3. **Review permissions**: Regularly review extension permissions
4. **Remove unused extensions**: Remove extensions you don't use

## Security Features

### Built-in Protections

- **Input Validation**: All inputs are validated and sanitized
- **Output Encoding**: All outputs are properly encoded
- **Error Boundaries**: Errors are caught and handled gracefully
- **Rate Limiting**: API calls are rate-limited to prevent abuse
- **Data Isolation**: Data is isolated per browser profile

### Privacy Features

- **No Tracking**: No user tracking or analytics
- **No Telemetry**: No usage data is collected
- **Local Processing**: All processing happens locally
- **User Control**: Full control over data and settings

## Known Security Considerations

### Current Limitations

1. **API Key Storage**: API keys are stored in browser storage (not encrypted)
2. **Direct API Calls**: Direct calls to OpenAI (no proxy)
3. **Browser Storage**: Data stored in browser storage (not encrypted)
4. **Content Scripts**: Content scripts have access to page content

### Recommendations for Production Use

1. **Use a backend proxy** for API calls
2. **Encrypt sensitive data** before storage
3. **Implement proper authentication** for API access
4. **Use HTTPS** for all communications
5. **Regular security audits** of the codebase

## Security Updates

We regularly update the extension to address security issues:

- **Dependency updates**: Keep all dependencies updated
- **Security patches**: Apply security patches promptly
- **Vulnerability scanning**: Regular vulnerability assessments
- **Code reviews**: Security-focused code reviews

## Contact

For security-related questions or concerns:

- **Security Issues**: [security@example.com](mailto:security@example.com)
- **General Questions**: Open a GitHub issue
- **Documentation**: Check this file and README.md

## Acknowledgments

We thank the security researchers and community members who help keep this project secure by responsibly reporting vulnerabilities.

---

**Note**: This security policy is a living document and will be updated as needed. Please check back regularly for updates.
