/* ------------------------------------------------------------------ *
 *  reportExport.ts — smartLAB certification output engine
 *
 *  Three genuine output paths, all badge-lineage aware:
 *    printReport()  → styled paper-theme window → browser print dialog
 *    exportPdf()    → real vector PDF via jsPDF + autoTable
 *    exportExcel()  → real .xlsx workbook via SheetJS (2 sheets)
 *
 *  Types are declared structurally so this module stays decoupled
 *  from ClientZone.tsx (no circular import).
 * ------------------------------------------------------------------ */

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { TokenBadge, TokenWallet } from "./tokenDb";
import { badgeWatermark } from "./tokenDb";
import { deploymentFooterLine, onboardSession } from "./onboardStore";

/* ── structural contracts ───────────────────────────────────────── */
export interface ExportSpecimen {
  id: string;
  label: string;
  age: number;
  voltage: number;
  resistance: number;
  frequency: number;
  conductance: number;
  damage: number;
  strengthMPa: number;
  certification: string;
  scenario: string;
  savedAt: string;
  verdict: "PASS" | "FAIL" | "PENDING";
  badge: TokenBadge;
  romId: string | null;
}

export interface ExportProject {
  id: string;
  name: string;
  location: string;
  concrete: string;
  date: string;
  notes: string;
  createdAt: string;
  specimens: ExportSpecimen[];
}

export interface ExportContext {
  project: ExportProject;
  wallet: TokenWallet | null;
}

/* ── derived summary ────────────────────────────────────────────── */
interface Summary {
  total: number;
  pass: number;
  fail: number;
  pending: number;
  avgMpa: string;
  certified: number;
  generic: number;
  sessionBadge: TokenBadge;
  lastRomId: string | null;
  generatedAt: string;
  docId: string;
}

function summarize(p: ExportProject): Summary {
  const s = p.specimens;
  const pass = s.filter(x => x.verdict === "PASS").length;
  const fail = s.filter(x => x.verdict === "FAIL").length;
  const certified = s.filter(x => x.badge === "PROPRIETARY_CERTIFIED").length;
  return {
    total: s.length,
    pass,
    fail,
    pending: s.length - pass - fail,
    avgMpa: s.length ? (s.reduce((a, r) => a + r.strengthMPa, 0) / s.length).toFixed(2) : "—",
    certified,
    generic: s.length - certified,
    sessionBadge:
      onboardSession.mode === "certified" || certified > 0
        ? "PROPRIETARY_CERTIFIED"
        : "GENERIC_RAW",
    lastRomId:
      onboardSession.romId ??
      s.slice().reverse().find(x => x.romId)?.romId ??
      null,
    generatedAt: new Date().toISOString(),
    docId: `SL-${Date.now().toString(36).toUpperCase().slice(-8)}`,
  };
}

const safeName = (n: string) => n.replace(/[^\w\u0600-\u06FF\-]+/g, "_").slice(0, 60);

/* jspdf-autotable v5 returns the Table object; older builds only set
 * doc.lastAutoTable. Resolve defensively so a missing field can never
 * throw and break the export button. */
function tableEndY(doc: jsPDF, ret: unknown, fallback: number): number {
  const fromReturn = (ret as { finalY?: number } | undefined)?.finalY;
  if (typeof fromReturn === "number") return fromReturn;
  const fromDoc = (doc as unknown as { lastAutoTable?: { finalY?: number } })
    .lastAutoTable?.finalY;
  if (typeof fromDoc === "number") return fromDoc;
  return fallback;
}

/* ================================================================ *
 *  1 · PRINT — styled paper window, full multilingual support
 * ================================================================ */
