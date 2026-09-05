import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { WebModal } from '../../components/desktop/WebModal'
import { Toast } from '../../components/desktop/Toast'
import { products, samePeriodLastYearQty } from '../../lib/data'
import { useAppStore, pedidoActionKind } from '../../lib/store'
import { GRADE_MINIMA_PARES } from '../../lib/types'
import { deltaInfo } from '../../lib/productLines'
import { formatBRL } from '../../lib/format'

const NEW_CARRINHO = 'novo' as const

const conditionLabel: Record<string, string> = {
  '30': '30/60/90 dias',
  '60': '30/60/90 dias',
  '90': '30/60/90 dias',
  'a-vista': 'Boleto à vista −3%',
}

export function CarrinhoDetail() {
  const navigate = useNavigate()
  const { cartId } = useParams()
  const carrinhos = useAppStore((s) => s.carrinhos)
  const setActiveCarrinho = useAppStore((s) => s.setActiveCarrinho)
  const movePedidoToCarrinho = useAppStore((s) => s.movePedidoToCarrinho)
  const startEditPedido = useAppStore((s) => s.startEditPedido)
  const sendPedidoToRepresentante = useAppStore((s) => s.sendPedidoToRepresentante)
  const setRepCanEdit = useAppStore((s) => s.setRepCanEdit)
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]

  function shopMoreForThisCarrinho() {
    setActiveCarrinho(cart.id)
    navigate('/catalogo')
  }

  // Correção pontual pro caso do pedido ter caído no carrinho errado (o drawer decide sozinho,
  // sem perguntar — ver OrderDrawer.tsx) — só existe destino pra mover se houver outro carrinho.
  const otherCarrinhos = carrinhos.filter((c) => c.id !== cart.id)
  const [movingPedidoId, setMovingPedidoId] = useState<string | null>(null)
  const [movePicked, setMovePicked] = useState<string>(NEW_CARRINHO)
  const [savedToast, setSavedToast] = useState(false)

  function openMovePicker(pedidoId: string) {
    setMovingPedidoId(pedidoId)
    setMovePicked(otherCarrinhos[0]?.id ?? NEW_CARRINHO)
  }

  function confirmMove() {
    if (!movingPedidoId) return
    const targetId = movePedidoToCarrinho(cart.id, movingPedidoId, movePicked === NEW_CARRINHO ? null : movePicked)
    setMovingPedidoId(null)
    if (targetId) navigate(`/carrinhos/${targetId}`)
  }

  const totalItems = cart.pedidos.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.qty, 0), 0)
  const totalValue = cart.pedidos.reduce((sum, p) => sum + p.total, 0)

  // Compara os itens deste carrinho com o que a loja comprou no mesmo período do ano passado —
  // só entram os SKUs com dado histórico (ver samePeriodLastYearQty em lib/data.ts) de pedidos
  // ainda não fechados (pago já foi decidido, não faz sentido re-questionar "antes de fechar").
  const itemsByProduct = new Map<string, { name: string; qty: number }>()
  for (const pedido of cart.pedidos) {
    if (pedido.status === 'pago') continue
    for (const item of pedido.items) {
      const existing = itemsByProduct.get(item.productId)
      if (existing) existing.qty += item.qty
      else itemsByProduct.set(item.productId, { name: item.name, qty: item.qty })
    }
  }
  const yoyRows = Array.from(itemsByProduct.entries())
    .filter(([productId]) => samePeriodLastYearQty[productId] !== undefined)
    .map(([productId, { name, qty }]) => ({
      productId,
      name: name.replace('Tênis Tesla ', ''),
      prevQty: samePeriodLastYearQty[productId],
      nowQty: qty,
      delta: deltaInfo(samePeriodLastYearQty[productId], qty),
    }))

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: 'Meus Carrinhos', to: '/carrinhos' }, { label: cart.name }]} />
      <div className="web-app-layout">
        <div className="web-content">
          <div className="cartswitcher" style={{ marginTop: 16 }}>
            {carrinhos.map((c) => (
              <div key={c.id} className={`tab ${c.id === cart.id ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => navigate(`/carrinhos/${c.id}`)}>
                {c.name}
              </div>
            ))}
            <div
              className="tab new"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setActiveCarrinho(null)
                navigate('/catalogo')
              }}
            >
              + Novo carrinho
            </div>
          </div>

          <div className="sharebanner">
            <div className="avatar">AN</div>
            <div>
              Compartilhado com <b>{cart.representative}</b> (representante da sua loja) · ela vê e comenta os {cart.pedidos.length > 1 ? 'pedidos abaixo' : 'pedido abaixo'}
            </div>
          </div>

          {cart.pedidos.length > 1 && (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 22 }}>
              Este carrinho tem {cart.pedidos.length} pedidos, com prazos e pagamentos diferentes
            </div>
          )}

          {cart.pedidos.map((pedido) => {
            const pares = pedido.items.reduce((s, i) => s + i.qty, 0)
            const gradeOk = pares >= GRADE_MINIMA_PARES
            return (
              <div className="ordergroup" key={pedido.id}>
                <div className="og-head">
                  <div>
                    <div className="og-title">{pedido.label}</div>
                    <div className="og-meta">
                      {conditionLabel[pedido.paymentCondition ?? '30']} · {pedido.deliveryEstimateDays > 0 ? `Entrega em ${pedido.deliveryEstimateDays} dias úteis` : 'Entrega imediata'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {pedidoActionKind(pedido) === 'editar' && (
                      <span
                        style={{ fontSize: 11.5, color: 'var(--info)', fontWeight: 500, cursor: 'pointer' }}
                        onClick={() => startEditPedido(cart.id, pedido.id)}
                      >
                        Editar no drawer
                      </span>
                    )}
                    {pedidoActionKind(pedido) === 'enviar' && (
                      <span
                        style={{ fontSize: 11.5, color: 'var(--positive)', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => sendPedidoToRepresentante(cart.id, pedido.id)}
                      >
                        Enviar pro representante
                      </span>
                    )}
                    {otherCarrinhos.length > 0 && pedido.status !== 'pago' && (
                      <span
                        style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                        onClick={() => openMovePicker(pedido.id)}
                      >
                        Mover pedido
                      </span>
                    )}
                    <span className={`badge ${pedido.status === 'pago' ? 'pos' : 'neutral'}`}>
                      {pedido.status === 'pago' ? 'Confirmado' : pedido.status === 'aguardando' ? 'Aguardando aprovação' : 'Rascunho'}
                    </span>
                  </div>
                </div>
                <div className="og-body">
                  {pedido.items.map((item, i) => {
                    const product = products.find((p) => p.id === item.productId)
                    const outOfStock = product && item.qty > product.stockPares
                    return (
                      <div className="cartline" key={i}>
                        <div>
                          <div className="cname">{item.name}</div>
                          <div className="cmeta">
                            qtd {item.qty} · grade {item.grade}
                          </div>
                          {outOfStock && (
                            <div className="cmeta" style={{ color: 'var(--risk)' }}>
                              Só restam {product.stockPares} pares em estoque — pedido demorou pra fechar
                            </div>
                          )}
                        </div>
                        <div className="cval">{formatBRL(item.value)}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="og-footer">
                  <span className="og-total">
                    Subtotal: {formatBRL(pedido.total)}
                    {pedido.discount > 0 && <span style={{ color: 'var(--positive)', fontWeight: 500 }}> (−3%)</span>}
                  </span>
                  <div
                    className={gradeOk ? 'btn-primary' : 'btn-secondary'}
                    style={{ width: 180, cursor: gradeOk ? 'pointer' : 'not-allowed', opacity: gradeOk ? 1 : 0.6 }}
                    onClick={() => gradeOk && navigate(`/carrinhos/${cart.id}/${pedido.id}/pagamento`)}
                  >
                    Ir para pagamento
                  </div>
                </div>
                <div className={`grademin ${gradeOk ? 'ok' : 'warn'}`}>
                  {gradeOk ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      {pares} pares — grade mínima atingida
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v3M12 16h.01" />
                        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                      </svg>
                      {pares} de {GRADE_MINIMA_PARES} pares — faltam {GRADE_MINIMA_PARES - pares} pra atingir a grade mínima
                    </>
                  )}
                </div>
              </div>
            )
          })}

          <div className="newordergroup" style={{ cursor: 'pointer' }} onClick={shopMoreForThisCarrinho}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Criar novo pedido neste carrinho
          </div>

          {cart.lastComment && (
            <div className="activitynote">
              <div className="aavatar">AN</div>
              <div className="atext">
                <span className="aname">{cart.lastComment.author}:</span> {cart.lastComment.text}
                <div className="atime">{cart.lastComment.timeLabel}</div>
              </div>
            </div>
          )}

          <div className="qualitybox">
            <div className="qtitle">Antes de fechar</div>
            <div className="qline">
              <div className="qleft">
                <span className="ck" style={{ background: 'var(--positive-dim)', color: 'var(--positive)' }}>
                  ✓
                </span>
                Mix balanceado entre categorias
              </div>
            </div>
            <div className="qline">
              <div className="qleft">
                <span className="ck" style={{ background: 'var(--risk-dim)', color: 'var(--risk)' }}>
                  !
                </span>
                Categoria feminina sub-representada
              </div>
              <div className="miniaction" style={{ cursor: 'pointer' }} onClick={shopMoreForThisCarrinho}>
                + Adicionar 4 itens
              </div>
            </div>
            {yoyRows.length > 0 && (
              <div className="qline" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <div className="qleft">
                  <span className="ck" style={{ background: 'var(--info-dim)', color: 'var(--info)' }}>
                    ↕
                  </span>
                  Comparado ao mesmo período do ano passado
                </div>
                <div className="yoylist">
                  {yoyRows.map((r) => (
                    <div className="yoyrow" key={r.productId}>
                      <span>
                        <b>{r.name}</b> · ano passado {r.prevQty} pares
                      </span>
                      <span className={`deltabadge ${r.delta.tone}`}>
                        {r.nowQty} pares · {r.delta.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="web-sidebar">
          <div className="stitle">Carrinho: {cart.name.toLowerCase()}</div>
          <div className="stotal">{totalItems} pares</div>
          <div className="ssub">
            {formatBRL(totalValue)} · {cart.pedidos.length} pedido{cart.pedidos.length > 1 ? 's' : ''}
          </div>
          <div className="bubble">Cada pedido fecha e paga separado — o carrinho continua aberto até você decidir salvar ou enviar tudo</div>

          <div
            className="permswitch"
            style={{ marginTop: 18 }}
            onClick={() => setRepCanEdit(cart.id, !cart.repCanEdit)}
            title="Simulado: hoje não existe desktop do representante pra aplicar essa permissão de verdade"
          >
            <div className={`swtrack ${cart.repCanEdit ? '' : 'off'}`}>
              <div className="knob" />
            </div>
            {cart.representative} pode editar este carrinho
          </div>

          <div className="sbtns">
            <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={() => setSavedToast(true)}>
              Salvar carrinho como rascunho
            </div>
            <a
              href="#"
              style={{ display: 'block', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}
              onClick={(e) => {
                e.preventDefault()
                shopMoreForThisCarrinho()
              }}
            >
              ← Continuar comprando
            </a>
          </div>
        </div>
      </div>

      {movingPedidoId && (
        <WebModal
          title="Mover pedido pra qual carrinho?"
          onClose={() => setMovingPedidoId(null)}
          width={420}
          footer={
            <>
              <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={() => setMovingPedidoId(null)}>
                Cancelar
              </div>
              <div className="btn-primary" style={{ cursor: 'pointer' }} onClick={confirmMove}>
                Mover
              </div>
            </>
          }
        >
          <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {otherCarrinhos.map((c) => (
              <div
                key={c.id}
                className={`optioncard ${movePicked === c.id ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setMovePicked(c.id)}
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
              className={`optioncard ${movePicked === NEW_CARRINHO ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setMovePicked(NEW_CARRINHO)}
            >
              <div className="oicon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <div>
                <div className="otitle">Novo carrinho</div>
                <div className="osub">Tira o pedido daqui e cria um carrinho separado só pra ele</div>
              </div>
            </div>
          </div>
        </WebModal>
      )}

      {savedToast && (
        <Toast title="Carrinho salvo como rascunho" sub={`${cart.name} continua aberto — volte quando quiser`} onClose={() => setSavedToast(false)} />
      )}
    </DesktopPage>
  )
}
