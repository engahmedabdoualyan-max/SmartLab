/* ================================================================ *
 *  ClientZone.tsx — smartLAB · منطقة العميل
 *
 *  Fully data-wired workspace:
 *   · Token bank   — account balance, deduct/credit via IndexedDB
 *   · ROM verify   — 1-Wire 64-bit verification before certified save
 *   · Marketplace  — batch order +50/+100 with simulated authorization
 *   · Reports      — badge watermarks burned into all exports
 * ================================================================ */

import { useEffect, useRef, useState } from "react";
import type { NodeSim } from "../sim";
import { useLang } from "../i18n";
import { FULL_CODE, FILE_NAME, FW_VERSION } from "../firmware";
import { Led } from "../ui";
import { cn } from "../utils/cn";
import {
  type TokenBadge,
  type TokenWallet,
  type TokenTxn,
  type SensorBatch,
  badgeForSession,
  badgeWatermark,
  deductToken,
  fulfillBatch,
  generateRomId,
  getOrCreateWallet,
  reportFooterLines,
  tokenDb,
} from "../tokenDb";
import { deploymentFooterLine, onboardSession } from "../onboardStore";
import { printReport, exportPdf, exportExcel } from "../reportExport";

/* ── types ──────────────────────────────────────────────────────── */
export interface Project {
  id: string;
  name: string;
  location: string;
  concrete: string;
  date: string;
  notes: string;
  createdAt: string;
  status: "pending" | "ok" | "fail";
  specimens: SpecimenRecord[];
}

export interface SpecimenRecord {
  id: string;
  label: string;
  age: number;
  voltage: number;
  resistance: number;
  frequency: number;
  conductance: number;
  damage: number;
  strengthMPa: number;
  certification: string;
  scenario: string;
  savedAt: string;
  verdict: "PASS" | "FAIL" | "PENDING";
  badge: TokenBadge;
  romId: string | null;
}

type Tab = "projects" | "connect" | "readings" | "reports";

/* ── storage helpers ────────────────────────────────────────────── */
const PROJ_KEY   = "smartlab-client-projects-v1";
const BATCH_KEY  = "smartlab-token-batches-v1";

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJ_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch { return []; }
}
function persistProjectsToDisk(p: Project[]): void {
  try { localStorage.setItem(PROJ_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}
function loadBatches(): SensorBatch[] {
  try {
    const raw = localStorage.getItem(BATCH_KEY);
    return raw ? (JSON.parse(raw) as SensorBatch[]) : [];
  } catch { return []; }
}
function persistBatches(b: SensorBatch[]): void {
  try { localStorage.setItem(BATCH_KEY, JSON.stringify(b)); } catch { /* ignore */ }
}

const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const nowIso = () => new Date().toISOString();

function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function specimenVerdict(r: SpecimenRecord): SpecimenRecord["verdict"] {
  if (r.certification === "CERTIFIED" || r.strengthMPa >= 20) return "PASS";
  if (r.certification === "BLOCKED" || r.certification === "MIX_HAZARD" || r.certification === "NOT_CERTIFIED") return "FAIL";
  return "PENDING";
}

/* ── small shared components ────────────────────────────────────── */
function TabBtn({ active, icon, label, badge, onClick }: {
  active: boolean; icon: React.ReactNode; label: string; badge?: number; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 border-b-2 font-mono text-[10.5px] tracking-[0.14em] uppercase transition-all duration-200 whitespace-nowrap",
        active ? "border-copper text-copper bg-copper/6" : "border-transparent text-dim hover:text-mute hover:border-line2"
      )}>
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-copper/20 border border-copperdim font-mono text-[9px] text-copper">{badge}</span>
      )}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; rows?: number;
}) {
  const base = "w-full bg-scope border border-line px-3 py-2 font-mono text-[12px] text-paper placeholder:text-dim/50 focus:outline-none focus:border-copperdim transition-colors";
  return (
    <div>
      <label className="block font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim mb-1.5">{label}</label>
      {rows
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base + " resize-y"} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
      }
    </div>
  );
}

/* ================================================================ *
 *  TOKEN BANK STRIP — available / used / issued + marketplace
 * ================================================================ */
