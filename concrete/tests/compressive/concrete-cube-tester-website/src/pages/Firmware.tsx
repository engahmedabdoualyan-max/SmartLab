import { Reveal, CodePanel, SectionHead } from "@/components/ui";
import { LCD_CODE, SERIAL_CODE } from "@/firmware";
import { PIN_VALUES } from "@/data";
import { useT } from "@/i18n";
import { IconArrowLeft, IconBook, IconChip, IconScreen, IconSerial, IconWarn } from "@/components/icons";

const LIB_META = [
  { name: "HX711", color: "#1c5aa8", icon: IconChip },
  { name: "LiquidCrystal I2C", color: "#2f7fd1", icon: IconScreen },
  { name: "Wire", color: "#2f8f46", icon: IconSerial },
];

function PinSummary() {
  const t = useT();
  return (
    <div className="overflow-hidden border-2 border-ink/15 bg-card">
      <div className="border-b-2 border-ink/15 bg-ink px-4 py-2.5">
        <h4 className="font-display text-base font-semibold text-paper">{t.fw.pinT}</h4>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {t.fw.pins.map((label, i) => (
            <tr key={label} className={i % 2 === 1 ? "bg-ink/[0.03]" : ""}>
              <td className="border-t border-ink/10 px-4 py-2.5 text-start text-ink-2 first:border-t-0">{label}</td>
              <td className="bidi border-t border-ink/10 px-4 py-2.5 font-mono font-semibold text-safety first:border-t-0">
                {PIN_VALUES[i]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Firmware({ onHome }: { onHome: () => void }) {
  const t = useT();

  return (
    <div className="pt-16">
      {/* رأس الصفحة */}
      <header className="blueprint-dark relative overflow-hidden border-b-4 border-safety bg-ink py-12 text-paper md:py-16">
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-14 end-0 select-none font-display text-[180px] font-extrabold leading-none text-white/[0.035] md:text-[260px]"
        >
          {"</>"}
        </span>
        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <button
            onClick={onHome}
            className="no-print mb-6 flex cursor-pointer items-center gap-2 border border-white/25 px-4 py-2 text-sm font-medium text-paper transition-colors hover:border-safety-hi hover:text-safety-hi"
          >
            <IconArrowLeft size={16} className="rtl:rotate-180" />
            {t.ui.back}
          </button>
          <p className="bidi mb-3 inline-block border border-safety/60 bg-safety/10 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.22em] text-safety-hi">
            {t.fw.badge}
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
            {t.fw.t1} <span className="text-safety-hi">{t.fw.t2}</span>
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-paper/80">{t.fw.lead}</p>
        </div>
      </header>

      {/* المكتبات */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <Reveal>
          <SectionHead num="A" title={t.fw.libsT} en="Required libraries" />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {LIB_META.map((l, i) => (
            <Reveal key={l.name} delay={i * 90}>
              <div className="group h-full border-2 border-ink/15 bg-card p-5 transition-all hover:-translate-y-1 hover:border-safety hs-sm">
                <span
                  className="grid h-12 w-12 place-items-center text-white transition-transform group-hover:scale-105"
                  style={{ background: l.color }}
                >
                  <l.icon size={24} />
                </span>
                <p className="bidi mt-4 font-mono text-lg font-bold text-navy">{l.name}</p>
                <p className="text-[12.5px] font-semibold text-safety">{t.fw.libs[i].by}</p>
                <p className="mt-2 text-[13.5px] leading-6 text-ink-2">{t.fw.libs[i].desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="border-2 border-ink/80 bg-codebg p-5">
              <p className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-paper">
                <IconBook size={20} className="text-safety-hi" />
                {t.fw.installT}
              </p>
              <p className="text-[14px] leading-7 text-paper/85">
                <span className="font-mono text-safety-hi">1.</span> {t.fw.installS1}
              </p>
              <p className="bidi my-2 border border-white/15 bg-black/30 px-3 py-2 font-mono text-[13px] text-lcd-fg">
                Sketch → Include Library → Manage Libraries
              </p>
              <p className="text-[14px] leading-7 text-paper/85">
                <span className="font-mono text-safety-hi">2.</span> {t.fw.installS2}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <code className="bidi border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[12.5px] text-lcd-fg">
                  HX711 by Bogdan Necula
                </code>
                <code className="bidi border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[12.5px] text-lcd-fg">
                  LiquidCrystal I2C by Frank de Brabander
                </code>
              </div>
            </div>
            <div>
              <PinSummary />
            </div>
          </div>
        </Reveal>
      </section>

      {/* الكود 1 */}
      <section className="bg-[#e2e5dd] py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHead num="B" title={t.fw.bT} en="concrete_tester_lcd.ino" />
          </Reveal>
          <CodePanel
            file="concrete_tester_lcd.ino"
            chip="LCD Model"
            chipColor="#2f7fd1"
            desc={t.fw.d1}
            code={LCD_CODE}
            notes={t.fw.n1}
          />
        </div>
      </section>

      {/* الكود 2 */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHead num="C" title={t.fw.cT} en="concrete_tester_serial.ino" />
          </Reveal>
          <CodePanel
            file="concrete_tester_serial.ino"
            chip="Serial Model"
            chipColor="#2f8f46"
            desc={t.fw.d2}
            code={SERIAL_CODE}
            notes={t.fw.n2}
          />
        </div>
      </section>

      {/* خطوات الرفع */}
      <section className="border-t-2 border-ink/10 bg-[#e2e5dd] py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <Reveal>
              <div className="border-2 border-ink/80 bg-card p-6 hs">
                <h3 className="mb-5 flex items-center gap-2 font-display text-2xl font-bold text-navy">
                  <IconChip size={24} className="text-safety" />
                  {t.fw.uploadT}
                </h3>
                <ol>
                  {t.fw.uploadSteps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 border-s-2 border-safety/30 pb-5 ps-5 last:pb-0">
                      <span className="relative -ms-[31px] mt-0.5 grid h-7 w-7 shrink-0 place-items-center border-2 border-safety bg-paper font-mono text-[13px] font-bold text-safety">
                        {i + 1}
                      </span>
                      <p className="text-[14.5px] leading-7 text-ink-2">{s}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="space-y-5">
                <div className="border-2 border-amber bg-amber/10 p-5">
                  <p className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-amber">
                    <IconWarn size={20} />
                    {t.fw.beforeT}
                  </p>
                  <p className="text-[14px] leading-7 text-ink-2">{t.fw.beforeText}</p>
                </div>
                <div className="border-2 border-ink/80 bg-ink p-5">
                  <p className="mb-3 font-display text-lg font-bold text-paper">{t.fw.csvT}</p>
                  <div className="bidi space-y-1 font-mono text-[13px] leading-6">
                    <p className="text-steel">Time(s),Force(kN),Stress(MPa),Peak(kN)</p>
                    <p className="text-lcd-fg">0.40,82.14,3.65,82.14</p>
                    <p className="text-lcd-fg">0.80,166.02,7.38,166.02</p>
                  </div>
                  <button
                    onClick={onHome}
                    className="no-print mt-5 w-full cursor-pointer border-2 border-safety bg-safety px-4 py-2.5 font-display text-[15px] font-bold text-white transition-colors hover:bg-safety-hi"
                  >
                    {t.fw.backBtn}
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
