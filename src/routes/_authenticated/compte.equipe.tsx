import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Lock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SignaturePreview } from "@/components/site/SignaturePreview";
import { defaultSignature, templates, type SignatureData, type TemplateId } from "@/lib/signature";
import { MailsContactPerk } from "@/components/site/MailsContactPerk";

export const Route = createFileRoute("/_authenticated/compte/equipe")({ component: TeamPage });

type Base = Pick<SignatureData, "company" | "website" | "address" | "logoUrl" | "accent">;

function TeamPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const teamQ = useQuery({
    queryKey: ["team", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("teams").select("*").order("created_at").limit(1).maybeSingle()).data,
  });
  const team = teamQ.data;
  const membersQ = useQuery({
    queryKey: ["members", team?.id],
    enabled: !!team,
    queryFn: async () => (await supabase.from("team_members").select("*").eq("team_id", team!.id).order("created_at")).data ?? [],
  });
  const isAdmin = !!team && !!user && (team.owner_id === user.id || (membersQ.data ?? []).some((m) => m.user_id === user.id && m.role === "admin"));

  const [teamName, setTeamName] = useState("");
  const [invite, setInvite] = useState("");
  const [tpl, setTpl] = useState<TemplateId>("moderne");
  const [base, setBase] = useState<Base>({ company: "", website: "", address: "", logoUrl: "", accent: "#1e3a6e" });
  const [lockLogo, setLockLogo] = useState(true);
  const [lockColors, setLockColors] = useState(true);

  useEffect(() => {
    if (!team) return;
    setTpl(team.template as TemplateId);
    setBase({ ...base, ...(team.base_data as Partial<Base>) });
    setLockLogo(team.lock_logo);
    setLockColors(team.lock_colors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team?.id]);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["team"] }); qc.invalidateQueries({ queryKey: ["members"] }); };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("teams").insert({ name: teamName, owner_id: user.id });
    if (error) { toast.error(error.message); return; }
    refresh();
  };
  const sendInvite = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("team_members").insert({ team_id: team!.id, email: invite.trim().toLowerCase() });
    if (error) { toast.error(error.code === "23505" ? "Déjà invité" : error.message); return; }
    toast.success("Invitation enregistrée : la personne rejoint l'équipe en créant son compte avec cette adresse.");
    setInvite("");
    refresh();
  };
  const save = async () => {
    const { error } = await supabase.from("teams").update({ template: tpl, base_data: base, lock_logo: lockLogo, lock_colors: lockColors }).eq("id", team!.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Modèle d'équipe enregistré");
    refresh();
  };
  const setRole = async (id: string, role: "admin" | "member") => {
    await supabase.from("team_members").update({ role }).eq("id", id);
    refresh();
  };
  const removeMember = async (id: string) => {
    await supabase.from("team_members").delete().eq("id", id);
    refresh();
  };

  if (teamQ.isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;

  if (!team) return (
    <form onSubmit={create} className="max-w-md space-y-3 rounded-3xl border border-border bg-card p-6">
      <p className="font-medium">Créer votre équipe</p>
      <p className="text-sm text-muted-foreground">Invitez vos collaborateurs et imposez un modèle commun avec votre logo et vos couleurs.</p>
      <input required value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Nom de l'entreprise" className="w-full rounded-xl border border-input bg-background px-3 py-2" />
      <button className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Créer l'équipe</button>
    </form>
  );

  const field = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm disabled:opacity-60";
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Équipe</p>
        <p className="font-serif text-3xl">{team.name}</p>
        {!isAdmin && <p className="mt-2 text-sm text-muted-foreground">Vous êtes membre de cette équipe. Seuls les administrateurs peuvent modifier le modèle.</p>}
      </div>
      <MailsContactPerk />
      <div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
          <p className="font-medium">Modèle de signature commun</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button key={t.id} disabled={!isAdmin} onClick={() => setTpl(t.id)} className={`rounded-full px-3 py-1 text-sm ${tpl === t.id ? "bg-primary text-primary-foreground" : "border border-border"}`}>{t.label}</button>
            ))}
          </div>
          <input disabled={!isAdmin} value={base.company} onChange={(e) => setBase({ ...base, company: e.target.value })} placeholder="Entreprise" className={field} />
          <input disabled={!isAdmin} value={base.website} onChange={(e) => setBase({ ...base, website: e.target.value })} placeholder="Site web" className={field} />
          <input disabled={!isAdmin} value={base.address} onChange={(e) => setBase({ ...base, address: e.target.value })} placeholder="Adresse" className={field} />
          <input disabled={!isAdmin} value={base.logoUrl} onChange={(e) => setBase({ ...base, logoUrl: e.target.value })} placeholder="URL du logo de l'entreprise" className={field} />
          <label className="flex items-center gap-3 text-sm">Couleur principale
            <input disabled={!isAdmin} type="color" value={base.accent} onChange={(e) => setBase({ ...base, accent: e.target.value })} className="h-8 w-12 rounded" />
          </label>
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <label className="flex items-center justify-between"><span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-gold" /> Verrouiller le logo</span>
              <input disabled={!isAdmin} type="checkbox" checked={lockLogo} onChange={(e) => setLockLogo(e.target.checked)} className="h-4 w-4 accent-[var(--gold)]" /></label>
            <label className="flex items-center justify-between"><span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-gold" /> Verrouiller les couleurs</span>
              <input disabled={!isAdmin} type="checkbox" checked={lockColors} onChange={(e) => setLockColors(e.target.checked)} className="h-4 w-4 accent-[var(--gold)]" /></label>
          </div>
          {isAdmin && <button onClick={save} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Enregistrer le modèle</button>}
        </div>
        <SignaturePreview template={tpl} data={{ ...defaultSignature, ...base, logoSrc: "" }} />
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <p className="font-medium">Collaborateurs</p>
        {isAdmin && (
          <form onSubmit={sendInvite} className="mt-3 flex gap-2">
            <input required type="email" value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="collaborateur@entreprise.fr" className={field} />
            <button className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Inviter</button>
          </form>
        )}
        <ul className="mt-4 divide-y divide-border text-sm">
          {(membersQ.data ?? []).map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-2">
              <span className="flex-1">{m.email}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${m.status === "active" ? "bg-primary/10 text-primary" : "bg-gold/15"}`}>{m.status === "active" ? "Actif" : "Invité"}</span>
              {isAdmin ? (
                <>
                  <select value={m.role} onChange={(e) => setRole(m.id, e.target.value as "admin" | "member")} className="rounded-lg border border-border bg-background px-2 py-1 text-xs">
                    <option value="member">Membre</option><option value="admin">Admin</option>
                  </select>
                  <button onClick={() => removeMember(m.id)} aria-label="Retirer" className="p-1 text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
                </>
              ) : <span className="text-xs text-muted-foreground">{m.role === "admin" ? "Admin" : "Membre"}</span>}
            </li>
          ))}
          {(membersQ.data ?? []).length === 0 && <li className="py-2 text-muted-foreground">Aucun collaborateur invité.</li>}
        </ul>
      </div>
    </div>
  );
}
