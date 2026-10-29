import { Link } from "@tanstack/react-router";
import { Logo } from "./Header";

const FLAGS = ["🇫🇷", "🇧🇪", "🇨🇭", "🇱🇺", "🇨🇦", "🇲🇺", "🇪🇸", "🇩🇪", "🇬🇧"];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Des signatures e-mail élégantes et vivantes. La petite sœur de mails.contact.
          </p>
          <div className="mt-5 flex gap-2 text-2xl" aria-label="Pays servis">
            {FLAGS.map((f) => <span key={f}>{f}</span>)}
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Produit</p>
          <Link to="/editeur" className="block text-muted-foreground hover:text-foreground">Éditeur</Link>
          <Link to="/tarifs" className="block text-muted-foreground hover:text-foreground">Tarifs</Link>
          <Link to="/tableau-de-bord" className="block text-muted-foreground hover:text-foreground">Tableau de bord</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Légal</p>
          <Link to="/mentions-legales" className="block text-muted-foreground hover:text-foreground">Mentions légales</Link>
          <Link to="/confidentialite" className="block text-muted-foreground hover:text-foreground">Confidentialité</Link>
          <Link to="/cgu" className="block text-muted-foreground hover:text-foreground">Conditions d'utilisation</Link>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Signature.Contact by Gem's — Fait avec soin en France.
      </div>
    </footer>
  );
}
