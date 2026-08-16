import { useNavigate } from 'react-router-dom'
import { useAppStore, cartSummary } from '../../lib/store'
import { formatBRL } from '../../lib/format'
import { ProductThumb } from './ProductThumb'

export function OrderSidebar({
  mixPct = 70,
  nudges,
}: {
  mixPct?: number
  nudges?: string[]
}) {
  const cartItems = useAppStore((s) => s.cartItems)
  const removeFromCart = useAppStore((s) => s.removeFromCart)
  const navigate = useNavigate()
  const { lines, totalItems, totalValue } = cartSummary(cartItems)
  const marginPct = 38

  const defaultNudges = [
    'Você está a <b>R$ 800</b> de ganhar frete grátis',
    'Faltam itens da categoria <b>feminina</b> no seu mix — 3 sugestões abaixo',
    `Margem média do pedido: <b>${marginPct}%</b> — 3 pts acima do seu histórico`,
  ]

  return (
    <div className="web-sidebar">
      <div className="stitle">Seu pedido</div>
      <div className="stotal">{totalItems} itens</div>
      <div className="ssub">
        {formatBRL(totalValue)} · margem {marginPct}%
      </div>

      <div className="nudge-progress">
        <div className="np-label">
          <span>Mix ideal pro seu perfil</span>
          <span style={{ fontFamily: 'var(--mono)' }}>{mixPct}%</span>
        </div>
        <div className="nudge-bar">
          <div className="nudge-bar-fill" style={{ width: `${mixPct}%` }} />
        </div>
      </div>

      <div className="sidebar-itemlist">
        {lines.map(({ product, qty, value }) => (
          <div className="sidebar-item" key={product.id}>
            <div className="si-thumb">
              <ProductThumb src={product.image} alt={product.name} iconSize={18} padding={3} />
            </div>
            <div className="si-info">
              <div className="si-name">{product.name}</div>
              <div className="si-meta">
                qtd {qty} · {formatBRL(value)}
              </div>
            </div>
            <div className="si-remove" style={{ cursor: 'pointer' }} onClick={() => removeFromCart(product.id)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {(nudges ?? defaultNudges).map((n, i) => (
        <div className="bubble" key={i} dangerouslySetInnerHTML={{ __html: n }} />
      ))}

      <div className="sbtns">
        <div className="btn-primary" style={{ cursor: 'pointer' }} onClick={() => navigate('/carrinhos')}>
          Ir para o carrinho
        </div>
        <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={() => navigate('/planejamento')}>
          Planejar compra
        </div>
      </div>
    </div>
  )
}
