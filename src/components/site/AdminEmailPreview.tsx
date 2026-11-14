import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { EMAIL_KINDS, EMAIL_LANGS, KIND_LABEL, emailSubject, renderEmail, type EmailKind, type EmailLang } from "@/lib/email-preview";

export function AdminEmailPreview() {
  const [kind, setKind] = useState<EmailKind>("magic");
  const [lang, setLang] = useState<EmailLang>("fr");
  const [mobile, setMobile] = useState(false);
  const btn = (on: boolean) => `rounded-full px-3 py-1.5 text-sm ${on ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-accent"}`;
  return (
    <div className="mt-12">
      <h2 className="font-serif text-2xl">Aperçu des <em className="text-gold">e-mails</em></h2>
      <p className="mt-1 text-sm text-muted-foreground">Visualisez chaque e-mail envoyé aux membres, dans chaque langue, sur ordinateur et sur mobile.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {EMAIL_KINDS.map((k) => <button key={k} onClick={() => setKind(k)} className={btn(kind === k)}>{KIND_LABEL[k]}</button>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {EMAIL_LANGS.map((l) => <button key={l} onClick={() => setLang(l)} className={btn(lang === l)} aria-pressed={lang === l}>{l.toUpperCase()}</button>)}
        <div className="ml-auto inline-flex rounded-full border border-border bg-card p-1">
          <button onClick={() => setMobile(false)} aria-pressed={!mobile} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${!mobile ? "bg-primary text-primary-foreground" : ""}`}><Monitor className="h-4 w-4" />Ordinateur</button>
          <button onClick={() => setMobile(true)} aria-pressed={mobile} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${mobile ? "bg-primary text-primary-foreground" : ""}`}><Smartphone className="h-4 w-4" />Mobile</button>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm"><span className="text-muted-foreground">Objet : </span><strong>{emailSubject(kind, lang)}</strong></p>
        <div className="mt-4 flex justify-center rounded-xl bg-muted p-4">
          <div className={mobile ? "w-[375px] max-w-full overflow-hidden rounded-[2rem] border-8 border-foreground/80" : "w-full max-w-[680px] overflow-hidden rounded-lg border border-border"}>
            <iframe title="Aperçu de l'e-mail" srcDoc={renderEmail(kind, lang)} sandbox="" className="block h-[560px] w-full bg-background" />
          </div>
        </div>
      </div>
    </div>
  );
}
