import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { Save, Lock, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { usePlan } from "@/hooks/use-plan";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Copy, Code2 } from "lucide-react";
import { SignaturePreview } from "@/components/site/SignaturePreview";
import { ECO_PRESETS, defaultSignature, LOGO_MIN, LOGO_MAX, clampLogoSize, cropRect, ZOOM_MAX, renderSignature, renderReplySignature, templates, type SignatureData, type TemplateId } from "@/lib/signature";

export const Route = createFileRoute("/editeur")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => (typeof s['id'] === "string" ? { id: s['id'] } : {}),
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

type Guide = { steps: string[]; tip?: string };
const guides: Record<string, Guide> = {
  Gmail: { steps: [
    "Cliquez sur « Copier la signature » ci-dessus.",
    "Dans Gmail, ouvrez ⚙️ Paramètres → Voir tous les paramètres.",
    "Onglet « Général », section « Signature » : cliquez sur « Créer ».",
    "Collez (Ctrl/Cmd + V) dans la zone de texte.",
    "En bas de la page, cliquez sur « Enregistrer les modifications ».",
  ], tip: "Choisissez aussi votre version « réponse courte » dans « Pour les réponses/transferts »." },
  "Outlook Web": { steps: [
    "Cliquez sur « Copier la signature ».",
    "Sur outlook.com ou Microsoft 365 : ⚙️ Paramètres → Comptes → Signatures.",
    "Cliquez sur « + Nouvelle signature » et nommez-la.",
    "Collez avec Ctrl/Cmd + V, puis choisissez-la par défaut pour les nouveaux messages.",
    "Cliquez sur « Enregistrer ».",
  ] },
  "Outlook PC": { steps: [
    "Cliquez sur « Copier la signature ».",
    "Dans Outlook : Fichier → Options → Courrier → Signatures…",
    "Cliquez sur « Nouveau » et nommez la signature.",
    "Collez avec Ctrl + V dans la zone de modification.",
    "Choisissez-la pour les nouveaux messages et les réponses, puis « OK ».",
  ], tip: "Nouvel Outlook pour Windows : suivez plutôt le guide « Outlook Web »." },
  "Outlook Mac": { steps: [
    "Cliquez sur « Copier la signature ».",
    "Dans Outlook : menu Outlook → Réglages → Signatures.",
    "Cliquez sur « + » et nommez la signature.",
    "Collez avec Cmd + V, puis fermez la fenêtre pour enregistrer.",
    "Dans « Signature par défaut », choisissez-la pour votre compte.",
  ] },
  "Apple Mail Mac": { steps: [
    "Cliquez sur « Copier la signature » (avec Safari de préférence).",
    "Dans Mail, ouvrez Mail → Réglages → Signatures.",
    "Cliquez sur « + » et décochez « Toujours utiliser ma police par défaut ».",
    "Collez avec Cmd + V dans la zone de droite.",
    "Fermez la fenêtre : la signature est enregistrée.",
  ], tip: "Si la mise en page se déforme, collez avec Cmd + V (et non « Coller et adapter le style »)." },
  "iPhone / iPad": { steps: [
    "Ouvrez cette page sur votre iPhone et touchez « Copier la signature ».",
    "Allez dans Réglages → Apps → Mail → Signature.",
    "Effacez le texte existant et collez votre signature.",
    "Si la mise en forme disparaît, secouez l'iPhone et touchez « Annuler » : la version d'origine revient.",
    "Revenez en arrière : c'est enregistré.",
  ] },
  Thunderbird: { steps: [
    "Cliquez sur « Code HTML » puis « Copier le code ».",
    "Dans Thunderbird : ☰ → Paramètres des comptes → votre adresse.",
    "Cochez « Utiliser HTML » à côté de « Texte de signature ».",
    "Collez le code dans la zone de texte.",
    "Fermez l'onglet : la signature est enregistrée.",
  ] },
};

/** Devine la messagerie la plus probable selon l'appareil du visiteur. */
function detectGuide(ua: string): string {
  if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone / iPad";
  if (/Macintosh/i.test(ua)) return /Safari/i.test(ua) && !/Chrome/i.test(ua) ? "Apple Mail Mac" : "Gmail";
  if (/Windows/i.test(ua)) return "Outlook PC";
  return "Gmail";
}

const STORAGE = "signature-editor-v1";

