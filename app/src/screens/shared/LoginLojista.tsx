import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginSplitShell } from '../../components/desktop/LoginSplitShell'
import { useAppStore } from '../../lib/store'

export function LoginLojista() {
  const navigate = useNavigate()
  const setPersona = useAppStore((s) => s.setPersona)
  const profileCompleted = useAppStore((s) => s.profileCompleted)
  const [email, setEmail] = useState('carlos@radicalskate.com.br')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Perfil já preenchido (onboarding completo numa sessão anterior, ou "Já configurei" usado) —
  // não faz sentido pedir pra preencher tudo de novo, vai direto pro Radar.
  function enterAsLojista() {
    setPersona('lojista')
    navigate(profileCompleted ? '/radar' : '/onboarding/loja')
  }

  return (
    <LoginSplitShell
      heroTitle="Sua loja, do jeito que os dados mandam."
      heroSub="Reposição na hora certa, coleção com o mix que mais gira, e um radar que trabalha por você todo santo dia."
    >
      <div className="loginhead">
        <div className="kicker">Lojista</div>
        <h2>Entrar</h2>
        <div className="sub">Acesse sua conta pra ver as oportunidades de hoje</div>
      </div>

      <div className="fieldgroup" style={{ padding: 0, marginTop: 24 }}>
        <div className="flabel">E-mail</div>
        <input className="textinput" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="fieldgroup" style={{ padding: 0 }}>
        <div className="flabel">Senha</div>
        <div className="passwordfield">
          <input
            className="textinput"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="eyeicon" style={{ cursor: 'pointer' }} onClick={() => setShowPassword((v) => !v)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>
        <div className="forgotlink" style={{ cursor: 'pointer' }} onClick={() => navigate('/recuperar-senha')}>
          Esqueci minha senha
        </div>
      </div>

      <div className="btn-primary" style={{ marginTop: 24, cursor: 'pointer' }} onClick={enterAsLojista}>
        Entrar
      </div>

      <div className="orrow">ou</div>
      <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={enterAsLojista}>
        Entrar com Google
      </div>

      <div className="switchlink">
        É representante?{' '}
        <b style={{ cursor: 'pointer' }} onClick={() => navigate('/login/representante')}>
          Entrar aqui
        </b>
      </div>
    </LoginSplitShell>
  )
}
