import { Link } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";

export function LockedFeature({ title, plan, benefits }: { title: string; plan: "Solo" | "Équipe"; benefits: string[] }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-gold/40 bg-card p-8 text-center shadow-elegant">
      <Lock className="mx-auto h-8 w-8 text-gold" />
      <h2 className="mt-3 font-serif text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Disponible avec la formule {plan === "Solo" ? "Solo ou Équipe" : "Équipe"}.</p>
      <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm">
        {benefits.map((b) => <li key={b} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{b}</li>)}
      </ul>
      <Link to="/compte/abonnement" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Débloquer avec {plan}</Link>
    </div>
  );
}
