import { useEffect } from 'react'

export function Toast({
  title,
  sub,
  onClose,
  actions,
}: {
  title: string
  sub: string
  onClose: () => void
  actions?: { label: string; onClick: () => void }[]
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="toast" style={{ position: 'fixed' }}>
      <div className="toast-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="toast-body">
        <div className="toast-title">{title}</div>
        <div className="toast-sub">{sub}</div>
        {actions && (
          <div className="toast-actions">
            {actions.map((a) => (
              <a key={a.label} href="#" onClick={(e) => { e.preventDefault(); a.onClick() }}>
                {a.label}
              </a>
            ))}
            <a href="#" className="toast-dismiss" onClick={(e) => { e.preventDefault(); onClose() }}>
              Dispensar
            </a>
          </div>
        )}
      </div>
      <div className="toast-close" style={{ cursor: 'pointer' }} onClick={onClose}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </div>
    </div>
  )
}
