import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { PRICES, teamMonthlyPrice } from "@/lib/pricing";

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

function Tarifs() {
  const [yearly, setYearly] = useState(false);
  const [seats, setSeats] = useState(5);
  const plans = [
    { name: "Gratuit", price: `${PRICES.free} €`, note: "pour toujours", features: ["1 signature", "5 modèles", "Mention « signature.contact »"], cta: "Commencer" },
    { name: "Solo", price: yearly ? `${PRICES.soloYearly} €` : `${PRICES.soloMonthly} €`, note: yearly ? "par an" : "par mois", features: ["Sans branding", "Signature vivante", "Bouton « Prendre rendez-vous »", "QR code carte de visite"], cta: "Choisir Solo", featured: true },
    { name: "Équipe", price: `${teamMonthlyPrice(seats)} €`, note: `par mois · ${seats} collaborateurs`, features: ["Tout Solo", "Gestion centralisée", `${PRICES.teamBase} € + ${PRICES.teamPerSeat} €/collaborateur/mois`], cta: "Choisir Équipe", team: true },
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
    </section>
  );
}
