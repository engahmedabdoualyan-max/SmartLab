/* ------------------------------------------------------------------ *
 *  certGen.ts — Digital Strength Clearance Certificate (jsPDF)
 *
 *  A single-page A4 legal document:
 *    header · metadata grid · dynamic verdict banner · circular seal ·
 *    signature boxes · footer · verification serial (SHA-256-derived
 *    display digest, generated client-side from the cert payload)
 * ------------------------------------------------------------------ */

import { jsPDF } from "jspdf";
import type { ForecastResult, Coefficients, SensorReading } from "./regression";

export interface CertPayload {
  sessionId: string;
  castDateIso: string;          // stamped when specimen was poured ('c' command)
  specimenId: string;
  targetMpa: number;
  currentMPa: number;
  achieved: boolean;            // already above target?
  forecast: ForecastResult;
  coeffs: Coefficients;         // A/B used for the maturity law
  sensors: SensorReading[];     // per-node RMSD evidence
  capturerName: string;         // "smartLAB Field Engineer" line
  company: string;              // "Fimto Soft"
  host: string;                 // dashboard origin for QR-less verification note
}

/* ── cryptographic serial ───────────────────────────────────────── */
async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

/* ── tones (must not be translated — PDF body is bilingual-en/ar-safe
 *   by keeping Latin labels + monospace numerals) ──────────────── */
const INK: [number, number, number] = [22, 32, 26];
const MUTED: [number, number, number] = [93, 107, 96];
const COPPER: [number, number, number] = [138, 97, 39];
const GREEN: [number, number, number] = [31, 122, 67];
const RED: [number, number, number] = [178, 59, 34];
const AMBER: [number, number, number] = [198, 115, 43];

/* v1.9.0 — dynamic severity theme based on verification state */
function getSeverityAccent(achieved: boolean, hasAnomaly: boolean, isCritical: boolean): [number, number, number] {
  if (isCritical) return RED;      // critical anomaly / action required
  if (hasAnomaly) return AMBER;    // anomaly detected / degraded
  return achieved ? GREEN : COPPER; // healthy / stable or pending
}

function cellText(doc: jsPDF, s: string | number, x: number, y: number): void {
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text(String(s), x, y);
}

function cellLabel(doc: jsPDF, s: string, x: number, y: number): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(s, x, y);
}

