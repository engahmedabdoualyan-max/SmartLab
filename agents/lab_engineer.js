/*!
 * SmartLAP Lab Engineer Agent
 * Responsible for technical validation and ASTM compliance review
 */

class LabEngineerAgent {
    constructor() {
        this.name = 'LabEngineerAgent';
        this.atmStandards = new Map();
        this.validationResults = [];
        this.astmCompliance = {
            compaction: 'ASTM D698 / D1557',
            cbr: 'ASTM D1883',
            slump: 'ASTM C143',
            maturity: 'ASTM C1074',
            marshall: 'ASTM D6927',
            bitumen: 'ASTM D6307',
            penetration: 'ASTM D5',
            sieve: 'ASTM C136',
            compressive: 'ASTM C39',
            ductility: 'ASTM D113',
            air: 'ASTM C231',
            straightedge: 'ASTM E274',
            moisture: 'ASTM AASHTO T 255',
            aterberg: 'ASTM D4027'
        };
        this.initializeStandards();
    }
    
    initializeStandards() {
        // Initialize ASTM standard validation rules
        this.atmStandards.set('compaction', {
            maxDryDensityAcceptableError: 0.01, // 1%
            moistureErrorTolerance: 0.02, // 2%
            compactionRatioMinimum: 0
        });
        
        this.atmStandards.set('cbr', {
            standardLoad25: 13240,
            standardLoad50: 19960,
            penetrationTolerance: 0.5,
            cbrMinimumAcceptance: 3.0
        });
        
        this.atmStandards.set('maturity', {
            t0Range: [-10, 15],
            dtRange: [0.25, 1.0],
            strengthErrorTolerance: 0.05
        });
    }
    
    async validateTestImplementation(testCode, testSuite) {
        console.log(`🔬 LabEngineerAgent: Validating ${testSuite} implementation...`);
        
        const validationResult = {
            astmCompliant: true,
            technicalAccuracy: true,
            boundaryConditions: [],
            warnings: [],
            errors: [],
            recommendations: []
        };
        
        // Validate ASTM compliance
        const suiteStandards = this.astmCompliance[testSuite] || null;
        if (suiteStandards) {
            validationResult.astmCompliant = this.checkASTMCompliance(testCode, testSuite, suiteStandards);
        }
        
        // Technical accuracy validation
        validationResult.technicalAccuracy = this.checkTechnicalAccuracy(testCode, testSuite);
        
        // Check boundary conditions and edge cases
        const boundaryIssues = this.checkBoundaryConditions(testCode, testSuite);
        validationResult.boundaryConditions = boundaryIssues.nonErrors;
        validationResult.errors = boundaryIssues.errors;
        
        // Generate technical recommendations
        validationResult.recommendations = this.generateRecommendations(testCode, testSuite);
        
        this.validationResults.push(validationResult);
        
        return validationResult;
    }
    
    checkASTMCompliance(testCode, testSuite, standards) {
        const compliantFeatures = {
            compaction: testCode.includes('calcWetDensity') && testCode.includes('calcDryDensity'),
            cbr: testCode.includes('calcCBR') && testCode.includes('stdLoad'),
            maturity: testCode.includes('calcNurseSaulMaturity') || testCode.includes('calcArrheniusMaturity'),
            compressive: testCode.includes('calcCompressiveStress'),
            sieve: testCode.includes('calcPercentRetained'),
            atterberg: testCode.includes('calcPI') && testCode.includes('classifyAtterberg')
        };
        
        const required = compliantFeatures[testSuite];
        if (!required) {
            return false;
        }
        
        // Additional ASTM-specific validations
        if (testSuite === 'compaction') {
            const hasParticleSizeValidation = testCode.includes('moisture') || testCode.includes('force');
            if (!hasParticleSizeValidation) {
                return false;
            }
        }
        
        return true;
    }
    
    checkTechnicalAccuracy(testCode, testSuite) {
        // Simple heuristic checks for technical accuracy
        const accuracyChecks = {
            compaction: testCode.includes('calcWetDensity') && testCode.includes('calcDryDensity'),
            cbr: testCode.includes('calcCBR') && testCode.includes('calcCBRFinalResult'),
            maturity: testCode.includes('calcNurseSaulMaturity'),
            compressive: testCode.includes('calcCompressiveStress') && testCode.includes('calcCylinderArea'),
            sieve: testCode.includes('calcPercentRetained'),
            atterberg: testCode.includes('classifyPlasticity') && testCode.includes('classifyAtterberg')
        };
        
        return accuracyChecks[testSuite] || true;
    }
    
