import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Ticket } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { codeStatus } from "@/lib/discount";

const inMonth = () => new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const STATE = {
  ok: ["Actif", "bg-primary/10 text-primary"],
  inactive: ["Désactivé", "bg-muted text-muted-foreground"],
  expired: ["Expiré", "bg-gold/15"],
  exhausted: ["Épuisé", "bg-destructive/15 text-destructive"],
} as const;
const PLAN = { solo: "Solo", equipe: "Équipe" } as Record<string, string>;

export function AdminDiscounts() {
  const qc = useQueryClient();
  const [f, setF] = useState({ kind: "percent" as "percent" | "amount", value: "10", months: "3", forever: false, until: inMonth(), maxUses: "", plans: [] as string[], reason: "" });
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState("");
  const q = useQuery({
    queryKey: ["admin-discounts"],
    queryFn: async () => (await supabase.from("discount_codes").select("*").order("created_at", { ascending: false }).limit(200)).data ?? [],
  });
  const reload = () => qc.invalidateQueries({ queryKey: ["admin-discounts"] });

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setCreated("");
    const { data, error } = await supabase.rpc("admin_create_discount", {
      _kind: f.kind, _value: Number(f.value), _months: f.forever ? null as unknown as number : Math.max(1, Number(f.months) || 1),
      _valid_until: new Date(`${f.until}T23:59:59`).toISOString(), _max_uses: f.maxUses ? Number(f.maxUses) : null as unknown as number,
      _plans: f.plans, _reason: f.reason,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setCreated(String(data)); toast.success(`Code créé : ${data}`); reload();
  };
  const toggle = async (code: string, active: boolean) => {
    const { error } = await supabase.from("discount_codes").update({ active }).eq("code", code);
    if (error) toast.error(error.message); else reload();
  };
  const field = "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm";
  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section className="mt-12 rounded-3xl border border-border bg-card">
      <div className="border-b border-border p-6">
        <p className="flex items-center gap-2 font-serif text-2xl"><Ticket className="h-5 w-5 text-gold" />Codes de <em className="text-gold">réduction</em></p>
        <p className="mt-1 text-sm text-muted-foreground">Chaque code est tiré au hasard (10 lettres et chiffres). Le client le saisit au moment de souscrire.</p>
      </div>
      <form onSubmit={create} className="grid gap-4 border-b border-border p-6 sm:grid-cols-2 lg:grid-cols-5">
        <label className="space-y-1.5 text-sm">Type de remise
          <select className={field} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as "percent" | "amount" })}>
            <option value="percent">Pourcentage (%)</option><option value="amount">Montant fixe (€)</option>
          </select></label>
        <label className="space-y-1.5 text-sm">{f.kind === "percent" ? "Remise en %" : "Remise en €"}
          <input className={field} type="number" min="0.01" step="0.01" max={f.kind === "percent" ? 100 : 1000} required value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></label>
        <div className="space-y-1.5 text-sm">Durée (mois)
          <input className={field} type="number" min="1" max="36" disabled={f.forever} value={f.months} onChange={(e) => setF({ ...f, months: e.target.value })} />
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={f.forever} onChange={(e) => setF({ ...f, forever: e.target.checked })} />Sans limite de durée</label></div>
        <label className="space-y-1.5 text-sm">Valable jusqu'au
          <input className={field} type="date" required min={new Date().toISOString().slice(0, 10)} value={f.until} onChange={(e) => setF({ ...f, until: e.target.value })} /></label>
        <label className="space-y-1.5 text-sm">Utilisations max. (facultatif)
          <input className={field} type="number" min="1" value={f.maxUses} onChange={(e) => setF({ ...f, maxUses: e.target.value })} /></label>
        <fieldset className="space-y-1.5 text-sm sm:col-span-2"><legend className="font-medium">Formules concernées</legend>
          <div className="flex gap-4">{Object.entries(PLAN).map(([id, name]) => (
            <label key={id} className="flex items-center gap-1.5"><input type="checkbox" checked={f.plans.includes(id)} onChange={(e) => setF({ ...f, plans: e.target.checked ? [...f.plans, id] : f.plans.filter((x) => x !== id) })} />{name}</label>))}</div>
          <p className="text-xs text-muted-foreground">Aucune case cochée : valable pour toutes les formules payantes.</p></fieldset>
        <label className="space-y-1.5 text-sm sm:col-span-2 lg:col-span-3">Motif (facultatif)
          <input className={field} maxLength={200} value={f.reason} placeholder="Ex. : partenaire lancement, geste commercial…" onChange={(e) => setF({ ...f, reason: e.target.value })} /></label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-5">
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"><Plus className="h-4 w-4" />{busy ? "…" : "Générer un code"}</button>
          {created && <button type="button" onClick={() => { navigator.clipboard?.writeText(created); toast.success("Code copié"); }} className="inline-flex items-center gap-1.5 font-mono font-semibold text-gold">{created}<Copy className="h-3.5 w-3.5" /></button>}
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground"><tr>
            <th className="p-3">Code</th><th className="p-3">Remise</th><th className="p-3">Durée</th><th className="p-3">Formules</th><th className="p-3">Valable jusqu'au</th><th className="p-3">Utilisations</th><th className="p-3">Statut</th><th className="p-3" />
          </tr></thead>
          <tbody>
            {(q.data ?? []).map((c) => { const [label, tone] = STATE[codeStatus(c)]; return (
              <tr key={c.code} className="border-t border-border">
                <td className="p-3 font-mono font-semibold"><button type="button" title="Copier" onClick={() => { navigator.clipboard?.writeText(c.code); toast.success("Code copié"); }} className="inline-flex items-center gap-1.5">{c.code}<Copy className="h-3 w-3 text-muted-foreground" /></button></td>
                <td className="p-3">−{c.kind === "percent" ? `${Number(c.value)} %` : `${Number(c.value).toLocaleString("fr-FR")} €`}</td>
                <td className="p-3">{c.months ? `${c.months} mois` : "Sans limite"}</td>
                <td className="p-3">{c.plans.length ? c.plans.map((p) => PLAN[p] ?? p).join(", ") : "Toutes"}{c.reason && <div className="text-xs text-muted-foreground">{c.reason}</div>}</td>
                <td className="p-3">{fmt(c.valid_until)}</td>
                <td className="p-3">{c.uses}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>{label}</span></td>
                <td className="p-3 text-right"><button onClick={() => toggle(c.code, !c.active)} className="text-xs underline">{c.active ? "Désactiver" : "Réactiver"}</button></td>
              </tr>); })}
            {(q.data ?? []).length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Aucun code de réduction pour le moment.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
