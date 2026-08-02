import { useMemo, useState } from "react";
import {
  FIRMWARE_SECTIONS,
  FULL_CODE,
  FILE_NAME,
  FW_STATS,
  SECTION_OFFSETS,
  FW_VERSION,
} from "../firmware";
import { Reveal, useReducedMotion } from "../ui";
import { cn } from "../utils/cn";

/* ── C++ tokenizer ─────────────────────────────────────────────── */
type Tok = { text: string; cls: string };

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(#\s*[a-z]+\b[^\n]*)|\b(0[xX][0-9a-fA-F]+[uUlL]*|\d+(?:\.\d+)?[fFuUlL]*)\b|\b(void|bool|char|float|double|const|static|constexpr|volatile|struct|enum|class|unsigned|signed|if|else|for|while|switch|case|break|continue|return|template|typename|this)\b|\b(int8_t|uint8_t|int16_t|uint16_t|int32_t|uint32_t|int64_t|uint64_t|size_t|String|JsonDocument|HTTPClient|WiFiClientSecure|NodeState|SweepEngine|FaultLatch|RetrySlot|TelemetryCtl|Reading|WiFiEvent_t|gpio_num_t|RTC_DATA_ATTR|WiFi|Serial)\b|\b(true|false|nullptr|HIGH|LOW|OUTPUT|INPUT|ADC_11db|WL_CONNECTED|WIFI_STA)\b|\b([A-Za-z_]\w*(?=\s*\())/g;

const CLASSES = ["com", "str", "pp", "num", "kw", "ty", "lit", "api"];

const CLASS_STYLE: Record<string, string> = {
  com: "italic text-[#75887a]",
  str: "text-[#b7d18a]",
  pp: "text-copper",
  num: "text-[#e8c07a]",
  kw: "text-[#e0876a]",
  ty: "text-teal",
  lit: "text-copperhi",
  api: "text-signalhi",
  tx: "text-[#c2cec1]",
};

function tokenize(src: string): Tok[] {
  const re = new RegExp(TOKEN_RE.source, "g");
  const toks: Tok[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) toks.push({ text: src.slice(last, m.index), cls: "tx" });
    const gi = m.slice(1).findIndex((g) => g !== undefined);
    toks.push({ text: m[0], cls: CLASSES[gi] ?? "tx" });
    last = re.lastIndex;
  }
  if (last < src.length) toks.push({ text: src.slice(last), cls: "tx" });
  return toks;
}

function linesFromTokens(toks: Tok[]): Tok[][] {
  const lines: Tok[][] = [[]];
  for (const t of toks) {
    const parts = t.text.split("\n");
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ text: p, cls: t.cls });
    });
  }
  return lines;
}

/* ── clipboard + download helpers ──────────────────────────────── */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function downloadIno() {
  const blob = new Blob([FULL_CODE], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = FILE_NAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        }
      }}
      className={cn(
        "border px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors duration-200",
        done
          ? "border-signaldeep text-signal"
          : "border-line2 text-mute hover:border-copperdim hover:text-copper"
      )}
    >
      {done ? "copied ✓" : label}
    </button>
  );
}

/* ── main viewer ───────────────────────────────────────────────── */
export default function CodeViewer() {
  const reduced = useReducedMotion();

  const sectionLines = useMemo(
    () => FIRMWARE_SECTIONS.map((s) => linesFromTokens(tokenize(s.code))),
    []
  );

  const jump = (id: string) => {
    document
      .getElementById(`fw-${id}`)
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[230px_1fr] items-start">
      {/* TOC + audit rail */}
      <Reveal className="lg:sticky lg:top-24 order-2 lg:order-1">
        <div className="panel panel-corner p-4">
          <div className="font-mono text-[10px] tracking-[0.24em] text-copper uppercase mb-3">
            Translation unit map
          </div>
          <ol className="space-y-0.5">
            {FIRMWARE_SECTIONS.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => jump(s.id)}
                  className="group w-full text-left px-2 py-1.5 flex items-baseline gap-2 border border-transparent hover:border-line2 hover:bg-panel2 transition-colors duration-200"
                >
                  <span className="font-mono text-[10px] text-dim group-hover:text-copper">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-body text-[12.5px] text-mute group-hover:text-paper leading-snug">
                    {s.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-4 pt-4 border-t border-line">
            <div className="font-mono text-[10px] tracking-[0.24em] text-copper uppercase mb-2.5">
              Non-blocking audit
            </div>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li className="flex justify-between text-mute">
                <span>delay()</span>
                <span className="text-signal">{FW_STATS.delayCalls} ✓</span>
              </li>
              <li className="flex justify-between text-mute">
                <span>delayMicroseconds()</span>
                <span className="text-signal">{FW_STATS.delayMicroCalls} ✓</span>
              </li>
              <li className="flex justify-between text-mute">
                <span>HTTP hard-timeout</span>
                <span className="text-paper">2.2 s</span>
              </li>
              <li className="flex justify-between text-mute">
                <span>tasks in loop()</span>
                <span className="text-paper">5 coop.</span>
              </li>
            </ul>
          </div>
        </div>
      </Reveal>

      {/* source */}
      <div className="order-1 lg:order-2 min-w-0">
        {/* file bar */}
        <Reveal>
          <div className="panel border-b-0 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-copper" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
              <path d="M14 3v5h5" />
            </svg>
            <span className="font-mono text-sm text-paper">{FILE_NAME}</span>
            <span className="font-mono text-[10px] text-dim border border-line2 px-1.5 py-0.5">
              v{FW_VERSION}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:block font-mono text-[11px] text-dim">
                {FW_STATS.lines} lines · {(FW_STATS.bytes / 1024).toFixed(1)} kB
              </span>
              <CopyButton text={FULL_CODE} label="copy file" />
              <button
                onClick={downloadIno}
                className="border border-copperdim bg-copper/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] uppercase text-copper hover:bg-copper/20 transition-colors duration-200"
              >
                download .ino
              </button>
            </div>
          </div>
        </Reveal>

        {FIRMWARE_SECTIONS.map((s, si) => (
          <Reveal key={s.id} delay={60}>
            <section
              id={`fw-${s.id}`}
              className="panel border-t-0 scroll-mt-28 overflow-hidden"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5 bg-raise/60 border-b border-line">
                <span className="font-mono text-[10px] text-copper">
                  §{si + 1}
                </span>
                <h3 className="font-display font-semibold text-[13px] tracking-wide uppercase text-paper">
                  {s.title}
                </h3>
                <span className="hidden md:inline font-body text-[11.5px] text-dim">
                  — {s.brief}
                </span>
                <span className="ml-auto">
                  <CopyButton text={s.code} label="copy" />
                </span>
              </div>
              <div className="overflow-x-auto bg-scope/70 code-surface">
                <div className="min-w-[640px] py-3 font-mono text-[12px] leading-[1.62]">
                  {sectionLines[si].map((line, li) => {
                    const no = SECTION_OFFSETS[si] + li;
                    return (
                      <div
                        key={li}
                        className="grid grid-cols-[3.4rem_1fr] hover:bg-raise/40 transition-colors duration-100"
                      >
                        <span className="select-none text-right pr-4 text-dim/70 border-r border-line/60">
                          {no}
                        </span>
                        <span className="pl-4 pr-6 whitespace-pre">
                          {line.length === 0
                            ? " "
                            : line.map((t, ti) => (
                                <span key={ti} className={CLASS_STYLE[t.cls]}>
                                  {t.text}
                                </span>
                              ))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
