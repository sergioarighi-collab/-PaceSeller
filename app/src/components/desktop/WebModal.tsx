import type { ReactNode } from 'react'

export function WebModal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  width,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
}) {
  return (
    <div className="webmodal-scrim" style={{ position: 'fixed' }} onClick={onClose}>
      <div className="webmodal" style={width ? { width } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="wm-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="wm-sub">{subtitle}</div>}
          </div>
          <div className="wm-close" style={{ cursor: 'pointer' }} onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </div>
        </div>
        {children}
        {footer && <div className="wm-footer">{footer}</div>}
      </div>
    </div>
  )
}
