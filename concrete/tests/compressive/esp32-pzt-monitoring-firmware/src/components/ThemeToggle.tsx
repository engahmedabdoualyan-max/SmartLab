/* ================================================================ *
 *  ThemeToggle.tsx — dark / light switch for the smartLAB workspace
 * ================================================================ */

import { useLang } from "../i18n";
import { useTheme } from "../theme";
import { cn } from "../utils/cn";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useLang();
  const light = theme === "light";

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={light}
      aria-label={t("theme.toggle")}
      title={light ? t("theme.dark") : t("theme.light")}
      className={cn(
        "relative w-[52px] h-[26px] border shrink-0 transition-colors duration-300 overflow-hidden",
        light
          ? "border-copperdim bg-copper/12"
          : "border-line2 bg-scope/60 hover:border-copperdim"
      )}
      dir="ltr"
    >
      {/* track icons */}
      <svg
        viewBox="0 0 20 20"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 left-[5px] w-3.5 h-3.5 transition-opacity duration-300",
          light ? "opacity-100 text-copper" : "opacity-35 text-dim"
        )}
        fill="none" stroke="currentColor" strokeWidth="1.7"
      >
        <circle cx="10" cy="10" r="3.6" />
        <path d="M10 1.6v2.2M10 16.2v2.2M18.4 10h-2.2M3.8 10H1.6M16 4l-1.6 1.6M5.6 14.4 4 16M16 16l-1.6-1.6M5.6 5.6 4 4" strokeLinecap="round" />
      </svg>
      <svg
        viewBox="0 0 20 20"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 right-[5px] w-3.5 h-3.5 transition-opacity duration-300",
          light ? "opacity-35 text-dim" : "opacity-100 text-signal"
        )}
        fill="none" stroke="currentColor" strokeWidth="1.7"
      >
        <path d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7 7 0 1 0 8.9 8.9z" strokeLinejoin="round" />
      </svg>

      {/* knob */}
      <span
        className={cn(
          "absolute top-[3px] w-[18px] h-[18px] transition-transform duration-300 ease-out",
          light ? "translate-x-[3px] bg-copper" : "translate-x-[31px] bg-signal"
        )}
        style={{ boxShadow: "0 0 8px 0 currentColor" }}
      />
    </button>
  );
}
