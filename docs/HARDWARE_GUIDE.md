# دليل الأجهزة الشامل — SmartLab Hardware Guide
**الإصدار:** v1.1.6 | **التاريخ:** 2026-07-23

---

## فهرس المحتويات
1. [نظرة عامة على النظام](#1-نظرة-عامة-على-النظام)
2. [لوحة التوصيل المركزي (Backplane)](#2-لوحة-التوصيل-المركزي-backplane)
3. [اختبار الدمك (Compaction Proctor)](#3-اختبار-الدمك-compaction-proctor)
4. [اختبار CBR](#4-اختبار-cbr)
5. [اختبار المسطرة (Straightedge)](#5-اختبار-المسطرة-straightedge)
6. [اختبار الهبوط (Slump)](#6-اختبار-الهبوط-slump)
7. [اختبار النضج (Maturity)](#7-اختبار-النضج-maturity)
8. [اختبار مارشال (Marshall Stability)](#8-اختبار-مارشال-marshall-stability)
9. [اختبار البيتومين (Bitumen Photo-Tester)](#9-اختبار-البيتومين-bitumen-photo-tester)
10. [بروتوكول الاتصال (Serial CSV Protocol)](#10-بروتوكول-الاتصال-serial-csv-protocol)
11. [المعايرة (Calibration)](#11-المعايرة-calibration)
12. [قطع الغيار والمكونات](#12-قطع-الغيار-والمكونات)
13. [الترقية إلى ESP32](#13-الترقية-إلى-esp32)

---

## 1. نظرة عامة على النظام

### 1.1 العمارة
```
[ Sensor ] → [ Conditioning ] → [ Arduino/ESP32 MCU ] → [ Serial CSV ]
                                                             ↓
                                                     [ Browser ]
                                                (Web Serial API /
                                                 WebSocket / BLE)
                                                      ↓
                                               [ Firestore DB ]
```

### 1.2 البروتوكول
جميع الأجهزة تتحدث **CSV عبر Serial** بمعدل **9600 baud** (8N1). كل سطر هو قراءة:
- الأمر `START` يبدأ القراءات
- الأمر `STOP` يوقف القراءات
- الأمر `TARE` يصفر الحساس (load cell)
- الأمر `STATUS` يعيد `SmartLab:READY`

### 1.3 لوحة Arduino Uno Pinout المرجعية
```
                    ┌─────────────────────┐
                    │                     │
     RX     ┌───────┤ D0              A5  ├────── SCL (I2C)
     TX     ┌───────┤ D1              A4  ├────── SDA (I2C)
            │       │                     │
   HX711 DT├───────┤ D2              A3  │
   HX711 SCK┌──────┤ D3              A2  │
            │       │                     │
     ENC A ├───────┤ D4              A1  │
  Motor IN1├───────┤ D5              A0  ├────── Analog IN
  Motor IN2├───────┤ D6                  │
  Motor ENA├───────┤ D7              5V  ├────── 5V
            │       │                 3.3V├────── 3.3V
   HC-SR04 ├───────┤ D8              GND ├────── GND
   HC-SR04 ├───────┤ D9              Vin ├────── 7-12V
            │       │ D10                 │
DS18B20 DATA├───────┤ D11                 │
            │       │ D12                 │
            └───────┤ D13 (LED)           │
                    └─────────────────────┘
```

---

## 2. لوحة التوصيل المركزي (Backplane)

### 2.1 منافذ الـ PCB المقترحة
```
┌────────────────────────────────────────────────────────────┐
│                   SmartLab Backplane v1                    │
├────────────┬───────────────────────────────────────────────┤
│  Power In  │  24V DC (Mean Well HDR-30-24)                │
├────────────┼───────────────────────────────────────────────┤
│  Buck 5V   │  LM2596 → 5V @ 3A (لـ Arduino + HX711)      │
├────────────┼───────────────────────────────────────────────┤
│  LDO 3.3V  │  AMS1117-3.3 @ 1A (لـ MPU6050, BH1750)      │
├────────────┼───────────────────────────────────────────────┤
│  HX711 x2  │  منفذين HX711 (Compaction, CBR, Marshall)    │
├────────────┼───────────────────────────────────────────────┤
│  ADS1115   │  16-bit ADC (لـ LVDT, moisture sensor)       │
├────────────┼───────────────────────────────────────────────┤
│  I2C Bus   │  SDA/SCL مع 4.7kΩ pull-up + BSS138 level     │
├────────────┼───────────────────────────────────────────────┤
│  DS18B20   │  OneWire مع 4.7kΩ pull-up                    │
├────────────┼───────────────────────────────────────────────┤
│  Motor Drv │  L298N / DRV8825 (لـ CBR, Marshall)          │
├────────────┼───────────────────────────────────────────────┤
│  HC-SR04   │  2× منفذ TRIG/ECHO (CBR, Slump)             │
├────────────┼───────────────────────────────────────────────┤
│  Encoder   │  D2/D3 مع INPUT_PULLUP (Straightedge)        │
└────────────┴───────────────────────────────────────────────┘
```

### 2.2 التغذية (Power Distribution)
```
24V ──[LM2596]── 5V ──[AMS1117]── 3.3V
 │                 │                  │
 │          ┌──────┴──────┐    ┌──────┴──────┐
 │          │  HX711 VCC  │    │  MPU6050    │
 │          │  Arduino    │    │  VL53L0X    │
 │          │  HC-SR04    │    │  BH1750     │
 │          │  OLED       │    │  OLED (opt) │
 │          └─────────────┘    └─────────────┘
 │
[Mean Well HDR-30-24]
```
**ملاحظة:** مكثفات 100nF + 10μF عند كل نقطة تغذية.

---

## 3. اختبار الدمك (Compaction Proctor)

### 3.1 الغرض
قياس رطوبة التربة وقوة الدمك في اختبار Proctor القياسي (ASTM D698 / D1557).

### 3.2 الحساسات والمحركات
| المكون | الطراز | الكمية |
|--------|--------|--------|
| Load Cell 100 kN | ATO Low Profile Spoke Type | 1 |
| HX711 ADC (24-bit) | Avia HX711 breakout | 1 |
| Capacitive Moisture Sensor v1.2 | DFRobot SEN0193 | 1 |
| Arduino Uno/Nano | — | 1 |

### 3.3 دائرة التوصيل
```
                     ┌─────────────────────────┐
                     │      HX711 Module       │
                     │                         │
Load Cell ──RED──────┤ E+                     │
(100 kN)  ──BLACK────┤ E-      DOUT (DT) ──────┤ D3 (Arduino)
          ──WHITE────┤ A+      SCK       ──────┤ D2 (Arduino)
          ──GREEN────┤ A-      VCC       ──────┤ 5V
                     │         GND       ──────┤ GND
                     └─────────────────────────┘

Capacitive ──RED──────┤ VCC (5V)
Moisture   ──BLACK────┤ GND
Sensor     ──YELLOW────┤ AOUT ──────────────── A0 (Arduino)

                     ┌─────────────────────────┐
                     │      4.7kΩ              │
5V ──────────────────████──────┬────────────── DS18B20 (DATA)
                               │                D2 (اختياري لقياس
                               │                حرارة التربة)
                              ─┴─ GND
```

### 3.4 طريقة التوصيل خطوة بخطوة
1. **HX711 مع Load Cell:**
   - وصل RED (E+) ← HX711 E+  
   - وصل BLACK (E-) ← HX711 E-
   - وصل WHITE (A+) ← HX711 A+
   - وصل GREEN (A-) ← HX711 A-
   - HX711 VCC ← 5V, GND ← GND
   - HX711 DT ← Arduino D3
   - HX711 SCK ← Arduino D2

2. **Capacitive Moisture Sensor:**
   - أحمر ← 5V, أسود ← GND, أصفر ← A0

3. **تأريض مشترك:** جميع GND متصلة ببعض

### 3.5 المعايرة
```
CALIBRATION_FACTOR = 420.0   // يختلف حسب load cell
MOISTURE_DRY = 520           // قراءة ADC في الهواء الجاف
MOISTURE_WET = 260           // قراءة ADC مشبع بالماء
```

**معايرة الـ Load Cell:**
1. ضع وزن معروف (مثلاً 10 kg) على الخلية
2. اقرأ القيمة الخام من HX711
3. `CALIBRATION_FACTOR` = `raw_reading / known_kg`
4. سجل القيمة في `smartlap_compaction.ino`

### 3.6 صندوق التوصيات
- **العلبة:** IP65 ABS 200×120×75 mm
- **الشاشة:** 2.4" TFT ILI9341 SPI
- **مقبس الـ USB:** IP65 panel-mount
- **تبديل يدوي/آلي:** مفتاح خارجي لاختيار Auto/Manual

---

## 4. اختبار CBR

### 4.1 الغرض
قياس California Bearing Ratio (ASTM D1883) — اختبار اختراق التربة.

### 4.2 الحساسات والمحركات
| المكون | الطراز | الكمية |
|--------|--------|--------|
| Load Cell 50 kN | ATO Low Profile Spoke Type | 1 |
| HX711 ADC (24-bit) | Avia HX711 breakout | 1 |
| **LVDT (موصى به)** | TE PR Series (0.01mm resolution) | 1 |
| HC-SR04 (احتياطي) | Ultrasonic distance | 1 |
| DC Linear Actuator 12V | 150mm stroke, 500N | 1 |
| H-Bridge | L298N أو BTS7960 | 1 |
| AD698 (لـ LVDT) | Signal conditioner | 1 |

### 4.3 دائرة التوصيل
```
                    ┌─────────────────────────────┐
                    │          HX711              │
50 kN Load Cell ────┤ E+/E- A+/A-                │
                    │    DT ── D3  SCK ── D2      │
                    │    VCC ── 5V  GND ── GND    │
                    └─────────────────────────────┘

                   ┌─────────────────────────────┐
                   │    HC-SR04 (احتياطي)         │
                   │    TRIG ── D9  ECHO ── D10   │
                   │    VCC ── 5V  GND ── GND     │
                   │    ⚠ECHO → Voltage Divider   │
                   │        5V ──┬─[2.2kΩ]─┬── D10│
                   │             │         │      │
                   │            ─┴─       [3.3kΩ]  │
                   │           GND         │      │
                   │                       ─┴─ GND│
                   └─────────────────────────────┘

                   ┌─────────────────────────────┐
                   │   Motor Driver L298N        │
Arduino D5 ────────┤ IN1                        │
Arduino D6 ────────┤ IN2         OUT1 ──── Motor+│
Arduino D7 (PWM)───┤ ENA         OUT2 ──── Motor-│
12V ext ───────────┤ 12V         GND ──── GND    │
                   └─────────────────────────────┘
```

### 4.4 ⚠️ ملاحظة مهمة على HC-SR04
**HC-SR04 دقته ±3mm.** ASTM D1883 يتطلب قياس الاختراق بدقة **0.01mm**. لذلك، HC-SR04 غير مناسب للتطبيقات المعملية الحقيقية. استخدم **LVDT** (TE PR Series) مع AD698 conditioner.

طريقة توصيل LVDT مع AD698:
```
LVDT Primary ──── AD698 EXC (1-10kHz)
LVDT Secondary ── AD698 SIG IN
AD698 OUT ──────── ADS1115 (AIN0) ── I2C ── Arduino (A4/A5)
```

### 4.5 المعايرة
```
CALIBRATION_FACTOR = 420.0    // معايرة الـ Load Cell
ACTUATOR_SPEED = 150           // PWM (0-255) لسرعة المحرك
MAX_PENETRATION_MM = 12.5      // أقصى اختراق
```

**سرعة الاختراق:** حسب ASTM D1883، السرعة المطلوبة هي **1.27 mm/min**.
تحتاج إلى PID control loop في firmware لتحقيق هذه السرعة — غير موجود حاليًا.

### 4.6 صندوق التوصيات
- **العلبة:** IP65 Metal 250×150×100 mm
- **إطار:** إطار تحميل CBR هيدروليكي أو لولبي  
- **مقياس القوة:** 50 kN (موديل ATO Low Profile)
- **لوحة المحرك:** منفصلة عن Arduino (تيار عالي)

---

## 5. اختبار المسطرة (Straightedge)

### 5.1 الغرض
قياس خشونة سطح الطريق باستخدام مسطرة 3 أمتار (ASTM E1274).

### 5.2 الحساسات والمحركات
| المكون | الطراز | الكمية |
|--------|--------|--------|
| IMU (Accel + Gyro) | MPU6050 | 1 |
| Laser Distance (اختياري) | VL53L0X | 1 |
| Rotary Encoder | 600 PPR Optical | 1 |
| Wheel (~31.8mm) | Rubber wheel | 1 |

### 5.3 دائرة التوصيل
```
                    ┌───────────────────────────┐
                    │ I2C Bus (A4=SDA, A5=SCL)  │
                    │                           │
     MPU6050 ───────┤ SDA ── A4   SCL ── A5     │
     ADDR ── GND    │ VCC ── 3.3V  GND ── GND   │
                    │                           │
     VL53L0X ───────┤ SDA ── A4   SCL ── A5     │
     ADDR ── GND    │ VCC ── 3.3V  GND ── GND   │
                    │   (XB/shutdown ── D8 opt)  │
                    └───────────────────────────┘

                    ┌───────────────────────────┐
                    │  Rotary Encoder (600 PPR) │
Encoder A (CLK) ────┤ D2 (INT0)                │
Encoder B (DT) ─────┤ D3 (INT1)                │
+V ── 5V  GND ── GND │ (مع INPUT_PULLUP)        │
                    └───────────────────────────┘

                    4.7kΩ pull-ups على SDA/SCL
                    3.3V ──████──┬── SDA
                                 │
                                ─┴─ GND (للمكثف)
```

### 5.4 ⚠️ قيود MPU6050
المعايرة الحالية تستخدم `asin(accelZ)` لحساب الميل — وهذا **صالح فقط للقياسات الساكنة**. تحت الحركة، يلزم:
- **Complementary filter:** `angle = 0.98 × (angle + gyroZ × dt) + 0.02 × accel_angle`
- أو **Madgwick/Mahony filter** للمحركات الستة

ملف firmware الحالي (`smartlap_straightedge.ino`) لا يطبق هذه المرشحات — النتائج ستكون غير مستقرة.

### 5.5 المعايرة
```
ENCODER_PPR = 600              // نبضات لكل لفة
STRAIGHTEDGE_LENGTH_M = 3.0    // طول المسطرة
```

### 5.6 صندوق التوصيات
- **العلبة:** IP67 Pelican 300×200×150 mm (للعمل الميداني)
- **العجلة:** ~32mm قطر، مطاطية
- **المسطرة:** ألومنيوم 3 أمتار
- **البطارية:** 18650 Li-ion 2600 mAh

---

## 6. اختبار الهبوط (Slump)

### 6.1 الغرض
قياس هبوط الخرسانة الطازجة (ASTM C143).

### 6.2 الحساسات والمحركات
| المكون | الطراز | الكمية |
|--------|--------|--------|
| HC-SR04 | Ultrasonic Distance | 1 |
| **TFmini-S (موصى به)** | Benewake LiDAR | 1 |

### 6.3 دائرة التوصيل
```
                    ┌───────────────────────────┐
                    │        HC-SR04            │
     D9 ────────────┤ TRIG                      │
     D10 ───────────┤ ECHO                      │
     5V ────────────┤ VCC                       │
     GND ───────────┤ GND                       │
                    │                           │
                    │ ⚠ Voltage Divider للـECHO │
                    │ إذا كنت تستخدم ESP32:     │
                    │ ECHO ──[2.2kΩ]──┬── D10   │
                    │                │          │
                    │              [3.3kΩ]      │
                    │                │          │
                    │               ─┴─ GND    │
                    └───────────────────────────┘
```

### 6.4 ⚠️ ارتفاع القالب (Mold Height)
قيمة `MOLD_HEIGHT_CM = 30.5` في firmware **خطأ**. الصحيح:
- القالب القياسي ASTM C143: **30.0 cm** (300 mm)
- 12 بوصة = 304.8 mm → تقريبًا 305 mm، لكن ASTM ينص على 300 mm

**قبل التثبيت:** غيّر القيمة في firmware إلى `30.0`.

### 6.5 طريقة التركيب
1. ثبت حساس HC-SR04 أو TFmini-S فوق القالب مباشرة
2. المسافة من الحساس إلى قاعدة القالب = 300 mm
3. `TARE` يسجل المسافة المرجعية
4. بعد ملء الخرسانة ورفع القالب → الحساس يقيس المسافة الجديدة
5. `slump = distance_ref - distance_after`

### 6.6 صندوق التوصيات
- **العلبة:** IP65 ABS 150×100×60 mm
- **حامل الحساس:** bracket ألومنيوم بارتفاع 300 mm
- **شاشة:** 0.96" OLED SSD1306 I2C

---

## 7. اختبار النضج (Maturity)

### 7.1 الغرض
قياس درجة حرارة الخرسانة لحساب النضج (ASTM C1074).

### 7.2 الحساسات والمحركات
| المكون | الطراز | الكمية |
|--------|--------|--------|
| DS18B20 (مقاوم للماء) | Maxim DS18B20 | 1-3 |
| 4.7kΩ resistor | 1/4W carbon | 1 |

### 7.3 دائرة التوصيل
```
                    ┌───────────────────────────┐
                    │        DS18B20            │
                    │                           │
     5V ────────────┬──── VCC (RED)            │
                    │                           │
                   4.7kΩ                        │
                    │                           │
     D2 ────────────┴──── DATA (WHITE/YELLOW)   │
                    │                           │
     GND ───────────────── GND (BLACK)          │
                    │                           │
                    │ تسهيلات التوصيل:          │
                    │ لأسلاك طويلة (>5m):       │
                    │ أضف 100nF بين VCC و GND  │
                    │ قم بتغليف الوصلة بالايبوكسي│
                    └───────────────────────────┘
```

### 7.4 معايرة
DS18B20 **معاير من المصنع** بدقة ±0.5°C. لا حاجة لمعايرة المستخدم.

**القيم الخاصة:**
- `READ_INTERVAL_MS = 5000` (قراءة كل 5 ثوان)
- المدى: -55°C إلى +125°C
- `DEVICE_DISCONNECTED_C = -127` (انفصال الحساس)

### 7.5 التركيب في الخرسانة
1. اغمس مجس DS18B20 في الخرسانة الطازجة
2. ثبت السلك باستخدام رباط كيبل (zip tie)
3. السلك المطاطي يتحمل حتى 125°C — مناسب للخرسانة المتصلدة
4. للتطبيقات الدائمة: اغلف الوصلة بالايبوكسي (epoxy potting)
5. للقياسات المتعددة: استخدم 3 مجسات (علوي، وسط، سفلي) مع عناوين OneWire مختلفة:
   - DS18B20 #1: 64-bit ROM (محفوظ)
   - DS18B20 #2: يتطلب مسح ROM واستخدام ROM identifier

### 7.6 صندوق التوصيات
- **العلبة:** Epoxy potting (للدفن في الخرسانة)
- **السطح:** IP65 ABS صغير (60×40×30 mm)
- **البطارية:** 18650 Li-ion (للتشغيل اللاسلكي)
- **Arduino:** Nano 33 BLE Sense للتشغيل عبر BLE

---

## 8. اختبار مارشال (Marshall Stability)

### 8.1 الغرض
قياس ثبات وتدفق خلطات الأسفلت (ASTM D6927).

### 8.2 الحساسات والمحركات
| المكون | الطراز | الكمية |
|--------|--------|--------|
| Load Cell 50 kN | ATO Low Profile | 1 |
| HX711 ADC (24-bit) | Avia HX711 breakout | 1 |
| LVDT (Displacement) | TE PR Series 25mm | 1 |
| ADS1115 (16-bit ADC) | TI ADS1115 | 1 |
| NEMA 23 Stepper | 1.2 Nm | 1 |
| Driver TB6600 | Stepper driver | 1 |

### 8.3 دائرة التوصيل
```
                    ┌─────────────────────────────┐
                    │          HX711              │
50 kN Load Cell ────┤ E+/E- A+/A-                │
                    │    DT ── D3  SCK ── D2      │
                    │    VCC ── 5V  GND ── GND    │
                    └─────────────────────────────┘

                    ┌─────────────────────────────┐
                    │    LVDT + AD698 / POT       │
                    │                             │
  LVDT Primary ─────┤ AD698 EXC (1-10kHz)        │
  LVDT Secondary ───┤ AD698 SIG                   │
                    │ AD698 OUT ── ADS1115 AIN0   │
                    │                             │
  ADS1115 SCL ──────┤ A5 (Arduino I2C)           │
  ADS1115 SDA ──────┤ A4 (Arduino I2C)           │
  ADS1115 ADDR ─────┤ GND (0x48)                 │
                    └─────────────────────────────┘

                    ┌─────────────────────────────┐
                    │    Stepper Driver TB6600    │
Arduino D9 ─────────┤ STEP                        │
Arduino D10 ────────┤ DIR                         │
Arduino D11 ────────┤ ENABLE                      │
24V supply ─────────┤ Vmot (12-36V)              │
                    │ A+, A- ──── NEMA 23 Coil A  │
                    │ B+, B- ──── NEMA 23 Coil B  │
                    └─────────────────────────────┘
```

### 8.4 ⚠️ وحدات التدفق (Flow Units)
في `marshall.js`، مدى النجاح للتـ Flow هو `[2, 4]`. هذا **خطأ** — القيم الصحيحة:
- **قاعدة Marshall القياسية:** التدفق المقبول = **8-14** (وحدات 0.25 mm)
- `flow = displacement_mm / 0.25`
- مثال: 2.5 mm displacement → flow = 10 → مقبول

**يلزم تغيير:** في `js/marshall.js` غيّر `flowRange = [2, 4]` إلى `[8, 14]`.

### 8.5 المعايرة
```
CALIBRATION_FACTOR = 420.0   // معايرة HX711
LVDT_RANGE_MM = 25.0         // مدى LVDT
```

**سرعة التحميل:** حسب ASTM D6927، السرعة = **50.8 mm/min**.
تحتاج NEMA 23 stepper مع TB6600 لتحقيق هذه السرعة بدقة.

### 8.6 صندوق التوصيات
- **العلبة:** IP65 Metal 250×150×100 mm
- **إطار:** إطار تحميل مارشال التقليدي (retrofit)
- **وحدة الطاقة:** Mean Well HDR-60-24
- **المحرك:** NEMA 23 مع TB6600
- **شاشة:** 3.5" TFT Touch ILI9488

---

## 9. اختبار البيتومين (Bitumen Photo-Tester)

### 9.1 الغرض
قياس نقاء البيتومين عبر تحليل الضوء النافذ (للأغراض التعليمية فقط — لا يوجد معيار ASTM).

### 9.2 الحساسات والمحركات
| المكون | الطراز | الكمية |
|--------|--------|--------|
| Ambient Light Sensor | BH1750FVI | 1 |
| I2C Level Shifter | BSS138 (3.3V/5V) | 1 |

### 9.3 دائرة التوصيل
```
                    ┌───────────────────────────┐
                    │   BSS138 Level Shifter    │
                    │                           │
  Arduino A4 (SDA) ─┤ LV1          HV1 ──── BH1750 SDA
  Arduino A5 (SCL) ─┤ LV2          HV2 ──── BH1750 SCL
  Arduino 5V ───────┤ LV           HV ──── BH1750 VCC
  Arduino GND ──────┤ GND          GND ──── BH1750 GND
                    │                           │
                    │ BH1750 ADDR ── GND (0x23) │
                    │                           │
                    │ ⚠ BH1750 يعمل فقط على 3.3V│
                    │ ❌ لا توصل VCC إلى 5V!    │
                    └───────────────────────────┘
```

### 9.4 ⚠️ هذا الاختبار للأغراض التعليمية فقط
BH1750 يقيس شدة الضوء المحيط — لا يوجد معيار ASTM أو DIN يربط شدة الضوء بنقاء البيتومين. الطرق القياسية:
- **ASTM D6307:** فرن الإشعال (Ignition Oven)
- **ASTM D2172:** الاستخلاص بالمذيبات (Solvent Extraction)

**لا تستخدم هذا الاختبار للنتائج المعملية المعتمدة.**

### 9.5 المعايرة
```
BH1750_ADDR = 0x23            // I2C address
REFERENCE_LUX = 1000.0        // مرجع الهواء النظيف
```

**مصدر الضوء:** خارجي — يجب أن يكون مثبتًا (LED أبيض ثابت، 5500K).

---

## 10. بروتوكول الاتصال (Serial CSV Protocol)

### 10.1 التنسيق
```
9600 baud, 8N1, \n-terminated
```

### 10.2 الأوامر (من المتصفح → الجهاز)
| الأمر | الوظيفة |
|-------|----------|
| `START\n` | بدأ القراءات الدورية |
| `STOP\n` | إيقاف القراءات |
| `TARE\n` | تصفير حساس القوة |
| `STATUS\n` | طلب الحالة |

### 10.3 البيانات (من الجهاز → المتصفح)
| الاختبار | التنسيق | مثال |
|----------|----------|-------|
| Compaction | `moisture_pct,force_newtons` | `12.5,234.5` |
| CBR | `penetration_mm,load_newtons` | `2.5,6210` |
| Straightedge | `position_m,irregularity_mm,inclination_deg` | `1.5,2.3,0.5` |
| Slump | `distance_cm` | `18.2` |
| Maturity | `temperature_celsius` | `23.4` |
| Marshall | `load_newtons,displacement_mm,flow_units` | `8500,3.2,12.8` |
| Bitumen | `lux,transmission_pct,purity_index` | `850,85,85` |

### 10.4 رسائل الحالة
```
SmartLab:READY        ← الجهاز جاهز بعد الـ boot
SmartLab:STARTED      ← تأكيد استلام أمر START
SmartLab:STOPPED      ← تأكيد استلام أمر STOP
```

### 10.5 معالجة الأخطاء (على المتصفح)
```javascript
// تحقق NaN: تجاهل القراءة
if (isNaN(v1) || isNaN(v2)) { serialLog('Invalid data', 'rx'); return; }

// تحقق currentTest: تجاهل إذا لم يكن هناك اختبار نشط
if (!currentTest) { serialLog('No active test', 'rx'); return; }

// رسائل الحالة: تسجيل وعرض
if (line.match(/^SmartLab:\w+/)) { serialLog(line, 'rx'); return; }
```

---

## 11. المعايرة (Calibration)

### 11.1 معايرة HX711 + Load Cell
```
مطلوب: وزن معروف (5kg, 10kg, 20kg)
الخطوات:
1. ضع الوزن المعروف على الخلية
2. اقرأ القيمة الخام من serial: raw = hx711.get_units()
3. CALIBRATION_FACTOR = raw / known_kg
4. اكتب القيمة في #define CALIBRATION_FACTOR في الـ firmware
5. اختبر بوزن آخر للتأكد
```

**عامل المعايرة 420.0 المستخدم حاليًا تقديري — يلزم معايرة لكل جهاز.**

### 11.2 معايرة حساس الرطوبة (Compaction)
```
مطلوب: تربة جافة تمامًا + تربة مشبعة بالماء
الخطوات:
1. ضع الحساس في التربة الجافة → سجل ADC_DRY
2. ضع الحساس في الماء → سجل ADC_WET
3. MOISTURE_DRY = ADC_DRY
4. MOISTURE_WET = ADC_WET
5. moisture_pct = map(ADC, ADC_WET, ADC_DRY, 100, 0)
```

### 11.3 معايرة HC-SR04
حساس HC-SR04 معاير من المصنع — لكن دقته (±3mm) لا تكفي لـ CBR.
- للـ Slump: مقبول (الدقة ±3mm كافية)
- للـ CBR: **غير مقبول** — استخدم LVDT

### 11.4 حفظ المعايرة
يحتاج firmware إلى حفظ قيم المعايرة في **EEPROM** (Arduino) أو **NVS** (ESP32):
```c
#include <EEPROM.h>
EEPROM.put(0, CALIBRATION_FACTOR);
EEPROM.put(4, MOISTURE_DRY);
EEPROM.put(8, MOISTURE_WET);
EEPROM.commit(); // ESP32 only
```
حاليًا، firmware **لا يحفظ** المعايرة في EEPROM — تضيع بعد إعادة التشغيل.

---

## 12. قطع الغيار والمكونات

### 12.1 المكونات الأساسية
| القطعة | الطراز | السعر التقريبي | الكمية الموصى بها |
|--------|--------|----------------|-------------------|
| Arduino Uno R3 | — | $10 | 7 (واحد لكل اختبار) |
| HX711 breakout | Avia | $1-2 | 3 (Compaction, CBR, Marshall) |
| ADS1115 ADC | TI | $5 | 2 (Marshall LVDT + احتياطي) |
| HC-SR04 | — | $1 | 2 (CBR احتياطي + Slump) |
| TFmini-S LiDAR | Benewake | $25 | 1 (لـ Slump بدقة أعلى) |
| DS18B20 (مقاوم للماء) | Maxim | $3 | 3 (Maturity + احتياطي) |
| MPU6050 | — | $2 | 1 (Straightedge) |
| VL53L0X | ST | $3 | 1 (Straightedge) |
| BH1750FVI | — | $1 | 1 (Bitumen) |
| 4.7kΩ resistors | — | $0.10 | 10 قطع |
| 100nF capacitors | — | $0.10 | 10 قطع |
| 10μF capacitors | — | $0.20 | 5 قطع |

### 12.2 المكونات المتقدمة (للإنتاج)
| القطعة | الطراز | السعر | الغرض |
|--------|--------|-------|-------|
| LVDT PR Series | TE Connectivity | $150-300 | CBR + Marshall |
| AD698 LVDT Cond. | Analog Devices | $25-40 | معالجة إشارة LVDT |
| Load Cell 100kN | ATO | $80-120 | Compaction |
| Load Cell 50kN | ATO | $60-100 | CBR + Marshall |
| NEMA 23 Stepper | — | $25 | Marshall actuator |
| NEMA 17 Stepper | — | $15 | CBR actuator |
| TB6600 Driver | — | $10 | Stepper driver |
| L298N H-Bridge | — | $3 | Motor driver (بدائي) |
| BTS7960 H-Bridge | — | $8 | Motor driver (قوي) |
| Mean Well PSU 24V | HDR-30-24 | $15 | تغذية 24V 1.5A |
| Mean Well PSU 24V | HDR-60-24 | $20 | تغذية 24V 2.5A |
| ESP32-WROOM-32E | — | $4-6 | ترقية من Arduino |

### 12.3 مقترحات الشراء
| المتجر | العنوان |
|--------|----------|
| ATO.com | Load cells, actuators |
| DigiKey | LVDT, AD698, ADS1115 |
| Mouser | HX711 (original Avia), DS18B20 |
| AliExpress | HC-SR04, BH1750, MPU6050, breakouts |
| SparkFun / Adafruit | HX711 module, SSD1306, level shifters |
| Amazon | Mean Well PSU, enclosures, connectors |

---

## 13. الترقية إلى ESP32

### 13.1 لماذا ESP32؟
| الميزة | Arduino Uno | ESP32-WROOM-32E |
|--------|-------------|-----------------|
| المعالج | 16 MHz 8-bit | 240 MHz dual-core 32-bit |
| الذاكرة | 2 KB RAM | 520 KB SRAM + 4 MB PSRAM |
| Wi-Fi | ❌ | ✅ 802.11 b/g/n |
| Bluetooth | ❌ | ✅ BLE 4.2 |
| ADC | 10-bit (0-1023) | 12-bit (0-4095) |
| DAC | ❌ | ✅ 2× 8-bit |
| I2C | 1 bus | 2 buses |
| UART | 1 | 3 |
| السعر | $10 | $4-6 |

### 13.2 ESP32 Pin Mapping (مقترح)
| الوظيفة | GPIO | ملاحظة |
|----------|------|---------|
| HX711 DT | GPIO 4 | |
| HX711 SCK | GPIO 2 | |
| I2C SDA | GPIO 21 | مشترك لـ MPU6050, VL53L0X, BH1750, ADS1115 |
| I2C SCL | GPIO 22 | |
| HC-SR04 TRIG | GPIO 18 | |
| HC-SR04 ECHO | GPIO 19 | مع voltage divider (5V → 3.3V) |
| DS18B20 DATA | GPIO 23 | مع 4.7kΩ pull-up |
| Motor IN1 | GPIO 25 | |
| Motor IN2 | GPIO 26 | |
| Motor ENA (PWM) | GPIO 27 | |
| Stepper STEP | GPIO 14 | |
| Stepper DIR | GPIO 12 | |
| Stepper EN | GPIO 13 | |

### 13.3 تحويل Arduino → ESP32
```c
// Arduino:
#include <HX711.h>
HX711 scale;
scale.begin(3, 2); // DT, SCK

// ESP32:
#include <HX711_ESP32.h>
HX711_ESP32 scale;
scale.begin(4, 2); // GPIO 4 (DT), GPIO 2 (SCK)

// ملاحظة: على ESP32، استخدم مكتبات ESP32-compatible فقط
```

**ملاحظات هامة:**
- GPIO 6-11 (flash) — لا تستخدمها
- GPIO 34-39 (input only) — للقراءة فقط
- ESP32 ADC غير خطي — استخدم ADS1115 للقياسات الحساسة
- voltage divider مطلوب لقراءة 5V من HC-SR04 ECHO

---

## ملحق: قائمة المراجعة قبل التشغيل

### 🔲 لكل اختبار
- [ ] جميع التوصيلات مطابقة لدائرة التوصيل
- [ ] مقاومة الـ pull-up مثبتة (DS18B20: 4.7k, I2C: 4.7k)
- [ ] المكثفات 100nF عند كل VCC
- [ ] التغذية مناسبة للمكونات (5V, 3.3V)
- [ ] التوصيلات محمية (heat shrink, cable ties)
- [ ] معايرة الحساس (CALIBRATION_FACTOR)
- [ ] USB cable مع ferrite bead
- [ ] المشترك GND بين كل الأجهزة

### 🚨 قبل التشغيل لأول مرة
- [ ] اختبر كل حساس بمفرده قبل التجميع
- [ ] اقرأ القيم الخام من serial وثقها
- [ ] طبق الوزن المعروف وتحقق من CALIBRATION_FACTOR
- [ ] تأكد من أن USB cable ليس طويلاً (>3m يسبب مشاكل)

### 📋 قائمة المشاكل المعروفة
| المشكلة | الاختبار | الحل | الأولوية |
|----------|----------|------|----------|
| HC-SR04 دقة ±3mm | CBR | استبدل بـ LVDT | 🔴 عاجل |
| MPU6050 بدون filter | Straightedge | أضف complementary filter | 🔴 عاجل |
| MOLD_HEIGHT 30.5cm | Slump | غيّر إلى 30.0cm | 🟡 ضروري |
| CALIBRATION_FACTOR مكرر | الكل | عاير لكل جهاز على حدة | 🟡 ضروري |
| EEPROM غير مستخدم | الكل | أضف حفظ المعايرة | 🟡 ضروري |
| PID تحكم السرعة | CBR | أضف PID loop | 🟡 ضروري |
| Stepper speed 50.8mm/min | Marshall | أضف control loop | 🟡 ضروري |
| BH1750 ليس ASTM | Bitumen | تعليمي فقط | ⚪ معلومات |

---

**النهاية.** هذا الدليل يغطي 7 أجهزة مختلفة. كل جهاز له دائرة توصيل، معايرة، وبروتوكول خاص.
