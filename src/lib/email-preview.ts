/** Contenu des e-mails transactionnels (aperçu admin), dans les 7 langues du site. */
export const EMAIL_LANGS = ["fr", "en", "es", "it", "de", "nl", "pt"] as const;
export type EmailLang = (typeof EMAIL_LANGS)[number];
export const EMAIL_KINDS = ["magic", "signup", "recovery", "invite", "subscription", "booking"] as const;
export type EmailKind = (typeof EMAIL_KINDS)[number];

type Copy = { subject: string; title: string; body: string; cta: string };
const SLOGAN: Record<EmailLang, string> = {
  fr: "Personnalisez votre vie numérique", en: "Personalise your digital life", es: "Personaliza tu vida digital",
  it: "Personalizza la tua vita digitale", de: "Gestalten Sie Ihr digitales Leben", nl: "Personaliseer uw digitale leven", pt: "Personalize a sua vida digital",
};
const FOOT: Record<EmailLang, string> = {
  fr: "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.",
  en: "If you did not request this, you can safely ignore this message.",
  es: "Si no has solicitado esto, ignora este mensaje.",
  it: "Se non hai richiesto questa azione, ignora questo messaggio.",
  de: "Wenn Sie dies nicht angefordert haben, ignorieren Sie diese Nachricht.",
  nl: "Heeft u dit niet aangevraagd? Negeer dan dit bericht.",
  pt: "Se não fez este pedido, ignore esta mensagem.",
};
export const KIND_LABEL: Record<EmailKind, string> = {
  magic: "Lien magique", signup: "Confirmation d'inscription", recovery: "Mot de passe oublié",
  invite: "Invitation équipe", subscription: "Abonnement confirmé", booking: "Nouveau rendez-vous",
};

