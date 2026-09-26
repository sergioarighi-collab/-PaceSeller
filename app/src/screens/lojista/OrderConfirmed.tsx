import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { useAppStore } from '../../lib/store'
import { formatBRL } from '../../lib/format'

export function OrderConfirmed() {
  const navigate = useNavigate()
  const { cartId } = useParams()
  const carrinhos = useAppStore((s) => s.carrinhos)
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]
  const pedido = cart.pedido

  return (
    <DesktopPage>
      <WebTopNav />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 600, padding: 40 }}>
        <div style={{ width: 440, textAlign: 'center' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'var(--black)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 20 }}>
            {pedido.label} confirmado
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
            Esse pedido está com a Tesla agora — já saiu da sua mão e da {cart.representative}. Assim que passar pela análise e entrar em produção, você acompanha tudo por aqui.
          </p>

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: 20, marginTop: 26, textAlign: 'left' }}>
            <div className="sumrow">
              <span>Número do pedido</span>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>#{pedido.id}</span>
            </div>
            <div className="sumrow">
              <span>Valor deste pedido</span>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>{formatBRL(pedido.total)}</span>
            </div>
            <div className="sumrow">
              <span>Prazo estimado</span>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>
                {pedido.deliveryEstimateDays > 0 ? `${pedido.deliveryEstimateDays} dias úteis` : 'Imediato'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
            <div className="btn-secondary" style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate('/radar')}>
              Voltar ao radar
            </div>
            <div
              className="btn-primary"
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => navigate(`/carrinhos/${cart.id}/${pedido.id}/acompanhamento`)}
            >
              Acompanhar pedido
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  )
}
