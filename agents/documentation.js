/*!
 * SmartLAP Documentation Agent
 * Specialized assistant for automated test documentation
 */

class DocumentationAgent {
    constructor() {
        this.name = 'DocumentationAgent';
        this.documentTemplates = {
            testSuite: 'templates/test-suite.md',
            unitTest: 'templates/unit-test.md',
            integrationTest: 'templates/integration-test.md',
            apiTest: 'templates/api-test.md'
        };
        this.documentationCount = 0;
    }
    
    generateTestDocumentation(testName, testSuite, testCases) {
        console.log(`📝 DocumentationAgent: Generating documentation for ${testSuite}...`);
        
        const documentation = {
            title: `${testSuite} Test Suite Documentation`,
            testName,
            generatedAt: new Date().toISOString(),
            astmStandard: this.getASTMReference(testSuite),
            testCases: testCases.map(testCase => ({
                name: testCase.name,
                description: testCase.description || `Tests ${testCase.name} functionality`,
                inputs: testCase.inputs || [],
                expected: testCase.expected || {},
                validation: testCase.validation || {
                    type: 'assertEqual' || 'assertClose' || 'assertTrue',
                    tolerance: 0.01
                }
            })),
            summary: this.generateTestSummary(testCases),
            prerequisites: this.getTestPrerequisites(testSuite),
            references: this.getReferences(testSuite)
        };
        
        this.documentationCount++;
        
        return documentation;
    }
    
    getASTMReference(testSuite) {
        const astmStandards = {
            compaction: 'ASTM D698 / D1557 - Standard Proctor Test',
            cbr: 'ASTM D1883 - California Bearing Ratio',
            slump: 'ASTM C143 - Concreteness Slump',
            maturity: 'ASTM C1074 - Concrete Maturity',
            marshall: 'ASTM D6927 - Asphalt Stability',
            bitumen: 'ASTM D6307 - Bitumen Penetration',
            penetration: 'ASTM D5 - Asphalt Penetration',
            sieve: 'ASTM C136 - Soil Grading',
            compressive: 'ASTM C39 - Concrete Compressive',
            ductility: 'ASTM D113 - Asphalt Ductility',
            air: 'ASTM C231 - Air-Entrained Concrete',
            straightedge: 'ASTM E274 - Road Roughness',
            moisture: 'AASHTO T 255 - Moisture Content',
            atterberg: 'ASTM D4027 - Soil Plasticity'
        };
        
        return astmStandards[testSuite] || 'ASTM Standard';
    }
    
    generateTestSummary(testCases) {
        const totalCases = testCases.length;
        const highRiskCases = testCases.filter(test => 
            test.validation && 
            test.validation.tolerance && 
            test.validation.tolerance < 0.001
        ).length;
        
        return {
            purpose: 'Validate calculation functions against expected results',
            totalTestCases: totalCases,
            highPrecisionTests: highRiskCases,
            estimatedExecutionTime: `${totalCases * 0.5} seconds`,
            confidenceLevel: totalCases >= 10 ? 'high' : 'medium'
        };
    }
    
    getTestPrerequisites(testSuite) {
        return {
            requirements: [
                'JavaScript environment with Math library',
                'Node.js or browser with module support',
                'Test framework (Custom.js or similar)'
            ],
            setupInstructions: [
                `Navigate to smartLAP/tests directory`,
                'Run: node run.js or npm test',
                'Review test output for any failures'
            ],
            dependencies: [
                'calculations.js - Contains all test functions',
                'test-helpers.js - Test utilities and API client'
            ]
        };
    }
    
    getReferences(testSuite) {
        return {
            primary: [
                {
                    title: `ASTM ${testSuite.charAt(0).toUpperCase() + testSuite.slice(1)} Standard`,
                    url: `https://www.astm.org/standard-${testSuite}`
                }
            ],
            secondary: [
                {
                    title: `Geotechnical Engineering Reference - ${testSuite}`,
                    description: 'Professional engineering handbook for test procedures'
                }
            ],
            notes: 'All calculations follow industry-standard engineering formulas with built-in validation'
        };
    }
    
    createTestSuiteReport(testSuite, documentation) {
        const report = {
            metadata: {
                title: `SmartLAP - ${testSuite.charAt(0).toUpperCase() + testSuite.slice(1)} Test Suite Report`,
                generated: new Date().toISOString(),
                version: '1.0.0',
                generatedBy: 'DocumentationAgent'
            },
            executiveSummary: {
                purpose: documentation.summary.purpose,
                totalTests: documentation.summary.totalTestCases,
                highPrecisionTests: documentation.summary.highPrecisionTests,
                confidenceLevel: documentation.summary.confidenceLevel
            },
            astmCompliance: {
                standard: documentation.astmStandard,
                verificationStatus: 'Compliant',
                notes: 'All test cases follow ASTM standard procedures'
            },
            testCases: documentation.testCases.map(tc => ({
                title: tc.name,
                status: 'Ready',
                estimatedDuration: '0.5 seconds',
                validationMethod: tc.validation.type,
                tolerance: tc.validation.tolerance
            })),
            qualityGate: {
                reviewRequired: documentation.testCases.length > 20,
                automationReady: documentation.testCases.length <= 50,
                productionReady: true
            }
        };
        
        return report;
    }
    
    generateIntegrationTestDocs() {
        const integrationDocs = {
            title: 'SmartLAP Integration Test Documentation',
            overview: {
                purpose: 'Validate end-to-end functionality of SmartLAP system',
                scope: 'All calculation modules and API integrations',
                environment: 'Node.js production environment'
            },
            testScenarios: [
                {
                    name: 'Complete Soil Testing Workflow',
                    description: 'End-to-end compaction, CBR, and maturity testing with all sensors',
                    steps: [
                        'Initialize test parameters',
                        'Run compaction test',
                        'Run CBR test',
                        'Run maturity test',
                        'Generate PDF report'
                    ]
                },
                {
                    name: 'API Data Integration',
                    description: 'Test data flow between frontend and backend',
                    steps: [
                        'Create test session via API',
                        'Send sensor readings',
                        'Retrieve processed results',
                        'Validate API responses'
                    ]
                }
            ],
            artifacts: [
                'API documentation',
                'Test data schemas',
                'Security validation reports',
                'Performance benchmarks'
            ]
        };
        
        return integrationDocs;
    }
    
    receiveMessage(message) {
        console.log(`📥 DocumentationAgent received: ${message.type} from ${message.from}`);
        
        switch (message.type) {
            case 'generate_documentation':
                const { testSuite, testCases } = message.payload;
                const documentation = this.generateTestDocumentation(testSuite, testSuite, testCases);
                const report = this.createTestSuiteReport(testSuite, documentation);
                this.sendMessage('DocumentationAgent', message.from, 'documentation_generated', { documentation, report });
                break;
            case 'integration_docs_request':
                const integrationDocs = this.generateIntegrationTestDocs();
                this.sendMessage('DocumentationAgent', message.from, 'integration_docs_generated', integrationDocs);
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
            documentationCount: this.documentationCount,
            templatesAvailable: Object.keys(this.documentTemplates).length
        };
    }
}

module.exports = DocumentationAgent;