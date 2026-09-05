import type { ReactNode } from 'react'
import { DesktopPage } from './DesktopPage'
import heroImg from '../../assets/images/hero-login-aerial.jpg'

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
          className="heroside heroside-photo"
          style={{
            backgroundImage: `linear-gradient(rgba(22,22,24,0.55), rgba(22,22,24,0.75)), linear-gradient(rgba(197,153,32,0.13), rgba(197,153,32,0.13)), url(${heroImg})`,
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
