import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardShell } from '../../components/desktop/OnboardShell'
import { useAppStore } from '../../lib/store'

const categorias = ['Coil', 'Hertz', 'Flow', 'Fusion']
const sazonalidades = ['Inverno', 'Verão', 'Volta às aulas', 'Black Friday']

export function WizardStep2() {
  const navigate = useNavigate()
  const dismissOnboardingNotice = useAppStore((s) => s.dismissOnboardingNotice)
  const [ticket, setTicket] = useState('R$ 180,00')
  const [cats, setCats] = useState<string[]>(['Coil', 'Hertz'])
  const [saz, setSaz] = useState<string[]>(['Inverno'])

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  return (
    <OnboardShell step={2}>
      <div className="omhead">
        <h2>Fale sobre suas vendas</h2>
        <div className="omsub">Quanto mais dados, mais preciso fica o seu radar — pode conectar automaticamente ou preencher na mão.</div>
      </div>
      <div className="onboard-form">
        <div className="fieldgroup" style={{ marginTop: 0 }}>
          <div className="optioncard" style={{ maxWidth: 520, cursor: 'pointer' }}>
            <div className="oicon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 4h16v4H4zM4 12h16v4H4zM8 8v4M16 8v4" />
              </svg>
            </div>
            <div>
              <div className="otitle">Conectar meu sistema de vendas</div>
              <div className="osub">Importa e atualiza os dados automaticamente todo dia</div>
            </div>
            <div className="ochev">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </div>
          </div>
        </div>
        <div className="divider-text" style={{ maxWidth: 520, marginLeft: 0 }}>
          ou preencha manualmente
        </div>
        <div className="fieldrow2">
          <div className="fieldgroup">
            <div className="flabel">Ticket médio</div>
            <input className="textinput" value={ticket} onChange={(e) => setTicket(e.target.value)} />
          </div>
          <div className="fieldgroup">
            <div className="flabel">Categorias mais vendidas</div>
            <div className="chipselect">
              {categorias.map((c) => (
                <div
                  key={c}
                  className={`chip ${cats.includes(c) ? 'selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggle(cats, setCats, c)}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="fieldgroup">
          <div className="flabel">Sazonalidade forte</div>
          <div className="chipselect">
            {sazonalidades.map((s) => (
              <div
                key={s}
                className={`chip ${saz.includes(s) ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggle(saz, setSaz, s)}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
          <div className="btn-secondary" style={{ width: 130, cursor: 'pointer' }} onClick={() => navigate('/onboarding/loja')}>
            Voltar
          </div>
          <div
            className="btn-primary"
            style={{ width: 180, cursor: 'pointer' }}
            onClick={() => {
              dismissOnboardingNotice()
              navigate('/radar')
            }}
          >
            Ir para o meu radar
          </div>
        </div>
      </div>
    </OnboardShell>
  )
}
