/*!
 * SmartLAP Multi-Agent System Integration
 * Main entry point and integration script
 */

const path = require('path');

class SmartLAPAgentSystemIntegration {
    constructor() {
        this.name = 'SmartLAPAgentSystemIntegration';
        this.orchestrator = null;
        this.agents = new Map();
        this.isInitialized = false;
    }
    
    async initialize() {
        console.log('🚀 SmartLAP Agent System Integration: Initializing...');
        
        try {
            // Import orchestrator
            const Orchestrator = require('./orchestrator');
            this.orchestrator = new Orchestrator();
            
            // Initialize orchestrator
            const initResult = await this.orchestrator.initialize();
            if (!initResult) {
                throw new Error('Orchestrator initialization failed');
            }
            
            this.isInitialized = true;
            
            console.log('✅ SmartLAP Agent System Integration initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ SmartLAP Agent System Integration initialization failed:', error.message);
            return false;
        }
    }
    
    async startWorkflow(workflowName, payload = {}) {
        if (!this.isInitialized) {
            console.error('❌ SmartLAP Agent System Integration not initialized');
            return false;
        }
        
        console.log(`🎯 SmartLAP Agent System Integration: Starting workflow: ${workflowName}`);
        
        try {
            await this.orchestrator.executeWorkflow(workflowName, payload);
            console.log(`✅ Workflow ${workflowName} completed successfully`);
            return true;
            
        } catch (error) {
            console.error(`❌ Workflow ${workflowName} failed:`, error.message);
            return false;
        }
    }
    
    async generateIntegrationReport() {
        if (!this.isInitialized) {
            console.error('❌ SmartLAP Agent System Integration not initialized');
            return null;
        }
        
        console.log('📊 SmartLAP Agent System Integration: Generating integration report...');
        
        const report = await this.orchestrator.generateReport();
        const systemState = await this.orchestrator.exportSystemState();
        
        return {
            timestamp: new Date().toISOString(),
            systemReport: report,
            systemState: systemState,
            integrationStatus: 'successful',
            agentsActive: this.orchestrator.getState().agentCount,
            nextSteps: [
                'Deploy enhanced test suite to production environment',
                'Set up automated CI/CD pipelines for continuous testing',
                'Create comprehensive documentation for all test procedures',
                'Establish performance monitoring for calculation functions',
                'Implement regular competitor analysis updates'
            ]
        };
    }
    
    getSystemStatus() {
        if (!this.isInitialized) {
            return {
                status: 'not_initialized',
                message: 'SmartLAP Agent System Integration is not initialized'
            };
        }
        
        const orchestratorState = this.orchestrator.getState();
        
        return {
            status: 'initialized',
            agentsActive: orchestratorState.agentCount,
            systemStatus: orchestratorState.systemStatus,
            message: `SmartLAP Agent System Integration is running with ${orchestratorState.agentCount} agents`
        };
    }
    
    async stop() {
        console.log('🛑 SmartLAP Agent System Integration: Shutting down...');
        
        // Clean up resources
        if (this.orchestrator) {
            console.log('🧹 Cleaning up orchestrator resources...');
        }
        
        this.isInitialized = false;
        this.agents.clear();
        
        console.log('✅ SmartLAP Agent System Integration shutdown complete');
    }
    
    sendMessage(message) {
        if (this.orchestrator) {
            return this.orchestrator.receiveMessage(message);
        }
    }
}

module.exports = SmartLAPAgentSystemIntegration;