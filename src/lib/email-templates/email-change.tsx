import * as React from 'react'
import { BrandedAuthEmail } from './auth-branded'
import type { AuthLang } from './auth-i18n'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EmailChangeEmail = (p: any & { lang?: AuthLang }) => (
  <BrandedAuthEmail kind="email_change" lang={p.lang} url={p.confirmationUrl} oldEmail={p.oldEmail} newEmail={p.newEmail} />
)

export default EmailChangeEmail
