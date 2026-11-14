import * as React from 'react'
import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components'
import { SLOGAN, type AppLang } from './app-i18n'

export const NAVY = '#1b2540'
export const GOLD = '#b8954a'
const CREAM = '#f7f2e8'
export const serif = "Georgia, 'Times New Roman', serif"

export const BrandLayout = ({ lang, preview, children }: { lang: AppLang; preview: string; children: React.ReactNode }) => (
  <Html lang={lang} dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: '24px 0' }}>
      <Container style={{ backgroundColor: CREAM, borderRadius: '16px', maxWidth: '560px', padding: '28px 24px' }}>
        <Section style={{ textAlign: 'center', paddingBottom: '18px' }}>
          <Text style={{ fontFamily: serif, fontSize: '26px', color: NAVY, margin: 0, fontWeight: 600 }}>Signature<span style={{ color: GOLD }}>.</span>Contact</Text>
          <Text style={{ fontFamily: serif, fontStyle: 'italic', color: GOLD, fontSize: '14px', margin: '4px 0 0' }}>{SLOGAN[lang]}</Text>
        </Section>
        <Section style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #ece3cf', padding: '28px 26px' }}>{children}</Section>
        <Text style={{ textAlign: 'center', fontSize: '12px', color: '#8a8f9c', margin: '18px 0 0' }}>© Signature.Contact · signature.contact</Text>
      </Container>
    </Body>
  </Html>
)

export const h1 = { fontFamily: serif, fontSize: '24px', color: NAVY, margin: '0 0 14px', fontWeight: 600 as const }
export const text = { fontSize: '15px', color: '#3d4458', lineHeight: '1.6', margin: '0 0 22px' }
export const small = { fontSize: '12px', color: '#8a8f9c', lineHeight: '1.5', margin: '22px 0 0' }
export const button = { backgroundColor: NAVY, color: '#ffffff', fontSize: '15px', borderRadius: '999px', padding: '13px 26px', textDecoration: 'none', borderBottom: `3px solid ${GOLD}` }
