import { TestTemplate, TestSchema, CalculationSchema } from '@/types/test';

export const marshallTemplate: TestTemplate = {
  id: 'marshall-stability',
  code: 'MARSHALL-ASTM-D6927',
  name: 'اختبار مارشال للثبات والتدفق (Marshall Stability & Flow)',
  category: 'الأسفلت',
  standard: 'ASTM D6927 / AASHTO T245',
  version: '1.0',
  description: 'تحديد ثبات وتدفق الخلطات الأسفلتية باستخدام جهاز مارشال',
  schema: {
    fields: [
      { key: 'specimenId', label: 'رقم العينة', type: 'text', required: true },
      { key: 'diameter', label: 'القطر', type: 'number', unit: 'mm', required: true, min: 95, max: 105, defaultValue: 101.6, step: 0.1 },
      { key: 'height', label: 'الارتفاع', type: 'number', unit: 'mm', required: true, min: 60, max: 70, defaultValue: 63.5, step: 0.1 },
      { key: 'weightInAir', label: 'الوزن في الهواء', type: 'number', unit: 'g', required: true, min: 1000, max: 1500, step: 0.1 },
      { key: 'weightInWater', label: 'الوزن في الماء', type: 'number', unit: 'g', required: true, min: 500, max: 1000, step: 0.1 },
      { key: 'stabilityNo', label: 'رقم الثبات', type: 'number', unit: 'kN', required: true, min: 0, max: 50, step: 0.01 },
      { key: 'flowValue', label: 'قيمة التدفق', type: 'number', unit: '0.25mm', required: true, min: 0, max: 50 },
      { key: 'bulkSg', label: 'الوزن النوعي الظاهري', type: 'calculated', unit: '', required: true },
      { key: 'maxSg', label: 'الوزن النوعي النظري الأقصى', type: 'number', unit: '', required: true, min: 2.3, max: 2.7, step: 0.001 },
      { key: 'airVoids', label: 'نسبة الفراغات الهوائية', type: 'calculated', unit: '%', required: true },
      { key: 'vma', label: 'فراغات المعدن في الخلطة (VMA)', type: 'calculated', unit: '%', required: true },
      { key: 'vfb', label: 'نسبة الفراغات المملوءة بالأسفلت (VFB)', type: 'calculated', unit: '%', required: true },
      { key: 'compactionTemp', label: 'درجة حرارة الدك', type: 'number', unit: '°C', required: true, min: 100, max: 200 },
      { key: 'testTemp', label: 'درجة حرارة الاختبار', type: 'number', unit: '°C', required: true, min: 20, max: 80 },
      { key: 'loadRate', label: 'معدل التحميل', type: 'number', unit: 'mm/min', required: true, defaultValue: 50.8 },
    ],
    sections: [
      { id: 'specimen', title: 'بيانات العينة', fields: ['specimenId', 'diameter', 'height'], order: 1 },
      { id: 'weights', title: 'الأوزان والكثافات', fields: ['weightInAir', 'weightInWater', 'maxSg'], order: 2 },
      { id: 'results', title: 'نتائج الاختبار', fields: ['stabilityNo', 'flowValue'], order: 3 },
      { id: 'calculated', title: 'الخصائص المحسوبة', fields: ['bulkSg', 'airVoids', 'vma', 'vfb'], order: 4 },
      { id: 'conditions', title: 'ظروف الاختبار', fields: ['compactionTemp', 'testTemp', 'loadRate'], order: 5 },
    ],
    validationRules: [
      { field: 'diameter', rule: 'value >= 95 && value <= 105', message: 'القطر يجب أن يكون بين 95-105 مم', severity: 'error' },
      { field: 'height', rule: 'value >= 60 && value <= 70', message: 'الارتفاع يجب أن يكون بين 60-70 مم', severity: 'error' },
      { field: 'flowValue', rule: 'value <= 50', message: 'قيمة التدفق لا يجب أن تتجاوز 50', severity: 'warning' },
      { field: 'airVoids', rule: 'value >= 3 && value <= 8', message: 'نسبة الفراغات الهوائية المثالية 3-8%', severity: 'warning' },
    ],
  },
  calculations: {
    formulas: [
      {
        id: 'bulk_sg',
        name: 'الوزن النوعي الظاهري',
        expression: 'weightInAir / (weightInAir - weightInWater)',
        dependencies: ['weightInAir', 'weightInWater'],
        unit: '',
        precision: 3,
      },
      {
        id: 'air_voids',
        name: 'نسبة الفراغات الهوائية',
        expression: '((maxSg - bulkSg) / maxSg) * 100',
        dependencies: ['maxSg', 'bulkSg'],
        unit: '%',
        precision: 1,
      },
      {
        id: 'vma',
        name: 'فراغات المعدن في الخلطة (VMA)',
        expression: '100 - ((bulkSg * (100 - airVoids)) / maxSg)',
        dependencies: ['bulkSg', 'airVoids', 'maxSg'],
        unit: '%',
        precision: 1,
      },
      {
        id: 'vfb',
        name: 'نسبة الفراغات المملوءة بالأسفلت (VFB)',
        expression: '(vma - airVoids) / vma * 100',
        dependencies: ['vma', 'airVoids'],
        unit: '%',
        precision: 1,
      },
      {
        id: 'corrected_stability',
        name: 'الثبات المصحح',
        expression: 'stabilityNo * (height / 63.5)',
        dependencies: ['stabilityNo', 'height'],
        unit: 'kN',
        precision: 2,
      },
    ],
    outputs: [
      { key: 'bulkSg', label: 'الوزن النوعي الظاهري', unit: '', formulaId: 'bulk_sg', thresholds: [] },
      { key: 'airVoids', label: 'نسبة الفراغات الهوائية', unit: '%', formulaId: 'air_voids', thresholds: [
        { min: 3, max: 5, status: 'PASS', message: 'ممتاز' },
        { min: 5, max: 8, status: 'PASS', message: 'مقبول' },
        { min: 0, max: 3, status: 'WARNING', message: 'منخفض - خطر الت rutting' },
        { min: 8, max: 100, status: 'FAIL', message: 'مرتفع - خطر التكسر' },
      ]},
      { key: 'vma', label: 'فراغات المعدن في الخلطة (VMA)', unit: '%', formulaId: 'vma', thresholds: [
        { min: 13, max: 100, status: 'PASS', message: 'مقبول' },
        { min: 0, max: 13, status: 'FAIL', message: 'أقل من الحد الأدنى' },
      ]},
      { key: 'vfb', label: 'نسبة الفراغات المملوءة بالأسفلت (VFB)', unit: '%', formulaId: 'vfb', thresholds: [
        { min: 65, max: 78, status: 'PASS', message: 'مثالي' },
        { min: 0, max: 65, status: 'WARNING', message: 'منخفض' },
        { min: 78, max: 100, status: 'WARNING', message: 'مرتفع' },
      ]},
      { key: 'correctedStability', label: 'الثبات المصحح', unit: 'kN', formulaId: 'corrected_stability', thresholds: [
        { min: 8, max: 100, status: 'PASS', message: 'مقبول' },
        { min: 0, max: 8, status: 'FAIL', message: 'أقل من الحد الأدنى' },
      ]},
    ],
  },
  reportTemplate: 'marshall-report',
  isActive: true,
};

