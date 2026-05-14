import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">{title}</h2>
      {children}
    </section>
  )
}
