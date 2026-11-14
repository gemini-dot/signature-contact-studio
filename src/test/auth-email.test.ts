import { describe, it, expect } from "vitest";
import { authSubject, langFromAuthUrl } from "@/lib/email-templates/auth-i18n";
describe("auth e-mails", () => {
  it("subject is prefixed with the site name", () => {
    expect(authSubject("magiclink", "fr")).toBe("Signature.Contact : Votre lien magique");
  });
  it("language comes from the redirect target", () => {
    const u = "https://x.co/verify?token=a&redirect_to=" + encodeURIComponent("https://signature.contact/compte?lang=en");
    expect(langFromAuthUrl(u)).toBe("en");
    expect(langFromAuthUrl("https://x.co/verify?redirect_to=https://a.b/")).toBe("fr");
  });
});
