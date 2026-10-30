import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PARTNER_DISCOUNT_PERCENT } from "@/lib/pricing";

/** Encart réservé aux abonnés Équipe : code unique de remise Mails.contact. */
export function MailsContactPerk() {
  const q = useQuery({
    queryKey: ["partner-code"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_partner_code" as never);
      if (error) throw error;
      return (data as unknown as string | null) ?? null;
    },
  });
  const code = q.data;
  if (!code) return null;
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Code copié");
  };
  return (
    <div className="rounded-3xl border border-gold/50 bg-card p-6 shadow-elegant">
      <div className="flex items-center gap-2 text-gold">
        <Gift className="h-5 w-5" />
        <p className="text-xs uppercase tracking-[0.2em]">Avantage partenaire</p>
      </div>
      <p className="mt-2 font-serif text-2xl">
        -{PARTNER_DISCOUNT_PERCENT} % sur <em className="text-gold">Mails.contact</em>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        En tant que client Équipe, profitez de {PARTNER_DISCOUNT_PERCENT} % de remise sur votre abonnement Mails.contact. Ce code est personnel et réservé à votre entreprise.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <code className="rounded-xl border border-border bg-background px-4 py-2 font-mono text-lg tracking-wider">{code}</code>
        <button onClick={copy} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-accent">
          <Copy className="h-4 w-4" /> Copier
        </button>
        <a href={`https://mails.contact/?promo=${encodeURIComponent(code)}`} target="_blank" rel="noreferrer" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
          Découvrir Mails.contact
        </a>
      </div>
    </div>
  );
}
