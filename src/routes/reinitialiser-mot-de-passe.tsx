import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reinitialiser-mot-de-passe")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Signature.Contact" },
      { name: "description", content: "Choisissez un nouveau mot de passe pour votre compte." },
      { property: "og:title", content: "Nouveau mot de passe — Signature.Contact" },
      { property: "og:description", content: "Réinitialisation du mot de passe." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error(error.message); return; }
    toast.success("Mot de passe mis à jour");
    navigate({ to: "/compte" });
  };
  return (
    <section className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-4xl font-medium">Nouveau <em className="text-gold">mot de passe</em></h1>
      <form onSubmit={submit} className="mt-8 space-y-3 rounded-3xl border border-border bg-card p-6">
        <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nouveau mot de passe" className="w-full rounded-xl border border-input bg-background px-3 py-2" />
        <button className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground">Enregistrer</button>
      </form>
    </section>
  );
}
