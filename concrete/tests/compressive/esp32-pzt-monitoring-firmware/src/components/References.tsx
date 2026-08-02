/* ================================================================ *
 *  References.tsx — smartLAB scientific bibliography viewer
 *
 *  Category tabs + live search + DOI links + BibTeX export.
 *  All entries are real, DOI-verified publications / standards.
 * ================================================================ */

import { useMemo, useState } from "react";
import { useLang } from "../i18n";
import { cn } from "../utils/cn";
import {
  REFERENCES,
  REF_CATEGORIES,
  allBibTeX,
  toBibTeX,
  type RefCategory,
  type Reference,
} from "../references";

const CAT_TONE: Record<RefCategory, { dot: string; text: string; border: string }> = {
  foundation: { dot: "bg-copper",  text: "text-copper",  border: "border-copperdim" },
  aggregate:  { dot: "bg-signal",  text: "text-signal",  border: "border-signaldeep" },
  earlyage:   { dot: "bg-teal",    text: "text-teal",    border: "border-teal/50" },
  ai:         { dot: "bg-alarmhi", text: "text-alarmhi", border: "border-alarm/50" },
  standard:   { dot: "bg-mute",    text: "text-mute",    border: "border-line2" },
};

function copy(text: string): void {
  navigator.clipboard?.writeText(text).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch { /* ignore */ }
    document.body.removeChild(ta);
  });
}

