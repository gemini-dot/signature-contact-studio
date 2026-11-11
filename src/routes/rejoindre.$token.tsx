import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { SignaturePreview } from "@/components/site/SignaturePreview";
import { defaultSignature, type SignatureData, type TemplateId } from "@/lib/signature";

export const Route = createFileRoute("/rejoindre/$token")({
  head: () => ({
    meta: [
      { title: "Rejoindre mon équipe — Signature.Contact" },
      { name: "description", content: "Votre signature e-mail aux couleurs de votre entreprise, prête en 15 secondes." },
      { property: "og:title", content: "Rejoindre mon équipe — Signature.Contact" },
      { property: "og:description", content: "Créez votre signature d'entreprise en 15 secondes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JoinPage,
});

type Info = { team_name: string; template: string; company: string; logoUrl: string; accent: string };

function JoinPage() {
  const { token } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["join-info", token], queryFn: async () => (await supabase.rpc("get_join_info", { _token: token })).data as Info | null });
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  if (q.isLoading || loading) return <div className="py-32 text-center text-muted-foreground">Chargement…</div>;
  const info = q.data;
  if (!info) return (
    <section className="mx-auto max-w-md px-5 py-24 text-center">
      <p className="font-serif text-3xl">Lien expiré</p>
      <p className="mt-3 text-muted-foreground">Ce lien d'invitation n'est plus valide. Demandez-en un nouveau à votre administrateur.</p>
      <Link to="/" className="mt-6 inline-block text-gold underline">Retour à l'accueil</Link>
    </section>
  );

  const data: SignatureData = { ...defaultSignature, name: name || "Votre nom", title: title || "Votre poste", phone, email: user?.email ?? "vous@entreprise.fr",
    company: info.company || info.team_name, website: "", address: "", logoUrl: info.logoUrl, logoSrc: "", ...(info.accent ? { accent: info.accent } : {}), branding: false };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { toast.error("Indiquez votre prénom et votre nom."); return; }
    setBusy(true);
    const { data: res, error } = await supabase.rpc("join_team", { _token: token });
    if (error) { setBusy(false); toast.error(error.message); return; }
    const r = res as { base: Record<string, unknown>; template: string };
    const sig = { ...defaultSignature, ...(r.base as Partial<SignatureData>), logoSrc: "", name: name.trim().slice(0, 80), title: title.trim().slice(0, 80), phone: phone.trim().slice(0, 30), email: user!.email ?? "", branding: false };
    const { error: e2 } = await supabase.from("signatures").insert({ user_id: user!.id, name: `Signature ${info.team_name}`.slice(0, 80), template: r.template, data: sig as unknown as Json });
    setBusy(false);
    if (e2 && !e2.message.includes("20 signatures")) toast.error(e2.message);
    window.__lovableEvents?.track?.("project.team_joined_magic_link", { with_phone: !!phone.trim() });
    toast.success(`Bienvenue chez ${info.team_name} ! Votre signature est prête.`);
    navigate({ to: "/compte" });
  };

  const field = "w-full rounded-xl border border-input bg-background px-3 py-2.5";
  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-5 py-14 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-gold"><Users className="h-4 w-4" />Invitation</p>
        <h1 className="mt-3 text-4xl font-medium">Rejoignez <em className="text-gold">{info.team_name}</em></h1>
        <p className="mt-3 text-muted-foreground">Votre signature officielle est prête en 15 secondes : seules 3 informations sont nécessaires.</p>
        {!user ? (
          <div className="mt-8 space-y-3 rounded-3xl border border-border bg-card p-6">
            <p className="text-sm">Connectez-vous ou créez votre compte avec votre adresse professionnelle pour continuer.</p>
            <Link to="/connexion" search={{ redirect: `/rejoindre/${token}` }} className="inline-flex rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">Continuer</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-6">
            <label className="grid gap-1 text-sm">Prénom et nom<input required autoFocus maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Camille Laurent" /></label>
            <label className="grid gap-1 text-sm">Poste<input maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} className={field} placeholder="Chargée de clientèle" /></label>
            <label className="grid gap-1 text-sm">Mobile<input type="tel" maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="+33 6 12 34 56 78" /></label>
            <p className="text-xs text-muted-foreground">Connecté en tant que {user.email}. Logo, couleurs et mentions sont fournis par votre entreprise.</p>
            <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />}Créer ma signature</button>
          </form>
        )}
      </div>
      <div className="lg:pt-16"><SignaturePreview template={(info.template as TemplateId) || "moderne"} data={data} /></div>
    </section>
  );
}
