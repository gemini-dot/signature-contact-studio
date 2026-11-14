export interface LetterheadData {
  company: string; tagline: string; logoUrl: string; accent: string;
  address: string; phone: string; email: string; website: string; legal: string; body: string;
}
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const GOLD = "#c9a45c";

/** Page A4 : en-tête (logo, nom, slogan), bande or, corps, pied avec coordonnées et mentions légales. */
export function letterheadHtml(l: LetterheadData): string {
  const accent = /^#[0-9a-f]{3,8}$/i.test(l.accent) ? l.accent : "#1e3a6e";
  const logo = /^https:\/\//.test(l.logoUrl) ? `<img src="${esc(l.logoUrl)}" alt="" style="height:56px;width:auto;margin-right:18px;">` : "";
  const contact = [l.address, l.phone, l.email, l.website].filter((s) => s.trim()).map(esc).join(" &nbsp;·&nbsp; ");
  const body = l.body.trim() ? esc(l.body).replace(/\n/g, "<br>") : "";
  return `<div style="width:210mm;min-height:297mm;box-sizing:border-box;background:#ffffff;color:#222;font-family:Arial,Helvetica,sans-serif;padding:18mm 20mm 0;position:relative;">
<div style="display:flex;align-items:center;">${logo}<div><div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:${accent};">${esc(l.company || "Votre entreprise")}</div>${l.tagline.trim() ? `<div style="font-family:Georgia,serif;font-style:italic;font-size:13px;color:${GOLD};margin-top:2px;">${esc(l.tagline)}</div>` : ""}</div></div>
<div style="height:2px;background:${GOLD};margin:14px 0 28px;"></div>
<div style="font-size:12pt;line-height:1.6;min-height:200mm;">${body}</div>
<div style="position:absolute;left:20mm;right:20mm;bottom:12mm;border-top:1px solid ${GOLD};padding-top:6px;text-align:center;font-size:8.5pt;color:#555;line-height:1.5;">${contact}${l.legal.trim() ? `<br>${esc(l.legal)}` : ""}</div>
</div>`;
}
