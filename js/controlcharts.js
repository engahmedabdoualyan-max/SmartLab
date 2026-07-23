var ccSessions = [];
var ccChartType = 'moving_avg';
var ccChartInstance = null;

function openControlCharts(test) {
    currentTest = test;
    showScreen('controlcharts');
    ccSessions = [];
    ccChartType = 'moving_avg';
    document.getElementById('cc-btn-ma').className = 'btn-primary';
    document.getElementById('cc-btn-cusum').className = 'btn-secondary';
    safeSetHTML('cc-stats-body', '<div class="stats-empty"><div class="stats-empty-icon">📊</div>No data loaded</div>');
    safeSetHTML('cc-data-body', '<div class="stats-empty"><div class="stats-empty-icon">📋</div>No data loaded</div>');
    loadCCData();
}

function loadCCData() {
    var testType = document.getElementById('cc-test-type').value;
    var limit = parseInt(document.getElementById('cc-limit').value) || 20;
    ccSessions = [];

    if (typeof db === 'undefined') {
        generateCCDemoData(testType, limit);
        return;
    }

    db.collection('sessions')
        .where('testId', '==', testType)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get()
        .then(function(snapshot) {
            if (snapshot.empty) {
                generateCCDemoData(testType, limit);
                return;
            }
            snapshot.forEach(function(doc) {
                var data = doc.data();
                var val = extractCCValue(data, testType);
                if (val !== null) {
                    ccSessions.push({ value: val, date: data.createdAt ? data.createdAt.toDate() : new Date(), id: doc.id });
                }
            });
            ccSessions.reverse();
            renderCCChart();
            renderCCStats();
            renderCCDataTable();
        })
        .catch(function(err) {
            console.error('CC load error:', err);
            generateCCDemoData(testType, limit);
        });
}

function generateCCDemoData(testType, limit) {
    ccSessions = [];
    var baseVal, noise;
    if (testType === 'compressive') { baseVal = 30; noise = 4; }
    else if (testType === 'slump') { baseVal = 100; noise = 15; }
    else if (testType === 'maturity') { baseVal = 2500; noise = 200; }
    else if (testType === 'marshall') { baseVal = 8000; noise = 500; }
    else { baseVal = 50; noise = 10; }

    for (var i = 0; i < limit; i++) {
        var drift = Math.sin(i / limit * Math.PI * 2) * noise * 0.5;
        var val = baseVal + (Math.random() - 0.5) * noise * 2 + drift;
        var d = new Date();
        d.setDate(d.getDate() - (limit - i));
        ccSessions.push({ value: Math.round(val * 100) / 100, date: d, id: 'demo-' + i });
    }
    renderCCChart();
    renderCCStats();
    renderCCDataTable();
}

function extractCCValue(data, testType) {
    if (!data.results) return null;
    var r = data.results;
    if (testType === 'compressive') return r.strength;
    if (testType === 'slump') return r.slump;
    if (testType === 'maturity') return r.maturityIndex;
    if (testType === 'marshall') return r.stability;
    return null;
}

function switchCCChart(type) {
    ccChartType = type;
    document.getElementById('cc-btn-ma').className = type === 'moving_avg' ? 'btn-primary' : 'btn-secondary';
    document.getElementById('cc-btn-cusum').className = type === 'cusum' ? 'btn-primary' : 'btn-secondary';
    renderCCChart();
}

function calcUCL(mean, std, k) {
    if (k === undefined) k = 3;
    return mean + k * std;
}

function calcLCL(mean, std, k) {
    if (k === undefined) k = 3;
    return Math.max(0, mean - k * std);
}

function calcCp(usl, lsl, std) {
    if (!std || std === 0) return 0;
    return (usl - lsl) / (6 * std);
}

function calcCpk(mean, std, usl, lsl) {
    if (!std || std === 0) return 0;
    return Math.min((mean - lsl) / (3 * std), (usl - mean) / (3 * std));
}

function calcCUSUM(values, target) {
    var cusum = [];
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        sum += values[i] - target;
        cusum.push(sum);
    }
    return cusum;
}

