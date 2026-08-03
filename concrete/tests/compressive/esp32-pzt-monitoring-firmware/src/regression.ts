/* ------------------------------------------------------------------ *
 *  regression.ts — AI Dynamic Regression & Forecast Engine (v1.9.0)
 *
 *  Two jobs:
 *
 *  1. LEARN. The engineer feeds real cube-crush results (age, MPa).
 *     We fit Plowman's logarithmic maturity law  fc(t) = A·ln(t)+B
 *     with exact ordinary-least-squares on ln(t) — closed form, no
 *     iteration, no library. More points = tighter, truer curve.
 *
 *  2. PREDICT. Given the fitted coefficients, invert the law to find
 *     WHEN the concrete will reach the target strength:
 *        t* = exp((MPa_target − B) / A)
 *     and annotate a confidence grade that widens early and tightens
 *     as cube data accumulates (honest uncertainty, not false precision).
 * ------------------------------------------------------------------ */

export interface CalibrationPoint {
  day: number;   // specimen age at crush (fractional days allowed)
  mpa: number;   // measured compressive strength at crush
}

export type MaturityMethod = "plowman" | "nurse_saul" | "arrhenius";

export interface CalibrationModel {
  a: number;                 // A coefficient (MPa per ln·day)
  b: number;                 // B intercept (MPa at day 1 by log law)
  targetMpa: number;         // clearance threshold the code watches
  method: MaturityMethod;    // v1.6.1 — ASTM C1074 toggle
  datumTempC: number;        // T₀ for Nurse-Saul, default −10 °C
  activationQ: number;       // Q/R for Arrhenius, default 5000 K
  points: CalibrationPoint[];
  rmse: number | null;       // residuals goodness-of-fit, MPa
  fitCount: number;          // how many times re-fitted
  updatedAt: number;         // epoch ms
}

/* ── sensor health guard (v1.6.1) ──────────────────────────────── */
export type SensorHealth = "ONLINE" | "DEGRADED" | "DISCONNECTED";

export interface SensorStatus {
  id: string;
  health: SensorHealth;
  errorCode: string | null;  // e.g. "E-HARDWARE-004"
}

export function evaluateSensorHealth(gPeak: number, rmsd: number): SensorStatus {
  if (gPeak <= 0 || !Number.isFinite(gPeak) || Number.isNaN(rmsd)) {
    return { id: "", health: "DISCONNECTED", errorCode: "E-HARDWARE-004" };
  }
  if (gPeak < 10 || rmsd > 60) {
    return { id: "", health: "DEGRADED", errorCode: "E-HARDWARE-004" };
  }
  return { id: "", health: "ONLINE", errorCode: null };
}

export interface ForecastResult {
  predictedDay: number;        // t* in days from cast
  projectedDate: number;       // epoch ms at t* = cast + t*
  achieved: boolean;           // current estimate ≥ target already?
  achievedAtDays: number;      // fitted day when strength = current
  confidencePct: number;       // 0–99
  grade: "LOW" | "MEDIUM" | "HIGH";
  daysRemaining: number;       // signed (negative => achieved)
  targetIsReachable: boolean;  // A>0 and projection finite
}

/* ── persistence ────────────────────────────────────────────────── */
const CALIB_KEY = "smartlab-calib-v1.6.1";
const LEGACY_CALIB_KEY = "smartlab-calib-v1.5.2";

export const DEFAULT_CALIB: CalibrationModel = {
  a: 8.4,
  b: 12.1,
  targetMpa: 40,
  method: "plowman",
  datumTempC: -10,      // Nurse-Saul datum temperature
  activationQ: 5000,    // Arrhenius Q/R in Kelvin
  points: [],
  rmse: null,
  fitCount: 0,
  updatedAt: 0,
};

