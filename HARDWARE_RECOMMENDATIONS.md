# SmartLAP Hardware Recommendations

> **Document Version:** 1.0 | **Date:** July 2026 | **Status:** Research-Only

---

## Table of Contents

1. Architecture Overview
2. Department 1: Roads and Soil
3. Department 2: Concrete
4. Department 3: Asphalt
5. Shared Infrastructure
6. Software Stack Recommendations
7. Cost Summary

---

## 1. Architecture Overview

### Recommended MCU Strategy: Hybrid ESP32 + STM32

For SmartLAP, a dual-MCU architecture is recommended across all test stations:

| Component | Role | Justification |
|---|---|---|
| ESP32-WROOM-32E | Main controller + Wi-Fi/BLE gateway | Built-in Wi-Fi 4 + BLE 4.2, dual-core 240 MHz, 18-ch 12-bit ADC, $3-5 |
| STM32G474 (optional) | Precision ADC + motor control | 12-bit ADC, DAC, advanced timers for PWM/motor control, industrial-grade |

For most tests, ESP32 alone is sufficient when paired with the HX711 external ADC. Use STM32 only for tests requiring precision motor control (Marshall, Ductility, Proctor compaction).

### Common Signal Conditioning Block

```
Sensor -> Signal Conditioner -> ADC/MCU -> Wi-Fi -> Cloud
                |
         HX711 / ADS1232 / ADS1115
```

### HX711 ADC Specifications

| Parameter | Value |
|---|---|
| Resolution | 24-bit Sigma-Delta |
| Programmable Gain | 32, 64, 128 |
| Channels | 2 differential (A, B) |
| Output Rate | 10 SPS or 80 SPS |
| Supply Voltage | 2.6 - 5.5V |
| Current | < 1.5 mA active, < 1 uA power-down |
| Operating Temp | -40 to +85 C |
| Package | SOP-16 |
| Price | $1-2 (breakout module) |

### ADS1115 ADC Specifications (Alternative for Analog Sensors)

| Parameter | Value |
|---|---|
| Resolution | 16-bit |
| Channels | 4 single-ended or 2 differential |
| Sample Rate | 8 to 860 SPS |
| Gain Error | +/-0.25% |
| Supply | 2.0 - 5.5V |
| Interface | I2C |
| Price | $4-5 (breakout module) |

---

## 2. Department 1: Roads and Soil

### 2.1 Proctor Compaction Test (ASTM D698 / D1557)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Load Cell | ATO Low Profile Spoke Type 100 kN | 100 kN, 2.0 mV/V, +/-0.05% F.S., alloy steel | $229 | ato.com |
| Alt. Load Cell | TE Connectivity EFN24-100KN | 100 kN, compression, high accuracy | $250-350 | te.com / Mouser |
| MCU | ESP32-WROOM-32E | Dual-core 240 MHz, Wi-Fi + BLE | $4 | AliExpress / DigiKey |
| Signal Conditioning | HX711 24-bit ADC Module | 24-bit Sigma-Delta, PGA 64/128, 10/80 SPS | $2 | AliExpress / Amazon |
| Alt. ADC | ADS1232 24-bit ADC | 24-bit, 2 kHz, built-in PGA, more precise than HX711 | $8 | AliExpress |
| Actuator | 12V DC Linear Actuator (100 mm stroke) | 150 kg force, 10 mm/s, with pot feedback | $35-60 | Amazon / Cytron |
| Stepper Driver | A4988 or DRV8825 Module | Microstepping, 2A max | $3 | AliExpress |
| Display | 0.96" I2C OLED (SSD1306) | 128x64, I2C | $3 | AliExpress |
| Enclosure | IP65 ABS Junction Box (200x120x75 mm) | Dust/water resistant, DIN-rail mount | $15 | Amazon |
| Power Supply | Mean Well HDR-30-24 (24V, 1.5A) | Industrial DIN-rail, 24V DC | $15 | DigiKey |
| **Total (est.)** | | | **$310 - $390** | |

