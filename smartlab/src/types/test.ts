export enum TestMode {
  MANUAL = 'MANUAL',
  HARDWARE = 'HARDWARE',
}

export enum TestStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum CredibilityLevel {
  UNVERIFIED = 'UNVERIFIED',
  VERIFIED = 'VERIFIED',
  CERTIFIED = 'CERTIFIED',
}

export enum HardwareConnectionType {
  USB_SERIAL = 'USB_SERIAL',
  WIFI = 'WIFI',
  BLUETOOTH = 'BLUETOOTH',
  ETHERNET = 'ETHERNET',
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  REVOKED = 'REVOKED',
  COMPROMISED = 'COMPROMISED',
}

export interface TestTemplate {
  id: string;
  code: string;
  name: string;
  category: string;
  standard: string;
  version: string;
  description?: string;
  schema: TestSchema;
  calculations: CalculationSchema;
  reportTemplate?: string;
  isActive: boolean;
}

export interface TestSchema {
  fields: TestField[];
  sections: TestSection[];
  validationRules: ValidationRule[];
}

export interface TestField {
  key: string;
  label: string;
  type: FieldType;
  unit?: string;
  required: boolean;
  defaultValue?: unknown;
  validation?: FieldValidation;
  dependsOn?: string;
  showWhen?: Record<string, unknown>;
  hardwareMapping?: HardwareMapping;
}

export interface HardwareMapping {
  sensorId: string;
  registerAddress?: number;
  conversionFormula?: string;
  unit: string;
  samplingRate?: number;
}

export type FieldType = 
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'datetime'
  | 'file'
  | 'signature'
  | 'calculated'
  | 'hardware_reading'
  | 'gps_coordinate';

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
  message?: string;
}

export interface TestSection {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  order: number;
  collapsible?: boolean;
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CalculationSchema {
  formulas: CalculationFormula[];
  outputs: CalculationOutput[];
}

export interface CalculationFormula {
  id: string;
  name: string;
  expression: string;
  dependencies: string[];
  unit: string;
  precision: number;
}

export interface CalculationOutput {
  key: string;
  label: string;
  unit: string;
  formulaId: string;
  thresholds?: Threshold[];
}

export interface Threshold {
  min?: number;
  max?: number;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
}

export interface TestInputData {
  [key: string]: unknown;
  _metadata?: {
    enteredBy: string;
    enteredAt: string;
    deviceId?: string;
    sessionId?: string;
    gpsLocation?: GPSLocation;
  };
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  vpnDetected?: boolean;
}

export interface CalculatedResults {
  [key: string]: CalculatedValue;
}

export interface CalculatedValue {
  value: number;
  unit: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  threshold?: Threshold;
  calculatedAt: string;
}

export interface HardwareRawData {
  readings: HardwareReading[];
  sessionInfo: HardwareSessionInfo;
  integrityHash: string;
}

export interface HardwareReading {
  sensorId: string;
  timestamp: string;
  value: number;
  unit: string;
  quality: 'GOOD' | 'UNCERTAIN' | 'BAD';
}

export interface HardwareSessionInfo {
  sessionId: string;
  deviceId: string;
  connectionType: HardwareConnectionType;
  startedAt: string;
  endedAt?: string;
  gpsLocation?: GPSLocation;
  vpnDetected: boolean;
  firmwareVersion: string;
  mcuId: string;
}

export interface Test {
  id: string;
  testNumber: string;
  templateId: string;
  template?: TestTemplate;
  projectId?: string;
  userId: string;
  mode: TestMode;
  status: TestStatus;
  credibilityLevel: CredibilityLevel;
  inputData: TestInputData;
  calculatedResults?: CalculatedResults;
  rawHardwareData?: HardwareRawData;
  hardwareDeviceId?: string;
  hardwareSessionId?: string;
  startedAt?: string;
  completedAt?: string;
  certifiedAt?: string;
  certifiedBy?: string;
  qrCode?: string;
  pdfReportUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HardwareDevice {
  id: string;
  deviceId: string;
  name: string;
  type: string;
  firmwareVersion: string;
  mcuId: string;
  publicKey: string;
  status: DeviceStatus;
  lastSeenAt?: string;
  calibrationDate?: string;
  calibrationDue?: string;
  userId?: string;
}

export interface HardwareTestConfig {
  id: string;
  templateId: string;
  deviceType: string;
  requiredSensors: string[];
  calibrationSpecs: CalibrationSpecs;
  samplingRate: number;
  dataFormat: DataFormat;
}

export interface CalibrationSpecs {
  sensors: SensorCalibration[];
  referenceStandards: string[];
  tolerance: Record<string, number>;
}

export interface SensorCalibration {
  sensorId: string;
  formula: string;
  coefficients: number[];
  referencePoints: CalibrationPoint[];
  validFrom: string;
  validUntil: string;
}

export interface CalibrationPoint {
  input: number;
  expected: number;
  tolerance: number;
}

export interface DataFormat {
  encoding: 'json' | 'binary' | 'csv';
  schema: Record<string, unknown>;
  compression?: 'gzip' | 'none';
}

export interface HardwareSession {
  id: string;
  sessionId: string;
  deviceId: string;
  testId?: string;
  connectionType: HardwareConnectionType;
  ipAddress?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAccuracy?: number;
  vpnDetected: boolean;
  startedAt: string;
  endedAt?: string;
  dataPoints?: unknown;
  integrityHash?: string;
  isValid: boolean;
}

export interface AntiTamperLog {
  id: string;
  deviceId: string;
  eventType: TamperEventType;
  severity: TamperSeverity;
  details: Record<string, unknown>;
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type TamperEventType = 
  | 'FIRMWARE_MISMATCH'
  | 'MCU_ID_MISMATCH'
  | 'CLOCK_DRIFT'
  | 'VOLTAGE_ANOMALY'
  | 'MEMORY_CORRUPTION'
  | 'UNAUTHORIZED_ACCESS'
  | 'GPS_SPOOFING'
  | 'VPN_DETECTED'
  | 'REPLAY_ATTACK';

export type TamperSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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

export interface TestCreationInput {
  templateId: string;
  projectId?: string;
  mode: TestMode;
  inputData: TestInputData;
}

export interface HardwareTestCreationInput extends TestCreationInput {
  mode: TestMode.HARDWARE;
  hardwareDeviceId: string;
  hardwareSessionId: string;
  rawHardwareData: HardwareRawData;
}

export interface ManualTestCreationInput extends TestCreationInput {
  mode: TestMode.MANUAL;
}

export interface TestReportData {
  test: Test;
  template: TestTemplate;
  organization: {
    name: string;
    logo?: string;
    address?: string;
    licenseNumber?: string;
  };
  technician: {
    name: string;
    licenseNumber?: string;
    signature?: string;
  };
  approvedBy?: {
    name: string;
    title: string;
    signature?: string;
    date: string;
  };
  qrCodeUrl: string;
  generatedAt: string;
}