export type DocKind = "lettre" | "devis" | "proposition";
export type DocStyle = "classique" | "moderne" | "epure";
export interface LetterheadData {
  company: string; tagline: string; logoUrl: string; accent: string;
  address: string; phone: string; email: string; website: string; legal: string; body: string;
  kind?: DocKind; style?: DocStyle; reference?: string; recipient?: string; title?: string;
}
export const DOC_KINDS: { id: DocKind; label: string; hint: string }[] = [
  { id: "lettre", label: "Lettre", hint: "Courrier classique avec destinataire et objet." },
  { id: "devis", label: "Devis", hint: "Une ligne par prestation : description ; quantité ; prix unitaire HT." },
  { id: "proposition", label: "Proposition", hint: "Page de garde puis sections : une ligne « # Titre » ouvre une section." },
];
export const DOC_STYLES: { id: DocStyle; label: string }[] = [
  { id: "classique", label: "Classique" }, { id: "moderne", label: "Moderne" }, { id: "epure", label: "Épuré" },
];
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const GOLD = "#c9a45c";
const money = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

/** Lignes « description ; quantité ; prix » → lignes chiffrées + totaux HT/TVA 20 %/TTC. */
export function parseQuoteLines(body: string) {
  const lines = body.split("\n").map((r) => r.split(";").map((c) => c.trim())).filter((c) => c[0])
    .map(([d = "", q, p]) => { const qty = Number((q || "1").replace(",", ".")) || 0; const unit = Number((p || "0").replace(",", ".")) || 0; return { d, qty, unit, total: Math.round(qty * unit * 100) / 100 }; });
  const ht = Math.round(lines.reduce((s, l) => s + l.total, 0) * 100) / 100;
  const tva = Math.round(ht * 20) / 100;
  return { lines, ht, tva, ttc: Math.round((ht + tva) * 100) / 100 };
}

function header(l: LetterheadData, accent: string, style: DocStyle) {
  const logo = /^https:\/\//.test(l.logoUrl) ? `<img src="${esc(l.logoUrl)}" alt="" style="height:56px;width:auto;${style === "epure" ? "margin:0 auto 10px;display:block;" : "margin-right:18px;"}">` : "";
  const name = `<div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:${style === "moderne" ? "#fff" : accent};">${esc(l.company || "Votre entreprise")}</div>`;
  const tag = l.tagline.trim() ? `<div style="font-family:Georgia,serif;font-style:italic;font-size:13px;color:${GOLD};margin-top:2px;">${esc(l.tagline)}</div>` : "";
  if (style === "moderne") return `<div style="background:${accent};margin:-18mm -20mm 24px;padding:14mm 20mm;display:flex;align-items:center;border-bottom:4px solid ${GOLD};">${logo}<div>${name}${tag}</div></div>`;
  if (style === "epure") return `<div style="text-align:center;margin-bottom:26px;">${logo}${name}${tag}<div style="width:60px;height:1px;background:${GOLD};margin:12px auto 0;"></div></div>`;
  return `<div style="display:flex;align-items:center;">${logo}<div>${name}${tag}</div></div><div style="height:2px;background:${GOLD};margin:14px 0 28px;"></div>`;
}

function content(l: LetterheadData, accent: string) {
  const kind = l.kind ?? "lettre";
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const to = l.recipient?.trim() ? `<div style="margin-left:55%;margin-bottom:22px;white-space:pre-line;">${esc(l.recipient)}</div>` : "";
  const h = (t: string) => `<div style="font-family:Georgia,serif;font-size:20px;color:${accent};margin:0 0 12px;">${esc(t)}</div>`;
  if (kind === "devis") {
    const q = parseQuoteLines(l.body);
    const rows = q.lines.map((r) => `<tr><td style="padding:6px;border-bottom:1px solid #eee;">${esc(r.d)}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${r.qty}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${money(r.unit)}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${money(r.total)}</td></tr>`).join("");
    return `${to}${h(`Devis ${l.reference?.trim() ? "n° " + l.reference : ""}`)}<div style="font-size:10pt;color:#666;margin-bottom:16px;">Date : ${date} · Validité : 30 jours</div>
<table style="width:100%;border-collapse:collapse;font-size:10.5pt;"><thead><tr style="background:${accent};color:#fff;"><th style="padding:7px;text-align:left;">Désignation</th><th style="padding:7px;text-align:right;">Qté</th><th style="padding:7px;text-align:right;">PU HT</th><th style="padding:7px;text-align:right;">Total HT</th></tr></thead><tbody>${rows}</tbody></table>
<table style="margin:14px 0 0 auto;font-size:10.5pt;"><tr><td style="padding:3px 12px;">Total HT</td><td style="text-align:right;">${money(q.ht)}</td></tr><tr><td style="padding:3px 12px;">TVA 20 %</td><td style="text-align:right;">${money(q.tva)}</td></tr><tr><td style="padding:6px 12px;border-top:2px solid ${GOLD};font-weight:bold;">Total TTC</td><td style="text-align:right;border-top:2px solid ${GOLD};font-weight:bold;">${money(q.ttc)}</td></tr></table>
<div style="margin-top:40px;font-size:10pt;">Bon pour accord, date et signature :</div>`;
  }
  if (kind === "proposition") {
    const parts = l.body.split("\n").map((line) => line.startsWith("#") ? h(line.replace(/^#+\s*/, "")) : line.trim() ? `<p style="margin:0 0 8px;">${esc(line)}</p>` : "").join("");
    return `<div style="text-align:center;margin:30px 0 36px;"><div style="font-size:10pt;letter-spacing:3px;text-transform:uppercase;color:${GOLD};">Proposition commerciale</div><div style="font-family:Georgia,serif;font-size:30px;color:${accent};margin-top:8px;">${esc(l.title?.trim() || "Votre projet")}</div>${l.recipient?.trim() ? `<div style="margin-top:8px;color:#666;">Pour ${esc(l.recipient.split("\n")[0] ?? "")}</div>` : ""}<div style="margin-top:4px;color:#999;font-size:10pt;">${date}</div></div>${parts}`;
  }
  const body = l.body.trim() ? esc(l.body).replace(/\n/g, "<br>") : "";
  return `${to}<div style="text-align:right;color:#666;margin-bottom:18px;">Le ${date}</div>${l.title?.trim() ? `<div style="margin-bottom:16px;"><b>Objet :</b> ${esc(l.title)}</div>` : ""}${body}`;
}

/** Page A4 : en-tête selon le style, contenu selon le type de document, pied avec coordonnées et mentions légales. */
export function letterheadHtml(l: LetterheadData): string {
  const accent = /^#[0-9a-f]{3,8}$/i.test(l.accent) ? l.accent : "#1e3a6e";
  const style = l.style ?? "classique";
  const contact = [l.address, l.phone, l.email, l.website].filter((s) => s.trim()).map(esc).join(" &nbsp;·&nbsp; ");
  return `<div style="width:210mm;min-height:297mm;box-sizing:border-box;background:#ffffff;color:#222;font-family:Arial,Helvetica,sans-serif;padding:18mm 20mm 0;position:relative;overflow:hidden;">
${header(l, accent, style)}
<div style="font-size:11pt;line-height:1.6;min-height:200mm;">${content(l, accent)}</div>
<div style="position:absolute;left:20mm;right:20mm;bottom:12mm;border-top:1px solid ${GOLD};padding-top:6px;text-align:center;font-size:8.5pt;color:#555;line-height:1.5;">${contact}${l.legal.trim() ? `<br>${esc(l.legal)}` : ""}</div>
</div>`;
}
