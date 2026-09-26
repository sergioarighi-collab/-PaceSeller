import { useNavigate } from 'react-router-dom'
import { LoginSplitShell } from '../../components/desktop/LoginSplitShell'
import { useAppStore } from '../../lib/store'

export function ProfileSelect() {
  const navigate = useNavigate()
  const setPersona = useAppStore((s) => s.setPersona)

  return (
    <LoginSplitShell
      heroTitle="Compre com dados, não com achismo."
      heroSub="O radar comercial mostra o que vender, quando repor e qual mix dá mais margem — antes de você abrir o catálogo."
    >
      <div className="loginhead">
        <h2>Bem-vindo</h2>
        <div className="sub">Como você acessa a plataforma?</div>
      </div>

      <div
        className="personacard"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setPersona('lojista')
          navigate('/login/lojista')
        }}
      >
        <div className="picon">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16l-1.4 10.3a2 2 0 0 1-2 1.7H7.4a2 2 0 0 1-2-1.7L4 7Z" />
            <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
          </svg>
        </div>
        <div>
          <div className="ptitle">Sou lojista</div>
          <div className="psub">Comprar, planejar e acompanhar pedidos</div>
        </div>
        <div className="pchev">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </div>
      </div>

      <div
        className="personacard"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setPersona('representante')
          navigate('/login/representante')
        }}
      >
        <div className="picon">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="8" r="3" />
            <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
            <circle cx="17" cy="8" r="2.4" />
            <path d="M15.5 14c2.6.3 4.5 2 4.5 5" />
          </svg>
        </div>
        <div>
          <div className="ptitle">Sou representante</div>
          <div className="psub">Gerenciar carteira de clientes e pedidos</div>
        </div>
        <div className="pchev">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </div>
      </div>

      <div className="switchlink">
        Ainda não tem conta? <b>Fale com a indústria</b>
      </div>
    </LoginSplitShell>
  )
}
