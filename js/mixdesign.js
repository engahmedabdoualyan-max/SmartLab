var mdState = { results: null };

function openMixDesign(test) {
    currentTest = test;
    showScreen('mixdesign');
    mdState.results = null;
    document.getElementById('md-results-panel').style.display = 'none';
    document.getElementById('md-sample-id').value = 'MD-' + String(Date.now()).slice(-6);
}

function calcMixWater(slump, maxAggSize, exposure, airContent) {
    var waterTable = {
        '25-50':  { 9.5:207, 12.5:199, 19:190, 25:179, 37.5:166, 50:154, 75:130 },
        '75-100': { 9.5:228, 12.5:216, 19:205, 25:193, 37.5:181, 50:169, 75:145 },
        '100-150':{ 9.5:243, 12.5:228, 19:216, 25:202, 37.5:190, 50:178, 75:160 }
    };
    var base = (waterTable[slump] || waterTable['75-100'])[maxAggSize] || 205;
    if (exposure === 'moderate' || exposure === 'severe') base -= 8;
    return base;
}

function calcMixAirContent(maxAggSize, exposure) {
    if (exposure === 'mild') return 1.5;
    var airTable = { 9.5:7.5, 12.5:7.0, 19:6.0, 25:5.5, 37.5:5.0, 50:4.5, 75:4.0 };
    return airTable[maxAggSize] || 6.0;
}

function calcMixStrength(fc, stdDev) {
    if (stdDev && stdDev > 0) {
        return Math.max(fc + 1.34 * stdDev, 0.9 * fc + 2.33 * stdDev - 7);
    }
    if (fc < 21) return fc + 8.3;
    if (fc <= 35) return fc + 10;
    return fc + 12;
}

function calcMixWCRatio(fcr) {
    if (fcr <= 20) return 0.62;
    if (fcr <= 25) return 0.55;
    if (fcr <= 30) return 0.48;
    if (fcr <= 35) return 0.43;
    if (fcr <= 40) return 0.38;
    return 0.35;
}

function calcMixCement(water, wcRatio) {
    if (!wcRatio || wcRatio === 0) return 0;
    return water / wcRatio;
}

function calcMixCoarseAgg(maxAggSize, fm, dryRoddedWeight) {
    var volTable = {
        9.5:  { 2.4:0.50, 2.6:0.48, 2.8:0.46, 3.0:0.44 },
        12.5: { 2.4:0.59, 2.6:0.57, 2.8:0.55, 3.0:0.53 },
        19:   { 2.4:0.66, 2.6:0.64, 2.8:0.62, 3.0:0.60 },
        25:   { 2.4:0.71, 2.6:0.69, 2.8:0.67, 3.0:0.65 },
        37.5: { 2.4:0.75, 2.6:0.73, 2.8:0.71, 3.0:0.69 },
        50:   { 2.4:0.78, 2.6:0.76, 2.8:0.74, 3.0:0.72 },
        75:   { 2.4:0.82, 2.6:0.80, 2.8:0.78, 3.0:0.76 }
    };
    var fmRounded = Math.round(fm * 2) / 2;
    if (fmRounded < 2.4) fmRounded = 2.4;
    if (fmRounded > 3.0) fmRounded = 3.0;
    var sizeRow = volTable[maxAggSize] || volTable[19];
    var vol = sizeRow[fmRounded] || sizeRow[2.6] || 0.64;
    return vol * dryRoddedWeight;
}

function calcMixFineAgg(water, cement, coarseVol, airVol, totalVol, cementSG, coarseSG, fineSG, waterSG) {
    var volCement = cement / (cementSG * 1000);
    var volWater = water / (waterSG * 1000);
    var volCoarse = coarseVol / (coarseSG * 1000);
    var volAir = airVol / 100 * totalVol;
    var volFine = totalVol - volCement - volWater - volCoarse - volAir;
    if (volFine < 0) volFine = 0;
    return volFine * fineSG * 1000;
}

