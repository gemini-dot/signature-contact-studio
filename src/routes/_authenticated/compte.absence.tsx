import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Plane } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import { LockedFeature } from "@/components/site/LockedFeature";
import { absenceHtml, absenceText, type AbsenceData } from "@/lib/absence";

export const Route = createFileRoute("/_authenticated/compte/absence")({ component: AbsencePage });

function AbsencePage() {
  const { user } = useAuth();
  const { paid, loading } = usePlan();
  const sig = useQuery({
    queryKey: ["first-signature", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("signatures").select("data").order("updated_at", { ascending: false }).limit(1).maybeSingle()).data,
  });
  const [a, setA] = useState<AbsenceData>({ name: "", from: "", to: "", backupName: "", backupEmail: "", backupPhone: "", bookingUrl: "", note: "" });
  const [accent, setAccent] = useState("#1e3a6e");
  useEffect(() => {
    const d = (sig.data?.data ?? {}) as Record<string, string>;
    setA((x) => ({ ...x, name: x.name || d["name"] || "", bookingUrl: x.bookingUrl || d["bookingUrl"] || "" }));
    if (d["accent"]) setAccent(d["accent"]);
  }, [sig.data]);
  const valid = !!a.from && !!a.to && a.to >= a.from && !!a.name.trim();
  const html = useMemo(() => (valid ? absenceHtml(a, accent) : ""), [a, accent, valid]);

  if (loading) return null;
  if (!paid) return <LockedFeature title="Répondeur d'absence soigné" plan="Solo" benefits={["Dates d'absence et de retour calculées", "Contact d'urgence cliquable", "Bouton « Planifier un point à mon retour »"]} />;

  const set = (k: keyof AbsenceData, v: string) => setA((x) => ({ ...x, [k]: v }));
  const field = (k: keyof AbsenceData, label: string, type = "text", ph = "") => (
    <label className="block text-sm"><span className="mb-1 block text-muted-foreground">{label}</span>
      <input type={type} value={a[k]} placeholder={ph} onChange={(e) => set(k, e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" /></label>
  );
  const copyHtml = async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([absenceText(a)], { type: "text/plain" }) })]);
    } catch { await navigator.clipboard.writeText(absenceText(a)); }
    toast.success("Message copié : collez-le dans la réponse automatique de votre messagerie.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-serif text-2xl"><Plane className="h-5 w-5 text-gold" />Répondeur d'<em className="text-gold">absence</em></h2>
        {field("name", "Votre nom")}
        <div className="grid gap-3 sm:grid-cols-2">{field("from", "Premier jour d'absence", "date")}{field("to", "Dernier jour d'absence", "date")}</div>
        {a.from && a.to && a.to < a.from && <p className="text-sm text-destructive">La date de fin doit suivre la date de début.</p>}
        {field("note", "Précision (facultatif)", "text", "Accès limité à mes e-mails")}
        <div className="grid gap-3 sm:grid-cols-3">{field("backupName", "Contact d'urgence")}{field("backupEmail", "Son e-mail", "email")}{field("backupPhone", "Son téléphone")}</div>
        {field("bookingUrl", "Lien de prise de rendez-vous", "url", "https://…")}
      </div>
      <div className="space-y-4">
        <div className="rounded-3xl border border-border bg-background p-6">
          {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <p className="text-sm text-muted-foreground">Renseignez votre nom et vos dates pour voir l'aperçu.</p>}
        </div>
        <button disabled={!valid} onClick={copyHtml} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-50"><Copy className="h-4 w-4" />Copier le message</button>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li><strong>Gmail</strong> : Paramètres › Général › Réponse automatique.</li>
          <li><strong>Outlook</strong> : Paramètres › Courrier › Réponses automatiques.</li>
          <li><strong>Apple Mail / Mailcow</strong> : Règles ou « Vacances » dans le webmail.</li>
        </ul>
      </div>
    </div>
  );
}
