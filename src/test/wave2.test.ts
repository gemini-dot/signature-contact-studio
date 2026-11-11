import { describe, expect, it } from "vitest";
import { ratingLine } from "@/lib/member";
import { defaultSignature, renderReplySignature, renderSignature } from "@/lib/signature";

describe("Avis clients", () => {
  it("affiche la note sur 5 avec virgule et nombre d'avis", () => {
    expect(ratingLine(4.9, 128, "Google")).toBe("★★★★★ 4,9/5 · 128 avis Google");
  });
  it("borne la note à 5", () => {
    expect(ratingLine(7, null, "")).toContain("5,0/5");
  });
  it("n'affiche rien sans note", () => {
    expect(ratingLine(null)).toBe("");
  });
});

describe("Signatures contextuelles", () => {
  const d = { ...defaultSignature, bannerOn: true, bannerText: "Salon", qrOn: true };
  it("la réponse courte n'inclut ni bannière ni QR code", () => {
    const h = renderReplySignature(d);
    expect(h).toContain(d.name);
    expect(h).not.toContain("Salon");
    expect(h).not.toContain("qrserver");
  });
  it("le bouton plaquette apparaît seulement avec un lien", () => {
    expect(renderSignature("moderne", { ...d, docOn: true, docUrl: "" })).not.toContain("plaquette");
    expect(renderSignature("moderne", { ...d, docOn: true, docUrl: "https://signature.contact/api/public/document/x" })).toContain("/api/public/document/x");
  });
});
