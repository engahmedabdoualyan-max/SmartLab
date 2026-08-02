/* ------------------------------------------------------------------ *
 *  sim.ts — smartLAB virtual instrumentation and forensic QA engine.
 *
 *  The browser model deliberately follows the embedded data path:
 *  log-spaced EMI sweep -> ADC noise -> divider inversion -> packet
 *  routing. It also owns the test-only failure scenarios and a durable
 *  IndexedDB outbox, so the UI is a reproducible system simulator rather
 *  than a visual-only mock.
 * ------------------------------------------------------------------ */

export const SWEEP_STEPS = 96;
export const F_START = 1; // kHz
export const F_STOP = 500; // kHz
export const ADC_MAX = 4095;
export const VREF = 3300; // mV
export const R_SERIES = 1000; // ohm
export const CRUSH_SPIKE = 950;
export const MAX_BUFFERED_FRAMES = 256;

const VIRTUAL_DAYS_PER_SECOND = 0.055;
const TELEMETRY_PERIOD_MS = 1000;
const DWELL_WALL_MS = 24;
const RECOVERY_CONCURRENCY = 3;
const MAX_RECOVERY_ATTEMPTS = 4;

export type SimStatus = "BOOT" | "WIFI" | "ACTIVE" | "CRUSHED";
export type Scenario =
  | "NORMAL_CURING"
  | "PRE_CURED_FRAUD"
  | "PHYSICAL_DISCONNECTION"
  | "ACOUSTIC_COLLAPSE"
  | "MIX_ADULTERATION";
export type Certification = "PENDING" | "CERTIFIED" | "NOT_CERTIFIED" | "BLOCKED" | "MIX_HAZARD";
export type PacketRoute = "LIVE" | "BUFFERED" | "RECOVERING" | "RECOVERED" | "DROPPED";
export type LogLevel = "INFO" | "MATH" | "VALID" | "NET" | "WARN" | "FAULT";
export type CollapsePhase = "IDLE" | "MICROCRACKING" | "SPIKE" | "OPEN_CONFIRM" | "LATCHED";

export interface PacketRec {
  id: number;
  timestampMs: number;
  timestampIso: string;
  t: number;
  virtualDay: number;
  voltage: number;
  resistance: number;
  frequency: number;
  conductance: number;
  damage: number;
  microStrain: number;
  hydration: number;
  noiseSigma: number;
  tempC: number;
  rssi: number;
  status: "ACTIVE" | "CRUSHED";
  certification: Certification;
  scenario: Scenario;
  route: PacketRoute;
  attempts: number;
  fault: boolean;
  tamper?: "PHYSICAL_DISCONNECTION" | "PRE_CURED_SPECIMEN";
  json: string;
}

export interface DiagnosticLog {
  id: number;
  at: string;
  t: number;
  virtualDay: number;
  level: LogLevel;
  channel: "SIM" | "MATH" | "VALIDATOR" | "NETWORK" | "STORAGE";
  message: string;
  detail?: string;
}

export interface SimDiagnostics {
  framesGenerated: number;
  framesAccepted: number;
  framesBuffered: number;
  framesRecovered: number;
  framesDropped: number;
  validationPass: number;
  validationFail: number;
  retryAttempts: number;
  retryOverhead: number;
  bufferDepth: number;
  recoveryInFlight: number;
  lastLatencyMS: number;
  avgNoiseCounts: number;
  noiseStdDev: number;
  highestNoiseCounts: number;
  lineageChecks: number;
  lineageFailures: number;
}

interface StoredFrame {
  key: string;
  packet: PacketRec;
}

interface RecoveryJob {
  packetId: number;
  completeAt: number;
}

type PacketWithRetry = PacketRec & { retryAt?: number };

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

const gaussian = (x: number, mu: number, sigma: number): number =>
  Math.exp(-((x - mu) * (x - mu)) / (2 * sigma * sigma));

const monotonicNow = (): number =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

/* A deterministic generator makes high-frequency noise replayable per session. */
class SeededNoise {
  private seed: number;

  constructor(seed = 0x9f3a2c) {
    this.seed = seed >>> 0;
  }

  next(): number {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  normal(): number {
    const u = Math.max(this.next(), Number.EPSILON);
    const v = this.next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}

/* Durable outbox: IndexedDB first, localStorage / memory as controlled fallbacks. */
class IndexedDbOutbox {
  private readonly dbName = "smartlab-forensic-outbox-v1";
  private readonly storeName = "telemetry";
  private readonly fallbackKey = "smartlab-forensic-outbox-fallback-v1";
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private memory = new Map<string, StoredFrame>();
  private writes: Promise<void> = Promise.resolve();

  private open(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve) => {
      if (typeof indexedDB === "undefined") {
        resolve(null);
        return;
      }
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
    return this.dbPromise;
  }

  private readFallback(): StoredFrame[] {
    try {
      if (typeof localStorage === "undefined") return Array.from(this.memory.values());
      const raw = localStorage.getItem(this.fallbackKey);
      return raw ? (JSON.parse(raw) as StoredFrame[]) : Array.from(this.memory.values());
    } catch {
      return Array.from(this.memory.values());
    }
  }

  private writeFallback(): void {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.fallbackKey, JSON.stringify(Array.from(this.memory.values())));
      }
    } catch {
      /* Quota and private-browser errors retain the in-memory test path. */
    }
  }

  async put(frame: StoredFrame): Promise<void> {
    this.memory.set(frame.key, frame);
    this.writes = this.writes.then(async () => {
      const db = await this.open();
      if (!db) {
        this.writeFallback();
        return;
      }
      await new Promise<void>((resolve) => {
        const tx = db.transaction(this.storeName, "readwrite");
        tx.objectStore(this.storeName).put(frame);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      });
    });
    await this.writes;
  }

  async readAll(): Promise<StoredFrame[]> {
    await this.writes;
    const db = await this.open();
    if (!db) {
      const frames = this.readFallback();
      frames.forEach((frame) => this.memory.set(frame.key, frame));
      return frames;
    }
    return new Promise<StoredFrame[]>((resolve) => {
      const tx = db.transaction(this.storeName, "readonly");
      const request = tx.objectStore(this.storeName).getAll();
      request.onsuccess = () => {
        const frames = request.result as StoredFrame[];
        frames.forEach((frame) => this.memory.set(frame.key, frame));
        resolve(frames);
      };
      request.onerror = () => resolve(Array.from(this.memory.values()));
    });
  }

  async remove(key: string): Promise<void> {
    this.memory.delete(key);
    this.writes = this.writes.then(async () => {
      const db = await this.open();
      if (!db) {
        this.writeFallback();
        return;
      }
      await new Promise<void>((resolve) => {
        const tx = db.transaction(this.storeName, "readwrite");
        tx.objectStore(this.storeName).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      });
    });
    await this.writes;
  }

  async clear(): Promise<void> {
    this.memory.clear();
    this.writes = this.writes.then(async () => {
      const db = await this.open();
      if (!db) {
        this.writeFallback();
        return;
      }
      await new Promise<void>((resolve) => {
        const tx = db.transaction(this.storeName, "readwrite");
        tx.objectStore(this.storeName).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      });
    });
    await this.writes;
  }
}

