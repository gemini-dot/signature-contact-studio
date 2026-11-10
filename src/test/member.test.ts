import { describe, expect, it } from "vitest";
import { activeBanner, buildVCard } from "@/lib/member";

describe("vCard", () => {
  it("sépare prénom et nom et inclut l'entreprise", () => {
    const v = buildVCard({ full_name: "Camille Durand", job_title: "Avocate", company: "Cabinet D", email: "c@d.fr", phone: "+33 1", website: "", address: "" });
    expect(v).toContain("N:Durand;Camille;;;");
    expect(v).toContain("ORG:Cabinet D");
    expect(v.startsWith("BEGIN:VCARD")).toBe(true);
  });
});

describe("Smart Bannière", () => {
  const def = { id: "d", is_default: true, starts_on: null, ends_on: null, created_at: "2026-01-01" };
  const salon = { id: "s", is_default: false, starts_on: "2026-06-01", ends_on: "2026-06-15", created_at: "2026-05-01" };
  it("affiche la campagne pendant sa période", () => {
    expect(activeBanner([def, salon], "2026-06-10")?.id).toBe("s");
  });
  it("revient à la bannière par défaut après la période", () => {
    expect(activeBanner([def, salon], "2026-06-16")?.id).toBe("d");
  });
});
