// ================================================================
// DIRECT SHEAR TEST
// ================================================================
var dsReadings = [], dsIsTesting = false, dsConnType = '';
var dsShearForce = 0, dsHorizDisp = 0, dsVertDisp = 0;

function openDirectShear(test){
    dsReadings = []; dsIsTesting = false; currentSessionId = null;
    dsShearForce = 0; dsHorizDisp = 0; dsVertDisp = 0;
    showScreen('direct_shear');
    document.getElementById('ds-page-title').textContent = test.name;
    document.getElementById('ds-results-panel').style.display = 'none';
    document.getElementById('ds-btn-pdf').style.display = 'none';
    document.getElementById('ds-btn-start').style.display = 'flex';
    document.getElementById('ds-btn-stop').style.display = 'none';
    document.getElementById('ds-live-indicator').style.display = 'none';
    document.getElementById('ds-log-body').innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">Start test</td></tr>';
    document.getElementById('ds-val-shear-stress').textContent = '--';
    document.getElementById('ds-val-horiz-disp').textContent = '--';
    document.getElementById('ds-val-vert-disp').textContent = '--';
    document.getElementById('ds-val-normal-stress').textContent = '--';
    document.getElementById('ds-val-peak-shear').textContent = '--';
    document.getElementById('ds-serial-console').style.display = 'none';
    document.getElementById('ds-demo-banner').style.display = 'none';
    loadDSHistory();
}

function onDSConnTypeChange(){
    var sel = document.getElementById('ds-com-port-select').value;
    dsConnType = sel;
    document.getElementById('ds-lan-config').style.display = sel === 'lan' ? 'block' : 'none';
    document.getElementById('ds-bt-config').style.display = sel === 'bluetooth' ? 'block' : 'none';
    document.getElementById('ds-manual-config').style.display = sel === 'manual' ? 'block' : 'none';
    document.getElementById('ds-conn-status-area').style.display = (sel === 'lan' || sel === 'bluetooth') ? 'none' : 'block';
    document.getElementById('ds-btn-manual').style.display = 'none';
    if (sel === 'manual') { document.getElementById('ds-conn-status-area').style.display = 'none'; }
}

function dsLog(text, type){
    var con = document.getElementById('ds-serial-console');
    if (con.style.display === 'none') con.style.display = 'block';
    var now = new Date().toLocaleTimeString('en-US');
    var cls = type === 'rx' ? 'rx' : (type === 'tx' ? 'tx' : '');
    con.innerHTML += '<div class="serial-line"><span class="ts">[' + now + ']</span> <span class="' + cls + '">' + text + '</span></div>';
    con.scrollTop = con.scrollHeight;
}

async function startDSTest(){
    var conn = document.getElementById('ds-com-port-select').value;
    if (!conn) { alert('Select connection first'); return; }
    dsReadings = []; dsIsTesting = true;
    dsShearForce = 0; dsHorizDisp = 0; dsVertDisp = 0;
    document.getElementById('ds-btn-start').style.display = 'none';
    document.getElementById('ds-btn-stop').style.display = 'flex';
    document.getElementById('ds-live-indicator').style.display = 'flex';
    document.getElementById('ds-results-panel').style.display = 'none';
    document.getElementById('ds-btn-pdf').style.display = 'none';
    document.getElementById('ds-log-body').innerHTML = '';
    logTestStarted('direct_shear', currentTest ? currentTest.id : '');
    if (conn === 'demo') {
        document.getElementById('ds-demo-banner').style.display = 'flex';
        document.getElementById('ds-serial-dot').className = 'status-dot scanning';
        document.getElementById('ds-serial-text').textContent = 'Demo';
        runDSDemo();
    } else if (conn === 'manual') {
        document.getElementById('ds-btn-manual').style.display = 'flex';
    } else {
        document.getElementById('ds-demo-banner').style.display = 'none';
        if (conn === 'browser-serial') {
            if (!serialPort) { var ok = await connectSerial(); if (!ok) { stopDSTest(); return; } }
            await sendSerialCommand('START');
            startSerialStream();
        }
    }
}

function stopDSTest(){
    dsIsTesting = false;
    document.getElementById('ds-btn-start').style.display = 'flex';
    document.getElementById('ds-btn-stop').style.display = 'none';
    document.getElementById('ds-live-indicator').style.display = 'none';
    document.getElementById('ds-btn-manual').style.display = 'none';
    logTestStopped('direct_shear', currentTest ? currentTest.id : '', { readingCount: dsReadings.length });
    if (dsConnType !== 'demo' && dsConnType !== 'manual') { sendSerialCommand('STOP'); stopSerial(); }
    if (dsReadings.length > 0) calculateDSResults();
}

