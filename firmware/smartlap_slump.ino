/*
 * SmartLab — Digital Slump Test Firmware
 * =======================================
 * Board:      Arduino Uno / Nano
 * Sensors:    HC-SR04 Ultrasonic Distance
 * Protocol:   SmartLab Serial CSV
 * Format:     distance_cm\n
 * Wiring:
 *   HC-SR04 TRIG → D9       ECHO → D10
 *   VCC → 5V                GND → GND
 *
 * Commands:   START / STOP / TARE / STATUS
 * Calibration: Mount sensor 30.5cm above mold base (standard cone height)
 */
#define TRIG_PIN  9
#define ECHO_PIN 10
#define MOLD_HEIGHT_CM 30.5

bool testing = false;
float offsetCM = 0;

void setup() {
    Serial.begin(9600);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    Serial.println("SmartLab:READY");
}

float readDistanceCM() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);
    if (duration == 0) return -1;
    float dist = (duration * 0.0343) / 2.0;
    return round(dist * 10.0) / 10.0;
}

void handleCommand(String cmd) {
    cmd.trim();
    cmd.toUpperCase();
    if (cmd == "START") {
        testing = true;
        Serial.println("SmartLab:STARTED");
    } else if (cmd == "STOP") {
        testing = false;
        Serial.println("SmartLab:STOPPED");
    } else if (cmd == "TARE") {
        float d = readDistanceCM();
        if (d > 0) offsetCM = d;
        Serial.println("SmartLab:TARED");
    } else if (cmd == "STATUS") {
        Serial.println(testing ? "SmartLab:TESTING" : "SmartLab:IDLE");
    }
}

void loop() {
    if (Serial.available()) {
        String cmd = Serial.readStringUntil('\n');
        handleCommand(cmd);
    }
    if (testing) {
        float dist = readDistanceCM();
        if (dist > 0) {
            float corrected = dist - offsetCM;
            if (corrected < 0) corrected = 0;
            Serial.println(corrected, 1);
        }
        delay(500);
    }
}
