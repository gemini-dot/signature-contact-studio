import { describe, it, expect } from "vitest";
import { parseQuoteLines, letterheadHtml } from "@/lib/letterhead";
describe("devis", () => {
  it("calcule HT, TVA 20 % et TTC", () => {
    const q = parseQuoteLines("Logo ; 2 ; 100\nSite ; 1 ; 250,50");
    expect(q.ht).toBe(450.5); expect(q.tva).toBe(90.1); expect(q.ttc).toBe(540.6);
  });
  it("reprend la société de la signature", () => {
    const h = letterheadHtml({ company: "ACME", tagline: "", logoUrl: "", accent: "#123456", address: "", phone: "", email: "", website: "", legal: "", body: "", kind: "proposition", style: "moderne" });
    expect(h).toContain("ACME"); expect(h).toContain("#123456");
  });
});
