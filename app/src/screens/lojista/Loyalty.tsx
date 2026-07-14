import { AppShell } from '../../components/layout/AppShell'
import { InsightCard } from '../../components/ui/InsightCard'
import { ListGroup, TileGrid } from '../../components/ui/ListGroup'
import { Button } from '../../components/ui/Button'
import { loyaltyInsights, loyaltyPanel } from '../../lib/data'

export function Loyalty() {
  return (
    <AppShell>
      <div className="px-4.5 md:px-8 pt-4 md:pt-8 pb-4">
        <div className="text-[13px] text-text-secondary">Seus clientes</div>
        <h2 className="font-display text-[22px] md:text-2xl font-bold text-text-primary mt-1">
          32 consumidores cadastrados
        </h2>
        <div className="text-[13px] text-text-secondary mt-1.5">3 oportunidades de fidelização hoje</div>

        <div className="flex md:grid md:grid-cols-3 gap-2.5 overflow-x-auto no-scrollbar mt-4 -mx-4.5 px-4.5 md:mx-0 md:px-0">
          {loyaltyInsights.map((c) => (
            <InsightCard key={c.id} data={c} />
          ))}
        </div>

        <div className="text-[11px] font-mono uppercase tracking-wide text-text-tertiary mt-5 mb-1">
          Sua carteira de clientes
        </div>
        <ListGroup rows={loyaltyPanel} />
        <TileGrid rows={loyaltyPanel} />

        <div className="mt-6 md:mt-8">
          <Button variant="primary" className="w-full md:w-auto">
            Enviar campanha personalizada
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
