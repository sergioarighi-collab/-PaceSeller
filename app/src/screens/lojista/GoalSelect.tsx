import { useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { StepBar } from '../../components/ui/StepBar'
import { GoalCard } from '../../components/ui/GoalCard'
import { Button } from '../../components/ui/Button'
import { goals } from '../../lib/data'
import { useAppStore } from '../../lib/store'

export function GoalSelect() {
  const navigate = useNavigate()
  const { goalId, setGoal } = useAppStore()

  return (
    <AuthShell width={560}>
      <StepBar step={3} />
      <div className="eyebrow">Última etapa</div>
      <h2 className="font-display text-xl font-bold text-text-primary mt-2">O que você quer fazer agora?</h2>
      <div className="text-[12.5px] text-text-secondary mt-1.5 leading-relaxed max-w-[420px]">
        Isso ajusta o que aparece primeiro no seu radar hoje — você pode mudar quando quiser
      </div>

      <div className="grid md:grid-cols-2 gap-2.5 mt-2">
        {goals.map((g) => (
          <GoalCard
            key={g.id}
            icon={<span className="text-xs">●</span>}
            title={g.title}
            sub={g.sub}
            selected={goalId === g.id}
            onClick={() => setGoal(g.id)}
          />
        ))}
      </div>

      <Button variant="primary" className="w-full mt-7" onClick={() => navigate('/radar')}>
        Ir para o meu radar
      </Button>
    </AuthShell>
  )
}