function renderCCChart() {
    if (!ccSessions.length) return;
    var canvas = document.getElementById('cc-chart');
    if (!canvas) return;

    if (ccChartInstance) ccChartInstance.destroy();

    var labels = ccSessions.map(function(s) {
        return s.date.toLocaleDateString ? s.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--';
    });
    var values = ccSessions.map(function(s) { return s.value; });
    var mean = values.reduce(function(a, b) { return a + b; }, 0) / values.length;
    var n = values.length;
    var sqSum = 0;
    for (var i = 0; i < n; i++) sqSum += (values[i] - mean) * (values[i] - mean);
    var std = Math.sqrt(sqSum / (n - 1));
    var ucl = calcUCL(mean, std);
    var lcl = calcLCL(mean, std);

    var ctx = canvas.getContext('2d');

    if (ccChartType === 'moving_avg') {
        var maValues = [];
        for (var j = 0; j < n; j++) {
            var start = Math.max(0, j - 2);
            var count = j - start + 1;
            var sum = 0;
            for (var k = start; k <= j; k++) sum += values[k];
            maValues.push(sum / count);
        }

        ccChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Individual Values',
                        data: values,
                        borderColor: '#94a3b8',
                        backgroundColor: 'rgba(148,163,184,0.1)',
                        pointRadius: 3,
                        pointBackgroundColor: '#94a3b8',
                        borderWidth: 1,
                        fill: false
                    },
                    {
                        label: 'Moving Average (3-period)',
                        data: maValues,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.1)',
                        pointRadius: 4,
                        pointBackgroundColor: '#3b82f6',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: 'UCL (±3σ)',
                        data: Array(n).fill(ucl),
                        borderColor: '#ef4444',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'LCL (±3σ)',
                        data: Array(n).fill(lcl),
                        borderColor: '#ef4444',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'Mean',
                        data: Array(n).fill(mean),
                        borderColor: '#10b981',
                        borderDash: [3, 3],
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { labels: { font: { size: 10 } } } },
                scales: {
                    y: { title: { display: true, text: 'Test Result', font: { size: 10 } } },
                    x: { title: { display: true, text: 'Sample Date', font: { size: 10 } } }
                }
            }
        });
    } else {
        var cusum = calcCUSUM(values, mean);
        var di = 5 * std;

        ccChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'CUSUM',
                        data: cusum,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139,92,246,0.1)',
                        pointRadius: 3,
                        pointBackgroundColor: '#8b5cf6',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Decision Interval +' + di.toFixed(1),
                        data: Array(n).fill(di),
                        borderColor: '#ef4444',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'Decision Interval -' + di.toFixed(1),
                        data: Array(n).fill(-di),
                        borderColor: '#ef4444',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'Zero Line',
                        data: Array(n).fill(0),
                        borderColor: '#10b981',
                        borderDash: [3, 3],
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { labels: { font: { size: 10 } } } },
                scales: {
                    y: { title: { display: true, text: 'Cumulative Deviation', font: { size: 10 } } },
                    x: { title: { display: true, text: 'Sample Date', font: { size: 10 } } }
                }
            }
        });
    }
}

function renderCCStats() {
    if (!ccSessions.length) return;
    var values = ccSessions.map(function(s) { return s.value; });
    var n = values.length;
    var mean = values.reduce(function(a, b) { return a + b; }, 0) / n;
    var sqSum = 0;
    for (var i = 0; i < n; i++) sqSum += (values[i] - mean) * (values[i] - mean);
    var std = Math.sqrt(sqSum / (n - 1));
    var cov = std / mean * 100;
    var covClass = classifyCOV ? classifyCOV(cov) : (cov <= 5 ? 'Excellent' : cov <= 10 ? 'Good' : 'Poor');

    var testType = document.getElementById('cc-test-type').value;
    var usl, lsl;
    if (testType === 'compressive') { usl = 50; lsl = 25; }
    else if (testType === 'slump') { usl = 180; lsl = 25; }
    else if (testType === 'marshall') { usl = 15000; lsl = 5000; }
    else { usl = mean * 1.5; lsl = mean * 0.5; }

    var cp = calcCp(usl, lsl, std);
    var cpk = calcCpk(mean, std, usl, lsl);
    var ucl = calcUCL(mean, std);
    var lcl = calcLCL(mean, std);

    // Detect drift
    var driftWarn = '';
    var lastVal = values[n - 1];
    if (lastVal > ucl || lastVal < lcl) {
        driftWarn = '<div style="color:var(--danger);font-size:11px;padding:6px;background:rgba(239,68,68,0.1);border-radius:6px;margin-top:6px;">⚠️ Last result exceeds control limits!</div>';
    } else if (n >= 7) {
        var last7 = values.slice(-7);
        var aboveMean = last7.filter(function(v) { return v > mean; }).length;
        if (aboveMean >= 6 || aboveMean <= 1) {
            driftWarn = '<div style="color:var(--warning);font-size:11px;padding:6px;background:rgba(245,158,11,0.1);border-radius:6px;margin-top:6px;">⚠️ 6+ of last 7 results on same side of mean — possible drift</div>';
        }
    }

    var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
    html += '<div class="result-row"><span class="result-label">Mean</span><span class="result-value">' + mean.toFixed(2) + '</span></div>';
    html += '<div class="result-row"><span class="result-label">Std Dev</span><span class="result-value">' + std.toFixed(2) + '</span></div>';
    html += '<div class="result-row"><span class="result-label">COV</span><span class="result-value">' + cov.toFixed(1) + '%</span></div>';
    html += '<div class="result-row"><span class="result-label">ACI 214</span><span class="result-value">' + covClass + '</span></div>';
    html += '<div class="result-row"><span class="result-label">UCL (3σ)</span><span class="result-value" style="color:var(--danger);">' + ucl.toFixed(2) + '</span></div>';
    html += '<div class="result-row"><span class="result-label">LCL (3σ)</span><span class="result-value" style="color:var(--danger);">' + lcl.toFixed(2) + '</span></div>';
    html += '<div class="result-row"><span class="result-label">Cp</span><span class="result-value">' + cp.toFixed(3) + '</span></div>';
    html += '<div class="result-row"><span class="result-label">Cpk</span><span class="result-value">' + cpk.toFixed(3) + '</span></div>';
    html += '<div class="result-row"><span class="result-label">Samples</span><span class="result-value">' + n + '</span></div>';
    html += '</div>' + driftWarn;

    safeSetHTML('cc-stats-body', html);
}

function renderCCDataTable() {
    if (!ccSessions.length) return;
    var html = '<table class="strike-log"><thead><tr><th>#</th><th>Date</th><th>Value</th></tr></thead><tbody>';
    for (var i = 0; i < ccSessions.length; i++) {
        var s = ccSessions[i];
        var dateStr = s.date.toLocaleDateString ? s.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--';
        html += '<tr><td>' + (i + 1) + '</td><td>' + dateStr + '</td><td>' + s.value.toFixed(2) + '</td></tr>';
    }
    html += '</tbody></table>';
    safeSetHTML('cc-data-body', html);
}
