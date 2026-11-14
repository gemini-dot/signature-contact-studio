import { useLocation } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const INTROS: Record<string, [string, string, string]> = {
  "/compte": ["Vos", "signatures", "Retrouvez ici toutes vos signatures e-mail. Modifiez-les, dupliquez-les pour vos différents usages, puis copiez-les dans votre messagerie en un clic."],
  "/compte/profil": ["Carte &", "badge", "Votre carte de visite en ligne, partageable par lien ou QR code. Le badge certifié prouve à vos destinataires que l'e-mail vient bien de vous."],
  "/compte/vitrine": ["Plaquette &", "avis", "Mettez en avant votre plaquette PDF et les avis de vos clients. Le lien reste toujours le même, même quand vous changez le fichier."],
  "/compte/visio": ["Fond de", "visio", "Générez un fond pour vos visioconférences aux couleurs de votre signature, avec QR code vers votre carte. Votre image professionnelle, aussi à l'écran."],
  "/compte/statut": ["Votre", "statut", "Indiquez en direct si vous êtes disponible, en réunion ou en déplacement. Le statut s'affiche sur votre carte et vos destinataires savent à quoi s'attendre."],
  "/compte/absence": ["Message", "d'absence", "Rédigez un message d'absence soigné en quelques secondes : dates, contact d'urgence et rendez-vous au retour. Copiez-le ensuite dans votre messagerie."],
  "/compte/entete": ["Papier à", "en-tête", "Créez vos lettres, devis et propositions en reprenant automatiquement le logo, les couleurs et les coordonnées de la signature choisie. Imprimez, enregistrez en PDF ou téléchargez pour Word."],
  "/compte/rendez-vous": ["Prise de", "rendez-vous", "Proposez vos créneaux directement depuis votre signature. Vos contacts réservent en un clic, sans échanges d'e-mails à rallonge."],
  "/compte/equipe": ["Votre", "équipe", "Invitez vos collaborateurs par e-mail, par lien ou par import de fichier. Chacun reçoit une signature conforme à la charte de l'entreprise, et vous gérez les places librement."],
  "/compte/bannieres": ["Smart", "Bannières", "Diffusez une bannière commune sous toutes les signatures de l'équipe. Changez l'image quand vous voulez : elle se met à jour partout, sans rien réinstaller."],
  "/compte/abonnement": ["Votre", "abonnement", "Consultez votre formule, changez d'offre, appliquez un code promo et retrouvez vos factures. Tout est modifiable à tout moment."],
};

export function TabIntro() {
  const path = useLocation({ select: (l) => l.pathname.replace(/\/$/, "") || "/" });
  const intro = INTROS[path];
  if (!intro) return null;
  return (
    <div className="mt-6 flex gap-4 rounded-3xl border border-gold/30 bg-card p-5 shadow-elegant">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold"><Sparkles className="h-4 w-4" /></span>
      <div>
        <p className="font-serif text-xl">{intro[0]} <em className="text-gold">{intro[1]}</em></p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{intro[2]}</p>
      </div>
    </div>
  );
}
