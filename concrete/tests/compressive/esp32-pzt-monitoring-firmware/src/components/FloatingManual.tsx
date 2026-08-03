/* ================================================================ *
 *  FloatingManual.tsx — smartLAB Global Technical Manual · v1.9.0
 *
 *  FAB button (bottom-right, z-9999, pulse) opens a fullscreen modal
 *  with 6-chapter enterprise manual. Interactive TOC sidebar with
 *  smooth-scroll anchoring. All text is static English — no i18n
 *  needed because this is the engineering reference document.
 * ================================================================ */

import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";

const CHAPTERS = [
  {
    id: "ch01", no: "01",
    title: "System Architecture Overview",
    body: `smartLAB employs a triple-tier security model separating concerns across three credential scopes:

• **All-Access Token** — restricted to the developer's local machine for schema creation and bucket administration. Never deployed to any device or browser.

• **Write-Only Token (esp32-write)** — compiled into the ESP32 firmware binary (\`src/firmware.ts §14\`). Scoped exclusively to the \`pzt_sensor_data\` bucket with write permission. Even if extracted from flash, the worst outcome is junk rows — never data deletion or read access.

• **Read-Only Token (dashboard-read)** — stored as a Vercel environment variable (\`INFLUX_TOKEN\`), consumed only by the serverless proxy at \`/api/influx-query.ts\`. The browser bundle (\`dist/index.html\`) contains **zero credentials** — it speaks only JSON to the proxy.

The proxy itself enforces CORS origin checks, session-ID whitelisting (regex \`/^[A-Za-z0-9_\\-:.]{1,64}$/\`), a 5 000-row payload ceiling, and BigInt-safe JSON serialization. InfluxDB 3 Cloud Serverless answers SQL over Arrow Flight / gRPC — a transport browsers cannot open — so the proxy is not an optional security wrapper but a **mandatory transport bridge**.

[[DIAGRAM:CLOUD]]`,
  },
  {
    id: "ch02", no: "02",
    title: "Electromechanical Impedance (EMI) Theory",
    body: `The AD5933 impedance engine generates a sinusoidal excitation through GPIO25 (LEDC PWM, band-adaptive resolution 7–13 bit) and measures the complex admittance of the PZT patch coupled to the concrete host.

**Frequency sweep**: 96 logarithmically-spaced dwell points from 1 kHz to 500 kHz. Each dwell lasts 3 ms with a 200-sample ADC burst at 12 µs intervals (≈83 kS/s). The burst peak detector extracts Vpp → voltage-divider inversion yields |Z(f)| → conductance G = 1/|Z| in µS.

**Resonance tracking**: The admittance peak (argmax of G over the sweep table) gives the series resonant frequency F. As cement hydrates, the matrix stiffens, shifting F leftward and increasing peak amplitude — this shift is the physical observable that the maturity law maps to compressive strength.

**RMSD damage index**: Root-mean-square deviation of the live conductance envelope against the Day-1 sealed baseline:

    RMSD % = √(Σ(Gᵢ − G⁰ᵢ)² / Σ(G⁰ᵢ)²) × 100

Values below 2% = pristine; 2–6% = micro-cracking onset; >6% = structural failure progression. The baseline is linearly interpolated onto the live frequency grid before differencing to prevent bin-mismatch artifacts.

[[DIAGRAM:EMI]]`,
  },
  {
    id: "ch03", no: "03",
    title: "Concrete Maturity Laws — Plowman & ASTM C1074",
    body: `**Plowman's logarithmic law** (default):

    fc(t) = A · ln(t) + B

where t is specimen age in days, A and B are mix-specific coefficients learned from real cube-crush data via exact ordinary-least-squares on ln(t). The Calibration Wizard performs this fit client-side:

    x̄ = mean(ln tᵢ)    ȳ = mean(MPaᵢ)
    A = Σ((xᵢ−x̄)(yᵢ−ȳ)) / Σ(xᵢ−x̄)²    B = ȳ − A·x̄

RMSE is computed and displayed so a noisy laboratory day is immediately obvious. Minimum 2 data points; below that the system falls back to factory defaults A=8.4, B=12.1 (E-REG-001).

**ASTM C1074 standard** (toggle in v1.9.0):

The Nurse-Saul temperature-time factor:

    M(t) = Σ(Tₐ − T₀) · Δt

and the Arrhenius equivalent age:

    tₑ = Σ exp(−Q · (1/Tₐ − 1/Tₛ)) · Δt

Both are computed from the core temperature history tracked by the ESP32's ASTM C1074 gauge (see §14 coreTempC). The CalibrationWizard lets the engineer toggle between Plowman and ASTM modes; the predictive curve output tracks the chosen Maturity Index against concrete crushing datasets.`,
  },
  {
    id: "ch04", no: "04",
    title: "Hardware Multiplexing Protocol — 74HC4052",
    body: `One AD5933 impedance engine serves four PZT nodes through a 74HC4052 dual analog switch:

    MUX_S0 → GPIO14    MUX_S1 → GPIO12
    Rail 0 = 00 → pzt_node_01    Rail 1 = 01 → pzt_node_02
    Rail 2 = 10 → pzt_node_03    Rail 3 = 11 → pzt_node_04

**Settling interval**: 8 ms after each rail switch. This is not arbitrary — the PZT patch behaves as a ~12 nF capacitor in parallel with a frequency-dependent resistance. The 4052 ON-resistance (~50 Ω) forms an RC time constant of ~0.6 µs, but the AD5933's internal DDS settling amplifier requires 5–10 ms to re-stabilize after the load impedance changes. The 8 ms guard covers worst-case Q-factor ringing plus a 2 ms margin.

**Rotation cadence**: \`muxAdvance()\` is called from \`finishDwell()\` after each completed 96-bin sweep frame. So the physical cadence is:
  sweep node_01 (96 bins × 3 ms = 288 ms) → switch → settle 8 ms → sweep node_02 → …

Each frame's line protocol carries \`sensor_id=pzt_node_0N\` as a tag, letting InfluxDB SQL filter by node without duplicating buckets.

**Digital Twin mapping**: The SVG isometric twin places 4 dots at normalized coordinates on the top face of the concrete block. When a node's RMSD crosses the anomaly threshold (default 5%), its dot flashes with a CSS \`reqBlink\` animation — visible within seconds on the dashboard.

[[DIAGRAM:MUX]]`,
  },
  {
    id: "ch05", no: "05",
    title: "Cryptographic Integrity Validation — SHA-256",
    body: `Every Strength Clearance Certificate carries a SHA-256 verification serial computed from the certification payload:

    serial = SHA-256(certNo : sessionId : castDate : currentMPa : targetMpa : A : B)

The hash is generated client-side using the Web Crypto API (\`crypto.subtle.digest\`) and printed as a 64-character uppercase hex string at the foot of the PDF.

**Forensic guarantee**: To forge a certificate, an attacker would need to produce a second-preimage of the SHA-256 hash — computationally infeasible. The serial is not a digital signature (there is no private key on a static HTML page), but it **binds** the cert content to a unique fingerprint: any alteration to any field (MPa, date, coefficients) changes the serial, making tampering detectable by re-hashing the document fields.

**Verification procedure**: The footer states "Verify at [host] — enter cert no. [CERT-…] to confirm maturity record & sensor evidence." In a full deployment the proxy would expose a /api/verify-cert route that re-computes the hash from the stored InfluxDB record and compares it to the printed serial.`,
  },
  {
    id: "ch06", no: "06",
    title: "Field Operation SOP & Error Log Reference",
    body: `**Boot sequence**:
1. SPIFFS.begin(true) — mount fail-safe flash storage
2. analogReadResolution(12), ADC1_CH0 11 dB attenuation
3. muxBegin() — arm 74HC4052 rails (GPIO14/12)
4. WiFi.begin() → influxBeginTimeSync() → loadCastEpochAndBaseline()
5. First sweep dwell fires

**NTP lock gate**: Writes are refused until \`time(nullptr) > 1700000000\` (Nov 2023 sanity). An ESP32 boots at epoch 0 — writing before NTP sync deposits every point in 1970, silently corrupting all time-range queries.

**Console commands (921600 baud)**:
• \`b\` — stamp Air_Baseline_Signature into NVS (96 floats binary). Do this in open air BEFORE pouring.
• \`c\` — stamp cast epoch into NVS. Do this immediately after pouring. Survives reboots.
• \`r\` — clear CONCRETE_CRUSHED latch, re-arm the peak-hold detector for a new specimen.
• \`i\` — print session identity, NVS state (cast epoch, air_cal YES/NO), and SPIFFS offline backlog count.

**Error registers**:
• E-REG-001 — <2 valid calibration points; regression falls back to factory A=8.4, B=12.1
• E-REG-002 — negative or zero slope in OLS fit; target strength unreachable
• E-REG-003 — specimen age clamped to 0.05 d to keep ln(t) finite
• E-CERT-001 — current strength below target; certificate generation route withheld
• E-HARDWARE-004 — sensor channel returns zero/NaN conductance; system bypasses interpolation array, flags "Sensor Disconnected", and falls back to uncalibrated global baseline

**Offline fail-safe**: If WiFi is down during \`influxWriteSweep()\`, the full 96-bin line-protocol body is written to SPIFFS at \`/offline/sw_<sweepId>.lp\`. Sweep ID is persisted in NVS across reboots to prevent filename collisions. On network recovery, \`syncOfflineData()\` iterates the SPIFFS root, filters by prefix, bulk-uploads in chronological order, and deletes each file on HTTP 204 success. A hard cap of 96 offline files (~1.7 MB) prevents flash exhaustion.`,
  },
];

