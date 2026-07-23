/**
 * SmartLAP — Document Registry
 * =============================
 * Structured registry of technical manuals and firmware code for each TEST_ID.
 * Provides interactive document viewing and firmware download capabilities.
 * 
 * Functions:
 *   viewTestDocs(testId, type) — Opens modal with manual or firmware content
 *   downloadFirmware(testId)   — Downloads the firmware .ino file as a blob
 *   closeDocViewer()           — Closes the document viewer modal
 */

// ================================================================
// DOCS REGISTRY — Each test ID maps to its manual and firmware
// ================================================================
var DOCS_REGISTRY = getDocsRegistry();

function getDocsRegistry() {
  return {
    compaction: {
      name: 'Compaction (Proctor)',
      icon: '\u26A1',
      manual: {
        title: 'Compaction (Proctor) Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The Proctor compaction test determines the optimal moisture content at which a given soil type will become most dense and achieve maximum dry density. The test is performed by compacting soil at various moisture contents in a standard mold with a standard hammer.' },
          { heading: 'Purpose', content: 'Determine the maximum dry density (MDD) and optimum moisture content (OMC) for use in earthwork compaction specifications (embankments, subgrades, backfill).' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D698</strong> — Standard Proctor (5.5 lb hammer, 12" drop, 3 layers, 25 blows)</li><li><strong>ASTM D1557</strong> — Modified Proctor (10 lb hammer, 18" drop, 5 layers, 25 blows)</li><li><strong>AASHTO T99 / T180</strong></li><li><strong>BS 1377 Part 4</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Proctor mold (4" or 6" diameter)</li><li>Standard hammer (5.5 lb or 10 lb)</li><li>Sample extruder</li><li>Drying oven</li><li>Balance (0.1 g sensitivity)</li><li>Moisture containers</li><li>Mixing tools & water</li></ul>' },
          { heading: 'Procedure', content: '<ol><li>Obtain a representative soil sample (approx. 3 kg for fine-grained, 5 kg for coarse-grained)</li><li>Air-dry the soil and break up clods</li><li>Add water to achieve target moisture (start 4% below estimated OMC)</li><li>Mix thoroughly and let stand for 15 minutes</li><li>Weigh the empty mold + base plate</li><li>Compact soil in layers (3 for Standard, 5 for Modified) with specified blows per layer</li><li>Remove the extension collar and trim excess soil flush with the mold</li><li>Weigh the mold + compacted soil</li><li>Extrude the sample and take moisture content sample from center</li><li>Repeat 4-5 points at increasing moisture contents (1-2% increments)</li></ol>' },
          { heading: 'Calculations', content: '<ul><li><strong>Wet Density</strong> = (Mass of wet soil) / (Volume of mold)</li><li><strong>Dry Density</strong> = (Wet Density) / (1 + Moisture Content / 100)</li><li><strong>Ratio %</strong> = (Dry Density / Target Density) × 100</li></ul>' },
          { heading: 'Interpretation', content: 'Plot dry density vs. moisture content. The peak of the curve gives the Maximum Dry Density (MDD) and Optimum Moisture Content (OMC). Field compaction specification typically requires ≥ 95% of MDD at OMC ± 2%.' }
        ]
      },
      firmware: {
        name: 'smartlap_compaction.ino',
        description: 'Compaction Test — Arduino Firmware (HX711 + Moisture Sensor)',
        code: getCompactionFirmware()
      }
    },
    cbr: {
      name: 'CBR',
      icon: '\uD83D\uDCCA',
      manual: {
        title: 'California Bearing Ratio (CBR) Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The California Bearing Ratio (CBR) test measures the penetration resistance of a soil or base material. It is a penetration test where a standard piston is pushed into the sample at a constant rate, and the force required is measured against penetration depth.' },
          { heading: 'Purpose', content: 'Evaluate the bearing capacity of subgrade, subbase, and base materials for pavement design. CBR values are used in thickness design of flexible pavements.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D1883</strong> — CBR of Laboratory-Compacted Soils</li><li><strong>AASHTO T193</strong> — CBR (Laboratory)</li><li><strong>BS 1377 Part 9</strong> — In-Situ CBR</li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>CBR mold (6" diameter, 7" height) with collar</li><li>Penetration piston (1.954" diameter, 3" min length)</li><li>Loading machine (50 mm/min rate)</li><li>Surcharge weights (5 lb or 10 lb)</li><li>Swelling measurement apparatus</li><li>Drying oven</li><li>Balance</li></ul>' },
          { heading: 'Procedure', content: '<ol><li>Prepare soil at OMC from Proctor test</li><li>Compact into CBR mold (3 layers, 25/56/92 blows depending on energy level)</li><li>Attach swell plate and surcharge weights</li><li>Soak for 4 days (if soaked CBR is required)</li><li>Measure swelling daily</li><li>After soaking, drain and allow to drain for 15 minutes</li><li>Position the mold on the loading machine</li><li>Apply surcharge weights and seat the piston</li><li>Apply load at 1.27 mm/min (0.05 in/min)</li><li>Record load at penetrations: 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0, 12.5 mm</li></ol>' },
          { heading: 'Calculations', content: '<ul><li><strong>CBR at 2.5 mm</strong> = (Test Load @ 2.5 mm / Standard Load @ 2.5 mm) × 100</li><li><strong>CBR at 5.0 mm</strong> = (Test Load @ 5.0 mm / Standard Load @ 5.0 mm) × 100</li><li><strong>Standard Load @ 2.5 mm</strong> = 13,240 N (for ASTM)</li><li><strong>Standard Load @ 5.0 mm</strong> = 19,960 N (for ASTM)</li><li>Report the higher value (typically at 2.5 mm controls)</li></ul>' }
        ]
      },
      firmware: {
        name: 'smartlap_cbr.ino',
        description: 'CBR Test — Arduino Firmware (HX711 + Ultrasonic + Linear Actuator)',
        code: getCBRFirmware()
      }
    },
    slump: {
      name: 'Slump Test',
      icon: '\uD83D\uDCD0',
      manual: {
        title: 'Slump Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The slump test measures the consistency of fresh concrete. It is the most common test for concrete workability, indicating the flow characteristics of a concrete mix under the influence of gravity after removing a standard cone.' },
          { heading: 'Purpose', content: 'Determine the workability and consistency of fresh concrete before placement. Ensure concrete meets specified slump range for the application.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM C143 / C143M</strong> — Slump of Hydraulic Cement Concrete</li><li><strong>AASHTO T119</strong></li><li><strong>BS 1881 Part 102</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Slump cone (ASTM: 12" / 305 mm height, 4" / 102 mm top diameter, 8" / 203 mm bottom diameter)</li><li>Tamping rod (5/8" / 16 mm diameter, 24" / 600 mm length, hemispherical tip)</li><li>Measuring scale (1 mm precision)</li><li>Base plate (smooth, non-absorbent)</li><li>HC-SR04 Ultrasonic sensor (for SmartLAP digital version)</li></ul>' },
          { heading: 'Procedure', content: '<ol><li>Moisten the cone and base plate</li><li>Place the cone on the base plate and hold firmly</li><li>Fill cone in 3 equal layers</li><li>Rod each layer 25 times (penetrate into the layer below for layers 2 and 3)</li><li>Strike off excess concrete flush with the top</li><li>Clean excess from around the base</li><li>Lift the cone vertically in 3-5 seconds</li><li>Measure slump immediately as the vertical difference between top of cone and displaced concrete</li></ol>' },
          { heading: 'Calculations', content: '<ul><li><strong>Slump</strong> = Cone Height (305 mm) — Distance from base to top of settled concrete (mm)</li><li><strong>Digital version</strong>: Ultrasonic sensor measures distance, slump = sensorDistance — offset</li><li>Report to nearest 5 mm (1/4")</li></ul>' },
          { heading: 'Interpretation', content: '<ul><li><strong>0-25 mm</strong>: Very low workability (stiff, used for pavements)</li><li><strong>25-75 mm</strong>: Low workability (simple foundations, slabs)</li><li><strong>75-100 mm</strong>: Medium workability (reinforced concrete)</li><li><strong>100-175 mm</strong>: High workability (congested reinforcement)</li><li><strong>175+ mm</strong>: Very high (self-consolidating concrete — use slump flow test)</li></ul>' }
        ]
      },
      firmware: {
        name: 'smartlap_slump.ino',
        description: 'Digital Slump Test — Arduino Firmware (HC-SR04 Ultrasonic)',
        code: getSlumpFirmware()
      }
    },
    maturity: {
      name: 'Concrete Maturity',
      icon: '\uD83C\uDF21\uFE0F',
      manual: {
        title: 'Concrete Maturity Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The concrete maturity method uses temperature history of concrete to estimate in-place strength development. It is based on the principle that concrete strength is a function of both time and temperature.' },
          { heading: 'Purpose', content: 'Estimate compressive strength of concrete in real-time without breaking specimens. Determine formwork removal time, post-tensioning timing, and opening to traffic.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM C1074</strong> — Standard Practice for Estimating Concrete Strength by the Maturity Method</li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>DS18B20 temperature sensors (embedded in concrete)</li><li>Arduino/ESP32 data logger</li><li>Temperature recording system (SmartLAP maturity module)</li><li>Compression machine (for calibration)</li></ul>' },
          { heading: 'Maturity Functions', content: '<ul><li><strong>Nurse-Saul Function</strong>: M(t) = \u03a3(T — T\u2080) × \u0394t where T\u2080 = 0\u00b0C (Nurse) or T\u2080 = -10\u00b0C (Saul)</li><li><strong>Arrhenius Function</strong>: t\u2091 = \u03a3 exp[(E\u2090/R) × (1/T\u0524 — 1/T)] × \u0394t</li><li><strong>E\u2090</strong> = Activation energy (typically 40,000 J/mol for OPC)</li><li><strong>R</strong> = Gas constant (8.314 J/mol\u00b7K)</li><li><strong>T\u0524</strong> = Reference temperature (293 K / 20\u00b0C)</li></ul>' },
          { heading: 'Procedure', content: '<ol><li>Place temperature sensors in the concrete at critical locations</li><li>Connect sensors to the data acquisition system</li><li>Record temperature continuously (every 15-60 minutes)</li><li>Compute maturity index using Nurse-Saul or Arrhenius method</li><li>Use pre-established strength-maturity curve to estimate strength</li><li>Break companion cylinders at key ages (1, 3, 7, 14, 28 days) to verify/calibrate the curve</li></ol>' }
        ]
      },
      firmware: {
        name: 'smartlap_maturity.ino',
        description: 'Concrete Maturity — Arduino Firmware (DS18B20 Temperature)',
        code: getMaturityFirmware()
      }
    },
    marshall: {
      name: 'Marshall Test',
      icon: '\u2696\uFE0F',
      manual: {
        title: 'Marshall Stability & Flow Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The Marshall test determines the stability and flow of asphalt concrete mixes. A cylindrical specimen is loaded on its lateral surface at 50 mm/min, and the maximum load (stability) and corresponding deformation (flow) are measured.' },
          { heading: 'Purpose', content: 'Determine the optimum asphalt binder content for a given aggregate blend by evaluating stability, flow, voids, and density.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D6927</strong> — Marshall Stability and Flow of Asphalt Mixtures</li><li><strong>AASHTO T245</strong></li><li><strong>BS EN 12697-34</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Marshall compaction pedestal and hammer (10 lb, 18" drop)</li><li>Specimen mold (4" / 101.6 mm diameter)</li><li>Marshall testing machine with load ring or load cell</li><li>Flow meter (0.25 mm resolution)</li><li>Water bath (60\u00b0C \u00b1 1\u00b0C)</li><li>Oven</li></ul>' },
          { heading: 'Procedure', content: '<ol><li>Prepare asphalt mixture at a specific binder content</li><li>Compact specimen: 50 blows per side (75 for heavy traffic)</li><li>Allow specimen to cool to room temperature</li><li>Weigh in air, then in water (for bulk specific gravity)</li><li>Heat in water bath at 60\u00b0C for 30-40 minutes</li><li>Place in testing machine and apply load at 50 mm/min</li><li>Record maximum load (stability) and flow at maximum load</li></ol>' },
          { heading: 'Calculations', content: '<ul><li><strong>Stability (kN)</strong> = Maximum load recorded</li><li><strong>Flow (0.25 mm units)</strong> = Deformation at maximum load</li><li><strong>Flow (mm)</strong> = Flow units \u00d7 0.25</li><li><strong>Bulk Specific Gravity</strong> = W_dry / (W_saturated — W_water)</li><li><strong>% Voids (VTM)</strong> = (1 — G_bulk / G_mm) \u00d7 100</li></ul>' }
        ]
      },
      firmware: {
        name: 'smartlap_marshall.ino',
        description: 'Marshall Test — Arduino Firmware (HX711 + LVDT)',
        code: getMarshallFirmware()
      }
    },
    straightedge: {
      name: 'Straightedge',
      icon: '\uD83D\uDCD0',
      manual: {
        title: 'Straightedge (Road Roughness) Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The straightedge test measures surface evenness and regularity of road pavements and concrete slabs. It uses a straightedge and wedge/tilt sensor to quantify surface irregularities.' },
          { heading: 'Purpose', content: 'Verify that finished pavement surfaces conform to specified tolerances for smoothness and evenness.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM E1274</strong> — Measuring Pavement Roughness</li><li><strong>AASHTO T312</strong></li><li><strong>BS EN 13036-7</strong> — Surface Characteristics</li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>3 m (10 ft) straightedge</li><li>Inclinometer/IMU (MPU6050)</li><li>Wedge gauge (graduated in mm)</li><li>Distance measuring device (rotary encoder)</li><li>Laser distance sensor (optional, VL53L0X)</li></ul>' },
          { heading: 'Procedure', content: '<ol><li>Place the straightedge on the pavement surface</li><li>Measure the gap between the straightedge and pavement at the point of maximum deviation</li><li>Record position, irregularity magnitude, and inclination</li><li>Move the straightedge to adjacent positions (0.3 m intervals recommended)</li><li>Continue for the full length of the test section</li><li>Compare measurements against specified tolerances</li></ol>' },
          { heading: 'Acceptance Criteria', content: '<ul><li><strong>Class 1 (Highway)</strong>: \u2264 3 mm deviation under 3 m straightedge</li><li><strong>Class 2 (Secondary Road)</strong>: \u2264 6 mm deviation under 3 m straightedge</li><li><strong>Class 3 (Local Road)</strong>: \u2264 12 mm deviation under 3 m straightedge</li></ul>' }
        ]
      },
      firmware: {
        name: 'smartlap_straightedge.ino',
        description: 'Straightedge Test — Arduino Firmware (MPU6050 IMU + Encoder)',
        code: getStraightedgeFirmware()
      }
    },
    bitumen: {
      name: 'Bitumen Photo-Tester',
      icon: '\uD83E\uDDEA',
      manual: {
        title: 'Bitumen Photo-Tester — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The SmartLAP Bitumen Photo-Tester uses light intensity measurement to assess bitumen quality and purity. A BH1750 light sensor measures light transmission through a bitumen solution to determine purity.' },
          { heading: 'Purpose', content: 'Quick qualitative assessment of bitumen binder purity and consistency based on light transmission characteristics.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D113</strong> — Ductility of Bitumen</li><li><strong>ASTM D5</strong> — Penetration of Bitumen</li><li>Photo-tester is a SmartLAP-proprietary rapid screening method</li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>BH1750 Light Intensity Sensor (I2C)</li><li>Arduino/ESP32</li><li>Light source (LED, constant intensity)</li><li>Cuvette/sample holder for bitumen solution</li><li>Solvent (toluene or xylene) for dilution</li></ul>' },
          { heading: 'Calculations', content: '<ul><li><strong>Transmission %</strong> = (Sample Lux / Reference Lux) \u00d7 100</li><li><strong>Purity Index</strong> = Map(Lux, 0, ReferenceLux, 0, 100)</li><li>Higher transmission = higher purity / lighter grade</li><li>Lower transmission = more filler content / darker grade</li></ul>' }
        ]
      },
      firmware: {
        name: 'smartlap_bitumen.ino',
        description: 'Bitumen Photo-Tester — Arduino Firmware (BH1750 Light Sensor)',
        code: getBitumenFirmware()
      }
    },
    penetration: {
      name: 'Bitumen Penetration',
      icon: '\uD83C\uDF21\uFE0F',
      manual: {
        title: 'Bitumen Penetration Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The penetration test measures the hardness or softness of bitumen by determining the depth (in tenths of a millimeter) to which a standard needle will penetrate under specified conditions (load, time, temperature).' },
          { heading: 'Purpose', content: 'Grade bitumen according to penetration value (e.g., 40/50, 60/70, 80/100). Used for bitumen classification and quality control.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D5</strong> — Penetration of Bituminous Materials</li><li><strong>AASHTO T49</strong></li><li><strong>BS EN 1426</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Penetrometer apparatus</li><li>Standard needle (100 g load)</li><li>Sample container (metallic cup)</li><li>Water bath (25\u00b0C \u00b1 0.1\u00b0C)</li><li>Timer</li><li>Thermometer (0.1\u00b0C resolution)</li></ul>' },
          { heading: 'Typical Penetration Grades', content: '<ul><li><strong>40/50</strong>: Penetration 40-50 (hard, hot climates)</li><li><strong>60/70</strong>: Penetration 60-70 (standard paving grade)</li><li><strong>80/100</strong>: Penetration 80-100 (soft, cold climates)</li><li><strong>150/200</strong>: Penetration 150-200 (very soft)</li></ul>' }
        ]
      }
    },
    ductility: {
      name: 'Ductility',
      icon: '\uD83D\uDD17',
      manual: {
        title: 'Bitumen Ductility Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The ductility test measures the distance (in cm) to which a standard briquette of bitumen can be stretched before breaking under standard conditions (25\u00b0C, 5 cm/min pull rate).' },
          { heading: 'Purpose', content: 'Assess the adhesive and cohesive properties of bitumen. Higher ductility indicates better flexibility and resistance to cracking.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D113</strong> — Ductility of Bituminous Materials</li><li><strong>AASHTO T51</strong></li><li><strong>BS EN 13589</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Ductility testing machine (with constant pull rate)</li><li>Standard briquette mold (brass)</li><li>Water bath (25\u00b0C \u00b1 0.5\u00b0C)</li><li>Thermometer</li></ul>' },
          { heading: 'Acceptance Criteria', content: 'Minimum ductility of 100 cm is commonly specified for paving grade bitumens at 25\u00b0C.' }
        ]
      }
    },
    softening_point: {
      name: 'Softening Point',
      icon: '\uD83C\uDF21\uFE0F',
      manual: {
        title: 'Softening Point (Ring & Ball) Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The softening point is the temperature at which a bitumen sample softens under the weight of a steel ball and flows a specified distance. It indicates the temperature at which bitumen changes from solid to liquid.' },
          { heading: 'Purpose', content: 'Determine the temperature susceptibility of bitumen. Used to select appropriate bitumen grade for climatic conditions.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D36</strong> — Softening Point of Bitumen (Ring-and-Ball Apparatus)</li><li><strong>AASHTO T53</strong></li><li><strong>BS EN 1427</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Ring-and-ball apparatus</li><li>Brass rings and steel balls (2 off)</li><li>Thermometer (0.5\u00b0C resolution)</li><li>Heating bath with stirrer</li><li>Glycerol or water bath medium</li></ul>' },
          { heading: 'Procedure', content: '<ol><li>Heat the bitumen sample to fluid condition</li><li>Pour into brass rings and allow to cool</li><li>Trim excess bitumen from the rings</li><li>Place rings and steel balls in position</li><li>Heat the bath at a controlled rate (5\u00b0C/min)</li><li>Record temperature when the bitumen touches the base plate</li></ol>' }
        ]
      }
    },
    viscosity: {
      name: 'Viscosity',
      icon: '\u23F3',
      manual: {
        title: 'Viscosity (Saybolt Furol) Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The Saybolt Furol viscosity test measures the time in seconds for 60 mL of bitumen to flow through a calibrated orifice at a specified temperature. It indicates the flow characteristics of bitumen at high temperatures.' },
          { heading: 'Purpose', content: 'Determine the kinematic viscosity of bitumen for mixing and compaction temperature selection.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D249</strong> / <strong>ASTM D2161</strong> — Saybolt Furol Viscosity</li><li><strong>AASHTO T201</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Saybolt Furol viscometer</li><li>Thermostatically controlled bath</li><li>Thermometer (0.1\u00b0C resolution)</li><li>Receiving flask (60 mL)</li><li>Timer (0.1 sec resolution)</li></ul>' },
          { heading: 'Procedure', content: '<ol><li>Heat the bitumen to the test temperature (typically 135\u00b0C or 175\u00b0C)</li><li>Place the sample in the viscometer tube</li><li>Allow temperature to equilibrate</li><li>Withdraw the cork/stem and start the timer</li><li>Record time for 60 mL of sample to flow through the orifice</li><li>Report in Saybolt Furol Seconds (SFS)</li></ol>' }
        ]
      }
    },
    atterberg: {
      name: 'Atterberg Limits',
      icon: '\uD83E\uDDEA',
      manual: {
        title: 'Atterberg Limits Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'Atterberg limits define the critical water contents of fine-grained soils: the Liquid Limit (LL), Plastic Limit (PL), and Plasticity Index (PI). These indices classify cohesive soils for engineering purposes.' },
          { heading: 'Purpose', content: 'Classify fine-grained soils according to the Unified Soil Classification System (USCS) or AASHTO system. Predict engineering behavior such as swelling, shrinkage, and strength.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D4318</strong> — Liquid Limit, Plastic Limit, and Plasticity Index of Soils</li><li><strong>AASHTO T89 / T90</strong></li><li><strong>BS 1377 Part 2</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Liquid Limit device (Casagrande)</li><li>Grooving tool (ASTM or curve)</li><li>Porcelain evaporating dishes</li><li>Drying oven</li><li>Balance (0.01 g sensitivity)</li><li>Wash bottles</li></ul>' },
          { heading: 'Key Definitions', content: '<ul><li><strong>Liquid Limit (LL)</strong>: Water content at which soil transitions from plastic to liquid state (25 blows in Casagrande cup)</li><li><strong>Plastic Limit (PL)</strong>: Water content at which soil begins to crumble when rolled into 3.2 mm threads</li><li><strong>Plasticity Index (PI)</strong>: PI = LL — PL</li><li><strong>Liquidity Index (LI)</strong>: LI = (W — PL) / PI</li></ul>' }
        ]
      }
    },
    sieve: {
      name: 'Sieve Analysis',
      icon: '\uD83D\uDCD0',
      manual: {
        title: 'Sieve Analysis Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'Sieve analysis determines the particle size distribution (gradation) of a granular material by passing it through a stack of sieves of decreasing mesh size.' },
          { heading: 'Purpose', content: 'Classify soils/aggregates according to particle size for use in construction. Determine compliance with specification gradation bands.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM C136</strong> — Sieve Analysis of Fine and Coarse Aggregates</li><li><strong>ASTM D6913</strong> — Particle Size Distribution of Soils</li><li><strong>AASHTO T27</strong></li><li><strong>BS EN 933-2</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Sieve stack (various sizes: 75mm to 75\u00b5m)</li><li>Sieve shaker (mechanical)</li><li>Balance (0.1 g for fine, 0.5 g for coarse)</li><li>Drying oven</li><li>Sample splitter (riffle box)</li></ul>' },
          { heading: 'Calculations', content: '<ul><li><strong>% Retained</strong> = (Mass retained on sieve / Total dry mass) \u00d7 100</li><li><strong>Cumulative % Retained</strong> = Sum of % retained on all larger sieves</li><li><strong>% Passing</strong> = 100 — Cumulative % Retained</li><li><strong>Fineness Modulus (FM)</strong> = Sum of cumulative % retained / 100</li></ul>' }
        ]
      }
    },
    compressive: {
      name: 'Compressive Strength',
      icon: '\uD83C\uDFD7\uFE0F',
      manual: {
        title: 'Compressive Strength Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The compressive strength test determines the maximum compressive load a concrete specimen can withstand before failure. It is the primary measure of concrete quality and structural performance.' },
          { heading: 'Purpose', content: 'Verify that concrete meets specified design strength (f\'c) for structural applications. Quality control of concrete production.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM C39 / C39M</strong> — Compressive Strength of Cylindrical Concrete Specimens</li><li><strong>AASHTO T22</strong></li><li><strong>BS EN 12390-3</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Compression testing machine</li><li>Specimens: cylinders (150\u00d7300 mm) or cubes (150 mm)</li><li>Neoprene pads or sulfur capping for end preparation</li><li>Vernier calipers</li><li>Balance</li></ul>' },
          { heading: 'Procedure', content: '<ol><li>Measure specimen dimensions (diameter, length)</li><li>Weigh the specimen</li><li>Cap ends if required (neoprene pads or sulfur mortar)</li><li>Place specimen centrally in the compression machine</li><li>Apply load at 0.25 \u00b1 0.05 MPa/s</li><li>Record maximum load at failure</li><li>Determine failure type (cone, shear, columnar, etc.)</li></ol>' },
          { heading: 'Calculations', content: '<ul><li><strong>Compressive Strength (MPa)</strong> = Maximum Load (N) / Cross-sectional Area (mm\u00b2)</li><li><strong>f\'c</strong> = Average of 2-3 companion specimens</li><li>Apply correction factors for length/diameter ratio if L/D < 1.75</li></ul>' }
        ]
      }
    },
    flexural: {
      name: 'Flexural Strength',
      icon: '\uD83D\uDCD0',
      manual: {
        title: 'Flexural Strength Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The flexural strength test measures the modulus of rupture of a concrete beam. It is an indirect measure of tensile strength, representing the maximum tensile stress at the bottom fiber of a loaded beam.' },
          { heading: 'Purpose', content: 'Evaluate concrete\'s ability to resist bending stresses. Used in pavement design (MR value) and structural elements subject to flexure.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM C78</strong> (Third-point loading) / <strong>ASTM C293</strong> (Center-point loading)</li><li><strong>BS EN 12390-5</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Universal testing machine or flexural frame</li><li>Beam molds (150\u00d7150\u00d7500 mm typical)</li><li>Loading rollers and supports</li><li>Deflection measurement (dial gauge or LVDT)</li></ul>' },
          { heading: 'Calculations', content: '<ul><li><strong>Center-point (ASTM C293)</strong>: MR = (3PL) / (2bd\u00b2)</li><li><strong>Third-point (ASTM C78)</strong>: MR = (PL) / (bd\u00b2)</li><li>Where P = max load (N), L = span (mm), b = width (mm), d = depth (mm)</li><li><strong>Typical MR</strong>: 10-15% of compressive strength</li></ul>' }
        ]
      }
    },
    split_tensile: {
      name: 'Split Tensile',
      icon: '\uD83D\uDCA5',
      manual: {
        title: 'Split Tensile Strength Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The split tensile (Brazilian) test determines the tensile strength of concrete by applying compressive load along the length of a cylinder. The induced tensile stress causes splitting along the vertical plane.' },
          { heading: 'Purpose', content: 'Estimate the tensile strength of concrete for crack control and structural design. Used in shear capacity calculations and thermal stress analysis.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM C496</strong> — Splitting Tensile Strength of Cylindrical Concrete Specimens</li><li><strong>BS EN 12390-6</strong></li></ul>' },
          { heading: 'Equipment Required', content: '<ul><li>Compression testing machine</li><li>Two bearing strips (hardboard or plywood, 3 mm thick)</li><li>Cylindrical specimens (150\u00d7300 mm typical)</li><li>Measuring tape/calipers</li></ul>' },
          { heading: 'Calculations', content: '<ul><li><strong>T (MPa)</strong> = 2P / (\u03c0LD)</li><li>Where P = max load (N), L = length (mm), D = diameter (mm)</li><li><strong>Typical T</strong>: 8-14% of compressive strength</li></ul>' }
        ]
      }
    },
    permeability: {
      name: 'Permeability',
      icon: '\uD83D\uDCA7',
      manual: {
        title: 'Permeability Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The permeability test measures the rate at which water flows through a soil sample under a hydraulic gradient. The coefficient of permeability (k) is determined from constant head (coarse soils) or falling head (fine soils) tests.' },
          { heading: 'Purpose', content: 'Determine the hydraulic conductivity of soils for drainage design, seepage analysis, and groundwater control.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D2434</strong> — Constant Head Permeability</li><li><strong>BS 1377 Part 5</strong> — Falling Head Permeability</li></ul>' },
          { heading: 'Calculations', content: '<ul><li><strong>Constant Head</strong>: k = (QL) / (Aht)</li><li><strong>Falling Head</strong>: k = (aL)/(At) \u00d7 ln(h\u2081/h\u2082)</li><li>Where Q = flow volume, L = length, A = area, h = head, t = time</li></ul>' }
        ]
      }
    },
    specific_gravity: {
      name: 'Specific Gravity',
      icon: '\u2696\uFE0F',
      manual: {
        title: 'Specific Gravity Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The specific gravity (Gs) of soil is the ratio of the mass of soil solids to the mass of an equal volume of water. It is an essential parameter for calculating density, void ratio, and degree of saturation.' },
          { heading: 'Purpose', content: 'Determine specific gravity for soil classification and density calculations (e.g., for Proctor compaction, CBR).' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D854</strong> — Specific Gravity of Soils (Pycnometer Method)</li><li><strong>BS 1377 Part 2</strong></li></ul>' },
          { heading: 'Calculations', content: '<ul><li><strong>Gs</strong> = Ws / (W1 + Ws — W2)</li><li>Where Ws = dry soil weight, W1 = pycnometer + water weight, W2 = pycnometer + soil + water weight</li></ul>' }
        ]
      }
    },
    water_absorption: {
      name: 'Water Absorption',
      icon: '\uD83D\uDCA7',
      manual: {
        title: 'Water Absorption Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The water absorption test determines the amount of water absorbed by aggregates, stones, or concrete specimens under specified conditions. It indicates the porosity and durability of materials.' },
          { heading: 'Purpose', content: 'Assess aggregate quality for concrete (absorption > 2% may indicate poor durability). Evaluate concrete permeability.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM C127</strong> — Specific Gravity and Absorption of Coarse Aggregate</li><li><strong>ASTM C642</strong> — Water Absorption of Concrete</li><li><strong>BS EN 13755</strong></li></ul>' },
          { heading: 'Calculations', content: '<ul><li><strong>Absorption %</strong> = ((SSD — OD) / OD) \u00d7 100</li><li>Where SSD = Saturated Surface Dry weight, OD = Oven Dry weight</li></ul>' }
        ]
      }
    },
    direct_shear: {
      name: 'Direct Shear',
      icon: '\u2702\uFE0F',
      manual: {
        title: 'Direct Shear Test — Technical Manual',
        sections: [
          { heading: 'Overview', content: 'The direct shear test determines the shear strength parameters (cohesion c and friction angle \u03c6) of soils. A soil sample is sheared along a horizontal plane under a constant normal load.' },
          { heading: 'Purpose', content: 'Determine shear strength parameters for slope stability, bearing capacity, and retaining wall design.' },
          { heading: 'Standards', content: '<ul><li><strong>ASTM D3080</strong> — Direct Shear Test of Soils</li><li><strong>AASHTO T236</strong></li><li><strong>BS 1377 Part 7</strong></li></ul>' },
          { heading: 'Calculations', content: '<ul><li><strong>Shear Stress (\u03c4)</strong> = Shear Force / Shear Area</li><li><strong>Normal Stress (\u03c3)</strong> = Normal Load / Area</li><li><strong>Mohr-Coulomb Failure</strong>: \u03c4 = c + \u03c3 \u00d7 tan(\u03c6)</li><li>Test at least 3 specimens at different normal loads to determine c and \u03c6</li></ul>' }
        ]
      }
    }
  };
}

