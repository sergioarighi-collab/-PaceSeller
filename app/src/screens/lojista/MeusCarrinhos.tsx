import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { PersonaTopNav } from '../../components/desktop/PersonaTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { ProductThumb } from '../../components/desktop/ProductThumb'
import { CartIcon } from '../../components/desktop/CartIcon'
import { ConfirmModal } from '../../components/desktop/ConfirmModal'
import { Toast } from '../../components/desktop/Toast'
import {
  useAppStore,
  cartSummary,
  comboSummary,
  resolveTargetCarrinhoId,
  pedidoPares,
  pedidoActionKind,
  pedidoStatusBadge,
  pedidoAguardandoAprovacaoRep,
} from '../../lib/store'
import { GRADE_MINIMA_PARES } from '../../lib/types'
import type { Carrinho, Pedido } from '../../lib/types'
import { products } from '../../lib/data'
import { formatBRL } from '../../lib/format'

const EXPIRA_APOS_DIAS = 7

// Compartilhado vs não compartilhado (out/2026, pedido do usuário: "no módulo carrinho vamos
// identificar o compartilhamento do carrinho... separar em duas partes") — substitui os filtros
// por aba (Todos/Rascunho/Aguardando Ana/Aguardando você/Com a Tesla) por duas seções fixas.
// Definição confirmada com o usuário, mesma que o Quadro do Radar já usava antes de ser removido:
// "compartilhado" = pedido.status !== 'rascunho' (o outro lado já vê e pode mexer); "não
// compartilhado" = ainda em rascunho, só quem monta vê.
function ehCompartilhado(pedido: Pedido): boolean {
  return pedido.status !== 'rascunho'
}

// Tag simplificada pro representante dentro de "Compartilhados" (out/2026, pedido do usuário:
// "no compartilhado vale uma tag, aguardando o cliente, ou finalizado pelo cliente") — "cliente" é
// o lojista do ponto de vista dela. Resume os 3 status não-rascunho em 2 estados: a bola está com
// o lojista (precisa decidir ou pagar) ou ele já fez a parte dele (mandou pra revisão, ou já
// pagou). Só faz sentido pro representante — o lojista não tem "cliente" aqui, continua vendo o
// `pedidoStatusBadge` de sempre (mais granular, já testado).
function clienteTag(pedido: Pedido): { label: string; tone: 'warn' | 'positive' } {
  const aguardandoCliente = (pedido.status === 'aguardando' && pedido.suggestedBy === 'representante') || pedido.status === 'aprovado'
  return aguardandoCliente ? { label: 'Aguardando o cliente', tone: 'warn' } : { label: 'Finalizado pelo cliente', tone: 'positive' }
}

