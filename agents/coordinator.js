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
        // Support both (name, agent, priority, deadline) and (taskObject) signatures
        if (typeof name === 'object' && name !== null) {
            const taskObj = name;
            const task = {
                id: this.generateTaskId(),
                title: taskObj.title || taskObj.name || 'Unnamed Task',
                name: taskObj.title || taskObj.name || 'Unnamed Task',
                agent: taskObj.assignedBy || taskObj.agent || 'unassigned',
                priority: taskObj.priority || 'medium',
                deadline: taskObj.deadline || null,
                status: 'pending',
                createdAt: new Date().toISOString(),
                dependencies: taskObj.dependencies || [],
                result: null,
                assignedTo: taskObj.assignedTo || taskObj.agent || taskObj.assignedBy || 'unassigned',
                type: taskObj.type || 'general',
                description: taskObj.description || ''
            };
            this.tasks.set(task.id, task);
            console.log(`📝 Task created: ${task.name} (priority: ${task.priority})`);
            return task;
        }
        const task = {
            id: this.generateTaskId(),
            title: name,
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
    
    updateTaskStatus(taskId, agentName, status, result = null) {
        if (this.tasks.has(taskId)) {
            const task = this.tasks.get(taskId);
            const oldStatus = task.status;
            task.status = status;
            if (status === 'completed') {
                task.completedAt = new Date().toISOString();
            }
            if (result !== null) {
                task.result = result;
            }
            this.tasks.set(taskId, task);
            console.log(`📊 Task status: ${taskId} → ${status}`);
        }
    }

    assignTask(task, agentName) {
        const agentKey = typeof agentName === 'string' ? agentName : (agentName.name || agentName);
        if (this.agents instanceof Map) {
            if (!this.agents.has(agentKey)) {
                console.log(`⚠️ Agent ${agentKey} not found`);
                return false;
            }
        }
        if (task && task.id && this.tasks.has(task.id)) {
            const t = this.tasks.get(task.id);
            t.assignedTo = agentKey;
            t.status = 'assigned';
            this.tasks.set(task.id, t);
            console.log(`📋 Task ${task.id} assigned to ${agentKey}`);
            return true;
        }
        return false;
    }

    getAgentStatus() {
        const statusList = [];
        if (this.agents instanceof Map) {
            this.agents.forEach((agent, name) => {
                statusList.push({
                    name: name,
                    role: agent.role || 'unknown',
                    status: agent.status || 'idle',
                    taskCount: agent.tasks ? agent.tasks.length : 0
                });
            });
        }
        return statusList;
    }

    getTaskBoard() {
        const board = {};
        this.tasks.forEach((task, id) => {
            board[id] = task;
        });
        return board;
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