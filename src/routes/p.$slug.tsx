import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CalendarCheck, Download, Globe, Mail, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildVCard, STATUSES, type PublicProfile } from "@/lib/member";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({
    meta: [
      { title: "Carte de visite — Signature.Contact" },
      { name: "description", content: "Coordonnées, liens et prise de rendez-vous en un coup d'œil." },
      { property: "og:title", content: "Carte de visite — Signature.Contact" },
      { property: "og:description", content: "Ajoutez ce contact à votre carnet d'adresses en un clic." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { slug } = Route.useParams();
  const q = useQuery({ queryKey: ["public-profile", slug], queryFn: async () => (await supabase.rpc("get_member_profile", { _slug: slug })).data as PublicProfile | null });
  const p = q.data;
  if (q.isLoading) return <div className="py-32 text-center text-muted-foreground">Chargement…</div>;
  if (!p || !p.profile_enabled) return <div className="py-32 text-center"><p className="font-serif text-2xl">Profil introuvable</p><Link to="/" className="mt-4 inline-block text-gold underline">Retour à l'accueil</Link></div>;

  const st = STATUSES[p.status] ?? STATUSES.disponible;
  const vcf = () => {
    const blob = new Blob([buildVCard(p, window.location.href)], { type: "text/vcard" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${slug}.vcf`; a.click();
  };
  const row = "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm hover:bg-accent";

  return (
    <section className="mx-auto max-w-md px-5 py-14">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-elegant">
        {p.photo_url ? <img src={p.photo_url} alt={p.full_name} className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-gold" /> : <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary font-serif text-3xl text-primary-foreground">{p.full_name.slice(0, 1)}</div>}
        <h1 className="mt-4 font-serif text-3xl">{p.full_name}</h1>
        {p.verified && <Link to="/verif/$slug" params={{ slug }} className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-foreground"><BadgeCheck className="h-4 w-4 text-gold" /> Identité vérifiée</Link>}
        <p className="mt-2 text-muted-foreground">{[p.job_title, p.company].filter(Boolean).join(" · ")}</p>
        <p className="mt-3 inline-flex items-center gap-2 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${st.tone}`} />{st.label}{p.status_until && ` jusqu'au ${new Date(p.status_until).toLocaleDateString("fr-FR")}`}{p.status_note && ` — ${p.status_note}`}</p>
        {p.bio && <p className="mt-4 text-sm text-muted-foreground">{p.bio}</p>}
        <button onClick={vcf} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground"><Download className="h-4 w-4" /> Ajouter à mes contacts</button>
        <div className="mt-6 space-y-2 text-left">
          {p.booking_slug && <a href={`/rdv/${p.booking_slug}`} className={row}><CalendarCheck className="h-4 w-4 text-gold" /> Prendre rendez-vous</a>}
          {p.email && <a href={`mailto:${p.email}`} className={row}><Mail className="h-4 w-4 text-gold" /> {p.email}</a>}
          {p.phone && <a href={`tel:${p.phone}`} className={row}><Phone className="h-4 w-4 text-gold" /> {p.phone}</a>}
          {p.website && <a href={p.website} target="_blank" rel="noreferrer" className={row}><Globe className="h-4 w-4 text-gold" /> {p.website.replace(/^https?:\/\//, "")}</a>}
          {p.address && <div className={row}><MapPin className="h-4 w-4 text-gold" /> {p.address}</div>}
          {p.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className={row}><Globe className="h-4 w-4 text-gold" /> {l.label}</a>)}
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Carte créée avec <Link to="/" className="underline">Signature.Contact</Link></p>
    </section>
  );
}
