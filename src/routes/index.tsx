import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, QrCode, Sparkles, Mail, ArrowRight } from "lucide-react";
import { SignaturePreview } from "@/components/site/SignaturePreview";
import { defaultSignature, templates, type TemplateId } from "@/lib/signature";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Signature.Contact — Votre signature, votre image" },
      { name: "description", content: "Signatures e-mail élégantes avec bannière vivante, bouton de rendez-vous et QR code. Compatible Gmail, Outlook et Apple Mail." },
      { property: "og:title", content: "Signature.Contact — Votre signature, votre image" },
      { property: "og:description", content: "Créez une signature e-mail vivante en quelques minutes." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Sparkles, title: "La signature vivante", text: "Une bannière hébergée que vous changez à tout moment : chaque e-mail déjà envoyé affiche votre dernière actualité." },
  { icon: CalendarCheck, title: "Prendre rendez-vous", text: "Un bouton élégant qui mène directement à votre agenda en ligne. Vos clients réservent en un clic." },
  { icon: QrCode, title: "Carte de visite & QR", text: "Un QR code qui enregistre vos coordonnées dans le téléphone de votre interlocuteur." },
  { icon: Mail, title: "Partout où vous écrivez", text: "Gmail, Outlook, Apple Mail : un code HTML robuste et une installation guidée pas à pas." },
];

function Index() {
  const [tpl, setTpl] = useState<TemplateId>("moderne");
  const [name, setName] = useState(defaultSignature.name);

  return (
    <>
      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              Par l'équipe de mails.contact
            </p>
            <h1 className="text-5xl leading-[1.05] font-medium tracking-tight md:text-6xl">
              Votre signature, <em className="text-gold">votre</em> image.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Des signatures e-mail raffinées et vivantes : bannière dynamique, bouton de rendez-vous, carte de visite. Prêtes en deux minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/editeur" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-elegant hover:bg-primary/90">
                Créer ma signature gratuite <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/tarifs" className="rounded-full border border-border bg-card px-6 py-3 font-medium hover:bg-accent">
                Voir les tarifs
              </Link>
            </div>
          </div>
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {templates.map((t) => (
                <button key={t.id} onClick={() => setTpl(t.id)}
                  className={`rounded-full px-3 py-1 text-xs transition ${tpl === t.id ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-accent"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Votre nom"
              className="mb-3 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tapez votre nom…" />
            <SignaturePreview template={tpl} data={{ ...defaultSignature, name }} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="max-w-2xl text-4xl font-medium">Bien plus qu'un <em className="text-gold">nom</em> en bas d'un e-mail.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-3xl border border-border bg-card p-7">
              <f.icon className="h-6 w-6 text-gold" />
              <h3 className="mt-4 text-2xl">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="rounded-3xl bg-primary px-8 py-12 text-primary-foreground md:px-14">
          <p className="text-sm uppercase tracking-[0.2em] text-gold">Compatible</p>
          <h2 className="mt-3 text-4xl font-medium">Gmail · Outlook · Apple Mail</h2>
          <p className="mt-4 max-w-xl opacity-80">Copiez, collez, c'est fait. Nos guides vous accompagnent à chaque étape, sur ordinateur comme sur mobile.</p>
          <Link to="/editeur" className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-medium text-gold-foreground hover:opacity-90">
            Commencer maintenant
          </Link>
        </div>
      </section>
    </>
  );
}
