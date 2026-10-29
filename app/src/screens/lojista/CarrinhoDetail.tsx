import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { PersonaTopNav } from '../../components/desktop/PersonaTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { Toast } from '../../components/desktop/Toast'
import { ConfirmModal } from '../../components/desktop/ConfirmModal'
import { products } from '../../lib/data'
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
  const renameCarrinho = useAppStore((s) => s.renameCarrinho)
  const persona = useAppStore((s) => s.persona)
  const lojistas = useAppStore((s) => s.lojistas)
  const activeLojistaId = useAppStore((s) => s.activeLojistaId)
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]
  const pedido = cart.pedido
  // Nome do lojista ativo (set/2026, pro CTA "Falar com" do lado da representante) — pego pelo id
  // em modo loja, não por `cart.representative` (esse campo guarda o nome DELA, "Ana", o mesmo nos
  // dois lados; o lojista em si só existe em `s.lojistas`).
  const lojistaAtivo = lojistas.find((l) => l.id === activeLojistaId)

  // Renomear carrinho (set/2026, pedido do usuário: "poder renomear meus carrinhos tanto na visão
  // rep quanto na visão lojista") — edição inline no título da sidebar, sem trava de persona (os
  // dois lados podem sempre renomear). `editingName` guarda o texto em edição separado de
  // `cart.name` pra poder cancelar (Esc) sem gravar nada.
  const [editingName, setEditingName] = useState<string | null>(null)

  function saveNameEdit() {
    if (editingName !== null) renameCarrinho(cart.id, editingName)
    setEditingName(null)
  }

  function shopMoreForThisCarrinho() {
    setActiveCarrinho(cart.id)
    navigate('/catalogo')
  }

  const [savedToast, setSavedToast] = useState(false)
  // "Editar no drawer" num pedido "Aguardando Ana" ou já "Aprovado" (set/2026) reabre o processo
  // (ver commitCartToCarrinho em store.ts) — avisa antes de deixar entrar, em vez de simplesmente
  // voltar o status sem avisar.
  const [confirmEditAguardando, setConfirmEditAguardando] = useState(false)

  function handleEditarNoDrawer() {
    if (pedido.status === 'aguardando' || pedido.status === 'aprovado') setConfirmEditAguardando(true)
    else startEditPedido(cart.id, pedido.id)
  }

  const pares = pedidoPares(pedido)

  // Estoque insuficiente (set/2026): o pedido pode ter sido montado com uma quantidade que a
  // fábrica tinha na hora, mas demorou pra fechar (lojista revisando, rep aguardando aprovação) e o
  // estoque caiu abaixo do que foi pedido — mesmo critério do aviso por linha logo abaixo
  // (`outOfStock`), hoisted aqui pra travar o fechamento: um pedido que promete mais pares do que a
  // fábrica tem agora não pode ser pago/aprovado como está (usuário relatou o caso real: "Reposição
  // — Coil Denim" pedia 36, só restam 28, botão de fechar continuava liberado).
  const stockShortfallItems = pedido.items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product || item.qty <= product.stockPares) return []
    return [{ item, product }]
  })
  const hasStockShortfall = stockShortfallItems.length > 0
  const paresFaltantesPorEstoque = stockShortfallItems.reduce((sum, { item, product }) => sum + (item.qty - product.stockPares), 0)
  const gradeOk = pares >= GRADE_MINIMA_PARES && !hasStockShortfall
  const statusBadge = pedidoStatusBadge(pedido, cart.representative, persona === 'representante')

  // Sugestão de produto pra repor o gap de pares que o estoque comeu (set/2026): substitui o antigo
  // bloco genérico "Antes de fechar" (coleção ausente + "oportunidade perdida" sempre visíveis,
  // mesmo sem nenhum problema real) — usuário relatou que ele atrapalhava mais do que ajudava
  // ("fazendo com que o lojista demore mais ainda pra fechar um pedido"). Agora só aparece nesse
  // cenário concreto e bloqueante, com uma ação que resolve o problema de verdade: primeiro produto
  // fora do pedido com estoque suficiente pra cobrir sozinho o que faltou (uma sugestão que cobre só
  // metade do gap deixaria o aviso de grade mínima aparecendo de novo depois de "resolvido").
  const stockFillSuggestion = hasStockShortfall
    ? products.find((p) => !pedido.items.some((item) => item.productId === p.id) && p.stockPares >= paresFaltantesPorEstoque)
    : undefined

  function addStockFillSuggestion() {
    if (!stockFillSuggestion) return
    startEditPedido(cart.id, pedido.id)
    // Não basta empilhar o produto sugerido em cima do que já está no pedido: o item original
    // continuaria prometendo mais pares do que a fábrica tem (ex.: 36 de Coil Denim com só 28 em
    // estoque). Precisa também baixar cada item em falta pro que existe de verdade — o total de
    // pares do pedido não muda (o que saiu de um lado entra do outro), só deixa de prometer o que
    // não existe.
    for (const { product } of stockShortfallItems) addToCart(product.id, product.stockPares)
    addToCart(stockFillSuggestion.id, paresFaltantesPorEstoque)
  }

  return (
    <DesktopPage>
      <PersonaTopNav />
      <Breadcrumb
        items={
          persona === 'representante'
            ? [{ label: 'Radar', to: '/rep/radar' }, { label: lojistaAtivo?.name ?? 'Carrinhos', to: '/carrinhos' }, { label: cart.name }]
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
                  // Ações do REPRESENTANTE (set/2026, "modo loja"): "Aprovar pedido" quando se
                  // aplica, mais "Falar com {lojista}" (set/2026, pedido do usuário — antes ela não
                  // tinha nenhum jeito de abrir essa conversa, só o lojista tinha o CTA equivalente;
                  // ver Chat.tsx, que agora é ciente de persona). Comentar/editar em nome do lojista
                  // fica pra uma próxima leva, ver guia-dev-frontend.md.
                  <>
                    {pedidoAguardandoAprovacaoRep(pedido) && (
                      <span
                        style={{ fontSize: 11.5, color: 'var(--positive)', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => aprovarPedido(cart.id)}
                      >
                        Aprovar pedido
                      </span>
                    )}
                    <span
                      style={{ fontSize: 11.5, color: 'var(--info)', fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => navigate(`/carrinhos/${cart.id}/${pedido.id}/chat`)}
                    >
                      Falar com {lojistaAtivo?.contactName ?? 'o lojista'}
                    </span>
                  </>
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
                  sem querer, pela mesma tela reaproveitada. Chegou a existir um botão "Gerar link de
                  pagamento" aqui (set/2026) pra ela mandar um link pro lojista pagar sozinho —
                  removido (out/2026, pedido do usuário: "não preciso encaminhar pra ele um link, é
                  mais uma etapa... é só compartilhar o carrinho e avisar o lojista pra fechar").
                  Investigando o pedido, o link nunca foi necessário: o lojista, logado na própria
                  conta (fora de "modo loja"), sempre teve "Ir para pagamento" direto — o link só
                  existia pra essa trava de UI do lado dela. Com o carrinho compartilhado e a tag
                  "Aguardando o cliente" (ver `clienteTag` em MeusCarrinhos.tsx) já avisando que é a
                  vez dele, sobra só um texto — sem ação nenhuma, ela não tem o que fazer aqui além de
                  falar com ele se quiser (CTA ao lado, "Falar com {lojista}"). Pedido já `pago` não
                  mostra nada (bug relatado pelo usuário, ver nota na `.grademin` logo abaixo —
                  mesma causa). */}
              {pedido.status !== 'pago' &&
                (persona !== 'representante' ? (
                  <div
                    className={gradeOk ? 'btn-primary' : 'btn-secondary'}
                    style={{ width: 180, cursor: gradeOk ? 'pointer' : 'not-allowed', opacity: gradeOk ? 1 : 0.6 }}
                    onClick={() => gradeOk && navigate(`/carrinhos/${cart.id}/${pedido.id}/pagamento`)}
                  >
                    Ir para pagamento
                  </div>
                ) : (
                  (() => {
                    const jaAprovado = pedido.status === 'aprovado'
                    const fecharCartaoPropria = pedido.suggestedBy === 'representante' && pedido.status === 'aguardando'
                    if (!gradeOk || (!jaAprovado && !fecharCartaoPropria)) return null
                    return (
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Aguardando {lojistaAtivo?.contactName ?? 'o lojista'} pagar
                      </span>
                    )
                  })()
                ))}
            </div>
            {/* Escondido quando já `pago` (set/2026, bug relatado pelo usuário: "Giro Hertz Black"
                em Radical Skate é um carrinho de reposição rápida — paga com 6 pares, bem abaixo
                dos 36 da grade mínima, porque reposição nunca passou por esse crivo (ver
                `buildReposicaoCarrinho` em store.ts, que já nasce `aguardando` sem checar
                `GRADE_MINIMA_PARES`) — mesmo assim a tela mostrava "faltam 30 pares pra atingir a
                grade mínima" num pedido já pago e sendo acompanhado, o que não faz sentido: grade
                mínima é regra pra decidir SE o pedido pode ser enviado/pago, não algo que ainda
                importa depois que ele já foi. */}
            {pedido.status !== 'pago' && (
              <div className={`grademin ${gradeOk ? 'ok' : 'warn'}`}>
                {gradeOk ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {pares} pares — grade mínima atingida
                  </>
                ) : hasStockShortfall ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 9v3M12 16h.01" />
                      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                    </svg>
                    Estoque insuficiente — faltam {paresFaltantesPorEstoque} pares pra manter a grade mínima de {GRADE_MINIMA_PARES}
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
            )}
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

          {hasStockShortfall && (
            <div className="qualitybox">
              <div className="qtitle">Estoque insuficiente pra fechar</div>
              <div className="qline">
                <div className="qleft">
                  <span className="ck" style={{ background: 'var(--risk-dim)', color: 'var(--risk)' }}>
                    !
                  </span>
                  Faltam {paresFaltantesPorEstoque} pares pra manter os {GRADE_MINIMA_PARES} da grade mínima
                </div>
              </div>
              {stockFillSuggestion && (
                <div className="qline">
                  <div className="qleft">
                    <span className="ck" style={{ background: 'var(--info-dim)', color: 'var(--info)' }}>
                      +
                    </span>
                    {stockFillSuggestion.name.replace('Tênis Tesla ', '')} tem estoque suficiente pra completar
                  </div>
                  <div className="miniaction" style={{ cursor: 'pointer' }} onClick={addStockFillSuggestion}>
                    + Adicionar {paresFaltantesPorEstoque}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="web-sidebar">
          {editingName !== null ? (
            <input
              autoFocus
              className="stitle-edit"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={saveNameEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
                if (e.key === 'Escape') setEditingName(null)
              }}
            />
          ) : (
            <div className="stitle" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setEditingName(cart.name)}>
              Carrinho: {cart.name.toLowerCase()}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </div>
          )}
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

    </DesktopPage>
  )
}