// ================================================================
// FIRMWARE CODE HELPERS (stored as functions to keep main object clean)
// ================================================================

function getCompactionFirmware() {
  return '/*\n * SmartLAP \u2014 Compaction Test Firmware\n * ====================================\n * Board:      Arduino Uno / Nano\n * Sensors:    HX711 Load Cell + Capacitive Soil Moisture v1.2\n * Protocol:   SmartLAP Serial CSV\n * Format:     moisture_pct,force_newtons\\n\n * Wiring:\n *   HX711  DT  \u2192 D3        HX711  SCK \u2192 D2\n *   Moisture AOUT \u2192 A0\n *   HX711  VCC \u2192 5V        HX711  GND \u2192 GND\n *\n * Commands:   START / STOP / TARE / STATUS\n */\n#include "HX711.h"\n\n#define HX711_DT    3\n#define HX711_SCK   2\n#define MOISTURE_PIN A0\n#define CALIBRATION_FACTOR 420.0\n#define MOISTURE_DRY  520\n#define MOISTURE_WET  260\n\nHX711 scale;\nbool testing = false;\n\nvoid setup() {\n    Serial.begin(9600);\n    scale.begin(HX711_DT, HX711_SCK);\n    scale.set_scale(CALIBRATION_FACTOR);\n    scale.tare();\n    Serial.println("SmartLAP:READY");\n}\n\nfloat readMoisturePercent() {\n    int raw = analogRead(MOISTURE_PIN);\n    if (raw < 0 || raw > 1023) return -1;\n    float pct = map(raw, MOISTURE_WET, MOISTURE_DRY, 100, 0);\n    if (pct < 0) pct = 0;\n    if (pct > 100) pct = 100;\n    return round(pct * 10.0) / 10.0;\n}\n\nfloat readForceNewtons() {\n    if (!scale.is_ready()) return -1;\n    float kg = scale.get_units(1);\n    if (isnan(kg)) return -1;\n    if (kg < 0) kg = 0;\n    return round(kg * 9.81 * 100.0) / 100.0;\n}\n\nvoid handleCommand(String cmd) {\n    cmd.trim(); cmd.toUpperCase();\n    if (cmd == "START") { testing = true; Serial.println("SmartLAP:STARTED"); }\n    else if (cmd == "STOP") { testing = false; Serial.println("SmartLAP:STOPPED"); }\n    else if (cmd == "TARE") { scale.tare(); Serial.println("SmartLAP:TARED"); }\n    else if (cmd == "STATUS") { Serial.println(testing ? "SmartLAP:TESTING" : "SmartLAP:IDLE"); }\n}\n\nvoid loop() {\n    if (Serial.available()) {\n        String cmd = Serial.readStringUntil(\'\\n\');\n        handleCommand(cmd);\n    }\n    if (testing) {\n        float moisture = readMoisturePercent();\n        float force = readForceNewtons();\n        if (moisture >= 0 && force >= 0) {\n            Serial.print(moisture, 1);\n            Serial.print(",");\n            Serial.println(force, 2);\n        }\n        delay(800);\n    }\n}';
}

