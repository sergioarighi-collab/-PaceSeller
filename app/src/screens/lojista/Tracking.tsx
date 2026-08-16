import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { carrinhos, trackingSteps } from '../../lib/data'
import { formatBRL } from '../../lib/format'

export function Tracking() {
  const navigate = useNavigate()
  const { cartId, pedidoId } = useParams()
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]
  const pedido = cart.pedidos.find((p) => p.id === pedidoId) ?? cart.pedidos[0]
  const outrosPedidos = cart.pedidos.filter((p) => p.id !== pedido.id)
  const conditionLabel = pedido.paymentCondition === 'a-vista' ? 'Boleto à vista −3%' : '30/60/90 dias'

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb
        items={[
          { label: 'Radar', to: '/radar' },
          { label: 'Meus Carrinhos', to: '/carrinhos' },
          { label: cart.name, to: `/carrinhos/${cart.id}` },
          { label: `${pedido.label} — Acompanhamento` },
        ]}
      />
      <div className="web-app-layout">
        <div className="web-content">
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 16 }}>
            Pedido #{pedido.id}
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>
            {cart.name} — {pedido.label}
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            {pedido.items.length} itens · {formatBRL(pedido.total)} · {conditionLabel} · Representante: {cart.representative}
          </div>

          <div style={{ maxWidth: 520, marginTop: 32 }}>
            <div className="timeline">
              {trackingSteps.map((step) => (
                <div className={`tstep ${step.status === 'pending' ? '' : step.status}`} key={step.id}>
                  <div className="tdot">{step.status === 'done' ? '✓' : step.status === 'current' ? '●' : ''}</div>
                  <div className="tcontent">
                    <div className="ttitle">{step.title}</div>
                    <div className="tdate">{step.date}</div>
                    {'desc' in step && step.desc && <div className="tdesc">{step.desc}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fieldgroup" style={{ padding: 0, marginTop: 8, maxWidth: 520 }}>
            <div className="optioncard">
              <div className="oicon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="1" y="7" width="15" height="10" rx="1.5" />
                  <path d="M16 10h3l3 3v4h-6z" />
                  <circle cx="6" cy="19" r="1.6" />
                  <circle cx="17.5" cy="19" r="1.6" />
                </svg>
              </div>
              <div>
                <div className="otitle">Transportadora Rápido Sul</div>
                <div className="osub">Código de rastreio: BR84212209</div>
              </div>
            </div>
          </div>
        </div>

        <div className="web-sidebar">
          <div className="stitle">Carrinho: {cart.name.toLowerCase()}</div>
          <div className="stotal">
            {cart.pedidos.filter((p) => p.status === 'pago').length + 1} de {cart.pedidos.length} pedidos
          </div>
          <div className="ssub">{outrosPedidos.length > 0 ? `${outrosPedidos[0].label} ainda em ${outrosPedidos[0].status}` : 'Único pedido do carrinho'}</div>
          <div className="bubble">
            {cart.representative} também está acompanhando este pedido em tempo real
          </div>
          {outrosPedidos.length > 0 && (
            <div className="bubble">O outro pedido deste carrinho segue separado — acompanhe pela lista de Meus Carrinhos</div>
          )}
          <div className="sbtns">
            <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={() => navigate(`/carrinhos/${cart.id}/${pedido.id}/chat`)}>
              Falar com {cart.representative}
            </div>
            <a
              href="#"
              style={{ display: 'block', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}
              onClick={(e) => {
                e.preventDefault()
                navigate(`/carrinhos/${cart.id}`)
              }}
            >
              ← Ver carrinho completo
            </a>
          </div>
        </div>
      </div>
    </DesktopPage>
  )
}
