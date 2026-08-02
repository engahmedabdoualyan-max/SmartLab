import { useEffect, useRef } from "react";
import type { NodeSim } from "../sim";
import { SWEEP_STEPS, CRUSH_SPIKE, fmtNum } from "../sim";
import { Led } from "../ui";
import { cn } from "../utils/cn";

/* ── canvas helpers ────────────────────────────────────────────── */
function fitCanvas(cv: HTMLCanvasElement): CanvasRenderingContext2D | null {
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

const X_TICKS = [1, 5, 10, 50, 100, 500];
const idxForKHz = (f: number) =>
  (Math.log(f) / Math.log(500)) * (SWEEP_STEPS - 1);

/* ── EMI signature scope ───────────────────────────────────────── */
function SignatureScope({ sim }: { sim: NodeSim }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = fitCanvas(cv);
    if (!ctx) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    const padL = 34;
    const padR = 10;
    const padT = 12;
    const padB = 22;
    const pw = W - padL - padR;
    const ph = H - padT - padB;
    const YMAX = 1500;
    const x = (i: number) => padL + (i / (SWEEP_STEPS - 1)) * pw;
    const y = (c: number) => padT + (1 - Math.min(c, YMAX) / YMAX) * ph;

    ctx.clearRect(0, 0, W, H);

    /* graticule */
    ctx.strokeStyle = "rgba(143,214,148,0.09)";
    ctx.lineWidth = 1;
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(143,160,147,0.65)";
    for (let c = 0; c <= YMAX; c += 300) {
      ctx.beginPath();
      ctx.moveTo(padL, y(c));
      ctx.lineTo(W - padR, y(c));
      ctx.stroke();
      ctx.fillText(String(c), 4, y(c) + 3);
    }
    ctx.textAlign = "center";
    for (const f of X_TICKS) {
      const tx = x(idxForKHz(f));
      ctx.beginPath();
      ctx.moveTo(tx, padT);
      ctx.lineTo(tx, H - padB);
      ctx.stroke();
      ctx.fillText(f >= 100 ? `${f / 1}k` : `${f}k`, tx, H - 9);
    }
    ctx.textAlign = "left";

    /* crush threshold */
    ctx.strokeStyle = "rgba(228,89,60,0.55)";
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(padL, y(CRUSH_SPIKE));
    ctx.lineTo(W - padR, y(CRUSH_SPIKE));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(228,89,60,0.9)";
    ctx.fillText("CRUSH ≥ 950", padL + 4, y(CRUSH_SPIKE) - 4);

    const strokeTrace = (
      arr: number[],
      upto: number,
      color: string,
      width: number,
      glow: number
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < upto; i++) {
        if (i === 0) {
          ctx.moveTo(x(i), y(arr[i]));
          started = true;
        } else ctx.lineTo(x(i), y(arr[i]));
      }
      if (started) ctx.stroke();
      ctx.shadowBlur = 0;
    };

    /* baseline ghost */
    ctx.strokeStyle = "rgba(143,160,147,0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    sim.baseline.forEach((v, i) =>
      i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))
    );
    ctx.stroke();
    ctx.setLineDash([]);

    if (sim.signalOpen) {
      /* flatline with micro-jitter */
      ctx.strokeStyle = "rgba(228,89,60,0.9)";
      ctx.lineWidth = 1.6;
      ctx.shadowColor = "rgba(228,89,60,0.8)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let i = 0; i < SWEEP_STEPS; i++) {
        const v = 4 + Math.sin(i * 7.3) * 2 + (Math.random() - 0.5) * 3;
        if (i === 0) ctx.moveTo(x(i), y(v));
        else ctx.lineTo(x(i), y(v));
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(228,89,60,0.95)";
      ctx.font = "600 11px 'JetBrains Mono', monospace";
      ctx.fillText(
        sim.status === "CRUSHED"
          ? "SIGNAL LOST — COLLAPSE LATCHED / PZT DEBONDED"
          : "SIGNAL LOST — PHYSICAL DISCONNECTION / TAMPER",
        padL + 4,
        padT + 16
      );
    } else {
      /* last completed sweep */
      strokeTrace(sim.prevTrace, SWEEP_STEPS, "rgba(143,214,148,0.42)", 1.2, 0);
      /* sweep in progress */
      strokeTrace(
        sim.trace,
        Math.max(sim.sweepIdx, 1),
        "#de9a3c",
        1.8,
        9
      );
      /* sweep cursor */
      const cx = x(Math.min(sim.sweepIdx, SWEEP_STEPS - 1));
      ctx.strokeStyle = "rgba(222,154,60,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, padT);
      ctx.lineTo(cx, H - padB);
      ctx.stroke();

      /* resonance marker on completed sweep */
      let bi = 0;
      for (let i = 1; i < SWEEP_STEPS; i++)
        if (sim.prevTrace[i] > sim.prevTrace[bi]) bi = i;
      const px = x(bi);
      const py = y(sim.prevTrace[bi]);
      ctx.strokeStyle = "rgba(143,214,148,0.8)";
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, H - padB);
      ctx.stroke();
      ctx.fillStyle = "#b8ecbb";
      ctx.beginPath();
      ctx.arc(px, py, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`F=${sim.fRes.toFixed(1)} kHz`, Math.min(px + 6, W - 96), py - 6);
    }
  });

  const signalOpen = sim.signalOpen;
  return (
    <div
      className={cn(
        "panel panel-corner transition-colors duration-300",
        signalOpen && "border-alarm/70"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-line">
        <Led tone={signalOpen ? "alarm" : "signal"} />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">
          EMI signature — admittance sweep 1 kHz → 500 kHz
        </span>
        <span className="ml-auto font-mono text-[11px] text-copper">
          dwell {Math.round((sim.sweepIdx / SWEEP_STEPS) * 100)}%
        </span>
      </div>
      <div className="relative">
        <div className="scanlines pointer-events-none absolute inset-0 z-10" />
        <canvas ref={ref} className="block w-full h-[264px] bg-scope" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-line border-t border-line font-mono text-[10.5px] text-dim">
        <div className="px-3 py-1.5">
          sweep <span className="text-mute">{sim.sweepIdx}/{SWEEP_STEPS}</span>
        </div>
        <div className="px-3 py-1.5">
          f<sub>dwell</sub>{" "}
          <span className="text-copper">{sim.sweepHzNow.toFixed(1)} kHz</span>
        </div>
        <div className="px-3 py-1.5">
          burst <span className="text-mute">200 × 12 µs</span>
        </div>
        <div className="px-3 py-1.5">
          adc <span className="text-mute">12-bit · 11 dB</span>
        </div>
      </div>
    </div>
  );
}

/* ── voltage strip chart (packet history) ──────────────────────── */
function TimeStrip({ sim }: { sim: NodeSim }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = fitCanvas(cv);
    if (!ctx) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    const padL = 30;
    const padT = 8;
    const padB = 6;
    const pw = W - padL - 8;
    const ph = H - padT - padB;
    const pts = sim.packets.slice(0, 40).reverse();
    const vmax = Math.max(900, ...pts.map((p) => p.voltage)) * 1.08;
    const x = (i: number) => padL + (pts.length < 2 ? 0 : (i / (pts.length - 1)) * pw);
    const y = (v: number) => padT + (1 - v / vmax) * ph;

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(143,214,148,0.08)";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(143,160,147,0.6)";
    for (let g = 0; g <= 2; g++) {
      const vy = padT + (g / 2) * ph;
      ctx.beginPath();
      ctx.moveTo(padL, vy);
      ctx.lineTo(W - 8, vy);
      ctx.stroke();
      ctx.fillText(String(Math.round(vmax * (1 - g / 2))), 2, vy + 3);
    }
    if (pts.length > 1) {
      /* area fill */
      const grad = ctx.createLinearGradient(0, padT, 0, H);
      grad.addColorStop(0, "rgba(222,154,60,0.26)");
      grad.addColorStop(1, "rgba(222,154,60,0.02)");
      ctx.beginPath();
      pts.forEach((p, i) =>
        i === 0 ? ctx.moveTo(x(i), y(p.voltage)) : ctx.lineTo(x(i), y(p.voltage))
      );
      ctx.lineTo(x(pts.length - 1), H - padB);
      ctx.lineTo(x(0), H - padB);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      /* line */
      ctx.strokeStyle = "#de9a3c";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(222,154,60,0.7)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      pts.forEach((p, i) =>
        i === 0 ? ctx.moveTo(x(i), y(p.voltage)) : ctx.lineTo(x(i), y(p.voltage))
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
      /* fault markers */
      pts.forEach((p, i) => {
        if (p.fault || p.status === "CRUSHED") {
          ctx.fillStyle = "#e4593c";
          ctx.beginPath();
          ctx.arc(x(i), y(p.voltage), 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else {
      ctx.fillStyle = "rgba(143,160,147,0.6)";
      ctx.fillText("awaiting first telemetry frame…", padL + 4, H / 2);
    }
  });
  return (
    <div className="panel">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-line">
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">
          voltage_peak — 1 Hz uplink history
        </span>
        <span className="ml-auto font-mono text-[10px] text-dim">
          last {Math.min(sim.packets.length, 40)} frames
        </span>
      </div>
      <canvas ref={ref} className="block w-full h-[132px] bg-scope" />
    </div>
  );
}

/* ── dual-axis ASTM C1074 conductance × hydration-temperature graph ── */
function HydrationTempGraph({ sim }: { sim: NodeSim }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const gHist = useRef<number[]>([]);
  const tHist = useRef<number[]>([]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = fitCanvas(cv);
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    if (!ctx) return;

    const N = 160;
    gHist.current.push(sim.gUS);
    while (gHist.current.length > N) gHist.current.shift();
    tHist.current.push(sim.coreTempC);
    while (tHist.current.length > N) tHist.current.shift();

    const padL = 40;
    const padR = 40;
    const padT = 10;
    const padB = 8;
    const pw = W - padL - padR;
    const ph = H - padT - padB;
    const GMAX = Math.max(500, ...gHist.current) * 1.15;
    const TMIN = 15;
    const TMAX = Math.max(50, ...tHist.current.map(v => v + 6));

    const gx = (i: number, n: number) => padL + (i / Math.max(1, n - 1)) * pw;
    const gyG = (g: number) => padT + (1 - g / GMAX) * ph;
    const gyT = (t: number) => padT + (1 - (t - TMIN) / (TMAX - TMIN)) * ph;

    ctx.clearRect(0, 0, W, H);

    /* graticule + left axis (µS) + right axis (°C) */
    ctx.font = "8.5px 'JetBrains Mono', monospace";
    ctx.lineWidth = 1;
    const gTicks = 4;
    for (let k = 0; k <= gTicks; k++) {
      const gv = (GMAX / gTicks) * k;
      const tv = TMIN + ((TMAX - TMIN) / gTicks) * k;
      const y = gyG(gv);
      ctx.strokeStyle = "rgba(143,214,148,0.08)";
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      ctx.fillStyle = "rgba(222,154,60,0.75)";
      ctx.textAlign = "right";
      ctx.fillText(gv >= 1000 ? `${(gv / 1000).toFixed(1)}k` : String(Math.round(gv)), padL - 5, y + 3);
      ctx.fillStyle = "rgba(127,184,164,0.75)";
      ctx.textAlign = "left";
      ctx.fillText(tv.toFixed(0) === tv.toFixed(0) ? `${Math.round(tv)}°` : `${tv.toFixed(1)}°`, W - padR + 6, y + 3);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(222,154,60,0.8)";
    ctx.fillText("µS", padL - 26, padT + 2);
    ctx.fillStyle = "rgba(127,184,164,0.8)";
    ctx.fillText("°C", W - padR + 6, padT + 2);

    /* ambient reference 23 °C */
    if (TMIN < 23 && 23 < TMAX) {
      ctx.strokeStyle = "rgba(143,160,147,0.35)";
      ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(padL, gyT(23)); ctx.lineTo(W - padR, gyT(23)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(143,160,147,0.6)";
      ctx.fillText("23° ambient", padL + 4, gyT(23) - 3);
    }

    const pts = gHist.current;
    const tps = tHist.current;
    if (pts.length > 1) {
      /* conductance area + line (primary decay path) */
      const grad = ctx.createLinearGradient(0, padT, 0, H);
      grad.addColorStop(0, "rgba(222,154,60,0.22)");
      grad.addColorStop(1, "rgba(222,154,60,0.02)");
      ctx.beginPath();
      pts.forEach((g, i) => (i === 0 ? ctx.moveTo(gx(i, pts.length), gyG(g)) : ctx.lineTo(gx(i, pts.length), gyG(g))));
      ctx.lineTo(gx(pts.length - 1, pts.length) , H - padB);
      ctx.lineTo(gx(0, pts.length), H - padB);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "#de9a3c";
      ctx.lineWidth = 1.6;
      ctx.shadowColor = "rgba(222,154,60,0.6)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      pts.forEach((g, i) => (i === 0 ? ctx.moveTo(gx(i, pts.length), gyG(g)) : ctx.lineTo(gx(i, pts.length), gyG(g))));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    if (tps.length > 1) {
      /* temperature line (secondary ASTM C1074 maturity curve) */
      ctx.strokeStyle = "#7fb8a4";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "rgba(127,184,164,0.65)";
      ctx.shadowBlur = 7;
      ctx.beginPath();
      tps.forEach((tp, i) => (i === 0 ? ctx.moveTo(gx(i, tps.length), gyT(tp)) : ctx.lineTo(gx(i, tps.length), gyT(tp))));
      ctx.stroke();
      ctx.shadowBlur = 0;
      /* hot marker at current temp */
      const cxp = gx(tps.length - 1, tps.length);
      const cyp = gyT(tps[tps.length - 1]);
      ctx.fillStyle = "#b8ecbb";
      ctx.beginPath(); ctx.arc(cxp - 1, cyp, 3.4, 0, Math.PI * 2); ctx.fill();
    }

    /* legend */
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#de9a3c";
    ctx.fillText("■ G µS (primary)", padL + 4, H - 6);
    ctx.fillStyle = "#7fb8a4";
    ctx.fillText("■ T °C · tₑ (secondary)", padL + 112, H - 6);
  });

  return (
    <div className="panel">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-line">
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">
          Core Hydration Temperature (°C) — ASTM C1074 maturity method
        </span>
        <span className="ml-auto font-mono text-[10px] text-teal">dual-axis</span>
      </div>
      <canvas ref={ref} className="block w-full h-[148px] bg-scope" />
      <div className="grid grid-cols-3 divide-x divide-line border-t border-line font-mono text-[10.5px] text-dim">
        <div className="px-3 py-1.5">
          G now <span className="text-paper">{Math.round(sim.gUS)} µS</span>
        </div>
        <div className="px-3 py-1.5">
          T core <span className="text-teal">{sim.coreTempC.toFixed(1)} °C</span>
        </div>
        <div className="px-3 py-1.5">
          tₑ <span className="text-paper">{sim.equivalentAgeDays.toFixed(2)} d</span>
        </div>
      </div>
    </div>
  );
}

/* ── compact core-temperature sub-gauge (right rail) ─────────────── */
function TempSubGauge({ sim }: { sim: NodeSim }) {
  const t = sim.coreTempC;
  const tone = t <= 30 ? "text-signal" : t <= 40 ? "text-copper" : "text-alarmhi";
  const markerPct = Math.min(100, Math.max(0, ((t - 15) / (58 - 15)) * 100));
  return (
    <div className="panel px-4 py-3.5">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
          Core Hydration Temperature (°C)
        </span>
        <span className={cn("font-mono font-semibold text-lg tabular-nums", tone)}>
          {t.toFixed(1)} °C
        </span>
      </div>
      <div className="relative mt-2.5 h-2 bg-deep border border-line overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #3f7a4e 0%, #8fd694 30%, #de9a3c 62%, #e4593c 100%)",
            opacity: 0.55,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-paper"
          style={{ left: `${markerPct}%`, boxShadow: "0 0 6px rgba(233,228,212,0.8)" }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9.5px] text-dim">
        <span>15 °C</span>
        <span>maturity {sim.hydration.toFixed(1)}%</span>
        <span>58 °C</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 font-mono text-[10px] text-dim">
        <div>ambient est. <span className="text-mute">23.0 °C</span></div>
        <div>exotherm Δ <span className="text-copper">+{(t - 23).toFixed(1)} °C</span></div>
        <div>equiv. age tₑ <span className="text-paper">{sim.equivalentAgeDays.toFixed(2)} d</span></div>
        <div>method <span className="text-teal">ASTM C1074</span></div>
      </div>
    </div>
  );
}

/* ── readout tile ──────────────────────────────────────────────── */
function Readout({
  label,
  value,
  unit,
  delta,
  dp,
  hot,
}: {
  label: string;
  value: number;
  unit: string;
  delta: number;
  dp: number;
  hot?: boolean;
}) {
  const open = value >= 9999;
  return (
    <div
      className={cn(
        "panel panel-hover px-4 py-3.5",
        hot && "border-alarm/60 bg-alarm/5"
      )}
    >
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono font-semibold text-[26px] leading-none tabular-nums",
            hot ? "text-alarmhi" : "text-paper"
          )}
        >
          {open ? "OPEN" : value.toFixed(dp)}
        </span>
        <span className="font-mono text-[11px] text-mute">{unit}</span>
        {!open && Math.abs(delta) > 1e-6 && (
          <span
            className={cn(
              "ml-auto font-mono text-[10px]",
              delta > 0 ? "text-signal" : "text-alarm"
            )}
          >
            {delta > 0 ? "▲" : "▼"}
            {Math.abs(delta) >= 100 ? Math.abs(delta).toFixed(0) : Math.abs(delta).toFixed(dp)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── buttons ───────────────────────────────────────────────────── */
function IconBtn({
  onClick,
  tone = "line",
  children,
  disabled,
}: {
  onClick: () => void;
  tone?: "alarm" | "copper" | "line";
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 border px-3 py-2.5 font-mono text-[11px] tracking-[0.12em] uppercase transition-all duration-200 active:translate-y-px disabled:opacity-35 disabled:pointer-events-none",
        tone === "alarm" &&
          "border-alarm/70 bg-alarm/10 text-alarmhi hover:bg-alarm/20 hover:border-alarm",
        tone === "copper" &&
          "border-copperdim bg-copper/10 text-copper hover:bg-copper/20 hover:border-copper",
        tone === "line" &&
          "border-line2 text-mute hover:text-paper hover:border-copperdim"
      )}
    >
      {children}
    </button>
  );
}

/* ── main lab section ──────────────────────────────────────────── */
export default function Lab({ sim }: { sim: NodeSim }) {
  const prev = sim.packets[1];
  const d = (cur: number, p?: number) => (p === undefined ? 0 : cur - p);
  const crashed = sim.status === "CRUSHED";
  const signalOpen = sim.signalOpen;
  const dmgPct = Math.min(sim.damage / 60, 1) * 100;
  const dmgTone =
    sim.damage < 8
      ? "var(--color-signal)"
      : sim.damage < 25
      ? "var(--color-copper)"
      : "var(--color-alarm)";

  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr] items-start">
      {/* scopes */}
      <div className="space-y-5 min-w-0">
        <SignatureScope sim={sim} />
        <TimeStrip sim={sim} />
        <HydrationTempGraph sim={sim} />
      </div>

      {/* right rail */}
      <div className="space-y-5">
        {/* status plate */}
        <div
          className={cn(
            "panel panel-corner px-4 py-3.5 flex items-center gap-4 border",
            signalOpen ? "alarm-strobe" : "border-line"
          )}
        >
          <Led tone={signalOpen ? "alarm" : sim.status === "ACTIVE" ? "signal" : "copper"} size={11} />
          <div>
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-dim">
              node status
            </div>
            <div
              className={cn(
                "font-display font-bold text-xl tracking-wide",
                signalOpen ? "text-alarmhi" : "text-signal"
              )}
            >
              {crashed
                ? "CONCRETE_CRUSHED"
                : signalOpen
                ? "NOT CERTIFIED"
                : sim.status === "ACTIVE"
                ? (sim.paused ? "HOLD" : "ACTIVE")
                : `LINK ${sim.status}…`}
            </div>
          </div>
          <div className="ml-auto text-right font-mono text-[10.5px] leading-relaxed text-dim">
            {crashed ? (
              <>
                ultimate strength<br />
                <span className="text-alarm">event latched</span>
              </>
            ) : signalOpen ? (
              <>
                tamper monitor<br />
                <span className="text-alarm">open-line detected</span>
              </>
            ) : (
              <>
                specimen<br />
                <span className="text-mute">under test</span>
              </>
            )}
          </div>
        </div>

        {/* readouts */}
        <div className="grid grid-cols-2 gap-3">
          <Readout
            label="voltage_peak"
            value={sim.vMV}
            unit="mV"
            dp={1}
            delta={d(sim.vMV, prev?.voltage)}
            hot={sim.spikeActive}
          />
          <Readout
            label="conductance G"
            value={sim.gUS}
            unit="µS"
            dp={0}
            delta={d(sim.gUS, prev?.conductance)}
          />
          <Readout
            label="resistance R"
            value={sim.rK}
            unit="kΩ"
            dp={3}
            delta={d(sim.rK, prev?.resistance)}
            hot={crashed}
          />
          <Readout
            label="resonant F"
            value={sim.fRes}
            unit="kHz"
            dp={1}
            delta={d(sim.fRes, prev?.frequency)}
          />
        </div>

        {/* damage index */}
        <div className="panel px-4 py-3.5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
              damage index — RMSD vs baseline
            </span>
            <span className="font-mono font-semibold text-lg tabular-nums" style={{ color: dmgTone }}>
              {sim.damage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2.5 h-2 bg-deep border border-line overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${dmgPct}%`,
                background: `linear-gradient(90deg, var(--color-signaldeep), ${dmgTone})`,
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[9.5px] text-dim">
            <span>0 — pristine</span>
            <span>30 — micro-cracking</span>
            <span>60+ — failure</span>
          </div>
        </div>

        {/* core hydration temperature sub-gauge */}
        <TempSubGauge sim={sim} />

        {/* controls */}
        <div className="grid grid-cols-2 gap-3">
          <IconBtn tone="alarm" onClick={() => sim.triggerCrush()} disabled={crashed}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3 2 20h20L12 3z" />
              <path d="M12 10v4" />
              <path d="M12 17.5v.5" />
            </svg>
            trigger crush test
          </IconBtn>
          <IconBtn tone="copper" onClick={() => sim.loadCycle()} disabled={crashed}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M4 21h16" />
            </svg>
            load cycle +15%
          </IconBtn>
          <IconBtn onClick={() => sim.togglePause()} disabled={sim.status !== "ACTIVE"}>
            {sim.paused ? (
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M7 4v16l13-8L7 4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
            {sim.paused ? "resume sweep" : "pause sweep"}
          </IconBtn>
          <IconBtn onClick={() => sim.reset()}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
            reset node
          </IconBtn>
        </div>

        {/* packet console */}
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-2 border-b border-line">
            <Led tone="copper" size={6} />
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">
              uplink console — POST /api/v1/telemetry
            </span>
          </div>
          <div className="max-h-[248px] overflow-y-auto font-mono text-[10.5px] leading-relaxed">
            {sim.packets.length === 0 && (
              <div className="px-4 py-3 text-dim">— link establishing, first frame pending —</div>
            )}
            {sim.packets.map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  "px-4 py-1.5 border-b border-line/50 flex flex-wrap gap-x-3 transition-colors",
                  p.fault
                    ? "bg-alarm/15 text-alarmhi"
                    : i === 0
                    ? "bg-raise/70 text-mute"
                    : "text-dim"
                )}
              >
                <span className={p.fault ? "text-alarmhi" : "text-copper"}>
                  #{String(p.id).padStart(3, "0")}
                </span>
                <span>t+{p.t.toFixed(0)}s</span>
                <span>
                  V=<span className="text-paper">{p.voltage.toFixed(0)}</span>mV
                </span>
                <span>
                  R=<span className="text-paper">{fmtNum(p.resistance, 2)}</span>kΩ
                </span>
                <span>
                  F=<span className="text-paper">{p.frequency.toFixed(1)}</span>k
                </span>
                <span className={p.fault ? "text-alarmhi font-semibold" : p.status === "CRUSHED" ? "text-alarm" : "text-signal"}>
                  {p.fault ? "⚠ CONCRETE_CRUSHED" : p.status}
                </span>
                <span className="ml-auto text-dim">{p.fault ? "queued" : "201"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
