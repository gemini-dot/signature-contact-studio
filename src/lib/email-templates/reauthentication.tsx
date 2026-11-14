import * as React from 'react'
import { BrandedAuthEmail } from './auth-branded'
import type { AuthLang } from './auth-i18n'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ReauthenticationEmail = (p: any & { lang?: AuthLang }) => (
  <BrandedAuthEmail kind="reauthentication" lang={p.lang} token={p.token} />
)

export default ReauthenticationEmail
