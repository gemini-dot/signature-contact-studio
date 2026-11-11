/** Statuts de disponibilité affichés sur le mini-profil et la page de vérification. */
export const STATUSES = {
  disponible: { label: "Disponible", tone: "bg-emerald-500" },
  reunion: { label: "En réunion", tone: "bg-amber-500" },
  deplacement: { label: "En déplacement", tone: "bg-amber-500" },
  conges: { label: "En congés", tone: "bg-sky-500" },
  absent: { label: "Absent", tone: "bg-muted-foreground" },
} as const;
export type StatusKey = keyof typeof STATUSES;

export type ProfileLink = { label: string; url: string };
export type ProfileService = { name: string; description: string; price: string };

export type PublicProfile = {
  full_name: string; job_title: string; company: string; email: string; phone: string;
  website: string; address: string; bio: string; photo_url: string; links: ProfileLink[];
  activity?: string; services?: ProfileService[];
  profile_enabled: boolean; verified: boolean; verified_at: string | null;
  status: StatusKey; status_note: string; status_until: string | null; booking_slug: string | null;
  has_document?: boolean; document_label?: string;
  rating?: number | null; rating_count?: number | null; rating_source?: string; reviews_url?: string;
  testimonial?: string; testimonial_author?: string;
};

/** Texte court de preuve sociale, ex. « ★★★★★ 4,9/5 · 128 avis Google ». */
export function ratingLine(rating: number | null | undefined, count?: number | null, source?: string): string {
  if (rating == null || !Number.isFinite(rating)) return "";
  const r = Math.min(5, Math.max(0, rating));
  const full = Math.round(r);
  const stars = "★".repeat(full) + "☆".repeat(5 - full);
  const parts = [`${stars} ${r.toFixed(1).replace(".", ",")}/5`];
  if (count) parts.push(`${count} avis${source ? " " + source : ""}`);
  else if (source) parts.push(source);
  return parts.join(" · ");
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** Fiche contact .vcf (vCard 3.0) importable dans un carnet d'adresses. */
export function buildVCard(p: Pick<PublicProfile, "full_name" | "job_title" | "company" | "email" | "phone" | "website" | "address">, profileUrl?: string): string {
  const parts = p.full_name.trim().split(/\s+/);
  const last = parts.length > 1 ? parts.pop()! : "";
  const first = parts.join(" ");
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${esc(last)};${esc(first)};;;`, `FN:${esc(p.full_name.trim())}`];
  if (p.company) lines.push(`ORG:${esc(p.company)}`);
  if (p.job_title) lines.push(`TITLE:${esc(p.job_title)}`);
  if (p.email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${p.email}`);
  if (p.phone) lines.push(`TEL;TYPE=WORK,VOICE:${p.phone}`);
  if (p.website) lines.push(`URL:${p.website}`);
  if (p.address) lines.push(`ADR;TYPE=WORK:;;${esc(p.address)};;;;`);
  if (profileUrl) lines.push(`NOTE:${esc("Carte de visite : " + profileUrl)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export const qrUrl = (data: string, size = 240) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${encodeURIComponent(data)}`;

/** Bannière programmée active à une date donnée (AAAA-MM-JJ), sinon bannière par défaut. */
export type Banner = { id: string; is_default: boolean; starts_on: string | null; ends_on: string | null; created_at: string };
export function activeBanner<T extends Banner>(list: T[], today: string): T | null {
  const live = list
    .filter((b) => !b.is_default && (!b.starts_on || b.starts_on <= today) && (!b.ends_on || b.ends_on >= today))
    .sort((a, b) => (b.starts_on ?? "").localeCompare(a.starts_on ?? "") || b.created_at.localeCompare(a.created_at));
  return live[0] ?? list.find((b) => b.is_default) ?? null;
}
