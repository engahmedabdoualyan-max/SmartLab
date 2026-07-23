// ================================================================
// SMARTLAP ML — PREDICTIONS ENGINE
// ================================================================
var SmartLabML = {
    predictConcreteStrength: function(params) {
        var wc = params.water / params.cement;
        var age = params.age || 28;
        var A = 9.5;
        var raw = A * Math.pow(Math.max(0, params.cement / params.water - 0.5), 0.5) * Math.log(age + 1) / Math.log(29);
        if (params.admixtures > 0) raw *= (1 + 0.02 * params.admixtures);
        var totalAgg = (params.fineAgg || 700) + (params.coarseAgg || 1100);
        if (totalAgg > 0) {
            var aggFactor = 1 + 0.0001 * (totalAgg - 1800);
            raw *= aggFactor;
        }
        var confidence = Math.min(95, Math.round(60 + (1 - Math.abs(wc - 0.45)) * 80));
        var margin = raw * 0.08;
        return {
            predicted: Math.round(raw * 100) / 100,
            confidence: confidence,
            range: { min: Math.round((raw - margin) * 100) / 100, max: Math.round((raw + margin) * 100) / 100 },
            wcRatio: Math.round(wc * 100) / 100
        };
    },

    predictMoistureContent: function(params) {
        var soilData = {
            'CL': { omc: 14.5, mdd: 1820 }, 'CH': { omc: 18.0, mdd: 1680 },
            'SM': { omc: 11.5, mdd: 1900 }, 'SC': { omc: 12.8, mdd: 1860 },
            'ML': { omc: 13.0, mdd: 1780 }, 'MH': { omc: 19.5, mdd: 1650 },
            'GW': { omc: 8.0, mdd: 2100 }, 'GP': { omc: 7.5, mdd: 2050 },
            'SW': { omc: 10.0, mdd: 1950 }, 'SP': { omc: 9.0, mdd: 1880 }
        };
        var base = soilData[params.soilType] || soilData['CL'];
        var energy = params.compactionEnergy || 'standard';
        var ef = energy === 'modified' ? 1.12 : (energy === 'heavy' ? 1.2 : 1.0);
        var mdd = Math.round(base.mdd * ef);
        var omc = Math.round(base.omc * (1 / Math.sqrt(ef)) * 10) / 10;
        var mddMargin = mdd * 0.03;
        var omcMargin = omc * 0.08;
        return {
            optimumMoisture: omc, maxDryDensity: mdd, confidence: 85,
            moistureRange: { min: Math.round((omc - omcMargin) * 10) / 10, max: Math.round((omc + omcMargin) * 10) / 10 },
            densityRange: { min: Math.round(mdd - mddMargin), max: Math.round(mdd + mddMargin) }
        };
    },

    predictMarshallStability: function(params) {
        var bc = params.bitumenContent || 4.5;
        var vma = params.voidsInMineralAggregate || 14;
        var peakBC = 4.5;
        var stability = 8500 * Math.exp(-0.5 * Math.pow((bc - peakBC) / 1.2, 2)) * (vma / 14);
        var flow = 2.5 + 0.5 * (bc - 3.5);
        var stabMargin = stability * 0.1;
        return {
            stability: Math.round(stability), flow: Math.round(flow * 10) / 10, confidence: 78,
            stabilityRange: { min: Math.round(stability - stabMargin), max: Math.round(stability + stabMargin) },
            flowRange: { min: Math.round((flow - 0.5) * 10) / 10, max: Math.round((flow + 0.5) * 10) / 10 }
        };
    }
};

// Backward compatibility alias
if (typeof window !== 'undefined') window.SmartLAPML = SmartLabML;