export function loadCalibration(): CalibrationModel {
  try {
    const raw = localStorage.getItem(CALIB_KEY) ?? localStorage.getItem(LEGACY_CALIB_KEY);
    if (!raw) return { ...DEFAULT_CALIB };
    const parsed = JSON.parse(raw) as Partial<CalibrationModel>;
    return { ...DEFAULT_CALIB, ...parsed };
  } catch {
    return { ...DEFAULT_CALIB };
  }
}

export function saveCalibration(m: CalibrationModel): void {
  try {
    localStorage.setItem(CALIB_KEY, JSON.stringify(m));
  } catch { /* private mode */ }
}

/* ── ASTM C1074 maturity index computations (v1.6.1) ───────────── */

/** Nurse-Saul temperature-time factor: M(t) = Σ(Tₐ − T₀) · Δt */
export function nurseSaulMaturity(
  tempHistoryC: number[],   // hourly average core temperatures
  datumTempC = -10          // T₀ — datum temperature, standard: −10 °C
): number {
  let m = 0;
  for (const t of tempHistoryC) {
    m += Math.max(0, t - datumTempC); // degree-hours (Δt = 1 h)
  }
  return m; // degree-hours
}

/** Arrhenius equivalent age: tₑ = Σ exp(−Q·(1/Tₐ − 1/Tₛ)) · Δt */
export function arrheniusEquivAge(
  tempHistoryC: number[],
  activationQ = 5000,       // Q/R in Kelvin (~40 kJ/mol for OPC)
  specifiedTempC = 20       // Tₛ — reference temperature
): number {
  let te = 0;
  const tsK = specifiedTempC + 273.15;
  for (const tc of tempHistoryC) {
    const taK = tc + 273.15;
    te += Math.exp(-activationQ * (1 / taK - 1 / tsK)); // hours
  }
  return te / 24; // convert hours to days
}

/** Strength from chosen maturity method (v1.6.1) */
export function strengthFromMaturity(
  method: MaturityMethod,
  ageDays: number,
  coeffs: Coefficients,
  tempHistoryC: number[] = [],
  datumTempC = -10,
  activationQ = 5000
): number {
  switch (method) {
    case "nurse_saul": {
      const m = nurseSaulMaturity(tempHistoryC.length > 0 ? tempHistoryC : Array(Math.round(ageDays * 24)).fill(23), datumTempC);
      // strength ~ A·ln(M/24) + B (maturity index in degree-hours, normalised to day-equivalent)
      const dayEquiv = Math.max(0.05, m / (24 * 33)); // 33 °C·h per day at ambient
      return coeffs.a * Math.log(dayEquiv) + coeffs.b;
    }
    case "arrhenius": {
      const te = arrheniusEquivAge(tempHistoryC.length > 0 ? tempHistoryC : Array(Math.round(ageDays * 24)).fill(23), activationQ);
      return coeffs.a * Math.log(Math.max(0.05, te)) + coeffs.b;
    }
    default: // plowman
      return plowmanStrength(ageDays, coeffs);
  }
}

/* ── strength estimation helpers ────────────────────────────────── */
export interface Coefficients {
  a: number;
  b: number;
}

/** fc(t) = A·ln(t) + B (t in days, clamped > 0.05 to keep log sane) */
export function plowmanStrength(tDays: number, c: Coefficients): number {
  const t = Math.max(0.05, tDays);
  return c.a * Math.log(t) + c.b;
}

/** strength from conductance + maturity, same blend firmware uses. */
export function estimateStrength(
  conductancePeakUS: number,
  ageDays: number,
  c: Coefficients,
  gToMPa = 0.0092
): number {
  const fromG = conductancePeakUS * gToMPa;
  const mat = plowmanStrength(ageDays, c);
  const blended = fromG * 0.62 + mat * 0.38;
  return Math.max(0, blended);
}

/* ── closed-form OLS on ln(t) ───────────────────────────────────── */
export interface FitResult {
  a: number;
  b: number;
  rmse: number | null;
}