### 2.2 CBR Test (ASTM D1883)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Load Cell | ATO Low Profile 50 kN | 50 kN, 2.0 mV/V, +/-0.05% F.S. | $200 | ato.com |
| LVDT Displacement | TE Connectivity PR Series LVDT | +/-1.25-250 mm range, +/-0.25% linearity, IP61 | $150-300 | te.com / Mouser |
| Budget Displacement | Linear Potentiometer 100 mm | 100 mm stroke, 0.1% linearity, 10 kOhm | $20-35 | AliExpress |
| MCU | ESP32-WROOM-32E | Dual-core, Wi-Fi + BLE | $4 | AliExpress |
| Signal Cond. (Load) | HX711 24-bit ADC | 24-bit, PGA 128 | $2 | AliExpress |
| Signal Cond. (LVDT) | AD698 LVDT Signal Conditioner | Complete LVDT-to-analog, +/-12V output | $25-40 | Analog Devices / Mouser |
| Actuator | 12V Linear Actuator (150 mm stroke) | 500 N force, 5 mm/s, position feedback | $50 | Amazon |
| Display | 3.5" TFT ILI9488 with Touch | 320x480, SPI, touch interface | $12 | AliExpress |
| Enclosure | IP65 Metal Enclosure (250x150x100 mm) | Dust/water resistant, lab-grade | $25 | Amazon |
| **Total (est.)** | | | **$470 - $670** | |

### 2.3 Straightedge Test (Surface Regularity)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Displacement Sensors | Keyence IL-100 or Acuity AR700 Laser | 10-100 mm range, +/-0.01 mm, 1-4 kHz | $500-1200 | keyence.com / acuitylaser.com |
| Budget Option | Inductive Proximity + LVDT combo | 0-25 mm, +/-0.5% F.S. | $80-150 | AliExpress / Futek |
| MCU | ESP32-WROOM-32E | For data logging + Wi-Fi | $4 | AliExpress |
| Alt. MCU | STM32F407VET6 | 168 MHz, 3x 12-bit ADC, 24-ch, multi-sensor sync | $12 | AliExpress |
| Signal Conditioning | ADS1115 16-bit I2C ADC | 4-ch, 860 SPS, +/-0.25% gain error | $5 | Adafruit / AliExpress |
| Encoder | Rotary Encoder 600 PPR (optical) | Quadrature, for distance measurement | $15 | AliExpress |
| Actuator | NEMA 17 Stepper + Lead Screw | 26 Ncm, 1.8 deg, 200 mm travel, 0.01 mm/step | $35 | oyostepper.com / Cytron |
| Stepper Driver | DRV8825 Module | Microstepping up to 1/32 | $3 | AliExpress |
| Enclosure | IP67 Pelican-style Case (300x200x150 mm) | For portable field use | $40 | Amazon |
| **Total (est.)** | | | **$630 - $1410** | |

---

## 3. Department 2: Concrete

### 3.1 Slump Test (ASTM C143)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Load Cell | ATO Button Type 5 kN | 5 kN, compression, compact, 2.0 mV/V | $120 | ato.com |
| Alt. Load Cell | Anyload 108AA Button Load Cell | 5 kN, stainless steel, 2 mV/V | $150 | anyload.com |
| Distance Sensor | Sharp GP2Y0A21YK0F IR Distance | 10-80 cm, analog output, +/-1 cm | $12 | AliExpress / SparkFun |
| Better Distance | MaxBotix MB1240 XL-MaxSonar | 20-765 cm, 1 cm resolution, RS232/TTL | $40 | maxbotix.com |
| Laser Option | Benewake TFmini-S LiDAR | 0.1-12 m, 1 cm, 1000 Hz, UART | $60 | AliExpress |
| MCU | ESP32-WROOM-32E | Wi-Fi for real-time data push | $4 | AliExpress |
| Signal Conditioning | HX711 24-bit ADC | For load cell reading | $2 | AliExpress |
| Display | 2.4" TFT ILI9341 | 240x320, SPI, touch | $7 | AliExpress |
| Enclosure | IP65 ABS Box (150x100x60 mm) | Compact, splash-proof | $10 | Amazon |
| **Total (est.)** | | | **$195 - $265** | |

