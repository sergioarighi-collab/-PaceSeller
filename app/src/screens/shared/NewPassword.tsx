import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginSplitShell } from '../../components/desktop/LoginSplitShell'

export function NewPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  return (
    <LoginSplitShell
      heroTitle="Sua loja, do jeito que os dados mandam."
      heroSub="Reposição na hora certa, coleção com o mix que mais gira, e um radar que trabalha por você todo santo dia."
    >
      <div className="loginhead">
        <div className="kicker">Recuperação de senha</div>
        <h2>Criar nova senha</h2>
        <div className="sub">Escolha uma senha nova pra sua conta — o link usado expira depois de confirmar</div>
      </div>
      <div className="fieldgroup" style={{ padding: 0, marginTop: 24 }}>
        <div className="flabel">Nova senha</div>
        <div className="passwordfield">
          <input className="textinput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
          Mínimo de 8 caracteres, com pelo menos 1 número
        </div>
      </div>
      <div className="fieldgroup" style={{ padding: 0, marginTop: 18 }}>
        <div className="flabel">Confirmar nova senha</div>
        <div className="passwordfield">
          <input className="textinput" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
      </div>
      <div
        className="btn-primary"
        style={{ marginTop: 24, cursor: 'pointer' }}
        onClick={() => navigate('/recuperar-senha/sucesso')}
      >
        Salvar nova senha
      </div>
      <div className="switchlink">
        Lembrou a senha afinal?{' '}
        <b style={{ cursor: 'pointer' }} onClick={() => navigate('/login/lojista')}>
          Voltar para o login
        </b>
      </div>
    </LoginSplitShell>
  )
}