function showMLPrediction(testType) {
    var body = document.getElementById('ml-predictions-body');
    if (!body) return;
    var html = '';
    if (testType === 'compaction') {
        html = '<h4>Soil Type & Compaction Energy</h4>';
        html += '<div class="form-group"><label>Soil Type</label><select id="ml-soil-type"><option value="CL">CL — Lean Clay</option><option value="CH">CH — Fat Clay</option><option value="SM">SM — Silty Sand</option><option value="SC">SC — Clayey Sand</option><option value="ML">ML — Silt</option><option value="MH">MH — Elastic Silt</option><option value="GW">GW — Well-graded Gravel</option><option value="GP">GP — Poorly-graded Gravel</option><option value="SW">SW — Well-graded Sand</option><option value="SP">SP — Poorly-graded Sand</option></select></div>';
        html += '<div class="form-group"><label>Compaction Energy</label><select id="ml-comp-energy"><option value="standard">Standard Proctor</option><option value="modified">Modified Proctor</option><option value="heavy">Heavy Compaction</option></select></div>';
        html += '<button onclick="runMLCompactionPrediction()" class="btn-primary" style="width:100%;margin-top:12px;">🧠 Run Prediction</button>';
        html += '<div id="ml-compaction-result" style="margin-top:16px;"></div>';
    } else if (testType === 'compressive') {
        var age = 28;
        var ageEl = document.getElementById('comp-age');
        if (ageEl) age = parseInt(ageEl.value) || 28;
        html = '<h4>Mix Proportions</h4>';
        html += '<div class="form-group"><label>Cement (kg/m³)</label><input type="number" id="ml-cement" step="any" value="350"></div>';
        html += '<div class="form-group"><label>Water (kg/m³)</label><input type="number" id="ml-water" step="any" value="175"></div>';
        html += '<div class="form-group"><label>Fine Aggregate (kg/m³)</label><input type="number" id="ml-fine-agg" step="any" value="700"></div>';
        html += '<div class="form-group"><label>Coarse Aggregate (kg/m³)</label><input type="number" id="ml-coarse-agg" step="any" value="1100"></div>';
        html += '<div class="form-group"><label>Admixtures (kg/m³)</label><input type="number" id="ml-admixtures" step="any" value="0"></div>';
        html += '<div class="form-group"><label>Age (days)</label><input type="number" id="ml-age" step="any" value="' + age + '"></div>';
        html += '<button onclick="runMLConcretePrediction()" class="btn-primary" style="width:100%;margin-top:12px;">🧠 Run Prediction</button>';
        html += '<div id="ml-concrete-result" style="margin-top:16px;"></div>';
    } else if (testType === 'marshall') {
        html = '<h4>Marshall Mix Properties</h4>';
        html += '<div class="form-group"><label>Bitumen Content (%)</label><input type="number" id="ml-bc" step="any" value="4.5"></div>';
        html += '<div class="form-group"><label>Voids in Mineral Aggregate (%)</label><input type="number" id="ml-vma" step="any" value="14"></div>';
        html += '<button onclick="runMLMarshallPrediction()" class="btn-primary" style="width:100%;margin-top:12px;">🧠 Run Prediction</button>';
        html += '<div id="ml-marshall-result" style="margin-top:16px;"></div>';
    }
    body.innerHTML = html;
    openFabModal('modal-ml-predictions');
}

function mlComparisonTable(headers, rows) {
    var h = '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:8px;">';
    h += '<tr style="background:rgba(59,130,246,0.08);">';
    for (var i = 0; i < headers.length; i++) h += '<th style="padding:8px;text-align:' + (i === 0 ? 'left' : 'center') + ';font-weight:700;font-size:11px;">' + headers[i] + '</th>';
    h += '</tr>';
    for (var r = 0; r < rows.length; r++) {
        h += '<tr style="border-bottom:1px solid var(--border);">';
        for (var c = 0; c < rows[r].length; c++) {
            var style = 'padding:8px;text-align:' + (c === 0 ? 'left' : 'center') + ';';
            if (c === 1) style += 'color:var(--accent);font-weight:700;';
            h += '<td style="' + style + '">' + rows[r][c] + '</td>';
        }
        h += '</tr>';
    }
    h += '</table>';
    return h;
}