function calcMixDesign(params) {
    var fc = parseFloat(params.fc) || 25;
    var stdDev = params.stdDev ? parseFloat(params.stdDev) : 0;
    var slump = params.slump || '75-100';
    var maxAggSize = parseFloat(params.maxAggSize) || 19;
    var fm = parseFloat(params.fm) || 2.6;
    var dryRoddedWeight = parseFloat(params.dryRoddedWeight) || 1600;
    var cementSG = parseFloat(params.cementSG) || 3.15;
    var coarseSG = parseFloat(params.coarseSG) || 2.68;
    var fineSG = parseFloat(params.fineSG) || 2.64;
    var waterSG = parseFloat(params.waterSG) || 1.0;
    var exposure = params.exposure || 'mild';
    var totalVol = parseFloat(params.totalVol) || 1.0;

    var airContent = calcMixAirContent(maxAggSize, exposure);
    var waterContent = calcMixWater(slump, maxAggSize, exposure, airContent);
    var fcr = calcMixStrength(fc, stdDev);
    var wcRatio = calcMixWCRatio(fcr);
    var cementContent = calcMixCement(waterContent, wcRatio);
    var coarseAgg = calcMixCoarseAgg(maxAggSize, fm, dryRoddedWeight);
    var fineAgg = calcMixFineAgg(waterContent, cementContent, coarseAgg, airContent, totalVol, cementSG, coarseSG, fineSG, waterSG);

    var totalWeight = waterContent + cementContent + coarseAgg + fineAgg;
    var unitWeight = totalVol > 0 ? totalWeight / totalVol : 0;

    var batchWeights = {
        cement: Math.round(cementContent * 100) / 100,
        water: Math.round(waterContent * 100) / 100,
        coarse: Math.round(coarseAgg * 100) / 100,
        fine: Math.round(fineAgg * 100) / 100,
        air: Math.round(airContent * 100) / 100
    };

    var result = {
        fcr: Math.round(fcr * 100) / 100,
        waterContent: Math.round(waterContent * 100) / 100,
        airContent: Math.round(airContent * 100) / 100,
        wcRatio: Math.round(wcRatio * 1000) / 1000,
        cementContent: Math.round(cementContent * 100) / 100,
        coarseAgg: Math.round(coarseAgg * 100) / 100,
        fineAgg: Math.round(fineAgg * 100) / 100,
        unitWeight: Math.round(unitWeight * 100) / 100,
        batchWeights: batchWeights
    };

    mdState.results = result;
    return result;
}

function calcMixDesignFromUI() {
    var params = {
        fc: document.getElementById('md-fc').value,
        stdDev: document.getElementById('md-std-dev').value,
        slump: document.getElementById('md-slump').value,
        maxAggSize: document.getElementById('md-max-agg').value,
        fm: document.getElementById('md-fm').value,
        dryRoddedWeight: document.getElementById('md-drw').value,
        cementSG: document.getElementById('md-cement-sg').value,
        coarseSG: document.getElementById('md-coarse-sg').value,
        fineSG: document.getElementById('md-fine-sg').value,
        waterSG: document.getElementById('md-water-sg').value,
        exposure: document.getElementById('md-exposure').value,
        totalVol: document.getElementById('md-total-vol').value
    };

    if (!params.fc || parseFloat(params.fc) <= 0) {
        alert('Enter a valid target strength f\'c');
        return;
    }

    var result = calcMixDesign(params);
    displayMixResults(result);
}

function displayMixResults(r) {
    var panel = document.getElementById('md-results-panel');
    panel.style.display = 'block';

    var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">';
    html += '<div style="background:var(--surface-alt);border-radius:8px;padding:12px;text-align:center;"><div style="font-size:10px;color:var(--text-muted);">Required Avg Strength f\'cr</div><div style="font-size:22px;font-weight:700;color:var(--accent);">' + r.fcr + ' MPa</div></div>';
    html += '<div style="background:var(--surface-alt);border-radius:8px;padding:12px;text-align:center;"><div style="font-size:10px;color:var(--text-muted);">w/c Ratio</div><div style="font-size:22px;font-weight:700;color:var(--accent);">' + r.wcRatio + '</div></div>';
    html += '</div>';

    html += safeResultRow('Water Content', r.waterContent + ' kg/m³');
    html += safeResultRow('Air Content', r.airContent + ' %');
    html += safeResultRow('Cement Content', r.cementContent + ' kg/m³');
    html += safeResultRow('Coarse Aggregate', r.coarseAgg + ' kg/m³');
    html += safeResultRow('Fine Aggregate', r.fineAgg + ' kg/m³');
    html += safeResultRow('Unit Weight', r.unitWeight + ' kg/m³');
    safeSetHTML('md-results-body', html);

    var bw = r.batchWeights;
    var bhtml = '<div class="result-row"><span class="result-label">Cement</span><span class="result-value">' + bw.cement + ' kg</span></div>';
    bhtml += '<div class="result-row"><span class="result-label">Water</span><span class="result-value">' + bw.water + ' kg</span></div>';
    bhtml += '<div class="result-row"><span class="result-label">Coarse Aggregate</span><span class="result-value">' + bw.coarse + ' kg</span></div>';
    bhtml += '<div class="result-row"><span class="result-label">Fine Aggregate</span><span class="result-value">' + bw.fine + ' kg</span></div>';
    bhtml += '<div class="result-row"><span class="result-label">Air Content</span><span class="result-value">' + bw.air + ' %</span></div>';
    safeSetHTML('md-batch-body', bhtml);

    drawMixChart(r);
    saveTestSession('mixdesign', r);
}

