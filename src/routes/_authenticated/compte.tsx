import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BadgeCheck, CalendarCheck, CreditCard, FileText, FileSignature, Megaphone, Plane, MonitorPlay, PenLine, Radio, Users } from "lucide-react";
import { usePlan } from "@/hooks/use-plan";
import { TabIntro } from "@/components/site/TabIntro";

export const Route = createFileRoute("/_authenticated/compte")({
  head: () => ({
    meta: [
      { title: "Mon espace — Signature.Contact" },
      { name: "description", content: "Vos signatures, votre carte de visite, vos rendez-vous et votre abonnement." },
      { property: "og:title", content: "Mon espace — Signature.Contact" },
      { property: "og:description", content: "Espace personnel Signature.Contact." },
    ],
  }),
  component: Layout,
});

function Layout() {
  const { paid, isTeamPlan, plan } = usePlan();
  const tab = "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-sm border border-border hover:bg-accent";
  const active = { className: "bg-primary text-primary-foreground border-primary hover:bg-primary" };
  const lock = (ok: boolean) => !ok && <span className="text-[10px] uppercase tracking-wider opacity-60">{"·"} pro</span>;
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl font-medium">Mon <em className="text-gold">espace</em></h1>
        <span className="rounded-full border border-gold/50 px-3 py-1 text-xs uppercase tracking-wider">Formule {plan === "equipe" ? "Équipe" : plan === "solo" ? "Solo" : "Gratuit"}</span>
      </div>
      <nav className="mt-6 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <span className="self-center pr-1 text-xs uppercase tracking-wider text-muted-foreground">Ma signature</span>
          <Link to="/compte" activeOptions={{ exact: true }} className={tab} activeProps={active}><PenLine className="h-4 w-4" />Signatures</Link>
          <Link to="/compte/profil" className={tab} activeProps={active}><BadgeCheck className="h-4 w-4" />Carte & badge {lock(paid)}</Link>
          <Link to="/compte/vitrine" className={tab} activeProps={active}><FileText className="h-4 w-4" />Plaquette & avis {lock(paid)}</Link>
          <Link to="/compte/visio" className={tab} activeProps={active}><MonitorPlay className="h-4 w-4" />Fond visio {lock(paid)}</Link>
          <Link to="/compte/statut" className={tab} activeProps={active}><Radio className="h-4 w-4" />Statut {lock(paid)}</Link>
 <Link to="/compte/absence" className={tab} activeProps={active}><Plane className="h-4 w-4" />Absence {lock(paid)}</Link>
          <Link to="/compte/entete" className={tab} activeProps={active}><FileSignature className="h-4 w-4" />En-tête {lock(paid)}</Link>
          <Link to="/compte/rendez-vous" className={tab} activeProps={active}><CalendarCheck className="h-4 w-4" />Rendez-vous {lock(paid)}</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <span className="self-center pr-1 text-xs uppercase tracking-wider text-muted-foreground">Entreprise</span>
          <Link to="/compte/equipe" className={tab} activeProps={active}><Users className="h-4 w-4" />Équipe</Link>
          <Link to="/compte/bannieres" className={tab} activeProps={active}><Megaphone className="h-4 w-4" />Smart Bannières {lock(isTeamPlan)}</Link>
          <Link to="/compte/abonnement" className={tab} activeProps={active}><CreditCard className="h-4 w-4" />Abonnement</Link>
        </div>
      </nav>
      <TabIntro />
      <div className="mt-8"><Outlet /></div>
    </section>
  );
}
