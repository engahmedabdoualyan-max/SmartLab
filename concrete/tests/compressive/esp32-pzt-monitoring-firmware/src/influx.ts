/* ------------------------------------------------------------------ *
 *  influx.ts — browser-side data layer for InfluxDB 3 Cloud Serverless
 *
 *  SECURITY MODEL
 *  ──────────────
 *  This module holds NO credentials. It cannot: the bundle it lives in
 *  is a public static file. All queries are POSTed to a serverless
 *  proxy (see /api/influx-query.ts) which owns the token server-side.
 *
 *  The only thing stored locally is the proxy URL + the session id —
 *  neither is a secret.
 *
 *  WHY A PROXY IS MANDATORY (not a style choice)
 *  ─────────────────────────────────────────────
 *  InfluxDB 3 serves SQL over Arrow Flight / gRPC. Browsers cannot
 *  open gRPC connections, so `@influxdata/influxdb3-client` is a
 *  Node-only library. Even with a token in hand the browser could not
 *  run the SQL. The proxy solves transport and secrecy together.
 * ------------------------------------------------------------------ */

/* ── expected line-protocol schema written by the ESP32 ──────────── *
 *
 *   measurement : emi_sweep
 *   tags        : session_id, specimen_id, badge
 *   fields      : freq_khz, conductance_us, susceptance_us,
 *                 resistance_kohm, voltage_mv, res_freq_khz,
 *                 damage_rmsd, temp_c, hydration_pct, sweep_id
 *   timestamp   : nanoseconds (NTP-synchronised on device)
 * ----------------------------------------------------------------- */

export const MEASUREMENT = "emi_sweep";

/* ── config (non-secret) ─────────────────────────────────────────── */
export interface InfluxConfig {
  proxyUrl: string;   // e.g. https://your-app.vercel.app/api/influx-query
  sessionId: string;  // e.g. PZT-9F3A2C
  enabled: boolean;   // live cloud data vs local simulation
}

const CFG_KEY = "smartlab-influx-config-v1";

const blankConfig = (): InfluxConfig => ({
  proxyUrl: "",
  sessionId: "PZT-9F3A2C",
  enabled: false,
});

export function loadInfluxConfig(): InfluxConfig {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    if (raw) return { ...blankConfig(), ...(JSON.parse(raw) as Partial<InfluxConfig>) };
  } catch { /* private mode */ }
  return blankConfig();
}

export function saveInfluxConfig(cfg: InfluxConfig): void {
  try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch { /* ignore */ }
}

/* ── row shapes returned by the proxy ────────────────────────────── */
export interface SweepRow {
  freq_khz: number;
  conductance_us: number;
  susceptance_us?: number;
  /** raw (uncalibrated) conductance emitted by the ESP32 alongside the
   *  air-calibrated value — lets the dashboard re-derive calibration */
  raw_conductance_us?: number;
  time?: string;
}

export interface RmsdRow {
  bucket: string;
  rmsd_avg: number | null;
  rmsd_max: number | null;
  fres_avg: number | null;
  temp_avg: number | null;
  r_avg: number | null;
  /** avg specimen age over the bin, fractional days */
  age_avg?: number | null;
  /** avg on-device compressive strength estimate over the bin, MPa */
  mpa_avg?: number | null;
  n: number;
}

export interface ScalarRow {
  time: string;
  voltage_mv: number | null;
  resistance_kohm: number | null;
  res_freq_khz: number | null;
  damage_rmsd: number | null;
  temp_c: number | null;
  hydration_pct: number | null;
  /** fractional days since cast — written by the ESP32 */
  test_age_days?: number | null;
  /** on-device strength estimate, MPa — written by the ESP32 */
  calculated_strength_mpa?: number | null;
}

export interface SessionRow {
  session_id: string;
  points: number;
  last_seen: string;
}

type QueryKind =
  | "latest_sweep"
  | "baseline_sweep"
  | "rmsd_history"
  | "latest_scalars"
  | "sessions";

interface ProxyOk<T> { ok: true; kind: QueryKind; count: number; rows: T[] }
interface ProxyErr { error: string; detail?: string }

export class InfluxError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "InfluxError";
    this.code = code;
  }
}

