import { useEffect, useRef, useState } from "react";
import { NodeSim, fmtClock } from "./sim";
import { FULL_CODE, FILE_NAME, FW_VERSION, FW_STATS } from "./firmware";
import { Chip, CollapsibleSection, Led, Reveal, useReducedMotion, useScramble } from "./ui";
import { REFERENCES } from "./references";
import { cn } from "./utils/cn";
import { useLang } from "./i18n";
import Lab from "./components/Lab";
import CodeViewer from "./components/CodeViewer";
import Hardware from "./components/Hardware";
import Arch from "./components/Arch";
import Api from "./components/Api";
import Forensics from "./components/Forensics";
import Calibration from "./components/Calibration";
import OutboxGrid from "./components/OutboxGrid";
import TestDashboard from "./components/TestDashboard";
import AIDiagnosticDeck from "./components/AIDiagnosticDeck";
import LangPicker from "./components/LangPicker";
import UserGuide from "./components/UserGuide";
import ClientZone from "./components/ClientZone";
import Lifecycle from "./components/Lifecycle";
import References from "./components/References";
import SearchModal from "./components/SearchModal";
import BackToTop from "./components/BackToTop";
import ThemeToggle from "./components/ThemeToggle";
import CloudPanel from "./components/CloudPanel";

/* ── live time-domain scope (hero) ─────────────────────────────── */
function HeroScope({ sim }: { sim: NodeSim }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const phaseRef = useRef(0);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let raf = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(143,214,148,0.08)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 42) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (const gy of [0.25, 0.5, 0.75]) {
        ctx.beginPath(); ctx.moveTo(0, H * gy); ctx.lineTo(W, H * gy); ctx.stroke();
      }

      const mid = H / 2;
      const signalOpen = sim.signalOpen;
      const amp = (sim.counts / 4095) * H * 0.42;
      const cycles = 3 + sim.fRes / 85;
      const ph = phaseRef.current;

      const trace = (offset: number, color: string, width: number, glow: number, aScale: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          let yv: number;
          if (signalOpen) {
            yv = mid + (Math.random() - 0.5) * 2.4 + Math.sin(x * 0.9) * 0.8;
          } else {
            const u = (x / W) * cycles * Math.PI * 2;
            const ring = 1 + 0.14 * Math.sin(u * 0.11 + ph * 0.4);
            const n = (Math.random() - 0.5) * (amp * 0.07 + 1.4);
            yv = mid + Math.sin(u - ph + offset) * amp * ring * aScale + n;
          }
          if (x === 0) ctx.moveTo(x, yv); else ctx.lineTo(x, yv);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      if (!reduced) trace(-1.1, "rgba(143,214,148,0.22)", 1.2, 0, 0.94);
      trace(0, signalOpen ? "#e4593c" : "#de9a3c", 1.8, 10, 1);

      ctx.strokeStyle = "rgba(233,228,212,0.12)";
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
    };

    if (reduced) { draw(); return; }
    const loop = () => { phaseRef.current += 0.16; draw(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sim, reduced]);

  const signalOpen = sim.signalOpen;
  return (
    <div className={cn("panel panel-corner transition-colors duration-300", signalOpen && "border-alarm/70")}>
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-line">
        <Led tone={signalOpen ? "alarm" : "copper"} />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">CH1 · GPIO36 · time domain</span>
        <span className="ml-auto font-mono text-[11px] text-dim">
          {signalOpen ? "0 kS/s — open line" : "≈83 kS/s burst"}
        </span>
      </div>
      <div className="relative">
        <div className="scanlines pointer-events-none absolute inset-0 z-10" />
        <canvas ref={ref} className="block w-full h-[236px] bg-scope" />
      </div>
      <div className="grid grid-cols-3 divide-x divide-line border-t border-line font-mono text-[10.5px]">
        <div className="px-3 py-2 text-dim">
          f<sub>res</sub>{" "}
          <span className={cn("ml-1", signalOpen ? "text-alarm" : "text-copper")}>{sim.fRes.toFixed(1)} kHz</span>
        </div>
        <div className="px-3 py-2 text-dim">
          V<sub>peak</sub> <span className="ml-1 text-paper">{sim.vMV.toFixed(0)} mV</span>
        </div>
        <div className="px-3 py-2 text-dim">
          status{" "}
          <span className={cn("ml-1", signalOpen ? "text-alarm" : "text-signal")}>
            {sim.status === "CRUSHED" ? "CRUSHED" : signalOpen ? "OPEN LINE" : sim.status}
          </span>
        </div>
      </div>
      <div className="h-1 bg-deep overflow-hidden">
        <div className="h-full w-1/3 bg-copper/60 sweep-bar" />
      </div>
    </div>
  );
}

