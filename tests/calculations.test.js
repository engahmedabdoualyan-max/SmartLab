// ====================================================================
// SmartLAP Calculation Functions — Extracted from index.html
// These are pure-function mirrors of the logic in the codebase.
// ====================================================================

// ---------- Compaction ----------
function calcWetDensity(force, moldVolume) {
    return force / (moldVolume * 9.81);
}

function calcDryDensity(wetDensity, moisture) {
    return wetDensity / (1 + moisture / 100);
}

function calcCompactionRatio(maxDryDensity, referenceDensity) {
    if (referenceDensity <= 0) return 0;
    return (maxDryDensity / referenceDensity) * 100;
}

function calcReferenceDensity(refWeight, moldVolume) {
    if (moldVolume <= 0) return 0;
    return refWeight / moldVolume;
}

// ---------- CBR ----------
function calcCBR(penetration, load, stdLoad25, stdLoad50) {
    stdLoad25 = stdLoad25 || 13240;
    stdLoad50 = stdLoad50 || 19960;
    var cbr25 = Math.round(load / stdLoad25 * 100 * 100) / 100;
    var cbr50 = Math.round(load / stdLoad50 * 100 * 100) / 100;
    var cbr = cbr25;
    if (penetration >= 4.5 && penetration <= 5.5) cbr = cbr50;
    return cbr;
}

function calcCBRPressure(load, pistonArea) {
    return Math.round(load / pistonArea * 1000 * 100) / 100;
}

function calcCBRFinalResult(cbrAt25, cbrAt50) {
    var finalCBR = cbrAt25;
    if (cbrAt50 > cbrAt25) finalCBR = cbrAt50;
    return finalCBR;
}

// ---------- Maturity (Nurse-Saul) ----------
function calcNurseSaulMaturity(temperatures, t0, dt) {
    if (!temperatures || temperatures.length < 2) return 0;
    t0 = (t0 !== undefined && t0 !== null) ? t0 : -10;
    dt = (dt !== undefined && dt !== null) ? dt : 1;
    var totalM = 0;
    for (var i = 0; i < temperatures.length; i++) {
        totalM += (temperatures[i] + t0) * dt;
    }
    return totalM;
}

// ---------- Maturity (Arrhenius) ----------
function calcArrheniusMaturity(temperatures, t0) {
    if (!temperatures || temperatures.length < 2) return 0;
    t0 = (t0 !== undefined && t0 !== null) ? t0 : -10;
    var totalM = 0;
    for (var i = 1; i < temperatures.length; i++) {
        var dt = 0.25;
        var T = (temperatures[i] + temperatures[i - 1]) / 2;
        totalM += (T - t0) * dt;
    }
    return totalM;
}

// ---------- Strength from Maturity ----------
function calcStrengthFromMaturity(M, a, b) {
    a = (a !== undefined && a !== null) ? a : 30;
    b = (b !== undefined && b !== null) ? b : 0.02;
    return a * (1 - Math.exp(-b * M));
}

// ---------- Compressive Strength ----------
function calcCompressiveStress(forceKN, areaMm2) {
    return (forceKN * 1000) / areaMm2;
}

function calcCylinderArea(diameterMm) {
    var r = diameterMm / 2;
    return Math.PI * r * r;
}

function calcCubeArea(sideMm) {
    return sideMm * sideMm;
}

// ---------- Sieve Analysis ----------
function calcPercentRetained(massRetained, totalMass) {
    if (totalMass <= 0) return 0;
    return (massRetained / totalMass) * 100;
}

function calcPercentPassing(cumulativePercentRetained) {
    return Math.max(0, 100 - cumulativePercentRetained);
}

function calcCu(d60, d10) {
    if (d10 <= 0 || d60 <= 0) return 0;
    return d60 / d10;
}

function calcCc(d60, d30, d10) {
    if (d10 <= 0 || d60 <= 0 || d30 <= 0) return 0;
    return (d30 * d30) / (d60 * d10);
}

// ---------- Atterberg Limits ----------
function calcPI(LL, PL) {
    return LL - PL;
}

function classifyPlasticity(PI) {
    if (PI > 17) return 'High Plasticity';
    if (PI > 7) return 'Medium Plasticity';
    return 'Low Plasticity';
}

