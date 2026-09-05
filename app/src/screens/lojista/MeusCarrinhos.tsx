import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { ProductThumb } from '../../components/desktop/ProductThumb'
import { useAppStore, cartSummary, comboSummary, resolveTargetCarrinhoId, pedidoPares, pedidoActionKind } from '../../lib/store'
import { GRADE_MINIMA_PARES } from '../../lib/types'
import type { Carrinho, Pedido } from '../../lib/types'
import { products } from '../../lib/data'
import { formatBRL } from '../../lib/format'

const filters = ['Todos', 'Rascunho', 'Aguardando aprovação', 'Confirmados']

function aggregateStatus(pedidos: Carrinho['pedidos']) {
  if (pedidos.every((p) => p.status === 'pago')) return 'confirmado'
  if (pedidos.some((p) => p.status === 'aguardando')) return 'aguardando'
  return 'rascunho'
}

const statusLabel: Record<Pedido['status'], string> = {
  rascunho: 'Rascunho',
  aguardando: 'Aguardando aprovação',
  aprovado: 'Aprovado',
  pago: 'Confirmado',
}

const EXPIRA_APOS_DIAS = 7

export function MeusCarrinhos() {
  const navigate = useNavigate()
  const carrinhos = useAppStore((s) => s.carrinhos)
  const setActiveCarrinho = useAppStore((s) => s.setActiveCarrinho)
  const startEditPedido = useAppStore((s) => s.startEditPedido)
  const sendPedidoToRepresentante = useAppStore((s) => s.sendPedidoToRepresentante)
  const openOrderDrawer = useAppStore((s) => s.openOrderDrawer)
  const cartItems = useAppStore((s) => s.cartItems)
  const cartCombos = useAppStore((s) => s.cartCombos)
  const activeCarrinhoId = useAppStore((s) => s.activeCarrinhoId)
  const editingPedido = useAppStore((s) => s.editingPedido)
  const [filter, setFilter] = useState(filters[0])

  const rows = carrinhos
    .map((c) => {
      const status = aggregateStatus(c.pedidos)
      const totalItems = c.pedidos.reduce((sum, p) => sum + pedidoPares(p), 0)
      const totalValue = c.pedidos.reduce((sum, p) => sum + p.total, 0)
      return { cart: c, status, totalItems, totalValue }
    })
    .filter((r) => {
      if (filter === 'Todos') return true
      if (filter === 'Rascunho') return r.status === 'rascunho'
      if (filter === 'Aguardando aprovação') return r.status === 'aguardando'
      return r.status === 'confirmado'
    })

  // Pedido em montagem no drawer (ainda não é um Pedido de verdade) — mostrado como pendente no
  // card do carrinho pra onde ele está indo, e somado no KPI "Em andamento" (mesma pergunta que o
  // Sérgio levantou: o total não incluía o que já estava na mão, no drawer).
  const { totalItems: draftItemsQty, totalValue: draftItemsValue } = cartSummary(cartItems)
  const { totalItems: draftCombosQty, totalValue: draftCombosValue } = comboSummary(cartCombos)
  const draftPares = draftItemsQty + draftCombosQty
  const draftValue = draftItemsValue + draftCombosValue
  const draftTargetId = !editingPedido && draftPares > 0 ? resolveTargetCarrinhoId(carrinhos, activeCarrinhoId) : null

  const pedidosAoTodo = carrinhos.reduce((sum, c) => sum + c.pedidos.length, 0)
  const prontosParaEnviar = carrinhos.reduce(
    (sum, c) => sum + c.pedidos.filter((p) => p.status === 'rascunho' && pedidoPares(p) >= GRADE_MINIMA_PARES).length,
    0,
  )
  const emAndamento =
    carrinhos.reduce((sum, c) => sum + c.pedidos.filter((p) => p.status !== 'pago').reduce((s, p) => s + p.total, 0), 0) + draftValue

  // Pedidos prontos pra enviar (rascunho + grade batida) e pedidos que a Ana montou e ainda
  // esperam revisão — as duas ações em lote que emprestam visibilidade real ao "fechar mais de um
  // carrinho, com vários pedidos" que motivou esse redesenho.
  const readyToSend = carrinhos.flatMap((c) => c.pedidos.filter((p) => p.status === 'rascunho' && pedidoPares(p) >= GRADE_MINIMA_PARES).map((p) => ({ c, p })))
  const awaitingReview = carrinhos.flatMap((c) => c.pedidos.filter((p) => p.status === 'aguardando' && p.suggestedBy === 'representante').map((p) => ({ c, p })))

  function pedidoAction(cart: Carrinho, pedido: Pedido) {
    switch (pedidoActionKind(pedido)) {
      case 'acompanhar':
        return { label: 'Acompanhar', tone: 'default' as const, onClick: () => navigate(`/carrinhos/${cart.id}/${pedido.id}/acompanhamento`) }
      case 'revisar':
        return { label: 'Revisar e aprovar', tone: 'primary' as const, onClick: () => navigate(`/carrinhos/${cart.id}`) }
      case 'enviar':
        return { label: 'Enviar', tone: 'primary' as const, onClick: () => sendPedidoToRepresentante(cart.id, pedido.id) }
      default:
        return { label: 'Editar no drawer', tone: 'default' as const, onClick: () => startEditPedido(cart.id, pedido.id) }
    }
  }

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: 'Meus Carrinhos' }]} />
      <div className="web-main" style={{ paddingTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Meus carrinhos</h1>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
              {carrinhos.length} carrinhos abertos · com Ana, sua representante
            </div>
          </div>
          <div
            className="btn-primary"
            style={{ width: 180, cursor: 'pointer' }}
            onClick={() => {
              setActiveCarrinho(null)
              navigate('/catalogo')
            }}
          >
            Criar novo carrinho
          </div>
        </div>

        <div className="stattiles">
          <div className="tile">
            <div className="tlabel">Carrinhos abertos</div>
            <div className="tval">{carrinhos.length}</div>
          </div>
          <div className="tile">
            <div className="tlabel">Pedidos ao todo</div>
            <div className="tval">{pedidosAoTodo}</div>
          </div>
          <div className="tile">
            <div className="tlabel">Prontos pra enviar</div>
            <div className="tval" style={{ color: prontosParaEnviar > 0 ? 'var(--positive)' : undefined }}>
              {prontosParaEnviar}
            </div>
          </div>
          <div className="tile">
            <div className="tlabel">Em andamento</div>
            <div className="tval">{formatBRL(emAndamento)}</div>
            {draftPares > 0 && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--info)', marginTop: 3 }}>
                inclui {formatBRL(draftValue)} ainda no drawer
              </div>
            )}
          </div>
        </div>

        {(readyToSend.length > 0 || awaitingReview.length > 0) && (
          <div className="bulkbar">
            {readyToSend.length > 0 && (
              <div className="bulkrow">
                <div className="bicon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="btext">
                  <b>
                    {readyToSend.length} pedido{readyToSend.length > 1 ? 's' : ''} já bate
                    {readyToSend.length > 1 ? 'm' : ''} a grade mínima
                  </b>{' '}
                  e {readyToSend.length > 1 ? 'estão prontos' : 'está pronto'} — {readyToSend[0].c.name}, {readyToSend[0].p.label}
                  {readyToSend.length > 1 ? ` e mais ${readyToSend.length - 1}` : ''}
                </div>
                <div className="bbtn" onClick={() => readyToSend.forEach(({ c, p }) => sendPedidoToRepresentante(c.id, p.id))}>
                  Enviar pro representante
                </div>
              </div>
            )}
            {awaitingReview.length > 0 && (
              <div className="bulkrow review">
                <div className="bicon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <circle cx="12" cy="8" r="3.4" />
                    <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
                  </svg>
                </div>
                <div className="btext">
                  <b>
                    Ana sugeriu {awaitingReview.length} pedido{awaitingReview.length > 1 ? 's' : ''} novo
                    {awaitingReview.length > 1 ? 's' : ''}
                  </b>{' '}
                  — {awaitingReview[0].c.name}, {awaitingReview[0].c.daysSinceActivity > 0 ? `parado há ${awaitingReview[0].c.daysSinceActivity} dias` : 'agora'}{' '}
                  esperando sua revisão
                </div>
                <div className="bbtn" onClick={() => navigate(`/carrinhos/${awaitingReview[0].c.id}`)}>
                  Revisar sugestão
                </div>
              </div>
            )}
          </div>
        )}

        <div className="filterbar" style={{ marginTop: 20 }}>
          {filters.map((f) => (
            <div key={f} className={`chip ${filter === f ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter(f)}>
              {f}
            </div>
          ))}
        </div>

        <div className="cartlist" style={{ maxWidth: 900 }}>
          {rows.map(({ cart }) => {
            const thumbIds = Array.from(new Set(cart.pedidos.flatMap((p) => p.items.map((i) => i.productId).filter((id) => products.some((pr) => pr.id === id)))))
            const isDraftTarget = draftTargetId === cart.id

            return (
              <div className="cart-card" key={cart.id}>
                <div className="cc-top">
                  <div>
                    <div className="cc-name">{cart.name}</div>
                    <div className="cc-meta">
                      Representante: {cart.representative} · Atualizado {cart.updatedAt}
                    </div>
                  </div>
                  <div className="btn-secondary" style={{ width: 100, cursor: 'pointer', display: 'block' }} onClick={() => navigate(`/carrinhos/${cart.id}`)}>
                    Abrir
                  </div>
                </div>

                {thumbIds.length > 0 && (
                  <div className="thumbrow">
                    {thumbIds.slice(0, 4).map((id) => {
                      const product = products.find((p) => p.id === id)
                      if (!product) return null
                      return (
                        <div className="thumb" key={id}>
                          <ProductThumb src={product.image} alt={product.name} iconSize={16} padding={4} />
                        </div>
                      )
                    })}
                    {thumbIds.length > 4 && (
                      <div className="thumb" style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        +{thumbIds.length - 4}
                      </div>
                    )}
                  </div>
                )}

                {cart.pedidos.map((pedido) => {
                  const pares = pedidoPares(pedido)
                  const gradeOk = pares >= GRADE_MINIMA_PARES
                  const gradePct = Math.min(100, Math.round((pares / GRADE_MINIMA_PARES) * 100))
                  const action = pedidoAction(cart, pedido)
                  return (
                    <div className="pedrow" key={pedido.id}>
                      <span className="plabel">{pedido.label}</span>
                      <span className={`pstatus ${pedido.status}`}>{statusLabel[pedido.status]}</span>
                      <div className="pgrade">
                        <div className={`bar ${gradeOk ? 'ok' : ''}`}>
                          <div style={{ width: `${gradePct}%` }} />
                        </div>
                        <span className="pgradetxt">
                          {pares}/{GRADE_MINIMA_PARES} pares
                        </span>
                      </div>
                      <span className="pval">{formatBRL(pedido.total)}</span>
                      <span className={`pact ${action.tone === 'primary' ? 'primary' : ''}`} onClick={action.onClick}>
                        {action.label}
                      </span>
                    </div>
                  )
                })}

                {isDraftTarget && (
                  <div className="pedrow pending">
                    <span className="plabel">No drawer</span>
                    <span className="pstatus pending">Ainda não adicionado</span>
                    <div className="pgrade">
                      <span className="pgradetxt">
                        {draftPares} pares · vai pra este carrinho
                      </span>
                    </div>
                    <span className="pval">{formatBRL(draftValue)}</span>
                    <span className="pact" onClick={openOrderDrawer}>
                      Ver no drawer
                    </span>
                  </div>
                )}

                <div className="signalrow">
                  <span className={`sig ${cart.autoSendOnGradeMinima ? 'pos' : 'neutral'}`}>
                    Envio automático: {cart.autoSendOnGradeMinima ? 'ativado' : 'desativado'}
                  </span>
                  {cart.daysSinceActivity >= EXPIRA_APOS_DIAS && cart.pedidos.some((p) => p.status !== 'pago') && (
                    <span className="sig risk">Parado há {cart.daysSinceActivity} dias — considere revisar</span>
                  )}
                </div>

                {(cart.lastComment || cart.pedidos.some((p) => p.suggestedBy === 'representante')) && (
                  <div className="repbar">
                    <div className="ravatar">AN</div>
                    <div className="rtext">
                      {cart.lastComment ? (
                        <>
                          <b>{cart.lastComment.author}:</b> {cart.lastComment.text} <span className="rtime">{cart.lastComment.timeLabel}</span>
                        </>
                      ) : (
                        <>
                          <b>Ana</b> montou um pedido pra você revisar.
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {rows.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', padding: '64px 0' }}>Nenhum carrinho nessa categoria</div>
          )}
        </div>
      </div>
    </DesktopPage>
  )
}
