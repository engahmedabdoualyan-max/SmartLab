/* ------------------------------------------------------------------ *
 *  DigitalTwin.tsx — 3D Digital Twin + AI Strength Prediction
 *
 *  Left  : isometric concrete cube w/ 4 PZT node markers — red blink
 *          on RMSD anomaly (live threshold)
 *  Right : sensor dropdown · live chart · AI forecast · cert button
 * ------------------------------------------------------------------ */

import { useEffect, useMemo, useRef, useState } from "react";
import type { NodeSim } from "../sim";
import { Led } from "../ui";
import { cn } from "../utils/cn";
import { useLang } from "../i18n";
import {
  type CalibrationModel,
  type SensorReading,
  estimateStrength,
  evaluateSensorHealth,
  forecastStrength,
  generateSensorSweepSet,
  plowmanStrength,
} from "../regression";
import { generateClearanceCertificate } from "../certGen";

/* ────────────────────────────────────────────────────────────────── */
/*  1 · tiny canvas chart for one sensor                              */
/* ------------------------------------------------------------------ */
function SensorChart({ reading, threshold, spectrumType = "G" }: {
  reading: SensorReading;
  threshold: number;
  spectrumType?: "G" | "B" | "|Y|";
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const bins = reading.bins;
    const padL = 40, padR = 8, padT = 12, padB = 22;
    const pw = W - padL - padR, ph = H - padT - padB;
    
    /* v1.9.0 — select data array based on spectrum type */
    const dataValues = spectrumType === "B"
      ? (reading.susceptance ?? bins.map(b => b.conductanceUS * 0.3))
      : spectrumType === "|Y|"
      ? (reading.admittanceMag ?? bins.map(b => b.conductanceUS))
      : bins.map(b => b.conductanceUS);
    
    const dataMax = Math.max(1, ...dataValues) * 1.12;
    const fMin = bins[0].freqKHz, fMax = bins[bins.length - 1].freqKHz;
    const lx = Math.max(Math.log10(Math.max(fMin, 0.1)), -1);
    const hx = Math.log10(Math.max(fMax, 1));
    const x = (f: number) => padL + ((Math.log10(Math.max(f, 0.1)) - lx) / Math.max(hx - lx, 1e-6)) * pw;
    const y = (g: number) => padT + (1 - g / dataMax) * ph;

    // graticule
    ctx.strokeStyle = "rgba(143,214,148,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const gv = (dataMax / 4) * i, gy = y(gv);
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(W - padR, gy); ctx.stroke();
    }
    [100, 200, 400].forEach(f => {
      if (f < fMin || f > fMax) return;
      const gx = x(f);
      ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, H - padB); ctx.stroke();
    });

    // anomaly threshold line
    if (threshold > 0) {
      ctx.strokeStyle = "rgba(228,89,60,0.55)";
      ctx.setLineDash([5, 5]);
      const ty = y(dataMax * (threshold / Math.max(threshold * 10, dataMax)));
      ctx.beginPath(); ctx.moveTo(padL, ty); ctx.lineTo(W - padR, ty); ctx.stroke();
      ctx.setLineDash([]);
    }

    // curve
    const anom = reading.damaged || reading.rmsdPct > threshold;
    ctx.strokeStyle = anom ? "#e4593c" : "#de9a3c";
    ctx.lineWidth = 1.8;
    ctx.shadowColor = anom ? "#e4593c" : "rgba(222,154,60,0.6)";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    bins.forEach((b, i) =>
      i === 0 ? ctx.moveTo(x(b.freqKHz), y(dataValues[i]))
              : ctx.lineTo(x(b.freqKHz), y(dataValues[i])));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // peak marker
    let pk = 0, pkF = 0;
    dataValues.forEach((v, i) => { if (v > pk) { pk = v; pkF = bins[i].freqKHz; } });
    ctx.fillStyle = anom ? "#ff7a5c" : "#de9a3c";
    ctx.beginPath(); ctx.arc(x(pkF), y(pk), 2.6, 0, Math.PI * 2); ctx.fill();

    ctx.font = "8.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = anom ? "rgba(255,122,92,0.9)" : "rgba(222,154,60,0.9)";
    ctx.textAlign = "right";
    ctx.fillText(`res ${pkF.toFixed(1)} kHz`, W - padR - 2, padT + 10);
  });

  return <canvas ref={ref} className="block w-full h-[150px] bg-scope" />;
}

