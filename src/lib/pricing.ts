export const PRICES = {
  free: 0,
  soloMonthly: 6,
  soloYearly: 59,
  teamBase: 19,
  teamPerSeat: 1,
};

/** Remise Mails.contact accordée aux abonnés Équipe (code unique). */
export const PARTNER_DISCOUNT_PERCENT = 30;

/** Prix mensuel du plan Équipe : 19 € + 1 € par collaborateur. */
export function teamMonthlyPrice(seats: number): number {
  const n = Math.max(0, Math.floor(seats));
  return PRICES.teamBase + PRICES.teamPerSeat * n;
}
