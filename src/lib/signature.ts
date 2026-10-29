export type TemplateId = "classique" | "moderne" | "minimal" | "elegant" | "compact";

export interface SignatureData {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  linkedin: string;
  instagram: string;
  x: string;
  logoUrl: string;
  logoSize: number;
  logoShape: "arrondi" | "carre" | "cercle";
  /** Image importée d'origine, avant recadrage. */
  logoSrc: string;
  logoZoom: number;
  logoX: number;
  logoY: number;
  accent: string;
  bannerOn: boolean;
  bannerText: string;
  bannerImage: string;
  bannerLink: string;
  bookingOn: boolean;
  bookingLabel: string;
  bookingUrl: string;
  qrOn: boolean;
  branding: boolean;
}

export const defaultSignature: SignatureData = {
  name: "Camille Laurent",
  title: "Directrice commerciale",
  company: "Atelier Laurent",
  phone: "+33 6 12 34 56 78",
  email: "camille@atelier-laurent.fr",
  website: "atelier-laurent.fr",
  address: "12 rue des Arts, 75003 Paris",
  linkedin: "linkedin.com/in/camille",
  instagram: "",
  x: "",
  logoUrl: "",
  logoSize: 72,
  logoShape: "arrondi",
  logoSrc: "",
  logoZoom: 1,
  logoX: 50,
  logoY: 50,
  accent: "#1e3a6e",
  bannerOn: true,
  bannerText: "Nouveau : notre collection d'automne est en ligne →",
  bannerImage: "",
  bannerLink: "https://atelier-laurent.fr",
  bookingOn: true,
  bookingLabel: "Prendre rendez-vous",
  bookingUrl: "https://calendly.com/camille",
  qrOn: false,
  branding: true,
};

export const templates: { id: TemplateId; label: string }[] = [
  { id: "classique", label: "Classique" },
  { id: "moderne", label: "Moderne" },
  { id: "minimal", label: "Minimal" },
  { id: "elegant", label: "Élégant" },
  { id: "compact", label: "Compact" },
];

const GOLD = "#c9a45c";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function url(s: string) {
  if (!s) return "";
  return /^(https?:|mailto:|tel:|data:)/.test(s) ? s : `https://${s}`;
}

function contactLines(d: SignatureData, color: string, sep = "<br>") {
  const parts: string[] = [];
  if (d.phone) parts.push(`<a href="tel:${esc(d.phone.replace(/\s/g, ""))}" style="color:${color};text-decoration:none;">${esc(d.phone)}</a>`);
  if (d.email) parts.push(`<a href="mailto:${esc(d.email)}" style="color:${color};text-decoration:none;">${esc(d.email)}</a>`);
  if (d.website) parts.push(`<a href="${esc(url(d.website))}" style="color:${color};text-decoration:none;">${esc(d.website)}</a>`);
  if (d.address) parts.push(`<span style="color:${color};">${esc(d.address)}</span>`);
  return parts.join(sep);
}

function socials(d: SignatureData) {
  const list = ([
    ["LinkedIn", d.linkedin],
    ["Instagram", d.instagram],
    ["X", d.x],
  ] as [string, string][]).filter(([, v]) => v);
  if (!list.length) return "";
  return list
    .map(([n, v]) => `<a href="${esc(url(v))}" style="color:${d.accent};text-decoration:none;font-weight:600;margin-right:10px;">${n}</a>`)
    .join("");
}

export const LOGO_MIN = 32;
export const LOGO_MAX = 160;
export function clampLogoSize(n: number) {
  return Math.min(LOGO_MAX, Math.max(LOGO_MIN, Math.round(Number.isFinite(n) ? n : 72)));
}
export const ZOOM_MAX = 4;
/** Zone visible de l'image d'origine : zoom 1 à 4, position 0 à 100 % sur chaque axe. */
export function cropRect(w: number, h: number, zoom: number, x: number, y: number, square: boolean) {
  const z = Math.min(ZOOM_MAX, Math.max(1, zoom));
  const cx = Math.min(100, Math.max(0, x)) / 100;
  const cy = Math.min(100, Math.max(0, y)) / 100;
  const side = Math.min(w, h);
  const cw = (square ? side : w) / z;
  const ch = (square ? side : h) / z;
  return { sx: (w - cw) * cx, sy: (h - ch) * cy, sw: cw, sh: ch };
}
function logo(d: SignatureData, _size = 64) {
  if (!d.logoUrl) return "";
  const size = clampLogoSize(d.logoSize);
  const shape = d.logoShape ?? "arrondi";
  const radius = shape === "cercle" ? "50%" : shape === "carre" ? "0" : "8px";
  const h = shape === "cercle" ? `height="${size}" ` : "";
  const hs = shape === "cercle" ? `height:${size}px;object-fit:cover;` : "height:auto;";
  return `<img src="${esc(d.logoUrl)}" alt="${esc(d.company)}" width="${size}" ${h}style="display:block;width:${size}px;${hs}border-radius:${radius};">`;
}

