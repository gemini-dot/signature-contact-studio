import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Copy, Code2 } from "lucide-react";
import { SignaturePreview } from "@/components/site/SignaturePreview";
import { defaultSignature, LOGO_MIN, LOGO_MAX, clampLogoSize, renderSignature, templates, type SignatureData, type TemplateId } from "@/lib/signature";

export const Route = createFileRoute("/editeur")({
  head: () => ({
    meta: [
      { title: "Éditeur de signature — Signature.Contact" },
      { name: "description", content: "Créez votre signature e-mail avec aperçu en temps réel et installez-la dans Gmail, Outlook ou Apple Mail." },
      { property: "og:title", content: "Éditeur de signature — Signature.Contact" },
      { property: "og:description", content: "5 modèles, aperçu en direct, export HTML." },
    ],
  }),
  component: Editor,
});

const guides: Record<string, string[]> = {
  Gmail: [
    "Cliquez sur « Copier la signature » ci-dessus.",
    "Dans Gmail, ouvrez ⚙️ Paramètres → Voir tous les paramètres.",
    "Onglet « Général », section « Signature » : cliquez sur « Créer ».",
    "Collez (Ctrl/Cmd + V) dans la zone de texte.",
    "Descendez en bas de la page et cliquez sur « Enregistrer les modifications ».",
  ],
  Outlook: [
    "Cliquez sur « Copier la signature ».",
    "Dans Outlook, allez dans Paramètres → Comptes → Signatures.",
    "Cliquez sur « Nouvelle signature » et donnez-lui un nom.",
    "Collez dans l'éditeur puis choisissez-la par défaut pour les nouveaux messages.",
    "Enregistrez.",
  ],
  "Apple Mail": [
    "Cliquez sur « Copier la signature » (avec Safari de préférence).",
    "Dans Mail, ouvrez Réglages → Signatures.",
    "Cliquez sur « + » et décochez « Toujours utiliser ma police par défaut ».",
    "Collez dans la zone de droite.",
    "Fermez la fenêtre : la signature est enregistrée.",
  ],
};

const STORAGE = "signature-editor-v1";

