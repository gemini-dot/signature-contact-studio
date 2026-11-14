export const ECO_PRESETS = [
  "🌿 N'imprimez ce message que si nécessaire.",
  "♻️ Signature éco-conçue : images légères, zéro pièce jointe inutile.",
];

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
  /** Bouton « Télécharger notre plaquette » (lien fixe, fichier hébergé). */
  docOn: boolean;
  docLabel: string;
  docUrl: string;
  /** Preuve sociale : note et lien vers les avis. */
  reviewOn: boolean;
  reviewText: string;
  reviewUrl: string;
  /** Rendu protégé pour les messageries en mode sombre. */
  darkSafe: boolean;
  /** Mention éco-responsable / RSE. */
  ecoOn: boolean;
  ecoText: string;
  /** Pitch audio de présentation (lien vers un fichier ou une page d'écoute). */
  audioOn: boolean;
  audioLabel: string;
  audioUrl: string;
  /** Fuseau horaire et horaires de disponibilité. */
  tzOn: boolean;
  tzText: string;
  /** Salle de visioconférence permanente en 1 clic. */
  visioOn: boolean;
  visioLabel: string;
  visioUrl: string;
  /** Mode accessible : texte agrandi, contrastes renforcés. */
  a11yOn: boolean;
  /** Mentions réglementaires propres à la profession. */
  legalOn: boolean;
  legalText: string;
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
  docOn: false,
  docLabel: "Télécharger notre plaquette (PDF)",
  docUrl: "",
  reviewOn: false,
  reviewText: "★★★★★ 4,9/5 · Avis Google",
  reviewUrl: "",
  darkSafe: false,
  ecoOn: false,
  ecoText: "🌿 N'imprimez ce message que si nécessaire.",
  audioOn: false,
  audioLabel: "Écouter ma présentation (30 s)",
  audioUrl: "",
  tzOn: false,
  tzText: "Paris (UTC+1) · Lun–Ven 9h–18h",
  visioOn: false,
  visioLabel: "Rejoindre ma salle visio",
  visioUrl: "",
  a11yOn: false,
  legalOn: false,
  legalText: "",
};

/** Modèles de mentions réglementaires par profession (à compléter par le membre). */
export const LEGAL_PRESETS: { label: string; text: string }[] = [
  { label: "Avocat", text: "Avocat au Barreau de [ville] · Toque [n°] · Ce message est couvert par le secret professionnel." },
  { label: "Assurance (ORIAS)", text: "Intermédiaire en assurance immatriculé à l'ORIAS sous le n° [n°] · www.orias.fr" },
  { label: "Immobilier (loi Hoguet)", text: "Carte professionnelle T n° [n°] délivrée par la CCI de [ville] · Garantie financière [organisme]" },
  { label: "Expert-comptable", text: "Membre de l'Ordre des experts-comptables de [région] · Inscription n° [n°]" },
  { label: "Santé", text: "Inscrit(e) à l'Ordre des [médecins/kinés…] · RPPS [n°] · Ne pas transmettre de données de santé par e-mail." },
  { label: "Conseil financier (AMF)", text: "Conseiller en investissements financiers, membre de [association] agréée par l'AMF · ORIAS [n°]" },
  { label: "Confidentialité", text: "Ce message et ses pièces jointes sont confidentiels. Si vous l'avez reçu par erreur, merci de le supprimer et d'en avertir l'expéditeur." },
];

