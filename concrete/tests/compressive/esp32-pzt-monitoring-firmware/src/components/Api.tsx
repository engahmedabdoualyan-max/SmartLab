import { useMemo } from "react";
import type { NodeSim } from "../sim";
import { SCHEMA_ROWS } from "./Hardware";
import { Led, Reveal } from "../ui";
import { cn } from "../utils/cn";

/* ── JSON syntax tinting ───────────────────────────────────────── */
function JsonView({ json }: { json: string }) {
  const nodes = useMemo(() => {
    const re = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)/gi;
    const out: { text: string; cls: string }[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(json))) {
      if (m.index > last) out.push({ text: json.slice(last, m.index), cls: "text-dim" });
      if (m[1] !== undefined) {
        out.push({
          text: m[1],
          cls: m[2] ? "text-copper" : "text-[#b7d18a]",
        });
        if (m[2]) out.push({ text: m[2], cls: "text-dim" });
      } else if (m[3] !== undefined) {
        out.push({ text: m[3], cls: "text-alarm" });
      } else if (m[4] !== undefined) {
        out.push({ text: m[4], cls: "text-paper" });
      }
      last = re.lastIndex;
    }
    if (last < json.length) out.push({ text: json.slice(last), cls: "text-dim" });
    return out;
  }, [json]);
  return (
    <pre className="font-mono text-[12px] leading-[1.7] overflow-x-auto">
      {nodes.map((n, i) => (
        <span key={i} className={n.cls}>
          {n.text}
        </span>
      ))}
    </pre>
  );
}

const CURL = `curl -X POST https://fimtosoft.com/api/v1/telemetry \\
  -H "Content-Type: application/json" \\
  -H "X-Node-Id: PZT-9F3A2C" \\
  -H "X-Protocol: smartlab-shm/2.4" \\
  -d '{ "session_id": "PZT-9F3A2C", "voltage_peak": 660.8,
        "resistance": 0.250, "frequency": 212.4, "status": "ACTIVE" }'`;

const ENDPOINT_ROWS: [string, string][] = [
  ["Endpoint", "https://fimtosoft.com/api/v1/telemetry"],
  ["Method", "POST · HTTP/1.1 over TLS 1.2+"],
  ["Cadence", "1000 ms — hard requirement, drift-free millis() gate"],
  ["Timeout", "2200 ms hard cap (HTTPClient::setTimeout)"],
  ["Headers", "Content-Type · X-Node-Id · X-Protocol: smartlab-shm/2.4"],
  ["TLS", "pinned root CA in production · setInsecure() bench-only"],
  ["Accept", "200 / 201 / 202 — anything else → spool + backoff"],
];

const BACKOFF = [
  { s: "1 s", w: "12.5%", note: "nominal cadence" },
  { s: "2 s", w: "25%", note: "first failure" },
  { s: "4 s", w: "50%", note: "link degraded" },
  { s: "8 s", w: "100%", note: "ceiling · spool armed" },
];

