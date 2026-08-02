import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { cn } from "./utils/cn";

/* ── motion preferences ─────────────────────────────────────────── */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

/* ── scramble / decode title ────────────────────────────────────── */
const GLYPHS = "▓▒░<>/\\|=+*#01ZKXP";
export function useScramble(text: string, delay = 120): string {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(reduced ? text : "");
  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    let frame = 0;
    let raf = 0;
    let started = false;
    const t = window.setTimeout(() => {
      started = true;
      const step = () => {
        frame++;
        const resolved = Math.floor(frame / 3);
        let s = "";
        for (let i = 0; i < text.length; i++) {
          if (i < resolved) s += text[i];
          else if (text[i] === " ") s += " ";
          else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setOut(s);
        if (resolved <= text.length) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      window.clearTimeout(t);
      if (started) cancelAnimationFrame(raf);
    };
  }, [text, delay, reduced]);
  return out;
}

/* ── scroll reveal ──────────────────────────────────────────────── */
export function Reveal({
  children,
  className,
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            el.classList.add("in");
            io.disconnect();
          }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style: CSSProperties | undefined = delay
    ? { transitionDelay: `${delay}ms` }
    : undefined;
  return (
    <div ref={ref} id={id} className={cn("rvl", className)} style={style}>
      {children}
    </div>
  );
}

/* ── section chrome ─────────────────────────────────────────────── */
export function SectionHead({
  no,
  title,
  kicker,
  blurb,
}: {
  no: string;
  title: string;
  kicker: string;
  blurb: string;
}) {
  return (
    <Reveal className="mb-10">
      <div className="flex items-end gap-5 md:gap-8">
        <div className="font-display text-5xl md:text-7xl font-bold leading-none text-transparent select-none"
          style={{ WebkitTextStroke: "1.5px rgba(222,154,60,0.55)" }}>
          {no}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[11px] tracking-[0.28em] text-copper uppercase mb-1.5">
            {kicker}
          </div>
          <h2 className="font-display font-semibold text-2xl md:text-4xl uppercase tracking-wide text-paper leading-tight">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm md:text-[15px] leading-relaxed text-mute">
            {blurb}
          </p>
        </div>
        <div className="hidden md:block flex-1 max-w-[220px] h-px bg-line2 relative mb-3">
          <span className="absolute -right-1 -top-[3px] w-[7px] h-[7px] bg-copper rotate-45" />
        </div>
      </div>
    </Reveal>
  );
}

/* ── collapsible long section ───────────────────────────────────── *
 *  Used by the very long "Source delivery" and "References" blocks.
 *  Collapsed by default; the whole header row is the toggle.
 *
 *  Auto-opens when the URL hash targets this section — or any anchor
 *  it owns (e.g. the #fw-* firmware sub-anchors the ⌘K palette jumps
 *  to) — otherwise those deep links would resolve to nothing while
 *  the body is unmounted.
 * ---------------------------------------------------------------- */
export function CollapsibleSection({
  no,
  kicker,
  title,
  blurb,
  sectionId,
  ownedHashPrefixes = [],
  labelExpand,
  labelCollapse,
  summary,
  defaultOpen = false,
  children,
}: {
  no: string;
  kicker: string;
  title: string;
  blurb: string;
  sectionId: string;
  ownedHashPrefixes?: string[];
  labelExpand: string;
  labelCollapse: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduced = useReducedMotion();

  useEffect(() => {
    const owns = (hash: string): boolean => {
      const h = hash.replace(/^#/, "");
      if (!h) return false;
      if (h === sectionId) return true;
      return ownedHashPrefixes.some(p => h.startsWith(p));
    };

    const sync = () => {
      if (!owns(window.location.hash)) return;
      setOpen(true);
      // let the body mount before scrolling to the deep anchor
      window.setTimeout(() => {
        const el = document.getElementById(
          window.location.hash.replace(/^#/, "")
        );
        el?.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });
      }, 90);
    };

    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, reduced]);

  return (
    <>
      <Reveal className={open ? "mb-10" : "mb-0"}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={`${sectionId}-body`}
          className={cn(
            "w-full text-start flex items-end gap-5 md:gap-8 group",
            "border-b border-transparent hover:border-line/60 transition-colors duration-200",
            !open && "pb-5"
          )}
        >
          <div
            className="font-display text-5xl md:text-7xl font-bold leading-none text-transparent select-none shrink-0"
            style={{ WebkitTextStroke: "1.5px rgba(222,154,60,0.55)" }}
          >
            {no}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-mono text-[11px] tracking-[0.28em] text-copper uppercase mb-1.5">
              {kicker}
            </div>
            <h2 className="font-display font-semibold text-2xl md:text-4xl uppercase tracking-wide text-paper leading-tight">
              {title}
            </h2>
            {open ? (
              <p className="mt-2 max-w-2xl text-sm md:text-[15px] leading-relaxed text-mute">
                {blurb}
              </p>
            ) : (
              summary && (
                <p className="mt-2 font-mono text-[11.5px] text-dim">{summary}</p>
              )
            )}
          </div>

          {/* toggle chevron */}
          <span
            className={cn(
              "shrink-0 mb-1 flex items-center gap-2.5 border px-3 py-2 transition-colors duration-200",
              open
                ? "border-copperdim bg-copper/10 text-copper"
                : "arrow-flash border-copperdim/70 bg-copper/5 text-copper group-hover:border-copperdim group-hover:text-copper"
            )}
          >
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.14em]">
              {open ? labelCollapse : labelExpand}
            </span>
            <svg
              viewBox="0 0 16 16"
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                open ? "rotate-180" : "rotate-0"
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 6 5 5 5-5" />
            </svg>
          </span>
        </button>
      </Reveal>

      {open && (
        <div
          id={`${sectionId}-body`}
          style={
            reduced
              ? undefined
              : { animation: "sectionUnfold 0.32s cubic-bezier(0.22,1,0.36,1)" }
          }
        >
          {children}
        </div>
      )}
    </>
  );
}

/* ── tiny status LED ────────────────────────────────────────────── */
export function Led({
  tone = "signal",
  live = true,
  size = 8,
  className,
}: {
  tone?: "signal" | "copper" | "alarm" | "dim";
  live?: boolean;
  size?: number;
  className?: string;
}) {
  const color =
    tone === "signal"
      ? "var(--color-signal)"
      : tone === "alarm"
      ? "var(--color-alarm)"
      : tone === "copper"
      ? "var(--color-copper)"
      : "var(--color-dim)";
  return (
    <span
      className={cn("inline-block rounded-full", live && "led-live", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        color,
        boxShadow: `0 0 8px 1px ${color}`,
      }}
    />
  );
}

/* ── mono chip ──────────────────────────────────────────────────── */
export function Chip({ children, tone = "line" }: { children: ReactNode; tone?: "line" | "copper" | "signal" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase",
        tone === "copper" && "border-copperdim text-copper",
        tone === "signal" && "border-signaldeep text-signal",
        tone === "line" && "border-line2 text-mute"
      )}
    >
      {children}
    </span>
  );
}