export class NodeSim {
  /* Public instrumentation state read by the React HUD. */
  status: SimStatus = "BOOT";
  sessionId = "PZT-9F3A2C";
  scenario: Scenario = "NORMAL_CURING";
  certification: Certification = "PENDING";
  registrationBlocked = false;
  networkBlackout = false;
  recovering = false;
  virtualDay = 1;
  timeScale = 8;
  hydration = 0;
  microStrain = 0;
  noiseSigma = 0;
  counts = 0;
  vMV = 0;
  rK = 0.25;
  gUS = 0;
  fRes = 226;
  damage = 0;
  rssi = -54;
  uptime = 0;
  sweepIdx = 0;
  sweepHzNow = 1;
  paused = false;
  signalDisconnected = false;
  collapsePhase: CollapsePhase = "IDLE";
  freqs: number[] = [];
  trace: number[] = [];
  prevTrace: number[] = [];
  baseline: number[] = [];
  packets: PacketRec[] = [];
  logs: DiagnosticLog[] = [];
  packetSeq = 0;
  crushFlash = 0;
  diagnostics: SimDiagnostics = {
    framesGenerated: 0,
    framesAccepted: 0,
    framesBuffered: 0,
    framesRecovered: 0,
    framesDropped: 0,
    validationPass: 0,
    validationFail: 0,
    retryAttempts: 0,
    retryOverhead: 0,
    bufferDepth: 0,
    recoveryInFlight: 0,
    lastLatencyMS: 0,
    avgNoiseCounts: 0,
    noiseStdDev: 0,
    highestNoiseCounts: 0,
    lineageChecks: 0,
    lineageFailures: 0,
  };

  private readonly archive = new IndexedDbOutbox();
  private readonly noise = new SeededNoise();
  private readonly outbox = new Map<number, PacketRec>();
  private readonly recoveryJobs = new Map<number, RecoveryJob>();
  private start = monotonicNow();
  private last = this.start;
  private bootT = this.start;
  private sweepAcc = 0;
  private packetAcc = 0;
  private collapseStartedAt = 0;
  private collapseSpikeEndsAt = 0;
  private collapseOpenAt = 0;
  private logSeq = 0;
  private noiseN = 0;
  private noiseMean = 0;
  private noiseM2 = 0;
  private lastValidationAt = 0;
  private archiveLoaded = false;
  private archiveEpoch = 0;

  /* ── Deep-Tech AI subsystem variables ────────────────────────── */

  // 1. Predictive Non-Linear Regressor — rolling early-age drift buffer
  // fResHistory stores [day, fRes_kHz] pairs observed from each completed sweep
  // so we can compute ΔF/Δt and calibrate the asymptotic projection.
  fResHistory: Array<{ day: number; fRes: number }> = [];
  // Impedance drift derivative (kHz / day) captured from the early-age window
  impedanceDriftRate = 0;       // d(Fres)/dt at measurement time
  // Outputs published to the HUD
  predDay28MPa = 42.5;
  predConfidence = 83;
  predCI = 2.8;
  // Design-reference EMI profile (frozen at construction from the Day-1 baseline)
  // Used by the mix-adulteration spectral filter
  mixDesignEnvelope: number[] = [];
  mixEnvelopeDiff: number[] = []; // normalised per-bin deviation vs design curve

  // 2. Structural Adulteration & Mix Design baselines
  mixAdulterationDetected = false;
  waterCementRatio = 0.45;   // nominal 0.45, raised to 0.68 on fraud
  skewnessIndex = 0.02;      // spectral peak asymmetry
  dampeningCoeff = 1.0;      // amplitude scale (1.0 = pristine, 0.42 = fraud)
  crfDeviation = 0;          // Conductance Resonance Frequency deviation [kHz]

  // 3. PZT Thermal Self-Health Check
  pztSelfHealthScore = 100;    // 0–100 (%)
  pztCapacitanceNF = 12.0;     // nominal 12 nF self-capacitance
  pztMoistureIndex = 0.02;     // 0 = dry/ideal, 1 = saturated/degraded
  dcBiasPulseActive = false;
  dcBiasCycles = 0;
  dcBiasDurationMs = 0;        // elapsed time of current pulse

  // 4. ASTM C1074 maturity-method core temperature track
  coreTempC = 23.0;            // °C — exothermic hydration temperature
  equivalentAgeDays = 1.0;     // Arrhenius-adjusted equivalent age tₑ

  constructor() {
    for (let i = 0; i < SWEEP_STEPS; i++) {
      this.freqs.push(F_START * Math.pow(F_STOP / F_START, i / (SWEEP_STEPS - 1)));
    }
    this.baseline = this.freqs.map((_, index) => this.response(index, 1, 0, false).counts);
    /* Lock the mix design reference envelope at the Day-1 pristine profile.
     * The spectral filter compares every subsequent sweep against this. */
    this.mixDesignEnvelope = this.baseline.slice();
    this.mixEnvelopeDiff   = new Array(SWEEP_STEPS).fill(0);
    this.prevTrace = this.baseline.slice();
    this.trace = new Array(SWEEP_STEPS).fill(0);
    this.updateHydrationModel();
    this.log("INFO", "SIM", "virtual specimen initialized",
      "Day 1 baseline locked; 28-day hydration clock armed; mix design envelope sealed.");
    void this.hydratePersistentOutbox(this.archiveEpoch);
  }