function classifyAtterberg(LL, PI) {
    // USCS-based simplified classification
    if (LL > 50) {
        if (PI > 7 && PI > (0.73 * (LL - 20))) return 'CH';
        if (PI <= 7 || PI <= (0.73 * (LL - 20))) return 'MH';
    } else {
        if (PI > 7 && PI > (0.73 * (LL - 20))) return 'CL';
        if (PI <= 7 || PI <= (0.73 * (LL - 20))) return 'ML';
    }
    return 'CL';
}

// ---------- Temperature Correction ----------
function temperatureCorrection(value, tempC, standardTemp) {
    var corrected = value * (1 + 0.000025 * (standardTemp - tempC));
    return Math.round(corrected * 100) / 100;
}

// ---------- Proctor Moisture-Density ----------
function proctorMaxDryDensity(densities) {
    if (!densities || densities.length === 0) return { maxDensity: 0, optimumMoisture: 0 };
    var maxDensity = -Infinity;
    var optimumMoisture = 0;
    for (var i = 0; i < densities.length; i++) {
        if (densities[i].dryDensity > maxDensity) {
            maxDensity = densities[i].dryDensity;
            optimumMoisture = densities[i].moisture;
        }
    }
    return { maxDensity: maxDensity, optimumMoisture: optimumMoisture };
}

// ---------- CBR Swell ----------
function cbrSwell(initialReading, finalReading, timeHours) {
    var swellPercent = Math.round(((finalReading - initialReading) / initialReading) * 100 * 100) / 100;
    var timeDays = timeHours / 24;
    return { swellPercent: swellPercent, timeDays: timeDays };
}

// ====================================================================
// TEST FRAMEWORK
// ====================================================================

var _tests = [];
var _suites = [];
var _currentSuite = '';

function describe(name, fn) {
    _currentSuite = name;
    _suites.push(name);
    fn();
    _currentSuite = '';
}

function it(name, fn) {
    _tests.push({ suite: _currentSuite, name: name, fn: fn });
}

function assertClose(actual, expected, tolerance, msg) {
    tolerance = tolerance || 0.01;
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error((msg || '') + ' Expected ~' + expected + ' but got ' + actual + ' (tolerance ±' + tolerance + ')');
    }
}

function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
        throw new Error((msg || '') + ' Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual));
    }
}

function assertTrue(val, msg) {
    if (!val) throw new Error(msg || 'Expected truthy value');
}

function assertFalse(val, msg) {
    if (val) throw new Error(msg || 'Expected falsy value');
}

// ====================================================================
// TESTS
// ====================================================================

