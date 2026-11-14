import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import { LockedFeature } from "@/components/site/LockedFeature";
import { letterheadHtml, type LetterheadData } from "@/lib/letterhead";

export const Route = createFileRoute("/_authenticated/compte/entete")({ component: EntetePage });

function EntetePage() {
  const { user } = useAuth();
  const { paid, loading } = usePlan();
  const sig = useQuery({
    queryKey: ["first-signature", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("signatures").select("data").order("updated_at", { ascending: false }).limit(1).maybeSingle()).data,
  });
  const [l, setL] = useState<LetterheadData>({ company: "", tagline: "", logoUrl: "", accent: "#1e3a6e", address: "", phone: "", email: "", website: "", legal: "", body: "" });
  useEffect(() => {
    const d = (sig.data?.data ?? {}) as Record<string, string>;
    setL((x) => ({ ...x, company: x.company || d["company"] || "", logoUrl: x.logoUrl || d["logoUrl"] || "", accent: d["accent"] || x.accent, address: x.address || d["address"] || "", phone: x.phone || d["phone"] || "", email: x.email || d["email"] || "", website: x.website || d["website"] || "" }));
  }, [sig.data]);
  const html = useMemo(() => letterheadHtml(l), [l]);

  if (loading) return null;
  if (!paid) return <LockedFeature title="Papier à en-tête numérique" plan="Solo" benefits={["Logo, couleurs et coordonnées repris de votre signature", "Mentions légales (SIRET, TVA) en pied de page", "Export PDF et Word en un clic"]} />;

  const set = (k: keyof LetterheadData, v: string) => setL((x) => ({ ...x, [k]: v }));
  const field = (k: keyof LetterheadData, label: string, ph = "") => (
    <label className="block text-sm"><span className="mb-1 block text-muted-foreground">{label}</span>
      <input value={l[k]} placeholder={ph} onChange={(e) => set(k, e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" /></label>
  );
  const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${l.company || "Lettre"}</title><style>@page{size:A4;margin:0}body{margin:0}</style></head><body>${html}</body></html>`;
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(doc); w.document.close(); w.focus();
    setTimeout(() => w.print(), 400);
  };
  const word = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([doc], { type: "application/msword" }));
    a.download = `papier-en-tete-${(l.company || "lettre").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.doc`;
    a.click();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-serif text-2xl"><FileText className="h-5 w-5 text-gold" />Papier à <em className="text-gold">en-tête</em></h2>
        <p className="text-sm text-muted-foreground">Repris de votre dernière signature ; ajustez si besoin.</p>
        {field("company", "Entreprise")}
        {field("tagline", "Slogan (facultatif)")}
        {field("address", "Adresse")}
        <div className="grid gap-3 sm:grid-cols-3">{field("phone", "Téléphone")}{field("email", "E-mail")}{field("website", "Site web")}</div>
        {field("legal", "Mentions légales", "SAS au capital de … · SIRET … · TVA FR…")}
        <label className="block text-sm"><span className="mb-1 block text-muted-foreground">Contenu de la lettre (facultatif)</span>
          <textarea rows={5} value={l.body} onChange={(e) => set("body", e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" /></label>
        <div className="flex flex-wrap gap-2">
          <button onClick={print} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"><Printer className="h-4 w-4" />Imprimer / PDF</button>
          <button onClick={word} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm hover:bg-accent"><Download className="h-4 w-4" />Modèle Word</button>
        </div>
      </div>
      <div className="overflow-auto rounded-3xl border border-border bg-muted/40 p-4">
        <div className="mx-auto origin-top scale-[0.62] shadow-elegant" style={{ width: "210mm", marginBottom: "-38%" }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