### 3.2 Maturity Test (ASTM C1074)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Temperature Sensor | DS18B20 (Waterproof) | -55C to +125C, +/-0.5C, digital 1-Wire | $3 each | AliExpress |
| Alt. (Pro) | Giatec SmartRock 3 | Wireless, dual-temp, ASTM C1074 compliant, BLE | $150-200/sensor | giatecscientific.com |
| Alt. (Pro) | Maturix Nova Sensor | Embeddable, 2-3 temp points, 1+ year battery, BLE | $80-120/sensor | maturix.com |
| MCU | ESP32-WROOM-32E | BLE for SmartRock/Maturix + Wi-Fi for data | $4 | AliExpress |
| Budget MCU | Arduino Nano 33 BLE Sense | Built-in IMU + temp, BLE 5.0 | $27 | Arduino Store |
| Signal Conditioning | DS18B20 requires no external ADC | Digital protocol, parasitic power supported | $0 | N/A |
| Battery | 3.7V 18650 Li-ion (2600 mAh) | Long-life for embedded deployment | $5 | AliExpress |
| Enclosure | Epoxy Potting / Silicone Encapsulant | Waterproof, embeddable in concrete | $10 | Amazon |
| **Total (DIY est.)** | | | **$22 - $50** | |
| **Total (Commercial est.)** | | | **$80 - $200/sensor** | |

### 3.3 Air Content Test (ASTM C231 - Pressure Method)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Pressure Transducer | Honeywell 26PC Series | 0-30 psi, +/-1% F.S., ratiometric, piezoresistive | $25-50 | honeywell.com / Mouser |
| Alternative | TE Connectivity MS5803-02BA | 0-2 bar, 24-bit, I2C, +/-0.5 mbar | $30 | te.com / Mouser |
| Budget Option | MPX5010DP Differential Pressure | 0-10 kPa, 0.2-4.7V analog, +/-2.5% | $15 | NXP / Mouser |
| MCU | ESP32-WROOM-32E | Wi-Fi for data push, I2C/SPI | $4 | AliExpress |
| Signal Conditioning | ADS1115 16-bit ADC | 4-ch, I2C, for analog pressure sensors | $5 | Adafruit |
| Display | 0.96" OLED SSD1306 | 128x64, I2C | $3 | AliExpress |
| Enclosure | IP65 ABS Box (120x80x50 mm) | Splash-proof for lab/field | $10 | Amazon |
| Calibration Vessel | Type B Air Meter Calibration Kit | ASTM C231 compliant | $150-300 | Humboldt / Deslinc |
| **Total (sensor est.)** | | | **$57 - $102** | |
| **Total (with cal kit)** | | | **$210 - $400** | |

### 3.4 Compressive Strength Test (ASTM C39)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Load Cell | ATO Low Profile 300 kN | 300 kN, spoke type, +/-0.05% F.S., alloy steel | $280 | ato.com |
| Alt. Load Cell | TE Connectivity EFN24-300KN | 300 kN compression, industrial grade | $350-500 | te.com |
| LVDT (optional) | TE Connectivity PR Series | +/-25 mm, for strain measurement | $150 | te.com |
| MCU | ESP32-WROOM-32E | Wi-Fi gateway | $4 | AliExpress |
| Signal Conditioning | HX711 x 2 (load + displacement) | Dual channel reading | $4 | AliExpress |
| Alt. ADC | ADS1232 24-bit | Higher precision for 300 kN loads | $8 | AliExpress |
| Actuator | Hydraulic or screw-driven frame | Already exists in lab (retrofit sensors) | N/A | N/A |
| Alt. Actuator | NEMA 23 Stepper + Ball Screw | 1.2 Nm, 500 mm travel | $80 | oyostepper.com |
| Motor Driver | TB6600 Stepper Driver | 4A, 9-42V, microstepping | $12 | AliExpress |
| Enclosure | IP65 DIN-rail Enclosure (200x120x75 mm) | Industrial-grade | $15 | Amazon |
| **Total (retrofit est.)** | | | **$470 - $770** | |
| **Total (new build est.)** | | | **$570 - $880** | |

---

## 4. Department 3: Asphalt