export const concreteCubeTemplate: TestTemplate = {
  id: 'concrete-cube',
  code: 'CONCRETE-CUBE-EN12390',
  name: 'اختبار كسر مكعبات الخرسانة (Concrete Cube Compression)',
  category: 'الخرسانة',
  standard: 'EN 12390-3 / ASTM C39',
  version: '1.0',
  description: 'تحديد مقاومة الضغط للمكعبات الخرسانية',
  schema: {
    fields: [
      { key: 'specimenId', label: 'رقم العينة', type: 'text', required: true },
      { key: 'cubeSize', label: 'حجم المكعب', type: 'select', required: true, options: [
        { value: 100, label: '100×100×100 مم' },
        { value: 150, label: '150×150×150 مم' },
        { value: 200, label: '200×200×200 مم' },
      ]},
      { key: 'weight', label: 'الوزن', type: 'number', unit: 'kg', required: true, min: 5, max: 20, step: 0.01 },
      { key: 'ageAtTest', label: 'العمر عند الاختبار', type: 'number', unit: 'يوم', required: true, min: 1, max: 365 },
      { key: 'maxLoad', label: 'الحمل الأقصى', type: 'number', unit: 'kN', required: true, min: 0, step: 0.1 },
      { key: 'loadRate', label: 'معدل التحميل', type: 'number', unit: 'MPa/s', required: true, defaultValue: 0.6, step: 0.01 },
      { key: 'failureType', label: 'نوع الكسر', type: 'select', required: true, options: [
        { value: 'NORMAL', label: 'طبيعي' },
        { value: 'EXPLOSIVE', label: 'انفجاري' },
        { value: 'SHEAR', label: 'قص' },
        { value: 'TENSILE', label: 'شد' },
        { value: 'OTHER', label: 'أخرى' },
      ]},
      { key: 'compressiveStrength', label: 'مقاومة الضغط', type: 'calculated', unit: 'MPa', required: true },
    ],
    sections: [
      { id: 'specimen', title: 'بيانات العينة', fields: ['specimenId', 'cubeSize', 'weight', 'ageAtTest'], order: 1 },
      { id: 'test', title: 'بيانات الاختبار', fields: ['maxLoad', 'loadRate', 'failureType'], order: 2 },
      { id: 'results', title: 'النتائج', fields: ['compressiveStrength'], order: 3 },
    ],
    validationRules: [
      { field: 'maxLoad', rule: 'value > 0', message: 'الحمل الأقصى يجب أن يكون أكبر من صفر', severity: 'error' },
      { field: 'ageAtTest', rule: 'value >= 1 && value <= 365', message: 'العمر يجب أن يكون بين 1-365 يوم', severity: 'error' },
    ],
  },
  calculations: {
    formulas: [
      {
        id: 'compressive_strength',
        name: 'مقاومة الضغط',
        expression: 'maxLoad / (cubeSize * cubeSize / 1000000)',
        dependencies: ['maxLoad', 'cubeSize'],
        unit: 'MPa',
        precision: 1,
      },
    ],
    outputs: [
      { key: 'compressiveStrength', label: 'مقاومة الضغط', unit: 'MPa', formulaId: 'compressive_strength', thresholds: [
        { min: 20, max: 100, status: 'PASS', message: 'مقبول' },
        { min: 0, max: 20, status: 'FAIL', message: 'أقل من الحد الأدنى' },
      ]},
    ],
  },
  reportTemplate: 'concrete-cube-report',
  isActive: true,
};

