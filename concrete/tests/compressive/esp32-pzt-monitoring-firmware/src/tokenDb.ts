/* ------------------------------------------------------------------ *
 *  tokenDb.ts — smartLAB sensor token & marketplace persistence layer
 *
 *  IndexedDB-first with localStorage + in-memory fallback, exactly the
 *  same pattern as the telemetry outbox. All operations are typed,
 *  serialized (write queue), and audit-logged.
 *
 *  Data model
 *  ──────────
 *  TokenWallet   live per-account sensor token balance
 *  TokenTxn      immutable audit record for every deduct / credit event
 *  SensorBatch   marketplace order group (from the "Order" button)
 * ------------------------------------------------------------------ */

export type TokenBadge = "PROPRIETARY_CERTIFIED" | "GENERIC_RAW";

export interface TokenWallet {
  accountId: string;
  balance: number;          // current usable tokens
  certified: number;        // lifetime tokens issued
  used: number;             // lifetime deducted
  lastUpdated: string;      // ISO timestamp
}

export interface TokenTxn {
  txnId: string;
  accountId: string;
  type: "CREDIT" | "DEDUCT";
  amount: number;
  balanceAfter: number;
  reason: string;
  romId: string | null;     // 1-Wire 64-bit ROM ID when sensor verified
  badge: TokenBadge;
  projectId: string | null;
  specimenId: string | null;
  timestamp: string;
}

export interface SensorBatch {
  batchId: string;
  accountId: string;
  quantity: number;
  status: "PENDING" | "AUTHORIZED" | "FULFILLED";
  tokensIssued: number;
  orderedAt: string;
  fulfilledAt: string | null;
}

export interface BadgeWatermark {
  badge: TokenBadge;
  text: string;
  color: "green" | "gray";
}

const ACCOUNT_ID = "lab-cai-9f3a2c";
const ACCOUNT_NAME = "smartLAB Client";

/* ── ROM ID generator (1-Wire 64-bit format: 28-XXXXXXXXXXXX.YYYY) ─── */
export function generateRomId(): string {
  const hex = () => Math.floor(Math.random() * 0xff).toString(16).padStart(2, "0").toUpperCase();
  const crc = () => Math.floor(Math.random() * 0xff).toString(16).padStart(2, "0").toUpperCase();
  return `28-${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${crc()}${crc()}`;
}

/* ── badge watermark resolver (footer metadata) ─────────────────── */
export function badgeWatermark(badge: TokenBadge): BadgeWatermark {
  if (badge === "PROPRIETARY_CERTIFIED") {
    return {
      badge,
      color: "green",
      text: "🔒 Certified Genuine (Factory Calibrated)",
    };
  }
  return {
    badge,
    color: "gray",
    text: "⚡ Generic (Self-Calibrated)",
  };
}

/* ── IDB helper ──────────────────────────────────────────────────── */
class TokenIDB {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private readonly DB   = "smartlab-token-wallet-v1";
  private readonly STORE = "wallet";
  private readonly TXN   = "txns";
  private q: Promise<void> = Promise.resolve();

