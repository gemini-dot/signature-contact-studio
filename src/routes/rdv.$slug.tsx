import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { CalendarCheck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, icsFor, slotsForDay, todayIn, type BookingConfig } from "@/lib/booking";

export const Route = createFileRoute("/rdv/$slug")({
  head: () => ({
    meta: [
      { title: "Prendre rendez-vous — Signature.Contact" },
      { name: "description", content: "Choisissez un créneau et réservez votre rendez-vous en ligne." },
      { property: "og:title", content: "Prendre rendez-vous — Signature.Contact" },
      { property: "og:description", content: "Réservez un créneau en quelques secondes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicBooking,
});

type Page = BookingConfig & { title: string; host_name: string; intro: string };
const input = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";

function PublicBooking() {
  const { slug } = Route.useParams();
  const q = useQuery({
    queryKey: ["public-booking", slug],
    queryFn: async () => (await supabase.rpc("get_booking_page", { _slug: slug })).data as Page | null,
  });
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<Date | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Date | null>(null);

  const p = q.data;
  const days = useMemo(() => {
    if (!p) return [];
    const t = todayIn(p.timezone);
    return Array.from({ length: Math.min(p.horizon_days + 1, 60) }, (_, i) => addDays(t, i))
      .map((d) => ({ d, n: slotsForDay(p, d).length }));
  }, [p]);

  if (q.isLoading) return <section className="mx-auto max-w-3xl px-5 py-16 text-muted-foreground">Chargement…</section>;
  if (!p) return <section className="mx-auto max-w-3xl px-5 py-16 text-center"><h1 className="text-3xl">Page de réservation indisponible</h1><p className="mt-2 text-muted-foreground">Ce lien n'est pas ou plus actif.</p></section>;

  const timeFmt = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: p.timezone });
  const dayLabel = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!slot) return;
    setBusy(true); setErr("");
    const { error } = await supabase.rpc("book_appointment", { _slug: slug, _starts_at: slot.toISOString(), _name: form.name, _email: form.email, _phone: form.phone, _reason: form.reason });
    setBusy(false);
    if (error) { setErr(error.message); q.refetch(); setSlot(null); return; }
    setDone(slot);
  };

  if (done) {
    const ics = icsFor(`${p.title}${p.host_name ? ` — ${p.host_name}` : ""}`, done, p.duration_min);
    return (
      <section className="mx-auto max-w-xl px-5 py-16 text-center">
        <CalendarCheck className="mx-auto h-10 w-10 text-gold" />
        <h1 className="mt-4 text-3xl">Rendez-vous <em className="text-gold">confirmé</em></h1>
        <p className="mt-3 capitalize">{done.toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: p.timezone })}</p>
        <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`} download="rendez-vous.ics" className="mt-6 inline-block rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Ajouter à mon agenda</a>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-12">
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        {p.host_name && <p className="text-sm text-muted-foreground">{p.host_name}</p>}
        <h1 className="mt-1 text-3xl md:text-4xl">{p.title}</h1>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> {p.duration_min} min</p>
        {p.intro && <p className="mt-3 text-sm">{p.intro}</p>}

        <h2 className="mt-8 text-lg font-medium">1. Choisissez un jour</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {days.filter((x) => x.n > 0).map(({ d }) => (
            <button key={d} onClick={() => { setDay(d); setSlot(null); }} className={`shrink-0 rounded-xl border px-3 py-2 text-sm capitalize ${day === d ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}>{dayLabel(d)}</button>
          ))}
          {days.every((x) => x.n === 0) && <p className="text-sm text-muted-foreground">Aucun créneau disponible pour le moment.</p>}
        </div>

        {day && (
          <>
            <h2 className="mt-6 text-lg font-medium">2. Choisissez l'heure</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {slotsForDay(p, day).map((s) => (
                <button key={s.toISOString()} onClick={() => setSlot(s)} className={`rounded-lg border px-2 py-2 text-sm ${slot?.getTime() === s.getTime() ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}>{timeFmt(s)}</button>
              ))}
            </div>
          </>
        )}

        {slot && (
          <form onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-2">
            <h2 className="text-lg font-medium sm:col-span-2">3. Vos coordonnées</h2>
            <input required minLength={2} maxLength={120} placeholder="Prénom et nom" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" maxLength={200} placeholder="E-mail" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input maxLength={40} placeholder="Téléphone (facultatif)" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea maxLength={1000} placeholder="Motif du rendez-vous (facultatif)" rows={3} className={`${input} sm:col-span-2`} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            {err && <p className="text-sm text-destructive sm:col-span-2">{err}</p>}
            <button disabled={busy} className="rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground sm:col-span-2 sm:justify-self-start">{busy ? "Réservation…" : `Confirmer le ${timeFmt(slot)}`}</button>
          </form>
        )}
      </div>
    </section>
  );
}
