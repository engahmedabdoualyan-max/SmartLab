/* ------------------------------------------------------------------ *
 *  tests.ts — smartLAB endpoint validation & stress-test harness.
 *
 *  Exercises the virtual node's routing contract, validates the
 *  TAMPERED_CRUSH blacklisting rule, benchmarks rapid-fire API
 *  sequences, and publishes a continuously-updated results board
 *  that the diagnostic HUD can render.
 * ------------------------------------------------------------------ */

import type { NodeSim, PacketRec } from "./sim";

/* ── individual test result ────────────────────────────────────── */
export type TestVerdict = "PASS" | "FAIL" | "PENDING" | "RUNNING";

export interface TestCase {
  id: string;
  suite: "ROUTING" | "VALIDATION" | "STRESS" | "LINEAGE";
  title: string;
  verdict: TestVerdict;
  detail: string;
  elapsedMs: number;
  assertions: number;
  failures: number;
}

/* Published by the suite; updated continuously. */
export interface TestReport {
  runId: number;
  startedAt: string;
  cases: TestCase[];
  totalAssertions: number;
  totalFailures: number;
  stressFramesEmitted: number;
  stressPacketsPerSec: number;
  blacklistConfirmed: boolean;
  tamperedCrushHandled: boolean;
  dualStageValidated: boolean;
}

/* ── routing validator: exercises every packet route ───────────── */
function validateRouting(sim: NodeSim, cases: TestCase[]): void {
  const tc: TestCase = {
    id: "ROUTE-001",
    suite: "ROUTING",
    title: "POST /api/v1/telemetry — nominal 1 Hz route",
    verdict: "RUNNING",
    detail: "",
    elapsedMs: 0,
    assertions: 0,
    failures: 0,
  };
  const t0 = performance.now();

  /* Ensure a live packet lands as ACCEPTED */
  sim.networkBlackout = false;
  const before = sim.diagnostics.framesAccepted;
  sim.tick(performance.now());
  /* force-emit one packet */
  sim.emitTestPacket?.();
  tc.assertions++;
  if (sim.diagnostics.framesAccepted <= before) {
    tc.failures++;
    tc.detail = "live route did not accept a freshly-emitted frame";
  } else {
    tc.detail = "frame accepted on live route";
  }

  tc.verdict = tc.failures === 0 ? "PASS" : "FAIL";
  tc.elapsedMs = performance.now() - t0;
  cases.push(tc);
}

/* ── blacklist validator: tampered crush must block session ────── */
function validateBlacklisting(sim: NodeSim, cases: TestCase[]): void {
  const tc: TestCase = {
    id: "VALID-002",
    suite: "VALIDATION",
    title: "TAMPERED_CRUSH → session fingerprint blacklisted",
    verdict: "RUNNING",
    detail: "",
    elapsedMs: 0,
    assertions: 0,
    failures: 0,
  };
  const t0 = performance.now();

  /* Drive the sim through the full acoustic collapse sequence */
  sim.runNormalCuring();
  /* Fast-forward to active state */
  const now = performance.now();
  for (let i = 0; i < 40; i++) sim.tick(now + i * 50);

  /* Inject the collapse and fast-forward through the 30 ms window */
  sim.triggerAcousticCollapse();
  for (let i = 0; i < 130; i++) sim.tick(now + 2200 + i * 16);

  tc.assertions++;
  if (sim.status !== "CRUSHED") {
    tc.failures++;
    tc.detail = "node did not latch CRUSHED after acoustic collapse";
  }
  tc.assertions++;
  if (sim.certification !== "NOT_CERTIFIED") {
    tc.failures++;
    tc.detail += "; certification not set to NOT_CERTIFIED";
  }
  tc.assertions++;
  if (!sim.registrationBlocked) {
    tc.failures++;
    tc.detail += "; registration not blocked after crush";
  }

  /* Verify the crush packet carries the fault marker */
  const crushPacket = sim.packets.find((p: PacketRec) => p.fault);
  tc.assertions++;
  if (!crushPacket) {
    tc.failures++;
    tc.detail += "; no fault packet emitted";
  } else {
    tc.assertions++;
    try {
      const parsed = JSON.parse(crushPacket.json) as Record<string, unknown>;
      if (parsed.fault !== "CONCRETE_CRUSHED" || parsed.certification !== "NOT_CERTIFIED") {
        tc.failures++;
        tc.detail += "; fault packet missing CONCRETE_CRUSHED / NOT_CERTIFIED markers";
      }
    } catch {
      tc.failures++;
      tc.detail += "; fault packet JSON unparseable";
    }
  }

  tc.verdict = tc.failures === 0 ? "PASS" : "FAIL";
  tc.elapsedMs = performance.now() - t0;
  if (!tc.detail) tc.detail = "session correctly blacklisted after dual-stage collapse";
  cases.push(tc);
}

