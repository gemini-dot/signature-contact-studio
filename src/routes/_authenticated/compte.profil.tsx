import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Copy, Download, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import { LockedFeature } from "@/components/site/LockedFeature";
import { slugify } from "@/lib/booking";
import { buildVCard, qrUrl, type ProfileLink, type ProfileService } from "@/lib/member";
import { ImageUpload } from "@/components/site/ImageUpload";

export const Route = createFileRoute("/_authenticated/compte/profil")({ component: ProfilePage });

const card = "rounded-2xl border border-border bg-card p-6";
const input = "rounded-lg border border-input bg-background px-3 py-2 text-sm";
const empty = { slug: "", full_name: "", job_title: "", company: "", email: "", phone: "", website: "", address: "", bio: "", photo_url: "" };

function ProfilePage() {
  const { user } = useAuth();
  const { paid, loading } = usePlan();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["my-profile", user?.id], enabled: !!user && paid,
    queryFn: async () => (await supabase.from("member_profiles").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });
  const [f, setF] = useState(empty);
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [services, setServices] = useState<ProfileService[]>([]);
  const [activity, setActivity] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [badge, setBadge] = useState(false);

  useEffect(() => {
    const p = q.data;
    if (p) {
      setF({ slug: p.slug, full_name: p.full_name, job_title: p.job_title, company: p.company, email: p.email, phone: p.phone, website: p.website, address: p.address, bio: p.bio, photo_url: p.photo_url });
      setLinks((p.links as ProfileLink[]) ?? []); setServices((p.services as ProfileService[]) ?? []); setActivity(p.activity ?? ""); setEnabled(p.profile_enabled); setBadge(p.badge_enabled);
    } else if (user && q.isFetched) {
      setF((x) => ({ ...x, email: user.email ?? "", slug: slugify((user.email ?? "").split("@")[0] ?? "") }));
    }
  }, [q.data, q.isFetched, user]);

  if (loading) return null;
  if (!paid) return <LockedFeature title="Carte de visite & badge vérifié" plan="Solo" benefits={["Mini-page profil élégante à votre nom", "QR code et fiche contact (.vcf) en un scan", "Badge « Identité vérifiée » anti-usurpation"]} />;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const profileUrl = `${origin}/p/${f.slug}`;
  const verifUrl = `${origin}/verif/${f.slug}`;
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    const s = slugify(f.slug);
    if (s.length < 2) { toast.error("Choisissez une adresse de profil (2 caractères minimum)."); return; }
    if (!f.full_name.trim()) { toast.error("Indiquez votre nom."); return; }
    const { data, error } = await supabase.from("member_profiles").upsert({
      user_id: user!.id, ...f, slug: s, links: links.filter((l) => l.label && l.url),
      activity: activity.slice(0, 1500), services: services.filter((x) => x.name.trim()).slice(0, 12),
      profile_enabled: enabled, badge_enabled: badge,
    }).select().single();
    if (error) { toast.error(error.code === "23505" ? "Cette adresse est déjà prise." : error.message); return; }
    if (badge && !data.badge_enabled) toast.warning("Badge non activé : confirmez d'abord votre adresse e-mail.");
    else toast.success("Profil enregistré");
    if (!q.data) window.__lovableEvents?.track?.("project.profile_created", { badge: !!data.badge_enabled, services_count: services.length });
    qc.invalidateQueries({ queryKey: ["my-profile"] });
  };

  const downloadVcf = () => {
    const blob = new Blob([buildVCard(f, profileUrl)], { type: "text/vcard" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${f.slug || "contact"}.vcf`; a.click();
    window.__lovableEvents?.track?.("project.qr_downloaded", { format: "vcf" });
  };
  const downloadQr = async () => {
    try {
      const blob = await (await fetch(qrUrl(profileUrl, 600))).blob();
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `qr-${f.slug}.png`; a.click();
      window.__lovableEvents?.track?.("project.qr_downloaded", { format: "png" });
    } catch { toast.error("Téléchargement impossible"); }
  };
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copié"); };
  const saved = !!q.data;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <div className={card}>
          <h2 className="font-serif text-2xl">Votre carte de <em className="text-gold">visite</em></h2>
          <p className="mt-1 text-sm text-muted-foreground">Ces informations alimentent votre mini-page profil et votre fiche contact.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Nom complet<input className={input} value={f.full_name} onChange={set("full_name")} /></label>
            <label className="grid gap-1 text-sm">Poste<input className={input} value={f.job_title} onChange={set("job_title")} /></label>
            <label className="grid gap-1 text-sm">Entreprise<input className={input} value={f.company} onChange={set("company")} /></label>
            <label className="grid gap-1 text-sm">E-mail<input className={input} value={f.email} onChange={set("email")} disabled={badge && !!q.data?.verified_at} /></label>
            <label className="grid gap-1 text-sm">Téléphone<input className={input} value={f.phone} onChange={set("phone")} /></label>
            <label className="grid gap-1 text-sm">Site web<input className={input} value={f.website} onChange={set("website")} placeholder="https://" /></label>
            <label className="grid gap-1 text-sm sm:col-span-2">Adresse<input className={input} value={f.address} onChange={set("address")} /></label>
            <div className="grid gap-2 text-sm sm:col-span-2">
              Photo de profil
              <div className="flex items-center gap-3">
                {f.photo_url ? <img src={f.photo_url} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-gold" /> : <div className="h-14 w-14 rounded-full bg-muted" />}
                <ImageUpload userId={user!.id} folder="photo" label={f.photo_url ? "Changer la photo" : "Importer ma photo"} onUploaded={(url) => setF((x) => ({ ...x, photo_url: url }))} />
                {f.photo_url && <button type="button" onClick={() => setF({ ...f, photo_url: "" })} className="text-xs text-muted-foreground underline">Retirer</button>}
              </div>
            </div>
            <label className="grid gap-1 text-sm sm:col-span-2">Présentation<textarea className={input} rows={3} maxLength={600} value={f.bio} onChange={set("bio")} /></label>
          </div>
          <h3 className="mt-6 font-serif text-xl">Votre activité & vos <em className="text-gold">services</em></h3>
          <p className="mt-1 text-sm text-muted-foreground">Décrivez ce que vous faites : vos visiteurs le liront sur votre carte de visite.</p>
          <textarea className={`${input} mt-3 w-full`} rows={4} maxLength={1500} placeholder="Ex. Cabinet d'architecture spécialisé dans la rénovation de maisons anciennes…" value={activity} onChange={(e) => setActivity(e.target.value)} />
          <div className="mt-3 space-y-3">
            {services.map((s, i) => {
              const upd = (k: keyof ProfileService, v: string) => setServices(services.map((x, j) => j === i ? { ...x, [k]: v } : x));
              return (
                <div key={i} className="rounded-xl border border-border p-3">
                  <div className="flex gap-2">
                    <input className={`${input} flex-1`} placeholder="Service (ex. Audit énergétique)" maxLength={80} value={s.name} onChange={(e) => upd("name", e.target.value)} />
                    <input className={`${input} w-32`} placeholder="Prix (facultatif)" maxLength={40} value={s.price} onChange={(e) => upd("price", e.target.value)} />
                    <button aria-label="Supprimer" onClick={() => setServices(services.filter((_, j) => j !== i))} className="p-2 text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <textarea className={`${input} mt-2 w-full`} rows={2} maxLength={300} placeholder="Description courte" value={s.description} onChange={(e) => upd("description", e.target.value)} />
                </div>
              );
            })}
            {services.length < 12 && <button onClick={() => setServices([...services, { name: "", description: "", price: "" }])} className="inline-flex items-center gap-1 text-sm text-gold"><Plus className="h-4 w-4" /> Ajouter un service</button>}
          </div>
          <h3 className="mt-6 text-sm font-medium">Liens (portfolio, LinkedIn, catalogue…)</h3>
          <div className="mt-2 space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${input} w-40`} placeholder="Libellé" value={l.label} onChange={(e) => setLinks(links.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                <input className={`${input} flex-1`} placeholder="https://" value={l.url} onChange={(e) => setLinks(links.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                <button aria-label="Supprimer" onClick={() => setLinks(links.filter((_, j) => j !== i))} className="p-2 text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {links.length < 8 && <button onClick={() => setLinks([...links, { label: "", url: "" }])} className="inline-flex items-center gap-1 text-sm text-gold"><Plus className="h-4 w-4" /> Ajouter un lien</button>}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Adresse du profil<input className={input} value={f.slug} onChange={set("slug")} /></label>
            <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Mini-page visible</label>
          </div>
        </div>

        <div className={card}>
          <div className="flex items-start gap-3">
            <BadgeCheck className="h-7 w-7 shrink-0 text-gold" />
            <div className="flex-1">
              <h3 className="font-serif text-xl">Badge « Identité vérifiée »</h3>
              <p className="mt-1 text-sm text-muted-foreground">Vos destinataires peuvent vérifier que l'e-mail vient bien de vous. Le badge certifie l'adresse e-mail confirmée de votre compte et votre abonnement actif.</p>
              <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} /> Activer le badge</label>
              {q.data?.verified_at && <p className="mt-2 text-xs text-muted-foreground">Certifié depuis le {new Date(q.data.verified_at).toLocaleDateString("fr-FR")}</p>}
            </div>
          </div>
        </div>
        <button onClick={save} className="rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground">Enregistrer</button>
      </div>

      <aside className="space-y-6">
        <div className={`${card} text-center`}>
          <h3 className="font-serif text-xl">QR code & fiche contact</h3>
          {saved ? (
            <>
              <img src={qrUrl(profileUrl)} alt="QR code du profil" className="mx-auto mt-4 h-44 w-44 rounded-xl bg-background p-2" />
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                <button onClick={() => copy(profileUrl)} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5"><Copy className="h-4 w-4" /> Lien du profil</button>
                <button onClick={downloadVcf} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5"><Download className="h-4 w-4" /> Fiche .vcf</button>
                <button onClick={downloadQr} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5"><Download className="h-4 w-4" /> QR code</button>
                <a href={`/p/${f.slug}`} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1.5">Voir la page</a>
              </div>
            </>
          ) : <p className="mt-3 text-sm text-muted-foreground">Enregistrez votre profil pour obtenir votre QR code.</p>}
        </div>
        <div className={card}>
          <h3 className="font-serif text-xl">Dans votre signature</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Dans l'éditeur, activez « QR code carte de visite » et collez le lien du profil.</li>
            {badge && saved && <li>Ajoutez le lien de vérification : <button onClick={() => copy(verifUrl)} className="text-gold underline">copier</button></li>}
            <li>Votre statut de disponibilité s'affiche automatiquement sur votre profil.</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}
