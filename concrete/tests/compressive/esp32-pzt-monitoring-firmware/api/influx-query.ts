/* ==================================================================
 *  api/influx-query.ts — Vercel Serverless Function
 *
 *  WHY THIS FILE EXISTS
 *  ────────────────────
 *  InfluxDB 3 (Cloud Serverless) answers SQL over Arrow Flight / gRPC.
 *  Browsers cannot speak gRPC, so a SQL query can never be issued
 *  directly from the dashboard. This function is the bridge.
 *
 *  It is also the security boundary: the InfluxDB token lives here as
 *  a server-side environment variable and is NEVER shipped to the
 *  browser. The frontend only ever learns the *rows*, never the token.
 *
 *  Deploy: place at /api/influx-query.ts in a Vercel project.
 *  Configure INFLUX_HOST / INFLUX_DATABASE / INFLUX_TOKEN in the
 *  Vercel dashboard → Settings → Environment Variables.
 * ================================================================== */

import { InfluxDBClient } from "@influxdata/influxdb3-client";

/* ── request contract ────────────────────────────────────────────── */
type QueryKind =
  | "latest_sweep"
  | "baseline_sweep"
  | "rmsd_history"
  | "latest_scalars"
  | "sessions";

interface QueryBody {
  kind: QueryKind;
  sessionId?: string;
  hours?: number;
}

/* ── hardening ───────────────────────────────────────────────────── */

/** Session ids are the only user-controlled value that reaches SQL.
 *  Whitelist strictly rather than trying to escape. */
const SESSION_RE = /^[A-Za-z0-9_\-:.]{1,64}$/;

const MEASUREMENT = "emi_sweep";

function clampHours(h: unknown): number {
  const n = typeof h === "number" && Number.isFinite(h) ? Math.floor(h) : 24;
  return Math.min(Math.max(n, 1), 24 * 90); // 1 hour … 90 days
}

/* ── SQL builders (DataFusion dialect used by InfluxDB 3) ────────── */

function sqlLatestSweep(session: string): string {
  return `
    SELECT freq_khz, conductance_us, susceptance_us, time
    FROM "${MEASUREMENT}"
    WHERE session_id = '${session}'
      AND time >= now() - INTERVAL '48 hours'
      AND sweep_id = (
        SELECT max(sweep_id) FROM "${MEASUREMENT}"
        WHERE session_id = '${session}'
          AND time >= now() - INTERVAL '48 hours'
      )
    ORDER BY freq_khz ASC
  `;
}

function sqlBaselineSweep(session: string): string {
  return `
    SELECT freq_khz, conductance_us, susceptance_us, time
    FROM "${MEASUREMENT}"
    WHERE session_id = '${session}'
      AND sweep_id = (
        SELECT min(sweep_id) FROM "${MEASUREMENT}"
        WHERE session_id = '${session}'
      )
    ORDER BY freq_khz ASC
  `;
}

function sqlRmsdHistory(session: string, hours: number): string {
  /* Bucket width scales with the window so the payload stays bounded. */
  const bin = hours <= 6 ? "1 minute" : hours <= 48 ? "15 minutes" : "1 hour";
  return `
    SELECT
      date_bin(INTERVAL '${bin}', time) AS bucket,
      avg(damage_rmsd)              AS rmsd_avg,
      max(damage_rmsd)              AS rmsd_max,
      avg(res_freq_khz)             AS fres_avg,
      avg(temp_c)                   AS temp_avg,
      avg(resistance_kohm)          AS r_avg,
      avg(test_age_days)            AS age_avg,
      avg(calculated_strength_mpa)  AS mpa_avg,
      count(1)                      AS n
    FROM "${MEASUREMENT}"
    WHERE session_id = '${session}'
      AND time >= now() - INTERVAL '${hours} hours'
    GROUP BY bucket
    ORDER BY bucket ASC
  `;
}

function sqlLatestScalars(session: string): string {
  return `
    SELECT time, voltage_mv, resistance_kohm, res_freq_khz,
           damage_rmsd, temp_c, hydration_pct,
           test_age_days, calculated_strength_mpa
    FROM "${MEASUREMENT}"
    WHERE session_id = '${session}'
      AND time >= now() - INTERVAL '48 hours'
    ORDER BY time DESC
    LIMIT 1
  `;
}

function sqlSessions(hours: number): string {
  return `
    SELECT session_id,
           count(1)   AS points,
           max(time)  AS last_seen
    FROM "${MEASUREMENT}"
    WHERE time >= now() - INTERVAL '${hours} hours'
    GROUP BY session_id
    ORDER BY last_seen DESC
    LIMIT 50
  `;
}

/* ── CORS ────────────────────────────────────────────────────────── */
function corsOrigin(req: Request): string | null {
  const allowed = (process.env.INFLUX_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const origin = req.headers.get("origin");
  if (!origin) return null;
  if (allowed.length === 0) return null;
  return allowed.includes(origin) ? origin : null;
}

function headersFor(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
  if (origin) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Vary"] = "Origin";
    h["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return h;
}

/* ── handler ─────────────────────────────────────────────────────── */
export default async function handler(req: Request): Promise<Response> {
  const origin = corsOrigin(req);
  const H = headersFor(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: H });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: H,
    });
  }

  const host = process.env.INFLUX_HOST;
  const token = process.env.INFLUX_TOKEN;
  const database = process.env.INFLUX_DATABASE;

  if (!host || !token || !database) {
    return new Response(
      JSON.stringify({
        error: "server_not_configured",
        detail:
          "Set INFLUX_HOST, INFLUX_TOKEN and INFLUX_DATABASE in the deployment environment.",
      }),
      { status: 500, headers: H }
    );
  }

  let body: QueryBody;
  try {
    body = (await req.json()) as QueryBody;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: H,
    });
  }

  const hours = clampHours(body.hours);
  const session = body.sessionId ?? "";

  const needsSession: QueryKind[] = [
    "latest_sweep", "baseline_sweep", "rmsd_history", "latest_scalars",
  ];
  if (needsSession.includes(body.kind) && !SESSION_RE.test(session)) {
    return new Response(
      JSON.stringify({ error: "invalid_session_id" }),
      { status: 400, headers: H }
    );
  }

  let sql: string;
  switch (body.kind) {
    case "latest_sweep":   sql = sqlLatestSweep(session); break;
    case "baseline_sweep": sql = sqlBaselineSweep(session); break;
    case "rmsd_history":   sql = sqlRmsdHistory(session, hours); break;
    case "latest_scalars": sql = sqlLatestScalars(session); break;
    case "sessions":       sql = sqlSessions(hours); break;
    default:
      return new Response(JSON.stringify({ error: "unknown_kind" }), {
        status: 400, headers: H,
      });
  }

  const client = new InfluxDBClient({ host, token, database });
  try {
    const rows: Record<string, unknown>[] = [];
    for await (const row of client.query(sql, database)) {
      /* Arrow rows arrive as objects; normalise BigInt so JSON.stringify
         does not throw on 64-bit counters. */
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
        clean[k] = typeof v === "bigint" ? Number(v) : v;
      }
      rows.push(clean);
      if (rows.length >= 5000) break; // hard payload ceiling
    }
    return new Response(
      JSON.stringify({ ok: true, kind: body.kind, count: rows.length, rows }),
      { status: 200, headers: H }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "query_failed",
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 502, headers: H }
    );
  } finally {
    await client.close().catch(() => undefined);
  }
}
