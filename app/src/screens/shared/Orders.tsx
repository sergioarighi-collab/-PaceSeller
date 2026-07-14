import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Chip } from '../../components/ui/Chip'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CartContent } from '../../components/ui/CartContent'
import { orders } from '../../lib/data'
import { useAppStore } from '../../lib/store'
import type { Severity } from '../../lib/types'

const statusTone: Record<string, Severity> = { rascunho: 'neutral', aguardando: 'risk', aprovado: 'positive' }
const statusLabel: Record<string, string> = {
  rascunho: 'Rascunho',
  aguardando: 'Aguardando representante',
  aprovado: 'Aprovado',
}
const filters = ['Todos', 'Rascunho', 'Com representante', 'Aprovados']

export function Orders() {
  const navigate = useNavigate()
  const { id } = useParams()
  const setActiveOrderId = useAppStore((s) => s.setActiveOrderId)
  const [filter, setFilter] = useState(filters[0])

  const activeOrder = orders.find((o) => o.id === id) ?? orders[0]

  return (
    <AppShell>
      {/* Mobile: list, drilling into an order */}
      <div className="md:hidden">
        {!id ? (
          <div className="px-4.5 pt-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-display text-lg font-bold text-text-primary">Meus pedidos</h2>
              <div className="w-9 h-9 bg-surface-2 border border-border rounded-[4px] flex items-center justify-center text-text-secondary">
                +
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2.5">
              {filters.map((f) => (
                <Chip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />
              ))}
            </div>
            <div className="pb-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => {
                    setActiveOrderId(o.id)
                    navigate(`/pedidos/${o.id}`)
                  }}
                  className="bg-surface border border-border rounded-[4px] p-3.5 mt-2.5 cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-display text-sm font-semibold text-text-primary">{o.name}</div>
                    <Badge label={statusLabel[o.status]} tone={statusTone[o.status]} />
                  </div>
                  <div className="font-mono text-xs text-text-tertiary mt-1.5">
                    {o.items.length} itens · R$ {o.total.toLocaleString('pt-BR')}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <Badge label={`Representante: ${o.representative}`} tone="neutral" />
                    <Badge label={`Atualizado ${o.updatedAt}`} tone="neutral" />
                  </div>
                </div>
              ))}
            </div>
            <div className="pb-4">
              <Button variant="primary" className="w-full">
                Criar novo pedido
              </Button>
            </div>
          </div>
        ) : (
          <CartContent order={activeOrder} showSidebar={false} />
        )}
      </div>

      {/* Tablet+: merged tabs + content + sidebar */}
      <div className="hidden md:block">
        <CartContent order={activeOrder} />
      </div>
    </AppShell>
  )
}
