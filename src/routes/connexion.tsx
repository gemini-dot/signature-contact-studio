import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const safe = (r: unknown) => (typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : "/compte");

export const Route = createFileRoute("/connexion")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => (typeof s['redirect'] === "string" ? { redirect: s['redirect'] } : {}),
  head: () => ({
    meta: [
      { title: "Connexion — Signature.Contact" },
      { name: "description", content: "Connectez-vous pour retrouver vos signatures e-mail et votre abonnement." },
      { property: "og:title", content: "Connexion — Signature.Contact" },
      { property: "og:description", content: "Accédez à votre espace Signature.Contact." },
    ],
  }),
  component: Login,
});

type Mode = "connexion" | "inscription" | "lien" | "oubli";

function Login() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const target = safe(redirect);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "connexion") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: target });
      } else if (mode === "inscription") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + target, data: { full_name: name } } });
        if (error) throw error;
        toast.success("Compte créé : cliquez sur le lien reçu par e-mail pour le confirmer.");
      } else if (mode === "lien") {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + target } });
        if (error) throw error;
        toast.success("Lien de connexion envoyé : vérifiez votre boîte mail.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reinitialiser-mot-de-passe" });
        if (error) throw error;
        toast.success("E-mail de réinitialisation envoyé.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setBusy(false);
    }
  };

  const tabs: [Mode, string][] = [["connexion", "Mot de passe"], ["lien", "Lien magique"], ["inscription", "Créer un compte"]];
  const field = "w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring";
  return (
    <section className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-4xl font-medium">Votre <em className="text-gold">espace</em></h1>
      <p className="mt-2 text-muted-foreground">Retrouvez vos signatures et gérez votre abonnement.</p>
      <div className="mt-8 rounded-3xl border border-border bg-card p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map(([m, l]) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-full px-3 py-1 text-sm ${mode === m ? "bg-primary text-primary-foreground" : "border border-border"}`}>{l}</button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "inscription" && <input required placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} className={field} />}
          <input required type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          {(mode === "connexion" || mode === "inscription") && (
            <input required type="password" minLength={6} placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          )}
          <button disabled={busy} className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground disabled:opacity-60">
            {mode === "connexion" ? "Se connecter" : mode === "inscription" ? "Créer mon compte" : mode === "lien" ? "Recevoir mon lien" : "Réinitialiser"}
          </button>
        </form>
        {mode === "connexion" && (
          <button type="button" onClick={() => setMode("oubli")} className="mt-3 text-sm text-muted-foreground underline">Mot de passe oublié ?</button>
        )}
      </div>
    </section>
  );
}
