/**
 * Shared loyalty/discount helpers for the Zulfira loyalty programs.
 *
 * Import contract (DO NOT change these signatures — other workers import them):
 *   generateCode(prefix: string): string
 *   createDiscountCode(db, { code, kind, value, minOrder?, maxUses?, programKey?,
 *     phone?, expiresAt?, isActive? }): Promise<{ code: string }>
 *   validateDiscountCode(db, { code, subtotal, phone? }):
 *     Promise<{ ok, error?, kind?, value?, discountAmount? }>
 *   programEnabled(db, key): Promise<{ enabled, config }>
 */
/** Default program configs (used when the LoyaltyProgram row is missing or has no config). */
export const DEFAULT_PROGRAM_CONFIGS: Record<string, Record<string, number | string>> = {
  challenge_30: { strikesOut: 3, maxChallengers: 200 },
  gift_trial: { senderCredit: 200, friendDiscountPct: 15 },
  insiders: { minOrders: 2 },
  inbox_upsell: { codePrefix: "INBOX20", expiryDays: 30, discountPct: 20 },
};

/** Normalize a PK phone number to 92XXXXXXXXXX format. */
export function normPhone(p: string): string {
  let d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  if (!d.startsWith("92")) d = "92" + d;
  return d;
}

/**
 * Generate a human-readable discount code: PREFIX-XXXX (4 random
 * uppercase alphanumeric chars). Collision safety is handled by the
 * caller's retry loop (DiscountCode.code is unique).
 */