function submitManualDSReading(){
    if (!dsIsTesting) return;
    var sf = parseFloat(document.getElementById('ds-manual-force').value);
    var hd = parseFloat(document.getElementById('ds-manual-hdisp').value);
    var vd = parseFloat(document.getElementById('ds-manual-vdisp').value);
    if (isNaN(sf) || isNaN(hd) || isNaN(vd)) { alert('Enter shear force, horizontal and vertical displacement'); return; }
    processDSReading(sf, hd, vd);
    document.getElementById('ds-manual-force').value = '';
    document.getElementById('ds-manual-hdisp').value = '';
    document.getElementById('ds-manual-vdisp').value = '';
    document.getElementById('ds-manual-force').focus();
}

function runDSDemo(){
    var step = 0; var maxSteps = 50;
    var iv = setInterval(function(){
        if (!dsIsTesting || step >= maxSteps) { clearInterval(iv); if (dsIsTesting) stopDSTest(); return; }
        step++;
        var shearForce = Math.round((50 + step * 8 + (Math.random() - 0.5) * 20) * 100) / 100;
        var horizDisp = Math.round((step * 0.08 + (Math.random() - 0.5) * 0.05) * 1000) / 1000;
        var vertDisp = Math.round((Math.random() * 0.3) * 1000) / 1000;
        // Simulate peak then slight drop for realistic stress-strain
        if (step > 30) shearForce = Math.max(0, shearForce - (step - 30) * 3);
        processDSReading(shearForce, horizDisp, vertDisp);
    }, 300);
}

function processDSReading(shearForce, horizontalDisp, verticalDisp){
    // Input validation and sanitization
    if (!Number.isFinite(shearForce) || !Number.isFinite(horizontalDisp) || !Number.isFinite(verticalDisp)) {
        showToast('Invalid input: Must be numeric values', 'error');
        return;
    }

    // Clamp values to realistic engineering ranges
    shearForce = Math.max(0, Math.min(50000, shearForce));
    horizontalDisp = Math.max(-50, Math.min(50, horizontalDisp));
    verticalDisp = Math.max(-25, Math.min(25, verticalDisp));

    var specimenWidth = parseFloat(document.getElementById('ds_inp_width').value) || 60;
    var specimenHeight = parseFloat(document.getElementById('ds_inp_height').value) || 60;
    var normalLoad = parseFloat(document.getElementById('ds_inp_normal_load').value) || 500;
    var area = specimenWidth * specimenHeight; // mm²

    // Shear Stress (N/mm²) = Shear Force / Cross-sectional Area
    var shearStress = Math.round((shearForce / area) * 100000) / 100000;
    // Normal Stress (N/mm²) = Normal Load / Cross-sectional Area
    var normalStress = Math.round((normalLoad / area) * 100000) / 100000;

    var reading = {
        index: dsReadings.length + 1,
        shearForce: shearForce,
        horizontalDisp: horizontalDisp,
        verticalDisp: verticalDisp,
        shearStress: shearStress,
        normalStress: normalStress,
        time: new Date().toLocaleTimeString()
    };
    dsReadings.push(reading);

    // Update live displays
    document.getElementById('ds-val-shear-stress').textContent = shearStress;
    document.getElementById('ds-val-horiz-disp').textContent = horizontalDisp;
    document.getElementById('ds-val-vert-disp').textContent = verticalDisp;
    document.getElementById('ds-val-normal-stress').textContent = normalStress;

    // Track peak shear stress
    var peak = 0;
    for (var i = 0; i < dsReadings.length; i++) {
        if (dsReadings[i].shearStress > peak) peak = dsReadings[i].shearStress;
    }
    document.getElementById('ds-val-peak-shear').textContent = peak;
    dsShearForce = shearForce;
    dsHorizDisp = horizontalDisp;
    dsVertDisp = verticalDisp;

    // Update log table
    var tbody = document.getElementById('ds-log-body');
    if (dsReadings.length === 1 && tbody) tbody.textContent = '';
    var tr = document.createElement('tr');
    var td1 = document.createElement('td'); td1.style.fontWeight = '700'; td1.textContent = reading.index;
    var td2 = document.createElement('td'); td2.textContent = reading.horizontalDisp;
    var td3 = document.createElement('td'); td3.textContent = reading.verticalDisp;
    var td4 = document.createElement('td'); td4.textContent = reading.shearForce;
    var td5 = document.createElement('td'); td5.textContent = reading.shearStress;
    var td6 = document.createElement('td'); td6.style.color = 'var(--text-muted)'; td6.style.fontSize = '10px'; td6.textContent = reading.time;
    tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tr.appendChild(td4); tr.appendChild(td5); tr.appendChild(td6);
    tbody.appendChild(tr);
    var lc = tbody.closest('.strike-log');
    if (lc) lc.scrollTop = lc.scrollHeight;

    // Auto-stop if horizontal displacement exceeds max limit
    var maxDisp = parseFloat(document.getElementById('ds_inp_max_disp').value) || 10;
    if (Math.abs(horizontalDisp) >= maxDisp && dsReadings.length >= 3) stopDSTest();
}