function Editor() {
  const [d, setD] = useState<SignatureData>(defaultSignature);
  const [tpl, setTpl] = useState<TemplateId>("classique");
  const [guide, setGuide] = useState("Gmail");
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE) || "null");
      if (s) { setD({ ...defaultSignature, ...s.d }); setTpl(s.tpl); }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify({ d, tpl })); }, [d, tpl]);

  const set = <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => setD((p) => ({ ...p, [k]: v }));
  const html = renderSignature(tpl, d);

  const copyRich = async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([d.name], { type: "text/plain" }),
      })]);
      toast.success("Signature copiée — collez-la dans votre messagerie");
    } catch {
      toast.error("Copie impossible, utilisez le code HTML");
    }
  };
  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    toast.success("Code HTML copié");
  };
  const onLogo = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => set("logoUrl", String(r.result));
    r.readAsDataURL(f);
  };

  const text = (k: keyof SignatureData, label: string, ph = "") => (
    <label className="block text-sm">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      <input value={String(d[k])} placeholder={ph} onChange={(e) => set(k, e.target.value as never)}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
    </label>
  );
  const toggle = (k: "bannerOn" | "bookingOn" | "qrOn" | "branding", label: string) => (
    <label className="flex items-center justify-between text-sm font-medium">
      {label}
      <input type="checkbox" checked={d[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-[var(--gold)]" />
    </label>
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-4xl font-medium md:text-5xl">Composez votre <em className="text-gold">signature</em>.</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-5">
          <Card title="Identité">
            <div className="grid gap-3 sm:grid-cols-2">
              {text("name", "Nom complet")}
              {text("title", "Titre / poste")}
              {text("company", "Entreprise")}
              {text("phone", "Téléphone")}
              {text("email", "E-mail")}
              {text("website", "Site web")}
            </div>
            {text("address", "Adresse")}
          </Card>
          <Card title="Réseaux & logo">
            <div className="grid gap-3 sm:grid-cols-3">
              {text("linkedin", "LinkedIn")}
              {text("instagram", "Instagram")}
              {text("x", "X")}
            </div>
            {text("logoUrl", "URL du logo (hébergé)", "https://…/logo.png")}
            <label className="block text-sm text-muted-foreground">
              ou importer un fichier (aperçu uniquement)
              <input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} className="mt-1 block text-sm" />
            </label>
            {d.logoUrl && (
              <div className="grid gap-3 rounded-xl border border-border p-3">
                <label className="block text-sm">
                  <span className="flex justify-between text-muted-foreground">Taille du logo <span>{d.logoSize} px</span></span>
                  <input type="range" min={LOGO_MIN} max={LOGO_MAX} value={d.logoSize} onChange={(e) => set("logoSize", clampLogoSize(Number(e.target.value)))} className="mt-1 w-full accent-primary" />
                </label>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Forme :</span>
                  {([["arrondi","Arrondi"],["carre","Carré"],["cercle","Cercle (photo)"]] as const).map(([v,l]) => (
                    <button key={v} type="button" onClick={() => set("logoShape", v)} className={`rounded-full border px-3 py-1 ${d.logoShape === v ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{l}</button>
                  ))}
                  <button type="button" onClick={() => { set("logoSize", 72); set("logoShape", "arrondi"); }} className="ml-auto text-xs text-muted-foreground underline">Réinitialiser</button>
                </div>
              </div>
            )}
            <label className="flex items-center gap-3 text-sm">
              Couleur principale
              <input type="color" value={d.accent} onChange={(e) => set("accent", e.target.value)} className="h-8 w-12 rounded" />
            </label>
          </Card>
          <Card title="Options">
            {toggle("bannerOn", "Signature vivante (bannière)")}
            {d.bannerOn && <div className="grid gap-3">{text("bannerText", "Texte de la bannière")}{text("bannerImage", "Image de bannière (URL, optionnel)")}{text("bannerLink", "Lien de la bannière")}</div>}
            {toggle("bookingOn", "Bouton « Prendre rendez-vous »")}
            {d.bookingOn && <div className="grid gap-3 sm:grid-cols-2">{text("bookingLabel", "Libellé")}{text("bookingUrl", "Lien de réservation")}</div>}
            {toggle("qrOn", "QR code carte de visite")}
            {toggle("branding", "Mention « signature.contact » (gratuit)")}
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button key={t.id} onClick={() => setTpl(t.id)}
                className={`rounded-full px-4 py-1.5 text-sm ${tpl === t.id ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-accent"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <SignaturePreview template={tpl} data={d} />
          <div className="flex flex-wrap gap-3">
            <button onClick={copyRich} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:bg-primary/90">
              <Copy className="h-4 w-4" /> Copier la signature
            </button>
            <button onClick={() => setShowCode((s) => !s)} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-medium hover:bg-accent">
              <Code2 className="h-4 w-4" /> Code HTML
            </button>
          </div>
          {showCode && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <textarea readOnly value={html} className="h-40 w-full resize-none rounded-lg bg-muted p-3 font-mono text-xs" />
              <button onClick={copyHtml} className="mt-2 text-sm text-gold underline">Copier le code</button>
            </div>
          )}
          <Card title="Installation guidée">
            <div className="flex gap-2">
              {Object.keys(guides).map((g) => (
                <button key={g} onClick={() => setGuide(g)} className={`rounded-full px-3 py-1 text-sm ${guide === g ? "bg-gold text-gold-foreground" : "border border-border"}`}>{g}</button>
              ))}
            </div>
            <ol className="space-y-2 text-sm">
              {(guides[guide] ?? []).map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <h2 className="text-xl">{title}</h2>
      {children}
    </div>
  );
}
