import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { Toast } from '../../components/desktop/Toast'
import { useAppStore } from '../../lib/store'
import { formatBRL } from '../../lib/format'
import type { PaymentCondition, PaymentMethod } from '../../lib/types'

const PIX_CODE = '00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d5204000053039865406108.005802BR5913TESLA SKATE6009SAO PAULO62070503***6304'
const BOLETO_LINE = '34191.79001 01043.510047 91020.150008 4 96060000108000'

const METHOD_ORDER: PaymentMethod[] = ['pix', 'cartao', 'boleto']
const methodLabel: Record<PaymentMethod, string> = { pix: 'PIX', cartao: 'Cartão de crédito', boleto: 'Boleto bancário' }

function emptyAmounts(): Record<PaymentMethod, number> {
  return { pix: 0, cartao: 0, boleto: 0 }
}

// Divide `total` entre os métodos ativos em partes iguais (a última leva o resto do
// arredondamento, pra não perder centavo) — usado sempre que o conjunto de formas ativas muda e
// pelo botão "Dividir igualmente" pra resetar uma alocação manual bagunçada.
function distributeEvenly(total: number, methods: PaymentMethod[]): Record<PaymentMethod, number> {
  const next = emptyAmounts()
  if (methods.length === 0) return next
  const share = Math.floor((total / methods.length) * 100) / 100
  methods.forEach((m, i) => {
    next[m] = i === methods.length - 1 ? Math.round((total - share * (methods.length - 1)) * 100) / 100 : share
  })
  return next
}

