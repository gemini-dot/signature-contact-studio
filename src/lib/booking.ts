/** Prise de rendez-vous : calcul des créneaux (pur, partagé espace membre / page publique). */
export type Range = { start: string; end: string };
export type Weekly = Record<string, Range[]>; // clés "1" (lundi) … "7" (dimanche)
export type Blocked = { from: string; to: string }[];
export type BookingConfig = {
  duration_min: number;
  buffer_min: number;
  min_notice_hours: number;
  horizon_days: number;
  weekly: Weekly;
  blocked: Blocked;
  timezone: string;
  busy: { s: string; e: string }[];
};

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export const defaultWeekly = (): Weekly => {
  const w: Weekly = {};
  for (let d = 1; d <= 5; d++) w[String(d)] = [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }];
  return w;
};

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const pad = (n: number) => String(n).padStart(2, "0");

function tzOffsetMs(utcMs: number, tz: string): number {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
    .formatToParts(new Date(utcMs)).reduce<Record<string, string>>((a, x) => { a[x.type] = x.value; return a; }, {});
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - utcMs;
}

/** Heure murale (date + minutes) dans le fuseau du membre → instant UTC. */
export function zonedToUtc(date: string, minutes: number, tz: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, mo - 1, d, 0, minutes);
  const first = guess - tzOffsetMs(guess, tz);
  return new Date(guess - tzOffsetMs(first, tz));
}

/** ISO day (1 = lundi) d'une date "YYYY-MM-DD". */
export const isoDow = (date: string) => { const [y, m, d] = date.split("-").map(Number); return ((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7) + 1; };

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function todayIn(tz: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Créneaux libres d'une journée (instants UTC). */
export function slotsForDay(cfg: BookingConfig, date: string, now = new Date()): Date[] {
  if (cfg.blocked.some((b) => date >= b.from && date <= b.to)) return [];
  const ranges = cfg.weekly[String(isoDow(date))] ?? [];
  const earliest = now.getTime() + cfg.min_notice_hours * 3600_000;
  const latest = now.getTime() + cfg.horizon_days * 86400_000;
  const buf = cfg.buffer_min * 60_000;
  const busy = cfg.busy.map((b) => [new Date(b.s).getTime(), new Date(b.e).getTime()]);
  const out: Date[] = [];
  for (const r of ranges) {
    const a = toMin(r.start), z = toMin(r.end);
    for (let m = a; m + cfg.duration_min <= z; m += cfg.duration_min + cfg.buffer_min) {
      const s = zonedToUtc(date, m, cfg.timezone).getTime();
      const e = s + cfg.duration_min * 60_000;
      if (s < earliest || s > latest) continue;
      if (busy.some(([bs, be]) => bs < e + buf && be + buf > s)) continue;
      out.push(new Date(s));
    }
  }
  return out.sort((x, y) => x.getTime() - y.getTime());
}

export function slugify(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "mon-agenda";
}

/** Fichier calendrier .ics pour ajouter le rendez-vous à son agenda. */
export function icsFor(title: string, start: Date, minutes: number): string {
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(start.getTime() + minutes * 60_000);
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Signature.Contact//RDV//FR", "BEGIN:VEVENT", `UID:${f(start)}-${Math.random().toString(36).slice(2)}@signature.contact`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`, `SUMMARY:${title.replace(/[,;\n]/g, " ")}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}
