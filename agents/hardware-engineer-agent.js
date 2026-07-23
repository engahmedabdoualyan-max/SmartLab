/*!
 * SmartLab Hardware Engineer Agent
 * Specializes in Arduino/ESP32 firmware, sensor integration, PCB design, Web Serial
 */

class HardwareEngineerAgent {
    constructor() {
        this.name = 'hardware-engineer';
        this.role = 'Hardware Engineer';
        this.priority = 1;
        this.system = null;
    }

    receiveMessage(message) {
        console.log(`[HW] Received: ${message.type} from ${message.from}`);
        if (message.type === 'task') this.executeTask(message.payload);
    }

    executeTask(task) {
        switch (task.type) {
            case 'review-firmware':
                this.reviewFirmware(task);
                break;
            case 'calibration-procedure':
                this.createCalibrationProcedure(task);
                break;
            case 'sensor-integration':
                this.designSensorIntegration(task);
                break;
            case 'circuit-design':
                this.designCircuit(task);
                break;
            default:
                console.log(`[HW] Unknown task type: ${task.type}`);
        }
    }

    reviewFirmware(task) {
        const firmwareDir = './firmware';
        const fs = require('fs');
        const files = fs.readdirSync(firmwareDir).filter(f => f.endsWith('.ino'));
        console.log(`[HW] Reviewing ${files.length} firmware files...`);
        files.forEach(file => {
            const content = fs.readFileSync(`${firmwareDir}/${file}`, 'utf8');
            const lines = content.split('\n').length;
            console.log(`[HW]   ${file}: ${lines} lines — ${content.includes('HX711') ? 'HX711 ✓' : 'No HX711'}`);
        });
    }

    createCalibrationProcedure(task) {
        return {
            title: 'Load Cell Calibration Procedure',
            steps: [
                '1. Connect HX711 to Arduino (DT→GPIO3, SCK→GPIO2)',
                '2. Upload calibration sketch from firmware/',
                '3. Place known weight (e.g. 5kg) on load cell',
                '4. Read raw value from Serial Monitor',
                '5. Calculate calibration factor: factor = raw / known_weight',
                '6. Update CALIBRATION_FACTOR in firmware .ino file',
                '7. Re-upload and verify reading matches known weight'
            ],
            standards: 'ASTM E74 — Force Calibration Standards'
        };
    }

    designSensorIntegration(task) {
        const configs = {
            'HX711': { pins: 'DT→GPIO3, SCK→GPIO2', vcc: '5V', library: 'HX711 Arduino Library' },
            'DS18B20': { pins: 'DQ→GPIO4 (with 4.7kΩ pull-up)', vcc: '3.3-5V', library: 'OneWire + DallasTemperature' },
            'HC-SR04': { pins: 'Trig→GPIO5, Echo→GPIO6', vcc: '5V', library: 'NewPing' },
            'Capacitive Moisture': { pins: 'A0→GPIO34 (ADC)', vcc: '3.3V', library: 'Analog read' }
        };
        return configs[task.sensor] || configs;
    }

    designCircuit(task) {
        return {
            schematic: task.description || 'General purpose',
            notes: 'Use 0.1μF bypass capacitor near each IC. Keep analog traces short. Use twisted pair for load cell wires.',
            pcb: 'Recommend 2-layer PCB with ground plane. FR4 material, 1.6mm thickness.'
        };
    }

    async run() {
        console.log('[HW] Hardware Engineer Agent ready');
        console.log('[HW] Specialties: Arduino/ESP32, HX711, sensors, PCB, Web Serial');
    }
}

module.exports = HardwareEngineerAgent;
