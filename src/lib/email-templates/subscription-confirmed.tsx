import * as React from 'react'
import { Button, Column, Heading, Row, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { PREFIX, SUB, asLang, fill } from './app-i18n'
import { BrandLayout, GOLD, NAVY, button, h1, text } from './brand-layout'

interface Props { lang?: string; plan?: string; cycle?: 'month' | 'year'; amount?: string; seats?: number; url?: string }

const label = { fontSize: '13px', color: '#8a8f9c', margin: '6px 0' }
const value = { fontSize: '14px', color: NAVY, margin: '6px 0', fontWeight: 600 as const, textAlign: 'right' as const }

const SubscriptionConfirmed = ({ lang, plan, cycle, amount, seats, url }: Props) => {
  const l = asLang(lang)
  const c = SUB[l]
  const p = plan || 'Solo'
  const rows: [string, string][] = [[c.plan, p], [c.cycle, cycle === 'year' ? c.yearly : c.monthly]]
  if (amount) rows.push([c.amount, amount])
  if (seats) rows.push([c.seats, String(seats)])
  return (
    <BrandLayout lang={l} preview={fill(c.subject, { plan: p })}>
      <Heading style={h1}>{c.title}</Heading>
      <Text style={text}>{c.body}</Text>
      <Section style={{ borderTop: `2px solid ${GOLD}`, borderBottom: '1px solid #ece3cf', padding: '8px 0', margin: '0 0 24px' }}>
        {rows.map(([k, v]) => (
          <Row key={k}><Column><Text style={label}>{k}</Text></Column><Column><Text style={value}>{v}</Text></Column></Row>
        ))}
      </Section>
      <Button style={button} href={url || 'https://signature.contact/compte/abonnement'}>{c.cta}</Button>
    </BrandLayout>
  )
}

export const template = {
  component: SubscriptionConfirmed,
  subject: (d: Record<string, any>) => PREFIX + fill(SUB[asLang(d.lang)].subject, { plan: d.plan || 'Solo' }),
  displayName: 'Abonnement confirmé',
  previewData: { lang: 'fr', plan: 'Équipe', cycle: 'month', amount: '24,00 €', seats: 5, url: 'https://signature.contact/compte/abonnement' },
} satisfies TemplateEntry
