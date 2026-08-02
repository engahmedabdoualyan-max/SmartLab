/* ------------------------------------------------------------------ *
 *  LangPicker.tsx — smartLAB language selector dropdown
 *  Accessible, keyboard-navigable, RTL-aware, HUD-styled.
 * ------------------------------------------------------------------ */

import { useEffect, useRef, useState } from "react";
import { LANGUAGES, useLang, type LangCode } from "../i18n";
import { cn } from "../utils/cn";

export default function LangPicker() {
  const { lang, setLang, t, meta } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const select = (code: LangCode) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative shrink-0" dir="ltr">
      {/* trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.label")}
        className={cn(
          "flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[10.5px] tracking-[0.12em] uppercase transition-all duration-200",
          open
            ? "border-copperdim bg-copper/15 text-copper"
            : "border-line2 text-mute hover:border-copperdim hover:text-copper"
        )}
      >
        {/* Globe icon */}
        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="10" cy="10" r="8" />
          <path d="M10 2c-2.5 3-4 5-4 8s1.5 5 4 8" />
          <path d="M10 2c2.5 3 4 5 4 8s-1.5 5-4 8" />
          <path d="M2 10h16" />
          <path d="M2 6h16M2 14h16" />
        </svg>
        <span className="hidden sm:inline">{meta.flag} {meta.label}</span>
        <span className="sm:hidden">{meta.flag}</span>
        <svg
          viewBox="0 0 10 6"
          className={cn("w-2.5 h-2.5 shrink-0 transition-transform duration-200", open && "rotate-180")}
          fill="none" stroke="currentColor" strokeWidth="1.6"
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {/* dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label={t("lang.select")}
          className="absolute right-0 top-full mt-1.5 w-[176px] border border-copperdim bg-panel shadow-2xl shadow-black/60 z-[100] overflow-hidden"
          style={{ animation: "fadeInDown 0.14s ease" }}
        >
          {/* dropdown header */}
          <div className="px-3 py-2 border-b border-line font-mono text-[9px] tracking-[0.22em] uppercase text-dim">
            {t("lang.select")}
          </div>

          {/* language options */}
          {LANGUAGES.map(l => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                role="option"
                aria-selected={active}
                onClick={() => select(l.code)}
                dir={l.dir}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-150",
                  active
                    ? "bg-copper/12 text-copper"
                    : "hover:bg-raise/60 text-mute hover:text-paper"
                )}
              >
                <span className="text-base leading-none shrink-0">{l.flag}</span>
                <span className="font-body text-[13px] leading-snug flex-1">{l.label}</span>
                {active && (
                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-copper shrink-0" fill="currentColor">
                    <path d="M1 6l3.5 3.5L11 2" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}
