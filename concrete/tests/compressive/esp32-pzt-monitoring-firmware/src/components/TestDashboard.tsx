import { useEffect, useState } from "react";
import type { NodeSim } from "../sim";
import type { TestCase, TestReport } from "../tests";
import { runTestSuite } from "../tests";
import { Led } from "../ui";
import { cn } from "../utils/cn";

const verdictColor = (v: TestCase["verdict"]): string => {
  if (v === "PASS") return "var(--color-signal)";
  if (v === "FAIL") return "var(--color-alarm)";
  if (v === "RUNNING") return "var(--color-copper)";
  return "var(--color-dim)";
};

const suiteColor = (s: TestCase["suite"]): string => {
  if (s === "ROUTING") return "var(--color-copper)";
  if (s === "VALIDATION") return "var(--color-signal)";
  if (s === "STRESS") return "var(--color-teal)";
  return "var(--color-mute)";
};

export default function TestDashboard({ sim }: { sim: NodeSim }) {
  const [report, setReport] = useState<TestReport | null>(null);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [autoRun, setAutoRun] = useState(false);

  const execute = () => {
    setRunning(true);
    /* Yield to let the UI re-render before the synchronous harness runs. */
    requestAnimationFrame(() => {
      const r = runTestSuite(sim);
      setReport(r);
      setRunning(false);
    });
  };

  useEffect(() => {
    if (!autoRun) return;
    const iv = setInterval(execute, 6000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  const allPass = report && report.totalFailures === 0 && report.cases.length > 0;
  const hasFailures = report && report.totalFailures > 0;

  return (
    <div className="panel panel-corner overflow-hidden">
      {/* header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 border-b border-line bg-raise/40">
        <Led tone={allPass ? "signal" : hasFailures ? "alarm" : "copper"} size={7} />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-paper">
          End-to-End API Endpoint Test Suite
        </span>
        <span className="font-mono text-[10px] text-dim">
          POST /api/v1/telemetry · 5 cases
        </span>
        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-1.5 font-mono text-[10px] text-dim cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              className="accent-copper"
            />
            auto-run every 6s
          </label>
          <button
            onClick={execute}
            disabled={running}
            className={cn(
              "border px-3 py-1 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors disabled:opacity-40",
              allPass
                ? "border-signaldeep bg-signal/10 text-signal"
                : hasFailures
                ? "border-alarm/70 bg-alarm/10 text-alarmhi"
                : "border-copperdim bg-copper/10 text-copper"
            )}
          >
            {running ? "running…" : "run suite"}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="border border-line2 px-2 py-1 font-mono text-[10px] text-mute hover:text-paper transition-colors"
          >
            {expanded ? "collapse" : "expand"}
          </button>
        </div>
      </div>

      {/* summary bar */}
      {report && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2.5 border-b border-line font-mono text-[10.5px]",
            allPass ? "bg-signal/5" : "bg-alarm/5"
          )}
        >
          <span className={allPass ? "text-signal" : "text-alarm"}>
            {allPass ? "ALL TESTS PASSED" : `${report.totalFailures} FAILURE(S)`}
          </span>
          <span className="text-dim">{report.totalAssertions} assertions</span>
          <span className="text-dim">run #{String(report.runId % 100000).padStart(5, "0")}</span>
          <span className="ml-auto text-dim">
            {report.stressFramesEmitted > 0
              ? `stress: ${report.stressFramesEmitted} frames · ${report.stressPacketsPerSec.toFixed(1)} pps`
              : ""}
          </span>
        </div>
      )}

      {!report && !running && (
        <div className="px-4 py-8 text-center font-mono text-[11px] text-dim">
          press &ldquo;run suite&rdquo; to execute the endpoint validation, blacklisting,
          stress, and lineage tests
        </div>
      )}

      {running && (
        <div className="px-4 py-8 text-center font-mono text-[11px] text-copper">
          harness executing… routing → validation → stress → lineage →
        </div>
      )}

      {/* case grid */}
      {expanded && report && (
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            {/* column headings */}
            <div className="grid grid-cols-[52px_98px_1fr_1fr] divide-x divide-line border-b border-line font-mono text-[9.5px] tracking-[0.14em] uppercase text-dim bg-raise/30">
              <div className="px-3 py-2">no</div>
              <div className="px-3 py-2">verdict</div>
              <div className="px-3 py-2">case</div>
              <div className="px-3 py-2">detail / metrics</div>
            </div>

            {report.cases.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "grid grid-cols-[52px_98px_1fr_1fr] divide-x divide-line border-b border-line/50 font-mono text-[10.5px] hover:bg-raise/30 transition-colors",
                  c.verdict === "FAIL" && "bg-alarm/5"
                )}
              >
                <div className="px-3 py-2.5">
                  <span className="text-dim">{c.id.replace(/^[A-Z]+-/, "")}</span>
                </div>
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: verdictColor(c.verdict) }}
                  />
                  <span style={{ color: verdictColor(c.verdict) }}>{c.verdict}</span>
                </div>
                <div className="px-3 py-2.5">
                  <span className="text-paper leading-snug">{c.title}</span>
                  <span
                    className="ml-2 text-[9.5px] px-1 py-0.5 border"
                    style={{ borderColor: suiteColor(c.suite), color: suiteColor(c.suite) }}
                  >
                    {c.suite}
                  </span>
                </div>
                <div className="px-3 py-2.5 text-mute leading-snug">
                  {c.detail}
                  <span className="ml-3 text-dim">
                    {c.elapsedMs.toFixed(1)}ms · {c.assertions - c.failures}/{c.assertions} ok
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* expanded quick-actions */}
      {expanded && (
        <div className="border-t border-line px-4 py-2.5 flex flex-wrap items-center gap-3 font-mono text-[10px]">
          <span className="text-dim">quick-actions:</span>
          <button
            onClick={() => {
              sim.injectPreCuredFraud();
              setTimeout(execute, 160);
            }}
            className="border border-line2 px-2.5 py-1 text-mute hover:text-copper hover:border-copperdim transition-colors"
          >
            inject fraud → re-test
          </button>
          <button
            onClick={() => {
              sim.runNormalCuring();
              setTimeout(execute, 160);
            }}
            className="border border-line2 px-2.5 py-1 text-mute hover:text-signal hover:border-signaldeep transition-colors"
          >
            reset → re-test
          </button>
          {report && (
            <span className="ml-auto text-dim">
              last run: {new Date(report.startedAt).toLocaleTimeString()} ·{" "}
              {report.blacklistConfirmed ? (
                <span className="text-signal">blacklist ✓</span>
              ) : (
                <span className="text-alarm">blacklist ✗</span>
              )}
              {" · "}
              {report.tamperedCrushHandled ? (
                <span className="text-signal">tamper handled ✓</span>
              ) : (
                <span className="text-alarm">tamper ✗</span>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
