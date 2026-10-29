import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Signature.Contact" },
      { name: "description", content: "Administration : clients, abonnements et formules." },
      { property: "og:title", content: "Admin — Signature.Contact" },
      { property: "og:description", content: "Espace d'administration." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const PLAN_LABEL: Record<string, string> = { gratuit: "Gratuit", solo: "Solo", equipe: "Équipe" };
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");

function Admin() {
  const { isAdmin, loading } = useAuth();
  const [filter, setFilter] = useState("tous");
  const q = useQuery({
    queryKey: ["admin-clients"],
    enabled: isAdmin,
    queryFn: async () => {
      const [p, s, sig] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
        supabase.from("signatures").select("user_id"),
      ]);
      const subs = new Map((s.data ?? []).map((x) => [x.user_id, x]));
      const counts = new Map<string, number>();
      (sig.data ?? []).forEach((x) => counts.set(x.user_id, (counts.get(x.user_id) ?? 0) + 1));
      return (p.data ?? []).map((u) => ({ ...u, sub: subs.get(u.id), signatures: counts.get(u.id) ?? 0 }));
    },
  });

  if (loading) return <p className="px-5 py-16 text-center text-sm text-muted-foreground">Chargement…</p>;
  if (!isAdmin) return <p className="px-5 py-16 text-center text-muted-foreground">Accès réservé à l'administrateur.</p>;

  const rows = q.data ?? [];
  const planOf = (r: (typeof rows)[number]) => r.sub?.plan ?? "gratuit";
  const counts = { gratuit: 0, solo: 0, equipe: 0 } as Record<string, number>;
  let mrr = 0;
  rows.forEach((r) => {
    const p = planOf(r);
    counts[p] = (counts[p] ?? 0) + 1;
    if (r.sub && r.sub.status === "active") {
      if (p === "solo") mrr += r.sub.cycle === "annuel" ? 59 / 12 : 6;
      if (p === "equipe") mrr += 19 + r.sub.seats;
    }
  });
  const shown = filter === "tous" ? rows : rows.filter((r) => planOf(r) === filter);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Administration</p>
      <h1 className="mt-1 text-4xl font-medium">Vos <em className="text-gold">clients</em></h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-5">
        {[["Clients", rows.length], ["Gratuit", counts.gratuit], ["Solo", counts.solo], ["Équipe", counts.equipe], ["Revenu mensuel (test)", `${mrr.toFixed(2)} €`]].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-1 font-serif text-2xl">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-2">
        {["tous", "gratuit", "solo", "equipe"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-sm ${filter === f ? "bg-primary text-primary-foreground" : "border border-border"}`}>{f === "tous" ? "Tous" : PLAN_LABEL[f]}</button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr><th className="px-4 py-3">Client</th><th>Inscrit le</th><th>Formule</th><th>Facturation</th><th>Échéance</th><th>Renouv.</th><th>Signatures</th></tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3"><p className="font-medium">{r.full_name || "—"}</p><p className="text-xs text-muted-foreground">{r.email}</p></td>
                <td>{fmt(r.created_at)}</td>
                <td>{PLAN_LABEL[planOf(r)]}{planOf(r) === "equipe" ? ` (${r.sub?.seats})` : ""}</td>
                <td>{r.sub && planOf(r) !== "gratuit" ? (r.sub.cycle === "annuel" ? "Annuelle" : "Mensuelle") : "—"}</td>
                <td>{fmt(r.sub?.current_period_end)}</td>
                <td>{r.sub && planOf(r) !== "gratuit" ? (r.sub.auto_renew ? "Oui" : "Non") : "—"}</td>
                <td>{r.signatures}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Aucun client.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
