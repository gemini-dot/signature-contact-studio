import type { ReactNode } from "react";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-medium">{title}</h1>
      <div className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-8 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:text-foreground">
        {children}
      </div>
    </section>
  );
}
