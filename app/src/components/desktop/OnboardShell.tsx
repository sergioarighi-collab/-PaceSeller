import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { DesktopPage } from './DesktopPage'
import { useAppStore } from '../../lib/store'

const steps = [
  { n: 1, title: 'Dados básicos', sub: 'Nome, segmento e região' },
  { n: 2, title: 'Dados de vendas', sub: 'Ticket médio e categorias' },
]

export function OnboardShell({ step, children }: { step: 1 | 2; children: ReactNode }) {
  const navigate = useNavigate()
  const skipOnboarding = useAppStore((s) => s.skipOnboarding)

  return (
    <DesktopPage>
      <div className="onboard-shell">
        <div className="onboard-rail">
          <div className="orkicker">Configuração de perfil</div>
          <h2>Conte sobre sua loja</h2>
          <div className="orsub">Isso ajuda o radar a trazer oportunidades mais precisas pra você desde o primeiro dia.</div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 14,
              fontSize: 12,
              color: 'var(--text-secondary)',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onClick={() => {
              skipOnboarding()
              navigate('/radar')
            }}
          >
            Já configurei, ir para o Radar
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
          <div className="steplist" style={{ marginTop: 28 }}>
            {steps.map((s) => {
              const state = s.n < step ? 'done' : s.n === step ? 'current' : ''
              return (
                <div className={`stepitem ${state}`} key={s.n}>
                  <div className="sdot">{s.n < step ? '✓' : s.n}</div>
                  <div>
                    <div className="stitle2">{s.title}</div>
                    <div className="ssub2">{s.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="onboard-main">{children}</div>
      </div>
    </DesktopPage>
  )
}
