/* ================================================================ *
 *  Lifecycle.tsx — smartLAB hardware onboarding lifecycle
 *
 *  Binary deployment path, injected above the Client Zone:
 *
 *   Option 1 · Certified smartLAB Sensor
 *     → polls the 1-Wire bus for a 64-bit ROM ID (live stage log)
 *     → renders a verified lock badge
 *     → triggers the backend routine: session lock + −1 factory token
 *
 *   Option 2 · Generic Commercial Sensor
 *     → ROM verification input disabled, calibration coefficients hidden
 *     → amber trigger: "⚡ Capture Generic PUF Baseline Latch"
 *
 *  The deployment flag is written to onboardStore so the report
 *  exporter and the TokenBank grid stay synchronized.
 * ================================================================ */

import { useEffect, useState } from "react";
import { Led } from "../ui";
import { cn } from "../utils/cn";
import {
  deductToken,
  generateRomId,
  getOrCreateWallet,
  tokenDb,
  type TokenWallet,
  type TokenTxn,
} from "../tokenDb";
import {
  generatePufLatchId,
  lockCertifiedSession,
  lockGenericSession,
  onboardSession,
  resetOnboardSession,
} from "../onboardStore";

type RomStage = "idle" | "scan" | "found" | "crc" | "locked" | "error";
type PufStage = "idle" | "rolling" | "latched";

const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

const STAGE_TEXT: Record<RomStage, string> = {
  idle:   "Awaiting 1-Wire bus scan…",
  scan:   "Scanning 1-Wire bus for devices…",
  found:  "Device present — reading ROM register…",
  crc:    "CRC-16 integrity check on 64-bit payload…",
  locked: "ROM verified — session locked",
  error:  "Backend routine failed — insufficient factory tokens",
};

/* rolling hex animation for the PUF edge roll */
function useRollingPuff(active: boolean): string {
  const [text, setText] = useState("PUF-············");
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      const roll = Array.from({ length: 12 }, () =>
        "0123456789ABCDEF"[Math.floor(Math.random() * 16)]
      ).join("");
      setText(`PUF-${roll}`);
    }, 55);
    return () => clearInterval(iv);
  }, [active]);
  return text;
}