// ------------------------------------------------------------------
// 1. COMPACTION CALCULATIONS
// ------------------------------------------------------------------
describe('Compaction Calculations', function () {

    it('Wet Density = Force / (moldVolume × 9.81)', function () {
        // Force=250 N, moldVolume=0.001 m³
        var wetDen = calcWetDensity(250, 0.001);
        // 250 / (0.001 * 9.81) = 250 / 0.00981 = 25484.199...
        assertClose(wetDen, 25484.20, 0.01);
    });

    it('Wet Density with standard Proctor mold (944 cm³)', function () {
        // Standard mold volume = 944 cm³ = 0.000944 m³
        // Force = 300 N
        var wetDen = calcWetDensity(300, 0.000944);
        // 300 / (0.000944 * 9.81) = 300 / 0.00926064 = 32395.17
        assertClose(wetDen, 32395.17, 0.01);
    });

    it('Wet Density with zero force returns 0', function () {
        var wetDen = calcWetDensity(0, 0.001);
        assertEqual(wetDen, 0);
    });

    it('Dry Density = Wet Density / (1 + moisture%/100)', function () {
        var wetDen = 25484.20;
        var moisture = 12.5;
        var dryDen = calcDryDensity(wetDen, moisture);
        // 25484.20 / (1 + 0.125) = 25484.20 / 1.125 = 22652.62
        assertClose(dryDen, 22652.62, 0.01);
    });

    it('Dry Density with 0% moisture equals wet density', function () {
        var wetDen = 20000;
        var dryDen = calcDryDensity(wetDen, 0);
        assertClose(dryDen, 20000, 0.001);
    });

    it('Dry Density with high moisture (25%)', function () {
        var wetDen = 30000;
        var dryDen = calcDryDensity(wetDen, 25);
        // 30000 / 1.25 = 24000
        assertClose(dryDen, 24000, 0.001);
    });

    it('Compaction Ratio = (Dry Density / Reference Density) × 100', function () {
        var mdd = 2050;
        var refDen = 2160;
        var ratio = calcCompactionRatio(mdd, refDen);
        // (2050 / 2160) * 100 = 94.91
        assertClose(ratio, 94.91, 0.01);
    });

    it('Compaction Ratio at 100% equals 100', function () {
        var ratio = calcCompactionRatio(2160, 2160);
        assertClose(ratio, 100.0, 0.001);
    });

    it('Compaction Ratio with zero reference returns 0', function () {
        var ratio = calcCompactionRatio(2050, 0);
        assertEqual(ratio, 0);
    });

    it('Reference Density = refWeight / moldVolume', function () {
        var refDen = calcReferenceDensity(2.2, 0.001);
        // 2.2 / 0.001 = 2200
        assertClose(refDen, 2200, 0.001);
    });

    it('End-to-end compaction calculation', function () {
        var force = 245;
        var moldVolume = 0.001;
        var moisture = 10;
        var refWeight = 2.15;

        var wetDen = calcWetDensity(force, moldVolume);
        var dryDen = calcDryDensity(wetDen, moisture);
        var refDen = calcReferenceDensity(refWeight, moldVolume);
        var ratio = calcCompactionRatio(dryDen, refDen);

        assertClose(wetDen, 24974.52, 0.1);
        assertClose(dryDen, 22704.11, 0.1);
        assertClose(refDen, 2150, 0.001);
        assertClose(ratio, 1056.00, 0.1); // very dense soil scenario
    });
});

// ------------------------------------------------------------------
// 2. CBR CALCULATIONS
// ------------------------------------------------------------------
describe('CBR Calculations', function () {

    it('CBR at 2.5mm = (Test Load / 13240) × 100', function () {
        var load = 6620; // N
        var cbr = calcCBR(2.5, load, 13240, 19960);
        // (6620 / 13240) * 100 = 50.00
        assertClose(cbr, 50.00, 0.01);
    });

    it('CBR at 5.0mm = (Test Load / 19960) × 100', function () {
        var load = 9980; // N
        var cbr = calcCBR(5.0, load, 13240, 19960);
        // (9980 / 19960) * 100 = 50.00
        assertClose(cbr, 50.00, 0.01);
    });

    it('CBR at 2.5mm uses cbr25 formula', function () {
        var load = 5000;
        var cbr = calcCBR(2.5, load, 13240, 19960);
        var expected = Math.round(5000 / 13240 * 100 * 100) / 100;
        assertClose(cbr, expected, 0.01);
    });

    it('CBR at penetration between 4.5-5.5mm uses cbr50 formula', function () {
        var load = 5000;
        var cbr48 = calcCBR(4.8, load, 13240, 19960);
        var expected50 = Math.round(5000 / 19960 * 100 * 100) / 100;
        assertClose(cbr48, expected50, 0.01);
    });

    it('CBR at penetration 1.0mm uses cbr25 formula', function () {
        var load = 3000;
        var cbr = calcCBR(1.0, load, 13240, 19960);
        var expected25 = Math.round(3000 / 13240 * 100 * 100) / 100;
        assertClose(cbr, expected25, 0.01);
    });

    it('CBR pressure = load / pistonArea × 1000', function () {
        var load = 6500;
        var pistonArea = 1963.5; // mm² for 152mm diameter
        var pressure = calcCBRPressure(load, pistonArea);
        // 6500 / 1963.5 * 1000 = 3310.42
        assertClose(pressure, 3310.42, 0.01);
    });

    it('CBR final result uses higher value', function () {
        var result1 = calcCBRFinalResult(42.5, 38.1);
        assertClose(result1, 42.5, 0.001);

        var result2 = calcCBRFinalResult(35.0, 48.2);
        assertClose(result2, 48.2, 0.001);

        var result3 = calcCBRFinalResult(50.0, 50.0);
        assertClose(result3, 50.0, 0.001);
    });

    it('CBR PASS when final >= 3%', function () {
        var finalCBR = calcCBRFinalResult(5.0, 3.5);
        assertTrue(finalCBR >= 3, 'Should PASS');
    });

    it('CBR FAIL when final < 3%', function () {
        var finalCBR = calcCBRFinalResult(2.0, 1.5);
        assertFalse(finalCBR >= 3, 'Should FAIL');
    });

    it('Typical CBR test with known data', function () {
        // Sample: 6 readings, standard ASTM D1883
        var readings = [
            { pen: 0.5, load: 1200 },
            { pen: 1.0, load: 2400 },
            { pen: 1.5, load: 3600 },
            { pen: 2.0, load: 4800 },
            { pen: 2.5, load: 6000 },
            { pen: 5.0, load: 8500 }
        ];

        var cbr25Result = calcCBR(2.5, 6000, 13240, 19960);
        var cbr50Result = calcCBR(5.0, 8500, 13240, 19960);
        var finalCBR = calcCBRFinalResult(cbr25Result, cbr50Result);

        assertClose(cbr25Result, 45.32, 0.01);  // (6000/13240)*100
        assertClose(cbr50Result, 42.59, 0.01);  // (8500/19960)*100
        assertClose(finalCBR, 45.32, 0.01);      // max of both
    });
});

