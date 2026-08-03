/* ------------------------------------------------------------------ *
 *  AIDiagnosticDeck.tsx — smartLAB AI Diagnostic Deck
 *
 *  Sub-systems rendered here:
 *    1. Predictive Compressive Strength Regressor (arc-gauge + timeline)
 *    2. Structural Adulteration & Mix Fraud spectral filter
 *    3. PZT Thermal Self-Health DC Bias dashboard
 *    4. ASCII Hardware Interface & Pin Assignment collapsible panel
 * ------------------------------------------------------------------ */

import { useEffect, useRef, useState } from "react";
import type { NodeSim } from "../sim";
import { SWEEP_STEPS } from "../sim";
import { Led } from "../ui";
import { cn } from "../utils/cn";

/* ── shared canvas helper ─────────────────────────────────────── */
function fitCv(cv: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
  }
  const ctx = cv.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}


/* ================================================================ *
 *  1. PREDICTIVE MPa GAUGE — arc gauge + drift timeline
 * ================================================================ */
function PredictiveArcGauge({ sim }: { sim: NodeSim }) {
  const arcRef  = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<HTMLCanvasElement>(null);

  /* Arc gauge */
  useEffect(() => {
    const cv = arcRef.current;
    if (!cv) return;
    const ctx = fitCv(cv);
    if (!ctx) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    const cx = W / 2;
    const cy = H * 0.62;
    const R  = Math.min(W, H) * 0.41;
    const START = Math.PI * 0.75;
    const SWEEP = Math.PI * 1.5;
    const MAX_MPA = 80;

    ctx.clearRect(0, 0, W, H);

    /* Track */
    ctx.beginPath();
    ctx.arc(cx, cy, R, START, START + SWEEP);
    ctx.strokeStyle = "rgba(143,214,148,0.09)";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.stroke();

    /* CI band (shaded arc) */
    const lowFrac  = clamp01((sim.predDay28MPa - sim.predCI) / MAX_MPA);
    const highFrac = clamp01((sim.predDay28MPa + sim.predCI) / MAX_MPA);
    ctx.beginPath();
    ctx.arc(cx, cy, R, START + lowFrac * SWEEP, START + highFrac * SWEEP);
    ctx.strokeStyle = "rgba(222,154,60,0.22)";
    ctx.lineWidth = 14;
    ctx.stroke();

    /* Value arc */
    const pct = clamp01(sim.predDay28MPa / MAX_MPA);
    const grad = null; // conical gradient reserved for future canvas API support
    ctx.beginPath();
    ctx.arc(cx, cy, R, START, START + pct * SWEEP);
    ctx.strokeStyle = sim.mixAdulterationDetected ? "#e4593c" : "#de9a3c";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.shadowColor = sim.mixAdulterationDetected ? "#e4593c" : "#f2b866";
    ctx.shadowBlur  = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (grad) ctx.stroke();

    /* Tick marks every 10 MPa */
    ctx.strokeStyle = "rgba(143,160,147,0.35)";
    ctx.lineWidth = 1.5;
    for (let v = 0; v <= MAX_MPA; v += 10) {
      const a = START + (v / MAX_MPA) * SWEEP;
      ctx.beginPath();
      ctx.moveTo(cx + (R - 9) * Math.cos(a),  cy + (R - 9) * Math.sin(a));
      ctx.lineTo(cx + (R + 9) * Math.cos(a),  cy + (R + 9) * Math.sin(a));
      ctx.stroke();
    }

    /* Needle dot */
    const needleA = START + pct * SWEEP;
    ctx.beginPath();
    ctx.arc(cx + R * Math.cos(needleA), cy + R * Math.sin(needleA), 5.5, 0, Math.PI * 2);
    ctx.fillStyle = sim.mixAdulterationDetected ? "#ff7a5c" : "#f2b866";
    ctx.fill();

    /* Centre text */
    ctx.textAlign = "center";
    ctx.font = "700 28px 'Chakra Petch', sans-serif";
    ctx.fillStyle = "#e9e4d4";
    ctx.fillText(`${sim.predDay28MPa.toFixed(1)}`, cx, cy - 6);
    ctx.font = "500 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#8fa093";
    ctx.fillText("MPa est. Day 28", cx, cy + 13);
    ctx.font = "500 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#de9a3c";
    ctx.fillText(`± ${sim.predCI.toFixed(2)} MPa`, cx, cy + 30);

    /* Conf label */
    ctx.font = "600 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = sim.predConfidence >= 95 ? "#8fd694" : "#de9a3c";
    ctx.fillText(`${sim.predConfidence.toFixed(1)} % confidence`, cx, cy + 47);

    /* Axis labels */
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(143,160,147,0.55)";
    ctx.textAlign = "center";
    ctx.fillText("0", cx + (R + 18) * Math.cos(START), cy + (R + 18) * Math.sin(START) + 3);
    ctx.fillText("80", cx + (R + 18) * Math.cos(START + SWEEP), cy + (R + 18) * Math.sin(START + SWEEP) + 3);
  });

  /* Drift derivative timeline */
  useEffect(() => {
    const cv = timeRef.current;
    if (!cv) return;
    const ctx = fitCv(cv);
    if (!ctx) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    const pts = sim.fResHistory;

    ctx.clearRect(0, 0, W, H);
    if (pts.length < 2) {
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(143,160,147,0.5)";
      ctx.fillText("early-age drift data accumulating…", 8, H / 2 + 3);
      return;
    }

    const dayMin = pts[0].day;
    const dayMax = Math.max(pts[pts.length - 1].day, dayMin + 0.01);
    const fMin   = Math.min(...pts.map(p => p.fRes));
    const fMax   = Math.max(...pts.map(p => p.fRes));
    const pad    = 10;
    const xOf    = (d: number) => pad + ((d - dayMin) / (dayMax - dayMin)) * (W - pad * 2);
    const yOf    = (f: number) => H - pad - ((f - fMin) / Math.max(fMax - fMin, 0.01)) * (H - pad * 2);

    /* Gradient fill */
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(222,154,60,0.2)");
    grad.addColorStop(1, "rgba(222,154,60,0.01)");
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(xOf(p.day), yOf(p.fRes)) : ctx.lineTo(xOf(p.day), yOf(p.fRes)));
    ctx.lineTo(xOf(pts[pts.length - 1].day), H - pad);
    ctx.lineTo(xOf(pts[0].day), H - pad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    /* Line */
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(xOf(p.day), yOf(p.fRes)) : ctx.lineTo(xOf(p.day), yOf(p.fRes)));
    ctx.strokeStyle = "#de9a3c";
    ctx.lineWidth = 1.6;
    ctx.shadowColor = "rgba(222,154,60,0.55)";
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* Annotations */
    ctx.font = "8.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(143,160,147,0.65)";
    ctx.fillText(`D${pts[0].day.toFixed(2)}`, xOf(pts[0].day) + 1, H - 1);
    ctx.fillText(`D${pts[pts.length - 1].day.toFixed(2)}`, Math.min(xOf(pts[pts.length - 1].day) - 32, W - 38), H - 1);
    ctx.fillStyle = "rgba(222,154,60,0.9)";
    ctx.fillText(`∂F/∂t ${sim.impedanceDriftRate > 0 ? "+" : ""}${sim.impedanceDriftRate.toFixed(3)} kHz/day`, 6, 10);
  });

  return (
    <div className="space-y-2">
      <canvas ref={arcRef}  className="block w-full h-[196px] bg-scope" />
      <div className="border border-line overflow-hidden">
        <div className="px-2.5 py-1 border-b border-line font-mono text-[9px] uppercase tracking-[0.16em] text-dim">
          Early-age F<sub>res</sub> drift — 3-day regressor window
        </div>
        <canvas ref={timeRef} className="block w-full h-[72px] bg-scope/70" />
      </div>
      <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
        <div className="border border-line px-2 py-1.5 text-dim">
          obs. <span className="text-paper tabular-nums">{sim.fResHistory.length}</span>
        </div>
        <div className="border border-line px-2 py-1.5 text-dim">
          drift <span className="text-copper tabular-nums">{sim.impedanceDriftRate.toFixed(3)}</span> kHz/d
        </div>
        <div className="border border-line px-2 py-1.5 text-dim col-span-2">
          model: f<sub>c,28</sub> = Plowman(28)·κ·(1+α·∂F/∂t/F₀) · CI shrinks exp(−0.08·n)
        </div>
      </div>
    </div>
  );
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ================================================================ *
 *  2. MIX ADULTERATION SPECTRAL FILTER — envelope comparison canvas
 * ================================================================ */