function calculateDSResults(){
    if (dsReadings.length === 0) return;
    var peakStress = 0, peakForce = 0, totalHoriz = 0, totalVert = 0;
    var failureHorizDisp = 0, failureVertDisp = 0;
    for (var i = 0; i < dsReadings.length; i++) {
        var r = dsReadings[i];
        totalHoriz += r.horizontalDisp;
        totalVert += r.verticalDisp;
        if (r.shearStress > peakStress) {
            peakStress = r.shearStress;
            peakForce = r.shearForce;
            failureHorizDisp = r.horizontalDisp;
            failureVertDisp = r.verticalDisp;
        }
    }
    var avgHoriz = totalHoriz / dsReadings.length;
    var avgVert = totalVert / dsReadings.length;

    var specimenWidth = parseFloat(document.getElementById('ds_inp_width').value) || 60;
    var specimenHeight = parseFloat(document.getElementById('ds_inp_height').value) || 60;
    var normalLoad = parseFloat(document.getElementById('ds_inp_normal_load').value) || 500;
    var area = specimenWidth * specimenHeight;
    var normalStress = Math.round((normalLoad / area) * 100000) / 100000;

    var passed = peakStress >= (normalStress * 0.5); // Typical failure envelope approx τ = 0.5σ
    var results = {
        peak_shear_stress: Math.round(peakStress * 100000) / 100000,
        peak_shear_force: Math.round(peakForce * 100) / 100,
        normal_stress: normalStress,
        normal_load: normalLoad,
        specimen_width: specimenWidth,
        specimen_height: specimenHeight,
        cross_section_area: area,
        failure_horizontal_disp: Math.round(failureHorizDisp * 1000) / 1000,
        failure_vertical_disp: Math.round(failureVertDisp * 1000) / 1000,
        average_horizontal_disp: Math.round(avgHoriz * 1000) / 1000,
        average_vertical_disp: Math.round(avgVert * 1000) / 1000,
        total_readings: dsReadings.length,
        status: passed ? 'PASS' : 'FAIL'
    };

    rateLimitedFirestoreWrite('sessions', {
        testId: currentTest.id,
        domainId: currentDomain ? currentDomain.id : '',
        domainName: currentDomain ? currentDomain.name : '',
        testName: currentTest.name,
        readings: dsReadings,
        results: results,
        userId: currentUser ? currentUser.uid : 'guest'
    }).then(function(docRef) {
        currentSessionId = docRef.id;
        displayDSResults(results);
        loadDSHistory();
    }).catch(function(err) {
        showToast('Failed to save results: ' + err.message, 'error');
    });
}

function displayDSResults(results){
    var panel = document.getElementById('ds-results-panel');
    var body = document.getElementById('ds-results-body');
    panel.style.display = 'block';
    var html = '';
    var p = results.status === 'PASS';
    html += safeResultStatus(p, results.status + ' — Peak τ: ' + results.peak_shear_stress + ' N/mm²');

    var labels = {
        peak_shear_stress: 'Peak Shear Stress (N/mm²)',
        peak_shear_force: 'Peak Shear Force (N)',
        normal_stress: 'Normal Stress (N/mm²)',
        normal_load: 'Normal Load (N)',
        specimen_width: 'Specimen Width (mm)',
        specimen_height: 'Specimen Height (mm)',
        cross_section_area: 'Cross-Section Area (mm²)',
        failure_horizontal_disp: 'Failure Horizontal Disp. (mm)',
        failure_vertical_disp: 'Failure Vertical Disp. (mm)',
        average_horizontal_disp: 'Avg Horizontal Disp. (mm)',
        average_vertical_disp: 'Avg Vertical Disp. (mm)',
        total_readings: 'Total Readings',
        status: 'Status'
    };
    Object.keys(results).forEach(function(k) {
        html += safeResultRow(labels[k] || k, results[k]);
    });
    safeSetHTML(body, html);
    document.getElementById('ds-btn-pdf').style.display = 'flex';
}

