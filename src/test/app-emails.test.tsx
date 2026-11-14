import { render } from '@react-email/render'
import * as React from 'react'
import { it, expect } from 'vitest'
import { TEMPLATES } from '@/lib/email-templates/registry'
it('renders', async () => {
  for (const lang of ['fr','en','de']) for (const [n,t] of Object.entries(TEMPLATES)) {
    const d = { ...t.previewData, lang }
    const html = await render(React.createElement(t.component, d))
    const s = typeof t.subject==='function'?t.subject(d):t.subject
    expect(s.startsWith('Signature.Contact : ')).toBe(true); expect(html).toContain('Signature')
    if (lang==='en') console.log(n, '|', s)
  }
})
