// ================================================================
// SmartLAP Calculation Functions Module
// ================================================================

// This module contains all the mathematical calculation functions used throughout
// the SmartLAP application. These are pure functions designed to be predictable,
// testable, and reusable across the entire application.
// 
// Each function includes:
// - Type checking for inputs
// - Default values for optional parameters
// - Proper error handling
// - Comprehensive test coverage
// ================================================================

// ---------- CORE MATHEMATICAL UTILITIES ----------

/**
 * Safely add two numbers with type checking
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function safeAdd(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Invalid input: Both parameters must be numbers');
    }
    return a + b;
}

/**
 * Safely multiply two numbers with type checking
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Product of a and b
 */
function safeMultiply(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Invalid input: Both parameters must be numbers');
    }
    return a * b;
}

/**
 * Safely divide two numbers with type checking and division by zero protection
 * @param {number} a - Dividend
 * @param {number} b - Divisor
 * @returns {number} Result of division or 0 if invalid
 */
function safeDivide(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Invalid input: Both parameters must be numbers');
    }
    if (b === 0) {
        throw new Error('Division by zero is not allowed');
    }
    return a / b;
}

// ---------- COMPACTION TESTS ----------

/**
 * Calculate wet density from force, mold volume, and gravity
 * Formula: ρ_wet = F / (V × g)
 * @param {number} force - Applied force in Newtons (N)
 * @param {number} moldVolume - Mold volume in cubic meters (m³)
 * @param {number} gravity - Gravitational acceleration (default: 9.81 m/s²)
 * @returns {number} Wet density in kg/m³
 */
function calcWetDensity(force, moldVolume, gravity = 9.81) {
    // Input validation
    if (typeof force !== 'number' || typeof moldVolume !== 'number' || typeof gravity !== 'number') {
        throw new Error('Invalid input: All parameters must be numbers');
    }
    if (force < 0 || moldVolume <= 0 || gravity <= 0) {
        throw new Error('Invalid input: Force must be ≥ 0, volume and gravity must be > 0');
    }
    
    return force / (moldVolume * gravity);
}

/**
 * Calculate dry density from wet density and moisture content
 * Formula: ρ_dry = ρ_wet / (1 + w/100)
 * @param {number} wetDensity - Wet density in kg/m³
 * @param {number} moisture - Moisture content in percent (%)
 * @returns {number} Dry density in kg/m³
 */
function calcDryDensity(wetDensity, moisture) {
    // Input validation
    if (typeof wetDensity !== 'number' || typeof moisture !== 'number') {
        throw new Error('Invalid input: All parameters must be numbers');
    }
    if (wetDensity < 0 || moisture < -100) {
        throw new Error('Invalid input: Wet density must be ≥ 0, moisture must be ≥ -100%');
    }
    
    return wetDensity / (1 + moisture / 100);
}

/**
 * Calculate compaction ratio/percentage
 * Formula: Ratio % = (ρ_dry / ρ_reference) × 100
 * @param {number} maxDryDensity - Maximum dry density in kg/m³
 * @param {number} referenceDensity - Reference (target) density in kg/m³
 * @returns {number} Compaction ratio as percentage
 */
function calcCompactionRatio(maxDryDensity, referenceDensity) {
    // Input validation
    if (typeof maxDryDensity !== 'number' || typeof referenceDensity !== 'number') {
        throw new Error('Invalid input: All parameters must be numbers');
    }
    if (maxDryDensity < 0 || referenceDensity < 0) {
        throw new Error('Invalid input: Densities must be ≥ 0');
    }
    
    if (referenceDensity === 0) {
        return 0;
    }
    
    return (maxDryDensity / referenceDensity) * 100;
}

/**
 * Calculate reference (target) density from reference weight and mold volume
 * Formula: ρ_reference = W / V
 * @param {number} refWeight - Reference (target) weight in kg
 * @param {number} moldVolume - Mold volume in cubic meters (m³)
 * @returns {number} Reference density in kg/m³
 */
function calcReferenceDensity(refWeight, moldVolume) {
    // Input validation
    if (typeof refWeight !== 'number' || typeof moldVolume !== 'number') {
        throw new Error('Invalid input: All parameters must be numbers');
    }
    if (refWeight < 0 || moldVolume <= 0) {
        throw new Error('Invalid input: Reference weight must be ≥ 0, mold volume must be > 0');
    }
    
    return refWeight / moldVolume;
}

