import { z } from 'zod';

export const TestModeSchema = z.enum(['MANUAL', 'HARDWARE']);
export const TestStatusSchema = z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']);
export const CredibilityLevelSchema = z.enum(['UNVERIFIED', 'VERIFIED', 'CERTIFIED']);

export const HardwareConnectionTypeSchema = z.enum(['USB_SERIAL', 'WIFI', 'BLUETOOTH', 'ETHERNET']);

export const MarshallInputSchema = z.object({
  specimenId: z.string().min(1, 'Specimen ID is required'),
  diameter: z.number().positive('Diameter must be positive'),
  height: z.number().positive('Height must be positive'),
  weightInAir: z.number().positive('Weight in air must be positive'),
  weightInWater: z.number().positive('Weight in water must be positive'),
  stabilityNo: z.number().positive('Stability number must be positive'),
  flowValue: z.number().min(0).max(50, 'Flow value must be 0-50'),
  bulkSg: z.number().positive('Bulk SG must be positive'),
  maxSg: z.number().positive('Max SG must be positive'),
  airVoids: z.number().min(0).max(100, 'Air voids must be 0-100'),
  vma: z.number().min(0).max(100, 'VMA must be 0-100'),
  vfb: z.number().min(0).max(100, 'VFB must be 0-100'),
  compactionTemp: z.number().min(100).max(200, 'Compaction temp 100-200°C'),
  testTemp: z.number().min(20).max(80, 'Test temp 20-80°C'),
  loadRate: z.number().positive('Load rate must be positive'),
  _metadata: z.object({
    enteredBy: z.string().optional(),
    enteredAt: z.string().datetime().optional(),
    deviceInfo: z.string().optional(),
  }).optional(),
});

export const ConcreteCubeInputSchema = z.object({
  specimenId: z.string().min(1, 'Specimen ID required'),
  cubeSize: z.enum([100, 150, 200]),
  weight: z.number().positive('Weight must be positive'),
  ageAtTest: z.number().int().positive('Age must be positive integer'),
  maxLoad: z.number().positive('Max load must be positive'),
  loadRate: z.number().positive('Load rate must be positive'),
  failureType: z.enum(['NORMAL', 'EXPLOSIVE', 'SHEAR', 'TENSILE', 'OTHER']),
  _metadata: z.object({
    enteredBy: z.string().optional(),
    enteredAt: z.string().datetime().optional(),
    deviceInfo: z.string().optional(),
  }).optional(),
});

export const SoilProctorInputSchema = z.object({
  specimenId: z.string().min(1),
  moldVolume: z.number().positive(),
  moldDiameter: z.number().positive(),
  moldHeight: z.number().positive(),
  wetWeight: z.number().positive(),
  dryWeight: z.number().positive(),
  waterContent: z.number().min(0).max(100),
  blowsPerLayer: z.number().int().positive(),
  layers: z.number().int().positive(),
  _metadata: z.object({
    enteredBy: z.string().optional(),
    enteredAt: z.string().datetime().optional(),
    deviceInfo: z.string().optional(),
  }).optional(),
});

export const HardwareSessionInputSchema = z.object({
  sessionId: z.string().uuid(),
  deviceId: z.string().min(1),
  connectionType: HardwareConnectionTypeSchema,
  ipAddress: z.string().ip().optional(),
  gpsLatitude: z.number().min(-90).max(90).optional(),
  gpsLongitude: z.number().min(-180).max(180).optional(),
  gpsAccuracy: z.number().positive().optional(),
  vpnDetected: z.boolean().default(false),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  dataPoints: z.array(z.unknown()).optional(),
  integrityHash: z.string().optional(),
});

export const AntiTamperEventSchema = z.object({
  deviceId: z.string(),
  eventType: z.enum([
    'FIRMWARE_MISMATCH',
    'MCU_ID_MISMATCH',
    'CLOCK_DRIFT',
    'VOLTAGE_ANOMALY',
    'MEMORY_CORRUPTION',
    'UNAUTHORIZED_ACCESS',
    'GPS_SPOOFING',
    'VPN_DETECTED',
    'REPLAY_ATTACK',
  ]),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  details: z.record(z.unknown()),
  detectedAt: z.string().datetime(),
});

export const TestInputSchema = z.object({
  templateId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  mode: TestModeSchema,
  inputData: z.union([
    MarshallInputSchema,
    ConcreteCubeInputSchema,
    SoilProctorInputSchema,
    z.record(z.unknown()),
  ]),
  hardwareSession: HardwareSessionInputSchema.optional(),
});

export const TestUpdateSchema = z.object({
  status: TestStatusSchema.optional(),
  inputData: z.record(z.unknown()).optional(),
  calculatedResults: z.record(z.unknown()).optional(),
  credibilityLevel: CredibilityLevelSchema.optional(),
  completedAt: z.string().datetime().optional(),
});

export const TestFilterSchema = z.object({
  templateId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  mode: TestModeSchema.optional(),
  status: TestStatusSchema.optional(),
  credibilityLevel: CredibilityLevelSchema.optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const HardwareDeviceCreateSchema = z.object({
  deviceId: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  firmwareVersion: z.string().min(1),
  mcuId: z.string().min(1),
  publicKey: z.string().min(1),
});

export const HardwareDeviceUpdateSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'REVOKED', 'COMPROMISED']).optional(),
  calibrationDate: z.string().datetime().optional(),
  calibrationDue: z.string().datetime().optional(),
});

export const TemplateCreateSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  category: z.string().min(1),
  standard: z.string().min(1),
  version: z.string().default('1.0'),
  description: z.string().optional(),
  schema: z.record(z.unknown()),
  calculations: z.record(z.unknown()),
  reportTemplate: z.string().optional(),
});

export type TestMode = z.infer<typeof TestModeSchema>;
export type TestStatus = z.infer<typeof TestStatusSchema>;
export type CredibilityLevel = z.infer<typeof CredibilityLevelSchema>;
export type HardwareConnectionType = z.infer<typeof HardwareConnectionTypeSchema>;
export type MarshallInput = z.infer<typeof MarshallInputSchema>;
export type ConcreteCubeInput = z.infer<typeof ConcreteCubeInputSchema>;
export type SoilProctorInput = z.infer<typeof SoilProctorInputSchema>;
export type HardwareSessionInput = z.infer<typeof HardwareSessionInputSchema>;
export type TestInput = z.infer<typeof TestInputSchema>;
export type TestUpdate = z.infer<typeof TestUpdateSchema>;
export type TestFilter = z.infer<typeof TestFilterSchema>;
export type HardwareDeviceCreate = z.infer<typeof HardwareDeviceCreateSchema>;
export type HardwareDeviceUpdate = z.infer<typeof HardwareDeviceUpdateSchema>;
export type TemplateCreate = z.infer<typeof TemplateCreateSchema>;