export const soilProctorTemplate: TestTemplate = {
  id: 'soil-proctor',
  code: 'SOIL-PROCTOR-ASTM-D698',
  name: 'اختبار بروكتور القياسي للتربة (Standard Proctor)',
  category: 'التربة',
  standard: 'ASTM D698 / AASHTO T99',
  version: '1.0',
  description: 'تحديد العلاقة بين المحتوى المائي والكثافة الجافة القصوى للتربة',
  schema: {
    fields: [
      { key: 'specimenId', label: 'رقم العينة', type: 'text', required: true },
      { key: 'moldVolume', label: 'حجم القالب', type: 'number', unit: 'cm³', required: true, defaultValue: 944 },
      { key: 'moldDiameter', label: 'قطر القالب', type: 'number', unit: 'mm', required: true, defaultValue: 101.6 },
      { key: 'moldHeight', label: 'ارتفاع القالب', type: 'number', unit: 'mm', required: true, defaultValue: 116.4 },
      { key: 'wetWeight', label: 'الوزن الرطب', type: 'number', unit: 'g', required: true },
      { key: 'dryWeight', label: 'الوزن الجاف', type: 'number', unit: 'g', required: true },
      { key: 'waterContent', label: 'المحتوى المائي', type: 'number', unit: '%', required: true, min: 0, max: 50 },
      { key: 'blowsPerLayer', label: 'عدد الضربات لكل طبقة', type: 'number', required: true, defaultValue: 25 },
      { key: 'layers', label: 'عدد الطبقات', type: 'number', required: true, defaultValue: 3 },
      { key: 'dryDensity', label: 'الكثافة الجافة', type: 'calculated', unit: 'g/cm³', required: true },
      { key: 'maxDryDensity', label: 'أقصى كثافة جافة', type: 'calculated', unit: 'g/cm³', required: true },
      { key: 'optimumMoisture', label: 'المحتوى المائي الأمثل', type: 'calculated', unit: '%', required: true },
    ],
    sections: [
      { id: 'mold', title: 'بيانات القالب', fields: ['moldVolume', 'moldDiameter', 'moldHeight'], order: 1 },
      { id: 'weights', title: 'الأوزان', fields: ['wetWeight', 'dryWeight'], order: 2 },
      { id: 'compaction', title: 'بيانات الدك', fields: ['waterContent', 'blowsPerLayer', 'layers'], order: 3 },
      { id: 'results', title: 'النتائج', fields: ['dryDensity', 'maxDryDensity', 'optimumMoisture'], order: 4 },
    ],
    validationRules: [],
  },
  calculations: {
    formulas: [
      { id: 'dry_density', name: 'الكثافة الجافة', expression: 'dryWeight / moldVolume', dependencies: ['dryWeight', 'moldVolume'], unit: 'g/cm³', precision: 3 },
      { id: 'max_dry_density', name: 'أقصى كثافة جافة', expression: 'Math.max(...dryDensityValues)', dependencies: ['dryDensity'], unit: 'g/cm³', precision: 3 },
      { id: 'optimum_moisture', name: 'المحتوى المائي الأمثل', expression: 'waterContent at maxDryDensity', dependencies: ['waterContent', 'dryDensity'], unit: '%', precision: 1 },
    ],
    outputs: [
      { key: 'dryDensity', label: 'الكثافة الجافة', unit: 'g/cm³', formulaId: 'dry_density' },
      { key: 'maxDryDensity', label: 'أقصى كثافة جافة', unit: 'g/cm³', formulaId: 'max_dry_density' },
      { key: 'optimumMoisture', label: 'المحتوى المائي الأمثل', unit: '%', formulaId: 'optimum_moisture' },
    ],
  },
  reportTemplate: 'soil-proctor-report',
  isActive: true,
};