/* ── boot console ──────────────────────────────────────────────── */
const BOOT_LINES = [
  "[ 0.000] smartLAB SHM node — pzt_emi_monitor v2.4.1 · boot #7",
  "[ 0.012] ADC1_CH0 (GPIO36) · 12-bit · atten 11 dB · burst 200 × 12 µs",
  "[ 0.031] LEDC0 (GPIO25) sweep drive armed — 1 kHz → 500 kHz · 96 log steps",
  "[ 0.214] [wifi] link up — IP 10.20.4.17 · RSSI -54 dBm",
  "[ 0.238] TLS session established → fimtosoft.com (CA pinned)",
  "[ 0.301] baseline signature captured — RMSD reference locked",
  "[ 1.004] [post] OK -> HTTP 201 (412 B)",
  "[ 1.312] [sweep] F=212.4 kHz  G=3995 uS  R=0.250 kOhm  RMSD=0.4%",
];

function BootConsole() {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? BOOT_LINES.length : 0);
  useEffect(() => {
    if (reduced) { setShown(BOOT_LINES.length); return; }
    const iv = window.setInterval(
      () => setShown(s => (s >= BOOT_LINES.length ? s : s + 1)),
      170
    );
    return () => window.clearInterval(iv);
  }, [reduced]);
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-line">
        <span className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-alarm/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-copper/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-signal/70" />
        </span>
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">serial monitor — 921600 baud</span>
        <span className="ml-auto font-mono text-[10px] text-dim">/dev/ttyUSB0</span>
      </div>
      <div className="px-4 py-3 bg-deep font-mono text-[11.5px] leading-[1.85] text-signal/90 min-h-[190px]">
        {BOOT_LINES.slice(0, shown).map((l, i) => (
          <div key={i} className="whitespace-pre-wrap"><span className="text-dim">$</span> {l}</div>
        ))}
        <span className="caret inline-block w-2 h-[13px] bg-signal/80 align-middle ml-1" />
      </div>
    </div>
  );
}

