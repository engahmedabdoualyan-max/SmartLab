/* ------------------------------------------------------------------ *
 *  theme.tsx — smartLAB dark / light workspace theme
 *
 *  Writes data-theme onto <html>; index.css carries the light palette
 *  override. Dark is the default for every first-time visitor;
 *  light mode is an explicit opt-in persisted to localStorage.
 * ------------------------------------------------------------------ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "dark" | "light";

const KEY = "smartlab-theme";

/* Dark is the canonical smartLAB workspace theme.
 * The OS `prefers-color-scheme` hint is deliberately NOT consulted:
 * a first-time visitor always lands on dark. Light mode is an
 * explicit opt-in and is only restored from an earlier user choice. */
function initialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch { /* private mode — fall through to the dark default */ }
  return "dark";
}

interface ThemeCtx {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({
  theme: "dark",
  setTheme: () => undefined,
  toggle: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    try { localStorage.setItem(KEY, t); } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setThemeState(prev => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
