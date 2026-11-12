/** Lecture d'un fichier CSV d'équipe (séparateur , ou ;) : renvoie les lignes avec un e-mail valide. */
export type ImportRow = { email: string; name: string; title: string; valid: boolean; duplicate: boolean };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function splitLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (c === sep && !q) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

export function parseTeamCsv(text: string, existing: string[] = []): ImportRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const first = lines[0] ?? "";
  const sep = (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ";" : ",";
  const head = splitLine(first, sep).map((h) => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const hasHeader = head.some((h) => /mail/.test(h));
  const col = (re: RegExp) => head.findIndex((h) => re.test(h));
  const iEmail = hasHeader ? col(/mail/) : 0;
  const iPrenom = hasHeader ? col(/prenom|first/) : -1;
  const iNom = hasHeader ? head.findIndex((h) => /^(nom|name|last)/.test(h)) : -1;
  const iTitle = hasHeader ? col(/poste|fonction|title|role/) : -1;
  const seen = new Set(existing.map((e) => e.toLowerCase()));
  return lines.slice(hasHeader ? 1 : 0).map((l) => {
    const c = splitLine(l, sep);
    const email = (c[iEmail] ?? "").toLowerCase();
    const valid = EMAIL.test(email) && email.length <= 254;
    const duplicate = valid && seen.has(email);
    if (valid) seen.add(email);
    const name = [iPrenom >= 0 ? c[iPrenom] : "", iNom >= 0 ? c[iNom] : ""].filter(Boolean).join(" ");
    return { email, name, title: iTitle >= 0 ? c[iTitle] ?? "" : "", valid, duplicate };
  });
}

export const CSV_TEMPLATE = "Prénom;Nom;Poste;E-mail;Mobile\nCamille;Laurent;Directrice commerciale;camille@entreprise.fr;+33 6 12 34 56 78\n";
