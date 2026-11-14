export interface AbsenceData {
  name: string;
  from: string; // AAAA-MM-JJ
  to: string;
  backupName: string;
  backupEmail: string;
  backupPhone: string;
  bookingUrl: string;
  note: string;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
export function frDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
/** Date de retour = lendemain du dernier jour d'absence. */
export function returnDate(to: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(to);
  if (!m) return "";
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + 1));
  return d.toISOString().slice(0, 10);
}

export function absenceText(a: AbsenceData): string {
  const lines = [`Bonjour,`, ``, `Je suis absent(e) du ${frDate(a.from)} au ${frDate(a.to)} inclus, de retour le ${frDate(returnDate(a.to))}.`];
  if (a.note.trim()) lines.push(a.note.trim());
  if (a.backupName.trim()) lines.push(``, `En cas d'urgence, contactez ${a.backupName.trim()}${a.backupEmail ? ` · ${a.backupEmail}` : ""}${a.backupPhone ? ` · ${a.backupPhone}` : ""}.`);
  if (a.bookingUrl.trim()) lines.push(``, `Planifier un point à mon retour : ${a.bookingUrl.trim()}`);
  lines.push(``, `Bien cordialement,`, a.name);
  return lines.join("\n");
}

export function absenceHtml(a: AbsenceData, accent = "#1e3a6e"): string {
  const gold = "#c9a45c";
  const backup = a.backupName.trim()
    ? `<tr><td style="padding:12px 0 0;font-size:13px;color:#333;"><strong>En cas d'urgence :</strong> ${esc(a.backupName.trim())}${a.backupEmail ? ` · <a href="mailto:${esc(a.backupEmail)}" style="color:${accent};">${esc(a.backupEmail)}</a>` : ""}${a.backupPhone ? ` · <a href="tel:${esc(a.backupPhone.replace(/\s/g, ""))}" style="color:${accent};">${esc(a.backupPhone)}</a>` : ""}</td></tr>` : "";
  const book = /^https:\/\//.test(a.bookingUrl.trim())
    ? `<tr><td style="padding:14px 0 0;"><a href="${esc(a.bookingUrl.trim())}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-weight:600;font-size:13px;padding:8px 16px;border-radius:6px;">&#128197; Planifier un point à mon retour</a></td></tr>` : "";
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;max-width:520px;border-left:3px solid ${gold};padding-left:16px;"><tr><td style="font-family:Georgia,serif;font-size:20px;font-style:italic;color:${accent};">Actuellement absent(e)</td></tr><tr><td style="padding-top:8px;font-size:13px;color:#333;line-height:1.5;">Du <strong>${esc(frDate(a.from))}</strong> au <strong>${esc(frDate(a.to))}</strong> inclus.<br>De retour le <strong>${esc(frDate(returnDate(a.to)))}</strong>.${a.note.trim() ? `<br>${esc(a.note.trim().slice(0, 300))}` : ""}</td></tr>${backup}${book}<tr><td style="padding-top:14px;font-size:13px;color:#333;">Bien cordialement,<br><strong>${esc(a.name)}</strong></td></tr></table>`;
}
