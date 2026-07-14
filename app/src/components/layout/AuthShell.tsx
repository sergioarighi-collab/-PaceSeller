import type { ReactNode } from 'react'

export function AuthShell({
  children,
  width = 440,
  center = false,
}: {
  children: ReactNode
  width?: number
  center?: boolean
}) {
  return (
    <div className="min-h-screen bg-app md:bg-canvas flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div
          style={{ maxWidth: width }}
          className={`w-full md:bg-surface md:rounded-[8px] md:shadow-[0_18px_40px_rgba(20,20,22,0.10)] md:p-8 md:border md:border-border ${
            center ? 'text-center' : ''
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function Logo() {
  return (
    <div className="text-center py-6">
      <span className="font-display font-bold text-sm tracking-tight text-text-primary">PaceSeller</span>
    </div>
  )
}
