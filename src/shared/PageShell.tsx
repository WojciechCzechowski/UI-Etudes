import type { ReactNode } from 'react'

type PageShellProps = {
  title: string
  children: ReactNode
}

export function PageShell({ title, children }: PageShellProps) {
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <main className="mt-6">{children}</main>
    </div>
  )
}
