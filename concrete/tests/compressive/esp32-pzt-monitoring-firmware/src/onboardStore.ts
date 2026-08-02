/* ------------------------------------------------------------------ *
 *  onboardStore.ts — cross-component hardware onboarding session flag
 *
 *  Shared, typed singleton consumed by:
 *    · Lifecycle.tsx   (writes: certification lock / generic PUF latch)
 *    · ClientZone.tsx  (reads: wallet refresh revision, report lineage)
 *
 *  Revision counter bumps on every mutation so sibling components can
 *  re-pull IndexedDB-backed wallet / ledger state inside their own
 *  render cycles (the App root ticks at 20 Hz, so reads are real-time).
 * ------------------------------------------------------------------ */

export type OnboardMode = "none" | "certified" | "generic";

export interface OnboardSession {
  mode: OnboardMode;
  romId: string | null;        // 1-Wire 64-bit lock, Option 1 only
  tokenDeducted: boolean;      // true after the factory-token deduction
  pufLatchId: string | null;   // generic PUF baseline latch, Option 2 only
  lockedAt: string | null;     // ISO timestamp of the onboarding lock
  revision: number;            // mutation counter — watch for refetch
}

const persistKey = "smartlab-onboard-session-v1";

const blank = (): OnboardSession => ({
  mode: "none",
  romId: null,
  tokenDeducted: false,
  pufLatchId: null,
  lockedAt: null,
  revision: 0,
});

function hydrate(): OnboardSession {
  try {
    const raw = localStorage.getItem(persistKey);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OnboardSession>;
      return { ...blank(), ...parsed };
    }
  } catch { /* fallback stays in-memory */ }
  return blank();
}

export const onboardSession: OnboardSession = hydrate();

function bump(): void {
  onboardSession.revision++;
  try {
    localStorage.setItem(persistKey, JSON.stringify(onboardSession));
  } catch { /* ignore quota errors */ }
}

/* ── Option 1 — certified smartLAB sensor locked after ROM verify ── */
export function lockCertifiedSession(romId: string): void {
  onboardSession.mode = "certified";
  onboardSession.romId = romId;
  onboardSession.tokenDeducted = true;
  onboardSession.pufLatchId = null;
  onboardSession.lockedAt = new Date().toISOString();
  bump();
}

/* ── Option 2 — generic commercial sensor, PUF latch captured ────── */
export function lockGenericSession(pufLatchId: string): void {
  onboardSession.mode = "generic";
  onboardSession.romId = null;
  onboardSession.tokenDeducted = false;
  onboardSession.pufLatchId = pufLatchId;
  onboardSession.lockedAt = new Date().toISOString();
  bump();
}

export function resetOnboardSession(): void {
  const rev = onboardSession.revision;
  Object.assign(onboardSession, blank(), { revision: rev });
  bump();
}

/* ── PUF latch id generator (physically-unclonable-function mock) ── */
export function generatePufLatchId(): string {
  const hex = () => Math.floor(Math.random() * 0xff).toString(16).padStart(2, "0").toUpperCase();
  return `PUF-${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`;
}

/* ── report footer sentence keyed on the deployment flag ────────── */
export function deploymentFooterLine(): string {
  if (onboardSession.mode === "certified") {
    return "Option 1 — 🔒 Certified Genuine (Factory Calibrated)";
  }
  if (onboardSession.mode === "generic") {
    return "Option 2 — ⚡ Generic (Self-Calibrated) Evaluation Only";
  }
  return "No hardware onboarding session recorded (simulator mode)";
}
