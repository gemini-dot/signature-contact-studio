import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Envoie une image depuis l'appareil vers l'espace de stockage du membre et renvoie un lien durable. */
export function ImageUpload({ userId, folder, onUploaded, label = "Importer une image" }: {
  userId: string; folder: string; onUploaded: (url: string) => void; label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) { toast.error("Formats acceptés : PNG, JPG, WEBP, GIF."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image trop lourde (5 Mo maximum)."); return; }
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("member-media").upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); toast.error(up.error.message.includes("policy") ? "Fonction réservée aux formules Solo et Équipe." : up.error.message); return; }
    const signed = await supabase.storage.from("member-media").createSignedUrl(path, TEN_YEARS);
    setBusy(false);
    if (signed.error || !signed.data) { toast.error("Impossible de générer le lien de l'image."); return; }
    onUploaded(signed.data.signedUrl);
    toast.success("Image importée");
  };

  return (
    <>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
        onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()}
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />} {busy ? "Envoi…" : label}
      </button>
    </>
  );
}
