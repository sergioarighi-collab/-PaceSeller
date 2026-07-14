import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Tile } from '../../components/ui/Tile'
import { Stepper } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { mixPlan } from '../../lib/data'

const swatch = ['bg-black', 'bg-border-strong', 'bg-surface-3 border border-border']

export function Planning() {
  const navigate = useNavigate()
  const [items, setItems] = useState(mixPlan.items)

  return (
    <AppShell>
      <div className="px-4.5 md:px-8 pt-4 md:pt-8 pb-6 max-w-3xl">
        <div className="eyebrow">Plano de compra</div>
        <h2 className="font-display text-[19px] font-bold text-text-primary mt-1.5">{mixPlan.planName}</h2>
        <div className="font-mono text-[13px] text-text-primary font-medium mt-1">
          Investimento: R$ {mixPlan.investment.toLocaleString('pt-BR')}
        </div>

        <div className="flex h-3.5 rounded-[4px] overflow-hidden mt-4">
          {mixPlan.mix.map((m, i) => (
            <div key={m.label} className={swatch[i]} style={{ width: `${m.pct}%` }} />
          ))}
        </div>
        <div className="flex gap-3.5 flex-wrap mt-2.5">
          {mixPlan.mix.map((m, i) => (
            <div key={m.label} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className={`w-2 h-2 rounded-sm ${swatch[i]}`} />
              {m.label} {m.pct}%
            </div>
          ))}
        </div>

        <div className="flex gap-2.5 mt-4">
          <Tile label="Giro previsto" value={`${mixPlan.turnoverDays} dias`} />
          <Tile label="Margem est." value={`${mixPlan.marginPct}%`} />
          <Tile label="Cobertura" value={`${mixPlan.coveragePct}%`} />
        </div>

        <div className="text-[11px] font-mono uppercase tracking-wide text-text-tertiary mt-5 mb-1">
          Itens do mix
        </div>
        <div className="md:grid md:grid-cols-2 gap-2.5">
          {items.map((it) => (
            <div
              key={it.productId}
              className="flex items-center justify-between bg-surface border border-border rounded-[4px] px-3.5 py-2.5 mt-2 md:mt-0"
            >
              <div className="text-[13px] text-text-primary font-medium">{it.name}</div>
              <Stepper
                qty={it.qty}
                onChange={(n) =>
                  setItems((prev) => prev.map((p) => (p.productId === it.productId ? { ...p, qty: n } : p)))
                }
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2.5 mt-6">
          <Button variant="secondary" className="flex-1">
            Ajustar mix
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => navigate('/pedidos/o1')}>
            Enviar ao carrinho
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
