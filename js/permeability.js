/* ==== Permeability Test (Soil) ==== */
let permeabilityState = { isRunning: false, readings: [] };
let permeabilities = []; // store measured values for chart

async function openPermeability(test) {
  currentTest = test;
  showScreen('permeability');
  document.getElementById('permeability-page-title').textContent = test.name;
  // Setup UI elements (sample ID, standard, etc.)
  document.getElementById('permeability-btn-start').style.display = 'flex';
  document.getElementById('permeability-btn-stop').style.display = 'none';
  document.getElementById('permeability-results-panel').style.display = 'none';
  document.getElementById('permeability-demo-banner').style.display = 'none';
  document.getElementById('permeability-progress-ring').style.display = 'none';
  document.getElementById('permeability-chart-fill').style.strokeDashoffset = '264';
  document.getElementById('permeability-readings').innerHTML = '';
});

function startPermeabilityTest() {
  const conn = document.getElementById('permeability-conn').value;
  if (!conn) { alert('Select connection first'); return; }
  permeabilityState.isRunning = true;
  document.getElementById('permeability-btn-start').style.display = 'none';
  document.getElementById('permeability-btn-stop').style.display = 'flex';
  document.getElementById('permeability-results-panel').style.display = 'none';
  document.getElementById('permeability-demo-banner').style.display = 'flex';
  // In demo mode, simulate data
  runPermeabilityDemo();
}

function stopPermeabilityTest() {
  permeabilityState.isRunning = false;
  document.getElementById('permeability-btn-start').style.display = 'flex';
  document.getElementById('permeability-btn-stop').style.display = 'none';
  calculatePermeabilityResults();
}

function runPermeabilityDemo() {
  if (!permeabilityState.isRunning) return;
  const totalReadings = 5;
  let i = 0;
  function demoStep() {
    if (!permeabilityState.isRunning) return;
    const pressure = Math.random() * 2 + 1; // bar
    const flowRate = pressure * 0.5; // ml/s (mock)
    permeabilityState.reads.push({pressure, flowRate});
    updatePermeabilityTable(permState.reads.length);
    // simulate gauge fill
    const pctComplete = (i / 5) * 100;
    const fill = 264 * (1 - pctComplete/100);
    // update gauge SVG stroke-dashoffset if exists
    const gaugeFill = document.getElementById('permeability-gauge-fill');
    if (gaugeFill) gaugeFill.setAttribute('stroke-dashoffset', fill);
    i++;
    if (i < 5) setTimeout(demoStep, 1500);
    else stopPermeabilityTest();
  }
  demoStep();
}

function processPermeabilityReading(pressure, flowRate) {
  // Simple calculation: permeability coefficient (K)roughly = (flowRate * L) / (area * pressure)
  // Here we just store and display
  const label = document.getElementById('permeability-label').textContent;
  const valueEl = document.getElementById('permeability-value');
  valueEl.textContent = pressure.toFixed(2);
  // Store for later PDF
  permeabilityState.readings.push({pressure, flowRate});
}

function updatePermeabilityTable(count) {
  const tbody = document.getElementById('permeability-table-body');
  const row = tbody.insertRow();
  const cell1 = row.insertCell(0);
  const cell2 = row.insertCell(1);
  const cell3 = row.insertCell(2);
  cell1.textContent = count;
  cell2.textContent = (Math.random()*2).toFixed(2);
  cell3.textContent = (Math.random()*10).toFixed(1);
}

function calculatePermeabilityResults() {
  const panel = document.getElementById('permeability-results-panel');
  panel.style.display = 'block';
  const avgPressure = permeabilityState.readings.reduce((a,b)=>a.pressure||0)/permeabilityState.readings.length;
  const avgFlow = permeabilityState.readings.reduce((a,b)=>b.flowRate||0)/permeabilityState.readings.length;
  const pdfGenerated = false; // placeholder
  // Show results
  const html = `
    <div class="result-status PASS">✅ PASS</div>
    <div class="result-row"><span class="result-label">Avg Pressure</span><span class="result-value">${avgPressure.toFixed(2)} bar</span></div>
    <div class="result-row"><span class="result-label">Avg Flow Rate</span><span class="result-value">${avgFlow.toFixed(2)} ml/s</span></div>
  `;
  panel.innerHTML = html;
  // Save session
  saveTestSession('permeability', {readings: permeabilityState.readings});
}

/* PDF Generation – generatePermeabilityPDF */
function generatePermeabilityPDF() {
  if (!permeabilityState.readings.length) return;
  try {
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('SmartLAP – Permeability Test Report', 20, 20);
    doc.setFontSize(10);
    doc.text('Generated: ' + new Date().toLocaleString(), 20, 35);
    doc.text('Sample ID: ' + document.getElementById('permeability-sample-id').value || 'N/A', 20, 45);
    doc.text('Standard: ' + document.getElementById('permeability-standard').value || 'N/A', 20, 60);
    doc.text('Average Pressure: ' + (permeabilityState.readings.reduce((a,b)=>a.pressure||0)/permeabilityState.readings.length).toFixed(2) + ' bar', 20, 75);
    doc.text('Avg Flow Rate: ' + (permeabilityState.readings.reduce((a,b)=>b.flowRate||0)/permeabilityState.readings.length).toFixed(2) + ' ml/s', 20, 90);
    doc.text('SmartLAP v1.0.0 — Fimto Soft', 20, 280);
    doc.save('Permeability_Report.pdf');
  } catch (e) {
    alert('PDF generation error: ' + e.message);
  }
}
