import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, FileText, Loader2, Star, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import { LockedFeature } from "@/components/site/LockedFeature";
import { ratingLine } from "@/lib/member";

export const Route = createFileRoute("/_authenticated/compte/vitrine")({ component: VitrinePage });

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const card = "rounded-2xl border border-border bg-card p-6";
const input = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";

function VitrinePage() {
  const { user } = useAuth();
  const { paid, loading } = usePlan();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["my-profile", user?.id], enabled: !!user && paid,
    queryFn: async () => (await supabase.from("member_profiles").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [docLabel, setDocLabel] = useState("Télécharger notre plaquette (PDF)");
  const [rating, setRating] = useState("");
  const [count, setCount] = useState("");
  const [source, setSource] = useState("Google");
  const [reviewsUrl, setReviewsUrl] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    const p = q.data; if (!p) return;
    setDocLabel(p.document_label || "Télécharger notre plaquette (PDF)");
    setRating(p.rating != null ? String(p.rating) : ""); setCount(p.rating_count != null ? String(p.rating_count) : "");
    setSource(p.rating_source || "Google"); setReviewsUrl(p.reviews_url); setTestimonial(p.testimonial); setAuthor(p.testimonial_author);
  }, [q.data]);

  if (loading) return null;
  if (!paid) return <LockedFeature title="Plaquette & avis clients" plan="Solo" benefits={["Votre plaquette en 1 clic, sans pièce jointe qui finit en spam", "Changez le fichier quand vous voulez : le lien de votre signature ne bouge pas", "Note et témoignage client affichés sous votre signature et sur votre carte"]} />;
  if (q.isFetched && !q.data) return <div className={card + " text-sm"}>Créez d'abord votre <Link to="/compte/profil" className="text-gold underline">carte de visite</Link> : votre plaquette et vos avis s'y rattachent.</div>;
  const p = q.data; if (!p) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fixedLink = `${origin}/api/public/document/${p.slug}`;
  const refresh = () => qc.invalidateQueries({ queryKey: ["my-profile"] });
  const update = async (patch: Record<string, unknown>, ok: string) => {
    const { error } = await supabase.from("member_profiles").update(patch).eq("user_id", user!.id);
    if (error) { toast.error(error.message.includes("policy") ? "Fonction réservée aux formules Solo et Équipe." : error.message); return false; }
    toast.success(ok); refresh(); return true;
  };

  const upload = async (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Seuls les fichiers PDF sont acceptés."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("PDF trop lourd (5 Mo maximum). Compressez-le avant de l'envoyer."); return; }
    setBusy(true);
    const path = `${user!.id}/documents/${crypto.randomUUID()}.pdf`;
    const up = await supabase.storage.from("member-media").upload(path, file, { contentType: "application/pdf" });
    if (up.error) { setBusy(false); toast.error(up.error.message.includes("policy") ? "Fonction réservée aux formules Solo et Équipe." : up.error.message); return; }
    const signed = await supabase.storage.from("member-media").createSignedUrl(path, TEN_YEARS);
    setBusy(false);
    if (signed.error || !signed.data) { toast.error("Impossible de publier le document."); return; }
    if (await update({ document_url: signed.data.signedUrl, document_label: docLabel.slice(0, 60) }, "Document publié")) window.__lovableEvents?.track?.("project.document_uploaded", { size_kb: Math.round(file.size / 1024) });
  };

  const saveReviews = async () => {
    const r = rating.trim() ? Number(rating.replace(",", ".")) : null;
    if (r != null && (!Number.isFinite(r) || r < 0 || r > 5)) { toast.error("La note doit être comprise entre 0 et 5."); return; }
    const c = count.trim() ? parseInt(count, 10) : null;
    const u = reviewsUrl.trim();
    if (u && !/^https:\/\//.test(u)) { toast.error("Le lien vers vos avis doit commencer par https://"); return; }
    if (await update({ rating: r, rating_count: c, rating_source: source.slice(0, 40), reviews_url: u, testimonial: testimonial.slice(0, 280), testimonial_author: author.slice(0, 80) }, "Avis enregistrés"))
      window.__lovableEvents?.track?.("project.reviews_saved", { has_rating: r != null, has_testimonial: !!testimonial.trim() });
  };
  const preview = ratingLine(rating.trim() ? Number(rating.replace(",", ".")) : null, count ? parseInt(count, 10) : null, source);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={card}>
        <FileText className="h-6 w-6 text-gold" />
        <h2 className="mt-2 font-serif text-2xl">Plaquette <em className="text-gold">sans pièce jointe</em></h2>
        <p className="mt-1 text-sm text-muted-foreground">Vos prospects téléchargent votre document en 1 clic. Les e-mails restent légers et évitent les spams.</p>
        <label className="mt-5 grid gap-1 text-sm">Texte du bouton<input className={input} maxLength={60} value={docLabel} onChange={(e) => setDocLabel(e.target.value)} /></label>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
        <div className="mt-4 flex flex-wrap gap-2">
          <button disabled={busy} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {p.document_url ? "Remplacer le PDF" : "Importer un PDF (5 Mo max)"}
          </button>
          {p.document_url && <>
            <button onClick={() => update({ document_label: docLabel.slice(0, 60) }, "Texte enregistré")} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-accent">Enregistrer le texte</button>
            <button onClick={() => update({ document_url: "" }, "Document retiré")} aria-label="Retirer le document" className="rounded-full border border-border p-2.5 hover:bg-accent"><Trash2 className="h-4 w-4" /></button>
          </>}
        </div>
        {p.document_url && (
          <div className="mt-5 rounded-xl border border-gold/40 bg-gold/5 p-4 text-sm">
            <p className="font-medium">Votre lien fixe</p>
            <p className="mt-1 break-all text-muted-foreground">{fixedLink}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={() => { navigator.clipboard.writeText(fixedLink); toast.success("Lien copié"); }} className="inline-flex items-center gap-1 text-gold underline"><Copy className="h-3.5 w-3.5" />Copier</button>
              <a href={fixedLink} target="_blank" rel="noreferrer" className="text-gold underline">Tester</a>
              <Link to="/editeur" className="text-gold underline">L'ajouter à ma signature</Link>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Remplacez le PDF ici quand vous voulez : les signatures déjà installées pointent automatiquement vers la nouvelle version.</p>
          </div>
        )}
      </div>

      <div className={card}>
        <Star className="h-6 w-6 text-gold" />
        <h2 className="mt-2 font-serif text-2xl">Avis & <em className="text-gold">témoignage</em></h2>
        <p className="mt-1 text-sm text-muted-foreground">Rassurez dès le premier e-mail : votre note s'affiche sur votre carte de visite et peut être ajoutée à votre signature.</p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <label className="grid gap-1 text-sm">Note /5<input className={input} inputMode="decimal" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="4,9" /></label>
          <label className="grid gap-1 text-sm">Nb d'avis<input className={input} inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))} placeholder="128" /></label>
          <label className="grid gap-1 text-sm">Source<input className={input} maxLength={40} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Google" /></label>
        </div>
        <label className="mt-3 grid gap-1 text-sm">Lien vers vos avis<input className={input} value={reviewsUrl} onChange={(e) => setReviewsUrl(e.target.value)} placeholder="https://g.page/r/…" /></label>
        <label className="mt-3 grid gap-1 text-sm">Témoignage client (facultatif)<textarea className={input} rows={3} maxLength={280} value={testimonial} onChange={(e) => setTestimonial(e.target.value)} placeholder="« Réactifs, précis et toujours de bon conseil. »" /></label>
        <label className="mt-3 grid gap-1 text-sm">Auteur<input className={input} maxLength={80} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Marie D., cliente depuis 2021" /></label>
        {preview && <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-gold">{preview}</p>}
        <p className="mt-2 text-xs text-muted-foreground">Indiquez uniquement des avis réels et vérifiables : c'est une obligation légale.</p>
        <button onClick={saveReviews} className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">Enregistrer</button>
      </div>
    </div>
  );
}
