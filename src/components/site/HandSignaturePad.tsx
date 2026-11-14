import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Eraser, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const INKS = [
  { label: "Bleu nuit", value: "#14213d" },
  { label: "Or doux", value: "#b08a3e" },
  { label: "Noir", value: "#111111" },
];

/** Tracé au doigt / souris / stylet ou paraphe calligraphié, envoyé en PNG transparent. */
export function HandSignaturePad({ userId, name, value, onChange }: { userId: string; name: string; value: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [ink, setInk] = useState("#14213d");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const c = ref.current!; c.width = 640; c.height = 200;
  }, []);

  const ctx = () => {
    const c = ref.current!.getContext("2d")!;
    c.strokeStyle = ink; c.fillStyle = ink; c.lineWidth = 3.2; c.lineCap = "round"; c.lineJoin = "round";
    return c;
  };
  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 640, y: ((e.clientY - r.top) / r.height) * 200 };
  };
  const down = (e: React.PointerEvent) => { drawing.current = true; ref.current!.setPointerCapture(e.pointerId); const p = pos(e); const c = ctx(); c.beginPath(); c.moveTo(p.x, p.y); };
  const move = (e: React.PointerEvent) => { if (!drawing.current) return; const p = pos(e); const c = ctx(); c.lineTo(p.x, p.y); c.stroke(); setDirty(true); };
  const up = () => { drawing.current = false; };
  const clear = () => { ref.current!.getContext("2d")!.clearRect(0, 0, 640, 200); setDirty(false); };
  const calligraphy = () => {
    clear();
    const c = ctx();
    c.font = "italic 64px 'Fraunces', Georgia, serif";
    c.textBaseline = "middle";
    c.fillText(name.trim() || "Votre nom", 24, 100);
    setDirty(true);
  };

  const save = async () => {
    if (!dirty) { toast.error("Tracez ou générez d'abord votre paraphe."); return; }
    setBusy(true);
    const blob: Blob | null = await new Promise((r) => ref.current!.toBlob(r, "image/png"));
    if (!blob) { setBusy(false); return; }
    const path = `${userId}/paraphe/${crypto.randomUUID()}.png`;
    const upRes = await supabase.storage.from("member-media").upload(path, blob, { contentType: "image/png" });
    if (upRes.error) { setBusy(false); toast.error(upRes.error.message.includes("policy") ? "Fonction réservée aux formules Solo et Équipe." : upRes.error.message); return; }
    const signed = await supabase.storage.from("member-media").createSignedUrl(path, TEN_YEARS);
    setBusy(false);
    if (signed.error || !signed.data) { toast.error("Impossible d'enregistrer le paraphe."); return; }
    onChange(signed.data.signedUrl);
    toast.success("Paraphe ajouté à votre signature");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Encre :</span>
        {INKS.map((i) => (
          <button key={i.value} type="button" onClick={() => setInk(i.value)} aria-label={i.label}
            className={`h-6 w-6 rounded-full border-2 ${ink === i.value ? "border-gold" : "border-transparent"}`} style={{ background: i.value }} />
        ))}
        <button type="button" onClick={calligraphy} className="ml-auto rounded-full border border-border px-3 py-1 hover:bg-accent">Générer depuis mon nom</button>
      </div>
      <canvas ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        className="aspect-[16/5] w-full touch-none rounded-xl border border-dashed border-gold/60 bg-card" aria-label="Zone de tracé de la signature" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={clear} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-accent"><Eraser className="h-4 w-4" />Effacer</button>
        <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Utiliser ce paraphe</button>
        {value && <button type="button" onClick={() => onChange("")} className="text-sm text-muted-foreground underline">Retirer</button>}
      </div>
      <p className="text-xs text-muted-foreground">Tracez au doigt, à la souris ou au stylet. Le paraphe s'affiche au-dessus de votre signature.</p>
    </div>
  );
}
