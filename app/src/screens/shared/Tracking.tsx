import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Timeline } from '../../components/ui/Timeline'
import { OptionCard } from '../../components/ui/OptionCard'
import { Button } from '../../components/ui/Button'
import { OrdersIcon } from '../../components/layout/icons'
import { orders, trackingSteps } from '../../lib/data'
import { useAppStore } from '../../lib/store'

export function Tracking() {
  const navigate = useNavigate()
  const { id } = useParams()
  const order = orders.find((o) => o.id === id) ?? orders[0]
  const persona = useAppStore((s) => s.persona)

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 px-4.5 md:px-8 pt-4 md:pt-8 pb-4 max-w-2xl">
          <div className="eyebrow">Pedido #{order.id === 'o1' ? '4821' : order.id}</div>
          <h2 className="font-display text-xl font-bold text-text-primary mt-1.5">{order.name}</h2>
          <div className="text-[12.5px] text-text-secondary mt-1">
            {order.items.length} itens · R$ {order.total.toLocaleString('pt-BR')} · Representante:{' '}
            {order.representative}
          </div>

          <div className="mt-5">
            <Timeline steps={trackingSteps} />
          </div>

          <div className="mt-2">
            <OptionCard
              icon={<OrdersIcon />}
              title="Transportadora Rápido Sul"
              sub="Código de rastreio: BR84212209"
              chevron={false}
            />
          </div>

          <div className="bg-surface-2 border border-border rounded-[4px] px-3.5 py-3 mt-3.5 text-[12.5px] text-text-primary">
            {persona === 'representante' ? 'O lojista' : order.representative} também acompanha esse pedido em
            tempo real.
          </div>

          <div className="flex gap-2.5 mt-6 pb-4">
            <Button variant="secondary" className="flex-1">
              Falar com {order.representative}
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate(`/pedidos/${order.id}`)}>
              Ver pedido
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
