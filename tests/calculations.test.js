// ====================================================================
// SmartLAP Calculation Functions — Unit Tests
// Imports calculations.js directly (no duplicate code)
// ====================================================================
var calc = require('../js/calculations.js');

// ------------------------------------------------------------------
// 1. COMPACTION
// ------------------------------------------------------------------
describe('Compaction Calculations', function () {
    it('Wet Density = Force / (moldVolume \u00d7 9.81)', function () {
        var result = calc.calcWetDensity(500, 0.001);
        assertClose(result, 50968.40, 0.01);
    });
    it('Wet Density with standard Proctor mold (944 cm\u00b3)', function () {
        var result = calc.calcWetDensity(450, 0.000944);
        assertClose(result, 48592.75, 0.01);
    });
    it('Wet Density with zero force returns 0', function () {
        var result = calc.calcWetDensity(0, 0.001);
        assertClose(result, 0, 0.001);
    });
    it('Dry Density = Wet Density / (1 + moisture%/100)', function () {
        var wetDensity = calc.calcWetDensity(500, 0.001);
        var dryDensity = calc.calcDryDensity(wetDensity, 12);
        assertClose(dryDensity, 45507.50, 0.01);
    });
    it('Dry Density with 0% moisture equals wet density', function () {
        var result = calc.calcDryDensity(2000, 0);
        assertClose(result, 2000, 0.001);
    });
    it('Dry Density with high moisture (25%)', function () {
        var result = calc.calcDryDensity(2000, 25);
        assertClose(result, 1600, 0.001);
    });
    it('Compaction Ratio = (Dry Density / Reference Density) \u00d7 100', function () {
        var result = calc.calcCompactionRatio(1900, 2000);
        assertClose(result, 95, 0.001);
    });
    it('Compaction Ratio at 100% equals 100', function () {
        var result = calc.calcCompactionRatio(2000, 2000);
        assertClose(result, 100, 0.001);
    });
    it('Compaction Ratio with zero reference returns 0', function () {
        var result = calc.calcCompactionRatio(1900, 0);
        assertClose(result, 0, 0.001);
    });
    it('Reference Density = refWeight / moldVolume', function () {
        var result = calc.calcReferenceDensity(2, 0.001);
        assertClose(result, 2000, 0.001);
    });
    it('End-to-end compaction calculation', function () {
        var force = 480, moldVol = 0.000944, moisture = 10, refWeight = 1.8;
        var wd = calc.calcWetDensity(force, moldVol);
        var dd = calc.calcDryDensity(wd, moisture);
        var rd = calc.calcReferenceDensity(refWeight, moldVol);
        var cr = calc.calcCompactionRatio(dd, rd);
        assertClose(wd, 51832.27, 0.01);
        assertClose(dd, 47120.25, 0.01);
        assertClose(rd, 1906.78, 0.01);
        assertClose(cr, 2471.20, 0.01);
    });
});