async function loadDSHistory(){
    if (!currentTest) return;
    try {
        var snap = await db.collection('sessions').where('testId', '==', currentTest.id).get();
        var tbody = document.getElementById('ds-history-body');
        if (snap.empty) return;
        if (tbody) tbody.textContent = '';
        var rows = [];
        snap.forEach(function(doc) { rows.push(doc.data()); });
        rows.sort(function(a, b) {
            return (b.createdAt && b.createdAt.seconds || 0) - (a.createdAt && a.createdAt.seconds || 0);
        });
        rows.slice(0, 10).forEach(function(s) {
            var st = (s.results && s.results.status) || '?';
            var peak = (s.results && s.results.peak_shear_stress) || '--';
            var date = s.createdAt ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : '--';
            var tr = document.createElement('tr');
            var td1 = document.createElement('td'); td1.textContent = date;
            var td2 = document.createElement('td'); td2.textContent = st;
            if (st === 'PASS') td2.className = 'result-pass';
            else if (st === 'FAIL') td2.className = 'result-fail';
            var td3 = document.createElement('td'); td3.textContent = peak + ' N/mm²';
            tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
            tbody.appendChild(tr);
        });
    } catch(e) {
        console.error('loadDSHistory error:', e);
    }
}

// ================================================================
// PDF — Direct Shear Test Report
// ================================================================
function generateDSPDF(){
    if (dsReadings.length === 0) return;
    try {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        doc.setFontSize(20); doc.setFont(undefined, 'bold');
        doc.text('SmartLab - Direct Shear Test Report', 105, 18, { align: 'center' });
        doc.setFontSize(11); doc.setFont(undefined, 'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions', 105, 26, { align: 'center' });
        doc.line(15, 30, 195, 30);
        var y = 38;
        doc.setFont(undefined, 'bold'); doc.text('Test Information', 195, y, { align: 'right' }); y += 7;
        doc.setFont(undefined, 'normal');
        doc.text('Date: ' + new Date().toLocaleString(), 195, y, { align: 'right' }); y += 5;
        doc.text('Domain: ' + (currentDomain ? currentDomain.name : ''), 195, y, { align: 'right' }); y += 5;
        doc.text('Width: ' + document.getElementById('ds_inp_width').value + ' mm | Height: ' + document.getElementById('ds_inp_height').value + ' mm', 195, y, { align: 'right' }); y += 5;
        doc.text('Normal Load: ' + document.getElementById('ds_inp_normal_load').value + ' N', 195, y, { align: 'right' }); y += 5;
        doc.text('Max Disp: ' + document.getElementById('ds_inp_max_disp').value + ' mm', 195, y, { align: 'right' }); y += 8;
        doc.line(15, y, 195, y); y += 6;
        doc.setFont(undefined, 'bold'); doc.text('Readings Log', 195, y, { align: 'right' }); y += 6;
        var hdrs = ['#', 'Horiz. mm', 'Vert. mm', 'Force N', 'τ N/mm²', 'Time'];
        var cx = [195, 175, 155, 135, 115, 95];
        doc.setFontSize(8);
        for (var h = 0; h < hdrs.length; h++) doc.text(hdrs[h], cx[h], y, { align: 'right' });
        y += 1; doc.line(15, y, 195, y); y += 4;
        doc.setFont(undefined, 'normal');
        for (var i = 0; i < dsReadings.length; i++) {
            var r = dsReadings[i];
            doc.text(String(r.index), cx[0], y, { align: 'right' });
            doc.text(String(r.horizontalDisp), cx[1], y, { align: 'right' });
            doc.text(String(r.verticalDisp), cx[2], y, { align: 'right' });
            doc.text(String(r.shearForce), cx[3], y, { align: 'right' });
            doc.text(String(r.shearStress), cx[4], y, { align: 'right' });
            doc.text(r.time, cx[5], y, { align: 'right' });
            y += 4; if (y > 270) { doc.addPage(); y = 20; }
        }
        y += 4; doc.line(15, y, 195, y); y += 6;
        doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.text('Final Results', 195, y, { align: 'right' }); y += 6;
        doc.setFont(undefined, 'normal');
        doc.text('Peak Shear Stress: ' + document.getElementById('ds-val-peak-shear').textContent + ' N/mm²', 195, y, { align: 'right' }); y += 5;
        doc.text('Shear Force at Failure: ' + dsShearForce + ' N', 195, y, { align: 'right' }); y += 5;
        doc.text('H. Disp at Failure: ' + dsHorizDisp + ' mm', 195, y, { align: 'right' }); y += 5;
        doc.text('V. Disp at Failure: ' + dsVertDisp + ' mm', 195, y, { align: 'right' }); y += 5;
        doc.text('Total Readings: ' + dsReadings.length, 195, y, { align: 'right' });
        doc.setFontSize(7); doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft', 105, 285, { align: 'center' });
        doc.save('Direct_Shear_Test_Report.pdf');
    } catch(e) {
        alert('PDF error: ' + e.message);
    }
}

