/* ------------------------------------------------------------------ *
 *  searchIndex.ts — unified site search corpus
 *
 *  Pulls live entries from the firmware source map, the bibliography
 *  and the hardware pin contract, then merges them with the static
 *  section / glossary records. Titles + subtitles are i18n keys where
 *  a translation exists, plain strings otherwise.
 * ------------------------------------------------------------------ */

import { FIRMWARE_SECTIONS } from "./firmware";
import { REFERENCES } from "./references";

export type HitKind =
  | "section"
  | "firmware"
  | "reference"
  | "pin"
  | "glossary"
  | "action";

export interface SearchHit {
  id: string;
  kind: HitKind;
  /** i18n key OR literal text (resolved by the component) */
  title: string;
  titleIsKey?: boolean;
  subtitle: string;
  /** in-page anchor */
  href: string;
  /** extra terms folded into the match haystack */
  keywords: string;
}

/* ── page sections ──────────────────────────────────────────────── */
const SECTIONS: SearchHit[] = [
  {
    id: "sec-client", kind: "section", href: "#client-zone",
    title: "cz.title", titleIsKey: true,
    subtitle: "Projects · device setup · live readings · reports",
    keywords: "client zone customer projects device readings reports tokens order shipment منطقة العميل مشاريع",
  },
  {
    id: "sec-guide", kind: "section", href: "#guide",
    title: "guide.title", titleIsKey: true,
    subtitle: "Five-step interactive walkthrough",
    keywords: "guide walkthrough tutorial how to use steps flash wire wifi دليل الاستخدام",
  },
  {
    id: "sec-telemetry", kind: "section", href: "#telemetry",
    title: "s01.title", titleIsKey: true,
    subtitle: "Live EMI sweep, divider math and cloud lineage",
    keywords: "telemetry bench sweep scope conductance resistance frequency damage rmsd القياس",
  },
  {
    id: "sec-firmware", kind: "section", href: "#firmware",
    title: "s02.title", titleIsKey: true,
    subtitle: "Full annotated pzt_emi_monitor.ino source",
    keywords: "firmware source code ino arduino esp32 download البرمجيات",
  },
  {
    id: "sec-hardware", kind: "section", href: "#hardware",
    title: "s03.title", titleIsKey: true,
    subtitle: "Voltage divider sensing and pin contract",
    keywords: "hardware interface schematic divider adc pins wiring المكونات",
  },
  {
    id: "sec-arch", kind: "section", href: "#architecture",
    title: "s04.title", titleIsKey: true,
    subtitle: "Cooperative scheduler and failure state machine",
    keywords: "architecture timing gantt state machine loop tasks البنية",
  },
  {
    id: "sec-uplink", kind: "section", href: "#uplink",
    title: "s05.title", titleIsKey: true,
    subtitle: "HTTPS POST contract and retry ladder",
    keywords: "uplink cloud api json post tls backoff spool الاتصال السحابي",
  },
  {
    id: "sec-refs", kind: "section", href: "#references",
    title: "ref.title", titleIsKey: true,
    subtitle: "DOI-verified literature and standards",
    keywords: "references bibliography doi astm papers standards المراجع",
  },
];

/* ── quick actions ──────────────────────────────────────────────── */
const ACTIONS: SearchHit[] = [
  {
    id: "act-download", kind: "action", href: "#firmware",
    title: "Download firmware (.ino)",
    subtitle: "Jump to the source delivery section",
    keywords: "download ino firmware file arduino تحميل",
  },
  {
    id: "act-projects", kind: "action", href: "#client-zone",
    title: "Create a new project",
    subtitle: "Client Zone → My Projects",
    keywords: "new project create specimen مشروع جديد",
  },
  {
    id: "act-reports", kind: "action", href: "#client-zone",
    title: "Print / PDF / Excel report",
    subtitle: "Client Zone → Test Reports",
    keywords: "print pdf excel export report csv طباعة تقرير",
  },
];

/* ── hardware pin contract ──────────────────────────────────────── */
const PINS: SearchHit[] = [
  {
    id: "pin-36", kind: "pin", href: "#hardware",
    title: "GPIO36 — PZT_SENSE",
    subtitle: "ADC1_CH0 · 12-bit · 11 dB · burst 200 × 12 µs",
    keywords: "gpio36 adc1 ch0 sense input analog divider tap",
  },
  {
    id: "pin-25", kind: "pin", href: "#hardware",
    title: "GPIO25 — EXCITE",
    subtitle: "LEDC ch.0 · log sweep 1–500 kHz · 50 % duty",
    keywords: "gpio25 ledc pwm excitation sweep output dc bias",
  },
  {
    id: "pin-2", kind: "pin", href: "#hardware",
    title: "GPIO2 — LED_LINK",
    subtitle: "Heartbeat · 600 ms active · 150 ms linking",
    keywords: "gpio2 led link heartbeat status",
  },
  {
    id: "pin-4", kind: "pin", href: "#hardware",
    title: "GPIO4 — LED_FAULT",
    subtitle: "Crush latch indicator · solid until serial reset",
    keywords: "gpio4 led fault crush latch alarm 1-wire",
  },
];

