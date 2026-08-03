import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import CrushSim from "@/components/CrushSim";
import { BlockDiagram, WiringDiagram, MechanicalStack } from "@/components/Diagrams";
import { Reveal, Section, WireTableView } from "@/components/ui";
import { COMP_META, SEC_EN, CELL_CHIPS, HERO_STATS, crushImg } from "@/data";
import { useT } from "@/i18n";
import {
  IconArrowDown,
  IconBolt,
  IconCalc,
  IconCheck,
  IconChip,
  IconCrack,
  IconFlag,
  IconGauge,
  IconHelmet,
  IconPlug,
  IconPrint,
  IconRuler,
  IconScale,
  IconScreen,
  IconSerial,
  IconShield,
  IconWarn,
} from "@/components/icons";

/* ================= الافتتاحية ================= */

function Opening({ onFirmware }: { onFirmware: () => void }) {
  const t = useT();

  return (
    <header className="blueprint-dark relative overflow-hidden border-b-4 border-safety bg-ink text-paper">
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 left-0 select-none font-display text-[220px] font-extrabold leading-none text-white/[0.035] md:text-[320px]"
      >
        MPa
      </span>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-12 md:px-6 md:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <p className="bidi mb-4 inline-flex items-center gap-2 border border-safety/60 bg-safety/10 px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.22em] text-safety-hi">
            <IconChip size={14} />
            {t.hero.badge}
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.15] md:text-[52px]">
            {t.hero.t1}
            <span className="block text-safety-hi">{t.hero.t2}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-paper/80 md:text-lg">{t.hero.lead}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#components"
              className="group flex items-center gap-2 border-2 border-safety bg-safety px-5 py-3 font-display text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-safety-hi"
            >
              {t.hero.bComponents}
              <IconArrowDown size={17} className="transition-transform group-hover:translate-y-0.5" />
            </a>
            <button
              onClick={onFirmware}
              className="cursor-pointer border-2 border-paper/40 px-5 py-3 font-display text-base font-bold text-paper transition-all hover:-translate-y-0.5 hover:border-safety-hi hover:text-safety-hi"
            >
              {"</>"} {t.hero.bCode}
            </button>
            <button
              onClick={() => window.print()}
              className="no-print flex cursor-pointer items-center gap-2 border-2 border-paper/40 px-5 py-3 font-display text-base font-bold text-paper transition-all hover:-translate-y-0.5 hover:border-paper hover:bg-paper hover:text-ink"
            >
              <IconPrint size={17} />
              {t.hero.bPrint}
            </button>
          </div>

          <p className="mt-6 flex items-start gap-2 text-[13px] leading-6 text-paper/60">
            <IconWarn size={16} className="mt-0.5 shrink-0 text-safety-hi" />
            {t.hero.disclaimer}
          </p>
        </div>

        <Reveal delay={120}>
          <CrushSim />
        </Reveal>
      </div>

      {/* شريط الأرقام */}
      <div className="relative border-t border-white/10 bg-black/25">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-x-reverse divide-white/10 px-4 md:grid-cols-4 md:px-6">
          {HERO_STATS.map((s, i) => (
            <div key={s.u} className="px-4 py-4 md:py-5">
              <p className="bidi font-display text-2xl font-bold leading-none text-paper md:text-3xl">
                {s.v} <span className="text-base text-safety-hi">{s.u}</span>
              </p>
              <p className="mt-1.5 text-[12px] text-paper/60">{t.hero.stats[i]}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ================= 01 الفكرة ================= */

function IdeaSection() {
  const t = useT();
  const icons = [IconGauge, IconFlag, IconCalc, IconCrack];

  return (
    <Section id="idea" num="01" title={t.sec.idea} en={SEC_EN.idea}>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <div className="space-y-4 text-[15.5px] leading-8 text-ink-2">
            <p>{t.idea.p1}</p>
            <p>{t.idea.p2}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {t.idea.outputs.map((o, i) => {
              const I = icons[i];
              return (
                <Reveal key={o.t} delay={i * 90}>
                  <div className="group flex items-center gap-3 border-2 border-ink/15 bg-card p-3.5 transition-all hover:-translate-y-1 hover:border-safety hs-sm">
                    <span className="grid h-11 w-11 shrink-0 place-items-center border border-ink/15 bg-paper text-safety transition-colors group-hover:bg-safety group-hover:text-white">
                      <I size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-[15px] font-bold leading-tight text-navy">{o.t}</p>
                      <p className="text-[11px] text-steel">{o.d}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={150}>
            <figure className="relative mt-6 overflow-hidden border-2 border-ink/80">
              <img
                src={crushImg}
                alt={t.idea.caption}
                className="h-56 w-full object-cover transition-transform duration-700 hover:scale-[1.04] md:h-64"
              />
              <figcaption className="absolute bottom-0 start-0 border-t-2 border-safety bg-ink/90 px-4 py-2 text-[12.5px] font-medium text-paper">
                {t.idea.caption}
              </figcaption>
            </figure>
          </Reveal>
        </Reveal>
        <Reveal delay={100}>
          <BlockDiagram />
        </Reveal>
      </div>
    </Section>
  );
}

/* ================= 02 المكونات ================= */

function ComponentsSection() {
  const t = useT();

  return (
    <Section
      id="components"
      num="02"
      title={t.sec.components}
      en={SEC_EN.components}
      intro={t.sec.componentsIntro}
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {COMP_META.map((m, i) => {
          const c = t.comps[i];
          return (
            <Reveal key={m.num} delay={(i % 4) * 80}>
              <article className="group flex h-full flex-col border-2 border-ink/15 bg-card transition-all hover:-translate-y-1.5 hover:border-safety hover:shadow-[8px_8px_0_0_rgba(232,89,12,0.18)]">
                <div className="relative overflow-hidden border-b-2 border-ink/15">
                  <img
                    src={m.img}
                    alt={m.name}
                    loading="lazy"
                    className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute end-0 top-0 bg-safety px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                    {m.num}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="bidi font-mono text-[11px] font-semibold uppercase tracking-wide text-safety">
                    {m.name}
                  </p>
                  <h3 className="mt-0.5 font-display text-lg font-bold text-navy">{c.local}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-ink-2/90">{c.role}</p>
                  <ul className="mt-3 space-y-1 border-t border-dashed border-ink/20 pt-3">
                    {c.specs.map((s) => (
                      <li key={s} className="flex gap-2 text-[12.5px] leading-6 text-ink-2">
                        <span className="mt-2 h-1 w-3 shrink-0 bg-safety/70" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  {c.note && (
                    <p className="mt-3 flex gap-2 border border-amber/40 bg-amber/10 p-2.5 text-[12px] leading-6 text-amber">
                      <IconWarn size={15} className="mt-0.5 shrink-0" />
                      {c.note}
                    </p>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ================= 03 التوصيلات ================= */

function WiringSection() {
  const t = useT();

  return (
    <Section
      id="wiring"
      num="03"
      title={t.sec.wiring}
      en={SEC_EN.wiring}
      intro={t.sec.wiringIntro}
      className="bg-[#e2e5dd]"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {t.wiring.tables.map((tab, i) => (
          <Reveal key={tab.title} delay={i * 80}>
            <WireTableView t={tab} chips={i === 0 ? CELL_CHIPS : undefined} />
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-8">
        <p className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-navy">
          <IconBolt size={20} className="text-safety" />
          {t.wiring.diagramTitle}
        </p>
        <WiringDiagram />
      </Reveal>
    </Section>
  );
}

/* ================= 04 التركيب الميكانيكي ================= */

function MechanicalSection() {
  const t = useT();

  return (
    <Section
      id="mechanical"
      num="04"
      title={t.sec.mechanical}
      en={SEC_EN.mechanical}
      intro={t.sec.mechanicalIntro}
    >
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Reveal>
          <MechanicalStack />
        </Reveal>
        <div>
          <Reveal>
            <div className="border-2 border-ink/15 bg-card p-5 hs-sm">
              <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-navy">
                <IconScale size={22} className="text-safety" />
                {t.mech.stackTitle}
              </h3>
              <div>
                {t.mech.steps.map((s, i, arr) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "grid h-8 w-8 place-items-center border-2 font-mono text-[12px] font-bold",
                          i === 1 ? "border-safety bg-safety text-white" : "border-ink/30 bg-paper text-navy",
                        )}
                      >
                        {i + 1}
                      </span>
                      {i < arr.length - 1 && <span className="h-4 w-0.5 bg-ink/25" />}
                    </div>
                    <p className={cn("pb-3 text-[15px] font-medium", i === 1 ? "font-bold text-safety" : "text-ink-2")}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-5 border-2 border-ink/15 bg-card p-5 hs-sm">
              <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-navy">
                <IconShield size={20} className="text-safety" />
                {t.mech.pointsTitle}
              </h3>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {t.mech.points.map((p) => (
                  <li key={p} className="flex gap-2 text-[13.5px] leading-6 text-ink-2">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center border border-ok/50 bg-ok/10 text-ok">
                      <IconCheck size={12} strokeWidth={2.6} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ================= 05 الحسابات ================= */

function MathSection() {
  const t = useT();
  const [edge, setEdge] = useState(150);
  const [peakIn, setPeakIn] = useState(600);

  const res = useMemo(() => {
    const area = edge * edge;
    const stress = area > 0 ? (peakIn * 1000) / area : 0;
    const grades = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60];
    const grade = grades.reduce((a, b) => (Math.abs(b - stress) < Math.abs(a - stress) ? b : a));
    return { area, stress, grade };
  }, [edge, peakIn]);

  return (
    <Section
      id="math"
      num="05"
      title={t.sec.math}
      en={SEC_EN.math}
      intro={t.sec.mathIntro}
      className="bg-[#e2e5dd]"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          {t.math.formulas.map((f, i) => (
            <Reveal key={f.f} delay={i * 90}>
              <div className="border-2 border-ink/80 bg-codebg p-4 hs-sm">
                <p className="mb-2 text-[13px] font-semibold text-paper/70">{f.t}</p>
                <p className="bidi font-mono text-[15px] font-semibold text-lcd-fg md:text-base">{f.f}</p>
              </div>
            </Reveal>
          ))}

          <Reveal delay={200}>
            <div className="border-2 border-ink/80 bg-ink p-5 hs">
              <p className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-paper">
                <IconCalc size={20} className="text-safety-hi" />
                {t.math.exTitle}
              </p>
              <div className="bidi space-y-1.5 font-mono text-sm leading-7 text-paper/90">
                <p>
                  <span className="text-steel">Given:</span> Peak Load = <b className="text-safety-hi">600 kN</b> , Area ={" "}
                  <b className="text-safety-hi">22500 mm²</b>
                </p>
                <p>
                  <span className="text-steel">Stress</span> = 600 × 1000 / 22500
                </p>
                <p className="border-t border-white/15 pt-2 text-lg font-bold text-lcd-fg">Stress = 26.67 MPa ✓</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* حاسبة تفاعلية */}
        <Reveal delay={120}>
          <div className="border-2 border-ink/80 bg-card p-5 hs md:p-6">
            <p className="mb-1 flex items-center gap-2 font-display text-xl font-bold text-navy">
              <IconRuler size={22} className="text-safety" />
              {t.math.calcTitle}
            </p>
            <p className="mb-5 text-[13px] text-steel">{t.math.calcSub}</p>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">{t.math.edge}</span>
                <input
                  dir="ltr"
                  type="number"
                  min={50}
                  max={300}
                  value={edge || ""}
                  onChange={(e) => setEdge(Number(e.target.value))}
                  className="w-full border-2 border-ink/25 bg-paper px-3 py-2.5 text-center font-mono text-lg font-bold text-navy outline-none transition-colors focus:border-safety"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">{t.math.peak}</span>
                <input
                  dir="ltr"
                  type="number"
                  min={0}
                  max={2000}
                  value={peakIn || ""}
                  onChange={(e) => setPeakIn(Number(e.target.value))}
                  className="w-full border-2 border-ink/25 bg-paper px-3 py-2.5 text-center font-mono text-lg font-bold text-navy outline-none transition-colors focus:border-safety"
                />
              </label>
            </div>

            <div className="mt-5 grid grid-cols-3 divide-x divide-x-reverse divide-white/10 border-2 border-ink/80 bg-ink text-center">
              {[
                { l: "Area mm²", v: res.area.toLocaleString("en-US") },
                { l: "Stress MPa", v: res.stress.toFixed(2), hot: true },
                { l: "≈ Grade", v: res.stress > 0 ? `C${res.grade}` : "—" },
              ].map((x) => (
                <div key={x.l} className="px-2 py-4">
                  <p
                    className={cn(
                      "bidi-c font-display text-2xl font-bold tabular-nums leading-none md:text-[28px]",
                      x.hot ? "text-safety-hi" : "text-paper",
                    )}
                  >
                    {x.v}
                  </p>
                  <p className="bidi-c mt-1.5 font-mono text-[10px] tracking-widest text-steel">{x.l}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 flex gap-2 text-[12.5px] leading-6 text-steel">
              <IconWarn size={15} className="mt-0.5 shrink-0 text-amber" />
              {t.math.gradeNote}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ================= 06 الموديلات ================= */

function ModelsSection({ onFirmware }: { onFirmware: () => void }) {
  const t = useT();

  return (
    <Section id="models" num="06" title={t.sec.models} en={SEC_EN.models} intro={t.sec.modelsIntro}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col border-2 border-ink/80 bg-card hs">
            <div className="flex items-center justify-between gap-2 border-b-2 border-ink/15 bg-navy px-5 py-3.5">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-paper md:text-xl">
                <IconScreen size={22} className="shrink-0 text-safety-hi" />
                {t.models.m1}
              </h3>
              <span className="bidi shrink-0 font-mono text-[11px] font-bold tracking-widest text-safety-hi">.INO #1</span>
            </div>
            <div className="p-5">
              <div className="lcd mx-auto max-w-sm border-4 border-[#2c3a20] px-4 py-3" dir="ltr">
                <p className="text-sm font-semibold">F:412.6kN P:413.1</p>
                <p className="text-sm font-semibold">S:18.3MPa</p>
              </div>
              <ul className="mt-5 space-y-2.5">
                {t.models.f1.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14.5px] text-ink-2">
                    <span className="grid h-5 w-5 shrink-0 place-items-center bg-safety text-white">
                      <IconCheck size={12} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="no-print mt-auto border-t border-ink/10 p-4">
              <button
                onClick={onFirmware}
                className="w-full cursor-pointer border-2 border-navy bg-navy px-4 py-2.5 font-display text-[15px] font-bold text-paper transition-colors hover:bg-ink"
              >
                {t.models.btn}
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="flex h-full flex-col border-2 border-ink/80 bg-card hs">
            <div className="flex items-center justify-between gap-2 border-b-2 border-ink/15 bg-ink px-5 py-3.5">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-paper md:text-xl">
                <IconSerial size={22} className="shrink-0 text-lcd-fg" />
                {t.models.m2}
              </h3>
              <span className="bidi shrink-0 font-mono text-[11px] font-bold tracking-widest text-lcd-fg">.INO #2</span>
            </div>
            <div className="p-5">
              <div dir="ltr" className="mx-auto max-w-sm border-2 border-ink/80 bg-codebg p-3 font-mono text-[11.5px] leading-6 text-[#7fb8ff]">
                <p className="text-steel">Time(s),Force(kN),Stress(MPa),Peak(kN)</p>
                <p>0.40,82.14,3.65,82.14</p>
                <p>0.80,166.02,7.38,166.02</p>
                <p>1.20,251.77,11.19,251.77</p>
                <p className="font-bold text-[#ff7a6b]">» CUBE CRUSHED</p>
                <p className="text-safety-hi">Peak Load Recorded: 612.40 kN</p>
              </div>
              <ul className="mt-5 space-y-2.5">
                {t.models.f2.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14.5px] text-ink-2">
                    <span className="grid h-5 w-5 shrink-0 place-items-center bg-ink text-lcd-fg">
                      <IconCheck size={12} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="no-print mt-auto border-t border-ink/10 p-4">
              <button
                onClick={onFirmware}
                className="w-full cursor-pointer border-2 border-ink bg-ink px-4 py-2.5 font-display text-[15px] font-bold text-paper transition-colors hover:bg-navy"
              >
                {t.models.btn}
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ================= 07 المعايرة ================= */

function CalibrationSection() {
  const t = useT();

  return (
    <Section id="calibration" num="07" title={t.sec.calibration} en={SEC_EN.calibration} className="bg-[#e2e5dd]">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <Reveal>
          <ol className="relative space-y-0 border-s-2 border-safety/40 ps-8">
            {t.calib.steps.map((s, i) => (
              <li key={i} className="relative pb-7 last:pb-0">
                <span className="absolute -start-[49px] grid h-10 w-10 place-items-center border-2 border-safety bg-paper font-display text-lg font-bold text-safety">
                  {i + 1}
                </span>
                <p className="pt-1.5 text-[15px] leading-7 text-ink-2">
                  {s.includes("calibration_factor") ? (
                    <>
                      {s.split("calibration_factor")[0]}
                      <code className="bidi border border-ink/20 bg-codebg px-1.5 py-0.5 font-mono text-[13px] text-safety-hi">
                        calibration_factor
                      </code>
                      {s.split("calibration_factor")[1]}
                    </>
                  ) : (
                    s
                  )}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={140}>
          <div className="border-2 border-safety bg-safety/10 p-5">
            <p className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-safety">
              <IconWarn size={20} />
              {t.calib.warnT}
            </p>
            <p className="text-[14.5px] leading-7 text-ink-2">{t.calib.warnText}</p>
            <div className="mt-4 border-t border-safety/40 pt-4">
              <p className="bidi mb-2 font-mono text-[11px] uppercase tracking-widest text-steel">Tip</p>
              <p className="bidi font-mono text-[13px] leading-6 text-navy">
                calibration_factor = raw_reading / known_mass_kg
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ================= 08 الأمان ================= */

const SAFETY_ICONS = [IconHelmet, IconShield, IconShield, IconRuler, IconScale, IconScale, IconPlug, IconBolt, IconWarn];

function SafetySection() {
  const t = useT();

  return (
    <section id="safety" className="scroll-mt-24 py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="overflow-hidden border-2 border-danger-deep bg-danger/5 hs">
            <div className="hazard h-3.5" />
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center border-2 border-danger bg-danger text-white">
                  <IconWarn size={30} />
                </span>
                <div>
                  <p className="bidi font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-danger">
                    {t.safety.eyebrow}
                  </p>
                  <h2 className="font-display text-3xl font-bold text-danger-deep md:text-4xl">{t.safety.title}</h2>
                </div>
              </div>

              <p className="max-w-3xl border-s-4 border-danger bg-danger/10 p-4 text-[15.5px] font-semibold leading-8 text-danger-deep">
                {t.safety.main}
              </p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {t.safety.rules.map((r, i) => {
                  const I = SAFETY_ICONS[i % SAFETY_ICONS.length];
                  const last = i === t.safety.rules.length - 1;
                  return (
                    <li
                      key={r}
                      className={cn(
                        "flex gap-3 border-2 p-3.5 text-[13.5px] leading-6",
                        last
                          ? "col-span-full border-danger bg-danger text-white sm:col-span-2 lg:col-span-3"
                          : "border-danger/25 bg-card text-ink-2",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center border",
                          last ? "border-white/40 bg-white/10 text-white" : "border-danger/40 bg-danger/10 text-danger",
                        )}
                      >
                        <I size={19} />
                      </span>
                      <span className="pt-1">{r}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="hazard h-3.5" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= الصفحة ================= */

export default function Home({ onFirmware }: { onFirmware: () => void }) {
  return (
    <>
      <Opening onFirmware={onFirmware} />
      <IdeaSection />
      <ComponentsSection />
      <WiringSection />
      <MechanicalSection />
      <MathSection />
      <ModelsSection onFirmware={onFirmware} />
      <CalibrationSection />
      <SafetySection />
    </>
  );
}
