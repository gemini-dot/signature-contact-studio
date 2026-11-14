import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import { LockedFeature } from "@/components/site/LockedFeature";
import { letterheadHtml, DOC_KINDS, DOC_STYLES, type LetterheadData } from "@/lib/letterhead";

export const Route = createFileRoute("/_authenticated/compte/entete")({ component: EntetePage });

function EntetePage() {
  const { user } = useAuth();
  const { paid, loading } = usePlan();
  const sigs = useQuery({
    queryKey: ["letterhead-signatures", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("signatures").select("id,name,data").order("updated_at", { ascending: false })).data ?? [],
  });
  const [sigId, setSigId] = useState("");
  const sig = { data: (sigs.data ?? []).find((s) => s.id === sigId) ?? sigs.data?.[0] };
  const [l, setL] = useState<LetterheadData>({ company: "", tagline: "", logoUrl: "", accent: "#1e3a6e", address: "", phone: "", email: "", website: "", legal: "", body: "", kind: "lettre", style: "classique", reference: "", recipient: "", title: "" });
  useEffect(() => {
    const d = (sig.data?.data ?? {}) as Record<string, string>;
    if (!sig.data) return;
    setL((x) => ({ ...x, company: d["company"] || "", logoUrl: d["logoUrl"] || "", accent: d["accent"] || "#1e3a6e", address: d["address"] || "", phone: d["phone"] || "", email: d["email"] || "", website: d["website"] || "" }));
  }, [sig.data?.id]);
  const html = useMemo(() => letterheadHtml(l), [l]);

  if (loading) return null;
  if (!paid) return <LockedFeature title="Papier à en-tête numérique" plan="Solo" benefits={["Logo, couleurs et coordonnées repris de votre signature", "Mentions légales (SIRET, TVA) en pied de page", "Export PDF et Word en un clic"]} />;

  const set = (k: keyof LetterheadData, v: string) => setL((x) => ({ ...x, [k]: v }));
  const field = (k: "company" | "tagline" | "address" | "phone" | "email" | "website" | "legal" | "reference" | "title", label: string, ph = "") => (
    <label className="block text-sm"><span className="mb-1 block text-muted-foreground">{label}</span>
      <input value={l[k] ?? ""} placeholder={ph} onChange={(e) => set(k, e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" /></label>
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
        <label className="block text-sm"><span className="mb-1 block text-muted-foreground">Signature de référence (logo, couleur, coordonnées)</span>
          <select value={sig.data?.id ?? ""} onChange={(e) => setSigId(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2">
            {(sigs.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name || "Signature"}</option>)}
          </select></label>
        <div><span className="mb-1 block text-sm text-muted-foreground">Type de document</span>
          <div className="grid grid-cols-3 gap-2">{DOC_KINDS.map((k) => <button key={k.id} type="button" onClick={() => set("kind", k.id)} className={"rounded-2xl border px-3 py-2 text-sm " + (l.kind === k.id ? "border-gold bg-gold/10 font-medium" : "border-border hover:bg-accent")}>{k.label}</button>)}</div></div>
        <div><span className="mb-1 block text-sm text-muted-foreground">Style</span>
          <div className="grid grid-cols-3 gap-2">{DOC_STYLES.map((k) => <button key={k.id} type="button" onClick={() => set("style", k.id)} className={"rounded-2xl border px-3 py-2 text-sm " + (l.style === k.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent")}>{k.label}</button>)}</div></div>
        {field("company", "Entreprise")}
        {field("tagline", "Slogan (facultatif)")}
        {field("address", "Adresse")}
        <div className="grid gap-3 sm:grid-cols-3">{field("phone", "Téléphone")}{field("email", "E-mail")}{field("website", "Site web")}</div>
        {field("legal", "Mentions légales", "SAS au capital de … · SIRET … · TVA FR…")}
        {l.kind === "devis" ? field("reference", "N° de devis", "2026-001") : field("title", l.kind === "proposition" ? "Titre de la proposition" : "Objet")}
        <label className="block text-sm"><span className="mb-1 block text-muted-foreground">Destinataire</span>
          <textarea rows={2} value={l.recipient} onChange={(e) => set("recipient", e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="block text-sm"><span className="mb-1 block text-muted-foreground">Contenu — {DOC_KINDS.find((k) => k.id === l.kind)?.hint}</span>
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