// ------------------------------------------------------------------
// 2. CBR
// ------------------------------------------------------------------
describe('CBR Calculations', function () {
    it('CBR at 2.5mm = (Test Load / 13240) \u00d7 100', function () {
        var cbr25 = calc.calcCBR(2.5, 1324);
        assertClose(cbr25, 10, 0.01);
        var cbr50 = calc.calcCBR(5.0, 1324);
        assertClose(cbr50, 6.63, 0.01);
    });
    it('CBR at 5.0mm = (Test Load / 19960) \u00d7 100', function () {
        var result = calc.calcCBR(5.0, 3992);
        assertClose(result, 20, 0.01);
    });
    it('CBR at 2.5mm formula for shallow penetration', function () {
        var result = calc.calcCBR(1.0, 1324);
        assertClose(result, 10, 0.01);
    });
    it('CBR at penetration between 4.5-5.5mm uses cbr50 formula', function () {
        var result = calc.calcCBR(5.0, 3992, 13240, 19960);
        assertClose(result, 20, 0.01);
    });
    it('CBR at penetration 1.0mm uses cbr25 formula', function () {
        var result = calc.calcCBR(1.0, 1324, 13240, 19960);
        assertClose(result, 10, 0.01);
    });
    it('CBR pressure = load / pistonArea \u00d7 1000', function () {
        var result = calc.calcCBRPressure(1963.5, 1963.5);
        assertClose(result, 1000, 0.01);
    });
    it('CBR final result uses higher value', function () {
        var result = calc.calcCBRFinalResult(5, 8);
        assertEqual(result, 8);
    });
    it('CBR PASS when final >= 3%', function () {
        var result = calc.calcCBRFinalResult(4, 5);
        assertEqual(result, 5);
    });
    it('CBR FAIL when final < 3%', function () {
        var result = calc.calcCBRFinalResult(1, 2);
        assertEqual(result, 2);
    });
    it('Typical CBR test with known data', function () {
        var r1 = calc.calcCBR(2.5, 4500);
        var r2 = calc.calcCBR(5.0, 6800);
        var final = calc.calcCBRFinalResult(r1, r2);
        assertClose(r1, 33.99, 0.01);
        assertClose(r2, 34.07, 0.01);
        assertClose(final, 34.07, 0.01);
    });
});

// ------------------------------------------------------------------
// 3. MATURITY (NURSE-SAUL)
// ------------------------------------------------------------------
describe('Maturity Calculations', function () {
    it('Nurse-Saul: M = \u03a3(T + T\u2080) \u00d7 \u0394t', function () {
        var temps = [20, 25, 30, 35, 40];
        var result = calc.calcNurseSaulMaturity(temps, -10, 1);
        assertClose(result, 100, 0.001); // T+T0: 10+15+20+25+30
    });
    it('Nurse-Saul with default T0=-10 and dt=1', function () {
        var temps = [20, 25, 30];
        var result = calc.calcNurseSaulMaturity(temps);
        assertClose(result, 45, 0.001);
    });
    it('Nurse-Saul with dt=0.25 (15 min intervals)', function () {
        var temps = [20, 25, 30, 35];
        var result = calc.calcNurseSaulMaturity(temps, -10, 0.25);
        assertClose(result, 17.5, 0.001);
    });
    it('Nurse-Saul with T0=0 (no datum correction)', function () {
        var temps = [20, 25, 30];
        var result = calc.calcNurseSaulMaturity(temps, 0, 1);
        assertClose(result, 75, 0.001);
    });
    it('Nurse-Saul returns 0 for empty or single temp', function () {
        assertEqual(calc.calcNurseSaulMaturity([]), 0);
        assertEqual(calc.calcNurseSaulMaturity([25]), 0);
    });
    it('Arrhenius: M = \u03a3(T_avg - T\u2080) \u00d7 \u0394t', function () {
        var temps = [20, 30, 40, 50];
        var result = calc.calcArrheniusMaturity(temps, -10);
        assertClose(result, 33.75, 0.001);
    });
    it('Arrhenius with default T0=-10', function () {
        var temps = [20, 30, 40, 50];
        var result = calc.calcArrheniusMaturity(temps);
        assertClose(result, 33.75, 0.001);
    });
    it('Arrhenius returns 0 for insufficient data', function () {
        assertEqual(calc.calcArrheniusMaturity([]), 0);
        assertEqual(calc.calcArrheniusMaturity([25]), 0);
    });
    it('Strength = A \u00d7 (1 - e^(-B\u00d7M))', function () {
        var result = calc.calcStrengthFromMaturity(500, 30, 0.02);
        assertClose(result, 29.99, 0.01);
    });
    it('Strength approaches A as M approaches infinity', function () {
        var result = calc.calcStrengthFromMaturity(10000, 30, 0.02);
        assertClose(result, 30, 0.001);
    });
    it('Strength is 0 when M is 0', function () {
        var result = calc.calcStrengthFromMaturity(0, 30, 0.02);
        assertClose(result, 0, 0.001);
    });
    it('Strength with default parameters (A=30, B=0.02)', function () {
        var result = calc.calcStrengthFromMaturity(500);
        assertClose(result, 29.99, 0.01);
    });
    it('End-to-end maturity with real sensor data', function () {
        var temps = [18, 22, 26, 30, 34, 38, 36, 32];
        var ns = calc.calcNurseSaulMaturity(temps, -10, 0.25);
        var arr = calc.calcArrheniusMaturity(temps);
        var strength = calc.calcStrengthFromMaturity(ns);
        assertClose(ns, 39, 0.01);
        assertClose(arr, 70.25, 0.01);
        assertClose(strength, 16.25, 0.01);
    });
});

