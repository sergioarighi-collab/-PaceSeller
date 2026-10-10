import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { PersonaTopNav } from '../../components/desktop/PersonaTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { Toast } from '../../components/desktop/Toast'
import { ConfirmModal } from '../../components/desktop/ConfirmModal'
import { PaymentLinkModal } from '../../components/desktop/PaymentLinkModal'
import { products, collectionTitle } from '../../lib/data'
import { useAppStore, pedidoActionKind, pedidoPares, pedidoStatusBadge, pedidoAguardandoAprovacaoRep } from '../../lib/store'
import { GRADE_MINIMA_PARES } from '../../lib/types'
import { formatBRL } from '../../lib/format'

// Iniciais a partir do nome do autor do comentário/resposta (mesmo critério de `LojistaGate.tsx`) —
// antes o avatar do comentário era fixo "AN" (só funcionava pro comentário da Ana); com a resposta
// do lojista aparecendo logo abaixo (set/2026), precisa calcular a partir de quem escreveu.
function iniciais(name: string): string {
  const palavras = name.trim().split(/\s+/)
  return palavras.length === 1 ? palavras[0].slice(0, 2).toUpperCase() : (palavras[0][0] + palavras[1][0]).toUpperCase()
}

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
  const addToCart = useAppStore((s) => s.addToCart)
  const sendPedidoToRepresentante = useAppStore((s) => s.sendPedidoToRepresentante)
  const aprovarPedido = useAppStore((s) => s.aprovarPedido)
  const setRepCanEdit = useAppStore((s) => s.setRepCanEdit)
  const persona = useAppStore((s) => s.persona)
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]
  const pedido = cart.pedido

  function shopMoreForThisCarrinho() {
    setActiveCarrinho(cart.id)
    navigate('/catalogo')
  }

  const [savedToast, setSavedToast] = useState(false)
  // "Editar no drawer" num pedido "Aguardando Ana" ou já "Aprovado" (set/2026) reabre o processo
  // (ver commitCartToCarrinho em store.ts) — avisa antes de deixar entrar, em vez de simplesmente
  // voltar o status sem avisar.
  const [confirmEditAguardando, setConfirmEditAguardando] = useState(false)
  // Link de pagamento (set/2026, pedido do usuário: "após fechamento do carrinho, ele pode gerar
  // um link e compartilhar com o lojista") — ver PaymentLinkModal.tsx.
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false)

  function handleEditarNoDrawer() {
    if (pedido.status === 'aguardando' || pedido.status === 'aprovado') setConfirmEditAguardando(true)
    else startEditPedido(cart.id, pedido.id)
  }

  const pares = pedidoPares(pedido)
  const gradeOk = pares >= GRADE_MINIMA_PARES
  const statusBadge = pedidoStatusBadge(pedido, cart.representative, persona === 'representante')

  // Coleção sub-representada (set/2026): substitui o antigo "Categoria feminina sub-representada"
  // — texto fixo que não correspondia a nenhum dado real (o catálogo não tem categoria de gênero,
  // só coleção: Coil/Hertz/Hertz Art/Flow/Flow XL/Fusion/TG II — ver types.ts). Critério novo:
  // coleções que o pedido não tem nenhum item, ordenadas pelo crescimento médio dos produtos
  // dela — só sugere a de maior crescimento, e só se for positivo (crescimento negativo não é
  // motivo pra sugerir adicionar). Sem coleção qualificada, a linha simplesmente não aparece —
  // mesmo princípio da sugestão de produto abaixo, de não trazer informação por trazer.
  const missingCollection = (() => {
    if (pedido.status === 'pago') return undefined
    const pedidoCollections = new Set(
      pedido.items.map((item) => products.find((p) => p.id === item.productId)?.collection).filter(Boolean),
    )
    const candidates = Array.from(new Set(products.map((p) => p.collection)))
      .filter((c) => !pedidoCollections.has(c))
      .map((collection) => {
        const items = products.filter((p) => p.collection === collection)
        const avgGrowth = items.reduce((sum, p) => sum + p.growthPct, 0) / items.length
        return { collection, avgGrowth, count: items.length }
      })
      .filter((c) => c.avgGrowth > 0)
      .sort((a, b) => b.avgGrowth - a.avgGrowth)
    return candidates[0]
  })()

  // "Antes de fechar" (set/2026): revisado pra só trazer info acionável no momento de fechar o
  // pedido — tirado o check "mix balanceado" (positivo, não pedia ação nenhuma) e o comparativo
  // com o ano passado (histórico, mais análise do que decisão de compra — cabe melhor num
  // painel/Radar). No lugar entrou uma sugestão concreta de produto: usa o mesmo critério de
  // "Oportunidade perdida" já usado no OrderDrawer (produto que vende bem mas a loja ainda não
  // tem), só que aqui olhando os itens do pedido já fechado, não o carrinho em montagem. Só um
  // produto por vez (o de maior chance), não uma lista — pedido do usuário foi não trazer
  // informação por trazer.
  const productSuggestion =
    pedido.status === 'pago'
      ? undefined
      : products.find(
          (p) => p.badges.some((b) => b.label === 'Oportunidade perdida') && !pedido.items.some((item) => item.productId === p.id),
        )

  function addSuggestionToPedido() {
    if (!productSuggestion) return
    startEditPedido(cart.id, pedido.id)
    addToCart(productSuggestion.id, 12)
  }

  return (
    <DesktopPage>
      <PersonaTopNav />
      <Breadcrumb
        items={
          persona === 'representante'
            ? [{ label: 'Radar', to: '/rep/radar' }, { label: 'Carrinhos', to: '/rep/carrinhos' }, { label: cart.name }]
            : [{ label: 'Radar', to: '/radar' }, { label: 'Meus Carrinhos', to: '/carrinhos' }, { label: cart.name }]
        }
      />
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

          {persona !== 'representante' && (
            <div className="sharebanner">
              <div className="avatar">AN</div>
              <div>
                Compartilhado com <b>{cart.representative}</b> — ela acompanha e comenta esse pedido
              </div>
            </div>
          )}

          <div className="ordergroup">
            <div className="og-head">
              <div>
                <div className="og-title">{pedido.label}</div>
                <div className="og-meta">
                  {conditionLabel[pedido.paymentCondition ?? '30']} · {pedido.deliveryEstimateDays > 0 ? `Entrega em ${pedido.deliveryEstimateDays} dias úteis` : 'Entrega imediata'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {persona === 'representante' ? (
                  // Ações do REPRESENTANTE (set/2026, "modo loja"): só "Aprovar pedido" existe de
                  // verdade por enquanto — quando não se aplica, fica só o badge de status (visão
                  // somente-leitura). Comentar/editar em nome do lojista fica pra uma próxima leva,
                  // ver guia-dev-frontend.md.
                  pedidoAguardandoAprovacaoRep(pedido) && (
                    <span
                      style={{ fontSize: 11.5, color: 'var(--positive)', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => aprovarPedido(cart.id)}
                    >
                      Aprovar pedido
                    </span>
                  )
                ) : (
                  <>
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
                  </>
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
              {/* Pagar é ação do lojista, não da representante (ela só aprova — ver aprovarPedido em
                  store.ts) — sem isso, o "modo loja" deixava a Ana pagar pedido do próprio lojista
                  sem querer, pela mesma tela reaproveitada. No lugar, ela gera um link pra mandar
                  pro lojista pagar sozinho (set/2026, ver PaymentLinkModal.tsx) — só depois de
                  aprovado (antes disso não tem o que pagar ainda) e com a grade batida. */}
              {persona !== 'representante' ? (
                <div
                  className={gradeOk ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: 180, cursor: gradeOk ? 'pointer' : 'not-allowed', opacity: gradeOk ? 1 : 0.6 }}
                  onClick={() => gradeOk && navigate(`/carrinhos/${cart.id}/${pedido.id}/pagamento`)}
                >
                  Ir para pagamento
                </div>
              ) : (
                pedido.status === 'aprovado' &&
                gradeOk && (
                  <div className="btn-primary" style={{ width: 200, cursor: 'pointer' }} onClick={() => setShowPaymentLinkModal(true)}>
                    Gerar link de pagamento
                  </div>
                )
              )}
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
              <div className="aavatar">{iniciais(cart.lastComment.author)}</div>
              <div className="atext">
                <span className="aname">{cart.lastComment.author}:</span> {cart.lastComment.text}
                <div className="atime">{cart.lastComment.timeLabel}</div>
              </div>
            </div>
          )}

          {/* Resposta do lojista (set/2026, pedido do usuário: "uma linha tb no comentário com a
              resposta do cliente") — mesma estrutura visual do comentário da Ana, logo abaixo,
              formando uma mini-conversa de 2 linhas (pergunta + resposta), não uma thread genérica
              (ver nota em `Carrinho.clientReply`, types.ts). */}
          {cart.clientReply && (
            <div className="activitynote">
              <div className="aavatar">{iniciais(cart.clientReply.author)}</div>
              <div className="atext">
                <span className="aname">{cart.clientReply.author}:</span> {cart.clientReply.text}
                <div className="atime">{cart.clientReply.timeLabel}</div>
              </div>
            </div>
          )}

          {(missingCollection || productSuggestion) && (
            <div className="qualitybox">
              <div className="qtitle">Antes de fechar</div>
              {missingCollection && (
                <div className="qline">
                  <div className="qleft">
                    <span className="ck" style={{ background: 'var(--risk-dim)', color: 'var(--risk)' }}>
                      !
                    </span>
                    Coleção {collectionTitle[missingCollection.collection as keyof typeof collectionTitle]} ausente do pedido
                  </div>
                  <div className="miniaction" style={{ cursor: 'pointer' }} onClick={shopMoreForThisCarrinho}>
                    + Adicionar {missingCollection.count} itens
                  </div>
                </div>
              )}
              {productSuggestion && (
                <div className="qline">
                  <div className="qleft">
                    <span className="ck" style={{ background: 'var(--info-dim)', color: 'var(--info)' }}>
                      +
                    </span>
                    {productSuggestion.name.replace('Tênis Tesla ', '')} vende bem, mas sua loja ainda não tem
                  </div>
                  <div className="miniaction" style={{ cursor: 'pointer' }} onClick={addSuggestionToPedido}>
                    + Adicionar
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="web-sidebar">
          <div className="stitle">Carrinho: {cart.name.toLowerCase()}</div>
          <div className="stotal">{pares} pares</div>
          <div className="ssub">{formatBRL(pedido.total)}</div>
          <div className="bubble">
            O carrinho fecha e paga como um pedido só — na hora de pagar você pode dividir o valor entre mais de uma forma (parte no cartão, parte no PIX, por exemplo)
          </div>

          {/* Toggle/"Falar com"/"Salvar rascunho" são ações do LOJISTA sobre a relação com a
              representante (conceder permissão a ela, falar com ela, guardar o próprio rascunho) —
              não fazem sentido no "modo loja": a Ana veria um toggle/botão falando dela mesma em
              terceira pessoa. Escondidos pra persona === 'representante' (set/2026, mesmo princípio
              do "Ir para pagamento" acima). */}
          {persona !== 'representante' && (
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
          )}

          <div className="sbtns">
            {persona !== 'representante' && (
              <>
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
              </>
            )}
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
          title={pedido.status === 'aprovado' ? 'Editar pedido já aprovado' : 'Editar pedido aguardando aprovação'}
          message={
            pedido.status === 'aprovado'
              ? `${cart.representative} já aprovou esse pedido. Editar agora volta ele pra rascunho — você vai precisar enviar de novo depois de ajustar.`
              : `Esse pedido está aguardando aprovação de ${cart.representative}. Editar agora volta ele pra rascunho — você vai precisar enviar de novo depois de ajustar.`
          }
          confirmLabel="Editar mesmo assim"
          onCancel={() => setConfirmEditAguardando(false)}
          onConfirm={() => {
            setConfirmEditAguardando(false)
            startEditPedido(cart.id, pedido.id)
          }}
        />
      )}

      {showPaymentLinkModal && (
        <PaymentLinkModal
          link={`${window.location.origin}/carrinhos/${cart.id}/${pedido.id}/pagamento`}
          cartName={cart.name}
          total={formatBRL(pedido.total)}
          onClose={() => setShowPaymentLinkModal(false)}
        />
      )}
    </DesktopPage>
  )
}
