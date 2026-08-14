import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { carrinhos } from '../../lib/data'
import { GRADE_MINIMA_PARES } from '../../lib/types'
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
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]

  const totalItems = cart.pedidos.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.qty, 0), 0)
  const totalValue = cart.pedidos.reduce((sum, p) => sum + p.total, 0)

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
            <div className="tab new" style={{ cursor: 'pointer' }} onClick={() => navigate('/catalogo')}>
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
                  <span className={`badge ${pedido.status === 'pago' ? 'pos' : 'neutral'}`}>
                    {pedido.status === 'pago' ? 'Confirmado' : pedido.status === 'aguardando' ? 'Aguardando aprovação' : 'Rascunho'}
                  </span>
                </div>
                <div className="og-body">
                  {pedido.items.map((item, i) => (
                    <div className="cartline" key={i}>
                      <div>
                        <div className="cname">{item.name}</div>
                        <div className="cmeta">
                          qtd {item.qty} · grade {item.grade}
                        </div>
                      </div>
                      <div className="cval">{formatBRL(item.value)}</div>
                    </div>
                  ))}
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

          <div className="newordergroup" style={{ cursor: 'pointer' }} onClick={() => navigate('/catalogo')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Criar novo pedido neste carrinho
          </div>

          <div className="activitynote">
            <div className="aavatar">AN</div>
            <div className="atext">
              <span className="aname">Ana:</span> separei a sandália num pedido à vista pra você aproveitar o desconto — os
              outros itens ficam no prazo normal, tudo bem?
              <div className="atime">há 40 min</div>
            </div>
          </div>

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
              <div className="miniaction" style={{ cursor: 'pointer' }} onClick={() => navigate('/catalogo')}>
                + Adicionar 4 itens
              </div>
            </div>
          </div>
        </div>

        <div className="web-sidebar">
          <div className="stitle">Carrinho: {cart.name.toLowerCase()}</div>
          <div className="stotal">{totalItems} pares</div>
          <div className="ssub">
            {formatBRL(totalValue)} · {cart.pedidos.length} pedido{cart.pedidos.length > 1 ? 's' : ''}
          </div>
          <div className="bubble">Cada pedido fecha e paga separado — o carrinho continua aberto até você decidir salvar ou enviar tudo</div>
          <div className="sbtns">
            <div className="btn-secondary" style={{ cursor: 'pointer' }}>
              Salvar carrinho como rascunho
            </div>
            <a
              href="#"
              style={{ display: 'block', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}
              onClick={(e) => {
                e.preventDefault()
                navigate('/catalogo')
              }}
            >
              ← Continuar comprando
            </a>
          </div>
        </div>
      </div>
    </DesktopPage>
  )
}
