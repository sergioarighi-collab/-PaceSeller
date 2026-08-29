import { useNavigate } from 'react-router-dom'
import { useAppStore, cartSummary } from '../../lib/store'
import { formatBRL } from '../../lib/format'
import { GRADE_MINIMA_PARES } from '../../lib/types'
import { products } from '../../lib/data'
import { ProductThumb } from './ProductThumb'

const MIX_IDEAL_PCT = 70

export function OrderDrawer() {
  const open = useAppStore((s) => s.orderDrawerOpen)
  const closeOrderDrawer = useAppStore((s) => s.closeOrderDrawer)
  const cartItems = useAppStore((s) => s.cartItems)
  const addToCart = useAppStore((s) => s.addToCart)
  const removeFromCart = useAppStore((s) => s.removeFromCart)
  const commitCartToCarrinho = useAppStore((s) => s.commitCartToCarrinho)
  const navigate = useNavigate()
  const { lines, totalItems, totalValue } = cartSummary(cartItems)
  const marginPct = 38
  const gradeOk = totalItems >= GRADE_MINIMA_PARES
  const gradePct = Math.min(100, Math.round((totalItems / GRADE_MINIMA_PARES) * 100))

  // Fecha o pedido em montagem: vira um Pedido de verdade dentro do carrinho ativo (ou um
  // carrinho novo, se nenhum estiver marcado como ativo) e limpa o cartItems pro próximo pedido.
  function handleGoToCart() {
    const carrinhoId = commitCartToCarrinho()
    closeOrderDrawer()
    navigate(carrinhoId ? `/carrinhos/${carrinhoId}` : '/carrinhos')
  }

  // Sugestões pra completar o mix: produtos que a loja ainda não vende (badge "Oportunidade perdida"),
  // ainda não adicionados ao pedido em construção.
  const suggestions = products.filter((p) => p.badges.some((b) => b.label === 'Oportunidade perdida') && !cartItems[p.id]).slice(0, 3)

  return (
    <>
      <div className={`order-drawer-scrim ${open ? 'open' : ''}`} onClick={closeOrderDrawer} />
      <div className={`order-drawer ${open ? 'open' : ''}`}>
        <div className="od-head">
          <div>
            <div className="stitle">Seu pedido</div>
            <div className="stotal">{totalItems} itens</div>
            <div className="ssub">
              {formatBRL(totalValue)} · margem {marginPct}%
            </div>
          </div>
          <div className="od-close" style={{ cursor: 'pointer' }} onClick={closeOrderDrawer}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </div>
        </div>

        <div className="od-body">
          <div className="nudge-progress">
            <div className="np-label">
              <span>Grade mínima do pedido</span>
              <span style={{ fontFamily: 'var(--mono)', color: gradeOk ? 'var(--positive)' : 'var(--risk)', fontWeight: 600 }}>
                {totalItems}/{GRADE_MINIMA_PARES} pares
              </span>
            </div>
            <div className="nudge-bar">
              <div
                className="nudge-bar-fill"
                style={{ width: `${gradePct}%`, background: gradeOk ? 'var(--positive)' : 'var(--risk)' }}
              />
            </div>
            {!gradeOk && (
              <div style={{ fontSize: 11, color: 'var(--risk)', marginTop: 5 }}>
                Faltam {GRADE_MINIMA_PARES - totalItems} pares pra fechar o pedido
              </div>
            )}
          </div>

          <div className="nudge-progress">
            <div className="np-label">
              <span>Mix ideal pro seu perfil</span>
              <span style={{ fontFamily: 'var(--mono)' }}>{MIX_IDEAL_PCT}%</span>
            </div>
            <div className="nudge-bar">
              <div className="nudge-bar-fill" style={{ width: `${MIX_IDEAL_PCT}%` }} />
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

          <div className="bubble">
            Você está a <b>{formatBRL(800)}</b> de ganhar frete grátis
          </div>

          {suggestions.length > 0 && (
            <>
              <div className="suggest-title">Sugestões pra completar o mix</div>
              {suggestions.map((p) => (
                <div className="suggest-row" key={p.id}>
                  <div className="sg-thumb">
                    <ProductThumb src={p.image} alt={p.name} iconSize={16} padding={3} />
                  </div>
                  <div className="sg-info">
                    <div className="sg-name">{p.name}</div>
                    <div className="sg-meta">Oportunidade perdida na sua loja</div>
                  </div>
                  <div className="sg-add" style={{ cursor: 'pointer' }} onClick={() => addToCart(p.id, 12)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="od-foot">
          <div
            className="btn-primary"
            style={totalItems > 0 ? { cursor: 'pointer' } : { cursor: 'not-allowed', opacity: 0.5 }}
            onClick={totalItems > 0 ? handleGoToCart : undefined}
          >
            Ir para o carrinho
          </div>
        </div>
      </div>
    </>
  )
}
