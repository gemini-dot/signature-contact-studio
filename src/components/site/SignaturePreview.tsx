import { renderSignature, type SignatureData, type TemplateId } from "@/lib/signature";

export function SignaturePreview({ template, data }: { template: TemplateId; data: SignatureData }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-3 text-xs text-muted-foreground">Nouveau message</span>
      </div>
      <div className="space-y-1 border-b border-border px-5 py-3 text-xs text-muted-foreground">
        <p>À : client@exemple.fr</p>
        <p>Objet : Suite à notre échange</p>
      </div>
      {/* L'aperçu e-mail est toujours sur fond clair, comme dans un vrai client mail. */}
      <div className="email-canvas px-5 py-5">
        <p className="mb-4 text-sm">Bonjour,<br />Merci pour votre temps aujourd'hui. Belle journée !</p>
        <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: renderSignature(template, data) }} />
      </div>
    </div>
  );
}
