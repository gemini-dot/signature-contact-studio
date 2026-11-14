export type AuthKind = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'reauthentication'
export const AUTH_LANGS = ['fr', 'en', 'es', 'it', 'de', 'nl', 'pt'] as const
export type AuthLang = (typeof AUTH_LANGS)[number]

type Copy = { subject: string; title: string; body: string; cta: string }
type Pack = Record<AuthKind, Copy> & { ignore: string; code: string; tagline: string }

export const AUTH_COPY: Record<AuthLang, Pack> = {
  fr: {
    signup: { subject: 'Confirmez votre adresse e-mail', title: 'Bienvenue sur Signature.Contact', body: 'Merci pour votre inscription. Confirmez votre adresse e-mail pour activer votre compte et créer vos signatures.', cta: 'Confirmer mon adresse' },
    invite: { subject: 'Vous êtes invité(e)', title: 'Vous êtes invité(e)', body: 'Vous avez été invité(e) à rejoindre Signature.Contact. Acceptez l’invitation pour créer votre compte.', cta: 'Accepter l’invitation' },
    magiclink: { subject: 'Votre lien magique', title: 'Votre lien magique', body: 'Cliquez sur le bouton ci-dessous pour vous connecter à votre espace. Ce lien expire rapidement.', cta: 'Me connecter' },
    recovery: { subject: 'Réinitialisation de votre mot de passe', title: 'Nouveau mot de passe', body: 'Vous avez demandé à réinitialiser votre mot de passe. Cliquez ci-dessous pour en choisir un nouveau.', cta: 'Choisir un mot de passe' },
    email_change: { subject: 'Confirmez votre nouvelle adresse', title: 'Changement d’adresse', body: 'Confirmez le remplacement de {old} par {new} pour votre compte.', cta: 'Confirmer le changement' },
    reauthentication: { subject: 'Votre code de vérification', title: 'Code de vérification', body: 'Utilisez ce code pour confirmer votre identité :', cta: '' },
    ignore: 'Si vous n’êtes pas à l’origine de cette demande, ignorez simplement ce message.',
    code: 'Ce code expire rapidement.',
    tagline: 'Personnalisez votre vie numérique',
  },
  en: {
    signup: { subject: 'Confirm your email', title: 'Welcome to Signature.Contact', body: 'Thanks for signing up. Confirm your email address to activate your account and create your signatures.', cta: 'Confirm my email' },
    invite: { subject: 'You have been invited', title: 'You have been invited', body: 'You have been invited to join Signature.Contact. Accept the invitation to create your account.', cta: 'Accept invitation' },
    magiclink: { subject: 'Your magic link', title: 'Your magic link', body: 'Click the button below to sign in to your account. This link expires shortly.', cta: 'Sign in' },
    recovery: { subject: 'Reset your password', title: 'New password', body: 'You asked to reset your password. Click below to choose a new one.', cta: 'Choose a password' },
    email_change: { subject: 'Confirm your new email', title: 'Email change', body: 'Confirm replacing {old} with {new} for your account.', cta: 'Confirm change' },
    reauthentication: { subject: 'Your verification code', title: 'Verification code', body: 'Use this code to confirm your identity:', cta: '' },
    ignore: 'If you did not request this, you can safely ignore this email.',
    code: 'This code expires shortly.',
    tagline: 'Personalise your digital life',
  },
  es: {
    signup: { subject: 'Confirme su correo electrónico', title: 'Bienvenido a Signature.Contact', body: 'Gracias por registrarse. Confirme su correo para activar su cuenta y crear sus firmas.', cta: 'Confirmar mi correo' },
    invite: { subject: 'Ha sido invitado', title: 'Ha sido invitado', body: 'Ha sido invitado a unirse a Signature.Contact. Acepte la invitación para crear su cuenta.', cta: 'Aceptar la invitación' },
    magiclink: { subject: 'Su enlace mágico', title: 'Su enlace mágico', body: 'Haga clic en el botón para acceder a su espacio. Este enlace caduca pronto.', cta: 'Iniciar sesión' },
    recovery: { subject: 'Restablecer su contraseña', title: 'Nueva contraseña', body: 'Ha solicitado restablecer su contraseña. Haga clic abajo para elegir una nueva.', cta: 'Elegir contraseña' },
    email_change: { subject: 'Confirme su nuevo correo', title: 'Cambio de correo', body: 'Confirme el cambio de {old} a {new} en su cuenta.', cta: 'Confirmar el cambio' },
    reauthentication: { subject: 'Su código de verificación', title: 'Código de verificación', body: 'Use este código para confirmar su identidad:', cta: '' },
    ignore: 'Si no ha solicitado esto, ignore este mensaje.',
    code: 'Este código caduca pronto.',
    tagline: 'Personalice su vida digital',
  },
  it: {
    signup: { subject: 'Conferma il tuo indirizzo e-mail', title: 'Benvenuto su Signature.Contact', body: 'Grazie per la registrazione. Conferma il tuo indirizzo per attivare l’account e creare le tue firme.', cta: 'Conferma indirizzo' },
    invite: { subject: 'Sei stato invitato', title: 'Sei stato invitato', body: 'Sei stato invitato a unirti a Signature.Contact. Accetta l’invito per creare il tuo account.', cta: 'Accetta l’invito' },
    magiclink: { subject: 'Il tuo link magico', title: 'Il tuo link magico', body: 'Clicca il pulsante per accedere al tuo spazio. Il link scade a breve.', cta: 'Accedi' },
    recovery: { subject: 'Reimposta la password', title: 'Nuova password', body: 'Hai chiesto di reimpostare la password. Clicca qui sotto per sceglierne una nuova.', cta: 'Scegli una password' },
    email_change: { subject: 'Conferma il nuovo indirizzo', title: 'Cambio indirizzo', body: 'Conferma la sostituzione di {old} con {new} per il tuo account.', cta: 'Conferma' },
    reauthentication: { subject: 'Il tuo codice di verifica', title: 'Codice di verifica', body: 'Usa questo codice per confermare la tua identità:', cta: '' },
    ignore: 'Se non hai richiesto nulla, ignora questo messaggio.',
    code: 'Il codice scade a breve.',
    tagline: 'Personalizza la tua vita digitale',
  },
  de: {
    signup: { subject: 'Bestätigen Sie Ihre E-Mail-Adresse', title: 'Willkommen bei Signature.Contact', body: 'Danke für Ihre Anmeldung. Bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.', cta: 'Adresse bestätigen' },
    invite: { subject: 'Sie wurden eingeladen', title: 'Sie wurden eingeladen', body: 'Sie wurden zu Signature.Contact eingeladen. Nehmen Sie die Einladung an, um Ihr Konto zu erstellen.', cta: 'Einladung annehmen' },
    magiclink: { subject: 'Ihr Magic Link', title: 'Ihr Magic Link', body: 'Klicken Sie auf die Schaltfläche, um sich anzumelden. Der Link läuft bald ab.', cta: 'Anmelden' },
    recovery: { subject: 'Passwort zurücksetzen', title: 'Neues Passwort', body: 'Sie möchten Ihr Passwort zurücksetzen. Klicken Sie unten, um ein neues zu wählen.', cta: 'Passwort wählen' },
    email_change: { subject: 'Neue E-Mail-Adresse bestätigen', title: 'Adressänderung', body: 'Bestätigen Sie die Änderung von {old} zu {new}.', cta: 'Änderung bestätigen' },
    reauthentication: { subject: 'Ihr Bestätigungscode', title: 'Bestätigungscode', body: 'Verwenden Sie diesen Code, um Ihre Identität zu bestätigen:', cta: '' },
    ignore: 'Wenn Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.',
    code: 'Der Code läuft bald ab.',
    tagline: 'Gestalten Sie Ihr digitales Leben',
  },
  nl: {
    signup: { subject: 'Bevestig uw e-mailadres', title: 'Welkom bij Signature.Contact', body: 'Bedankt voor uw inschrijving. Bevestig uw e-mailadres om uw account te activeren.', cta: 'Adres bevestigen' },
    invite: { subject: 'U bent uitgenodigd', title: 'U bent uitgenodigd', body: 'U bent uitgenodigd voor Signature.Contact. Accepteer de uitnodiging om uw account aan te maken.', cta: 'Uitnodiging accepteren' },
    magiclink: { subject: 'Uw magische link', title: 'Uw magische link', body: 'Klik op de knop om in te loggen. Deze link verloopt snel.', cta: 'Inloggen' },
    recovery: { subject: 'Wachtwoord opnieuw instellen', title: 'Nieuw wachtwoord', body: 'U wilt uw wachtwoord opnieuw instellen. Klik hieronder om een nieuw te kiezen.', cta: 'Wachtwoord kiezen' },
    email_change: { subject: 'Bevestig uw nieuwe e-mailadres', title: 'Adreswijziging', body: 'Bevestig de wijziging van {old} naar {new}.', cta: 'Wijziging bevestigen' },
    reauthentication: { subject: 'Uw verificatiecode', title: 'Verificatiecode', body: 'Gebruik deze code om uw identiteit te bevestigen:', cta: '' },
    ignore: 'Heeft u dit niet aangevraagd? Negeer dan dit bericht.',
    code: 'Deze code verloopt snel.',
    tagline: 'Personaliseer uw digitale leven',
  },
  pt: {
    signup: { subject: 'Confirme o seu e-mail', title: 'Bem-vindo à Signature.Contact', body: 'Obrigado pelo registo. Confirme o seu e-mail para ativar a conta e criar as suas assinaturas.', cta: 'Confirmar e-mail' },
    invite: { subject: 'Foi convidado', title: 'Foi convidado', body: 'Foi convidado a juntar-se à Signature.Contact. Aceite o convite para criar a sua conta.', cta: 'Aceitar convite' },
    magiclink: { subject: 'O seu link mágico', title: 'O seu link mágico', body: 'Clique no botão para entrar no seu espaço. Este link expira em breve.', cta: 'Entrar' },
    recovery: { subject: 'Redefinir a palavra-passe', title: 'Nova palavra-passe', body: 'Pediu para redefinir a palavra-passe. Clique abaixo para escolher uma nova.', cta: 'Escolher palavra-passe' },
    email_change: { subject: 'Confirme o novo e-mail', title: 'Alteração de e-mail', body: 'Confirme a alteração de {old} para {new}.', cta: 'Confirmar alteração' },
    reauthentication: { subject: 'O seu código de verificação', title: 'Código de verificação', body: 'Use este código para confirmar a sua identidade:', cta: '' },
    ignore: 'Se não fez este pedido, ignore esta mensagem.',
    code: 'Este código expira em breve.',
    tagline: 'Personalize a sua vida digital',
  },
}

export function authSubject(kind: AuthKind, lang: AuthLang) {
  return `Signature.Contact : ${AUTH_COPY[lang][kind].subject}`
}

/** Reads ?lang=xx from the redirect_to target embedded in the auth link. */
export function langFromAuthUrl(url: string | null | undefined): AuthLang {
  try {
    if (!url) return 'fr'
    const u = new URL(url)
    const target = u.searchParams.get('redirect_to')
    const l = (target ? new URL(target).searchParams.get('lang') : u.searchParams.get('lang')) ?? ''
    return (AUTH_LANGS as readonly string[]).includes(l) ? (l as AuthLang) : 'fr'
  } catch {
    return 'fr'
  }
}