function MixEnvelopeCanvas({ sim }: { sim: NodeSim }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const isAdult = sim.mixAdulterationDetected;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = fitCv(cv);
    if (!ctx) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    const padL = 30; const padR = 8; const padT = 12; const padB = 20;
    const pw = W - padL - padR;
    const ph = H - padT - padB;
    const YMAX = 1100;
    const xOf = (i: number) => padL + (i / (SWEEP_STEPS - 1)) * pw;
    const yOf = (c: number) => padT + (1 - Math.min(c, YMAX) / YMAX) * ph;

    ctx.clearRect(0, 0, W, H);

    /* Graticule */
    ctx.strokeStyle = "rgba(143,214,148,0.07)";
    ctx.lineWidth = 1;
    ctx.font = "8.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(143,160,147,0.6)";
    for (let c = 0; c <= YMAX; c += 275) {
      const gy = yOf(c);
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(W - padR, gy); ctx.stroke();
      ctx.fillText(String(c), 2, gy + 3);
    }
    [1, 10, 50, 100, 200, 500].forEach(f => {
      const ix = (Math.log(f) / Math.log(500)) * (SWEEP_STEPS - 1);
      const gx = xOf(ix);
      ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, H - padB); ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText(`${f}k`, gx, H - 5);
      ctx.textAlign = "left";
    });

    /* Design envelope (master reference) */
    if (sim.mixDesignEnvelope.length === SWEEP_STEPS) {
      ctx.strokeStyle = "rgba(127,184,164,0.55)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      sim.mixDesignEnvelope.forEach((v, i) =>
        i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v))
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    /* Live conductance envelope */
    const liveTrace = sim.prevTrace.length === SWEEP_STEPS ? sim.prevTrace : sim.baseline;
    const liveColor = isAdult ? "rgba(228,89,60,0.85)" : "rgba(222,154,60,0.82)";
    ctx.strokeStyle = liveColor;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = liveColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    liveTrace.forEach((v, i) => i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v)));
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* Deviation fill between envelopes */
    if (sim.mixDesignEnvelope.length === SWEEP_STEPS) {
      ctx.beginPath();
      sim.mixDesignEnvelope.forEach((v, i) => i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v)));
      liveTrace.slice().reverse().forEach((v, ri) => {
        const i = SWEEP_STEPS - 1 - ri;
        ctx.lineTo(xOf(i), yOf(v));
      });
      ctx.closePath();
      ctx.fillStyle = isAdult ? "rgba(228,89,60,0.09)" : "rgba(222,154,60,0.06)";
      ctx.fill();
    }

    /* CRF deviation marker */
    if (Math.abs(sim.crfDeviation) > 0.5) {
      ctx.font = "700 9.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = isAdult ? "#ff7a5c" : "#de9a3c";
      ctx.fillText(`ΔCRF ${sim.crfDeviation > 0 ? "+" : ""}${sim.crfDeviation.toFixed(1)} kHz`, padL + 4, padT + 11);
    }

    /* Legend */
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.strokeStyle = "rgba(127,184,164,0.55)"; ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.moveTo(W - 118, padT + 7); ctx.lineTo(W - 96, padT + 7); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(127,184,164,0.75)";
    ctx.fillText("design", W - 93, padT + 11);
    ctx.strokeStyle = liveColor; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(W - 118, padT + 20); ctx.lineTo(W - 96, padT + 20); ctx.stroke();
    ctx.fillStyle = liveColor;
    ctx.fillText("live", W - 93, padT + 24);
  });

  return <canvas ref={ref} className="block w-full h-[196px] bg-scope" />;
}

