import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { ClientCard } from '../../components/ui/ClientCard'
import { FocusSheet } from '../../components/ui/FocusSheet'
import { clients } from '../../lib/data'
import { useAppStore } from '../../lib/store'

export function RepRadar() {
  const navigate = useNavigate()
  const openFocus = useAppStore((s) => s.openFocus)

  return (
    <AppShell>
      <div className="px-4.5 md:px-8 pt-4 md:pt-8 pb-4 relative">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[13px] text-text-secondary">Bom dia, Ana</div>
            <h2 className="font-display text-[22px] md:text-2xl font-bold text-text-primary mt-1">
              Sua carteira hoje
            </h2>
            <div className="text-[13px] text-text-secondary mt-1.5">12 clientes ativos · 4 prioridades</div>
          </div>
          <button
            onClick={openFocus}
            className="text-[10.5px] font-mono text-text-primary bg-surface-2 border border-border px-2.5 py-1.5 rounded-full shrink-0"
          >
            Ajustar foco
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mt-4">
          {['4 · alta recompra', '2 · perderam volume', '6 · sem nova coleção'].map((p) => (
            <span
              key={p}
              className="text-[11px] font-mono text-text-secondary bg-surface-2 border border-border px-2.5 py-1.5 rounded-full"
            >
              {p}
            </span>
          ))}
        </div>

        <div className="text-[11px] font-mono uppercase tracking-wide text-text-tertiary mt-5 mb-1">
          Clientes priorizados
        </div>
        <div className="md:grid md:grid-cols-3 gap-2.5">
          {clients.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              onAction={() => (c.actionLabel.includes('pedido') ? navigate(`/rep/carteira/${c.id}/pedido`) : undefined)}
            />
          ))}
        </div>
      </div>
      <FocusSheet />
    </AppShell>
  )
}
