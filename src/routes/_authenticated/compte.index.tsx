import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SignaturePreview } from "@/components/site/SignaturePreview";
import { defaultSignature, type SignatureData, type TemplateId } from "@/lib/signature";

export const Route = createFileRoute("/_authenticated/compte/")({ component: MySignatures });

function MySignatures() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["signatures"],
    queryFn: async () => {
      const { data, error } = await supabase.from("signatures").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const remove = async (id: string) => {
    if (!confirm("Supprimer cette signature ?")) return;
    const { error } = await supabase.from("signatures").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["signatures"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{data.length} signature(s) enregistrée(s)</p>
        <Link to="/editeur" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Nouvelle signature</Link>
      </div>
      {isLoading ? <p className="mt-6 text-sm text-muted-foreground">Chargement…</p> : data.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Aucune signature pour l'instant. Créez-en une dans l'éditeur puis cliquez sur « Enregistrer ».
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {data.map((s) => (
            <div key={s.id} className="space-y-3 rounded-3xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Modifiée le {new Date(s.updated_at).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="flex gap-2">
                  <Link to="/editeur" search={{ id: s.id }} className="rounded-full border border-border px-3 py-1 text-sm hover:bg-accent">Modifier</Link>
                  <button onClick={() => remove(s.id)} aria-label="Supprimer" className="rounded-full border border-border p-2 hover:bg-accent"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <SignaturePreview template={s.template as TemplateId} data={{ ...defaultSignature, ...(s.data as Partial<SignatureData>) }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
