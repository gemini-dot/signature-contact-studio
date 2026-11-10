import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/use-plan";
import { LockedFeature } from "@/components/site/LockedFeature";
import { activeBanner } from "@/lib/member";

export const Route = createFileRoute("/_authenticated/compte/bannieres")({ component: BannersPage });

const input = "rounded-lg border border-input bg-background px-3 py-2 text-sm";

function BannersPage() {
  const { isTeamPlan, team, loading } = usePlan();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["banners", team?.id], enabled: !!team,
    queryFn: async () => (await supabase.from("team_banners").select("*").eq("team_id", team!.id).order("created_at", { ascending: false })).data ?? [],
  });
  const [f, setF] = useState({ title: "", image_url: "", link_url: "", starts_on: "", ends_on: "", is_default: false });

  if (loading) return null;
  if (!isTeamPlan) return <LockedFeature title="Smart Bannières programmables" plan="Équipe" benefits={["Une bannière pour toute l'équipe, changée en 1 clic", "Campagnes programmées : salon, promo, vœux", "Même les e-mails déjà envoyés affichent l'actualité du moment"]} />;
  if (!team) return <div className="rounded-2xl border border-border bg-card p-6 text-sm">Créez d'abord votre équipe dans l'onglet <Link to="/compte/equipe" className="text-gold underline">Équipe</Link>.</div>;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const imgUrl = `${origin}/api/public/banniere/${team.id}`;
  const linkUrl = `${origin}/api/public/banniere/${team.id}?go=1`;
  const list = q.data ?? [];
  const live = activeBanner(list, new Date().toISOString().slice(0, 10));

  const add = async () => {
    if (!/^https:\/\//.test(f.image_url)) { toast.error("L'image doit être un lien https://"); return; }
    const { error } = await supabase.from("team_banners").insert({ team_id: team.id, title: f.title, image_url: f.image_url, link_url: f.link_url, starts_on: f.is_default ? null : f.starts_on || null, ends_on: f.is_default ? null : f.ends_on || null, is_default: f.is_default });
    if (error) { toast.error(error.message.includes("policy") ? "Seul un administrateur de l'équipe peut ajouter une bannière." : error.message); return; }
    toast.success("Bannière ajoutée"); setF({ title: "", image_url: "", link_url: "", starts_on: "", ends_on: "", is_default: false });
    qc.invalidateQueries({ queryKey: ["banners"] });
  };
  const del = async (id: string) => { await supabase.from("team_banners").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["banners"] }); };
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copié"); };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-gold/40 bg-card p-6">
          <h2 className="font-serif text-2xl">Bannière <em className="text-gold">intelligente</em></h2>
          <p className="mt-1 text-sm text-muted-foreground">Placez une seule fois ces deux liens dans la signature de l'équipe (champs « Bannière » de l'éditeur). Ensuite, tout se pilote d'ici.</p>
          <div className="mt-4 space-y-2 text-sm">
            <button onClick={() => copy(imgUrl)} className="flex w-full items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-left"><span className="truncate">Image : {imgUrl}</span><Copy className="h-4 w-4 shrink-0" /></button>
            <button onClick={() => copy(linkUrl)} className="flex w-full items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-left"><span className="truncate">Lien : {linkUrl}</span><Copy className="h-4 w-4 shrink-0" /></button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-serif text-xl">Nouvelle bannière</h3>
          <div className="mt-4 grid gap-3">
            <input className={input} placeholder="Nom (ex. Salon de juin)" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            <input className={input} placeholder="Lien de l'image (https://…, 600×150 conseillé)" value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} />
            <input className={input} placeholder="Page ouverte au clic (facultatif)" value={f.link_url} onChange={(e) => setF({ ...f, link_url: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_default} onChange={(e) => setF({ ...f, is_default: e.target.checked })} /> Bannière par défaut (affichée hors campagne)</label>
            {!f.is_default && (
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-sm">Du<input type="date" className={input} value={f.starts_on} onChange={(e) => setF({ ...f, starts_on: e.target.value })} /></label>
                <label className="grid gap-1 text-sm">Au<input type="date" className={input} value={f.ends_on} onChange={(e) => setF({ ...f, ends_on: e.target.value })} /></label>
              </div>
            )}
            <button onClick={add} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Programmer</button>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-serif text-xl">Calendrier des bannières</h3>
        {list.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Aucune bannière pour l'instant.</p>}
        <ul className="mt-4 space-y-4">
          {list.map((b) => (
            <li key={b.id} className={`rounded-xl border p-3 ${live?.id === b.id ? "border-gold" : "border-border"}`}>
              <img src={b.image_url} alt={b.title} className="w-full rounded-lg object-cover" />
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-medium">{b.title || "Sans nom"} {live?.id === b.id && <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs text-gold-foreground">En ligne</span>}</p>
                  <p className="text-xs text-muted-foreground">{b.is_default ? "Par défaut" : `${b.starts_on ?? "…"} → ${b.ends_on ?? "…"}`}</p>
                </div>
                <button aria-label="Supprimer" onClick={() => del(b.id)} className="p-2 text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
