import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { NodeSim } from "../sim";
import { Led } from "../ui";
import { cn } from "../utils/cn";

/* ── canvas helpers ────────────────────────────────────────────── */
function fitCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* ── draggable slider ──────────────────────────────────────────── */
function DraggableSlider({
  label,
  unit,
  value,
  min,
  max,
  step,
  dp,
  onChange,
  tone = "copper",
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  dp: number;
  onChange: (v: number) => void;
  tone?: "copper" | "signal" | "teal";
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = ((value - min) / (max - min)) * 100;
  const colorVar =
    tone === "copper" ? "var(--color-copper)" : tone === "signal" ? "var(--color-signal)" : "var(--color-teal)";

  const updateFromEvent = (e: MouseEvent | React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round((min + ratio * (max - min)) / step) * step);
  };

  useEffect(() => {
    const up = () => { dragging.current = false; };
    const move = (e: MouseEvent) => { if (dragging.current) updateFromEvent(e); };
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousemove", move);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, step]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between font-mono text-[11px]">
        <span className="text-mute tracking-[0.1em] uppercase">{label}</span>
        <span className="tabular-nums" style={{ color: colorVar }}>
          {value.toFixed(dp)} <span className="text-dim">{unit}</span>
        </span>
      </div>
      <div
        ref={trackRef}
        onMouseDown={(e) => {
          dragging.current = true;
          updateFromEvent(e);
        }}
        className="relative h-3.5 bg-deep border border-line cursor-pointer group"
      >
        <div
          className="absolute top-0 left-0 h-full transition-all duration-100"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${colorVar}44, ${colorVar})` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${pct}% - 7px)`, borderColor: colorVar, backgroundColor: "var(--color-panel)" }}
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${colorVar}11)` }}
        />
      </div>
    </div>
  );
}

/* ── conductance → strength transfer function canvas ───────────── */
function TransferPlot({
  sim,
  gain,
  offset,
  plowmanA,
  plowmanB,
}: {
  sim: NodeSim;
  gain: number;
  offset: number;
  plowmanA: number;
  plowmanB: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = fitCanvas(cv);
    if (!ctx) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    const padL = 44;
    const padR = 14;
    const padT = 16;
    const padB = 26;
    const pw = W - padL - padR;
    const ph = H - padT - padB;

    /* Range: conductance 0–6000 µS → strength 0–80 MPa */
    const xG = (g: number) => padL + (g / 6000) * pw;
    const yM = (mpa: number) => padT + (1 - mpa / 80) * ph;

    ctx.clearRect(0, 0, W, H);
    ctx.font = "9px 'JetBrains Mono', monospace";

    /* graticule */
    ctx.strokeStyle = "rgba(143,214,148,0.08)";
    ctx.fillStyle = "rgba(143,160,147,0.65)";
    for (let g = 0; g <= 6000; g += 1500) {
      const gx = xG(g);
      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, H - padB);
      ctx.stroke();
      ctx.fillText(`${g}`, gx - 12, H - 10);
    }
    for (let m = 0; m <= 80; m += 20) {
      const my = yM(m);
      ctx.beginPath();
      ctx.moveTo(padL, my);
      ctx.lineTo(W - padR, my);
      ctx.stroke();
      ctx.fillText(`${m}`, 2, my + 3);
    }
    ctx.fillStyle = "rgba(143,160,147,0.8)";
    ctx.fillText("G [µS]  →", W / 2 - 18, H - 4);
    ctx.save();
    ctx.translate(8, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("fc [MPa]", -20, 0);
    ctx.restore();

    /* Transfer curve: calibrated strength vs conductance */
    const curve: { x: number; y: number }[] = [];
    for (let i = 0; i <= 120; i++) {
      const gTest = (i / 120) * 6000;
      const mpa = gTest * gain * 0.0092 + offset;
      curve.push({ x: xG(gTest), y: yM(clampMpa(mpa, 80)) });
    }

    /* Fill under curve */
    ctx.beginPath();
    curve.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.lineTo(curve[curve.length - 1].x, H - padB);
    ctx.lineTo(curve[0].x, H - padB);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, H);
    grad.addColorStop(0, "rgba(222,154,60,0.28)");
    grad.addColorStop(1, "rgba(222,154,60,0.02)");
    ctx.fillStyle = grad;
    ctx.fill();

    /* Curve line */
    ctx.strokeStyle = "#de9a3c";
    ctx.lineWidth = 1.8;
    ctx.shadowColor = "rgba(222,154,60,0.55)";
    ctx.shadowBlur = 7;
    ctx.beginPath();
    curve.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* Plowman maturity anchor line */
    const plowCurve: { x: number; y: number }[] = [];
    for (let i = 0; i <= 80; i++) {
      const day = 1 + (i / 80) * 27;
      const gFromDay = 380 + (1 - Math.exp(-0.12 * (day - 1))) * 4800;
      const mpa = plowmanA * Math.log(Math.max(day, 1.02)) + plowmanB;
      plowCurve.push({ x: xG(gFromDay), y: yM(clampMpa(mpa, 80)) });
    }
    ctx.strokeStyle = "rgba(127,184,164,0.5)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    plowCurve.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#7fb8a4";
    ctx.fillText("ln(t) maturity", padL + 4, padT + 12);

    /* Live operational point */
    const gx = xG(sim.gUS);
    const gy = yM(clampMpa(sim.calibratedStrengthMPa(), 80));
    ctx.fillStyle = "#b8ecbb";
    ctx.beginPath();
    ctx.arc(gx, gy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b8ecbb";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#e9e4d4";
    ctx.font = "600 10px 'JetBrains Mono', monospace";
    const label = `${sim.calibratedStrengthMPa().toFixed(2)} MPa`;
    ctx.fillText(label, Math.min(gx + 6, W - 54), gy - 6);
  });

  return <canvas ref={ref} className="block w-full h-[232px] bg-scope" />;
}

function clampMpa(v: number, maxMpa: number): number {
  return Math.min(maxMpa, Math.max(0, v));
}

/* ── main calibration panel ────────────────────────────────────── */
export default function Calibration({ sim }: { sim: NodeSim }) {
  const [expanded, setExpanded] = useState(false);
  const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragging = useRef(false);

  const strength = sim.calibratedStrengthMPa();
  const tone = sim.registrationBlocked ? "alarm" : strength > 50 ? "copper" : "signal";

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (!panelPos) {
      setPanelPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    }
  };

  useEffect(() => {
    const up = () => { dragging.current = false; };
    const move = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPanelPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousemove", move);
    };
  }, []);

  const panelStyle: CSSProperties = panelPos
    ? { position: "fixed", left: panelPos.x, top: panelPos.y, zIndex: 80 }
    : {};

  return (
    <div
      className={cn(
        "panel panel-corner overflow-hidden transition-all duration-300",
        panelPos ? "shadow-2xl" : ""
      )}
      style={panelStyle}
    >
      {/* header bar — draggable */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center gap-3 px-4 py-2.5 border-b border-line bg-raise/50 cursor-grab active:cursor-grabbing select-none"
      >
        <Led tone={tone} size={7} />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-paper">
          Calibration &amp; Offset Tuning
        </span>
        <span className="ml-auto font-mono text-[10px] text-dim">drag to reposition</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="border border-line2 px-2 py-0.5 font-mono text-[10px] text-mute hover:text-paper transition-colors"
        >
          {expanded ? "collapse" : "expand"}
        </button>
      </div>

      {expanded && (
        <div className="p-4 md:p-5 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          {/* sliders */}
          <div className="space-y-5">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-copper">
              conductance → strength transfer function
            </div>
            <DraggableSlider
              label="Gain"
              unit="×"
              value={sim.calGain}
              min={0.1}
              max={4.0}
              step={0.05}
              dp={2}
              onChange={(v) => { sim.calGain = v; }}
              tone="copper"
            />
            <DraggableSlider
              label="Offset"
              unit="MPa"
              value={sim.calOffset}
              min={-10}
              max={25}
              step={0.5}
              dp={1}
              onChange={(v) => { sim.calOffset = v; }}
              tone="signal"
            />
            <div className="border-t border-line pt-4 mt-2">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-teal mb-3">
                Plowman maturity law: f<sub>c</sub>(t) = A·ln(t) + B
              </div>
              <DraggableSlider
                label="Coefficient A"
                unit="MPa/ln(day)"
                value={sim.plowmanA}
                min={2}
                max={18}
                step={0.1}
                dp={1}
                onChange={(v) => { sim.plowmanA = v; }}
                tone="teal"
              />
              <div className="mt-3">
                <DraggableSlider
                  label="Intercept B"
                  unit="MPa"
                  value={sim.plowmanB}
                  min={0}
                  max={30}
                  step={0.5}
                  dp={1}
                  onChange={(v) => { sim.plowmanB = v; }}
                  tone="teal"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-line">
              <div className="border border-line px-2.5 py-2 text-center">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-dim">live G</div>
                <div className="font-mono text-lg tabular-nums text-paper">{sim.gUS.toFixed(0)}</div>
                <div className="font-mono text-[9px] text-dim">µS</div>
              </div>
              <div className="border border-line px-2.5 py-2 text-center">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-dim">Plowman</div>
                <div className="font-mono text-lg tabular-nums text-teal">{sim.plowmanStrength(sim.virtualDay).toFixed(1)}</div>
                <div className="font-mono text-[9px] text-dim">MPa</div>
              </div>
              <div className="border border-line px-2.5 py-2 text-center">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-dim">calibrated</div>
                <div className="font-mono text-lg tabular-nums" style={{ color: strength > 50 ? "var(--color-alarmhi)" : "var(--color-signalhi)" }}>
                  {strength.toFixed(2)}
                </div>
                <div className="font-mono text-[9px] text-dim">MPa</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  sim.calGain = 1.0;
                  sim.calOffset = 0;
                  sim.plowmanA = 8.4;
                  sim.plowmanB = 12.1;
                }}
                className="border border-line2 px-3 py-1.5 font-mono text-[10px] text-mute hover:text-paper transition-colors"
              >
                reset defaults
              </button>
              <button
                onClick={() => {
                  sim.calGain = 1.85;
                  sim.calOffset = 3.2;
                  sim.plowmanA = 10.2;
                  sim.plowmanB = 14.8;
                }}
                className="border border-copperdim px-3 py-1.5 font-mono text-[10px] text-copper hover:bg-copper/10 transition-colors"
              >
                C40/50 preset
              </button>
            </div>
          </div>

          {/* transfer plot */}
          <div className="border border-line overflow-hidden">
            <div className="px-3 py-2 border-b border-line font-mono text-[10px] tracking-[0.16em] uppercase text-mute">
              G [µS] → f<sub>c</sub> [MPa] · live calibration
            </div>
            <TransferPlot
              sim={sim}
              gain={sim.calGain}
              offset={sim.calOffset}
              plowmanA={sim.plowmanA}
              plowmanB={sim.plowmanB}
            />
            <div className="grid grid-cols-2 divide-x divide-line border-t border-line font-mono text-[10px]">
              <div className="px-3 py-1.5 text-dim">
                maturity day <span className="text-paper">{sim.virtualDay.toFixed(2)}</span>
              </div>
              <div className="px-3 py-1.5 text-dim">
                f<sub>c</sub> <span className="text-paper">{strength.toFixed(2)} MPa</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!expanded && (
        <div className="px-4 py-2.5 flex items-center gap-4 font-mono text-[10.5px]">
          <span className="text-dim">Gain <span className="text-copper">{sim.calGain.toFixed(2)}</span></span>
          <span className="text-dim">Offset <span className="text-signal">{sim.calOffset.toFixed(1)} MPa</span></span>
          <span className="text-dim">Plowman <span className="text-teal">A={sim.plowmanA.toFixed(1)} B={sim.plowmanB.toFixed(1)}</span></span>
          <span className="ml-auto">
            f<sub>c</sub> = <span className="text-paper font-semibold">{strength.toFixed(2)} MPa</span>
          </span>
        </div>
      )}
    </div>
  );
}
