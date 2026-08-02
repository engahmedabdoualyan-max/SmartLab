import type { SimStatus } from "../sim";
import { FW_STATS } from "../firmware";
import { Reveal } from "../ui";
import { cn } from "../utils/cn";

/* ── cooperative timing gantt ──────────────────────────────────── */
function Gantt() {
  const X0 = 150;
  const W = 830;
  const pxPerS = W / 6; // 6-second window
  const x = (t: number) => X0 + t * pxPerS;

  const lanes = [
    { name: "ADC BURST", y: 26, color: "#8fd694" },
    { name: "SWEEP DWELL", y: 76, color: "#de9a3c" },
    { name: "HTTPS POST", y: 126, color: "#7fb8a4" },
    { name: "WIFI WATCHDOG", y: 176, color: "#b8ecbb" },
    { name: "LED HEARTBEAT", y: 214, color: "#5f7063" },
  ];

  const adcTicks = Array.from({ length: 46 }, (_, i) => X0 + 4 + i * 18);
  const dwellTicks = Array.from({ length: 70 }, (_, i) => X0 + 2 + i * 12);
  const posts = [1, 2, 3, 4, 5];
  const leds = Array.from({ length: 10 }, (_, i) => 0.3 + i * 0.6);

  return (
    <svg viewBox="0 0 1000 258" className="w-full h-auto" role="img" aria-label="Task timing diagram">
      {/* lane guides */}
      {lanes.map((l) => (
        <g key={l.name}>
          <text x="6" y={l.y + 12} fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="#8fa093" letterSpacing="1">
            {l.name}
          </text>
          <line x1={X0} y1={l.y + 8} x2={X0 + W} y2={l.y + 8} stroke="#263329" strokeDasharray="2 4" />
        </g>
      ))}

      {/* ADC burst comb */}
      {adcTicks.map((tx, i) => (
        <rect key={i} x={tx} y={lanes[0].y} width={11} height={16} fill="rgba(143,214,148,0.55)" />
      ))}
      <text x={X0 + W + 6} y={lanes[0].y + 12} fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5f7063">200×12µs / dwell</text>

      {/* dwell band */}
      <rect x={X0} y={lanes[1].y} width={W} height={16} fill="rgba(222,154,60,0.22)" stroke="rgba(222,154,60,0.6)" />
      {dwellTicks.map((tx, i) => (
        <line key={i} x1={tx} y1={lanes[1].y} x2={tx} y2={lanes[1].y + 16} stroke="rgba(222,154,60,0.5)" />
      ))}
      <text x={X0 + W + 6} y={lanes[1].y + 12} fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5f7063">3 ms steps</text>

      {/* POST blocks */}
      {posts.map((t, i) => (
        <g key={t}>
          <rect x={x(t) - 7} y={lanes[2].y} width={15} height={16} fill={i === 2 ? "rgba(228,89,60,0.7)" : "rgba(127,184,164,0.75)"} />
          <text x={x(t) + 1} y={lanes[2].y - 4} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill={i === 2 ? "#e4593c" : "#7fb8a4"}>
            {i === 2 ? "retry" : "201"}
          </text>
        </g>
      ))}
      <text x={X0 + W + 6} y={lanes[2].y + 12} fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5f7063">1000 ms cadence</text>

      {/* wifi watchdog */}
      <rect x={x(5) - 5} y={lanes[3].y} width={11} height={16} fill="rgba(184,236,187,0.6)" />
      <text x={X0 + W + 6} y={lanes[3].y + 12} fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5f7063">every 5 s</text>

      {/* led ticks */}
      {leds.map((t, i) => (
        <rect key={i} x={x(t)} y={lanes[4].y} width={5} height={14} fill="rgba(95,112,99,0.8)" />
      ))}

      {/* time axis */}
      {[0, 1, 2, 3, 4, 5, 6].map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={238} x2={x(t)} y2={244} stroke="#5f7063" />
          <text x={x(t)} y={254} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#8fa093">
            {t}s
          </text>
        </g>
      ))}
      <line x1={X0} y1={241} x2={X0 + W} y2={241} stroke="#33443a" />

      {/* moving cursor */}
      <g className="gantt-cursor">
        <rect x={X0} y={18} width={2} height={222} fill="#f2b866" opacity="0.85" />
        <path d={`M${X0 - 5},14 L${X0 + 7},14 L${X0 + 1},22 Z`} fill="#f2b866" />
      </g>
    </svg>
  );
}

