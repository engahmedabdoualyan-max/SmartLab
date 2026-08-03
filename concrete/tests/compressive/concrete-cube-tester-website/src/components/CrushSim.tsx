import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { useT } from "@/i18n";

type Phase = "idle" | "tare" | "loading" | "crushed";

const AREA = 22500; // mm²  150×150

export default function CrushSim() {
  const tr = useT();
  const [phase, setPhase] = useState<Phase>("idle");
  const [force, setForce] = useState(0);
  const [peak, setPeak] = useState(0);
  const [time, setTime] = useState(0);
  const [buzzer, setBuzzer] = useState(false);
  const [log, setLog] = useState<string[]>(["CCT-150 READY_", "Time(s),Force(kN),Stress(MPa),Peak(kN)"]);

  const timerRef = useRef<number | null>(null);
  const buzzerRef = useRef<number | null>(null);
  const tareRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (buzzerRef.current) window.clearTimeout(buzzerRef.current);
      if (tareRef.current) window.clearTimeout(tareRef.current);
    };
  }, []);

  const stopTimers = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (buzzerRef.current) window.clearTimeout(buzzerRef.current);
    if (tareRef.current) window.clearTimeout(tareRef.current);
  };

  const tare = () => {
    if (phase === "loading" || phase === "tare") return;
    stopTimers();
    setPhase("tare");
    setBuzzer(false);
    tareRef.current = window.setTimeout(() => {
      setForce(0);
      setPeak(0);
      setTime(0);
      setLog((l) => [...l.slice(-6), "TARE OK - READY"]);
      setPhase("idle");
    }, 650);
  };

  const start = () => {
    if (phase === "loading" || phase === "tare") return;
    stopTimers();
    setBuzzer(false);
    setForce(0);
    setPeak(0);
    setTime(0);
    setPhase("tare");
    setLog((l) => [...l.slice(-6), "NEW TEST", "Time(s),Force(kN),Stress(MPa),Peak(kN)"]);

    tareRef.current = window.setTimeout(() => {
      setPhase("loading");
      const target = 480 + Math.random() * 240; // kN
      let f = 0;
      let failed = false;
      const started = performance.now();

      timerRef.current = window.setInterval(() => {
        const t = (performance.now() - started) / 1000;

        if (!failed) {
          f += (target / 62) * (0.7 + Math.random() * 0.6);
          f = Math.min(f + Math.random() * 1.5, target);
          if (f >= target - 0.5) {
            f = target;
            failed = true;
          }
        } else {
          f *= 0.55; // انهيار مفاجئ
          if (f < target * 0.13) {
            window.clearInterval(timerRef.current!);
            const pk = target;
            const s = (f * 1000) / AREA;
            setForce(f);
            setTime(t);
            setPeak(pk);
            setPhase("crushed");
            setBuzzer(true);
            setLog((l) =>
              [...l.slice(-6), `${t.toFixed(2)},${f.toFixed(2)},${s.toFixed(2)},${pk.toFixed(2)}`, "CUBE CRUSHED", `Peak Load Recorded: ${pk.toFixed(2)} kN`],
            );
            buzzerRef.current = window.setTimeout(() => setBuzzer(false), 1600);
            return;
          }
        }

        const pk = Math.max(target, 0) && failed ? target : Math.max(f, 0);
        const s = (f * 1000) / AREA;
        setForce(f);
        setPeak(failed ? target : pk);
        setTime(t);
        if (Math.floor(t * 10) % 3 === 0) {
          setLog((l) => [...l.slice(-6), `${t.toFixed(2)},${f.toFixed(2)},${s.toFixed(2)},${(failed ? target : f).toFixed(2)}`]);
        }
      }, 95);
    }, 650);
  };

  const stress = (force * 1000) / AREA;
  const pct = Math.min((force / 760) * 100, 100);
  const barColor = phase === "crushed" ? "#c42b2b" : pct > 85 ? "#e8590c" : pct > 50 ? "#b97a10" : "#2f8f46";

  const lcd1 =
    phase === "crushed"
      ? "--- CRUSHED --- "
      : `F:${force.toFixed(1).padStart(6)} kN`;
  const lcd2 =
    phase === "idle"
      ? "TARE=START READY"
      : phase === "tare"
        ? "TARE ...        "
        : phase === "crushed"
          ? `Max:${peak.toFixed(1)} kN    `
          : `S:${stress.toFixed(1)}MPa P:${peak.toFixed(0)}`;

  return (
    <div className="relative border-2 border-black/60 bg-ink p-4 hs sm:p-5">
      {/* مسامير الزوايا */}
      {["top-2 right-2", "top-2 left-2", "bottom-2 right-2", "bottom-2 left-2"].map((pos) => (
        <span key={pos} className={cn("absolute h-2.5 w-2.5 rounded-full border border-black/50 bg-gradient-to-br from-[#4a5866] to-[#22303d]", pos)} />
      ))}

      {/* رأس الجهاز */}
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p className="font-display text-lg font-bold leading-none text-paper">
            CCT-150 <span className="text-safety">READOUT</span>
          </p>
          <p dir="ltr" className="mt-1 text-right font-mono text-[10px] tracking-[0.25em] text-steel">
            ARDUINO UNO · HX711 · 24-BIT
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-steel">
          <span className="flex items-center gap-1.5">
            <span className="led led-on-green" /> {tr.sim.pwr}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={cn("led", phase === "loading" || phase === "tare" ? "led-on-amber" : "led-off")} />{" "}
            {tr.sim.run}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={cn("led", phase === "crushed" ? "led-on-red" : "led-off")} /> {tr.sim.alarm}
          </span>
        </div>
      </div>

      {/* شاشة LCD */}
      <div className="lcd border-4 border-[#2c3a20] px-3 py-2.5" dir="ltr">
        <p className="truncate text-sm font-semibold sm:text-[15px]">{lcd1}</p>
        <p className="truncate text-sm font-semibold sm:text-[15px]">{lcd2}</p>
      </div>

      {/* شريط القوة */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between font-mono text-[10px] tracking-widest text-steel">
          <span>{tr.sim.bar}</span>
          <span className="bidi">0 — 760 kN</span>
        </div>
        <div className="h-3 w-full border border-black/50 bg-[#0c131b]">
          <div className="force-bar h-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
        </div>
      </div>

      {/* قراءات */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[
          { l: tr.sim.force, v: force.toFixed(1), hot: true },
          { l: tr.sim.peak, v: peak.toFixed(1) },
          { l: tr.sim.stress, v: stress.toFixed(2) },
          { l: tr.sim.time, v: time.toFixed(1) },
        ].map((s) => (
          <div key={s.l} className="border border-white/10 bg-[#101a24] px-1 py-2">
            <p className={cn("font-display text-lg font-bold tabular-nums leading-none sm:text-xl", s.hot && phase === "crushed" ? "text-[#ff5555]" : s.hot ? "text-safety-hi" : "text-paper")}>
              {s.v}
            </p>
            <p className="mt-1 text-[10px] text-steel">{s.l}</p>
          </div>
        ))}
      </div>

      {/* أزرار */}
      <div className="no-print mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={start}
          disabled={phase === "loading" || phase === "tare"}
          className="cursor-pointer border border-safety bg-safety px-3 py-2.5 font-display text-sm font-bold text-white transition-all hover:bg-safety-hi active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {tr.sim.start}
        </button>
        <button
          onClick={tare}
          disabled={phase === "loading" || phase === "tare"}
          className="cursor-pointer border border-white/25 bg-transparent px-3 py-2.5 font-display text-sm font-bold text-paper transition-all hover:border-paper hover:bg-white/10 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {tr.sim.tare}
        </button>
      </div>

      {/* سجل Serial */}
      <div className="mt-3 border border-white/10 bg-codebg" dir="ltr">
        <p className="flex items-center justify-between border-b border-white/10 px-2.5 py-1 font-mono text-[10px] tracking-widest text-steel">
          <span>SERIAL MONITOR · 9600</span>
          <span className={cn(buzzer && "font-bold text-[#ff5555]")}>{buzzer ? "!! BUZZER ON" : "CSV"}</span>
        </p>
        <div className="h-[92px] overflow-hidden px-2.5 py-1.5 font-mono text-[10.5px] leading-[1.55] text-[#7fb8ff]">
          {log.slice(-6).map((l, i) => (
            <p key={i} className={cn("truncate", l.includes("CRUSHED") && "font-bold text-[#ff7a6b]", l.includes("Peak Load") && "text-safety-hi")}>
              {l.includes("CRUSHED") ? "» " : "> "}
              {l}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