function download(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ── single reference card ──────────────────────────────────────── */
function RefCard({ r, index }: { r: Reference; index: number }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const tone = CAT_TONE[r.category];

  const doCopy = () => {
    copy(toBibTeX(r));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article
      className={cn(
        "border border-line bg-scope/25 p-4 transition-all duration-200 hover:border-copperdim hover:bg-raise/25",
        r.seminal && "border-l-2 border-l-copper"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="font-mono text-[10px] text-dim/70 tabular-nums pt-0.5 shrink-0 w-6">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          {/* meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={cn("inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em]", tone.border, tone.text)}>
              <span className={cn("w-1 h-1", tone.dot)} />
              {t(`ref.cat.${r.category}` as Parameters<typeof t>[0])}
            </span>
            <span className="font-mono text-[10px] text-copper tabular-nums">{r.year}</span>
            {r.seminal && (
              <span className="border border-copperdim bg-copper/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-copper">
                ★ {t("ref.seminal")}
              </span>
            )}
          </div>

          {/* title */}
          <h3 className="font-body text-[13.5px] leading-snug text-paper mb-1">
            {r.title}
          </h3>

          {/* authors + venue */}
          <div className="font-mono text-[10.5px] text-mute leading-relaxed">
            {r.authors}
          </div>
          <div className="font-mono text-[10.5px] text-dim italic">
            {r.venue}{r.detail ? `, ${r.detail}` : ""}
          </div>

          {/* relevance note */}
          <p className="mt-2 border-s-2 border-line ps-2.5 font-body text-[11.5px] leading-relaxed text-mute/85">
            {r.note}
          </p>

          {/* actions */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {r.doi && (
              <a
                href={`https://doi.org/${r.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 border border-line px-2 py-1 font-mono text-[9.5px] text-teal hover:border-teal/60 hover:bg-teal/8 transition-colors"
              >
                <svg viewBox="0 0 14 14" className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M5.5 8.5a2.5 2.5 0 0 0 3.6 0l2.4-2.4a2.55 2.55 0 0 0-3.6-3.6l-.6.6" />
                  <path d="M8.5 5.5a2.5 2.5 0 0 0-3.6 0L2.5 7.9a2.55 2.55 0 0 0 3.6 3.6l.6-.6" />
                </svg>
                doi:{r.doi}
              </a>
            )}
            {!r.doi && r.url && (
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-line px-2 py-1 font-mono text-[9.5px] text-teal hover:border-teal/60 transition-colors">
                {t("ref.publisher")} ↗
              </a>
            )}
            <button
              onClick={doCopy}
              className={cn(
                "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[9.5px] transition-colors",
                copied ? "border-signaldeep bg-signal/10 text-signal" : "border-line text-dim hover:text-copper hover:border-copperdim"
              )}
            >
              {copied ? `✓ ${t("ref.copied")}` : t("ref.bibtex")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── main section ───────────────────────────────────────────────── */
export default function References() {
  const { t } = useLang();
  const [cat, setCat] = useState<RefCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [allCopied, setAllCopied] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REFERENCES
      .filter(r => cat === "all" || r.category === cat)
      .filter(r =>
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.authors.toLowerCase().includes(q) ||
        r.venue.toLowerCase().includes(q) ||
        String(r.year).includes(q)
      )
      .sort((a, b) => b.year - a.year);
  }, [cat, query]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: REFERENCES.length };
    for (const r of REFERENCES) m[r.category] = (m[r.category] ?? 0) + 1;
    return m;
  }, []);

  const copyAll = () => {
    copy(allBibTeX());
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <section className="panel panel-corner overflow-hidden" aria-label={t("ref.title")}>
      {/* header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 border-b border-line bg-raise/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center border border-copperdim bg-copper/10 shrink-0">
            <svg viewBox="0 0 20 20" className="w-4.5 h-4.5 text-copper" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3.5h5.5A2.5 2.5 0 0 1 11 6v11a2 2 0 0 0-2-2H3z" />
              <path d="M17 3.5h-5.5A2.5 2.5 0 0 0 9 6v11a2 2 0 0 1 2-2h6z" />
            </svg>
          </div>
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-copper">{t("ref.kicker")}</div>
            <div className="font-display font-bold text-[18px] text-paper tracking-wide">{t("ref.title")}</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[10px] text-dim">
            {REFERENCES.length} {t("ref.entries")}
          </span>
          <button
            onClick={copyAll}
            className={cn("border px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
              allCopied ? "border-signaldeep bg-signal/10 text-signal" : "border-line2 text-mute hover:text-copper hover:border-copperdim")}
          >
            {allCopied ? `✓ ${t("ref.copied")}` : t("ref.copyall")}
          </button>
          <button
            onClick={() => download(allBibTeX(), "smartlab_references.bib")}
            className="border border-copperdim bg-copper/10 px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-copper hover:bg-copper/20 transition-colors"
          >
            .bib ↓
          </button>
        </div>
      </div>

      {/* subtitle */}
      <div className="px-5 pt-4">
        <p className="text-[13px] text-mute leading-relaxed max-w-3xl">{t("ref.subtitle")}</p>
      </div>

      {/* filters */}
      <div className="px-5 pt-4 flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-1.5" dir="ltr">
          {REF_CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "border px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors",
                cat === c.id
                  ? "border-copper bg-copper/12 text-copper"
                  : "border-line text-dim hover:text-mute hover:border-line2"
              )}
            >
              {t(c.labelKey as Parameters<typeof t>[0])}
              <span className="ms-1.5 text-[8.5px] opacity-70">{counts[c.id] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative ms-auto min-w-[180px]">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t("ref.search")}
            className="w-full bg-scope border border-line ps-7 pe-3 py-1.5 font-mono text-[11px] text-paper placeholder:text-dim/50 focus:outline-none focus:border-copperdim transition-colors"
          />
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 absolute start-2 top-1/2 -translate-y-1/2 text-dim pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" />
          </svg>
        </div>
      </div>

      {/* list */}
      <div className="p-5 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="border border-line bg-scope/20 px-6 py-10 text-center font-body text-[13px] text-mute">
            {t("ref.none")}
          </div>
        ) : (
          filtered.map((r, i) => <RefCard key={r.id} r={r} index={i} />)
        )}
      </div>

      {/* footer note */}
      <div className="border-t border-line px-4 py-2.5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[9px] text-dim/75">
        <span>{t("ref.footer")}</span>
        <span className="ms-auto">DOI resolver: doi.org</span>
      </div>
    </section>
  );
}
