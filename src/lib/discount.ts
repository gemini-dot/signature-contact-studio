/** Codes de réduction : calcul partagé (le serveur refait toujours le calcul). */
export type Discount = { kind: "percent" | "amount"; value: number; months: number | null };

/** Prix en centimes après remise ; jamais négatif. value = % ou euros. */
export function discountedCents(cents: number, d: Discount): number {
  const off = d.kind === "percent" ? Math.round((cents * Math.min(d.value, 100)) / 100) : Math.round(d.value * 100);
  return Math.max(0, cents - Math.min(off, cents));
}

export function codeStatus(c: { active: boolean; valid_until: string; max_uses: number | null; uses: number }, now = Date.now()) {
  if (!c.active) return "inactive" as const;
  if (Date.parse(c.valid_until) < now) return "expired" as const;
  if (c.max_uses !== null && c.uses >= c.max_uses) return "exhausted" as const;
  return "ok" as const;
}
