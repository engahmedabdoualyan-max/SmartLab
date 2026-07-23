/*
 * SmartLab — Bitumen Photo-Tester Firmware
 * =========================================
 * Board:      Arduino Uno / Nano
 * Sensors:    BH1750 Light Intensity (I2C)
 * Protocol:   SmartLab Serial CSV
 * Format:     light_lux,transmission_pct,purity_index\n
 * Wiring:
 *   BH1750 SDA → A4        SCL → A5
 *   VCC → 3.3V             GND → GND
 *   ADDR → GND (I2C 0x23)
 *
 * Commands:   START / STOP / TARE / STATUS
 * Calibration: Set REFERENCE_LUX to clean-air reading for 100% transmission
 */
#include <Wire.h>

#define BH1750_ADDR     0x23
#define REFERENCE_LUX   1000.0
#define READ_INTERVAL_MS 500

bool testing = false;
float baselineLux = -1;
unsigned long lastRead = 0;

void setup() {
    Serial.begin(9600);
    Wire.begin();
    Wire.beginTransmission(BH1750_ADDR);
    Wire.write(0x10);
    Wire.endTransmission();
    delay(200);
    Serial.println("SmartLab:READY");
}

float readLightLux() {
    Wire.requestFrom(BH1750_ADDR, 2);
    if (Wire.available() == 2) {
        byte msb = Wire.read();
        byte lsb = Wire.read();
        float lux = ((msb << 8) | lsb) / 1.2;
        return round(lux * 10.0) / 10.0;
    }
    return -1;
}

void handleCommand(String cmd) {
    cmd.trim();
    cmd.toUpperCase();
    if (cmd == "START") {
        testing = true;
        lastRead = millis();
        Serial.println("SmartLab:STARTED");
    } else if (cmd == "STOP") {
        testing = false;
        Serial.println("SmartLab:STOPPED");
    } else if (cmd == "TARE") {
        baselineLux = readLightLux();
        if (baselineLux < 0) baselineLux = REFERENCE_LUX;
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
        unsigned long now = millis();
        if (now - lastRead >= READ_INTERVAL_MS) {
            lastRead = now;
            float lux = readLightLux();
            if (lux < 0) return;
            float ref = (baselineLux > 0) ? baselineLux : REFERENCE_LUX;
            float trans = (lux / ref) * 100.0;
            if (trans > 100) trans = 100;
            if (trans < 0) trans = 0;
            int purity = constrain(map((int)lux, 0, (int)ref, 0, 100), 0, 100);
            Serial.print(lux, 1);
            Serial.print(",");
            Serial.print(trans, 2);
            Serial.print(",");
            Serial.println(purity);
        }
    }
}
