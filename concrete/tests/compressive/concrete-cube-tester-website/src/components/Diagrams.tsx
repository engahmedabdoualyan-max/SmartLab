/* مخططات SVG مرسومة يدوياً: كتلي / توصيلات / تركيب ميكانيكي */
import { useT } from "@/i18n";
import { WIRE_KEY_COLORS } from "@/data";

const BLOCK_EN = ["Hydraulic Press", "Concrete Cube", "Load Cell", "HX711", "Arduino Uno", "LCD / Serial"];

export function BlockDiagram() {
  const t = useT();
  return (
    <div className="border-2 border-ink/15 bg-card p-5 hs-sm md:p-7">
      <p className="bidi mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-steel">{t.idea.blockTitle}</p>
      <div className="mx-auto max-w-sm">
        {t.idea.blocks.map((b, i) => (
          <div key={BLOCK_EN[i]}>
            <div className="group relative flex items-center justify-between gap-3 border-2 border-ink/20 bg-paper px-4 py-3 transition-colors hover:border-safety">
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-navy">{b.n}</p>
                <p className="text-[11.5px] text-steel">{b.d}</p>
              </div>
              <p className="bidi shrink-0 font-mono text-[12px] font-semibold text-safety">
                {String(i + 1).padStart(2, "0")}·{BLOCK_EN[i]}
              </p>
            </div>
            {i < t.idea.blocks.length - 1 && (
              <div className="relative mx-auto flex h-9 w-px justify-center bg-ink/25">
                <span
                  className="flow-dot absolute top-0 h-2.5 w-2.5 rounded-full bg-safety shadow-[0_0_8px_rgba(232,89,12,0.8)]"
                  style={{ animationDelay: `${i * 0.35}s` }}
                />
                <span className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[6px] border-x-transparent border-t-ink/40" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= مخطط التوصيلات ================= */

const MONO = "IBM Plex Mono, monospace";

function Chip({ x, y, c, dark }: { x: number; y: number; c: string; dark?: boolean }) {
  return <rect x={x} y={y} width={9} height={9} fill={c} stroke={dark ? "#00000055" : "#16222e66"} strokeWidth={1} />;
}

function PinLabel({ x, y, t, fill = "#f7f7f3", anchor = "start" }: { x: number; y: number; t: string; fill?: string; anchor?: string }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={11} fontFamily={MONO} textAnchor={anchor as "start"}>
      {t}
    </text>
  );
}

export function WiringDiagram() {
  const tr = useT();
  const d = tr.wiring.diag;
  const BODY = "inherit";

  return (
    <div className="overflow-x-auto border-2 border-ink/15 bg-[#f4f5f0] p-2 hs-sm">
      <svg viewBox="0 0 940 600" className="min-w-[760px]" style={{ width: "100%", height: "auto" }} direction="ltr">
        {/* ===== خلية الحمل ===== */}
        <rect x={28} y={210} width={168} height={132} rx={6} fill="#e7eae4" stroke="#16222e" strokeWidth={2} />
        <circle cx={112} cy={268} r={36} fill="#cfd5d3" stroke="#16222e" strokeWidth={2} />
        <circle cx={112} cy={268} r={13} fill="#9aa5ad" stroke="#16222e" strokeWidth={1.5} />
        <text x={112} y={230} textAnchor="middle" fontSize={12} fontFamily={MONO} fontWeight={700} fill="#16222e">
          LOAD CELL
        </text>
        <text x={112} y={332} textAnchor="middle" fontSize={12} fontFamily={BODY} fill="#16222e">
          {d.loadCell}
        </text>
        <Chip x={191} y={225} c="#e03131" />
        <Chip x={191} y={247} c="#212529" />
        <Chip x={191} y={269} c="#2f9e44" />
        <Chip x={191} y={291} c="#c3cad1" />

        {/* أسلاك الخلية → HX711 */}
        <path d="M200 229.5 H268" stroke="#e03131" strokeWidth={3} fill="none" />
        <path d="M200 251.5 H268" stroke="#212529" strokeWidth={3} fill="none" />
        <path d="M200 273.5 H268" stroke="#2f9e44" strokeWidth={3} fill="none" />
        <path d="M200 295.5 H268" stroke="#8b959e" strokeWidth={3} fill="none" />
        <PinLabel x={234} y={222} t="E+" fill="#c42b2b" anchor="middle" />
        <PinLabel x={234} y={246} t="E-" fill="#212529" anchor="middle" />
        <PinLabel x={234} y={268} t="A+" fill="#2f8f46" anchor="middle" />
        <PinLabel x={234} y={290} t="A-" fill="#5f6e7b" anchor="middle" />

        {/* ===== HX711 ===== */}
        <rect x={268} y={168} width={190} height={170} rx={6} fill="#1c5aa8" stroke="#123a6e" strokeWidth={2} />
        <rect x={272} y={225} width={9} height={9} fill="#c9a227" />
        <rect x={272} y={247} width={9} height={9} fill="#c9a227" />
        <rect x={272} y={269} width={9} height={9} fill="#c9a227" />
        <rect x={272} y={291} width={9} height={9} fill="#c9a227" />
        <rect x={336} y={246} width={48} height={48} rx={3} fill="#11151a" stroke="#000" />
        <circle cx={344} cy={254} r={2.5} fill="#3a4653" />
        <text x={360} y={276} textAnchor="middle" fontSize={11} fontFamily={MONO} fill="#8b959e">
          HX711
        </text>
        <text x={340} y={190} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700} fill="#f7f7f3">
          HX711 24-BIT
        </text>
        <text x={363} y={326} textAnchor="middle" fontSize={12} fontFamily={BODY} fill="#dbe7f5">
          {d.amp}
        </text>
        <Chip x={447} y={175.5} c="#e03131" />
        <Chip x={447} y={199.5} c="#343a40" />
        <Chip x={447} y={235.5} c="#7048e8" />
        <Chip x={447} y={257.5} c="#f0c419" />
        <PinLabel x={443} y={184} t="VCC" anchor="end" />
        <PinLabel x={443} y={208} t="GND" anchor="end" />
        <PinLabel x={443} y={244} t="SCK" anchor="end" />
        <PinLabel x={443} y={266} t="DT" anchor="end" />

        {/* أسلاك HX711 → Arduino */}
        <path d="M456 180 H604" stroke="#e03131" strokeWidth={3} fill="none" />
        <path d="M456 204 H604" stroke="#343a40" strokeWidth={3} fill="none" />
        <path d="M456 240 H604" stroke="#7048e8" strokeWidth={3} fill="none" />
        <path d="M456 262 H604" stroke="#d9a406" strokeWidth={3} fill="none" />

        {/* ===== Arduino Uno ===== */}
        <rect x={596} y={168} width={30} height={42} rx={3} fill="#c8ccd0" stroke="#16222e" strokeWidth={1.5} />
        <rect x={596} y={224} width={28} height={36} rx={3} fill="#23303e" stroke="#16222e" strokeWidth={1.5} />
        <rect x={610} y={150} width={260} height={250} rx={8} fill="#0e7c86" stroke="#0a5a62" strokeWidth={2} />
        <rect x={722} y={228} width={66} height={66} rx={3} fill="#11151a" />
        <text x={755} y={266} textAnchor="middle" fontSize={10} fontFamily={MONO} fill="#8b959e">
          ATmega328P
        </text>
        <text x={648} y={166} fontSize={13} fontFamily={MONO} fontWeight={700} fill="#f7f7f3">
          ARDUINO UNO R3
        </text>
        <text x={740} y={384} textAnchor="middle" fontSize={12} fontFamily={BODY} fill="#d8eef0">
          {d.mcu}
        </text>
        {/* أطراف يسار */}
        <Chip x={600} y={175.5} c="#e03131" />
        <PinLabel x={616} y={184} t="5V" />
        <Chip x={600} y={199.5} c="#343a40" />
        <PinLabel x={616} y={208} t="GND" />
        <Chip x={600} y={235.5} c="#7048e8" />
        <PinLabel x={616} y={244} t="D2" />
        <Chip x={600} y={257.5} c="#d9a406" />
        <PinLabel x={616} y={266} t="D3" />
        <Chip x={600} y={279.5} c="#f08c00" />
        <PinLabel x={616} y={288} t="D4" />
        <Chip x={600} y={301.5} c="#e8590c" />
        <PinLabel x={616} y={310} t="D5" />
        {/* أطراف يمين */}
        <Chip x={861} y={195.5} c="#1c7ed6" />
        <PinLabel x={855} y={204} t="A4" anchor="end" />
        <Chip x={861} y={217.5} c="#0ca678" />
        <PinLabel x={855} y={226} t="A5" anchor="end" />
        <Chip x={861} y={239.5} c="#e03131" />
        <PinLabel x={855} y={248} t="5V" anchor="end" />
        <Chip x={861} y={261.5} c="#343a40" />
        <PinLabel x={855} y={270} t="GND" anchor="end" />
        {/* أطراف أسفل */}
        <Chip x={655} y={391} c="#f08c00" />
        <PinLabel x={659.5} y={386} t="D4" anchor="middle" fill="#10202a" />
        <Chip x={695} y={391} c="#e8590c" />
        <PinLabel x={699.5} y={386} t="D5" anchor="middle" fill="#10202a" />
        <Chip x={735} y={391} c="#343a40" />
        <PinLabel x={739.5} y={386} t="GND" anchor="middle" fill="#10202a" />
        <Chip x={775} y={391} c="#343a40" />
        <PinLabel x={779.5} y={386} t="GND" anchor="middle" fill="#10202a" />

        {/* ===== LCD I2C ===== */}
        <rect x={560} y={16} width={244} height={98} rx={6} fill="#23303e" stroke="#16222e" strokeWidth={2} />
        <rect x={576} y={30} width={166} height={56} fill="#2f7fd1" stroke="#1b568f" strokeWidth={2} />
        <text x={659} y={52} textAnchor="middle" fontSize={12} fontFamily={MONO} fontWeight={700} fill="#eaf4ff">
          F:612.4 kN
        </text>
        <text x={659} y={72} textAnchor="middle" fontSize={12} fontFamily={MONO} fontWeight={700} fill="#eaf4ff">
          S:27.2 MPa
        </text>
        <text x={772} y={48} textAnchor="middle" fontSize={11} fontFamily={MONO} fill="#c8d2dc">
          LCD 16x2
        </text>
        <text x={772} y={66} textAnchor="middle" fontSize={11} fontFamily={MONO} fill="#c8d2dc">
          I2C
        </text>
        <text x={682} y={108} textAnchor="middle" fontSize={12} fontFamily={BODY} fill="#c8d2dc">
          {d.lcd}
        </text>
        <Chip x={795} y={47.5} c="#343a40" />
        <Chip x={795} y={63.5} c="#e03131" />
        <Chip x={795} y={79.5} c="#1c7ed6" />
        <Chip x={795} y={95.5} c="#0ca678" />
        <PinLabel x={789} y={55} t="GND" anchor="end" fill="#c8d2dc" />
        <PinLabel x={789} y={71} t="VCC" anchor="end" fill="#c8d2dc" />
        <PinLabel x={789} y={87} t="SDA" anchor="end" fill="#c8d2dc" />
        <PinLabel x={789} y={103} t="SCL" anchor="end" fill="#c8d2dc" />

        {/* أسلاك LCD → Arduino */}
        <path d="M804 52 H916 V266 H870" stroke="#343a40" strokeWidth={3} fill="none" strokeLinejoin="round" />
        <path d="M804 68 H904 V244 H870" stroke="#e03131" strokeWidth={3} fill="none" strokeLinejoin="round" />
        <path d="M804 84 H892 V200 H870" stroke="#1c7ed6" strokeWidth={3} fill="none" strokeLinejoin="round" />
        <path d="M804 100 H880 V222 H870" stroke="#0ca678" strokeWidth={3} fill="none" strokeLinejoin="round" />

        {/* ===== زر Tare ===== */}
        <rect x={330} y={480} width={150} height={82} rx={6} fill="#e7eae4" stroke="#16222e" strokeWidth={2} />
        <circle cx={405} cy={518} r={19} fill="#c42b2b" stroke="#7f1d1d" strokeWidth={2} />
        <circle cx={405} cy={518} r={10} fill="#e86a5e" />
        <text x={405} y={552} textAnchor="middle" fontSize={12} fontFamily={BODY} fill="#16222e">
          {d.tare}
        </text>
        <Chip x={375.5} y={471} c="#f08c00" />
        <Chip x={425.5} y={471} c="#343a40" />
        <path d="M380 471 V430 H659.5 V400" stroke="#f08c00" strokeWidth={3} fill="none" strokeLinejoin="round" />
        <path d="M430 471 V450 H739.5 V400" stroke="#343a40" strokeWidth={3} fill="none" strokeLinejoin="round" />

        {/* ===== الطنان ===== */}
        <rect x={545} y={480} width={150} height={82} rx={6} fill="#e7eae4" stroke="#16222e" strokeWidth={2} />
        <ellipse cx={620} cy={516} rx={21} ry={17} fill="#11151a" />
        <circle cx={620} cy={516} r={5} fill="#3a4653" />
        <text x={620} y={552} textAnchor="middle" fontSize={12} fontFamily={BODY} fill="#16222e">
          {d.buzzer}
        </text>
        <Chip x={585.5} y={471} c="#e8590c" />
        <Chip x={645.5} y={471} c="#343a40" />
        <path d="M590 471 V440 H699.5 V400" stroke="#e8590c" strokeWidth={3} fill="none" strokeLinejoin="round" />
        <path d="M650 471 V460 H779.5 V400" stroke="#343a40" strokeWidth={3} fill="none" strokeLinejoin="round" />

        {/* ===== مصدر الطاقة ===== */}
        <rect x={28} y={28} width={172} height={74} rx={6} fill="#23303e" stroke="#16222e" strokeWidth={2} strokeDasharray="6 4" />
        <text x={114} y={58} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700} fill="#ffc24b">
          {d.psu}
        </text>
        <text x={114} y={82} textAnchor="middle" fontSize={11.5} fontFamily={BODY} fill="#c8d2dc">
          {d.psuSub}
        </text>
        <path d="M114 102 V140 H252 V229.5 H268" stroke="#e03131" strokeWidth={2} fill="none" strokeDasharray="7 5" strokeLinejoin="round" />
        <text x={150} y={132} fontSize={10} fontFamily={MONO} fill="#c42b2b">
          +5V Rail
        </text>
      </svg>

      {/* مفتاح الألوان */}
      <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink/10 px-3 py-3 text-[12px] text-ink-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-steel">
          {tr.wiring.keyLabel}
        </span>
        {tr.wiring.keys.map((l, i) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-6" style={{ background: WIRE_KEY_COLORS[i] }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================= التركيب الميكانيكي ================= */

function MLabel({ y, ar, en, side = "right" }: { y: number; ar: string; en: string; side?: "right" | "left" }) {
  const x = side === "right" ? 356 : 104;
  const lx1 = side === "right" ? 332 : 128;
  const lx0 = side === "right" ? 316 : 144;
  return (
    <g>
      <line x1={lx0} y1={y} x2={lx1} y2={y} stroke="#16222e" strokeWidth={1.4} />
      <circle cx={lx0} cy={y} r={3} fill="#e8590c" />
      <text x={x} y={y - 2} textAnchor={side === "right" ? "start" : "end"} fontSize={13} fontWeight={600} fill="#16222e">
        {ar}
      </text>
      <text
        x={x}
        y={y + 13}
        textAnchor={side === "right" ? "start" : "end"}
        fontSize={9.5}
        fontFamily={MONO}
        fill="#5f6e7b"
        letterSpacing={1}
      >
        {en}
      </text>
    </g>
  );
}

export function MechanicalStack() {
  const d = useT().mech.diag;
  return (
    <div className="border-2 border-ink/15 bg-[#f4f5f0] p-3 hs-sm">
      <svg viewBox="0 0 480 500" style={{ width: "100%", height: "auto" }} direction="ltr">
        <defs>
          <pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#33424f" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#46586a" strokeWidth="2.5" />
          </pattern>
          <pattern id="hatchLight" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#8e99a2" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#a5afb7" strokeWidth="2.5" />
          </pattern>
        </defs>

        {/* سهم القوة */}
        <line x1={62} y1={70} x2={62} y2={250} stroke="#e8590c" strokeWidth={5} strokeLinecap="round" />
        <path d="M62 268 L52 246 L72 246 Z" fill="#e8590c" />
        <text x={62} y={56} textAnchor="middle" fontSize={17} fontWeight={700} fontFamily={MONO} fill="#e8590c">
          F
        </text>
        <text x={62} y={292} textAnchor="middle" fontSize={11} fill="#e8590c">
          {d.force}
        </text>

        {/* رأس المكبس */}
        <rect x={140} y={16} width={180} height={52} fill="url(#hatch)" stroke="#16222e" strokeWidth={2} />
        <MLabel y={42} ar={d.ram} en="PRESS RAM" />

        {/* خلية الحمل */}
        <rect x={150} y={80} width={160} height={38} rx={4} fill="#e8590c" stroke="#8f3c07" strokeWidth={2} />
        <line x1={166} y1={99} x2={294} y2={99} stroke="#ffd9bd" strokeWidth={2} strokeDasharray="5 4" />
        <MLabel y={99} ar={d.cell} en="LOAD CELL 50T" />

        {/* الكرسي الكروي */}
        <path d="M204 150 a26 26 0 0 1 52 0 Z" fill="#9aa5ad" stroke="#16222e" strokeWidth={2} />
        <rect x={192} y={150} width={76} height={10} fill="#7d8992" stroke="#16222e" strokeWidth={1.5} />
        <MLabel y={142} ar={d.seat} en="SPHERICAL SEAT" />

        {/* اللوح العلوي */}
        <rect x={132} y={170} width={196} height={26} fill="url(#hatchLight)" stroke="#16222e" strokeWidth={2} />
        <MLabel y={183} ar={d.top} en="TOP PLATEN" />

        {/* درع الحماية */}
        <rect x={118} y={166} width={224} height={216} rx={4} fill="none" stroke="#c42b2b" strokeWidth={2.5} strokeDasharray="9 7" />
        <text x={230} y={211} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#c42b2b">
          {d.shield}
        </text>

        {/* المكعب */}
        <rect x={158} y={220} width={144} height={140} fill="#c3c7c4" stroke="#16222e" strokeWidth={2.5} />
        <path d="M186 220 L204 268 L192 300 L214 360" stroke="#7d837f" strokeWidth={2.5} fill="none" strokeLinejoin="round" />
        <path d="M272 220 L258 262 L276 312" stroke="#7d837f" strokeWidth={2} fill="none" strokeLinejoin="round" />
        <path d="M158 300 L180 292" stroke="#7d837f" strokeWidth={1.6} fill="none" />
        <MLabel y={284} ar={d.cube} en="CONCRETE CUBE" />

        {/* اللوح السفلي */}
        <rect x={132} y={392} width={196} height={26} fill="url(#hatchLight)" stroke="#16222e" strokeWidth={2} />
        <MLabel y={405} ar={d.bottom} en="BOTTOM PLATEN" />

        {/* القاعدة */}
        <rect x={104} y={428} width={252} height={44} fill="url(#hatch)" stroke="#16222e" strokeWidth={2} />
        <MLabel y={450} ar={d.base} en="PRESS BASE" />
      </svg>
    </div>
  );
}