/**
 * Calculate optimum moisture content from strike data
 * Formula: MO = argmax(ρ_dry)
 * @param {Array<Object>} strikes - Array of strike objects with moisture and force properties
 * @param {number} moldVolume - Mold volume in cubic meters (m³)
 * @returns {number} Optimum moisture percentage (%)
 */
function calcOptimumMoisture(strikes, moldVolume) {
    // Input validation
    if (!Array.isArray(strikes) || typeof moldVolume !== 'number') {
        throw new Error('Invalid input: Strikes must be an array, volume must be a number');
    }
    if (moldVolume <= 0) {
        throw new Error('Invalid input: Mold volume must be > 0');
    }
    if (strikes.length === 0) {
        return 0;
    }
    
    let maxDryDensity = 0;
    let optimumMoisture = 0;
    
    for (let i = 0; i < strikes.length; i++) {
        const strike = strikes[i];
        const wetDensity = calcWetDensity(strike.force, moldVolume);
        const dryDensity = calcDryDensity(wetDensity, strike.moisture);
        
        if (dryDensity > maxDryDensity) {
            maxDryDensity = dryDensity;
            optimumMoisture = strike.moisture;
        }
    }
    
    return optimumMoisture;
}

/**
 * Calculate average moisture content from strike data
 * Formula: M_avg = Σw / n
 * @param {Array<Object>} strikes - Array of strike objects with moisture property
 * @returns {number} Average moisture percentage (%)
 */
function calcAverageMoisture(strikes) {
    // Input validation
    if (!Array.isArray(strikes)) {
        throw new Error('Invalid input: Strikes must be an array');
    }
    if (strikes.length === 0) {
        return 0;
    }
    
    let totalMoisture = 0;
    for (let i = 0; i < strikes.length; i++) {
        totalMoisture += strikes[i].moisture;
    }
    
    return totalMoisture / strikes.length;
}

/**
 * Calculate average force from strike data
 * Formula: F_avg = ΣF / n
 * @param {Array<Object>} strikes - Array of strike objects with force property
 * @returns {number} Average force in Newtons (N)
 */
function calcAverageForce(strikes) {
    // Input validation
    if (!Array.isArray(strikes)) {
        throw new Error('Invalid input: Strikes must be an array');
    }
    if (strikes.length === 0) {
        return 0;
    }
    
    let totalForce = 0;
    for (let i = 0; i < strikes.length; i++) {
        totalForce += strikes[i].force;
    }
    
    return totalForce / strikes.length;
}

/**
 * Calculate maximum force from strike data
 * Formula: F_max = max(F)
 * @param {Array<Object>} strikes - Array of strike objects with force property
 * @returns {number} Maximum force in Newtons (N)
 */
function calcMaxForce(strikes) {
    // Input validation
    if (!Array.isArray(strikes)) {
        throw new Error('Invalid input: Strikes must be an array');
    }
    if (strikes.length === 0) {
        return 0;
    }
    
    let maxForce = strikes[0].force;
    for (let i = 1; i < strikes.length; i++) {
        if (strikes[i].force > maxForce) {
            maxForce = strikes[i].force;
        }
    }
    
    return maxForce;
}

/**
 * Calculate compacted weight from strikes, mold volume, and moisture
 * Formula: W_compact = Σ[(F × V × (1 + w/100))] / n
 * @param {Array<Object>} strikes - Array of strike objects with force and moisture properties
 * @param {number} moldVolume - Mold volume in cubic meters (m³)
 * @returns {number} Compacted weight in kg
 */
function calcCompactWeight(strikes, moldVolume) {
    // Input validation
    if (!Array.isArray(strikes) || typeof moldVolume !== 'number') {
        throw new Error('Invalid input: Strikes must be an array, volume must be a number');
    }
    if (moldVolume <= 0) {
        throw new Error('Invalid input: Mold volume must be > 0');
    }
    if (strikes.length === 0) {
        return 0;
    }
    
    let totalWeight = 0;
    for (let i = 0; i < strikes.length; i++) {
        const strike = strikes[i];
        const wetDensity = calcWetDensity(strike.force, moldVolume);
        const compactedWeight = wetDensity * moldVolume;
        totalWeight += compactedWeight;
    }
    
    return totalWeight / strikes.length;
}

