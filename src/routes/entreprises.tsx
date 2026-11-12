import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Building2, CalendarCheck, Check, FileText, Link2, Lock, Megaphone, MonitorPlay, Percent, Radio, Star, Upload, Wrench, Moon, Leaf } from "lucide-react";
import { PARTNER_DISCOUNT_PERCENT, PRICES, teamMonthlyPrice } from "@/lib/pricing";

export const Route = createFileRoute("/entreprises")({
  head: () => ({
    meta: [
      { title: "Offre Équipe pour les entreprises — Signature.Contact" },
      { name: "description", content: "Signatures e-mail unifiées, Smart Bannières, rendez-vous et badge vérifié pour toute votre équipe : 19 € + 1 € par collaborateur." },
      { property: "og:title", content: "Offre Équipe pour les entreprises — Signature.Contact" },
      { property: "og:description", content: "Une image de marque unifiée et maîtrisée dans chaque e-mail de vos collaborateurs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Entreprises,
});

const PILLARS = [
  { icon: Upload, t: "Import groupé CSV / Excel", d: "Déposez votre fichier collaborateurs : doublons et e-mails invalides sont détectés, le nombre de places est respecté, et toute l'équipe est ajoutée en une fois." },
  { icon: Wrench, t: "Installation guidée, zéro ticket", d: "Un guide pas-à-pas adapté à chaque messagerie (Gmail, Outlook Web, PC, Mac, Apple Mail, iPhone, Thunderbird) détecte l'appareil de chacun. Votre service informatique n'est plus sollicité." },
  { icon: Moon, t: "Mode sombre garanti", d: "Logo et textes restent nets chez les destinataires en mode sombre, avec un aperçu clair / sombre avant diffusion." },
  { icon: Leaf, t: "Signature éco-responsable", d: "Une mention RSE discrète et personnalisable sous chaque signature pour valoriser vos engagements." },
  { icon: Link2, t: "Onboarding par lien magique", d: "Partagez un seul lien : chaque collaborateur saisit son nom, son poste et son mobile. Sa signature conforme à votre charte est prête en 15 secondes, sans que vous ne remplissiez rien." },
  { icon: MonitorPlay, t: "Fonds de visio à vos couleurs", d: "Chaque collaborateur télécharge un fond Zoom, Teams ou Meet avec son nom, son poste et un QR code : vos clients enregistrent le contact pendant la réunion." },
  { icon: FileText, t: "Plaquette sans pièce jointe", d: "Un bouton « Télécharger notre plaquette » dans chaque signature. Les e-mails restent légers, évitent les spams, et le document se met à jour sans renvoi." },
  { icon: Star, t: "Avis clients & réponse courte", d: "Votre note Google sous chaque signature pour rassurer, et une version courte pour des fils de discussion propres." },
  { icon: Megaphone, t: "Smart Bannières programmables", d: "Salon, lancement, vœux : programmez vos campagnes à l'avance. Elles s'affichent dans les e-mails de toute l'équipe, puis la bannière par défaut revient seule. Même les e-mails déjà envoyés montrent l'actualité du moment." },
  { icon: Lock, t: "Une charte verrouillée", d: "Modèle, logo, couleurs et mentions légales sont fixés par l'administrateur. Chacun ne remplit que son nom, son poste et son numéro." },
  { icon: CalendarCheck, t: "Rendez-vous & carte de visite pour chacun", d: "Chaque collaborateur dispose de sa page de réservation, de sa mini-page profil et de son QR code vCard. Plus besoin d'abonnements Calendly ou Linktree." },
  { icon: BadgeCheck, t: "Badge « Identité vérifiée »", d: "Contre l'usurpation et les fraudes au virement : vos clients vérifient en un clic que l'e-mail vient bien de votre entreprise." },
  { icon: Radio, t: "Statut de disponibilité en direct", d: "En réunion, en déplacement, en congés : vos clients savent quand attendre une réponse, sans message d'absence impersonnel." },
  { icon: Percent, t: `-${PARTNER_DISCOUNT_PERCENT} % sur Mails.contact`, d: "Un code unique, dans votre espace, pour équiper toute l'entreprise d'une messagerie professionnelle européenne à prix réduit." },
];

const STEPS = [
  { t: "1. Créez votre équipe", d: "Choisissez le modèle, déposez votre logo et fixez vos mentions légales." },
  { t: "2. Importez ou invitez", d: "Déposez votre fichier CSV / Excel ou partagez votre lien magique : chacun installe ensuite sa signature avec le guide pas-à-pas." },
  { t: "3. Pilotez tout d'un seul endroit", d: "Bannières, charte, nouveaux arrivants : un seul administrateur, une seule facture." },
];

const FAQ = [
  { q: "Qui gère les signatures ?", a: "Un ou plusieurs administrateurs de votre choix. Les collaborateurs ne modifient que leurs informations personnelles." },
  { q: "Comment fonctionne la Smart Bannière ?", a: "Vous placez une fois un lien dans la signature de l'équipe. Ensuite, l'image affichée change selon votre calendrier, sans toucher à Gmail ou Outlook." },
  { q: "Que certifie le badge vérifié ?", a: "Que l'adresse e-mail du collaborateur a été confirmée et rattachée à un abonnement actif. La page de vérification affiche le nom, la société et l'adresse officielle." },
  { q: "Puis-je ajouter ou retirer des collaborateurs ?", a: `Oui, à tout moment. Vous payez ${PRICES.teamBase} € par mois plus ${PRICES.teamPerSeat} € par collaborateur.` },
  { q: "Comment fonctionne le lien magique ?", a: "Depuis l'onglet Équipe, copiez votre lien et envoyez-le à vos collaborateurs. Vous pouvez le régénérer ou le désactiver à tout moment ; le nombre de places de votre abonnement est respecté automatiquement." },
  { q: "Puis-je importer mes collaborateurs depuis Excel ?", a: "Oui. Téléchargez notre modèle, remplissez-le ou exportez votre fichier au format CSV, puis déposez-le dans l'onglet Équipe. Vous vérifiez la liste avant validation ; seule la colonne E-mail est obligatoire." },
  { q: "Y a-t-il un engagement ?", a: "Non. L'offre Équipe est sans engagement." },
];

function Entreprises() {
  const [seats, setSeats] = useState(10);
  const team = teamMonthlyPrice(seats);
  const solo = seats * PRICES.soloMonthly;
  return (
    <>
      <section className="border-b border-border" style={{ backgroundImage: "var(--gradient-hero)" }}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.2fr_1fr] lg:py-24">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-gold"><Building2 className="h-4 w-4" />Offre Équipe · Entreprises</p>
            <h1 className="mt-4 text-4xl font-medium leading-tight md:text-6xl">Une image de marque <em className="text-gold">unifiée</em> dans chaque e-mail.</h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">Signatures cohérentes, bannières programmées, rendez-vous et identité vérifiée pour tous vos collaborateurs, gérés depuis un seul espace.</p>
            <div className="mt-6 flex flex-wrap gap-2">{["Sans engagement", "Facture unique", "Prêt en 5 minutes", `-${PARTNER_DISCOUNT_PERCENT} % Mails.contact`].map((b) => <span key={b} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">{b}</span>)}</div>
            <Link to="/compte/abonnement" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">Démarrer l'offre Équipe</Link>
          </div>
          <div className="h-fit rounded-3xl border border-gold bg-card p-8 shadow-elegant">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Simulez votre tarif</p>
            <p className="mt-2 font-serif text-5xl">{team} €<span className="text-base text-muted-foreground"> / mois TTC</span></p>
            <label className="mt-5 block text-sm">{seats} collaborateur{seats > 1 ? "s" : ""}
              <input type="range" min={1} max={100} value={seats} onChange={(e) => setSeats(+e.target.value)} className="mt-2 w-full accent-[var(--gold)]" />
            </label>
            {team < solo && <p className="mt-3 text-sm text-gold">Soit {solo - team} € d'économie par mois face à {seats} abonnements Solo.</p>}
            <ul className="mt-6 space-y-2 text-sm">{["Tout Solo pour chaque collaborateur", "Smart Bannières programmables", "Lien magique & import CSV / Excel", "Fonds de visio & plaquette pour chacun", "Charte et mentions verrouillées"].map((i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-gold" />{i}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-medium md:text-4xl">Tout ce que vos équipes <em className="text-gold">gagnent</em></h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-3xl border border-border bg-card p-6">
              <I className="h-6 w-6 text-gold" /><h3 className="mt-3 text-lg font-medium">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-3xl font-medium md:text-4xl">Opérationnel en <em className="text-gold">trois étapes</em></h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">{STEPS.map((s) => <div key={s.t} className="rounded-3xl border border-border bg-background p-6"><h3 className="font-serif text-xl text-gold">{s.t}</h3><p className="mt-2 text-sm text-muted-foreground">{s.d}</p></div>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-3xl font-medium md:text-4xl">Questions <em className="text-gold">fréquentes</em></h2>
        <div className="mt-8 space-y-3">{FAQ.map((f) => (
          <details key={f.q} className="rounded-2xl border border-border bg-card p-5"><summary className="cursor-pointer font-medium">{f.q}</summary><p className="mt-3 text-sm text-muted-foreground">{f.a}</p></details>
        ))}</div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/compte/abonnement" className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">Démarrer l'offre Équipe</Link>
          <Link to="/tarifs" hash="comparatif" className="rounded-full border border-border px-6 py-3">Comparer les formules</Link>
        </div>
      </section>
    </>
  );
}
