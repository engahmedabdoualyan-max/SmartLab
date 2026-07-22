/*
 * SmartLAP — CBR (California Bearing Ratio) Test Firmware
 * =======================================================
 * Board:      Arduino Uno / Nano
 * Sensors:    HX711 Load Cell + HC-SR04 Ultrasonic + Linear Actuator
 * Protocol:   SmartLAP Serial CSV
 * Format:     penetration_mm,load_newtons\n
 * Wiring:
 *   HX711  DT  → D3        HX711  SCK → D2
 *   HC-SR04 TRIG → D9       HC-SR04 ECHO → D10
 *   Motor  IN1 → D5         IN2 → D6      ENA → D7 (PWM)
 *   HX711  VCC → 5V        GND → GND
 *
 * Commands:   START / STOP / TARE / STATUS
 * Calibration: Adjust CALIBRATION_FACTOR and ACTUATOR_SPEED for your setup
 */
#include "HX711.h"

#define HX711_DT    3
#define HX711_SCK   2
#define TRIG_PIN    9
#define ECHO_PIN   10
#define MOTOR_IN1   5
#define MOTOR_IN2   6
#define MOTOR_ENA   7
#define CALIBRATION_FACTOR 420.0
#define ACTUATOR_SPEED 150
#define MAX_PENETRATION_MM 12.5

HX711 scale;
bool testing = false;

void setup() {
    Serial.begin(9600);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(MOTOR_IN1, OUTPUT);
    pinMode(MOTOR_IN2, OUTPUT);
    pinMode(MOTOR_ENA, OUTPUT);
    scale.begin(HX711_DT, HX711_SCK);
    scale.set_scale(CALIBRATION_FACTOR);
    scale.tare();
    stopMotor();
    Serial.println("SmartLAP:READY");
}

float readDistanceCM() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);
    if (duration == 0) return -1;
    return (duration * 0.0343) / 2.0;
}

float readForceNewtons() {
    if (!scale.is_ready()) return -1;
    float kg = scale.get_units(1);
    if (isnan(kg)) return -1;
    if (kg < 0) kg = 0;
    return round(kg * 9.81 * 100.0) / 100.0;
}

void runMotor() {
    digitalWrite(MOTOR_IN1, HIGH);
    digitalWrite(MOTOR_IN2, LOW);
    analogWrite(MOTOR_ENA, ACTUATOR_SPEED);
}

void stopMotor() {
    digitalWrite(MOTOR_IN1, LOW);
    digitalWrite(MOTOR_IN2, LOW);
    analogWrite(MOTOR_ENA, 0);
}

float initialDistance = -1;

void handleCommand(String cmd) {
    cmd.trim();
    cmd.toUpperCase();
    if (cmd == "START") {
        initialDistance = readDistanceCM();
        testing = true;
        runMotor();
        Serial.println("SmartLAP:STARTED");
    } else if (cmd == "STOP") {
        testing = false;
        stopMotor();
        Serial.println("SmartLAP:STOPPED");
    } else if (cmd == "TARE") {
        scale.tare();
        Serial.println("SmartLAP:TARED");
    } else if (cmd == "STATUS") {
        Serial.println(testing ? "SmartLAP:TESTING" : "SmartLAP:IDLE");
    }
}

void loop() {
    if (Serial.available()) {
        String cmd = Serial.readStringUntil('\n');
        handleCommand(cmd);
    }
    if (testing) {
        float dist = readDistanceCM();
        if (dist < 0 || initialDistance < 0) return;
        float penetration = initialDistance - dist;
        if (penetration < 0) penetration = 0;
        if (penetration > MAX_PENETRATION_MM) {
            testing = false;
            stopMotor();
            Serial.println("SmartLAP:STOPPED");
            return;
        }
        float force = readForceNewtons();
        if (force >= 0) {
            Serial.print(penetration, 2);
            Serial.print(",");
            Serial.println(force, 2);
        }
        delay(500);
    }
}
