/* smartLAB — Admin Configuration
   Change credentials and site structure here */
var ADMIN_CONFIG = {
    email: 'eng.ahmedabdoualyan@gmail.com',
    password: 'fimto@ata',
    sessionTimeout: 30 * 60 * 1000,
    verificationCodeLength: 6,
    flagClicksRequired: 5,
    flagClickTimeout: 3000,
    emailjs: {
        publicKey: '',
        serviceId: '',
        templateId: ''
    }
};

/* Zone configuration for test pages */
var ZONE_CONFIG = {
    defaultLayout: '1-col',
    availableTypes: ['video', 'pdf', 'presentation', 'text', 'hardware', 'firmware', 'custom'],
    layouts: {
        '1-col': { label: '1 Column', cols: 1 },
        '2-col-equal': { label: '2 Columns Equal', cols: 2 },
        '2-col-1-2': { label: '2 Columns (1:2)', cols: 2 },
        '2-col-2-1': { label: '2 Columns (2:1)', cols: 2 },
        '3-col': { label: '3 Columns', cols: 3 },
        '2-row': { label: '2 Rows', cols: 1, rows: 2 }
    },
    typeDefaults: {
        video: { title: 'Video', titleAr: 'فيديو', icon: '🎬' },
        pdf: { title: 'PDF Document', titleAr: 'ملف PDF', icon: '📄' },
        presentation: { title: 'Presentation', titleAr: 'عرض تقديمي', icon: '📊' },
        text: { title: 'Test Explanation', titleAr: 'شرح الاختبار', icon: '📝' },
        hardware: { title: 'Required Equipment', titleAr: 'المعدات المطلوبة', icon: '🔧' },
        firmware: { title: 'Device Firmware', titleAr: 'فيرموير الجهاز', icon: '💾' },
        custom: { title: 'Custom Zone', titleAr: 'منطقة مخصصة', icon: '⚙️' }
    }
};

