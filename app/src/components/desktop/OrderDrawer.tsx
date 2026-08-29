import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, cartSummary } from '../../lib/store'
import { formatBRL } from '../../lib/format'
import { GRADE_MINIMA_PARES } from '../../lib/types'
import { products } from '../../lib/data'
import { ProductThumb } from './ProductThumb'
import { WebModal } from './WebModal'

const MIX_IDEAL_PCT = 70
const NEW_CARRINHO = 'novo' as const

export function OrderDrawer() {
  const open = useAppStore((s) => s.orderDrawerOpen)
  const closeOrderDrawer = useAppStore((s) => s.closeOrderDrawer)
  const cartItems = useAppStore((s) => s.cartItems)
  const addToCart = useAppStore((s) => s.addToCart)
  const removeFromCart = useAppStore((s) => s.removeFromCart)
  const carrinhos = useAppStore((s) => s.carrinhos)
  const activeCarrinhoId = useAppStore((s) => s.activeCarrinhoId)
  const setActiveCarrinho = useAppStore((s) => s.setActiveCarrinho)
  const commitCartToCarrinho = useAppStore((s) => s.commitCartToCarrinho)
  const navigate = useNavigate()
  const { lines, totalItems, totalValue } = cartSummary(cartItems)
  const marginPct = 38
  const gradeOk = totalItems >= GRADE_MINIMA_PARES
  const gradePct = Math.min(100, Math.round((totalItems / GRADE_MINIMA_PARES) * 100))

  const [pickerOpen, setPickerOpen] = useState(false)
  const [picked, setPicked] = useState<string>(NEW_CARRINHO)

  // Fecha o pedido em montagem: vira um Pedido de verdade dentro do carrinho escolhido (ou um
  // carrinho novo) e limpa o cartItems pro próximo pedido.
  function commitAndGo(target: string) {
    const carrinhoId = commitCartToCarrinho(target === NEW_CARRINHO ? null : target)
    setActiveCarrinho(carrinhoId)
    setPickerOpen(false)
    closeOrderDrawer()
    navigate(carrinhoId ? `/carrinhos/${carrinhoId}` : '/carrinhos')
  }

  function handleAddToCart() {
    if (totalItems === 0) return
    // Só pergunta em qual carrinho entra quando há mais de um pra escolher — com 0 ou 1
    // carrinho existente não tem o que decidir, comita direto.
    if (carrinhos.length > 1) {
      setPicked(activeCarrinhoId && carrinhos.some((c) => c.id === activeCarrinhoId) ? activeCarrinhoId : NEW_CARRINHO)
      setPickerOpen(true)
      return
    }
    commitAndGo(carrinhos.length === 1 ? carrinhos[0].id : NEW_CARRINHO)
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
            onClick={totalItems > 0 ? handleAddToCart : undefined}
          >
            Adicionar ao carrinho
          </div>
        </div>
      </div>

      {pickerOpen && (
        <WebModal
          title="Em qual carrinho?"
          subtitle="Você tem mais de um carrinho aberto — escolha onde esse pedido entra"
          onClose={() => setPickerOpen(false)}
          width={420}
          footer={
            <>
              <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={() => setPickerOpen(false)}>
                Cancelar
              </div>
              <div className="btn-primary" style={{ cursor: 'pointer' }} onClick={() => commitAndGo(picked)}>
                Adicionar
              </div>
            </>
          }
        >
          <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {carrinhos.map((c) => (
              <div
                key={c.id}
                className={`optioncard ${picked === c.id ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setPicked(c.id)}
              >
                <div>
                  <div className="otitle">{c.name}</div>
                  <div className="osub">
                    {c.pedidos.length} pedido{c.pedidos.length > 1 ? 's' : ''} · Representante: {c.representative}
                  </div>
                </div>
              </div>
            ))}
            <div
              className={`optioncard ${picked === NEW_CARRINHO ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setPicked(NEW_CARRINHO)}
            >
              <div className="oicon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <div>
                <div className="otitle">Novo carrinho</div>
                <div className="osub">Cria um carrinho separado só pra esse pedido</div>
              </div>
            </div>
          </div>
        </WebModal>
      )}
    </>
  )
}