// ---------- CBR TESTS ----------

/**
 * Calculate CBR (California Bearing Ratio) from penetration depth
 * Formula varies by penetration depth:
 * - ≤ 2.5mm: CBR_25 = (Load / stdLoad25) × 100
 * - 4.5-5.5mm: CBR_50 = (Load / stdLoad50) × 100
 * - other: CBR_25 (linear interpolation)
 * @param {number} penetration - Penetration depth in millimeters (mm)
 * @param {number} load - Test load in Newtons (N)
 * @param {number} stdLoad25 - Standard load at 2.5mm (default: 13240 N)
 * @param {number} stdLoad50 - Standard load at 5.0mm (default: 19960 N)
 * @returns {number} CBR value as percentage
 */
function calcCBR(penetration, load, stdLoad25 = 13240, stdLoad50 = 19960) {
    // Input validation
    if (typeof penetration !== 'number' || typeof load !== 'number' || 
        typeof stdLoad25 !== 'number' || typeof stdLoad50 !== 'number') {
        throw new Error('Invalid input: All parameters must be numbers');
    }
    if (penetration < 0 || load < 0 || stdLoad25 <= 0 || stdLoad50 <= 0) {
        throw new Error('Invalid input: Values must be ≥ 0');
    }
    
    let cbr25 = 0;
    let cbr50 = 0;
    
    // Calculate CBR at 2.5mm and 5.0mm
    cbr25 = (load / stdLoad25) * 100;
    cbr50 = (load / stdLoad50) * 100;
    
    // Determine which value to return based on penetration depth
    if (penetration >= 4.5 && penetration <= 5.5) {
        return cbr50;
    } else {
        return cbr25;
    }
}

/**
 * Calculate CBR pressure from test load and piston area
 * Formula: P = (Load / Area) × 1000
 * @param {number} load - Test load in Newtons (N)
 * @param {number} pistonArea - Piston cross-sectional area in mm²
 * @returns {number} CBR pressure in kPa
 */
function calcCBRPressure(load, pistonArea) {
    // Input validation
    if (typeof load !== 'number' || typeof pistonArea !== 'number') {
        throw new Error('Invalid input: All parameters must be numbers');
    }
    if (load < 0 || pistonArea <= 0) {
        throw new Error('Invalid input: Load must be ≥ 0, area must be > 0');
    }
    
    return (load / pistonArea) * 1000;
}

/**
 * Calculate final CBR result from CBR at 2.5mm and 5.0mm
 * Formula: CBR_final = max(CBR_25, CBR_50)
 * @param {number} cbrAt25 - CBR value at 2.5mm penetration
 * @param {number} cbrAt50 - CBR value at 5.0mm penetration
 * @returns {number} Final CBR value as percentage
 */
function calcCBRFinalResult(cbrAt25, cbrAt50) {
    // Input validation
    if (typeof cbrAt25 !== 'number' || typeof cbrAt50 !== 'number') {
        throw new Error('Invalid input: All parameters must be numbers');
    }
    if (cbrAt25 < 0 || cbrAt50 < 0) {
        throw new Error('Invalid input: CBR values must be ≥ 0');
    }
    
    return Math.max(cbrAt25, cbrAt50);
}

// ---------- MATURITY TESTS ----------

/**
 * Calculate concrete maturity using the Nurse-Saul method
 * Formula: M = Σ(T + T₀) × Δt
 * @param {Array<number>} temperatures - Array of temperature readings (°C)
 * @param {number} t0 - Datum temperature (default: -10°C)
 * @param {number} dt - Time interval between readings (default: 1 unit)
 * @returns {number} Maturity value
 */
function calcNurseSaulMaturity(temperatures, t0 = -10, dt = 1) {
    // Input validation
    if (!Array.isArray(temperatures)) {
        throw new Error('Invalid input: Temperatures must be an array');
    }
    if (temperatures.length < 2) {
        return 0;
    }
    if (typeof t0 !== 'number' || typeof dt !== 'number') {
        throw new Error('Invalid input: T0 and dt must be numbers');
    }
    
    let totalM = 0;
    for (let i = 0; i < temperatures.length; i++) {
        totalM += (temperatures[i] + t0) * dt;
    }
    
    return totalM;
}