function getCBRFirmware() {
  return '/*\n * SmartLAP \u2014 CBR Test Firmware\n * ===============================\n * Board:      Arduino Uno / Nano\n * Sensors:    HX711 Load Cell + HC-SR04 Ultrasonic + Linear Actuator\n * Protocol:   SmartLAP Serial CSV\n * Format:     penetration_mm,load_newtons\\n\n * Wiring:\n *   HX711  DT  \u2192 D3        HX711  SCK \u2192 D2\n *   HC-SR04 TRIG \u2192 D9       ECHO \u2192 D10\n *   Motor  IN1 \u2192 D5         IN2 \u2192 D6      ENA \u2192 D7\n *\n * Commands:   START / STOP / TARE / STATUS\n */\n#include "HX711.h"\n\n#define HX711_DT    3\n#define HX711_SCK   2\n#define TRIG_PIN    9\n#define ECHO_PIN   10\n#define MOTOR_IN1   5\n#define MOTOR_IN2   6\n#define MOTOR_ENA   7\n#define CALIBRATION_FACTOR 420.0\n#define ACTUATOR_SPEED 150\n#define MAX_PENETRATION_MM 12.5\n\nHX711 scale;\nbool testing = false;\n\nvoid setup() {\n    Serial.begin(9600);\n    pinMode(TRIG_PIN, OUTPUT); pinMode(ECHO_PIN, INPUT);\n    pinMode(MOTOR_IN1, OUTPUT); pinMode(MOTOR_IN2, OUTPUT); pinMode(MOTOR_ENA, OUTPUT);\n    scale.begin(HX711_DT, HX711_SCK);\n    scale.set_scale(CALIBRATION_FACTOR);\n    scale.tare();\n    stopMotor();\n    Serial.println("SmartLAP:READY");\n}\n\nfloat readDistanceCM() {\n    digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);\n    digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);\n    digitalWrite(TRIG_PIN, LOW);\n    unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);\n    if (duration == 0) return -1;\n    return (duration * 0.0343) / 2.0;\n}\n\nfloat readForceNewtons() {\n    if (!scale.is_ready()) return -1;\n    float kg = scale.get_units(1);\n    if (isnan(kg)) return -1;\n    if (kg < 0) kg = 0;\n    return round(kg * 9.81 * 100.0) / 100.0;\n}\n\nvoid runMotor() { digitalWrite(MOTOR_IN1, HIGH); digitalWrite(MOTOR_IN2, LOW); analogWrite(MOTOR_ENA, ACTUATOR_SPEED); }\nvoid stopMotor() { digitalWrite(MOTOR_IN1, LOW); digitalWrite(MOTOR_IN2, LOW); analogWrite(MOTOR_ENA, 0); }\n\nfloat initialDistance = -1;\n\nvoid handleCommand(String cmd) {\n    cmd.trim(); cmd.toUpperCase();\n    if (cmd == "START") {\n        initialDistance = readDistanceCM();\n        testing = true; runMotor();\n        Serial.println("SmartLAP:STARTED");\n    } else if (cmd == "STOP") { testing = false; stopMotor(); Serial.println("SmartLAP:STOPPED"); }\n    else if (cmd == "TARE") { scale.tare(); Serial.println("SmartLAP:TARED"); }\n    else if (cmd == "STATUS") { Serial.println(testing ? "SmartLAP:TESTING" : "SmartLAP:IDLE"); }\n}\n\nvoid loop() {\n    if (Serial.available()) {\n        String cmd = Serial.readStringUntil(\'\\n\');\n        handleCommand(cmd);\n    }\n    if (testing) {\n        float dist = readDistanceCM();\n        if (dist < 0 || initialDistance < 0) return;\n        float penetration = initialDistance - dist;\n        if (penetration < 0) penetration = 0;\n        if (penetration > MAX_PENETRATION_MM) { testing = false; stopMotor(); Serial.println("SmartLAP:STOPPED"); return; }\n        float force = readForceNewtons();\n        if (force >= 0) {\n            Serial.print(penetration, 2);\n            Serial.print(",");\n            Serial.println(force, 2);\n        }\n        delay(500);\n    }\n}';
}