/* ── Offline-safe architectural figures (raw inline SVG) ─────────
 *  No external URLs, fonts, images, or fetches. The <figure> wrapper
 *  implements the same responsive contract as the requested image:
 *  max-width:100%; height:auto; border-radius:8px; margin:16px 0. */
function FigureShell({ title, caption, children }: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure
      className="border border-line bg-scope/70 overflow-hidden"
      style={{ maxWidth: "100%", height: "auto", borderRadius: 8, margin: "16px 0" }}
    >
      <div className="flex items-center gap-2 border-b border-line bg-raise/30 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-copper shadow-[0_0_7px_var(--color-copper)]" />
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-copper">
          {title}
        </span>
        <span className="ms-auto font-mono text-[8px] uppercase text-dim">inline svg · offline</span>
      </div>
      <div className="p-2 sm:p-3">{children}</div>
      <figcaption className="border-t border-line px-3 py-2 font-body text-[10.5px] leading-relaxed text-dim">
        {caption}
      </figcaption>
    </figure>
  );
}

function ArrowDefs() {
  return (
    <defs>
      <marker id="arrCopper" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0 0 8 4 0 8z" fill="#de9a3c" />
      </marker>
      <marker id="arrTeal" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0 0 8 4 0 8z" fill="#7fb8a4" />
      </marker>
      <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <pattern id="concreteSpeckle" width="28" height="24" patternUnits="userSpaceOnUse">
        <circle cx="6" cy="6" r="1.3" fill="#5f7063" opacity=".45" />
        <circle cx="20" cy="16" r="2" fill="#33443a" opacity=".55" />
        <circle cx="11" cy="21" r=".8" fill="#8fa093" opacity=".35" />
      </pattern>
    </defs>
  );
}

