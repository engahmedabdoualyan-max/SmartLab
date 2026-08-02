/* ================================================================ *
 *  BackToTop.tsx — floating scroll-to-top control
 *  Renders a live scroll-progress ring; appears past 600 px.
 * ================================================================ */

import { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { useReducedMotion } from "../ui";
import { cn } from "../utils/cn";

export default function BackToTop() {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setVisible(y > 600);
        setProgress(max > 0 ? Math.min(1, y / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const R = 20;
  const C = 2 * Math.PI * R;

  return (
    <button
      onClick={toTop}
      aria-label={t("top.label")}
      title={t("top.label")}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed z-[90] bottom-5 end-5 w-12 h-12 grid place-items-center",
        "border border-copperdim bg-panel/90 backdrop-blur-sm",
        "transition-all duration-300 group",
        "hover:border-copper hover:bg-copper/12",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      )}
    >
      {/* progress ring */}
      <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r={R} fill="none" stroke="var(--color-line)" strokeWidth="2" />
        <circle
          cx="24" cy="24" r={R} fill="none"
          stroke="var(--color-copper)" strokeWidth="2" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          style={{ transition: "stroke-dashoffset 0.12s linear" }}
        />
      </svg>

      {/* arrow */}
      <svg
        viewBox="0 0 20 20"
        className="relative w-4 h-4 text-copper transition-transform duration-200 group-hover:-translate-y-0.5"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M10 16V5" />
        <path d="m5 10 5-5 5 5" />
      </svg>

      {/* percentage badge */}
      <span className="absolute -top-1.5 -start-1.5 min-w-[22px] h-[16px] px-1 grid place-items-center border border-line bg-panel font-mono text-[8.5px] text-dim tabular-nums">
        {Math.round(progress * 100)}
      </span>
    </button>
  );
}