function Editor() {
  const [d, setD] = useState<SignatureData>(defaultSignature);
  const [tpl, setTpl] = useState<TemplateId>("classique");
  const [guide, setGuide] = useState("Gmail");
  const [showCode, setShowCode] = useState(false);
  const [darkPreview, setDarkPreview] = useState(false);
  useEffect(() => { setGuide(detectGuide(navigator.userAgent)); }, []);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE) || "null");
      if (s) { setD({ ...defaultSignature, ...s.d }); setTpl(s.tpl); }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify({ d, tpl })); }, [d, tpl]);

  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sigId, setSigId] = useState<string | undefined>(id);
  const [sigName, setSigName] = useState("Ma signature");
  const { paid } = usePlan();
  const [variant, setVariant] = useState<"full" | "reply">("full");
  const [mySlug, setMySlug] = useState<string | null>(null);
  useEffect(() => {
    if (!user || !paid) { setMySlug(null); return; }
    supabase.from("member_profiles").select("slug,document_url").eq("user_id", user.id).maybeSingle().then(({ data }) => setMySlug(data?.document_url ? data.slug : null));
  }, [user, paid]);
  const [team, setTeam] = useState<{ owner_id: string; lock_logo: boolean; lock_colors: boolean; base_data: Record<string, string>; is_admin: boolean } | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    supabase.from("signatures").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setD({ ...defaultSignature, ...(data.data as Partial<SignatureData>) });
      setTpl(data.template as TemplateId);
      setSigName(data.name);
      setSigId(data.id);
    });
  }, [id, user]);

  // Modèle d'équipe : logo et couleurs imposés aux membres quand l'admin les verrouille.
  useEffect(() => {
    if (!user) { setTeam(null); return; }
    (async () => {
      const { data: t } = await supabase.from("teams").select("*").limit(1).maybeSingle();
      if (!t) { setTeam(null); return; }
      const { data: m } = await supabase.from("team_members").select("role").eq("team_id", t.id).eq("user_id", user.id).maybeSingle();
      setTeam({ owner_id: t.owner_id, lock_logo: t.lock_logo, lock_colors: t.lock_colors, base_data: (t.base_data ?? {}) as Record<string, string>, is_admin: t.owner_id === user.id || m?.role === "admin" });
    })();
  }, [user]);
  const logoLocked = !!team && !team.is_admin && team.lock_logo;
  const colorLocked = !!team && !team.is_admin && team.lock_colors;
  const view: SignatureData = {
    ...d,
    ...(paid ? {} : { docOn: false, reviewOn: false, darkSafe: false, ecoOn: false }),
    ...(logoLocked ? { logoUrl: team!.base_data['logoUrl'] ?? "", logoSrc: "" } : {}),
    ...(colorLocked && team!.base_data['accent'] ? { accent: team!.base_data['accent'] } : {}),
  };

  const saveSig = async () => {
    if (!user) { navigate({ to: "/connexion", search: { redirect: "/editeur" } }); return; }
    const payload = { name: sigName || "Ma signature", template: tpl, data: view as unknown as Json, updated_at: new Date().toISOString() };
    if (sigId) {
      const { error } = await supabase.from("signatures").update(payload).eq("id", sigId);
      if (error) { toast.error(error.message); return; }
    } else {
      const { data, error } = await supabase.from("signatures").insert({ ...payload, user_id: user.id }).select("id").single();
      if (error) { toast.error(error.message); return; }
      setSigId(data.id);
    }
    toast.success("Signature enregistrée dans votre espace");
  };

  const set = <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => setD((p) => ({ ...p, [k]: v }));
  const html = variant === "reply" && paid ? renderReplySignature(view) : renderSignature(tpl, view);

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
    r.onload = () => setD((p) => ({ ...p, logoSrc: String(r.result), logoZoom: 1, logoX: 50, logoY: 50 }));
    r.readAsDataURL(f);
  };

  // Recadrage : on redessine la partie visible dans une nouvelle image, compatible avec toutes les messageries.
  // Pour un logo par adresse web, le site hébergeur doit autoriser la lecture de l'image ; sinon on garde l'image d'origine.
  const [cropBlocked, setCropBlocked] = useState(false);
  useEffect(() => {
    if (!d.logoSrc) return;
    const remote = /^https?:/i.test(d.logoSrc);
    const img = new Image();
    if (remote) img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const square = d.logoShape !== "arrondi";
        const c = cropRect(img.naturalWidth, img.naturalHeight, d.logoZoom, d.logoX, d.logoY, square);
        const scale = Math.min(1, 480 / Math.max(c.sw, c.sh));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(c.sw * scale));
        canvas.height = Math.max(1, Math.round(c.sh * scale));
        canvas.getContext("2d")?.drawImage(img, c.sx, c.sy, c.sw, c.sh, 0, 0, canvas.width, canvas.height);
        const out = canvas.toDataURL("image/png");
        setCropBlocked(false);
        setD((p) => (p.logoUrl === out ? p : { ...p, logoUrl: out }));
      } catch {
        setCropBlocked(true);
        setD((p) => (p.logoUrl === d.logoSrc ? p : { ...p, logoUrl: d.logoSrc }));
      }
    };
    img.onerror = () => {
      if (!remote) return;
      setCropBlocked(true);
      setD((p) => (p.logoUrl === d.logoSrc ? p : { ...p, logoUrl: d.logoSrc }));
    };
    img.src = d.logoSrc;
  }, [d.logoSrc, d.logoZoom, d.logoX, d.logoY, d.logoShape]);
  const isRemote = /^https?:/i.test(d.logoSrc);

  const text = (k: keyof SignatureData, label: string, ph = "") => (
    <label className="block text-sm">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      <input value={String(d[k])} placeholder={ph} onChange={(e) => set(k, e.target.value as never)}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
    </label>
  );
  const toggle = (k: "bannerOn" | "bookingOn" | "qrOn" | "branding" | "docOn" | "reviewOn" | "darkSafe" | "ecoOn", label: string) => (
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
            {!logoLocked && (<>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">URL du logo (hébergé)</span>
              <input value={isRemote ? d.logoSrc : d.logoSrc ? "" : d.logoUrl} placeholder={d.logoSrc ? "Fichier importé" : "https://…/logo.png"}
                onChange={(e) => { const v = e.target.value.trim(); setD((p) => ({ ...p, logoSrc: v, logoUrl: v ? p.logoUrl : "", logoZoom: 1, logoX: 50, logoY: 50 })); }}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label className="block text-sm text-muted-foreground">
              ou importer un fichier
              <input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} className="mt-1 block text-sm" />
            </label>
            </>)}
            {d.logoUrl && !logoLocked && (
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
                  <button type="button" onClick={() => setD((p) => ({ ...p, logoSize: 72, logoShape: "arrondi", logoZoom: 1, logoX: 50, logoY: 50 }))} className="ml-auto text-xs text-muted-foreground underline">Réinitialiser</button>
                </div>
                {d.logoSrc && !cropBlocked ? (
                  <div className="grid gap-2 border-t border-border pt-3">
                    <p className="text-sm font-medium">Recadrage</p>
                    {([["logoZoom","Zoom",1,ZOOM_MAX,0.05,`${d.logoZoom.toFixed(1)}×`],["logoX","Position horizontale",0,100,1,`${d.logoX} %`],["logoY","Position verticale",0,100,1,`${d.logoY} %`]] as const).map(([k,l,min,max,step,v]) => (
                      <label key={k} className="block text-sm">
                        <span className="flex justify-between text-muted-foreground">{l} <span>{v}</span></span>
                        <input type="range" min={min} max={max} step={step} value={d[k]} onChange={(e) => set(k, Number(e.target.value))} className="mt-1 w-full accent-primary" />
                      </label>
                    ))}
                    <p className="text-xs text-muted-foreground">Zoomez puis déplacez pour choisir la partie visible du logo.</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Le site qui héberge ce logo empêche de le recadrer. Téléchargez l'image puis importez-la comme fichier pour la recadrer.</p>
                )}
              </div>
            )}
            {!colorLocked && (
            <label className="flex items-center gap-3 text-sm">
              Couleur principale
              <input type="color" value={d.accent} onChange={(e) => set("accent", e.target.value)} className="h-8 w-12 rounded" />
            </label>
            )}
          </Card>
          <Card title="Options">
            {toggle("bannerOn", "Signature vivante (bannière)")}
            {d.bannerOn && <div className="grid gap-3">{text("bannerText", "Texte de la bannière")}{text("bannerImage", "Image de bannière (URL, optionnel)")}{text("bannerLink", "Lien de la bannière")}</div>}
            {toggle("bookingOn", "Bouton « Prendre rendez-vous »")}
            {d.bookingOn && <div className="grid gap-3 sm:grid-cols-2">{text("bookingLabel", "Libellé")}{text("bookingUrl", "Lien de réservation")}</div>}
            {toggle("qrOn", "QR code carte de visite")}
            {toggle("branding", "Mention « signature.contact » (gratuit)")}
          </Card>
          <Card title="Atouts Solo & Équipe">
            {!paid && (
              <p className="flex items-start gap-2 rounded-xl bg-gold/10 p-3 text-sm"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>Plaquette, avis clients, réponse courte, mode sombre garanti et mention RSE sont inclus dans Solo et Équipe. <Link to="/tarifs" className="text-gold underline">Voir les formules</Link></span></p>
            )}
            <fieldset disabled={!paid} className="space-y-4 disabled:opacity-60">
              {toggle("docOn", "Bouton « Plaquette / document » (sans pièce jointe)")}
              {d.docOn && (
                <div className="grid gap-3">
                  {text("docLabel", "Texte du bouton")}
                  {text("docUrl", "Lien du document", "https://…")}
                  {mySlug ? (
                    <button type="button" onClick={() => set("docUrl", `${window.location.origin}/api/public/document/${mySlug}`)} className="justify-self-start text-sm text-gold underline">Utiliser le document de mon espace (lien fixe, modifiable à tout moment)</button>
                  ) : paid && <Link to="/compte/vitrine" className="justify-self-start text-sm text-gold underline">Importer ma plaquette dans mon espace</Link>}
                </div>
              )}
              {toggle("reviewOn", "Note & avis clients")}
              {d.reviewOn && <div className="grid gap-3 sm:grid-cols-2">{text("reviewText", "Texte affiché")}{text("reviewUrl", "Lien vers vos avis", "https://g.page/…")}</div>}
              {toggle("darkSafe", "Mode sombre garanti")}
              <p className="-mt-2 text-xs text-muted-foreground">Un fond clair discret protège votre logo et vos textes chez les destinataires en mode sombre. Testez avec « Fond sombre » au-dessus de l'aperçu.</p>
              {toggle("ecoOn", "Mention éco-responsable / RSE")}
              {d.ecoOn && (
                <div className="grid gap-2">
                  <div className="flex flex-wrap gap-2">
                    {ECO_PRESETS.map((p) => (
                      <button key={p} type="button" onClick={() => set("ecoText", p)} className={`rounded-full border px-3 py-1 text-left text-xs ${d.ecoText === p ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{p}</button>
                    ))}
                  </div>
                  <label className="block text-sm">
                    <span className="mb-1 block text-muted-foreground">Ou votre propre engagement (140 caractères max)</span>
                    <input value={d.ecoText} maxLength={140} onChange={(e) => set("ecoText", e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
                  </label>
                </div>
              )}
            </fieldset>
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
          <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm" role="tablist" aria-label="Version de la signature">
            <button role="tab" aria-selected={variant === "full"} onClick={() => setVariant("full")} className={`rounded-full px-4 py-1.5 ${variant === "full" ? "bg-primary text-primary-foreground" : ""}`}>Nouveaux e-mails</button>
            <button role="tab" aria-selected={variant === "reply"} onClick={() => paid ? setVariant("reply") : toast("La version « réponse courte » est incluse dans Solo et Équipe.")} className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 ${variant === "reply" ? "bg-primary text-primary-foreground" : ""}`}>Réponses courtes {!paid && <Lock className="h-3 w-3" />}</button>
          </div>
          {variant === "reply" && paid && <p className="text-xs text-muted-foreground">Copiez cette version et choisissez-la dans votre messagerie pour les « réponses et transferts » : vos fils de discussion restent légers.</p>}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Aperçu :</span>
            <div className="inline-flex rounded-full border border-border bg-card p-1" role="tablist" aria-label="Fond de l'aperçu">
              <button role="tab" aria-selected={!darkPreview} onClick={() => setDarkPreview(false)} className={`rounded-full px-3 py-1 ${!darkPreview ? "bg-primary text-primary-foreground" : ""}`}>☀️ Fond clair</button>
              <button role="tab" aria-selected={darkPreview} onClick={() => setDarkPreview(true)} className={`rounded-full px-3 py-1 ${darkPreview ? "bg-primary text-primary-foreground" : ""}`}>🌙 Fond sombre</button>
            </div>
          </div>
          <SignaturePreview template={tpl} data={view} html={html} dark={darkPreview} />
          {(logoLocked || colorLocked) && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5 text-gold" /> {logoLocked && colorLocked ? "Le logo et les couleurs" : logoLocked ? "Le logo" : "Les couleurs"} sont imposés par votre équipe.</p>
          )}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
            <input value={sigName} onChange={(e) => setSigName(e.target.value)} aria-label="Nom de la signature" className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
            <button onClick={saveSig} className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground"><Save className="h-4 w-4" /> {user ? "Enregistrer" : "Se connecter pour enregistrer"}</button>
          </div>
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
            <p className="text-sm text-muted-foreground">Nous avons présélectionné la messagerie la plus probable sur votre appareil. Choisissez la vôtre :</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(guides).map((g) => (
                <button key={g} onClick={() => setGuide(g)} className={`rounded-full px-3 py-1 text-sm ${guide === g ? "bg-gold text-gold-foreground" : "border border-border"}`}>{g}</button>
              ))}
            </div>
            <ol className="space-y-2 text-sm">
              {(guides[guide]?.steps ?? []).map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
            {guides[guide]?.tip && <p className="rounded-xl bg-gold/10 p-3 text-sm">💡 {guides[guide]?.tip}</p>}
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
