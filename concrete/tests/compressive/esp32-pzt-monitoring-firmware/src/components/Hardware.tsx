import { Reveal } from "../ui";

/* ── divider schematic ─────────────────────────────────────────── */
function Schematic() {
  return (
    <svg viewBox="0 0 660 400" className="w-full h-auto" role="img" aria-label="Voltage divider sensing schematic">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#8fa093" />
        </marker>
      </defs>

      {/* concrete specimen region */}
      <rect x="252" y="232" width="316" height="118" fill="none" stroke="#5f7063" strokeDasharray="6 5" />
      <text x="262" y="224" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#8fa093" letterSpacing="2">
        CONCRETE SPECIMEN — C40/50
      </text>
      <g stroke="#3a4a3f" fill="none">
        <circle cx="285" cy="322" r="5" />
        <circle cx="306" cy="300" r="3.4" />
        <circle cx="432" cy="324" r="6" />
        <circle cx="520" cy="300" r="4" />
        <circle cx="500" cy="330" r="3" />
        <circle cx="546" cy="318" r="4.6" />
      </g>

      {/* excitation source */}
      <rect x="28" y="150" width="118" height="76" fill="#151d17" stroke="#33443a" />
      <text x="87" y="173" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#e9e4d4">GPIO25</text>
      <path d="M44,205 h13 v-22 h16 v22 h16 v-22 h16 v22 h13" fill="none" stroke="#de9a3c" strokeWidth="1.8" />
      <text x="87" y="244" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#8fa093">
        LEDC0 · 1k–500k · 50%
      </text>

      {/* wires + series resistor */}
      <line x1="146" y1="188" x2="206" y2="188" stroke="#de9a3c" strokeWidth="2" />
      <path d="M206,188 l6,-11 l12,22 l12,-22 l12,22 l12,-22 l12,22 l6,-11" fill="none" stroke="#de9a3c" strokeWidth="2" />
      <line x1="278" y1="188" x2="340" y2="188" stroke="#de9a3c" strokeWidth="2" />
      <text x="242" y="164" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#e9e4d4">Rs 1k0</text>
      <text x="242" y="218" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5f7063">±0.1% METAL FILM</text>

      {/* animated excitation flow */}
      <path d="M146,188 H206 M278,188 H344" className="flow-dash" stroke="#f2b866" strokeWidth="2" fill="none" opacity="0.85" />

      {/* junction */}
      <circle cx="340" cy="188" r="4.5" fill="#f2b866" />
      <text x="352" y="178" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#f2b866">Vp</text>

      {/* to ADC */}
      <line x1="340" y1="188" x2="470" y2="188" stroke="#7fb8a4" strokeWidth="2" />
      <rect x="470" y="150" width="160" height="76" fill="#151d17" stroke="#33443a" />
      <text x="550" y="175" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#e9e4d4">GPIO36 · ADC1_CH0</text>
      <text x="550" y="195" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#8fa093">12-bit · atten 11 dB</text>
      <text x="550" y="211" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#8fa093">burst ≈83 kS/s</text>

      {/* down to PZT */}
      <line x1="340" y1="192" x2="340" y2="254" stroke="#7fb8a4" strokeWidth="2" />
      <line x1="306" y1="256" x2="374" y2="256" stroke="#8fd694" strokeWidth="3.4" />
      <line x1="306" y1="272" x2="374" y2="272" stroke="#8fd694" strokeWidth="3.4" />
      <line x1="340" y1="272" x2="340" y2="304" stroke="#7fb8a4" strokeWidth="2" />
      <text x="386" y="262" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#b8ecbb">PZT PATCH</text>
      <text x="386" y="277" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5f7063">SMART AGGREGATE · |Z(f)|</text>

      {/* ground */}
      <line x1="340" y1="304" x2="340" y2="330" stroke="#7fb8a4" strokeWidth="2" />
      <line x1="318" y1="330" x2="362" y2="330" stroke="#8fa093" strokeWidth="2.4" />
      <line x1="326" y1="338" x2="354" y2="338" stroke="#8fa093" strokeWidth="2" />
      <line x1="333" y1="346" x2="347" y2="346" stroke="#8fa093" strokeWidth="1.6" />
      <text x="374" y="340" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#5f7063">AGND ★ star point</text>

      {/* caption */}
      <text x="28" y="386" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#5f7063">
        FIG.1 — DIVIDER SENSING · VP BURST-SAMPLED DURING EACH 3 MS DWELL
      </text>
    </svg>
  );
}

/* ── pin map ───────────────────────────────────────────────────── */
const PINS = [
  {
    pin: "GPIO36",
    net: "PZT_SENSE",
    dir: "IN",
    note: "ADC1_CH0 · divider tap Vp · 12-bit, 11 dB attenuation",
    tone: "text-teal",
  },
  {
    pin: "GPIO25",
    net: "EXCITE",
    dir: "OUT",
    note: "LEDC ch.0 · log sweep 1 kHz → 500 kHz · band-adaptive resolution",
    tone: "text-copper",
  },
  {
    pin: "GPIO2",
    net: "LED_LINK",
    dir: "OUT",
    note: "heartbeat — 600 ms ACTIVE · 150 ms while linking",
    tone: "text-signal",
  },
  {
    pin: "GPIO4",
    net: "LED_FAULT",
    dir: "OUT",
    note: "CRUSH latch indicator — solid on until serial reset",
    tone: "text-alarm",
  },
  {
    pin: "GND",
    net: "AGND",
    dir: "—",
    note: "star point: coax shield + Rs return, single physical land",
    tone: "text-mute",
  },
  {
    pin: "3V3",
    net: "VREF",
    dir: "—",
    note: "excitation rail reference · per-chip eFuse Vref calibration advised",
    tone: "text-mute",
  },
];

