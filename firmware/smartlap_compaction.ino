/*
 * SmartLAP — Compaction Test Firmware
 * ====================================
 * Board:      Arduino Uno / Nano
 * Sensors:    HX711 Load Cell (force) + Capacitive Soil Moisture v1.2
 * Protocol:   SmartLAP Serial CSV
 * Format:     moisture_pct,force_newtons\n
 * Wiring:
 *   HX711  DT  → D3        HX711  SCK → D2
 *   HX711  VCC → 5V        HX711  GND → GND
 *   Moisture AOUT → A0      Moisture VCC → 5V   GND → GND
 *
 * Commands:   START / STOP / TARE / STATUS
 * Calibration: Adjust MOISTURE_DRY and MOISTURE_WET for your sensor
 */
#include "HX711.h"

#define HX711_DT    3
#define HX711_SCK   2
#define MOISTURE_PIN A0
#define CALIBRATION_FACTOR 420.0
#define MOISTURE_DRY  520
#define MOISTURE_WET  260

HX711 scale;
bool testing = false;
bool tared = false;

void setup() {
    Serial.begin(9600);
    scale.begin(HX711_DT, HX711_SCK);
    scale.set_scale(CALIBRATION_FACTOR);
    scale.tare();
    Serial.println("SmartLAP:READY");
}

float readMoisturePercent() {
    int raw = analogRead(MOISTURE_PIN);
    if (raw < 0 || raw > 1023) return -1;
    float pct = map(raw, MOISTURE_WET, MOISTURE_DRY, 100, 0);
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    return round(pct * 10.0) / 10.0;
}

float readForceNewtons() {
    if (!scale.is_ready()) return -1;
    float kg = scale.get_units(1);
    if (isnan(kg)) return -1;
    if (kg < 0) kg = 0;
    return round(kg * 9.81 * 100.0) / 100.0;
}

void handleCommand(String cmd) {
    cmd.trim();
    cmd.toUpperCase();
    if (cmd == "START") { testing = true; Serial.println("SmartLAP:STARTED"); }
    else if (cmd == "STOP") { testing = false; Serial.println("SmartLAP:STOPPED"); }
    else if (cmd == "TARE") { scale.tare(); tared = true; Serial.println("SmartLAP:TARED"); }
    else if (cmd == "STATUS") { Serial.println(testing ? "SmartLAP:TESTING" : "SmartLAP:IDLE"); }
}

void loop() {
    if (Serial.available()) {
        String cmd = Serial.readStringUntil('\n');
        handleCommand(cmd);
    }
    if (testing) {
        float moisture = readMoisturePercent();
        float force = readForceNewtons();
        if (moisture >= 0 && force >= 0) {
            Serial.print(moisture, 1);
            Serial.print(",");
            Serial.println(force, 2);
        }
        delay(800);
    }
}