export function printReport(ctx: ExportContext, labels: Record<string, string>): void {
  const { project, wallet } = ctx;
  const sm = summarize(project);
  const wm = badgeWatermark(sm.sessionBadge);
  const certified = sm.sessionBadge === "PROPRIETARY_CERTIFIED";
  const accent = certified ? "#1f7a43" : "#7a6a52";

  const rows = project.specimens.map((s, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td>${escapeHtml(s.label)}</td>
      <td class="num">${s.age}</td>
      <td class="num strong">${s.strengthMPa}</td>
      <td class="num">${s.damage}%</td>
      <td class="num">${s.frequency}</td>
      <td class="mono small">${s.badge === "PROPRIETARY_CERTIFIED" ? "🔒" : "⚡"} ${s.badge === "PROPRIETARY_CERTIFIED" ? "Genuine" : "Generic"}</td>
      <td class="mono small">${s.romId ?? "—"}</td>
      <td class="v ${s.verdict.toLowerCase()}">${s.verdict}</td>
      <td class="mono small">${s.savedAt.slice(0, 10)}</td>
    </tr>`).join("");

  const html = `<!doctype html>
<html dir="auto"><head><meta charset="utf-8">
<title>${escapeHtml(project.name)} — smartLAB Report</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", "Noto Sans", "Noto Sans Arabic", sans-serif;
         color: #16201a; margin: 0; padding: 0; font-size: 11px; }
  .head { display: flex; align-items: flex-start; gap: 14px;
          border-bottom: 3px solid ${accent}; padding-bottom: 10px; margin-bottom: 14px; }
  .logo { width: 42px; height: 42px; border: 2px solid ${accent};
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 17px; color: ${accent}; flex-shrink: 0; }
  h1 { font-size: 17px; margin: 0 0 2px; letter-spacing: .4px; }
  .sub { font-size: 10px; color: #5d6b60; }
  .docmeta { margin-inline-start: auto; text-align: end; font-size: 9.5px;
             color: #5d6b60; line-height: 1.6; font-family: ui-monospace, monospace; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 22px; margin-bottom: 14px; }
  .kv { display: flex; justify-content: space-between; border-bottom: 1px dotted #c9d2cb; padding: 3px 0; }
  .kv b { font-weight: 600; color: #2c3a30; }
  .kv span { font-family: ui-monospace, monospace; }
  h2 { font-size: 10px; text-transform: uppercase; letter-spacing: 2px;
       color: ${accent}; margin: 16px 0 7px; border-bottom: 1px solid #d5ddd7; padding-bottom: 3px; }
  .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; margin-bottom: 6px; }
  .stat { border: 1px solid #d5ddd7; padding: 7px 4px; text-align: center; }
  .stat b { display: block; font-size: 17px; font-family: ui-monospace, monospace; }
  .stat i { font-style: normal; font-size: 8px; text-transform: uppercase;
            letter-spacing: .8px; color: #5d6b60; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
  th { background: #eef2ee; border: 1px solid #d5ddd7; padding: 5px 4px;
       text-align: start; font-size: 8px; text-transform: uppercase; letter-spacing: .7px; color: #3c4a40; }
  td { border: 1px solid #e2e8e3; padding: 4px; }
  td.num { text-align: end; font-family: ui-monospace, monospace; }
  td.strong { font-weight: 700; }
  td.mono, .mono { font-family: ui-monospace, monospace; }
  .small { font-size: 8.5px; }
  td.v { font-weight: 700; text-align: center; font-size: 8.5px; }
  td.v.pass { color: #1f7a43; } td.v.fail { color: #b23b22; } td.v.pending { color: #8a6127; }
  tbody tr:nth-child(even) { background: #f8faf8; }
  .wm { margin-top: 16px; border: 2px solid ${accent};
        background: ${certified ? "#eaf6ee" : "#f4f1ea"};
        padding: 11px 14px; display: flex; align-items: center; gap: 12px; }
  .wm .big { font-size: 13px; font-weight: 800; color: ${accent}; }
  .wm .meta { font-family: ui-monospace, monospace; font-size: 8.5px; color: #4a584e; line-height: 1.65; }
  .seal { margin-inline-start: auto; width: 62px; height: 62px; border-radius: 50%;
          border: 2.5px dashed ${accent}; color: ${accent}; display: flex; flex-direction: column;
          align-items: center; justify-content: center; font-size: 7px; font-weight: 700;
          text-align: center; line-height: 1.25; flex-shrink: 0; }
  .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 34px; margin-top: 24px; }
  .sign div { border-top: 1px solid #9aa79d; padding-top: 4px; font-size: 8.5px; color: #5d6b60; }
  .foot { margin-top: 16px; border-top: 1px solid #d5ddd7; padding-top: 6px;
          display: flex; font-size: 8px; color: #74806f; font-family: ui-monospace, monospace; }
  @media print { .noprint { display: none !important; } }
  .noprint { position: fixed; top: 10px; inset-inline-end: 10px; }
  .noprint button { font: 600 12px sans-serif; padding: 9px 18px; cursor: pointer;
                    background: ${accent}; color: #fff; border: 0; border-radius: 3px; }
</style></head>
<body>
  <div class="noprint"><button onclick="window.print()">${escapeHtml(labels.print)} ⎙</button></div>

  <div class="head">
    <div class="logo">SL</div>
    <div>
      <h1>smartLAB — Structural Health Monitoring Report</h1>
      <div class="sub">Electromechanical Impedance (EMI) · ASTM C1074 maturity method · Fimto Soft</div>
    </div>
    <div class="docmeta">
      DOC ${sm.docId}<br>${sm.generatedAt.slice(0, 19).replace("T", " ")} UTC<br>Page 1 / 1
    </div>
  </div>

  <div class="grid">
    <div class="kv"><b>${escapeHtml(labels.project)}</b><span>${escapeHtml(project.name)}</span></div>
    <div class="kv"><b>${escapeHtml(labels.location)}</b><span>${escapeHtml(project.location || "—")}</span></div>
    <div class="kv"><b>${escapeHtml(labels.concrete)}</b><span>${escapeHtml(project.concrete)}</span></div>
    <div class="kv"><b>${escapeHtml(labels.date)}</b><span>${escapeHtml(project.date)}</span></div>
  </div>

  <h2>${escapeHtml(labels.summary)}</h2>
  <div class="stats">
    <div class="stat"><b>${sm.total}</b><i>Total</i></div>
    <div class="stat"><b style="color:#1f7a43">${sm.pass}</b><i>${escapeHtml(labels.pass)}</i></div>
    <div class="stat"><b style="color:#b23b22">${sm.fail}</b><i>${escapeHtml(labels.fail)}</i></div>
    <div class="stat"><b>${sm.avgMpa}</b><i>Avg MPa</i></div>
    <div class="stat"><b style="color:#1f7a43">${sm.certified}</b><i>🔒 Genuine</i></div>
  </div>

  <h2>${escapeHtml(labels.specimens)}</h2>
  <table>
    <thead><tr>
      <th>#</th><th>${escapeHtml(labels.specimen)}</th><th>${escapeHtml(labels.age)}</th>
      <th>MPa</th><th>${escapeHtml(labels.damage)}</th><th>kHz</th>
      <th>Badge</th><th>ROM ID</th><th>${escapeHtml(labels.verdict)}</th><th>${escapeHtml(labels.date)}</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="10" style="text-align:center;padding:16px;color:#8d968f">—</td></tr>`}</tbody>
  </table>

  <div class="wm">
    <div>
      <div class="big">${wm.text}</div>
      <div class="meta">
        ${escapeHtml(deploymentFooterLine())}<br>
        ROM ID: ${sm.lastRomId ?? "N/A (generic session)"}<br>
        ${onboardSession.pufLatchId ? `PUF Latch: ${onboardSession.pufLatchId}<br>` : ""}
        Tokens used: ${wallet?.used ?? "—"} · Balance: ${wallet?.balance ?? "—"}<br>
        Ledger: IndexedDB smartlab-token-wallet-v1
      </div>
    </div>
    <div class="seal">${certified ? "FACTORY<br>CALIBRATED<br>✔" : "EVAL<br>ONLY<br>⚡"}</div>
  </div>

  <div class="sign">
    <div>${escapeHtml(labels.techsign)}</div>
    <div>${escapeHtml(labels.engsign)}</div>
  </div>

  <div class="foot">
    <span>smartLAB · Fimto Soft — info@fimtosoft.com</span>
    <span style="margin-inline-start:auto">${sm.docId} · fimtosoft.com</span>
  </div>

  <script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script>
</body></html>`;

  const w = window.open("", "_blank", "width=980,height=1200");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));
}

/* ================================================================ *
 *  2 · PDF — real vector document (jsPDF + autoTable)
 * ================================================================ */
export function exportPdf(ctx: ExportContext): void {
  const { project, wallet } = ctx;
  const sm = summarize(project);
  const wm = badgeWatermark(sm.sessionBadge);
  const certified = sm.sessionBadge === "PROPRIETARY_CERTIFIED";

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW = doc.internal.pageSize.getWidth();
  const accent: [number, number, number] = certified ? [31, 122, 67] : [122, 106, 82];
  const ink: [number, number, number] = [22, 32, 26];
  const muted: [number, number, number] = [93, 107, 96];

  /* header band */
  doc.setFillColor(...accent);
  doc.rect(0, 0, PW, 2.6, "F");
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.6);
  doc.rect(12, 10, 13, 13);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...accent);
  doc.text("SL", 18.5, 18.8, { align: "center" });

  doc.setFontSize(13.5);
  doc.setTextColor(...ink);
  doc.text("smartLAB — Structural Health Monitoring Report", 29, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.6);
  doc.setTextColor(...muted);
  doc.text("Electromechanical Impedance (EMI) · ASTM C1074 maturity method · Fimto Soft", 29, 21);

  doc.setFontSize(7);
  doc.text(`DOC ${sm.docId}`, PW - 12, 14, { align: "right" });
  doc.text(`${sm.generatedAt.slice(0, 19).replace("T", " ")} UTC`, PW - 12, 18, { align: "right" });

  doc.setDrawColor(...accent);
  doc.setLineWidth(0.9);
  doc.line(12, 26, PW - 12, 26);

  /* project meta */
  const tMeta = autoTable(doc, {
    startY: 30,
    theme: "plain",
    styles: { fontSize: 8.4, cellPadding: 1.5, textColor: ink },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 26, textColor: muted },
      1: { cellWidth: 66 },
      2: { fontStyle: "bold", cellWidth: 26, textColor: muted },
      3: { cellWidth: "auto" },
    },
    body: [
      ["Project", project.name, "Location", project.location || "—"],
      ["Concrete", project.concrete, "Start date", project.date],
    ],
  });

  /* summary stats */
  let y = tableEndY(doc, tMeta, 44) + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...accent);
  doc.text("SUMMARY", 12, y);
  y += 2.5;

  const tStats = autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 8.5, halign: "center", cellPadding: 2.2, lineColor: [213, 221, 215] },
    headStyles: { fillColor: [238, 242, 238], textColor: muted, fontSize: 7, fontStyle: "bold" },
    head: [["Total", "PASS", "FAIL", "Avg MPa", "Genuine", "Generic"]],
    body: [[
      String(sm.total),
      String(sm.pass),
      String(sm.fail),
      sm.avgMpa,
      String(sm.certified),
      String(sm.generic),
    ]],
    didParseCell: d => {
      if (d.section === "body") {
        d.cell.styles.fontStyle = "bold";
        if (d.column.index === 1) d.cell.styles.textColor = [31, 122, 67];
        if (d.column.index === 2) d.cell.styles.textColor = [178, 59, 34];
        if (d.column.index === 4) d.cell.styles.textColor = [31, 122, 67];
      }
    },
  });

  /* specimen table */
  y = tableEndY(doc, tStats, y + 16) + 6;
  doc.setTextColor(...accent);
  doc.setFontSize(8);
  doc.text("SPECIMEN DETAILS", 12, y);

  const tSpec = autoTable(doc, {
    startY: y + 2.5,
    theme: "grid",
    styles: { fontSize: 7.3, cellPadding: 1.7, lineColor: [226, 232, 227], textColor: ink },
    headStyles: { fillColor: [238, 242, 238], textColor: [60, 74, 64], fontSize: 6.6, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 248] },
    columnStyles: {
      0: { cellWidth: 8, halign: "right" },
      2: { halign: "right", cellWidth: 12 },
      3: { halign: "right", cellWidth: 15, fontStyle: "bold" },
      4: { halign: "right", cellWidth: 15 },
      5: { halign: "right", cellWidth: 15 },
      6: { cellWidth: 18 },
      7: { cellWidth: 30, fontSize: 6 },
      8: { cellWidth: 15, halign: "center", fontStyle: "bold" },
    },
    head: [["#", "Specimen", "Age d", "MPa", "Damage%", "F kHz", "Badge", "ROM ID", "Verdict", "Date"]],
    body: project.specimens.length
      ? project.specimens.map((s, i) => [
          String(i + 1),
          s.label,
          String(s.age),
          String(s.strengthMPa),
          String(s.damage),
          String(s.frequency),
          s.badge === "PROPRIETARY_CERTIFIED" ? "Genuine" : "Generic",
          s.romId ?? "—",
          s.verdict,
          s.savedAt.slice(0, 10),
        ])
      : [["—", "No specimens recorded", "", "", "", "", "", "", "", ""]],
    didParseCell: d => {
      if (d.section === "body" && d.column.index === 8) {
        const v = String(d.cell.raw);
        if (v === "PASS") d.cell.styles.textColor = [31, 122, 67];
        else if (v === "FAIL") d.cell.styles.textColor = [178, 59, 34];
        else d.cell.styles.textColor = [138, 97, 39];
      }
      if (d.section === "body" && d.column.index === 6) {
        d.cell.styles.textColor = String(d.cell.raw) === "Genuine" ? [31, 122, 67] : [120, 128, 118];
      }
    },
  });

  /* ── badge watermark block (burned into footer metadata) ─────── */
  y = tableEndY(doc, tSpec, y + 40) + 7;
  if (y > 232) { doc.addPage(); y = 20; }

  const wmFill: [number, number, number] = certified ? [234, 246, 238] : [244, 241, 234];
  doc.setFillColor(...wmFill);
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.7);
  doc.roundedRect(12, y, PW - 24, 30, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...accent);
  doc.text(
    certified ? "CERTIFIED GENUINE (FACTORY CALIBRATED)" : "GENERIC (SELF-CALIBRATED) EVALUATION ONLY",
    17, y + 7.5
  );

  doc.setFont("courier", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(74, 88, 78);
  const meta = [
    deploymentFooterLine(),
    `ROM ID: ${sm.lastRomId ?? "N/A (generic session)"}${onboardSession.pufLatchId ? `   |   PUF Latch: ${onboardSession.pufLatchId}` : ""}`,
    `Tokens used: ${wallet?.used ?? "—"}   |   Balance: ${wallet?.balance ?? "—"}   |   Badge flag: ${sm.sessionBadge}`,
    `Ledger: IndexedDB smartlab-token-wallet-v1 (fallback localStorage)   |   ${wm.text}`,
  ];
  meta.forEach((line, i) => doc.text(line, 17, y + 13 + i * 3.9));

  /* circular seal */
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([1, 0.8], 0);
  doc.circle(PW - 27, y + 15, 10.5, "S");
  doc.setLineDashPattern([], 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.2);
  doc.setTextColor(...accent);
  if (certified) {
    doc.text("FACTORY", PW - 27, y + 12.5, { align: "center" });
    doc.text("CALIBRATED", PW - 27, y + 15.5, { align: "center" });
    doc.text("VERIFIED", PW - 27, y + 18.5, { align: "center" });
  } else {
    doc.text("EVAL", PW - 27, y + 13.5, { align: "center" });
    doc.text("ONLY", PW - 27, y + 17, { align: "center" });
  }

  /* signature lines */
  y += 38;
  doc.setDrawColor(154, 167, 157);
  doc.setLineWidth(0.3);
  doc.line(14, y, 88, y);
  doc.line(PW - 88, y, PW - 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text("Lab Technician — signature & date", 14, y + 4);
  doc.text("Certifying Engineer — signature & stamp", PW - 88, y + 4);

  /* page footer on every page */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    const PH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(213, 221, 215);
    doc.setLineWidth(0.3);
    doc.line(12, PH - 12, PW - 12, PH - 12);
    doc.setFont("courier", "normal");
    doc.setFontSize(6.4);
    doc.setTextColor(116, 128, 111);
    doc.text(`smartLAB · Fimto Soft — info@fimtosoft.com   |   ${wm.text}`, 12, PH - 8);
    doc.text(`${sm.docId}   ·   ${p} / ${pages}`, PW - 12, PH - 8, { align: "right" });
  }

  doc.save(`${safeName(project.name)}_smartLAB_report.pdf`);
}

/* ================================================================ *
 *  3 · EXCEL — real .xlsx workbook, two sheets
 * ================================================================ */
export function exportExcel(ctx: ExportContext): void {
  const { project, wallet } = ctx;
  const sm = summarize(project);
  const wm = badgeWatermark(sm.sessionBadge);

  const wb = XLSX.utils.book_new();

  /* Sheet 1 — Summary */
  const summaryAoa: (string | number)[][] = [
    ["smartLAB — Structural Health Monitoring Report"],
    ["Electromechanical Impedance (EMI) · ASTM C1074 maturity method"],
    [],
    ["Document ID", sm.docId],
    ["Generated (UTC)", sm.generatedAt.slice(0, 19).replace("T", " ")],
    [],
    ["Project", project.name],
    ["Location", project.location || "—"],
    ["Concrete grade", project.concrete],
    ["Start date", project.date],
    ["Notes", project.notes || "—"],
    [],
    ["SUMMARY"],
    ["Total specimens", sm.total],
    ["PASS", sm.pass],
    ["FAIL", sm.fail],
    ["PENDING", sm.pending],
    ["Average strength (MPa)", sm.avgMpa],
    ["Certified sensors", sm.certified],
    ["Generic sensors", sm.generic],
    [],
    ["HARDWARE DEPLOYMENT LINEAGE"],
    ["Deployment path", deploymentFooterLine()],
    ["Session badge flag", sm.sessionBadge],
    ["Watermark", wm.text],
    ["ROM ID (1-Wire 64-bit)", sm.lastRomId ?? "N/A (generic session)"],
    ["PUF latch ID", onboardSession.pufLatchId ?? "N/A"],
    ["Session locked at", onboardSession.lockedAt ?? "N/A"],
    [],
    ["TOKEN LEDGER"],
    ["Tokens used (lifetime)", wallet?.used ?? "—"],
    ["Token balance", wallet?.balance ?? "—"],
    ["Tokens issued (lifetime)", wallet?.certified ?? "—"],
    ["Ledger store", "IndexedDB smartlab-token-wallet-v1"],
    [],
    ["Powered by smartLAB · Fimto Soft — info@fimtosoft.com"],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryAoa);
  ws1["!cols"] = [{ wch: 30 }, { wch: 62 }];
  ws1["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Summary");

  /* Sheet 2 — Specimens */
  const specRows = project.specimens.map((s, i) => ({
    "#": i + 1,
    "Specimen": s.label,
    "Age (days)": s.age,
    "Strength (MPa)": s.strengthMPa,
    "Damage (%)": s.damage,
    "Frequency (kHz)": s.frequency,
    "Conductance (µS)": s.conductance,
    "Voltage (mV)": s.voltage,
    "Resistance (kΩ)": s.resistance,
    "Certification": s.certification,
    "Badge": s.badge,
    "Badge Label": badgeWatermark(s.badge).text,
    "ROM ID": s.romId ?? "N/A",
    "Scenario": s.scenario,
    "Verdict": s.verdict,
    "Saved At": s.savedAt,
  }));
  const ws2 = XLSX.utils.json_to_sheet(
    specRows.length ? specRows : [{ "#": "", Specimen: "No specimens recorded" }]
  );
  ws2["!cols"] = [
    { wch: 4 }, { wch: 24 }, { wch: 11 }, { wch: 14 }, { wch: 11 },
    { wch: 15 }, { wch: 17 }, { wch: 13 }, { wch: 15 }, { wch: 15 },
    { wch: 22 }, { wch: 38 }, { wch: 26 }, { wch: 20 }, { wch: 10 }, { wch: 26 },
  ];
  ws2["!autofilter"] = { ref: `A1:P${Math.max(1, specRows.length) + 1}` };
  XLSX.utils.book_append_sheet(wb, ws2, "Specimens");

  XLSX.writeFile(wb, `${safeName(project.name)}_smartLAB_report.xlsx`);
}