export default function Lifecycle() {
  const [wallet, setWallet] = useState<TokenWallet | null>(null);
  const [, setTxns] = useState<TokenTxn[]>([]);
  const [romStage, setRomStage] = useState<RomStage>("idle");
  const [polledRom, setPolledRom] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pufStage, setPufStage] = useState<PufStage>("idle");
  const rollingPuf = useRollingPuff(pufStage === "rolling");

  const mode = onboardSession.mode;

  /* hydrate wallet on mount */
  useEffect(() => {
    void (async () => {
      const w = await getOrCreateWallet();
      setWallet(w);
      setTxns(await tokenDb.getRecentTxns(12));
    })();
  }, []);

  /* ── Option 1: certified poll routine ────────────────────────── */
  const pollRom = async (): Promise<void> => {
    if (polling || mode === "certified") return;
    setPolling(true);
    setRomStage("scan");
    await sleep(720);
    setRomStage("found");
    await sleep(640);
    setRomStage("crc");
    await sleep(560);
    const rom = generateRomId();
    try {
      const nextWallet = await deductToken("PROPRIETARY_CERTIFIED", rom, null, null);
      setWallet(nextWallet);
      setTxns(await tokenDb.getRecentTxns(12));
      setPolledRom(rom);
      setRomStage("locked");
      lockCertifiedSession(rom);
    } catch {
      setRomStage("error");
    }
    setPolling(false);
  };

  /* ── Option 2: PUF baseline latch ─────────────────────────────── */
  const capturePuf = async (): Promise<void> => {
    if (pufStage !== "idle" || mode === "generic") return;
    setPufStage("rolling");
    await sleep(950);
    const latch = generatePufLatchId();
    lockGenericSession(latch);
    setPufStage("latched");
  };

  const resetAll = (): void => {
    resetOnboardSession();
    setRomStage("idle");
    setPolledRom(null);
    setPufStage("idle");
  };

  const certifiedLocked = mode === "certified";
  const genericLocked   = mode === "generic";

  const statusChip =
    certifiedLocked
      ? { text: "OPTION 1 · SESSION LOCKED ✓", cls: "border-signaldeep bg-signal/8 text-signal" }
      : genericLocked
      ? { text: "OPTION 2 · PUF LATCHED ⚡", cls: "border-copperdim bg-copper/10 text-copper" }
      : { text: "NOT ONBOARDED", cls: "border-line bg-scope/40 text-dim" };

  return (
    <section className="panel panel-corner overflow-hidden" aria-label="Hardware onboarding lifecycle">
      {/* ── header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 border-b border-line bg-raise/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center border border-copperdim bg-copper/10 shrink-0">
            <svg viewBox="0 0 20 20" className="w-4.5 h-4.5 text-copper" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="8" width="14" height="9" rx="1.5"/>
              <path d="M6 8V6a4 4 0 0 1 8 0v2"/>
              <circle cx="10" cy="12.5" r="1.4" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-copper">Step 0A · Deployment Lifecycle</div>
            <div className="font-display font-bold text-[15px] text-paper tracking-wide">Hardware Onboarding Path</div>
          </div>
        </div>
        <span className="font-mono text-[9.5px] text-dim hidden sm:inline">DEPLOY_FLAG = {mode.toUpperCase()}</span>
        <div className="ml-auto flex items-center gap-3">
          {wallet && (
            <div className={cn(
              "border px-2.5 py-1.5 font-mono text-[10px]",
              wallet.balance <= 0 ? "border-alarm/60 bg-alarm/8 text-alarm" :
              wallet.balance <= 3 ? "border-copperdim bg-copper/8 text-copper" : "border-signaldeep bg-signal/6 text-signal"
            )}>
              Active Factory Tokens: <span className="font-bold tabular-nums">{wallet.balance}</span>
            </div>
          )}
          <span className={cn("border px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em]", statusChip.cls)}>
            {statusChip.text}
          </span>
        </div>
      </div>

      {/* ── dual option cards ──────────────────────────────────── */}
      <div className="grid gap-0 md:grid-cols-2 md:divide-x divide-line">

        {/* ═══════ OPTION 1 — CERTIFIED smartLAB SENSOR ═══════ */}
        <div className={cn("p-5 transition-colors duration-300 border-b md:border-b-0 border-line",
          certifiedLocked ? "bg-signal/4" : genericLocked ? "opacity-45 pointer-events-none" : "")}>
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-9 h-9 flex items-center justify-center border shrink-0 transition-colors",
              certifiedLocked ? "border-signal bg-signal/15" : "border-signaldeep bg-signal/8")}>
              <svg viewBox="0 0 20 20" className="w-4.5 h-4.5 text-signal" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="4" y="9" width="12" height="8" rx="1.2"/>
                <path d="M7 9V6a3 3 0 0 1 6 0v3"/>
              </svg>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-signal">Option 1 · Proprietary</div>
              <div className="font-display font-semibold text-[15px] text-paper">Certified smartLAB Sensor</div>
            </div>
            {certifiedLocked && (
              <span className="ml-auto border border-signaldeep bg-signal/12 px-2 py-1 font-mono text-[9px] text-signal uppercase">
                🔒 Verified
              </span>
            )}
          </div>

          {/* 1-Wire ROM field */}
          <div className="space-y-2.5">
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-1.5">
                1-Wire 64-bit ROM ID
              </label>
              <div className="flex gap-2">
                <div className={cn(
                  "flex-1 border px-3 py-2 font-mono text-[11.5px] tracking-wider min-h-[34px] flex items-center",
                  polledRom ? "border-signaldeep bg-signal/6 text-teal" : "border-line bg-scope/50 text-dim"
                )}>
                  {certifiedLocked && onboardSession.romId
                    ? onboardSession.romId
                    : polledRom ?? (polling ? "… polling …" : "— awaiting scan —")}
                </div>
                {!certifiedLocked && (
                  <button
                    onClick={() => { void pollRom(); }}
                    disabled={polling || genericLocked}
                    className={cn("border px-3.5 font-mono text-[10px] uppercase transition-colors whitespace-nowrap disabled:opacity-40",
                      polling
                        ? "border-copperdim bg-copper/10 text-copper"
                        : "border-signaldeep bg-signal/10 text-signal hover:bg-signal/20")}>
                    {polling ? "Polling…" : "Poll ROM"}
                  </button>
                )}
              </div>
            </div>

            {/* stage progress */}
            <div className={cn("border px-3 py-2 flex items-center gap-2 font-mono text-[9.5px] transition-colors",
              romStage === "locked" ? "border-signaldeep bg-signal/6 text-signal" :
              romStage === "error"  ? "border-alarm/60 bg-alarm/8 text-alarm" :
              polling ? "border-copperdim bg-copper/6 text-copper" : "border-line bg-scope/30 text-dim")}>
              <Led
                tone={romStage === "locked" ? "signal" : romStage === "error" ? "alarm" : polling ? "copper" : "dim"}
                size={6}
                live={polling || romStage === "locked"}
              />
              <span>
                {certifiedLocked ? STAGE_TEXT.locked : STAGE_TEXT[polling ? romStage : romStage]}
              </span>
              {(polling || certifiedLocked) && !certifiedLocked && (
                <span className="ml-auto text-copper animate-pulse">···</span>
              )}
            </div>

            {/* backend routine outcome */}
            {certifiedLocked && (
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-signaldeep bg-signal/8 px-3 py-2.5">
                  <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-dim mb-1">Session Lock</div>
                  <div className="font-mono font-bold text-[13px] text-signal">🔒 ROM VERIFIED</div>
                </div>
                <div className="border border-copperdim bg-copper/8 px-3 py-2.5">
                  <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-dim mb-1">Backend Routine</div>
                  <div className="font-mono font-bold text-[13px] text-copper">−1 Factory Token</div>
                </div>
              </div>
            )}

            <p className="font-body text-[11.5px] leading-relaxed text-mute">
              Polls the 1-Wire bus until a genuine smartLAB aggregate responds,
              validates the 64-bit ROM CRC, locks the session on the backend, and
              deducts exactly one asset token from the Active Factory Tokens grid.
            </p>
          </div>
        </div>

        {/* ═══════ OPTION 2 — GENERIC COMMERCIAL SENSOR ═══════ */}
        <div className={cn("p-5 transition-colors duration-300",
          genericLocked ? "bg-copper/4" : certifiedLocked ? "opacity-45 pointer-events-none" : "")}>
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-9 h-9 flex items-center justify-center border shrink-0 transition-colors",
              genericLocked ? "border-copper bg-copper/15" : "border-line2 bg-scope/40")}>
              <svg viewBox="0 0 20 20" className={cn("w-4.5 h-4.5", genericLocked ? "text-copper" : "text-dim")} fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M10 2 2 7l8 5 8-5-8-5z"/>
                <path d="M2 12l8 5 8-5"/>
              </svg>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">Option 2 · Generic</div>
              <div className="font-display font-semibold text-[15px] text-paper">Generic Commercial Sensor</div>
            </div>
            {genericLocked && (
              <span className="ml-auto border border-copperdim bg-copper/12 px-2 py-1 font-mono text-[9px] text-copper uppercase">
                ⚡ PUF Latched
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {/* disabled ROM input */}
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-1.5">
                1-Wire 64-bit ROM ID
              </label>
              <div className="border border-line bg-scope/30 px-3 py-2 font-mono text-[11.5px] text-dim/50 flex items-center justify-between min-h-[34px]">
                <span className="line-through decoration-dim/60">ROM verification disabled</span>
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-dim/60" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2 2l12 12M2 14 14 2"/>
                </svg>
              </div>
            </div>

            {/* hidden calibration coefficients */}
            <div className="border border-line/60 bg-scope/20 px-3 py-2.5 flex items-center gap-2.5">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-dim/50 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="6" width="10" height="7" rx="1"/>
                <path d="M5.5 6V4.5a2.5 2.5 0 0 1 5 0V6"/>
              </svg>
              <div className="font-mono text-[9.5px] text-dim/60">
                Factory calibration coefficients: <span className="line-through">A=0.92 · B=1.07 · k=4.43</span>
                <span className="ml-2 text-dim">— unavailable for generic hardware —</span>
              </div>
            </div>

            {/* amber PUF latch trigger */}
            {genericLocked ? (
              <div className="border border-copperdim bg-copper/10 px-3 py-3 space-y-1.5">
                <div className="flex items-center gap-2 font-mono text-[10.5px] text-copper">
                  <span className="w-2 h-2 bg-copper rounded-full shrink-0" />
                  ⚡ Generic (Self-Calibrated) — PUF latch captured
                </div>
                <div className="font-mono text-[11px] text-teal pl-4">{onboardSession.pufLatchId}</div>
                <div className="font-mono text-[9px] text-dim pl-4">
                  latched {onboardSession.lockedAt?.slice(0, 19).replace("T", " ")} · 0 factory tokens used
                </div>
              </div>
            ) : (
              <button
                onClick={() => { void capturePuf(); }}
                disabled={pufStage === "rolling" || certifiedLocked}
                className={cn("w-full border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-all duration-200 active:translate-y-px disabled:opacity-40",
                  pufStage === "rolling"
                    ? "border-copper bg-copper/16 text-copper"
                    : "border-copperdim bg-copper/8 text-copper hover:bg-copper/18 hover:border-copper")}>
                {pufStage === "rolling" ? rollingPuf : "⚡ Capture Generic PUF Baseline Latch"}
              </button>
            )}

            <p className="font-body text-[11.5px] leading-relaxed text-mute">
              Third-party PZT aggregates carry no factory ROM. The platform instead
              captures a physically-unclonable-function baseline latch so results
              remain traceable — flagged self-calibrated, evaluation-only.
            </p>
          </div>
        </div>
      </div>

      {/* ── lifecycle footer ───────────────────────────────────── */}
      <div className="border-t border-line px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[9.5px] text-dim">
        <span>deployment flag: <span className={certifiedLocked ? "text-signal" : genericLocked ? "text-copper" : "text-dim"}>{mode.toUpperCase()}</span></span>
        <span>token backend: IndexedDB smartlab-token-wallet-v1</span>
        <span>1-wire bus: GPIO4 (DS2480B bridge)</span>
        {mode !== "none" && (
          <button onClick={resetAll}
            className="ml-auto border border-line px-2 py-0.5 font-mono text-[9px] text-dim hover:text-alarm hover:border-alarm/60 transition-colors">
            reset onboarding ↺
          </button>
        )}
      </div>
    </section>
  );
}