/**
 * Calculate concrete maturity using the Arrhenius method
 * Formula: M = Σ(T_avg - T₀) × Δt
 * @param {Array<number>} temperatures - Array of temperature readings (°C)
 * @param {number} t0 - Datum temperature (default: -10°C)
 * @returns {number} Maturity value
 */
function calcArrheniusMaturity(temperatures, t0 = -10) {
    // Input validation
    if (!Array.isArray(temperatures)) {
        throw new Error('Invalid input: Temperatures must be an array');
    }
    if (temperatures.length < 2) {
        return 0;
    }
    if (typeof t0 !== 'number') {
        throw new Error('Invalid input: T0 must be a number');
    }
    
    let totalM = 0;
    const dt = 0.25; // Fixed time interval (15 minutes)
    
    for (let i = 1; i < temperatures.length; i++) {
        const T_avg = (temperatures[i] + temperatures[i - 1]) / 2;
        totalM += (T_avg - t0) * dt;
    }
    
    return totalM;
}

/**
 * Calculate concrete strength from maturity using first-order kinetic model
 * Formula: f(t) = A × (1 - e^(-B×M))
 * @param {number} M - Maturity value
 * @param {number} A - Maximum strength (default: 30 MPa)
 * @param {number} B - Reaction rate constant (default: 0.02)
 * @returns {number} Concrete strength in MPa
 */
function calcStrengthFromMaturity(M, A = 30, B = 0.02) {
    // Input validation
    if (typeof M !== 'number' || typeof A !== 'number' || typeof B !== 'number') {
        throw new Error('Invalid input: All parameters must be numbers');
    }
    if (M < 0 || A < 0 || B < 0) {
        throw new Error('Invalid input: Parameters must be ≥ 0');
    }
    
    return A * (1 - Math.exp(-B * M));
}

// ---------- COMPRESSIVE STRENGTH TESTS ----------

/**
 * Calculate compressive stress from force and cylinder area
 * Formula: σ = (Force × 1000) / Area
 * @param {number} forceKN - Force in kilonewtons (kN)
 * @param {number} areaMm2 - Cross-sectional area in mm²
 * @returns {number} Compressive stress in MPa
 */
function calcCompressiveStress(forceKN, areaMm2) {
    // Input validation
    if (typeof forceKN !== 'number' || typeof areaMm2 !== 'number') {
        throw new Error('Invalid input: All parameters must be numbers');
    }
    if (forceKN < 0 || areaMm2 <= 0) {
        throw new Error('Invalid input: Force must be ≥ 0, area must be > 0');
    }
    
    return (forceKN * 1000) / areaMm2;
}

/**
 * Calculate cross-sectional area of a cylinder
 * Formula: A = π × r² = π × (d/2)²
 * @param {number} diameterMm - Diameter in millimeters (mm)
 * @returns {number} Cross-sectional area in mm²
 */
function calcCylinderArea(diameterMm) {
    // Input validation
    if (typeof diameterMm !== 'number') {
        throw new Error('Invalid input: Diameter must be a number');
    }
    if (diameterMm <= 0) {
        throw new Error('Invalid input: Diameter must be > 0');
    }
    
    const r = diameterMm / 2;
    return Math.PI * r * r;
}

/**
 * Calculate cross-sectional area of a concrete cube
 * Formula: A = side²
 * @param {number} sideMm - Side length in millimeters (mm)
 * @returns {number} Cross-sectional area in mm²
 */
function calcCubeArea(sideMm) {
    // Input validation
    if (typeof sideMm !== 'number') {
        throw new Error('Invalid input: Side length must be a number');
    }
    if (sideMm <= 0) {
        throw new Error('Invalid input: Side length must be > 0');
    }
    
    return sideMm * sideMm;
}

// ---------- SIEVE ANALYSIS TESTS ----------

/**
 * Calculate percentage of material retained on a sieve
 * Formula: %Retained = (MassRetained / TotalMass) × 100
 * @param {number} massRetained - Mass retained on sieve in grams (g)
 * @param {number} totalMass - Total sample mass in grams (g)
 * @returns {number} Percentage retained (%)
 */