var SITE_STRUCTURE = {
    sections: [
        {
            id: 'concrete',
            name: 'Concrete Testing',
            nameAr: 'اختبارات الخرسانة',
            icon: '🏗️',
            color: '#fb923c',
            path: '/concrete/',
            tests: [
                { id: 'test-compressive', name: 'Compressive Strength', nameAr: 'القوة الانضغاطية', icon: '💪', path: '/concrete/tests/test-compressive.html', standard: 'ASTM C39', status: 'active' },
                { id: 'test-slump', name: 'Slump Test', nameAr: 'اختبار الانهيار', icon: '🔬', path: '/concrete/tests/test-slump.html', standard: 'ASTM C143', status: 'active' },
                { id: 'test-density', name: 'Unit Weight', nameAr: 'الوزن الحجمي', icon: '⚖️', path: '/concrete/tests/test-density.html', standard: 'ASTM C138', status: 'active' },
                { id: 'test-airspeed', name: 'Air Content', nameAr: 'محتوى الهواء', icon: '💨', path: '/concrete/tests/test-airspeed.html', standard: 'ASTM C231', status: 'active' },
                { id: 'test-temp', name: 'Temperature', nameAr: 'الحرارة', icon: '🌡️', path: '/concrete/tests/test-temp.html', standard: 'ASTM C1064', status: 'active' },
                { id: 'test-cylinder', name: 'Cylinder Prep', nameAr: 'تحضير الأسطوانات', icon: '🧱', path: '/concrete/tests/test-cylinder.html', standard: 'ASTM C31', status: 'active' },
                { id: 'test-rebound', name: 'Rebound Hammer', nameAr: 'مطرقة الارتداد', icon: '🔨', path: '/concrete/tests/test-rebound.html', standard: 'ASTM C805', status: 'active' },
                { id: 'test-upt', name: 'Ultrasonic Pulse', nameAr: 'الموجات فوق الصوتية', icon: '📡', path: '/concrete/tests/test-upt.html', standard: 'ASTM C597', status: 'active' }
            ],
            designs: [
                { id: 'design-mix', name: 'Mix Design', icon: '🧪', path: '/concrete/design/design-mix.html' },
                { id: 'design-break', name: 'Break Schedule', icon: '📊', path: '/concrete/design/design-break.html' },
                { id: 'design-batchweights', name: 'Batch Weights', icon: '⚖️', path: '/concrete/design/design-batchweights.html' },
                { id: 'design-strengthage', name: 'Strength vs Age', icon: '📈', path: '/concrete/design/design-strengthage.html' },
                { id: 'design-admixtures', name: 'Admixtures', icon: '💧', path: '/concrete/design/design-admixtures.html' },
                { id: 'design-durability', name: 'Durability', icon: '🛡️', path: '/concrete/design/design-durability.html' },
                { id: 'design-filter', name: 'Filter Design', icon: '🔍', path: '/concrete/design/design-filter.html' }
            ],
            clients: [
                { id: 'client-projects', name: 'Projects', icon: '📋', path: '/concrete/client/client-projects.html' },
                { id: 'client-reports', name: 'Reports', icon: '📄', path: '/concrete/client/client-reports.html' },
                { id: 'client-team', name: 'Team', icon: '👥', path: '/concrete/client/client-team.html' },
                { id: 'client-equipment', name: 'Equipment', icon: '🔧', path: '/concrete/client/client-equipment.html' },
                { id: 'client-schedule', name: 'Schedule', icon: '📅', path: '/concrete/client/client-schedule.html' },
                { id: 'client-analytics', name: 'Analytics', icon: '📊', path: '/concrete/client/client-analytics.html' }
            ]
        },
        {
            id: 'asphalt',
            name: 'Asphalt Testing',
            nameAr: 'اختبارات الإسفلت',
            icon: '🛤️',
            color: '#3b82f6',
            path: '/asphalt/',
            tests: [
                { id: 'asphalt-marshall', name: 'Marshall Stability', nameAr: 'استقرار مارشال', icon: '🔨', path: '/asphalt/tests/test-marshall.html', standard: 'AASHTO T 245', status: 'active' },
                { id: 'asphalt-flow', name: 'Flow Test', nameAr: 'اختبار التدفق', icon: '🌊', path: '/asphalt/tests/test-flow.html', standard: 'AASHTO T 245', status: 'active' },
                { id: 'asphalt-density', name: 'Density Test', nameAr: 'اختبار الكثافة', icon: '⚖️', path: '/asphalt/tests/test-density.html', standard: 'AASHTO T 166', status: 'active' },
                { id: 'asphalt-extraction', name: 'Extraction', nameAr: 'الاستخلاص', icon: '🧪', path: '/asphalt/tests/test-extraction.html', standard: 'AASHTO T 164', status: 'active' },
                { id: 'asphalt-ignition', name: 'Ignition', nameAr: 'الاشتعال', icon: '🔥', path: '/asphalt/tests/test-ignition.html', standard: 'AASHTO T 308', status: 'active' },
                { id: 'asphalt-gradation', name: 'Gradation', nameAr: 'التدريج', icon: '📊', path: '/asphalt/tests/test-gradation.html', standard: 'AASHTO T 27', status: 'active' }
            ],
            designs: [
                { id: 'asphalt-design-mix', name: 'Mix Design', icon: '🧪', path: '/asphalt/design/design-mix.html' },
                { id: 'asphalt-design-gradation', name: 'Gradation Chart', icon: '📈', path: '/asphalt/design/design-gradation.html' },
                { id: 'asphalt-design-stability', name: 'Stability Analysis', icon: '📊', path: '/asphalt/design/design-stability.html' },
                { id: 'asphalt-design-temperature', name: 'Temperature', icon: '🌡️', path: '/asphalt/design/design-temperature.html' },
                { id: 'asphalt-design-equipment', name: 'Equipment', icon: '🔧', path: '/asphalt/design/design-equipment.html' },
                { id: 'asphalt-design-layerthickness', name: 'Layer Thickness', icon: '📐', path: '/asphalt/design/design-layerthickness.html' },
                { id: 'asphalt-design-specimen', name: 'Specimen', icon: '🧱', path: '/asphalt/design/design-specimen.html' },
                { id: 'asphalt-design-guideline', name: 'Guidelines', icon: '📖', path: '/asphalt/design/design-guideline.html' },
                { id: 'asphalt-design-yourmix', name: 'Your Mix', icon: '🎛️', path: '/asphalt/design/design-yourmix.html' }
            ],
            clients: [
                { id: 'asphalt-client-projects', name: 'Projects', icon: '📋', path: '/asphalt/client/client-projects.html' },
                { id: 'asphalt-client-reports', name: 'Reports', icon: '📄', path: '/asphalt/client/client-reports.html' },
                { id: 'asphalt-client-team', name: 'Team', icon: '👥', path: '/asphalt/client/client-team.html' },
                { id: 'asphalt-client-equipment', name: 'Equipment', icon: '🔧', path: '/asphalt/client/client-equipment.html' },
                { id: 'asphalt-client-schedule', name: 'Schedule', icon: '📅', path: '/asphalt/client/client-schedule.html' },
                { id: 'asphalt-client-analytics', name: 'Analytics', icon: '📊', path: '/asphalt/client/client-analytics.html' }
            ]
        },
        {
            id: 'soil',
            name: 'Soil Testing',
            nameAr: 'اختبارات التربة',
            icon: '🌍',
            color: '#10b981',
            path: '/soil/',
            tests: [
                { id: 'soil-proctor', name: 'Proctor Test', nameAr: 'اختبار بروكتور', icon: '🔨', path: '/soil/tests/test-proctor.html', standard: 'ASTM D698', status: 'active' },
                { id: 'soil-plasticity', name: 'Plasticity Index', nameAr: 'مؤشر اللدونة', icon: '💧', path: '/soil/tests/test-plasticity.html', standard: 'ASTM D4318', status: 'active' },
                { id: 'soil-density', name: 'Field Density', nameAr: 'الكثافة الميدانية', icon: '⚖️', path: '/soil/tests/test-density.html', standard: 'ASTM D1556', status: 'active' },
                { id: 'soil-cbr', name: 'CBR Test', nameAr: 'اختبار CBR', icon: '🏗️', path: '/soil/tests/test-cbr.html', standard: 'ASTM D1883', status: 'active' },
                { id: 'soil-limits', name: 'Atterberg Limits', nameAr: 'حدود أتربرج', icon: '🔬', path: '/soil/tests/test-limits.html', standard: 'ASTM D4318', status: 'active' },
                { id: 'soil-specific', name: 'Specific Gravity', nameAr: 'الوزن النوعي', icon: '🌡️', path: '/soil/tests/test-specific.html', standard: 'ASTM D854', status: 'active' },
                { id: 'soil-moisture', name: 'Moisture Content', nameAr: 'المحتوى المائي', icon: '💧', path: '/soil/tests/test-moisture.html', standard: 'ASTM D2216', status: 'active' },
                { id: 'soil-grain', name: 'Grain Size', nameAr: 'حجم الحبيبات', icon: '📊', path: '/soil/tests/test-grain.html', standard: 'ASTM D6913', status: 'active' }
            ],
            designs: [
                { id: 'soil-design-classification', name: 'Classification', icon: '📋', path: '/soil/design/design-classification.html' },
                { id: 'soil-design-compaction', name: 'Compaction', icon: '🔨', path: '/soil/design/design-compaction.html' },
                { id: 'soil-design-gradation', name: 'Gradation', icon: '📈', path: '/soil/design/design-gradation.html' },
                { id: 'soil-design-pavement', name: 'Pavement Design', icon: '🛣️', path: '/soil/design/design-pavement.html' }
            ],
            clients: [
                { id: 'soil-client-projects', name: 'Projects', icon: '📋', path: '/soil/client/client-projects.html' },
                { id: 'soil-client-reports', name: 'Reports', icon: '📄', path: '/soil/client/client-reports.html' },
                { id: 'soil-client-team', name: 'Team', icon: '👥', path: '/soil/client/client-team.html' },
                { id: 'soil-client-equipment', name: 'Equipment', icon: '🔧', path: '/soil/client/client-equipment.html' },
                { id: 'soil-client-schedule', name: 'Schedule', icon: '📅', path: '/soil/client/client-schedule.html' },
                { id: 'soil-client-analytics', name: 'Analytics', icon: '📊', path: '/soil/client/client-analytics.html' }
            ]
        },
        {
            id: 'dashboard',
            name: 'Dashboard',
            nameAr: 'لوحة المعلومات',
            icon: '📊',
            color: '#a855f7',
            path: '/dashboard/',
            tests: [],
            designs: [],
            clients: [
                { id: 'dash-lab-stats', name: 'Lab Stats', icon: '📊', path: '/dashboard/lab-stats.html' },
                { id: 'dash-qr-tracking', name: 'QR Tracking', icon: '📱', path: '/dashboard/qr-tracking.html' },
                { id: 'dash-break-schedule', name: 'Break Schedule', icon: '📅', path: '/dashboard/break-schedule.html' }
            ]
        }
    ]
};
