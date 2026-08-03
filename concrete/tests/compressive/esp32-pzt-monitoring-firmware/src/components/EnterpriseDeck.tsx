/* ------------------------------------------------------------------ *
 *  EnterpriseDeck.tsx — smartLAB Enterprise Suite · v1.9.0
 *
 *  Tab 1 · Digital Twin  — 3D twin, multi-sensor viewer, strength predict
 *  Tab 2 · Calibration   — AI Plowman regression wizard (learns A/B)
 *  Tab 3 · Certification — clearance-cert evidence log
 *
 *  The v1.9.0 enterprise layer sits on top of the existing NodeSim and
 *  the new regression engine. It does NOT change ADC streaming paths.
 * ------------------------------------------------------------------ */

import { useState } from "react";
import type { NodeSim } from "../sim";
import { useLang } from "../i18n";
import { Led } from "../ui";
import { cn } from "../utils/cn";
import DigitalTwin from "./DigitalTwin";
import CalibrationWizard from "./CalibrationWizard";
import { loadCalibration, type CalibrationModel } from "../regression";

type EntTab = "twin" | "calibration" | "certification";

function TabBtn({ active, onClick, icon, label, sub }: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 min-w-[200px] text-start border px-4 py-3 transition-all duration-200",
        active
          ? "border-copper bg-copper/10"
          : "border-line bg-scope/20 hover:border-copperdim/60 hover:bg-raise/30"
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn(
          "w-7 h-7 flex items-center justify-center border shrink-0",
          active ? "border-copper text-copper" : "border-line text-dim"
        )}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className={cn(
            "font-mono text-[11px] uppercase tracking-[0.14em] leading-tight",
            active ? "text-paper" : "text-mute"
          )}>
            {label}
          </div>
          <div className="font-mono text-[8.5px] text-dim uppercase tracking-[0.12em] mt-0.5 truncate">
            {sub}
          </div>
        </div>
      </div>
    </button>
  );
}

const Ico = {
  cube: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1.5 5.5 9 1.5l7.5 4v7L9 16.5l-7.5-4z"/>
      <path d="M1.5 5.5 9 9.5m0 0 7.5-4M9 9.5v7"/>
    </svg>
  ),
  calib: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="2,13 5,8 8,10 11,4 15,7"/>
      <circle cx="2" cy="13" r="1.4"/>
      <circle cx="5" cy="8" r="1.4"/>
      <circle cx="8" cy="10" r="1.4"/>
      <circle cx="11" cy="4" r="1.4"/>
      <circle cx="15" cy="7" r="1.4"/>
    </svg>
  ),
  cert: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="2" width="12" height="14" rx="1"/>
      <path d="M6 6h6M6 9h6M6 12h4"/>
      <path d="M11 15.5 13.5 18 17 14.5" strokeLinecap="round"/>
    </svg>
  ),
};

export default function EnterpriseDeck({ sim }: { sim: NodeSim }) {
  const { t } = useLang();
  const [tab, setTab] = useState<EntTab>("twin");
  const [calib, setCalib] = useState<CalibrationModel>(() => loadCalibration());

  const syncCalib = (next: CalibrationModel) => setCalib(next);

  const tabMeta: Record<EntTab, { label: string; sub: string; icon: React.ReactNode }> = {
    twin: {
      label: t("ent.tab.twin"),
      sub:   t("ent.tab.twin.sub"),
      icon:  Ico.cube,
    },
    calibration: {
      label: t("ent.tab.calib"),
      sub:   t("ent.tab.calib.sub"),
      icon:  Ico.calib,
    },
    certification: {
      label: t("ent.tab.cert"),
      sub:   t("ent.tab.cert.sub"),
      icon:  Ico.cert,
    },
  };

  return (
    <section className="panel panel-corner overflow-hidden" id="enterprise">
      {/* header bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 border-b border-line bg-raise/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center border border-copperdim bg-copper/10 shrink-0 text-copper">
            {Ico.cube}
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-copper">
              {t("ent.kicker")}
            </div>
            <div className="font-display font-bold text-[17px] text-paper tracking-wide">
              {t("ent.title")}
            </div>
          </div>
        </div>
        <span
          className="border border-signaldeep bg-signal/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-signal"
          dir="ltr"
        >
          v1.9.0
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Led tone="signal" size={7} live />
          <span className="font-mono text-[9.5px] text-dim">{t("ent.live")}</span>
        </div>
      </div>

      {/* tab strip */}
      <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-line bg-deep/40">
        {(Object.keys(tabMeta) as EntTab[]).map(k => (
          <TabBtn
            key={k}
            active={tab === k}
            onClick={() => setTab(k)}
            icon={tabMeta[k].icon}
            label={tabMeta[k].label}
            sub={tabMeta[k].sub}
          />
        ))}
      </div>

      {/* body */}
      <div className="p-4 md:p-5">
        {tab === "twin"        && <DigitalTwin sim={sim} calib={calib} />}
        {tab === "calibration" && <CalibrationWizard sim={sim} onModelChange={syncCalib} />}
        {tab === "certification" && (
          <div className="font-mono text-[11px] text-mute max-w-prose leading-relaxed space-y-2">
            <p>{t("ent.cert.notes1")}</p>
            <p>{t("ent.cert.notes2")}</p>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="border-t border-line px-4 py-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[9px] text-dim/75" dir="ltr">
        <span>suite: Enterprise v1.9.0</span>
        <span>model maturity law: fc(t) = A·ln(t) + B</span>
        <span className="ms-auto">{t("ent.footer")}</span>
      </div>
    </section>
  );
}
