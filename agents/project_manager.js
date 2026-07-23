/*!
 * SmartLAP Project Manager Agent
 * Responsible for coordination, task management, and team leadership
 */

class ProjectManagerAgent {
    constructor() {
        this.name = 'ProjectManagerAgent';
        this.taskBoard = new Map();
        this.teamStatus = {
            developer: { active: 0, pending: 0, completed: 0 },
            labEngineer: { active: 0, pending: 0, completed: 0 },
            assistant: { active: 0, pending: 0, completed: 0 }
        };
        this.milestones = [
            { id: 'm1', name: 'Agent System Setup', deadline: '2024-01-15', status: 'pending' },
            { id: 'm2', name: 'Test Analysis Complete', deadline: '2024-01-20', status: 'pending' },
            { id: 'm3', name: 'Enhanced Test Implementation', deadline: '2024-01-25', status: 'pending' },
            { id: 'm4', name: 'Integration Testing', deadline: '2024-01-30', status: 'pending' },
            { id: 'm5', name: 'Documentation Complete', deadline: '2024-02-05', status: 'pending' }
        ];
    }
    
    createTask(taskName, agent, priority, deadline, dependencies = []) {
        console.log(`📋 ProjectManagerAgent: Creating task: ${taskName}`);
        
        const task = {
            id: this.generateTaskId(),
            name: taskName,
            agent: agent,
            priority: priority,
            deadline: deadline,
            status: 'pending',
            dependencies: dependencies,
            createdAt: new Date().toISOString(),
            assignedTo: agent,
            estimatedHours: this.estimateTaskComplexity(taskName),
            actualHours: 0,
            blockers: []
        };
        
        this.taskBoard.set(task.id, task);
        this.updateTeamStatus(agent, 'pending', 1);
        
        return task;
    }
    
    generateTaskId() {
        return 'task_' + Math.random().toString(36).substr(2, 9);
    }
    
    estimateTaskComplexity(taskName) {
        const complexityMap = {
            'setup_framework': 8,
            'competitor_research': 4,
            'technical_validation': 6,
            'implementation': 12,
            'integration': 8,
            'documentation': 4,
            'performance_optimization': 6
        };
        
        const key = taskName.toLowerCase().replace(/\s+/g, '_');
        return complexityMap[key] || 4;
    }
    
    updateTaskStatus(taskId, status, assignedTo = null, notes = null) {
        if (!this.taskBoard.has(taskId)) {
            console.log(`⚠️ ProjectManagerAgent: Task ${taskId} not found`);
            return null;
        }
        
        const task = this.taskBoard.get(taskId);
        const oldStatus = task.status;
        task.status = status;
        task.lastUpdated = new Date().toISOString();
        
        if (assignedTo) {
            task.assignedTo = assignedTo;
        }
        
        if (notes) {
            task.notes = notes;
        }
        
        this.taskBoard.set(taskId, task);
        
        if (oldStatus !== status) {
            this.updateTeamStatus(task.agent, oldStatus, -1);
            if (status === 'completed') {
                this.updateTeamStatus(task.agent, status, 1);
            }
        }
        
        console.log(`📊 ProjectManagerAgent: Task ${taskId} → ${status}`);
        
        // Check if all dependencies are met
        this.checkDependencies(taskId);
        
        // Update milestone status
        this.updateMilestones(taskId, status);
        
        return task;
    }
    
    updateTeamStatus(agent, action, count) {
        if (!this.teamStatus.hasOwnProperty(agent)) {
            this.teamStatus[agent] = { active: 0, pending: 0, completed: 0 };
        }
        
        const agentStatus = this.teamStatus[agent];
        
        if (action === 'pending') {
            agentStatus.pending += count;
        } else if (action === 'completed') {
            agentStatus.completed += count;
            agentStatus.pending -= Math.min(agentStatus.pending, count);
        }
        
        agentStatus.active = agentStatus.pending + agentStatus.completed;
    }
    
    checkDependencies(taskId) {
        if (!this.taskBoard.has(taskId)) {
            return false;
        }
        
        const task = this.taskBoard.get(taskId);
        
        if (task.dependencies && task.dependencies.length > 0) {
            const allDependenciesMet = task.dependencies.every(depId => {
                return this.taskBoard.has(depId) && 
                    ['completed', 'approved'].includes(this.taskBoard.get(depId).status);
            });
            
            if (allDependenciesMet && task.status === 'pending') {
                console.log(`✅ ProjectManagerAgent: All dependencies met for ${taskId}, unblocking...`);
                this.updateTaskStatus(taskId, 'ready', null, 'Dependencies completed automatically');
            }
        }
    }
    
    updateMilestones(taskId, taskStatus) {
        // Check for milestone completion
        const task = this.taskBoard.get(taskId);
        if (task && taskStatus === 'completed') {
            this.milestones.forEach(milestone => {
                if (!milestone.completed && task.name.toLowerCase().includes(milestone.name.toLowerCase())) {
                    milestone.status = 'completed';
                    milestone.completedAt = new Date().toISOString();
                    console.log(`🎉 ProjectManagerAgent: Milestone completed: ${milestone.name}`);
                }
            });
        }
    }
    
