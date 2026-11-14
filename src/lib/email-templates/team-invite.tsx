import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { INVITE, PREFIX, asLang, fill } from './app-i18n'
import { BrandLayout, button, h1, small, text } from './brand-layout'

interface Props { lang?: string; team?: string; inviter?: string; url?: string }

const TeamInvite = ({ lang, team, inviter, url }: Props) => {
  const l = asLang(lang)
  const c = INVITE[l]
  const v = { team: team || 'Signature.Contact', inviter: inviter || (l === 'fr' ? 'Votre administrateur' : 'Your administrator') }
  return (
    <BrandLayout lang={l} preview={fill(c.subject, v)}>
      <Heading style={h1}>{c.title}</Heading>
      <Text style={text}>{fill(c.body, v)}</Text>
      <Button style={button} href={url || 'https://signature.contact'}>{c.cta}</Button>
      <Text style={small}>{c.note}</Text>
    </BrandLayout>
  )
}

export const template = {
  component: TeamInvite,
  subject: (d: Record<string, any>) => PREFIX + fill(INVITE[asLang(d.lang)].subject, { team: d.team || 'Signature.Contact' }),
  displayName: "Invitation d'équipe",
  previewData: { lang: 'fr', team: 'Cabinet Martin', inviter: 'Claire Martin', url: 'https://signature.contact/rejoindre/exemple' },
} satisfies TemplateEntry