export function fitPlowman(points: CalibrationPoint[]): FitResult {
  const pts = points.filter(p => p.day > 0.05 && p.mpa >= 0);
  const n = pts.length;

  if (n < 2) {
    return { a: DEFAULT_CALIB.a, b: DEFAULT_CALIB.b, rmse: null };
  }

  const xs = pts.map(p => Math.log(p.day));
  const ys = pts.map(p => p.mpa);
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = ys.reduce((s, y) => s + y, 0) / n;

  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const a = den > 1e-9 ? num / den : DEFAULT_CALIB.a;
  const b = my - a * mx;

  /* RMSE — tells the engineer how far real cubes scatter off the law.
   * Honest meter: > 4 MPa means the mix or datum points are suspect. */
  let se = 0;
  for (const p of pts) {
    const pred = plowmanStrength(p.day, { a, b });
    se += (p.mpa - pred) ** 2;
  }
  const rmse = Math.sqrt(se / n);

  return {
    a: Number(a.toFixed(4)),
    b: Number(b.toFixed(4)),
    rmse: Number(rmse.toFixed(4)),
  };
}

/* ── forecast ───────────────────────────────────────────────────── */
export function forecastStrength(
  coeffs: Coefficients,
  targetMpa: number,
  castEpochMs: number | null,
  ageDaysNow: number,
  currentMPa: number,
  points: CalibrationPoint[]
): ForecastResult {
  const { a, b } = coeffs;
  const reachable = a > 0.05 && targetMpa > 0;

  /* fitted day when current strength equals current estimate (for CPT) */
  const achievedNow = currentMPa >= targetMpa && targetMpa > 0;
  const achievedDay =
    a > 0.05 ? Math.exp((currentMPa - b) / a) : ageDaysNow;

  const tStar = reachable ? Math.exp((targetMpa - b) / a) : Number.POSITIVE_INFINITY;
  const projectedDate =
    castEpochMs !== null && Number.isFinite(tStar)
      ? castEpochMs + tStar * 86400_000
      : Number.POSITIVE_INFINITY;

  const daysRemaining = Number.isFinite(tStar) ? tStar - ageDaysNow : Number.NaN;

  /* confidence expresses what we honestly know:
   *   base on data count, scaled by how far off the log law the points sit. */
  const pointsN = points.length;
  let conf = 48;
  conf += Math.min(22, pointsN * 4);          // more cubes → more trust
  conf += Math.min(18, ageDaysNow * 3);       // longer history → more trust
  if (pointsN >= 2) {
    const { rmse } = fitPlowman(points);
    conf -= Math.min(20, (rmse ?? 0) * 3);    // scatter off the law → less trust
  }
  conf = Math.round(Math.min(99, Math.max(6, conf)));

  const grade: ForecastResult["grade"] =
    conf >= 78 ? "HIGH" : conf >= 55 ? "MEDIUM" : "LOW";

  return {
    predictedDay: Number.isFinite(tStar) ? Number(tStar.toFixed(4)) : NaN,
    projectedDate,
    achieved: achievedNow,
    achievedAtDays: Number(achievedDay.toFixed(4)),
    confidencePct: conf,
    grade,
    daysRemaining: Number.isFinite(daysRemaining) ? Number(daysRemaining.toFixed(3)) : NaN,
    targetIsReachable: reachable,
  };
}

/* ── multi-sensor simulation (deterministic per node) ───────────── */
export interface SimSensor {
  id: string;           // pzt_node_01…
  node: number;         // 1..4
  freqShiftKHz: number; // damage signature per sensor
  dampFactor: number;
  noiseSeed: number;
}

export const SENSORS: SimSensor[] = [
  { id: "pzt_node_01", node: 1, freqShiftKHz: -0.7, dampFactor: 0.99, noiseSeed: 11 },
  { id: "pzt_node_02", node: 2, freqShiftKHz: -1.9, dampFactor: 0.97, noiseSeed: 22 },
  { id: "pzt_node_03", node: 3, freqShiftKHz: -8.4, dampFactor: 0.78, noiseSeed: 33 },
  { id: "pzt_node_04", node: 4, freqShiftKHz: -2.4, dampFactor: 0.96, noiseSeed: 44 },
];

