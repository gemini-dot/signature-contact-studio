import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: "Conditions d'utilisation — Signature.Contact" },
      { name: "description", content: "Conditions générales d'utilisation de Signature.Contact." },
      { property: "og:title", content: "Conditions d'utilisation — Signature.Contact" },
      { property: "og:description", content: "Règles d'usage du service." },
    ],
  }),
  component: () => (
    <LegalPage title="Conditions d'utilisation">
      <p>En utilisant Signature.Contact, vous acceptez les présentes conditions. [Texte complet à compléter].</p>
      <h2>Formule gratuite</h2>
      <p>La formule gratuite inclut une signature comportant la mention « signature.contact ».</p>
    </LegalPage>
  ),
});