const SCHEMA_ROWS: [string, string, string, string][] = [
  ["session_id", "string", "—", "node identity, derived from ESP32 MAC (PZT-XXXXXX)"],
  ["voltage_peak", "float", "mV", "peak amplitude at divider tap, burst peak-detector"],
  ["resistance", "float", "kΩ", "R = Rs·Vp/(Vexc−Vp) — 10000.0 sentinel ⇒ open circuit"],
  ["frequency", "float", "kHz", "argmax of |G(f)| — series resonance, peak-hold per sweep"],
  ["conductance", "float", "µS", "G = 1/|Z| — admittance magnitude at current dwell set"],
  ["damage_index", "float", "%", "RMSD of |G(f)| vs first-sweep baseline (EMI damage metric)"],
  ["rssi", "int", "dBm", "radio link margin at transmit time"],
  ["uptime_s", "uint32", "s", "millis()/1000 since boot"],
  ["status", "enum", "—", "ACTIVE · CRUSHED (only two values admitted by schema)"],
  ["fault", "string", "—", "present only on latch — \"CONCRETE_CRUSHED\""],
  ["fault_t_ms", "uint32", "ms", "latch timestamp, millis() timebase"],
];

export { SCHEMA_ROWS };

export default function Hardware() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr] items-start">
      <Reveal>
        <div className="panel panel-corner p-4 md:p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper">
              Analog front-end
            </span>
            <span className="ml-auto font-mono text-[10px] text-dim">single-supply · 3V3</span>
          </div>
          <Schematic />
          <div className="mt-3 grid sm:grid-cols-3 gap-2.5 font-mono text-[10.5px]">
            <div className="border border-line px-3 py-2 text-mute">
              <span className="text-copper">SHIELD</span> — twisted pair to patch,
              braid tied at AGND only
            </div>
            <div className="border border-line px-3 py-2 text-mute">
              <span className="text-copper">COUPLE</span> — patch behaves as
              C ≈ 12 nF ‖ R(f); divider linearises |Z|
            </div>
            <div className="border border-line px-3 py-2 text-mute">
              <span className="text-copper">ISOLATE</span> — LEDC drive through
              100 Ω gate stopper; keep clear of sense trace
            </div>
          </div>
        </div>
      </Reveal>

      <div className="space-y-5">
        <Reveal delay={80}>
          <div className="panel overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line font-mono text-[11px] tracking-[0.2em] uppercase text-copper">
              Pin assignment — ESP32-WROOM-32
            </div>
            <table className="w-full text-left">
              <tbody>
                {PINS.map((p) => (
                  <tr
                    key={p.pin}
                    className="group border-b border-line/60 last:border-0 hover:bg-raise/60 transition-colors duration-150"
                  >
                    <td className="px-4 py-2.5 font-mono text-[12px] text-paper whitespace-nowrap">
                      <span className={`inline-block w-1.5 h-1.5 mr-2 align-middle ${p.tone.replace("text-", "bg-")}`} />
                      {p.pin}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-[10.5px] text-copper whitespace-nowrap">{p.net}</td>
                    <td className="px-2 py-2.5 font-mono text-[10.5px] text-dim">{p.dir}</td>
                    <td className="px-4 py-2.5 font-body text-[11.5px] text-mute leading-snug">{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="panel px-4 py-4">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper mb-3">
              Divider inversion — the EMI math
            </div>
            <div className="space-y-2 font-mono text-[12.5px]">
              <div className="flex flex-wrap gap-x-3 items-baseline border border-line px-3 py-2 bg-scope/60">
                <span className="text-mute">|Z(f)|</span>
                <span className="text-dim">=</span>
                <span className="text-paper">Rs · Vp / (V<sub>exc</sub> − Vp)</span>
              </div>
              <div className="flex flex-wrap gap-x-3 items-baseline border border-line px-3 py-2 bg-scope/60">
                <span className="text-mute">G</span>
                <span className="text-dim">=</span>
                <span className="text-paper">10⁶ / |Z|</span>
                <span className="text-dim">[µS]</span>
                <span className="ml-auto text-teal">R = |Z| / 1000 [kΩ]</span>
              </div>
              <div className="flex flex-wrap gap-x-3 items-baseline border border-line px-3 py-2 bg-scope/60">
                <span className="text-mute">F</span>
                <span className="text-dim">=</span>
                <span className="text-paper">argmax G(f)</span>
                <span className="text-dim">over 96 log-spaced dwells</span>
              </div>
            </div>
            <div className="mt-3 font-body text-[12px] text-mute leading-relaxed">
              Worked example — Vp = 661 mV against the 3.3 V swing:
              |Z| = 1000 · 0.661 / 2.639 = <span className="text-paper font-mono">250 Ω</span>,
              so G = <span className="text-paper font-mono">4000 µS</span>. If the patch debonds
              (crush event) the tap floats to the rail, V<sub>exc</sub> − Vp → 0 and the driver
              reports the <span className="text-alarm font-mono">10000 kΩ</span> open-circuit sentinel.
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