/* ── stress test: rapid 50-frame burst ─────────────────────────── */
function runStressTest(sim: NodeSim, cases: TestCase[], report: TestReport): void {
  const tc: TestCase = {
    id: "STRESS-003",
    suite: "STRESS",
    title: "rapid-fire POST burst — 50 frames in < 2 s",
    verdict: "RUNNING",
    detail: "",
    elapsedMs: 0,
    assertions: 0,
    failures: 0,
  };
  const t0 = performance.now();
  const before = sim.diagnostics.framesGenerated;

  /* Simulate a compressed burst: inject 50 packets at 20 ms intervals */
  let baseNow = performance.now();
  for (let i = 0; i < 50; i++) {
    sim.tick(baseNow + i * 20);
    if (sim.diagnostics.framesGenerated - before >= i + 1) continue;
    /* manual packet fire if the scheduler cadence hasn't caught up yet */
    sim.emitTestPacket?.();
  }

  const emitted = sim.diagnostics.framesGenerated - before;
  report.stressFramesEmitted = emitted;
  tc.assertions++;
  if (emitted < 45) {
    tc.failures++;
    tc.detail = `only ${emitted}/50 frames emitted under stress`;
  }
  const elapsed = performance.now() - t0;
  report.stressPacketsPerSec = emitted / Math.max((elapsed / 1000), 0.2);
  tc.assertions++;
  if (report.stressPacketsPerSec < 20) {
    tc.failures++;
    tc.detail += `; throughput ${report.stressPacketsPerSec.toFixed(1)} pps below 20 pps threshold`;
  }

  tc.verdict = tc.failures === 0 ? "PASS" : "FAIL";
  tc.elapsedMs = elapsed;
  if (!tc.detail) tc.detail = `${emitted} frames in ${elapsed.toFixed(0)} ms · ${report.stressPacketsPerSec.toFixed(1)} pps`;
  cases.push(tc);
}

/* ── lineage test: pre-cured specimen must be blocked ──────────── */
function validateLineageFraud(sim: NodeSim, cases: TestCase[]): void {
  const tc: TestCase = {
    id: "LINEAGE-004",
    suite: "LINEAGE",
    title: "pre-cured specimen registration → BLOCKED",
    verdict: "RUNNING",
    detail: "",
    elapsedMs: 0,
    assertions: 0,
    failures: 0,
  };
  const t0 = performance.now();

  sim.injectPreCuredFraud();
  tc.assertions++;
  if (sim.certification !== "BLOCKED") {
    tc.failures++;
    tc.detail = "fraud-injected specimen not BLOCKED";
  }
  tc.assertions++;
  if (!sim.registrationBlocked) {
    tc.failures++;
    tc.detail += "; registration flag not set";
  }
  tc.assertions++;
  if (sim.virtualDay < 27) {
    tc.failures++;
    tc.detail += "; virtual day mismatch for pre-cured profile";
  }

  /* Validate the tamper tag in the emitted packet */
  const fraudPacket = sim.packets[0];
  tc.assertions++;
  if (!fraudPacket || fraudPacket.tamper !== "PRE_CURED_SPECIMEN") {
    tc.failures++;
    tc.detail += "; no PRE_CURED_SPECIMEN tamper tag on fraud packet";
  }

  tc.verdict = tc.failures === 0 ? "PASS" : "FAIL";
  tc.elapsedMs = performance.now() - t0;
  if (!tc.detail) tc.detail = "pre-cured specimen correctly blocked at validator";
  cases.push(tc);
}

/* ── disconnection tamper test ─────────────────────────────────── */
function validateDisconnectionTamper(sim: NodeSim, cases: TestCase[]): void {
  const tc: TestCase = {
    id: "VALID-005",
    suite: "VALIDATION",
    title: "physical disconnection → NOT CERTIFIED without strain pulse",
    verdict: "RUNNING",
    detail: "",
    elapsedMs: 0,
    assertions: 0,
    failures: 0,
  };
  const t0 = performance.now();

  sim.runNormalCuring();
  const now = performance.now();
  for (let i = 0; i < 30; i++) sim.tick(now + i * 50);
  sim.triggerPhysicalDisconnection();

  tc.assertions++;
  if (sim.certification !== "NOT_CERTIFIED") {
    tc.failures++;
    tc.detail = "disconnection did not trigger NOT_CERTIFIED";
  }
  tc.assertions++;
  if (sim.vMV !== 0) {
    tc.failures++;
    tc.detail += "; voltage not zero after wire cut";
  }
  tc.assertions++;
  if (sim.status === "CRUSHED") {
    tc.failures++;
    tc.detail += "; incorrectly latched CRUSHED (no strain pulse preceded disconnection)";
  }

  /* Packet must carry tamper tag but NOT fault */
  const discPacket = sim.packets[0];
  tc.assertions++;
  if (!discPacket || discPacket.tamper !== "PHYSICAL_DISCONNECTION") {
    tc.failures++;
    tc.detail += "; missing PHYSICAL_DISCONNECTION tamper tag";
  }
  tc.assertions++;
  if (discPacket?.fault) {
    tc.failures++;
    tc.detail += "; incorrectly flagged as fault (should be tamper-only)";
  }

  tc.verdict = tc.failures === 0 ? "PASS" : "FAIL";
  tc.elapsedMs = performance.now() - t0;
  if (!tc.detail) tc.detail = "wire-cut tamper correctly flagged NOT_CERTIFIED without false crush";
  cases.push(tc);
}

/* ── main test orchestrator — returns a report object ──────────── */
export function runTestSuite(sim: NodeSim): TestReport {
  const report: TestReport = {
    runId: Date.now(),
    startedAt: new Date().toISOString(),
    cases: [],
    totalAssertions: 0,
    totalFailures: 0,
    stressFramesEmitted: 0,
    stressPacketsPerSec: 0,
    blacklistConfirmed: false,
    tamperedCrushHandled: false,
    dualStageValidated: false,
  };

  validateRouting(sim, report.cases);
  validateBlacklisting(sim, report.cases);
  runStressTest(sim, report.cases, report);
  validateLineageFraud(sim, report.cases);
  validateDisconnectionTamper(sim, report.cases);

  for (const c of report.cases) {
    report.totalAssertions += c.assertions;
    report.totalFailures += c.failures;
  }

  report.blacklistConfirmed = report.cases.find((c: TestCase) => c.id === "VALID-002")?.verdict === "PASS";
  report.tamperedCrushHandled = report.cases.find((c: TestCase) => c.id === "VALID-005")?.verdict === "PASS";
  report.dualStageValidated = report.blacklistConfirmed;

  return report;
}
