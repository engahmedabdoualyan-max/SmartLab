/* ================================================================ *
 *  InvestorZone.tsx — smartLAB Investor & Decision-Maker View · v1.9.0
 *
 *  Clean, non-technical primary screen showing:
 *    1. 3D Digital Twin with severity glow rings
 *    2. Large MPa / Days / Countdown counters
 *    3. One-click certificate / excel / print bar
 *    4. Four commercial value pillars (ROI cards)
 *    5. Foldable Engineering Core for lab technicians
 *
 *  This zone is the FIRST thing a factory owner sees — no code,
 *  no SQL, no jargon. Engineers expand the Technical Portal when
 *  they need raw data.
 * ================================================================ */

import { useMemo, useRef, useState, useEffect } from "react";
import type { NodeSim } from "../sim";
import type { CalibrationModel } from "../regression";
import { forecastStrength, generateSensorSweepSet } from "../regression";
import { useLang } from "../i18n";
import { cn } from "../utils/cn";
import { Led } from "../ui";
import { generateClearanceCertificate } from "../certGen";
import { exportCloudXlsx, openPrintView, type CloudReportPayload } from "../cloudReport";
import SavingsCounter from "./SavingsCounter";
import DocLedger from "./DocLedger";
import WaveSim from "./WaveSim";
import TrafficBadges from "./TrafficBadges";