/* ────────────────────────────────────────────────────────────────── */
/*  2 · SVG isometric concrete block w/ sensor markers                */
/* ------------------------------------------------------------------ */

interface NodeMarker {
  id: string;
  node: number;
  xyz: [number, number, number]; // normalized 0..1 across faces
  rmsdPct: number;
  damaged: boolean;
}

function IsometricBlock({
  markers,
  activeId,
  anomalyThreshold,
  onSelect,
}: {
  markers: NodeMarker[];
  activeId: string;
  anomalyThreshold: number;
  onSelect: (id: string) => void;
}) {
  // Isometric projection: iso X = (x - y)·cos30° · s,  iso Y = ((x + y)·0.5 − z)·s
  const cos = Math.cos(Math.PI / 6);
  const s = 84;
  const project = (nx: number, ny: number, nz: number): [number, number] => [
    130 + (nx - ny) * cos * s,
    118 + (nx + ny) * 0.5 * s * 0.55 - nz * s
  ];

  const W = 260, H = 250;
  // corners of unit cube projected
  const base: [number, number][] = [
    project(0, 1, 0), project(1, 1, 0), project(1, 0, 0), project(0, 0, 0),
  ];
  const top: [number, number][] = [
    project(0, 1, 1), project(1, 1, 1), project(1, 0, 1), project(0, 0, 1),
  ];

  const poly = (pts: [number, number][]): string =>
    pts.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ");

  const topEdge = [...top];
  const rightFace = [top[1], top[2], base[2], base[1]];
  const leftFace = [top[3], top[2], base[2], base[3]];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="3D digital twin of concrete specimen with multi-sensor markers"
    >
      <defs>
        <linearGradient id="gTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3d4a3f"/>
          <stop offset="100%" stopColor="#20241f"/>
        </linearGradient>
        <linearGradient id="gLeft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#23281f"/>
          <stop offset="100%" stopColor="#171b15"/>
        </linearGradient>
        <linearGradient id="gRight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1f241d"/>
          <stop offset="100%" stopColor="#141813"/>
        </linearGradient>
      </defs>

      {/* rear edge glow */}
      <rect x="0" y="0" width={W} height={H} fill="none" />

      {/* concrete faces */}
      <polygon points={poly(topEdge)}  fill="url(#gTop)"   stroke="#62685e" strokeWidth="0.7" />
      <polygon points={poly(leftFace)} fill="url(#gLeft)"  stroke="#62685e" strokeWidth="0.7" />
      <polygon points={poly(rightFace)}fill="url(#gRight)" stroke="#62685e" strokeWidth="0.7" />

      {/* graphic sensory grid on top face for "digital" feel */}
      {[0.25, 0.5, 0.75].map(f => {
        const a = project(f, 1, 1), b = project(f, 0, 1);
        const c = project(1, f, 1), d = project(0, f, 1);
        return (
          <g key={f} stroke="#3d4640" strokeWidth="0.5" opacity="0.6">
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
            <line x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} />
          </g>
        );
      })}

      {/* base shadow */}
      <ellipse cx="130" cy="216" rx="86" ry="12" fill="#080c0a" opacity="0.55" />
      <ellipse cx="130" cy="216" rx="86" ry="12" fill="none" stroke="#1e251f" strokeWidth="0.5" opacity="0.7" />

      {/* sensor markers */}
      {markers.map((m) => {
        const [px, py] = project(...m.xyz);
        const anomaly = m.damaged || m.rmsdPct > anomalyThreshold;
        const active = m.id === activeId;
        return (
          <g
            key={m.id}
            onClick={() => onSelect(m.id)}
            style={{ cursor: "pointer" }}
            role="button"
            aria-label={`sensor ${m.id}, RMSD ${m.rmsdPct}%${anomaly ? " anomaly" : ""}`}
          >
            {/* anomaly pulse ring */}
            {anomaly && (
              <circle cx={px} cy={py} r={active ? 11 : 8} fill="none" stroke="#e4593c"
                      strokeWidth={active ? 1.6 : 1.1} className="req-blink" opacity="0.9" />
            )}
            {/* selection ring */}
            {active && (
              <circle cx={px} cy={py} r="13" fill="none" stroke="#de9a3c" strokeWidth="1.2"
                      strokeDasharray="3 3"/>
            )}
            {/* node body */}
            <circle cx={px} cy={py} r={active ? 5.4 : 4.4}
                    fill={anomaly ? "#e4593c" : "#8fd694"}
                    stroke={active ? "#f2b866" : "#101612"} strokeWidth="1.2" />
            <circle cx={px} cy={py} r={active ? 2 : 1.6}
                    fill="#101612" opacity={0.55} />
            {/* connector stub */}
            <line x1={px} y1={py + 5} x2={px} y2={py + 13}
                  stroke={anomaly ? "#ff7a5c" : "#7fb8a4"} strokeWidth="1" opacity="0.65" />
          </g>
        );
      })}

      {/* edge annotation */}
      <text x="12" y={H - 8} fontSize="8" fill="#5f7063"
            fontFamily="'JetBrains Mono', monospace">
        ISO TWIN · C40/50 · 150 mm
      </text>
      <text x={W - 118} y={H - 8} fontSize="8" fill="#5f7063"
            fontFamily="'JetBrains Mono', monospace" textAnchor="end">
        click marker to inspect
      </text>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  3 · main                                                          */