function seedNoise(seed: number, i: number): number {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

function gaussian(x: number, mu: number, sigma: number): number {
  return Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
}

export interface SensorSweepBin {
  freqKHz: number;
  conductanceUS: number;
}

export interface SensorReading {
  id: string;
  bins: SensorSweepBin[];
  gPeakUS: number;
  fresKHz: number;
  rmsdPct: number;
  damaged: boolean;
  susceptance?: number[];       // v1.9.0 — B(f) in µS
  admittanceMag?: number[];     // v1.9.0 — |Y(f)| in µS
}

const STEPS = 96;
const F_START = 100;
const F_STOP = 400;

function sweepFor(sensor: SimSensor, damaged: boolean): SensorSweepBin[] {
  const rows: SensorSweepBin[] = [];
  const mu1 = 240;
  const mu2 = 340;

  const stepSize = (F_STOP - F_START) / (STEPS - 1);
  for (let i = 0; i < STEPS; i++) {
    const f = F_START + i * stepSize;

    // damaged sensors peak-shift & damp
    const mu1d = mu1 + (damaged ? sensor.freqShiftKHz : -0.7);
    const mu2d = mu2 + (damaged ? sensor.freqShiftKHz : -1.2);
    const damp = damaged ? sensor.dampFactor : 1.0;

    const g =
      780 * gaussian(f, mu1d, 12 * (damaged ? 1.5 : 1.0)) * damp +
      220 * gaussian(f, mu2d, 18) * damp +
      (48 + Math.log(f) * 3) +
      seedNoise(sensor.noiseSeed, i) * (damaged ? 14 : 4);

    rows.push({ freqKHz: Number(f.toFixed(3)), conductanceUS: Number(Math.max(8, g).toFixed(3)) });
  }
  return rows;
}

export interface MultiSensorReadingSet {
  sensors: SensorReading[];
  anomalyThresholdPct: number;
}

export function generateSensorSweepSet(
  damageAnomalyThresholdPct = 5.0
): MultiSensorReadingSet {
  const baseline = sweepFor(SENSORS[0], false); // node-01 = the healthy reference node

  const sensors: SensorReading[] = SENSORS.map(sensor => {
    const damaged = sensor.freqShiftKHz < -4;      // node_03 is the scripted damage
    const bins = sweepFor(sensor, damaged);

    /* RMSD vs the shared J0 baseline grid */
    let num = 0, den = 0;
    for (let i = 0; i < STEPS; i++) {
      const d = bins[i].conductanceUS - baseline[i].conductanceUS;
      num += d * d; den += baseline[i].conductanceUS ** 2;
    }
    const rmsd = den > 0 ? Math.sqrt(num / den) * 100 : 0;

    let peak = 0, peakF = 0;
    bins.forEach(b => { if (b.conductanceUS > peak) { peak = b.conductanceUS; peakF = b.freqKHz; } });

    /* v1.9.0 — compute susceptance B(f) and admittance magnitude |Y| for dual-spectrum */
    const susceptance = bins.map((b, i) => {
      const phase = Math.sin(i * 0.13) * 0.35; // simulated phase from AD5933 DFT
      return b.conductanceUS * phase;
    });
    const admittanceMag = bins.map((b, i) =>
      Math.sqrt(b.conductanceUS ** 2 + susceptance[i] ** 2)
    );

    return {
      id: sensor.id,
      bins,
      gPeakUS: Number(peak.toFixed(3)),
      fresKHz: Number((peakF + (damaged ? sensor.freqShiftKHz : 0)).toFixed(3)),
      rmsdPct: Number(rmsd.toFixed(3)),
      damaged,
      susceptance,
      admittanceMag,
    };
  });

  return { sensors, anomalyThresholdPct: damageAnomalyThresholdPct };
}
