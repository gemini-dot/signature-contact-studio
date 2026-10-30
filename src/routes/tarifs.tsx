import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { PARTNER_DISCOUNT_PERCENT, PRICES, teamMonthlyPrice } from "@/lib/pricing";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — Signature.Contact" },
      { name: "description", content: "Gratuit, Solo à 6 €/mois ou Équipe à 19 €/mois + 1 € par collaborateur." },
      { property: "og:title", content: "Tarifs — Signature.Contact" },
      { property: "og:description", content: "Des formules simples pour une signature e-mail professionnelle." },
    ],
  }),
  component: Tarifs,
});

const COMPARE: [string, string, string][] = [
  ["Pour qui", "Indépendant, freelance, dirigeant seul", "PME, agence, cabinet, équipe commerciale"],
  ["Gestion", "Vous gérez votre propre signature", "Un administrateur gère toutes les signatures"],
  ["Charte graphique", "Libre : modèle et couleurs au choix", "Modèle, logo et couleurs imposés à tous"],
  ["Signature vivante", "Votre bannière personnelle", "Une bannière changée pour toute l'équipe en 1 clic"],
  ["Mentions légales", "Saisies par vous", "Communes et verrouillées pour tous"],
  ["Nouveau collaborateur", "—", "Ajouté en 1 clic, signature prête en 30 secondes"],
  ["Facturation", "Un abonnement par personne", "Une facture unique pour l'entreprise"],
];

const REASONS = [
  { title: "Une image de marque cohérente", text: "Fini les logos flous et les signatures bricolées : tout le monde utilise le même modèle officiel." },
  { title: "Une annonce, toute l'entreprise", text: "Salon, nouveau produit, vœux : changez la bannière une fois, elle s'affiche dans les e-mails de chaque collaborateur." },
  { title: "Des informations toujours justes", text: "Adresse, site web et mentions légales sont fixés par l'administrateur. Chacun ne remplit que son nom, son poste et son numéro." },
  { title: "Moins cher dès 4 personnes", text: "19 € + 1 € par collaborateur : pour 15 personnes, 34 €/mois au lieu de 90 € en Solo." },
  { title: `-${PARTNER_DISCOUNT_PERCENT} % sur Mails.contact`, text: "Les clients Équipe reçoivent un code unique dans leur espace pour profiter d'une remise sur leur abonnement Mails.contact." },
];

function Tarifs() {
  const [yearly, setYearly] = useState(false);
  const [seats, setSeats] = useState(5);
  const plans = [
    { name: "Gratuit", price: `${PRICES.free} €`, note: "pour toujours", features: ["1 signature", "5 modèles", "Mention « signature.contact »"], cta: "Commencer" },
    { name: "Solo", price: yearly ? `${PRICES.soloYearly} €` : `${PRICES.soloMonthly} €`, note: yearly ? "par an" : "par mois", features: ["Sans branding", "Signature vivante", "Bouton « Prendre rendez-vous »", "QR code carte de visite"], cta: "Choisir Solo", featured: true },
    { name: "Équipe", price: `${teamMonthlyPrice(seats)} €`, note: `par mois · ${seats} collaborateurs`, features: ["Tout Solo", "Gestion centralisée", `${PRICES.teamBase} € + ${PRICES.teamPerSeat} €/collaborateur/mois`, `Inclus : -${PARTNER_DISCOUNT_PERCENT} % sur Mails.contact (code unique)`], cta: "Choisir Équipe", team: true },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h1 className="text-center text-5xl font-medium">Des tarifs <em className="text-gold">limpides</em>.</h1>
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm">
          <button onClick={() => setYearly(false)} className={`rounded-full px-4 py-1.5 ${!yearly ? "bg-primary text-primary-foreground" : ""}`}>Mensuel</button>
          <button onClick={() => setYearly(true)} className={`rounded-full px-4 py-1.5 ${yearly ? "bg-primary text-primary-foreground" : ""}`}>Annuel</button>
        </div>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className={`flex flex-col rounded-3xl border bg-card p-7 ${p.featured ? "border-gold shadow-elegant" : "border-border"}`}>
            <h2 className="text-2xl">{p.name}</h2>
            <p className="mt-4 font-serif text-5xl">{p.price}</p>
            <p className="text-sm text-muted-foreground">{p.note}</p>
            {p.team && (
              <label className="mt-4 text-sm">
                Collaborateurs : {seats}
                <input type="range" min={1} max={100} value={seats} onChange={(e) => setSeats(+e.target.value)} className="mt-1 w-full accent-[var(--gold)]" />
              </label>
            )}
            <ul className="mt-6 flex-1 space-y-2 text-sm">
              {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-gold" />{f}</li>)}
            </ul>
            <Link to="/editeur" className={`mt-8 rounded-full px-5 py-2.5 text-center font-medium ${p.featured ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent"}`}>{p.cta}</Link>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Prix TTC. Le paiement en ligne arrive bientôt.</p>

      <div className="mt-24">
        <h2 className="text-center text-4xl font-medium">Solo ou Équipe : <em className="text-gold">la différence</em></h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">Solo vous laisse tout gérer vous-même. Équipe permet à une seule personne de gérer les signatures de toute l'entreprise.</p>
        <div className="mt-10 overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 font-medium text-muted-foreground">Critère</th>
                <th className="p-4 font-serif text-lg">Solo</th>
                <th className="p-4 font-serif text-lg text-gold">Équipe</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([k, s, t]) => (
                <tr key={k} className="border-b border-border/60 last:border-0">
                  <td className="p-4 font-medium">{k}</td>
                  <td className="p-4 text-muted-foreground">{s}</td>
                  <td className="p-4">{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {REASONS.map((r) => (
            <div key={r.title} className="rounded-3xl border border-border bg-card p-6">
              <h3 className="text-xl">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-gold/40 bg-card p-6">
          <h3 className="text-xl">Combien ça coûte selon votre équipe ?</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {[1, 3, 5, 15].map((n) => {
              const solo = n * PRICES.soloMonthly;
              const team = teamMonthlyPrice(n);
              return (
                <div key={n} className="rounded-2xl border border-border p-4 text-sm">
                  <p className="font-medium">{n} personne{n > 1 ? "s" : ""}</p>
                  <p className="mt-2 text-muted-foreground">Solo : {solo} €/mois</p>
                  <p className={team < solo ? "text-gold font-medium" : ""}>Équipe : {team} €/mois</p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Équipe devient moins chère que des abonnements Solo séparés à partir de 4 personnes.</p>
        </div>
      </div>
    </section>
  );
}
