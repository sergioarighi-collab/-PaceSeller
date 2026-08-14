import { useNavigate } from 'react-router-dom'
import { OnboardShell } from '../../components/desktop/OnboardShell'
import { useAppStore } from '../../lib/store'
import { goals } from '../../lib/data'

const icons: Record<string, React.ReactNode> = {
  g1: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V10M11 19V5M18 19v-6" />
    </svg>
  ),
  g2: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  ),
  g3: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <circle cx="17" cy="8" r="2.4" />
      <path d="M15.5 14c2.6.3 4.5 2 4.5 5" />
    </svg>
  ),
  g4: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  ),
}

export function GoalSelect() {
  const navigate = useNavigate()
  const goalId = useAppStore((s) => s.goalId)
  const setGoal = useAppStore((s) => s.setGoal)

  return (
    <OnboardShell step={3}>
      <div className="omhead">
        <h2>O que você quer fazer agora?</h2>
        <div className="omsub">Isso ajusta o que aparece primeiro no seu radar hoje — você pode mudar quando quiser.</div>
      </div>
      <div className="onboard-form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {goals.map((g) => {
            const selected = goalId === g.id
            return (
              <div
                key={g.id}
                className={`goalcard ${selected ? 'selected' : ''}`}
                style={{ marginTop: 0, cursor: 'pointer' }}
                onClick={() => setGoal(g.id)}
              >
                <div className="gicon">{icons[g.id]}</div>
                <div>
                  <div className="gtitle">{g.title}</div>
                  <div className="gsub">{g.sub}</div>
                </div>
                <div className="gcheck">{selected ? '✓' : ''}</div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 36 }}>
          <div className="btn-primary" style={{ width: 220, cursor: 'pointer' }} onClick={() => navigate('/radar')}>
            Ir para o meu radar
          </div>
        </div>
      </div>
    </OnboardShell>
  )
}
