import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginSplitShell } from '../../components/desktop/LoginSplitShell'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('carlos@radicalskate.com.br')

  return (
    <LoginSplitShell
      heroTitle="Sua loja, do jeito que os dados mandam."
      heroSub="Reposição na hora certa, coleção com o mix que mais gira, e um radar que trabalha por você todo santo dia."
    >
      <div className="loginhead">
        <div className="kicker">Recuperar senha</div>
        <h2>Esqueceu sua senha?</h2>
        <div className="sub">Digite o e-mail da sua conta e enviamos um link pra você criar uma nova senha</div>
      </div>
      <div className="fieldgroup" style={{ padding: 0, marginTop: 24 }}>
        <div className="flabel">E-mail</div>
        <input className="textinput" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div
        className="btn-primary"
        style={{ marginTop: 24, cursor: 'pointer' }}
        onClick={() => navigate('/recuperar-senha/enviado')}
      >
        Enviar link de recuperação
      </div>
      <div className="switchlink">
        Lembrou a senha? <b style={{ cursor: 'pointer' }} onClick={() => navigate('/login/lojista')}>Voltar para o login</b>
      </div>
    </LoginSplitShell>
  )
}