### 4.1 Marshall Stability Test (ASTM D6927 / AASHTO T245)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Load Cell | ATO Low Profile 50 kN | 50 kN, spoke type, +/-0.05% F.S. | $200 | ato.com |
| Alt. Load Cell | Anyload 106AA Shear Beam 50 kN | 50 kN, IP67, 2 mV/V | $250 | anyload.com |
| Displacement Sensor | Linear Potentiometer 25 mm | 25 mm, 0.001 mm resolution, 5 kOhm | $30 | AliExpress / Testmak |
| MCU | ESP32-WROOM-32E | Wi-Fi + BLE | $4 | AliExpress |
| Signal Cond. (Load) | HX711 24-bit ADC | PGA 128 for load cell | $2 | AliExpress |
| Signal Cond. (Disp.) | ADS1115 16-bit ADC | 4-ch I2C for analog pot | $5 | Adafruit |
| Motor Control | NEMA 23 Stepper + Driver TB6600 | 1.2 Nm, for platen speed 50.8 mm/min | $92 | oyostepper.com |
| Alt. Motor | 12V DC Gear Motor + PID | Geared motor for constant speed | $40 | Amazon |
| Display | 3.5" TFT Touch ILI9488 | 320x480, SPI | $12 | AliExpress |
| Enclosure | IP65 Metal Enclosure (250x150x100 mm) | Industrial-grade | $25 | Amazon |
| **Total (est.)** | | | **$375 - $495** | |

### 4.2 Penetration Test (ASTM D5 / AASHTO T49)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Displacement Sensor | Optical Encoder / LVDT (0-30 mm) | 0.01 mm resolution, spring-loaded | $80-150 | AliExpress / Futek |
| Budget Option | Bourns 3310G Panel Mount Pot | 10 mm, +/-0.25%, 10 kOhm | $10 | Mouser |
| Load (Weight) | 100 g calibrated weight + needle | 2.5 g needle + 97.5 g plunger = 100 g total | $25 | EIE Instruments / Humboldt |
| Timer | ESP32 Built-in Timer | 5-second penetration timing, microsecond precision | $0 | Built-in |
| MCU | ESP32-WROOM-32E | Wi-Fi for data logging | $4 | AliExpress |
| Signal Conditioning | ADS1115 16-bit ADC | For LVDT or pot reading | $5 | Adafruit |
| Actuator | NEMA 8 Micro Stepper + Lead Screw | Small form factor, precise 0.01 mm/step | $25 | AliExpress |
| Display | 0.96" OLED SSD1306 | 128x64, I2C | $3 | AliExpress |
| Enclosure | IP54 ABS Box (100x80x50 mm) | Compact benchtop | $8 | Amazon |
| **Total (est.)** | | | **$160 - $235** | |

### 4.3 Ductility Test (ASTM D113 / AASHTO T51)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Distance Sensor | Linear Encoder 1000 mm | 0.01 mm resolution, incremental, TTL output | $80-120 | AliExpress |
| Alternative | String Potentiometer 1000 mm | 1 m travel, +/-0.1%, analog 0-5V | $40-80 | AliExpress |
| Tension Sensor | S-Type Load Cell 100 N | 100 N, 2.0 mV/V, stainless steel | $60 | ato.com / AliExpress |
| MCU | ESP32-WROOM-32E | Wi-Fi + BLE | $4 | AliExpress |
| Signal Cond. (Tension) | HX711 24-bit ADC | For load cell reading | $2 | AliExpress |
| Signal Cond. (Distance) | ADS1115 16-bit ADC | For encoder/pot reading | $5 | Adafruit |
| Motor | NEMA 17 Stepper + Belt Drive | Constant 50 mm/min, 1 m travel | $50 | Cytron / AliExpress |
| Motor Driver | DRV8825 Module | Microstepping, current control | $3 | AliExpress |
| Water Bath Temp | DS18B20 Waterproof Probe | +/-0.5C, 1-Wire, for 25C/50C bath | $3 | AliExpress |
| Display | 2.4" TFT ILI9341 | 240x320, SPI, touch | $7 | AliExpress |
| Enclosure | IP65 ABS Box (200x120x75 mm) | Splash-proof (near water bath) | $15 | Amazon |
| **Total (est.)** | | | **$230 - $350** | |

### 4.4 Bitumen Content Test (ASTM D6307 / ASTM C1252)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Precision Scale | Ohaus Ranger 3000 | 3 kg, 0.1 g resolution, RS232 | $250 | ohaus.com |
| Budget Scale | Generic 5 kg / 0.1 g | USB + serial, industrial | $30-50 | AliExpress |
| Temperature Sensor | K-Type Thermocouple + MAX6675 | 0-1024C, 0.25C resolution, SPI | $8 | AliExpress |
| Fume Extraction | Existing lab fume hood | Retrofit sensors only | N/A | N/A |
| MCU | ESP32-WROOM-32E | Wi-Fi for data logging | $4 | AliExpress |
| Signal Conditioning | No external ADC needed (serial scale) | Scale communicates via serial/USB | $0 | N/A |
| Display | 0.96" OLED SSD1306 | 128x64 | $3 | AliExpress |
| Enclosure | IP65 ABS Box (100x80x50 mm) | Heat-resistant location | $8 | Amazon |
| **Total (est.)** | | | **$303 - $323** | |

