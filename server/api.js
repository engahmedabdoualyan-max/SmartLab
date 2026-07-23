const express = require('express');
const cors = require('cors');
const calc = require('../js/calculations.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const endpoints = [];

function addRoute(method, path, fn, paramNames, description) {
    endpoints.push({ method: method.toUpperCase(), path, params: paramNames, description });
    app[method](path, (req, res) => {
        try {
            const args = paramNames.map(name => req.body[name]);
            const result = fn(...args);
            res.json({ success: true, data: result });
        } catch (error) {
            res.json({ success: false, error: error.message });
        }
    });
}

// GET /health
app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.1.0' });
});

// GET /endpoints
app.get('/endpoints', (req, res) => {
    res.json({ endpoints });
});

// --- Compaction Module ---
addRoute('post', '/api/compaction/calculate', calc.calcWetDensity, ['force', 'moldVolume', 'gravity'], 'Calculate wet density from force, mold volume, and gravity');
addRoute('post', '/api/compaction/dry-density', calc.calcDryDensity, ['wetDensity', 'moisture'], 'Calculate dry density from wet density and moisture content');
addRoute('post', '/api/compaction/ratio', calc.calcCompactionRatio, ['maxDryDensity', 'referenceDensity'], 'Calculate compaction ratio percentage');
addRoute('post', '/api/compaction/reference-density', calc.calcReferenceDensity, ['refWeight', 'moldVolume'], 'Calculate reference density from weight and volume');
addRoute('post', '/api/compaction/estimateOptimum', calc.calcOptimumMoisture, ['strikes', 'moldVolume'], 'Estimate optimum moisture content from strike data');
addRoute('post', '/api/compaction/average-moisture', calc.calcAverageMoisture, ['strikes'], 'Calculate average moisture from strike data');
addRoute('post', '/api/compaction/average-force', calc.calcAverageForce, ['strikes'], 'Calculate average force from strike data');
addRoute('post', '/api/compaction/max-force', calc.calcMaxForce, ['strikes'], 'Calculate maximum force from strike data');
addRoute('post', '/api/compaction/compact-weight', calc.calcCompactWeight, ['strikes', 'moldVolume'], 'Calculate compacted weight from strikes and volume');

// --- CBR Module ---
addRoute('post', '/api/cbr/calculate', calc.calcCBR, ['penetration', 'load', 'stdLoad25', 'stdLoad50'], 'Calculate CBR value from penetration depth and load');
addRoute('post', '/api/cbr/pressure', calc.calcCBRPressure, ['load', 'pistonArea'], 'Calculate CBR pressure from load and piston area');
addRoute('post', '/api/cbr/final-result', calc.calcCBRFinalResult, ['cbrAt25', 'cbrAt50'], 'Calculate final CBR as max of 2.5mm and 5.0mm values');

// --- Maturity Module ---
addRoute('post', '/api/maturity/nurse-saul', calc.calcNurseSaulMaturity, ['temperatures', 't0', 'dt'], 'Calculate concrete maturity using Nurse-Saul method');
addRoute('post', '/api/maturity/arrhenius', calc.calcArrheniusMaturity, ['temperatures', 't0'], 'Calculate concrete maturity using Arrhenius method');
addRoute('post', '/api/maturity/strength', calc.calcStrengthFromMaturity, ['M', 'A', 'B'], 'Calculate concrete strength from maturity value');

// --- Compressive Strength Module ---
addRoute('post', '/api/compressive-strength/stress', calc.calcCompressiveStress, ['forceKN', 'areaMm2'], 'Calculate compressive stress from force and area');
addRoute('post', '/api/compressive-strength/cylinder-area', calc.calcCylinderArea, ['diameterMm'], 'Calculate cylinder cross-sectional area');
addRoute('post', '/api/compressive-strength/cube-area', calc.calcCubeArea, ['sideMm'], 'Calculate cube cross-sectional area');

// --- Sieve Analysis Module ---
addRoute('post', '/api/sieve/calculate', calc.calcPercentRetained, ['massRetained', 'totalMass'], 'Calculate percentage of material retained on sieve');
addRoute('post', '/api/sieve/percent-passing', calc.calcPercentPassing, ['cumulativePercentRetained'], 'Calculate percentage of material passing through sieve');
addRoute('post', '/api/sieve/uniformity-coefficient', calc.calcCu, ['d60', 'd10'], 'Calculate uniformity coefficient (Cu)');
addRoute('post', '/api/sieve/curvature-coefficient', calc.calcCc, ['d30', 'd60', 'd10'], 'Calculate coefficient of curvature (Cc)');
addRoute('post', '/api/sieve/classify', calc.classifySoil, ['d60', 'd30', 'd10'], 'Classify soil based on grain size distribution');

// --- Atterberg Limits Module ---
addRoute('post', '/api/atterberg/calculate', calc.calcPI, ['LL', 'PL'], 'Calculate plasticity index from liquid and plastic limits');
addRoute('post', '/api/atterberg/classify-plasticity', calc.classifyPlasticity, ['PI'], 'Classify soil plasticity based on PI');
addRoute('post', '/api/atterberg/classify', calc.classifyAtterberg, ['LL', 'PI'], 'Classify soil according to USCS system');

// --- Strike Utility ---
addRoute('post', '/api/strike/create', calc.createStrike, ['index', 'moisture', 'force', 'wetDensity', 'dryDensity'], 'Create a strike object for test calculations');

app.listen(PORT, () => {
    console.log(`SmartLAP API server running on port ${PORT}`);
});
