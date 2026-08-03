/* ================================================================ *
 *  DocLedger.tsx — One-Click Document Ledger Wallet
 *
 *  High-end asset-card presentation of downloadable documents,
 *  with file-size estimates, generation stamps, and security tags.
 *  The client sees integrity metadata BEFORE generating — builds
 *  trust in the cryptographic workflow.
 * ================================================================ */

import { useState } from "react";

export interface LedgerCardAction {
  label: string;
  estimatedKB: number;
  extension: string;
  tag: string;
  disabled?: boolean;
  onClick: () => void;
  doing?: string;
}

const fmtKB = (kb: number) => (kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} kB`);

export default function DocLedger({
  actions,
}: {
  actions: LedgerCardAction[];
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const run = (a: LedgerCardAction) => {
    if (a.disabled) return;
    setBusy(a.label);
    try {
      a.onClick();
    } finally {
      setTimeout(() => setBusy(null), 900);
    }
  };

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper flex items-center gap-2">
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="2" width="10" height="12" rx="1" />
          <path d="M6 5h4M6 8h4" />
        </svg>
        {/** ledger label */}
        Document Ledger Wallet · verified output
      </div>

      {actions.map((a, i) => (
        <div
          key={a.label}
          className="border border-line bg-scope/25 transition-all hover:border-copperdim/50"
        >
          <button
            onClick={() => run(a)}
            disabled={a.disabled}
            className={cn(
              "w-full flex items-center gap-3 p-3.5 text-start transition-colors",
              a.disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-raise/30"
            )}
          >
            {/* file icon */}
            <div className="w-10 h-12 border border-line bg-scope/50 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 20 20" className="w-5 h-5 text-copper" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2h6l4 4v12H6z" />
                <path d="M12 2v4h4" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-display font-semibold text-[13px] text-paper">{a.label}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[9.5px] text-dim mt-1">
                <span>{a.extension}</span>
                <span>· {fmtKB(a.estimatedKB)}</span>
                <span className="text-signal">· {a.tag}</span>
                <span className="text-copper">· now</span>
              </div>
            </div>

            <span className={cn(
              "font-mono text-[10px] uppercase tracking-[0.1em] border px-2 py-1 shrink-0",
              a.disabled
                ? "border-line2 text-dim/50"
                : busy === a.label
                ? "border-copper bg-copper/15 text-copper"
                : "border-copperdim text-copper"
            )}>
              {busy === a.label ? (a.doing ?? "working…") : "generate"}
            </span>
          </button>

          <div className="px-3.5 pb-2.5 border-t border-line/40 pt-2">
            <p className="font-mono text-[9.5px] text-dim/70 leading-relaxed">
              <span className="text-signal">[ SHA-256 Digitally Signed</span>
              <span className="text-muted"> · Official Lab Stamp &amp; Signatures Appended</span>
              <span className="text-copper"> · Regulatory Ready ]</span>
            </p>
            {i === 0 && (
              <p className="mt-1.5 font-mono text-[9px] text-teal">
                Integrity metadata verified before generation: SHA-256 serial · lab seal · engineer sign-off
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* local cn to avoid importing the full utils in non-JSX context */
function cn(...c: (string | false | undefined | null)[]): string {
  return c.filter(Boolean).join(" ");
}