/* ── glossary ───────────────────────────────────────────────────── */
const GLOSSARY: SearchHit[] = [
  {
    id: "g-emi", kind: "glossary", href: "#hardware",
    title: "EMI — Electromechanical Impedance",
    subtitle: "Admittance of a PZT patch coupled to its host structure",
    keywords: "emi electromechanical impedance admittance conductance susceptance",
  },
  {
    id: "g-rmsd", kind: "glossary", href: "#telemetry",
    title: "RMSD — Root Mean Square Deviation",
    subtitle: "Damage index comparing live spectrum to the baseline",
    keywords: "rmsd damage index statistical metric baseline deviation",
  },
  {
    id: "g-maturity", kind: "glossary", href: "#telemetry",
    title: "ASTM C1074 maturity method",
    subtitle: "Equivalent age tₑ from the core temperature history",
    keywords: "astm c1074 maturity equivalent age temperature time factor arrhenius",
  },
  {
    id: "g-plowman", kind: "glossary", href: "#client-zone",
    title: "Plowman's law — fc(t) = A·ln(t) + B",
    subtitle: "Logarithmic maturity-to-strength calibration",
    keywords: "plowman logarithmic maturity strength mpa calibration gain offset",
  },
  {
    id: "g-sa", kind: "glossary", href: "#hardware",
    title: "Smart aggregate",
    subtitle: "Waterproofed PZT patch cast inside a concrete block",
    keywords: "smart aggregate pzt patch embedded transducer sensor",
  },
  {
    id: "g-crush", kind: "glossary", href: "#architecture",
    title: "CONCRETE_CRUSHED latch",
    subtitle: "Spike ≥ 950 counts then open line within 30 ms",
    keywords: "crush latch failure ultimate strength peak hold fault dual stage",
  },
  {
    id: "g-rom", kind: "glossary", href: "#client-zone",
    title: "1-Wire 64-bit ROM ID",
    subtitle: "Factory identity that unlocks a certified session",
    keywords: "1-wire rom id certified genuine token deduct badge onboarding",
  },
  {
    id: "g-puf", kind: "glossary", href: "#client-zone",
    title: "PUF baseline latch",
    subtitle: "Traceability anchor for generic third-party sensors",
    keywords: "puf generic self calibrated evaluation only latch baseline",
  },
];

/* ── assembled corpus ───────────────────────────────────────────── */
export function buildSearchIndex(): SearchHit[] {
  const firmware: SearchHit[] = FIRMWARE_SECTIONS.map((s, i) => ({
    id: `fw-${s.id}`,
    kind: "firmware",
    href: `#fw-${s.id}`,
    title: `§${i + 1} · ${s.title}`,
    subtitle: s.brief,
    keywords: `${s.title} ${s.brief} firmware section code`,
  }));

  const refs: SearchHit[] = REFERENCES.map(r => ({
    id: `ref-${r.id}`,
    kind: "reference",
    href: "#references",
    title: r.title,
    subtitle: `${r.authors} · ${r.venue} (${r.year})`,
    keywords: `${r.authors} ${r.venue} ${r.year} ${r.doi ?? ""} ${r.note}`,
  }));

  return [...SECTIONS, ...ACTIONS, ...PINS, ...GLOSSARY, ...firmware, ...refs];
}

/* ── scoring ────────────────────────────────────────────────────── */
export interface ScoredHit extends SearchHit { score: number }

export function searchCorpus(
  corpus: SearchHit[],
  rawQuery: string,
  resolveTitle: (h: SearchHit) => string,
  limit = 24
): ScoredHit[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const out: ScoredHit[] = [];
  for (const h of corpus) {
    const title = resolveTitle(h).toLowerCase();
    const sub = h.subtitle.toLowerCase();
    const kw = h.keywords.toLowerCase();
    const hay = `${title} ${sub} ${kw}`;

    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      if (!hay.includes(term)) { matchedAll = false; break; }
      if (title.startsWith(term)) score += 120;
      else if (title.includes(term)) score += 70;
      else if (sub.includes(term)) score += 30;
      else score += 12;
    }
    if (!matchedAll) continue;
    if (h.kind === "section") score += 15;
    if (h.kind === "action") score += 10;
    out.push({ ...h, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}
