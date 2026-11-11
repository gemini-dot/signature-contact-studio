import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Minus } from "lucide-react";
import { PARTNER_DISCOUNT_PERCENT, PRICES } from "@/lib/pricing";

type Cell = string | boolean;
type Row = [string, Cell, Cell, Cell];
const COLS = ["Gratuit", "Solo", "Équipe"] as const;

const SECTIONS: { title: string; rows: Row[] }[] = [
  { title: "Tarifs & engagement", rows: [
    ["Prix mensuel", "0 €", `${PRICES.soloMonthly} € / mois`, `${PRICES.teamBase} € + ${PRICES.teamPerSeat} € / collaborateur`],
    ["Prix annuel", "—", `${PRICES.soloYearly} € / an`, "Sur devis"],
    ["Engagement", "Aucun", "Sans engagement", "Sans engagement"],
    ["Facturation", "—", "Personnelle", "Une facture unique pour l'entreprise"],
  ] },
  { title: "Signature & personnalisation", rows: [
    ["Signatures", "1", "Jusqu'à 20 variantes", "Jusqu'à 20 par collaborateur"],
    ["Version « réponse courte » pour les fils de discussion", false, true, true],
    ["Modèles élégants", "5", "Tous", "Tous + modèle imposé"],
    ["Mention « signature.contact »", "Oui", false, false],
    ["Réseaux sociaux, logo, photo", true, true, true],
    ["Bannière personnelle", false, true, true],
    ["Bouton plaquette / PDF sans pièce jointe", false, true, true],
    ["Note & avis clients sous la signature", false, true, true],
  ] },
  { title: "Rendez-vous & carte de visite", rows: [
    ["Prise de rendez-vous intégrée", false, true, "Pour chaque collaborateur"],
    ["Disponibilités libres (jours, plages, pauses)", false, true, true],
    ["Mini-page profil à votre nom", false, true, true],
    ["QR code & fiche contact (.vcf)", false, true, true],
    ["Fond de visio HD avec QR code (Zoom, Teams, Meet)", false, true, true],
  ] },
  { title: "Confiance & disponibilité", rows: [
    ["Badge « Identité vérifiée » anti-phishing", false, true, true],
    ["Page publique de vérification", false, true, true],
    ["Statut de disponibilité en direct", false, true, true],
    ["Retour automatique à « Disponible »", false, true, true],
  ] },
  { title: "Gestion d'équipe & marque", rows: [
    ["Smart Bannières programmables", false, false, true],
    ["Charte, logo et couleurs verrouillés", false, false, true],
    ["Mentions légales communes", false, false, true],
    ["Ajout d'un collaborateur en 1 clic", false, false, true],
    ["Lien magique d'onboarding (signature prête en 15 s)", false, false, true],
    [`-${PARTNER_DISCOUNT_PERCENT} % sur Mails.contact (code unique)`, false, false, true],
  ] },
];

function CellView({ v }: { v: Cell }) {
  if (v === true) return <Check className="mx-auto h-5 w-5 text-gold" aria-label="Inclus" />;
  if (v === false) return <Minus className="mx-auto h-5 w-5 text-muted-foreground/40" aria-label="Non inclus" />;
  return <span className="text-sm">{v}</span>;
}

export function PlanComparison() {
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  return (
    <section id="comparatif" className="mt-24 scroll-mt-24">
      <h2 className="text-center text-4xl font-medium">Comparatif <em className="text-gold">détaillé</em></h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">Toutes les différences entre nos formules, ligne par ligne.</p>

      <div className="mt-10 space-y-3 lg:hidden">
        {SECTIONS.map((s, si) => (
          <details key={s.title} open={si === 0} className="group overflow-hidden rounded-2xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between bg-muted/60 px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary [&::-webkit-details-marker]:hidden">
              {s.title}<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="divide-y divide-border/60">
              {s.rows.map(([label, ...cells]) => (
                <div key={label} className="p-4">
                  <p className="mb-3 text-sm font-medium">{label}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {cells.map((v, i) => (
                      <div key={i} className={`rounded-xl border p-2 text-center ${i === 1 ? "border-gold/50 bg-gold/5" : "border-border/60"}`}>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{COLS[i]}</p>
                        <CellView v={v} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-10 hidden overflow-hidden rounded-3xl border border-border bg-card lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr>
              <th className="w-[34%] p-5" />
              {COLS.map((c, i) => (
                <th key={c} className={`p-5 text-center ${i === 1 ? "bg-gold/5" : ""}`}>
                  {i === 1 && <span className="mb-2 inline-block rounded-full bg-gold px-3 py-0.5 text-[11px] font-bold text-gold-foreground">Le plus choisi</span>}
                  <div className="font-serif text-2xl">{c}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTIONS.map((s) => [
              <tr key={s.title} className="border-t border-border bg-muted/60">
                <th colSpan={4} className="px-5 py-2.5">
                  <button type="button" onClick={() => setClosed((c) => ({ ...c, [s.title]: !c[s.title] }))} aria-expanded={!closed[s.title]} className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-primary">
                    {s.title}<ChevronDown className={`h-4 w-4 transition-transform ${closed[s.title] ? "" : "rotate-180"}`} />
                  </button>
                </th>
              </tr>,
              ...(closed[s.title] ? [] : s.rows).map(([label, ...cells]) => (
                <tr key={s.title + label} className="border-t border-border/60 hover:bg-muted/30">
                  <th scope="row" className="p-4 text-sm font-medium">{label}</th>
                  {cells.map((v, i) => <td key={i} className={`p-4 text-center text-muted-foreground ${i === 1 ? "bg-gold/5" : ""}`}><CellView v={v} /></td>)}
                </tr>
              )),
            ])}
            <tr className="border-t border-border">
              <td className="p-4" />
              <td className="p-4 text-center"><Link to="/editeur" className="inline-flex rounded-full border border-border px-4 py-2 text-sm">Commencer</Link></td>
              <td className="bg-gold/5 p-4 text-center"><Link to="/compte/abonnement" className="inline-flex rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Choisir Solo</Link></td>
              <td className="p-4 text-center"><Link to="/entreprises" className="inline-flex rounded-full border border-border px-4 py-2 text-sm">Découvrir Équipe</Link></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
