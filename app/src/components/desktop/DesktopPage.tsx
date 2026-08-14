import type { ReactNode } from 'react'

export function DesktopPage({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: '100vh', background: 'var(--bg-app)', position: 'relative' }}>{children}</div>
}
