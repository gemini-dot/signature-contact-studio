import { describe, expect, it } from "vitest";
import { parseTeamCsv } from "@/lib/team-import";
import { defaultSignature, renderSignature, renderReplySignature } from "@/lib/signature";

describe("import CSV d'équipe", () => {
  it("lit un fichier Excel français (point-virgule, en-têtes accentués)", () => {
    const rows = parseTeamCsv("Prénom;Nom;Poste;E-mail\nCamille;Laurent;DG;Camille@Ex.fr\n");
    expect(rows).toEqual([{ email: "camille@ex.fr", name: "Camille Laurent", title: "DG", valid: true, duplicate: false }]);
  });
  it("signale doublons dans le fichier et membres déjà présents", () => {
    const rows = parseTeamCsv("email\na@x.fr\na@x.fr\nb@x.fr", ["b@x.fr"]);
    expect(rows.map((r) => r.duplicate)).toEqual([false, true, true]);
  });
  it("rejette les e-mails invalides", () => {
    expect(parseTeamCsv("email\npas-un-mail")[0]?.valid).toBe(false);
  });
});

describe("mode sombre & mention RSE", () => {
  it("entoure la signature d'un fond clair seulement si activé", () => {
    expect(renderSignature("classique", defaultSignature)).not.toContain('bgcolor="#ffffff"');
    expect(renderSignature("classique", { ...defaultSignature, darkSafe: true })).toContain('bgcolor="#ffffff"');
    expect(renderReplySignature({ ...defaultSignature, darkSafe: true })).toContain('bgcolor="#ffffff"');
  });
  it("affiche la mention éco uniquement si activée, limitée à 140 caractères", () => {
    expect(renderSignature("classique", { ...defaultSignature, ecoText: "Eco" })).not.toContain("Eco</div>");
    const html = renderSignature("classique", { ...defaultSignature, ecoOn: true, ecoText: "x".repeat(200) });
    expect(html).toContain("x".repeat(140) + "</div>");
    expect(html).not.toContain("x".repeat(141));
  });
});