/* ── state machine ─────────────────────────────────────────────── */
function StateMachine({ status, crushed }: { status: SimStatus; crushed: boolean }) {
  const node = (
    id: string,
    x: number,
    label: string,
    sub: string,
    active: boolean,
    alarm?: boolean
  ) => (
    <g key={id} className="transition-all duration-300">
      <rect
        x={x}
        y={86}
        width={168}
        height={62}
        fill={active ? (alarm ? "rgba(228,89,60,0.18)" : "rgba(222,154,60,0.16)") : "#111713"}
        stroke={active ? (alarm ? "#e4593c" : "#de9a3c") : "#33443a"}
        strokeWidth={active ? 2 : 1.2}
      />
      <text x={x + 84} y={112} textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontWeight="600" fontSize="14.5" fill={active ? (alarm ? "#ff7a5c" : "#f2b866") : "#8fa093"} letterSpacing="1">
        {label}
      </text>
      <text x={x + 84} y={132} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5f7063">
        {sub}
      </text>
    </g>
  );

  const arrow = (x1: number, y1: number, x2: number, y2: number, dash?: boolean, color = "#8fa093") => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.4" strokeDasharray={dash ? "5 4" : undefined} markerEnd="url(#fsm-arr)" />
  );

  return (
    <svg viewBox="0 0 920 250" className="w-full h-auto" role="img" aria-label="Node state machine">
      <defs>
        <marker id="fsm-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#8fa093" />
        </marker>
        <marker id="fsm-arr-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#e4593c" />
        </marker>
      </defs>

      {node("boot", 14, "BOOT", "pins · sweep table · session id", status === "BOOT")}
      {node("wifi", 240, "WIFI_CONNECT", "WiFi.begin() · STA events", status === "WIFI")}
      {node("active", 466, "ACTIVE", "sweep 96×3ms · POST 1Hz", status === "ACTIVE" && !crushed)}
      {node("crush", 724, "CRUSHED", "latch · excite off · fault LED", crushed, true)}

      {arrow(182, 117, 236, 117)}
      {arrow(408, 117, 462, 117)}
      <line x1={634} y1={105} x2={720} y2={105} stroke="#e4593c" strokeWidth="1.6" markerEnd="url(#fsm-arr-r)" />

      <text x={314} y={104} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fa093">WiFi.begin()</text>
      <text x={539} y={104} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fa093">STA_GOT_IP</text>
      <text x={677} y={94} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#e4593c">spike&gt;950 →</text>
      <text x={677} y={126} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#e4593c">open-line ≤30ms</text>

      {/* reset return */}
      <path d="M808,148 C808,210 640,224 556,170 L552,152" fill="none" stroke="#e4593c" strokeWidth="1.3" strokeDasharray="5 4" markerEnd="url(#fsm-arr-r)" />
      <text x={690} y={226} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#e4593c">serial 'r' — new specimen</text>

      {/* active self-loop */}
      <path d="M508,86 C508,44 592,44 592,84" fill="none" stroke="#de9a3c" strokeWidth="1.3" markerEnd="url(#fsm-arr)" />
      <text x={550} y={42} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#de9a3c">dwell tick · 3 ms</text>

      <text x={14} y={24} fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#5f7063" letterSpacing="1.5">
        FSM — HIGHLIGHTED STATE MIRRORS THE LIVE NODE SIMULATION ABOVE
      </text>
    </svg>
  );
}

