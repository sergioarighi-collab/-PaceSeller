import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { Toast } from '../../components/desktop/Toast'
import { ConfirmModal } from '../../components/desktop/ConfirmModal'
import { products, samePeriodLastYearQty } from '../../lib/data'
import { useAppStore, pedidoActionKind, pedidoPares, pedidoStatusBadge } from '../../lib/store'
import { GRADE_MINIMA_PARES } from '../../lib/types'
import { deltaInfo } from '../../lib/productLines'
import { formatBRL } from '../../lib/format'

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
  const startEditPedido = useAppStore((s) => s.startEditPedido)
  const sendPedidoToRepresentante = useAppStore((s) => s.sendPedidoToRepresentante)
  const setRepCanEdit = useAppStore((s) => s.setRepCanEdit)
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]
  const pedido = cart.pedido

  function shopMoreForThisCarrinho() {
    setActiveCarrinho(cart.id)
    navigate('/catalogo')
  }

  const [savedToast, setSavedToast] = useState(false)
  // "Editar no drawer" num pedido "Aguardando Ana" reabre a aprovação (ver commitCartToCarrinho em
  // store.ts) — avisa antes de deixar entrar, em vez de simplesmente voltar o status sem avisar.
  const [confirmEditAguardando, setConfirmEditAguardando] = useState(false)

  function handleEditarNoDrawer() {
    if (pedido.status === 'aguardando') setConfirmEditAguardando(true)
    else startEditPedido(cart.id, pedido.id)
  }

  const pares = pedidoPares(pedido)
  const gradeOk = pares >= GRADE_MINIMA_PARES
  const statusBadge = pedidoStatusBadge(pedido, cart.representative)

  // Compara os itens deste carrinho com o que a loja comprou no mesmo período do ano passado —
  // só entram os SKUs com dado histórico (ver samePeriodLastYearQty em lib/data.ts), e só se o
  // pedido ainda não foi pago (pago já foi decidido, não faz sentido re-questionar "antes de fechar").
  const yoyRows =
    pedido.status === 'pago'
      ? []
      : pedido.items
          .filter((item) => samePeriodLastYearQty[item.productId] !== undefined)
          .map((item) => ({
            productId: item.productId,
            name: item.name.replace('Tênis Tesla ', ''),
            prevQty: samePeriodLastYearQty[item.productId],
            nowQty: item.qty,
            delta: deltaInfo(samePeriodLastYearQty[item.productId], item.qty),
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
              Compartilhado com <b>{cart.representative}</b> — ela acompanha e comenta esse pedido
            </div>
          </div>

          <div className="ordergroup">
            <div className="og-head">
              <div>
                <div className="og-title">{pedido.label}</div>
                <div className="og-meta">
                  {conditionLabel[pedido.paymentCondition ?? '30']} · {pedido.deliveryEstimateDays > 0 ? `Entrega em ${pedido.deliveryEstimateDays} dias úteis` : 'Entrega imediata'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* "Editar no drawer" aparece em qualquer pedido editável — rascunho incompleto,
                    "Pronto pra enviar" (pedidoActionKind === 'enviar') ou já enviado/sugerido e
                    aguardando decisão (pedidoActionKind === 'revisar') — independente de já ter
                    sido enviado pro representante ou não. Só some quando o pedido já foi pago
                    (pedidoActionKind === 'acompanhar'), que não faz mais sentido editar. Antes,
                    um pedido que já batia a grade mínima ou estava em "aguardando" via sugestão do
                    representante só mostrava outras ações aqui, sem nenhum jeito visível de editar
                    (usuário relatou não achar como editar). */}
                {pedidoActionKind(pedido) !== 'acompanhar' && (
                  <span
                    style={{ fontSize: 11.5, color: 'var(--info)', fontWeight: 500, cursor: 'pointer' }}
                    onClick={handleEditarNoDrawer}
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
                <span className={`badge ${statusBadge.tone === 'positive' ? 'pos' : statusBadge.tone}`}>{statusBadge.label}</span>
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
          <div className="stotal">{pares} pares</div>
          <div className="ssub">{formatBRL(pedido.total)}</div>
          <div className="bubble">
            O carrinho fecha e paga como um pedido só — na hora de pagar você pode dividir o valor entre mais de uma forma (parte no cartão, parte no PIX, por exemplo)
          </div>

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
            <div
              className="btn-secondary"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/carrinhos/${cart.id}/${pedido.id}/chat`)}
            >
              Falar com {cart.representative}
            </div>
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

      {savedToast && (
        <Toast title="Carrinho salvo como rascunho" sub={`${cart.name} continua aberto — volte quando quiser`} onClose={() => setSavedToast(false)} />
      )}

      {confirmEditAguardando && (
        <ConfirmModal
          title="Editar pedido aguardando aprovação"
          message={`Esse pedido está aguardando aprovação de ${cart.representative}. Editar agora volta ele pra rascunho — você vai precisar enviar de novo depois de ajustar.`}
          confirmLabel="Editar mesmo assim"
          onCancel={() => setConfirmEditAguardando(false)}
          onConfirm={() => {
            setConfirmEditAguardando(false)
            startEditPedido(cart.id, pedido.id)
          }}
        />
      )}
    </DesktopPage>
  )
}
