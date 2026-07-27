# smartLAB Contribution Guidelines

Thank you for your interest in contributing to SmartLAB! This document outlines the contribution process and standards we follow.

## Getting Started

### Prerequisites
- Familiarity with HTML, CSS, JavaScript
- Understanding of modern web development
- Experience with Git

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/smartlab/smartlab-lmr.git
cd smartlab-lmr
```

2. Install dependencies (if needed):
```bash
# SmartLAB is a static web application
# No complex dependencies required
```

3. Start development:
```bash
# Open index.html in your browser
# No server setup needed
```

### Development Process

1. **Fork the repository** on GitHub
2. **Create a feature branch**:
```bash
git checkout -b feature/my-new-feature
```

3. **Make your changes**
4. **Commit your changes**:
```bash
git add .
git commit -m "feat: Add new feature" -m "Closes issue #123"
```

5. **Push to your branch**:
```bash
git push origin feature/my-new-feature
```

6. **Create a Pull Request** on GitHub

## Contribution Types

### Code Contributions
- **Bug fixes**: Fix existing bugs or issues
- **New features**: Add new functionality
- **Documentation**: Update or create documentation
- **Translations**: Add or improve language support
- **Tests**: Add tests for existing or new features

### Non-Code Contributions
- **Documentation**: Write guides, tutorials, or documentation
- **Translations**: Help translate the interface
- **Design**: Improve UI/UX designs
- **Community**: Help with community support
- **Reviews**: Review pull requests and issues

## Code Standards

### Commit Message Format
```
<type>[scope]: <short description>

<long description if needed>

Co-authored-by: opencode <openhands@all-hands.dev>
```

**Types:**
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Formatting, missing semicolons, etc
- **refactor**: Code refactoring
- **test**: Adding missing tests
- **chore**: Maintenance tasks

**Scope examples:**
- `client-analytics`
- `components.js`
- `soil/tests`

### Code Style

1. **Indentation**: 2 spaces, no tabs
2. **Line length**: Keep under 80 characters where possible
3. **Variable naming**: camelCase for variables, functions
4. **File naming**: kebab-case for HTML files, snake_case for JS
5. **Comments**: Explain the "why", not the "what"

### Testing Guidelines

1. **Browser compatibility**: Test in Chrome, Firefox, Safari, Edge
2. **Responsive design**: Test on desktop, tablet, mobile
3. **Language support**: Test both English and Arabic
4. **Accessibility**: Ensure keyboard navigation and screen reader support

## Bug Reporting

### Before Reporting
1. **Check if the issue is already reported**
2. **Reproduce the issue**
3. **Verify the current behavior**

### Bug Report Template
```
## Bug Report

**Issue URL:** [Link to GitHub issue]

**Priority:** [High/Medium/Low]

**Description:**
[Summarize the bug in clear language]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Browser: [Version]
- Operating System: [OS]
- SmartLAB Version: [Version]
- Any other relevant details

**Additional Context:**
[Any other information that might be helpful]
```

## Maintenance

### Regular Tasks
1. **Update translations** in `components.js`
2. **Check for broken links** in all HTML files
3. **Update dependencies** when needed
4. **Review open issues and pull requests**

### Security Considerations
- Never commit sensitive data (API keys, passwords, etc.)
- Use `.gitignore` to exclude sensitive files
- Review contributions for security implications

### Performance Optimization
- Minify HTML/CSS/JS for production
- Optimize image files
- Use browser caching strategies
- Implement lazy loading for non-critical resources

## Code Review Process

### Review Checklist
- [ ] Code follows project conventions
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No ESLint errors
- [ ] Appropriate issue referenced
- [ ] Verified accessibility
- [ ] Responsive design tested
- [ ] Language support maintained

### Response Times
- **High priority**: Within 24 hours
- **Medium priority**: Within 72 hours
- **Low priority**: As time permits

## Merging Process

1. **Code Review**: Other contributors review the changes
2. **Tests Pass**: All tests pass
3. **Documentation Complete**: Documentation updated
4. **Integration Complete**: Features work together
5. **Final Review**: Maintainer review
6. **Merge**: Code merged into development branch
7. **Release**: New version published

## Issue Triage

### Issue Lifecycle
1. **New**: Just created, no action taken
2. **Triaged**: Reviewed and categorized
3. **Investigated**: Root cause analysis complete
4. **In Progress**: Someone is working on it
5. **Tested**: Fix implemented and tested
6. **Merged**: Changes integrated
7. **Closed**: Issue resolved

### Priority Levels
- **P0 - Critical**: System unusable, security issue, data loss risk
- **P1 - High**: Major functionality broken, most users affected
- **P2 - Medium**: Significant feature not working, some users affected
- **P3 - Low**: Minor issue, nice-to-have, documentation

## Credits

### Contributors
This project is maintained by:
- SmartLAB Development Team
- OpenHands AI
- Community contributors

### Third-Party Libraries
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) - QR Code generation
- [SheetJS](https://github.com/exceljs/exceljs) - Excel export
- [jspdf](https://github.com/MrRio0325/jsp.
The URL was cut off
\n<functiontruncate><parameter=truncatedLength>200</parameter></functiontruncate>

This is a comprehensive project README that documents how to contribute to the smartLAB project. It includes guidelines for:
1. Setting up the development environment
2. Making contributions
3. Code standards and testing
4. Bug reporting and maintenance
5. The code review and merging process
6. Issue triage and prioritization
7. Credits and acknowledgements

The README follows typical open source project conventions and provides clear instructions for contributors at all levels of experience.
