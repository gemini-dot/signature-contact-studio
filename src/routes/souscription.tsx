import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Lock, PartyPopper, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PRICES, teamMonthlyPrice } from "@/lib/pricing";
import { discountedCents, type Discount } from "@/lib/discount";

type Plan = "solo" | "equipe";
type Cycle = "mensuel" | "annuel";
type Search = { plan: Plan; cycle: Cycle; seats: number };

export const Route = createFileRoute("/souscription")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const plan: Plan = s["plan"] === "equipe" ? "equipe" : "solo";
    const n = Math.floor(Number(s["seats"]) || 5);
    return { plan, cycle: plan === "solo" && s["cycle"] === "annuel" ? "annuel" : "mensuel", seats: Math.min(500, Math.max(1, n)) };
  },
  head: () => ({
    meta: [
      { title: "Souscription — Signature.Contact" },
      { name: "description", content: "Souscrivez à Signature.Contact Solo ou Équipe en quelques secondes, avec code de réduction." },
      { property: "og:title", content: "Souscription — Signature.Contact" },
      { property: "og:description", content: "Activez votre formule Solo ou Équipe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Subscribe,
});

const eur = (c: number) => (c / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const PERKS: Record<Plan, string[]> = {
  solo: ["Sans mention « signature.contact »", "Jusqu'à 20 variantes de signature", "Carte de visite, QR code & badge vérifié", "Prise de rendez-vous, fond visio, plaquette PDF"],
  equipe: ["Tout Solo pour chaque collaborateur", "Charte verrouillée & bannières d'équipe", "Lien magique & import CSV", "Une facture unique pour l'entreprise"],
};

function Subscribe() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/souscription" });
  const { plan, cycle, seats } = search;
  const set = (p: Partial<Search>) => navigate({ search: { ...search, ...p }, replace: true });

  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [mode, setMode] = useState<"new" | "login">("new");
  const [f, setF] = useState({ email: "", pw: "", pw2: "", name: "", company: "" });
  const [terms, setTerms] = useState(false);
  const [codeIn, setCodeIn] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: Discount } | null>(null);
  const [codeErr, setCodeErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ amount: number } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { setPromo(null); setCodeErr(""); }, [plan]);

  const base = plan === "equipe" ? teamMonthlyPrice(seats) * 100 : (cycle === "annuel" ? PRICES.soloYearly : PRICES.soloMonthly) * 100;
  const total = promo ? discountedCents(base, promo.discount) : base;
  const period = plan === "solo" && cycle === "annuel" ? "an" : "mois";

  const applyCode = async () => {
    setCodeErr("");
    if (!codeIn.trim()) return;
    const { data, error } = await supabase.rpc("check_discount_code", { _code: codeIn, _plan: plan });
    const r = data as { ok: boolean; error?: string; code?: string; kind?: "percent" | "amount"; value?: number; months?: number | null } | null;
    if (error || !r) return setCodeErr("Vérification impossible. Réessayez.");
    if (!r.ok) return setCodeErr(r.error ?? "Code invalide.");
    setPromo({ code: r.code!, discount: { kind: r.kind!, value: Number(r.value), months: r.months ?? null } });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (!terms) return setErr("Veuillez accepter les CGU pour continuer.");
    setBusy(true);
    try {
      if (!email) {
        if (mode === "login") {
          const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.pw });
          if (error) return setErr("Adresse e-mail ou mot de passe incorrect.");
        } else {
          if (f.pw.length < 8) return setErr("Le mot de passe doit contenir au moins 8 caractères.");
          if (f.pw !== f.pw2) return setErr("Les deux mots de passe ne correspondent pas.");
          const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.pw, options: { emailRedirectTo: window.location.href, data: { full_name: f.name } } });
          if (error) { if (/registered|exists/i.test(error.message)) { setMode("login"); return setErr("Un compte existe déjà avec cette adresse : connectez-vous pour continuer."); } return setErr(error.message); }
          if (!data.session) { setPending(true); return; }
        }
      }
      const { data, error } = await supabase.rpc("subscribe_with_code", { _plan: plan, _cycle: cycle, _seats: plan === "equipe" ? seats : 0, _code: promo?.code ?? "" });
      if (error) return setErr(error.message);
      setDone({ amount: (data as { amount_cents: number }).amount_cents });
      toast.success("Abonnement activé");
    } finally { setBusy(false); }
  };

  const input = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm";
  if (pending) return (
    <section className="mx-auto max-w-lg px-5 py-24 text-center">
      <p className="font-serif text-3xl">Confirmez votre <em className="text-gold">e-mail</em></p>
      <p className="mt-4 text-muted-foreground">Nous venons d'envoyer un lien à {f.email}. Cliquez dessus : vous reviendrez ici pour finaliser votre souscription, votre formule et votre code restent prêts.</p>
    </section>
  );
  if (done) return (
    <section className="mx-auto max-w-lg px-5 py-24 text-center">
      <PartyPopper className="mx-auto h-10 w-10 text-gold" />
      <p className="mt-4 font-serif text-4xl">Bienvenue en <em className="text-gold">{plan === "equipe" ? "Équipe" : "Solo"}</em></p>
      <p className="mt-4 text-muted-foreground">Votre abonnement est actif. Montant facturé : {eur(done.amount)} (mode test, aucun débit réel).</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to={plan === "equipe" ? "/compte/equipe" : "/editeur"} className="rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground">{plan === "equipe" ? "Configurer mon équipe" : "Créer ma signature"}</Link>
        <Link to="/compte/abonnement" className="rounded-full border border-border px-5 py-2.5">Ma facture</Link>
      </div>
    </section>
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Souscription</p>
      <h1 className="mt-1 text-4xl font-medium md:text-5xl">Activez votre formule <em className="text-gold">{plan === "equipe" ? "Équipe" : "Solo"}</em></h1>
      <p className="mt-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2 text-sm">Mode test : aucun paiement réel n'est effectué pour le moment.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Récapitulatif */}
        <aside className="h-fit space-y-5 rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-6">
          <div className="inline-flex rounded-full border border-border p-1 text-sm">
            {(["solo", "equipe"] as Plan[]).map((p) => (
              <button key={p} type="button" onClick={() => set({ plan: p, cycle: "mensuel" })} className={`rounded-full px-4 py-1.5 ${plan === p ? "bg-primary text-primary-foreground" : ""}`}>{p === "solo" ? "Solo" : "Équipe"}</button>
            ))}
          </div>
          {plan === "solo" ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {(["mensuel", "annuel"] as Cycle[]).map((c) => (
                <button key={c} type="button" onClick={() => set({ cycle: c })} className={`rounded-2xl border p-3 text-left ${cycle === c ? "border-gold bg-gold/10" : "border-border"}`}>
                  <p className="font-medium">{c === "mensuel" ? "Mensuel" : "Annuel"}</p>
                  <p className="text-muted-foreground">{c === "mensuel" ? `${PRICES.soloMonthly} €/mois` : `${PRICES.soloYearly} €/an · 2 mois offerts`}</p>
                </button>
              ))}
            </div>
          ) : (
            <label className="block text-sm">Collaborateurs : <strong>{seats}</strong>
              <input type="range" min={1} max={100} value={Math.min(seats, 100)} onChange={(e) => set({ seats: +e.target.value })} className="mt-2 w-full accent-[var(--gold)]" />
              <span className="text-xs text-muted-foreground">{PRICES.teamBase} € + {PRICES.teamPerSeat} € × {seats} collaborateurs, chaque mois. Modifiable à tout moment.</span>
            </label>
          )}
          <ul className="space-y-1.5 text-sm">{PERKS[plan].map((x) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-gold" />{x}</li>)}</ul>

          <div className="border-t border-border pt-4">
            {promo ? (
              <div className="flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2 text-sm">
                <span className="flex items-center gap-2"><Tag className="h-4 w-4 text-gold" /><span className="font-mono font-semibold">{promo.code}</span>
                  −{promo.discount.kind === "percent" ? `${promo.discount.value} %` : eur(promo.discount.value * 100)}{promo.discount.months ? ` pendant ${promo.discount.months} mois` : ""}</span>
                <button type="button" aria-label="Retirer le code" onClick={() => { setPromo(null); setCodeIn(""); }}><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={codeIn} onChange={(e) => setCodeIn(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCode(); } }} placeholder="Code de réduction" maxLength={20} className={`${input} font-mono`} />
                <button type="button" onClick={applyCode} className="shrink-0 rounded-full border border-border px-4 text-sm hover:bg-accent">Appliquer</button>
              </div>
            )}
            {codeErr && <p role="alert" className="mt-1.5 text-xs text-destructive">{codeErr}</p>}
          </div>

          <dl className="space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd>{eur(base)}</dd></div>
            {promo && <div className="flex justify-between text-gold"><dt>Réduction</dt><dd>−{eur(base - total)}</dd></div>}
            <div className="flex items-baseline justify-between pt-2"><dt className="font-medium">Total TTC</dt><dd className="font-serif text-3xl">{eur(total)}<span className="text-sm text-muted-foreground"> /{period}</span></dd></div>
          </dl>
        </aside>

        {/* Compte + validation */}
        <form onSubmit={submit} className="space-y-5 rounded-3xl border border-border bg-card p-6">
          <p className="font-serif text-2xl">1. Votre compte</p>
          {email === undefined ? <p className="text-sm text-muted-foreground">Chargement…</p> : email ? (
            <p className="rounded-xl bg-muted px-3 py-2 text-sm">Connecté en tant que <strong>{email}</strong></p>
          ) : (
            <>
              <div className="inline-flex rounded-full border border-border p-1 text-sm">
                <button type="button" onClick={() => setMode("new")} className={`rounded-full px-4 py-1.5 ${mode === "new" ? "bg-primary text-primary-foreground" : ""}`}>Nouveau client</button>
                <button type="button" onClick={() => setMode("login")} className={`rounded-full px-4 py-1.5 ${mode === "login" ? "bg-primary text-primary-foreground" : ""}`}>Déjà client</button>
              </div>
              {mode === "new" && <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Nom et prénom" autoComplete="name" className={input} />}
              <input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Adresse e-mail" autoComplete="email" className={input} />
              <input required type="password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} placeholder={mode === "new" ? "Mot de passe (8 caractères min.)" : "Mot de passe"} autoComplete={mode === "new" ? "new-password" : "current-password"} className={input} />
              {mode === "new" && <input required type="password" value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} placeholder="Confirmer le mot de passe" autoComplete="new-password" className={input} />}
            </>
          )}
          {plan === "equipe" && <input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="Nom de l'entreprise (facultatif)" autoComplete="organization" className={input} />}

          <p className="border-t border-border pt-5 font-serif text-2xl">2. Validation</p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--gold)]" />
            <span>J'accepte les <Link to="/cgu" target="_blank" className="underline">conditions générales</Link> et la <Link to="/confidentialite" target="_blank" className="underline">politique de confidentialité</Link>.</span>
          </label>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <button disabled={busy || email === undefined} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground disabled:opacity-60">
            <Lock className="h-4 w-4" />{busy ? "Activation…" : `Activer pour ${eur(total)}/${period}`}
          </button>
          <p className="text-center text-xs text-muted-foreground">Sans engagement · Résiliable depuis votre espace en un clic.</p>
        </form>
      </div>
    </section>
  );
}
