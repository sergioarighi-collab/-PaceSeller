import { goals } from '../../lib/data'
import { useAppStore } from '../../lib/store'
import { GoalCard } from './GoalCard'
import { Button } from './Button'

export function FocusSheet() {
  const { focusOpen, closeFocus, goalId, setGoal } = useAppStore()
  if (!focusOpen) return null

  return (
    <div className="absolute inset-0 z-30">
      <div className="absolute inset-0 bg-black/50" onClick={closeFocus} />
      <div
        className="absolute left-0 right-0 bottom-0 bg-surface rounded-t-[14px] p-4 pb-6 shadow-[0_-14px_30px_rgba(0,0,0,0.14)] md:inset-0 md:flex md:items-center md:justify-center md:bg-transparent md:shadow-none md:rounded-none md:p-0"
      >
        <div className="md:w-[400px] md:bg-surface md:rounded-[8px] md:p-5 md:shadow-[0_24px_50px_rgba(20,20,22,0.16)]">
          <div className="w-9 h-1 bg-border-strong rounded-full mx-auto mb-4 md:hidden" />
          <div className="flex justify-between items-start mb-3.5">
            <div>
              <h3 className="font-display text-base font-semibold text-text-primary">Ajustar seu foco</h3>
              <div className="text-[11.5px] text-text-secondary mt-0.5">
                Isso reordena o que aparece primeiro hoje
              </div>
            </div>
            <button
              onClick={closeFocus}
              className="w-5.5 h-5.5 flex items-center justify-center bg-surface-2 rounded-full text-text-tertiary shrink-0"
            >
              ✕
            </button>
          </div>
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
          <div className="flex gap-2.5 pt-4">
            <Button variant="primary" className="flex-1" onClick={closeFocus}>
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
