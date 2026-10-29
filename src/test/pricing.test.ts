import { describe, expect, it } from "vitest";
import { PRICES, teamMonthlyPrice } from "@/lib/pricing";

describe("tarifs", () => {
  it("Solo coûte 6 €/mois ou 59 €/an", () => {
    expect(PRICES.soloMonthly).toBe(6);
    expect(PRICES.soloYearly).toBe(59);
  });
  it("Équipe = 19 € + 1 € par collaborateur", () => {
    expect(teamMonthlyPrice(10)).toBe(29);
  });
});
