/* ------------------------------------------------------------------ *
 *  UserGuide.tsx — smartLAB interactive platform walkthrough
 *
 *  5-step wizard with:
 *  • Animated SVG illustrations per step (fully CSS + SVG, no images)
 *  • Step-by-step progress tracker with animated connector line
 *  • Slide transition between steps
 *  • Pro-tip callout per step
 *  • Keyboard navigation (← →)
 *  • Fully translated via useLang()
 * ------------------------------------------------------------------ */

import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";
import { cn } from "../utils/cn";

/* ── step animation canvases ────────────────────────────────────── */

/** Step 1 — Arduino IDE upload animation */
function Anim1({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(raf.current); return; }
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const W = cv.clientWidth; const H = cv.clientHeight;
    if (cv.width !== W * 2) { cv.width = W * 2; cv.height = H * 2; ctx.scale(2, 2); }

    const draw = () => {
      frame.current++;
      ctx.clearRect(0, 0, W, H);
      const t = frame.current;

      /* board body */
      ctx.fillStyle = "#1a241d"; ctx.fillRect(60, 70, 200, 100);
      ctx.strokeStyle = "#33443a"; ctx.lineWidth = 1.5; ctx.strokeRect(60, 70, 200, 100);
      /* ESP32 chip */
      ctx.fillStyle = "#263329"; ctx.fillRect(110, 88, 100, 64);
      ctx.strokeStyle = "#8fd694"; ctx.lineWidth = 1; ctx.strokeRect(110, 88, 100, 64);
      ctx.fillStyle = "#8fa093"; ctx.font = "bold 9px 'JetBrains Mono',monospace";
      ctx.textAlign = "center"; ctx.fillText("ESP32-WROOM-32", 160, 123);

      /* USB cable animated dashes */
      const dashOff = -(t % 20) * 1.2;
      ctx.setLineDash([8, 6]); ctx.lineDashOffset = dashOff;
      ctx.strokeStyle = "#de9a3c"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, 119); ctx.lineTo(60, 119); ctx.stroke();
      ctx.setLineDash([]);

      /* upload progress bar */
      const prog = Math.min(1, (t % 180) / 120);
      ctx.fillStyle = "#151d17"; ctx.fillRect(76, 178, 168, 12);
      ctx.fillStyle = prog < 1 ? "#de9a3c" : "#8fd694";
      ctx.fillRect(76, 178, 168 * prog, 12);
      ctx.fillStyle = "#8fa093"; ctx.font = "8px 'JetBrains Mono',monospace";
      ctx.textAlign = "left";
      ctx.fillText(prog < 1 ? `Uploading… ${Math.round(prog * 100)}%` : "Upload complete ✓", 76, 205);

      /* blinking LED */
      if (Math.floor(t / 18) % 2 === 0) {
        ctx.beginPath(); ctx.arc(248, 83, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#8fd694"; ctx.shadowColor = "#8fd694"; ctx.shadowBlur = 10; ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return <canvas ref={ref} className="w-full h-[220px]" style={{ display: "block" }} />;
}

/** Step 2 — wiring diagram animation */
function Anim2({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(raf.current); return; }
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const W = cv.clientWidth; const H = cv.clientHeight;
    if (cv.width !== W * 2) { cv.width = W * 2; cv.height = H * 2; ctx.scale(2, 2); }

    const draw = () => {
      frame.current++;
      ctx.clearRect(0, 0, W, H);
      const t = frame.current;

      /* ESP32 block */
      ctx.fillStyle = "#1a241d"; ctx.fillRect(10, 60, 80, 110);
      ctx.strokeStyle = "#33443a"; ctx.lineWidth = 1.2; ctx.strokeRect(10, 60, 80, 110);
      ctx.fillStyle = "#8fa093"; ctx.font = "7px 'JetBrains Mono',monospace";
      ctx.textAlign = "center";
      ["GPIO25", "GPIO36", "3V3", "GND"].forEach((p, i) => {
        ctx.fillStyle = i === 0 ? "#de9a3c" : i === 1 ? "#7fb8a4" : "#8fa093";
        ctx.fillText(p, 50, 86 + i * 26);
      });

      /* animated signal particle along excitation path */
      const particleX = 90 + ((t * 2.2) % 110);
      ctx.strokeStyle = "#de9a3c"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(90, 82); ctx.lineTo(200, 82); ctx.stroke();
      ctx.beginPath(); ctx.arc(Math.min(particleX, 148), 82, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#f2b866"; ctx.shadowColor = "#de9a3c"; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;

      /* Rs resistor */
      ctx.fillStyle = "#263329"; ctx.fillRect(145, 75, 34, 15);
      ctx.strokeStyle = "#de9a3c"; ctx.strokeRect(145, 75, 34, 15);
      ctx.fillStyle = "#de9a3c"; ctx.font = "7px 'JetBrains Mono',monospace";
      ctx.fillText("1kΩ", 162, 86);

      /* junction dot + ADC line */
      ctx.beginPath(); ctx.arc(200, 82, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#f2b866"; ctx.fill();
      ctx.strokeStyle = "#7fb8a4"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(200, 82); ctx.lineTo(200, 110); ctx.stroke();

      /* PZT patch */
      ctx.fillStyle = "#1e2e22"; ctx.fillRect(180, 110, 40, 60);
      ctx.strokeStyle = "#8fd694"; ctx.lineWidth = 2; ctx.strokeRect(180, 110, 40, 60);
      /* animated resonance wave inside patch */
      ctx.strokeStyle = `rgba(143,214,148,${0.4 + 0.4 * Math.sin(t * 0.14)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x <= 36; x++) {
        const y = 140 + Math.sin((x / 36) * Math.PI * 3 + t * 0.18) * 8;
        if (x === 0) ctx.moveTo(182 + x, y); else ctx.lineTo(182 + x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "#5f7063"; ctx.font = "7px 'JetBrains Mono',monospace";
      ctx.fillText("PZT", 200, 174);

      /* GND line */
      ctx.strokeStyle = "#5f7063"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(200, 170); ctx.lineTo(200, 190); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(188, 190); ctx.lineTo(212, 190); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(192, 194); ctx.lineTo(208, 194); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(196, 198); ctx.lineTo(204, 198); ctx.stroke();

      /* ADC readout */
      const adc = Math.round(1800 + Math.sin(t * 0.12) * 400);
      ctx.fillStyle = "#7fb8a4"; ctx.font = "bold 8px 'JetBrains Mono',monospace";
      ctx.fillText(`ADC: ${adc}`, 240, 125);
      ctx.fillStyle = "#5f7063"; ctx.font = "7px 'JetBrains Mono',monospace";
      ctx.fillText("GPIO36", 240, 113);

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return <canvas ref={ref} className="w-full h-[220px]" style={{ display: "block" }} />;
}

/** Step 3 — Wi-Fi connection + cloud uplink animation */
function Anim3({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(raf.current); return; }
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const W = cv.clientWidth; const H = cv.clientHeight;
    if (cv.width !== W * 2) { cv.width = W * 2; cv.height = H * 2; ctx.scale(2, 2); }

    const draw = () => {
      frame.current++;
      ctx.clearRect(0, 0, W, H);
      const t = frame.current;

      /* Device */
      ctx.fillStyle = "#1a241d"; ctx.fillRect(20, 80, 70, 60);
      ctx.strokeStyle = "#33443a"; ctx.strokeRect(20, 80, 70, 60);
      ctx.fillStyle = "#8fa093"; ctx.font = "7px 'JetBrains Mono',monospace";
      ctx.textAlign = "center"; ctx.fillText("ESP32", 55, 114);

      /* Wi-Fi signal arcs radiating out */
      [30, 50, 70].forEach((r, i) => {
        const opacity = Math.max(0, Math.sin((t * 0.06) - i * 0.7));
        ctx.strokeStyle = `rgba(143,214,148,${opacity * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(55, 110, r, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();
      });

      /* Packets moving to cloud */
      const numPkts = 4;
      for (let p = 0; p < numPkts; p++) {
        const progress = ((t * 0.6 + p * 30) % 120) / 120;
        const px = 90 + progress * 150;
        const py = 110 + Math.sin(progress * Math.PI) * -20;
        if (px < 240) {
          ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = progress < 0.5 ? "#de9a3c" : "#8fd694";
          ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0;
          /* packet label */
          ctx.fillStyle = "#8fa093"; ctx.font = "6px 'JetBrains Mono',monospace";
          ctx.fillText("POST", px, py - 8);
        }
      }

      /* Cloud */
      ctx.fillStyle = "#151d17"; ctx.strokeStyle = "#7fb8a4"; ctx.lineWidth = 1.5;
      [0, 18, 36].forEach(dx => {
        ctx.beginPath(); ctx.arc(240 + dx, 112, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      ctx.fillStyle = "#8fa093"; ctx.font = "7px 'JetBrains Mono',monospace";
      ctx.fillText("fimtosoft.com", 258, 136);

      /* 201 response */
      if (Math.floor(t / 40) % 2 === 0) {
        ctx.fillStyle = "#8fd694"; ctx.font = "bold 8px 'JetBrains Mono',monospace";
        ctx.fillText("HTTP 201 ✓", 258, 150);
      }

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return <canvas ref={ref} className="w-full h-[220px]" style={{ display: "block" }} />;
}

/** Step 4 — live EMI sweep animation */
function Anim4({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(raf.current); return; }
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const W = cv.clientWidth; const H = cv.clientHeight;
    if (cv.width !== W * 2) { cv.width = W * 2; cv.height = H * 2; ctx.scale(2, 2); }

    const draw = () => {
      frame.current++;
      ctx.clearRect(0, 0, W, H);
      const t = frame.current;

      /* scope border */
      ctx.strokeStyle = "#263329"; ctx.lineWidth = 1; ctx.strokeRect(16, 16, W - 32, H - 36);
      ctx.fillStyle = "#080c0a"; ctx.fillRect(17, 17, W - 34, H - 38);

      /* graticule */
      ctx.strokeStyle = "rgba(143,214,148,0.07)"; ctx.lineWidth = 1;
      for (let gx = 16; gx <= W - 16; gx += 36) { ctx.beginPath(); ctx.moveTo(gx, 16); ctx.lineTo(gx, H - 20); ctx.stroke(); }
      for (let gy = 16; gy <= H - 20; gy += 36) { ctx.beginPath(); ctx.moveTo(16, gy); ctx.lineTo(W - 16, gy); ctx.stroke(); }

      /* EMI spectrum — Gaussian peak */
      const sweep = ((t * 1.4) % (W - 40));
      ctx.strokeStyle = "#de9a3c"; ctx.lineWidth = 1.8;
      ctx.shadowColor = "#de9a3c"; ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let x = 0; x <= sweep; x++) {
        const norm = x / (W - 40);
        const gauss = 180 * Math.exp(-((norm - 0.45) ** 2) / 0.018);
        const noise = (Math.random() - 0.5) * 8;
        const y = H - 26 - Math.max(0, gauss + noise) * 0.8;
        if (x === 0) ctx.moveTo(16 + x, y); else ctx.lineTo(16 + x, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;

      /* cursor */
      ctx.strokeStyle = "rgba(222,154,60,0.55)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(16 + sweep, 16); ctx.lineTo(16 + sweep, H - 20); ctx.stroke();

      /* frequency labels */
      ctx.fillStyle = "#5f7063"; ctx.font = "7px 'JetBrains Mono',monospace"; ctx.textAlign = "center";
      ctx.fillText("1 kHz", 28, H - 6); ctx.fillText("100 kHz", W / 2, H - 6); ctx.fillText("500 kHz", W - 28, H - 6);

      /* live readout */
      const prog = sweep / (W - 40);
      const fNow = Math.round(1 + prog * 499);
      ctx.fillStyle = "#8fd694"; ctx.font = "bold 8px 'JetBrains Mono',monospace"; ctx.textAlign = "left";
      ctx.fillText(`f = ${fNow} kHz`, 24, 30);

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return <canvas ref={ref} className="w-full h-[220px]" style={{ display: "block" }} />;
}

/** Step 5 — certification gauge animation */
function Anim5({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(raf.current); return; }
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const W = cv.clientWidth; const H = cv.clientHeight;
    if (cv.width !== W * 2) { cv.width = W * 2; cv.height = H * 2; ctx.scale(2, 2); }

    const draw = () => {
      frame.current++;
      ctx.clearRect(0, 0, W, H);
      const t = frame.current;

      const cx = W / 2; const cy = H * 0.52; const R = 72;
      const START = Math.PI * 0.75; const SWEEP = Math.PI * 1.5;
      const pct = Math.min(1, (Math.sin(t * 0.018) * 0.5 + 0.5) * 0.82 + 0.14);
      const mpa = (22 + pct * 46).toFixed(1);

      /* track */
      ctx.beginPath(); ctx.arc(cx, cy, R, START, START + SWEEP);
      ctx.strokeStyle = "rgba(143,214,148,0.09)"; ctx.lineWidth = 16; ctx.lineCap = "round"; ctx.stroke();

      /* value arc */
      ctx.beginPath(); ctx.arc(cx, cy, R, START, START + pct * SWEEP);
      const color = pct > 0.72 ? "#8fd694" : pct > 0.45 ? "#de9a3c" : "#e4593c";
      ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0;

      /* needle */
      const na = START + pct * SWEEP;
      ctx.beginPath(); ctx.arc(cx + R * Math.cos(na), cy + R * Math.sin(na), 5, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();

      /* centre text */
      ctx.textAlign = "center";
      ctx.font = "bold 22px 'Chakra Petch',sans-serif"; ctx.fillStyle = "#e9e4d4";
      ctx.fillText(`${mpa}`, cx, cy - 2);
      ctx.font = "8px 'JetBrains Mono',monospace"; ctx.fillStyle = "#8fa093";
      ctx.fillText("MPa · Day 28 est.", cx, cy + 14);

      /* certification badge */
      const cert = pct > 0.72;
      const badgeY = cy + 50;
      ctx.fillStyle = cert ? "rgba(143,214,148,0.12)" : "rgba(222,154,60,0.10)";
      ctx.fillRect(cx - 55, badgeY, 110, 24);
      ctx.strokeStyle = cert ? "#8fd694" : "#de9a3c"; ctx.lineWidth = 1;
      ctx.strokeRect(cx - 55, badgeY, 110, 24);
      ctx.font = "bold 9px 'Chakra Petch',sans-serif";
      ctx.fillStyle = cert ? "#8fd694" : "#de9a3c";
      ctx.fillText(cert ? "CERTIFIED ✓" : "PENDING…", cx, badgeY + 15);

      /* day counter */
      const day = (1 + ((t * 0.08) % 27)).toFixed(1);
      ctx.font = "7px 'JetBrains Mono',monospace"; ctx.fillStyle = "#5f7063";
      ctx.fillText(`Virtual Day ${day}`, cx, 22);

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return <canvas ref={ref} className="w-full h-[220px]" style={{ display: "block" }} />;
}

/* ── step data ──────────────────────────────────────────────────── */
const ANIMS = [Anim1, Anim2, Anim3, Anim4, Anim5];

const STEP_ICONS = [
  /* upload */
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 16V8m-4 4 4-4 4 4"/><rect x="2" y="18" width="20" height="3" rx="1"/></svg>,
  /* circuit */
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h8a2 2 0 0 1 2 2v2m0 4v2a2 2 0 0 1-2 2H8"/><path d="M6 8v8"/></svg>,
  /* wifi */
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>,
  /* monitor */
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  /* badge */
  <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
];

/* ── main component ─────────────────────────────────────────────── */
export default function UserGuide() {
  const { t } = useLang();
  const [step, setStep] = useState<number | null>(null); // null = not started
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const TOTAL = 5;

  const go = (next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setStep(next); setAnimating(false); }, 220);
  };

  const prev = () => step !== null && step > 0 && go(step - 1);
  const next = () => step !== null && step < TOTAL - 1 && go(step + 1);
  const start = () => go(0);
  const reset = () => { setAnimating(true); setTimeout(() => { setStep(null); setAnimating(false); }, 180); };

  /* keyboard navigation */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (step === null) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const AnimComp = step !== null ? ANIMS[step] : null;

  return (
    <section
      ref={containerRef}
      className="panel panel-corner overflow-hidden"
      aria-label={t("guide.title")}
    >
      {/* ── section header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 border-b border-line bg-raise/40">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-copper shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          <div>
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-copper">
              {t("guide.kicker")}
            </div>
          </div>
        </div>
        <span className="font-display font-bold text-[18px] text-paper tracking-wide">
          {t("guide.title")}
        </span>
        {/* NEW badge */}
        <span className="border border-copper/60 bg-copper/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.24em] uppercase text-copper">
          {t("guide.badge.new")}
        </span>
        {step !== null && (
          <span className="ml-auto font-mono text-[10px] text-dim">
            {t("guide.progress", { n: String(step + 1), total: String(TOTAL) })}
          </span>
        )}
      </div>

      {/* ── subtitle ───────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[13.5px] text-mute leading-relaxed max-w-3xl">
          {t("guide.subtitle")}
        </p>
      </div>

      {/* ── step progress bar ───────────────────────────────────── */}
      {step !== null && (
        <div className="px-5 py-4">
          <div className="flex items-center gap-0" dir="ltr">
            {Array.from({ length: TOTAL }, (_, i) => {
              const done    = i < step;
              const current = i === step;
              return (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => go(i)}
                    className={cn(
                      "relative w-9 h-9 shrink-0 flex items-center justify-center border transition-all duration-300",
                      done    && "border-signal bg-signal/15 text-signal",
                      current && "border-copper bg-copper/15 text-copper shadow-lg shadow-copper/20",
                      !done && !current && "border-line bg-panel text-dim"
                    )}
                    aria-current={current ? "step" : undefined}
                  >
                    {done ? (
                      <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 6l3.5 3.5L11 2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="font-mono text-[11px] font-semibold">{i + 1}</span>
                    )}
                    {current && (
                      <span className="absolute inset-0 border border-copper animate-ping opacity-40" />
                    )}
                  </button>
                  {i < TOTAL - 1 && (
                    <div className="flex-1 h-px mx-1 transition-colors duration-500 relative overflow-hidden">
                      <div className={cn("h-full", i < step ? "bg-signal" : "bg-line")} />
                      {i === step - 1 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-signal/60 to-transparent animate-pulse" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── main content area ───────────────────────────────────── */}
      <div className="px-5 pb-5">
        {step === null ? (
          /* Not started — step cards preview */
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mt-2">
            {Array.from({ length: TOTAL }, (_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className="group border border-line hover:border-copperdim bg-scope/30 hover:bg-raise/50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center border mb-3 transition-colors",
                  "border-line group-hover:border-copper text-dim group-hover:text-copper"
                )}>
                  {STEP_ICONS[i]}
                </div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim group-hover:text-copper mb-1">
                  {t(`guide.s${i + 1}.tag` as Parameters<typeof t>[0])}
                </div>
                <div className="font-display font-semibold text-[13px] text-paper leading-snug">
                  {t(`guide.s${i + 1}.title` as Parameters<typeof t>[0])}
                </div>
              </button>
            ))}
            <div className="sm:col-span-2 lg:col-span-5 mt-2 flex justify-center">
              <button
                onClick={start}
                className="flex items-center gap-2.5 border border-copperdim bg-copper/10 px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-copper hover:bg-copper/20 hover:border-copper transition-all duration-200"
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                  <path d="M6.3 2.8 17 10 6.3 17.2V2.8z"/>
                </svg>
                {t("guide.btn.start")}
              </button>
            </div>
          </div>
        ) : (
          /* Active step */
          <div
            className={cn(
              "grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start mt-2 transition-opacity duration-200",
              animating ? "opacity-0" : "opacity-100"
            )}
          >
            {/* left: animation */}
            <div className="border border-line bg-scope overflow-hidden relative order-1 lg:order-none">
              <div className="flex items-center gap-2.5 px-3 py-2 border-b border-line bg-raise/30">
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-alarm/60" />
                  <span className="w-2 h-2 rounded-full bg-copper/60" />
                  <span className="w-2 h-2 rounded-full bg-signal/60" />
                </span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim">
                  {t(`guide.s${step + 1}.tag` as Parameters<typeof t>[0])} · animation
                </span>
              </div>
              <div className="scanlines pointer-events-none absolute inset-0 z-10" />
              {AnimComp && <AnimComp active={true} />}
            </div>

            {/* right: text */}
            <div className="space-y-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-copper mb-1">
                  {t(`guide.s${step + 1}.tag` as Parameters<typeof t>[0])}
                </div>
                <h3 className="font-display font-bold text-[22px] text-paper leading-tight tracking-wide">
                  {t(`guide.s${step + 1}.title` as Parameters<typeof t>[0])}
                </h3>
              </div>

              <p className="text-[14px] leading-[1.75] text-mute">
                {t(`guide.s${step + 1}.body` as Parameters<typeof t>[0])}
              </p>

              {/* tip callout */}
              <div className="flex gap-3 border border-signaldeep bg-signal/5 px-3.5 py-3">
                <svg viewBox="0 0 20 20" className="w-4 h-4 text-signal shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="10" cy="10" r="8"/>
                  <path d="M10 6v4M10 14v.5"/>
                </svg>
                <p className="font-body text-[12.5px] leading-relaxed text-signal/80">
                  {t(`guide.s${step + 1}.tip` as Parameters<typeof t>[0])}
                </p>
              </div>

              {/* step icon large */}
              <div className={cn(
                "flex items-center gap-3 border px-4 py-3",
                step === TOTAL - 1 ? "border-signaldeep text-signal" : "border-line text-dim"
              )}>
                <span className="w-8 h-8 flex items-center justify-center border border-current">
                  {STEP_ICONS[step]}
                </span>
                <span className="font-mono text-[11px]">
                  {step === TOTAL - 1
                    ? "Platform ready for production deployment"
                    : `${TOTAL - step - 1} step${TOTAL - step - 1 === 1 ? "" : "s"} remaining`}
                </span>
              </div>

              {/* navigation */}
              <div className="flex items-center gap-3 pt-1" dir="ltr">
                {step > 0 && (
                  <button
                    onClick={prev}
                    className="border border-line px-4 py-2 font-mono text-[10.5px] tracking-[0.14em] uppercase text-mute hover:text-paper hover:border-copperdim transition-colors"
                  >
                    {t("guide.btn.prev")}
                  </button>
                )}
                {step < TOTAL - 1 ? (
                  <button
                    onClick={next}
                    className="flex-1 border border-copperdim bg-copper/10 px-4 py-2 font-mono text-[10.5px] tracking-[0.14em] uppercase text-copper hover:bg-copper/20 hover:border-copper transition-colors"
                  >
                    {t("guide.btn.next")}
                  </button>
                ) : (
                  <button
                    onClick={reset}
                    className="flex-1 border border-signaldeep bg-signal/10 px-4 py-2 font-mono text-[10.5px] tracking-[0.14em] uppercase text-signal hover:bg-signal/20 transition-colors"
                  >
                    {t("guide.btn.done")}
                  </button>
                )}
                <button
                  onClick={reset}
                  className="border border-line px-3 py-2 font-mono text-[10px] text-dim hover:text-mute transition-colors"
                  title={t("guide.btn.restart")}
                >
                  ↺
                </button>
              </div>

              {/* keyboard hint */}
              <p className="font-mono text-[9.5px] text-dim/60 text-center" dir="ltr">
                ← → arrow keys to navigate
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
