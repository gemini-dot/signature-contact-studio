import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SignaturePreview } from "@/components/site/SignaturePreview";
import { defaultSignature } from "@/lib/signature";

export const Route = createFileRoute("/tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Signature.Contact" },
      { name: "description", content: "Modifiez la bannière vivante de votre signature e-mail." },
      { property: "og:title", content: "Tableau de bord — Signature.Contact" },
      { property: "og:description", content: "Gérez votre signature vivante." },
    ],
  }),
  component: Dashboard,
});

const presets = [
  "Nouveau : notre collection d'automne est en ligne →",
  "Salon Maison & Objet — retrouvez-nous stand B12",
  "-15 % jusqu'à dimanche avec le code AUTOMNE",
];

function Dashboard() {
  const [text, setText] = useState(presets[0]);
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Aperçu — version de démonstration</p>
      <h1 className="mt-2 text-4xl font-medium">Votre signature <em className="text-gold">vivante</em></h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Changez la bannière ici : elle se met à jour dans tous vos e-mails, même ceux déjà envoyés.</p>
      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
          <label className="block text-sm font-medium">Message de la bannière</label>
          <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <div className="space-y-2">
            {presets.map((p) => (
              <button key={p} onClick={() => setText(p)} className="block w-full rounded-xl border border-border px-3 py-2 text-left text-sm hover:bg-accent">{p}</button>
            ))}
          </div>
          <Link to="/editeur" className="inline-flex text-sm text-gold underline">Modifier toute la signature</Link>
        </div>
        <SignaturePreview template="moderne" data={{ ...defaultSignature, bannerText: text }} />
      </div>
    </section>
  );
}
