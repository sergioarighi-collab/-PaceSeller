import type { ReactNode } from 'react'
import { OrderDrawer } from './OrderDrawer'

export function DesktopPage({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', position: 'relative' }}>
      {children}
      <OrderDrawer />
    </div>
  )
}
