/*
 * SmartLab — Straightedge (Road Roughness) Test Firmware
 * ======================================================
 * Board:      Arduino Uno / Nano
 * Sensors:    MPU6050 IMU (I2C) + VL53L0X Laser Distance + Rotary Encoder
 * Protocol:   SmartLab Serial CSV
 * Format:     position_m,irregularity_mm,inclination_deg\n
 * Wiring:
 *   MPU6050 SDA → A4        SCL → A5
 *   VL53L0X  SDA → A4       SCL → A5 (shared I2C, different address)
 *   Encoder  A → D2 (INT0)  B → D3 (INT1)
 *   VCC → 3.3V              GND → GND
 *
 * Commands:   START / STOP / TARE / STATUS
 * Calibration: Adjust ENCODER_PPR and STRAIGHTEDGE_LENGTH_M for your setup
 */
#include <Wire.h>
#include <MPU6050_tockn.h>

#define ENCODER_A     2
#define ENCODER_B     3
#define ENCODER_PPR   600
#define STRAIGHTEDGE_LENGTH_M 3.0

MPU6050 mpu(Wire);

volatile long encoderCount = 0;
bool testing = false;
float offsetIrregularity = 0;

void encoderISR() {
    if (digitalRead(ENCODER_B)) encoderCount++;
    else encoderCount--;
}

void setup() {
    Serial.begin(9600);
    Wire.begin();
    mpu.begin();
    mpu.calcGyroOffsets(true);
    pinMode(ENCODER_A, INPUT_PULLUP);
    pinMode(ENCODER_B, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(ENCODER_A), encoderISR, RISING);
    Serial.println("SmartLab:READY");
}

float getPositionM() {
    return (float)encoderCount / ENCODER_PPR * 0.05;
}

float getIrregularityMM() {
    mpu.update();
    float accelZ = mpu.getAccelZ();
    float angle = asin(constrain(accelZ, -1.0, 1.0)) * 180.0 / PI;
    float irregularity = angle * STRAIGHTEDGE_LENGTH_M * 1000.0 / 9.81;
    return round((irregularity - offsetIrregularity) * 10.0) / 10.0;
}

float getInclinationDeg() {
    mpu.update();
    return round(mpu.getAngleX() * 100.0) / 100.0;
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
        mpu.update();
        offsetIrregularity = getIrregularityMM();
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
        float pos = getPositionM();
        float irreg = getIrregularityMM();
        float incl = getInclinationDeg();
        if (!isnan(irreg) && !isnan(incl)) {
            Serial.print(pos, 2);
            Serial.print(",");
            Serial.print(irreg, 1);
            Serial.print(",");
            Serial.println(incl, 2);
        }
        delay(500);
    }
}