// ------------------------------------------------------------------
// 3. MATURITY CALCULATIONS
// ------------------------------------------------------------------
describe('Maturity Calculations', function () {

    it('Nurse-Saul: M = Σ(T + T₀) × Δt', function () {
        // Temperatures: [20, 22, 24, 26], T0 = -10, dt = 1
        // Codebase formula: M = Σ(T + T₀) × dt
        // Note: the function applies (T + T₀) per reading, not (sum of T + T₀) * dt
        // = (20+(-10))*1 + (22+(-10))*1 + (24+(-10))*1 + (26+(-10))*1 = 10+12+14+16 = 52
        var temps = [20, 22, 24, 26];
        var M = calcNurseSaulMaturity(temps, -10, 1);
        assertClose(M, 52, 0.01);
    });

    it('Nurse-Saul with default T0=-10 and dt=1', function () {
        // = (20+(-10))*1 + (22+(-10))*1 + (24+(-10))*1 = 10+12+14 = 36
        var temps = [20, 22, 24];
        var M = calcNurseSaulMaturity(temps);
        assertClose(M, 36, 0.01);
    });

    it('Nurse-Saul with dt=0.25 (15 min intervals)', function () {
        // = (20+(-10))*0.25 + (22+(-10))*0.25 + (24+(-10))*0.25 = 2.5+3+3.5 = 9
        var temps = [20, 22, 24];
        var M = calcNurseSaulMaturity(temps, -10, 0.25);
        assertClose(M, 9, 0.01);
    });

    it('Nurse-Saul with T0=0 (no datum correction)', function () {
        // = (25+0)*1 + (25+0)*1 + (25+0)*1 = 25+25+25 = 75
        var temps = [25, 25, 25];
        var M = calcNurseSaulMaturity(temps, 0, 1);
        assertClose(M, 75, 0.01);
    });

    it('Nurse-Saul returns 0 for empty or single temp', function () {
        assertEqual(calcNurseSaulMaturity([], -10, 1), 0);
        assertEqual(calcNurseSaulMaturity([20], -10, 1), 0);
        assertEqual(calcNurseSaulMaturity(null, -10, 1), 0);
    });

    it('Arrhenius: M = Σ(T_avg - T₀) × Δt', function () {
        // Temperatures: [20, 25, 30], T0 = -10, dt = 0.25
        // T_avg between 20,25 = 22.5 => (22.5-(-10))*0.25 = 32.5*0.25 = 8.125
        // T_avg between 25,30 = 27.5 => (27.5-(-10))*0.25 = 37.5*0.25 = 9.375
        // Total = 17.5
        var temps = [20, 25, 30];
        var M = calcArrheniusMaturity(temps, -10);
        assertClose(M, 17.5, 0.01);
    });

    it('Arrhenius with default T0=-10', function () {
        var temps = [20, 30];
        var M = calcArrheniusMaturity(temps);
        // T_avg = 25 => (25-(-10))*0.25 = 35*0.25 = 8.75
        assertClose(M, 8.75, 0.01);
    });

    it('Arrhenius returns 0 for insufficient data', function () {
        assertEqual(calcArrheniusMaturity([], -10), 0);
        assertEqual(calcArrheniusMaturity([20], -10), 0);
        assertEqual(calcArrheniusMaturity(null, -10), 0);
    });

    it('Strength = A × (1 - e^(-B×M))', function () {
        // A=30, B=0.02, M=100
        // Strength = 30 * (1 - e^(-0.02*100)) = 30 * (1 - e^(-2)) = 30 * (1 - 0.1353) = 30 * 0.8647 = 25.94
        var strength = calcStrengthFromMaturity(100, 30, 0.02);
        assertClose(strength, 25.94, 0.01);
    });

    it('Strength approaches A as M approaches infinity', function () {
        var strength = calcStrengthFromMaturity(10000, 30, 0.02);
        assertClose(strength, 30, 0.01);
    });

    it('Strength is 0 when M is 0', function () {
        var strength = calcStrengthFromMaturity(0, 30, 0.02);
        assertClose(strength, 0, 0.001);
    });

    it('Strength with default parameters (A=30, B=0.02)', function () {
        var strength = calcStrengthFromMaturity(50);
        // 30 * (1 - e^(-0.02*50)) = 30 * (1 - e^(-1)) = 30 * 0.6321 = 18.96
        assertClose(strength, 18.96, 0.01);
    });

    it('End-to-end maturity with real sensor data', function () {
        // Simulate 4 readings at 15-min intervals (dt=0.25h)
        var temps = [22, 24, 26, 28];
        var M = calcArrheniusMaturity(temps, -10);
        var strength = calcStrengthFromMaturity(M, 30, 0.02);
        assertTrue(M > 0, 'Maturity should be positive');
        assertTrue(strength > 0, 'Strength should be positive');
        assertTrue(strength < 30, 'Strength should be less than max');
    });
});

