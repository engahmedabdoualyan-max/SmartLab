/* ================================================================ *
 *  CloudPanel.tsx — InfluxDB 3 Cloud Serverless integration console
 *
 *  Configures the *proxy* endpoint (never a token), runs the live SQL
 *  queries, and plots the returned conductance sweep against the
 *  stored baseline with a client-side RMSD read-out.
 * ================================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Led } from "../ui";
import { cn } from "../utils/cn";
import {
  type InfluxConfig,
  type RmsdRow,
  type SweepRow,
  InfluxError,
  SQL_SAMPLES,
  computeRmsd,
  fetchBaselineSweep,
  fetchLatestSweep,
  fetchRmsdHistory,
  interpolateOntoGrid,
  loadInfluxConfig,
  saveInfluxConfig,
} from "../influx";
import {
  type CloudReportPayload,
  exportCloudPdf,
  exportCloudXlsx,
  openPrintView,
} from "../cloudReport";

type Conn = "idle" | "testing" | "live" | "error";

/* ── conductance vs frequency, live vs baseline ──────────────────── */
function SweepChart({
  live, baseline, canvasRef,
}: { live: SweepRow[]; baseline: SweepRow[]; canvasRef?: React.RefObject<HTMLCanvasElement | null> }) {
  const localRef = useRef<HTMLCanvasElement>(null);
  const ref = canvasRef ?? localRef;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const padL = 44, padR = 12, padT = 14, padB = 26;
    const pw = W - padL - padR;
    const ph = H - padT - padB;

    if (live.length === 0) {
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(143,160,147,0.6)";
      ctx.fillText("no rows returned — run a query", padL, H / 2);
      return;
    }

    const fMin = live[0].freq_khz;
    const fMax = live[live.length - 1].freq_khz;
    const allG = [
      ...live.map(r => r.conductance_us),
      ...baseline.map(r => r.conductance_us),
    ];
    const gMax = Math.max(1, ...allG) * 1.1;

    const lx = Math.max(Math.log10(Math.max(fMin, 0.1)), -1);
    const hx = Math.log10(Math.max(fMax, 1));
    const x = (f: number) =>
      padL + ((Math.log10(Math.max(f, 0.1)) - lx) / Math.max(hx - lx, 1e-6)) * pw;
    const y = (g: number) => padT + (1 - g / gMax) * ph;

    /* graticule */
    ctx.strokeStyle = "rgba(143,214,148,0.08)";
    ctx.lineWidth = 1;
    ctx.font = "8.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(143,160,147,0.65)";
    for (let i = 0; i <= 4; i++) {
      const gv = (gMax / 4) * i;
      const gy = y(gv);
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(W - padR, gy); ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(Math.round(gv).toString(), padL - 5, gy + 3);
    }
    ctx.textAlign = "center";
    [1, 10, 100, 500].forEach(f => {
      if (f < fMin || f > fMax) return;
      const gx = x(f);
      ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, H - padB); ctx.stroke();
      ctx.fillText(`${f}k`, gx, H - 8);
    });
    ctx.textAlign = "left";

    /* baseline, interpolated onto the live grid */
    if (baseline.length > 0) {
      const grid = live.map(r => r.freq_khz);
      const ref0 = interpolateOntoGrid(baseline, grid);
      ctx.strokeStyle = "rgba(127,184,164,0.7)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      grid.forEach((f, i) =>
        i === 0 ? ctx.moveTo(x(f), y(ref0[i])) : ctx.lineTo(x(f), y(ref0[i])));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    /* live sweep */
    ctx.strokeStyle = "#de9a3c";
    ctx.lineWidth = 1.8;
    ctx.shadowColor = "rgba(222,154,60,0.55)";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    live.forEach((r, i) =>
      i === 0
        ? ctx.moveTo(x(r.freq_khz), y(r.conductance_us))
        : ctx.lineTo(x(r.freq_khz), y(r.conductance_us)));
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* legend */
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#de9a3c";
    ctx.fillText("■ live", padL + 4, padT + 10);
    if (baseline.length > 0) {
      ctx.fillStyle = "rgba(127,184,164,0.85)";
      ctx.fillText("▬ baseline", padL + 48, padT + 10);
    }
  });

  return <canvas ref={ref} className="block w-full h-[210px] bg-scope" />;
}

