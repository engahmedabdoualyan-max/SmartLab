import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dict } from "./types";
import { en } from "./en";
import { ar } from "./ar";
import { fr } from "./fr";
import { de } from "./de";
import { ru } from "./ru";
import { hi } from "./hi";
import { ur } from "./ur";
import { zh } from "./zh";
import { ja } from "./ja";

export type { Dict } from "./types";

export const DICTS: Record<string, Dict> = { en, ar, ru, fr, ur, hi, zh, ja, de };

/** الترتيب المطلوب: الإنجليزية أساسية، ثم العربية، ثم البقية */
export const LANG_ORDER = ["en", "ar", "ru", "fr", "ur", "hi", "zh", "ja", "de"];

const STORAGE_KEY = "cct150.lang";

function detect(): string {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && DICTS[saved]) return saved;
  const nav = (navigator.language || "en").toLowerCase();
  const base = nav.split("-")[0];
  if (DICTS[base]) return base;
  return "en";
}

interface Ctx {
  lang: string;
  t: Dict;
  dir: "ltr" | "rtl";
  setLang: (l: string) => void;
}

const I18nCtx = createContext<Ctx>({ lang: "en", t: en, dir: "ltr", setLang: () => {} });

export const useI18n = () => useContext(I18nCtx);
export const useT = () => useContext(I18nCtx).t;

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(() => detect());
  const t = DICTS[lang] ?? en;

  const setLang = useCallback((l: string) => {
    if (!DICTS[l]) return;
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = t.code;
    root.dir = t.dir;
  }, [t]);

  const value = useMemo(() => ({ lang, t, dir: t.dir, setLang }), [lang, t, setLang]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}
