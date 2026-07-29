// Example runner script for the multi-agent system
const AgentCoordinator = require('./coordinator.js');
const DeveloperAgent = require('./developer-agent.js');
const LabEngineerAgent = require('./lab-engineer-agent.js');
const ProjectManagerAgent = require('./project-manager-agent.js');
const DocumentationSpecialistAgent = require('./documentation-specialist.js');
const APIIntegrationSpecialistAgent = require('./api-integration-specialist.js');
const CICDSpecialistAgent = require('./ci-cd-specialist.js');
const UnifiedTestingInterface = require('./unified-interface.js');
const VersionControlIntegration = require('./version-control.js');

async function runMultiAgentSystem() {
    console.log('🚀 SmartLab Multi-Agent System Initialization');

    const coordinator = new AgentCoordinator();

    const developers = [
        new DeveloperAgent('dev-adv-001', coordinator),
        new DeveloperAgent('dev-adv-002', coordinator)
    ];

    const labEngineers = [
        new LabEngineerAgent('lab-eng-001', coordinator)
    ];

    const projectManagers = [
        new ProjectManagerAgent('pm-001', coordinator)
    ];

    const assistants = [
        new DocumentationSpecialistAgent('doc-spec-001', coordinator),
        new APIIntegrationSpecialistAgent('api-specialist-001', coordinator),
        new CICDSpecialistAgent('ci-cd-specialist-001', coordinator)
    ];

    developers.forEach(agent => coordinator.registerAgent(agent));
    labEngineers.forEach(agent => coordinator.registerAgent(agent));
    projectManagers.forEach(agent => coordinator.registerAgent(agent));
    assistants.forEach(agent => coordinator.registerAgent(agent));

    console.log('✅ Agents registered successfully');

    const unifiedInterface = new UnifiedTestingInterface(coordinator);
    const versionControl = new VersionControlIntegration();

    console.log('\n📝 Creating tasks for Developer Agent...');
    const devTask1 = coordinator.createTask({
        title: 'Competitor Testing Framework Analysis',
        description: 'Analyze competitor testing frameworks in geotechnical engineering',
        type: 'competitor_analysis',
        priority: 'high',
        assignedBy: 'system'
    });

    coordinator.assignTask(devTask1, 'dev-adv-001');

    console.log('\n📝 Creating tasks for Lab Engineer Agent...');
    const labTask1 = coordinator.createTask({
        title: 'Technical Review of Proposed Tests',
        description: 'Review developer-proposed test cases for technical accuracy',
        type: 'technical_review',
        priority: 'high',
        assignedBy: 'system'
    });

    coordinator.assignTask(labTask1, 'lab-eng-001');

    console.log('\n📝 Creating tasks for Project Manager Agent...');
    const pmTask1 = coordinator.createTask({
        title: 'Task Coordination and Distribution',
        description: 'Coordinate between agents and manage task distribution',
        type: 'task_coordination',
        priority: 'medium',
        assignedBy: 'system'
    });

    coordinator.assignTask(pmTask1, 'pm-001');

    console.log('\n📝 Creating tasks for Assistant Agents...');
    const docTask = coordinator.createTask({
        title: 'Generate Automated Test Documentation',
        description: 'Create documentation for all automated tests',
        type: 'document_generation',
        priority: 'low',
        assignedBy: 'system'
    });

    coordinator.assignTask(docTask, 'doc-spec-001');

    const apiTask = coordinator.createTask({
        title: 'Validate API Integration',
        description: 'Ensure test data integrates properly with backend',
        type: 'api_validation',
        priority: 'low',
        assignedBy: 'system'
    });

    coordinator.assignTask(apiTask, 'api-specialist-001');

    const ciTask = coordinator.createTask({
        title: 'Implement CI/CD Pipeline',
        description: 'Setup automated test pipelines',
        type: 'pipeline_implementation',
        priority: 'medium',
        assignedBy: 'system'
    });

    coordinator.assignTask(ciTask, 'ci-cd-specialist-001');

    console.log('\n⏳ Processing tasks...');

    const tasks = [devTask1, labTask1, pmTask1, docTask, apiTask, ciTask];

    for (const task of tasks) {
        const agent = coordinator.agents[task.assignedTo];
        await agent.processTask(task);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Agent Status:');
    coordinator.getAgentStatus().forEach(agent => {
        console.log(`  ${agent.name} (${agent.role}): ${agent.status} - ${agent.taskCount} tasks`);
    });

    console.log('\n📋 Task Board Summary:');
    Object.values(coordinator.getTaskBoard()).forEach(task => {
        console.log(`  ${task.title}: ${task.status} (assigned to: ${task.assignedTo})`);
    });

    console.log('\n🔄 Fetching unified test data...');
    const unifiedData = await unifiedInterface.fetchUnifiedTestData();
    console.log('Unified test data fetched successfully');

    console.log('\n📝 Publishing to version control...');
    const versionResult = await unifiedInterface.publishToVersionControl(unifiedData);
    console.log(`Published to branch: ${versionResult.branch}`);

    console.log('\n✅ Version control integration result:');
    console.log(`  Commit ID: ${versionResult.commitId}`);
    console.log(`  Status: ${versionResult.status}`);

    console.log('\n📊 Version control validation:');
    const validation = await versionControl.validateTestIntegration();
    console.log(`  Validation: ${validation.validationPassed ? 'PASSED' : 'FAILED'}`);
    console.log(`  Quality Score: ${validation.qualityScore}%`);

    console.log('\n🎉 Multi-Agent System Execution Complete!');
    console.log('\n📈 Key Metrics:');
    console.log(`  Total Tasks: ${tasks.length}`);
    console.log(`  Completed Tasks: ${Object.values(coordinator.getTaskBoard()).filter(t => t.status === 'completed').length}`);
    console.log(`  Success Rate: ${((Object.values(coordinator.getTaskBoard()).filter(t => t.status === 'completed').length / tasks.length) * 100).toFixed(1)}%`);
}

module.exports = runMultiAgentSystem;

if (require.main === module) {
    runMultiAgentSystem();
}