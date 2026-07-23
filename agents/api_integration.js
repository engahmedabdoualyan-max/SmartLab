/*!
 * SmartLAP AP Integration Agent
 * Specialized assistant for API testing and integration validation
 */

class APIIntegrationAgent {
    constructor() {
        this.name = 'APIIntegrationAgent';
        this.apiEndpoints = new Map();
        this.testScenarios = new Map();
        this.integrationTests = [];
    }
    
    async discoverEndpoints() {
        console.log('🔗 APIIntegrationAgent: Discovering API endpoints...');
        
        const endpoints = [
            {
                method: 'GET',
                path: '/api/domains',
                description: 'Get all available test domains',
                authRequired: false,
                parameters: {}
            },
            {
                method: 'GET',
                path: '/api/domains/{id}',
                description: 'Get specific domain details',
                authRequired: false,
                parameters: {
                    id: 'string - Domain identifier (e.g., compaction, cbr)'
                }
            },
            {
                method: 'POST',
                path: '/api/sessions',
                description: 'Create new test session',
                authRequired: true,
                parameters: {
                    test_id: 'string - Test identifier',
                    domain_id: 'string - Domain identifier'
                }
            },
            {
                method: 'GET',
                path: '/api/sessions/{id}',
                description: 'Get session details',
                authRequired: true,
                parameters: {
                    id: 'string - Session identifier'
                }
            },
            {
                method: 'PUT',
                path: '/api/sessions/{id}',
                description: 'Update session data',
                authRequired: true,
                parameters: {
                    id: 'string - Session identifier',
                    data: 'object - Session data to update'
                }
            },
            {
                method: 'POST',
                path: '/api/sessions/{id}/complete',
                description: 'Complete test session',
                authRequired: true,
                parameters: {
                    id: 'string - Session identifier'
                }
            },
            {
                method: 'GET',
                path: '/api/auth/login',
                description: 'User authentication',
                authRequired: false,
                parameters: {
                    email: 'string - User email',
                    password: 'string - User password'
                }
            }
        ];
        
        endpoints.forEach(endpoint => {
            this.apiEndpoints.set(endpoint.path, endpoint);
        });
        
        return endpoints;
    }
    
    async createAPITestScenarios() {
        console.log('🔗 APIIntegrationAgent: Creating API test scenarios...');
        
        const scenarios = [
            {
                name: 'Session Creation and Management',
                description: 'Test complete session lifecycle operations',
                steps: [
                    {
                        action: 'authenticate',
                        endpoint: '/api/auth/login',
                        method: 'POST',
                        data: {
                            email: 'test@example.com',
                            password: 'testpassword'
                        },
                        expected: {
                            status: 200,
                            contains: ['token', 'user']
                        }
                    },
                    {
                        action: 'create_session',
                        endpoint: '/api/sessions',
                        method: 'POST',
                        auth: true,
                        data: {
                            test_id: 'compaction',
                            domain_id: 'compaction'
                        },
                        expected: {
                            status: 200,
                            contains: ['session_id', 'csrf_token']
                        }
                    },
                    {
                        action: 'get_session',
                        endpoint: '/api/sessions/{session_id}',
                        method: 'GET',
                        auth: true,
                        expected: {
                            status: 200,
                            contains: ['session', 'status']
                        }
                    },
                    {
                        action: 'complete_session',
                        endpoint: '/api/sessions/{session_id}/complete',
                        method: 'POST',
                        auth: true,
                        expected: {
                            status: 200,
                            contains: ['message', 'session']
                        }
                    }
                ]
            },
            {
                name: 'Domain Query and Validation',
                description: 'Test domain lookup and validation operations',
                steps: [
                    {
                        action: 'get_all_domains',
                        endpoint: '/api/domains',
                        method: 'GET',
                        expected: {
                            status: 200,
                            contains: ['domains', 'success']
                        }
                    },
                    {
                        action: 'get_domain_details',
                        endpoint: '/api/domains/{domain_id}',
                        method: 'GET',
                        parameters: {
                            domain_id: 'compaction'
                        },
                        expected: {
                            status: 200,
                            contains: ['domain', 'description']
                        }
                    }
                ]
            },
            {
                name: 'Error Handling and Validation',
                description: 'Test API error responses and validation',
                steps: [
                    {
                        action: 'unauthorized_access',
                        endpoint: '/api/sessions',
                        method: 'POST',
                        data: {
                            test_id: 'test',
                            domain_id: 'test'
                        },
                        expected: {
                            status: 401,
                            contains: ['error', 'Authentication required']
                        }
                    },
                    {
                        action: 'missing_fields',
                        endpoint: '/api/sessions',
                        method: 'POST',
                        auth: true,
                        expected: {
                            status: 400,
                            contains: ['error', 'missing_fields']
                        }
                    }
                ]
            }
        ];
        
        scenarios.forEach(scenario => {
            this.testScenarios.set(scenario.name, scenario);
        });
        
        return scenarios;
    }
    