    generateReport(reportType = 'progress') {
        console.log(`📊 ProjectManagerAgent: Generating ${reportType} report...`);
        
        switch (reportType) {
            case 'progress':
                const totalTasks = this.taskBoard.size;
                const completedTasks = Array.from(this.taskBoard.values())
                    .filter(task => task.status === 'completed').length;
                const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                
                return {
                    summary: {
                        totalTasks,
                        completedTasks,
                        completionRate: completionRate.toFixed(1) + '%',
                        teamStatus: this.teamStatus
                    },
                    tasks: Array.from(this.taskBoard.values()),
                    nextSteps: this.getNextSteps()
                };
            
            case 'performance':
                return {
                    agentPerformance: this.teamStatus,
                    taskCompletionTimes: this.getTaskCompletionTimes(),
                    bottlenecks: this.identifyBottlenecks()
                };
            
            case 'status':
                return {
                    milestones: this.milestones,
                    currentStatus: this.getCurrentStatus(),
                    urgentActions: this.getUrgentActions()
                };
        }
    }
    
    getNextSteps() {
        const nextSteps = [];
        
        // Find tasks that are ready to start
        this.taskBoard.forEach(task => {
            if (task.status === 'pending' && task.dependencies.length === 0) {
                nextSteps.push(task.id);
            }
        });
        
        // Get tasks from agents that have capacity
        Object.entries(this.teamStatus).forEach(([agent, status]) => {
            if (status.pending === 0 && status.active < 3) {
                nextSteps.push(`Assign ${agent} to new tasks`);
            }
        });
        
        return nextSteps.slice(0, 5);
    }
    
    getTaskCompletionTimes() {
        return Array.from(this.taskBoard.values())
            .filter(task => task.completedAt)
            .map(task => ({
                id: task.id,
                name: task.name,
                duration: task.completedAt ? 
                    Math.round((new Date(task.completedAt) - new Date(task.createdAt)) / (1000 * 60 * 60)) : 0
            }));
    }
    
    identifyBottlenecks() {
        const bottlenecks = [];
        
        // Check for tasks with many dependencies
        this.taskBoard.forEach(task => {
            if (task.dependencies.length > 2 && task.status === 'pending') {
                bottlenecks.push(`Task ${task.id} (${task.name}) has ${task.dependencies.length} dependencies`);
            }
        });
        
        // Check for incomplete milestones
        this.milestones.forEach(milestone => {
            if (milestone.status !== 'completed') {
                bottlenecks.push(`Milestone ${milestone.name} is behind schedule`);
            }
        });
        
        return bottlenecks;
    }
    
    getCurrentStatus() {
        const currentDate = new Date();
        const activeProjects = this.taskBoard.values().filter(task => 
            task.status !== 'completed' && 
            task.status !== 'cancelled'
        );
        
        const overdueTasks = Array.from(activeProjects).filter(task => {
            if (task.deadline) {
                return new Date(task.deadline) < currentDate;
            }
            return false;
        });
        
        return {
            activeProjects: activeProjects.length,
            overdueTasks: overdueTasks.length,
            agentsActive: Object.keys(this.teamStatus).filter(agent => 
                this.teamStatus[agent].active > 0
            ).length
        };
    }
    
    getUrgentActions() {
        const urgentActions = [];
        
        // Check for overdue tasks
        const currentDate = new Date();
        this.taskBoard.forEach(task => {
            if (task.deadline) {
                const deadline = new Date(task.deadline);
                const daysLeft = (deadline - currentDate) / (1000 * 60 * 60 * 24);
                if (daysLeft <= 0 && task.status !== 'completed') {
                    urgentActions.push({
                        taskId: task.id,
                        name: task.name,
                        deadline: task.deadline,
                        priority: task.priority
                    });
                } else if (daysLeft <= 3 && task.status === 'pending') {
                    urgentActions.push({
                        taskId: task.id,
                        name: task.name,
                        deadline: task.deadline,
                        priority: task.priority
                    });
                }
            }
        });
        
        return urgentActions.sort((a, b) => a.priority.localeCompare(b.priority));
    }
    
    coordinateTeam(action, payload = {}) {
        console.log(`🤝 ProjectManagerAgent: Coordinating team for: ${action}`);
        
        switch (action) {
            case 'start_research':
                this.createTask('Competitor Research', 'developer', 'high', '2024-01-20');
                this.createTask('Technical Validation', 'labEngineer', 'medium', '2024-01-22');
                break;
            
            case 'implement_enhancements':
                const testEnhancementsTask = this.createTask(
                    'Implement Test Enhancements', 'developer', 'high', '2024-01-25'
                );
                testEnhancementsTask.dependencies.push(...Array.from(this.taskBoard.keys()).filter(id => 
                    this.taskBoard.get(id).name.includes('Validation')
                ));
                break;
            
            case 'integration':
                this.createTask('Integration Testing', 'developer', 'medium', '2024-01-30');
                break;
            
            case 'documentation':
                this.createTask('Documentation Generation', 'assistant', 'low', '2024-02-05');
                break;
        }
    }
    
    receiveMessage(message) {
        console.log(`📥 ProjectManagerAgent received: ${message.type} from ${message.from}`);
        
        switch (message.type) {
            case 'coordination_request':
                this.coordinateTeam(message.payload.action, message.payload);
                break;
            case 'task_update':
                this.updateTaskStatus(message.payload.taskId, message.payload.status, 
                    message.payload.assignedTo, message.payload.notes);
                break;
            case 'report_request':
                const report = this.generateReport(message.payload.type);
                this.sendMessage('ProjectManagerAgent', message.from, 'report_generated', report);
                break;
        }
    }
    
    sendMessage(to, type, payload) {
        if (typeof this.system !== 'undefined') {
            return this.system.sendMessage(this.name, to, type, payload);
        }
    }
    
    getState() {
        return {
            name: this.name,
            activeTasks: this.taskBoard.size,
            teamStatus: this.teamStatus,
            milestones: this.milestones.length
        };
    }
}

module.exports = ProjectManagerAgent;