  /* Logarithmic maturity captures fast early hydration then saturation. */
  private maturityAt(day: number): number {
    const normalizedLog = Math.log1p(clamp(day, 1, 28)) / Math.log(29);
    const cap = 1 - Math.exp(-2.35);
    return clamp((1 - Math.exp(-2.35 * normalizedLog)) / cap, 0, 1);
  }

  private expectedDamageAt(day: number): number {
    const age = Math.max(0, day - 1);
    return 31 * (1 - Math.exp(-0.122 * age));
  }

  private updateHydrationModel(): void {
    const maturity = this.maturityAt(this.virtualDay);
    this.hydration = maturity * 100;
    this.microStrain = 14 + 355 * (1 - Math.exp(-2.1 * maturity));
    this.noiseSigma = 3.8 + 8.8 * maturity + (this.collapsePhase === "MICROCRACKING" ? 48 : 0);
    if (this.scenario === "PRE_CURED_FRAUD") this.noiseSigma = 13.2;

    /* ── Mix design signature coefficients ─────────────────────── */
    if (this.scenario === "MIX_ADULTERATION") {
      this.waterCementRatio = 0.68;
      this.dampeningCoeff   = 0.42;
      this.skewnessIndex    = 0.15;
      this.mixAdulterationDetected = true;
    } else {
      this.waterCementRatio = 0.45;
      this.dampeningCoeff   = 1.0;
      this.skewnessIndex    = 0.02;
      this.mixAdulterationDetected = false;
    }

    /* ── Spectral envelope deviation vs design reference ────────── *
     *  mixEnvelopeDiff[i] = (prevTrace[i] - designEnv[i]) / designEnv[i]
     *  This is what the Mix Fraud Filter plots — if the live profile
     *  is systematically below the design envelope the mix is suspect. */
    if (this.mixDesignEnvelope.length === SWEEP_STEPS && this.prevTrace.length === SWEEP_STEPS) {
      let sumSqDev = 0;
      this.mixEnvelopeDiff = this.prevTrace.map((v, i) => {
        const ref = Math.max(this.mixDesignEnvelope[i], 1);
        const d = (v - ref) / ref;
        sumSqDev += d * d;
        return d;
      });
      // CRF deviation: shift in peak location vs design reference
      let peakI = 0; let designPeakI = 0;
      for (let i = 1; i < SWEEP_STEPS; i++) {
        if (this.prevTrace[i]          > this.prevTrace[peakI])          peakI = i;
        if (this.mixDesignEnvelope[i]  > this.mixDesignEnvelope[designPeakI]) designPeakI = i;
      }
      this.crfDeviation = this.freqs[peakI] - this.freqs[designPeakI];
    }

    /* ── Predictive Non-Linear AI Regressor ────────────────────── *
     *  The regressor tracks d(Fres)/dt from the early-age rolling
     *  window (fResHistory), extrapolates the Plowman asymptote, and
     *  computes a Confidence Interval that narrows with data density.
     *
     *  Model:  fc_28 ≈ Plowman_28 * κ * (1 + α·∂F/∂t / F0)
     *    κ     = mix quality scalar  (1.0 nominal, 0.58 fraud)
     *    ∂F/∂t = impedance drift derivative [kHz/day]
     *    F0    = Day-1 baseline resonant frequency [kHz]
     *
     *  CI shrinks as: σ_CI = σ_max * exp(-λ * n_samples)
     *    σ_max = 2.8 MPa (no data), shrinks to 0.9 MPa at Day 28
     ---------------------------------------------------------------- */
    const nObs   = this.fResHistory.length;

    // Compute drift derivative from the rolling window (up to 3 simulated days)
    if (nObs >= 2) {
      const oldest = this.fResHistory[0];
      const newest = this.fResHistory[nObs - 1];
      const deltaDay  = Math.max(newest.day - oldest.day, 0.001);
      const deltaFres = newest.fRes - oldest.fRes;
      this.impedanceDriftRate = deltaFres / deltaDay; // kHz per simulated day
    }

    const F0           = this.freqs[Math.floor(SWEEP_STEPS * 0.55)]; // ~baseline resonance band
    const driftFactor  = nObs >= 2
      ? 1 + clamp(this.impedanceDriftRate / F0, -0.12, 0)   // drift is always negative (stiffening)
      : 1;

    const A = this.plowmanA;
    const B = this.plowmanB;
    const plowmanAt28 = A * Math.log(28) + B;

    const kappa = this.scenario === "MIX_ADULTERATION" ? 0.58 : 0.98;
    this.predDay28MPa = clamp(plowmanAt28 * kappa * (1 + driftFactor * 0.14), 12, 80);

    // Confidence: starts at 83 %, climbs rapidly with early-age data,
    // saturates near 98.5 % by Day 28
    const confRaw   = 83 + 15.5 * (1 - Math.exp(-0.55 * nObs));
    this.predConfidence = clamp(
      this.scenario === "MIX_ADULTERATION" ? confRaw * 0.88 : confRaw,
      78, 98.5
    );

    // CI in MPa — exponential decay from 2.8 → 0.9 as observations accumulate
    const sigmaMax = 2.8;
    const sigmaMin = 0.9;
    this.predCI = clamp(
      sigmaMax * Math.exp(-0.08 * nObs) + sigmaMin * (1 - Math.exp(-0.08 * nObs)),
      sigmaMin, sigmaMax
    );
    if (this.scenario === "MIX_ADULTERATION") this.predCI = clamp(this.predCI * 1.55, sigmaMin, 4.2);

    /* ── ASTM C1074 core hydration temperature ──────────────────── *
     *  Exothermic model: cement hydration drives the core up ~19.5 °C
     *  over ambient, peaking inside Days 2–5, then cooling back to the
     *  ambient equilibrium as the heat dissipates and set completes.
     *  Equivalent age tₑ uses the standard 2×/10 °C maturity shortcut. */
    const ambient = 23.0;
    const peakRise = 19.5;
    const x = this.virtualDay;
    const exothermGate = x > 1
      ? clamp(Math.exp(1.4 - 0.22 * x), 0, 1)
      : 1;
    this.coreTempC = clamp(
      ambient +
        peakRise * maturity * exothermGate +
        Math.sin(this.uptime * 0.35) * 0.25,
      ambient - 1.0,
      58.0
    );
    this.equivalentAgeDays = this.virtualDay * Math.pow(
      2,
      (this.coreTempC - ambient) / 10
    );
  }

