import * as React from 'react'
import { BrandedAuthEmail } from './auth-branded'
import type { AuthLang } from './auth-i18n'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MagicLinkEmail = (p: any & { lang?: AuthLang }) => (
  <BrandedAuthEmail kind="magiclink" lang={p.lang} url={p.confirmationUrl} />
)

export default MagicLinkEmail
