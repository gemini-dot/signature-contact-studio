export const APP_LANGS = ['fr', 'en', 'es', 'it', 'de', 'nl', 'pt'] as const
export type AppLang = (typeof APP_LANGS)[number]
export const asLang = (l?: string): AppLang => (APP_LANGS as readonly string[]).includes(l ?? '') ? (l as AppLang) : 'fr'

export const SLOGAN: Record<AppLang, string> = {
  fr: 'Personnalisez votre vie numérique', en: 'Personalise your digital life', es: 'Personaliza tu vida digital',
  it: 'Personalizza la tua vita digitale', de: 'Gestalten Sie Ihr digitales Leben', nl: 'Personaliseer uw digitale leven', pt: 'Personalize a sua vida digital',
}

type Invite = { subject: string; title: string; body: string; cta: string; note: string }
export const INVITE: Record<AppLang, Invite> = {
  fr: { subject: "Invitation à rejoindre l'équipe {team}", title: "Vous êtes invité(e) !", body: "{inviter} vous invite à rejoindre l'équipe {team} sur Signature.Contact pour partager une signature e-mail harmonisée.", cta: "Rejoindre l'équipe", note: "Ce lien est personnel à votre équipe. Si vous ne connaissez pas l'expéditeur, ignorez ce message." },
  en: { subject: 'Invitation to join the {team} team', title: "You're invited!", body: '{inviter} invites you to join the {team} team on Signature.Contact to share a consistent e-mail signature.', cta: 'Join the team', note: "This link belongs to your team. If you don't know the sender, ignore this message." },
  es: { subject: 'Invitación para unirte al equipo {team}', title: '¡Estás invitado!', body: '{inviter} te invita a unirte al equipo {team} en Signature.Contact para compartir una firma de correo unificada.', cta: 'Unirme al equipo', note: 'Este enlace es propio de tu equipo. Si no conoces al remitente, ignora este mensaje.' },
  it: { subject: 'Invito a unirti al team {team}', title: 'Sei invitato!', body: '{inviter} ti invita a unirti al team {team} su Signature.Contact per condividere una firma e-mail coerente.', cta: 'Unisciti al team', note: 'Questo link appartiene al tuo team. Se non conosci il mittente, ignora questo messaggio.' },
  de: { subject: 'Einladung zum Team {team}', title: 'Sie sind eingeladen!', body: '{inviter} lädt Sie ein, dem Team {team} auf Signature.Contact beizutreten und eine einheitliche E-Mail-Signatur zu nutzen.', cta: 'Team beitreten', note: 'Dieser Link gehört zu Ihrem Team. Wenn Sie den Absender nicht kennen, ignorieren Sie diese Nachricht.' },
  nl: { subject: 'Uitnodiging voor het team {team}', title: 'U bent uitgenodigd!', body: '{inviter} nodigt u uit voor het team {team} op Signature.Contact om een uniforme e-mailhandtekening te delen.', cta: 'Lid worden', note: 'Deze link hoort bij uw team. Kent u de afzender niet? Negeer dan dit bericht.' },
  pt: { subject: 'Convite para a equipa {team}', title: 'Está convidado!', body: '{inviter} convida-o a juntar-se à equipa {team} no Signature.Contact para partilhar uma assinatura de e-mail uniforme.', cta: 'Juntar-me à equipa', note: 'Esta ligação pertence à sua equipa. Se não conhece o remetente, ignore esta mensagem.' },
}

type Sub = { subject: string; title: string; body: string; cta: string; plan: string; cycle: string; amount: string; seats: string; monthly: string; yearly: string }
export const SUB: Record<AppLang, Sub> = {
  fr: { subject: 'Confirmation de votre abonnement {plan}', title: 'Merci pour votre confiance', body: 'Votre abonnement est actif. Toutes les fonctionnalités de votre formule sont dès maintenant disponibles dans votre espace.', cta: 'Ouvrir mon espace', plan: 'Formule', cycle: 'Facturation', amount: 'Montant', seats: 'Collaborateurs', monthly: 'Mensuelle', yearly: 'Annuelle' },
  en: { subject: 'Your {plan} subscription is confirmed', title: 'Thank you for your trust', body: 'Your subscription is active. Every feature of your plan is now available in your account.', cta: 'Open my account', plan: 'Plan', cycle: 'Billing', amount: 'Amount', seats: 'Team members', monthly: 'Monthly', yearly: 'Yearly' },
  es: { subject: 'Confirmación de tu suscripción {plan}', title: 'Gracias por tu confianza', body: 'Tu suscripción está activa. Todas las funciones de tu plan ya están disponibles en tu espacio.', cta: 'Abrir mi espacio', plan: 'Plan', cycle: 'Facturación', amount: 'Importe', seats: 'Colaboradores', monthly: 'Mensual', yearly: 'Anual' },
  it: { subject: 'Conferma del tuo abbonamento {plan}', title: 'Grazie per la fiducia', body: 'Il tuo abbonamento è attivo. Tutte le funzioni del piano sono ora disponibili nel tuo spazio.', cta: 'Apri il mio spazio', plan: 'Piano', cycle: 'Fatturazione', amount: 'Importo', seats: 'Collaboratori', monthly: 'Mensile', yearly: 'Annuale' },
  de: { subject: 'Bestätigung Ihres {plan}-Abonnements', title: 'Danke für Ihr Vertrauen', body: 'Ihr Abonnement ist aktiv. Alle Funktionen Ihres Tarifs stehen Ihnen ab sofort zur Verfügung.', cta: 'Mein Bereich', plan: 'Tarif', cycle: 'Abrechnung', amount: 'Betrag', seats: 'Mitarbeitende', monthly: 'Monatlich', yearly: 'Jährlich' },
  nl: { subject: 'Bevestiging van uw {plan}-abonnement', title: 'Bedankt voor uw vertrouwen', body: 'Uw abonnement is actief. Alle functies van uw formule zijn nu beschikbaar in uw omgeving.', cta: 'Mijn omgeving openen', plan: 'Formule', cycle: 'Facturering', amount: 'Bedrag', seats: 'Medewerkers', monthly: 'Maandelijks', yearly: 'Jaarlijks' },
  pt: { subject: 'Confirmação da sua subscrição {plan}', title: 'Obrigado pela sua confiança', body: 'A sua subscrição está ativa. Todas as funcionalidades do seu plano já estão disponíveis no seu espaço.', cta: 'Abrir o meu espaço', plan: 'Plano', cycle: 'Faturação', amount: 'Montante', seats: 'Colaboradores', monthly: 'Mensal', yearly: 'Anual' },
}

export const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '')
export const PREFIX = 'Signature.Contact : '
