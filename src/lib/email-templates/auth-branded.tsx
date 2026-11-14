import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import { AUTH_COPY, type AuthKind, type AuthLang } from './auth-i18n'

export interface BrandedAuthProps {
  kind: AuthKind
  lang?: AuthLang
  url?: string
  token?: string
  oldEmail?: string
  newEmail?: string
}

export const BrandedAuthEmail = ({ kind, lang = 'fr', url, token, oldEmail = '', newEmail = '' }: BrandedAuthProps) => {
  const p = AUTH_COPY[lang] ?? AUTH_COPY.fr
  const c = p[kind]
  const body = c.body.replace('{old}', oldEmail).replace('{new}', newEmail)
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{c.title}</Preview>
      <Body style={main}>
        <Container style={wrap}>
          <Section style={header}>
            <Text style={logo}>Signature<span style={{ color: GOLD }}>.</span>Contact</Text>
            <Text style={tagline}>{p.tagline}</Text>
          </Section>
          <Section style={card}>
            <Heading style={h1}>{c.title}</Heading>
            <Text style={text}>{body}</Text>
            {kind === 'reauthentication' ? (
              <>
                <Text style={code}>{token}</Text>
                <Text style={small}>{p.code}</Text>
              </>
            ) : (
              <Button style={button} href={url}>{c.cta}</Button>
            )}
            <Text style={small}>{p.ignore}</Text>
          </Section>
          <Text style={foot}>© Signature.Contact · signature.contact</Text>
        </Container>
      </Body>
    </Html>
  )
}

const NAVY = '#1b2540'
const GOLD = '#b8954a'
const CREAM = '#f7f2e8'
const serif = "Georgia, 'Times New Roman', serif"
const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: '24px 0' }
const wrap = { backgroundColor: CREAM, borderRadius: '16px', maxWidth: '560px', padding: '28px 24px' }
const header = { textAlign: 'center' as const, paddingBottom: '18px' }
const logo = { fontFamily: serif, fontSize: '26px', color: NAVY, margin: 0, fontWeight: 600 as const }
const tagline = { fontFamily: serif, fontStyle: 'italic' as const, color: GOLD, fontSize: '14px', margin: '4px 0 0' }
const card = { backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #ece3cf', padding: '28px 26px' }
const h1 = { fontFamily: serif, fontSize: '24px', color: NAVY, margin: '0 0 14px', fontWeight: 600 as const }
const text = { fontSize: '15px', color: '#3d4458', lineHeight: '1.6', margin: '0 0 24px' }
const button = { backgroundColor: NAVY, color: '#ffffff', fontSize: '15px', borderRadius: '999px', padding: '13px 26px', textDecoration: 'none', borderBottom: `3px solid ${GOLD}` }
const code = { fontFamily: "'Courier New', monospace", fontSize: '30px', letterSpacing: '6px', color: NAVY, fontWeight: 700 as const, margin: '0 0 8px' }
const small = { fontSize: '12px', color: '#8a8f9c', margin: '24px 0 0', lineHeight: '1.5' }
const foot = { textAlign: 'center' as const, fontSize: '11px', color: '#9a927f', margin: '18px 0 0' }