/* ── transport ───────────────────────────────────────────────────── */
async function callProxy<T>(
  cfg: InfluxConfig,
  kind: QueryKind,
  extra: Record<string, unknown> = {},
  signal?: AbortSignal
): Promise<T[]> {
  if (!cfg.proxyUrl) {
    throw new InfluxError("no_proxy", "Proxy URL is not configured.");
  }

  let res: Response;
  try {
    res = await fetch(cfg.proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, sessionId: cfg.sessionId, ...extra }),
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new InfluxError(
      "network",
      "Could not reach the proxy. Check the URL, that it is deployed, and that CORS allows this origin."
    );
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new InfluxError("bad_response", `Proxy returned non-JSON (HTTP ${res.status}).`);
  }

  if (!res.ok) {
    const p = payload as ProxyErr;
    throw new InfluxError(p.error ?? "http_error", p.detail ?? `HTTP ${res.status}`);
  }

  const p = payload as ProxyOk<T>;
  if (!p.ok || !Array.isArray(p.rows)) {
    throw new InfluxError("bad_payload", "Proxy response was malformed.");
  }
  return p.rows;
}

/* ── public queries ──────────────────────────────────────────────── */
export const fetchLatestSweep = (c: InfluxConfig, s?: AbortSignal) =>
  callProxy<SweepRow>(c, "latest_sweep", {}, s);

export const fetchBaselineSweep = (c: InfluxConfig, s?: AbortSignal) =>
  callProxy<SweepRow>(c, "baseline_sweep", {}, s);

export const fetchRmsdHistory = (c: InfluxConfig, hours = 168, s?: AbortSignal) =>
  callProxy<RmsdRow>(c, "rmsd_history", { hours }, s);

export const fetchLatestScalars = (c: InfluxConfig, s?: AbortSignal) =>
  callProxy<ScalarRow>(c, "latest_scalars", {}, s);

export const fetchSessions = (c: InfluxConfig, hours = 720, s?: AbortSignal) =>
  callProxy<SessionRow>(c, "sessions", { hours }, s);

/* ── analysis ────────────────────────────────────────────────────── *
 *  RMSD is the standard EMI damage index (see References §08):
 *
 *      RMSD % = sqrt( Σ(Gᵢ − G⁰ᵢ)² / Σ(G⁰ᵢ)² ) × 100
 *
 *  Live and baseline sweeps rarely share identical frequency grids —
 *  the dwell table can drift between firmware builds — so the baseline
 *  is linearly interpolated onto the live grid before differencing.
 *  Comparing mismatched bins is the single most common way to get a
 *  meaningless damage number.
 * ----------------------------------------------------------------- */
export function interpolateOntoGrid(
  baseline: SweepRow[],
  grid: number[]
): number[] {
  if (baseline.length === 0) return grid.map(() => 0);
  const b = [...baseline].sort((x, y) => x.freq_khz - y.freq_khz);

  return grid.map(f => {
    if (f <= b[0].freq_khz) return b[0].conductance_us;
    if (f >= b[b.length - 1].freq_khz) return b[b.length - 1].conductance_us;

    let lo = 0;
    let hi = b.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (b[mid].freq_khz <= f) lo = mid; else hi = mid;
    }
    const span = b[hi].freq_khz - b[lo].freq_khz;
    if (span <= 0) return b[lo].conductance_us;
    const w = (f - b[lo].freq_khz) / span;
    return b[lo].conductance_us * (1 - w) + b[hi].conductance_us * w;
  });
}

export interface RmsdResult {
  rmsdPct: number;
  bins: number;
  peakDeviationKHz: number | null;
}

export function computeRmsd(live: SweepRow[], baseline: SweepRow[]): RmsdResult {
  if (live.length === 0 || baseline.length === 0) {
    return { rmsdPct: 0, bins: 0, peakDeviationKHz: null };
  }
  const grid = live.map(r => r.freq_khz);
  const ref = interpolateOntoGrid(baseline, grid);

  let num = 0;
  let den = 0;
  let worst = -Infinity;
  let worstF: number | null = null;

  for (let i = 0; i < live.length; i++) {
    const d = live[i].conductance_us - ref[i];
    num += d * d;
    den += ref[i] * ref[i];
    const a = Math.abs(d);
    if (a > worst) { worst = a; worstF = live[i].freq_khz; }
  }

  return {
    rmsdPct: den > 0 ? Math.sqrt(num / den) * 100 : 0,
    bins: live.length,
    peakDeviationKHz: worstF,
  };
}

/* ── line-protocol helper ────────────────────────────────────────── *
 *  Mirrors exactly what the ESP32 firmware emits. Kept in the frontend
 *  so the docs panel can render a real, copy-pasteable example and so
 *  the format has one single definition in the codebase.
 * ----------------------------------------------------------------- */
