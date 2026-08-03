import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import { IconCheck, IconCopy, IconDownload } from "./icons";
import type { TableT } from "@/i18n/types";
import { useT } from "@/i18n";

/* ================= Toast ================= */

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const idRef = useRef(0);

  const push = useCallback((msg: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, msg }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap no-print fixed bottom-6 left-6 z-[90] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-in flex items-center gap-2.5 border border-ok/40 bg-ink px-4 py-2.5 text-sm font-medium text-paper shadow-lg"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-ok text-white">
              <IconCheck size={12} strokeWidth={3} />
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ================= Reveal ================= */

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ================= Section header ================= */

export function SectionHead({ num, title, en }: { num: string; title: string; en: string }) {
  return (
    <div className="mb-8 flex items-end gap-4 md:mb-10">
      <div className="font-mono text-sm font-semibold text-safety md:text-base">
        <span className="mb-2 block h-[3px] w-8 bg-safety" />
        {num}
      </div>
      <div className="min-w-0 flex-1 border-b-2 border-ink/15 pb-3">
        <h2 className="font-display text-3xl font-bold leading-tight text-navy md:text-4xl">{title}</h2>
        <p className="bidi mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-steel">{en}</p>
      </div>
    </div>
  );
}

export function Section({
  id,
  num,
  title,
  en,
  intro,
  children,
  className,
}: {
  id: string;
  num: string;
  title: string;
  en: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-14 md:py-20", className)}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionHead num={num} title={title} en={en} />
          {intro && <p className="-mt-3 mb-8 max-w-3xl leading-8 text-ink-2/90 md:text-lg">{intro}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/* ================= Wire Table ================= */

export function WireTableView({ t, chips }: { t: TableT; chips?: string[] }) {
  return (
    <div className="overflow-hidden border-2 border-ink/15 bg-card">
      <div className="border-b-2 border-ink/15 bg-navy px-4 py-2.5">
        <h4 className="font-display text-base font-semibold text-paper">{t.title}</h4>
      </div>
      {t.note && (
        <p className="border-b border-amber/30 bg-amber/10 px-4 py-2.5 text-[13px] leading-6 text-amber">
          ⚠ {t.note}
        </p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ink/[0.05] font-mono text-[12px] text-steel">
            {t.cols.map((c) => (
              <th key={c} className="px-4 py-2 text-start font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, i) => (
            <tr key={i} className={cn("border-t border-ink/10", i % 2 === 1 && "bg-ink/[0.025]")}>
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={cn("px-4 py-2.5 text-start", j === r.length - 1 && "font-mono font-semibold text-navy")}
                >
                  {chips && j === 0 && chips[i] && (
                    <span
                      className="me-2 inline-block h-3 w-3 rounded-[3px] border border-ink/30 align-middle"
                      style={{ background: chips[i] }}
                    />
                  )}
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================= Code Panel ================= */

function highlight(code: string): ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, i) => {
    let node: ReactNode = line;
    if (/^\s*\/\*/.test(line) || /^\s*\*/.test(line) || line.includes("//")) {
      const idx = line.indexOf("//");
      if (/^\s*\/\*/.test(line) || /^\s*\*/.test(line)) {
        node = <span className="cm">{line}</span>;
      } else if (idx >= 0) {
        node = (
          <>
            {line.slice(0, idx)}
            <span className="cm">{line.slice(idx)}</span>
          </>
        );
      }
    }
    return (
      <div key={i} className="table-row">
        <span className="table-cell w-10 select-none pr-4 text-right text-[#3d5368]">{i + 1}</span>
        <span className="table-cell whitespace-pre">{node}</span>
      </div>
    );
  });
}

export function CodePanel({
  file,
  chip,
  chipColor,
  desc,
  code,
  notes,
}: {
  file: string;
  chip: string;
  chipColor: string;
  desc: string;
  code: string;
  notes: string[];
}) {
  const toast = useToast();
  const tr = useT();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast(tr.ui.copied);
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file;
    a.click();
    URL.revokeObjectURL(url);
    toast(`${tr.ui.downloading} ${file}`);
  };

  return (
    <Reveal>
      <div className="overflow-hidden border-2 border-ink/80 bg-codebg hs">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-ink-2 px-4 py-3">
          <span
            className="rounded-[3px] px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-white"
            style={{ background: chipColor }}
          >
            {chip}
          </span>
          <div className="min-w-0 flex-1">
            <p className="bidi truncate font-mono text-sm font-semibold text-paper">{file}</p>
            <p className="text-[12px] text-steel">{desc}</p>
          </div>
          <div className="no-print flex gap-2">
            <button
              onClick={copy}
              className="flex cursor-pointer items-center gap-1.5 border border-white/20 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-paper transition-colors hover:border-safety hover:bg-safety hover:text-white"
            >
              <IconCopy size={15} />
              {tr.ui.copy}
            </button>
            <button
              onClick={download}
              className="flex cursor-pointer items-center gap-1.5 border border-safety bg-safety px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-safety-hi"
            >
              <IconDownload size={15} />
              <span className="bidi">.ino</span>
            </button>
          </div>
        </div>
        <div className="codeblock max-h-[480px] p-4">
          <div className="table w-full border-collapse">{highlight(code)}</div>
        </div>
        <div className="border-t border-white/10 bg-[#111a24] px-4 py-3">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-safety">{tr.ui.notes}</p>
          <ul className="space-y-1 text-[13px] leading-6 text-paper/80">
            {notes.map((n, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-safety">◂</span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}