function getSlumpFirmware() {
  return '/*\n * SmartLAP \u2014 Digital Slump Test Firmware\n * =======================================\n * Board:      Arduino Uno / Nano\n * Sensors:    HC-SR04 Ultrasonic Distance\n * Protocol:   SmartLAP Serial CSV\n * Format:     distance_cm\\n\n * Wiring:\n *   HC-SR04 TRIG \u2192 D9       ECHO \u2192 D10\n *   VCC \u2192 5V                GND \u2192 GND\n *\n * Commands:   START / STOP / TARE / STATUS\n */\n#define TRIG_PIN  9\n#define ECHO_PIN 10\n#define MOLD_HEIGHT_CM 30.5\n\nbool testing = false;\nfloat offsetCM = 0;\n\nvoid setup() {\n    Serial.begin(9600);\n    pinMode(TRIG_PIN, OUTPUT); pinMode(ECHO_PIN, INPUT);\n    Serial.println("SmartLAP:READY");\n}\n\nfloat readDistanceCM() {\n    digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);\n    digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);\n    digitalWrite(TRIG_PIN, LOW);\n    unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);\n    if (duration == 0) return -1;\n    float dist = (duration * 0.0343) / 2.0;\n    return round(dist * 10.0) / 10.0;\n}\n\nvoid handleCommand(String cmd) {\n    cmd.trim(); cmd.toUpperCase();\n    if (cmd == "START") { testing = true; Serial.println("SmartLAP:STARTED"); }\n    else if (cmd == "STOP") { testing = false; Serial.println("SmartLAP:STOPPED"); }\n    else if (cmd == "TARE") { float d = readDistanceCM(); if (d > 0) offsetCM = d; Serial.println("SmartLAP:TARED"); }\n    else if (cmd == "STATUS") { Serial.println(testing ? "SmartLAP:TESTING" : "SmartLAP:IDLE"); }\n}\n\nvoid loop() {\n    if (Serial.available()) {\n        String cmd = Serial.readStringUntil(\'\\n\');\n        handleCommand(cmd);\n    }\n    if (testing) {\n        float dist = readDistanceCM();\n        if (dist > 0) {\n            float corrected = dist - offsetCM;\n            if (corrected < 0) corrected = 0;\n            Serial.println(corrected, 1);\n        }\n        delay(500);\n    }\n}';
}