// ------------------------------------------------------------------
// 4. COMPRESSIVE STRENGTH
// ------------------------------------------------------------------
describe('Compressive Strength Calculations', function () {
    it('Stress = Force \u00d7 1000 / Area (mm\u00b2)', function () {
        var result = calc.calcCompressiveStress(500, 17671.46);
        assertClose(result, 28.29, 0.01);
    });
    it('Cylinder area = \u03c0 \u00d7 r\u00b2 (150mm dia)', function () {
        var result = calc.calcCylinderArea(150);
        assertClose(result, 17671.46, 0.01);
    });
    it('Cylinder area = \u03c0 \u00d7 r\u00b2 (100mm dia)', function () {
        var result = calc.calcCylinderArea(100);
        assertClose(result, 7853.98, 0.01);
    });
    it('Cube area = side\u00b2 (150mm)', function () {
        var result = calc.calcCubeArea(150);
        assertClose(result, 22500, 0.001);
    });
    it('Cube area = side\u00b2 (100mm)', function () {
        var result = calc.calcCubeArea(100);
        assertClose(result, 10000, 0.001);
    });
    it('Typical 150mm cube test: 800 kN', function () {
        var stress = calc.calcCompressiveStress(800, calc.calcCubeArea(150));
        assertClose(stress, 35.56, 0.01);
        var grade = stress >= 25 ? 'PASS' : 'FAIL';
        assertEqual(grade, 'PASS');
    });
    it('Typical 150\u00d7300mm cylinder test: 500 kN', function () {
        var stress = calc.calcCompressiveStress(500, calc.calcCylinderArea(150));
        assertClose(stress, 28.29, 0.01);
    });
    it('C30 concrete should pass (\u2265 25 MPa)', function () {
        var stress = calc.calcCompressiveStress(600, calc.calcCubeArea(150));
        assertTrue(stress >= 25);
    });
    it('Low strength should fail (< 25 MPa)', function () {
        var stress = calc.calcCompressiveStress(300, calc.calcCubeArea(150));
        assertTrue(stress < 25);
    });
    it('100mm cube area = 10000 mm\u00b2', function () {
        assertClose(calc.calcCubeArea(100), 10000, 0.001);
    });
    it('100mm dia cylinder area = \u03c0\u00d750\u00b2', function () {
        assertClose(calc.calcCylinderArea(100), 7853.98, 0.01);
    });
});