/* ── chrome ─────────────────────────────────────────────────────── */
function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7">
      <path d="M16 2 28 9v14L16 30 4 23V9z" fill="none" stroke="#de9a3c" strokeWidth="1.6" />
      <path d="M8 16h3l2-5 3 10 2.5-7 1.5 2h4" fill="none" stroke="#8fd694" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TopBar({
  sim,
  activeSection,
  onSelectSection,
  onSearch,
}: {
  sim: NodeSim;
  activeSection: string;
  onSelectSection: (id: string) => void;
  onSearch: () => void;
}) {
  const { t } = useLang();
  const crashed = sim.status === "CRUSHED";

  const NAV_ITEMS = [
    { id: "hero",         no: "",   key: "nav.home",         href: "#top"          },
    { id: "client-zone",  no: "01", key: "nav.client",       href: "#client-zone"  },
    { id: "guide",        no: "02", key: "nav.guide",        href: "#guide"        },
    { id: "telemetry",    no: "03", key: "nav.telemetry",    href: "#telemetry"    },
    { id: "firmware",     no: "04", key: "nav.firmware",     href: "#firmware"     },
    { id: "hardware",     no: "05", key: "nav.hardware",     href: "#hardware"     },
    { id: "architecture", no: "06", key: "nav.architecture", href: "#architecture" },
    { id: "uplink",       no: "07", key: "nav.uplink",       href: "#uplink"       },
    { id: "cloud",        no: "08", key: "nav.cloud",        href: "#cloud"        },
    { id: "references",   no: "09", key: "nav.refs",         href: "#references"   },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 h-14 flex items-center gap-4">
        {/* logo */}
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <LogoMark />
          <div className="leading-none">
            <div className="font-display font-bold text-[15px] tracking-wide text-paper">
              smart<span className="text-copper">LAB</span>
            </div>
            <div className="font-mono text-[9px] tracking-[0.26em] text-dim mt-0.5">SHM NODE</div>
          </div>
        </a>

        {/* nav */}
        <nav className="hidden lg:flex items-center gap-3 mx-auto" dir="ltr">
          {NAV_ITEMS.map(({ id, no, key, href }) => {
            const isActive = activeSection === id;
            return (
              <a
                key={href}
                href={href}
                onClick={() => onSelectSection(id)}
                className={cn(
                  "group relative font-mono text-[10.5px] tracking-[0.16em] uppercase px-2.5 py-1 transition-all duration-200 border rounded-sm flex items-center gap-1.5",
                  isActive
                    ? "border-copperdim bg-copper/15 text-copper font-semibold shadow-[0_0_12px_rgba(222,154,60,0.22)]"
                    : "border-transparent text-mute hover:text-copper hover:border-line2"
                )}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-copper shadow-[0_0_6px_#de9a3c] animate-pulse" />
                )}
                <span className={isActive ? "text-copper" : "text-dim group-hover:text-copper/70"}>
                  {no}
                </span>
                {t(key)}
              </a>
            );
          })}
        </nav>

        {/* right cluster */}
        <div className="ml-auto lg:ml-0 flex items-center gap-2.5 shrink-0">
          <span className="hidden xl:inline font-mono text-[10.5px] text-dim">{sim.sessionId}</span>
          <span className="hidden xl:inline font-mono text-[10.5px] tabular-nums text-mute">{fmtClock(sim.uptime)}</span>
          <Led tone={crashed ? "alarm" : sim.status === "ACTIVE" ? "signal" : "copper"} />

          {/* search trigger */}
          <button
            onClick={onSearch}
            aria-label={t("search.title")}
            className="flex items-center gap-2 border border-line2 px-2.5 py-1.5 font-mono text-[10.5px] text-dim hover:text-copper hover:border-copperdim transition-colors"
            dir="ltr"
          >
            <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="8" cy="8" r="5.2" /><path d="m12 12 3.6 3.6" strokeLinecap="round" />
            </svg>
            <span className="hidden md:inline">{t("search.btn")}</span>
            <kbd className="hidden md:inline border border-line px-1 py-px text-[9px] leading-none">⌘K</kbd>
          </button>

          <ThemeToggle />
          <LangPicker />
        </div>
      </div>
    </header>
  );
}

