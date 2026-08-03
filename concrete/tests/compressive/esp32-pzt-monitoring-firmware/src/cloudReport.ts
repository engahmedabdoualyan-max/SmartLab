/* ------------------------------------------------------------------ *
 *  cloudReport.ts — Cloud-panel-specific export engine
 *
 *  Three output paths sharing the same data frame:
 *    1. Engineering PDF  (jsPDF + autoTable + canvas snapshot)
 *    2. Excel workbook   (xlsx / SheetJS)
 *    3. Print stylesheet (CSS @media print targeting #cloud-report-root)
 *
 *  Every function is async-safe, fully typed, and deliberately has
 *  NO reference to any InfluxDB token — the token never reaches the
 *  browser; these functions only touch the rows that already did.
 * ------------------------------------------------------------------ */

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { SweepRow, RmsdRow, RmsdResult } from "./influx";

/* ── data contract ──────────────────────────────────────────────── */
export interface CloudReportPayload {
  sessionId: string;
  mode: "live" | "demo";
  generatedAt: number;                    // Date.now()
  live: SweepRow[];
  baseline: SweepRow[];
  rmsd: RmsdResult;
  trend: RmsdRow[];
  chartDataUrl: string;                   // png data-url from <canvas>.toDataURL()
}

/* ── helpers ────────────────────────────────────────────────────── */
const safeName = (s: string) => s.replace(/[^\w\u0600-\u06FF-]+/g, "_").slice(0, 40);
const fmtISO = (ms: number) => new Date(ms).toISOString().replace("T", " ").slice(0, 19) + " UTC";
const diagnosticLabel = (rmsd: number): string =>
  rmsd > 6  ? "CRITICAL — Structural failure progression"
  : rmsd > 2  ? "ANOMALY — Structural micro-damage detected"
  : "HEALTHY — No structural anomaly";
const diagnosticTone = (rmsd: number): [number, number, number] =>
  rmsd > 6  ? [178, 59, 34]     // critical  — red
  : rmsd > 2  ? [138, 97, 39]   // anomaly   — copper
  : [31, 122, 67];              // healthy   — green

/* light background tint of the same three-tier verdict colour */
const diagnosticTint = (rmsd: number): [number, number, number] =>
  rmsd > 6  ? [250, 235, 232]   // faint red
  : rmsd > 2  ? [248, 242, 232] // faint copper
  : [234, 246, 238];            // faint green

/* ── tableEndY: resolves autoTable's end-Y from v4 or v5 ──────── */
function tableEndY(doc: jsPDF, ret: unknown, fallback: number): number {
  const fromReturn = (ret as { finalY?: number } | undefined)?.finalY;
  if (typeof fromReturn === "number") return fromReturn;
  const fromDoc = (doc as unknown as { lastAutoTable?: { finalY?: number } })
    .lastAutoTable?.finalY;
  if (typeof fromDoc === "number") return fromDoc;
  return fallback;
}

/* ================================================================ *
 *  1 · Engineering PDF
 * ================================================================ */