/* Chapter 01: ESP32 -> TLS -> Vercel -> Arrow Flight -> InfluxDB */
function CloudArchitectureDiagram() {
  return (
    <FigureShell
      title="Figure 01 · Triple-Tier Cloud Data Flow"
      caption="The write-only device token and read-only server token never cross security tiers. The public browser receives query results only."
    >
      <svg viewBox="0 0 960 330" className="block h-auto w-full" role="img"
        aria-label="Triple-tier smartLAB cloud architecture from ESP32 through Vercel proxy to InfluxDB 3">
        <ArrowDefs />
        <rect width="960" height="330" rx="7" fill="#0c120e" />
        {/* zones */}
        <rect x="18" y="28" width="240" height="258" rx="8" fill="#151d17" stroke="#33443a" />
        <rect x="278" y="28" width="390" height="258" rx="8" fill="#101612" stroke="#33443a" />
        <rect x="688" y="28" width="254" height="258" rx="8" fill="#151d17" stroke="#33443a" />
        <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#8fa093">
          <text x="34" y="51">TIER 1 · FIELD HARDWARE</text>
          <text x="294" y="51">TIER 2 · SECURITY BOUNDARY</text>
          <text x="704" y="51">TIER 3 · TIME SERIES</text>
        </g>

        {/* ESP32 */}
        <rect x="45" y="78" width="180" height="100" rx="6" fill="#1a241d" stroke="#de9a3c" strokeWidth="1.5" />
        <rect x="75" y="98" width="120" height="54" rx="3" fill="#263329" stroke="#8a6127" />
        <g fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          <text x="135" y="119" fontSize="14" fontWeight="700" fill="#e9e4d4">ESP32-WROOM-32</text>
          <text x="135" y="138" fontSize="10" fill="#de9a3c">96-bin batching loop</text>
          <text x="135" y="168" fontSize="9" fill="#8fa093">~14-20 KB · one TLS handshake</text>
        </g>
        {/* token chip */}
        <rect x="59" y="200" width="152" height="34" rx="4" fill="#3f7a4e" fillOpacity=".15" stroke="#3f7a4e" />
        <text x="135" y="214" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fd694">TOKEN: esp32-write</text>
        <text x="135" y="227" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#5f7063">bucket-scoped · cannot read/delete</text>

        {/* HTTPS line */}
        <path d="M225 128 C270 128 276 108 320 108" stroke="#de9a3c" strokeWidth="2" fill="none" markerEnd="url(#arrCopper)" strokeDasharray="7 5" />
        <text x="271" y="92" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#de9a3c">HTTPS / TLS 1.2+</text>

        {/* Vercel */}
        <rect x="323" y="76" width="290" height="105" rx="6" fill="#151d17" stroke="#7fb8a4" strokeWidth="1.5" />
        <g fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          <text x="468" y="101" fontSize="14" fontWeight="700" fill="#e9e4d4">VERCEL SERVERLESS PROXY</text>
          <text x="468" y="120" fontSize="10" fill="#7fb8a4">api/influx-query.ts</text>
          <text x="468" y="142" fontSize="9" fill="#8fa093">CORS · session whitelist · row ceiling</text>
          <text x="468" y="158" fontSize="9" fill="#8fa093">Arrow rows → JSON · BigInt safe</text>
        </g>
        <rect x="350" y="205" width="236" height="34" rx="4" fill="#3f7a4e" fillOpacity=".15" stroke="#3f7a4e" />
        <text x="468" y="219" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fd694">TOKEN: dashboard-read</text>
        <text x="468" y="232" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#5f7063">server env only · never serialized</text>

        {/* Flight line */}
        <path d="M613 112 C655 112 668 106 719 106" stroke="#7fb8a4" strokeWidth="2" fill="none" markerEnd="url(#arrTeal)" />
        <text x="665" y="91" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7fb8a4">SQL / Arrow Flight</text>

        {/* DB */}
        <g transform="translate(731 72)">
          <ellipse cx="94" cy="19" rx="83" ry="17" fill="#1a241d" stroke="#8fd694" strokeWidth="1.5" />
          <path d="M11 19v76c0 10 37 18 83 18s83-8 83-18V19" fill="#151d17" stroke="#8fd694" strokeWidth="1.5" />
          <path d="M11 53c0 10 37 18 83 18s83-8 83-18M11 81c0 10 37 18 83 18s83-8 83-18" fill="none" stroke="#3f7a4e" />
          <text x="94" y="51" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill="#e9e4d4">INFLUXDB 3</text>
          <text x="94" y="66" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fd694">Cloud Serverless · SQL</text>
          <text x="94" y="91" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#8fa093">pzt_sensor_data</text>
        </g>

        {/* browser path */}
        <rect x="325" y="254" width="288" height="25" rx="4" fill="#263329" stroke="#33443a" />
        <text x="469" y="270" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fa093">PUBLIC DASHBOARD: JSON ROWS ONLY · ZERO TOKENS</text>

        {/* all-access isolated */}
        <rect x="704" y="219" width="218" height="54" rx="5" fill="#e4593c" fillOpacity=".07" stroke="#e4593c" strokeDasharray="4 4" />
        <text x="813" y="239" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#ff7a5c">ALL-ACCESS TOKEN</text>
        <text x="813" y="255" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#8fa093">local admin workstation only</text>
        <text x="813" y="267" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#e4593c">NEVER DEPLOY</text>
      </svg>
    </FigureShell>
  );
}