/* ── RMSD trend sparkline ────────────────────────────────────────── */
function RmsdTrend({ rows }: { rows: RmsdRow[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr)) {
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const pts = rows.filter(r => r.rmsd_avg != null);
    if (pts.length < 2) {
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(143,160,147,0.55)";
      ctx.fillText("not enough history", 8, H / 2);
      return;
    }
    const vMax = Math.max(5, ...pts.map(p => p.rmsd_max ?? p.rmsd_avg ?? 0)) * 1.15;
    const x = (i: number) => (i / (pts.length - 1)) * (W - 8) + 4;
    const y = (v: number) => H - 6 - (v / vMax) * (H - 14);

    ctx.strokeStyle = "rgba(143,214,148,0.09)";
    for (let i = 0; i <= 3; i++) {
      const gy = y((vMax / 3) * i);
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(143,214,148,0.28)");
    grad.addColorStop(1, "rgba(143,214,148,0.02)");
    ctx.beginPath();
    pts.forEach((p, i) =>
      i === 0 ? ctx.moveTo(x(i), y(p.rmsd_avg ?? 0)) : ctx.lineTo(x(i), y(p.rmsd_avg ?? 0)));
    ctx.lineTo(x(pts.length - 1), H); ctx.lineTo(x(0), H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    pts.forEach((p, i) =>
      i === 0 ? ctx.moveTo(x(i), y(p.rmsd_avg ?? 0)) : ctx.lineTo(x(i), y(p.rmsd_avg ?? 0)));
    ctx.strokeStyle = "#8fd694"; ctx.lineWidth = 1.5;
    ctx.shadowColor = "#8fd694"; ctx.shadowBlur = 4; ctx.stroke(); ctx.shadowBlur = 0;

    ctx.font = "8.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(143,214,148,0.8)";
    ctx.fillText(`${vMax.toFixed(1)}% max`, 5, 10);
  });
  return <canvas ref={ref} className="block w-full h-[64px] bg-scope" />;
}

/* ── main ────────────────────────────────────────────────────────── */
/* ── Mock generators for Standalone Demo Mode ─────────────────────── */
const generateMockSweep = (isBaseline: boolean): SweepRow[] => {
  const steps = 96;
  const fStart = 100;
  const fStop = 400;
  const rows: SweepRow[] = [];
  
  const shift = isBaseline ? 0 : -6.8;
  const dampFactor = isBaseline ? 1.0 : 0.82;
  
  for (let i = 0; i < steps; i++) {
    const freq = fStart + (i / (steps - 1)) * (fStop - fStart);
    const mu1 = 240 + shift;
    const sig1 = 12;
    const peak1 = 780 * Math.exp(-((freq - mu1) ** 2) / (2 * (sig1 ** 2)));
    
    const mu2 = 340 + shift;
    const sig2 = 18;
    const peak2 = 220 * Math.exp(-((freq - mu2) ** 2) / (2 * (sig2 ** 2)));
    
    const continuum = 48 + Math.log(freq) * 3;
    const noise = (Math.sin(freq * 0.9) * 2 + (Math.random() - 0.5) * 4);
    
    rows.push({
      freq_khz: freq,
      conductance_us: Math.max(10, (peak1 + peak2 + continuum + noise) * dampFactor),
    });
  }
  return rows;
};

const generateMockTrend = (): RmsdRow[] => {
  const rows: RmsdRow[] = [];
  const hours = 24;
  for (let i = 0; i < hours; i++) {
    const progress = i / (hours - 1);
    const rmsd = 0.1 + progress * 4.7;
    rows.push({
      bucket: new Date(Date.now() - (hours - i) * 3600 * 1000).toISOString(),
      rmsd_avg: rmsd,
      rmsd_max: rmsd + 0.15,
      fres_avg: 240 - progress * 6.8,
      temp_avg: 23 + progress * 8.5,
      r_avg: 0.250 + progress * 0.08,
      n: 60,
    });
  }
  return rows;
};

export default function CloudPanel() {
  const { t } = useLang();
  const [cfg, setCfg] = useState<InfluxConfig>(loadInfluxConfig);
  const [offlineDemo, setOfflineDemo] = useState(true); // default true for seamless standalone demo
  const [conn, setConn] = useState<Conn>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [live, setLive] = useState<SweepRow[]>([]);
  const [baseline, setBaseline] = useState<SweepRow[]>([]);
  const [trend, setTrend] = useState<RmsdRow[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const chartRef  = useRef<HTMLCanvasElement>(null);

  const persist = (next: InfluxConfig) => { setCfg(next); saveInfluxConfig(next); };

  /* ── export helpers ───────────────────────────────────────────── */
  const buildPayload = (): CloudReportPayload | null => {
    if (live.length === 0) return null;
    const cv = chartRef.current;
    let chartDataUrl = "";
    try { chartDataUrl = cv ? cv.toDataURL("image/png", 1.0) : ""; } catch { /* no canvas */ }
    return {
      sessionId: cfg.sessionId,
      mode: offlineDemo ? "demo" : "live",
      generatedAt: Date.now(),
      live,
      baseline,
      rmsd,
      trend,
      chartDataUrl,
    };
  };

  const doPdf = async () => {
    setExporting("pdf");
    try { const p = buildPayload(); if (p) await exportCloudPdf(p); } catch (e) { console.error(e); }
    setTimeout(() => setExporting(null), 1200);
  };
  const doXlsx = () => {
    setExporting("xlsx");
    try { const p = buildPayload(); if (p) exportCloudXlsx(p); } catch (e) { console.error(e); }
    setTimeout(() => setExporting(null), 800);
  };
  const doPrint = () => {
    const p = buildPayload();
    if (p) openPrintView(p);
  };

  const pull = useCallback(async (c: InfluxConfig) => {
    if (offlineDemo) {
      setConn("testing");
      setErr(null);
      await new Promise(res => setTimeout(res, 850));
      setLive(generateMockSweep(false));
      setBaseline(generateMockSweep(true));
      setTrend(generateMockTrend());
      setLastSync(new Date().toLocaleTimeString());
      setConn("live");
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setConn("testing");
    setErr(null);
    try {
      const [sweep, base, hist] = await Promise.all([
        fetchLatestSweep(c, ac.signal),
        fetchBaselineSweep(c, ac.signal),
        fetchRmsdHistory(c, 168, ac.signal),
      ]);
      if (ac.signal.aborted) return;
      setLive(sweep);
      setBaseline(base);
      setTrend(hist);
      setLastSync(new Date().toLocaleTimeString());
      setConn("live");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setConn("error");
      setErr(e instanceof InfluxError ? `${e.code} — ${e.message}`
                                      : e instanceof Error ? e.message : String(e));
    }
  }, [offlineDemo]);

  /* auto-refresh while live */
  useEffect(() => {
    if (offlineDemo) return;
    if (!cfg.enabled || conn !== "live") return;
    const id = window.setInterval(() => { void pull(cfg); }, 15000);
    return () => window.clearInterval(id);
  }, [cfg, conn, pull, offlineDemo]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const rmsd = computeRmsd(live, baseline);
  const tone =
    conn === "live" ? "signal" : conn === "error" ? "alarm"
    : conn === "testing" ? "copper" : "dim";

  return (
    <section className="panel panel-corner overflow-hidden" id="cloud-panel">
      {/* header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 border-b border-line bg-raise/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center border border-copperdim bg-copper/10 shrink-0">
            <svg viewBox="0 0 20 20" className="w-4.5 h-4.5 text-copper" fill="none" stroke="currentColor" strokeWidth="1.6">
              <ellipse cx="10" cy="5" rx="6.5" ry="2.6" />
              <path d="M3.5 5v10c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6V5" />
              <path d="M3.5 10c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6" />
            </svg>
          </div>
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-copper">
              {t("cloud.kicker")}
            </div>
            <div className="font-display font-bold text-[17px] text-paper tracking-wide">
              {t("cloud.title")}
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <Led tone={tone} size={8} live={conn === "live"} />
          <span className={cn("font-mono text-[10px]",
            conn === "live" ? "text-signal" : conn === "error" ? "text-alarm" : "text-dim")}>
            {offlineDemo ? "Offline Demo Mode" : (conn === "live" ? t("cloud.connected")
              : conn === "testing" ? t("cloud.testing")
              : conn === "error" ? t("cloud.failed") : t("cloud.idle"))}
          </span>
          {lastSync && <span className="font-mono text-[9.5px] text-dim">· {lastSync}</span>}
        </div>
      </div>

      {/* security notice — deliberately not dismissible */}
      <div className="px-4 py-2.5 border-b border-line bg-alarm/6 flex items-start gap-2.5">
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-alarm shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M8 1.5 1 14h14L8 1.5z" /><path d="M8 6.5v3.5M8 12v.5" />
        </svg>
        <p className="font-mono text-[10px] leading-relaxed text-alarmhi">
          {offlineDemo ? "DEMO ACTIVE — showing offline mathematically simulated spectra for demonstration." : t("cloud.warn")}
        </p>
      </div>

      <div className="p-4 md:p-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* left — configuration */}
        <div className="space-y-3">
          {/* explicit demo mode toggle switch */}
          <div className="flex items-center justify-between border border-copperdim/40 bg-copper/5 px-3 py-2.5">
            <div>
              <div className="font-mono text-[10.5px] text-paper">Offline Simulation Mode</div>
              <div className="font-mono text-[9px] text-copper mt-0.5">Off = Live Cloud Connection</div>
            </div>
            <button
              onClick={() => {
                const next = !offlineDemo;
                setOfflineDemo(next);
                setConn("idle");
                setErr(null);
                /* Leaving demo mode must NOT leave demo curves on screen —
                 * otherwise an engineer could export demo data labelled
                 * "live". Clear the arrays until real rows arrive. */
                if (!next) {
                  setLive([]);
                  setBaseline([]);
                  setTrend([]);
                  setLastSync(null);
                }
              }}
              aria-pressed={offlineDemo}
              className={cn("relative h-6 w-11 border transition-colors shrink-0",
                offlineDemo ? "border-copper bg-copper/15" : "border-line2 bg-scope")}
            >
              <span className={cn("absolute top-[3px] h-4 w-4 transition-transform duration-200",
                offlineDemo ? "translate-x-[25px] bg-copper" : "translate-x-[3px] bg-dim")} />
            </button>
          </div>

          {!offlineDemo && (
            <>
              <div>
                <label className="block font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim mb-1.5">
                  {t("cloud.proxy")}
                </label>
                <input
                  value={cfg.proxyUrl}
                  onChange={e => persist({ ...cfg, proxyUrl: e.target.value })}
                  placeholder="https://your-app.vercel.app/api/influx-query"
                  dir="ltr"
                  className="w-full bg-scope border border-line px-3 py-2 font-mono text-[11px] text-paper placeholder:text-dim/45 focus:outline-none focus:border-copperdim transition-colors"
                />
                <p className="mt-1 font-mono text-[9px] text-dim leading-relaxed">
                  {t("cloud.proxy.hint")}
                </p>
              </div>

              <div>
                <label className="block font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim mb-1.5">
                  {t("cloud.session")}
                </label>
                <input
                  value={cfg.sessionId}
                  onChange={e => persist({ ...cfg, sessionId: e.target.value })}
                  placeholder="PZT-9F3A2C"
                  dir="ltr"
                  className="w-full bg-scope border border-line px-3 py-2 font-mono text-[11px] text-paper placeholder:text-dim/45 focus:outline-none focus:border-copperdim transition-colors"
                />
              </div>

              <div className="flex items-center justify-between border border-line bg-scope/40 px-3 py-2.5">
                <div>
                  <div className="font-mono text-[10.5px] text-paper">{t("cloud.uselive")}</div>
                  <div className="font-mono text-[9px] text-dim mt-0.5">{t("cloud.uselive.hint")}</div>
                </div>
                <button
                  onClick={() => persist({ ...cfg, enabled: !cfg.enabled })}
                  aria-pressed={cfg.enabled}
                  className={cn("relative h-6 w-11 border transition-colors shrink-0",
                    cfg.enabled ? "border-signaldeep bg-signal/15" : "border-line2 bg-scope")}
                >
                  <span className={cn("absolute top-[3px] h-4 w-4 transition-transform duration-200",
                    cfg.enabled ? "translate-x-[25px] bg-signal" : "translate-x-[3px] bg-dim")} />
                </button>
              </div>
            </>
          )}

          <button
            onClick={() => { void pull(cfg); }}
            disabled={(!offlineDemo && !cfg.proxyUrl) || conn === "testing"}
            className="w-full border border-copperdim bg-copper/10 px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper hover:bg-copper/20 transition-colors disabled:opacity-35 disabled:pointer-events-none"
          >
            {conn === "testing" ? t("cloud.testing") : t("cloud.run")}
          </button>

          {!offlineDemo && err && (
            <div className="border border-alarm/60 bg-alarm/8 px-3 py-2 font-mono text-[10px] text-alarmhi leading-relaxed break-words">
              {err}
            </div>
          )}

          {/* metrics */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { l: t("cloud.m.bins"), v: String(live.length), tone: "text-paper" },
              { l: t("cloud.m.base"), v: String(baseline.length), tone: "text-teal" },
              { l: "RMSD", v: `${rmsd.rmsdPct.toFixed(2)}%`,
                tone: rmsd.rmsdPct > 6 ? "text-alarm" : rmsd.rmsdPct > 2 ? "text-copper" : "text-signal" },
              { l: t("cloud.m.peak"),
                v: rmsd.peakDeviationKHz ? `${rmsd.peakDeviationKHz.toFixed(1)}k` : "—",
                tone: "text-mute" },
            ].map(m => (
              <div key={m.l} className="border border-line bg-scope/30 px-2.5 py-2">
                <div className={cn("font-mono font-bold text-[16px] tabular-nums", m.tone)}>{m.v}</div>
                <div className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-dim mt-0.5">{m.l}</div>
              </div>
            ))}
          </div>

          {/* dynamic diagnostic status card */}
          {live.length > 0 && (
            <div className={cn("border p-3 flex items-center gap-3 transition-colors duration-300 rounded-sm",
              rmsd.rmsdPct > 2 ? "border-copperdim bg-copper/5 text-copper" : "border-signaldeep bg-signal/5 text-signal")}>
              <Led tone={rmsd.rmsdPct > 2 ? "copper" : "signal"} size={7} live={true} />
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim">AI Structural Diagnostic</div>
                <div className="font-display font-semibold text-[13px] leading-snug">
                  {rmsd.rmsdPct > 2 ? `${rmsd.rmsdPct.toFixed(2)}% — Structural Anomaly Detected` : `${rmsd.rmsdPct.toFixed(2)}% — Structure Healthy`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* right — charts */}
        <div className="space-y-3 min-w-0">
          <div className="border border-line overflow-hidden">
            <div className="px-3 py-1.5 border-b border-line font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim">
              {t("cloud.chart1")}
            </div>
            <div className="relative">
              <div className="scanlines pointer-events-none absolute inset-0 z-10" />
              <SweepChart live={live} baseline={baseline} canvasRef={chartRef} />
            </div>
          </div>

          <div className="border border-line overflow-hidden">
            <div className="px-3 py-1.5 border-b border-line font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim flex items-center">
              {t("cloud.chart2")}
              <span className="ml-auto text-dim/70">{trend.length} bins · 7 d</span>
            </div>
            <RmsdTrend rows={trend} />
          </div>

          {/* SQL transparency */}
          <div className="border border-line overflow-hidden">
            <button
              onClick={() => setShowSql(s => !s)}
              className="w-full flex items-center gap-2 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim hover:text-copper transition-colors"
            >
              {t("cloud.sql")}
              <span className="ml-auto">{showSql ? "▲" : "▼"}</span>
            </button>
            {showSql && (
              <div className="border-t border-line divide-y divide-line/50">
                {SQL_SAMPLES.map(s => (
                  <div key={s.id}>
                    <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-copper bg-raise/20">
                      {s.label}
                    </div>
                    <pre className="px-3 py-2 font-mono text-[10px] leading-[1.6] text-[#b7d18a] overflow-x-auto bg-scope/70 code-surface" dir="ltr">
{s.sql.replace(/\$SESSION/g, `'${cfg.sessionId}'`)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── export bar ────────────────────────────────────────────── */}
      {live.length > 0 && (
        <div className="border-t border-line px-4 py-3 flex flex-wrap items-center gap-2 bg-raise/20">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-copper mr-2">
            {t("cloud.export")}
          </span>

          {/* PDF */}
          <button
            onClick={() => { void doPdf(); }}
            disabled={exporting === "pdf"}
            className={cn(
              "flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase transition-colors disabled:opacity-45",
              exporting === "pdf"
                ? "border-alarm bg-alarm/10 text-alarm"
                : "border-alarm/50 bg-alarm/8 text-alarmhi hover:bg-alarm/16 hover:border-alarm"
            )}
          >
            <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7.5 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
              <path d="M7.5 1v3.5h3.5"/>
            </svg>
            {exporting === "pdf" ? "generating…" : t("cloud.export.pdf")}
          </button>

          {/* XLSX */}
          <button
            onClick={doXlsx}
            disabled={exporting === "xlsx"}
            className={cn(
              "flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase transition-colors disabled:opacity-45",
              exporting === "xlsx"
                ? "border-signaldeep bg-signal/10 text-signal"
                : "border-signaldeep bg-signal/8 text-signal hover:bg-signal/16"
            )}
          >
            <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="10" height="10" rx="1"/>
              <path d="M5 2v10M2 5h10"/>
              <path d="m7 8 3 3m0-3-3 3"/>
            </svg>
            {exporting === "xlsx" ? "exporting…" : t("cloud.export.xlsx")}
          </button>

          {/* Print */}
          <button
            onClick={doPrint}
            className="flex items-center gap-1.5 border border-line2 px-3 py-1.5 font-mono text-[10px] uppercase text-mute hover:text-paper hover:border-copperdim transition-colors"
          >
            <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 5V2h6v3"/>
              <rect x="1.5" y="5" width="11" height="5" rx="1"/>
              <path d="M4 10h6v3H4z"/>
            </svg>
            {t("cloud.export.print")}
          </button>

          <span className="ml-auto font-mono text-[9px] text-dim hidden sm:inline">
            {live.length} pts · {baseline.length} ref · {t("cloud.export.chart")}
          </span>
        </div>
      )}

      <div className="border-t border-line px-4 py-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[9px] text-dim/75">
        <span>engine: InfluxDB 3 · DataFusion SQL</span>
        <span>transport: Arrow Flight (server) → JSON (browser)</span>
        <span className="ms-auto">measurement: emi_sweep</span>
      </div>
    </section>
  );
}