function extras(d: SignatureData) {
  let html = "";
  const row: string[] = [];
  if (d.bookingOn && d.bookingUrl) {
    row.push(`<td style="padding-right:12px;vertical-align:middle;"><a href="${esc(url(d.bookingUrl))}" style="display:inline-block;background:${d.accent};color:#ffffff;text-decoration:none;font-weight:600;font-size:13px;padding:8px 16px;border-radius:6px;">📅 ${esc(d.bookingLabel || "Prendre rendez-vous")}</a></td>`);
  }
  if (d.qrOn) {
    const data = encodeURIComponent(`BEGIN:VCARD\nVERSION:3.0\nFN:${d.name}\nORG:${d.company}\nTITLE:${d.title}\nTEL:${d.phone}\nEMAIL:${d.email}\nURL:${url(d.website)}\nEND:VCARD`);
    row.push(`<td style="vertical-align:middle;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=144x144&margin=0&data=${data}" width="72" height="72" alt="Carte de visite" style="display:block;"></td>`);
  }
  if (row.length) html += `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr>${row.join("")}</tr></table>`;
  if (d.bannerOn && (d.bannerImage || d.bannerText)) {
    const inner = d.bannerImage
      ? `<img src="${esc(d.bannerImage)}" width="460" alt="${esc(d.bannerText)}" style="display:block;width:460px;max-width:100%;border-radius:8px;">`
      : `<span style="display:block;background:${d.accent};background-image:linear-gradient(90deg,${d.accent},${GOLD});color:#ffffff;font-size:13px;font-weight:600;padding:12px 16px;border-radius:8px;width:428px;max-width:100%;">${esc(d.bannerText)}</span>`;
    html += `<div style="margin-top:14px;"><a href="${esc(url(d.bannerLink))}" style="text-decoration:none;">${inner}</a></div>`;
  }
  if (d.branding) {
    html += `<div style="margin-top:10px;font-size:10px;color:#9a9a9a;">Créée avec <a href="https://signature.contact" style="color:#9a9a9a;">signature.contact</a></div>`;
  }
  return html;
}

const wrap = (inner: string) =>
  `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#2b2b2b;"><tr><td>${inner}</td></tr></table>`;

export function renderSignature(t: TemplateId, d: SignatureData): string {
  const name = esc(d.name);
  const role = [d.title, d.company].filter(Boolean).map(esc).join(" · ");
  switch (t) {
    case "moderne":
      return wrap(`<table cellpadding="0" cellspacing="0" border="0"><tr>
${d.logoUrl ? `<td style="vertical-align:top;padding-right:16px;">${logo(d, 72)}</td>` : ""}
<td style="vertical-align:top;border-left:3px solid ${GOLD};padding-left:16px;">
<div style="font-size:18px;font-weight:700;color:${d.accent};">${name}</div>
<div style="font-size:13px;color:#666;margin-bottom:8px;">${role}</div>
<div style="font-size:12px;">${contactLines(d, "#2b2b2b")}</div>
<div style="margin-top:6px;font-size:12px;">${socials(d)}</div>
</td></tr></table>${extras(d)}`);
    case "minimal":
      return wrap(`<div style="font-size:15px;font-weight:700;color:#1a1a1a;">${name}</div>
<div style="font-size:12px;color:#777;">${role}</div>
<div style="font-size:12px;margin-top:6px;">${contactLines(d, "#555", ' <span style="color:#ccc;">|</span> ')}</div>
<div style="margin-top:4px;font-size:12px;">${socials(d)}</div>${extras(d)}`);
    case "elegant":
      return wrap(`<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-style:italic;color:${d.accent};">${name}</div>
<div style="font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};margin:2px 0 10px;">${role}</div>
<table cellpadding="0" cellspacing="0" border="0"><tr>
${d.logoUrl ? `<td style="vertical-align:top;padding-right:14px;">${logo(d, 56)}</td>` : ""}
<td style="font-size:12px;border-top:1px solid ${GOLD};padding-top:8px;">${contactLines(d, "#444")}<div style="margin-top:6px;">${socials(d)}</div></td>
</tr></table>${extras(d)}`);
    case "compact":
      return wrap(`<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="background:${d.accent};color:#fff;padding:10px 14px;border-radius:8px 0 0 8px;vertical-align:middle;">
<div style="font-size:15px;font-weight:700;color:#ffffff;">${name}</div>
<div style="font-size:11px;color:${GOLD};">${role}</div></td>
<td style="background:#f6f3ec;padding:10px 14px;border-radius:0 8px 8px 0;font-size:12px;vertical-align:middle;">${contactLines(d, "#2b2b2b")}</td>
</tr></table><div style="margin-top:6px;font-size:12px;">${socials(d)}</div>${extras(d)}`);
    default:
      return wrap(`<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:top;padding-right:18px;">
<div style="font-size:17px;font-weight:700;color:${d.accent};">${name}</div>
<div style="font-size:13px;color:#555;">${esc(d.title)}</div>
<div style="font-size:13px;font-weight:600;color:${GOLD};margin-bottom:8px;">${esc(d.company)}</div>
${logo(d, 64)}
</td>
<td style="vertical-align:top;border-left:1px solid #e3ddd0;padding-left:18px;font-size:12px;">${contactLines(d, "#2b2b2b")}<div style="margin-top:6px;">${socials(d)}</div></td>
</tr></table>${extras(d)}`);
  }
}