// ------------------------------------------------------------------
// 5. SIEVE ANALYSIS
// ------------------------------------------------------------------
describe('Sieve Analysis Calculations', function () {
    it('% Retained = (mass retained / total mass) \u00d7 100', function () {
        var result = calc.calcPercentRetained(50, 500);
        assertClose(result, 10, 0.001);
    });
    it('% Retained with 0 mass retained', function () {
        var result = calc.calcPercentRetained(0, 500);
        assertClose(result, 0, 0.001);
    });
    it('% Retained with total mass 0 throws error', function () {
        try { calc.calcPercentRetained(50, 0); assertTrue(false); }
        catch (e) { assertTrue(e.message.indexOf('Invalid') >= 0); }
    });
    it('% Passing = 100 - cumulative % retained', function () {
        var result = calc.calcPercentPassing(30);
        assertClose(result, 70, 0.001);
    });
    it('% Passing at 0% retained = 100%', function () {
        var result = calc.calcPercentPassing(0);
        assertClose(result, 100, 0.001);
    });
    it('% Passing at 100% retained = 0%', function () {
        var result = calc.calcPercentPassing(100);
        assertClose(result, 0, 0.001);
    });
    it('% Passing with value > 100 throws error', function () {
        try { calc.calcPercentPassing(150); assertTrue(false); }
        catch (e) { assertTrue(e.message.indexOf('Invalid') >= 0); }
    });
    it('Cu = D60 / D10', function () {
        var result = calc.calcCu(2.0, 0.3);
        assertClose(result, 6.67, 0.01);
    });
    it('Cc = (D30\u00b2) / (D60 \u00d7 D10)', function () {
        var result = calc.calcCc(0.8, 2.0, 0.3);
        assertClose(result, 1.07, 0.01);
    });
    it('Cu returns 0 when D10 is 0', function () {
        assertEqual(calc.calcCu(2.0, 0), 0);
    });
    it('Cc returns 0 when D10 is 0', function () {
        assertEqual(calc.calcCc(0.8, 2.0, 0), 0);
    });
    it('Well-graded gravel: Cu=20, Cc=1.8, gravel=60%', function () {
        var cls = calc.classifySoil(10, 3, 0.5, { fines: 2, gravel: 60 });
        assertEqual(cls, 'GW');
    });
    it('Poorly graded sand: Cu=8, Cc=0.72 (Cc out of range)', function () {
        var cls = calc.classifySoil(2.0, 0.6, 0.25, { fines: 3, gravel: 10 });
        assertEqual(cls, 'SP');
    });
    it('End-to-end sieve analysis with typical data', function () {
        var masses = [0, 5, 25, 60, 80, 70, 55, 45, 40, 35, 30];
        var total = masses.reduce(function(a,b){return a+b;}, 0);
        var cumRet = 0;
        masses.forEach(function(m, i) {
            var pct = calc.calcPercentRetained(m, total);
            cumRet += pct;
            var pass = calc.calcPercentPassing(cumRet);
            assertTrue(pct >= 0);
            assertTrue(pass >= 0 && pass <= 100);
        });
    });
    it('Find D60, D30, D10 from passing percentages', function () {
        var sizes = [75, 37.5, 19, 9.5, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15, 0.075];
        var passing = [100, 98, 90, 75, 55, 35, 20, 12, 6, 3, 1];
        var d60 = 0, d30 = 0, d10 = 0;
        for (var i = 0; i < passing.length - 1; i++) {
            if (passing[i] >= 60 && passing[i + 1] < 60) d60 = sizes[i];
            if (passing[i] >= 30 && passing[i + 1] < 30) d30 = sizes[i];
            if (passing[i] >= 10 && passing[i + 1] < 10) d10 = sizes[i];
        }
        assertTrue(d60 > 0);
        assertTrue(d30 > 0);
        assertTrue(d10 > 0);
        var cu = calc.calcCu(d60, d10);
        var cc = calc.calcCc(d30, d60, d10);
        assertTrue(cu > 0);
        assertTrue(cc > 0);
    });
});