export async function exportCloudPdf(p: CloudReportPayload): Promise<void> {
  const doc   = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW    = doc.internal.pageSize.getWidth();
  const tone  = diagnosticTone(p.rmsd.rmsdPct);
  const ink   = [22, 32, 26] as [number, number, number];
  const muted = [93, 107, 96] as [number, number, number];

  /* ── header band ──────────────────────────────────────────────── */
  doc.setFillColor(...tone);
  doc.rect(0, 0, PW, 2.4, "F");
  doc.setDrawColor(...tone);
  doc.setLineWidth(0.5);
  doc.rect(12, 10, 14, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...tone);
  doc.text("SL", 19, 20, { align: "center" });

  doc.setFontSize(15);
  doc.setTextColor(...ink);
  doc.text("smartLAB — Cloud EMI Engineering Report", 30, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text("Electromechanical Impedance · InfluxDB 3 Serverless · Fimto Soft", 30, 22);

  doc.setFontSize(7);
  doc.text(fmtISO(p.generatedAt), PW - 12, 13, { align: "right" });
  doc.text(`session: ${p.sessionId}`, PW - 12, 17, { align: "right" });
  doc.text(`mode: ${p.mode}`, PW - 12, 21, { align: "right" });

  doc.setDrawColor(...tone);
  doc.setLineWidth(0.8);
  doc.line(12, 27, PW - 12, 27);

  /* ── Executive Summary ────────────────────────────────────────── */
  let y = 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...tone);
  doc.text("EXECUTIVE SUMMARY", 12, y);
  y += 4;

  const summaryRet = autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 8.8, cellPadding: 2.2, lineColor: [213, 221, 215], textColor: ink },
    headStyles: { fillColor: [238, 242, 238], textColor: muted, fontSize: 7.2, fontStyle: "bold" },
    head: [["Metric", "Value"]],
    body: [
      ["Sweep Bins",          `${p.live.length}`],
      ["Baseline Bins",       `${p.baseline.length}`],
      ["RMSD Damage Index",   `${p.rmsd.rmsdPct.toFixed(2)} %`],
      ["Peak Dev. Frequency", p.rmsd.peakDeviationKHz ? `${p.rmsd.peakDeviationKHz.toFixed(1)} kHz` : "—"],
      ["Structural Status",   diagnosticLabel(p.rmsd.rmsdPct)],
    ],
    /* Dynamic verdict colouring:
     *   row 2 (RMSD)   → value cell tinted with the three-tier tone
     *   row 4 (Status) → whole row shaded + bold coloured verdict text */
    didParseCell: d => {
      if (d.section !== "body") return;
      // RMSD value cell — coloured number
      if (d.column.index === 1 && d.row.index === 2) {
        d.cell.styles.fontStyle = "bold";
        d.cell.styles.textColor = tone;
      }
      // Structural status row — tinted background + bold verdict
      if (d.row.index === 4) {
        d.cell.styles.fillColor = diagnosticTint(p.rmsd.rmsdPct);
        if (d.column.index === 1) {
          d.cell.styles.fontStyle = "bold";
          d.cell.styles.textColor = tone;
        }
      }
    },
  });

  /* ── Chart snapshot ───────────────────────────────────────────── */
  y = tableEndY(doc, summaryRet, y + 30) + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...tone);
  doc.text("CONDUCTANCE vs FREQUENCY — CHART SNAPSHOT", 12, y);
  y += 3;

  try {
    const imgH = 60;
    const imgW = PW - 24;
    doc.addImage(p.chartDataUrl, "PNG", 12, y, imgW, imgH, undefined, "FAST");
    y += imgH + 4;
  } catch {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("[ chart capture unavailable ]", 12, y + 4);
    y += 10;
  }

  /* ── Specimen table (top-10 by deviation) ─────────────────────── */
  if (y > 220) { doc.addPage(); y = 20; }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...tone);
  doc.text("POINT TABLE — 10 LARGEST DEVIATIONS", 12, y);

  const ref = p.baseline.map(b => b.conductance_us);
  const indexed = p.live.map((row, i) => ({
    f: row.freq_khz,
    g: row.conductance_us,
    ref: ref[i] ?? 0,
    delta: row.conductance_us - (ref[i] ?? 0),
    pct: ref[i] ? Math.abs(row.conductance_us - ref[i]) / Math.abs(ref[i]) * 100 : 0,
  }));
  indexed.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const top10 = indexed.slice(0, 10);

  autoTable(doc, {
    startY: y + 2.5,
    theme: "grid",
    styles: { fontSize: 7.6, cellPadding: 1.6, lineColor: [226, 232, 227], textColor: ink },
    headStyles: { fillColor: [238, 242, 238], textColor: muted, fontSize: 6.8, fontStyle: "bold" },
    columnStyles: { 0: { halign: "right", cellWidth: 16 }, 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right", fontStyle: "bold" } },
    head: [["f (kHz)", "G (µS)", "ref (µS)", "ΔG (µS)", "Δ%"]],
    body: top10.map(r => [
      r.f.toFixed(1),
      r.g.toFixed(2),
      r.ref.toFixed(2),
      r.delta.toFixed(2),
      r.pct.toFixed(2),
    ]),
    didParseCell: d => {
      if (d.section === "body" && d.column.index === 3) {
        const v = parseFloat(String(d.cell.raw));
        d.cell.styles.textColor = Math.abs(v) > 50 ? [178, 59, 34] : ink;
      }
    },
  });

  /* ── Signature / approval block ───────────────────────────────── *
   *  Two zones inside one framed strip:
   *    left  → engineer signature + date lines
   *    right → official dashed circular lab stamp seal
   * --------------------------------------------------------------- */
  let yy = tableEndY(doc, null, y + 40) + 8;
  const BLOCK_H = 30;
  if (yy > 248) { doc.addPage(); yy = 20; }

  /* framed strip */
  doc.setDrawColor(...tone);
  doc.setLineWidth(0.5);
  doc.roundedRect(12, yy, PW - 24, BLOCK_H, 1.5, 1.5, "S");

  /* header strip label */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...tone);
  doc.text("CERTIFICATION & APPROVAL", 17, yy + 6);

  /* left zone — signature + date */
  doc.setDrawColor(154, 167, 157);
  doc.setLineWidth(0.3);
  doc.line(17, yy + 18, 92, yy + 18);      // signature line
  doc.line(100, yy + 18, 150, yy + 18);    // date line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text("Approved by smartLAB Engineer", 17, yy + 22);
  doc.text("Date", 100, yy + 22);
  doc.setFontSize(6.2);
  doc.setTextColor(140, 150, 142);
  doc.text("name · title · signature", 17, yy + 26);

  /* right zone — official dashed circular seal */
  const sx = PW - 32;
  const sy = yy + BLOCK_H / 2 + 1;
  doc.setDrawColor(...tone);
  doc.setLineWidth(0.6);
  doc.setLineDashPattern([1, 0.9], 0);
  doc.circle(sx, sy, 12, "S");             // outer ring
  doc.setLineDashPattern([], 0);
  doc.setLineWidth(0.3);
  doc.circle(sx, sy, 9.2, "S");            // inner ring
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.6);
  doc.setTextColor(...tone);
  doc.text("OFFICIAL", sx, sy - 4, { align: "center" });
  doc.text("smartLAB", sx, sy - 0.3, { align: "center" });
  doc.text("LABORATORY", sx, sy + 3, { align: "center" });
  doc.text("STAMP", sx, sy + 6.4, { align: "center" });

  /* ── page footer ──────────────────────────────────────────────── */
  const pages = doc.getNumberOfPages();
  for (let pg = 1; pg <= pages; pg++) {
    doc.setPage(pg);
    const PH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(213, 221, 215);
    doc.setLineWidth(0.2);
    doc.line(12, PH - 11, PW - 12, PH - 11);
    doc.setFont("courier", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(116, 128, 111);
    doc.text(`smartLAB · Fimto Soft — info@fimtosoft.com  |  ${p.sessionId}`, 12, PH - 7);
    doc.text(`pg ${pg} / ${pages}`, PW - 12, PH - 7, { align: "right" });
  }

  doc.save(`${safeName(p.sessionId)}_cloud_report_${Date.now().toString(36)}.pdf`);
}