/* ── Fimto Soft company logo mark ──────────────────────────────── */
function FimtoLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-9 h-9 shrink-0">
        {/* hex frame */}
        <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full">
          <path
            d="M20 2 35 11v18L20 38 5 29V11z"
            fill="none"
            stroke="url(#fg)"
            strokeWidth="1.6"
          />
          <defs>
            <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#de9a3c" />
              <stop offset="100%" stopColor="#7fb8a4" />
            </linearGradient>
          </defs>
          {/* "F" letter mark */}
          <path
            d="M14 13h12M14 20h9M14 13v14"
            stroke="#de9a3c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      <div className="leading-none">
        <div className="font-display font-bold text-[16px] tracking-wide text-paper">
          Fimto <span className="text-copper">Soft</span>
        </div>
        <div className="font-mono text-[9px] tracking-[0.22em] text-dim mt-0.5 uppercase">
          Integrated Tech Solutions
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const { t } = useLang();

  const QUICK_LINKS = [
    { key: "fimto.link.home",    href: "https://fimtosoft.com" },
    { key: "fimto.link.about",   href: "https://fimtosoft.com/#about" },
    { key: "fimto.link.services",href: "https://fimtosoft.com/#services" },
    { key: "fimto.link.contact", href: "https://fimtosoft.com/#contact" },
  ] as const;

  return (
    <footer className="relative border-t border-line mt-8 overflow-hidden">

      {/* ── top divider strip ─────────────────────────────────── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-copperdim to-transparent opacity-60" />

      {/* ── Fimto Soft company section ────────────────────────── */}
      <div className="relative z-10 border-b border-line/60">
        <div className="max-w-[1240px] mx-auto px-5 md:px-8 py-10">
          {/* section label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[9.5px] tracking-[0.3em] uppercase text-dim px-3">
              powered by
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.8fr_0.8fr_1fr_1fr]">

            {/* col 1 — brand + about */}
            <div>
              <FimtoLogo />
              <p className="mt-4 text-[12.5px] text-mute leading-[1.75] max-w-xs">
                {t("fimto.about")}
              </p>
              {/* service pills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["ERP", "Ready-Mix", "Web Dev", "AI Apps", "Smart Home", "Security", "Networks"].map(s => (
                  <span
                    key={s}
                    className="border border-line/80 bg-raise/40 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.1em] text-dim"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* col 2 — quick links */}
            <div>
              <div className="font-mono text-[10px] tracking-[0.26em] uppercase text-copper mb-4">
                {t("fimto.links")}
              </div>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map(({ key, href }) => (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 font-body text-[13px] text-mute hover:text-copper transition-colors duration-200"
                    >
                      <span className="w-1 h-1 bg-copperdim group-hover:bg-copper transition-colors duration-200 shrink-0" />
                      {t(key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* col 3 — contact */}
            <div>
              <div className="font-mono text-[10px] tracking-[0.26em] uppercase text-copper mb-4">
                {t("fimto.contact")}
              </div>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:info@fimtosoft.com"
                    className="group flex items-start gap-2.5 text-mute hover:text-copper transition-colors duration-200"
                  >
                    <svg viewBox="0 0 20 20" className="w-4 h-4 mt-0.5 shrink-0 text-copperdim group-hover:text-copper transition-colors" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="2" y="4" width="16" height="12" rx="1.5" />
                      <path d="m2 5 8 6 8-6" />
                    </svg>
                    <span className="font-body text-[13px] break-all">info@fimtosoft.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+201001006627"
                    className="group flex items-center gap-2.5 text-mute hover:text-copper transition-colors duration-200"
                  >
                    <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0 text-copperdim group-hover:text-copper transition-colors" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3 5a2 2 0 0 1 2-2h1.5l1.5 4-1.75 1.25A9.98 9.98 0 0 0 11.75 13.75L13 12l4 1.5V15a2 2 0 0 1-2 2C6.48 17 3 10.52 3 5z" />
                    </svg>
                    <div className="font-mono text-[12px]">
                      <div className="text-dim text-[10px] mb-0.5">EG</div>
                      <div>01001006627</div>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+9660500439617"
                    className="group flex items-center gap-2.5 text-mute hover:text-copper transition-colors duration-200"
                  >
                    <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0 text-copperdim group-hover:text-copper transition-colors" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3 5a2 2 0 0 1 2-2h1.5l1.5 4-1.75 1.25A9.98 9.98 0 0 0 11.75 13.75L13 12l4 1.5V15a2 2 0 0 1-2 2C6.48 17 3 10.52 3 5z" />
                    </svg>
                    <div className="font-mono text-[12px]">
                      <div className="text-dim text-[10px] mb-0.5">KSA</div>
                      <div>0500439617</div>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            {/* col 4 — locations */}
            <div>
              <div className="font-mono text-[10px] tracking-[0.26em] uppercase text-copper mb-4">
                {t("fimto.locations")}
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 shrink-0">🇪🇬</span>
                  <div>
                    <div className="font-body text-[13px] text-paper">{t("fimto.eg")}</div>
                    <div className="font-mono text-[10px] text-dim mt-0.5">EG: 01001006627</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 shrink-0">🇸🇦</span>
                  <div>
                    <div className="font-body text-[13px] text-paper">{t("fimto.ksa")}</div>
                    <div className="font-mono text-[10px] text-dim mt-0.5">KSA: 0500439617</div>
                  </div>
                </li>
              </ul>
              {/* website link */}
              <a
                href="https://fimtosoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 inline-flex items-center gap-2 border border-copperdim bg-copper/8 px-3.5 py-2 font-mono text-[10.5px] tracking-[0.14em] uppercase text-copper hover:bg-copper/18 hover:border-copper transition-all duration-200"
              >
                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 2c-2.5 3-4 5-4 8s1.5 5 4 8" />
                  <path d="M10 2c2.5 3 4 5 4 8s-1.5 5-4 8" />
                  <path d="M2 10h16" />
                </svg>
                fimtosoft.com
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 6h8M6 2l4 4-4 4" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── smartLAB firmware meta section ────────────────────── */}
      <div className="relative z-10">
        <div className="max-w-[1240px] mx-auto px-5 md:px-8 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* smartLAB brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <LogoMark />
              <span className="font-display font-bold text-lg text-paper">
                smart<span className="text-copper">LAB</span> instrumentation
              </span>
            </div>
            <p className="text-[12.5px] text-mute leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
          </div>

          {[
            {
              h: "Deliverable",
              rows: [
                ["FILE",    FILE_NAME],
                ["VERSION", `v${FW_VERSION}`],
                ["LINES",   String(FW_STATS.lines)],
                ["SIZE",    `${(FW_STATS.bytes / 1024).toFixed(1)} kB`],
              ],
            },
            {
              h: "Target",
              rows: [
                ["MCU",   "ESP32-WROOM-32"],
                ["CORE",  "Arduino 3.x"],
                ["CLOCK", "240 MHz dual-core"],
                ["DEPS",  "WiFi · HTTPClient"],
              ],
            },
            {
              h: "Build",
              rows: [
                ["TOOLCHAIN", "xtensa-esp32-elf-gcc"],
                ["FLASH",     "4 MB · min_spiffs"],
                ["AUDIT",     `${FW_STATS.delayCalls} blocking calls`],
                ["SHA-256",   "9f3a…c2d7"],
              ],
            },
          ].map(c => (
            <div key={c.h}>
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper mb-3">{c.h}</div>
              <dl className="space-y-1.5">
                {c.rows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 font-mono text-[11px]">
                    <dt className="text-dim">{k}</dt>
                    <dd className="text-mute text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>

      {/* ── large display word ────────────────────────────────── */}
      <div className="pointer-events-none select-none text-center leading-none -mb-6 md:-mb-10 relative z-0">
        <span className="outline-word font-display font-bold text-[21vw] md:text-[13rem] tracking-tight">
          PZT-EMI
        </span>
      </div>

      {/* ── bottom bar ───────────────────────────────────────── */}
      <div className="border-t border-line relative z-10 bg-ink">
        <div className="max-w-[1240px] mx-auto px-5 md:px-8 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-1.5 font-mono text-[10px] text-dim">
          <span>{t("footer.copyright")}</span>
          <span className="hidden sm:inline">·</span>
          <a
            href="https://fimtosoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-copperdim hover:text-copper transition-colors"
          >
            {t("fimto.poweredby")}
          </a>
          <span className="ml-auto">bench unit PZT-9F3A2C · {t("footer.verified")}</span>
        </div>
      </div>
    </footer>
  );
}

/* ── app root ───────────────────────────────────────────────────── */
export default function App() {
  const simRef = useRef<NodeSim | null>(null);
  if (!simRef.current) simRef.current = new NodeSim();
  const sim = simRef.current;
  const [, setTick] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { t, dir } = useLang();

  /* IntersectionObserver لتحديد القسم النشط بدقة أثناء التمرير */
  useEffect(() => {
    const sectionIds = [
      "hero",
      "client-zone",
      "guide",
      "telemetry",
      "firmware",
      "hardware",
      "architecture",
      "uplink",
      "cloud",
      "references",
    ];

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // نختار أكثر قسم يغطي الشاشة حالياً
          const topMost = visible.reduce((prev, curr) =>
            curr.intersectionRatio > prev.intersectionRatio ? curr : prev
          );
          setActiveSection(topMost.target.id);
        }
      },
      {
        rootMargin: "-15% 0px -40% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* global ⌘K / Ctrl-K + "/" shortcut */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setSearchOpen(o => !o);
        return;
      }
      if (k === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = document.activeElement;
        const typing =
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement ||
          (el instanceof HTMLElement && el.isContentEditable);
        if (!typing) {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const iv = window.setInterval(() => {
      sim.tick(performance.now());
      setTick(n => n + 1);
    }, 50);
    return () => window.clearInterval(iv);
  }, [sim]);

  /* Sync document <html> direction for RTL languages (Arabic) */
  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", dir === "rtl" ? "ar" : "en");
  }, [dir]);

  const title = useScramble("PZT-EMI MONITOR");

  const downloadIno = () => {
    const blob = new Blob([FULL_CODE], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = FILE_NAME;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div id="top" className="relative min-h-screen" dir={dir}>
      {/* ambient layers */}
      <div className="fixed inset-0 -z-10 grid-bg" aria-hidden />
      <div className="fixed inset-0 z-[70] pointer-events-none noise-bg" aria-hidden />

      <TopBar sim={sim} activeSection={activeSection} onSelectSection={setActiveSection} onSearch={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BackToTop />

      <main className="max-w-[1240px] mx-auto px-5 md:px-8">
        {/* hero */}
        <section id="hero" className="pt-12 md:pt-16 pb-6">
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] items-center">
            <div>
              <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-copper">
                {t("hero.kicker")}
              </div>
              <h1 className="mt-4 font-display font-bold text-[42px] sm:text-6xl xl:text-[68px] leading-[0.98] tracking-tight text-paper" dir="ltr">
                {title || "\u00A0"}
              </h1>
              <div className="mt-3 font-mono text-[12px] text-dim">
                {FILE_NAME} · v{FW_VERSION} · {FW_STATS.lines} lines ·{" "}
                <span className="text-signal">{t("hero.meta")}</span>
              </div>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mute">
                {t("hero.body")}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Chip tone="signal">{t("hero.chip1")}</Chip>
                <Chip tone="copper">{t("hero.chip2")}</Chip>
                <Chip>{t("hero.chip3")}</Chip>
                <Chip>{t("hero.chip4")}</Chip>
                <Chip>{t("hero.chip5")}</Chip>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#firmware"
                  className="border border-copperdim bg-copper/10 px-5 py-2.5 font-mono text-[11px] tracking-[0.16em] uppercase text-copper hover:bg-copper/25 hover:border-copper transition-all duration-200"
                >
                  {t("hero.btn.review")}
                </a>
                <button
                  onClick={downloadIno}
                  className="border border-line2 px-5 py-2.5 font-mono text-[11px] tracking-[0.16em] uppercase text-mute hover:text-paper hover:border-copperdim transition-all duration-200"
                >
                  {t("hero.btn.download")}
                </button>
              </div>
            </div>
            <Reveal delay={120}>
              <HeroScope sim={sim} />
            </Reveal>
          </div>

          <Reveal delay={200} className="mt-8">
            <BootConsole />
          </Reveal>
          <Reveal delay={260}>
            <Forensics sim={sim} />
          </Reveal>
          <Reveal delay={285} className="mt-5">
            <AIDiagnosticDeck sim={sim} />
          </Reveal>
          <Reveal delay={310} className="mt-5">
            <Calibration sim={sim} />
          </Reveal>
          <Reveal delay={360} className="mt-5">
            <OutboxGrid sim={sim} />
          </Reveal>
          <Reveal delay={410} className="mt-5">
            <TestDashboard sim={sim} />
          </Reveal>
        </section>

        {/* client zone */}
        <section id="client-zone" className="py-16 md:py-20 scroll-mt-20 border-t border-line/70">
          <Reveal>
            <Lifecycle />
          </Reveal>
          <Reveal className="mt-5">
            <ClientZone sim={sim} />
          </Reveal>
        </section>

        {/* 02 — user guide */}
        <section id="guide" className="py-16 md:py-20 scroll-mt-20 border-t border-line/70">
          <CollapsibleSection
            no="02"
            kicker={t("guide.kicker")}
            title={t("guide.title")}
            blurb={t("guide.subtitle")}
            sectionId="guide"
            labelExpand={t("fold.expand")}
            labelCollapse={t("fold.collapse")}
            summary={t("guide.subtitle")}
          >
            <UserGuide />
          </CollapsibleSection>
        </section>

        {/* 03 — telemetry */}
        <section id="telemetry" className="py-16 md:py-20 scroll-mt-20 border-t border-line/70">
          <CollapsibleSection
            no="03"
            kicker={t("s01.kicker")}
            title={t("s01.title")}
            blurb={t("s01.blurb")}
            sectionId="telemetry"
            labelExpand={t("fold.expand")}
            labelCollapse={t("fold.collapse")}
            summary={t("s01.blurb")}
          >
            <Lab sim={sim} />
          </CollapsibleSection>
        </section>

        {/* 04 — firmware */}
        <section id="firmware" className="py-16 md:py-20 scroll-mt-20 border-t border-line/70">
          <CollapsibleSection
            no="04"
            kicker={t("s02.kicker")}
            title={t("s02.title", { file: FILE_NAME })}
            blurb={t("s02.blurb")}
            sectionId="firmware"
            ownedHashPrefixes={["fw-"]}
            labelExpand={t("fold.expand")}
            labelCollapse={t("fold.collapse")}
            summary={t("fold.sum.firmware", {
              lines: String(FW_STATS.lines),
              n: String(FW_STATS.sections),
            })}
          >
            <CodeViewer />
          </CollapsibleSection>
        </section>

        {/* 05 — hardware */}
        <section id="hardware" className="py-16 md:py-20 scroll-mt-20 border-t border-line/70">
          <CollapsibleSection
            no="05"
            kicker={t("s03.kicker")}
            title={t("s03.title")}
            blurb={t("s03.blurb")}
            sectionId="hardware"
            labelExpand={t("fold.expand")}
            labelCollapse={t("fold.collapse")}
            summary={t("s03.blurb")}
          >
            <Hardware />
          </CollapsibleSection>
        </section>

        {/* 06 — architecture */}
        <section id="architecture" className="py-16 md:py-20 scroll-mt-20 border-t border-line/70">
          <CollapsibleSection
            no="06"
            kicker={t("s04.kicker")}
            title={t("s04.title")}
            blurb={t("s04.blurb")}
            sectionId="architecture"
            labelExpand={t("fold.expand")}
            labelCollapse={t("fold.collapse")}
            summary={t("s04.blurb")}
          >
            <Arch status={sim.status} crushed={sim.status === "CRUSHED"} />
          </CollapsibleSection>
        </section>

        {/* 07 — uplink */}
        <section id="uplink" className="py-16 md:py-20 scroll-mt-20 border-t border-line/70">
          <CollapsibleSection
            no="07"
            kicker={t("s05.kicker")}
            title={t("s05.title")}
            blurb={t("s05.blurb")}
            sectionId="uplink"
            labelExpand={t("fold.expand")}
            labelCollapse={t("fold.collapse")}
            summary={t("s05.blurb")}
          >
            <Api sim={sim} />
          </CollapsibleSection>
        </section>

        {/* 08 — cloud backend */}
        <section id="cloud" className="py-16 md:py-20 scroll-mt-20 border-t border-line/70">
          <CollapsibleSection
            no="08"
            kicker={t("cloud.kicker")}
            title={t("cloud.title")}
            blurb={t("cloud.proxy.hint")}
            sectionId="cloud"
            labelExpand={t("fold.expand")}
            labelCollapse={t("fold.collapse")}
            summary={t("cloud.proxy.hint")}
          >
            <CloudPanel />
          </CollapsibleSection>
        </section>

        {/* 09 — references */}
        <section id="references" className="py-16 md:py-20 scroll-mt-20 border-t border-line/70">
          <CollapsibleSection
            no="09"
            kicker={t("ref.kicker")}
            title={t("ref.title")}
            blurb={t("ref.subtitle")}
            sectionId="references"
            ownedHashPrefixes={["ref-"]}
            labelExpand={t("fold.expand")}
            labelCollapse={t("fold.collapse")}
            summary={t("fold.sum.refs", { n: String(REFERENCES.length) })}
          >
            <References />
          </CollapsibleSection>
        </section>
      </main>

      <Footer />
    </div>
  );
}