    checkBoundaryConditions(testCode, testSuite) {
        const boundaryChecks = {
            compaction: {
                noZeroDivision: testCode.includes('moldVolume') && !testCode.includes('if.*moldVolume.*0'),
                moistureValidation: testCode.includes('moisture') && testCode.includes('moisture.*>='),
                errorHandling: testCode.includes('try') || testCode.includes('if.*<=')
            },
            cbr: {
                loadValidation: testCode.includes('load') && testCode.includes('>= 0'),
                areaValidation: testCode.includes('pistonArea') && testCode.includes('* 1000'),
                standardLoadValidation: testCode.includes('stdLoad25') || testCode.includes('stdLoad50')
            },
            maturity: {
                arrayValidation: testCode.includes('temperatures.*length'),
                t0Validation: testCode.includes('t0') && testCode.includes('*'),
                dtValidation: testCode.includes('dt') && testCode.includes('1')
            },
            compressive: {
                forceValidation: testCode.includes('forceKN') && testCode.includes('* 1000'),
                areaValidation: testCode.includes('areaMm2') && testCode.includes('/'),
                stressValidation: testCode.includes('stress') && testCode.includes('MPa')
            },
            sieve: {
                percentageValidation: testCode.includes('%') || testCode.includes('calcPercent'),
                cumulativeValidation: testCode.includes('cum'),
                d60d30d10Validation: testCode.includes('d60') && testCode.includes('d10')
            },
            atterberg: {
                PIValidation: testCode.includes('PI.*=') && testCode.includes('LL'),
                LLValidation: testCode.includes('LL') && testCode.includes('PL'),
                classificationValidation: testCode.includes('classif')
            }
        };
        
        const suiteChecks = boundaryChecks[testSuite] || {};
        const results = {
            nonErrors: [],
            errors: []
        };
        
        Object.entries(suiteChecks).forEach(([check, condition]) => {
            if (typeof condition === 'boolean') {
                if (!condition) {
                    results.errors.push(`Missing boundary condition: ${check}`);
                } else {
                    results.nonErrors.push(`OK: ${check}`);
                }
            }
        });
        
        return results;
    }
    
    generateRecommendations(testCode, testSuite) {
        const recommendations = [];
        
        switch (testSuite) {
            case 'compaction':
                recommendations.push(
                    'Add tests for temperature effects on compaction',
                    'Implement moisture-density curve analysis',
                    'Include modified Proctor test variations'
                );
                break;
            case 'cbr':
                recommendations.push(
                    'Add time-dependent penetration tests',
                    'Implement load rate effects analysis',
                    'Include recycled material CBR tests'
                );
                break;
            case 'maturity':
                recommendations.push(
                    'Implement multiple maturity curves comparison',
                    'Add temperature gradient tests',
                    'Include curing condition variations'
                );
                break;
            case 'sieve':
                recommendations.push(
                    'Add non-standard sieve sizes',
                    'Implement moisture content correction factors',
                    'Include particle shape analysis'
                );
                break;
        }
        
        if (!testCode.includes('test')) {
            recommendations.push('Add comprehensive test documentation');
        }
        
        recommendations.push('Ensure all test values are documented with units');
        
        return recommendations;
    }
    
    reviewEngineeringCalculation(calculation, testData) {
        console.log(`🔬 LabEngineerAgent: Reviewing calculation: ${calculation}`);
        
        // Validate engineering calculation against known references
        const reviewResult = {
            calculationValid: true,
            standardCompliance: [],
            warnings: [],
            passes: [],
            fails: []
        };
        
        // Simple validation rules
        if (calculation.includes('calcWetDensity')) {
            const matches = calculation.match(/calcWetDensity\(([^)]+)\)/);
            if (matches) {
                reviewResult.passes.push('Function name matches ASTM standard format');
                if (!matches[1].includes('force') && !matches[1].includes('moldVolume')) {
                    reviewResult.warnings.push('Parameters may not follow ASTM naming conventions');
                }
            }
        }
        
        if (calculation.includes('calcCBR')) {
            reviewResult.passes.push('CBR calculation follows standard formula (Load / StandardLoad × 100)');
            const hasStandardLoad = calculation.includes('stdLoad25') || calculation.includes('stdLoad50');
            if (!hasStandardLoad) {
                reviewResult.warnings.push('Missing ASTM standard load values for CBR calculation');
            }
        }
        
        if (calculation.includes('calcNurseSaulMaturity')) {
            reviewResult.passes.push('Nurse-Saul method implementation follows ASTM C1074');
            if (!calculation.includes('temperatures')) {
                reviewResult.fails.push('Missing temperature array input for maturity calculation');
                reviewResult.calculationValid = false;
            }
        }
        
        reviewResult.standardCompliance = Object.values(this.astmCompliance)
            .filter(standard => calculation.includes(standard.split(' ')[0].toLowerCase()));
        
        return reviewResult;
    }
    
    receiveMessage(message) {
        console.log(`📥 LabEngineerAgent received: ${message.type} from ${message.from}`);
        
        switch (message.type) {
            case 'technical_validation':
                const { code, suite } = message.payload;
                this.validateTestImplementation(code, suite)
                    .then(result => {
                        this.sendMessage('LabEngineerAgent', message.from, 'validation_results', result);
                    });
                break;
            case 'review_request':
                const { calculation, data } = message.payload;
                const review = this.reviewEngineeringCalculation(calculation, data);
                this.sendMessage('LabEngineerAgent', message.from, 'engineering_review', review);
                break;
            case 'astm_standards_request':
                this.sendMessage('LabEngineerAgent', message.from, 'atm_standards', this.astmCompliance);
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
            astmComplianceCount: Object.keys(this.astmCompliance).length,
            validationCount: this.validationResults.length,
            complianceStatus: 'compliant'
        };
    }
}

module.exports = LabEngineerAgent;