/* ------------------------------------------------------------------ */

export default function DigitalTwin({ sim, calib }: { sim: NodeSim; calib: CalibrationModel }) {
  void sim; // live ADC sim available for future streaming — twin is self-contained per-sensor
  const { t } = useLang();
  const readingSet = useMemo(() => generateSensorSweepSet(calib.targetMpa / 8), [calib.targetMpa]);
  const sensors = readingSet.sensors;

  const [activeId, setActiveId] = useState<string>(sensors[2].id); // start on damaged node
  const [certState, setCertState] = useState<"idle" | "working" | "done">("idle");
  const [spectrumType, setSpectrumType] = useState<"G" | "B" | "|Y|">("G"); // v1.9.0 dual-spectrum

  const reading = sensors.find(r => r.id === activeId) ?? sensors[0];

  /* v1.9.0 — sensor health guard rail: if conductance is zero/NaN,
   * bypass interpolation array and flag E-HARDWARE-004 instead of
   * freezing the graph canvas with NaN coordinates */
  const sensorHealthMap = useMemo(
    () => sensors.map(s => ({
      ...evaluateSensorHealth(s.gPeakUS, s.rmsdPct),
      id: s.id,
    })),
    [sensors]
  );
  const activeHealth = sensorHealthMap.find(h => h.id === activeId);
  /* Never pass a disconnected sensor's zero/NaN array into canvas math.
   * Preserve its identity and error RMSD, but draw the globally available
   * uncalibrated node-01 envelope as an explicit visual fallback. */
  const chartReading: SensorReading =
    activeHealth && activeHealth.health !== "ONLINE"
      ? {
          ...reading,
          bins: sensors[0].bins,
          gPeakUS: sensors[0].gPeakUS,
          fresKHz: sensors[0].fresKHz,
          damaged: true,
        }
      : reading;

  /* strength estimation per sensor */
  const perSensorStrength = useMemo(() => {
    const now = Date.now();
    const cast = calib.points.length > 0
      ? now - Math.max(10, sim.virtualDay) * 86400_000
      : now - sim.virtualDay * 86400_000;
    return sensors.map(s => {
      const ageDays = Math.max(0.01, sim.virtualDay);
      const est = estimateStrength(s.gPeakUS, ageDays, { a: calib.a, b: calib.b });
      return { id: s.id, est, ageDays, cast };
    });
  }, [sensors, sim.virtualDay, calib.a, calib.b, calib.points.length]);

  const activeStrength = perSensorStrength.find(p => p.id === reading.id)
    ?? perSensorStrength[0];

  const fcast = useMemo(() => {
    const cast = activeStrength.cast;
    return forecastStrength(
      { a: calib.a, b: calib.b },
      calib.targetMpa,
      cast,
      activeStrength.ageDays,
      activeStrength.est,
      calib.points
    );
  }, [calib, activeStrength]);

  /* certificate eligibility */
  const certEligible = fcast.achieved;
  const handleCert = async () => {
    if (!certEligible) return;
    setCertState("working");
    try {
      await generateClearanceCertificate({
        sessionId: sim.sessionId,
        castDateIso: new Date(activeStrength.cast).toISOString().slice(0, 10),
        specimenId: reading.id.toUpperCase().replace(/_/g, "-"),
        targetMpa: calib.targetMpa,
        currentMPa: activeStrength.est,
        achieved: certEligible,
        forecast: fcast,
        coeffs: { a: calib.a, b: calib.b },
        sensors,
        capturerName: "SmartLAB Field Engineer",
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

  const markers: NodeMarker[] = sensors.map((s, idx) => ({
    id: s.id,
    node: idx + 1,
    xyz: [0.30 + (idx % 2) * 0.40, 0.35 + Math.floor(idx / 2) * 0.30, 1.0],
    rmsdPct: s.rmsdPct,
    damaged: s.damaged,
  }));

  const anomCount = sensors.filter(s => s.damaged || s.rmsdPct > readingSet.anomalyThresholdPct).length;

  const projectDateFmt = Number.isFinite(fcast.projectedDate)
    ? new Date(fcast.projectedDate).toLocaleDateString() +
      " " + new Date(fcast.projectedDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">

      {/* LEFT — twin + sensors list */}
      <div className="space-y-3">

        {/* 3D twin panel */}
        <div className="border border-line bg-scope/60 panel-hover overflow-hidden">
          <div className="flex items-center gap-2.5 px-3 py-2 border-b border-line">
            <Led tone={anomCount > 0 ? "alarm" : "signal"} size={7} live={anomCount > 0} />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
              {t("twin.title")}
            </span>
            <span className="ms-auto font-mono text-[9px] text-dim">
              {anomCount} {t("twin.anom")}
            </span>
          </div>
          <div className="relative px-2 pb-2">
            <IsometricBlock
              markers={markers}
              activeId={activeId}
              anomalyThreshold={readingSet.anomalyThresholdPct}
              onSelect={setActiveId}
            />
            {/* anomaly flash CSS (inline, single-file safe) */}
            <style>{`
              @keyframes reqBlink { 0%,100%{opacity:.2;stroke-width:1px} 50%{opacity:1;stroke-width:2px} }
              .req-blink { animation: reqBlink 1.1s ease-in-out infinite; }
              @media (prefers-reduced-motion: reduce) { .req-blink{animation:none} }
            `}</style>
          </div>
        </div>

        {/* per-node list */}
        <div className="border border-line">
          <div
            className="grid grid-cols-[1.4fr_0.9fr_0.7fr_0.7fr] px-3 py-1.5 border-b border-line
                       font-mono text-[8.5px] uppercase tracking-[0.14em] text-dim"
          >
            <span>{t("twin.sensor")}</span>
            <span className="text-end">RMSD</span>
            <span className="text-end">MPa</span>
            <span className="text-end">—</span>
          </div>
          {sensors.map((s, i) => {
            const st = perSensorStrength[i];
            const anom = s.damaged || s.rmsdPct > readingSet.anomalyThresholdPct;
            const active = s.id === activeId;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={cn(
                  "w-full grid grid-cols-[1.4fr_0.9fr_0.7fr_0.7fr] items-center px-3 py-2 text-start",
                  "border-b border-line/50 last:border-0 transition-colors",
                  active ? "bg-copper/10" : "hover:bg-raise/40"
                )}
              >
                <span className="flex items-center gap-2 font-mono text-[10.5px] text-paper">
                  <span className={cn("inline-block w-2 h-2 rounded-full",
                    anom ? "bg-alarm" : "bg-signal")} />
                  {s.id.replace(/_/g, " ")}
                </span>
                <span className={cn("text-end font-mono text-[10.5px] tabular-nums",
                  anom ? "text-alarmhi" : "text-mute")}>
                  {s.rmsdPct.toFixed(2)}%
                </span>
                <span className="text-end font-mono text-[10.5px] tabular-nums text-paper">
                  {st.est.toFixed(1)}
                </span>
                <span className={cn("text-end font-mono text-[9px] uppercase tracking-[0.1em]",
                  anom ? "text-alarmhi" : "text-signal")}>
                  {anom ? t("twin.anom") : t("twin.ok")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT — chart + forecast + certificate */}
      <div className="space-y-3 min-w-0">

        {/* sensor health alert (v1.7.0 guard rail) */}
        {activeHealth && activeHealth.health !== "ONLINE" && (
          <div className="border border-alarm/60 bg-alarm/8 px-3.5 py-2.5 flex items-center gap-3 font-mono text-[10.5px]">
            <span className="w-2 h-2 bg-alarm rounded-full shrink-0 animate-pulse" />
            <div>
              <span className="text-alarmhi font-semibold">{activeHealth.errorCode}</span>
              <span className="text-mute ms-2">
                {activeHealth.health === "DISCONNECTED"
                  ? "Sensor disconnected — graph bypassed to uncalibrated baseline. Check PZT wiring."
                  : "Sensor degraded — readings may be unreliable. Inspect coupling."}
              </span>
            </div>
          </div>
        )}

        {/* dropdown */}
        <div>
          <label className="block font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim mb-1.5">
            {t("twin.pick")}
          </label>
          <select
            value={activeId}
            onChange={e => setActiveId(e.target.value)}
            className="w-full bg-scope border border-line px-3 py-2 font-mono text-[12px] text-paper
                       focus:outline-none focus:border-copperdim transition-colors"
          >
            {sensors.map(s => (
              <option key={s.id} value={s.id}>
                {s.id.replace(/_/g, "-")} · RMSD {s.rmsdPct.toFixed(2)}%
              </option>
            ))}
          </select>
        </div>

        {/* chart for active sensor */}
        <div className="border border-line overflow-hidden">
          <div
            className="px-3 py-1.5 border-b border-line font-mono text-[9.5px] uppercase
                       tracking-[0.16em] text-dim flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span>{reading.id.replace(/_/g, "-")}</span>
              <span className={cn(
                reading.damaged || reading.rmsdPct > readingSet.anomalyThresholdPct
                  ? "text-alarm" : "text-signal")}>
                {reading.damaged || reading.rmsdPct > readingSet.anomalyThresholdPct
                  ? "anomaly" : "healthy"}
              </span>
            </div>
            {/* v1.9.0 — dual-spectrum toggle */}
            <div className="flex items-center gap-1">
              {(["G", "B", "|Y|"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSpectrumType(type)}
                  className={cn(
                    "border px-2 py-0.5 font-mono text-[8.5px] uppercase transition-colors",
                    spectrumType === type
                      ? "border-copper bg-copper/12 text-copper"
                      : "border-line text-dim hover:text-mute hover:border-line2"
                  )}
                >
                  {type === "G" ? "Conductance G" : type === "B" ? "Susceptance B" : "|Y|"}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="scanlines pointer-events-none absolute inset-0 z-10" />
            <SensorChart reading={chartReading} threshold={readingSet.anomalyThresholdPct} spectrumType={spectrumType} />
          </div>
          <div className="grid grid-cols-3 divide-x divide-line border-t border-line font-mono text-[10px] text-dim">
            <div className="px-3 py-1.5">
              Fres <span className="text-paper">{reading.fresKHz.toFixed(1)} kHz</span>
            </div>
            <div className="px-3 py-1.5">
              RMSD <span className={cn(reading.damaged || reading.rmsdPct > readingSet.anomalyThresholdPct
                                         ? "text-alarmhi" : "text-signal")}>
                {reading.rmsdPct.toFixed(2)}%</span>
            </div>
            <div className="px-3 py-1.5">
              MPa est. <span className="text-paper">{activeStrength.est.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* forecast card */}
        <div className={cn(
          "panel panel-corner border px-4 py-4",
          certEligible ? "border-signaldeep/60 bg-signal/6" : "border-line bg-scope/20"
        )}>
          <div className="flex items-baseline justify-between flex-wrap gap-x-3 gap-y-2">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-copper">
                {t("pred.title")}
              </div>
              <div className="font-display font-bold text-2xl tabular-nums text-paper leading-tight">
                {certEligible
                  ? activeStrength.est.toFixed(1) + " MPa"
                  : `${Math.max(0, fcast.daysRemaining).toFixed(1)} ${t("pred.daysleft")}`}
              </div>
              <div className="font-mono text-[10px] text-mute mt-1">
                {certEligible
                  ? t("pred.achieved") + ` · ${t("pred.at")} ` + projectDateFmt
                  : t("pred.date") + " ≈ " + projectDateFmt}
              </div>
            </div>
            <div className="text-end">
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim">
                {t("pred.conf")}
              </div>
              <div className={cn("font-mono font-bold text-lg tabular-nums",
                fcast.grade === "HIGH" ? "text-signal"
                : fcast.grade === "MEDIUM" ? "text-copper" : "text-alarm")}>
                {fcast.confidencePct}%
              </div>
              <div className="font-mono text-[9px] text-dim">
                fc(t) = {calib.a.toFixed(2)}·ln(t) + {calib.b.toFixed(2)}
              </div>
            </div>
          </div>

          {/* progress bar to target */}
          <div className="mt-3">
            <div className="flex justify-between font-mono text-[9px] text-dim mb-1">
              <span>{t("pred.target")} {calib.targetMpa.toFixed(1)} MPa</span>
              <span className="tabular-nums">
                {Math.min(100, Math.max(0, (activeStrength.est / Math.max(1, calib.targetMpa)) * 100)).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-deep border border-line overflow-hidden">
              <div
                className={cn("h-full transition-all duration-700",
                  certEligible
                    ? "bg-gradient-to-r from-signaldeep to-signal"
                    : "bg-gradient-to-r from-copper/50 to-copper")}
                style={{ width: `${Math.min(100, (activeStrength.est / Math.max(1, calib.targetMpa)) * 100)}%` }}
              />
            </div>
            {/* target markers */}
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-dim">
              <span>0</span>
              <span>{calib.targetMpa.toFixed(0)} MPa · clearance</span>
            </div>
          </div>

          {/* certificate button */}
          <button
            onClick={certEligible ? () => { void handleCert(); } : undefined}
            disabled={!certEligible || certState !== "idle"}
            className={cn(
              "mt-4 w-full flex items-center justify-center gap-2 border px-4 py-2.5 font-mono",
              "text-[11px] uppercase tracking-[0.16em] transition-all duration-300",
              certEligible
                ? "border-signaldeep bg-signal/10 text-state text-signal hover:bg-signal/20 " +
                  "shadow-[0_0_18px_rgba(143,214,148,0.22)] animate-pulse"
                : "border-line2 text-dim/70 bg-scope/30 cursor-not-allowed"
            )}
          >
            {certState === "working" ? (
              <>
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="8" r="6" strokeDasharray="6 6" />
                </svg>
                {t("cert.working")}
              </>
            ) : certState === "done" ? (
              <>
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" />
                </svg>
                {t("cert.done")}
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="2" width="10" height="12" rx="1"/>
                  <path d="M5.5 6h5M5.5 9h5"/>
                  <path d="M5.5 12.5h2.5"/>
                </svg>
                {t("cert.generate")}
              </>
            )}
          </button>
          <div className="mt-2 font-mono text-[9px] text-dim text-center">
            {certEligible
              ? t("cert.ready")
              : `${t("cert.notyet")} — ${t("pred.target")} ≥ ${(activeStrength.est).toFixed(1)} MPa / ${calib.targetMpa.toFixed(1)} MPa`}
          </div>
        </div>

        {/* plowman curve mini chart */}
        <StrengthCurvePanel calib={calib} ageNow={activeStrength.ageDays} estNow={activeStrength.est} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  4 · maturity curve with forecast overlay                          */
/* ------------------------------------------------------------------ */

function StrengthCurvePanel({
  calib, ageNow, estNow,
}: { calib: CalibrationModel; ageNow: number; estNow: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const padL = 44, padR = 42, padT = 14, padB = 24;
    const pw = W - padL - padR, ph = H - padT - padB;
    const tMax = Math.max(calib.targetMpa, estNow, plowmanStrength(ageNow, calib)) * 1.28;
    const maxDay = Math.max(28, ageNow * 1.4);
    const x = (d: number) => padL + (d / maxDay) * pw;
    const y = (mpa: number) => padT + (1 - mpa / tMax) * ph;

    // graticule
    ctx.strokeStyle = "rgba(143,214,148,0.08)";
    ctx.lineWidth = 1;
    ctx.font = "8.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(143,160,147,0.62)";
    for (let i = 0; i <= 3; i++) {
      const gy = y((tMax / 3) * i);
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(W - padR, gy); ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(String(Math.round((tMax / 3) * i)), padL - 5, gy + 3);
    }
    [7, 14, 21, 28].forEach(d => {
      if (d > maxDay) return;
      const gx = x(d);
      ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, H - padB); ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText(`${d}d`, gx, H - 6);
    });

    // target line
    const ty = y(calib.targetMpa);
    ctx.strokeStyle = "rgba(222,154,60,0.55)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(padL, ty); ctx.lineTo(W - padR, ty); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(222,154,60,0.9)";
    ctx.textAlign = "left";
    ctx.fillText(`target ${calib.targetMpa.toFixed(1)} MPa`, padL + 4, ty - 4);

    // plowman curve (fitted)
    ctx.strokeStyle = "#8fd694";
    ctx.lineWidth = 1.8;
    ctx.shadowColor = "rgba(143,214,148,0.55)";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const d = 0.05 + (i / 120) * maxDay;
      const mpa = plowmanStrength(d, { a: calib.a, b: calib.b });
      if (i === 0) ctx.moveTo(x(d), y(mpa));
      else ctx.lineTo(x(d), y(mpa));
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // calibration points (real cube crushes)
    if (calib.points.length > 0) {
      ctx.fillStyle = "#de9a3c";
      ctx.strokeStyle = "#f2b866";
      for (const p of calib.points) {
        ctx.beginPath();
        ctx.arc(x(p.day), y(p.mpa), 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // now marker (current estimate)
    ctx.strokeStyle = "#ff7a5c";
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(x(ageNow), padT); ctx.lineTo(x(ageNow), H - padB); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ff7a5c";
    ctx.beginPath(); ctx.arc(x(ageNow), y(estNow), 3.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x(ageNow), y(estNow), 7.2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,122,92,0.5)"; ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillText(`now · ${estNow.toFixed(1)} MPa`, Math.min(x(ageNow) + 9, W - padR - 54), y(estNow) - 6);
  });

  return (
    <div className="border border-line overflow-hidden">
      <div className="px-3 py-1.5 border-b border-line font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim">
        maturity curve fc(t) — regression fit · forecast + target
      </div>
      <canvas ref={ref} className="block w-full h-[188px] bg-scope" />
    </div>
  );
}
