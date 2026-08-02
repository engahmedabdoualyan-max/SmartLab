/* ================================================================ *
 *  SearchModal.tsx — smartLAB command palette (⌘K / Ctrl-K)
 *
 *  Searches sections, quick actions, pin contract, glossary,
 *  firmware source sections and the DOI bibliography.
 *  Full keyboard control: ↑ ↓ Enter Esc.
 * ================================================================ */

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../i18n";
import { cn } from "../utils/cn";
import {
  buildSearchIndex,
  searchCorpus,
  type HitKind,
  type SearchHit,
} from "../searchIndex";

const KIND_META: Record<HitKind, { labelKey: string; cls: string; icon: string }> = {
  section:   { labelKey: "search.k.section",   cls: "text-copper border-copperdim",  icon: "§" },
  action:    { labelKey: "search.k.action",    cls: "text-signal border-signaldeep", icon: "▸" },
  firmware:  { labelKey: "search.k.firmware",  cls: "text-teal border-teal/50",      icon: "{}" },
  reference: { labelKey: "search.k.reference", cls: "text-alarmhi border-alarm/45",  icon: "❝" },
  pin:       { labelKey: "search.k.pin",       cls: "text-copperhi border-copperdim",icon: "⎓" },
  glossary:  { labelKey: "search.k.glossary",  cls: "text-mute border-line2",        icon: "≡" },
};

/* highlight matched substrings without dangerouslySetInnerHTML */
function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <>{text}</>;
  const pattern = terms
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length)
    .join("|");
  let re: RegExp;
  try { re = new RegExp(`(${pattern})`, "ig"); } catch { return <>{text}</>; }
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        terms.includes(p.toLowerCase())
          ? <mark key={i} className="bg-copper/25 text-copperhi rounded-[2px] px-[1px]">{p}</mark>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const corpus = useMemo(() => buildSearchIndex(), []);
  const resolveTitle = useMemo(
    () => (h: SearchHit) => (h.titleIsKey ? t(h.title as Parameters<typeof t>[0]) : h.title),
    [t]
  );

  const results = useMemo(
    () => searchCorpus(corpus, query, resolveTitle),
    [corpus, query, resolveTitle]
  );

  /* reset + focus on open */
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  /* lock body scroll while open */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const go = (hit: SearchHit) => {
    onClose();
    window.setTimeout(() => {
      const el = document.querySelector(hit.href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.location.hash = hit.href;
    }, 90);
  };

  /* keyboard nav */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (results.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(a => (a + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(a => (a - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const hit = results[active];
        if (hit) go(hit);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, active]);

  /* keep the active row in view */
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[8vh] pb-8"
      role="dialog"
      aria-modal="true"
      aria-label={t("search.title")}
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(6,10,8,0.58)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* palette */}
      <div
        className="relative w-full max-w-[680px] panel panel-corner overflow-hidden shadow-2xl"
        style={{ animation: "paletteIn 0.16s cubic-bezier(0.22,1,0.36,1)" }}
        dir="ltr"
      >
        {/* input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
          <svg viewBox="0 0 18 18" className="w-4 h-4 text-copper shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="8" cy="8" r="5.2" /><path d="m12 12 3.6 3.6" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent font-mono text-[13.5px] text-paper placeholder:text-dim/60 focus:outline-none"
          />
          <kbd className="border border-line px-1.5 py-0.5 font-mono text-[9.5px] text-dim">ESC</kbd>
        </div>

        {/* results */}
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="px-4 py-8 text-center">
              <div className="font-mono text-[11px] text-dim mb-3">{t("search.hint")}</div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {["RMSD", "GPIO25", "ASTM C1074", "Plowman", "PDF", "smart aggregate"].map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="border border-line px-2 py-1 font-mono text-[10px] text-mute hover:text-copper hover:border-copperdim transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-10 text-center font-body text-[13px] text-mute">
              {t("search.none")} <span className="font-mono text-copper">"{query}"</span>
            </div>
          ) : (
            results.map((hit, i) => {
              const meta = KIND_META[hit.kind];
              const title = resolveTitle(hit);
              return (
                <button
                  key={hit.id}
                  data-idx={i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(hit)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-2.5 text-left border-b border-line/40 last:border-0 transition-colors",
                    i === active ? "bg-copper/10" : "hover:bg-raise/40"
                  )}
                >
                  <span className={cn(
                    "mt-0.5 w-6 h-6 shrink-0 flex items-center justify-center border font-mono text-[10px]",
                    meta.cls
                  )}>
                    {meta.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-body text-[13px] text-paper leading-snug truncate">
                      <Highlight text={title} query={query} />
                    </span>
                    <span className="block font-mono text-[10.5px] text-dim leading-snug truncate mt-0.5">
                      <Highlight text={hit.subtitle} query={query} />
                    </span>
                  </span>
                  <span className={cn(
                    "shrink-0 font-mono text-[8.5px] uppercase tracking-[0.14em] px-1.5 py-0.5 border self-center",
                    meta.cls
                  )}>
                    {t(meta.labelKey as Parameters<typeof t>[0])}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* footer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 border-t border-line bg-raise/25 font-mono text-[9.5px] text-dim">
          <span><kbd className="text-mute">↑↓</kbd> {t("search.nav")}</span>
          <span><kbd className="text-mute">⏎</kbd> {t("search.open")}</span>
          <span><kbd className="text-mute">esc</kbd> {t("search.close")}</span>
          {results.length > 0 && (
            <span className="ml-auto">{results.length} {t("search.results")}</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes paletteIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0)     scale(1); }
        }
      `}</style>
    </div>
  );
}
