import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Chip } from '../../components/ui/Chip'
import { ClientCard } from '../../components/ui/ClientCard'
import { clients } from '../../lib/data'

const filters = ['Todos', 'Alta recompra', 'Em risco', 'Sem nova coleção']

export function Wallet() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState(filters[0])

  return (
    <AppShell>
      <div className="px-4.5 md:px-8 pt-4 md:pt-8 pb-4">
        <h2 className="font-display text-lg font-bold text-text-primary">Carteira de clientes</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3">
          {filters.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>
        <div className="md:grid md:grid-cols-3 gap-2.5 mt-2">
          {clients.map((c) => (
            <ClientCard key={c.id} client={c} onAction={() => navigate(`/rep/carteira/${c.id}/pedido`)} />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