---

## 5. Shared Infrastructure

### 5.1 IoT Gateway (Per Department)

| Component | Recommendation | Specs | Price (est.) | Source |
|---|---|---|---|---|
| Gateway MCU | ESP32-WROOM-32E (or ESP32-S3) | Wi-Fi AP + MQTT broker | $4-6 | AliExpress |
| Alternative | Raspberry Pi 5 (4 GB) | Linux gateway, Docker support | $65 | raspberrypi.com |
| SD Card | SanDisk Industrial 32 GB microSD | High endurance, Class 10 | $15 | Amazon |
| Power | Mean Well HDR-60-24 (24V, 2.5A) | DIN-rail, industrial | $20 | DigiKey |
| UPS | APC Back-UPS 400VA | Battery backup for graceful shutdown | $50 | Amazon |

### 5.2 Enclosure and Mounting Recommendations

| Environment | Recommendation | Rating | Price |
|---|---|---|---|
| Indoor Lab (benches) | ABS Junction Box, DIN-rail mount | IP54-IP65 | $10-25 |
| Near Water/Moisture | Polycarbonate Enclosure, gasket-sealed | IP66 | $20-40 |
| Outdoor/Field | Pelican-style Waterproof Case | IP67 | $40-80 |
| Inside Concrete | Epoxy Potting + Silicone Sealant | Full submersion | $10-15 |
| DIN Rail Mount | Phoenix Contact USL 5008 or equivalent | DIN-rail snap-on | $5-10 |

### 5.3 Common Components Across All Stations

| Component | Model | Price | Notes |
|---|---|---|---|
| HX711 ADC Module | Avia HX711 breakout | $1-2 | For all load cells |
| ADS1115 ADC Module | TI ADS1115 | $5 | For analog sensors |
| OLED Display | SSD1306 0.96" I2C | $3 | Local display |
| DS18B20 Waterproof | Maxim DS18B20 | $3 | Temperature sensing |
| I2C Level Shifter | BSS138-based | $1 | 3.3V/5V bidirectional |
| 24V to 5V Buck Converter | LM2596 module | $2 | Power for ESP32 |
| 24V to 3.3V LDO | AMS1117-3.3 | $1 | Clean analog supply |
| Capacitors (decoupling) | 100nF + 10uF ceramic | $0.50 | Power filtering |
| EMI Ferrite Beads | BLM18PG221 | $0.20 | Noise suppression |

---

## 6. Software Stack Recommendations

### 6.1 IoT Platform

| Platform | Type | License | Best For | Price |
|---|---|---|---|---|
| ThingsBoard CE (Recommended) | Full IoT Platform | Apache 2.0 | Device management, dashboards, rule engine, MQTT/CoAP/HTTP | Free (self-hosted) |
| Node-RED | Flow-based programming | Apache 2.0 | Edge logic, data transformation, protocol bridging | Free |
| Grafana | Visualization layer | AGPL-3.0 | Time-series dashboards, alerting, plugin ecosystem | Free (OSS) |
| EMQX | MQTT Broker | Apache 2.0 | High-throughput MQTT, millions of connections | Free (OSS) |
| ThingsBoard PE | Enterprise IoT | Commercial | Multi-tenancy, white-labeling, advanced rule engine | $4,999+ |

**Recommended Architecture:**

```
ESP32 (MQTT) -> EMQX Broker -> Node-RED (edge logic) -> ThingsBoard (device mgmt + dashboards) -> Grafana (advanced charts)
```

**Key features of ThingsBoard CE:**
- 600+ customizable dashboard widgets
- Rule engine for data processing and alerting
- MQTT, CoAP, HTTP device protocols
- Device provisioning and management APIs
- User/tenant/customer role-based access
- REST API for custom integrations
- Docker deployment support

### 6.2 Time-Series Database

