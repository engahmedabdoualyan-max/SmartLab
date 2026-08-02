import { useEffect, useState } from "react";
import type { NodeSim, PacketRec } from "../sim";
import { MAX_BUFFERED_FRAMES } from "../sim";
import { Led } from "../ui";
import { cn } from "../utils/cn";

/* ── columns ───────────────────────────────────────────────────── */
const COLS: { key: keyof OutboxRow | "syncState" | "localMPa" | "retries"; label: string; mono?: boolean; width: string }[] = [
  { key: "id", label: "#", mono: true, width: "w-[50px]" },
  { key: "tick", label: "Monotonic Tick", mono: true, width: "w-[78px]" },
  { key: "localMPa", label: "Local MPa", mono: true, width: "w-[84px]" },
  { key: "route", label: "Route", width: "w-[90px]" },
  { key: "syncState", label: "Sync State", width: "w-[90px]" },
  { key: "retries", label: "Retries", mono: true, width: "w-[62px]" },
  { key: "certification", label: "Cert", width: "w-[108px]" },
];

interface OutboxRow {
  id: number;
  tick: string;
  route: string;
  syncState: string;
  localMPa: string;
  retries: number;
  certification: string;
  packet: PacketRec;
}

function buildRows(packets: PacketRec[], sim: NodeSim): OutboxRow[] {
  return packets
    .filter((p) => p.route === "BUFFERED" || p.route === "RECOVERING" || p.route === "RECOVERED" || p.route === "DROPPED" || p.route === "LIVE")
    .map((p) => {
      const mpa = sim.plowmanStrength(p.virtualDay);
      const syncState =
        p.route === "LIVE"
          ? "FLUSHED"
          : p.route === "RECOVERED"
          ? "FLUSHED"
          : p.route === "DROPPED"
          ? "DROPPED"
          : "PENDING";
      return {
        id: p.id,
        tick: p.t.toFixed(2),
        route: p.route,
        syncState,
        localMPa: mpa.toFixed(2),
        retries: p.attempts,
        certification: p.certification.replace("_", " "),
        packet: p,
      };
    })
    .slice(0, 80);
}

export default function OutboxGrid({ sim }: { sim: NodeSim }) {
  const [, setTick] = useState(0);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(iv);
  }, []);

  /* Show buffered + recently recovered/live frames */
  const rows = buildRows(sim.packets, sim);
  const pending = rows.filter((r) => r.syncState === "PENDING").length;
  const flushed = rows.filter((r) => r.syncState === "FLUSHED").length;
  const dropped = rows.filter((r) => r.syncState === "DROPPED").length;

  return (
    <div className="panel panel-corner overflow-hidden">
      {/* header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 border-b border-line bg-raise/40">
        <Led tone={sim.networkBlackout ? "alarm" : pending > 0 ? "copper" : "signal"} size={7} />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-paper">
          Offline Frame Outbox Grid
        </span>
        <span className="font-mono text-[10px] text-dim">
          {sim.networkBlackout ? "BLACKOUT ACTIVE" : sim.recovering ? "RECOVERING" : "LIVE"}
        </span>
        <div className="ml-auto flex items-center gap-3 font-mono text-[10px]">
          <span className="text-dim">
            db depth <span className="text-copper">{sim.diagnostics.bufferDepth}</span>/{MAX_BUFFERED_FRAMES}
          </span>
          <span className="text-signal">{flushed} flushed</span>
          <span className="text-copper">{pending} pending</span>
          {dropped > 0 && <span className="text-alarm">{dropped} dropped</span>}
          <button
            onClick={() => setExpanded(!expanded)}
            className="border border-line2 px-2 py-0.5 font-mono text-[10px] text-mute hover:text-paper transition-colors"
          >
            {expanded ? "collapse" : "expand"}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* column headers */}
          <div className={cn("grid divide-x divide-line border-b border-line font-mono text-[10px] tracking-[0.14em] uppercase text-dim bg-raise/30")}
            style={{ gridTemplateColumns: COLS.map((c) => c.width).join(" ") }}
          >
            {COLS.map((c) => (
              <div key={c.key} className="px-3 py-2">
                {c.label}
              </div>
            ))}
          </div>

          {/* rows */}
          <div className="max-h-[320px] overflow-y-auto bg-scope/70">
            {rows.length === 0 ? (
              <div className="px-4 py-4 font-mono text-[11px] text-dim">
                no frames in the outbox — toggle network blackout to start buffering
              </div>
            ) : (
              rows.map((r) => {
                const isPending = r.syncState === "PENDING";
                const isDropped = r.syncState === "DROPPED";
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "grid border-b border-line/50 font-mono text-[10.5px] leading-loose hover:bg-raise/40 transition-colors",
                      isDropped && "bg-alarm/5",
                      isPending && "bg-copper/5"
                    )}
                    style={{ gridTemplateColumns: COLS.map((c) => c.width).join(" ") }}
                  >
                    <div className="px-3 py-1.5 text-dim">{r.id}</div>
                    <div className="px-3 py-1.5 text-mute tabular-nums">{r.tick}s</div>
                    <div className="px-3 py-1.5 text-paper tabular-nums">{r.localMPa}</div>
                    <div
                      className={cn(
                        "px-3 py-1.5",
                        r.route === "LIVE"
                          ? "text-signal"
                          : r.route === "BUFFERED"
                          ? "text-copper"
                          : r.route === "RECOVERING"
                          ? "text-copperhi"
                          : r.route === "RECOVERED"
                          ? "text-teal"
                          : "text-alarm"
                      )}
                    >
                      {r.route.toLowerCase()}
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1.5",
                        isPending ? "text-copper" : isDropped ? "text-alarm" : "text-signal"
                      )}
                    >
                      {r.syncState}
                    </div>
                    <div className="px-3 py-1.5 text-mute tabular-nums">{r.retries}</div>
                    <div
                      className={cn(
                        "px-3 py-1.5",
                        r.certification === "NOT CERTIFIED" || r.certification === "BLOCKED"
                          ? "text-alarm"
                          : r.certification === "CERTIFIED"
                          ? "text-signal"
                          : "text-dim"
                      )}
                    >
                      {r.certification.toLowerCase()}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* summary footer */}
          <div className="border-t border-line px-4 py-2 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] text-dim">
            <span>rows: {rows.length}</span>
            <span>unique sessions: 1</span>
            <span>storage engine: indexeddb</span>
            <span className="ml-auto">
              last sync:{" "}
              <span className={pending === 0 ? "text-signal" : "text-copper"}>
                {pending === 0 ? "fully flushed" : `${pending} pending`}
              </span>
            </span>
          </div>
        </>
      )}

      {!expanded && (
        <div className="px-4 py-2.5 flex items-center gap-4 font-mono text-[10.5px] text-dim">
          <span>frames in outbox: <span className="text-copper">{sim.diagnostics.bufferDepth}</span></span>
          <span>pending: <span className="text-copper">{pending}</span></span>
          <span>recovered: <span className="text-teal">{sim.diagnostics.framesRecovered}</span></span>
          <span className="ml-auto">click expand to inspect rows</span>
        </div>
      )}
    </div>
  );
}
