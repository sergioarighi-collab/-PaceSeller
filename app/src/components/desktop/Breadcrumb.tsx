import { Link } from 'react-router-dom'

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <div className="breadcrumb">
      {items.map((item, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <span className="bc-sep">/</span>}
          {item.to && i < items.length - 1 ? (
            <Link to={item.to} style={{ color: 'var(--info)', fontWeight: 500 }}>
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? 'bc-current' : ''}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}
