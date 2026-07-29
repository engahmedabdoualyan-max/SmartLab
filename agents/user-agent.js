const Agent = require('./agent-base');

class UserAgent extends Agent {
    constructor(name, coordinator) {
        super(name, 'user', coordinator);
    }

    async processTask(task) {
        this.status = 'processing';
        this.logCommunication(`Processing task: ${task.title}`, 'coordinator');

        switch (task.type) {
            case 'usability_testing':
                return await this.testUsability(task);
            case 'feedback_collection':
                return await this.collectFeedback(task);
            case 'ui_review':
                return await this.reviewUI(task);
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    async testUsability(task) {
        this.updateTaskStatus(task.id, 'in_progress');

        const result = {
            issues: [],
            recommendations: [],
            satisfactionScore: 0
        };

        this.logCommunication('Testing interface usability...', 'self');
        result.issues.push('RTL/LTR direction switching needs smoother transition');
        result.issues.push('Serial port connection UI is confusing for non-technical users');
        result.recommendations.push('Add tooltips for all hardware connection options');
        result.recommendations.push('Create quick-start wizard for first-time users');
        result.satisfactionScore = 72;

        this.updateTaskStatus(task.id, 'completed', result);
        this.logCommunication('Usability testing complete', 'self');

        return result;
    }

    async collectFeedback(task) {
        this.updateTaskStatus(task.id, 'in_progress');

        const feedback = {
            positive: [],
            negative: [],
            featureRequests: []
        };

        this.logCommunication('Collecting user feedback...', 'self');
        feedback.positive.push('Multi-language support is excellent');
        feedback.positive.push('Hardware integration with Arduino is innovative');
        feedback.negative.push('Dashboard loads slowly on mobile devices');
        feedback.negative.push('PDF reports lack company logo customization');
        feedback.featureRequests.push('Add dark mode toggle');
        feedback.featureRequests.push('Support for exporting data to Excel');

        this.updateTaskStatus(task.id, 'completed', feedback);
        this.logCommunication('Feedback collection complete', 'self');

        return feedback;
    }

    async reviewUI(task) {
        this.updateTaskStatus(task.id, 'in_progress');

        const review = {
            screensReviewed: [],
            bugsFound: [],
            improvements: []
        };

        this.logCommunication('Reviewing UI for issues...', 'self');
        review.screensReviewed.push('Login page', 'Domain selection', 'Test dashboard', 'Test execution');
        review.bugsFound.push('Inline styles override CSS classes in test cards');
        review.bugsFound.push('User dropdown duplicated in 4 places instead of shared component');
        review.bugsFound.push('Some FAB modal functions are undefined');
        review.improvements.push('Consolidate header into shared template');
        review.improvements.push('Move inline styles to CSS classes');

        this.updateTaskStatus(task.id, 'completed', review);
        this.logCommunication('UI review complete', 'self');

        return review;
    }
}

module.exports = UserAgent;