export function generateCode(prefix: string): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no look-alikes
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${suffix}`;
}

export interface CreateDiscountCodeInput {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  minOrder?: number;
  maxUses?: number;
  programKey?: string;
  phone?: string;
  expiresAt?: Date;
  isActive?: boolean;
}

/**
 * Persist a DiscountCode row. Retries once on a code collision.
 * Contract: returns { code } (the issued code string).
 */
export async function createDiscountCode(
  db: any,
  input: CreateDiscountCodeInput
): Promise<{ code: string }> {
  const data = {
    code: String(input.code).trim().toUpperCase(),
    kind: input.kind,
    value: input.value,
    minOrder: input.minOrder ?? null,
    maxUses: input.maxUses ?? null,
    programKey: input.programKey ?? null,
    phone: input.phone ? normPhone(input.phone) : null,
    expiresAt: input.expiresAt ?? null,
    isActive: input.isActive ?? true,
  };
  try {
    const row = await db.discountCode.create({
      data,
      select: { code: true },
    });
    return { code: row.code };
  } catch {
    // Likely a unique-code collision — retry once with a fresh code.
    const prefix = data.code.includes("-") ? data.code.split("-")[0] : data.code;
    const row = await db.discountCode.create({
      data: { ...data, code: generateCode(prefix) },
      select: { code: true },
    });
    return { code: row.code };
  }
}

/**
 * Validate a discount code against an order subtotal.
 *
 * Rules: code exists, isActive, not expired, usedCount < maxUses (if set),
 * subtotal >= minOrder (if set), and if the code is locked to a phone then
 * the caller's phone must normalize to the same number.
 */
export async function validateDiscountCode(
  db: any,
  opts: { code: string; subtotal: number; phone?: string }
): Promise<{
  ok: boolean;
  error?: string;
  kind?: string;
  value?: number;
  discountAmount?: number;
}> {
  const code = String(opts.code ?? "").trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a discount code." };

  const row = await db.discountCode.findUnique({ where: { code } });
  if (!row) return { ok: false, error: "This code doesn't exist." };
  if (!row.isActive) return { ok: false, error: "This code has been deactivated." };
  if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now())
    return { ok: false, error: "This code has expired." };
  if (row.maxUses != null && Number(row.usedCount) >= Number(row.maxUses))
    return { ok: false, error: "This code has reached its usage limit." };
  if (row.minOrder != null && Number(opts.subtotal) < Number(row.minOrder))
    return {
      ok: false,
      error: `This code needs a minimum order of Rs ${Math.round(
        Number(row.minOrder)
      ).toLocaleString("en-PK")}.`,
    };
  if (row.phone) {
    if (!opts.phone)
      return {
        ok: false,
        error: "This code is locked to one customer phone number.",
      };
    if (normPhone(opts.phone) !== normPhone(row.phone))
      return {
        ok: false,
        error: "This code is not valid for this phone number.",
      };
  }

  const subtotal = Number(opts.subtotal) || 0;
  const value = Number(row.value);
  const discountAmount =
    row.kind === "percent"
      ? Math.round((subtotal * value) / 100)
      : Math.min(value, subtotal);

  return { ok: true, kind: row.kind, value, discountAmount };
}

/**
 * Read a loyalty program's enabled flag + merged config from the
 * LoyaltyProgram table. Falls back to disabled + default config.
 */
export async function programEnabled(
  db: any,
  key: string
): Promise<{ enabled: boolean; config: any }> {
  const defaults = DEFAULT_PROGRAM_CONFIGS[key] ?? {};
  const row = await db.loyaltyProgram.findUnique({ where: { key } });
  const stored = (row?.config as Record<string, string | number> | null) ?? {};
  return {
    enabled: row?.enabled ?? false,
    config: { ...defaults, ...stored },
  };
}

/**
 * Per-program unique one-time discount code specs.
 * Every loyalty reward code is unique (PREFIX-XXXX), single-use
 * (maxUses: 1) and delivered to the customer by email.
 * Values mirror exactly what each program page advertises.
 */
export const PROGRAM_CODES: Record<
  string,
  {
    prefix: string;
    kind: "percent" | "fixed";
    value: number;
    expiryDays: number;
    programKey: string;
    lockPhone?: boolean;
  }
> = {
  welcome: { prefix: "WELCOME", kind: "percent", value: 20, expiryDays: 30, programKey: "inbox_upsell" },
  reorder: { prefix: "REFILL", kind: "percent", value: 10, expiryDays: 30, programKey: "reorder_reminders" },
  subscribe: { prefix: "SUBSCRIBE", kind: "percent", value: 10, expiryDays: 45, programKey: "subscribe_save" },
  insiders: { prefix: "INSIDER", kind: "percent", value: 15, expiryDays: 90, programKey: "insiders", lockPhone: true },
  gift_friend: { prefix: "GIFT", kind: "percent", value: 15, expiryDays: 30, programKey: "gift_trial" },
  gift_credit: { prefix: "CREDIT", kind: "fixed", value: 200, expiryDays: 60, programKey: "gift_trial" },
  challenge: { prefix: "BUNDLE", kind: "fixed", value: 1700, expiryDays: 60, programKey: "challenge_30" },
};

export interface IssueProgramCodeInput {
  phone?: string;
  email?: string;
  valueOverride?: number;
}

/**
 * Issue a unique one-time discount code for a loyalty program.
 * Returns the code string. Throws on unknown program.
 */
export async function issueProgramCode(
  db: any,
  program: keyof typeof PROGRAM_CODES,
  input: IssueProgramCodeInput = {}
): Promise<{ code: string; spec: (typeof PROGRAM_CODES)[string] }> {
  const spec = PROGRAM_CODES[program];
  if (!spec) throw new Error(`Unknown program code spec: ${String(program)}`);
  const expiresAt = new Date(Date.now() + spec.expiryDays * 24 * 60 * 60 * 1000);
  const { code } = await createDiscountCode(db, {
    code: generateCode(spec.prefix),
    kind: spec.kind,
    value: input.valueOverride ?? spec.value,
    maxUses: 1,
    programKey: spec.programKey,
    phone: spec.lockPhone ? input.phone : undefined,
    expiresAt,
    isActive: true,
  });
  return { code, spec };
}