/* Per-bin deviation sparkline */
function DeviationBar({ diff }: { diff: number[] }) {
  if (diff.length === 0) return null;
  const bins = 32;
  const step = Math.floor(diff.length / bins);
  const buckets = Array.from({ length: bins }, (_, b) => {
    const slice = diff.slice(b * step, (b + 1) * step);
    return slice.reduce((s, v) => s + v, 0) / (slice.length || 1);
  });
  const absMax = Math.max(...buckets.map(Math.abs), 0.01);
  return (
    <div className="flex items-end gap-px h-[28px]" aria-label="Spectral deviation from design baseline">
      {buckets.map((v, i) => (
        <div
          key={i}
          className="flex-1 min-w-0"
          style={{
            height: `${Math.max(2, Math.abs(v / absMax) * 100)}%`,
            background: v < -0.08 ? "rgba(228,89,60,0.75)" : v > 0.08 ? "rgba(143,214,148,0.5)" : "rgba(222,154,60,0.4)",
          }}
        />
      ))}
    </div>
  );
}

/* ================================================================ *
 *  3. PZT SELF-HEALTH — segmented bar + capacitance sparkline
 * ================================================================ */
function SelfHealthPanel({ sim }: { sim: NodeSim }) {
  const sparkRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    historyRef.current.push(sim.pztCapacitanceNF);
    if (historyRef.current.length > 80) historyRef.current.shift();
    const cv = sparkRef.current;
    if (!cv) return;
    const ctx = fitCv(cv);
    if (!ctx) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    const pts = historyRef.current;
    ctx.clearRect(0, 0, W, H);
    if (pts.length < 2) return;
    const vMin = 11.5; const vMax = 12.6;
    const x = (i: number) => (i / (pts.length - 1)) * W;
    const y = (v: number) => H - ((v - vMin) / (vMax - vMin)) * H;

    /* Nominal 12.0 nF line */
    ctx.strokeStyle = "rgba(143,214,148,0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(0, y(12.0)); ctx.lineTo(W, y(12.0)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(143,214,148,0.55)";
    ctx.fillText("12.0 nF", W - 38, y(12.0) - 2);

    /* Capacitance line */
    ctx.strokeStyle = "#7fb8a4";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(127,184,164,0.5)";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    pts.forEach((v, i) => i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v)));
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  const score      = sim.pztSelfHealthScore;
  const segments   = 20;
  const lit        = Math.round((score / 100) * segments);
  const segTone    = sim.dcBiasPulseActive
    ? "#de9a3c"
    : score >= 90 ? "#8fd694" : score >= 70 ? "#de9a3c" : "#e4593c";
  const pulsePhase = sim.dcBiasPulseActive ? (sim.dcBiasDurationMs / 1800) : 0;

  return (
    <div className="space-y-3">
      <div className="border border-line bg-scope/60 px-3.5 py-3.5 space-y-3">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-dim uppercase tracking-[0.15em]">Sensor Self-Health</span>
          <span className={cn(
            "font-semibold",
            sim.dcBiasPulseActive ? "text-copper" : score >= 90 ? "text-signal" : "text-alarm"
          )}>
            {sim.dcBiasPulseActive ? "Stabilizing…" : `${score}% Core Stabilized`}
          </span>
        </div>
        {/* Segmented health bar */}
        <div className="flex gap-[2px]">
          {Array.from({ length: segments }, (_, i) => (
            <div
              key={i}
              className="flex-1 h-[18px] transition-all duration-200"
              style={{
                background: i < lit
                  ? segTone
                  : "rgba(38,51,41,0.7)",
                opacity: sim.dcBiasPulseActive && i === lit - 1 ? 0.5 + 0.5 * Math.sin(pulsePhase * Math.PI * 16) : 1,
              }}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-x-3 gap-y-1 font-mono text-[10px]">
          <div className="text-dim col-span-2">
            Capacitance C<sub>s</sub>
          </div>
          <div className="text-paper tabular-nums text-right">
            {sim.pztCapacitanceNF.toFixed(3)} nF
          </div>
          <div className="text-dim col-span-2">Moisture index</div>
          <div className={cn("tabular-nums text-right", sim.pztMoistureIndex > 0.4 ? "text-alarm" : "text-mute")}>
            {(sim.pztMoistureIndex * 100).toFixed(1)} %
          </div>
          <div className="text-dim col-span-2">Bias pulse cycles</div>
          <div className="text-paper tabular-nums text-right">{sim.dcBiasCycles}</div>
          <div className="text-dim col-span-2">GPIO25 state</div>
          <div className={cn("text-right", sim.dcBiasPulseActive ? "text-copper" : "text-signal")}>
            {sim.dcBiasPulseActive ? "BIASING" : "IDLE"}
          </div>
        </div>
      </div>
      {/* Capacitance sparkline */}
      <div className="border border-line overflow-hidden">
        <div className="px-2.5 py-1 border-b border-line font-mono text-[9px] uppercase tracking-[0.14em] text-dim">
          C<sub>s</sub> drift [nF] — 80-point history
        </div>
        <canvas ref={sparkRef} className="block w-full h-[58px] bg-scope/70" />
      </div>
      <button
        onClick={() => sim.runDCBiasThermalHealthCheck()}
        disabled={sim.dcBiasPulseActive}
        className={cn(
          "w-full border px-3 py-2.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-all duration-200 active:translate-y-px disabled:opacity-40 disabled:pointer-events-none",
          sim.dcBiasPulseActive
            ? "border-copper bg-copper/15 text-copper"
            : "border-line2 text-mute hover:text-paper hover:border-copperdim"
        )}
      >
        {sim.dcBiasPulseActive
          ? `Stabilizing — ${Math.round((sim.dcBiasDurationMs / 1800) * 100)}%`
          : "Trigger GPIO25 DC Bias Pre-scan"}
      </button>
    </div>
  );
}

/* ================================================================ *
 *  4. ASCII HARDWARE INTERFACE & PIN ASSIGNMENT
 * ================================================================ */
const ASCII_SCHEMATIC = `
  ESP32-WROOM-32 · smartLAB SHM Node · pzt_emi_monitor v1.9.0
  ┌─────────────────────────────────────────────────────────┐
  │  GPIO36 ──────── ADC1_CH0 ─────────────┬── PZT_SENSE   │
  │  (INPUT)          12-bit               │               │
  │                   11 dB attn.          │  Voltage       │
  │  GPIO25 ────── LEDC0 PWM ──── Rs 1k0 ──┤  Divider      │
  │  (OUTPUT)      1–500 kHz               │  Tap (Vp)     │
  │                50% duty                │               │
  │                band-adaptive res.      └── PZT Patch   │
  │                                             │           │
  │  GPIO2  ────── LED_LINK (heartbeat)      GND (AGND)    │
  │  (OUTPUT)      600 ms ACTIVE                            │
  │                150 ms LINKING                           │
  │                                                         │
  │  GPIO4  ────── LED_FAULT (CRUSH latch)                  │
  │  (OUTPUT)      solid ON after crush event               │
  │                                                         │
  │  GND    ────── AGND ─── Rs return ─── PZT shield       │
  │  3V3    ────── VREF ─── ADC ref  ─── LEDC rail         │
  └─────────────────────────────────────────────────────────┘
  ADC burst: 200 samples × 12 µs ≈ 83 kS/s per dwell
  Sweep:     96 log-spaced dwells, 3 ms each → ~288 ms/scan
  Telemetry: HTTPS POST @ 1 Hz → https://fimtosoft.com
  Backoff:   1s → 2s → 4s → 8s, 4-frame IndexedDB spool
`.trimStart();

const PIN_ROWS: { pin: string; net: string; dir: string; spec: string; tone: string }[] = [
  { pin: "GPIO36", net: "PZT_SENSE",  dir: "IN",  spec: "ADC1_CH0 · 12-bit · 11 dB · burst 200×12 µs", tone: "text-teal" },
  { pin: "GPIO25", net: "EXCITE",     dir: "OUT", spec: "LEDC ch.0 · log-sweep 1–500 kHz · 50% duty · adaptive resolution", tone: "text-copper" },
  { pin: "GPIO2",  net: "LED_LINK",   dir: "OUT", spec: "heartbeat · 600 ms ACTIVE · 150 ms LINKING", tone: "text-signal" },
  { pin: "GPIO4",  net: "LED_FAULT",  dir: "OUT", spec: "CRUSH latch indicator · solid ON until serial 'r' reset", tone: "text-alarm" },
  { pin: "GND",    net: "AGND",       dir: "—",   spec: "star-point · coax shield + Rs return · single land", tone: "text-dim" },
  { pin: "3V3",    net: "VREF",       dir: "—",   spec: "ADC reference rail · LEDC swing · eFuse Vref calibration advised", tone: "text-dim" },
];

function ASCIISchematicPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel panel-corner overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-raise/50 transition-colors text-left"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-copper shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="4" width="7" height="7" rx="1" />
          <rect x="13" y="4" width="7" height="7" rx="1" />
          <rect x="4" y="13" width="7" height="7" rx="1" />
          <path d="M13 17h7M17 13v7" />
        </svg>
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-paper">
          Hardware Interface &amp; Pin Assignment · ESP32-WROOM-32
        </span>
        <span className="ml-auto font-mono text-[10px] text-dim">
          {open ? "collapse ▲" : "expand ▼"}
        </span>
      </button>
      {open && (
        <div className="border-t border-line">
          {/* ASCII schematic */}
          <div className="overflow-x-auto bg-scope/80">
            <pre className="px-4 py-4 font-mono text-[11.5px] leading-[1.72] text-signal/85 whitespace-pre select-all">
              {ASCII_SCHEMATIC}
            </pre>
          </div>
          {/* Pin table */}
          <div className="border-t border-line overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-line font-mono text-[9.5px] tracking-[0.2em] uppercase text-dim">
                  <th className="px-4 py-2 font-medium w-[76px]">Pin</th>
                  <th className="px-3 py-2 font-medium w-[108px]">Net</th>
                  <th className="px-3 py-2 font-medium w-[50px]">Dir</th>
                  <th className="px-4 py-2 font-medium">Specification</th>
                </tr>
              </thead>
              <tbody>
                {PIN_ROWS.map(r => (
                  <tr key={r.pin} className="border-b border-line/50 last:border-0 hover:bg-raise/50 transition-colors">
                    <td className={cn("px-4 py-2.5 font-mono text-[12px] font-semibold whitespace-nowrap", r.tone)}>
                      {r.pin}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-copper whitespace-nowrap">{r.net}</td>
                    <td className="px-3 py-2.5 font-mono text-[10.5px] text-dim">{r.dir}</td>
                    <td className="px-4 py-2.5 font-body text-[11.5px] text-mute leading-snug">{r.spec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-line font-mono text-[10px] text-dim flex flex-wrap gap-x-6 gap-y-1">
            <span>sensing topology: single-supply voltage divider</span>
            <span>Rs = 1 kΩ ±0.1 % metal-film</span>
            <span>V<sub>exc</sub> = 3.3 V rail-to-rail</span>
            <span>ADC resolution: 12-bit, 4096 levels</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ *
 *  MASTER DECK LAYOUT
 * ================================================================ */
export default function AIDiagnosticDeck({ sim }: { sim: NodeSim }) {
  const isAdult  = sim.mixAdulterationDetected;
  const isCrush  = sim.status === "CRUSHED";
  const hasAlert = isAdult || isCrush;
  const certTone = sim.certification === "MIX_HAZARD"
    ? "text-alarmhi"
    : sim.certification === "CERTIFIED"
    ? "text-signal"
    : "text-copper";

  return (
    <section className={cn("panel panel-corner overflow-hidden transition-colors duration-500", hasAlert && "border-alarm/50")}
      aria-label="smartLAB AI Diagnostic Deck">

      {/* ── master header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 border-b border-line bg-raise/40">
        <div className="flex items-center gap-2.5">
          <Led tone={hasAlert ? "alarm" : "copper"} />
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-paper">
            smartLAB AI Diagnostic Deck
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
          predictive regressor · mix fraud filter · pzt self-health
        </span>
        <div className="ml-auto flex items-center gap-3 font-mono text-[10px]">
          <span className="text-dim">cert:</span>
          <span className={certTone}>
            {sim.certification.replace("_", " ").toLowerCase()}
          </span>
          <span className="text-dim">model: ASTM C1074</span>
        </div>
      </div>

      {/* ── three-column body ────────────────────────────────────── */}
      <div className="grid gap-0 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-line">

        {/* col 1: Predictive MPa Regressor */}
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] px-1.5 py-0.5 border border-copperdim text-copper uppercase">§1</span>
            <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-copper">
              Predictive Compressive Strength
            </span>
          </div>
          <p className="font-body text-[11.5px] leading-relaxed text-mute mb-4">
            Non-linear regressor tracks ∂F<sub>res</sub>/∂t impedance drift during Days 1–3,
            projects asymptotic Day-28 f<sub>c</sub> via Plowman maturity law
            and a data-density shrinking CI: <span className="text-paper font-mono">σ_CI = 2.8·e<sup>−0.08n</sup> + 0.9</span>.
          </p>
          <PredictiveArcGauge sim={sim} />
        </div>

        {/* col 2: Mix Fraud Detector */}
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("font-mono text-[10px] px-1.5 py-0.5 border uppercase", isAdult ? "border-alarm text-alarmhi" : "border-copperdim text-copper")}>§2</span>
            <span className={cn("font-mono text-[10.5px] tracking-[0.16em] uppercase", isAdult ? "text-alarmhi" : "text-copper")}>
              {isAdult ? "MIX_ADULTERATION_DETECTED" : "Spectral Mix Fraud Filter"}
            </span>
          </div>
          <p className="font-body text-[11.5px] leading-relaxed text-mute mb-3">
            Spectral filter compares live conductance envelope against the Day-1 design baseline.
            High W/C ratio dampens peak amplitude and shifts the resonant frequency
            (Conductance Resonance Frequency deviation, CRF Δ).
          </p>
          {/* Live status badge */}
          <div className={cn(
            "flex items-center gap-2.5 border px-3.5 py-2.5 mb-3 transition-colors duration-300",
            isAdult ? "border-alarm/60 bg-alarm/8" : "border-signaldeep bg-signal/5"
          )}>
            <Led tone={isAdult ? "alarm" : "signal"} size={9} live={true} />
            <div>
              <div className={cn("font-mono text-[11px] font-semibold tracking-wide uppercase", isAdult ? "text-alarmhi" : "text-signal")}>
                {isAdult ? "MIX_ADULTERATION_DETECTED" : "Nominal Mix — CLEAR"}
              </div>
              <div className="font-mono text-[10px] text-dim mt-0.5">
                W/C: <span className={isAdult ? "text-alarmhi" : "text-mute"}>{sim.waterCementRatio.toFixed(2)}</span>
                {" · "}damp: <span className={isAdult ? "text-alarmhi" : "text-mute"}>{sim.dampeningCoeff.toFixed(2)}</span>
                {" · "}skew: <span className={isAdult ? "text-alarmhi" : "text-mute"}>{sim.skewnessIndex.toFixed(2)}</span>
                {" · "}CRF Δ: <span className="text-mute">{sim.crfDeviation.toFixed(1)} kHz</span>
              </div>
            </div>
          </div>
          {/* Spectral envelope canvas */}
          <div className="border border-line mb-3 overflow-hidden">
            <div className="px-2.5 py-1 border-b border-line font-mono text-[9px] uppercase tracking-[0.15em] text-dim">
              G [counts] — live vs design envelope · 1–500 kHz
            </div>
            <MixEnvelopeCanvas sim={sim} />
          </div>
          {/* Deviation sparkbar */}
          <div className="border border-line px-2.5 py-2 mb-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-dim mb-1.5">
              Per-bin deviation ΔG/G
            </div>
            <DeviationBar diff={sim.mixEnvelopeDiff} />
          </div>
          <button
            onClick={() => isAdult ? sim.runNormalCuring() : sim.runMixAdulterationMode()}
            className={cn(
              "w-full border px-3 py-2.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-all duration-200 active:translate-y-px",
              isAdult
                ? "border-signaldeep bg-signal/8 text-signal hover:bg-signal/16"
                : "border-alarm/60 bg-alarm/8 text-alarmhi hover:bg-alarm/16"
            )}
          >
            {isAdult ? "Clear — restore nominal mix design" : "Inject Mix Fraud (W/C 0.68)"}
          </button>
        </div>

        {/* col 3: PZT Self-Health + ASCII schematic stub */}
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] px-1.5 py-0.5 border border-copperdim text-copper uppercase">§3</span>
            <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-copper">
              PZT Thermal Self-Health
            </span>
          </div>
          <p className="font-body text-[11.5px] leading-relaxed text-mute mb-4">
            GPIO25 DC Bias pre-scan pulse drives micro-thermal actuation
            to stabilize PZT shell boundary moisture.
            Self-capacitance C<sub>s</sub> targets 12.00 nF nominal.
          </p>
          <SelfHealthPanel sim={sim} />
        </div>
      </div>

      {/* ── ASCII hardware panel ─────────────────────────────────── */}
      <div className="border-t border-line">
        <ASCIISchematicPanel />
      </div>
    </section>
  );
}
