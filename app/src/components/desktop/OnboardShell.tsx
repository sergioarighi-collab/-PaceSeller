import type { ReactNode } from 'react'
import { DesktopPage } from './DesktopPage'

const steps = [
  { n: 1, title: 'Dados básicos', sub: 'Nome, segmento e região' },
  { n: 2, title: 'Dados de vendas', sub: 'Ticket médio e categorias' },
  { n: 3, title: 'Objetivo do momento', sub: 'O que você quer agora' },
]

export function OnboardShell({ step, children }: { step: 1 | 2 | 3; children: ReactNode }) {
  return (
    <DesktopPage>
      <div className="onboard-shell">
        <div className="onboard-rail">
          <div className="orkicker">Configuração de perfil</div>
          <h2>Conte sobre sua loja</h2>
          <div className="orsub">Isso ajuda o radar a trazer oportunidades mais precisas pra você desde o primeiro dia.</div>
          <div className="steplist">
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
