/* ================================================================ *
 *  SavingsCounter.tsx — Live Financial ROI & Cost-Savings Widget
 *
 *  Animated lab-green financial readout: predicts total SAR saved by
 *  bypassing destructive cylinder testing via continuous NDT.
 * ================================================================ */

import { useState, useEffect, useRef } from "react";

interface SavingsProps {
  virtualDay: number;
}

export default function SavingsCounter({ virtualDay }: SavingsProps) {
  const [coreCost, setCoreCost] = useState<number>(1500);
  const [wasteCost, setWasteCost] = useState<number>(150);

  /* Physical samples bypassed = 1 cylinder per test day (simplified,
   * real deployments use per-project NDT schedule). */
  const samplesBypassed = Math.max(1, Math.round(virtualDay * 2));
  const savings = samplesBypassed * (coreCost + wasteCost);

  /* animate the number counting up */
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const target = savings;
    const raf = requestAnimationFrame(function step() {
      const cur = prev.current;
      const next = cur + (target - cur) * 0.15;
      if (Math.abs(target - next) < 1) {
        prev.current = target;
        setDisplay(target);
      } else {
        prev.current = next;
        setDisplay(next);
        requestAnimationFrame(step);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [savings]);

  return (
    <div className="border border-signaldeep/40 bg-scope/30 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-signal">
            Total ROI Savings
          </div>
          <div className="mt-1 font-display font-bold text-[34px] tabular-nums leading-none text-signal"
            style={{ textShadow: "0 0 18px rgba(143,214,148,0.45)" }}>
            +{Math.round(display).toLocaleString()}
            <span className="ml-1 font-mono text-[14px] text-signaldeep">SAR</span>
          </div>
          <div className="font-mono text-[9px] text-dim mt-1">
            {samplesBypassed} destructive samples bypassed · {virtualDay.toFixed(1)} NDT days
          </div>
        </div>

        <div className="flex gap-2">
          <div>
            <label className="block font-mono text-[8.5px] uppercase text-dim mb-1">Core Test Cost (SAR)</label>
            <input
              type="number"
              value={coreCost}
              onChange={e => setCoreCost(Math.max(0, Number(e.target.value) || 0))}
              className="w-24 bg-scope border border-line px-2 py-1 font-mono text-[11px] text-paper text-end focus:outline-none focus:border-copperdim"
            />
          </div>
          <div>
            <label className="block font-mono text-[8.5px] uppercase text-dim mb-1">Cylinder Waste (SAR)</label>
            <input
              type="number"
              value={wasteCost}
              onChange={e => setWasteCost(Math.max(0, Number(e.target.value) || 0))}
              className="w-24 bg-scope border border-line px-2 py-1 font-mono text-[11px] text-paper text-end focus:outline-none focus:border-copperdim"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
