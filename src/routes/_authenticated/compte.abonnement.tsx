import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PRICES, teamMonthlyPrice } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/compte/abonnement")({ component: Billing });

const PLAN_LABEL: Record<string, string> = { gratuit: "Gratuit", solo: "Solo", equipe: "Équipe" };
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—");
const eur = (cents: number) => (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

type Choice = { plan: "solo" | "equipe"; cycle: "mensuel" | "annuel"; seats: number };

function Billing() {
  const qc = useQueryClient();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [busy, setBusy] = useState(false);
  const sub = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => (await supabase.from("subscriptions").select("*").maybeSingle()).data,
  });
  const invoices = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await supabase.from("invoices").select("*").order("issued_at", { ascending: false })).data ?? [],
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["subscription"] }); qc.invalidateQueries({ queryKey: ["invoices"] }); };

  const s = sub.data;
  const plan = s?.plan ?? "gratuit";
  const price = (c: Choice) => (c.plan === "equipe" ? teamMonthlyPrice(c.seats) : c.cycle === "annuel" ? PRICES.soloYearly : PRICES.soloMonthly);

  const pay = async () => {
    if (!choice) return;
    setBusy(true);
    const { error } = await supabase.rpc("subscribe_test", { _plan: choice.plan, _cycle: choice.cycle, _seats: choice.seats });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Abonnement activé (mode test)");
    setChoice(null);
    refresh();
  };
  const toggleRenew = async () => {
    const { error } = await supabase.rpc("set_auto_renew", { _on: !s?.auto_renew });
    if (error) { toast.error(error.message); return; }
    refresh();
  };
  const downgrade = async () => {
    if (!confirm("Repasser à la formule Gratuite ?")) return;
    await supabase.rpc("subscribe_test", { _plan: "gratuit", _cycle: "mensuel", _seats: 0 });
    refresh();
  };

  return (
    <div className="space-y-8">
      <p className="rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm">Mode test : aucun paiement réel n'est effectué.</p>
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Formule actuelle</p>
          <p className="mt-2 font-serif text-3xl">{PLAN_LABEL[plan]}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">Facturation</dt><dd>{plan === "gratuit" ? "—" : s?.cycle === "annuel" ? "Annuelle" : "Mensuelle"}</dd></div>
            <div><dt className="text-muted-foreground">Statut</dt><dd>{s?.status === "active" ? "Actif" : s?.status ?? "Actif"}</dd></div>
            <div><dt className="text-muted-foreground">Souscrit le</dt><dd>{fmt(s?.current_period_start)}</dd></div>
            <div><dt className="text-muted-foreground">{s?.auto_renew ? "Renouvellement le" : "Échéance le"}</dt><dd>{fmt(s?.current_period_end)}</dd></div>
            {plan === "equipe" && <div><dt className="text-muted-foreground">Collaborateurs</dt><dd>{s?.seats}</dd></div>}
          </dl>
          {plan !== "gratuit" && (
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!s?.auto_renew} onChange={toggleRenew} className="h-4 w-4 accent-[var(--gold)]" />
                Renouvellement automatique
              </label>
              <button onClick={downgrade} className="ml-auto text-muted-foreground underline">Repasser en Gratuit</button>
            </div>
          )}
        </div>
        <div className="space-y-3 rounded-3xl border border-border bg-card p-6">
          <p className="font-medium">Changer de formule</p>
          <button onClick={() => setChoice({ plan: "solo", cycle: "mensuel", seats: 0 })} className="block w-full rounded-xl border border-border px-4 py-3 text-left hover:bg-accent">
            <span className="font-medium">Solo</span> <span className="text-sm text-muted-foreground">— 6 €/mois ou 59 €/an</span>
          </button>
          <button onClick={() => setChoice({ plan: "equipe", cycle: "mensuel", seats: 5 })} className="block w-full rounded-xl border border-border px-4 py-3 text-left hover:bg-accent">
            <span className="font-medium">Équipe</span> <span className="text-sm text-muted-foreground">— 19 €/mois + 1 €/collaborateur</span>
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <p className="font-medium">Factures</p>
        {(invoices.data ?? []).length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Aucune facture.</p> : (
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr><th className="py-2">N°</th><th>Date</th><th>Formule</th><th>Montant</th><th /></tr></thead>
            <tbody>
              {(invoices.data ?? []).map((i) => (
                <tr key={i.id} className="border-t border-border">
                  <td className="py-2 font-mono text-xs">{i.number}</td>
                  <td>{fmt(i.issued_at)}</td>
                  <td>{PLAN_LABEL[i.plan]} {i.cycle === "annuel" ? "(an)" : "(mois)"}</td>
                  <td>{eur(i.amount_cents)}</td>
                  <td className="text-right"><button onClick={() => printInvoice(i)} className="inline-flex items-center gap-1 text-gold underline"><Download className="h-3.5 w-3.5" /> PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!choice} onOpenChange={(o) => !o && setChoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paiement — {choice && PLAN_LABEL[choice.plan]}</DialogTitle>
            <DialogDescription>Mode test : utilisez la carte 4242 4242 4242 4242, aucun débit réel.</DialogDescription>
          </DialogHeader>
          {choice && (
            <div className="space-y-4">
              {choice.plan === "solo" ? (
                <div className="flex gap-2">
                  {(["mensuel", "annuel"] as const).map((c) => (
                    <button key={c} onClick={() => setChoice({ ...choice, cycle: c })} className={`flex-1 rounded-xl border px-3 py-2 text-sm ${choice.cycle === c ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                      {c === "mensuel" ? "6 €/mois" : "59 €/an"}
                    </button>
                  ))}
                </div>
              ) : (
                <label className="block text-sm">Nombre de collaborateurs
                  <input type="number" min={0} value={choice.seats} onChange={(e) => setChoice({ ...choice, seats: Math.max(0, Number(e.target.value) || 0) })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
                </label>
              )}
              <input readOnly value="4242 4242 4242 4242" className="w-full rounded-xl border border-input bg-muted px-3 py-2 font-mono text-sm" />
              <div className="flex gap-2">
                <input readOnly value="12/34" className="w-1/2 rounded-xl border border-input bg-muted px-3 py-2 font-mono text-sm" />
                <input readOnly value="123" className="w-1/2 rounded-xl border border-input bg-muted px-3 py-2 font-mono text-sm" />
              </div>
              <button disabled={busy} onClick={pay} className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground disabled:opacity-60">
                Payer {price(choice)} € {choice.cycle === "annuel" ? "/ an" : "/ mois"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function printInvoice(i: { number: string; issued_at: string; plan: string; cycle: string; amount_cents: number; period_end: string }) {
  const w = window.open("", "_blank");
  if (!w) return;
  const ht = Math.round(i.amount_cents / 1.2);
  w.document.write(`<html><head><title>Facture ${i.number}</title></head><body style="font-family:Georgia,serif;max-width:640px;margin:40px auto;color:#1a2440">
<h1 style="margin:0">Signature.Contact</h1><p style="color:#c9a45c;margin:0;letter-spacing:3px;font-size:11px">BY GEM'S</p>
<p style="color:#b33;font-weight:bold">FACTURE DE TEST — sans valeur</p>
<p>Facture n° ${i.number}<br>Date : ${fmt(i.issued_at)}</p>
<table style="width:100%;border-collapse:collapse;margin-top:24px"><tr style="border-bottom:1px solid #ccc"><th align="left">Désignation</th><th align="right">Montant</th></tr>
<tr><td>Formule ${PLAN_LABEL[i.plan]} (${i.cycle}) — jusqu'au ${fmt(i.period_end)}</td><td align="right">${eur(ht)} HT</td></tr>
<tr><td>TVA 20 %</td><td align="right">${eur(i.amount_cents - ht)}</td></tr>
<tr style="font-weight:bold"><td>Total TTC</td><td align="right">${eur(i.amount_cents)}</td></tr></table>
<script>window.print()</script></body></html>`);
  w.document.close();
}
