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

import { clampLogoSize } from "@/lib/signature";
import { describe as d2, it as i2, expect as e2 } from "vitest";
d2("taille du logo", () => {
  i2("reste entre 32 et 160 px", () => {
    e2(clampLogoSize(10)).toBe(32);
    e2(clampLogoSize(500)).toBe(160);
    e2(clampLogoSize(90)).toBe(90);
  });
});
