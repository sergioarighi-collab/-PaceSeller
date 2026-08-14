import type { ReactNode } from 'react'
import { DesktopPage } from './DesktopPage'

export function LoginSplitShell({
  heroTitle,
  heroSub,
  center,
  children,
}: {
  heroTitle: string
  heroSub: string
  center?: boolean
  children: ReactNode
}) {
  return (
    <DesktopPage>
      <div className="loginsplit">
        <div
          className="heroside"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 15%, rgba(255,255,255,0.08), transparent 45%), radial-gradient(circle at 85% 85%, rgba(255,255,255,0.06), transparent 50%)',
          }}
        >
          <div>
            <div className="htag">Tesla Retail Performance</div>
            <h1>{heroTitle}</h1>
            <div className="hsub">{heroSub}</div>
          </div>
          <div className="hstats">
            <div className="hstat">
              <div className="hval">3.200+</div>
              <div className="hlabel">lojistas ativos</div>
            </div>
            <div className="hstat">
              <div className="hval">42%</div>
              <div className="hlabel">margem média acima do mercado</div>
            </div>
            <div className="hstat">
              <div className="hval">18 mil</div>
              <div className="hlabel">pedidos processados/mês</div>
            </div>
          </div>
        </div>
        <div className="formside">
          <div className="formcard" style={center ? { textAlign: 'center' } : undefined}>
            {children}
            <div className="loginfooter">
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, color: 'var(--text-tertiary)' }}>
                TESLA SKATE
              </span>
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  )
}
