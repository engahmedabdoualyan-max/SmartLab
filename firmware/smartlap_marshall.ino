/*
 * SmartLab — Digital Marshall Test Firmware
 * ==========================================
 * Board:      Arduino Uno / Nano
 * Sensors:    HX711 Load Cell (stability) + LVDT Displacement (flow)
 * Protocol:   SmartLab Serial CSV
 * Format:     load_newtons,displacement_mm,flow_units\n
 * Wiring:
 *   HX711  DT  → D3        HX711  SCK → D2
 *   LVDT   AOUT → A0 (0-5V analog → 0-25mm)
 *   HX711  VCC → 5V        GND → GND
 *
 * Commands:   START / STOP / TARE / STATUS
 * Calibration: Adjust CALIBRATION_FACTOR and LVDT_RANGE_MM for your sensors
 */
#include "HX711.h"

#define HX711_DT      3
#define HX711_SCK     2
#define LVDT_PIN      A0
#define LVDT_RANGE_MM 25.0
#define CALIBRATION_FACTOR 420.0

HX711 scale;
bool testing = false;

void setup() {
    Serial.begin(9600);
    scale.begin(HX711_DT, HX711_SCK);
    scale.set_scale(CALIBRATION_FACTOR);
    scale.tare();
    Serial.println("SmartLab:READY");
}

float readLoadNewtons() {
    if (!scale.is_ready()) return -1;
    float kg = scale.get_units(1);
    if (isnan(kg)) return -1;
    if (kg < 0) kg = 0;
    return round(kg * 9.81 * 100.0) / 100.0;
}

float readDisplacementMM() {
    int raw = analogRead(LVDT_PIN);
    if (raw < 0 || raw > 1023) return -1;
    float mm = (raw / 1023.0) * LVDT_RANGE_MM;
    return round(mm * 1000.0) / 1000.0;
}

float calcFlowUnits(float dispMM) {
    return round(dispMM / 0.25);
}

void handleCommand(String cmd) {
    cmd.trim();
    cmd.toUpperCase();
    if (cmd == "START") {
        testing = true;
        scale.tare();
        Serial.println("SmartLab:STARTED");
    } else if (cmd == "STOP") {
        testing = false;
        Serial.println("SmartLab:STOPPED");
    } else if (cmd == "TARE") {
        scale.tare();
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
        float load = readLoadNewtons();
        float disp = readDisplacementMM();
        if (load >= 0 && disp >= 0) {
            float flow = calcFlowUnits(disp);
            Serial.print(load, 2);
            Serial.print(",");
            Serial.print(disp, 3);
            Serial.print(",");
            Serial.println(flow, 0);
        }
        delay(100);
    }
}
