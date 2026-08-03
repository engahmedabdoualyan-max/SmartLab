/* ------------------------------------------------------------------ *
 *  CalibrationWizard.tsx — AI Dynamic Plowman Regression Panel
 *
 *  The engineer enters REAL cube-crush results (day, MPa).
 *  We fit  fc(t) = A·ln(t) + B  by exact least-squares — closed form,
 *  no library. Fit line + RMSE update live on every keystroke.
 *  "Lock & Save" persists the coefficients and (if a proxy exists in
 *  env) would mirror them backend-side; in standalone mode they live
 *  in localStorage and immediately re-train the forecast + curve in
 *  the Digital Twin tab.
 * ------------------------------------------------------------------ */

import { useMemo, useState, useRef, useEffect } from "react";
import type { NodeSim } from "../sim";
import { useLang } from "../i18n";
import { cn } from "../utils/cn";
import {
  type CalibrationModel,
  type CalibrationPoint,
  type MaturityMethod,
  loadCalibration,
  saveCalibration,
  fitPlowman,
  plowmanStrength,
  forecastStrength,
  strengthFromMaturity,
} from "../regression";

export default function CalibrationWizard({
  sim,
  onModelChange,
}: {
  sim: NodeSim;
  onModelChange: (m: CalibrationModel) => void;
}) {
  const { t } = useLang();
  const [model, setModel] = useState<CalibrationModel>(() => loadCalibration());
  const [dayIn, setDayIn] = useState<string>("3");
  const [mpaIn, setMpaIn] = useState<string>("20");
  const [savedFlag, setSavedFlag] = useState(false);

  /* derived fit from the DRAFT points (live preview) */
  const fit = useMemo(() => fitPlowman(model.points), [model.points]);
  const a = fit.a, b = fit.b, rmse = fit.rmse;

  const addPoint = () => {
    const d = parseFloat(dayIn);
    const m = parseFloat(mpaIn);
    if (!Number.isFinite(d) || !Number.isFinite(m) || d <= 0.05 || m <= 0 || m > 120) return;
    const next: CalibrationModel = {
      ...model,
      updatedAt: Date.now(),
      points: [...model.points.filter(p => p.day !== d), { day: d, mpa: m }]
        .sort((x, y) => x.day - y.day),
    };
    setModel(next);
  };

  const removePoint = (day: number) => {
    setModel({
      ...model,
      updatedAt: Date.now(),
      points: model.points.filter(p => p.day !== day),
    });
  };

  const clearPoints = () => {
    setModel({ ...model, updatedAt: Date.now(), points: [] });
  };

  const saveModel = () => {
    const next: CalibrationModel = {
      ...model,
      a, b, rmse,
      updatedAt: Date.now(),
      fitCount: model.fitCount + 1,
    };
    saveCalibration(next);
    setModel(next);
    onModelChange(next);
    /* retro-update the simulation so downstream panels use learned A/B */
    sim.plowmanA = a;
    sim.plowmanB = b;
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 2200);
  };

  const fitCurveData = useMemo(() => {
    const rows: { day: number; mpa: number }[] = [];
    const maxD = Math.max(28, ...model.points.map(p => p.day), sim.virtualDay * 1.3);
    for (let i = 0; i <= 100; i++) {
      const d = 0.05 + (i / 100) * maxD;
      rows.push({ day: d, mpa: plowmanStrength(d, { a, b }) });
    }
    return rows;
  }, [model.points, a, b, sim.virtualDay]);

  const currentEstimate = useMemo(
    () => strengthFromMaturity(
      model.method,
      Math.max(0.04, sim.virtualDay),
      { a, b },
      [], // no temp history in standalone — falls back to 23 °C ambient
      model.datumTempC,
      model.activationQ
    ),
    [model.method, a, b, sim.virtualDay, model.datumTempC, model.activationQ]
  );

  const rfcast = useMemo(() => forecastStrength(
    { a, b },
    model.targetMpa,
    null,
    sim.virtualDay,
    currentEstimate,
    model.points
  ), [a, b, model.targetMpa, model.points, sim.virtualDay, currentEstimate]);

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">

      {/* LEFT — data entry + coefficients */}
      <div className="space-y-3">

        {/* header */}
        <div className="border border-line bg-scope/40 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper mb-1">
            {t("cal.wizard")}
          </div>
          <p className="font-body text-[12px] leading-relaxed text-mute">
            {t("cal.blurb")}
          </p>
        </div>

        {/* point entry */}
        <div className="border border-line bg-scope/30 p-3.5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim mb-1.5">
                {t("cal.age.d")}
              </label>
              <input
                value={dayIn}
                onChange={e => setDayIn(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                className="w-full bg-scope border border-line px-3 py-2 font-mono text-[12px] text-paper
                           placeholder:text-dim/40 focus:outline-none focus:border-copperdim transition-colors"
                placeholder="3"
              />
            </div>
            <div>
              <label className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim mb-1.5">
                {t("cal.age.mpa")}
              </label>
              <input
                value={mpaIn}
                onChange={e => setMpaIn(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                className="w-full bg-scope border border-line px-3 py-2 font-mono text-[12px] text-paper
                           placeholder:text-dim/40 focus:outline-none focus:border-copperdim transition-colors"
                placeholder="20.0"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addPoint}
              className="flex-1 border border-signaldeep bg-signal/10 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-signal hover:bg-signal/20 transition-colors"
            >
              + {t("cal.add")}
            </button>
            <button
              onClick={clearPoints}
              className="border border-line px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim hover:text-alarm hover:border-alarm transition-colors"
            >
              {t("cal.clear")}
            </button>
          </div>
        </div>

        {/* points table */}
        <div className="border border-line overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-line">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim">
              {t("cal.points")} · {model.points.length}
            </span>
            <span className="font-mono text-[9px] text-dim">
              RMSE {rmse !== null ? rmse.toFixed(2) : "—"} MPa
            </span>
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            {model.points.length === 0 ? (
              <div className="px-4 py-6 text-center font-mono text-[11px] text-dim">
                {t("cal.empty")}
              </div>
            ) : (
              model.points.map(p => (
                <div
                  key={p.day}
                  className="grid grid-cols-[1fr_1fr_auto] items-center border-b border-line/50 px-3 py-2 hover:bg-raise/30"
                >
                  <span className="font-mono text-[11.5px] text-paper tabular-nums">
                    d{p.day.toFixed(2)}
                  </span>
                  <span className="font-mono text-[11.5px] text-teal tabular-nums">
                    {p.mpa.toFixed(2)} MPa
                  </span>
                  <button
                    onClick={() => removePoint(p.day)}
                    className="font-mono text-[10px] text-dim hover:text-alarm uppercase tracking-wider"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* coefficients */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: "A (fit)", v: a.toFixed(3), tone: "text-copper" },
            { l: "B (fit)", v: b.toFixed(3), tone: "text-teal" },
            { l: "Points", v: String(model.points.length), tone: "text-paper" },
          ].map(m => (
            <div key={m.l} className="border border-line bg-scope/30 px-2.5 py-2 text-center">
              <div className={cn("font-mono font-bold text-[16px] tabular-nums", m.tone)}>{m.v}</div>
              <div className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-dim mt-0.5">{m.l}</div>
            </div>
          ))}
        </div>

        {/* v1.9.0 — ASTM C1074 maturity method toggle */}
        <div>
          <label className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim mb-1.5">
            Maturity Method (ASTM C1074)
          </label>
          <div className="flex gap-1.5">
            {([
              { key: "plowman" as MaturityMethod, label: "Plowman ln(t)" },
              { key: "nurse_saul" as MaturityMethod, label: "Nurse-Saul M(t)" },
              { key: "arrhenius" as MaturityMethod, label: "Arrhenius tₑ" },
            ]).map(m => (
              <button
                key={m.key}
                onClick={() => setModel({ ...model, method: m.key })}
                className={cn(
                  "border px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
                  model.method === m.key
                    ? "border-copper bg-copper/12 text-copper"
                    : "border-line text-dim hover:text-mute hover:border-line2"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          {model.method !== "plowman" && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {model.method === "nurse_saul" && (
                <div>
                  <label className="block font-mono text-[8.5px] text-dim mb-1">Datum T₀ (°C)</label>
                  <input type="number" value={model.datumTempC}
                    onChange={e => setModel({ ...model, datumTempC: Number(e.target.value) || -10 })}
                    className="w-full bg-scope border border-line px-2 py-1 font-mono text-[11px] text-paper focus:outline-none focus:border-copperdim" />
                </div>
              )}
              {model.method === "arrhenius" && (
                <div>
                  <label className="block font-mono text-[8.5px] text-dim mb-1">Q/R (K)</label>
                  <input type="number" value={model.activationQ}
                    onChange={e => setModel({ ...model, activationQ: Number(e.target.value) || 5000 })}
                    className="w-full bg-scope border border-line px-2 py-1 font-mono text-[11px] text-paper focus:outline-none focus:border-copperdim" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* target strength */}
        <div>
          <label className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim mb-1.5">
            {t("cal.target")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={120}
              value={model.targetMpa}
              onChange={e => {
                const v = parseFloat(e.target.value);
                setModel({ ...model, targetMpa: Number.isFinite(v) ? Math.min(120, Math.max(1, v)) : model.targetMpa });
              }}
              className="w-28 bg-scope border border-line px-3 py-2 font-mono text-[12px] text-paper
                         focus:outline-none focus:border-copperdim transition-colors text-end"
            />
            <span className="font-mono text-[11px] text-dim">MPa</span>
          </div>
        </div>

        {/* save */}
        <button
          onClick={saveModel}
          disabled={model.points.length < 2}
          className={cn(
            "w-full border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
            model.points.length < 2
              ? "border-line2 text-dim/60 bg-scope/30 cursor-not-allowed"
              : savedFlag
              ? "border-signaldeep bg-signal/15 text-signal"
              : "border-copperdim bg-copper/10 text-copper hover:bg-copper/20"
          )}
        >
          {savedFlag ? `✓ ${t("cal.saved")}` : t("cal.save")}
        </button>
        <div className="font-mono text-[9px] leading-relaxed text-dim/70">
          {t("cal.hint")}
        </div>
      </div>

      {/* RIGHT — live fit + forecast preview */}
      <div className="space-y-3 min-w-0">
        <FitChart
          points={model.points}
          curve={fitCurveData}
          a={a}
          b={b}
          rmse={rmse}
          targetMpa={model.targetMpa}
          virtualDay={sim.virtualDay}
        />

        {/* forecast preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { l: t("cal.f1"), v: `d${rfcast.predictedDay.toFixed(2)}`, tone: "text-paper" },
            { l: t("cal.f2"), v: `${rfcast.confidencePct}%`, tone: rfcast.grade === "HIGH" ? "text-signal" : rfcast.grade === "MEDIUM" ? "text-copper" : "text-alarm" },
            { l: t("cal.f3"), v: rfcast.targetIsReachable ? "yes" : "no", tone: rfcast.targetIsReachable ? "text-signal" : "text-alarm" },
            { l: t("cal.f4"), v: rfcast.daysRemaining > 0 ? `+${rfcast.daysRemaining.toFixed(1)} d` : "✓", tone: rfcast.daysRemaining > 0 ? "text-copper" : "text-signal" },
          ].map(m => (
            <div key={m.l} className="border border-line bg-scope/30 px-2.5 py-2 text-center">
              <div className={cn("font-mono font-semibold text-[15px] tabular-nums", m.tone)}>{m.v}</div>
              <div className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-dim mt-0.5">{m.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
function FitChart({
  points, curve, a, b, rmse, targetMpa, virtualDay,
}: {
  points: CalibrationPoint[];
  curve: { day: number; mpa: number }[];
  a: number;  b: number;
  rmse: number | null;
  targetMpa: number;
  virtualDay: number;
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

    if (curve.length === 0) return;

    const padL = 44, padR = 42, padT = 14, padB = 24;
    const pw = W - padL - padR, ph = H - padT - padB;
    const maxD = curve[curve.length - 1].day;
    const tMax = Math.max(targetMpa, ...curve.map(c => c.mpa), ...points.map(p => p.mpa)) * 1.15;
    const x = (d: number) => padL + (d / maxD) * pw;
    const y = (m: number) => padT + (1 - m / tMax) * ph;

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
      if (d > maxD) return;
      const gx = x(d);
      ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, H - padB); ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText(`${d}d`, gx, H - 6);
    });

    // target line
    const ty = y(targetMpa);
    ctx.strokeStyle = "rgba(222,154,60,0.5)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(padL, ty); ctx.lineTo(W - padR, ty); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(222,154,60,0.9)";
    ctx.textAlign = "left";
    ctx.fillText(`target ${targetMpa.toFixed(1)} MPa`, padL + 4, ty - 4);

    // fitted curve
    ctx.strokeStyle = "#8fd694";
    ctx.lineWidth = 1.8;
    ctx.shadowColor = "rgba(143,214,148,0.5)";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    curve.forEach((c, i) => {
      if (i === 0) ctx.moveTo(x(c.day), y(c.mpa));
      else ctx.lineTo(x(c.day), y(c.mpa));
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // residuals stems (crystal visual: point → curve)
    ctx.strokeStyle = "rgba(228,89,60,0.3)";
    ctx.lineWidth = 1;
    points.forEach(p => {
      const py = y(p.mpa);
      const curveY = y(plowmanStrength(p.day, { a, b }));
      ctx.beginPath(); ctx.moveTo(x(p.day), curveY); ctx.lineTo(x(p.day), py); ctx.stroke();
    });

    // calibration points
    points.forEach(p => {
      ctx.fillStyle = "#de9a3c";
      ctx.strokeStyle = "#f2b866";
      ctx.beginPath(); ctx.arc(x(p.day), y(p.mpa), 3.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });

    // virtual-day marker
    if (virtualDay > 0 && virtualDay < maxD) {
      ctx.strokeStyle = "rgba(255,122,92,0.7)";
      ctx.setLineDash([3, 3]);
      const vx = x(virtualDay);
      ctx.beginPath(); ctx.moveTo(vx, padT); ctx.lineTo(vx, H - padB); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ff7a5c";
      ctx.fillText(`now`, vx + 4, padT + 8);
    }

    // equation label
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(143,214,148,0.85)";
    ctx.textAlign = "right";
    ctx.fillText(
      `fc(t) = ${a.toFixed(2)}·ln(t) + ${b.toFixed(2)}` + (rmse !== null ? ` · RMSE ${rmse.toFixed(2)}` : ""),
      W - padR, padT + 8
    );
  }, [points, curve, a, b, rmse, targetMpa, virtualDay]);

  return (
    <div className="border border-line overflow-hidden">
      <div className="px-3 py-1.5 border-b border-line font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim">
        live regression preview
      </div>
      <canvas ref={ref} className="block w-full h-[228px] bg-scope" />
    </div>
  );
}
