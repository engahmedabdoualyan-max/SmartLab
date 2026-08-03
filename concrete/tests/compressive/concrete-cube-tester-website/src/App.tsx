import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import Home from "@/pages/Home";
import Firmware from "@/pages/Firmware";
import { ToastProvider } from "@/components/ui";
import { IconPrint } from "@/components/icons";
import { I18nProvider, useI18n, DICTS, LANG_ORDER } from "@/i18n";

type Page = "home" | "firmware";

const SECTION_IDS = ["idea", "components", "wiring", "mechanical", "math", "models", "calibration", "safety"];

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="h-9 w-9 shrink-0">
      <rect width="32" height="32" rx="5" fill="#e8590c" />
      <rect x="8" y="8" width="16" height="16" rx="1" fill="#16222e" />
      <path
        d="M16 8 L13.5 14 L18 17.5 L15 24"
        stroke="#e8590c"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ================= مبدّل اللغة ================= */

function LangSwitch() {
  const { lang, t, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="no-print relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title={t.ui.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 text-[13px] font-semibold transition-colors",
          open ? "border-safety bg-safety text-white" : "border-white/20 text-paper/85 hover:border-safety-hi hover:text-safety-hi",
        )}
      >
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9S14.6 18.4 12 21c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z" />
        </svg>
        <span className="hidden sm:inline">{t.native}</span>
        <span className="sm:hidden">{lang.toUpperCase()}</span>
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.4}>
          <path d="M5 9l7 7 7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute end-0 top-[calc(100%+6px)] z-[95] w-52 border-2 border-safety bg-ink py-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
        >
          <p className="border-b border-white/10 px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
            {t.ui.language}
          </p>
          {LANG_ORDER.map((code) => {
            const d = DICTS[code];
            const active = code === lang;
            return (
              <button
                key={code}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-start text-[14px] transition-colors",
                  active ? "bg-safety/20 font-bold text-safety-hi" : "text-paper/85 hover:bg-white/10",
                )}
              >
                <span className="text-base leading-none">{d.flag}</span>
                <span className="flex-1" dir={d.dir}>
                  {d.native}
                </span>
                <span className="bidi font-mono text-[10px] tracking-widest text-steel">{code.toUpperCase()}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-safety" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================= الهيكل ================= */

function Shell() {
  const { t } = useI18n();
  const [page, setPage] = useState<Page>("home");
  const [active, setActive] = useState<string>("idea");

  const go = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  useEffect(() => {
    document.title =
      page === "home"
        ? `${t.hero.t1} ${t.hero.t2} — Arduino + HX711`
        : `${t.fw.t1} ${t.fw.t2} — Arduino`;
  }, [page, t]);

  useEffect(() => {
    if (page !== "home") return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [page]);

  return (
    <div className="min-h-screen">
      {/* ===== الشريط العلوي ===== */}
      <nav className="no-print sticky top-0 z-[80] border-b-2 border-safety bg-ink text-paper shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 md:px-6">
          <button onClick={() => go("home")} className="flex cursor-pointer items-center gap-2.5 text-start">
            <Logo />
            <span className="hidden sm:block">
              <span className="block font-display text-base font-bold leading-tight">{t.brand.name}</span>
              <span className="bidi block font-mono text-[9px] tracking-[0.28em] text-steel">{t.brand.sub}</span>
            </span>
          </button>

          <div className="ms-auto flex items-center gap-1.5">
            <button
              onClick={() => go("home")}
              className={cn(
                "hidden cursor-pointer border px-3.5 py-1.5 font-display text-[14px] font-semibold transition-colors sm:block",
                page === "home"
                  ? "border-safety bg-safety text-white"
                  : "border-white/20 text-paper/85 hover:border-safety-hi hover:text-safety-hi",
              )}
            >
              {t.ui.guide}
            </button>
            <button
              onClick={() => go("firmware")}
              className={cn(
                "cursor-pointer border px-3.5 py-1.5 font-display text-[14px] font-semibold transition-colors",
                page === "firmware"
                  ? "border-safety bg-safety text-white"
                  : "border-white/20 text-paper/85 hover:border-safety-hi hover:text-safety-hi",
              )}
            >
              {t.ui.firmware}
            </button>
            <LangSwitch />
            <button
              onClick={() => window.print()}
              title={t.ui.print}
              className="grid h-9 w-9 cursor-pointer place-items-center border border-white/20 text-paper/85 transition-colors hover:border-safety-hi hover:text-safety-hi"
            >
              <IconPrint size={17} />
            </button>
          </div>
        </div>

        {/* روابط الأقسام */}
        {page === "home" && (
          <div className="border-t border-white/10 bg-ink-2/80">
            <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5 md:px-6 [scrollbar-width:none]">
              {SECTION_IDS.map((id, i) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={cn(
                    "relative shrink-0 px-3 py-1.5 text-[13px] font-medium transition-colors",
                    active === id ? "font-bold text-safety-hi" : "text-paper/70 hover:text-paper",
                  )}
                >
                  {t.nav[i]}
                  <span
                    className={cn(
                      "absolute inset-x-2 -bottom-[7px] h-[3px] bg-safety transition-opacity",
                      active === id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ===== المحتوى ===== */}
      {page === "home" ? <Home onFirmware={() => go("firmware")} /> : <Firmware onHome={() => go("home")} />}

      {/* ===== التذييل ===== */}
      <footer className="border-t-4 border-safety bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo />
              <p className="font-display text-lg font-bold">{t.brand.name}</p>
            </div>
            <p className="mt-3 text-[13.5px] leading-7 text-paper/70">{t.footer.about}</p>
          </div>
          <div className="no-print">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-steel">{t.footer.sectionsT}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {SECTION_IDS.map((id, i) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page !== "home") go("home");
                    window.setTimeout(
                      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
                      page !== "home" ? 80 : 0,
                    );
                  }}
                  className="cursor-pointer text-[13.5px] text-paper/70 transition-colors hover:text-safety-hi"
                >
                  ◂ {t.nav[i]}
                </a>
              ))}
              <button
                onClick={() => go("firmware")}
                className="cursor-pointer text-start text-[13.5px] text-paper/70 transition-colors hover:text-safety-hi"
              >
                ◂ {t.ui.firmware}
              </button>
            </div>
          </div>
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-steel">{t.footer.sourcesT}</p>
            <p className="text-[13px] leading-7 text-paper/70">{t.footer.sourcesText}</p>
          </div>
        </div>
        <div className="hazard h-2.5" />
        <div className="bg-black/30">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-[12px] text-paper/55 md:flex-row md:px-6 md:text-start">
            <p className="font-semibold text-paper/80">{t.footer.disclaimer}</p>
            <p className="bidi font-mono text-[11px] tracking-widest">CCT-150 · ARDUINO + HX711 · 150×150×150</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </I18nProvider>
  );
}