| Database | Engine | License | Query Language | Best For | Price |
|---|---|---|---|---|---|
| TimescaleDB (Recommended) | PostgreSQL extension | Apache 2.0 | Full SQL | Hybrid relational + time-series, existing PostgreSQL skills | Free |
| InfluxDB 3 Core | Arrow/Parquet/Flight | MIT | InfluxQL + SQL | IoT sensor ingestion, Telegraf ecosystem | Free |
| QuestDB | Column-oriented | Apache 2.0 | PostgreSQL wire protocol | Ultra-fast ingestion (1M+ rows/s), financial-grade | Free |

**Recommendation: TimescaleDB** for SmartLAP because:
- Full SQL support (team likely knows SQL)
- Can store both time-series sensor data AND relational lab metadata (operators, standards, calibration)
- PostgreSQL ecosystem (backups, replication, tooling)
- Automatic compression and retention policies
- 3.5x faster analytical queries with v2.26 vectorized execution
- Hypertables automatically partition data by time
- Continuous aggregates for real-time materialized views

### 6.3 Real-Time Charting Library

| Library | License | Bundle Size | Rendering | Best For | npm Downloads/week |
|---|---|---|---|---|---|
| Apache ECharts (Recommended) | Apache 2.0 | ~100 kB gzipped | Canvas (default) | Enterprise dashboards, 100k+ points, IoT, heatmaps | 2.5M |
| Chart.js | MIT | ~92 kB gzipped | Canvas | Simple charts, rapid prototyping, plugin ecosystem | 10.4M |
| Plotly.js | MIT | ~3.5 MB gzipped | WebGL/Canvas | Scientific/engineering, 3D, statistical | 800K |
| ApexCharts | MIT | ~130 kB gzipped | SVG | Modern dashboards, responsive, clean defaults | 500K |
| uPlot | MIT | ~10 kB gzipped | Canvas | Ultra-fast time-series, minimal overhead | 200K |

**Recommendation: Apache ECharts** because:
- Canvas rendering handles large sensor datasets efficiently
- Built-in series.sampling: 'lttb' downsampling for dense time-series
- Rich chart types: line (real-time), gauge (pressure/load), heatmap (temperature maps)
- Excellent documentation, large community
- Works in React/Vue/Angular wrappers
- Battle-tested at Alibaba, Pinterest, BMW

### 6.4 PDF Report Generation

| Library | Type | License | Best For | Approach |
|---|---|---|---|---|
| Puppeteer (Recommended) | HTML to PDF (headless Chrome) | Apache 2.0 | Pixel-perfect lab reports with charts, tables, logos | HTML template to PDF |
| WeasyPrint | HTML to PDF (Python) | BSD | Server-side reports, no JS rendering needed | HTML/CSS to PDF |
| ReportLab | Programmatic PDF (Python) | BSD | Custom layout, programmatic drawing | Python to PDF |
| jsPDF | Client-side PDF | MIT | Simple client-side reports, invoices | JavaScript to PDF |
| pdfmake | Declarative PDF | MIT | JSON-defined documents, tables, lists | JSON to PDF |

**Recommendation: Puppeteer** (Node.js) or **WeasyPrint** (Python) because:
- Lab reports need: headers with logos, tables of test data, embedded charts (as images), signatures
- HTML/CSS templates are easy for lab staff to customize
- Puppeteer renders charts from ECharts as embedded images
- WeasyPrint is simpler (no Chromium needed) if charts are pre-rendered server-side
- Both support page breaks, headers/footers, page numbers

**Suggested PDF workflow:**

```
Sensor Data -> TimescaleDB -> Query for Report -> ECharts (render to PNG) -> HTML Template -> Puppeteer -> PDF Report
```

---

## 7. Cost Summary

### Per-Station Hardware Costs (Excluding Existing Lab Equipment)

| Department | Test | Low Est. | High Est. |
|---|---|---|---|
| Roads and Soil | Proctor Compaction | $310 | $390 |
| Roads and Soil | CBR | $470 | $670 |
| Roads and Soil | Straightedge | $630 | $1,410 |
| Concrete | Slump | $195 | $265 |
| Concrete | Maturity (DIY) | $22 | $50 |
| Concrete | Maturity (Commercial) | $80 | $200/sensor |
| Concrete | Air Content (sensor only) | $57 | $102 |
| Concrete | Compressive Strength | $470 | $770 |
| Asphalt | Marshall Stability | $375 | $495 |
| Asphalt | Penetration | $160 | $235 |
| Asphalt | Ductility | $230 | $350 |
| Asphalt | Bitumen Content | $303 | $323 |
| Shared | IoT Gateway (x3 depts) | $89 | $180 |

