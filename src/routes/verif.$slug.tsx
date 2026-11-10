import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type PublicProfile } from "@/lib/member";

export const Route = createFileRoute("/verif/$slug")({
  head: () => ({
    meta: [
      { title: "Vérification d'identité — Signature.Contact" },
      { name: "description", content: "Vérifiez qu'un e-mail provient bien de la personne qui l'a signé." },
      { property: "og:title", content: "Vérification d'identité — Signature.Contact" },
      { property: "og:description", content: "Certificat d'identité professionnelle Signature.Contact." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VerifPage,
});

function VerifPage() {
  const { slug } = Route.useParams();
  const q = useQuery({ queryKey: ["public-profile", slug], queryFn: async () => (await supabase.rpc("get_member_profile", { _slug: slug })).data as PublicProfile | null });
  const p = q.data;
  if (q.isLoading) return <div className="py-32 text-center text-muted-foreground">Vérification…</div>;
  const ok = !!p?.verified;
  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      <div className={`rounded-3xl border bg-card p-8 shadow-elegant ${ok ? "border-gold" : "border-destructive/50"}`}>
        {ok ? <BadgeCheck className="h-12 w-12 text-gold" /> : <ShieldAlert className="h-12 w-12 text-destructive" />}
        <h1 className="mt-4 font-serif text-3xl">{ok ? <>Identité <em className="text-gold">vérifiée</em></> : "Certificat non valide"}</h1>
        {ok && p ? (
          <dl className="mt-6 space-y-3 text-sm">
            <div><dt className="text-muted-foreground">Nom</dt><dd className="font-medium">{p.full_name}</dd></div>
            {p.company && <div><dt className="text-muted-foreground">Société</dt><dd className="font-medium">{p.company}</dd></div>}
            <div><dt className="text-muted-foreground">Adresse e-mail officielle</dt><dd className="font-medium">{p.email}</dd></div>
            {p.verified_at && <div><dt className="text-muted-foreground">Certifié depuis</dt><dd className="font-medium">{new Date(p.verified_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</dd></div>}
            <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">Si l'e-mail reçu ne provient pas exactement de l'adresse ci-dessus, il ne vient pas de cette personne : ne cliquez sur aucun lien et ne faites aucun virement.</p>
          </dl>
        ) : <p className="mt-3 text-sm text-muted-foreground">Ce certificat n'existe pas ou n'est plus actif. Méfiez-vous de l'e-mail qui vous a conduit ici.</p>}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Service de vérification <Link to="/" className="underline">Signature.Contact</Link></p>
    </section>
  );
}