function getMaturityFirmware() {
  return '/*\n * SmartLAP \u2014 Concrete Maturity Sensor Firmware\n * =============================================\n * Board:      Arduino Uno / Nano\n * Sensors:    DS18B20 Digital Temperature (OneWire)\n * Protocol:   SmartLAP Serial CSV\n * Format:     temperature_celsius\\n\n * Wiring:\n *   DS18B20 DATA \u2192 D2 (with 4.7k\u03a9 pull-up to VCC)\n *   VCC \u2192 3.3V or 5V       GND \u2192 GND\n *\n * Commands:   START / STOP / TARE / STATUS\n */\n#include <OneWire.h>\n#include <DallasTemperature.h>\n\n#define ONE_WIRE_BUS 2\n#define READ_INTERVAL_MS 5000\n\nOneWire oneWire(ONE_WIRE_BUS);\nDallasTemperature sensors(&oneWire);\n\nbool testing = false;\nunsigned long lastRead = 0;\n\nvoid setup() {\n    Serial.begin(9600);\n    sensors.begin();\n    Serial.println("SmartLAP:READY");\n}\n\nfloat readTemperatureC() {\n    sensors.requestTemperatures();\n    float temp = sensors.getTempCByIndex(0);\n    if (temp == DEVICE_DISCONNECTED_C || temp < -55 || temp > 125) return -999;\n    return round(temp * 100.0) / 100.0;\n}\n\nvoid handleCommand(String cmd) {\n    cmd.trim(); cmd.toUpperCase();\n    if (cmd == "START") { testing = true; lastRead = millis(); Serial.println("SmartLAP:STARTED"); }\n    else if (cmd == "STOP") { testing = false; Serial.println("SmartLAP:STOPPED"); }\n    else if (cmd == "TARE") { Serial.println("SmartLAP:TARED"); }\n    else if (cmd == "STATUS") { Serial.println(testing ? "SmartLAP:TESTING" : "SmartLAP:IDLE"); }\n}\n\nvoid loop() {\n    if (Serial.available()) {\n        String cmd = Serial.readStringUntil(\'\\n\');\n        handleCommand(cmd);\n    }\n    if (testing) {\n        unsigned long now = millis();\n        if (now - lastRead >= READ_INTERVAL_MS) {\n            lastRead = now;\n            float temp = readTemperatureC();\n            if (temp > -900) Serial.println(temp, 2);\n        }\n    }\n}';
}

