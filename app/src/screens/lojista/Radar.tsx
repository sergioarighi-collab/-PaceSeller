import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { InsightCard } from '../../components/ui/InsightCard'
import { ListGroup, TileGrid } from '../../components/ui/ListGroup'
import { Button } from '../../components/ui/Button'
import { FocusSheet } from '../../components/ui/FocusSheet'
import { lojistaRadarInsights, dailyPanel } from '../../lib/data'
import { useAppStore } from '../../lib/store'

export function Radar() {
  const navigate = useNavigate()
  const openFocus = useAppStore((s) => s.openFocus)

  return (
    <AppShell>
      <div className="px-4.5 md:px-8 pt-4 md:pt-8 pb-4 relative">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[13px] text-text-secondary">Bom dia, Carlos</div>
            <h2 className="font-display text-[22px] md:text-2xl font-bold text-text-primary mt-1 max-w-[280px]">
              Sua loja está saudável
            </h2>
            <div className="text-[13px] text-text-secondary mt-1.5 max-w-[280px]">
              5 oportunidades identificadas hoje
            </div>
          </div>
          <button
            onClick={openFocus}
            className="text-[10.5px] font-mono text-text-primary bg-surface-2 border border-border px-2.5 py-1.5 rounded-full shrink-0"
          >
            Ajustar foco
          </button>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-2.5 overflow-x-auto no-scrollbar mt-4 -mx-4.5 px-4.5 md:mx-0 md:px-0">
          {lojistaRadarInsights.map((c) => (
            <InsightCard key={c.id} data={c} />
          ))}
        </div>

        <div className="text-[11px] font-mono uppercase tracking-wide text-text-tertiary mt-5 mb-1">
          Painel do dia
        </div>
        <ListGroup rows={dailyPanel} onRowClick={() => navigate('/catalogo')} />
        <TileGrid rows={dailyPanel} onTileClick={() => navigate('/catalogo')} />

        <div className="mt-6 md:mt-8">
          <Button variant="primary" className="w-full md:w-auto" onClick={() => navigate('/planejamento')}>
            Ver planejamento de compra
          </Button>
        </div>
      </div>
      <FocusSheet />
    </AppShell>
  )
}
