import { describe, expect, it } from "vitest";
import { codeStatus, discountedCents } from "@/lib/discount";

describe("codes de réduction", () => {
  it("applique un pourcentage", () => expect(discountedCents(600, { kind: "percent", value: 50, months: 3 })).toBe(300));
  it("applique un montant fixe sans passer sous zéro", () => expect(discountedCents(600, { kind: "amount", value: 10, months: null })).toBe(0));
  it("100 % = gratuit", () => expect(discountedCents(5900, { kind: "percent", value: 100, months: null })).toBe(0));
  it("détecte un code épuisé", () => expect(codeStatus({ active: true, valid_until: "2999-01-01", max_uses: 2, uses: 2 })).toBe("exhausted"));
  it("détecte un code expiré", () => expect(codeStatus({ active: true, valid_until: "2000-01-01", max_uses: null, uses: 0 })).toBe("expired"));
});