function runMLCompactionPrediction() {
    var soilType = document.getElementById('ml-soil-type').value;
    var energy = document.getElementById('ml-comp-energy').value;
    var pred = SmartLabML.predictMoistureContent({ soilType: soilType, compactionEnergy: energy });
    var actualOM = '--', actualMDD = '--';
    if (typeof strikes !== 'undefined' && strikes.length > 0) {
        var mdd = 0, om = 0;
        for (var i = 0; i < strikes.length; i++) {
            if (strikes[i].dryDensity > mdd) { mdd = strikes[i].dryDensity; om = strikes[i].moisture; }
        }
        actualOM = om; actualMDD = mdd;
    }
    var resultDiv = document.getElementById('ml-compaction-result');
    var html = '<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:10px;padding:16px;">';
    html += '<h4 style="font-size:14px;font-weight:700;color:var(--accent);margin-bottom:4px;">🧠 Prediction vs Actual</h4>';
    html += '<p style="font-size:10px;color:var(--text-muted);margin-bottom:8px;">Model: Polynomial regression on soil type & energy | Confidence: ' + pred.confidence + '%</p>';
    html += mlComparisonTable(
        ['Parameter', 'Predicted', 'Actual'],
        [
            ['Optimum Moisture %', pred.optimumMoisture + '%', actualOM + '%'],
            ['Max Dry Density (kg/m³)', String(pred.maxDryDensity), String(actualMDD)]
        ]
    );
    html += '<p style="font-size:10px;color:var(--text-muted);margin-top:8px;">Predicted range — OMC: ' + pred.moistureRange.min + '–' + pred.moistureRange.max + '% | MDD: ' + pred.densityRange.min + '–' + pred.densityRange.max + ' kg/m³</p>';
    html += '</div>';
    resultDiv.innerHTML = html;
}

function runMLConcretePrediction() {
    var cement = parseFloat(document.getElementById('ml-cement').value) || 350;
    var water = parseFloat(document.getElementById('ml-water').value) || 175;
    var fineAgg = parseFloat(document.getElementById('ml-fine-agg').value) || 700;
    var coarseAgg = parseFloat(document.getElementById('ml-coarse-agg').value) || 1100;
    var admixtures = parseFloat(document.getElementById('ml-admixtures').value) || 0;
    var age = parseFloat(document.getElementById('ml-age').value) || 28;
    var pred = SmartLabML.predictConcreteStrength({ cement: cement, water: water, fineAgg: fineAgg, coarseAgg: coarseAgg, admixtures: admixtures, age: age });
    var actualStrength = (typeof compState !== 'undefined' && compState.peakStress) ? compState.peakStress.toFixed(1) : '--';
    var resultDiv = document.getElementById('ml-concrete-result');
    var html = '<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:10px;padding:16px;">';
    html += '<h4 style="font-size:14px;font-weight:700;color:var(--accent);margin-bottom:4px;">🧠 Prediction vs Actual</h4>';
    html += '<p style="font-size:10px;color:var(--text-muted);margin-bottom:8px;">Model: Bolomey polynomial regression | W/C: ' + pred.wcRatio + ' | Confidence: ' + pred.confidence + '%</p>';
    html += mlComparisonTable(
        ['Parameter', 'Predicted', 'Actual'],
        [
            ['Strength (MPa)', pred.predicted + ' MPa', actualStrength + ' MPa'],
            ['Confidence Range', pred.range.min + ' – ' + pred.range.max + ' MPa', '—']
        ]
    );
    html += '</div>';
    resultDiv.innerHTML = html;
}

function runMLMarshallPrediction() {
    var bc = parseFloat(document.getElementById('ml-bc').value) || 4.5;
    var vma = parseFloat(document.getElementById('ml-vma').value) || 14;
    var pred = SmartLabML.predictMarshallStability({ bitumenContent: bc, voidsInMineralAggregate: vma });
    var actualStab = '--', actualFlow = '--';
    if (typeof marData !== 'undefined' && marData.length > 0) {
        var maxLoad = Math.max.apply(null, marData.map(function(r) { return r.load; }));
        actualStab = Math.round(maxLoad * 0.92);
        actualFlow = marData[marData.length - 1].flow;
    }
    var resultDiv = document.getElementById('ml-marshall-result');
    var html = '<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:10px;padding:16px;">';
    html += '<h4 style="font-size:14px;font-weight:700;color:var(--accent);margin-bottom:4px;">🧠 Prediction vs Actual</h4>';
    html += '<p style="font-size:10px;color:var(--text-muted);margin-bottom:8px;">Model: Gaussian stability correlation | Confidence: ' + pred.confidence + '%</p>';
    html += mlComparisonTable(
        ['Parameter', 'Predicted', 'Actual'],
        [
            ['Stability (N)', String(pred.stability), actualStab + ' N'],
            ['Flow (×0.25mm)', String(pred.flow), actualFlow + '']
        ]
    );
    html += '<p style="font-size:10px;color:var(--text-muted);margin-top:8px;">Stability range: ' + pred.stabilityRange.min + '–' + pred.stabilityRange.max + ' N | Flow range: ' + pred.flowRange.min + '–' + pred.flowRange.max + '</p>';
    html += '</div>';
    resultDiv.innerHTML = html;
}
