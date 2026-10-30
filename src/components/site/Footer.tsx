import { Link } from "@tanstack/react-router";
import { Logo } from "./Header";

/** Même liste de pays que mails.contact. Seule la France est en ligne ; les autres arrivent avec les traductions. */
export const COUNTRIES = [
  { code: "fr", flag: "🇫🇷", name: "France", live: true },
  { code: "es", flag: "🇪🇸", name: "España", live: false },
  { code: "uk", flag: "🇬🇧", name: "United Kingdom", live: false },
  { code: "pt", flag: "🇵🇹", name: "Portugal", live: false },
  { code: "de", flag: "🇩🇪", name: "Deutschland", live: false },
  { code: "it", flag: "🇮🇹", name: "Italia", live: false },
  { code: "nl", flag: "🇳🇱", name: "Nederland", live: false },
];

export function Footer() {
  const link = "text-muted-foreground hover:text-foreground transition-colors";
  return (
    <footer className="mt-24 border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Logo />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/tarifs" className={link}>Tarifs</Link>
            <Link to="/mentions-legales" className={link}>Mentions légales</Link>
            <Link to="/confidentialite" className={link}>Confidentialité</Link>
            <Link to="/cgu" className={link}>Conditions d'utilisation</Link>
            <a href="mailto:service-client@signature.contact" className={link}>Nous contacter / Signaler un abus</a>
            <Link to="/admin" className={link}>Administration</Link>
          </div>
        </div>
        <nav aria-label="Pays" className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6 text-sm">
          {COUNTRIES.map((c) =>
            c.live ? (
              <Link key={c.code} to="/" hrefLang={c.code} className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-3 py-1.5">
                <span aria-hidden>{c.flag}</span>{c.name}
              </Link>
            ) : (
              <span key={c.code} title="Bientôt disponible" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                <span aria-hidden>{c.flag}</span>{c.name}
              </span>
            ),
          )}
        </nav>
        <p className="mt-6 text-xs text-muted-foreground">© {new Date().getFullYear()} Signature.Contact by Gem's — La petite sœur de mails.contact.</p>
      </div>
    </footer>
  );
}
