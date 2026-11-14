import { describe, it, expect } from "vitest";
import { renderSignature, defaultSignature } from "@/lib/signature";
import { EMAIL_KINDS, EMAIL_LANGS, emailSubject, renderEmail } from "@/lib/email-preview";

describe("wave4", () => {
  it("objet préfixé par Signature.Contact dans toutes les langues", () => {
    expect(emailSubject("magic", "fr")).toBe("Signature.Contact : Votre lien magique");
    for (const k of EMAIL_KINDS) for (const l of EMAIL_LANGS) {
      expect(emailSubject(k, l).startsWith("Signature.Contact")).toBe(true);
      expect(renderEmail(k, l)).toContain(`lang="${l}"`);
    }
  });
  it("mentions légales, visio et mode accessible", () => {
    const h = renderSignature("classique", { ...defaultSignature, legalOn: true, legalText: "ORIAS 123", visioOn: true, visioUrl: "meet.google.com/x", a11yOn: true });
    expect(h).toContain("ORIAS 123");
    expect(h).toContain("https://meet.google.com/x");
    expect(h).not.toMatch(/font-size:1[0-2]px/);
  });
});

import { whatsappLink } from "@/lib/signature";
import { returnDate } from "@/lib/absence";
describe("wave5", () => {
  it("lien WhatsApp : chiffres seulement, message encodé", () => {
    expect(whatsappLink("+33 6 12 34 56 78", "Bonjour")).toBe("https://wa.me/33612345678?text=Bonjour");
    expect(whatsappLink("123", "x")).toBe("");
  });
  it("retour = lendemain du dernier jour", () => {
    expect(returnDate("2026-12-31")).toBe("2027-01-01");
  });
});
