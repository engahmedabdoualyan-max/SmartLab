/* ================================================================ *
 *  TrafficBadges.tsx — Quick Safety & Status Beacons
 *
 *  Three large executive beacons replacing raw telemetry scanning:
 *   🟢 STRUCTURAL INTEGRITY SECURE
 *   🟡 ADMIXTURE SLUMP ANOMALY
 *   🔴 CRITICAL FRAUD / FAILURE ALERT
 *
 *  Behavior is driven by the live simulation state passed in from the
 *  InvestorZone host (not raw telemetry), so non-technical viewers
 *  understand the structure's health in under a second.
 * ================================================================ */

import { cn } from "../utils/cn";

export type BeaconState = "ok" | "warning" | "critical";

interface TrafficBadgesProps {
  integrityState: BeaconState;
  slumpDetected: boolean;
  fraudDetected: boolean;
}

export default function TrafficBadges({
  integrityState,
  slumpDetected,
  fraudDetected,
}: TrafficBadgesProps) {
  const ok = integrityState === "ok" && !fraudDetected;
  const amber = integrityState === "warning" || slumpDetected;
  const red = integrityState === "critical" || fraudDetected;

  const on = (state: BeaconState | boolean, active: boolean) => {
    if (active) {
      return state === "ok"? "bg-signal shadow-[0_0_24px_rgba(143,214,148,0.8)] animate-pulse"
          : state === "warning"? "bg-copper shadow-[0_0_24px_rgba(222,154,60,0.8)] animate-pulse"
          : "bg-alarm shadow-[0_0_24px_rgba(228,89,60,0.9)] animate-pulse";
    }
    return state === "ok"
      ? "bg-signaldeep/50 shadow-none"
      : state === "warning"
      ? "bg-copperdim/50 shadow-none"
      : "bg-alarm/40 shadow-none";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
      {/* GREEN */}
      <div className="border border-line bg-scope/30 p-3 flex flex-col items-center gap-2">
        <span className={cn("w-12 h-12 rounded-full transition-all duration-500", on("ok", ok))} />
        <div className={cn(
          "font-mono text-[10px] uppercase tracking-[0.14em] text-center transition-colors",
          ok ? "text-signal" : "text-dim"
        )}>
          STRUCTURAL INTEGRITY<br />SOLID — CODE COMPLIANT
        </div>
      </div>

      {/* AMBER */}
      <div className="border border-line bg-scope/30 p-3 flex flex-col items-center gap-2">
        <span className={cn("w-12 h-12 rounded-full transition-all duration-500", on("warning", amber))} />
        <div className={cn(
          "font-mono text-[10px] uppercase tracking-[0.14em] text-center transition-colors",
          amber ? "text-copper" : "text-dim"
        )}>
          ADMIXTURE / SLUMP ANOMALY<br />MINOR CURING DEVIATION
        </div>
      </div>

      {/* RED */}
      <div className="border border-line bg-scope/30 p-3 flex flex-col items-center gap-2">
        <span className={cn("w-12 h-12 rounded-full transition-all duration-500", on("critical", red))} />
        <div className={cn(
          "font-mono text-[10px] uppercase tracking-[0.14em] text-center transition-colors",
          red ? "text-alarm" : "text-dim"
        )}>
          CRITICAL FRAUD / FAILURE<br />E-FRAUD-007 · ACTION NEEDED
        </div>
      </div>
    </div>
  );
}
