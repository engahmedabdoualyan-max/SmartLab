// Base Agent interface
class Agent {
    constructor(name, role, coordinator) {
        this.name = name;
        this.role = role;
        this.coordinator = coordinator;
        this.tasks = [];
        this.status = 'idle';
        this.communicationLog = [];
    }

    logCommunication(message, source) {
        this.communicationLog.push({
            timestamp: new Date(),
            message,
            source,
            agent: this.name
        });
        this.coordinator.broadcastMessage(this.name, message);
    }

    async processTask(task) {
        throw new Error('Task processing method must be implemented by subclass');
    }

    async receiveMessage(message, source) {
        this.logCommunication(message, source);
    }

    updateTaskStatus(taskId, status, result = null) {
        return this.coordinator.updateTaskStatus(taskId, this.name, status, result);
    }
}