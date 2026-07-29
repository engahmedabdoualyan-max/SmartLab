const Agent = require('./agent-base');

class UIDeveloperAgent extends Agent {
    constructor(name, coordinator) {
        super(name, 'ui_developer', coordinator);
    }

    async processTask(task) {
        this.status = 'processing';
        this.logCommunication(`Processing task: ${task.title}`, 'coordinator');

        switch (task.type) {
            case 'ui_audit':
                return await this.auditUI(task);
            case 'ui_fix':
                return await this.fixUI(task);
            case 'ui_improvement':
                return await this.improveUI(task);
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    async auditUI(task) {
        this.updateTaskStatus(task.id, 'in_progress');

        const issues = [
            {
                severity: 'high',
                category: 'inline_styles',
                description: '~250 inline style attributes in index.html should be moved to CSS classes',
                files: ['index.html'],
                recommendation: 'Extract all style= attributes to CSS classes in style.css'
            },
            {
                severity: 'high',
                category: 'duplication',
                description: 'App header with user dropdown duplicated in 4 screens (domains, chat, dashboard, test)',
                files: ['index.html'],
                recommendation: 'Create shared header template rendered by JavaScript'
            },
            {
                severity: 'medium',
                category: 'undefined_functions',
                description: 'FAB modal references functions that are not defined (showHardwareHelp, showSoftwareHelp, showContactSupport, showAboutSystem)',
                files: ['index.html', 'js/fab.js'],
                recommendation: 'Implement the missing FAB modal functions'
            },
            {
                severity: 'medium',
                category: 'i18n',
                description: 'Translation strings truncated in many languages (Chinese, Japanese, Russian)',
                files: ['js/i18n.js'],
                recommendation: 'Complete all truncated translation entries'
            },
            {
                severity: 'low',
                category: 'css',
                description: 'style-enhanced.css (1423 lines) may contain unused classes',
                files: ['css/style-enhanced.css'],
                recommendation: 'Audit and remove unused CSS classes'
            },
            {
                severity: 'low',
                category: 'responsive',
                description: 'Some test cards may not render well on very small screens',
                files: ['css/style.css', 'index.html'],
                recommendation: 'Add more media queries for <400px widths'
            }
        ];

        this.updateTaskStatus(task.id, 'completed', issues);
        this.logCommunication('UI audit complete - found ' + issues.length + ' issues', 'self');

        return issues;
    }

    async fixUI(task) {
        this.updateTaskStatus(task.id, 'in_progress');

        const fixes = [];
        this.logCommunication('Applying UI fixes...', 'self');

        fixes.push({
            issue: 'Undefined FAB functions',
            action: 'Implement showHardwareHelp, showSoftwareHelp, showContactSupport, showAboutSystem',
            status: 'planned'
        });

        fixes.push({
            issue: 'Header duplication',
            action: 'Create renderHeader() function in navigation.js to generate shared header',
            status: 'planned'
        });

        fixes.push({
            issue: 'Inline styles',
            action: 'Extract inline styles to CSS classes in style.css',
            status: 'planned'
        });

        this.updateTaskStatus(task.id, 'completed', fixes);
        this.logCommunication('UI fix plan generated', 'self');

        return fixes;
    }

    async improveUI(task) {
        this.updateTaskStatus(task.id, 'in_progress');

        const improvements = [
            {
                area: 'Loading states',
                description: 'Add skeleton loaders for dashboard statistics and test panels',
                priority: 'medium'
            },
            {
                area: 'Animations',
                description: 'Add micro-interactions for button clicks and test completion',
                priority: 'low'
            },
            {
                area: 'Accessibility',
                description: 'Improve ARIA labels, keyboard navigation, and screen reader support',
                priority: 'high'
            },
            {
                area: 'Performance',
                description: 'Lazy-load test modules and defer non-critical JavaScript',
                priority: 'medium'
            }
        ];

        this.updateTaskStatus(task.id, 'completed', improvements);
        this.logCommunication('UI improvement plan generated', 'self');

        return improvements;
    }
}

module.exports = UIDeveloperAgent;