  /* EMI response: hydration shifts resonance down and broadens its Q. */
  private response(index: number, day: number, time: number, noisy: boolean): { counts: number; noise: number } {
    const f = this.freqs[index];
    const maturity = this.maturityAt(day);
    
    // Mix Adulteration skews the central resonant frequency and severely dampens amplitude
    const dampFactor = this.dampeningCoeff;
    const skewOffset = (this.scenario === "MIX_ADULTERATION") ? (index - 48) * this.skewnessIndex * 2.8 : 0;
    
    const f1 = 229.4 - 24.2 * maturity + skewOffset;
    const qWidth = (8.4 + 7.8 * maturity) * (this.scenario === "MIX_ADULTERATION" ? 1.6 : 1.0);
    const f2 = 352 - 18.5 * maturity;
    
    const primary = (775 + 96 * maturity) * gaussian(f, f1, qWidth) * dampFactor;
    const overtone = (205 + 34 * maturity) * gaussian(f, f2, 15.5 + 2 * maturity) * dampFactor;
    const continuum = (52 + maturity * 18 + Math.log1p(f) * 2.1) * dampFactor;
    const ripple = Math.sin(time * 0.0019 + index * 0.79) * (3 + maturity * 5);
    const sigma = noisy ? this.noiseSigma : 0;
    const noise = noisy ? this.noise.normal() * sigma : 0;
    return { counts: clamp(primary + overtone + continuum + ripple + noise, 0, ADC_MAX), noise };
  }

  private dividerFromCounts(counts: number): { v: number; r: number; g: number } {
    const v = (counts / ADC_MAX) * VREF;
    if (counts <= 12) return { v, r: 10000, g: 0 };
    const r = ((R_SERIES * v) / Math.max(VREF - v, 25)) / 1000;
    return { v, r, g: r > 0.001 ? 1000 / r : 0 };
  }