/* ── minified 3D twin for investor view ─────────────────────────── */
function InvestorTwin({ calib }: { sim?: NodeSim; calib: CalibrationModel }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const readingSet = useMemo(() => generateSensorSweepSet(calib.targetMpa / 8), [calib.targetMpa]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const s = Math.min(W, H) * 0.18;
    const cos = Math.cos(Math.PI / 6);

    // cube vertices
    const proj = (nx: number, ny: number, nz: number): [number, number] => [
      cx + (nx - ny) * cos * s, cy + (nx + ny) * 0.5 * s * 0.55 - nz * s,
    ];
    const base: [number, number][] = [proj(0,1,0), proj(1,1,0), proj(1,0,0), proj(0,0,0)];
    const top: [number, number][]  = [proj(0,1,1), proj(1,1,1), proj(1,0,1), proj(0,0,1)];
    const poly = (pts: [number, number][]) => pts.map(p => p.join(",")).join(" ");

    // faces
    ctx.fillStyle = "#1f241d"; ctx.fill(new Path2D(`M${poly([top[1], top[2], base[2], base[1]])}Z`));
    ctx.strokeStyle = "#33443a"; ctx.stroke();
    ctx.fillStyle = "#151d17"; ctx.fill(new Path2D(`M${poly([top[3], top[2], base[2], base[3]])}Z`));
    ctx.stroke();
    ctx.fillStyle = "#20261f"; ctx.fill(new Path2D(`M${poly(top)}Z`));
    ctx.stroke();

    // sensor nodes with severity glow
    const sensorPositions = [proj(0.25, 0.85, 1), proj(0.85, 0.85, 1), proj(0.85, 0.25, 1), proj(0.25, 0.25, 1)];
    const sensors = readingSet.sensors;
    sensorPositions.forEach((pos, i) => {
      const s = sensors[i];
      const anom = s?.damaged || (s?.rmsdPct ?? 0) > readingSet.anomalyThresholdPct;
      const color = anom ? "#e4593c" : "#8fd694";

      if (anom) {
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 14, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(228,89,60,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(pos[0], pos[1], 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  });

  return <canvas ref={ref} className="block w-full h-[260px] bg-scope" />;
}

/* ── commercial pillar card ─────────────────────────────────────── */
function PillarCard({
  icon,
  title,
  body,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={cn("border border-line bg-scope/25 p-4 transition-all duration-200 hover:border-copperdim/50 hover:-translate-y-0.5", className)}>
      <div className="w-9 h-9 flex items-center justify-center border border-copperdim/60 bg-copper/8 text-copper mb-3">
        {icon}
      </div>
      <div className="font-display font-semibold text-[13.5px] text-paper leading-snug mb-1.5">{title}</div>
      <p className="font-body text-[11.5px] leading-[1.65] text-mute">{body}</p>
    </div>
  );
}

/* ── main ───────────────────────────────────────────────────────── */
export default function InvestorZone({ sim, calib }: { sim: NodeSim; calib: CalibrationModel }) {
  void sim; // used for styling/readouts only; calibration model drives forecast
  const { t } = useLang();
  const [certState, setCertState] = useState<"idle" | "working" | "done">("idle");

  const strength = sim.calibratedStrengthMPa();
  const fcast = useMemo(() =>
    forecastStrength(
      { a: calib.a, b: calib.b },
      calib.targetMpa,
      null,
      sim.virtualDay,
      strength,
      calib.points
    ),
    [calib, sim.virtualDay, strength]
  );
  const daysRemaining = Math.max(0, fcast.daysRemaining);
  const targetReached = fcast.achieved;
  const progressPct = Math.min(100, (strength / Math.max(1, calib.targetMpa)) * 100);

  const handleCert = async () => {
    if (!targetReached) return;
    setCertState("working");
    try {
      await generateClearanceCertificate({
        sessionId: sim.sessionId,
        castDateIso: new Date(Date.now() - sim.virtualDay * 86400_000).toISOString().slice(0, 10),
        specimenId: "SP-001",
        targetMpa: calib.targetMpa,
        currentMPa: strength,
        achieved: true,
        forecast: fcast,
        coeffs: { a: calib.a, b: calib.b },
        sensors: [],
        capturerName: "smartLAB Field Engineer",
        company: "Fimto Soft · Integrated Tech Solutions",
        host: window.location.host,
      });
      setCertState("done");
      setTimeout(() => setCertState("idle"), 2400);
    } catch (e) {
      console.error(e);
      setCertState("idle");
    }
  };

  const handleExcel = () => {
    const p: CloudReportPayload = {
      sessionId: sim.sessionId,
      mode: "live",
      generatedAt: Date.now(),
      live: [],
      baseline: [],
      rmsd: { rmsdPct: 0, bins: 0, peakDeviationKHz: null },
      trend: [],
      chartDataUrl: "",
    };
    exportCloudXlsx(p);
  };

  const handlePrint = () => {
    openPrintView({
      sessionId: sim.sessionId,
      mode: "live",
      generatedAt: Date.now(),
      live: [],
      baseline: [],
      rmsd: { rmsdPct: 0, bins: 0, peakDeviationKHz: null },
      trend: [],
      chartDataUrl: "",
    });
  };

  return (
    <section className="panel panel-corner overflow-hidden" id="investor-zone">
      {/* ── header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 border-b border-line bg-raise/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center border border-copperdim bg-copper/10 shrink-0 text-copper">
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 5l7-3 7 3v10l-7 3-7-3z"/>
              <path d="M3 5l7 3m0 0 7-3m-7 3v10"/>
            </svg>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-copper">Decision Maker Overview</div>
            <div className="font-display font-bold text-[17px] text-paper tracking-wide">
              {t("inv.title")}
            </div>
          </div>
        </div>
        <span
          className="border border-signaldeep bg-signal/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-signal"
          dir="ltr"
        >v1.9.0</span>
        <div className="ml-auto flex items-center gap-2">
          <Led tone={targetReached ? "signal" : sim.status === "CRUSHED" ? "alarm" : "copper"} size={7} live />
          <span className="font-mono text-[9.5px] text-dim">{sim.sessionId}</span>
        </div>
      </div>

      {/* v1.9.0 — Traffic-light safety beacons */}
      <div className="px-4 md:px-5 pt-4">
        <TrafficBadges
          integrityState={sim.status === "CRUSHED" ? "critical" : targetReached ? "ok" : "warning"}
          slumpDetected={sim.scenario === "MIX_ADULTERATION"}
          fraudDetected={sim.certification === "BLOCKED"}
        />
      </div>

      {/* ── Investor Zone — always visible ─────────────────────── */}
      <div className="p-4 md:p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(280px,360px)_1fr] items-start">

          {/* LEFT: 3D Twin + WaveSim */}
          <div className="border border-line overflow-hidden">
            <div className="flex items-center gap-2.5 px-3 py-2 border-b border-line">
              <Led tone="signal" size={6} live />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">digital twin · animated strain wave</span>
            </div>
            <div className="relative">
              <div className="scanlines pointer-events-none absolute inset-0 z-10" />
              <InvestorTwin sim={sim} calib={calib} />
              {/* v1.9.0 — strain wave overlay */}
              <div className="absolute inset-x-0 bottom-0 opacity-80">
                <WaveSim
                  node={(Math.floor(sim.virtualDay * 3) % 4)}
                  healthy={sim.status !== "CRUSHED" && sim.certification !== "BLOCKED"}
                  scanActive={sim.status === "ACTIVE"}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: large counters + action bar */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* MPa */}
              <div className={cn(
                "border p-3.5 text-center transition-colors",
                targetReached ? "border-signaldeep bg-signal/6" : "border-line bg-scope/30"
              )}>
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-1">Est. Strength</div>
                <div className={cn(
                  "font-display font-bold text-[34px] tabular-nums leading-none",
                  targetReached ? "text-signal" : "text-paper"
                )}>
                  {strength.toFixed(1)}
                </div>
                <div className="font-mono text-[10.5px] text-dim mt-1">MPa</div>
              </div>

              {/* Test age */}
              <div className="border border-line bg-scope/30 p-3.5 text-center">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-1">Test Age</div>
                <div className="font-display font-bold text-[34px] tabular-nums leading-none text-paper">
                  {sim.virtualDay.toFixed(2)}
                </div>
                <div className="font-mono text-[10.5px] text-dim mt-1">Days</div>
              </div>

              {/* Days remaining countdown */}
              <div className={cn(
                "border p-3.5 text-center transition-colors",
                targetReached ? "border-signaldeep bg-signal/6" : "border-line bg-scope/30"
              )}>
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-1">
                  {targetReached ? "Shutter Clearance" : "Days to Clearance"}
                </div>
                <div className={cn(
                  "font-display font-bold text-[34px] tabular-nums leading-none",
                  targetReached ? "text-signal" : "text-copper"
                )}>
                  {targetReached ? "✓" : daysRemaining.toFixed(1)}
                </div>
                <div className="font-mono text-[10.5px] text-dim mt-1">
                  {targetReached ? "APPROVED" : "remaining"}
                </div>
              </div>
            </div>

            {/* v1.9.0 — Live Financial ROI counter */}
            <SavingsCounter virtualDay={sim.virtualDay} />

            {/* progress bar */}
            <div>
              <div className="flex justify-between font-mono text-[9px] text-dim mb-1.5">
                <span>Target {calib.targetMpa.toFixed(0)} MPa</span>
                <span className="tabular-nums">{progressPct.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 bg-deep border border-line overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: targetReached
                      ? "linear-gradient(90deg, #3f7a4e, #8fd694)"
                      : "linear-gradient(90deg, #8a6127, #de9a3c)",
                  }}
                />
              </div>
            </div>

            {/* v1.9.0 — Document Ledger Wallet */}
            <DocLedger
              actions={[
                {
                  label: "Strength Clearance Certificate",
                  estimatedKB: 96,
                  extension: ".pdf",
                  tag: "CERT",
                  disabled: !targetReached,
                  onClick: () => { void handleCert(); },
                  doing: certState === "working" ? "sealing…" : undefined,
                },
                {
                  label: "Full Sweep & RMSD Dataset",
                  estimatedKB: 640,
                  extension: ".xlsx",
                  tag: "DATA",
                  onClick: handleExcel,
                },
                {
                  label: "A4 Engineering Print View",
                  estimatedKB: 3,
                  extension: ".html→print",
                  tag: "PRINT",
                  onClick: handlePrint,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── Four Commercial Pillars ──────────────────────────── */}
      <div className="border-t border-line px-4 md:px-5 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-copper mb-4">
          {t("inv.pillars")}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PillarCard
            icon={
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="9" r="7" /><path d="M6 9h6M9 6v6" />
              </svg>
            }
            title={t("inv.p1.title")}
            body={t("inv.p1.body")}
          />
          <PillarCard
            icon={
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 14l3-6 4 3 3-7 4 5" strokeLinecap="round" />
                <circle cx="2" cy="14" r="1.4" fill="currentColor" />
              </svg>
            }
            title={t("inv.p2.title")}
            body={t("inv.p2.body")}
          />
          <PillarCard
            icon={
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="9" r="7" />
                <path d="M6 9.5 8 11.5 12 6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title={t("inv.p3.title")}
            body={t("inv.p3.body")}
          />
          <PillarCard
            icon={
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="12" height="8" rx="1" />
                <path d="M7 5V3.5A2 2 0 0 1 11 3.5V5" />
              </svg>
            }
            title={t("inv.p4.title")}
            body={t("inv.p4.body")}
          />
        </div>
      </div>
    </section>
  );
}
