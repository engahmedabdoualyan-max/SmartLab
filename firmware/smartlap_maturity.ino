/*
 * SmartLAP — Concrete Maturity Sensor Firmware
 * =============================================
 * Board:      Arduino Uno / Nano
 * Sensors:    DS18B20 Digital Temperature (OneWire)
 * Protocol:   SmartLAP Serial CSV
 * Format:     temperature_celsius\n
 * Wiring:
 *   DS18B20 DATA → D2 (with 4.7kΩ pull-up to VCC)
 *   VCC → 3.3V or 5V       GND → GND
 *
 * Commands:   START / STOP / TARE / STATUS
 * Note:       Maturity index (°C·h) and strength are calculated in browser JS
 *             using Nurse-Saul function: M = Σ(T + T₀) × Δt
 */
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 2
#define READ_INTERVAL_MS 5000

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

bool testing = false;
unsigned long lastRead = 0;

void setup() {
    Serial.begin(9600);
    sensors.begin();
    int count = sensors.getDeviceCount();
    Serial.println("SmartLAP:READY");
}

float readTemperatureC() {
    sensors.requestTemperatures();
    float temp = sensors.getTempCByIndex(0);
    if (temp == DEVICE_DISCONNECTED_C || temp < -55 || temp > 125) return -999;
    return round(temp * 100.0) / 100.0;
}

void handleCommand(String cmd) {
    cmd.trim();
    cmd.toUpperCase();
    if (cmd == "START") {
        testing = true;
        lastRead = millis();
        Serial.println("SmartLAP:STARTED");
    } else if (cmd == "STOP") {
        testing = false;
        Serial.println("SmartLAP:STOPPED");
    } else if (cmd == "TARE") {
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
        unsigned long now = millis();
        if (now - lastRead >= READ_INTERVAL_MS) {
            lastRead = now;
            float temp = readTemperatureC();
            if (temp > -900) {
                Serial.println(temp, 2);
            }
        }
    }
}
