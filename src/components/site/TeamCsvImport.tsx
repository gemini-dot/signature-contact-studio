import { useState } from "react";
import { toast } from "sonner";
import { Download, FileUp, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { CSV_TEMPLATE, parseTeamCsv, type ImportRow } from "@/lib/team-import";

export function TeamCsvImport({ teamId, hasPlan, existing, seats, onDone }: { teamId: string; hasPlan: boolean; existing: string[]; seats: number; onDone: () => void }) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [busy, setBusy] = useState(false);
  const ok = rows.filter((r) => r.valid && !r.duplicate);
  const free = seats > 0 ? Math.max(0, seats - existing.length) : Infinity;

  const onFile = async (f?: File) => {
    if (!f) return;
    if (f.size > 1024 * 1024) { toast.error("Fichier trop lourd (1 Mo maximum)."); return; }
    if (!/\.(csv|txt)$/i.test(f.name)) { toast.error("Depuis Excel : Fichier → Enregistrer sous → « CSV UTF-8 », puis importez ce fichier."); return; }
    const parsed = parseTeamCsv(await f.text(), existing);
    if (!parsed.length) { toast.error("Aucune ligne trouvée dans le fichier."); return; }
    if (parsed.length > 500) { toast.error("500 collaborateurs maximum par import."); return; }
    setRows(parsed);
  };
  const template = () => {
    const url = URL.createObjectURL(new Blob(["\uFEFF" + CSV_TEMPLATE], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "modele-equipe-signature-contact.csv"; a.click();
    URL.revokeObjectURL(url);
  };
  const confirm = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("import_team_members", { _team: teamId, _emails: ok.map((r) => r.email) });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    const r = data as { added: number; skipped: number };
    toast.success(`${r.added} collaborateur(s) ajouté(s)${r.skipped ? ` · ${r.skipped} ignoré(s) (déjà présents ou places épuisées)` : ""}. Ils retrouvent leur signature en créant leur compte avec cette adresse.`);
    setRows([]);
    onDone();
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">Import groupé (CSV / Excel)</p>
          <p className="text-sm text-muted-foreground">Ajoutez toute votre équipe en une fois. Chacun reçoit le modèle commun dès la création de son compte.</p>
        </div>
        <button type="button" onClick={template} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"><Download className="h-4 w-4" /> Modèle de fichier</button>
      </div>
      {!hasPlan ? (
        <p className="flex items-center gap-2 rounded-xl bg-gold/10 p-3 text-sm"><Lock className="h-4 w-4 text-gold" /> Inclus dans la formule Équipe. <Link to="/tarifs" className="text-gold underline">Voir les formules</Link></p>
      ) : (
        <>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm hover:bg-accent">
            <FileUp className="h-6 w-6 text-gold" />
            <span className="font-medium">Choisir un fichier CSV</span>
            <span className="text-xs text-muted-foreground">Depuis Excel ou Google Sheets : enregistrez au format « CSV ». Seule la colonne E-mail est obligatoire.</span>
            <input type="file" accept=".csv,text/csv,.txt" className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {rows.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm"><strong>{ok.length}</strong> à ajouter · {rows.filter((r) => r.duplicate).length} déjà présent(s) · {rows.filter((r) => !r.valid).length} e-mail(s) invalide(s)
                {Number.isFinite(free) && <> · <strong>{free}</strong> place(s) disponible(s)</>}</p>
              {Number.isFinite(free) && ok.length > free && <p className="rounded-xl bg-gold/10 p-3 text-sm">Seules les {free} premières personnes seront ajoutées. Ajoutez des places dans l'onglet Abonnement pour inviter tout le monde.</p>}
              <div className="max-h-64 overflow-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-xs text-muted-foreground"><tr><th className="p-2">E-mail</th><th className="p-2">Nom</th><th className="p-2">Poste</th><th className="p-2">État</th></tr></thead>
                  <tbody>{rows.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2">{r.email || "—"}</td><td className="p-2">{r.name}</td><td className="p-2">{r.title}</td>
                      <td className="p-2 text-xs">{!r.valid ? <span className="text-destructive">Invalide</span> : r.duplicate ? "Déjà présent" : <span className="text-primary">OK</span>}</td>
                    </tr>))}</tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <button disabled={busy || !ok.length} onClick={confirm} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? "Import…" : `Ajouter ${ok.length} collaborateur(s)`}</button>
                <button onClick={() => setRows([])} className="rounded-full border border-border px-4 py-2 text-sm">Annuler</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