/* Chapter 02: embedded PZT cross-section and coupled EMI response */
function EmiCrossSectionDiagram() {
  return (
    <FigureShell
      title="Figure 02 · Embedded PZT / Concrete EMI Coupling"
      caption="Converse effect actuates the patch during the sweep; direct effect returns an electrical signature whose resonance changes with concrete stiffness and cracking."
    >
      <svg viewBox="0 0 960 400" className="block h-auto w-full" role="img"
        aria-label="Cross section of PZT patch embedded in concrete showing direct and converse piezoelectric effects">
        <ArrowDefs />
        <rect width="960" height="400" rx="7" fill="#0c120e" />

        {/* concrete specimen cross-section */}
        <rect x="245" y="45" width="470" height="300" rx="10" fill="#20261f" stroke="#5f7063" strokeWidth="2" />
        <rect x="245" y="45" width="470" height="300" rx="10" fill="url(#concreteSpeckle)" />
        <text x="480" y="72" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#8fa093">CONCRETE HOST MATRIX · CROSS SECTION</text>

        {/* aggregate shapes */}
        <g fill="#30382f" stroke="#5f7063">
          <ellipse cx="318" cy="122" rx="34" ry="20" />
          <ellipse cx="620" cy="105" rx="31" ry="24" />
          <ellipse cx="315" cy="285" rx="42" ry="25" />
          <ellipse cx="630" cy="290" rx="35" ry="19" />
          <ellipse cx="558" cy="160" rx="20" ry="14" />
        </g>

        {/* smart aggregate / shell */}
        <rect x="382" y="151" width="196" height="112" rx="12" fill="#151d17" stroke="#de9a3c" strokeWidth="2" />
        <text x="480" y="175" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#de9a3c">SMART AGGREGATE SHELL</text>
        <rect x="425" y="193" width="110" height="28" rx="3" fill="#3f7a4e" stroke="#8fd694" strokeWidth="2" filter="url(#softGlow)" />
        <text x="480" y="211" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#e9e4d4">PZT PATCH</text>
        <line x1="425" y1="200" x2="382" y2="190" stroke="#7fb8a4" strokeWidth="2" />
        <line x1="535" y1="200" x2="578" y2="190" stroke="#7fb8a4" strokeWidth="2" />

        {/* actuator (converse) side */}
        <rect x="22" y="72" width="178" height="108" rx="7" fill="#151d17" stroke="#de9a3c" />
        <text x="111" y="96" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#de9a3c">CONVERSE EFFECT</text>
        <text x="111" y="116" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#e9e4d4">Electrical excitation</text>
        <text x="111" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fa093">AD5933 DDS sweep</text>
        <text x="111" y="148" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fa093">100-400 kHz</text>
        <path d="M46 164h12v-18h20v18h20v-18h20v18h20v-18h20v18h17" fill="none" stroke="#f2b866" strokeWidth="2" />
        <path d="M200 126 C250 126 313 176 383 200" fill="none" stroke="#de9a3c" strokeWidth="2.5" markerEnd="url(#arrCopper)" />

        {/* strain waves */}
        <g fill="none" stroke="#8fd694" opacity=".72">
          <ellipse cx="480" cy="207" rx="85" ry="46" strokeWidth="1.5" />
          <ellipse cx="480" cy="207" rx="130" ry="78" strokeWidth="1.2" strokeDasharray="7 5" />
          <ellipse cx="480" cy="207" rx="180" ry="112" strokeWidth="1" strokeDasharray="4 7" />
        </g>
        <text x="480" y="327" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fd694">MECHANICAL STRAIN FIELD COUPLED INTO HOST</text>

        {/* direct response side */}
        <rect x="760" y="72" width="178" height="108" rx="7" fill="#151d17" stroke="#7fb8a4" />
        <text x="849" y="96" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7fb8a4">DIRECT EFFECT</text>
        <text x="849" y="116" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#e9e4d4">Mechanical response</text>
        <text x="849" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fa093">→ charge / voltage</text>
        <text x="849" y="151" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fd694">Y(f) = G(f) + jB(f)</text>
        <path d="M578 200 C655 184 706 126 760 126" fill="none" stroke="#7fb8a4" strokeWidth="2.5" markerEnd="url(#arrTeal)" />

        {/* crack and stiffness panel */}
        <path d="M553 76 l-13 30 18 17-24 27 14 21" fill="none" stroke="#e4593c" strokeWidth="3" />
        <text x="604" y="193" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#ff7a5c">MICRO-CRACK</text>
        <line x1="590" y1="187" x2="554" y2="148" stroke="#e4593c" markerEnd="url(#arrCopper)" />

        {/* spectrum comparison */}
        <rect x="740" y="222" width="198" height="142" rx="6" fill="#080c0a" stroke="#33443a" />
        <line x1="760" y1="338" x2="919" y2="338" stroke="#5f7063" />
        <line x1="760" y1="338" x2="760" y2="240" stroke="#5f7063" />
        <path d="M760 326 C790 326 805 319 820 275 S850 325 870 326 S884 291 898 283 S911 322 919 326" fill="none" stroke="#8fd694" strokeWidth="2" />
        <path d="M760 331 C782 330 795 328 812 304 S838 328 860 329 S874 312 888 306 S905 327 919 330" fill="none" stroke="#e4593c" strokeWidth="2" strokeDasharray="5 3" />
        <text x="771" y="251" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#8fd694">healthy / stiff</text>
        <text x="771" y="265" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ff7a5c">damaged / damped</text>
        <text x="842" y="356" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#8fa093">FREQUENCY</text>
        <text transform="translate(752 293) rotate(-90)" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#8fa093">G (µS)</text>
      </svg>
    </FigureShell>
  );
}