function getMarshallFirmware() {
  return '/*\n * SmartLAP \u2014 Digital Marshall Test Firmware\n * ==========================================\n * Board:      Arduino Uno / Nano\n * Sensors:    HX711 Load Cell + LVDT Displacement\n * Protocol:   SmartLAP Serial CSV\n * Format:     load_newtons,displacement_mm,flow_units\\n\n * Wiring:\n *   HX711  DT  \u2192 D3        HX711  SCK \u2192 D2\n *   LVDT   AOUT \u2192 A0\n *   HX711  VCC \u2192 5V        GND \u2192 GND\n *\n * Commands:   START / STOP / TARE / STATUS\n */\n#include "HX711.h"\n\n#define HX711_DT      3\n#define HX711_SCK     2\n#define LVDT_PIN      A0\n#define LVDT_RANGE_MM 25.0\n#define CALIBRATION_FACTOR 420.0\n\nHX711 scale;\nbool testing = false;\n\nvoid setup() {\n    Serial.begin(9600);\n    scale.begin(HX711_DT, HX711_SCK);\n    scale.set_scale(CALIBRATION_FACTOR);\n    scale.tare();\n    Serial.println("SmartLAP:READY");\n}\n\nfloat readLoadNewtons() {\n    if (!scale.is_ready()) return -1;\n    float kg = scale.get_units(1);\n    if (isnan(kg)) return -1;\n    if (kg < 0) kg = 0;\n    return round(kg * 9.81 * 100.0) / 100.0;\n}\n\nfloat readDisplacementMM() {\n    int raw = analogRead(LVDT_PIN);\n    if (raw < 0 || raw > 1023) return -1;\n    float mm = (raw / 1023.0) * LVDT_RANGE_MM;\n    return round(mm * 1000.0) / 1000.0;\n}\n\nfloat calcFlowUnits(float dispMM) { return round(dispMM / 0.25); }\n\nvoid handleCommand(String cmd) {\n    cmd.trim(); cmd.toUpperCase();\n    if (cmd == "START") { testing = true; scale.tare(); Serial.println("SmartLAP:STARTED"); }\n    else if (cmd == "STOP") { testing = false; Serial.println("SmartLAP:STOPPED"); }\n    else if (cmd == "TARE") { scale.tare(); Serial.println("SmartLAP:TARED"); }\n    else if (cmd == "STATUS") { Serial.println(testing ? "SmartLAP:TESTING" : "SmartLAP:IDLE"); }\n}\n\nvoid loop() {\n    if (Serial.available()) {\n        String cmd = Serial.readStringUntil(\'\\n\');\n        handleCommand(cmd);\n    }\n    if (testing) {\n        float load = readLoadNewtons();\n        float disp = readDisplacementMM();\n        if (load >= 0 && disp >= 0) {\n            float flow = calcFlowUnits(disp);\n            Serial.print(load, 2);\n            Serial.print(",");\n            Serial.print(disp, 3);\n            Serial.print(",");\n            Serial.println(flow, 0);\n        }\n        delay(100);\n    }\n}';
}

