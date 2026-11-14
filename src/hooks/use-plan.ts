import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

/** Formule de l'utilisateur et accès aux fonctions payantes (Solo/Équipe, y compris membre d'une équipe). */
export function usePlan() {
  const { user, loading: authLoading } = useAuth();
  const q = useQuery({
    queryKey: ["plan-access", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [sub, elig, team] = await Promise.all([
        supabase.from("subscriptions").select("plan,status").eq("user_id", user!.id).maybeSingle(),
        supabase.rpc("is_booking_eligible", { _user: user!.id }),
        supabase.from("teams").select("id,owner_id,name").order("created_at").limit(1).maybeSingle(),
      ]);
      const plan = sub.data?.status === "active" ? sub.data.plan : "gratuit";
      return { plan, paid: !!elig.data, team: team.data, isTeamPlan: plan === "equipe" || (!!team.data && !!elig.data) };
    },
  });
  return { loading: authLoading || (!!user && q.isLoading), ...(q.data ?? { plan: "gratuit", paid: false, team: null, isTeamPlan: false }) };
}