/* Chapter 04: full wiring and analog path */
function MuxWiringDiagram() {
  return (
    <FigureShell
      title="Figure 03 · ESP32 / AD5933 / 74HC4052 Academic Wiring"
      caption="Digital control and I²C are isolated from the analog PZT return path. The Rfb feedback resistor closes the AD5933 transimpedance stage; AGND is a single star point to suppress capacitive crosstalk."
    >
      <svg viewBox="0 0 1040 500" className="block h-auto w-full" role="img"
        aria-label="Circuit schematic connecting ESP32 I2C GPIO21 and GPIO22 to AD5933 and GPIO14 and GPIO12 to 74HC4052 multiplexer with feedback resistor">
        <ArrowDefs />
        <rect width="1040" height="500" rx="7" fill="#0c120e" />

        {/* rails */}
        <line x1="38" y1="432" x2="1000" y2="432" stroke="#7fb8a4" strokeWidth="2" />
        <text x="51" y="454" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7fb8a4">AGND STAR POINT · ANALOG RETURN ONLY</text>
        <line x1="38" y1="38" x2="1000" y2="38" stroke="#de9a3c" strokeWidth="2" />
        <text x="51" y="29" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#de9a3c">3V3 DIGITAL / AVDD DECOUPLED RAIL</text>

        {/* ESP32 */}
        <rect x="38" y="80" width="210" height="286" rx="8" fill="#151d17" stroke="#de9a3c" strokeWidth="1.5" />
        <text x="143" y="108" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="15" fontWeight="700" fill="#e9e4d4">ESP32-WROOM-32</text>
        <g fontFamily="JetBrains Mono, monospace" fontSize="10">
          <circle cx="220" cy="146" r="4" fill="#7fb8a4" /><text x="199" y="150" textAnchor="end" fill="#7fb8a4">GPIO21 SDA</text>
          <circle cx="220" cy="184" r="4" fill="#7fb8a4" /><text x="199" y="188" textAnchor="end" fill="#7fb8a4">GPIO22 SCL</text>
          <circle cx="220" cy="245" r="4" fill="#de9a3c" /><text x="199" y="249" textAnchor="end" fill="#de9a3c">GPIO14 MUX S0</text>
          <circle cx="220" cy="282" r="4" fill="#de9a3c" /><text x="199" y="286" textAnchor="end" fill="#de9a3c">GPIO12 MUX S1</text>
          <circle cx="220" cy="330" r="4" fill="#8fd694" /><text x="199" y="334" textAnchor="end" fill="#8fd694">GPIO25 EXCITE</text>
        </g>
        <line x1="143" y1="80" x2="143" y2="38" stroke="#de9a3c" />
        <line x1="143" y1="366" x2="143" y2="432" stroke="#7fb8a4" />
        <circle cx="143" cy="432" r="4" fill="#7fb8a4" />

        {/* I2C lines */}
        <path d="M224 146 H355" stroke="#7fb8a4" strokeWidth="2" markerEnd="url(#arrTeal)" />
        <path d="M224 184 H355" stroke="#7fb8a4" strokeWidth="2" markerEnd="url(#arrTeal)" />
        <text x="288" y="137" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#7fb8a4">I²C SDA · 4.7k pull-up</text>
        <text x="288" y="176" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#7fb8a4">I²C SCL · 4.7k pull-up</text>

        {/* AD5933 */}
        <rect x="360" y="92" width="260" height="264" rx="8" fill="#151d17" stroke="#8fd694" strokeWidth="1.5" />
        <text x="490" y="120" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="15" fontWeight="700" fill="#e9e4d4">AD5933</text>
        <text x="490" y="138" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fd694">IMPEDANCE CONVERTER · DDS + DFT</text>
        <circle cx="360" cy="146" r="4" fill="#7fb8a4" /><text x="374" y="150" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fa093">SDA</text>
        <circle cx="360" cy="184" r="4" fill="#7fb8a4" /><text x="374" y="188" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fa093">SCL</text>
        {/* DDS out */}
        <circle cx="620" cy="188" r="4" fill="#de9a3c" /><text x="606" y="178" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#de9a3c">VOUT / DDS</text>
        {/* VIN / TIA */}
        <circle cx="620" cy="282" r="4" fill="#8fd694" /><text x="606" y="273" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fd694">VIN / TIA</text>

        {/* Rfb loop */}
        <path d="M620 282 h-38 v38 h-102 v-38 h-28" fill="none" stroke="#de9a3c" strokeWidth="2" />
        <path d="M480 320 l-7 -10 -12 20 -12 -20 -12 20 -12 -20 -7 10" fill="none" stroke="#f2b866" strokeWidth="2" />
        <text x="490" y="342" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#de9a3c">Rfb = 10 kΩ · 0.1% · LOW-TC</text>
        <text x="490" y="354" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#8fa093">calibration / transimpedance feedback</text>
        <line x1="490" y1="356" x2="490" y2="432" stroke="#7fb8a4" />
        <circle cx="490" cy="432" r="4" fill="#7fb8a4" />

        {/* MUX */}
        <rect x="690" y="100" width="220" height="276" rx="8" fill="#151d17" stroke="#de9a3c" strokeWidth="1.5" />
        <text x="800" y="128" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="15" fontWeight="700" fill="#e9e4d4">74HC4052</text>
        <text x="800" y="145" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#de9a3c">DUAL 4:1 ANALOG SWITCH</text>
        <circle cx="690" cy="245" r="4" fill="#de9a3c" /><text x="704" y="249" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fa093">S0 (A)</text>
        <circle cx="690" cy="282" r="4" fill="#de9a3c" /><text x="704" y="286" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8fa093">S1 (B)</text>
        <path d="M224 245 H690" stroke="#de9a3c" strokeWidth="1.8" />
        <path d="M224 282 H690" stroke="#de9a3c" strokeWidth="1.8" />
        {/* analog common */}
        <path d="M624 188 H675 v-12 h15" fill="none" stroke="#de9a3c" strokeWidth="2.4" markerEnd="url(#arrCopper)" />
        <path d="M690 330 h-28 v-48 h-38" fill="none" stroke="#8fd694" strokeWidth="2.4" markerEnd="url(#arrTeal)" />
        <text x="648" y="169" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#de9a3c">DDS excitation</text>
        <text x="650" y="350" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#7fb8a4">PZT return</text>

        {/* PZT rails */}
        {[0,1,2,3].map(i => {
          const yy = 182 + i * 43;
          return (
            <g key={i}>
              <circle cx="910" cy={yy} r="4" fill={i === 2 ? "#e4593c" : "#8fd694"} />
              <line x1="910" y1={yy} x2="968" y2={yy} stroke={i === 2 ? "#e4593c" : "#8fd694"} strokeWidth="1.8" />
              <rect x="968" y={yy - 12} width="50" height="24" rx="3" fill="#1a241d" stroke={i === 2 ? "#e4593c" : "#8fd694"} />
              <text x="993" y={yy + 3} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#e9e4d4">PZT {i+1}</text>
              <line x1="993" y1={yy + 12} x2="993" y2="432" stroke="#7fb8a4" strokeWidth=".8" />
            </g>
          );
        })}
        {/* switch contacts fan */}
        {[0,1,2,3].map(i => <line key={i} x1="880" y1="240" x2="910" y2={182 + i*43} stroke="#5f7063" />)}

        {/* decoupling / crosstalk callout */}
        <rect x="690" y="392" width="300" height="27" rx="4" fill="#e4593c" fillOpacity=".07" stroke="#e4593c" strokeDasharray="4 3" />
        <text x="840" y="409" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#ff7a5c">KEEP ANALOG RETURN SHORT · ONE AGND STAR · 8 ms MUX SETTLE</text>
      </svg>
    </FigureShell>
  );
}