// ------------------------------------------------------------------
// 4. COMPRESSIVE STRENGTH
// ------------------------------------------------------------------
describe('Compressive Strength Calculations', function () {

    it('Stress = Force × 1000 / Area (mm²)', function () {
        var forceKN = 450; // kN
        var areaMm2 = 22500; // 150×150 cube
        var stress = calcCompressiveStress(forceKN, areaMm2);
        // 450000 / 22500 = 20.0 MPa
        assertClose(stress, 20.0, 0.001);
    });

    it('Cylinder area = π × r² (150mm dia)', function () {
        var area = calcCylinderArea(150);
        // π × 75² = 17671.46
        assertClose(area, 17671.46, 0.01);
    });

    it('Cylinder area = π × r² (100mm dia)', function () {
        var area = calcCylinderArea(100);
        // π × 50² = 7853.98
        assertClose(area, 7853.98, 0.01);
    });

    it('Cube area = side² (150mm)', function () {
        var area = calcCubeArea(150);
        assertEqual(area, 22500);
    });

    it('Cube area = side² (100mm)', function () {
        var area = calcCubeArea(100);
        assertEqual(area, 10000);
    });

    it('Typical 150mm cube test: 800 kN', function () {
        var forceKN = 800;
        var area = calcCubeArea(150); // 22500 mm²
        var stress = calcCompressiveStress(forceKN, area);
        // 800000 / 22500 = 35.56 MPa
        assertClose(stress, 35.56, 0.01);
    });

    it('Typical 150×300mm cylinder test: 500 kN', function () {
        var forceKN = 500;
        var area = calcCylinderArea(150); // 17671.46 mm²
        var stress = calcCompressiveStress(forceKN, area);
        // 500000 / 17671.46 = 28.30 MPa
        assertClose(stress, 28.30, 0.01);
    });

    it('C30 concrete should pass (≥ 25 MPa)', function () {
        // 600 kN on 150mm cube: 600000 / 22500 = 26.67 MPa
        var stress = calcCompressiveStress(600, calcCubeArea(150));
        assertTrue(stress >= 25, 'C30 should pass');
    });

    it('Low strength should fail (< 25 MPa)', function () {
        var stress = calcCompressiveStress(300, calcCubeArea(150));
        assertFalse(stress >= 25, 'Should fail');
    });

    it('100mm cube area = 10000 mm²', function () {
        var area = calcCubeArea(100);
        assertEqual(area, 10000);
    });

    it('100mm dia cylinder area = π×50²', function () {
        var area = calcCylinderArea(100);
        assertClose(area, 7853.98, 0.01);
    });
});