    async validateAPICalculationEndpoints(calculationFunctions) {
        console.log('🔗 APIIntegrationAgent: Validating calculation API endpoints...');
        
        const validationResults = {
            endpointCoverage: 0,
            authenticationScenarios: 0,
            errorHandling: 0,
            dataValidation: 0
        };
        
        const calculationEndpoints = [
            {
                path: '/api/calculations/wet-density',
                method: 'POST',
                function: 'calcWetDensity',
                parameters: [
                    { name: 'force', type: 'number', required: true },
                    { name: 'moldVolume', type: 'number', required: true },
                    { name: 'gravity', type: 'number', required: false }
                ]
            },
            {
                path: '/api/calculations/dry-density',
                method: 'POST',
                function: 'calcDryDensity',
                parameters: [
                    { name: 'wetDensity', type: 'number', required: true },
                    { name: 'moisture', type: 'number', required: true }
                ]
            },
            {
                path: '/api/calculations/cbr',
                method: 'POST',
                function: 'calcCBR',
                parameters: [
                    { name: 'penetration', type: 'number', required: true },
                    { name: 'load', type: 'number', required: true },
                    { name: 'stdLoad25', type: 'number', required: false },
                    { name: 'stdLoad50', type: 'number', required: false }
                ]
            },
            {
                path: '/api/calculations/maturity',
                method: 'POST',
                function: 'calcNurseSaulMaturity',
                parameters: [
                    { name: 'temperatures', type: 'array', required: true },
                    { name: 't0', type: 'number', required: false },
                    { name: 'dt', type: 'number', required: false }
                ]
            },
            {
                path: '/api/calculations/strength',
                method: 'POST',
                function: 'calcStrengthFromMaturity',
                parameters: [
                    { name: 'M', type: 'number', required: true },
                    { name: 'A', type: 'number', required: false },
                    { name: 'B', type: 'number', required: false }
                ]
            }
        ];
        
        validationResults.endpointCoverage = calculationEndpoints.length;
        
        calculationEndpoints.forEach(endpoint => {
            const scenario = {
                name: `Test ${endpoint.function} API endpoint`,
                endpoint: endpoint,
                testCases: [
                    {
                        name: 'Valid calculation request',
                        input: this.generateValidTestData(endpoint.function),
                        expectedStatus: 200,
                        expectedOutput: {
                            result: true,
                            calculation: endpoint.function
                        }
                    },
                    {
                        name: 'Invalid input validation',
                        input: this.generateInvalidTestData(endpoint.function),
                        expectedStatus: 400,
                        expectedOutput: {
                            error: 'Invalid input'
                        }
                    }
                ]
            };
            
            this.integrationTests.push(scenario);
        });
        
        return validationResults;
    }
    
    generateValidTestData(functionName) {
        const testData = {
            calcWetDensity: {
                force: 250,
                moldVolume: 0.001,
                gravity: 9.81
            },
            calcDryDensity: {
                wetDensity: 25484.20,
                moisture: 12.5
            },
            calcCBR: {
                penetration: 2.5,
                load: 6620,
                stdLoad25: 13240,
                stdLoad50: 19960
            },
            calcNurseSaulMaturity: {
                temperatures: [20, 22, 24, 26],
                t0: -10,
                dt: 1
            },
            calcStrengthFromMaturity: {
                M: 100,
                A: 30,
                B: 0.02
            }
        };
        
        return testData[functionName] || {};
    }
    
    generateInvalidTestData(functionName) {
        return {
            calcWetDensity: {
                force: 'invalid',
                moldVolume: 0.001
            },
            calcDryDensity: {
                wetDensity: -100,
                moisture: 'invalid'
            },
            calcCBR: {
                penetration: null,
                load: NaN
            },
            calcNurseSaulMaturity: {
                temperatures: 'invalid',
                t0: 'not a number'
            },
            calcStrengthFromMaturity: {
                M: 'string',
                A: null
            }
        }[functionName] || {};
    }
    
    async generateIntegrationTestReport(testResults) {
        console.log('🔗 APIIntegrationAgent: Generating integration test report...');
        
        const report = {
            summary: {
                totalTests: this.integrationTests.length + this.testScenarios.size,
                passedTests: testResults.filter(r => r.passed).length,
                failedTests: testResults.filter(r => !r.passed).length,
                successRate: (testResults.filter(r => r.passed).length / testResults.length * 100).toFixed(1) + '%'
            },
            endpoints: Array.from(this.apiEndpoints.values()),
            scenarios: Array.from(this.testScenarios.values()),
            validation: {
                endpointCoverage: testResults.reduce((sum, test) => sum + (test.endpointCoverage || 0), 0),
                authScenarios: testResults.reduce((sum, test) => sum + (test.authScenarios || 0), 0),
                errorHandling: testResults.reduce((sum, test) => sum + (test.errorHandling || 0), 0)
            },
            recommendations: [
                'Add more comprehensive error handling tests',
                'Implement rate limiting and throttling tests',
                'Add security vulnerability testing',
                'Create performance stress tests'
            ]
        };
        
        return report;
    }
    
    receiveMessage(message) {
        console.log(`📥 APIIntegrationAgent received: ${message.type} from ${message.from}`);
        
        switch (message.type) {
            case 'api_discovery':
                this.discoverEndpoints()
                    .then(endpoints => {
                        this.sendMessage('APIIntegrationAgent', message.from, 'endpoints_discovered', endpoints);
                    });
                break;
            case 'integration_validation':
                const { calculationFunctions } = message.payload;
                this.validateAPICalculationEndpoints(calculationFunctions)
                    .then(results => {
                        this.sendMessage('APIIntegrationAgent', message.from, 'validation_results', results);
                    });
                break;
            case 'test_scenario_request':
                this.createAPITestScenarios()
                    .then(scenarios => {
                        this.sendMessage('APIIntegrationAgent', message.from, 'scenarios_created', scenarios);
                    });
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
            endpointsDiscovered: this.apiEndpoints.size,
            scenariosCreated: this.testScenarios.size,
            integrationTests: this.integrationTests.length
        };
    }
}

module.exports = APIIntegrationAgent;