function getStraightedgeFirmware() {
  return '/*\n * SmartLAP \u2014 Straightedge (Road Roughness) Test Firmware\n * ======================================================\n * Board:      Arduino Uno / Nano\n * Sensors:    MPU6050 IMU + VL53L0X Laser + Rotary Encoder\n * Protocol:   SmartLAP Serial CSV\n * Format:     position_m,irregularity_mm,inclination_deg\\n\n * Wiring:\n *   MPU6050 SDA \u2192 A4        SCL \u2192 A5\n *   Encoder  A \u2192 D2         B \u2192 D3\n *   VCC \u2192 3.3V              GND \u2192 GND\n *\n * Commands:   START / STOP / TARE / STATUS\n */\n#include <Wire.h>\n#include <MPU6050_tockn.h>\n\n#define ENCODER_A     2\n#define ENCODER_B     3\n#define ENCODER_PPR   600\n#define STRAIGHTEDGE_LENGTH_M 3.0\n\nMPU6050 mpu(Wire);\n\nvolatile long encoderCount = 0;\nbool testing = false;\nfloat offsetIrregularity = 0;\n\nvoid encoderISR() {\n    if (digitalRead(ENCODER_B)) encoderCount++;\n    else encoderCount--;\n}\n\nvoid setup() {\n    Serial.begin(9600);\n    Wire.begin();\n    mpu.begin();\n    mpu.calcGyroOffsets(true);\n    pinMode(ENCODER_A, INPUT_PULLUP);\n    pinMode(ENCODER_B, INPUT_PULLUP);\n    attachInterrupt(digitalPinToInterrupt(ENCODER_A), encoderISR, RISING);\n    Serial.println("SmartLAP:READY");\n}\n\nfloat getPositionM() { return (float)encoderCount / ENCODER_PPR * 0.05; }\n\nfloat getIrregularityMM() {\n    mpu.update();\n    float accelZ = mpu.getAccelZ();\n    float angle = asin(constrain(accelZ, -1.0, 1.0)) * 180.0 / PI;\n    float irregularity = angle * STRAIGHTEDGE_LENGTH_M * 1000.0 / 9.81;\n    return round((irregularity - offsetIrregularity) * 10.0) / 10.0;\n}\n\nfloat getInclinationDeg() { mpu.update(); return round(mpu.getAngleX() * 100.0) / 100.0; }\n\nvoid handleCommand(String cmd) {\n    cmd.trim(); cmd.toUpperCase();\n    if (cmd == "START") { testing = true; Serial.println("SmartLAP:STARTED"); }\n    else if (cmd == "STOP") { testing = false; Serial.println("SmartLAP:STOPPED"); }\n    else if (cmd == "TARE") { mpu.update(); offsetIrregularity = getIrregularityMM(); Serial.println("SmartLAP:TARED"); }\n    else if (cmd == "STATUS") { Serial.println(testing ? "SmartLAP:TESTING" : "SmartLAP:IDLE"); }\n}\n\nvoid loop() {\n    if (Serial.available()) {\n        String cmd = Serial.readStringUntil(\'\\n\');\n        handleCommand(cmd);\n    }\n    if (testing) {\n        float pos = getPositionM();\n        float irreg = getIrregularityMM();\n        float incl = getInclinationDeg();\n        if (!isnan(irreg) && !isnan(incl)) {\n            Serial.print(pos, 2);\n            Serial.print(",");\n            Serial.print(irreg, 1);\n            Serial.print(",");\n            Serial.println(incl, 2);\n        }\n        delay(500);\n    }\n}';
}

