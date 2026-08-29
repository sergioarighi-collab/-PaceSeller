import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { useAppStore } from '../../lib/store'
import type { Carrinho } from '../../lib/types'
import { formatBRL } from '../../lib/format'

const filters = ['Todos', 'Rascunho', 'Aguardando pagamento', 'Confirmados']

function aggregateStatus(pedidos: Carrinho['pedidos']) {
  if (pedidos.every((p) => p.status === 'pago')) return 'confirmado'
  if (pedidos.some((p) => p.status === 'aguardando')) return 'aguardando'
  return 'rascunho'
}

export function MeusCarrinhos() {
  const navigate = useNavigate()
  const carrinhos = useAppStore((s) => s.carrinhos)
  const setActiveCarrinho = useAppStore((s) => s.setActiveCarrinho)
  const [filter, setFilter] = useState(filters[0])

  const rows = carrinhos
    .map((c) => {
      const status = aggregateStatus(c.pedidos)
      const totalItems = c.pedidos.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.qty, 0), 0)
      const totalValue = c.pedidos.reduce((sum, p) => sum + p.total, 0)
      return { cart: c, status, totalItems, totalValue }
    })
    .filter((r) => {
      if (filter === 'Todos') return true
      if (filter === 'Rascunho') return r.status === 'rascunho'
      if (filter === 'Aguardando pagamento') return r.status === 'aguardando'
      return r.status === 'confirmado'
    })

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

        <div className="filterbar" style={{ marginTop: 20 }}>
          {filters.map((f) => (
            <div key={f} className={`chip ${filter === f ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter(f)}>
              {f}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 900 }}>
          {rows.map(({ cart, status, totalItems, totalValue }) => (
            <div className="pcard-web" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 22px' }} key={cart.id}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{cart.name}</div>
                  <span className={`badge ${status === 'confirmado' ? 'pos' : 'neutral'}`}>
                    {cart.pedidos.length} pedido{cart.pedidos.length > 1 ? 's' : ''} · {status}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
                  {totalItems} pares · {formatBRL(totalValue)} · Representante: {cart.representative} · Atualizado {cart.updatedAt}
                </div>
              </div>
              <div className="btn-secondary" style={{ width: 120, cursor: 'pointer' }} onClick={() => navigate(`/carrinhos/${cart.id}`)}>
                Abrir
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', padding: '64px 0' }}>Nenhum carrinho nessa categoria</div>
          )}
        </div>
      </div>
    </DesktopPage>
  )
}
