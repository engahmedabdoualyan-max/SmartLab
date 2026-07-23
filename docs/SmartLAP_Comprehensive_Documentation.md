# SmartLAP v1.0.0 — Comprehensive User Documentation

**Dynamic Lab Automation System**
*by Fimto Soft — Integrated Tech Solutions*

---

**Document Version:** 1.0
**Last Updated:** July 2026
**Website:** [https://smartlab.fimtosoft.com](https://smartlab.fimtosoft.com)
**Contact:** info@fimtosoft.com | Egypt: 01001006627 | Saudi Arabia: 0500439617

---

# Table of Contents

- [Document 1: Quick Start Guide](#document-1-quick-start-guide)
- [Document 2: Test Procedures Manual](#document-2-test-procedures-manual)
- [Document 3: Hardware Setup Guide](#document-3-hardware-setup-guide)
- [Document 4: API Reference](#document-4-api-reference)

---

# Document 1: Quick Start Guide

## 1.1 What Is SmartLAP?

SmartLAP is an open-source dynamic laboratory automation system designed for civil engineering laboratories. It replaces bulky, expensive traditional lab equipment with a smart web interface combined with affordable electronic sensors (Arduino-based). The system supports real-time sensor data collection, automatic engineering calculations, and instant PDF report generation.

**Key Capabilities:**

- Real-time sensor streaming via Web Serial, WebSocket, LAN, or Bluetooth
- Automatic calculation of density, compaction ratio, CBR, slump, maturity, and other engineering formulas
- Strike-by-strike or reading-by-reading logging with live gauges and charts
- PDF report generation for each test session
- Cloud session history via Firebase Firestore
- AI Engineering Team (5 agents) for instant technical support
- 7-language support (English, Arabic, Chinese, German, French, Japanese, Russian)

## 1.2 System Requirements

### For the Web Application (Browser)

| Component | Minimum Requirement |
|---|---|
| **Browser** | Google Chrome 89+ (recommended), Microsoft Edge 89+, or any Chromium-based browser |
| **Operating System** | Windows 10+, macOS 11+, Linux (Ubuntu 20.04+), ChromeOS |
| **Internet** | Broadband connection (for cloud sync and Firebase) |
| **Display** | 1024 x 768 minimum; 1920 x 1080 recommended |
| **RAM** | 4 GB minimum |
| **JavaScript** | Must be enabled |

> **Important:** The Web Serial API (used for USB/Serial connections) is only supported in Chromium-based browsers (Chrome, Edge, Opera). It is **not** supported in Firefox or Safari.

### For the Backend Server (Optional — Self-Hosted)

| Component | Requirement |
|---|---|
| **Python** | 3.9 or higher |
| **OS** | Windows, macOS, or Linux |
| **Disk Space** | 500 MB (including dependencies) |
| **RAM** | 2 GB minimum |
| **USB Port** | Required if connecting Arduino directly to the server machine |

Python dependencies (installed via `requirements.txt`):

- Flask 3.0.0
- pyserial 3.5
- WeasyPrint 62.2
- Flask-SQLAlchemy 3.1.1
- Flask-CORS 4.0.0

### For Hardware (Arduino-Based Sensors)

| Component | Details |
|---|---|
| **Microcontroller** | Arduino Uno, Arduino Nano, or ESP32 |
| **USB Cable** | USB-A to USB-B (Arduino Uno/Nano) or Micro-USB (ESP32) |
| **Sensors** | Depends on the test (see Test Procedures Manual) |
| **Power Supply** | USB-powered from the computer, or external 5V/12V adapter |
| **Breadboard / PCB** | For wiring sensor connections |

## 1.3 How to Access SmartLAP

### Option A: Cloud Version (Recommended)

1. Open your web browser (Google Chrome recommended).
2. Navigate to: **[https://smartlab.fimtosoft.com](https://smartlab.fimtosoft.com)**
3. The SmartLAP login screen will appear.
4. No installation is required — the system runs entirely in your browser.

### Option B: Local Installation (Self-Hosted)

1. Ensure Python 3.9+ is installed on your computer.
2. Open a terminal/command prompt.
3. Clone or download the SmartLAP project files.
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
5. Start the server:
   ```
   python server/app.py
   ```
6. Open your browser and go to: `http://localhost:5000`

## 1.4 Account Creation

SmartLAP offers three ways to sign in:

### Method 1: Email and Password

1. On the login screen, click the **Register** tab.
2. Enter your **Full Name**, **Email Address**, and **Password** (minimum 6 characters).
3. Click **Create Account**.
4. Your account is created instantly. You will be redirected to the domain selection screen.

To log in later:
1. Stay on the **Login** tab (default).
2. Enter your email and password.
3. Click **Login**.

> **Forgot your password?** Click the "Forgot password?" link below the password field. A reset link will be sent to your email.

### Method 2: Google Sign-In

1. On the login screen, click the **"Sign in with Google"** button.
2. A Google authentication window will open.
3. Select your Google account and authorize SmartLAP.
4. You will be redirected to the domain selection screen.

### Method 3: Guest Access

1. On the login screen, click **"Continue as Guest"** at the bottom.
2. You will enter the system immediately without creating an account.
3. **Note:** Guest sessions are not saved to the cloud. Test data will be available during the session only.

## 1.5 First Test Walkthrough

This walkthrough uses **Demo Mode** (simulated data) so you can try the system without any hardware.

### Step 1: Log In

- Open `https://smartlab.fimtosoft.com`
- Click **"Continue as Guest"** (or log in with your credentials).

### Step 2: Choose a Domain

You will see three department cards:

| Card | Department | Tests Included |
|---|---|---|
| Roads & Soil | Compaction Test, Moisture Content Test, CBR Test, Straightedge Test |
| Concrete | Digital Slump Test, Maturity Test |
| Asphalt | Marshall Test, Bitumen Photo-Tester |

- Click on **"Roads & Soil"** to enter that department.

### Step 3: Select a Test

- You will see the test cards for that department.
- Click **"Compaction Test"** (the soil Proctor compaction test).

### Step 4: Set Test Parameters

In the **Engineer Inputs** panel, fill in:

| Field | Recommended Value | Description |
|---|---|---|
| Hammer Weight (kg) | 2.5 | Standard Proctor hammer weight |
| Mold Volume (m³) | 0.001 | Standard Proctor mold volume |
| Reference Weight (kg) | 2.0 | Weight of compacted soil sample |
| Target Strikes | 25 | Number of blows per layer |
| Target Ratio (%) | 95 | Minimum compaction ratio required |

### Step 5: Select Connection

- In the **Hardware Connection** panel, open the dropdown.
- Select **"Demo Mode"** (simulates sensor data).
- A yellow banner will appear: "Demo mode — simulated data."

### Step 6: Start the Test

- Click the **"Start Test"** button.
- The live data panel will show simulated moisture and force readings.
- The strike counter (circular gauge) will advance with each simulated hammer blow.
- The strike log table will populate with each reading.

### Step 7: View Results

- After the target strikes are reached, the **Results** panel will appear.
- You will see calculated values: moisture percentage, dry density, optimum moisture, and a pass/fail status.
- The achievement ratio bar chart will show your compaction ratio.

### Step 8: Download PDF Report

- Click the **"Download PDF"** button in the Results panel.
- A professionally formatted PDF report will be generated and downloaded to your computer.
- The report includes: test parameters, sensor data, calculated results, charts, and signature lines.

### Step 9: View History

- Scroll down to the **History** panel.
- Your completed test sessions are listed with date, status, and density values.

---

# Document 2: Test Procedures Manual

This section provides step-by-step procedures for all seven tests supported by SmartLAP.

---

## Test 1: Compaction Test (Soil Proctor)

**Purpose:** Determines the maximum dry density and optimum moisture content of a soil sample using the standard or modified Proctor compaction method.

**Applicable Standards:** ASTM D698 (Standard Proctor), ASTM D1557 (Modified Proctor), AASHTO T99/T180, BS 1377 Part 4.

**Sensors Used:**
- HX711 + Load Cell (50–100 kg capacity) — measures compaction impact force
- Capacitive Soil Moisture Sensor v1.2 — measures moisture content

### Step 1: Hardware Setup

1. Connect the HX711 module to the Arduino:
   - HX711 DOUT → Pin 3
   - HX711 SCK → Pin 2
2. Connect the load cell wires:
   - Red → E+
   - Black → E-
   - White → A+
   - Green → A-
3. Connect the capacitive soil moisture sensor:
   - AOUT → Arduino A0
4. Connect the Arduino to your computer via USB cable.
5. Upload the `smartlap_compaction.ino` firmware (see Document 3 for instructions).

### Step 2: Open the Compaction Test

1. Log in to SmartLAP.
2. Select **Roads & Soil** department.
3. Click **Compaction Test**.

### Step 3: Configure Parameters

In the **Engineer Inputs** panel, enter:

| Field | Value | Notes |
|---|---|---|
| Hammer Weight (kg) | 2.5 (Standard) or 4.5 (Modified) | Depends on test type |
| Mold Volume (m³) | 0.001 (944 cm³ standard mold) | Standard Proctor mold |
| Reference Weight (kg) | Enter actual sample weight | Weigh the compacted soil |
| Target Strikes | 25 (per layer) | Standard is 25 blows/layer |
| Target Ratio (%) | 95 | Project specification requirement |

### Step 4: Connect Hardware

**USB / Serial Connection:**
1. Select **"USB / Serial (Web Serial API)"** from the Connection dropdown.
2. Click **Start Test** — your browser will prompt you to select the serial port.
3. Choose the port corresponding to your Arduino (e.g., "Arduino Uno (COM3)").
4. The status dot will turn green when connected.

**Demo Mode:**
1. Select **"Demo Mode"** from the Connection dropdown.
2. A yellow banner will confirm simulated data is active.

### Step 5: Run the Test

1. Click **Start Test**. The "LIVE" indicator will appear.
2. Perform hammer strikes on the soil sample in the mold.
3. Each strike is automatically detected when force exceeds 10 N.
4. The strike counter advances, and each reading (moisture %, force N, density) is logged.
5. The serial console (at the bottom of the connection panel) shows raw data exchange.

### Step 6: Monitor Live Data

During the test, observe:

| Display | What It Shows |
|---|---|
| Circular Gauge | Number of strikes completed vs. target |
| Moisture Card | Current moisture percentage from the sensor |
| Force Card | Current impact force in Newtons |
| Avg Force Card | Average force across all strikes |
| Dry Density Card | Calculated dry density in kg/m³ |
| Strike Log Table | Every individual strike with timestamp |

### Step 7: Read Results

Once the target number of strikes is reached, the **Results** panel appears with:

| Result | Formula | Description |
|---|---|---|
| Moisture % | Direct from sensor | Current moisture content |
| Moisture Weight (kg) | (moisture% / 100) × reference weight | Water weight in sample |
| Dry Density (kg/m³) | (reference weight − moisture weight) / mold volume | Compacted dry density |
| Max Dry Density | Same as calculated dry density | For single-point Proctor |
| Optimum Moisture % | Same as sensor reading | For single-point Proctor |
| Status | Pass if dry density > 0 | Basic validation check |

### Step 8: Generate PDF Report

1. Click **Download PDF** in the Results panel.
2. The report includes:
   - Test name, department, date/time
   - All engineer input parameters
   - Sensor readings (moisture and force)
   - Calculated results with pass/fail coloring
   - Bar chart visualization of dry density
   - Signature lines for lab engineer and lab manager

### Step 9: Review History

- Previous test sessions for this test appear in the **History** panel.
- Each entry shows date, status (pass/fail), and dry density.

---

## Test 2: CBR Test (California Bearing Ratio)

**Purpose:** Measures the bearing capacity of soil by penetration testing, used for pavement design.

**Applicable Standards:** ASTM D1883, AASHTO T193, BS 1377 Part 9.

**Sensors Used:**
- HX711 + Load Cell (0–50 kN capacity) — measures penetration resistance force
- HC-SR04 Ultrasonic Sensor — measures piston penetration depth
- Optional: Motor driver with linear actuator for automated piston push

### Step 1: Hardware Setup

1. Connect the HX711 module:
   - HX711 DOUT → Pin 3
   - HX711 SCK → Pin 2
2. Connect the HC-SR04 ultrasonic sensor:
   - TRIG → Pin 5
   - ECHO → Pin 6
3. (Optional) Connect motor driver:
   - IN1 → Pin 8
   - IN2 → Pin 9
   - ENA → Pin 10 (PWM)
4. Connect load cell wires to HX711 (same as compaction test).
5. Upload the `smartlap_cbr.ino` firmware.

### Step 2: Open the CBR Test

1. Log in and select **Roads & Soil** department.
2. Click **CBR Test**.

### Step 3: Configure Parameters

| Field | Default Value | Description |
|---|---|---|
| Sample Diameter (mm) | 152 | Standard CBR mold diameter |
| Piston Area (mm²) | 1963.5 | Standard piston area (π × 25²) |
| Standard Load @ 2.5mm (N) | 13,240 | ASTM D1883 standard |
| Standard Load @ 5.0mm (N) | 19,960 | ASTM D1883 standard |
| Max Penetration (mm) | 12.5 | Test stops at this depth |

### Step 4: Connect Hardware

Select your connection type (USB/Serial, LAN, Bluetooth, Manual, or Demo).

**Manual Mode:**
- You can enter penetration (mm) and load (N) values manually.
- Click **Add Reading** for each data point.

### Step 5: Run the Test

1. Place the soil sample in the CBR mold (152 mm diameter × 127 mm height).
2. Position the penetration piston on the soil surface.
3. Click **Start Test**.
4. The piston pushes into the soil at 1.25 mm/min.
5. Force and penetration readings are recorded every 1 second.
6. The test automatically stops at 12.5 mm penetration (or when you click Stop).

### Step 6: Monitor Live Data

| Display | What It Shows |
|---|---|
| Penetration Card | Current piston depth in mm |
| Load Card | Current force in Newtons |
| Pressure Card | Pressure in kPa (load ÷ piston area) |
| CBR Ratio Card | CBR percentage at current penetration |
| Force vs. Penetration Curve | Canvas-drawn graph showing the load-penetration relationship |
| Readings Log Table | Every reading with position, load, pressure, and timestamp |

### Step 7: Read Results

| Result | Formula | Description |
|---|---|---|
| CBR @ 2.5mm | (Test Load at 2.5mm / 13,240) × 100 | Primary CBR value |
| CBR @ 5.0mm | (Test Load at 5.0mm / 19,960) × 100 | Secondary CBR value |
| Final CBR | Usually the higher of the two | Design value |
| Max Load | Peak force during test | Maximum resistance |
| Max Pressure | Peak pressure in kPa | For reporting |

> **Note:** If CBR at 5.0mm is significantly higher than at 2.5mm, the test should be re-run.

### Step 8: Generate PDF Report

Click **Download PDF** in the Results panel to generate the CBR test report.

---

## Test 3: Straightedge Test (Road Roughness)

**Purpose:** Measures road surface irregularity (roughness) by detecting deviations from a reference plane along the road surface.

**Applicable Standards:** ASTM E1364, AASHTO R 41.

**Sensors Used:**
- MPU6050 IMU (6-axis gyroscope + accelerometer) — measures tilt/inclination
- VL53L0X Laser Distance Sensor (Time-of-Flight) — measures distance to road surface
- Optional: Rotary Encoder — tracks distance traveled along the road

### Step 1: Hardware Setup

1. Connect the MPU6050 (I2C):
   - SDA → A4
   - SCL → A5
2. Connect the VL53L0X laser sensor (shared I2C bus):
   - SDA → A4 (shared)
   - SCL → A5 (shared)
3. (Optional) Connect rotary encoder:
   - CLK → Pin 2
   - DT → Pin 3
4. Upload the `smartlap_straightedge.ino` firmware.

### Step 2: Open the Straightedge Test

1. Log in and select **Roads & Soil** department.
2. Click **Straightedge Test**.

### Step 3: Configure Parameters

| Field | Default Value | Description |
|---|---|---|
| Straightedge Length (m) | 3.0 | Length of the straightedge tool |
| Tolerance (mm) | 12 | Maximum allowed deviation (project spec) |
| Reading Interval (m) | 0.3 | Distance between readings |

### Step 4: Connect Hardware

Select **USB / Serial** or **Demo Mode** from the connection dropdown.

### Step 5: Run the Test

1. Place the smart straightedge on the road surface.
2. Click **Start Test**. The reference height is automatically calibrated.
3. Push the straightedge along the road surface at a steady pace.
4. The sensor continuously measures distance to the road and inclination angle.
5. Readings are taken every 0.5 seconds (or at the configured interval).
6. Click **Stop** when you reach the end of the test section.

### Step 6: Monitor Live Data

| Display | What It Shows |
|---|---|
| Distance Card | Position along the road in meters |
| Irregularity Card | Deviation from reference plane in mm |
| Max Deviation Card | Maximum irregularity recorded |
| Status Card | Pass/Fail based on tolerance |
| Road Profile Chart | Visual profile of surface irregularity |
| Readings Log | Position, irregularity, inclination for each reading |

### Step 7: Read Results

| Result | Description |
|---|---|
| Max Deviation (mm) | The largest deviation from the reference plane |
| Average Deviation (mm) | Mean of all recorded irregularities |
| Total Distance (m) | Distance covered during the test |
| Pass/Fail | Based on whether max deviation exceeds tolerance |

### Step 8: Generate PDF Report

Click **Download PDF** in the Results panel.

---

## Test 4: Digital Slump Test (Concrete)

**Purpose:** Measures the workability and consistency of fresh concrete by digitally measuring the slump (subsidence) of a concrete cone.

**Applicable Standards:** ASTM C143/C143M, AASHTO T119, BS 1881 Part 102.

**Sensors Used:**
- HC-SR04 Ultrasonic Sensor — measures distance to concrete surface after cone removal

### Step 1: Hardware Setup

1. Connect the HC-SR04:
   - TRIG → Pin 9
   - ECHO → Pin 10
   - VCC → 5V
   - GND → GND
2. Upload the `smartlap_slump.ino` firmware.

### Step 2: Open the Digital Slump Test

1. Log in and select **Concrete** department.
2. Click **Digital Slump Test**.

### Step 3: Configure Parameters

| Field | Default Value | Description |
|---|---|---|
| Cone Height (mm) | 305 | Standard Abrams cone height |
| Tolerance (mm) | 25 | Acceptable deviation from target |
| Target Slump (mm) | 100 | Project specification target |

### Step 4: Connect Hardware

Select **USB / Serial** or **Demo Mode**.

### Step 5: Run the Test

1. Prepare the fresh concrete sample per ASTM C143.
2. Fill the Abrams cone in three layers, rodding each layer 25 times.
3. Strike off the top surface level.
4. Carefully lift the cone vertically upward.
5. Mount the HC-SR04 sensor above the concrete at the reference height.
6. Click **Start Test**.
7. The sensor reads the distance to the concrete surface and calculates slump.

### Step 6: Monitor Live Data

| Display | What It Shows |
|---|---|
| Sensor Distance Card | Raw distance from sensor to concrete surface (mm) |
| Slump Value Card | Calculated slump = cone height − sensor distance (mm) |
| Deviation Card | Difference from target slump (mm) |
| Status Card | Pass/Fail based on tolerance |

### Step 7: Read Results

| Result | Formula | Description |
|---|---|---|
| Slump Value (mm) | Cone Height − Measured Distance | The actual slump |
| Deviation (mm) | |Slump − Target Slump| | How far from target |
| Status | Pass if deviation ≤ tolerance | Conformance check |

**Slump Classification (per ASTM C143):**

| Slump Range (mm) | Classification |
|---|---|
| 0 – 25 | Very Low |
| 25 – 50 | Low |
| 50 – 100 | Medium |
| 100 – 150 | High |
| > 150 | Very High (collapse) |

### Step 8: Generate PDF Report

Click **Download PDF** in the Results panel.

---

## Test 5: Maturity Test (Concrete)

**Purpose:** Estimates the in-situ strength of concrete over time by measuring temperature history and calculating a maturity index, based on the Nurse-Saul maturity function.

**Applicable Standard:** ASTM C1074.

**Sensors Used:**
- DS18B20 Digital Temperature Sensor (OneWire protocol) — embedded in concrete

### Step 1: Hardware Setup

1. Connect the DS18B20:
   - Data → Pin 2 (with 4.7 kΩ pull-up resistor to VCC)
   - VCC → 3.3V or 5V
   - GND → GND
2. Upload the `smartlap_maturity.ino` firmware.
3. **Note:** Multiple DS18B20 sensors can share the same data bus (one-wire protocol).

### Step 2: Open the Maturity Test

1. Log in and select **Concrete** department.
2. Click **Maturity Test**.

### Step 3: Configure Parameters

| Field | Default Value | Description |
|---|---|---|
| Mix ID | MIX-001 | Concrete mix identifier |
| Cement Type | OPC (Type I) | Options: OPC, SRC, PPC |
| W/C Ratio | 0.45 | Water-to-cement ratio |
| Target Strength (MPa) | 30 | Design compressive strength |
| Logging Interval (min) | 15 | Time between temperature readings |

### Step 4: Connect Hardware

Select **USB / Serial** or **Demo Mode**.

### Step 5: Run the Test

1. Cast the concrete specimen and embed the DS18B20 sensor.
2. Click **Start Test**.
3. The system logs temperature at the configured interval.
4. The maturity index is calculated in real-time using the Nurse-Saul function:

   **M(t) = Σ (T − T₀) × Δt**

   Where:
   - M(t) = maturity index (°C·hours)
   - T = measured temperature (°C)
   - T₀ = datum temperature (typically −10°C for OPC)
   - Δt = time interval (hours)

5. Estimated strength is calculated from the maturity-strength relationship.

### Step 6: Monitor Live Data

| Display | What It Shows |
|---|---|
| Temperature Card | Current temperature in °C |
| Maturity Index Card | Accumulated maturity in °C·hours |
| Est. Strength Card | Estimated compressive strength in MPa |
| Elapsed Time Card | Time since test start in hours |
| Strength vs. Maturity Curve | Canvas-drawn chart showing strength development |
| Readings Log | Time, temperature, maturity, and strength for each reading |

### Step 7: Read Results

| Result | Description |
|---|---|
| Final Maturity Index | Total accumulated maturity at end of test |
| Estimated Strength (MPa) | Predicted compressive strength at current maturity |
| Total Elapsed Time | Duration of monitoring |
| Temperature Range | Min and max temperatures recorded |

### Step 8: Generate PDF Report

Click **Download PDF** in the Results panel.

---

## Test 6: Marshall Test (Asphalt)

**Purpose:** Determines the stability and flow values of bituminous mixtures, used for mix design and quality control of hot-mix asphalt (HMA).

**Applicable Standards:** ASTM D6927, AASHTO T245, BS EN 12697-34.

**Sensors Used:**
- HX711 + Load Cell — measures compressive load (stability)
- LVDT Displacement Sensor — measures vertical deformation (flow)

### Step 1: Hardware Setup

1. Connect the HX711 module:
   - HX711 DT → Pin 3
   - HX711 SCK → Pin 2
2. Connect the LVDT:
   - AOUT → Arduino A0 (0–5V analog, maps to 0–25 mm)
3. Connect the load cell wires to HX711.
4. Upload the `smartlap_marshall.ino` firmware.

### Step 2: Open the Marshall Test

1. Log in and select **Asphalt** department.
2. Click **Marshall Test**.

### Step 3: Configure Parameters

| Field | Default Value | Description |
|---|---|---|
| Specimen # | 1 | Specimen number in the series |
| Diameter (mm) | 101.6 | Standard Marshall specimen diameter |
| Height (mm) | 63.5 | Standard Marshall specimen height |
| Loading Rate (mm/min) | 50 | Rate of load application |

### Step 4: Connect Hardware

Select **USB / Serial** or **Demo Mode**.

### Step 5: Run the Test

1. Condition the Marshall specimen to the test temperature (typically 60°C).
2. Place the specimen in the Marshall test head.
3. Click **Start Test**.
4. The load is applied at 50 mm/min.
5. Load and displacement readings are recorded every 100 ms.
6. The test continues until the specimen fails (peak load passed).

### Step 6: Monitor Live Data

| Display | What It Shows |
|---|---|
| Flow Card | Vertical deformation in units of 0.25 mm |
| Stability Card | Current load in Newtons |
| Max Load Card | Peak load reached during test |
| Displacement Card | Total LVDT displacement in mm |
| Stability vs. Flow Curve | Canvas-drawn graph showing load-deformation relationship |

### Step 7: Read Results

| Result | Description |
|---|---|
| Marshall Stability (N) | Peak load at failure |
| Flow Value (0.25mm units) | Deformation at peak load |
| Max Load (N) | Absolute peak load recorded |
| Air Voids (%) | Calculated from specimen density |
| Stability/Flow Ratio | Quality indicator |

**Typical Marshall Mix Criteria:**

| Property | Typical Requirement |
|---|---|
| Stability | ≥ 7,500 N (varies by traffic level) |
| Flow | 2–4 mm (8–16 × 0.25mm units) |
| Air Voids | 3–5% |
| VMA | ≥ specification minimum |

### Step 8: Generate PDF Report

Click **Download PDF** in the Results panel.

---

## Test 7: Bitumen Photo-Tester

**Purpose:** Evaluates the purity and optical properties of bitumen samples by measuring light transmission through a bitumen film using a digital light sensor.

**Applicable Standards:** Related to ASTM D5 (Penetration), ASTM D36 (Softening Point), BS EN 1426.

**Sensors Used:**
- BH1750 Light Intensity Sensor (I2C) — measures light transmission through bitumen

### Step 1: Hardware Setup

1. Connect the BH1750 sensor (I2C):
   - SDA → A4
   - SCL → A5
   - VCC → 3.3V
   - GND → GND
   - ADDR → GND (I2C address 0x23)
2. Upload the `smartlap_bitumen.ino` firmware.
3. **Alternative:** If BH1750 is unavailable, use an analog photodiode connected to A0.

### Step 2: Open the Bitumen Photo-Tester

1. Log in and select **Asphalt** department.
2. Click **Bitumen Photo-Tester**.

### Step 3: Configure Parameters

| Field | Default Value | Description |
|---|---|---|
| Sample ID | BIT-001 | Bitumen sample identifier |
| Bitumen Grade | 40/50 | Options: 40/50, 60/70, 80/100 |
| Solvent Ratio (%) | 5 | Dilution ratio if using solvent-based method |

### Step 4: Connect Hardware

Select **USB / Serial** or **Demo Mode**.

### Step 5: Run the Test

1. Prepare the bitumen film sample (standard thickness).
2. Position the BH1750 sensor above the sample with a calibrated light source below.
3. Click **Start Test**.
4. The sensor reads light intensity (lux) passing through the bitumen film.
5. Transmission percentage and purity index are calculated in real-time.

### Step 6: Monitor Live Data

| Display | What It Shows |
|---|---|
| Light Intensity Card | Measured light in lux |
| Transmission % Card | Percentage of light passing through (relative to reference) |
| Purity Index Card | Normalized purity score (0–100) |
| Status Card | Pass/Fail based on expected transmission range |

### Step 7: Read Results

| Result | Description |
|---|---|
| Light Intensity (lux) | Raw measurement from BH1750 |
| Transmission (%) | Light passing through relative to clear reference |
| Purity Index | Normalized score indicating bitumen purity |
| Status | Conformance to expected range for the grade |

**Interpretation:**

| Transmission Range | Bitumen Condition |
|---|---|
| 0–5% | High purity, typical for fresh bitumen |
| 5–15% | Moderate contamination or weathering |
| > 15% | Possible significant contamination or degradation |

### Step 8: Generate PDF Report

Click **Download PDF** in the Results panel.

---

# Document 3: Hardware Setup Guide

## 3.1 Overview of Supported Sensors

| Sensor | Model | Interface | Used In |
|---|---|---|---|
| Load Cell + ADC | HX711 | Digital (2-wire) | Compaction, CBR, Marshall |
| Soil Moisture | Capacitive v1.2 | Analog (A0) | Compaction |
| Ultrasonic Distance | HC-SR04 | Digital (Trigger/Echo) | CBR, Slump |
| IMU (Gyro + Accel) | MPU6050 | I2C (A4/A5) | Straightedge |
| Laser Distance | VL53L0X | I2C (A4/A5) | Straightedge |
| Temperature | DS18B20 | OneWire (D2) | Maturity |
| Displacement | LVDT (0–5V) | Analog (A0) | Marshall |
| Light Intensity | BH1750 | I2C (A4/A5) | Bitumen |
| Rotary Encoder | Optical | Digital (D2/D3) | Straightedge |

## 3.2 Wiring Diagrams

### Compaction Test Wiring

```
Arduino Uno
┌──────────────────────┐
│                      │
│  Pin 2 ──────────────┤── HX711 SCK
│  Pin 3 ──────────────┤── HX711 DOUT
│  A0    ──────────────┤── Soil Moisture AOUT
│  5V    ──────────────┤── HX711 VCC
│  GND   ──────────────┤── HX711 GND, Soil Moisture GND
│                      │
└──────────────────────┘

HX711 Module              Load Cell (4-wire)
┌─────────┐              ┌────────────────┐
│ VCC ────┤── 5V        │ RED  → E+      │
│ GND ────┤── GND       │ BLACK → E-     │
│ DT  ────┤── Pin 3     │ WHITE → A+     │
│ SCK ────┤── Pin 2     │ GREEN → A-     │
└─────────┘              └────────────────┘

Capacitive Soil Moisture Sensor
┌──────────────────┐
│ AOUT → Arduino A0│
│ VCC  → 3.3V or 5V│
│ GND  → GND       │
└──────────────────┘
```

### CBR Test Wiring

```
Arduino Uno
┌──────────────────────┐
│  Pin 2 ──────────────┤── HX711 SCK
│  Pin 3 ──────────────┤── HX711 DOUT
│  Pin 5 ──────────────┤── HC-SR04 TRIG
│  Pin 6 ──────────────┤── HC-SR04 ECHO
│  Pin 8 ──────────────┤── Motor IN1 (optional)
│  Pin 9 ──────────────┤── Motor IN2 (optional)
│  Pin 10 ─────────────┤── Motor ENA (optional, PWM)
│  5V    ──────────────┤── HX711 VCC, HC-SR04 VCC
│  GND   ──────────────┤── All GND
│                      │
└──────────────────────┘

HC-SR04 Ultrasonic
┌──────────┐
│ TRIG → D5│
│ ECHO → D6│
│ VCC  → 5V│
│ GND  → GND│
└──────────┘
```

### Straightedge Test Wiring

```
Arduino Uno
┌──────────────────────┐
│  A4 (SDA) ───────────┤── MPU6050 SDA, VL53L0X SDA (shared)
│  A5 (SCL) ───────────┤── MPU6050 SCL, VL53L0X SCL (shared)
│  Pin 2 ──────────────┤── Encoder CLK (optional)
│  Pin 3 ──────────────┤── Encoder DT (optional)
│  A0    ──────────────┤── Laser analog (if using Sharp IR)
│  3.3V  ──────────────┤── MPU6050 VCC, VL53L0X VCC
│  GND   ──────────────┤── All GND
│                      │
└──────────────────────┘

MPU6050 IMU (I2C)
┌──────────┐
│ SDA → A4 │
│ SCL → A5 │
│ VCC→3.3V │
│ GND→GND  │
└──────────┘

Note: Both I2C devices (MPU6050 + VL53L0X) share the same
I2C bus (A4/A5). They have different addresses and coexist.
```

### Digital Slump Test Wiring

```
Arduino Uno
┌──────────────────────┐
│  Pin 9  ─────────────┤── HC-SR04 TRIG
│  Pin 10 ─────────────┤── HC-SR04 ECHO
│  5V     ─────────────┤── HC-SR04 VCC
│  GND    ─────────────┤── HC-SR04 GND
│                      │
└──────────────────────┘
```

### Concrete Maturity Test Wiring

```
Arduino Uno
┌──────────────────────┐
│  Pin 2  ─────────────┤── DS18B20 Data (with 4.7kΩ pull-up)
│  5V     ─────────────┤── DS18B20 VCC
│  GND    ─────────────┤── DS18B20 GND
│                      │
└──────────────────────┘

DS18B20 Wiring Detail:
                    4.7kΩ
  Pin 2 ───────┬───────┤├──── 5V
               │
  DS18B20 ─────┤
  Data ────────┘
  VCC ───────────────────── 5V
  GND ───────────────────── GND
```

> **Critical:** The 4.7 kΩ pull-up resistor between the Data line and VCC is mandatory. Without it, the DS18B20 will not communicate reliably.

### Marshall Test Wiring

```
Arduino Uno
┌──────────────────────┐
│  Pin 2 ──────────────┤── HX711 SCK
│  Pin 3 ──────────────┤── HX711 DT
│  A0    ──────────────┤── LVDT AOUT (0-5V analog)
│  5V    ──────────────┤── HX711 VCC
│  GND   ──────────────┤── HX711 GND, LVDT GND
│                      │
└──────────────────────┘

LVDT Sensor
┌──────────┐
│ AOUT → A0│  (0-5V maps to 0-25mm)
│ VCC  → 5V│
│ GND  → GND│
└──────────┘
```

### Bitumen Photo-Tester Wiring

```
Arduino Uno
┌──────────────────────┐
│  A4 (SDA) ───────────┤── BH1750 SDA
│  A5 (SCL) ───────────┤── BH1750 SCL
│  3.3V  ──────────────┤── BH1750 VCC
│  GND   ──────────────┤── BH1750 GND
│  GND   ──────────────┤── BH1750 ADDR (sets I2C address to 0x23)
│                      │
└──────────────────────┘

BH1750 Light Sensor
┌──────────┐
│ SDA → A4 │
│ SCL → A5 │
│ VCC→3.3V │
│ GND→GND  │
│ ADDR→GND │  (address = 0x23)
└──────────┘
```

## 3.3 Arduino Firmware Upload Instructions

### Prerequisites

1. Install the **Arduino IDE** (version 2.x recommended) from [https://www.arduino.cc/en/software](https://www.arduino.cc/en/software).
2. Connect your Arduino board to the computer via USB.
3. In the Arduino IDE, select:
   - **Tools → Board** → "Arduino Uno" (or your board type)
   - **Tools → Port** → Select the COM port for your Arduino

### Required Libraries

Install these libraries via **Sketch → Include Library → Manage Libraries**:

| Library | Used By | Install Name |
|---|---|---|
| HX711 | Compaction, CBR, Marshall | "HX711 ADC" by Bogdan Necula |
| OneWire | Maturity | "OneWire" by Paul Stoffregen |
| DallasTemperature | Maturity | "DallasTemperature" by Miles Burton |
| MPU6050_tockn | Straightedge | "MPU6050_tockn" by Tockn |
| Wire (built-in) | Straightedge, Bitumen | Included with Arduino IDE |

### Upload Procedure (All Firmware Files)

1. Open the appropriate `.ino` file from the `firmware/` folder:
   - `smartlap_compaction.ino` — for Compaction Test
   - `smartlap_cbr.ino` — for CBR Test
   - `smartlap_straightedge.ino` — for Straightedge Test
   - `smartlap_slump.ino` — for Digital Slump Test
   - `smartlap_maturity.ino` — for Maturity Test
   - `smartlap_marshall.ino` — for Marshall Test
   - `smartlap_bitumen.ino` — for Bitumen Photo-Tester

2. Install any required libraries (see table above).
3. Click the **Upload** button (→ arrow icon) or press `Ctrl+U`.
4. Wait for the "Done uploading" message.
5. Open **Tools → Serial Monitor** (or press `Ctrl+Shift+M`) to verify:
   - Set baud rate to **9600**.
   - You should see: `SmartLAP:READY` (or the test-specific ready message).

### Uploading to ESP32

If using an ESP32 board instead of Arduino:
1. In Arduino IDE, go to **Tools → Board** and select your ESP32 variant.
2. The pin numbers may differ — update the `#define` values at the top of the firmware file.
3. ESP32 supports Wi-Fi and Bluetooth natively, enabling LAN and Bluetooth connections.

## 3.4 Calibration Procedures

### Load Cell Calibration (HX711)

**Used in:** Compaction, CBR, Marshall tests.

1. Upload the firmware to the Arduino.
2. Open Serial Monitor at 9600 baud.
3. Send the command `STATUS` — note the current reading with no load.
4. Send `TARE` to zero the scale.
5. Place a **known weight** on the load cell.
6. Read the value from Serial Monitor.
7. Calculate the calibration factor:
   ```
   CALIBRATION_FACTOR = raw_reading / known_weight_in_kg
   ```
8. Update the `#define CALIBRATION_FACTOR` value in the firmware.
9. Re-upload the firmware.
10. Verify by placing the known weight again — the reading should match.

> **Tip:** For CBR tests (high-capacity load cells, 0–50 kN), use calibrated test weights or a compression testing machine for calibration reference.

### Soil Moisture Sensor Calibration

**Used in:** Compaction test.

1. Power on the sensor with no soil nearby (dry air reading).
2. Read the analog value from Serial Monitor or Arduino code.
3. Record as `SOIL_DRY` (typically ~520).
4. Submerge the sensor in water-saturated soil.
5. Read the analog value.
6. Record as `SOIL_WET` (typically ~260).
7. Update the `#define SOIL_DRY` and `#define SOIL_WET` values in the firmware.
8. Re-upload.

### Ultrasonic Sensor Calibration (HC-SR04)

**Used in:** CBR and Slump tests.

1. Place the sensor at a **known distance** from a flat surface.
2. Read the distance value from Serial Monitor.
3. If the reading differs from the actual distance, adjust the timing multiplier in the firmware (currently `0.0343`).
4. For CBR: Measure and record `SENSOR_TO_SURFACE_CM` — the distance from the sensor to the piston base when the piston is touching the soil surface.

### LVDT Calibration

**Used in:** Marshall test.

1. With the LVDT at its zero position (no displacement), note the analog reading.
2. Move the LVDT to its maximum displacement (25 mm) using a micrometer or gauge block.
3. Note the analog reading.
4. Verify the mapping: `(raw / 1023.0) × LVDT_RANGE_MM` produces the correct mm value.
5. Adjust `LVDT_RANGE_MM` in firmware if necessary.

### DS18B20 Calibration

**Used in:** Maturity test.

1. DS18B20 sensors are factory-calibrated (±0.5°C accuracy).
2. For higher accuracy, compare readings with a certified thermometer in an ice bath (should read 0°C) and boiling water (should read ~100°C, adjusted for altitude).
3. If offset is consistent, apply a correction factor in the firmware.

### BH1750 Calibration

**Used in:** Bitumen Photo-Tester.

1. With no bitumen sample (clear path), the sensor should read the maximum lux value from your light source.
2. Record this as the reference reading.
3. With a known standard sample, verify the transmission calculation: `(lux / reference_lux) × 100%`.
4. If readings are off, verify the I2C connection and check the ADDR pin connection.

## 3.5 Troubleshooting Common Issues

### Connection Issues

| Problem | Possible Cause | Solution |
|---|---|---|
| Arduino not detected in browser | Web Serial not supported | Use Google Chrome 89+ or Edge 89+ |
| COM port not listed | Driver not installed | Install CH340/FTDI driver for your Arduino clone |
| "Port already in use" error | Another program using the port | Close Arduino IDE Serial Monitor, PuTTY, or other serial tools |
| Bluetooth not scanning | BLE not supported | Ensure browser supports Web Bluetooth (Chrome) |
| LAN connection fails | Wrong IP or firewall | Verify IP address, check firewall allows port 80 |

### Sensor Issues

| Problem | Possible Cause | Solution |
|---|---|---|
| HX711 reads zero or erratic | Wiring error | Check DOUT and SCK pin connections; verify load cell wires |
| HX711 reads negative values | Calibration factor sign | Change `CALIBRATION_FACTOR` to negative value (e.g., `-7050.0`) |
| Soil moisture always reads 0% or 100% | Calibration constants wrong | Recalibrate SOIL_DRY and SOIL_WET values |
| HC-SR04 reads 0 or -1 | Sensor not receiving echo | Check TRIG/ECHO wiring; ensure no obstacles too close (<2 cm) |
| DS18B20 reads -127°C | Missing pull-up resistor | Add 4.7 kΩ pull-up resistor on Data line to VCC |
| MPU6050 not responding | I2C address conflict | Check I2C wiring; use I2C scanner sketch to verify address |
| BH1750 always reads 0 | ADDR pin not connected | Connect ADDR pin to GND (address 0x23) |
| LVDT readings noisy | Electrical interference | Use shielded cable; add 100nF capacitor across LVDT power pins |

### Software Issues

| Problem | Possible Cause | Solution |
|---|---|---|
| "weasyprint not installed" error | Missing Python dependency | Run `pip install weasyprint` |
| PDF not generating | WeasyPrint missing or crash | Install WeasyPrint system dependencies (see below) |
| Firebase sync not working | Network or config issue | Check internet connection; verify Firebase configuration |
| Demo mode shows no data | JavaScript error | Check browser console (F12) for errors; refresh the page |
| Language not switching | Browser cache | Clear cache and reload; or try incognito mode |

### WeasyPrint System Dependencies (for self-hosted PDF generation)

**Ubuntu/Debian:**
```bash
sudo apt install libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev libcairo2
```

**macOS:**
```bash
brew install pango gdk-pixbuf libffi
```

**Windows:**
Download the WeasyPrint Windows build from the official website, or use the standalone installer.

---

# Document 4: API Reference

## 4.1 System Architecture

SmartLAP uses a dual architecture:

1. **Client-Side (Browser):** The main application runs as a single-page application (SPA) in the browser. It handles authentication, UI rendering, real-time serial communication, sensor data processing, and PDF generation via jsPDF.

2. **Server-Side (Optional):** A Flask-based Python backend provides REST APIs for COM port enumeration, test session management, PDF report generation (via WeasyPrint), and SQLite database storage.

3. **Cloud Sync:** Firebase Firestore stores session data for cloud-based history and multi-device access.

## 4.2 Firebase Firestore Data Model

### Project Configuration

- **Project ID:** `smartlab-5e4e7`
- **Firestore Database:** Cloud Firestore (NoSQL)
- **Authentication:** Firebase Auth (Email/Password, Google, Anonymous)

### Collections

#### Collection: `users`

Stores user profile information (managed by Firebase Auth, extended in Firestore).

```
users/{userId}
├── name: string              // Full name
├── email: string             // Email address
├── role: string              // "engineer", "admin", "guest"
├── createdAt: timestamp      // Account creation time
└── lastLogin: timestamp      // Last login time
```

#### Collection: `sessions`

Stores test session results synced to the cloud.

```
sessions/{sessionId}
├── userId: string             // Reference to users collection
├── testId: string             // Test identifier
├── testName: string           // Display name of the test
├── domainId: string           // Department identifier
├── domainName: string         // Department display name
├── engineerInputs: map        // Key-value pairs of test parameters
├── sensorData: map            // Raw sensor readings
├── results: map               // Calculated results
├── status: string             // "pass", "fail", "pending"
├── createdAt: timestamp       // Test execution time
└── deviceInfo: map            // Connection type, firmware version
```

#### Collection: `calibrations`

Stores sensor calibration data (optional, for advanced users).

```
calibrations/{calibrationId}
├── userId: string
├── sensorType: string         // "hx711", "soil_moisture", "ds18b20", etc.
├── calibrationFactor: number  // Calibration constant
├── zeroOffset: number         // Zero offset value
├── calibratedAt: timestamp
└── notes: string
```

## 4.3 REST API Endpoints (Flask Backend)

### Base URL

- Local: `http://localhost:5000`
- Production: `https://smartlab.fimtosoft.com`

### Endpoints

#### GET `/`

Returns the login page.

**Response:** HTML page

---

#### GET `/dashboard/<domain_id>`

Returns the dashboard for a specific department.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| domain_id | integer | Department ID (1=Roads & Soil, 2=Concrete, 3=Asphalt) |

**Response:** HTML page with domain info and test list

---

#### GET `/test/<test_id>`

Returns the test interface page for a specific test.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| test_id | integer | Test ID |

**Response:** HTML page with test setup interface

---

#### GET `/api/com-ports`

Lists all available serial (COM) ports on the server machine.

**Response (JSON):**
```json
[
    {
        "device": "COM3",
        "description": "Arduino Uno"
    },
    {
        "device": "COM5",
        "description": "USB-SERIAL CH340"
    }
]
```

---

#### POST `/api/test/start`

Starts a new test session, reads sensor data, and calculates results.

**Request Body (JSON):**
```json
{
    "test_id": 1,
    "engineer_inputs": {
        "hammer_weight": 2.5,
        "mold_volume": 0.001,
        "ref_weight": 2.0,
        "target_strikes": 25,
        "target_ratio": 95
    },
    "com_port": "COM3"
}
```

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| test_id | integer | Yes | ID of the test to run |
| engineer_inputs | object | No | Key-value pairs of test parameters |
| com_port | string | No | Serial port to read from (omit for demo) |

**Response (JSON):**
```json
{
    "sensor_data": {
        "moisture_percentage": 12.5,
        "impact_force": 245.30
    },
    "results": {
        "moisture_percentage": 12.50,
        "moisture_weight": 0.0250,
        "dry_density": 1975.0,
        "impact_force": 245.30,
        "max_dry_density": 1975.0,
        "optimum_moisture": 12.50,
        "status": "ناجح"
    },
    "session_id": 42
}
```

**Error Response (JSON):**
```json
{
    "error": "تعذّر الاتصال بالمستشعر: [error details]"
}
```

---

#### GET `/api/sessions/<test_id>`

Retrieves all past sessions for a specific test.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| test_id | integer | Test ID to retrieve history for |

**Response (JSON):**
```json
[
    {
        "id": 42,
        "created_at": "2026-07-22 14:30",
        "results": {
            "dry_density": 1975.0,
            "status": "ناجح"
        },
        "sensor_data": {
            "moisture_percentage": 12.5,
            "impact_force": 245.3
        }
    }
]
```

---

#### GET `/api/report/<session_id>`

Generates and downloads a PDF report for a completed test session.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| session_id | integer | ID of the completed session |

**Response:** Binary PDF file (Content-Type: `application/pdf`)

**Download Name:** `report_<session_id>.pdf`

**Error Responses:**
- `500` — WeasyPrint not installed
- `404` — Session not found

---

#### POST `/api/domain/add`

Adds a new department (domain) to the system.

**Request Body (JSON):**
```json
{
    "name": "New Department Name",
    "description": "Optional description"
}
```

**Response (JSON):**
```json
{
    "id": 4,
    "name": "New Department Name"
}
```

**Error Responses:**
- `400` — Name is empty
- `409` — Department already exists

## 4.4 Test Result Schemas

### Compaction Test Results

```json
{
    "moisture_percentage": "number",    // Moisture content from sensor (%)
    "moisture_weight": "number",        // Calculated water weight (kg)
    "dry_density": "number",            // Dry density (kg/m³)
    "impact_force": "number",           // Average compaction force (N)
    "max_dry_density": "number",        // Maximum dry density (kg/m³)
    "optimum_moisture": "number",       // Optimum moisture content (%)
    "status": "string"                  // "ناجح" (Pass) or "فاشل" (Fail)
}
```

**Calculation Formulas:**
- `moisture_weight = (moisture_percentage / 100) × reference_weight`
- `dry_weight = reference_weight − moisture_weight`
- `dry_density = dry_weight / mold_volume`

### Moisture Content Test Results

```json
{
    "calculated_moisture": "number",    // From oven-dry method (%)
    "sensor_moisture": "number",        // From electronic sensor (%)
    "difference": "number",             // Absolute difference (%)
    "status": "string"                  // "ناجح" or "يتطلب مراجعة"
}
```

**Calculation Formulas:**
- `calculated_moisture = ((wet_weight − dry_weight) / dry_weight) × 100`
- `difference = |calculated_moisture − sensor_moisture|`
- Status is "ناجح" if difference < 2%, otherwise "يتطلب مراجعة" (needs review)

### CBR Test Results

```json
{
    "cbr_25mm": "number",               // CBR at 2.5mm penetration (%)
    "cbr_50mm": "number",               // CBR at 5.0mm penetration (%)
    "final_cbr": "number",              // Final CBR value (higher of the two)
    "max_load": "number",               // Peak load (N)
    "max_pressure": "number",           // Peak pressure (kPa)
    "penetration_readings": [           // Array of readings
        {
            "penetration_mm": "number",
            "load_n": "number",
            "pressure_kpa": "number"
        }
    ],
    "status": "string"                  // Pass/Fail
}
```

**Calculation Formulas:**
- `pressure = load / piston_area` (in kPa, where piston_area is in m²)
- `cbr_25mm = (test_load_at_2.5mm / 13240) × 100`
- `cbr_50mm = (test_load_at_5.0mm / 19960) × 100`

### Straightedge Test Results

```json
{
    "max_deviation_mm": "number",       // Maximum irregularity (mm)
    "avg_deviation_mm": "number",       // Average irregularity (mm)
    "total_distance_m": "number",       // Total distance tested (m)
    "readings": [                       // Array of readings
        {
            "position_m": "number",
            "irregularity_mm": "number",
            "inclination_deg": "number"
        }
    ],
    "status": "string"                  // Pass/Fail based on tolerance
}
```

### Digital Slump Test Results

```json
{
    "sensor_distance_mm": "number",     // Raw distance from sensor (mm)
    "slump_value_mm": "number",         // Calculated slump (mm)
    "deviation_mm": "number",           // |slump − target| (mm)
    "target_slump_mm": "number",        // Target value entered
    "cone_height_mm": "number",         // Cone height entered
    "status": "string"                  // Pass/Fail based on tolerance
}
```

**Calculation Formula:**
- `slump = cone_height − sensor_distance`

### Maturity Test Results

```json
{
    "maturity_index": "number",         // Accumulated maturity (°C·hours)
    "estimated_strength_mpa": "number", // Predicted compressive strength (MPa)
    "current_temperature_c": "number",  // Latest temperature reading (°C)
    "elapsed_hours": "number",          // Time since test start (hours)
    "temperature_range": {              // Temperature statistics
        "min_c": "number",
        "max_c": "number",
        "avg_c": "number"
    },
    "readings": [                       // Array of readings
        {
            "time_hours": "number",
            "temperature_c": "number",
            "maturity": "number",
            "strength_mpa": "number"
        }
    ]
}
```

**Nurse-Saul Maturity Function:**
- `M(t) = Σ (T_i − T₀) × Δt_i`
- Where T₀ = −10°C (datum temperature for OPC)
- Strength is estimated from the maturity-strength relationship (calibrated per mix)

### Marshall Test Results

```json
{
    "stability_n": "number",            // Peak load (Marshall stability) in Newtons
    "flow_value": "number",             // Deformation at peak load (units of 0.25mm)
    "max_load_n": "number",             // Absolute peak load (N)
    "displacement_mm": "number",        // Total LVDT displacement (mm)
    "readings": [                       // Array of readings
        {
            "load_n": "number",
            "displacement_mm": "number",
            "time_s": "number"
        }
    ],
    "status": "string"                  // Pass/Fail based on project criteria
}
```

### Bitumen Photo-Tester Results

```json
{
    "light_intensity_lux": "number",    // Raw light reading (lux)
    "transmission_pct": "number",       // Transmission percentage (%)
    "purity_index": "number",           // Purity score (0–100)
    "bitumen_grade": "string",          // e.g., "40/50", "60/70"
    "status": "string"                  // Pass/Fail based on expected range
}
```

**Calculation Formulas:**
- `transmission = (lux / reference_lux) × 100`
- `purity_index = map(lux, 0, 65535, 0, 100)`

## 4.5 Serial Communication Protocol

### Firmware-to-Browser Protocol

All firmware files communicate at **9600 baud** over serial.

**Ready Signal (from firmware):**
```
SmartLAP:READY
```

**Data Format (Compaction Test):**
```
moisture_pct,force_n
```
Example: `12.50,245.30`

**Data Format (CBR Test):**
```
penetration_mm,load_newtons
```
Example: `2.50,5000.00`

**Data Format (Straightedge Test):**
```
position_m,irregularity_mm,inclination_deg
```
Example: `1.50,-3.20,0.45`

**Data Format (Slump Test):**
```
distance_cm:20.5,slump_cm:10.0
```

**Data Format (Maturity Test):**
```
temperature_celsius:24.50
```

**Data Format (Marshall Test):**
```
load_newtons:1500.00,displacement_mm:2.350
```

**Data Format (Bitumen Photo-Tester):**
```
light_intensity_lux:234.5,transmission_pct:23.45,purity_index:45
```

### Browser-to-Firmware Commands

| Command | Action |
|---|---|
| `START` | Begin test; re-zero sensors |
| `STOP` | Stop test; halt motor (if applicable) |
| `TARE` | Zero the load cell |
| `STATUS` | Return current sensor readings |

## 4.6 Domain and Test IDs

### Departments (Domains)

| ID | Name (Arabic) | Name (English) |
|---|---|---|
| 1 | قسم الطرق والتربة | Roads & Soil |
| 2 | قسم الخرسانة | Concrete |
| 3 | قسم الأسفلت | Asphalt |

### Tests

| ID | Name | Domain | Firmware File |
|---|---|---|---|
| 1 | اختبار الدمك (Compaction) | Roads & Soil (1) | smartlap_compaction.ino |
| 2 | اختبار تحديد الرطوبة (Moisture) | Roads & Soil (1) | Uses same as compaction |
| 3 | اختبار الانضباط (Slump) | Concrete (2) | smartlap_slump.ino |
| 4 | اختبار الانساب (Marshall) | Asphalt (3) | smartlap_marshall.ino |

> **Note:** The database is seeded automatically on first run. Additional tests (CBR, Straightedge, Maturity, Bitumen) are available via the browser-based interface with dedicated firmware files.

---

# Appendix A: Contact and Support

| Channel | Details |
|---|---|
| **Email** | info@fimtosoft.com |
| **Egypt Office** | 01001006627 |
| **Saudi Arabia Office** | 0500439617 |
| **WhatsApp** | +20 100 100 6627 |
| **Website** | [https://fimtosoft.com](https://fimtosoft.com) |
| **SmartLAP** | [https://smartlab.fimtosoft.com](https://smartlab.fimtosoft.com) |

# Appendix B: Applicable Standards Summary

| Test | Standards |
|---|---|
| Compaction (Proctor) | ASTM D698, ASTM D1557, AASHTO T99/T180, BS 1377 Part 4 |
| CBR | ASTM D1883, AASHTO T193, BS 1377 Part 9 |
| Moisture Content | ASTM D2216, AASHTO T265 |
| Straightedge | ASTM E1364, AASHTO R 41 |
| Concrete Slump | ASTM C143/C143M, AASHTO T119, BS 1881 Part 102 |
| Concrete Maturity | ASTM C1074 |
| Marshall Stability | ASTM D6927, AASHTO T245, BS EN 12697-34 |
| Bitumen Penetration | ASTM D5, AASHTO T49, BS EN 1426 |
| Bitumen Softening Point | ASTM D36, AASHTO T53 |

# Appendix C: Glossary

| Term | Definition |
|---|---|
| **CBR** | California Bearing Ratio — a measure of soil bearing capacity |
| **HMA** | Hot-Mix Asphalt |
| **HX711** | A 24-bit analog-to-digital converter designed for load cells |
| **IMU** | Inertial Measurement Unit — combines gyroscope and accelerometer |
| **LVDT** | Linear Variable Differential Transformer — a displacement sensor |
| **MPU6050** | A 6-axis motion sensor (3-axis gyroscope + 3-axis accelerometer) |
| **Proctor Test** | A test to determine the optimal moisture content for soil compaction |
| **OneWire** | A communication protocol requiring only one data wire |
| **I2C** | Inter-Integrated Circuit — a serial communication protocol using SDA/SCL lines |
| **Web Serial API** | A browser API that allows web apps to communicate with serial devices |

---

*© 2026 Fimto Soft — Integrated Tech Solutions. All rights reserved.*
*SmartLAP v1.0.0*