export async function generateClearanceCertificate(p: CertPayload): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  
  /* v1.9.0 — detect anomaly/critical state from sensor data */
  const hasAnomaly = p.sensors.some(s => s.damaged || s.rmsdPct > 5);
  const isCritical = p.sensors.some(s => s.rmsdPct > 15);
  const accent = getSeverityAccent(p.achieved, hasAnomaly, isCritical);

  /* ═══ 0. background frame ══════════════════════════════════════ */
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, PW - 16, PH - 16);

  /* ═══ 1. masthead ══════════════════════════════════════════════ */
  doc.setFillColor(22, 32, 26);
  doc.rect(8, 8, PW - 16, 26, "F");

  /* logo block */
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.rect(14, 12, 14, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...accent);
  doc.text("SL", 21, 21.5, { align: "center" });

  /* title */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(233, 228, 212);
  doc.text("smartLAB", 32, 16.5);
  doc.setFontSize(9.5);
  doc.setTextColor(222, 154, 60);
  doc.text("PZT-EMI MONITOR", 32, 21.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(143, 160, 147);
  doc.text("Digital Concrete Maturity & Strength Certification — v1.9.0", 32, 26.5);

  /* right side: cert number + issue stamp */
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(233, 228, 212);
  const certNo = `CERT-${p.sessionId}-${Date.now().toString(36).toUpperCase().slice(-8)}`;
  doc.text(certNo, PW - 12, 16, { align: "right" });
  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(143, 160, 147);
  doc.text(`issued ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`, PW - 12, 21, { align: "right" });
  doc.text("by smartLAB ERP · Fimto Soft", PW - 12, 25, { align: "right" });

  /* ═══ 2. verdict banner ════════════════════════════════════════ */
  const byY = 40;
  const bannerColor = p.achieved ? [229, 244, 234] as [number, number, number] : [247, 240, 228] as [number, number, number];
  doc.setFillColor(...bannerColor);
  doc.rect(14, byY, PW - 28, 18, "F");
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.8);
  doc.rect(14, byY, PW - 28, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...accent);
  const verdict = p.achieved
    ? "CLEARANCE GRANTED — FORMWORK MAY BE STRIPPED"
    : "CLEARANCE PENDING — STRENGTH BELOW TARGET";
  doc.text(verdict, PW / 2, byY + 8, { align: "center" });

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(
    p.achieved
      ? `achieved ${p.currentMPa.toFixed(1)} MPa ≥ target ${p.targetMpa.toFixed(1)} MPa`
      : `achieved ${p.currentMPa.toFixed(1)} MPa < target ${p.targetMpa.toFixed(1)} MPa`,
    PW / 2, byY + 13, { align: "center" }
  );

  /* ═══ 3. metadata grid ═════════════════════════════════════════ */
  let y = byY + 26;
  const col1 = 16, col3 = 110;
  const rowH = 6.5;

  cellLabel(doc, "SESSION ID", col1, y - 3);
  cellText(doc, p.sessionId, col1, y + 2);
  cellLabel(doc, "SPECIMEN ID", col3, y - 3);
  cellText(doc, p.specimenId, col3, y + 2);

  y += rowH;
  cellLabel(doc, "CAST DATE (NVS stf)", col1, y - 3);
  cellText(doc, p.castDateIso, col1, y + 2);
  cellLabel(doc, "CERTIFIED INSTRUMENT", col3, y - 3);
  cellText(doc, "ESP32-WROOM-32 · AD5933", col3, y + 2);

  y += rowH;
  cellLabel(doc, "TARGET STRENGTH", col1, y - 3);
  cellText(doc, `${p.targetMpa.toFixed(1)} MPa`, col1, y + 2);
  cellLabel(doc, "ACHIEVED STRENGTH", col3, y - 3);
  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...accent);
  doc.text(`${p.currentMPa.toFixed(1)} MPa`, col3, y + 2);

  y += rowH;
  cellLabel(doc, "MATURITY LAW", col1, y - 3);
  cellText(doc, `fc(t) = ${p.coeffs.a.toFixed(2)}·ln(t) + ${p.coeffs.b.toFixed(2)}`, col1, y + 2);
  cellLabel(doc, "FORECAST", col3, y - 3);
  cellText(doc,
    p.forecast.achieved
      ? "achieved already — no forecast needed"
      : `target expected in ${p.forecast.daysRemaining.toFixed(1)} d (conf ${p.forecast.confidencePct}%)`,
    col3, y + 2);

  /* cosmetic horizontal ruler */
  y += 8;
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.4);
  doc.line(col1, y, PW - 16, y);

  /* ═══ 4. per-sensor evidence table ════════════════════════════ */
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...accent);
  doc.text("EMI EVIDENCE — MULTI-SENSOR MULTIPLEXING (4× PZT NODES)", col1, y);

  y += 5;
  /* column headers */
  const cols = [
    { l: "Sensor Id",    x: col1 + 2,  w: 42 },
    { l: "Res. Freq",    x: col1 + 46, w: 34 },
    { l: "Peak Conduct.", x: col1 + 82, w: 34 },
    { l: "RMSD %",        x: col1 + 118, w: 30 },
    { l: "Status",       x: col1 + 152, w: 40 },
  ];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  cols.forEach(c => doc.text(c.l, c.x, y, { align: "center" }));
  doc.setDrawColor(213, 221, 215);
  doc.setLineWidth(0.3);
  doc.line(col1, y + 2, col1 + 192, y + 2);

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  y += 6;
  const rowMax = Math.min(p.sensors.length, 8);   // cap evidence rows on one page
  for (let sI = 0; sI < rowMax; sI++) {
    const s = p.sensors[sI];
    const rowY = y + sI * 5.5;
    const anom = s.damaged || s.rmsdPct > 5;

    // zebra stripe
    if (sI % 2 === 1) {
      doc.setFillColor(248, 250, 248);
      doc.rect(col1, rowY - 3.4, 192, 5.2, "F");
    }

    doc.setTextColor(...INK);
    doc.setFont("courier", "normal");
    doc.text(s.id.replace(/_/g, "-"), cols[0].x, rowY, { align: "center" });
    doc.text(`${s.fresKHz.toFixed(1)} kHz`, cols[1].x, rowY, { align: "center" });
    doc.text(`${s.gPeakUS.toFixed(0)} µS`, cols[2].x, rowY, { align: "center" });
    doc.setFont("courier", "bold");
    doc.setTextColor(...(anom ? RED : GREEN));
    doc.text(`${s.rmsdPct.toFixed(2)}%`, cols[3].x, rowY, { align: "center" });
    doc.text(anom ? "ANOMALY" : "HEALTHY", cols[4].x, rowY, { align: "center" });

    // anomaly dot
    doc.setFillColor(...(anom ? RED : GREEN));
    doc.circle(col1 + 148, rowY - 1.6, 1.3, "F");
  }

  y += rowMax * 5.5 + 6;

  /* ═══ 5. certification body text ═══════════════════════════════ */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK);
  const bodyTxt = p.achieved
    ? `This is to certify that the above-referenced concrete specimen has been continuously monitored by the smartLAB Electromechanical Impedance (EMI) system from cast date ${p.castDateIso} to present. Analysis of the admittance-sweep signatures via the Plowman logarithmic maturity law (fc(t) = ${p.coeffs.a.toFixed(2)}·ln(t) + ${p.coeffs.b.toFixed(2)}) confirms the estimated compressive strength has attained the contractual threshold of ${p.targetMpa.toFixed(1)} MPa. Formwork stripping / load application is hereby approved at the noted date and specimen id.`
    : `This is to certify that the above-referenced concrete specimen is under continuous smartLAB Electromechanical Impedance (EMI) observation. The estimated compressive strength of ${p.currentMPa.toFixed(1)} MPa has NOT yet met the contractual threshold of ${p.targetMpa.toFixed(1)} MPa. Stripping or load application is NOT approved until the forecast maturity date is reached.`;
  const wrapped = doc.splitTextToSize(bodyTxt, PW - 32) as string[];
  doc.text(wrapped, col1, y);
  y += wrapped.length * 4.5 + 4;

  /* ═══ 6. signature zone + circular seal ════════════════════════ */
  const sigY = Math.max(y + 4, PH - 58);

  /* signature lines */
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.25);
  doc.line(col1 + 4, sigY + 10, col1 + 70, sigY + 10);      // engineer
  doc.line(col1 + 88, sigY + 10, col1 + 154, sigY + 10);    // date
  doc.line(col1 + 4, sigY + 26, col1 + 70, sigY + 26);      // QA stamp line
  doc.line(col1 + 88, sigY + 26, col1 + 154, sigY + 26);    // remarks line

  /* v1.9.0 — Official Institutional Sign-Off Block */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text("Approved by smartLAB Certified Engineer", col1 + 4, sigY + 14.5);
  doc.text("Date", col1 + 88, sigY + 14.5);
  doc.text("Institutional Validation", col1 + 4, sigY + 30.5);
  doc.text("Remarks / Opinions", col1 + 88, sigY + 30.5);

  /* v1.9.0 — dotted circular outline with institutional text */
  const sx = PW - 34;
  const sy = sigY + 14;
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([1.5, 1.2], 0);
  doc.circle(sx, sy, 16, "S");
  doc.setLineDashPattern([], 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.2);
  doc.setTextColor(...accent);
  doc.text("OFFICIAL", sx, sy - 7, { align: "center" });
  doc.text("smartLAB", sx, sy - 1.5, { align: "center" });
  doc.text("LABORATORY", sx, sy + 3.5, { align: "center" });
  doc.text("STAMP", sx, sy + 8.5, { align: "center" });
  if (p.achieved) {
    doc.setFontSize(11);
    doc.setTextColor(...accent);
    doc.text("✓", sx, sy + 0.8, { align: "center" });
  }

  /* ═══ 7. verification serial + footer ══════════════════════════ */
  const serialInput = [
    certNo, p.sessionId, p.castDateIso,
    p.currentMPa.toFixed(3), p.targetMpa.toFixed(3),
    p.coeffs.a.toFixed(4), p.coeffs.b.toFixed(4),
  ].join(":");
  const serial = await sha256Hex(serialInput);

  doc.setDrawColor(213, 221, 215);
  doc.setLineWidth(0.3);
  doc.line(12, PH - 22, PW - 12, PH - 22);

  doc.setFont("courier", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(116, 128, 111);
  doc.text("DIGITAL VERIFICATION SERIAL (SHA-256):", 12, PH - 18);
  doc.setFontSize(6.8);
  doc.setTextColor(...INK);
  doc.text(serial, 12, PH - 14.5);
  doc.setFont("courier", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(116, 128, 111);
  doc.text(
    `Verify at ${p.host} — enter cert no. ${certNo} to confirm maturity record & sensor evidence.`,
    12, PH - 10
  );
  doc.setFontSize(6);
  doc.text(
    `smartLAB PZT-EMI Monitor v1.9.0 · Fimto Soft · ${p.company} · info@fimtosoft.com`,
    12, PH - 6
  );

  doc.save(`${certNo}.pdf`);
}