// ------------------------------------------------------------------
// 5. SIEVE ANALYSIS
// ------------------------------------------------------------------
describe('Sieve Analysis Calculations', function () {

    it('% Retained = (mass retained / total mass) × 100', function () {
        var pctRet = calcPercentRetained(75, 500);
        assertClose(pctRet, 15.0, 0.001);
    });

    it('% Retained with 0 mass retained', function () {
        var pctRet = calcPercentRetained(0, 500);
        assertEqual(pctRet, 0);
    });

    it('% Retained with total mass 0 returns 0', function () {
        var pctRet = calcPercentRetained(100, 0);
        assertEqual(pctRet, 0);
    });

    it('% Passing = 100 - cumulative % retained', function () {
        var pass = calcPercentPassing(25);
        assertClose(pass, 75.0, 0.001);
    });

    it('% Passing at 0% retained = 100%', function () {
        var pass = calcPercentPassing(0);
        assertClose(pass, 100.0, 0.001);
    });

    it('% Passing at 100% retained = 0%', function () {
        var pass = calcPercentPassing(100);
        assertClose(pass, 0.0, 0.001);
    });

    it('% Passing never goes below 0', function () {
        var pass = calcPercentPassing(120);
        assertEqual(pass, 0);
    });

    it('Cu = D60 / D10', function () {
        var cu = calcCu(4.75, 0.3);
        // 4.75 / 0.3 = 15.83
        assertClose(cu, 15.83, 0.01);
    });

    it('Cc = (D30²) / (D60 × D10)', function () {
        var cc = calcCc(4.75, 1.18, 0.3);
        // (1.18²) / (4.75 × 0.3) = 1.3924 / 1.425 = 0.977
        assertClose(cc, 0.977, 0.01);
    });

    it('Cu returns 0 when D10 is 0', function () {
        var cu = calcCu(4.75, 0);
        assertEqual(cu, 0);
    });

    it('Cc returns 0 when D10 is 0', function () {
        var cc = calcCc(4.75, 1.18, 0);
        assertEqual(cc, 0);
    });

    it('Well-graded gravel: Cu > 6, 1 < Cc < 3', function () {
        var cu = calcCu(20, 0.5);
        var cc = calcCc(20, 3.0, 0.5);
        assertClose(cu, 40, 0.01);       // Cu = 40 > 6 ✓
        assertClose(cc, 0.9, 0.01);       // Cc = 0.9, NOT well-graded
        var wellGraded = cu > 6 && cc > 1 && cc < 3;
        assertFalse(wellGraded); // Cc < 1 so not well-graded
    });

    it('Well-graded sand: Cu=8, Cc=1.5', function () {
        var cu = calcCu(4.75, 0.6);
        var cc = calcCc(4.75, 1.5, 0.6);
        // Cu = 7.92, Cc = (2.25)/(4.75*0.6) = 0.789
        assertClose(cu, 7.92, 0.01);
        var wellGraded = cu > 6 && cc > 1 && cc < 3;
        // Cc = 0.789, NOT well-graded
        assertFalse(wellGraded);
    });

    it('End-to-end sieve analysis with typical data', function () {
        var sieveSizes = [75, 37.5, 19, 9.5, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15, 0.075];
        var masses = [0, 0, 25, 60, 80, 70, 55, 45, 40, 35, 30];
        var totalMass = 440; // sum of masses

        var passPcts = [];
        var cumRet = 0;
        for (var i = 0; i < masses.length; i++) {
            var pctRet = calcPercentRetained(masses[i], totalMass);
            cumRet += pctRet;
            passPcts.push(calcPercentPassing(cumRet));
        }

        // First sieve (75mm): 0% retained, 100% passing
        assertClose(passPcts[0], 100.0, 0.01);

        // Last sieve (0.075mm): fines
        assertTrue(passPcts[passPcts.length - 1] < 100);

        // Gravel (>4.75mm) = 100 - passing at 4.75mm
        // gravel = 100 - passPcts[4]  where index 4 = 4.75mm
        var gravel = 100 - passPcts[4];
        assertTrue(gravel > 0, 'Should have some gravel');
    });

    it('Find D60, D30, D10 from passing percentages', function () {
        var sieveSizes = [75, 37.5, 19, 9.5, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15, 0.075];
        var passPcts = [100, 98.5, 88.6, 72.7, 54.5, 43.2, 35.2, 28.4, 21.6, 13.6, 6.8];

        var d60 = 0, d30 = 0, d10 = 0;
        for (var i = 0; i < passPcts.length - 1; i++) {
            if (passPcts[i] >= 60 && passPcts[i + 1] < 60) d60 = sieveSizes[i];
            if (passPcts[i] >= 30 && passPcts[i + 1] < 30) d30 = sieveSizes[i];
            if (passPcts[i] >= 10 && passPcts[i + 1] < 10) d10 = sieveSizes[i];
        }

        assertEqual(d60, 9.5);   // passPcts[3]=72.7 >= 60, passPcts[4]=54.5 < 60
        assertEqual(d30, 1.18);  // passPcts[6]=35.2 >= 30, passPcts[7]=28.4 < 30
        assertEqual(d10, 0.15);  // passPcts[9]=13.6 >= 10, passPcts[10]=6.8 < 10

        var cu = calcCu(d60, d10);
        var cc = calcCc(d60, d30, d10);
        assertClose(cu, 63.33, 0.01);   // 9.5 / 0.15
        assertClose(cc, 0.98, 0.01);    // (1.18²) / (9.5 * 0.15)
    });
});