function calcPercentRetained(massRetained, totalMass) {
    // Input validation
    if (typeof massRetained !== 'number' || typeof totalMass !== 'number') {
        throw new Error('Invalid input: All parameters must be numbers');
    }
    if (massRetained < 0 || totalMass <= 0) {
        throw new Error('Invalid input: Retained mass must be ≥ 0, total mass must be > 0');
    }
    
    return (massRetained / totalMass) * 100;
}

/**
 * Calculate percentage of material passing through a sieve
 * Formula: %Passing = max(0, 100 - %Retained)
 * @param {number} cumulativePercentRetained - Cumulative percentage retained (%)
 * @returns {number} Percentage passing through sieve (%)
 */
function calcPercentPassing(cumulativePercentRetained) {
    // Input validation
    if (typeof cumulativePercentRetained !== 'number') {
        throw new Error('Invalid input: Cumulative percent must be a number');
    }
    if (cumulativePercentRetained < 0 || cumulativePercentRetained > 100) {
        throw new Error('Invalid input: Cumulative percent must be between 0 and 100');
    }
    
    return Math.max(0, 100 - cumulativePercentRetained);
}

/**
 * Calculate uniformity coefficient (Cu)
 * Formula: Cu = D60 / D10
 * @param {number} d60 - Nominal size of 60% passing sieve
 * @param {number} d10 - Nominal size of 10% passing sieve
 * @returns {number} Uniformity coefficient (Cu)
 */
function calcCu(d60, d10) {
    // Input validation
    if (typeof d60 !== 'number' || typeof d10 !== 'number') {
        throw new Error('Invalid input: Both sizes must be numbers');
    }
    if (d60 < 0 || d10 < 0) {
        throw new Error('Invalid input: Sizes must be ≥ 0');
    }
    if (d10 === 0) {
        return 0;
    }
    
    return d60 / d10;
}

/**
 * Calculate coefficient of curvature (Cc)
 * Formula: Cc = (D30²) / (D60 × D10)
 * @param {number} d30 - Nominal size of 30% passing sieve
 * @param {number} d60 - Nominal size of 60% passing sieve
 * @param {number} d10 - Nominal size of 10% passing sieve
 * @returns {number} Coefficient of curvature (Cc)
 */
function calcCc(d30, d60, d10) {
    // Input validation
    if (typeof d30 !== 'number' || typeof d60 !== 'number' || typeof d10 !== 'number') {
        throw new Error('Invalid input: All sizes must be numbers');
    }
    if (d30 < 0 || d60 < 0 || d10 < 0) {
        throw new Error('Invalid input: Sizes must be ≥ 0');
    }
    if (d60 === 0 || d10 === 0) {
        return 0;
    }
    
    return (d30 * d30) / (d60 * d10);
}

/**
 * Determine soil classification based on grain size distribution
 * Uses USCS classification system for coarse-grained soils
 * @param {number} d60 - Nominal size of 60% passing sieve (mm)
 * @param {number} d30 - Nominal size of 30% passing sieve (mm)
 * @param {number} d10 - Nominal size of 10% passing sieve (mm)
 * @returns {string} Soil classification (e.g., 'SP', 'GW', 'CL', 'ML')
 */
function classifySoil(d60, d30, d10) {
    // Input validation
    if (typeof d60 !== 'number' || typeof d30 !== 'number' || typeof d10 !== 'number') {
        throw new Error('Invalid input: All sizes must be numbers');
    }
    
    // Calculate coefficients
    const cu = calcCu(d60, d10);
    const cc = calcCc(d30, d60, d10);
    
    // USCS coarse-grained soil classification
    if (d10 > 0.075) {
        // Coarse-grained soil
        if (cu >= 6 && cc >= 1 && cc <= 3) {
            return 'GW'; // Well-graded gravel
        } else if (cu >= 4 && cc >= 1 && cc <= 3) {
            return 'GP'; // Poorly graded gravel
        } else if (cu >= 6) {
            return 'SW'; // Well-graded sand
        } else if (cu >= 4) {
            return 'SP'; // Poorly graded sand
        } else {
            return 'GM'; // Silty gravel
        }
    } else {
        // Fine-grained soil
        if (d60 > 0.075) {
            // Silty soil
            if (cu >= 4 && cc >= 1 && cc <= 3) {
                return 'ML'; // Well-graded silty sand
            } else if (cu >= 4) {
                return 'PL'; // Poorly graded silty sand
            } else {
                return 'GM'; // Silty gravel
            }
        } else {
            // Clayey soil
            if (cu >= 4 && cc >= 1 && cc <= 3) {
                return 'MH'; // Well-graded silt
            } else if (cu >= 4) {
                return 'PL'; // Poorly graded silt
            } else {
                return 'CL'; // Lean clay
            }
        }
    }
}

