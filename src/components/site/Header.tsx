import { Link } from "@tanstack/react-router";
import { Moon, Sun, Globe, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

const LANGS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

export function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 ${className}`} aria-hidden>
      <rect x="2" y="2" width="44" height="44" rx="14" fill="var(--primary)" />
      <path d="M12 31c4-1 6-9 9-9s1 8 4 8 4-6 6-6 2 4 5 4" fill="none" stroke="var(--primary-foreground)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 36h24" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="37" cy="13" r="4.5" fill="var(--gold)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Signature.Contact by Gem's">
      <BrandMark />
      <span className="leading-none">
        <span className="block font-serif text-2xl font-semibold text-primary">
          Signature<span className="italic text-gold">.Contact</span>
        </span>
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">by Gem's</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("fr");
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/connexion", replace: true });
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    setLang(localStorage.getItem("lang") ?? "fr");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const nav = "text-sm text-muted-foreground hover:text-foreground transition-colors";
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          <Link to="/editeur" className={nav} activeProps={{ className: "text-foreground" }}>Éditeur</Link>
          <Link to="/tarifs" className={nav} activeProps={{ className: "text-foreground" }}>Tarifs</Link>
          {user ? (
            <Link to="/compte" className={nav} activeProps={{ className: "text-foreground" }}>Mon espace</Link>
          ) : (
            <Link to="/connexion" className={nav} activeProps={{ className: "text-foreground" }}>Connexion</Link>
          )}
          {isAdmin && <Link to="/admin" className={nav} activeProps={{ className: "text-foreground" }}>Admin</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs">
            <Globe className="h-3.5 w-3.5" />
            <select
              aria-label="Langue"
              value={lang}
              onChange={(e) => { setLang(e.target.value); localStorage.setItem("lang", e.target.value); }}
              className="bg-transparent outline-none"
            >
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>)}
            </select>
          </label>
          {user && (
            <button aria-label="Se déconnecter" title="Se déconnecter" onClick={signOut} className="rounded-full border border-border p-2 hover:bg-accent">
              <LogOut className="h-4 w-4" />
            </button>
          )}
          <button
            aria-label="Mode sombre"
            onClick={() => setDark((d) => !d)}
            className="rounded-full border border-border p-2 hover:bg-accent"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/editeur" className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:inline-flex">
            Créer ma signature
          </Link>
        </div>
      </div>
    </header>
  );
}