function getBitumenFirmware() {
  return '/*\n * SmartLAP \u2014 Bitumen Photo-Tester Firmware\n * =========================================\n * Board:      Arduino Uno / Nano\n * Sensors:    BH1750 Light Intensity (I2C)\n * Protocol:   SmartLAP Serial CSV\n * Format:     light_lux,transmission_pct,purity_index\\n\n * Wiring:\n *   BH1750 SDA \u2192 A4        SCL \u2192 A5\n *   VCC \u2192 3.3V             GND \u2192 GND\n *   ADDR \u2192 GND (I2C 0x23)\n *\n * Commands:   START / STOP / TARE / STATUS\n */\n#include <Wire.h>\n\n#define BH1750_ADDR     0x23\n#define REFERENCE_LUX   1000.0\n#define READ_INTERVAL_MS 500\n\nbool testing = false;\nfloat baselineLux = -1;\nunsigned long lastRead = 0;\n\nvoid setup() {\n    Serial.begin(9600);\n    Wire.begin();\n    Wire.beginTransmission(BH1750_ADDR);\n    Wire.write(0x10);\n    Wire.endTransmission();\n    delay(200);\n    Serial.println("SmartLAP:READY");\n}\n\nfloat readLightLux() {\n    Wire.requestFrom(BH1750_ADDR, 2);\n    if (Wire.available() == 2) {\n        byte msb = Wire.read(), lsb = Wire.read();\n        return round(((msb << 8) | lsb) / 1.2 * 10.0) / 10.0;\n    }\n    return -1;\n}\n\nvoid handleCommand(String cmd) {\n    cmd.trim(); cmd.toUpperCase();\n    if (cmd == "START") { testing = true; lastRead = millis(); Serial.println("SmartLAP:STARTED"); }\n    else if (cmd == "STOP") { testing = false; Serial.println("SmartLAP:STOPPED"); }\n    else if (cmd == "TARE") { baselineLux = readLightLux(); if (baselineLux < 0) baselineLux = REFERENCE_LUX; Serial.println("SmartLAP:TARED"); }\n    else if (cmd == "STATUS") { Serial.println(testing ? "SmartLAP:TESTING" : "SmartLAP:IDLE"); }\n}\n\nvoid loop() {\n    if (Serial.available()) {\n        String cmd = Serial.readStringUntil(\'\\n\');\n        handleCommand(cmd);\n    }\n    if (testing) {\n        unsigned long now = millis();\n        if (now - lastRead >= READ_INTERVAL_MS) {\n            lastRead = now;\n            float lux = readLightLux();\n            if (lux < 0) return;\n            float ref = (baselineLux > 0) ? baselineLux : REFERENCE_LUX;\n            float trans = (lux / ref) * 100.0;\n            if (trans > 100) trans = 100; if (trans < 0) trans = 0;\n            int purity = constrain(map((int)lux, 0, (int)ref, 0, 100), 0, 100);\n            Serial.print(lux, 1);\n            Serial.print(",");\n            Serial.print(trans, 2);\n            Serial.print(",");\n            Serial.println(purity);\n        }\n    }\n}';
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

/**
 * Escape HTML special characters for safe rendering.
 */
function escapeHtml(text) {
  var d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

/**
 * Get current language direction from body attribute.
 */
function isRTL() {
  return document.body.getAttribute('data-dir') === 'rtl';
}

/**
 * Render a manual entry into the modal body.
 */
function renderManualContent(testId) {
  var entry = DOCS_REGISTRY[testId];
  if (!entry || !entry.manual) return '<p style="color:var(--text-muted);">No manual available for this test.</p>';
  
  var html = '<div class="doc-content">';
  html += '<h2 class="doc-title">' + entry.icon + ' ' + entry.manual.title + '</h2>';
  
  for (var i = 0; i < entry.manual.sections.length; i++) {
    var section = entry.manual.sections[i];
    html += '<div class="doc-section">';
    html += '<h3 class="doc-section-heading">' + section.heading + '</h3>';
    html += '<div class="doc-section-body">' + section.content + '</div>';
    html += '</div>';
  }
  
  html += '</div>';
  return html;
}

/**
 * Render firmware code into the modal body with syntax highlighting.
 */
function renderFirmwareContent(testId) {
  var entry = DOCS_REGISTRY[testId];
  if (!entry || !entry.firmware) return '<p style="color:var(--text-muted);">No firmware code available for this test.</p>';
  
  var html = '<div class="doc-content">';
  html += '<h2 class="doc-title">' + entry.icon + ' ' + entry.firmware.name + '</h2>';
  html += '<p class="doc-subtitle">' + escapeHtml(entry.firmware.description) + '</p>';
  html += '<div class="doc-firmware-wrapper">';
  html += '<pre class="doc-code-block"><code>' + escapeHtml(entry.firmware.code) + '</code></pre>';
  html += '</div>';
  html += '</div>';
  
  return html;
}

// ================================================================
// MAIN APPLICATION FUNCTIONS
// ================================================================

/**
 * View test documentation or firmware in the modal viewer.
 * @param {string} testId - The test identifier (e.g., 'compaction', 'cbr')
 * @param {string} type - 'manual' or 'firmware'
 */
function viewTestDocs(testId, type) {
  var entry = DOCS_REGISTRY[testId];
  if (!entry) {
    showToast('Test "' + testId + '" not found in registry.', 'error');
    return;
  }
  
  var modal = document.getElementById('modal-doc-viewer');
  if (!modal) {
    showToast('Document viewer modal not found.', 'error');
    return;
  }
  
  var titleEl = document.getElementById('doc-viewer-title');
  var bodyEl = document.getElementById('doc-viewer-body');
  var downloadBtn = document.getElementById('doc-download-btn');
  
  if (!titleEl || !bodyEl) return;
  
  // Set title
  var typeLabel = type === 'manual' ? '📖 Manual' : '🔌 Firmware';
  titleEl.innerHTML = entry.icon + ' ' + entry.name + ' — ' + typeLabel;
  
  // Render content
  if (type === 'manual') {
    bodyEl.innerHTML = renderManualContent(testId);
    if (downloadBtn) downloadBtn.style.display = 'none';
  } else if (type === 'firmware') {
    bodyEl.innerHTML = renderFirmwareContent(testId);
    if (downloadBtn) {
      downloadBtn.style.display = 'inline-flex';
      downloadBtn.setAttribute('data-testid', testId);
      downloadBtn.onclick = function() { downloadFirmware(testId); };
    }
  }
  
  // Apply RTL if needed
  bodyEl.style.direction = isRTL() ? 'rtl' : 'ltr';
  bodyEl.style.textAlign = isRTL() ? 'right' : 'left';
  
  // Show the modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Close the document viewer modal.
 */
function closeDocViewer() {
  var modal = document.getElementById('modal-doc-viewer');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/**
 * Download firmware as a .ino file using blob download.
 * @param {string} testId - The test identifier
 */
function downloadFirmware(testId) {
  var entry = DOCS_REGISTRY[testId];
  if (!entry || !entry.firmware) {
    showToast('No firmware available for download.', 'warning');
    return;
  }
  
  var code = entry.firmware.code;
  var filename = entry.firmware.name || 'smartlap_' + testId + '.ino';
  
  try {
    var blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Downloaded: ' + filename, 'success');
  } catch (e) {
    showToast('Download error: ' + e.message, 'error');
  }
}