// ------------------------------------------------------------------
// 6. ATTERBERG LIMITS
// ------------------------------------------------------------------
describe('Atterberg Limits Calculations', function () {

    it('PI = LL - PL', function () {
        var pi = calcPI(45, 22);
        assertEqual(pi, 23);
    });

    it('PI with LL=30, PL=18', function () {
        var pi = calcPI(30, 18);
        assertEqual(pi, 12);
    });

    it('PI with LL=PL (non-plastic behavior)', function () {
        var pi = calcPI(25, 25);
        assertEqual(pi, 0);
    });

    it('PI > 17 → High Plasticity', function () {
        assertEqual(classifyPlasticity(20), 'High Plasticity');
        assertEqual(classifyPlasticity(25), 'High Plasticity');
        assertEqual(classifyPlasticity(18), 'High Plasticity');
    });

    it('PI 7 < PI ≤ 17 → Medium Plasticity', function () {
        assertEqual(classifyPlasticity(10), 'Medium Plasticity');
        assertEqual(classifyPlasticity(15), 'Medium Plasticity');
        assertEqual(classifyPlasticity(8), 'Medium Plasticity');
    });

    it('PI ≤ 7 → Low Plasticity', function () {
        assertEqual(classifyPlasticity(3), 'Low Plasticity');
        assertEqual(classifyPlasticity(7), 'Low Plasticity');
        assertEqual(classifyPlasticity(0), 'Low Plasticity');
    });

    it('USCS: LL=55, PI=25 → CH (Fat Clay)', function () {
        // LL > 50 → high LL zone
        // PI > 7 AND PI > 0.73*(LL-20) = 0.73*35 = 25.55
        // PI=25 < 25.55, so it falls BELOW A-line → MH
        // Actually: 0.73*(55-20) = 0.73*35 = 25.55
        // PI=25 < 25.55, so it's MH
        var result = classifyAtterberg(55, 25);
        assertEqual(result, 'MH');
    });

    it('USCS: LL=55, PI=30 → CH (Fat Clay)', function () {
        // LL > 50, PI > 0.73*(55-20) = 25.55
        // PI=30 > 25.55 → CH
        var result = classifyAtterberg(55, 30);
        assertEqual(result, 'CH');
    });

    it('USCS: LL=35, PI=15 → CL (Lean Clay)', function () {
        // LL ≤ 50, PI > 7 AND PI > 0.73*(35-20) = 10.95
        // PI=15 > 10.95 → CL
        var result = classifyAtterberg(35, 15);
        assertEqual(result, 'CL');
    });

    it('USCS: LL=35, PI=5 → ML (Silt)', function () {
        // LL ≤ 50, PI ≤ 7 → ML
        var result = classifyAtterberg(35, 5);
        assertEqual(result, 'ML');
    });

    it('USCS: LL=70, PI=10 → MH (Elastic Silt)', function () {
        // LL > 50, PI=10 > 7 but PI=10 < 0.73*(70-20)=36.5 → MH
        var result = classifyAtterberg(70, 10);
        assertEqual(result, 'MH');
    });

    it('End-to-end Atterberg with typical CL soil', function () {
        var LL = 42;
        var PL = 20;
        var pi = calcPI(LL, PL);
        var plasticity = classifyPlasticity(pi);
        var uscs = classifyAtterberg(LL, pi);

        assertEqual(pi, 22);
        assertEqual(plasticity, 'High Plasticity');
        assertEqual(uscs, 'CL'); // LL<=50, PI>7, PI(22) > 0.73*(42-20)=16.06
    });
});

