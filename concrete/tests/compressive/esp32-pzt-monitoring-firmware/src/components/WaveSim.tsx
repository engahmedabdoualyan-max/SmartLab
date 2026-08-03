/* ================================================================ *
 *  WaveSim.tsx — Interactive Strain Wave Propagation Simulation
 *
 *  Upgrades the 3D isometric concrete block to emit live animated
 *  ripple waves from the active MUX sensor node. Healthy state = rapid
 *  uniform sharp waves. Distress/fraud = broken, distorted, stuttering
 *  red pulses.
 * ================================================================ */

import { useEffect, useRef } from "react";

interface WaveSimProps {
  node: number;          // 0..3 active MUX rail
  healthy: boolean;      // false → red stuttering distortion
  scanActive: boolean;   // whether a scan is in progress
}

/* isometric projection of a unit-cube top face */
const NODES: [number, number][] = [
  [0.28, 0.82],
  [0.82, 0.82],
  [0.82, 0.28],
  [0.28, 0.28],
];

export default function WaveSim({ node, healthy, scanActive }: WaveSimProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);

  const W = 360, H = 300;

  /* single animation loop mutating a ref — no React re-render churn */
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = W / 2, cy = H / 2;
    const s = 78;
    const cos = Math.cos(Math.PI / 6);
    const proj = (nx: number, ny: number): [number, number] => [
      cx + (nx - ny) * cos * s,
      cy + (nx + ny) * 0.5 * s * 0.6,
    ];

    let raf = 0;

    const draw = () => {
      const ph = phaseRef.current;
      ctx.clearRect(0, 0, W, H);

      const active = NODES[node];

      // base block top face
      ctx.save();
      ctx.beginPath();
      const p0 = proj(0, 0), p1 = proj(1, 0), p2 = proj(1, 1), p3 = proj(0, 1);
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.closePath();
      ctx.fillStyle = "#101612";
      ctx.strokeStyle = "#33443a";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      for (let i = 0; i < 4; i++) {
        const np = proj(NODES[i][0], NODES[i][1]);
        ctx.beginPath();
        ctx.arc(np[0], np[1], 5, 0, Math.PI * 2);
        ctx.fillStyle = i === node ? (healthy ? "#8fd694" : "#e4593c") : "#2c3a30";
        ctx.fill();
      }

      if (scanActive) {
        const np = proj(active[0], active[1]);
        if (healthy) {
          for (let ring = 0; ring < 3; ring++) {
            const r = ((ph + ring * 0.33) % 1) * 90;
            ctx.beginPath();
            ctx.arc(np[0], np[1], r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(143,214,148,${(1 - r / 90) * 0.9})`;
            ctx.lineWidth = 2.4 - (r / 90) * 1.2;
            ctx.stroke();
          }
        } else {
          const blob = (ph * 4) % 1;
          if (blob > 0.25) {
            const r = (ph % 1) * 85;
            ctx.beginPath();
            ctx.arc(np[0], np[1], r, blob * 6, Math.PI * 2 - blob * 6);
            ctx.strokeStyle = `rgba(228,89,60,${(1 - r / 85) * 0.85})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      phaseRef.current = (phaseRef.current + 0.02) % 1;
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [node, healthy, scanActive]);

  return (
    <canvas
      ref={ref}
      className="block w-full h-auto"
      style={{ width: "100%", maxWidth: W, margin: "0 auto" }}
      aria-label="Animated strain-wave propagation from active PZT sensor"
    />
  );
}
