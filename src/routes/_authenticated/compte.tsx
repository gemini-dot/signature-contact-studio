import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/compte")({
  head: () => ({
    meta: [
      { title: "Mon espace — Signature.Contact" },
      { name: "description", content: "Vos signatures, votre abonnement et votre équipe." },
      { property: "og:title", content: "Mon espace — Signature.Contact" },
      { property: "og:description", content: "Espace personnel Signature.Contact." },
    ],
  }),
  component: Layout,
});

function Layout() {
  const tab = "rounded-full px-4 py-1.5 text-sm border border-border";
  const active = { className: "bg-primary text-primary-foreground border-primary" };
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-medium">Mon <em className="text-gold">espace</em></h1>
      <nav className="mt-6 flex flex-wrap gap-2">
        <Link to="/compte" activeOptions={{ exact: true }} className={tab} activeProps={active}>Mes signatures</Link>
        <Link to="/compte/abonnement" className={tab} activeProps={active}>Abonnement</Link>
        <Link to="/compte/equipe" className={tab} activeProps={active}>Équipe</Link>
      </nav>
      <div className="mt-8"><Outlet /></div>
    </section>
  );
}
