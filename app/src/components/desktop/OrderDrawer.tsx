import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, cartSummary, comboSummary } from '../../lib/store'
import { formatBRL } from '../../lib/format'
import { GRADE_MINIMA_PARES } from '../../lib/types'
import { products } from '../../lib/data'
import { ProductThumb } from './ProductThumb'
import { WebModal } from './WebModal'

const MIX_IDEAL_PCT = 70
const PEEK_MS = 2200
const PEEK_HOVER_GRACE_MS = 800
const NEW_CARRINHO = 'novo' as const

export function OrderDrawer() {
  const open = useAppStore((s) => s.orderDrawerOpen)
  const autoClose = useAppStore((s) => s.orderDrawerAutoClose)
  const peekToken = useAppStore((s) => s.peekToken)
  const closeOrderDrawer = useAppStore((s) => s.closeOrderDrawer)
  const cartItems = useAppStore((s) => s.cartItems)
  const addToCart = useAppStore((s) => s.addToCart)
  const removeFromCart = useAppStore((s) => s.removeFromCart)
  const setCartQty = useAppStore((s) => s.setCartQty)
  const cartCombos = useAppStore((s) => s.cartCombos)
  const removeCombo = useAppStore((s) => s.removeCombo)
  const carrinhos = useAppStore((s) => s.carrinhos)
  const activeCarrinhoId = useAppStore((s) => s.activeCarrinhoId)
  const setActiveCarrinho = useAppStore((s) => s.setActiveCarrinho)
  const commitCartToCarrinho = useAppStore((s) => s.commitCartToCarrinho)
  const navigate = useNavigate()
  const { lines, totalItems: itemsQty, totalValue: itemsValue } = cartSummary(cartItems)
  const { entries: comboLines, totalItems: combosQty, totalValue: combosValue } = comboSummary(cartCombos)
  const totalItems = itemsQty + combosQty
  const totalValue = itemsValue + combosValue
  const marginPct = 38
  const gradeOk = totalItems >= GRADE_MINIMA_PARES
  const gradePct = Math.min(100, Math.round((totalItems / GRADE_MINIMA_PARES) * 100))

  // Vai pra qual carrinho se o lojista não trocar manualmente — mesma regra do commit: o
  // ativo (se ainda existir), senão o único que houver, senão cria um novo.
  const resolvedTargetId =
    activeCarrinhoId && carrinhos.some((c) => c.id === activeCarrinhoId) ? activeCarrinhoId : carrinhos.length === 1 ? carrinhos[0].id : null
  const resolvedTargetName = resolvedTargetId ? carrinhos.find((c) => c.id === resolvedTargetId)?.name : null

  const [pickerOpen, setPickerOpen] = useState(false)
  const [picked, setPicked] = useState<string>(resolvedTargetId ?? NEW_CARRINHO)

  // "Peek": abre sozinho a cada item adicionado (ver peekOrderDrawer no store) e some depois de
  // ~2s — a menos que o mouse esteja em cima, aí some só ~0,8s depois do mouse sair. Um drawer
  // aberto manualmente (autoClose:false) nunca é fechado por esse timer.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hovering = useRef(false)

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  function scheduleClose(ms: number) {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => {
      closeOrderDrawer()
    }, ms)
  }

  useEffect(() => {
    if (open && autoClose && !hovering.current) scheduleClose(PEEK_MS)
    if (!open) clearCloseTimer()
    return clearCloseTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoClose, peekToken])

  function handleMouseEnter() {
    hovering.current = true
    if (autoClose) clearCloseTimer()
  }
  function handleMouseLeave() {
    hovering.current = false
    if (autoClose && open) scheduleClose(PEEK_HOVER_GRACE_MS)
  }

  // Fecha o pedido em montagem: vira um Pedido de verdade dentro do carrinho escolhido (o
  // rótulo "Vai para" já mostra qual, com "trocar" pra decidir diferente) e limpa o
  // cartItems/cartCombos pro próximo pedido.
  function handleAddToCart() {
    if (totalItems === 0) return
    const carrinhoId = commitCartToCarrinho(resolvedTargetId)
    setActiveCarrinho(carrinhoId)
    closeOrderDrawer()
    navigate(carrinhoId ? `/carrinhos/${carrinhoId}` : '/carrinhos')
  }

  function openPicker() {
    setPicked(resolvedTargetId ?? NEW_CARRINHO)
    setPickerOpen(true)
  }
  function confirmPicker() {
    setActiveCarrinho(picked === NEW_CARRINHO ? null : picked)
    setPickerOpen(false)
  }

  // Sugestões pra completar o mix: produtos que a loja ainda não vende (badge "Oportunidade perdida"),
  // ainda não adicionados ao pedido em construção.
  const suggestions = products.filter((p) => p.badges.some((b) => b.label === 'Oportunidade perdida') && !cartItems[p.id]).slice(0, 3)

  return (
    <>
      <div className={`order-drawer-scrim ${open ? 'open' : ''}`} onClick={closeOrderDrawer} />
      <div className={`order-drawer ${open ? 'open' : ''}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Vai para: <b style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{resolvedTargetName ?? 'Novo carrinho'}</b>
            </span>
            {carrinhos.length > 0 && (
              <span style={{ color: 'var(--info)', fontWeight: 600, cursor: 'pointer' }} onClick={openPicker}>
                trocar
              </span>
            )}
          </div>

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
            {comboLines.map(({ combo, cp }) => (
              <div className="sidebar-item" key={combo.id}>
                <div className="si-thumb" style={{ display: 'flex' }}>
                  <ProductThumb src={cp.p1.image} alt={cp.p1.name} iconSize={18} padding={3} />
                </div>
                <div className="si-info">
                  <div className="si-name">
                    Combo: {cp.p1.name.replace('Tênis Tesla ', '')} + {cp.p2.name.replace('Tênis Tesla ', '')}
                  </div>
                  <div className="si-meta">
                    24 pares · {formatBRL(cp.finalPrice)} <span style={{ color: 'var(--positive)' }}>(−{combo.discountPct}%)</span>
                  </div>
                </div>
                <div className="si-remove" style={{ cursor: 'pointer' }} onClick={() => removeCombo(combo.id)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </div>
              </div>
            ))}
            {lines.map(({ product, qty, value }) => (
              <div className="sidebar-item" key={product.id}>
                <div className="si-thumb">
                  <ProductThumb src={product.image} alt={product.name} iconSize={18} padding={3} />
                </div>
                <div className="si-info">
                  <div className="si-name">{product.name}</div>
                  <div className="si-meta">{formatBRL(value)}</div>
                </div>
                <div className="stepper" style={{ flexShrink: 0 }}>
                  <div className="stepbtn" onClick={() => setCartQty(product.id, qty - 1)}>
                    −
                  </div>
                  <div className="qty">{qty}</div>
                  <div className="stepbtn" onClick={() => setCartQty(product.id, qty + 1)}>
                    +
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
        <WebModal title="Em qual carrinho?" onClose={() => setPickerOpen(false)} width={420}
          footer={
            <>
              <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={() => setPickerOpen(false)}>
                Cancelar
              </div>
              <div className="btn-primary" style={{ cursor: 'pointer' }} onClick={confirmPicker}>
                Confirmar
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
