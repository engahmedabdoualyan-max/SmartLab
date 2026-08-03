/*
  Concrete Cube Crushing Tester - Serial Version
  Board: Arduino Uno
  Sensor: Industrial Load Cell + HX711
  Output: CSV over Serial Monitor
  Cube Size: 150 x 150 mm
*/

#include <HX711.h>

#define DT_PIN    3
#define SCK_PIN   2
#define TARE_PIN  4

HX711 scale;

float calibration_factor = 450.0; // Change after calibration
float cubeArea_mm2 = 22500.0;     // 150 x 150 mm cube

float load_kg = 0;
float load_kN = 0;
float stress_MPa = 0;
float peak_kN = 0;

bool crushed = false;
unsigned long startTime = 0;

void setup() {
  Serial.begin(9600);

  pinMode(TARE_PIN, INPUT_PULLUP);

  scale.begin(DT_PIN, SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare();

  startTime = millis();

  Serial.println("Concrete Cube Crushing Tester");
  Serial.println("Serial CSV Version");
  Serial.println("Press Tare Button to start new test");
  Serial.println("Time(s),Force(kN),Stress(MPa),Peak(kN)");
}

void loop() {
  if (digitalRead(TARE_PIN) == LOW) {
    scale.tare();
    peak_kN = 0;
    crushed = false;
    startTime = millis();

    Serial.println("NEW TEST");
    Serial.println("Time(s),Force(kN),Stress(MPa),Peak(kN)");
    delay(500);
  }

  if (!crushed) {
    load_kg = scale.get_units(10);

    if (load_kg < 0) {
      load_kg = 0;
    }

    load_kN = load_kg * 0.00980665;
    stress_MPa = (load_kN * 1000.0) / cubeArea_mm2;

    if (load_kN > peak_kN) {
      peak_kN = load_kN;
    }

    float timeSec = (millis() - startTime) / 1000.0;

    Serial.print(timeSec, 2);
    Serial.print(",");
    Serial.print(load_kN, 2);
    Serial.print(",");
    Serial.print(stress_MPa, 2);
    Serial.print(",");
    Serial.println(peak_kN, 2);

    // Detect crushing
    if (peak_kN > 20.0 && load_kN < (peak_kN * 0.85)) {
      crushed = true;
      Serial.println("CUBE CRUSHED");
      Serial.print("Peak Load Recorded: ");
      Serial.print(peak_kN, 2);
      Serial.println(" kN");
    }
  }

  delay(100);
}