function drawMixChart(r) {
    var canvas = document.getElementById('md-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    var labels = ['Cement', 'Water', 'Coarse', 'Fine'];
    var values = [r.batchWeights.cement, r.batchWeights.water, r.batchWeights.coarse, r.batchWeights.fine];
    var colors = ['#3b82f6', '#10b981', '#f59e0b', '#94a3b8'];
    var maxVal = Math.max.apply(null, values) * 1.2 || 100;
    var gap = (w - 80) / labels.length;
    var barW = gap * 0.6;

    for (var i = 0; i < labels.length; i++) {
        var x = 40 + i * gap + (gap - barW) / 2;
        var bh = (values[i] / maxVal) * (h - 50);
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, h - 30 - bh, barW, bh);
        ctx.fillStyle = '#334155';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + barW / 2, h - 10);
        ctx.fillStyle = '#64748b';
        ctx.font = '9px sans-serif';
        ctx.fillText(values[i].toFixed(0), x + barW / 2, h - 36 - bh);
    }
}

function generateMixPDF() {
    var r = mdState.results;
    if (!r) { alert('No results to export'); return; }
    try {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        doc.setFontSize(20); doc.setFont(undefined, 'bold');
        doc.text('SmartLab - Concrete Mix Design Report', 105, 18, { align: 'center' });
        doc.setFontSize(11); doc.setFont(undefined, 'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions', 105, 26, { align: 'center' });
        doc.line(15, 30, 195, 30);
        var y = 38;
        doc.setFont(undefined, 'bold'); doc.text('Design Information', 195, y, { align: 'right' }); y += 7;
        doc.setFont(undefined, 'normal');
        doc.text('Date: ' + new Date().toLocaleString(), 195, y, { align: 'right' }); y += 5;
        doc.text('Standard: ACI 211.1 - Absolute Volume Method', 195, y, { align: 'right' }); y += 5;
        doc.text('Sample ID: ' + (document.getElementById('md-sample-id').value || '---'), 195, y, { align: 'right' }); y += 8;
        doc.line(15, y, 195, y); y += 6;

        doc.setFont(undefined, 'bold'); doc.text('Design Results', 195, y, { align: 'right' }); y += 6;
        doc.setFont(undefined, 'normal');
        doc.text("Required Avg Strength f'cr: " + r.fcr + ' MPa', 195, y, { align: 'right' }); y += 5;
        doc.text('w/c Ratio: ' + r.wcRatio, 195, y, { align: 'right' }); y += 5;
        doc.text('Water Content: ' + r.waterContent + ' kg/m³', 195, y, { align: 'right' }); y += 5;
        doc.text('Air Content: ' + r.airContent + ' %', 195, y, { align: 'right' }); y += 5;
        doc.text('Cement Content: ' + r.cementContent + ' kg/m³', 195, y, { align: 'right' }); y += 5;
        doc.text('Coarse Aggregate: ' + r.coarseAgg + ' kg/m³', 195, y, { align: 'right' }); y += 5;
        doc.text('Fine Aggregate: ' + r.fineAgg + ' kg/m³', 195, y, { align: 'right' }); y += 5;
        doc.text('Unit Weight: ' + r.unitWeight + ' kg/m³', 195, y, { align: 'right' }); y += 8;
        doc.line(15, y, 195, y); y += 6;

        doc.setFont(undefined, 'bold'); doc.text('Batch Weights (per m³)', 195, y, { align: 'right' }); y += 6;
        doc.setFont(undefined, 'normal');
        var bw = r.batchWeights;
        doc.text('Cement: ' + bw.cement + ' kg', 195, y, { align: 'right' }); y += 5;
        doc.text('Water: ' + bw.water + ' kg', 195, y, { align: 'right' }); y += 5;
        doc.text('Coarse Aggregate: ' + bw.coarse + ' kg', 195, y, { align: 'right' }); y += 5;
        doc.text('Fine Aggregate: ' + bw.fine + ' kg', 195, y, { align: 'right' }); y += 5;
        doc.text('Air: ' + bw.air + ' %', 195, y, { align: 'right' }); y += 8;

        doc.setFontSize(7); doc.setTextColor(150);
        doc.text('SmartLab v1.0.0 - Fimto Soft', 105, 285, { align: 'center' });
        doc.save('Mix_Design_Report.pdf');
    } catch (e) { alert('PDF error: ' + e.message); }
}
