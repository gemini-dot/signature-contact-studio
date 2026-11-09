import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, Copy, Lock, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DAYS, defaultWeekly, slugify, type Blocked, type Weekly } from "@/lib/booking";

export const Route = createFileRoute("/_authenticated/compte/rendez-vous")({ component: BookingPage });

const card = "rounded-2xl border border-border bg-card p-6";
const input = "rounded-lg border border-input bg-background px-3 py-2 text-sm";

function BookingPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const eligQ = useQuery({
    queryKey: ["booking-elig", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.rpc("is_booking_eligible", { _user: user!.id })).data ?? false,
  });
  const pageQ = useQuery({
    queryKey: ["booking-page", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("booking_pages").select("*").maybeSingle()).data,
  });
  const apptQ = useQuery({
    queryKey: ["appointments", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("appointments").select("*").order("starts_at")).data ?? [],
  });

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("Prendre rendez-vous");
  const [hostName, setHostName] = useState("");
  const [intro, setIntro] = useState("");
  const [duration, setDuration] = useState(30);
  const [buffer, setBuffer] = useState(0);
  const [notice, setNotice] = useState(2);
  const [horizon, setHorizon] = useState(30);
  const [weekly, setWeekly] = useState<Weekly>(defaultWeekly());
  const [blocked, setBlocked] = useState<Blocked>([]);
  const [enabled, setEnabled] = useState(true);
  const [newBlock, setNewBlock] = useState({ from: "", to: "" });

  useEffect(() => {
    const p = pageQ.data;
    if (p) {
      setSlug(p.slug); setTitle(p.title); setHostName(p.host_name); setIntro(p.intro);
      setDuration(p.duration_min); setBuffer(p.buffer_min); setNotice(p.min_notice_hours); setHorizon(p.horizon_days);
      setWeekly(p.weekly as Weekly); setBlocked(p.blocked as Blocked); setEnabled(p.enabled);
    } else if (user && !pageQ.isLoading) {
      setSlug(slugify(user.email?.split("@")[0] ?? ""));
    }
  }, [pageQ.data, pageQ.isLoading, user]);

  if (eligQ.isLoading || pageQ.isLoading) return <p className="text-muted-foreground">Chargement…</p>;

  if (!eligQ.data) {
    return (
      <div className={`${card} max-w-xl text-center`}>
        <Lock className="mx-auto h-8 w-8 text-gold" />
        <h2 className="mt-3 font-serif text-2xl">Prise de rendez-vous en ligne</h2>
        <p className="mt-2 text-sm text-muted-foreground">Vos contacts réservent un créneau directement depuis votre signature. Disponible avec les formules Solo et Équipe.</p>
        <Link to="/compte/abonnement" className="mt-5 inline-block rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Voir les formules</Link>
      </div>
    );
  }

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/rdv/${slug}` : `/rdv/${slug}`;
  const setRange = (d: string, i: number, k: "start" | "end", v: string) =>
    setWeekly({ ...weekly, [d]: (weekly[d] ?? []).map((r, j) => (j === i ? { ...r, [k]: v } : r)) });
  const addRange = (d: string) => setWeekly({ ...weekly, [d]: [...(weekly[d] ?? []), { start: "09:00", end: "12:00" }] });
  const delRange = (d: string, i: number) => setWeekly({ ...weekly, [d]: (weekly[d] ?? []).filter((_, j) => j !== i) });
  const toggleDay = (d: string) => setWeekly({ ...weekly, [d]: weekly[d]?.length ? [] : [{ start: "09:00", end: "18:00" }] });
  const copyToAll = (d: string) => { const w: Weekly = {}; for (let i = 1; i <= 7; i++) w[String(i)] = weekly[String(i)]?.length || String(i) === d ? [...(weekly[d] ?? [])] : []; setWeekly(w); toast.success("Plages copiées sur les jours ouverts"); };

  const save = async () => {
    for (const rs of Object.values(weekly)) if (rs.some((r) => r.start >= r.end)) { toast.error("Une plage horaire a une fin avant son début."); return; }
    const s = slugify(slug);
    const { error } = await supabase.from("booking_pages").upsert({
      user_id: user!.id, slug: s, title, host_name: hostName, intro, duration_min: duration, buffer_min: buffer,
      min_notice_hours: notice, horizon_days: horizon, weekly, blocked, enabled, updated_at: new Date().toISOString(),
    });
    if (error) { toast.error(error.code === "23505" ? "Ce lien est déjà pris, choisissez-en un autre." : error.message); return; }
    setSlug(s); toast.success("Agenda enregistré"); qc.invalidateQueries({ queryKey: ["booking-page"] });
  };

  const cancel = async (id: string) => {
    if (!confirm("Annuler ce rendez-vous ?")) return;
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["appointments"] });
  };

  const now = Date.now();
  const upcoming = (apptQ.data ?? []).filter((a) => a.status === "confirmed" && new Date(a.ends_at).getTime() > now);
  const past = (apptQ.data ?? []).filter((a) => !upcoming.includes(a)).reverse().slice(0, 20);
  const fmt = (d: string) => new Date(d).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <div className={card}>
          <h2 className="font-serif text-2xl">Votre lien de <em className="text-gold">réservation</em></h2>
          {pageQ.data ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-muted px-3 py-2 text-sm">{publicUrl}</code>
              <button onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Lien copié"); }} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm"><Copy className="h-4 w-4" /> Copier</button>
              <a href={`/rdv/${slug}`} target="_blank" rel="noreferrer" className="text-sm underline">Voir la page</a>
            </div>
          ) : <p className="mt-2 text-sm text-muted-foreground">Enregistrez vos disponibilités pour obtenir votre lien.</p>}
          <p className="mt-3 text-xs text-muted-foreground">Collez ce lien dans l'éditeur, champ « Lien de réservation » du bouton « Prendre rendez-vous ».</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Adresse du lien<input className={input} value={slug} onChange={(e) => setSlug(e.target.value)} /></label>
            <label className="grid gap-1 text-sm">Votre nom affiché<input className={input} value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Camille Durand" /></label>
            <label className="grid gap-1 text-sm">Titre<input className={input} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Réservations ouvertes</label>
            <label className="grid gap-1 text-sm sm:col-span-2">Message d'accueil<textarea className={input} rows={2} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="Échange de 30 minutes pour faire le point sur votre projet." /></label>
          </div>
        </div>

        <div className={card}>
          <h3 className="font-serif text-xl">Semaine type</h3>
          <div className="mt-4 space-y-3">
            {DAYS.map((label, i) => {
              const d = String(i + 1); const rs = weekly[d] ?? [];
              return (
                <div key={d} className="flex flex-wrap items-start gap-3 border-b border-border pb-3 last:border-0">
                  <label className="flex w-28 items-center gap-2 pt-2 text-sm font-medium"><input type="checkbox" checked={rs.length > 0} onChange={() => toggleDay(d)} />{label}</label>
                  <div className="flex-1 space-y-2">
                    {rs.length === 0 && <p className="pt-2 text-sm text-muted-foreground">Fermé</p>}
                    {rs.map((r, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <input type="time" className={input} value={r.start} onChange={(e) => setRange(d, j, "start", e.target.value)} />
                        <span>–</span>
                        <input type="time" className={input} value={r.end} onChange={(e) => setRange(d, j, "end", e.target.value)} />
                        <button onClick={() => delRange(d, j)} aria-label="Supprimer la plage" className="p-1 text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                    {rs.length > 0 && (
                      <div className="flex gap-3 text-xs">
                        <button onClick={() => addRange(d)} className="inline-flex items-center gap-1 underline"><Plus className="h-3 w-3" /> Ajouter une plage</button>
                        <button onClick={() => copyToAll(d)} className="underline">Copier sur les jours ouverts</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={card}>
          <h3 className="font-serif text-xl">Réglages des rendez-vous</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Durée (minutes)<input type="number" min={5} max={480} className={input} value={duration} onChange={(e) => setDuration(+e.target.value)} /></label>
            <label className="grid gap-1 text-sm">Pause entre deux rendez-vous (min)<input type="number" min={0} max={240} className={input} value={buffer} onChange={(e) => setBuffer(+e.target.value)} /></label>
            <label className="grid gap-1 text-sm">Réserver au moins … heures avant<input type="number" min={0} max={720} className={input} value={notice} onChange={(e) => setNotice(+e.target.value)} /></label>
            <label className="grid gap-1 text-sm">Ouvert sur les … prochains jours<input type="number" min={1} max={365} className={input} value={horizon} onChange={(e) => setHorizon(+e.target.value)} /></label>
          </div>
          <h4 className="mt-6 text-sm font-medium">Congés et indisponibilités</h4>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input type="date" className={input} value={newBlock.from} onChange={(e) => setNewBlock({ ...newBlock, from: e.target.value })} />
            <span>au</span>
            <input type="date" className={input} value={newBlock.to} onChange={(e) => setNewBlock({ ...newBlock, to: e.target.value })} />
            <button onClick={() => { if (!newBlock.from) return; setBlocked([...blocked, { from: newBlock.from, to: newBlock.to || newBlock.from }]); setNewBlock({ from: "", to: "" }); }} className="rounded-full border border-border px-3 py-1.5 text-sm">Bloquer</button>
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {blocked.map((b, i) => (
              <li key={i} className="flex items-center gap-2">{new Date(b.from).toLocaleDateString("fr-FR")} → {new Date(b.to).toLocaleDateString("fr-FR")}
                <button onClick={() => setBlocked(blocked.filter((_, j) => j !== i))} aria-label="Retirer"><Trash2 className="h-4 w-4 text-muted-foreground" /></button></li>
            ))}
          </ul>
          <button onClick={save} className="mt-6 rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">Enregistrer mon agenda</button>
        </div>
      </div>

      <div className="space-y-6">
        <div className={card}>
          <h3 className="flex items-center gap-2 font-serif text-xl"><CalendarCheck className="h-5 w-5 text-gold" /> À venir ({upcoming.length})</h3>
          {upcoming.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Aucun rendez-vous pour le moment.</p>}
          <ul className="mt-3 space-y-3">
            {upcoming.map((a) => (
              <li key={a.id} className="rounded-xl border border-border p-3 text-sm">
                <p className="font-medium capitalize">{fmt(a.starts_at)}</p>
                <p>{a.name} · <a className="underline" href={`mailto:${a.email}`}>{a.email}</a>{a.phone && ` · ${a.phone}`}</p>
                {a.reason && <p className="mt-1 text-muted-foreground">{a.reason}</p>}
                <button onClick={() => cancel(a.id)} className="mt-2 text-xs underline">Annuler</button>
              </li>
            ))}
          </ul>
        </div>
        {past.length > 0 && (
          <div className={card}>
            <h3 className="font-serif text-xl">Historique</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {past.map((a) => <li key={a.id} className="text-muted-foreground"><span className="capitalize">{fmt(a.starts_at)}</span> — {a.name}{a.status === "cancelled" && " (annulé)"}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
