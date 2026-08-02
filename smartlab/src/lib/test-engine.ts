import { 
  TestTemplate, 
  TestInputData, 
  CalculatedResults, 
  TestSchema, 
  CalculationSchema,
  TestField,
  CalculatedValue,
  Threshold 
} from '@/types/test';

export class TestEngine {
  private template: TestTemplate;

  constructor(template: TestTemplate) {
    this.template = template;
  }

  calculate(inputData: TestInputData): CalculatedResults {
    const results: CalculatedResults = {};
    const context = { ...inputData };

    for (const formula of this.template.calculations.formulas) {
      try {
        const value = this.evaluateFormula(formula, context);
        const output = this.template.calculations.outputs.find(o => o.formulaId === formula.id);
        
        if (output) {
          const threshold = this.evaluateThresholds(value, output.thresholds);
          results[output.key] = {
            value,
            unit: output.unit,
            status: threshold?.status || 'PASS',
            threshold,
            calculatedAt: new Date().toISOString(),
          };
          context[output.key] = value;
        }
      } catch (error) {
        console.error(`Calculation error for ${formula.id}:`, error);
      }
    }

    return results;
  }

  validate(inputData: TestInputData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const rule of this.template.schema.validationRules) {
      const value = inputData[rule.field];
      const passed = this.evaluateRule(rule.rule, value, inputData);
      
      if (!passed) {
        const error: ValidationError = {
          field: rule.field,
          message: rule.message,
          severity: rule.severity,
        };
        
        if (rule.severity === 'error') {
          errors.push(error);
        } else {
          warnings.push(error);
        }
      }
    }