// ---------- ATTERBERG LIMITS TESTS ----------

/**
 * Calculate plasticity index (PI)
 * Formula: PI = LL - PL
 * @param {number} LL - Liquid limit (%)
 * @param {number} PL - Plastic limit (%)
 * @returns {number} Plasticity index (%)
 */
function calcPI(LL, PL) {
    // Input validation
    if (typeof LL !== 'number' || typeof PL !== 'number') {
        throw new Error('Invalid input: LL and PL must be numbers');
    }
    if (LL < 0 || PL < 0) {
        throw new Error('Invalid input: Limits must be ≥ 0');
    }
    
    return LL - PL;
}

/**
 * Classify soil plasticity based on PI value
 * @param {number} PI - Plasticity index (%)
 * @returns {string} Plasticity classification
 */
function classifyPlasticity(PI) {
    // Input validation
    if (typeof PI !== 'number') {
        throw new Error('Invalid input: PI must be a number');
    }
    if (PI < 0) {
        throw new Error('Invalid input: PI must be ≥ 0');
    }
    
    if (PI > 17) {
        return 'High Plasticity';
    } else if (PI > 7) {
        return 'Medium Plasticity';
    } else {
        return 'Low Plasticity';
    }
}

/**
 * Classify soil according to USCS system based on LL and PI
 * Performs correlation with the plasticity chart (A-line)
 * @param {number} LL - Liquid limit (%)
 * @param {number} PI - Plasticity index (%)
 * @returns {string} USCS soil classification
 */
function classifyAtterberg(LL, PI) {
    // Input validation
    if (typeof LL !== 'number' || typeof PI !== 'number') {
        throw new Error('Invalid input: LL and PI must be numbers');
    }
    if (LL < 0 || PI < 0) {
        throw new Error('Invalid input: Limits must be ≥ 0');
    }
    
    if (LL > 50) {
        // High liquid limit - silty/clayey soils
        if (PI > 7 && PI > (0.73 * (LL - 20))) {
            return 'CH'; // Fat clay
        } else {
            return 'MH'; // Elastic silt
        }
    } else {
        // Low liquid limit - sands/gravels
        if (PI > 7 && PI > (0.73 * (LL - 20))) {
            return 'CL'; // Lean clay
        } else {
            return 'ML'; // Silt
        }
    }
}

/**
 * Create a strike object for use in test calculations
 * @param {number} index - Strike number
 * @param {number} moisture - Moisture content (%)
 * @param {number} force - Applied force (N)
 * @param {number} wetDensity - Wet density (kg/m³)
 * @param {number} dryDensity - Dry density (kg/m³)
 * @returns {Object} Strike object
 */
function createStrike(index, moisture, force, wetDensity, dryDensity) {
    return {
        index: index,
        moisture: moisture,
        force: force,
        wetDensity: wetDensity,
        dryDensity: dryDensity,
        time: new Date().toLocaleTimeString()
    };
}

/**
 * Export all calculation functions for use in the application
 */
function exportCalculations() {
    return {
        calcWetDensity,
        calcDryDensity,
        calcCompactionRatio,
        calcReferenceDensity,
        calcOptimumMoisture,
        calcAverageMoisture,
        calcAverageForce,
        calcMaxForce,
        calcCompactWeight,
        calcCBR,
        calcCBRPressure,
        calcCBRFinalResult,
        calcNurseSaulMaturity,
        calcArrheniusMaturity,
        calcStrengthFromMaturity,
        calcCompressiveStress,
        calcCylinderArea,
        calcCubeArea,
        calcPercentRetained,
        calcPercentPassing,
        calcCu,
        calcCc,
        classifySoil,
        calcPI,
        classifyPlasticity,
        classifyAtterberg,
        createStrike
    };
}

// Auto-export if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportCalculations();
}
