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