/* ── failure signature timeline ────────────────────────────────── */
function FailureTimeline() {
  const X0 = 70;
  const W = 790;
  const Y0 = 26;
  const H = 128;
  const x = (ms: number) => X0 + (ms / 40) * W;
  const y = (c: number) => Y0 + (1 - c / 1300) * H;

  return (
    <svg viewBox="0 0 920 214" className="w-full h-auto" role="img" aria-label="Crush failure signature timeline">
      {/* threshold */}
      <line x1={X0} y1={y(950)} x2={X0 + W} y2={y(950)} stroke="#e4593c" strokeDasharray="6 5" strokeWidth="1.2" />
      <text x={X0 + W + 6} y={y(950) + 3} fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#e4593c">950</text>
      <line x1={X0} y1={y(12)} x2={X0 + W} y2={y(12)} stroke="#33443a" strokeDasharray="2 4" />
      <text x={X0 + W + 6} y={y(12) + 3} fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#5f7063">12</text>

      {/* the signature: healthy → spike → collapse → open line */}
      <polyline
        points={`${x(0)},${y(720)} ${x(4)},${y(740)} ${x(7)},${y(700)} ${x(9)},${y(760)} ${x(10)},${y(1120)} ${x(12)},${y(1180)} ${x(13.4)},${y(40)} ${x(15)},${y(6)} ${x(40)},${y(4)}`}
        fill="none"
        stroke="#de9a3c"
        strokeWidth="2"
      />
      {/* healthy portion green */}
      <polyline points={`${x(0)},${y(720)} ${x(4)},${y(740)} ${x(7)},${y(700)} ${x(9)},${y(760)}`} fill="none" stroke="#8fd694" strokeWidth="2" />

      {/* annotations */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9.5">
        <text x={x(10.8)} y={y(1180) - 10} textAnchor="middle" fill="#ff7a5c">short-circuit spike</text>
        <text x={x(20)} y={y(6) - 12} fill="#e4593c">open circuit — patch debonded</text>

        {/* t0 bracket */}
        <line x1={x(10)} y1={170} x2={x(10)} y2={180} stroke="#8fa093" />
        <text x={x(10)} y={196} textAnchor="middle" fill="#8fa093">t₀ spike ≥ 950</text>

        {/* confirm window */}
        <line x1={x(10)} y1={178} x2={x(19)} y2={178} stroke="#f2b866" strokeWidth="1.2" />
        <line x1={x(19)} y1={170} x2={x(19)} y2={180} stroke="#8fa093" />
        <text x={x(14.5)} y={196} textAnchor="middle" fill="#f2b866">3× open dwells ≤ 30 ms</text>
      </g>

      {/* latch flag */}
      <g>
        <rect x={x(19.6)} y={40} width={196} height={44} fill="rgba(228,89,60,0.14)" stroke="#e4593c" strokeWidth="1.3" />
        <text x={x(19.6) + 98} y={58} textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontWeight="700" fontSize="12.5" fill="#ff7a5c" letterSpacing="1">
          LATCH — CONCRETE_CRUSHED
        </text>
        <text x={x(19.6) + 98} y={74} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#8fa093">
          excite off · fault LED · packet queued NOW
        </text>
        <line x1={x(19)} y1={84} x2={x(19.6)} y2={84} stroke="#e4593c" />
      </g>

      <text x={X0} y={210} fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#5f7063" letterSpacing="1">
        FAILURE SIGNATURE — ADC COUNTS VS TIME (MS)
      </text>
    </svg>
  );
}

/* ── section body ──────────────────────────────────────────────── */
export default function Arch({ status, crushed }: { status: SimStatus; crushed: boolean }) {
  return (
    <div className="space-y-5">
      <Reveal>
        <div className="panel panel-corner p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper">
              Cooperative scheduler — one loop(), five timestamp tasks
            </span>
            <span className="ml-auto font-mono text-[10px] text-dim">6 s window · every block fires by deadline, never by wait</span>
          </div>
          <Gantt />
        </div>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal delay={60}>
          <div className={cn("panel p-4 md:p-5 h-full", crushed && "border-alarm/60")}>
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper mb-2">
              Node state machine
            </div>
            <StateMachine status={status} crushed={crushed} />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="panel p-4 md:p-5 h-full">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper mb-2">
              Ultimate-strength detector — peak-hold latch
            </div>
            <FailureTimeline />
          </div>
        </Reveal>
      </div>

      <Reveal delay={80}>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="panel panel-hover px-4 py-4">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">blocking audit</div>
            <div className="mt-2 font-display font-bold text-3xl text-signal">
              {FW_STATS.delayCalls + FW_STATS.delayMicroCalls}
              <span className="text-base text-mute font-body font-normal ml-2">blocking calls</span>
            </div>
            <p className="mt-1.5 text-[12px] text-mute leading-relaxed">
              Every deadline is a millis()/micros() compare — the ADC burst never starves the radio, the radio never stalls the sweep.
            </p>
          </div>
          <div className="panel panel-hover px-4 py-4">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">fault → packet latency</div>
            <div className="mt-2 font-display font-bold text-3xl text-copper">
              &lt;1
              <span className="text-base text-mute font-body font-normal ml-2">loop pass</span>
            </div>
            <p className="mt-1.5 text-[12px] text-mute leading-relaxed">
              latchCrush() zeroes the telemetry deadline, so the CONCRETE_CRUSHED frame leaves on the very next scheduler visit.
            </p>
          </div>
          <div className="panel panel-hover px-4 py-4">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">link-loss tolerance</div>
            <div className="mt-2 font-display font-bold text-3xl text-teal">
              4
              <span className="text-base text-mute font-body font-normal ml-2">frames spooled</span>
            </div>
            <p className="mt-1.5 text-[12px] text-mute leading-relaxed">
              Failed bodies are ring-buffered and drained oldest-first on reconnect — a crush event is never lost to a dead link.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