/** Mode accessible : remplace les gris trop clairs par des tons à fort contraste et agrandit le texte. */
export function accessible(html: string): string {
  return html
    .replace(/#(9a9a9a|888|777|666|ccc)\b/gi, "#333333")
    .replace(/#5f7f5a/gi, "#2f5a2a")
    .replace(/font-size:(10|11|12)px/g, "font-size:14px")
    .replace(/font-size:13px/g, "font-size:15px");
}

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
  const halo = d.darkSafe ? "background:#ffffff;padding:3px;box-shadow:0 0 0 1px #e3ddd0;" : "";
  return `<img src="${esc(d.logoUrl)}" alt="${esc(d.company)}" width="${size}" ${h}style="display:block;width:${size}px;${hs}border-radius:${radius};${halo}">`;
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
  if (d.docOn && d.docUrl) {
    row.push(`<td style="padding-right:12px;vertical-align:middle;"><a href="${esc(url(d.docUrl))}" style="display:inline-block;border:1px solid ${d.accent};color:${d.accent};text-decoration:none;font-weight:600;font-size:13px;padding:7px 14px;border-radius:6px;">&#128196; ${esc(d.docLabel || "Télécharger le document")}</a></td>`);
  }
  if (d.visioOn && d.visioUrl) {
    row.push(`<td style="padding-right:12px;vertical-align:middle;"><a href="${esc(url(d.visioUrl))}" style="display:inline-block;border:1px solid ${d.accent};color:${d.accent};text-decoration:none;font-weight:600;font-size:13px;padding:7px 14px;border-radius:6px;">&#127909; ${esc(d.visioLabel || "Rejoindre ma salle visio")}</a></td>`);
  }
  if (row.length) html += `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr>${row.join("")}</tr></table>`;
  const chips: string[] = [];
  if (d.audioOn && d.audioUrl) chips.push(`<a href="${esc(url(d.audioUrl))}" style="color:${d.accent};text-decoration:none;font-weight:600;">&#127911; ${esc(d.audioLabel || "Écouter ma présentation")}</a>`);
  if (d.tzOn && d.tzText.trim()) chips.push(`<span style="color:#555;">&#128339; ${esc(d.tzText.trim().slice(0, 80))}</span>`);
  if (chips.length) html += `<div style="margin-top:10px;font-size:12px;">${chips.join(' <span style="color:#ccc;">&nbsp;|&nbsp;</span> ')}</div>`;
  if (d.reviewOn && d.reviewText) {
    const txt = `<span style="color:${GOLD};font-weight:600;">${esc(d.reviewText)}</span>`;
    html += `<div style="margin-top:10px;font-size:12px;">${d.reviewUrl ? `<a href="${esc(url(d.reviewUrl))}" style="text-decoration:none;">${txt}</a>` : txt}</div>`;
  }
  if (d.bannerOn && (d.bannerImage || d.bannerText)) {
    const inner = d.bannerImage
      ? `<img src="${esc(d.bannerImage)}" width="460" alt="${esc(d.bannerText)}" style="display:block;width:460px;max-width:100%;border-radius:8px;">`
      : `<span style="display:block;background:${d.accent};background-image:linear-gradient(90deg,${d.accent},${GOLD});color:#ffffff;font-size:13px;font-weight:600;padding:12px 16px;border-radius:8px;width:428px;max-width:100%;">${esc(d.bannerText)}</span>`;
    html += `<div style="margin-top:14px;"><a href="${esc(url(d.bannerLink))}" style="text-decoration:none;">${inner}</a></div>`;
  }
  if (d.ecoOn && d.ecoText.trim()) {
    html += `<div style="margin-top:10px;font-size:11px;color:#5f7f5a;">${esc(d.ecoText.trim().slice(0, 140))}</div>`;
  }
  if (d.legalOn && d.legalText.trim()) {
    html += `<div style="margin-top:10px;font-size:10px;line-height:1.4;color:#777;max-width:460px;">${esc(d.legalText.trim().slice(0, 400))}</div>`;
  }
  if (d.branding) {
    html += `<div style="margin-top:10px;font-size:10px;color:#9a9a9a;">Créée avec <a href="https://signature.contact" style="color:#9a9a9a;">signature.contact</a></div>`;
  }
  return html;
}

const wrap = (inner: string) =>
  `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#2b2b2b;"><tr><td>${inner}</td></tr></table>`;

export function renderSignature(t: TemplateId, d: SignatureData): string {
  const html = darkCard(d, renderBase(t, d));
  return d.a11yOn ? accessible(html) : html;
}

/** Mode sombre garanti : fond clair stable autour de la signature, lisible quel que soit le thème du destinataire. */
function darkCard(d: SignatureData, html: string) {
  if (!d.darkSafe) return html;
  return `<table cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background:#ffffff;border-radius:10px;"><tr><td style="padding:14px 16px;background:#ffffff;border-radius:10px;">${html}</td></tr></table>`;
}

function renderBase(t: TemplateId, d: SignatureData): string {
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

/** Version « réponse courte » : 2 lignes légères pour les fils de discussion. */
export function renderReplySignature(d: SignatureData): string {
  const role = [d.title, d.company].filter(Boolean).map(esc).join(" · ");
  const contact = [
    d.phone ? `<a href="tel:${esc(d.phone.replace(/\s/g, ""))}" style="color:#666;text-decoration:none;">${esc(d.phone)}</a>` : "",
    d.website ? `<a href="${esc(url(d.website))}" style="color:#666;text-decoration:none;">${esc(d.website)}</a>` : "",
  ].filter(Boolean).join(' <span style="color:#ccc;">|</span> ');
  return darkCard(d, wrap(`<div style="font-size:13px;"><strong style="color:${d.accent};">${esc(d.name)}</strong>${role ? ` <span style="color:#888;">— ${role}</span>` : ""}</div>${contact ? `<div style="font-size:12px;color:#666;">${contact}</div>` : ""}`));
}
