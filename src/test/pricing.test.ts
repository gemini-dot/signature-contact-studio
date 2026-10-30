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

import { cropRect } from "@/lib/signature";
d2("recadrage du logo", () => {
  i2("zoom 2 centré sur une image 200×100", () => {
    e2(cropRect(200, 100, 2, 50, 50, false)).toEqual({ sx: 50, sy: 25, sw: 100, sh: 50 });
  });
  i2("carré calé en haut à gauche", () => {
    e2(cropRect(200, 100, 1, 0, 0, true)).toEqual({ sx: 0, sy: 0, sw: 100, sh: 100 });
  });
});

import { PARTNER_DISCOUNT_PERCENT } from "@/lib/pricing";
d2("avantage Mails.contact", () => {
  i2("remise de 30 % pour les clients Équipe", () => { e2(PARTNER_DISCOUNT_PERCENT).toBe(30); });
});