  private open(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise(resolve => {
      if (typeof indexedDB === "undefined") { resolve(null); return; }
      const req = indexedDB.open(this.DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.STORE)) db.createObjectStore(this.STORE, { keyPath: "accountId" });
        if (!db.objectStoreNames.contains(this.TXN))   db.createObjectStore(this.TXN,   { keyPath: "txnId" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => resolve(null);
    });
    return this.dbPromise;
  }

  private readFallback<T>(key: string): T | null {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
      return raw ? (JSON.parse(raw) as T) : null;
    } catch { return null; }
  }
  private writeFallback<T>(key: string, val: T): void {
    try { localStorage?.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  }

  async putWallet(w: TokenWallet): Promise<void> {
    this.q = this.q.then(async () => {
      const db = await this.open();
      if (!db) { this.writeFallback(`${this.DB}-${this.STORE}-${w.accountId}`, w); return; }
      await new Promise<void>(res => {
        const tx = db.transaction(this.STORE, "readwrite");
        tx.objectStore(this.STORE).put(w);
        tx.oncomplete = () => res(); tx.onerror = () => res(); tx.onabort = () => res();
      });
    });
    await this.q;
  }

  async getWallet(accountId: string): Promise<TokenWallet | null> {
    await this.q;
    const db = await this.open();
    if (!db) return this.readFallback<TokenWallet>(`${this.DB}-${this.STORE}-${accountId}`);
    return new Promise<TokenWallet | null>(resolve => {
      const tx  = db.transaction(this.STORE, "readonly");
      const req = tx.objectStore(this.STORE).get(accountId);
      req.onsuccess = () => resolve(req.result as TokenWallet | undefined ?? null);
      req.onerror   = () => resolve(this.readFallback<TokenWallet>(`${this.DB}-${this.STORE}-${accountId}`));
    });
  }

  async pushTxn(t: TokenTxn): Promise<void> {
    this.q = this.q.then(async () => {
      const db = await this.open();
      if (!db) {
        const list = this.readFallback<TokenTxn[]>(`${this.DB}-${this.TXN}`) ?? [];
        list.push({ ...t });
        this.writeFallback(`${this.DB}-${this.TXN}`, list);
        return;
      }
      await new Promise<void>(res => {
        const tx = db.transaction(this.TXN, "readwrite");
        tx.objectStore(this.TXN).put(t);
        tx.oncomplete = () => res(); tx.onerror = () => res(); tx.onabort = () => res();
      });
    });
    await this.q;
  }

  async getRecentTxns(limit = 24): Promise<TokenTxn[]> {
    await this.q;
    const db = await this.open();
    if (!db) {
      const list = this.readFallback<TokenTxn[]>(`${this.DB}-${this.TXN}`) ?? [];
      return list.slice(-limit).reverse();
    }
    return new Promise<TokenTxn[]>(resolve => {
      const tx  = db.transaction(this.TXN, "readonly");
      const req = tx.objectStore(this.TXN).getAll();
      req.onsuccess = () => {
        const all = (req.result as TokenTxn[]).slice(-limit).reverse();
        resolve(all);
      };
      req.onerror = () => {
        const list = this.readFallback<TokenTxn[]>(`${this.DB}-${this.TXN}`) ?? [];
        resolve(list.slice(-limit).reverse());
      };
    });
  }
}

/* ── public singleton ────────────────────────────────────────────── */
export const tokenDb = new TokenIDB();

const initialWallet = (): TokenWallet => ({
  accountId:  ACCOUNT_ID,
  balance:    12,
  certified:  12,
  used:       0,
  lastUpdated: nowIso(),
});

const nowIso = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();
export { uid as txnUid, nowIso as txnNow, ACCOUNT_ID, ACCOUNT_NAME };

/* ── wallet operations ───────────────────────────────────────────── */

export async function getOrCreateWallet(): Promise<TokenWallet> {
  const existing = await tokenDb.getWallet(ACCOUNT_ID);
  if (existing) return existing;
  const fresh = initialWallet();
  await tokenDb.putWallet(fresh);
  return fresh;
}

export async function deductToken(
  badge: TokenBadge,
  romId: string,
  projectId: string | null = null,
  specimenId: string | null = null,
): Promise<TokenWallet> {
  const wallet = await getOrCreateWallet();
  if (wallet.balance < 1) throw new Error("INSUFFICIENT_TOKENS");
  const next: TokenWallet = {
    ...wallet,
    balance:     wallet.balance - 1,
    used:        wallet.used + 1,
    lastUpdated: nowIso(),
  };
  await tokenDb.putWallet(next);
  await tokenDb.pushTxn({
    txnId:       uid(),
    accountId:   ACCOUNT_ID,
    type:        "DEDUCT",
    amount:      1,
    balanceAfter: next.balance,
    reason:      `Sensor session — badge ${badge}, ROM ${romId}`,
    romId,
    badge,
    projectId,
    specimenId,
    timestamp:   nowIso(),
  });
  return next;
}

export async function creditTokens(
  quantity: number,
  batchId: string,
  badge: TokenBadge = "PROPRIETARY_CERTIFIED",
): Promise<TokenWallet> {
  const wallet = await getOrCreateWallet();
  const next: TokenWallet = {
    ...wallet,
    balance:    wallet.balance + quantity,
    certified:  wallet.certified + quantity,
    lastUpdated: nowIso(),
  };
  await tokenDb.putWallet(next);
  await tokenDb.pushTxn({
    txnId:       uid(),
    accountId:   ACCOUNT_ID,
    type:        "CREDIT",
    amount:      quantity,
    balanceAfter: next.balance,
    reason:      `Marketplace order ${batchId} — ${quantity} certified smartLAB sensors`,
    romId:       null,
    badge,
    projectId:   null,
    specimenId:  null,
    timestamp:   nowIso(),
  });
  return next;
}

export async function fulfillBatch(quantity: number): Promise<{ wallet: TokenWallet; batch: SensorBatch }> {
  const batch: SensorBatch = {
    batchId:       `BATCH-${uid()}`,
    accountId:     ACCOUNT_ID,
    quantity,
    status:        "FULFILLED",
    tokensIssued:  quantity,
    orderedAt:     nowIso(),
    fulfilledAt:   nowIso(),
  };
  const wallet = await creditTokens(quantity, batch.batchId);
  return { wallet, batch };
}

/* ── badge-decisions for reports ─────────────────────────────────── */
export function badgeForSession(romVerified: boolean): TokenBadge {
  return romVerified ? "PROPRIETARY_CERTIFIED" : "GENERIC_RAW";
}

/* ── full report footer (badge embedded as metadata string) ──────── */
export function reportFooterLines(
  badge: TokenBadge,
  romId: string | null,
  wallet: TokenWallet,
): string {
  const wm = badgeWatermark(badge);
  return [
    `Token Badge   : ${wm.text}`,
    `ROM ID        : ${romId ?? "N/A (generic session)"}`,
    `Tokens Used   : ${wallet.used}`,
    `Tokens Balance: ${wallet.balance}`,
    `Account       : ${ACCOUNT_NAME} (${ACCOUNT_ID})`,
    `Ledger        : IndexedDB smartlab-token-wallet-v1 (fallback: localStorage)`,
    `---`,
  ].join("\n");
}