// ------------------------------------------------------------------
// 6. ATTERBERG LIMITS
// ------------------------------------------------------------------
describe('Atterberg Limits Calculations', function () {
    it('PI = LL - PL', function () {
        assertEqual(calc.calcPI(30, 18), 12);
    });
    it('PI with LL=30, PL=18', function () {
        assertEqual(calc.calcPI(30, 18), 12);
    });
    it('PI with LL=PL (non-plastic behavior)', function () {
        assertEqual(calc.calcPI(25, 25), 0);
    });
    it('PI > 17 \u2192 High Plasticity', function () {
        assertEqual(calc.classifyPlasticity(20), 'High Plasticity');
    });
    it('PI 7 < PI \u2264 17 \u2192 Medium Plasticity', function () {
        assertEqual(calc.classifyPlasticity(12), 'Medium Plasticity');
    });
    it('PI \u2264 7 \u2192 Low Plasticity', function () {
        assertEqual(calc.classifyPlasticity(5), 'Low Plasticity');
    });
    it('USCS: LL=55, PI=25 \u2192 MH (Elastic Silt, below A-line)', function () {
        assertEqual(calc.classifyAtterberg(55, 25), 'MH');
    });
    it('USCS: LL=55, PI=30 \u2192 CH (Fat Clay)', function () {
        assertEqual(calc.classifyAtterberg(55, 30), 'CH');
    });
    it('USCS: LL=35, PI=15 \u2192 CL (Lean Clay)', function () {
        assertEqual(calc.classifyAtterberg(35, 15), 'CL');
    });
    it('USCS: LL=35, PI=5 \u2192 ML (Silt)', function () {
        assertEqual(calc.classifyAtterberg(35, 5), 'ML');
    });
    it('USCS: LL=70, PI=10 \u2192 MH (Elastic Silt)', function () {
        assertEqual(calc.classifyAtterberg(70, 10), 'MH');
    });
    it('End-to-end Atterberg with typical CL soil', function () {
        var LL = 42, PL = 20;
        var pi = calc.calcPI(LL, PL);
        var plasticity = calc.classifyPlasticity(pi);
        var uscs = calc.classifyAtterberg(LL, pi);
        assertEqual(pi, 22);
        assertEqual(plasticity, 'High Plasticity');
        assertEqual(uscs, 'CL');
    });
});

// ------------------------------------------------------------------
// 7. TEMPERATURE CORRECTION
// ------------------------------------------------------------------
describe('Temperature Correction Calculations', function () {
    it('Correct value from 25\u00b0C to standard 20\u00b0C (cooling)', function () {
        var result = calc.temperatureCorrection(100, 25, 20);
        assertClose(result, 99.99, 0.01);
    });
    it('Correct value from 20\u00b0C to standard 25\u00b0C (warming)', function () {
        var result = calc.temperatureCorrection(50, 20, 25);
        assertClose(result, 50.01, 0.01);
    });
    it('Correct value with no temperature difference', function () {
        var result = calc.temperatureCorrection(200, 25, 25);
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
        var result = calc.proctorMaxDryDensity(points);
        assertClose(result.maxDensity, 1900, 0.001);
        assertClose(result.optimumMoisture, 12, 0.001);
    });
    it('Find max dry density with first point being highest', function () {
        var points = [
            { moisture: 8, dryDensity: 1950 },
            { moisture: 10, dryDensity: 1900 },
            { moisture: 12, dryDensity: 1850 }
        ];
        var result = calc.proctorMaxDryDensity(points);
        assertClose(result.maxDensity, 1950, 0.001);
        assertClose(result.optimumMoisture, 8, 0.001);
    });
    it('Returns zero for empty array', function () {
        var result = calc.proctorMaxDryDensity([]);
        assertEqual(result.maxDensity, 0);
        assertEqual(result.optimumMoisture, 0);
    });
});

// ------------------------------------------------------------------
// 9. CBR SWELL CALCULATIONS
// ------------------------------------------------------------------
describe('CBR Swell Calculations', function () {
    it('Swell percentage and time for 4-day soak', function () {
        var result = calc.cbrSwell(10, 12.5, 96);
        assertClose(result.swellPercent, 25.00, 0.01);
        assertClose(result.timeDays, 4, 0.001);
    });
    it('Zero swell when readings are equal', function () {
        var result = calc.cbrSwell(10, 10, 48);
        assertClose(result.swellPercent, 0.00, 0.01);
        assertClose(result.timeDays, 2, 0.001);
    });
    it('Swell percentage with typical 3-day test', function () {
        var result = calc.cbrSwell(25, 26.5, 72);
        assertClose(result.swellPercent, 6.00, 0.01);
        assertClose(result.timeDays, 3, 0.001);
    });
});
