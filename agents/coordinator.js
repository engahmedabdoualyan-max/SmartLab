/*!
 * SmartLAP Multi-Agent System
 * Main coordination and message passing framework
 */

const fs = require('fs');
const path = require('path');

// Core agent system with message passing and task tracking
class SmartLAPAgentSystem {
    constructor() {
        this.agents = new Map();
        this.tasks = new Map();
        this.messages = [];
        this.version = '1.0.0';
    }
    
    registerAgent(agent) {
        this.agents.set(agent.name, agent);
        agent.system = this;
        console.log(`✅ Agent registered: ${agent.name}`);
    }
    
    sendMessage(from, to, type, payload) {
        const message = {
            id: this.generateMessageId(),
            from,
            to,
            type,
            payload,
            timestamp: new Date().toISOString()
        };
        this.messages.push(message);
        
        if (this.agents.has(to)) {
            this.agents.get(to).receiveMessage(message);
        }
        console.log(`📤 Message: ${from} → ${to} (${type})`);
        
        return message;
    }
    
    generateMessageId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    createTask(name, agent, priority = 'medium', deadline = null) {
        const task = {
            id: this.generateTaskId(),
            name,
            agent,
            priority,
            deadline,
            status: 'pending',
            createdAt: new Date().toISOString(),
            dependencies: [],
            result: null,
            assignedTo: agent
        };
        this.tasks.set(task.id, task);
        console.log(`📝 Task created: ${name} (priority: ${priority})`);
        return task;
    }
    
    generateTaskId() {
        return 'task_' + Math.random().toString(36).substr(2, 9);
    }
    
    updateTaskStatus(taskId, status, result = null) {
        if (this.tasks.has(taskId)) {
            const task = this.tasks.get(taskId);
            task.status = status;
            task.completedAt = new Date().toISOString();
            task.result = result;
            this.tasks.set(taskId, task);
            console.log(`📊 Task status: ${taskId} → ${status}`);
        }
    }
    
    getStatus() {
        return {
            version: this.version,
            agents: Array.from(this.agents.keys()),
            totalTasks: this.tasks.size,
            completedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length,
            messageCount: this.messages.length
        };
    }
    
    exportState() {
        return {
            version: this.version,
            agents: Array.from(this.agents.entries()).map(([name, agent]) => ({
                name,
                type: agent.constructor.name,
                state: agent.getState ? agent.getState() : null
            })),
            tasks: Array.from(this.tasks.values()),
            messages: this.messages
        };
    }
    
    importState(state) {
        this.version = state.version || this.version;
        this.tasks.clear();
        this.messages = state.messages || [];
        
        state.tasks.forEach(taskData => {
            this.tasks.set(taskData.id, taskData);
        });
        
        console.log('📥 State imported successfully');
    }
}

module.exports = SmartLAPAgentSystem;