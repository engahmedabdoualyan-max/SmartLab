import { useEffect, useRef } from "react";
import type { DiagnosticLog, NodeSim, Scenario } from "../sim";
import { MAX_BUFFERED_FRAMES } from "../sim";
import { Chip, Led } from "../ui";
import { cn } from "../utils/cn";

function fitCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* The plot exposes the same log hydration law that drives NodeSim. */
function HydrationCurve({ sim }: { sim: NodeSim }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = fitCanvas(canvas);
    if (!ctx) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const left = 37;
    const right = 18;
    const top = 14;
    const bottom = 24;
    const pw = width - left - right;
    const ph = height - top - bottom;
    const x = (day: number) => left + ((day - 1) / 27) * pw;
    const maturity = (day: number) => {
      const n = Math.log1p(day) / Math.log(29);
      return ((1 - Math.exp(-2.35 * n)) / (1 - Math.exp(-2.35))) * 100;
    };
    const freq = (day: number) => 229.4 - 24.2 * (maturity(day) / 100);
    const yHydration = (v: number) => top + (1 - v / 100) * ph;
    const yFreq = (v: number) => top + (1 - (v - 204) / 27) * ph;

    ctx.clearRect(0, 0, width, height);
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.strokeStyle = "rgba(143,214,148,0.09)";
    ctx.fillStyle = "rgba(143,160,147,0.7)";
    for (let p = 0; p <= 100; p += 25) {
      const gy = yHydration(p);
      ctx.beginPath();
      ctx.moveTo(left, gy);
      ctx.lineTo(width - right, gy);
      ctx.stroke();
      ctx.fillText(`${p}%`, 2, gy + 3);
    }
    [1, 7, 14, 21, 28].forEach((day) => {
      const gx = x(day);
      ctx.beginPath();
      ctx.moveTo(gx, top);
      ctx.lineTo(gx, height - bottom);
      ctx.stroke();
      ctx.fillText(`D${day}`, gx - 8, height - 8);
    });

    const stroke = (color: string, getter: (day: number) => number, scale: (v: number) => number, widthPx: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = widthPx;
      ctx.shadowColor = color;
      ctx.shadowBlur = 7;
      ctx.beginPath();
      for (let i = 0; i <= 108; i++) {
        const day = 1 + (i / 108) * 27;
        if (i === 0) ctx.moveTo(x(day), scale(getter(day)));
        else ctx.lineTo(x(day), scale(getter(day)));
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    stroke("#8fd694", maturity, yHydration, 1.7);
    stroke("#de9a3c", freq, yFreq, 1.5);

    const day = sim.virtualDay;
    const markerX = x(day);
    ctx.strokeStyle = sim.registrationBlocked ? "#e4593c" : "#f2b866";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(markerX, top);
    ctx.lineTo(markerX, height - bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = sim.registrationBlocked ? "#ff7a5c" : "#f2b866";
    ctx.beginPath();
    ctx.arc(markerX, yHydration(sim.hydration), 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`now D${day.toFixed(1)}`, Math.min(markerX + 5, width - 67), top + 10);

    ctx.fillStyle = "#8fd694";
    ctx.fillText("hydration %", left + 4, top + 11);
    ctx.fillStyle = "#de9a3c";
    ctx.fillText("Fres kHz (right scale)", left + 98, top + 11);
  });
  return <canvas ref={ref} className="block w-full h-[188px] bg-scope" />;
}

function ScenarioButton({
  active,
  tone,
  title,
  note,
  onClick,
}: {
  active: boolean;
  tone: "signal" | "copper" | "alarm";
  title: string;
  note: string;
  onClick: () => void;
}) {
  const toneClass =
    tone === "signal"
      ? "hover:border-signaldeep hover:bg-signal/5"
      : tone === "alarm"
      ? "hover:border-alarm/70 hover:bg-alarm/10"
      : "hover:border-copperdim hover:bg-copper/5";
  const activeClass =
    tone === "signal"
      ? "border-signaldeep bg-signal/10"
      : tone === "alarm"
      ? "border-alarm bg-alarm/10"
      : "border-copper bg-copper/10";
  return (
    <button
      onClick={onClick}
      className={cn(
        "min-h-[91px] border border-line px-3.5 py-3 text-left transition-all duration-200",
        toneClass,
        active && activeClass
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-1.5 h-1.5 w-1.5 shrink-0",
            tone === "signal" && "bg-signal",
            tone === "copper" && "bg-copper",
            tone === "alarm" && "bg-alarm"
          )}
        />
        <span className="font-display font-semibold text-[13px] uppercase tracking-wide text-paper">{title}</span>
      </div>
      <p className="mt-1.5 pl-3.5 font-body text-[11.5px] leading-snug text-mute">{note}</p>
    </button>
  );
}

const logTone: Record<DiagnosticLog["level"], string> = {
  INFO: "text-mute",
  MATH: "text-teal",
  VALID: "text-signal",
  NET: "text-copper",
  WARN: "text-copperhi",
  FAULT: "text-alarmhi",
};

function Stat({ value, label, tone = "paper" }: { value: string; label: string; tone?: "paper" | "signal" | "copper" | "alarm" }) {
  return (
    <div className="border border-line bg-scope/30 px-3 py-2.5">
      <div
        className={cn(
          "font-mono text-[21px] font-semibold leading-none tabular-nums",
          tone === "paper" && "text-paper",
          tone === "signal" && "text-signal",
          tone === "copper" && "text-copper",
          tone === "alarm" && "text-alarmhi"
        )}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim">{label}</div>
    </div>
  );
}

const scenarioTitle: Record<Scenario, string> = {
  NORMAL_CURING: "normal curing",
  PRE_CURED_FRAUD: "fraud injection",
  PHYSICAL_DISCONNECTION: "wire disconnection",
  ACOUSTIC_COLLAPSE: "acoustic collapse",
  MIX_ADULTERATION: "mix adulteration",
};

export default function Forensics({ sim }: { sim: NodeSim }) {
  const d = sim.diagnostics;
  const failing = sim.registrationBlocked || sim.status === "CRUSHED";
  const certificationTone = sim.certification === "CERTIFIED" ? "signal" : failing ? "alarm" : "copper";

  return (
    <section className="mt-8 panel panel-corner overflow-hidden" aria-label="Forensic simulation controls and diagnostics">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 border-b border-line bg-raise/40">
        <div className="flex items-center gap-2.5">
          <Led tone={failing ? "alarm" : "signal"} />
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-paper">Forensic QA simulator</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
          autonomous virtual specimen · {scenarioTitle[sim.scenario]}
        </span>
        <span className="ml-auto font-mono text-[10px] text-dim">
          indexeddb outbox: {d.bufferDepth}/{MAX_BUFFERED_FRAMES}
        </span>
      </div>

      <div className="grid gap-0 xl:grid-cols-[1.08fr_0.92fr]">
        {/* scenario controls + model */}
        <div className="p-4 md:p-5 xl:border-r border-line">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper">1. scenario injection matrix</div>
            <span className="font-body text-[12px] text-mute">Each mode mutates the actual telemetry lineage, validator, and routing model.</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <ScenarioButton
              active={sim.scenario === "NORMAL_CURING"}
              tone="signal"
              title="Normal Curing Mode"
              note="Fresh Day 1 baseline; logarithmic hydration and predictable micro-strain."
              onClick={() => sim.runNormalCuring()}
            />
            <ScenarioButton
              active={sim.scenario === "PRE_CURED_FRAUD"}
              tone="copper"
              title="Pre-Cured Specimen Fraud"
              note="Injects a Day 28 profile into a new session; registration must block."
              onClick={() => sim.injectPreCuredFraud()}
            />
            <ScenarioButton
              active={sim.scenario === "PHYSICAL_DISCONNECTION"}
              tone="alarm"
              title="Physical Disconnection Tamper"
              note="Cuts signal to 0 mV without a strain pulse; marks NOT CERTIFIED."
              onClick={() => sim.triggerPhysicalDisconnection()}
            />
            <ScenarioButton
              active={sim.scenario === "ACOUSTIC_COLLAPSE"}
              tone="alarm"
              title="Acoustic Compression Collapse"
              note="Escalates Gaussian noise, then validates the 30 ms spike-to-open latch."
              onClick={() => sim.triggerAcousticCollapse()}
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_210px] items-start">
            <div className="border border-line overflow-hidden">
              <div className="flex items-center gap-3 px-3 py-2 border-b border-line font-mono text-[10px] tracking-[0.16em] uppercase text-mute">
                <span className="text-signal">Hydration</span> /
                <span className="text-copper">resonance drift</span>
                <span className="ml-auto text-dim">Day 1 → Day 28</span>
              </div>
              <HydrationCurve sim={sim} />
            </div>
            <div className="space-y-2.5">
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim">virtual clock</div>
              <div className="font-display text-4xl font-bold tabular-nums text-paper">D{sim.virtualDay.toFixed(2)}</div>
              <div className="font-mono text-[11px] text-mute">{sim.timeScale}x compression</div>
              <div className="flex gap-1.5">
                {[1, 8, 32].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => sim.setTimeScale(scale)}
                    className={cn(
                      "border px-2 py-1 font-mono text-[10px] transition-colors",
                      sim.timeScale === scale
                        ? "border-copperdim bg-copper/10 text-copper"
                        : "border-line2 text-dim hover:text-paper"
                    )}
                  >
                    {scale}x
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-line font-mono text-[10.5px] leading-relaxed text-mute">
                hydration <span className="text-signal">{sim.hydration.toFixed(1)}%</span><br />
                micro-strain <span className="text-paper">{sim.microStrain.toFixed(1)} µε</span><br />
                ADC σ <span className="text-copper">{sim.noiseSigma.toFixed(1)} ct</span>
              </div>
            </div>
          </div>
        </div>

        {/* network + master stats */}
        <div className="p-4 md:p-5 bg-deep/20">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper">2. outage recovery & lineage health</div>
          <div className="mt-3 flex items-center justify-between gap-4 border border-line bg-scope/60 px-3.5 py-3">
            <div>
              <div className="font-display font-semibold text-[15px] tracking-wide text-paper">Simulate Network Blackout</div>
              <div className="mt-0.5 font-mono text-[10px] text-dim">
                {sim.networkBlackout
                  ? "upload channels dropped · IndexedDB hoarding active"
                  : sim.recovering
                  ? "network restored · concurrent replay in progress"
                  : "live route nominal · 1 Hz accepted"}
              </div>
            </div>
            <button
              onClick={() => sim.toggleNetworkBlackout()}
              aria-pressed={sim.networkBlackout}
              className={cn(
                "relative h-7 w-12 border transition-colors duration-200",
                sim.networkBlackout ? "border-alarm bg-alarm/20" : "border-signaldeep bg-signal/10"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-[18px] w-[18px] transition-transform duration-200",
                  sim.networkBlackout ? "translate-x-[25px] bg-alarmhi" : "translate-x-1 bg-signal"
                )}
              />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat value={String(d.framesGenerated)} label="frames made" />
            <Stat value={String(d.framesAccepted)} label="accepted" tone="signal" />
            <Stat value={String(d.bufferDepth)} label="buffered" tone={d.bufferDepth ? "copper" : "paper"} />
            <Stat value={String(d.framesRecovered)} label="recovered" tone="signal" />
            <Stat value={`${d.retryOverhead.toFixed(1)}%`} label="retry overhead" tone={d.retryAttempts ? "copper" : "paper"} />
            <Stat value={`${d.recoveryInFlight}/3`} label="replay lanes" tone={sim.recovering ? "copper" : "paper"} />
          </div>

          <div className="mt-4 border-t border-line pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={certificationTone === "signal" ? "signal" : "copper"}>
                certification: {sim.certification.replace("_", " ")}
              </Chip>
              {sim.registrationBlocked && <Chip tone="copper">registration blocked</Chip>}
              {sim.collapsePhase !== "IDLE" && <Chip tone="copper">collapse: {sim.collapsePhase.toLowerCase()}</Chip>}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[10.5px]">
              <div className="flex justify-between text-dim"><span>lineage checks</span><span className="text-paper">{d.lineageChecks}</span></div>
              <div className="flex justify-between text-dim"><span>validation fail</span><span className={d.validationFail ? "text-alarm" : "text-paper"}>{d.validationFail}</span></div>
              <div className="flex justify-between text-dim"><span>noise mean</span><span className="text-teal">{d.avgNoiseCounts.toFixed(2)} ct</span></div>
              <div className="flex justify-between text-dim"><span>noise std dev</span><span className="text-teal">{d.noiseStdDev.toFixed(2)} ct</span></div>
              <div className="flex justify-between text-dim"><span>noise max</span><span className="text-copper">{d.highestNoiseCounts.toFixed(1)} ct</span></div>
              <div className="flex justify-between text-dim"><span>last route RTT</span><span className="text-paper">{d.lastLatencyMS} ms</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* diagnostic lineage terminal */}
      <div className="border-t border-line">
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-raise/30">
          <Led tone={failing ? "alarm" : "copper"} size={6} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">3. real-time forensic diagnostic log</span>
          <span className="font-mono text-[10px] text-dim">math conversions · validator lineage · storage events · network routes</span>
          <span className="ml-auto font-mono text-[10px] text-dim">last {Math.min(sim.logs.length, 140)} events</span>
        </div>
        <div className="max-h-[310px] overflow-y-auto bg-scope/70">
          {sim.logs.length === 0 ? (
            <div className="px-4 py-4 font-mono text-[11px] text-dim">waiting for simulator events...</div>
          ) : (
            sim.logs.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[78px_58px_70px_1fr] gap-x-3 border-b border-line/50 px-4 py-1.5 font-mono text-[10.5px] leading-relaxed hover:bg-raise/45">
                <span className="text-dim">+{entry.t.toFixed(2)}s</span>
                <span className={logTone[entry.level]}>{entry.level}</span>
                <span className="text-teal">{entry.channel}</span>
                <span className="min-w-0 text-mute">
                  <span className="text-paper">{entry.message}</span>
                  {entry.detail && <span className="text-dim"> — {entry.detail}</span>}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}