type DiagramId = "CLOUD" | "EMI" | "MUX";

function ManualDiagram({ id }: { id: DiagramId }) {
  if (id === "CLOUD") return <CloudArchitectureDiagram />;
  if (id === "EMI") return <EmiCrossSectionDiagram />;
  return <MuxWiringDiagram />;
}

/* ── inline markdown-lite renderer ──────────────────────────────── */
function renderMd(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    const diagram = line.match(/^\[\[DIAGRAM:(CLOUD|EMI|MUX)\]\]$/);
    if (diagram) {
      return <ManualDiagram key={i} id={diagram[1] as DiagramId} />;
    }
    if (line.startsWith("    ")) {
      return <pre key={i} className="bg-scope/70 code-surface text-[#b7d18a] px-3 py-1 my-1 font-mono text-[11px] leading-relaxed overflow-x-auto">{line.trimStart()}</pre>;
    }
    // bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={j} className="text-paper">{p.slice(2, -2)}</strong>;
      }
      // inline code
      const codeParts = p.split(/(`[^`]+`)/g);
      return codeParts.map((cp, k) => {
        if (cp.startsWith("`") && cp.endsWith("`")) {
          return <code key={k} className="bg-scope/70 code-surface text-copper px-1 py-px font-mono text-[10.5px]">{cp.slice(1, -1)}</code>;
        }
        return <span key={k}>{cp}</span>;
      });
    });
    if (line.startsWith("• ")) {
      return <div key={i} className="flex gap-2 my-0.5"><span className="text-copper shrink-0 mt-0.5">•</span><span>{rendered}</span></div>;
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="my-0.5">{rendered}</p>;
  });
}

/* ── main component ─────────────────────────────────────────────── */
export default function FloatingManual() {
  const [open, setOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState("ch01");
  const contentRef = useRef<HTMLDivElement>(null);

  /* scroll spy */
  useEffect(() => {
    if (!open) return;
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        const ch = el.querySelector(`#${CHAPTERS[i].id}`);
        if (ch && (ch as HTMLElement).offsetTop <= el.scrollTop + 80) {
          setActiveChapter(CHAPTERS[i].id);
          break;
        }
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [open]);

  /* lock body scroll */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  /* Enterprise modal keyboard contract: Escape always closes. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const scrollTo = (id: string) => {
    setActiveChapter(id);
    const el = contentRef.current?.querySelector(`#${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ── FAB ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Technical Manual"
        className={cn(
          "fixed bottom-20 end-5 z-[9999] w-14 h-14 grid place-items-center",
          "border-2 border-copper bg-panel shadow-lg",
          "hover:bg-copper/15 transition-all duration-300",
          "animate-pulse hover:animate-none"
        )}
        style={{ boxShadow: "0 0 22px rgba(222,154,60,0.35)" }}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-copper" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M9 7h6M9 11h4"/>
        </svg>
        <span className="absolute -top-1 -end-1 w-4 h-4 bg-copper text-ink font-mono text-[8px] font-bold grid place-items-center">
          ?
        </span>
      </button>

      {/* ── modal ────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-[10000] flex" role="dialog" aria-modal="true">
          {/* backdrop */}
          <div className="absolute inset-0 bg-ink/85 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* panel */}
          <div
            className="relative flex w-full max-w-[1100px] mx-auto my-4 sm:my-8 panel panel-corner overflow-hidden shadow-2xl"
            style={{ animation: "paletteIn 0.18s cubic-bezier(0.22,1,0.36,1)" }}
          >
            {/* TOC sidebar */}
            <nav className="w-[220px] shrink-0 border-e border-line bg-raise/30 overflow-y-auto hidden md:block p-4 space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-copper mb-4">
                Table of Contents
              </div>
              {CHAPTERS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => scrollTo(ch.id)}
                  className={cn(
                    "w-full text-start px-2.5 py-2 border-s-2 transition-colors duration-200",
                    activeChapter === ch.id
                      ? "border-copper bg-copper/10 text-paper"
                      : "border-transparent text-mute hover:text-paper hover:border-line2"
                  )}
                >
                  <span className="font-mono text-[9px] text-dim">{ch.no}</span>{" "}
                  <span className="font-body text-[12px] leading-snug">{ch.title}</span>
                </button>
              ))}
              <div className="pt-4 border-t border-line mt-4">
                <div className="font-mono text-[8.5px] text-dim">
                  smartLAB PZT-EMI Monitor · v1.9.0
                </div>
                <div className="font-mono text-[8.5px] text-dim mt-0.5">
                  Fimto Soft · Integrated Tech Solutions
                </div>
              </div>
            </nav>

            {/* main content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* header bar */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-line bg-raise/40 shrink-0">
                <svg viewBox="0 0 20 20" className="w-4.5 h-4.5 text-copper shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 3.5A2 2 0 0 1 5 1.5h5.5A2 2 0 0 1 13 3.5v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <path d="M13 5.5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7"/>
                  <path d="M6 6h4M6 9h3"/>
                </svg>
                <div>
                  <div className="font-display font-bold text-[15px] text-paper tracking-wide">
                    Global Technical Documentation
                  </div>
                  <div className="font-mono text-[9px] text-dim uppercase tracking-[0.2em]">
                    smartLAB PZT-EMI Monitor · v1.9.0 · Enterprise Reference
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="ms-auto border border-line2 px-3 py-1.5 font-mono text-[10px] text-mute hover:text-paper transition-colors"
                >
                  close ✕
                </button>
              </div>

              {/* scrollable chapters */}
              <div ref={contentRef} className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-10">
                {CHAPTERS.map(ch => (
                  <article key={ch.id} id={ch.id} className="scroll-mt-8">
                    <div className="flex items-baseline gap-3 mb-4 pb-2 border-b border-line">
                      <span
                        className="font-display text-4xl font-bold text-transparent shrink-0 select-none"
                        style={{ WebkitTextStroke: "1.2px rgba(222,154,60,0.5)" }}
                      >
                        {ch.no}
                      </span>
                      <h2 className="font-display font-semibold text-xl text-paper uppercase tracking-wide">
                        {ch.title}
                      </h2>
                    </div>
                    <div className="font-body text-[13px] leading-[1.85] text-mute max-w-prose">
                      {renderMd(ch.body)}
                    </div>
                  </article>
                ))}

                <div className="border-t border-line pt-4 font-mono text-[9px] text-dim">
                  End of Document · smartLAB PZT-EMI Monitor v1.9.0 · Fimto Soft · info@fimtosoft.com
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes paletteIn {
              from { opacity: 0; transform: translateY(-10px) scale(0.985); }
              to   { opacity: 1; transform: translateY(0)     scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