export interface SweepPoint {
  freqKHz: number;
  conductanceUS: number;
  susceptanceUS?: number;
}

export interface LineProtocolMeta {
  sessionId: string;
  specimenId: string;
  badge: "PROPRIETARY_CERTIFIED" | "GENERIC_RAW";
  sweepId: number;
  resFreqKHz: number;
  resistanceKOhm: number;
  voltageMv: number;
  damageRmsd: number;
  tempC: number;
  hydrationPct: number;
  /** fractional days since cast */
  testAgeDays: number;
  /** on-device compressive strength estimate, MPa */
  calculatedStrengthMPa: number;
  timestampNs: bigint;
}

/** Escape per line-protocol rules for tag keys/values. */
const escTag = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/=/g, "\\=").replace(/ /g, "\\ ");

export function buildLineProtocol(
  points: SweepPoint[],
  meta: LineProtocolMeta
): string {
  const tags =
    `session_id=${escTag(meta.sessionId)}` +
    `,specimen_id=${escTag(meta.specimenId)}` +
    `,badge=${escTag(meta.badge)}`;

  return points
    .map(p => {
      const fields = [
        `freq_khz=${p.freqKHz.toFixed(3)}`,
        `conductance_us=${p.conductanceUS.toFixed(3)}`,
        p.susceptanceUS !== undefined
          ? `susceptance_us=${p.susceptanceUS.toFixed(3)}`
          : null,
        `resistance_kohm=${meta.resistanceKOhm.toFixed(4)}`,
        `voltage_mv=${meta.voltageMv.toFixed(2)}`,
        `res_freq_khz=${meta.resFreqKHz.toFixed(3)}`,
        `damage_rmsd=${meta.damageRmsd.toFixed(3)}`,
        `temp_c=${meta.tempC.toFixed(2)}`,
        `hydration_pct=${meta.hydrationPct.toFixed(2)}`,
        `test_age_days=${meta.testAgeDays.toFixed(4)}`,
        `calculated_strength_mpa=${meta.calculatedStrengthMPa.toFixed(3)}`,
        `device_status="Online"`,
        `air_baseline_calibrated=true`,
        `sweep_id=${meta.sweepId}i`,
      ].filter(Boolean).join(",");

      return `${MEASUREMENT},${tags} ${fields} ${meta.timestampNs.toString()}`;
    })
    .join("\n");
}

/* ── SQL shown in the UI for transparency ────────────────────────── */
export const SQL_SAMPLES: { id: string; label: string; sql: string }[] = [
  {
    id: "latest_sweep",
    label: "Latest conductance sweep",
    sql: `SELECT freq_khz, conductance_us, time
FROM "emi_sweep"
WHERE session_id = $SESSION
  AND time >= now() - INTERVAL '48 hours'
  AND sweep_id = (
    SELECT max(sweep_id) FROM "emi_sweep"
    WHERE session_id = $SESSION
  )
ORDER BY freq_khz ASC`,
  },
  {
    id: "rmsd_history",
    label: "RMSD trend (time-binned aggregate)",
    sql: `SELECT
  date_bin(INTERVAL '1 hour', time)  AS bucket,
  avg(damage_rmsd)                   AS rmsd_avg,
  max(damage_rmsd)                   AS rmsd_max,
  avg(res_freq_khz)                  AS fres_avg,
  avg(temp_c)                        AS temp_avg,
  avg(test_age_days)                 AS age_avg,
  avg(calculated_strength_mpa)       AS mpa_avg
FROM "emi_sweep"
WHERE session_id = $SESSION
  AND time >= now() - INTERVAL '7 days'
GROUP BY bucket
ORDER BY bucket ASC`,
  },
  {
    id: "strength_curve",
    label: "Strength development curve (age vs MPa)",
    sql: `SELECT
  avg(test_age_days)            AS age_days,
  avg(calculated_strength_mpa)  AS strength_mpa,
  avg(damage_rmsd)              AS rmsd
FROM "emi_sweep"
WHERE session_id = $SESSION
  AND test_age_days > 0
GROUP BY date_bin(INTERVAL '6 hours', time)
ORDER BY age_days ASC`,
  },
  {
    id: "sessions",
    label: "Discover active nodes",
    sql: `SELECT session_id, count(1) AS points, max(time) AS last_seen
FROM "emi_sweep"
WHERE time >= now() - INTERVAL '30 days'
GROUP BY session_id
ORDER BY last_seen DESC`,
  },
];
