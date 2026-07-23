var permState = { isRunning: false, readings: [] };

function openPermeability(test) {
  currentTest = test;
  showScreen('permeability');
  document.getElementById('perm-page-title').textContent = test.name;
  document.getElementById('perm-btn-start').style.display = 'flex';
  document.getElementById('perm-btn-stop').style.display = 'none';
  document.getElementById('perm-results-panel').style.display = 'none';
  document.getElementById('perm-demo-banner').style.display = 'none';
  var chartFill = document.getElementById('perm-chart-fill');
  if (chartFill) chartFill.style.strokeDashoffset = '264';
  var readingsEl = document.getElementById('perm-readings');
  if (readingsEl) readingsEl.innerHTML = '';
}

function startPermeabilityTest() {
  var conn = document.getElementById('perm-conn').value;
  if (!conn) { showToast('Select connection first', 'error'); return; }
  permState = { isRunning: true, readings: [] };
  document.getElementById('perm-btn-start').style.display = 'none';
  document.getElementById('perm-btn-stop').style.display = 'flex';
  document.getElementById('perm-results-panel').style.display = 'none';
  if (conn === 'demo') {
    document.getElementById('perm-demo-banner').style.display = 'flex';
    runPermeabilityDemo();
  }
}

function stopPermeabilityTest() {
  permState.isRunning = false;
  document.getElementById('perm-btn-start').style.display = 'flex';
  document.getElementById('perm-btn-stop').style.display = 'none';
  calculatePermeabilityResults();
}

function runPermeabilityDemo() {
  if (!permState.isRunning) return;
  var totalReadings = 5;
  var i = 0;
  function demoStep() {
    if (!permState.isRunning) return;
    var pressure = Math.random() * 2 + 1;
    var flowRate = pressure * 0.5;
    permState.readings.push({pressure: pressure, flowRate: flowRate});
    updatePermeabilityTable(permState.readings.length);
    var pctComplete = ((i + 1) / totalReadings) * 100;
    var fill = 264 * (1 - pctComplete / 100);
    var gaugeFill = document.getElementById('perm-gauge-fill');
    if (gaugeFill) gaugeFill.setAttribute('stroke-dashoffset', fill);
    i++;
    if (i < totalReadings) setTimeout(demoStep, 1500);
    else stopPermeabilityTest();
  }
  demoStep();
}

function processPermeabilityReading(pressure, flowRate) {
  var valueEl = document.getElementById('perm-value');
  if (valueEl) valueEl.textContent = pressure.toFixed(2);
  permState.readings.push({pressure: pressure, flowRate: flowRate});
}

function updatePermeabilityTable(count) {
  var tbody = document.getElementById('perm-table-body');
  if (!tbody) return;
  var row = tbody.insertRow();
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  cell1.textContent = count;
  cell2.textContent = (Math.random() * 2).toFixed(2);
  cell3.textContent = (Math.random() * 10).toFixed(1);
}

function calculatePermeabilityResults() {
  var r = permState.readings;
  if (r.length === 0) return;
  var totalPressure = 0, totalFlow = 0;
  for (var i = 0; i < r.length; i++) {
    totalPressure += r[i].pressure || 0;
    totalFlow += r[i].flowRate || 0;
  }
  var avgPressure = totalPressure / r.length;
  var avgFlow = totalFlow / r.length;
  var panel = document.getElementById('perm-results-panel');
  panel.style.display = 'block';
  var passed = avgFlow > 1.0;
  var html = safeResultStatus(passed, passed ? 'PASS' : 'FAIL');
  html += safeResultRow('Avg Pressure', avgPressure.toFixed(2) + ' bar');
  html += safeResultRow('Avg Flow Rate', avgFlow.toFixed(2) + ' ml/s');
  html += safeResultRow('Readings Count', r.length);
  safeSetHTML('perm-results-body', html);
  saveTestSession('permeability', {readings: r, avgPressure: avgPressure, avgFlow: avgFlow});
}

function generatePermeabilityPDF() {
  if (!permState.readings.length) return;
  try {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('SmartLab - Permeability Test Report', 20, 20);
    doc.setFontSize(10);
    doc.text('Generated: ' + new Date().toLocaleString(), 20, 35);
    var sampleIdEl = document.getElementById('perm-sample-id');
    doc.text('Sample ID: ' + (sampleIdEl ? sampleIdEl.value : 'N/A'), 20, 45);
    var standardEl = document.getElementById('perm-standard');
    doc.text('Standard: ' + (standardEl ? standardEl.value : 'N/A'), 20, 60);
    var r = permState.readings;
    var totalP = 0, totalF = 0;
    for (var i = 0; i < r.length; i++) { totalP += r[i].pressure || 0; totalF += r[i].flowRate || 0; }
    doc.text('Average Pressure: ' + (totalP / r.length).toFixed(2) + ' bar', 20, 75);
    doc.text('Avg Flow Rate: ' + (totalF / r.length).toFixed(2) + ' ml/s', 20, 90);
    doc.text('SmartLab v1.0.0 - Fimto Soft', 20, 280);
    doc.save('Permeability_Report.pdf');
  } catch (e) {
    showToast('PDF error: ' + e.message, 'error');
  }
}

/* === Backward compat aliases === */
function startPermTest() { startPermeabilityTest(); }
function stopPermTest() { stopPermeabilityTest(); }
function generatePermPDF() { generatePermeabilityPDF(); }
function onPermConnChange() {
  var v = document.getElementById('perm-conn').value;
  document.getElementById('perm-demo-banner').style.display = v === 'demo' ? 'flex' : 'none';
}
