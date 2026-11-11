import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, MonitorPlay } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import { LockedFeature } from "@/components/site/LockedFeature";

export const Route = createFileRoute("/_authenticated/compte/visio")({ component: VisioPage });

const THEMES = {
  nuit: { label: "Bleu nuit", bg: ["#0f1d3a", "#1e3a6e"], text: "#ffffff", sub: "#c9a45c", panel: "rgba(255,255,255,0.08)" },
  ivoire: { label: "Ivoire", bg: ["#f7f2e8", "#ece3d0"], text: "#14213d", sub: "#9b7a35", panel: "rgba(20,33,61,0.06)" },
  graphite: { label: "Graphite", bg: ["#1b1b1f", "#34343b"], text: "#f5f5f5", sub: "#c9a45c", panel: "rgba(255,255,255,0.07)" },
} as const;
type ThemeKey = keyof typeof THEMES;

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((res) => {
    if (!src) return res(null);
    const i = new Image(); i.crossOrigin = "anonymous";
    i.onload = () => res(i); i.onerror = () => res(null); i.src = src;
  });
}

function VisioPage() {
  const { user } = useAuth();
  const { paid, loading } = usePlan();
  const q = useQuery({
    queryKey: ["my-profile", user?.id], enabled: !!user && paid,
    queryFn: async () => (await supabase.from("member_profiles").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });
  const canvas = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<ThemeKey>("nuit");
  const [side, setSide] = useState<"droite" | "gauche">("droite");
  const [showPhoto, setShowPhoto] = useState(false);
  const [tagline, setTagline] = useState("Scannez pour enregistrer mon contact");
  const p = q.data;

  useEffect(() => {
    if (!p || !canvas.current) return;
    let cancel = false;
    (async () => {
      const c = canvas.current!; const ctx = c.getContext("2d")!;
      const W = 1920, H = 1080, t = THEMES[theme];
      c.width = W; c.height = H;
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, t.bg[0]); g.addColorStop(1, t.bg[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // Liseré or discret
      ctx.strokeStyle = t.sub; ctx.globalAlpha = 0.35; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(side === "droite" ? 0 : W, H, 620, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      const url = `${window.location.origin}/p/${p.slug}`;
      const qr = await loadImage(await QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: "#14213d", light: "#ffffff" } }));
      const photo = showPhoto ? await loadImage(p.photo_url) : null;
      if (cancel) return;
      const pw = 560, x = side === "droite" ? W - pw - 90 : 90, y = 110;
      ctx.fillStyle = t.panel; roundRect(ctx, x, y, pw, 860, 36); ctx.fill();
      let cy = y + 70;
      if (photo) {
        ctx.save(); ctx.beginPath(); ctx.arc(x + 80, cy + 30, 50, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(photo, x + 30, cy - 20, 100, 100); ctx.restore(); cy += 120;
      }
      ctx.fillStyle = t.text; ctx.font = "500 54px Fraunces, Georgia, serif"; ctx.textBaseline = "top";
      const nameLines = wrapText(ctx, p.full_name || "Votre nom", pw - 80);
      nameLines.forEach((l, i) => ctx.fillText(l, x + 40, cy + i * 62));
      cy += nameLines.length * 62 + 18;
      ctx.fillStyle = t.sub; ctx.font = "italic 32px Fraunces, Georgia, serif";
      if (p.job_title) { ctx.fillText(p.job_title.slice(0, 40), x + 40, cy); cy += 46; }
      ctx.fillStyle = t.text; ctx.font = "600 30px Manrope, Arial, sans-serif";
      if (p.company) { ctx.fillText(p.company.slice(0, 40), x + 40, cy); cy += 44; }
      ctx.font = "26px Manrope, Arial, sans-serif"; ctx.globalAlpha = 0.85;
      if (p.website) { ctx.fillText(p.website.replace(/^https?:\/\//, "").slice(0, 40), x + 40, cy); cy += 38; }
      ctx.globalAlpha = 1;
      const qs = 260, qx = x + 40, qy = y + 860 - qs - 110;
      ctx.fillStyle = "#ffffff"; roundRect(ctx, qx - 14, qy - 14, qs + 28, qs + 28, 20); ctx.fill();
      if (qr) ctx.drawImage(qr, qx, qy, qs, qs);
      ctx.fillStyle = t.text; ctx.font = "24px Manrope, Arial, sans-serif";
      ctx.fillText(tagline.slice(0, 44), qx, qy + qs + 34);
    })();
    return () => { cancel = true; };
  }, [p, theme, side, showPhoto, tagline]);

  if (loading) return null;
  if (!paid) return <LockedFeature title="Fond de visio personnalisé" plan="Solo" benefits={["Votre nom, poste et entreprise en HD derrière vous", "Un QR code scannable pendant toute la réunion", "Compatible Zoom, Teams et Google Meet"]} />;
  if (q.isFetched && !p) return <div className="rounded-2xl border border-border bg-card p-6 text-sm">Créez d'abord votre <Link to="/compte/profil" className="text-gold underline">carte de visite</Link> : votre fond de visio la reprend automatiquement.</div>;

  const download = () => {
    canvas.current?.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `fond-visio-${p?.slug}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      window.__lovableEvents?.track?.("project.visio_background_downloaded", { theme, with_photo: showPhoto });
    }, "image/png");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <MonitorPlay className="h-6 w-6 text-gold" />
        <h2 className="font-serif text-2xl">Fond de <em className="text-gold">visio</em></h2>
        <p className="text-sm text-muted-foreground">Pendant vos réunions, vos interlocuteurs scannent l'écran et enregistrent votre contact.</p>
        <div><p className="mb-2 text-sm font-medium">Ambiance</p><div className="flex flex-wrap gap-2">
          {(Object.keys(THEMES) as ThemeKey[]).map((k) => <button key={k} onClick={() => setTheme(k)} className={`rounded-full border px-3 py-1 text-sm ${theme === k ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{THEMES[k].label}</button>)}
        </div></div>
        <div><p className="mb-2 text-sm font-medium">Position du bloc</p><div className="flex gap-2">
          {(["gauche", "droite"] as const).map((s) => <button key={s} onClick={() => setSide(s)} className={`rounded-full border px-3 py-1 text-sm capitalize ${side === s ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{s}</button>)}
        </div></div>
        {p?.photo_url && <label className="flex items-center justify-between text-sm">Afficher ma photo<input type="checkbox" checked={showPhoto} onChange={(e) => setShowPhoto(e.target.checked)} className="h-4 w-4 accent-[var(--gold)]" /></label>}
        <label className="grid gap-1 text-sm">Phrase sous le QR code<input maxLength={44} value={tagline} onChange={(e) => setTagline(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" /></label>
        <button onClick={download} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground"><Download className="h-4 w-4" />Télécharger (1920×1080)</button>
        <details className="text-sm text-muted-foreground"><summary className="cursor-pointer font-medium text-foreground">Comment l'installer ?</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5"><li><b>Zoom</b> : Paramètres → Arrière-plan et effets → « + ».</li><li><b>Teams</b> : Effets d'arrière-plan → Ajouter nouveau.</li><li><b>Google Meet</b> : ⋮ → Appliquer des effets → Importer.</li></ul>
          <p className="mt-2">Vous voyez le texte à l'envers ? C'est seulement votre aperçu : vos interlocuteurs le lisent à l'endroit.</p>
        </details>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border shadow-elegant"><canvas ref={canvas} className="block h-auto w-full" aria-label="Aperçu du fond de visio" /></div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function wrapText(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(" "); const lines: string[] = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines.slice(0, 2);
}