export function MeusCarrinhos() {
  const navigate = useNavigate()
  const carrinhos = useAppStore((s) => s.carrinhos)
  const setActiveCarrinho = useAppStore((s) => s.setActiveCarrinho)
  const startEditPedido = useAppStore((s) => s.startEditPedido)
  const sendPedidoToRepresentante = useAppStore((s) => s.sendPedidoToRepresentante)
  const aprovarPedido = useAppStore((s) => s.aprovarPedido)
  const openOrderDrawer = useAppStore((s) => s.openOrderDrawer)
  const cartItems = useAppStore((s) => s.cartItems)
  const cartCombos = useAppStore((s) => s.cartCombos)
  const activeCarrinhoId = useAppStore((s) => s.activeCarrinhoId)
  const editingPedido = useAppStore((s) => s.editingPedido)
  const persona = useAppStore((s) => s.persona)
  // Quando o representante chega aqui em modo loja (set/2026, "Carrinhos no header: escopo
  // dinâmico" — ver RepTopNav.tsx), precisa saber de qual loja são esses carrinhos pra não ficar
  // ambíguo (essa mesma tela também é "Meus carrinhos" do lojista, sem nenhuma loja pra nomear).
  const lojistas = useAppStore((s) => s.lojistas)
  const activeLojistaId = useAppStore((s) => s.activeLojistaId)
  const lojistaAtiva = lojistas.find((l) => l.id === activeLojistaId)
  // "Editar no drawer" num pedido "Aguardando Ana" reabre a aprovação (ver commitCartToCarrinho em
  // store.ts) — avisa antes de deixar entrar. Guarda o carrinho pendente de confirmação (não um
  // bool solto) porque a lista tem N linhas e cada uma pode disparar essa mesma confirmação.
  const [confirmEditCart, setConfirmEditCart] = useState<Carrinho | null>(null)
  // Feedback do envio em lote (banner "X pedidos já batem a grade mínima" → botão único manda
  // vários pedidos de uma vez): sem toast, o único sinal de que aconteceu algo era o banner
  // sumir e os badges mudarem — fácil de não notar quando é mais de um pedido de uma vez só.
  // Envio individual (dentro do próprio CarrinhoDetail) não ganhou o mesmo toast de propósito —
  // ali o CTA que some e o badge que muda já estão bem visíveis na mesma tela que o usuário
  // acabou de clicar, então um toast a mais seria redundante.
  const [sendToast, setSendToast] = useState<{ title: string; sub: string } | null>(null)

  const compartilhados = carrinhos.filter((c) => ehCompartilhado(c.pedido))
  const naoCompartilhados = carrinhos.filter((c) => !ehCompartilhado(c.pedido))

  // Pedido em montagem no drawer (ainda não é um Pedido de verdade) — mostrado como pendente no
  // card do carrinho pra onde ele está indo, e somado no KPI "Em andamento" (mesma pergunta que o
  // Sérgio levantou: o total não incluía o que já estava na mão, no drawer).
  const { totalItems: draftItemsQty, totalValue: draftItemsValue } = cartSummary(cartItems)
  const { totalItems: draftCombosQty, totalValue: draftCombosValue } = comboSummary(cartCombos)
  const draftPares = draftItemsQty + draftCombosQty
  const draftValue = draftItemsValue + draftCombosValue
  const draftTargetId = !editingPedido && draftPares > 0 ? resolveTargetCarrinhoId(carrinhos, activeCarrinhoId) : null

  const emAndamento = carrinhos.filter((c) => c.pedido.status !== 'pago').reduce((sum, c) => sum + c.pedido.total, 0) + draftValue

  // Pedidos prontos pra enviar (rascunho + grade batida) e pedidos que a Ana montou e ainda
  // esperam revisão — as duas ações em lote que emprestam visibilidade real ao "fechar mais de um
  // carrinho de uma vez" que motivou esse redesenho.
  const readyToSend = carrinhos.filter((c) => c.pedido.status === 'rascunho' && pedidoPares(c.pedido) >= GRADE_MINIMA_PARES).map((c) => ({ c, p: c.pedido }))
  const awaitingReview = carrinhos.filter((c) => c.pedido.status === 'aguardando' && c.pedido.suggestedBy === 'representante').map((c) => ({ c, p: c.pedido }))

  // Ciente de persona (set/2026, "Carrinhos no header: escopo dinâmico" tornou essa tela
  // alcançável pela representante) — mesmo princípio já usado em `CarrinhoDetail.tsx`: do lado da
  // Ana, as únicas ações de verdade são "Aprovar pedido" (quando é a vez dela) e "Acompanhar"
  // (read-only). O resto ("Enviar", "Editar no drawer", "Revisar e aprovar" vendo o próprio pedido
  // sugerido por ela) são ações do LOJISTA sobre o carrinho dele — mostrar isso pra Ana faria
  // parecer que ela deveria "enviar pra si mesma" ou editar em nome dele, o que ainda não existe
  // (ver nota em CarrinhoDetail.tsx). Sem ação disponível, retorna `null` — a linha só mostra o
  // badge de status, sem link clicável.
  function pedidoAction(cart: Carrinho, pedido: Pedido) {
    if (persona === 'representante') {
      if (pedidoActionKind(pedido) === 'acompanhar') {
        return { label: 'Acompanhar', tone: 'default' as const, onClick: () => navigate(`/carrinhos/${cart.id}/${pedido.id}/acompanhamento`) }
      }
      if (pedidoAguardandoAprovacaoRep(pedido)) {
        return { label: 'Aprovar pedido', tone: 'primary' as const, onClick: () => aprovarPedido(cart.id) }
      }
      return null
    }
    switch (pedidoActionKind(pedido)) {
      case 'acompanhar':
        return { label: 'Acompanhar', tone: 'default' as const, onClick: () => navigate(`/carrinhos/${cart.id}/${pedido.id}/acompanhamento`) }
      case 'revisar':
        return { label: 'Revisar e aprovar', tone: 'primary' as const, onClick: () => navigate(`/carrinhos/${cart.id}`) }
      case 'enviar':
        return { label: 'Enviar', tone: 'primary' as const, onClick: () => sendPedidoToRepresentante(cart.id, pedido.id) }
      default:
        if (pedido.status === 'aguardando') {
          return { label: 'Editar no drawer', tone: 'default' as const, onClick: () => setConfirmEditCart(cart) }
        }
        return { label: 'Editar no drawer', tone: 'default' as const, onClick: () => startEditPedido(cart.id, pedido.id) }
    }
  }

  // Uma seção (Compartilhados / Não compartilhados) — mesma linha `.cr-row` de sempre, só que
  // agrupada em dois blocos em vez de filtrada por aba (ver `ehCompartilhado`/`clienteTag` no topo
  // do arquivo). Cabeçalho com contagem pra cada bloco se identificar sozinho mesmo rolando a
  // página.
  function renderSecao(titulo: string, lista: Carrinho[], vazio: string) {
    return (
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{titulo}</h2>
          <span className="cr-badge tone-neutral">{lista.length}</span>
        </div>
        {lista.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', padding: '32px 0', background: 'var(--surface-2)', borderRadius: 12 }}>
            {vazio}
          </div>
        ) : (
          <div className="cr-list" style={{ maxWidth: 900 }}>
            {lista.map((cart) => {
              const pedido = cart.pedido
              const thumbIds = Array.from(new Set(pedido.items.map((i) => i.productId).filter((id) => products.some((pr) => pr.id === id))))
              const isDraftTarget = draftTargetId === cart.id
              const pares = pedidoPares(pedido)
              const gradeOk = pares >= GRADE_MINIMA_PARES
              const gradePct = Math.min(100, Math.round((pares / GRADE_MINIMA_PARES) * 100))
              const action = pedidoAction(cart, pedido)
              // Tag simplificada "aguardando/finalizado pelo cliente" só pro representante, só nos
              // já compartilhados — ver `clienteTag` no topo do arquivo. Em qualquer outro caso
              // (lojista, ou rascunho ainda não compartilhado) continua o `pedidoStatusBadge` de
              // sempre, mais granular.
              const badge =
                persona === 'representante' && ehCompartilhado(pedido) ? clienteTag(pedido) : pedidoStatusBadge(pedido, cart.representative, persona === 'representante')
              const parado = cart.daysSinceActivity >= EXPIRA_APOS_DIAS && pedido.status !== 'pago'

              return (
                <div className="cr-row" key={cart.id} onClick={() => navigate(`/carrinhos/${cart.id}`)}>
                  <div className="cr-main">
                    <div className={`cr-icon tone-${badge.tone}`}>
                      <CartIcon />
                    </div>
                    <div className="cr-info">
                      <div className="cr-nameline">
                        <span className="cr-name">{cart.name}</span>
                        <span className={`cr-badge tone-${badge.tone}`}>{badge.label}</span>
                      </div>
                      <div className="cr-meta">
                        Representante: {cart.representative} · Atualizado {cart.updatedAt}
                      </div>
                    </div>
                    <div className="cr-grade">
                      <div className={`cr-bar ${gradeOk ? 'ok' : ''}`}>
                        <div style={{ width: `${gradePct}%` }} />
                      </div>
                      <span className="cr-gradetxt">
                        {pares}/{GRADE_MINIMA_PARES}
                      </span>
                    </div>
                    <div className="cr-value">{formatBRL(pedido.total)}</div>
                    <div className="cr-actionslot">
                      {action && (
                        <span
                          className={`cr-action ${action.tone === 'primary' ? 'primary' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            action.onClick()
                          }}
                        >
                          {action.label}
                        </span>
                      )}
                    </div>
                    <svg className="cr-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.4">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </div>

                  {thumbIds.length > 0 && (
                    <div className="cr-thumbs">
                      {thumbIds.slice(0, 5).map((id) => {
                        const product = products.find((p) => p.id === id)
                        if (!product) return null
                        return (
                          <div className="thumb" key={id}>
                            <ProductThumb src={product.image} alt={product.name} iconSize={16} padding={2} />
                          </div>
                        )
                      })}
                      {thumbIds.length > 5 && (
                        <div className="thumb" style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>
                          +{thumbIds.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  {isDraftTarget && (
                    <div className="cr-sub pending" onClick={(e) => e.stopPropagation()}>
                      <span>
                        {draftPares} pares ainda no drawer, vão pra este carrinho ({formatBRL(draftValue)}) —{' '}
                        <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={openOrderDrawer}>
                          ver no drawer
                        </span>
                      </span>
                    </div>
                  )}

                  {parado && (
                    <div className="cr-sub warn">
                      <span>Parado há {cart.daysSinceActivity} dias — considere revisar</span>
                    </div>
                  )}

                  {(cart.lastComment || pedido.suggestedBy === 'representante') && (
                    <div className="cr-sub">
                      <div className="cr-avatar">AN</div>
                      {cart.lastComment ? (
                        <span>
                          <b>{cart.lastComment.author}:</b> {cart.lastComment.text}{' '}
                          <span style={{ color: 'var(--text-tertiary)' }}>· {cart.lastComment.timeLabel}</span>
                        </span>
                      ) : persona === 'representante' ? (
                        <span>
                          <b>Você</b> montou esse pedido — aguardando o lojista revisar.
                        </span>
                      ) : (
                        <span>
                          <b>Ana</b> montou um pedido pra você revisar.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <DesktopPage>
      <PersonaTopNav />
      <Breadcrumb
        items={
          persona === 'representante'
            ? [{ label: 'Radar', to: '/rep/radar' }, { label: lojistaAtiva?.name ?? '' }]
            : [{ label: 'Radar', to: '/radar' }, { label: 'Meus Carrinhos' }]
        }
      />
      <div className="web-main" style={{ paddingTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
              {persona === 'representante' ? `Carrinhos de ${lojistaAtiva?.name ?? 'carregando...'}` : 'Meus carrinhos'}
            </h1>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
              {persona === 'representante' ? (
                <>{carrinhos.length} carrinhos abertos nessa loja · Em andamento: {formatBRL(emAndamento)}</>
              ) : (
                <>
                  {carrinhos.length} carrinhos abertos · Em andamento: {formatBRL(emAndamento)} · com Ana, sua representante
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {/* Módulo "Enviados" (out/2026, pedido do usuário) — página própria com só os carrinhos
                `pago`, não mais uma 3ª seção aqui dentro: "Compartilhados" já mistura aguardando/
                aprovado/pago, enfiar mais uma distinção ali ia poluir a tela que acabamos de
                simplificar. Link secundário, não compete com "Criar novo carrinho". */}
            <div className="btn-secondary" style={{ width: 150, cursor: 'pointer' }} onClick={() => navigate('/carrinhos/enviados')}>
              Ver enviados
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
        </div>

        {/* "Enviar pro representante" é ação do lojista sobre o próprio rascunho — escondida da
            Ana quando ela vê essa lista em modo loja (set/2026, mesmo princípio do `pedidoAction`
            acima: ver nota ali). O bloco "Ana sugeriu..." continua, só com o texto/botão ajustados
            pra quem está lendo (ver logo abaixo). */}
        {((persona !== 'representante' && readyToSend.length > 0) || awaitingReview.length > 0) && (
          <div className="bulkbar">
            {persona !== 'representante' && readyToSend.length > 0 && (
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
                  e {readyToSend.length > 1 ? 'estão prontos' : 'está pronto'} — {readyToSend[0].c.name}
                  {readyToSend.length > 1 ? ` e mais ${readyToSend.length - 1}` : ''}
                </div>
                <div
                  className="bbtn"
                  onClick={() => {
                    readyToSend.forEach(({ c, p }) => sendPedidoToRepresentante(c.id, p.id))
                    setSendToast({
                      title: readyToSend.length > 1 ? `${readyToSend.length} pedidos enviados` : 'Pedido enviado',
                      sub: `${readyToSend[0].c.representative} vai revisar e aprovar`,
                    })
                  }}
                >
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
                    {persona === 'representante' ? 'Você sugeriu' : 'Ana sugeriu'} {awaitingReview.length} pedido
                    {awaitingReview.length > 1 ? 's' : ''} novo{awaitingReview.length > 1 ? 's' : ''}
                  </b>{' '}
                  — {awaitingReview[0].c.name}, {awaitingReview[0].c.daysSinceActivity > 0 ? `parado há ${awaitingReview[0].c.daysSinceActivity} dias` : 'agora'}{' '}
                  {persona === 'representante' ? 'esperando revisão do lojista' : 'esperando sua revisão'}
                </div>
                <div className="bbtn" onClick={() => navigate(`/carrinhos/${awaitingReview[0].c.id}`)}>
                  {persona === 'representante' ? 'Ver carrinho' : 'Revisar sugestão'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compartilhados primeiro (zona ativa — pode precisar de ação de alguém agora), Não
            compartilhados depois (zona quieta — rascunho, só quem monta vê). Cada seção é um
            `.cr-list` próprio, não um único bloco contínuo — precisava ficar claro visualmente que
            são dois lugares diferentes, não uma lista com subtítulos (pedido do usuário). */}
        {renderSecao('Compartilhados', compartilhados, 'Nenhum carrinho compartilhado ainda — tudo ainda em rascunho.')}
        {renderSecao('Não compartilhados', naoCompartilhados, 'Nenhum rascunho no momento — tudo já foi compartilhado.')}
      </div>

      {sendToast && <Toast title={sendToast.title} sub={sendToast.sub} onClose={() => setSendToast(null)} />}

      {confirmEditCart && (
        <ConfirmModal
          title="Editar pedido aguardando aprovação"
          message={`Esse pedido está aguardando aprovação de ${confirmEditCart.representative}. Editar agora volta ele pra rascunho — você vai precisar enviar de novo depois de ajustar.`}
          confirmLabel="Editar mesmo assim"
          onCancel={() => setConfirmEditCart(null)}
          onConfirm={() => {
            const cart = confirmEditCart
            setConfirmEditCart(null)
            startEditPedido(cart.id, cart.pedido.id)
          }}
        />
      )}
    </DesktopPage>
  )
}