    for (const field of this.template.schema.fields) {
      if (field.required && !inputData[field.key] && inputData[field.key] !== 0) {
        errors.push({
          field: field.key,
          message: `${field.label} is required`,
          severity: 'error',
        });
      }

      if (field.validation && inputData[field.key] !== undefined) {
        const fieldErrors = this.validateField(field, inputData[field.key]);
        errors.push(...fieldErrors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  assessCredibility(
    inputData: TestInputData,
    calculatedResults: CalculatedResults,
    hardwareData?: unknown,
    mode?: string
  ): CredibilityAssessment {
    const factors: CredibilityFactor[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    const dataIntegrityScore = this.assessDataIntegrity(inputData, hardwareData);
    factors.push(dataIntegrityScore);
    totalScore += dataIntegrityScore.score * dataIntegrityScore.weight;
    totalWeight += dataIntegrityScore.weight;

    const calculationScore = this.assessCalculations(calculatedResults);
    factors.push(calculationScore);
    totalScore += calculationScore.score * calculationScore.weight;
    totalWeight += calculationScore.weight;

    const hardwareScore = mode === 'HARDWARE' 
      ? this.assessHardwareIntegrity(hardwareData)
      : { name: 'Hardware Integrity', weight: 0, score: 1, passed: true, details: 'Manual test mode' };
    factors.push(hardwareScore);
    totalScore += hardwareScore.score * hardwareScore.weight;
    totalWeight += hardwareScore.weight;

    const personnelScore = this.assessPersonnelCompetency(inputData);
    factors.push(personnelScore);
    totalScore += personnelScore.score * personnelScore.weight;
    totalWeight += personnelScore.weight;

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const level = this.calculateLevel(finalScore);

    return {
      level,
      score: Math.round(finalScore),
      factors,
      assessedAt: new Date().toISOString(),
      assessedBy: 'system',
    };
  }

  private evaluateFormula(formula: { expression: string; dependencies: string[] }, context: Record<string, unknown>): number {
    const expr = formula.expression;
    let evaluated = expr;
    
    for (const dep of formula.dependencies) {
      const value = context[dep];
      if (value !== undefined) {
        evaluated = evaluated.replace(new RegExp(`\\b${dep}\\b`, 'g'), String(value));
      }
    }

    try {
      return Function('"use strict"; return (' + evaluated + ')')();
    } catch {
      return NaN;
    }
  }

  private evaluateRule(rule: string, value: unknown, context: Record<string, unknown>): boolean {
    try {
      return Function('value', 'context', '"use strict"; return ' + rule)(value, context);
    } catch {
      return false;
    }
  }

  private evaluateThresholds(value: number, thresholds?: Threshold[]): Threshold | undefined {
    if (!thresholds) return undefined;
    
    for (const threshold of thresholds) {
      const minPass = threshold.min === undefined || value >= threshold.min;
      const maxPass = threshold.max === undefined || value <= threshold.max;
      
      if (minPass && maxPass) {
        return threshold;
      }
    }
    
    return thresholds[thresholds.length - 1];
  }

  private validateField(field: TestField, value: unknown): ValidationError[] {
    const errors: ValidationError[] = [];
    const validation = field.validation!;

    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        errors.push({
          field: field.key,
          message: validation.message || `Value must be >= ${validation.min}`,
          severity: 'error',
        });
      }
      if (validation.max !== undefined && value > validation.max) {
        errors.push({
          field: field.key,
          message: validation.message || `Value must be <= ${validation.max}`,
          severity: 'error',
        });
      }
    }

    if (typeof value === 'string' && validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        errors.push({
          field: field.key,
          message: validation.message || 'Invalid format',
          severity: 'error',
        });
      }
    }

    return errors;
  }

  private assessDataIntegrity(inputData: TestInputData, hardwareData?: unknown): CredibilityFactor {
    let score = 1;
    const details: string[] = [];

    if (inputData._metadata?.deviceId) {
      details.push('Device ID present');
    } else if (inputData._metadata?.enteredBy) {
      score *= 0.8;
      details.push('Manual entry only');
    }

    if (inputData._metadata?.gpsLocation) {
      details.push('GPS location verified');
      if (inputData._metadata.gpsLocation.vpnDetected) {
        score *= 0.5;
        details.push('VPN detected - location may be spoofed');
      }
    } else {
      score *= 0.7;
      details.push('No GPS verification');
    }

    if (hardwareData) {
      const hw = hardwareData as { integrityHash?: string; sessionInfo?: { vpnDetected?: boolean } };
      if (hw.integrityHash) {
        details.push('Hardware integrity hash verified');
      }
      if (hw.sessionInfo?.vpnDetected) {
        score *= 0.3;
        details.push('VPN detected during hardware session');
      }
    }

    return {
      name: 'Data Integrity',
      weight: 0.35,
      score: Math.max(0, Math.min(1, score)),
      passed: score > 0.5,
      details: details.join('; '),
    };
  }

  private assessCalculations(results: CalculatedResults): CredibilityFactor {
    if (Object.keys(results).length === 0) {
      return {
        name: 'Calculation Validity',
        weight: 0.25,
        score: 0,
        passed: false,
        details: 'No calculations performed',
      };
    }

    const totalChecks = Object.values(results).length;
    let passedChecks = 0;
    const details: string[] = [];

    for (const [key, result] of Object.entries(results)) {
      if (result.status === 'PASS') {
        passedChecks++;
        details.push(`${key}: PASS`);
      } else if (result.status === 'WARNING') {
        passedChecks += 0.5;
        details.push(`${key}: WARNING`);
      } else {
        details.push(`${key}: FAIL`);
      }
    }

    const score = passedChecks / totalChecks;
    return {
      name: 'Calculation Validity',
      weight: 0.25,
      score,
      passed: score > 0.7,
      details: details.join('; '),
    };
  }

  private assessHardwareIntegrity(hardwareData?: unknown): CredibilityFactor {
    if (!hardwareData) {
      return {
        name: 'Hardware Integrity',
        weight: 0.25,
        score: 0,
        passed: false,
        details: 'No hardware data provided',
      };
    }

    const hw = hardwareData as { 
      integrityHash?: string; 
      sessionInfo?: { 
        mcuId?: string; 
        firmwareVersion?: string;
        vpnDetected?: boolean;
      };
      readings?: Array<{ quality: string }>;
    };

    let score = 1;
    const details: string[] = [];

    if (hw.integrityHash) {
      details.push('Data integrity hash verified');
    } else {
      score *= 0.4;
      details.push('Missing integrity hash');
    }

    if (hw.sessionInfo?.mcuId) {
      details.push('MCU ID verified');
    } else {
      score *= 0.5;
      details.push('MCU ID missing');
    }

    if (hw.sessionInfo?.firmwareVersion) {
      details.push(`Firmware: ${hw.sessionInfo.firmwareVersion}`);
    } else {
      score *= 0.7;
      details.push('Firmware version unknown');
    }

    if (hw.sessionInfo?.vpnDetected) {
      score *= 0.2;
      details.push('CRITICAL: VPN detected during test');
    }

    if (hw.readings) {
      const badReadings = hw.readings.filter(r => r.quality === 'BAD').length;
      if (badReadings > 0) {
        score *= Math.max(0.3, 1 - badReadings / hw.readings.length * 0.5);
        details.push(`${badReadings} bad quality readings`);
      }
    }

    return {
      name: 'Hardware Integrity',
      weight: 0.25,
      score: Math.max(0, Math.min(1, score)),
      passed: score > 0.6,
      details: details.join('; '),
    };
  }

  private assessPersonnelCompetency(inputData: TestInputData): CredibilityFactor {
    const enteredBy = inputData._metadata?.enteredBy;
    
    if (!enteredBy) {
      return {
        name: 'Personnel Competency',
        weight: 0.15,
        score: 0.3,
        passed: false,
        details: 'Technician not identified',
      };
    }

    return {
      name: 'Personnel Competency',
      weight: 0.15,
      score: 0.9,
      passed: true,
      details: `Performed by: ${enteredBy}`,
    };
  }

  private calculateLevel(score: number): CredibilityLevel {
    if (score >= 0.85) return CredibilityLevel.CERTIFIED;
    if (score >= 0.65) return CredibilityLevel.VERIFIED;
    return CredibilityLevel.UNVERIFIED;
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CredibilityAssessment {
  level: CredibilityLevel;
  score: number;
  factors: CredibilityFactor[];
  assessedAt: string;
  assessedBy: string;
}

export interface CredibilityFactor {
  name: string;
  weight: number;
  score: number;
  passed: boolean;
  details: string;
}