const C: Record<EmailKind, Record<EmailLang, Copy>> = {
  magic: {
    fr: { subject: "Votre lien magique", title: "Votre lien de connexion", body: "Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien est valable une heure.", cta: "Me connecter" },
    en: { subject: "Your magic link", title: "Your sign-in link", body: "Click the button below to sign in. This link is valid for one hour.", cta: "Sign in" },
    es: { subject: "Tu enlace mágico", title: "Tu enlace de acceso", body: "Haz clic en el botón para iniciar sesión. El enlace es válido durante una hora.", cta: "Iniciar sesión" },
    it: { subject: "Il tuo link magico", title: "Il tuo link di accesso", body: "Clicca sul pulsante per accedere. Il link è valido per un'ora.", cta: "Accedi" },
    de: { subject: "Ihr Magic Link", title: "Ihr Anmeldelink", body: "Klicken Sie auf die Schaltfläche, um sich anzumelden. Der Link ist eine Stunde gültig.", cta: "Anmelden" },
    nl: { subject: "Uw magische link", title: "Uw inloglink", body: "Klik op de knop om in te loggen. Deze link is één uur geldig.", cta: "Inloggen" },
    pt: { subject: "A sua ligação mágica", title: "A sua ligação de acesso", body: "Clique no botão para entrar. A ligação é válida durante uma hora.", cta: "Entrar" },
  },
  signup: {
    fr: { subject: "Confirmez votre inscription", title: "Bienvenue !", body: "Merci de rejoindre Signature.Contact. Confirmez votre adresse e-mail pour activer votre compte.", cta: "Confirmer mon adresse" },
    en: { subject: "Confirm your sign-up", title: "Welcome!", body: "Thanks for joining Signature.Contact. Confirm your e-mail address to activate your account.", cta: "Confirm my address" },
    es: { subject: "Confirma tu registro", title: "¡Bienvenido!", body: "Gracias por unirte a Signature.Contact. Confirma tu correo para activar tu cuenta.", cta: "Confirmar mi correo" },
    it: { subject: "Conferma la tua iscrizione", title: "Benvenuto!", body: "Grazie per esserti unito a Signature.Contact. Conferma la tua e-mail per attivare l'account.", cta: "Conferma indirizzo" },
    de: { subject: "Bestätigen Sie Ihre Registrierung", title: "Willkommen!", body: "Danke, dass Sie Signature.Contact nutzen. Bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.", cta: "Adresse bestätigen" },
    nl: { subject: "Bevestig uw registratie", title: "Welkom!", body: "Bedankt voor uw aanmelding bij Signature.Contact. Bevestig uw e-mailadres om uw account te activeren.", cta: "Adres bevestigen" },
    pt: { subject: "Confirme o seu registo", title: "Bem-vindo!", body: "Obrigado por aderir ao Signature.Contact. Confirme o seu e-mail para ativar a conta.", cta: "Confirmar endereço" },
  },
  recovery: {
    fr: { subject: "Réinitialisez votre mot de passe", title: "Nouveau mot de passe", body: "Vous avez demandé à changer votre mot de passe. Cliquez ci-dessous pour en choisir un nouveau.", cta: "Choisir un mot de passe" },
    en: { subject: "Reset your password", title: "New password", body: "You asked to change your password. Click below to choose a new one.", cta: "Choose a password" },
    es: { subject: "Restablece tu contraseña", title: "Nueva contraseña", body: "Has solicitado cambiar tu contraseña. Haz clic abajo para elegir una nueva.", cta: "Elegir contraseña" },
    it: { subject: "Reimposta la password", title: "Nuova password", body: "Hai chiesto di cambiare la password. Clicca qui sotto per sceglierne una nuova.", cta: "Scegli una password" },
    de: { subject: "Passwort zurücksetzen", title: "Neues Passwort", body: "Sie möchten Ihr Passwort ändern. Klicken Sie unten, um ein neues zu wählen.", cta: "Passwort wählen" },
    nl: { subject: "Stel uw wachtwoord opnieuw in", title: "Nieuw wachtwoord", body: "U wilt uw wachtwoord wijzigen. Klik hieronder om een nieuw te kiezen.", cta: "Wachtwoord kiezen" },
    pt: { subject: "Redefina a sua palavra-passe", title: "Nova palavra-passe", body: "Pediu para alterar a palavra-passe. Clique abaixo para escolher uma nova.", cta: "Escolher palavra-passe" },
  },
  invite: {
    fr: { subject: "Vous rejoignez l'équipe Atelier Laurent", title: "Invitation à rejoindre l'équipe", body: "Camille vous invite à rejoindre l'équipe Atelier Laurent pour utiliser la signature officielle.", cta: "Rejoindre l'équipe" },
    en: { subject: "You're joining the Atelier Laurent team", title: "Team invitation", body: "Camille invites you to join the Atelier Laurent team and use the official signature.", cta: "Join the team" },
    es: { subject: "Te unes al equipo Atelier Laurent", title: "Invitación al equipo", body: "Camille te invita a unirte al equipo Atelier Laurent y usar la firma oficial.", cta: "Unirme al equipo" },
    it: { subject: "Entri nel team Atelier Laurent", title: "Invito al team", body: "Camille ti invita a entrare nel team Atelier Laurent e usare la firma ufficiale.", cta: "Entra nel team" },
    de: { subject: "Sie treten dem Team Atelier Laurent bei", title: "Team-Einladung", body: "Camille lädt Sie ein, dem Team Atelier Laurent beizutreten und die offizielle Signatur zu nutzen.", cta: "Team beitreten" },
    nl: { subject: "U sluit zich aan bij team Atelier Laurent", title: "Teamuitnodiging", body: "Camille nodigt u uit voor het team Atelier Laurent om de officiële handtekening te gebruiken.", cta: "Team joinen" },
    pt: { subject: "Junta-se à equipa Atelier Laurent", title: "Convite para a equipa", body: "Camille convida-o a juntar-se à equipa Atelier Laurent e a usar a assinatura oficial.", cta: "Juntar-me à equipa" },
  },
  subscription: {
    fr: { subject: "Votre abonnement Solo est actif", title: "Merci pour votre confiance", body: "Formule Solo · 6 € / mois. Toutes les fonctions avancées sont désormais débloquées.", cta: "Voir mon espace" },
    en: { subject: "Your Solo plan is active", title: "Thank you for your trust", body: "Solo plan · €6 / month. All advanced features are now unlocked.", cta: "Go to my account" },
    es: { subject: "Tu plan Solo está activo", title: "Gracias por tu confianza", body: "Plan Solo · 6 € / mes. Todas las funciones avanzadas están desbloqueadas.", cta: "Ver mi espacio" },
    it: { subject: "Il tuo piano Solo è attivo", title: "Grazie per la fiducia", body: "Piano Solo · 6 € / mese. Tutte le funzioni avanzate sono sbloccate.", cta: "Vai al mio spazio" },
    de: { subject: "Ihr Solo-Abo ist aktiv", title: "Danke für Ihr Vertrauen", body: "Solo-Tarif · 6 € / Monat. Alle erweiterten Funktionen sind freigeschaltet.", cta: "Zu meinem Konto" },
    nl: { subject: "Uw Solo-abonnement is actief", title: "Bedankt voor uw vertrouwen", body: "Solo-abonnement · € 6 / maand. Alle geavanceerde functies zijn ontgrendeld.", cta: "Naar mijn account" },
    pt: { subject: "O seu plano Solo está ativo", title: "Obrigado pela confiança", body: "Plano Solo · 6 € / mês. Todas as funções avançadas estão desbloqueadas.", cta: "Ver a minha conta" },
  },
  booking: {
    fr: { subject: "Nouveau rendez-vous le 18 novembre", title: "Un rendez-vous vient d'être pris", body: "Jean Martin a réservé un créneau le mardi 18 novembre à 10 h 30 (30 min).", cta: "Voir mes rendez-vous" },
    en: { subject: "New appointment on 18 November", title: "A new appointment was booked", body: "Jean Martin booked a slot on Tuesday 18 November at 10:30 (30 min).", cta: "See my appointments" },
    es: { subject: "Nueva cita el 18 de noviembre", title: "Se ha reservado una cita", body: "Jean Martin reservó el martes 18 de noviembre a las 10:30 (30 min).", cta: "Ver mis citas" },
    it: { subject: "Nuovo appuntamento il 18 novembre", title: "È stato prenotato un appuntamento", body: "Jean Martin ha prenotato martedì 18 novembre alle 10:30 (30 min).", cta: "Vedi appuntamenti" },
    de: { subject: "Neuer Termin am 18. November", title: "Ein Termin wurde gebucht", body: "Jean Martin hat Dienstag, 18. November, 10:30 Uhr gebucht (30 Min.).", cta: "Meine Termine" },
    nl: { subject: "Nieuwe afspraak op 18 november", title: "Er is een afspraak geboekt", body: "Jean Martin boekte dinsdag 18 november om 10:30 (30 min).", cta: "Mijn afspraken" },
    pt: { subject: "Nova marcação a 18 de novembro", title: "Foi feita uma marcação", body: "Jean Martin reservou terça-feira, 18 de novembro, às 10:30 (30 min).", cta: "Ver marcações" },
  },
};

