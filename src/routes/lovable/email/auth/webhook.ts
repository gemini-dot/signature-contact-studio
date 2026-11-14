import * as React from 'react'
import { createAuthEmailHandler, type AuthEmailHookData } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'
import { BrandedAuthEmail } from '@/lib/email-templates/auth-branded'
import { authSubject, langFromAuthUrl, type AuthKind } from '@/lib/email-templates/auth-i18n'

// Configuration
const SITE_NAME = "Signature.Contact"
const SENDER_DOMAIN = "notify.signature.contact"
const FROM_DOMAIN = "signature.contact"

// Subject + branded template in the visitor's site language (?lang= on the redirect target).
const def = (kind: AuthKind) => (data: AuthEmailHookData) => {
  const lang = langFromAuthUrl(data.url)
  return {
    subject: authSubject(kind, lang),
    element: React.createElement(BrandedAuthEmail, {
      kind,
      lang,
      url: data.url,
      token: data.token ?? '',
      oldEmail: data.old_email ?? data.email ?? '',
      newEmail: data.new_email ?? '',
    }),
  }
}

export const Route = createFileRoute("/lovable/email/auth/webhook")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const handler = createAuthEmailHandler({
          apiKey: process.env['LOVABLE_API_KEY']!,
          from: { name: SITE_NAME, address: `noreply@${FROM_DOMAIN}` },
          senderDomain: SENDER_DOMAIN,
          sendUrl: process.env['LOVABLE_SEND_URL'],
          emails: {
            signup: def('signup'),
            invite: def('invite'),
            magiclink: def('magiclink'),
            recovery: def('recovery'),
            email_change: def('email_change'),
            reauthentication: def('reauthentication'),
          },
        })
        return handler(request)
      },
    },
  },
})