export const templates: TestTemplate[] = [marshallTemplate, concreteCubeTemplate, soilProctorTemplate];

export function getTestTemplate(id: string): TestTemplate | undefined {
  return templates.find(t => t.id === id || t.code.includes(id.toUpperCase()));
}

export function getTemplateById(id: string): TestTemplate | undefined {
  return templates.find(t => t.id === id);
}

export const hardwareConfigs = {
  'marshall-stability': {
    templateId: 'marshall-stability',
    deviceType: 'SMARTLAB-MARSHALL-v2',
    requiredSensors: ['LOAD_CELL', 'DISPLACEMENT', 'TEMPERATURE'],
    calibrationSpecs: {
      sensors: [
        { sensorId: 'LOAD_CELL', formula: 'raw * 0.0012 + 0.05', coefficients: [0.0012, 0.05], referencePoints: [] },
        { sensorId: 'DISPLACEMENT', formula: 'raw * 0.01', coefficients: [0.01, 0], referencePoints: [] },
        { sensorId: 'TEMPERATURE', formula: 'raw * 0.1 - 40', coefficients: [0.1, -40], referencePoints: [] },
      ],
      referenceStandards: ['ASTM D6927', 'AASHTO T245'],
      tolerance: { LOAD_CELL: 0.5, DISPLACEMENT: 0.1, TEMPERATURE: 1.0 },
    },
    samplingRate: 100,
    dataFormat: { encoding: 'json', schema: {}, compression: 'none' },
  },
  'concrete-cube': {
    templateId: 'concrete-cube',
    deviceType: 'SMARTLAB-COMPRESSION-v1',
    requiredSensors: ['LOAD_CELL', 'DISPLACEMENT'],
    calibrationSpecs: {
      sensors: [
        { sensorId: 'LOAD_CELL', formula: 'raw * 0.0025 + 0.1', coefficients: [0.0025, 0.1], referencePoints: [] },
        { sensorId: 'DISPLACEMENT', formula: 'raw * 0.005', coefficients: [0.005, 0], referencePoints: [] },
      ],
      referenceStandards: ['EN 12390-3', 'ASTM C39'],
      tolerance: { LOAD_CELL: 1.0, DISPLACEMENT: 0.1 },
    },
    samplingRate: 50,
    dataFormat: { encoding: 'json', schema: {}, compression: 'none' },
  },
};

export function getHardwareConfig(templateId: string) {
  return hardwareConfigs[templateId as keyof typeof hardwareConfigs];
}