  private rmsd(cur: number[], ref: number[]): number {
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < cur.length; i++) {
      const delta = cur[i] - ref[i];
      numerator += delta * delta;
      denominator += ref[i] * ref[i];
    }
    return denominator > 0 ? Math.sqrt(numerator / denominator) * 100 : 0;
  }

  private addNoiseSample(noise: number): void {
    const magnitude = Math.abs(noise);
    this.noiseN++;
    const delta = magnitude - this.noiseMean;
    this.noiseMean += delta / this.noiseN;
    this.noiseM2 += delta * (magnitude - this.noiseMean);
    this.diagnostics.avgNoiseCounts = this.noiseMean;
    this.diagnostics.noiseStdDev = this.noiseN > 1 ? Math.sqrt(this.noiseM2 / (this.noiseN - 1)) : 0;
    this.diagnostics.highestNoiseCounts = Math.max(this.diagnostics.highestNoiseCounts, magnitude);
  }

  private log(level: LogLevel, channel: DiagnosticLog["channel"], message: string, detail?: string): void {
    this.logSeq++;
    this.logs.unshift({
      id: this.logSeq,
      at: new Date().toISOString(),
      t: this.uptime,
      virtualDay: this.virtualDay,
      level,
      channel,
      message,
      detail,
    });
    if (this.logs.length > 140) this.logs.pop();
  }

  private packetKey(packet: PacketRec): string {
    return `${this.sessionId}:${packet.id}:${packet.timestampMs}`;
  }

  private buildPacket(fault: boolean): PacketRec {
    this.packetSeq++;
    const status = this.status === "CRUSHED" ? "CRUSHED" : "ACTIVE";
    const timestampMs = Date.now();
    const doc: Record<string, unknown> = {
      session_id: this.sessionId,
      timestamp: new Date(timestampMs).toISOString(),
      virtual_day: Number(this.virtualDay.toFixed(4)),
      hydration_pct: Number(this.hydration.toFixed(2)),
      micro_strain: Number(this.microStrain.toFixed(2)),
      voltage_peak: Number(this.vMV.toFixed(1)),
      resistance: Number(this.rK.toFixed(3)),
      frequency: Number(this.fRes.toFixed(2)),
      conductance: Math.round(this.gUS),
      damage_index: Number(this.damage.toFixed(2)),
      adc_noise_sigma: Number(this.noiseSigma.toFixed(2)),
      core_temp_c:   Number(this.coreTempC.toFixed(1)),
      equiv_age_d:   Number(this.equivalentAgeDays.toFixed(2)),
      rssi: Math.round(this.rssi),
      uptime_s: Math.floor(this.uptime),
      status,
      qa_scenario: this.scenario,
      certification: this.certification,
    };
    let tamper: PacketRec["tamper"];
    if (this.scenario === "PHYSICAL_DISCONNECTION") {
      tamper = "PHYSICAL_DISCONNECTION";
      doc.tamper = tamper;
    }
    if (this.scenario === "PRE_CURED_FRAUD") {
      tamper = "PRE_CURED_SPECIMEN";
      doc.tamper = tamper;
    }
    if (fault || this.status === "CRUSHED") {
      doc.fault = "CONCRETE_CRUSHED";
      doc.fault_t_ms = Math.round(this.uptime * 1000);
    }
    return {
      id: this.packetSeq,
      timestampMs,
      timestampIso: doc.timestamp as string,
      t: this.uptime,
      virtualDay: this.virtualDay,
      voltage: this.vMV,
      resistance: this.rK,
      frequency: this.fRes,
      conductance: this.gUS,
      damage: this.damage,
      microStrain: this.microStrain,
      hydration: this.hydration,
      noiseSigma: this.noiseSigma,
      tempC: this.coreTempC,
      rssi: Math.round(this.rssi),
      status,
      certification: this.certification,
      scenario: this.scenario,
      route: "LIVE",
      attempts: 0,
      fault: fault || this.status === "CRUSHED",
      tamper,
      json: JSON.stringify(doc, null, 2),
    };
  }

  private emitPacket(fault = false): void {
    const packet = this.buildPacket(fault);
    this.packets.unshift(packet);
    if (this.packets.length > 80) this.packets.pop();
    this.diagnostics.framesGenerated++;
    this.routeNewPacket(packet);
  }

  private routeNewPacket(packet: PacketRec): void {
    if (this.networkBlackout) {
      this.bufferPacket(packet, "web upload channel intentionally blacked out");
      return;
    }
    packet.route = "LIVE";
    this.diagnostics.framesAccepted++;
    this.diagnostics.lastLatencyMS = 95 + Math.round(this.noise.next() * 110);
    this.log("NET", "NETWORK", `frame #${packet.id} accepted by live channel`, `${this.diagnostics.lastLatencyMS} ms · 201 Created`);
  }

  private bufferPacket(packet: PacketRec, detail: string): void {
    if (this.outbox.size >= MAX_BUFFERED_FRAMES) {
      const oldest = this.outbox.keys().next().value as number | undefined;
      if (oldest !== undefined) {
        const dropped = this.outbox.get(oldest);
        this.outbox.delete(oldest);
        if (dropped) {
          dropped.route = "DROPPED";
          this.diagnostics.framesDropped++;
          void this.archive.remove(this.packetKey(dropped));
        }
      }
      this.log("WARN", "STORAGE", "outbox capacity reached; oldest frame discarded", `cap ${MAX_BUFFERED_FRAMES} frames`);
    }
    packet.route = "BUFFERED";
    this.outbox.set(packet.id, packet);
    this.diagnostics.framesBuffered++;
    this.diagnostics.bufferDepth = this.outbox.size;
    void this.archive.put({ key: this.packetKey(packet), packet });
    this.log("NET", "NETWORK", `frame #${packet.id} persisted to IndexedDB outbox`, detail);
  }

  private async hydratePersistentOutbox(epoch: number): Promise<void> {
    const frames = await this.archive.readAll();
    if (epoch !== this.archiveEpoch) return;
    for (const frame of frames) {
      frame.packet.route = "BUFFERED";
      this.outbox.set(frame.packet.id, frame.packet);
      this.packetSeq = Math.max(this.packetSeq, frame.packet.id);
    }
    this.archiveLoaded = true;
    this.diagnostics.bufferDepth = this.outbox.size;
    if (frames.length > 0) {
      this.log("INFO", "STORAGE", "durable outbox restored", `${frames.length} historical timestamped frame(s) available for replay`);
      if (!this.networkBlackout) this.beginRecovery();
    }
  }

  private beginRecovery(): void {
    if (this.networkBlackout || this.outbox.size === 0 || this.recovering) return;
    this.recovering = true;
    this.log("NET", "NETWORK", "network restored; concurrent recovery scheduler armed", `${this.outbox.size} frame(s) queued · ${RECOVERY_CONCURRENCY} routes`);
  }

  private processRecovery(now: number): void {
    if (this.networkBlackout || !this.recovering) return;

    for (const [packetId, job] of this.recoveryJobs) {
      if (now < job.completeAt) continue;
      const packet = this.outbox.get(packetId);
      this.recoveryJobs.delete(packetId);
      if (!packet) continue;

      const failThisAttempt = ((packet.id * 7 + packet.attempts * 11) % 13 === 0) && packet.attempts < 3;
      if (failThisAttempt) {
        if (packet.attempts >= MAX_RECOVERY_ATTEMPTS) {
          packet.route = "DROPPED";
          this.outbox.delete(packet.id);
          this.diagnostics.framesDropped++;
          void this.archive.remove(this.packetKey(packet));
          this.log("WARN", "NETWORK", `frame #${packet.id} exhausted recovery budget`, "dropped after four attempts");
        } else {
          const backoff = Math.min(1000 * 2 ** Math.max(0, packet.attempts - 1), 8000);
          packet.route = "BUFFERED";
          (packet as PacketWithRetry).retryAt = now + backoff;
          this.diagnostics.retryAttempts++;
          this.log("NET", "NETWORK", `frame #${packet.id} transient route failure`, `backoff ${backoff} ms · attempt ${packet.attempts}/${MAX_RECOVERY_ATTEMPTS}`);
        }
      } else {
        packet.route = "RECOVERED";
        this.outbox.delete(packet.id);
        this.diagnostics.framesRecovered++;
        this.diagnostics.framesAccepted++;
        this.diagnostics.lastLatencyMS = 130;
        void this.archive.remove(this.packetKey(packet));
        this.log("NET", "NETWORK", `frame #${packet.id} recovered`, `source ${packet.timestampIso} retained · 202 Accepted`);
      }
    }

    while (this.recoveryJobs.size < RECOVERY_CONCURRENCY) {
      const packet = Array.from(this.outbox.values()).find((entry) => {
        const retryAt = (entry as PacketWithRetry).retryAt ?? 0;
        return entry.route === "BUFFERED" && retryAt <= now;
      });
      if (!packet) break;
      packet.route = "RECOVERING";
      packet.attempts++;
      const latency = 90 + Math.round(this.noise.next() * 260);
      this.recoveryJobs.set(packet.id, { packetId: packet.id, completeAt: now + latency });
      this.log("NET", "NETWORK", `frame #${packet.id} dispatched to replay lane`, `attempt ${packet.attempts} · concurrent ${this.recoveryJobs.size}/${RECOVERY_CONCURRENCY}`);
    }

    this.diagnostics.bufferDepth = this.outbox.size;
    this.diagnostics.recoveryInFlight = this.recoveryJobs.size;
    this.diagnostics.retryOverhead = this.diagnostics.framesRecovered > 0
      ? (this.diagnostics.retryAttempts / this.diagnostics.framesRecovered) * 100
      : 0;
    if (this.outbox.size === 0 && this.recoveryJobs.size === 0) {
      this.recovering = false;
      this.log("NET", "NETWORK", "recovery drain complete", "outbox is empty; live route returned to nominal 1 Hz");
    }
  }

  private validateLineage(): void {
    if (this.uptime - this.lastValidationAt < 2.2) return;
    this.lastValidationAt = this.uptime;
    this.diagnostics.lineageChecks++;
    if (this.scenario === "PRE_CURED_FRAUD") {
      this.certification = "BLOCKED";
      this.registrationBlocked = true;
      this.diagnostics.validationFail++;
      this.diagnostics.lineageFailures++;
      this.log("VALID", "VALIDATOR", "registration blocked: pre-cured signature detected", `new session reports Day ${this.virtualDay.toFixed(1)} maturity; expected Day 1 lineage`);
      return;
    }
    if (this.scenario === "MIX_ADULTERATION") {
      this.certification = "MIX_HAZARD";
      this.registrationBlocked = true;
      this.diagnostics.validationFail++;
      this.diagnostics.lineageFailures++;
      this.log("FAULT", "VALIDATOR", "MIX_ADULTERATION_DETECTED: substandard cement mix", `high water-cement ratio of ${this.waterCementRatio.toFixed(2)} detected; resonance dampening factor ${this.dampeningCoeff.toFixed(2)} violating ASTM baselines`);
      return;
    }
    if (this.signalDisconnected && this.status !== "CRUSHED") {
      this.certification = "NOT_CERTIFIED";
      this.registrationBlocked = true;
      this.diagnostics.validationFail++;
      this.diagnostics.lineageFailures++;
      this.log("VALID", "VALIDATOR", "NOT CERTIFIED: physical disconnection without strain pulse", "0 mV observed; collapse dual-stage signature absent");
      return;
    }
    this.certification = this.virtualDay >= 1.02 ? "CERTIFIED" : "PENDING";
    this.diagnostics.validationPass++;
    this.log("VALID", "VALIDATOR", "lineage check passed", `Day ${this.virtualDay.toFixed(2)} · hydration ${this.hydration.toFixed(1)}% · RMSD ${this.damage.toFixed(2)}%`);
  }

  private finishSweep(): void {
    this.prevTrace = this.trace.slice();
    let peakIndex = 0;
    for (let index = 1; index < SWEEP_STEPS; index++) {
      if (this.prevTrace[index] > this.prevTrace[peakIndex]) peakIndex = index;
    }
    /* Quadratic interpolation around the maximum avoids quantizing Fres to a sweep bin. */
    const left = Math.max(0, peakIndex - 1);
    const right = Math.min(SWEEP_STEPS - 1, peakIndex + 1);
    const yLeft = this.prevTrace[left];
    const yCenter = this.prevTrace[peakIndex];
    const yRight = this.prevTrace[right];
    const denominator = yLeft - 2 * yCenter + yRight;
    const delta = Math.abs(denominator) > Number.EPSILON
      ? clamp(0.5 * (yLeft - yRight) / denominator, -1, 1)
      : 0;
    const logStep = Math.log(this.freqs[right]) - Math.log(this.freqs[peakIndex]);
    this.fRes = Math.exp(Math.log(this.freqs[peakIndex]) + delta * logStep);
    const measuredRmsd = this.rmsd(this.prevTrace, this.baseline);
    this.damage = clamp(Math.max(measuredRmsd, this.expectedDamageAt(this.virtualDay)), 0, 96);
    this.trace = new Array(SWEEP_STEPS).fill(0);
    this.sweepIdx = 0;

    /* ── Append to early-age drift history ──────────────────────── *
     *  Retain the last 48 readings only within the first 3 virtual days
     *  so the regressor is calibrated purely on early-age data.      */
    if (this.virtualDay <= 3.05) {
      this.fResHistory.push({ day: this.virtualDay, fRes: this.fRes });
      if (this.fResHistory.length > 48) this.fResHistory.shift();
    }

    this.validateLineage();
    this.log("MATH", "MATH", "sweep reduction complete",
      `F ${this.fRes.toFixed(2)} kHz · RMSD ${this.damage.toFixed(2)}% · drift ${this.impedanceDriftRate.toFixed(3)} kHz/day · CI ±${this.predCI.toFixed(2)} MPa`);
  }

  private updateCollapseScenario(now: number): void {
    if (this.scenario !== "ACOUSTIC_COLLAPSE" || this.collapsePhase === "LATCHED") return;
    const elapsed = now - this.collapseStartedAt;
    if (this.collapsePhase === "MICROCRACKING" && elapsed >= 2200) {
      this.collapsePhase = "SPIKE";
      this.collapseSpikeEndsAt = now + 420;
      this.log("FAULT", "SIM", "acoustic compression spike injected", `ADC peak held above ${CRUSH_SPIKE} counts`);
    }
    if (this.collapsePhase === "SPIKE" && now >= this.collapseSpikeEndsAt) {
      this.collapsePhase = "OPEN_CONFIRM";
      this.collapseOpenAt = now;
      this.signalDisconnected = true;
      this.log("FAULT", "SIM", "post-spike open-circuit window entered", "dual-stage detector awaiting 30 ms confirmation");
    }
    if (this.collapsePhase === "OPEN_CONFIRM" && now - this.collapseOpenAt >= 30) {
      this.collapsePhase = "LATCHED";
      this.status = "CRUSHED";
      this.signalDisconnected = true;
      this.crushFlash = 1;
      this.certification = "NOT_CERTIFIED";
      this.log("FAULT", "VALIDATOR", "CONCRETE_CRUSHED latched", "spike -> open circuit dual-stage sequence confirmed in 30 ms window");
      this.emitPacket(true);
    }
  }

  private sampleSweep(now: number, dt: number): void {
    if (this.status !== "ACTIVE" || this.paused) return;
    this.sweepAcc += dt;
    while (this.sweepAcc >= DWELL_WALL_MS) {
      this.sweepAcc -= DWELL_WALL_MS;
      let sample: { counts: number; noise: number };
      if (this.signalDisconnected) {
        sample = { counts: 0, noise: 0 };
      } else if (this.collapsePhase === "SPIKE") {
        sample = { counts: CRUSH_SPIKE + 140 + this.noise.next() * 340, noise: this.noise.normal() * 46 };
      } else {
        sample = this.response(this.sweepIdx, this.virtualDay, now, true);
        if (this.collapsePhase === "MICROCRACKING") {
          const escalation = clamp((now - this.collapseStartedAt) / 2200, 0, 1);
          sample.counts = clamp(sample.counts + this.noise.normal() * (36 + escalation * 135), 0, ADC_MAX);
        }
      }
      this.trace[this.sweepIdx] = sample.counts;
      this.counts = sample.counts;
      this.sweepHzNow = this.freqs[this.sweepIdx];
      this.addNoiseSample(sample.noise);
      this.sweepIdx++;
      if (this.sweepIdx >= SWEEP_STEPS) this.finishSweep();
    }
    const d = this.dividerFromCounts(this.counts);
    this.vMV = this.signalDisconnected ? 0 : d.v;
    this.rK = this.signalDisconnected ? 10000 : d.r;
    this.gUS = this.signalDisconnected ? 0 : d.g;
  }

  tick(now: number): void {
    const dt = Math.min(Math.max(now - this.last, 0), 250);
    this.last = now;
    this.uptime = (now - this.start) / 1000;
    this.rssi = this.networkBlackout ? -127 : -54 + Math.sin(now * 0.00031) * 3 + (this.noise.next() - 0.5) * 1.6;

    /* Animate PZT moisture index: drifts upward slowly from humidity ingress,
     * then snaps to near-zero on DC Bias stabilization. */
    if (!this.dcBiasPulseActive) {
      this.pztMoistureIndex = clamp(this.pztMoistureIndex + dt * 0.000028, 0, 0.98);
    }
    /* Health score degrades with moisture; recovers after a bias pulse. */
    this.pztSelfHealthScore = Math.round(clamp(100 - this.pztMoistureIndex * 38, 62, 100));
    /* Self-capacitance drifts slightly: 12.0 nF ± 0.4 nF with moisture ingress. */
    this.pztCapacitanceNF = 12.0 + this.pztMoistureIndex * 0.42 + Math.sin(this.uptime * 0.27) * 0.06;
    if (this.dcBiasPulseActive) {
      this.dcBiasDurationMs += dt;
      if (this.dcBiasDurationMs >= 1800) {
        /* Pulse complete: moisture expelled, sensor stabilised. */
        this.pztMoistureIndex = 0.01;
        this.pztSelfHealthScore = 100;
        this.pztCapacitanceNF = 12.00;
        this.dcBiasPulseActive = false;
        this.dcBiasDurationMs = 0;
        this.log("INFO", "SIM", "Sensor self-health: 100% Core Stabilized",
          "DC Bias dry-out complete; boundary moisture expelled; capacitance locked at 12.00 nF");
      }
    }
    if (this.crushFlash > 0) this.crushFlash = Math.max(0, this.crushFlash - dt / 1400);

    if (this.status === "BOOT" && now - this.bootT > 520) this.status = "WIFI";
    if (this.status === "WIFI" && now - this.bootT > 1100) {
      this.status = "ACTIVE";
      this.log("INFO", "NETWORK", "virtual STA link established", "QA router online; telemetry scheduler released");
    }

    if (this.status === "ACTIVE" && !this.paused && this.scenario !== "PRE_CURED_FRAUD") {
      this.virtualDay = clamp(this.virtualDay + (dt / 1000) * VIRTUAL_DAYS_PER_SECOND * this.timeScale, 1, 28);
    }
    this.updateHydrationModel();
    this.updateCollapseScenario(now);
    this.sampleSweep(now, dt);

    this.packetAcc += dt;
    while (this.packetAcc >= TELEMETRY_PERIOD_MS) {
      this.packetAcc -= TELEMETRY_PERIOD_MS;
      if (this.status === "ACTIVE" || this.status === "CRUSHED") this.emitPacket();
    }

    if (this.archiveLoaded && !this.networkBlackout && this.outbox.size > 0) this.beginRecovery();
    this.processRecovery(now);
  }

  /* ── QA operator surface ───────────────────────────────────────── */
  private clearForScenario(next: Scenario): void {
    this.scenario = next;
    this.status = "ACTIVE";
    this.certification = "PENDING";
    this.registrationBlocked = false;
    this.signalDisconnected = false;
    this.collapsePhase = "IDLE";
    this.collapseStartedAt = 0;
    this.collapseSpikeEndsAt = 0;
    this.collapseOpenAt = 0;
    this.virtualDay = 1;
    this.damage = 0;
    this.counts = 0;
    this.vMV = 0;
    this.rK = 0.25;
    this.gUS = 0;
    this.sweepIdx = 0;
    this.sweepAcc = 0;
    this.packetAcc = 0;
    this.trace = new Array(SWEEP_STEPS).fill(0);
    this.prevTrace = this.baseline.slice();
    /* Reset AI regressor state for the new specimen session */
    this.fResHistory      = [];
    this.impedanceDriftRate = 0;
    this.predDay28MPa     = 42.5;
    this.predConfidence   = 83;
    this.predCI           = 2.8;
    this.mixEnvelopeDiff  = new Array(SWEEP_STEPS).fill(0);
    this.crfDeviation     = 0;
    this.packets = [];
    this.outbox.clear();
    this.recoveryJobs.clear();
    this.archiveEpoch++;
    this.recovering = false;
    this.diagnostics.bufferDepth = 0;
    this.diagnostics.recoveryInFlight = 0;
    void this.archive.clear();
  }

  runNormalCuring(): void {
    this.clearForScenario("NORMAL_CURING");
    this.log("INFO", "SIM", "Normal Curing Mode selected", "logarithmic hydration trajectory reset to Day 1 baseline");
  }

  runMixAdulterationMode(): void {
    this.clearForScenario("MIX_ADULTERATION");
    this.waterCementRatio = 0.68;
    this.dampeningCoeff = 0.42;
    this.skewnessIndex = 0.15;
    this.mixAdulterationDetected = true;
    this.certification = "MIX_HAZARD";
    this.registrationBlocked = true;
    this.diagnostics.validationFail++;
    this.diagnostics.lineageFailures++;
    this.log("WARN", "VALIDATOR", "MIX_ADULTERATION_DETECTED: dampening & skewing activated", "high water-cement ratio of 0.68 violating design curves; spectral peak amplitude dampened");
    this.emitPacket();
  }

  runDCBiasThermalHealthCheck(): void {
    if (this.dcBiasPulseActive) return;
    this.dcBiasPulseActive = true;
    this.dcBiasDurationMs = 0;
    this.dcBiasCycles++;
    this.log("INFO", "SIM",
      `GPIO25 DC Bias pulse #${this.dcBiasCycles} initiated — pre-scan thermal actuation`,
      `1.8 s stabilization window; target self-capacitance 12.00 nF; moisture index ${this.pztMoistureIndex.toFixed(3)}`);
  }

  injectPreCuredFraud(): void {
    this.clearForScenario("PRE_CURED_FRAUD");
    this.virtualDay = 28;
    this.updateHydrationModel();
    this.certification = "BLOCKED";
    this.registrationBlocked = true;
    this.diagnostics.validationFail++;
    this.diagnostics.lineageFailures++;
    this.log("WARN", "VALIDATOR", "Pre-Cured Specimen Fraud injected", "Day 28 EMI signature asserted against a new Day 1 session; registration hard-blocked");
    this.emitPacket();
  }

  triggerPhysicalDisconnection(): void {
    if (this.status === "CRUSHED") return;
    this.scenario = "PHYSICAL_DISCONNECTION";
    this.signalDisconnected = true;
    this.certification = "NOT_CERTIFIED";
    this.registrationBlocked = true;
    this.counts = 0;
    this.vMV = 0;
    this.rK = 10000;
    this.gUS = 0;
    this.diagnostics.validationFail++;
    this.diagnostics.lineageFailures++;
    this.log("WARN", "VALIDATOR", "physical disconnection tamper injected", "signal wire cut: 0 mV with no preceding micro-strain pulse -> NOT CERTIFIED");
    this.emitPacket();
  }

  triggerAcousticCollapse(): void {
    if (this.status === "CRUSHED" || this.collapsePhase !== "IDLE") return;
    this.scenario = "ACOUSTIC_COLLAPSE";
    this.collapsePhase = "MICROCRACKING";
    this.collapseStartedAt = this.last;
    this.log("FAULT", "SIM", "Acoustic Compression Collapse started", "high-frequency micro-crack noise will escalate before the 30 ms dual-stage collapse window");
  }

  /* Backwards-compatible hook for the original telemetry control. */
  triggerCrush(): void {
    this.triggerAcousticCollapse();
  }

  loadCycle(): void {
    if (this.status === "CRUSHED" || this.signalDisconnected) return;
    this.virtualDay = clamp(this.virtualDay + 1.5, 1, 28);
    this.updateHydrationModel();
    this.log("MATH", "SIM", "accelerated hydration load cycle applied", `virtual clock advanced to Day ${this.virtualDay.toFixed(2)}`);
  }

  toggleNetworkBlackout(): void {
    this.networkBlackout = !this.networkBlackout;
    if (this.networkBlackout) {
      this.log("WARN", "NETWORK", "Simulate Network Blackout ON", "web upload channels dropped; packets retain source timestamps in IndexedDB");
      return;
    }
    this.log("INFO", "NETWORK", "Network Restored", "starting exponential-backoff recovery stress test");
    this.beginRecovery();
  }

  setTimeScale(scale: number): void {
    this.timeScale = clamp(scale, 1, 64);
    this.log("INFO", "SIM", "virtual time compression changed", `${this.timeScale}x — ${(VIRTUAL_DAYS_PER_SECOND * this.timeScale).toFixed(3)} simulated days / real second`);
  }

  reset(): void {
    this.runNormalCuring();
    this.status = "BOOT";
    this.bootT = this.last;
    this.log("INFO", "SIM", "node reset requested", "boot state restored; normal curing scenario queued");
  }

  togglePause(): void {
    if (this.status !== "ACTIVE") return;
    this.paused = !this.paused;
    this.log("INFO", "SIM", this.paused ? "sweep scheduler held" : "sweep scheduler resumed");
  }

  get spikeActive(): boolean {
    return this.collapsePhase === "SPIKE";
  }

  /* ── calibration controls exposed by the tuning panel ─────────── */
  calGain = 1.0;       // dimensionless scaling from conductance model
  calOffset = 0.0;     // MPa bias
  plowmanA = 8.4;      // Plowman maturity coefficient A (MPa / ln(day))
  plowmanB = 12.1;     // Plowman maturity intercept B (MPa)

  /** Plowman's logarithmic maturity law: fc(t) = A·ln(t) + B.
   *  This maps curing day directly to estimated compressive strength. */
  plowmanStrength(day: number): number {
    const t = Math.max(day, 1.02);
    return this.plowmanA * Math.log(t) + this.plowmanB;
  }

  /** Calibrated strength: feed-forward from conductance (µS) through
   *  the user-adjustable gain/offset, then blended with the Plowman
   *  maturity projection. */
  calibratedStrengthMPa(): number {
    const fromConductance = this.gUS * this.calGain * 0.0092 + this.calOffset;
    const fromMaturity = this.plowmanStrength(this.virtualDay);
    return (fromConductance * 0.62 + fromMaturity * 0.38);
  }

  /** Expose the internal packet emitter for the test suite. */
  emitTestPacket(): void {
    this.emitPacket();
  }

  get signalOpen(): boolean {
    return this.signalDisconnected;
  }
}

export const fmtClock = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

export const fmtNum = (value: number, decimals: number): string =>
  value >= 9999 ? "OPEN" : value.toFixed(decimals);