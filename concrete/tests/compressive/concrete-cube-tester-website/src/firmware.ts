export const LCD_CODE = `/*
  Concrete Cube Crushing Tester - LCD Version
  Board: Arduino Uno
  Sensor: Industrial Load Cell + HX711
  Display: LCD 16x2 I2C
  Cube Size: 150 x 150 mm
*/

#include <HX711.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define DT_PIN      3
#define SCK_PIN     2
#define TARE_PIN    4
#define BUZZER_PIN  5

HX711 scale;
LiquidCrystal_I2C lcd(0x27, 16, 2);

float calibration_factor = 450.0; // Change after calibration
float cubeArea_mm2 = 22500.0;     // 150 x 150 mm cube

float load_kg = 0;
float load_kN = 0;
float stress_MPa = 0;
float peak_kN = 0;

bool crushed = false;

void setup() {
  pinMode(TARE_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);

  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Concrete Tester");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");

  scale.begin(DT_PIN, SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare();

  delay(2000);
  lcd.clear();
}

void loop() {
  if (digitalRead(TARE_PIN) == LOW) {
    scale.tare();
    peak_kN = 0;
    crushed = false;

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Tare Done");
    lcd.setCursor(0, 1);
    lcd.print("Ready");
    delay(1000);
    lcd.clear();
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

    // Detect crushing: load drops below 85% of peak after minimum peak threshold
    if (peak_kN > 20.0 && load_kN < (peak_kN * 0.85)) {
      crushed = true;

      digitalWrite(BUZZER_PIN, HIGH);
      delay(1500);
      digitalWrite(BUZZER_PIN, LOW);
    }

    lcd.setCursor(0, 0);
    lcd.print("F:");
    lcd.print(load_kN, 1);
    lcd.print("kN ");
    lcd.print("P:");
    lcd.print(peak_kN, 1);
    lcd.print(" ");

    lcd.setCursor(0, 1);
    lcd.print("S:");
    lcd.print(stress_MPa, 1);
    lcd.print("MPa       ");
  }
  else {
    lcd.setCursor(0, 0);
    lcd.print("--- CRUSHED --- ");
    lcd.setCursor(0, 1);
    lcd.print("Max:");
    lcd.print(peak_kN, 1);
    lcd.print(" kN     ");
  }

  delay(200);
}
`;

export const SERIAL_CODE = `/*
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
`;
