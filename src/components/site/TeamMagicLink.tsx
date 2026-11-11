import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Link2, RefreshCw, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/** Lien d'invitation unique : les collaborateurs créent leur signature conforme en 15 secondes. */
export function TeamMagicLink({ teamId, hasPlan }: { teamId: string; hasPlan: boolean }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["join-link", teamId], enabled: hasPlan,
    queryFn: async () => (await supabase.from("team_join_links").select("token,enabled").eq("team_id", teamId).maybeSingle()).data,
  });
  const act = async (action: "enable" | "regenerate" | "disable") => {
    if (action === "regenerate" && !confirm("L'ancien lien ne fonctionnera plus. Continuer ?")) return;
    const { error } = await supabase.rpc("manage_join_link", { _team: teamId, _action: action });
    if (error) { toast.error(error.message); return; }
    toast.success(action === "disable" ? "Lien désactivé" : "Lien prêt à partager");
    qc.invalidateQueries({ queryKey: ["join-link", teamId] });
  };
  const link = q.data?.enabled ? `${typeof window !== "undefined" ? window.location.origin : ""}/rejoindre/${q.data.token}` : null;

  return (
    <div className="rounded-3xl border border-gold/40 bg-card p-6">
      <div className="flex items-start gap-3">
        <Link2 className="mt-1 h-5 w-5 shrink-0 text-gold" />
        <div className="flex-1">
          <p className="font-medium">Lien magique d'onboarding</p>
          <p className="mt-1 text-sm text-muted-foreground">Envoyez ce lien à vos collaborateurs : ils saisissent nom, poste et mobile, et leur signature aux couleurs de l'entreprise est prête en 15 secondes.</p>
          {!hasPlan ? (
            <p className="mt-3 flex items-center gap-2 text-sm"><Lock className="h-4 w-4 text-gold" />Inclus dans la formule Équipe. <Link to="/compte/abonnement" className="text-gold underline">Activer</Link></p>
          ) : link ? (
            <>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input readOnly value={link} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm" aria-label="Lien d'invitation" />
                <button onClick={() => { navigator.clipboard.writeText(link); toast.success("Lien copié"); }} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Copy className="h-4 w-4" />Copier</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs">
                <button onClick={() => act("regenerate")} className="inline-flex items-center gap-1 text-muted-foreground underline"><RefreshCw className="h-3 w-3" />Générer un nouveau lien</button>
                <button onClick={() => act("disable")} className="text-muted-foreground underline">Désactiver</button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Sécurisé : adresse e-mail confirmée obligatoire, nombre de places de votre abonnement respecté.</p>
            </>
          ) : (
            <button onClick={() => act("enable")} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Créer mon lien d'invitation</button>
          )}
        </div>
      </div>
    </div>
  );
}