export function emailSubject(kind: EmailKind, lang: EmailLang) {
  return `Signature.Contact : ${C[kind][lang].subject}`.replace(" : ", lang === "fr" ? " : " : ": ");
}

export function renderEmail(kind: EmailKind, lang: EmailLang): string {
  const c = C[kind][lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f7f2e8;font-family:Arial,Helvetica,sans-serif;color:#14213d;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f2e8;padding:24px 12px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#14213d;padding:22px 28px;">
<div style="font-family:Georgia,serif;font-size:22px;color:#ffffff;">Signature<span style="color:#c9a45c;">.</span>Contact</div>
<div style="font-family:Georgia,serif;font-style:italic;font-size:13px;color:#c9a45c;margin-top:2px;">${SLOGAN[lang]}</div></td></tr>
<tr><td style="padding:32px 28px;">
<h1 style="margin:0 0 14px;font-family:Georgia,serif;font-weight:normal;font-size:26px;color:#14213d;">${c.title}</h1>
<p style="margin:0 0 26px;font-size:15px;line-height:1.6;color:#3a4256;">${c.body}</p>
<a href="#" style="display:inline-block;background:#14213d;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:13px 26px;border-radius:999px;border-bottom:2px solid #c9a45c;">${c.cta}</a>
<p style="margin:28px 0 0;font-size:12px;color:#6b7180;">${FOOT[lang]}</p></td></tr>
<tr><td style="border-top:1px solid #ece3d0;padding:16px 28px;font-size:11px;color:#8a8f9c;">© Signature.Contact by Gem's · signature.contact</td></tr>
</table></td></tr></table></body></html>`;
}
