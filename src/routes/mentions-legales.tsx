import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Signature.Contact" },
      { name: "description", content: "Mentions légales du service Signature.Contact by Gem's." },
      { property: "og:title", content: "Mentions légales — Signature.Contact" },
      { property: "og:description", content: "Éditeur, hébergement et contact." },
    ],
  }),
  component: () => (
    <LegalPage title="Mentions légales">
      <h2>Éditeur</h2>
      <p>Signature.Contact by Gem's — [raison sociale, adresse et SIRET à compléter].</p>
      <h2>Hébergement</h2>
      <p>[Hébergeur à compléter].</p>
      <h2>Contact</h2>
      <p>[Adresse e-mail de contact à compléter].</p>
    </LegalPage>
  ),
});
