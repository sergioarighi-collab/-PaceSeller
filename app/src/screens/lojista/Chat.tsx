import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { useAppStore } from '../../lib/store'
import { formatBRL } from '../../lib/format'

export function Chat() {
  const navigate = useNavigate()
  const { cartId, pedidoId } = useParams()
  const carrinhos = useAppStore((s) => s.carrinhos)
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]
  const pedido = cart.pedidos.find((p) => p.id === pedidoId) ?? cart.pedidos[0]
  const outroPedido = cart.pedidos.find((p) => p.id !== pedido.id)

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb
        items={[
          { label: 'Radar', to: '/radar' },
          { label: 'Carrinhos', to: '/carrinhos' },
          { label: pedido.label, to: `/carrinhos/${cart.id}` },
          { label: `Falar com ${cart.representative}` },
        ]}
      />
      <div className="web-app-layout">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="chat-shell">
            <div className="chat-header">
              <div className="ch-avatar">AN</div>
              <div>
                <div className="ch-name">Ana Ferreira</div>
                <div className="ch-status">
                  <span className="dot" />
                  Online agora · sua representante
                </div>
              </div>
            </div>

            <div className="chat-thread">
              <div className="chat-day">Hoje</div>

              <div className="msg-row">
                <div className="msg-avatar">AN</div>
                <div>
                  <div className="msg-bubble">
                    Bom dia, Carlos! Vi que o pedido #4790 atrasou — já cobrei a fábrica, deve normalizar até amanhã.
                  </div>
                  <div className="msg-time">09:12</div>
                </div>
              </div>

              <div className="msg-row mine">
                <div className="msg-avatar">CA</div>
                <div>
                  <div className="msg-bubble">Valeu por avisar! E sobre o carrinho da Coleção Inverno, aquele pedido separado da sandália?</div>
                  <div className="msg-time">09:15</div>
                </div>
              </div>

              <div className="msg-row">
                <div className="msg-avatar">AN</div>
                <div>
                  <div className="msg-bubble">
                    Separei ela num pedido à vista pra você aproveitar os 3% de desconto — os outros itens ficam no prazo
                    normal. Dá uma olhada quando puder.
                  </div>
                  <div className="msg-time">09:16</div>
                </div>
              </div>

              {outroPedido && (
                <div className="msg-row">
                  <div className="msg-avatar">AN</div>
                  <div
                    className="msg-context-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/carrinhos/${cart.id}`)}
                  >
                    <div className="mc-label">Pedido referenciado</div>
                    <div className="mc-title">
                      {cart.name} — {outroPedido.label} · {formatBRL(outroPedido.total)}
                    </div>
                  </div>
                  <div className="msg-time">09:16</div>
                </div>
              )}

              <div className="msg-row mine">
                <div className="msg-avatar">CA</div>
                <div>
                  <div className="msg-bubble">Perfeito, faz sentido. Pode confirmar assim mesmo.</div>
                  <div className="msg-time">09:41</div>
                </div>
              </div>
            </div>

            <div className="chat-inputbar">
              <div className="chat-input">Escreva uma mensagem para Ana...</div>
              <div className="chat-send">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 3 18 9-18 9V3Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="web-sidebar">
          <div className="stitle">Sobre Ana</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <div className="ch-avatar" style={{ width: 44, height: 44 }}>
              AN
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Ana Ferreira</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Representante desde 2022</div>
            </div>
          </div>
          <div className="bubble">Responde normalmente em até 2 horas em dias úteis</div>
          <div className="sbtns">
            <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={() => navigate(`/carrinhos/${cart.id}`)}>
              Ver carrinho {cart.name}
            </div>
            {outroPedido && (
              <div
                className="btn-secondary"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/carrinhos/${cart.id}/${outroPedido.id}/acompanhamento`)}
              >
                Ver pedido #{outroPedido.id}
              </div>
            )}
          </div>
        </div>
      </div>
    </DesktopPage>
  )
}