/* ================================================================ *
 *  2 · Excel / CSV
 * ================================================================ */
export function exportCloudXlsx(p: CloudReportPayload): void {
  const wb = XLSX.utils.book_new();

  /* Sheet 1 — Summary */
  const summ = [
    ["smartLAB — Cloud EMI Engineering Export"],
    [],
    ["Generated (UTC)",    fmtISO(p.generatedAt)],
    ["Session ID",        p.sessionId],
    ["Mode",              p.mode],
    [],
    ["RMSD Damage Index",  `${p.rmsd.rmsdPct.toFixed(2)} %`],
    ["Peak Dev. Freq",     p.rmsd.peakDeviationKHz ? `${p.rmsd.peakDeviationKHz.toFixed(1)} kHz` : "—"],
    ["Structural Status",  diagnosticLabel(p.rmsd.rmsdPct)],
    ["Live Bins",          p.live.length],
    ["Baseline Bins",      p.baseline.length],
    [],
    ["Powered by smartLAB · Fimto Soft"],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summ);
  ws1["!cols"] = [{ wch: 26 }, { wch: 54 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Summary");

  /* Sheet 2 — point data (all 96 bins) ──────────────────────────── *
   *  Grid-aligned lab matrix. A reference banner row carries the whole
   *  session RMSD so an engineer opening the raw sheet sees the verdict
   *  before scrolling a single row. Then the 5-column point table:
   *    Frequency · Baseline G · Current G · ΔG (µS) · Δ (%)
   * --------------------------------------------------------------- */
  const ref = p.baseline.map(b => b.conductance_us);

  const HEADER = [
    "Frequency (kHz)",
    "Baseline Conductance (µS)",
    "Current Scan Conductance (µS)",
    "ΔG = Current − Baseline (µS)",
    "Δ (%)",
  ];

  /* banner rows above the table */
  const banner: (string | number)[][] = [
    [`smartLAB Sweep Data — session ${p.sessionId}`],
    [`Session RMSD damage index: ${p.rmsd.rmsdPct.toFixed(2)} %   ·   ${diagnosticLabel(p.rmsd.rmsdPct)}`],
    [`Points: ${p.live.length}   ·   Generated: ${fmtISO(p.generatedAt)}`],
    [],
    HEADER,
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(banner);

  /* append the 96 data rows beneath the header (row index 6 onward) */
  const dataMatrix = p.live.map((row, i) => {
    const b = ref[i] ?? 0;
    const dG = row.conductance_us - b;
    const dPct = b ? (dG / Math.abs(b)) * 100 : 0;
    return [
      Number(row.freq_khz.toFixed(3)),
      Number(b.toFixed(3)),
      Number(row.conductance_us.toFixed(3)),
      Number(dG.toFixed(3)),      // ΔG absolute — the requested 4th column
      Number(dPct.toFixed(3)),    // Δ% relative
    ];
  });
  XLSX.utils.sheet_add_aoa(ws2, dataMatrix, { origin: "A6" });

  /* v1.9.0 — ±5% alert highlighting: cells exceeding bounds get light red overlay */
  const alertStyle = { fill: { fgColor: { rgb: "FFEBEB" } } }; // light red
  const ws2LastRow = 5 + dataMatrix.length;
  for (let r = 6; r <= ws2LastRow; r++) {
    const dPctCell = ws2[`E${r}`];
    if (dPctCell && typeof dPctCell.v === "number" && Math.abs(dPctCell.v) > 5) {
      dPctCell.s = alertStyle;
    }
  }

  ws2["!cols"] = [
    { wch: 16 }, { wch: 26 }, { wch: 30 }, { wch: 28 }, { wch: 12 },
  ];
  ws2["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
  ];
  const lastRow = 5 + dataMatrix.length;   // header on row 5 (1-indexed)
  ws2["!autofilter"] = { ref: `A5:E${lastRow}` };
  XLSX.utils.book_append_sheet(wb, ws2, "Sweep Data");

  /* Sheet 3 — trend */
  if (p.trend.length > 0) {
    const trendRows = p.trend.map(r => ({
      "Bucket":           r.bucket,
      "RMSD avg (%)":     r.rmsd_avg ?? "",
      "RMSD max (%)":     r.rmsd_max ?? "",
      "Fres avg (kHz)":   r.fres_avg ?? "",
      "Temp avg (°C)":    r.temp_avg ?? "",
      "R avg (kΩ)":       r.r_avg ?? "",
      "Points":           r.n,
    }));
    const ws3 = XLSX.utils.json_to_sheet(trendRows);
    ws3["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 15 }, { wch: 14 }, { wch: 12 }, { wch: 9 }];
    XLSX.utils.book_append_sheet(wb, ws3, "RMSD Trend");
  }

  XLSX.writeFile(wb, `${safeName(p.sessionId)}_cloud_sweep_${Date.now().toString(36)}.xlsx`);
}

export function exportCloudCsv(p: CloudReportPayload): string {
  const ref = p.baseline.map(b => b.conductance_us);
  const lines: string[] = [
    `# smartLAB Cloud EMI Sweep Export`,
    `# Generated: ${fmtISO(p.generatedAt)}`,
    `# Session:   ${p.sessionId}`,
    `# Mode:      ${p.mode}`,
    `# RMSD:      ${p.rmsd.rmsdPct.toFixed(2)} %`,
    `# Status:    ${diagnosticLabel(p.rmsd.rmsdPct)}`,
    `#`,
    `"Frequency (kHz)","Baseline Conductance (µS)","Current Scan Conductance (µS)","Delta (µS)","Delta (%)"`,
  ];
  p.live.forEach((row, i) => {
    const b = ref[i] ?? 0;
    const d = row.conductance_us - b;
    const dp = b ? (d / Math.abs(b)) * 100 : 0;
    lines.push(
      `${row.freq_khz.toFixed(3)},${b.toFixed(3)},${row.conductance_us.toFixed(3)},${d.toFixed(3)},${dp.toFixed(3)}`
    );
  });
  return lines.join("\n");
}

/* ── Print: opens a styled A4 window ──────────────────────────── */
export function openPrintView(p: CloudReportPayload): void {
  const diag   = diagnosticLabel(p.rmsd.rmsdPct);
  const isGood = p.rmsd.rmsdPct <= 2;
  const accent = isGood ? "#1f7a43" : p.rmsd.rmsdPct <= 6 ? "#8a6127" : "#b23b22";

  const rows = p.live.map((row, i) => {
    const b = p.baseline[i]?.conductance_us ?? 0;
    const d = row.conductance_us - b;
    const dp = b ? (d / Math.abs(b)) * 100 : 0;
    return `<tr>
      <td class="n">${row.freq_khz.toFixed(1)}</td>
      <td class="n">${b.toFixed(2)}</td>
      <td class="n">${row.conductance_us.toFixed(2)}</td>
      <td class="n" style="color:${Math.abs(d) > 50 ? "#b23b22" : "#2c3a30"}">${d.toFixed(2)}</td>
      <td class="n">${dp.toFixed(2)}</td>
    </tr>`;
  }).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<title>smartLAB Cloud Report — ${p.sessionId}</title>
<style>
  @page { size: A4 portrait; margin: 12mm 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, "Noto Sans", "Segoe UI", sans-serif; color: #1a2018; font-size: 10px; }
  .hdr { display: flex; gap: 14px; align-items: flex-start; padding-bottom: 8px; border-bottom: 2.5px solid ${accent}; margin-bottom: 12px; }
  .hdr h1 { font-size: 14px; letter-spacing: .3px; }
  .hdr .sub { font-size: 8px; color: #5d6b60; }
  .hdr .meta { margin-inline-start: auto; text-align: end; font-family: ui-monospace,monospace; font-size: 8.5px; color: #5d6b60; line-height: 1.6; }
  .badge { display: inline-block; border: 1.5px solid ${accent}; color: ${accent}; font-weight: 800; font-size: 10px; padding: 3px 10px; margin-top: 6px; }
  h2 { font-size: 8px; text-transform: uppercase; letter-spacing: 2px; color: ${accent}; margin: 14px 0 6px; border-bottom: 1px solid #d5ddd7; padding-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 8px; }
  th { background: #eef2ee; border: 1px solid #d5ddd7; padding: 4px 3px; text-align: end; font-size: 7px; text-transform: uppercase; letter-spacing: .5px; color: #3c4a40; }
  td { border: 1px solid #e2e8e3; padding: 3px; text-align: end; font-family: ui-monospace,monospace; }
  .n { text-align: end; }
  tbody tr:nth-child(even) { background: #f8faf8; }
  .approval { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-top: 24px; border: 1.5px solid ${accent}; border-radius: 4px; padding: 12px 16px 14px; }
  .approval .siglines { flex: 1; }
  .approval .lbl { font-size: 7px; text-transform: uppercase; letter-spacing: 1.5px; color: ${accent}; font-weight: 800; margin-bottom: 14px; }
  .approval .line { display: inline-block; border-top: 1px solid #9aa79d; width: 46%; padding-top: 3px; font-size: 8px; color: #5d6b60; margin-right: 3%; }
  .seal { width: 74px; height: 74px; border-radius: 50%; border: 2px dashed ${accent}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .seal .inner { width: 60px; height: 60px; border-radius: 50%; border: 1px solid ${accent}; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: ${accent}; font-weight: 800; font-size: 6px; letter-spacing: .5px; line-height: 1.5; }
  .foot { margin-top: 12px; border-top: 1px solid #d5ddd7; padding-top: 5px; font: 7px ui-monospace,monospace; color: #74806f; display: flex; justify-content: space-between; }
</style></head>
<body>
  <div class="hdr">
    <div><h1>smartLAB — Cloud EMI Engineering Report</h1>
    <div class="sub">Electromechanical Impedance · InfluxDB 3 · Fimto Soft</div></div>
    <div class="meta">
      ${fmtISO(p.generatedAt)}<br>session: ${p.sessionId}<br>mode: ${p.mode}
    </div>
  </div>
  <div class="badge">${diag}</div>

  <h2>Executive Summary</h2>
  <table>
    <thead><tr><th style="text-align:start">Metric</th><th>Value</th></tr></thead>
    <tbody>
      <tr><td style="text-align:start">RMSD Damage Index</td><td style="font-weight:700;color:${accent}">${p.rmsd.rmsdPct.toFixed(2)} %</td></tr>
      <tr><td style="text-align:start">Peak Deviation Freq.</td><td>${p.rmsd.peakDeviationKHz ? p.rmsd.peakDeviationKHz.toFixed(1) + " kHz" : "—"}</td></tr>
      <tr><td style="text-align:start">Sweep Bins / Baseline</td><td>${p.live.length} / ${p.baseline.length}</td></tr>
      <tr><td style="text-align:start">Structural Status</td><td style="font-weight:700;color:${accent}">${diag}</td></tr>
    </tbody>
  </table>

  <h2>Sweep Data (${p.live.length} points)</h2>
  <table>
    <thead><tr><th>Freq (kHz)</th><th>Baseline G (µS)</th><th>Current G (µS)</th><th>ΔG (µS)</th><th>Δ (%)</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="approval">
    <div class="siglines">
      <div class="lbl">Certification &amp; Approval</div>
      <span class="line">Approved by smartLAB Engineer</span>
      <span class="line">Date</span>
    </div>
    <div class="seal"><div class="inner">OFFICIAL<br>smartLAB<br>LABORATORY<br>STAMP</div></div>
  </div>
  <div class="foot">
    <span>smartLAB · Fimto Soft — info@fimtosoft.com</span>
    <span>${p.sessionId} · ${fmtISO(p.generatedAt)}</span>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print()},350)}</script>
</body></html>`;

  const w = window.open("", "_blank", "width=960,height=1200");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
