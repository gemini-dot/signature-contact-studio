import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import { LockedFeature } from "@/components/site/LockedFeature";
import { STATUSES, type StatusKey } from "@/lib/member";

export const Route = createFileRoute("/_authenticated/compte/statut")({ component: StatusPage });

function StatusPage() {
  const { user } = useAuth();
  const { paid, loading } = usePlan();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["my-profile", user?.id], enabled: !!user && paid,
    queryFn: async () => (await supabase.from("member_profiles").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });
  const [status, setStatus] = useState<StatusKey>("disponible");
  const [note, setNote] = useState("");
  const [until, setUntil] = useState("");
  useEffect(() => {
    if (q.data) { setStatus(q.data.status as StatusKey); setNote(q.data.status_note); setUntil(q.data.status_until ?? ""); }
  }, [q.data]);

  if (loading) return null;
  if (!paid) return <LockedFeature title="Statut de disponibilité en direct" plan="Solo" benefits={["Disponible, en réunion, en congés… en 3 secondes", "Retour automatique à « Disponible » à la date choisie", "Fini les messages d'absence impersonnels"]} />;
  if (q.isFetched && !q.data) return (
    <div className="rounded-2xl border border-border bg-card p-6 text-sm">
      Créez d'abord votre <Link to="/compte/profil" className="text-gold underline">carte de visite</Link> : votre statut s'y affichera.
    </div>
  );

  const save = async (next: StatusKey = status) => {
    setStatus(next);
    const { error } = await supabase.from("member_profiles").update({ status: next, status_note: note.slice(0, 140), status_until: next === "disponible" ? null : until || null }).eq("user_id", user!.id);
    if (error) toast.error(error.message); else { toast.success("Statut mis à jour"); window.__lovableEvents?.track?.("project.status_changed", { status: next, has_end_date: next !== "disponible" && !!until }); qc.invalidateQueries({ queryKey: ["my-profile"] }); }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-2xl">Votre statut <em className="text-gold">en direct</em></h2>
      <p className="mt-1 text-sm text-muted-foreground">Un clic suffit : il s'affiche immédiatement sur votre carte de visite et votre page de vérification.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(Object.keys(STATUSES) as StatusKey[]).map((k) => (
          <button key={k} onClick={() => save(k)} className={`flex items-center gap-2 rounded-2xl border p-4 text-left text-sm transition ${status === k ? "border-gold bg-gold/10 font-medium" : "border-border hover:bg-accent"}`}>
            <span className={`h-3 w-3 rounded-full ${STATUSES[k].tone}`} />{STATUSES[k].label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="grid gap-1 text-sm">Précision (facultatif)<input className="rounded-lg border border-input bg-background px-3 py-2" maxLength={140} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Réponse sous 48 h" /></label>
        <label className="grid gap-1 text-sm">Jusqu'au<input type="date" className="rounded-lg border border-input bg-background px-3 py-2" value={until} onChange={(e) => setUntil(e.target.value)} /></label>
      </div>
      <button onClick={() => save()} className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">Enregistrer la précision</button>
    </div>
  );
}