function TokenBank({ wallet, ordering, onOrder }: {
  wallet: TokenWallet | null;
  ordering: boolean;
  onOrder: (qty: number) => void;
}) {
  const { t } = useLang();
  const low = wallet !== null && wallet.balance <= 3;
  const empty = wallet !== null && wallet.balance <= 0;

  return (
    <div className="border-b border-line">
      <div className="px-5 py-3.5">
        <div className="flex flex-wrap gap-3 items-center">

          {/* balance cards */}
          <div className="flex gap-2 flex-1 min-w-0 flex-wrap">
            {[
              { label: t("tok.available"),  val: wallet?.balance ?? "…",
                tone: empty ? "text-alarm" : low ? "text-copper" : "text-signal",
                border: empty ? "border-alarm/60 bg-alarm/8" : low ? "border-copperdim bg-copper/6" : "border-signaldeep bg-signal/5" },
              { label: t("tok.used"),       val: wallet?.used ?? "…",       tone: "text-mute",    border: "border-line bg-scope/30" },
              { label: t("tok.certified"),  val: wallet?.certified ?? "…",  tone: "text-mute",    border: "border-line bg-scope/30" },
            ].map(c => (
              <div key={c.label} className={cn("border px-3.5 py-2.5 min-w-[88px]", c.border)}>
                <div className={cn("font-mono font-bold text-2xl tabular-nums leading-none", c.tone)}>{c.val}</div>
                <div className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.14em] text-dim">{c.label}</div>
              </div>
            ))}
            {low && wallet !== null && (
              <div className={cn("flex items-center gap-2 border px-3 py-2 font-mono text-[10px]",
                empty ? "border-alarm/60 bg-alarm/10 text-alarm" : "border-copperdim bg-copper/8 text-copper")}>
                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M10 2 1 18h18L10 2z"/><path d="M10 8v4M10 15v.5"/>
                </svg>
                {empty ? t("tok.order.err") : t("tok.low")}
              </div>
            )}
          </div>

          {/* order buttons */}
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim">{t("tok.order")}</span>
            <div className="flex gap-1.5">
              {[50, 100].map(qty => (
                <button key={qty} onClick={() => onOrder(qty)} disabled={ordering}
                  className={cn("border px-3 py-1.5 font-mono text-[10px] uppercase transition-colors disabled:opacity-40",
                    ordering ? "border-copperdim bg-copper/8 text-copper" : "border-copperdim bg-copper/10 text-copper hover:bg-copper/20")}>
                  {ordering ? t("tok.order.proc") : `+${qty}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── token ledger rows ──────────────────────────────────────────── */
function TokenLedger({ txns }: { txns: TokenTxn[] }) {
  const { t } = useLang();
  if (txns.length === 0) return null;
  return (
    <div className="border border-line overflow-hidden mt-4">
      <div className="px-3.5 py-2 border-b border-line font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim bg-raise/20">
        {t("tok.history")}
      </div>
      <div className="max-h-[180px] overflow-y-auto">
        {txns.map(txn => (
          <div key={txn.txnId} className="flex flex-wrap gap-x-4 gap-y-0.5 border-b border-line/50 px-3.5 py-2 font-mono text-[10px] hover:bg-raise/30">
            <span className={txn.type === "CREDIT" ? "text-signal" : "text-copper"}>
              {txn.type === "CREDIT" ? `+${txn.amount}` : `−${txn.amount}`}
            </span>
            <span className="text-mute truncate max-w-[260px]">{txn.reason.slice(0, 60)}</span>
            {txn.romId && <span className="text-teal text-[9px]">{txn.romId}</span>}
            <span className="ml-auto text-dim">{txn.timestamp.slice(11, 19)}</span>
            <span className="text-dim">bal: <span className="text-paper">{txn.balanceAfter}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ *
 *  FACTORY ORDER & SHIPMENT TRACKER
 *  Purely presentational — reads the marketplace batch list and
 *  merges it with static factory milestones. No ADC / stream coupling.
 * ================================================================ */
type ShipStage = "encapsulation" | "dispatched" | "delivered";

interface ShipmentRow {
  orderId: string;
  qty: number;
  date: string;
  stage: ShipStage;
  tracking: string | null;
  live: boolean;
}

const STAGE_META: Record<ShipStage, { icon: string; dot: string; cls: string }> = {
  encapsulation: { icon: "🛠️", dot: "var(--color-copper)", cls: "text-copper border-copperdim bg-copper/8" },
  dispatched:    { icon: "🚚", dot: "var(--color-teal)",   cls: "text-teal border-teal/50 bg-teal/8" },
  delivered:     { icon: "🔒", dot: "var(--color-signal)", cls: "text-signal border-signaldeep bg-signal/8" },
};

const MOCK_SHIPMENTS: ShipmentRow[] = [
  { orderId: "FO-4488", qty: 25,  date: "2026-02-02", stage: "encapsulation", tracking: null,        live: false },
  { orderId: "FO-4462", qty: 50,  date: "2026-01-21", stage: "dispatched",    tracking: "SMSA-9921", live: false },
  { orderId: "FO-4417", qty: 100, date: "2026-01-08", stage: "delivered",     tracking: "SMSA-8834", live: false },
];

function StageProgress({ stage }: { stage: ShipStage }) {
  const idx = stage === "encapsulation" ? 0 : stage === "dispatched" ? 1 : 2;
  const tone = STAGE_META[stage].dot;
  return (
    <span className="inline-flex items-center gap-[3px] shrink-0" aria-hidden>
      {[0, 1, 2].map(i => (
        <span key={i} className="w-[13px] h-[3px] transition-colors duration-300"
          style={{ background: i <= idx ? tone : "rgba(38,51,41,0.95)" }} />
      ))}
    </span>
  );
}

function ShipmentTracker({ batches }: { batches: SensorBatch[] }) {
  const { t } = useLang();

  const stageLabel = (s: ShipStage): string =>
    s === "encapsulation" ? t("ship.stage.encap")
      : s === "dispatched" ? t("ship.stage.dispatch")
      : t("ship.stage.delivered");

  /* live marketplace orders land at the top, already credited */
  const liveRows: ShipmentRow[] = batches.slice().reverse().map(b => ({
    orderId:  b.batchId.replace("BATCH-", "FO-"),
    qty:      b.quantity,
    date:     b.orderedAt.slice(0, 10),
    stage:    "delivered",
    tracking: null,
    live:     true,
  }));

  const rows: ShipmentRow[] = [...liveRows, ...MOCK_SHIPMENTS];

  return (
    <div className="border border-line overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 border-b border-line bg-raise/20">
        <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 text-copper shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M1 5.5 9 2l8 3.5v7L9 16l-8-3.5z" />
          <path d="M1 5.5 9 9m0 0 8-3.5M9 9v7" />
        </svg>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim">{t("ship.title")}</span>
        <span className="ml-auto font-mono text-[9px] text-dim/70">{rows.length} {t("ship.orders")}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[560px]">
          <thead>
            <tr className="border-b border-line bg-raise/10 font-mono text-[9px] uppercase tracking-[0.14em] text-dim">
              <th className="px-3.5 py-2 font-medium w-[104px]">{t("ship.orderid")}</th>
              <th className="px-3 py-2 font-medium w-[92px]">{t("ship.qty")}</th>
              <th className="px-3 py-2 font-medium w-[104px]">{t("ship.date")}</th>
              <th className="px-3 py-2 font-medium">{t("ship.status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const meta = STAGE_META[r.stage];
              return (
                <tr key={r.orderId} className="border-b border-line/50 last:border-0 hover:bg-raise/25 transition-colors">
                  <td className="px-3.5 py-2.5 font-mono text-[11px] text-copper whitespace-nowrap">
                    {r.orderId}
                    {r.live && (
                      <span className="ml-1.5 border border-signaldeep bg-signal/10 px-1 py-px font-mono text-[7.5px] uppercase text-signal align-middle">
                        new
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-paper tabular-nums whitespace-nowrap">
                    {r.qty} <span className="text-dim text-[9.5px]">units</span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[10.5px] text-mute whitespace-nowrap">{r.date}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <StageProgress stage={r.stage} />
                      <span className={cn("border px-2 py-0.5 font-mono text-[9.5px] whitespace-nowrap", meta.cls)}>
                        {meta.icon} {stageLabel(r.stage)}
                      </span>
                      {r.tracking && (
                        <span className="font-mono text-[9px] text-dim whitespace-nowrap">
                          [{t("ship.tracking")}: <span className="text-teal">{r.tracking}</span>]
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-line px-3.5 py-1.5 flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-[9px] text-dim/70">
        <span>fulfilment partner: SMSA Express</span>
        <span>encapsulation lead time: 5–7 working days</span>
        <span className="ml-auto">tokens credit automatically on delivery</span>
      </div>
    </div>
  );
}

/* ================================================================ *
 *  TAB 1 — PROJECTS
 * ================================================================ */
function TabProjects({ projects, activeId, batches, onSelect, onNew, onDelete }: {
  projects: Project[];
  activeId: string | null;
  batches: SensorBatch[];
  onSelect: (id: string) => void;
  onNew: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", concrete: "C30/37", date: new Date().toISOString().slice(0, 10), notes: "" });

  const submit = () => {
    if (!form.name.trim()) return;
    const np: Project = {
      id: uid(), name: form.name, location: form.location,
      concrete: form.concrete, date: form.date, notes: form.notes,
      createdAt: nowIso(), status: "pending", specimens: [],
    };
    onNew(np);
    setShowForm(false);
    setForm({ name: "", location: "", concrete: "C30/37", date: new Date().toISOString().slice(0, 10), notes: "" });
  };

  const statusColor = (s: Project["status"]) =>
    s === "ok" ? "text-signal border-signaldeep" : s === "fail" ? "text-alarm border-alarm/60" : "text-copper border-copperdim";
  const statusLabel = (s: Project["status"]) =>
    s === "ok" ? t("cz.proj.status.ok") : s === "fail" ? t("cz.proj.status.fail") : t("cz.proj.status.pend");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </span>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 border border-copperdim bg-copper/10 px-3.5 py-2 font-mono text-[10.5px] tracking-[0.14em] uppercase text-copper hover:bg-copper/20 transition-colors">
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v12M2 8h12"/></svg>
          {t("cz.proj.new")}
        </button>
      </div>

      {showForm && (
        <div className="border border-copperdim bg-copper/5 p-4 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper mb-3">{t("cz.proj.new")}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("cz.proj.name")} value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Tower Block A" />
            <Field label={t("cz.proj.location")} value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} placeholder="Cairo, Egypt" />
            <div>
              <label className="block font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim mb-1.5">{t("cz.proj.concrete")}</label>
              <select value={form.concrete} onChange={e => setForm(f => ({ ...f, concrete: e.target.value }))}
                className="w-full bg-scope border border-line px-3 py-2 font-mono text-[12px] text-paper focus:outline-none focus:border-copperdim">
                {["C20/25","C25/30","C30/37","C35/45","C40/50","C45/55","C50/60"].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <Field label={t("cz.proj.date")} type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
          </div>
          <Field label={t("cz.proj.notes")} value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} rows={2} placeholder="Pile cap specimens, cured in situ…" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="border border-line px-3 py-1.5 font-mono text-[10.5px] text-mute hover:text-paper transition-colors">{t("cz.proj.cancel")}</button>
            <button onClick={submit} className="border border-signaldeep bg-signal/10 px-4 py-1.5 font-mono text-[10.5px] text-signal hover:bg-signal/20 transition-colors">{t("cz.proj.save")}</button>
          </div>
        </div>
      )}

      {projects.length === 0 && !showForm && (
        <div className="border border-line bg-scope/30 px-6 py-10 text-center">
          <svg viewBox="0 0 48 48" className="w-10 h-10 mx-auto mb-3 text-dim" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="8" y="6" width="32" height="38" rx="2"/>
            <path d="M16 18h16M16 24h16M16 30h10"/>
            <circle cx="36" cy="36" r="8" fill="var(--color-panel)" stroke="var(--color-copper)"/>
            <path d="M36 32v8M32 36h8" stroke="var(--color-copper)" strokeWidth="1.8"/>
          </svg>
          <p className="font-body text-[13px] text-mute">{t("cz.proj.empty")}</p>
        </div>
      )}

      <div className="space-y-2">
        {projects.map(p => (
          <div key={p.id} onClick={() => onSelect(p.id)}
            className={cn("border p-4 flex flex-wrap gap-3 items-start transition-all duration-200 cursor-pointer hover:border-copperdim",
              activeId === p.id ? "border-copper bg-copper/6" : "border-line bg-scope/20")}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-semibold text-[15px] text-paper">{p.name}</span>
                {activeId === p.id && (
                  <span className="border border-copper bg-copper/15 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-copper">{t("cz.proj.active")}</span>
                )}
                <span className={cn("border px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.16em]", statusColor(p.status))}>{statusLabel(p.status)}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-[10.5px] text-dim">
                {p.location && <span>📍 {p.location}</span>}
                <span>🧱 {p.concrete}</span>
                <span>📅 {p.date}</span>
                <span>🔬 {p.specimens.length} {t("cz.proj.specimens")}</span>
                {p.specimens.some(s => s.badge === "PROPRIETARY_CERTIFIED") && (
                  <span className="text-signal text-[9.5px]">🔒 {p.specimens.filter(s => s.badge === "PROPRIETARY_CERTIFIED").length} certified</span>
                )}
              </div>
              {p.notes && <p className="mt-1.5 font-body text-[11.5px] text-dim/70 truncate">{p.notes}</p>}
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={e => { e.stopPropagation(); onSelect(p.id); }}
                className="border border-copperdim px-2.5 py-1 font-mono text-[10px] uppercase text-copper hover:bg-copper/10 transition-colors">{t("cz.proj.select")}</button>
              <button onClick={e => { e.stopPropagation(); onDelete(p.id); }}
                className="border border-line px-2.5 py-1 font-mono text-[10px] uppercase text-dim hover:border-alarm hover:text-alarm transition-colors">{t("cz.proj.delete")}</button>
            </div>
          </div>
        ))}
      </div>

      {/* order history */}
      {batches.length > 0 && (
        <div className="border border-line overflow-hidden mt-2">
          <div className="px-3.5 py-2 border-b border-line font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim bg-raise/20">
            {t("tok.ordershist")}
          </div>
          <div className="space-y-0">
            {batches.slice().reverse().map(b => (
              <div key={b.batchId} className="flex flex-wrap gap-x-4 gap-y-0.5 border-b border-line/50 px-3.5 py-2 font-mono text-[10px] hover:bg-raise/30">
                <span className="text-copper">{b.batchId}</span>
                <span className="text-signal">+{b.tokensIssued} tokens</span>
                <span className={cn("ml-auto", b.status === "FULFILLED" ? "text-signal" : "text-copper")}>{b.status}</span>
                <span className="text-dim">{b.orderedAt.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ *
 *  TAB 2 — DEVICE SETUP (unchanged)
 * ================================================================ */
function TabDevice({ sim, connected, onConnect, onDisconnect }: {
  sim: NodeSim; connected: boolean;
  onConnect: () => void; onDisconnect: () => void;
}) {
  const { t } = useLang();
  const [step, setStep] = useState(0);

  const downloadFirmware = () => {
    downloadBlob(FULL_CODE, FILE_NAME, "text/plain;charset=utf-8");
  };

  const STEPS = [
    { key: "1", icon: "🔌", title: t("cz.dev.step1"), body: t("cz.dev.step1b") },
    { key: "2", icon: "💾", title: t("cz.dev.step2"), body: t("cz.dev.step2b") },
    { key: "3", icon: "⬆️", title: t("cz.dev.step3"), body: t("cz.dev.step3b") },
    { key: "4", icon: "✅", title: t("cz.dev.step4"), body: t("cz.dev.step4b") },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper">{t("cz.dev.title")}</div>
        <div className="space-y-2">
          {STEPS.map((s, i) => (
            <button key={s.key} onClick={() => setStep(i)}
              className={cn("w-full flex gap-4 border p-4 text-left transition-all duration-200 hover:border-copperdim",
                step === i ? "border-copper bg-copper/6" : "border-line bg-scope/20")}>
              <div className={cn("w-9 h-9 shrink-0 flex items-center justify-center border font-mono text-[14px] transition-colors",
                step === i ? "border-copper text-copper" : i < step ? "border-signaldeep text-signal" : "border-line text-dim")}>
                {i < step ? "✓" : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("font-display font-semibold text-[13.5px]", step === i ? "text-paper" : "text-mute")}>{s.icon} {s.title}</div>
                {step === i && <p className="mt-1.5 font-body text-[12px] text-mute leading-relaxed">{s.body}</p>}
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-2" dir="ltr">
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="border border-line px-4 py-2 font-mono text-[10.5px] uppercase text-dim hover:text-paper transition-colors">← Back</button>}
          {step < 3 && <button onClick={() => setStep(s => s + 1)} className="flex-1 border border-copperdim bg-copper/10 px-4 py-2 font-mono text-[10.5px] uppercase text-copper hover:bg-copper/20 transition-colors">Next →</button>}
        </div>
      </div>

      <div className="space-y-4">
        <div className={cn("border p-4 transition-colors duration-300", connected ? "border-signaldeep bg-signal/6" : "border-line bg-scope/20")}>
          <div className="flex items-center gap-3">
            <Led tone={connected ? "signal" : "dim"} size={10} live={connected} />
            <div>
              <div className={cn("font-display font-semibold text-[15px]", connected ? "text-signal" : "text-mute")}>
                {connected ? t("cz.dev.connected") : t("cz.dev.notconnected")}
              </div>
              {connected && (
                <div className="mt-1 font-mono text-[10px] text-dim space-y-0.5">
                  <div>{t("cz.dev.id")}: <span className="text-paper">{sim.sessionId}</span></div>
                  <div>{t("cz.dev.port")}: <span className="text-paper">/dev/ttyUSB0</span></div>
                  <div>{t("cz.dev.firmware")}: <span className="text-paper">v{FW_VERSION}</span></div>
                  <div>{t("cz.dev.signal")}: <span className="text-paper">{Math.round(sim.rssi)} dBm</span></div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {connected
              ? <button onClick={onDisconnect} className="w-full border border-alarm/60 bg-alarm/8 px-3 py-2 font-mono text-[10.5px] uppercase text-alarm hover:bg-alarm/14 transition-colors">{t("cz.dev.disconnect")}</button>
              : <button onClick={onConnect} className="w-full border border-signaldeep bg-signal/10 px-3 py-2 font-mono text-[10.5px] uppercase text-signal hover:bg-signal/20 transition-colors">{t("cz.dev.simulate")}</button>
            }
          </div>
        </div>

        <div className="border border-copperdim bg-copper/5 p-4 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-copper">{t("cz.dev.step3")}</div>
          <div className="flex items-center gap-3 border border-line bg-scope/40 px-3 py-2.5">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-copper shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
            </svg>
            <div>
              <div className="font-mono text-[12px] text-paper">{FILE_NAME}</div>
              <div className="font-mono text-[9.5px] text-dim">v{FW_VERSION} · ESP32-WROOM-32</div>
            </div>
          </div>
          <button onClick={downloadFirmware}
            className="w-full flex items-center justify-center gap-2 border border-copperdim bg-copper/10 px-4 py-2.5 font-mono text-[10.5px] uppercase text-copper hover:bg-copper/22 hover:border-copper transition-colors">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 3v10m-5-5 5 5 5-5"/><path d="M3 17h14"/></svg>
            {t("cz.dev.download")}
          </button>
        </div>

        <div className="border border-line p-4 space-y-2">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim">{t("cz.dev.step2")} — Drivers</div>
          {[
            { label: t("cz.dev.driver.cp"), href: "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers" },
            { label: t("cz.dev.driver.ch"), href: "https://www.wch-ic.com/downloads/CH341SER_EXE.html" },
          ].map(d => (
            <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 border border-line px-3 py-2 font-mono text-[10.5px] text-dim hover:text-copper hover:border-copperdim transition-colors">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 2v8m-3-3 3 3 3-3"/><path d="M2 13h12"/></svg>
              {d.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ *
 *  TAB 3 — LIVE READINGS + Sensor Token Deductor
 * ================================================================ */
function TabReadings({ sim, connected, activeProject, wallet, onSaveReading, onDeduct }: {
  sim: NodeSim;
  connected: boolean;
  activeProject: Project | null;
  wallet: TokenWallet | null;
  onSaveReading: (r: SpecimenRecord) => void;
  onDeduct: (projectId: string) => Promise<{ romId: string; wallet: TokenWallet }>;
}) {
  const { t } = useLang();
  const [running, setRunning]         = useState(false);
  const [saved, setSaved]             = useState(false);
  const [specimenId, setSpecimenId]   = useState("");
  const [age, setAge]                 = useState("28");
  const [label, setLabel]             = useState("");
  const [sensorType, setSensorType]   = useState<"certified" | "generic">("certified");
  const [verifyState, setVerifyState] = useState<"idle" | "scanning" | "verified" | "error">("idle");
  const [verifiedRom, setVerifiedRom] = useState<string | null>(null);

  const canRead    = connected && activeProject !== null;
  const hasTokens  = wallet !== null && wallet.balance >= 1;
  const isCertified = sensorType === "certified";
  const canSave    = canRead && running && (!isCertified || hasTokens) && verifyState !== "scanning";
  const strengthMPa = sim.calibratedStrengthMPa();
  const badge: TokenBadge = badgeForSession(isCertified);

  const handleSave = async () => {
    if (!activeProject) return;
    let romId: string | null = null;
    if (isCertified) {
      /* Simulate 1-Wire bus scan → ROM verification animation */
      setVerifyState("scanning");
      await new Promise(res => setTimeout(res, 680));
      await new Promise(res => setTimeout(res, 480));
      try {
        const result = await onDeduct(activeProject.id);
        romId = result.romId;
        setVerifiedRom(romId);
        setVerifyState("verified");
      } catch {
        setVerifyState("error");
        return;
      }
    }
    const r: SpecimenRecord = {
      id: uid(),
      label: label || `Specimen ${activeProject.specimens.length + 1}`,
      age: Number(age) || 28,
      voltage:       parseFloat(sim.vMV.toFixed(1)),
      resistance:    parseFloat(sim.rK.toFixed(3)),
      frequency:     parseFloat(sim.fRes.toFixed(2)),
      conductance:   Math.round(sim.gUS),
      damage:        parseFloat(sim.damage.toFixed(2)),
      strengthMPa:   parseFloat(strengthMPa.toFixed(2)),
      certification: sim.certification,
      scenario:      sim.scenario,
      savedAt:       nowIso(),
      verdict:       "PENDING",
      badge,
      romId,
    };
    r.verdict = specimenVerdict(r);
    onSaveReading(r);
    setSaved(true);
    setTimeout(() => { setSaved(false); setVerifyState("idle"); setVerifiedRom(null); }, 2800);
    setLabel(""); setSpecimenId("");
  };

  const READINGS = [
    { key: "cz.read.voltage",     value: `${sim.vMV.toFixed(1)} mV`,                       },
    { key: "cz.read.resistance",  value: sim.rK >= 9999 ? "OPEN" : `${sim.rK.toFixed(3)} kΩ`, },
    { key: "cz.read.frequency",   value: `${sim.fRes.toFixed(2)} kHz`,                      },
    { key: "cz.read.conductance", value: `${Math.round(sim.gUS)} µS`,                        },
    { key: "cz.read.damage",      value: `${sim.damage.toFixed(2)} %`,                       },
    { key: "cz.read.strength",    value: `${strengthMPa.toFixed(2)} MPa`,                    },
  ];

  return (
    <div className="space-y-5">
      {!connected && (
        <div className="border border-alarm/50 bg-alarm/6 px-4 py-3 flex items-center gap-3 font-mono text-[11.5px] text-alarmhi">
          <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 14v.5"/></svg>
          {t("cz.read.nodev")}
        </div>
      )}
      {connected && !activeProject && (
        <div className="border border-copper/50 bg-copper/6 px-4 py-3 flex items-center gap-3 font-mono text-[11.5px] text-copper">
          <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 14v.5"/></svg>
          {t("cz.read.noproj")}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_370px]">
        {/* left panel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper">{t("cz.read.title")}</div>
            <div className="flex gap-2">
              <button onClick={() => setRunning(r => !r)} disabled={!canRead}
                className={cn("border px-3 py-1.5 font-mono text-[10px] uppercase transition-colors disabled:opacity-35",
                  running ? "border-alarm/60 bg-alarm/10 text-alarm hover:bg-alarm/16" : "border-signaldeep bg-signal/10 text-signal hover:bg-signal/20")}>
                {running ? t("cz.read.stop") : t("cz.read.start")}
              </button>
            </div>
          </div>

          {/* sensor type selector */}
          <div className="mb-4 border border-line bg-scope/20 p-3.5 space-y-2">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim">{t("tok.choose")}</div>
            <div className="grid grid-cols-2 gap-2">
              {/* Option 1: certified */}
              <button
                onClick={() => { setSensorType("certified"); setVerifyState("idle"); setVerifiedRom(null); }}
                className={cn("border px-3 py-2.5 text-left transition-all duration-200",
                  isCertified ? "border-signaldeep bg-signal/8" : "border-line bg-scope/30 hover:border-signaldeep/60")}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 border-2 rounded-full transition-colors", isCertified ? "border-signal bg-signal" : "border-dim")} />
                  <span className={cn("font-mono text-[10px] uppercase tracking-wide", isCertified ? "text-signal" : "text-dim")}>
                    Option 1
                  </span>
                </div>
                <div className={cn("mt-1 font-body text-[11px] leading-snug", isCertified ? "text-paper" : "text-dim/60")}>
                  {t("tok.session.cert")}
                </div>
                {isCertified && hasTokens && (
                  <div className="mt-1.5 font-mono text-[9.5px] text-copper">−1 token · {t("tok.badge.short.cert")}</div>
                )}
                {isCertified && !hasTokens && (
                  <div className="mt-1.5 font-mono text-[9.5px] text-alarm">⚠ {t("tok.order.err")}</div>
                )}
              </button>

              {/* Option 2: generic */}
              <button
                onClick={() => { setSensorType("generic"); setVerifyState("idle"); setVerifiedRom(null); }}
                className={cn("border px-3 py-2.5 text-left transition-all duration-200",
                  !isCertified ? "border-line2 bg-raise/50" : "border-line bg-scope/30 hover:border-line2")}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 border-2 rounded-full transition-colors", !isCertified ? "border-mute bg-mute" : "border-dim")} />
                  <span className={cn("font-mono text-[10px] uppercase tracking-wide", !isCertified ? "text-mute" : "text-dim")}>
                    Option 2
                  </span>
                </div>
                <div className={cn("mt-1 font-body text-[11px] leading-snug", !isCertified ? "text-paper" : "text-dim/60")}>
                  {t("tok.session.gen")}
                </div>
                {!isCertified && (
                  <div className="mt-1.5 font-mono text-[9.5px] text-dim">0 tokens · {t("tok.badge.short.gen")}</div>
                )}
              </button>
            </div>

            {/* ROM verification display */}
            {verifyState !== "idle" && (
              <div className={cn("border px-3.5 py-2.5 font-mono text-[10px] transition-colors duration-300",
                verifyState === "verified" ? "border-signaldeep bg-signal/8 text-signal" :
                verifyState === "error"    ? "border-alarm/60 bg-alarm/8 text-alarm" :
                "border-copperdim bg-copper/8 text-copper")}>
                <div className="flex items-center gap-2">
                  {verifyState === "scanning" && (
                    <>
                      <span className="w-2 h-2 bg-copper rounded-full animate-pulse shrink-0" />
                      <span>1-Wire bus scanning… ROM lock pending</span>
                    </>
                  )}
                  {verifyState === "verified" && verifiedRom && (
                    <>
                      <span className="w-2 h-2 bg-signal rounded-full shrink-0" />
                      <span>✓ ROM verified: <span className="text-signalhi">{verifiedRom}</span></span>
                    </>
                  )}
                  {verifyState === "error" && (
                    <>
                      <span className="w-2 h-2 bg-alarm rounded-full shrink-0" />
                      <span>{t("tok.order.err")}</span>
                    </>
                  )}
                </div>
                {verifyState === "verified" && (
                  <div className="mt-1 pl-4 font-mono text-[9px] text-signal/80">
                    {t("tok.deduct")} · {t("tok.badge.short.cert")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* readings grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {READINGS.map(r => (
              <div key={r.key} className="border border-line bg-scope/30 px-3.5 py-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-dim mb-1">{t(r.key as Parameters<typeof t>[0])}</div>
                <div className={cn("font-mono font-semibold text-[20px] tabular-nums leading-none", running && canRead ? "text-paper" : "text-mute/60")}>
                  {running && canRead ? r.value : "—"}
                </div>
              </div>
            ))}
          </div>

          {/* cert badge */}
          {running && canRead && (
            <div className={cn("mt-3 border px-4 py-3 flex items-center gap-3",
              sim.certification === "CERTIFIED" ? "border-signaldeep bg-signal/6" :
              sim.certification === "PENDING" ? "border-copperdim bg-copper/5" : "border-alarm/60 bg-alarm/6")}>
              <Led tone={sim.certification === "CERTIFIED" ? "signal" : sim.certification === "PENDING" ? "copper" : "alarm"} size={9} live />
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim">{t("cz.read.cert")}</div>
                <div className={cn("font-display font-bold text-[16px] tracking-wide",
                  sim.certification === "CERTIFIED" ? "text-signal" : sim.certification === "PENDING" ? "text-copper" : "text-alarm")}>
                  {sim.certification.replace("_", " ")}
                </div>
              </div>
              {/* active badge flag */}
              <div className="ml-auto text-right">
                <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-dim mb-1">Badge</div>
                <div className={cn("font-mono text-[10px] px-2 py-0.5 border",
                  badge === "PROPRIETARY_CERTIFIED" ? "text-signal border-signaldeep bg-signal/8" : "text-dim border-line bg-scope/40")}>
                  {badge === "PROPRIETARY_CERTIFIED" ? t("tok.badge.short.cert") : t("tok.badge.short.gen")}
                </div>
              </div>
            </div>
          )}

          {running && canRead && <LiveMiniScope sim={sim} />}
        </div>

        {/* right panel — specimen form */}
        <div className="border border-line bg-scope/20 p-4 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper">{t("cz.read.add")}</div>
          {activeProject && (
            <div className="border border-line/50 px-2.5 py-1.5 font-mono text-[10px] text-dim">
              <span className="text-copper">↳ {activeProject.name}</span> · {activeProject.concrete}
            </div>
          )}

          {/* current badge preview */}
          <div className={cn("border px-3 py-2 flex items-center gap-2 font-mono text-[10px]",
            badge === "PROPRIETARY_CERTIFIED" ? "border-signaldeep bg-signal/8 text-signal" : "border-line bg-scope/40 text-dim")}>
            <span>{badge === "PROPRIETARY_CERTIFIED" ? "🔒" : "⚡"}</span>
            <span>{badge === "PROPRIETARY_CERTIFIED" ? t("tok.badge.cert") : t("tok.badge.generic")}</span>
          </div>

          <Field label={t("cz.read.specimen")} value={specimenId} onChange={setSpecimenId} placeholder="SP-001" />
          <Field label={t("cz.read.age")} type="number" value={age} onChange={setAge} />
          <Field label={t("cz.read.label")} value={label} onChange={setLabel} rows={2} placeholder="North pile cap, batch 3…" />

          <button onClick={() => { void handleSave(); }} disabled={!canSave}
            className="w-full border border-copperdim bg-copper/10 px-4 py-2.5 font-mono text-[10.5px] uppercase text-copper hover:bg-copper/22 transition-colors disabled:opacity-35 disabled:pointer-events-none">
            {verifyState === "scanning" ? "Verifying ROM…" : isCertified ? `${t("cz.read.save")} − 1 token` : t("cz.read.save")}
          </button>

          {saved && (
            <div className="border border-signaldeep bg-signal/10 px-3 py-2 font-mono text-[10.5px] text-signal text-center">
              ✓ {t("cz.read.saved")}
            </div>
          )}

          {activeProject && activeProject.specimens.length > 0 && (
            <div className="mt-2 border-t border-line pt-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim mb-2">{t("cz.read.history")}</div>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {activeProject.specimens.slice().reverse().map(s => (
                  <div key={s.id} className="flex items-center gap-2 justify-between font-mono text-[10px] border border-line/50 px-2.5 py-1.5">
                    <span className="text-mute truncate max-w-[100px]">{s.label}</span>
                    <span className="text-paper">{s.strengthMPa} MPa</span>
                    <span className={s.badge === "PROPRIETARY_CERTIFIED" ? "text-signal text-[9px]" : "text-dim text-[9px]"}>
                      {s.badge === "PROPRIETARY_CERTIFIED" ? "🔒" : "⚡"}
                    </span>
                    <span className={s.verdict === "PASS" ? "text-signal" : s.verdict === "FAIL" ? "text-alarm" : "text-copper"}>
                      {s.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* mini live oscilloscope */
function LiveMiniScope({ sim }: { sim: NodeSim }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const history = useRef<number[]>([]);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth; const H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const ctx = cv.getContext("2d"); if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    history.current.push(sim.vMV);
    if (history.current.length > W) history.current.shift();
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(143,214,148,0.07)"; ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 44) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    const vMax = Math.max(500, ...history.current);
    const pts = history.current;
    if (pts.length < 2) return;
    const gd = ctx.createLinearGradient(0, 0, 0, H);
    gd.addColorStop(0, "rgba(143,214,148,0.3)"); gd.addColorStop(1, "rgba(143,214,148,0.02)");
    ctx.beginPath();
    pts.forEach((v, i) => {
      const x = (i / (W - 1)) * W;
      const y = H - (v / vMax) * H * 0.88 - 4;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = gd; ctx.fill();
    ctx.beginPath();
    pts.forEach((v, i) => {
      const x = (i / (W - 1)) * W;
      const y = H - (v / vMax) * H * 0.88 - 4;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#8fd694"; ctx.lineWidth = 1.6;
    ctx.shadowColor = "#8fd694"; ctx.shadowBlur = 5; ctx.stroke(); ctx.shadowBlur = 0;
  });
  return (
    <div className="mt-3 border border-line overflow-hidden">
      <div className="px-3 py-1 border-b border-line font-mono text-[9px] uppercase tracking-[0.16em] text-dim">voltage_peak live strip</div>
      <div className="relative">
        <div className="scanlines pointer-events-none absolute inset-0 z-10" />
        <canvas ref={ref} className="block w-full h-[72px] bg-scope" />
      </div>
    </div>
  );
}

/* ================================================================ *
 *  TAB 4 — REPORTS + Badge Watermarks
 * ================================================================ */
function TabReports({ activeProject, wallet }: {
  activeProject: Project | null;
  wallet: TokenWallet | null;
}) {
  const { t } = useLang();

  if (!activeProject) {
    return (
      <div className="border border-line bg-scope/20 px-6 py-14 text-center">
        <svg viewBox="0 0 48 48" className="w-10 h-10 mx-auto mb-3 text-dim" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="8" y="6" width="32" height="38" rx="2"/><path d="M16 18h16M16 24h16M16 30h10"/>
        </svg>
        <p className="font-body text-[13px] text-mute">{t("cz.rep.empty")}</p>
      </div>
    );
  }

  const specimens = activeProject.specimens;

  const badgeShort = (b: TokenBadge): string =>
    b === "PROPRIETARY_CERTIFIED" ? "PROPRIETARY_CERTIFIED(🔒)" : "GENERIC_RAW(⚡)";

  const exportCSV = () => {
    const header = "ID,Label,Age(days),Voltage(mV),Resistance(kΩ),Frequency(kHz),Conductance(µS),Damage(%),Strength(MPa),Certification,Badge,ROM_ID,Verdict,Date\n";
    const rows = specimens.map(s =>
      [s.id, `"${s.label}"`, s.age, s.voltage, s.resistance, s.frequency, s.conductance, s.damage, s.strengthMPa, s.certification, s.badge ?? "GENERIC_RAW", s.romId ?? "N/A", s.verdict, s.savedAt].join(",")
    ).join("\n");
    downloadBlob(header + rows, `${activeProject.name.replace(/\s+/g, "_")}_report.csv`, "text/csv;charset=utf-8;");
  };

  const exportReport = () => {
    const pass  = specimens.filter(s => s.verdict === "PASS").length;
    const fail  = specimens.filter(s => s.verdict === "FAIL").length;
    const cert  = specimens.filter(s => s.badge === "PROPRIETARY_CERTIFIED").length;
    const gen   = specimens.filter(s => s.badge === "GENERIC_RAW").length;
    const avgMpa = specimens.length
      ? (specimens.reduce((s, r) => s + r.strengthMPa, 0) / specimens.length).toFixed(2)
      : "N/A";

    const currentBadge: TokenBadge =
      specimens.some(s => s.badge === "PROPRIETARY_CERTIFIED")
        ? "PROPRIETARY_CERTIFIED"
        : "GENERIC_RAW";
    const lastRomId = specimens.slice().reverse().find(s => s.romId)?.romId ?? null;

    const footerLines = wallet
      ? reportFooterLines(currentBadge, lastRomId, wallet)
      : "Token Badge   : N/A\n";

    const deployBlock =
      onboardSession.mode === "certified"
        ? [
            `Deployment Path : ${deploymentFooterLine()}`,
            `ROM ID (1-Wire) : ${onboardSession.romId ?? "N/A"}`,
            `Token Call      : 1 factory token deducted at session lock ✓`,
            `Session Locked  : ${onboardSession.lockedAt ?? "N/A"}`,
          ].join("\n")
        : onboardSession.mode === "generic"
        ? [
            `Deployment Path : ${deploymentFooterLine()}`,
            `PUF Latch ID    : ${onboardSession.pufLatchId ?? "N/A"}`,
            `Token Call      : none (generic path — evaluation only)`,
            `Session Locked  : ${onboardSession.lockedAt ?? "N/A"}`,
          ].join("\n")
        : `Deployment Path : ${deploymentFooterLine()}`;

    const content = `
SMARTLAB STRUCTURAL HEALTH MONITORING REPORT
============================================
Project:    ${activeProject.name}
Location:   ${activeProject.location}
Concrete:   ${activeProject.concrete}
Generated:  ${new Date().toISOString()}

SUMMARY
-------
Total Specimens : ${specimens.length}
PASS            : ${pass}
FAIL            : ${fail}
Avg. Strength   : ${avgMpa} MPa
Certified Sensors  : ${cert} × ${badgeWatermark("PROPRIETARY_CERTIFIED").text}
Generic Sensors    : ${gen} × ${badgeWatermark("GENERIC_RAW").text}

HARDWARE DEPLOYMENT
-------------------
${deployBlock}

SPECIMEN DETAILS
----------------
${specimens.map((s, i) =>
  `${i + 1}. ${s.label} | Age:${s.age}d | ${s.strengthMPa}MPa | ${s.verdict} | ${badgeShort(s.badge ?? "GENERIC_RAW")} | ROM:${s.romId ?? "N/A"} | ${s.savedAt.slice(0, 10)}`
).join("\n")}

FOOTER METADATA (Token Ledger Trace)
------------------------------------
${footerLines}

Powered by smartLAB · Fimto Soft
API: https://fimtosoft.com
    `.trim();
    downloadBlob(content, `${activeProject.name.replace(/\s+/g, "_")}_smartlab_report.txt`, "text/plain;charset=utf-8");
  };

  /* ── print / pdf / excel handlers ─────────────────────────────── */
  const exportCtx = { project: activeProject, wallet };

  const doPrint = () => {
    printReport(exportCtx, {
      print:     t("cz.rep.print"),
      project:   t("cz.proj.name"),
      location:  t("cz.proj.location"),
      concrete:  t("cz.proj.concrete"),
      date:      t("cz.rep.date"),
      summary:   t("cz.rep.title"),
      specimens: t("cz.rep.specimen"),
      specimen:  t("cz.rep.specimen"),
      age:       t("cz.rep.age"),
      damage:    t("cz.read.damage"),
      verdict:   t("cz.rep.verdict"),
      pass:      t("cz.rep.pass"),
      fail:      t("cz.rep.fail"),
      techsign:  t("cz.rep.techsign"),
      engsign:   t("cz.rep.engsign"),
    });
  };

  const doPdf   = () => exportPdf(exportCtx);
  const doExcel = () => exportExcel(exportCtx);

  const verdictTone = (v: SpecimenRecord["verdict"]) =>
    v === "PASS" ? "text-signal bg-signal/10 border-signaldeep" :
    v === "FAIL" ? "text-alarm bg-alarm/10 border-alarm/60" : "text-copper bg-copper/10 border-copperdim";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-[16px] text-paper">{activeProject.name}</span>
            <span className={cn("border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]",
              onboardSession.mode === "certified" ? "border-signaldeep bg-signal/8 text-signal" :
              onboardSession.mode === "generic"   ? "border-copperdim bg-copper/10 text-copper" :
              "border-line bg-scope/40 text-dim")}>
              {onboardSession.mode === "certified" ? "Option 1 · 🔒 Certified Genuine (Factory Calibrated)" :
               onboardSession.mode === "generic"   ? "Option 2 · ⚡ Generic (Self-Calibrated) Evaluation Only" :
               "no onboarding flag"}
            </span>
          </div>
          <div className="font-mono text-[10px] text-dim mt-1">{activeProject.location} · {activeProject.concrete} · {specimens.length} {t("cz.rep.specimen")}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* PRINT */}
          <button onClick={doPrint} disabled={specimens.length === 0}
            className="flex items-center gap-1.5 border border-line2 px-3 py-1.5 font-mono text-[10px] uppercase text-mute hover:text-paper hover:border-copperdim transition-colors disabled:opacity-35">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 6V2h8v4"/><rect x="2" y="6" width="12" height="5" rx="1"/><path d="M4 11h8v3H4z"/>
            </svg>
            {t("cz.rep.print")}
          </button>

          {/* PDF */}
          <button onClick={doPdf} disabled={specimens.length === 0}
            className="flex items-center gap-1.5 border border-alarm/50 bg-alarm/8 px-3 py-1.5 font-mono text-[10px] uppercase text-alarmhi hover:bg-alarm/16 hover:border-alarm transition-colors disabled:opacity-35">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5z"/><path d="M9 1.5v4h4"/>
            </svg>
            {t("cz.rep.pdf")}
          </button>

          {/* EXCEL */}
          <button onClick={doExcel} disabled={specimens.length === 0}
            className="flex items-center gap-1.5 border border-signaldeep bg-signal/8 px-3 py-1.5 font-mono text-[10px] uppercase text-signal hover:bg-signal/16 transition-colors disabled:opacity-35">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="2" y="2" width="12" height="12" rx="1"/><path d="M6 2v12M2 6h12"/><path d="m8.5 8.5 3 3m0-3-3 3"/>
            </svg>
            {t("cz.rep.excel")}
          </button>

          {/* CSV */}
          <button onClick={exportCSV} disabled={specimens.length === 0}
            className="flex items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[10px] uppercase text-dim hover:text-mute hover:border-copperdim transition-colors disabled:opacity-35">
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="12" height="12" rx="1"/><path d="M5 8h6M5 11h4"/></svg>
            CSV
          </button>

          {/* TXT */}
          <button onClick={exportReport} disabled={specimens.length === 0}
            className="flex items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[10px] uppercase text-dim hover:text-mute hover:border-copperdim transition-colors disabled:opacity-35">
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 10V4m-3 3 3 3 3-3"/><path d="M2 12h12"/></svg>
            TXT
          </button>
        </div>
      </div>

      {/* stats bar */}
      {specimens.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: "Total",      val: specimens.length, tone: "text-paper" },
            { label: t("cz.rep.pass"), val: specimens.filter(s => s.verdict === "PASS").length, tone: "text-signal" },
            { label: t("cz.rep.fail"), val: specimens.filter(s => s.verdict === "FAIL").length, tone: "text-alarm" },
            { label: "Avg MPa",    val: (specimens.reduce((s, r) => s + r.strengthMPa, 0) / specimens.length).toFixed(1), tone: "text-copper" },
            { label: "🔒 Genuine", val: specimens.filter(s => s.badge === "PROPRIETARY_CERTIFIED").length, tone: "text-signal" },
          ].map(c => (
            <div key={c.label} className="border border-line bg-scope/30 px-3 py-2.5 text-center">
              <div className={cn("font-mono font-bold text-[22px] tabular-nums", c.tone)}>{c.val}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-dim mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {specimens.length === 0 ? (
        <div className="border border-line bg-scope/20 px-6 py-10 text-center font-body text-[13px] text-mute">{t("cz.rep.empty")}</div>
      ) : (
        <div className="border border-line overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[760px]">
              <thead>
                <tr className="border-b border-line bg-raise/30 font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim">
                  {["#", t("cz.rep.specimen"), t("cz.rep.age"), t("cz.rep.mpa"), t("cz.read.damage"), "Badge", "ROM ID", t("cz.rep.verdict"), t("cz.rep.date")].map(h => (
                    <th key={h} className="px-3 py-2.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specimens.map((s, i) => (
                  <tr key={s.id} className="border-b border-line/50 last:border-0 hover:bg-raise/30 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-[10.5px] text-dim">{i + 1}</td>
                    <td className="px-3 py-2.5 font-body text-[12px] text-paper max-w-[120px] truncate">{s.label}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-mute">{s.age}d</td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-[13px] text-paper">{s.strengthMPa}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-mute">{s.damage}%</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("border px-1.5 py-0.5 font-mono text-[8.5px] uppercase",
                        s.badge === "PROPRIETARY_CERTIFIED"
                          ? "text-signal border-signaldeep bg-signal/8"
                          : "text-dim border-line bg-scope/40")}>
                        {s.badge === "PROPRIETARY_CERTIFIED" ? "🔒 Genuine" : "⚡ Generic"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[9px] text-teal max-w-[100px] truncate" title={s.romId ?? "N/A"}>
                      {s.romId ?? "N/A"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]", verdictTone(s.verdict))}>
                        {t(`cz.rep.${s.verdict.toLowerCase()}` as Parameters<typeof t>[0])}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[10px] text-dim whitespace-nowrap">
                      {new Date(s.savedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ *
 *  MAIN CLIENT ZONE
 * ================================================================ */
export default function ClientZone({ sim }: { sim: NodeSim }) {
  const { t } = useLang();
  const [tab, setTab]                     = useState<Tab>("projects");
  const [projects, setProjects]           = useState<Project[]>(loadProjects);
  const [batches, setBatches]             = useState<SensorBatch[]>(loadBatches);
  const [activeId, setActiveId]           = useState<string | null>(null);
  const [connected, setConnected]         = useState(false);
  const [wallet, setWallet]               = useState<TokenWallet | null>(null);
  const [txns, setTxns]                   = useState<TokenTxn[]>([]);
  const [ordering, setOrdering]           = useState(false);

  const activeProject = projects.find(p => p.id === activeId) ?? null;

  /* load wallet + ledger on mount */
  useEffect(() => {
    (async () => {
      const w = await getOrCreateWallet();
      setWallet(w);
      const ledger = await tokenDb.getRecentTxns(24);
      setTxns(ledger);
    })();
  }, []);

  /* re-sync whenever Lifecycle.tsx mutates the onboarding revision */
  useEffect(() => {
    (async () => {
      const w = await getOrCreateWallet();
      setWallet(w);
      const ledger = await tokenDb.getRecentTxns(24);
      setTxns(ledger);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardSession.revision]);

  const persistProjects = (updated: Project[]) => {
    setProjects(updated);
    persistProjectsToDisk(updated);
  };

  const persistBatchesList = (updated: SensorBatch[]) => {
    setBatches(updated);
    persistBatches(updated);
  };

  const addProject = (p: Project) => {
    persistProjects([...projects, p]);
    setActiveId(p.id);
    setTab("connect");
  };

  const deleteProject = (id: string) => {
    persistProjects(projects.filter(p => p.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const selectProject = (id: string) => setActiveId(id);

  /* deduct 1 token for a certified session */
  const deductForSession = async (projectId: string): Promise<{ romId: string; wallet: TokenWallet }> => {
    const romId = generateRomId();
    const nextWallet = await deductToken("PROPRIETARY_CERTIFIED", romId, projectId, null);
    setWallet(nextWallet);
    const ledger = await tokenDb.getRecentTxns(24);
    setTxns(ledger);
    return { romId, wallet: nextWallet };
  };

  /* marketplace batch order */
  const handleOrder = async (qty: number): Promise<void> => {
    setOrdering(true);
    await new Promise(res => setTimeout(res, 1400));
    const { wallet: newWallet, batch } = await fulfillBatch(qty);
    setWallet(newWallet);
    persistBatchesList([...batches, batch]);
    const ledger = await tokenDb.getRecentTxns(24);
    setTxns(ledger);
    setOrdering(false);
  };

  const saveReading = (r: SpecimenRecord): void => {
    if (!activeId) return;
    const updated = projects.map(p => {
      if (p.id !== activeId) return p;
      const specimens = [...p.specimens, r];
      const allPass = specimens.every(s => s.verdict === "PASS");
      const anyFail = specimens.some(s => s.verdict === "FAIL");
      return { ...p, specimens, status: (allPass ? "ok" : anyFail ? "fail" : "pending") as Project["status"] };
    });
    persistProjects(updated);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "projects", label: t("cz.tab.projects"), badge: projects.length,
      icon: <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="5" height="5" rx="0.5"/><rect x="9" y="2" width="5" height="5" rx="0.5"/><rect x="2" y="9" width="5" height="5" rx="0.5"/><path d="M9 11.5h5M11.5 9v5"/></svg> },
    { id: "connect",  label: t("cz.tab.connect"),
      icon: <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 5a3 3 0 0 1 0 6H6a3 3 0 0 1 0-6h4z"/><circle cx="6" cy="8" r="1.2" fill="currentColor"/><circle cx="10" cy="8" r="1.2" fill="currentColor"/></svg> },
    { id: "readings", label: t("cz.tab.readings"),
      icon: <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="2,10 5,5 8,9 11,4 14,7"/></svg> },
    { id: "reports",  label: t("cz.tab.reports"), badge: activeProject?.specimens.length,
      icon: <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="1" width="10" height="14" rx="1"/><path d="M6 5h4M6 8h4M6 11h2"/></svg> },
  ];

  return (
    <section className="panel panel-corner overflow-hidden" id="client-zone" aria-label={t("cz.title")}>
      {/* ── header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 border-b border-line bg-raise/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center border border-copperdim bg-copper/10 shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-copper" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-copper">{t("cz.kicker")}</div>
            <div className="font-display font-bold text-[18px] text-paper tracking-wide">{t("cz.title")}</div>
          </div>
        </div>
        {activeProject && (
          <div className="flex items-center gap-2 border border-copperdim bg-copper/8 px-2.5 py-1.5 font-mono text-[10.5px]">
            <span className="text-dim">↳</span>
            <span className="text-copper">{activeProject.name}</span>
            <span className="text-dim">·</span>
            <span className="text-mute">{activeProject.concrete}</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Led tone={connected ? "signal" : "dim"} size={7} live={connected} />
          <span className="font-mono text-[9.5px] text-dim">{connected ? t("cz.dev.connected") : t("cz.dev.notconnected")}</span>
        </div>
      </div>

      {/* ── token bank strip ─────────────────────────────────────── */}
      <TokenBank wallet={wallet} ordering={ordering} onOrder={qty => { void handleOrder(qty); }} />
      <div className="px-5 pt-4 pb-0">
        <ShipmentTracker batches={batches} />
        <TokenLedger txns={txns} />
      </div>

      {/* ── subtitle ────────────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-0">
        <p className="text-[13px] text-mute leading-relaxed max-w-3xl">{t("cz.subtitle")}</p>
      </div>

      {/* ── tabs ─────────────────────────────────────────────────── */}
      <div className="flex overflow-x-auto border-b border-line mt-4 px-5 gap-0" dir="ltr">
        {TABS.map(tb => (
          <TabBtn key={tb.id} active={tab === tb.id} icon={tb.icon} label={tb.label} badge={tb.badge} onClick={() => setTab(tb.id)} />
        ))}
      </div>

      {/* ── tab body ─────────────────────────────────────────────── */}
      <div className="p-5">
        {tab === "projects" && (
          <TabProjects projects={projects} activeId={activeId} batches={batches} onSelect={selectProject} onNew={addProject} onDelete={deleteProject} />
        )}
        {tab === "connect" && (
          <TabDevice sim={sim} connected={connected} onConnect={() => setConnected(true)} onDisconnect={() => setConnected(false)} />
        )}
        {tab === "readings" && (
          <TabReadings sim={sim} connected={connected} activeProject={activeProject} wallet={wallet} onSaveReading={saveReading} onDeduct={deductForSession} />
        )}
        {tab === "reports" && (
          <TabReports activeProject={activeProject} wallet={wallet} />
        )}
      </div>
    </section>
  );
}