export default function Api({ sim }: { sim: NodeSim }) {
  const latest = sim.packets[0];
  const crashed = latest?.fault || sim.status === "CRUSHED";
  const qaWarning = crashed || latest?.certification === "BLOCKED" || latest?.certification === "NOT_CERTIFIED";

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] items-start">
      {/* live payload mirror */}
      <Reveal>
        <div className={cn("panel panel-corner overflow-hidden", qaWarning && "border-alarm/60")}>
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-line">
            <Led tone={qaWarning ? "alarm" : "signal"} />
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute">
              payload mirror — latest frame off the wire
            </span>
            <span className="ml-auto font-mono text-[10px] text-dim">
              {latest ? `#${String(latest.id).padStart(3, "0")}` : "—"}
            </span>
          </div>
          <div className="px-4 py-3 bg-scope/70 code-surface min-h-[300px]">
            {latest ? (
              <JsonView json={latest.json} />
            ) : (
              <div className="font-mono text-[12px] text-dim pt-6">
                — awaiting first telemetry frame (link establishing) —
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 border-t border-line font-mono text-[10.5px]",
              qaWarning ? "text-alarm" : "text-signal"
            )}
          >
            <span>
              {latest?.fault
                ? "queued ahead of schedule"
                : latest?.route === "BUFFERED"
                ? "persisted to IndexedDB outbox"
                : latest?.route === "RECOVERING"
                ? "concurrent replay lane active"
                : latest?.route === "RECOVERED"
                ? "historical frame replayed: 202 Accepted"
                : "HTTP/1.1 201 Created"}
            </span>
            <span className="text-dim">{latest ? `${(180 + (latest.id % 7) * 61)} ms round-trip` : ""}</span>
            <span className="ml-auto text-dim">
              {latest ? `route: ${latest.route.toLowerCase()} · cert: ${latest.certification.toLowerCase().replace("_", " ")}` : "serial mirror: awaiting frame"}
            </span>
          </div>
        </div>
      </Reveal>

      {/* contract */}
      <div className="space-y-5">
        <Reveal delay={70}>
          <div className="panel overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line font-mono text-[11px] tracking-[0.2em] uppercase text-copper">
              smartLAB API contract
            </div>
            <dl>
              {ENDPOINT_ROWS.map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[92px_1fr] gap-3 px-4 py-2 border-b border-line/60 last:border-0 hover:bg-raise/50 transition-colors"
                >
                  <dt className="font-mono text-[10.5px] text-dim uppercase tracking-wider pt-0.5">{k}</dt>
                  <dd className="font-mono text-[12px] text-paper break-all">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={130}>
          <div className="panel px-4 py-4">
            <div className="flex items-baseline justify-between mb-3">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper">
                retry ladder — exponential, self-healing
              </span>
              <span className="font-mono text-[10px] text-dim">resets to 1 s on any 2xx</span>
            </div>
            <div className="space-y-2">
              {BACKOFF.map((b, i) => (
                <div key={b.s} className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-mute w-8">{b.s}</span>
                  <div className="flex-1 h-3.5 bg-deep border border-line overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: b.w,
                        background:
                          i === 3
                            ? "repeating-linear-gradient(45deg, rgba(228,89,60,0.5) 0 6px, rgba(228,89,60,0.25) 6px 12px)"
                            : "linear-gradient(90deg, rgba(127,184,164,0.55), rgba(127,184,164,0.3))",
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-dim w-32 text-right">{b.note}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={190}>
          <div className="panel overflow-hidden">
            <div className="px-4 py-2 border-b border-line font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
              bench replay
            </div>
            <pre className="px-4 py-3 font-mono text-[11px] leading-[1.7] text-[#b7d18a] overflow-x-auto bg-scope/70 code-surface">
              {CURL}
            </pre>
          </div>
        </Reveal>
      </div>

      {/* schema */}
      <Reveal className="lg:col-span-2" delay={60}>
        <div className="panel overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line font-mono text-[11px] tracking-[0.2em] uppercase text-copper">
            Telemetry field schema — v2.4
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] tracking-[0.18em] uppercase text-dim">
                  <th className="px-4 py-2 font-medium">field</th>
                  <th className="px-3 py-2 font-medium">type</th>
                  <th className="px-3 py-2 font-medium">unit</th>
                  <th className="px-4 py-2 font-medium">description</th>
                </tr>
              </thead>
              <tbody>
                {SCHEMA_ROWS.map(([f, t, u, d]) => (
                  <tr key={f} className="border-b border-line/50 last:border-0 hover:bg-raise/50 transition-colors">
                    <td className="px-4 py-2 font-mono text-[12px] text-copper whitespace-nowrap">{f}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-teal whitespace-nowrap">{t}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-mute">{u}</td>
                    <td className="px-4 py-2 font-body text-[12px] text-mute">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