### Grand Total Estimate

| Scenario | Estimate |
|---|---|
| Budget (DIY sensors, no commercial units) | $3,300 - $4,500 |
| Mid-Range (mix of DIY + commercial) | $5,000 - $7,500 |
| Professional (commercial sensors + SmartRock) | $8,000 - $12,000 |

### Software Costs

| Component | Cost |
|---|---|
| ThingsBoard CE (self-hosted) | Free |
| TimescaleDB (self-hosted) | Free |
| Grafana OSS | Free |
| Node-RED | Free |
| EMQX Broker | Free |
| Apache ECharts | Free |
| Puppeteer / WeasyPrint | Free |
| **Total Software** | **$0 (all open-source)** |

### Where to Buy Summary

| Supplier | Best For | URL |
|---|---|---|
| AliExpress | ESP32, HX711, OLED, sensors, enclosures, stepper motors | aliexpress.com |
| DigiKey | ESP32-WROOM-32E, Mean Well PSUs, precision components | digikey.com |
| Mouser | TE Connectivity sensors, Honeywell, ADS1115, ADCs | mouser.com |
| Adafruit | ADS1115, OLED, breakout boards, tutorials | adafruit.com |
| ATO.com | Load cells (100kN, 50kN, 300kN), affordable industrial | ato.com |
| Amazon | Linear actuators, enclosures, general components | amazon.com |
| Cytron | NEMA steppers, motor drivers, ESP32 boards | cytron.io |
| oyostepper.com | NEMA 17/23 linear steppers, lead screws | oyostepper.com |

---

## Appendix: Microcontroller Selection Guide

| Test | Recommended MCU | Why |
|---|---|---|
| Proctor Compaction | ESP32 + DRV8825 | Wi-Fi for data push + stepper motor control |
| CBR | ESP32 | Wi-Fi, dual ADC (HX711 + ADS1115) |
| Straightedge | STM32F407 or ESP32 | Multi-sensor sync, high sample rate |
| Slump | ESP32 | Simple sensor + Wi-Fi |
| Maturity | ESP32 (or Arduino Nano 33 BLE) | BLE for commercial sensors, or Wi-Fi for DIY |
| Air Content | ESP32 | I2C pressure sensor + Wi-Fi |
| Compressive Strength | ESP32 + HX711 | High load reading + Wi-Fi |
| Marshall | ESP32 + DRV8825 | Motor control + load cell + Wi-Fi |
| Penetration | ESP32 | Precise timer + displacement ADC |
| Ductility | ESP32 + DRV8825 | Motor speed control + tension + distance |
| Bitumen Content | ESP32 | Serial communication with scale |

---

## Appendix: Pin Mapping Reference (ESP32-WROOM-32E)

### HX711 (Load Cell) Connection

| HX711 Pin | ESP32 Pin | Description |
|---|---|---|
| VCC | 5V | Power supply |
| GND | GND | Ground |
| DT (Data) | GPIO 4 | Serial data |
| SCK (Clock) | GPIO 2 | Serial clock |

### ADS1115 (Analog Sensors) Connection

| ADS1115 Pin | ESP32 Pin | Description |
|---|---|---|
| VDD | 3.3V | Power supply |
| GND | GND | Ground |
| SCL | GPIO 22 | I2C clock |
| SDA | GPIO 21 | I2C data |
| ADDR | GND | I2C address 0x48 |

### DRV8825 (Stepper Motor) Connection

| DRV8825 Pin | ESP32 Pin | Description |
|---|---|---|
| VMOT | 12V-24V | Motor power |
| GND | GND | Ground |
| STEP | GPIO 18 | Step pulse |
| DIR | GPIO 19 | Direction |
| EN | GPIO 5 | Enable (active low) |
| MS1-MS3 | Configured | Microstepping config |

### OLED Display (SSD1306) Connection

| OLED Pin | ESP32 Pin | Description |
|---|---|---|
| VCC | 3.3V | Power supply |
| GND | GND | Ground |
| SCL | GPIO 22 | I2C clock (shared with ADS1115) |
| SDA | GPIO 21 | I2C data (shared with ADS1115) |

---

*End of Hardware Recommendations Document*
