import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Confidentialité — Signature.Contact" },
      { name: "description", content: "Comment Signature.Contact protège vos données personnelles." },
      { property: "og:title", content: "Confidentialité — Signature.Contact" },
      { property: "og:description", content: "Politique de confidentialité et RGPD." },
    ],
  }),
  component: () => (
    <LegalPage title="Politique de confidentialité">
      <p>Les informations saisies dans l'éditeur restent dans votre navigateur : elles ne sont pas envoyées sur nos serveurs dans cette version.</p>
      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. [Contact à compléter].</p>
    </LegalPage>
  ),
});