export function Payment() {
  const navigate = useNavigate()
  const { cartId, pedidoId } = useParams()
  const carrinhos = useAppStore((s) => s.carrinhos)
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]
  const pedido = cart.pedido
  void pedidoId

  const [condition, setCondition] = useState<PaymentCondition>(pedido.paymentCondition ?? '30')
  // Formas de pagamento ativas pro pedido — dividir o valor entre mais de uma (ex: parte no
  // cartão, parte no PIX) em vez de escolher uma única exclusiva (decisão de set/2026, ver
  // guia-dev-frontend.md: "1 pedido por carrinho + split de pagamento").
  const [activeMethods, setActiveMethods] = useState<PaymentMethod[]>(() => {
    const fromSplit = pedido.paymentSplit?.map((a) => a.method)
    return fromSplit && fromSplit.length > 0 ? fromSplit : ['pix']
  })
  const [amounts, setAmounts] = useState<Record<PaymentMethod, number>>(() => {
    if (pedido.paymentSplit && pedido.paymentSplit.length > 0) {
      const m = emptyAmounts()
      pedido.paymentSplit.forEach((a) => {
        m[a.method] = a.amount
      })
      return m
    }
    return { ...emptyAmounts(), pix: pedido.total }
  })
  const [toast, setToast] = useState<{ title: string; sub: string } | null>(null)

  const isSplit = activeMethods.length > 1
  const allocated = activeMethods.reduce((sum, m) => sum + (amounts[m] || 0), 0)
  const remaining = Math.round((pedido.total - allocated) * 100) / 100
  const canConfirm = Math.abs(remaining) < 0.01

  function toggleMethod(method: PaymentMethod) {
    setActiveMethods((cur) => {
      const next = cur.includes(method) ? (cur.length > 1 ? cur.filter((m) => m !== method) : cur) : [...cur, method]
      setAmounts(distributeEvenly(pedido.total, next))
      return next
    })
  }

  function setAmount(method: PaymentMethod, value: number) {
    setAmounts((cur) => ({ ...cur, [method]: Math.max(0, value) }))
  }

  function resetSplitEven() {
    setAmounts(distributeEvenly(pedido.total, activeMethods))
  }

  function copyToClipboard(text: string, title: string) {
    navigator.clipboard?.writeText(text).catch(() => {})
    setToast({ title, sub: 'Copiado pra área de transferência' })
  }

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb
        items={[
          { label: 'Radar', to: '/radar' },
          { label: 'Meus Carrinhos', to: '/carrinhos' },
          { label: cart.name, to: `/carrinhos/${cart.id}` },
          { label: `${pedido.label} — Pagamento` },
        ]}
      />
      <div className="web-app-layout">
        <div className="web-content">
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginTop: 16 }}>
            Pagamento — {pedido.label}
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            Pedido único do carrinho "{cart.name}"
          </div>

          <div style={{ maxWidth: 560 }}>
            <div className="fieldgroup" style={{ padding: 0, marginTop: 24 }}>
              <div className="optioncard" style={{ borderColor: 'var(--black)' }}>
                <div className="oicon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                </div>
                <div>
                  <div className="otitle">{formatBRL(pedido.total)}</div>
                  <div className="osub">Valor deste pedido ({pedido.items.length} itens)</div>
                </div>
              </div>
            </div>

            <div className="fieldgroup" style={{ padding: 0, marginTop: 20 }}>
              <div className="flabel">Condição de pagamento</div>
              <div className="chipselect">
                <div className={`chip ${condition !== 'a-vista' ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setCondition('30')}>
                  30/60/90 dias
                </div>
                <div className={`chip ${condition === 'a-vista' ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setCondition('a-vista')}>
                  À vista −3%
                </div>
              </div>
            </div>

            <div className="fieldgroup" style={{ padding: 0, marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                <div className="flabel" style={{ marginBottom: 0 }}>
                  Forma de pagamento
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Selecione uma ou mais pra dividir o valor</div>
              </div>
              <div className="paymethod-grid" style={{ marginTop: 8 }}>
                <div className={`paymethod ${activeMethods.includes('pix') ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleMethod('pix')}>
                  {activeMethods.includes('pix') && <div className="pm-check">✓</div>}
                  <div className="pm-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                      <rect x="7.5" y="7.5" width="9" height="9" rx="1.5" transform="rotate(45 12 12)" />
                    </svg>
                  </div>
                  <div className="pm-label">PIX</div>
                  <div className="pm-sub">Aprovação imediata</div>
                </div>
                <div
                  className={`paymethod ${activeMethods.includes('cartao') ? 'selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleMethod('cartao')}
                >
                  {activeMethods.includes('cartao') && <div className="pm-check">✓</div>}
                  <div className="pm-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </div>
                  <div className="pm-label">Cartão de crédito</div>
                  <div className="pm-sub">Em até 3x sem juros</div>
                </div>
                <div
                  className={`paymethod ${activeMethods.includes('boleto') ? 'selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleMethod('boleto')}
                >
                  {activeMethods.includes('boleto') && <div className="pm-check">✓</div>}
                  <div className="pm-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4v16M8 4v16M13 4v10M13 17v3M17 4v16M21 4v16" />
                    </svg>
                  </div>
                  <div className="pm-label">Boleto bancário</div>
                  <div className="pm-sub">Compensa em até 2 dias úteis</div>
                </div>
              </div>
            </div>

            {isSplit && (
              <div className="splitbox" style={{ marginTop: 16 }}>
                <div className="splitbox-head">
                  <span>Como dividir os {formatBRL(pedido.total)}</span>
                  <span className="splitbox-reset" style={{ cursor: 'pointer' }} onClick={resetSplitEven}>
                    Dividir igualmente
                  </span>
                </div>
                {METHOD_ORDER.filter((m) => activeMethods.includes(m)).map((m) => (
                  <div className="splitrow" key={m}>
                    <span className="splitrow-label">{methodLabel[m]}</span>
                    <div className="splitrow-input">
                      <span>R$</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={amounts[m] || ''}
                        placeholder="0,00"
                        onChange={(e) => setAmount(m, parseFloat(e.target.value || '0'))}
                      />
                    </div>
                  </div>
                ))}
                <div className={`splitbox-total ${canConfirm ? 'ok' : 'warn'}`}>
                  {canConfirm ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      Alocado: {formatBRL(allocated)} de {formatBRL(pedido.total)}
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v3M12 16h.01" />
                        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                      </svg>
                      {remaining > 0
                        ? `Faltam ${formatBRL(remaining)} pra completar o valor do pedido`
                        : `Passou ${formatBRL(Math.abs(remaining))} do valor do pedido`}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeMethods.includes('pix') && (
              <div className="pix-panel" style={{ marginTop: 16 }}>
                <div className="pix-qr">
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="#161618">
                    <rect x="5" y="5" width="25" height="25" />
                    <rect x="70" y="5" width="25" height="25" />
                    <rect x="5" y="70" width="25" height="25" />
                    <rect x="38" y="10" width="6" height="6" />
                    <rect x="50" y="10" width="6" height="6" />
                    <rect x="38" y="22" width="6" height="6" />
                    <rect x="10" y="38" width="6" height="6" />
                    <rect x="22" y="38" width="6" height="6" />
                    <rect x="38" y="38" width="6" height="6" />
                    <rect x="50" y="38" width="6" height="6" />
                    <rect x="62" y="38" width="6" height="6" />
                    <rect x="80" y="38" width="6" height="6" />
                    <rect x="38" y="50" width="6" height="6" />
                    <rect x="62" y="50" width="6" height="6" />
                    <rect x="80" y="50" width="6" height="6" />
                    <rect x="38" y="62" width="6" height="6" />
                    <rect x="50" y="62" width="6" height="6" />
                    <rect x="70" y="62" width="6" height="6" />
                    <rect x="50" y="80" width="6" height="6" />
                    <rect x="62" y="80" width="6" height="6" />
                    <rect x="80" y="80" width="6" height="6" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isSplit ? `Escaneie ou copie o código — ${formatBRL(amounts.pix)}` : 'Escaneie ou copie o código'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {isSplit
                      ? 'Essa parte do pedido é confirmada assim que o PIX cair — o restante segue pelas outras formas escolhidas'
                      : 'O pedido é confirmado automaticamente assim que o pagamento cair'}
                  </div>
                  <div className="pix-code">
                    00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d5204000053039865406108.005802BR5913TESLA
                    SKATE6009SAO PAULO62070503***6304
                  </div>
                  <div
                    className="btn-secondary"
                    style={{ width: 180, marginTop: 12, cursor: 'pointer' }}
                    onClick={() => copyToClipboard(PIX_CODE, 'Código PIX copiado')}
                  >
                    Copiar código
                  </div>
                  <div className="pix-timer">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                    Expira em 29:47
                  </div>
                </div>
              </div>
            )}

            {activeMethods.includes('cartao') && (
              <div style={{ marginTop: 16 }}>
                <div className="cardface">
                  <div className="cf-row">
                    <span>Número do cartão</span>
                    <span>Visa</span>
                  </div>
                  <div className="cf-number">•••• •••• •••• 4821</div>
                  <div className="cf-row">
                    <div>
                      <div className="cf-name">CARLOS ANDRADE</div>
                    </div>
                    <span>08/29</span>
                  </div>
                </div>
                {isSplit && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                    Valor no cartão: <b style={{ color: 'var(--text-primary)' }}>{formatBRL(amounts.cartao)}</b>
                  </div>
                )}
                <div className="cardform-row">
                  <div className="fieldgroup" style={{ padding: 0, marginTop: 0 }}>
                    <div className="flabel">Número do cartão</div>
                    <input className="textinput" placeholder="0000 0000 0000 4821" />
                  </div>
                  <div className="fieldgroup" style={{ padding: 0, marginTop: 0 }}>
                    <div className="flabel">Nome no cartão</div>
                    <input className="textinput" placeholder="Carlos Andrade" />
                  </div>
                </div>
                <div className="cardform-row">
                  <div className="fieldgroup" style={{ padding: 0, marginTop: 0 }}>
                    <div className="flabel">Validade</div>
                    <input className="textinput" placeholder="08/29" />
                  </div>
                  <div className="fieldgroup" style={{ padding: 0, marginTop: 0 }}>
                    <div className="flabel">CVV</div>
                    <input className="textinput" placeholder="•••" />
                  </div>
                </div>
                <div className="fieldgroup" style={{ padding: 0, marginTop: 14, maxWidth: 200 }}>
                  <div className="flabel">Parcelamento</div>
                  <div className="selectrow">
                    <span>3x de {formatBRL((isSplit ? amounts.cartao : pedido.total) / 3)} sem juros</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {activeMethods.includes('boleto') && (
              <div className="boleto-panel" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {isSplit ? `Boleto gerado — ${formatBRL(amounts.boleto)}` : 'Boleto gerado'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Vencimento em 15 de julho · compensa em até 2 dias úteis após o pagamento
                    </div>
                  </div>
                  <span className="badge neutral">Aguardando pagamento</span>
                </div>
                <div className="boleto-barcode" />
                <div className="boleto-linha">34191.79001 01043.510047 91020.150008 4 96060000108000</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <div
                    className="btn-secondary"
                    style={{ width: 170, cursor: 'pointer' }}
                    onClick={() => copyToClipboard(BOLETO_LINE, 'Linha digitável copiada')}
                  >
                    Copiar linha digitável
                  </div>
                  <div
                    className="btn-secondary"
                    style={{ width: 170, cursor: 'pointer' }}
                    onClick={() => setToast({ title: 'Boleto baixado', sub: 'PDF salvo na sua pasta de downloads' })}
                  >
                    Baixar PDF
                  </div>
                </div>
              </div>
            )}

            <div className="fieldrow2" style={{ marginTop: 20 }}>
              <div className="fieldgroup">
                <div className="flabel">Endereço de entrega</div>
                <div className="selectrow">
                  <span>Rua das Palmeiras, 210 · Porto Alegre, RS</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              <div className="fieldgroup">
                <div className="flabel">Prazo estimado</div>
                <div className="selectrow">
                  <span>{pedido.deliveryEstimateDays > 0 ? `Até ${pedido.deliveryEstimateDays} dias úteis` : 'Entrega imediata'}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="fieldgroup" style={{ padding: 0, marginTop: 20 }}>
              <div className="optioncard">
                <div className="oicon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M7 3h10l2 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Z" />
                    <path d="M9 11h6M9 15h6" />
                  </svg>
                </div>
                <div>
                  <div className="otitle">Nota fiscal e contrato</div>
                  <div className="osub">Gerados automaticamente na confirmação</div>
                </div>
                <div className="ochev">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <div className="btn-secondary" style={{ width: 170, cursor: 'pointer' }} onClick={() => navigate(`/carrinhos/${cart.id}`)}>
                Voltar ao carrinho
              </div>
              <div
                className="btn-primary"
                style={canConfirm ? { flex: 1, cursor: 'pointer' } : { flex: 1, cursor: 'not-allowed', opacity: 0.5 }}
                onClick={() => canConfirm && navigate(`/carrinhos/${cart.id}/${pedido.id}/confirmado`)}
              >
                Confirmar pedido
              </div>
            </div>
          </div>
        </div>

        <div className="web-sidebar">
          <div className="stitle">Carrinho: {cart.name.toLowerCase()}</div>
          <div className="stotal">{pedido.items.length} itens</div>
          <div className="ssub">{formatBRL(pedido.total)}</div>
          {isSplit && (
            <div className="bubble">
              Pagamento dividido em {activeMethods.length} formas: {activeMethods.map((m) => `${methodLabel[m]} ${formatBRL(amounts[m])}`).join(' · ')}
            </div>
          )}
          <div className="bubble">
            Compartilhado com <b>{cart.representative}</b> — ela já aprovou este pedido
          </div>
        </div>
      </div>

      {toast && <Toast title={toast.title} sub={toast.sub} onClose={() => setToast(null)} />}
    </DesktopPage>
  )
}