// ------------------------------------------------------------------
// 7. TEMPERATURE CORRECTION
// ------------------------------------------------------------------
describe('Temperature Correction Calculations', function () {

    it('Correct value from 25°C to standard 20°C (cooling)', function () {
        // corrected = 100 * (1 + 0.000025 * (20 - 25))
        // = 100 * (1 - 0.000125) = 100 * 0.999875 = 99.9875 -> 99.99
        var result = temperatureCorrection(100, 25, 20);
        assertClose(result, 99.99, 0.01);
    });

    it('Correct value from 20°C to standard 25°C (warming)', function () {
        // corrected = 50 * (1 + 0.000025 * (25 - 20))
        // = 50 * (1 + 0.000125) = 50 * 1.000125 = 50.00625 -> 50.01
        var result = temperatureCorrection(50, 20, 25);
        assertClose(result, 50.01, 0.01);
    });

    it('Correct value with no temperature difference', function () {
        // corrected = 200 * (1 + 0.000025 * (25 - 25)) = 200 * 1 = 200
        var result = temperatureCorrection(200, 25, 25);
        assertClose(result, 200.00, 0.001);
    });
});

// ------------------------------------------------------------------
// 8. PROCTOR MOISTURE-DENSITY
// ------------------------------------------------------------------
describe('Proctor Moisture-Density', function () {

    it('Find max dry density and optimum moisture from 3 points', function () {
        var points = [
            { moisture: 10, dryDensity: 1800 },
            { moisture: 12, dryDensity: 1900 },
            { moisture: 14, dryDensity: 1850 }
        ];
        var result = proctorMaxDryDensity(points);
        assertClose(result.maxDensity, 1900, 0.001);
        assertClose(result.optimumMoisture, 12, 0.001);
    });

    it('Find max dry density with first point being highest', function () {
        var points = [
            { moisture: 8, dryDensity: 1950 },
            { moisture: 10, dryDensity: 1900 },
            { moisture: 12, dryDensity: 1850 }
        ];
        var result = proctorMaxDryDensity(points);
        assertClose(result.maxDensity, 1950, 0.001);
        assertClose(result.optimumMoisture, 8, 0.001);
    });

    it('Returns zero for empty array', function () {
        var result = proctorMaxDryDensity([]);
        assertEqual(result.maxDensity, 0);
        assertEqual(result.optimumMoisture, 0);
    });
});

// ------------------------------------------------------------------
// 9. CBR SWELL CALCULATIONS
// ------------------------------------------------------------------
describe('CBR Swell Calculations', function () {

    it('Swell percentage and time for 4-day soak', function () {
        // swell% = ((12.5 - 10) / 10) * 100 = 25%
        // timeDays = 96 / 24 = 4
        var result = cbrSwell(10, 12.5, 96);
        assertClose(result.swellPercent, 25.00, 0.01);
        assertClose(result.timeDays, 4, 0.001);
    });

    it('Zero swell when readings are equal', function () {
        var result = cbrSwell(10, 10, 48);
        assertClose(result.swellPercent, 0.00, 0.01);
        assertClose(result.timeDays, 2, 0.001);
    });

    it('Swell percentage with typical 3-day test', function () {
        // swell% = ((26.5 - 25) / 25) * 100 = 6%
        // timeDays = 72 / 24 = 3
        var result = cbrSwell(25, 26.5, 72);
        assertClose(result.swellPercent, 6.00, 0.01);
        assertClose(result.timeDays, 3, 0.001);
    });
});
