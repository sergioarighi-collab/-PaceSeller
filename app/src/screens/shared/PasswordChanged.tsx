import { useNavigate } from 'react-router-dom'
import { LoginSplitShell } from '../../components/desktop/LoginSplitShell'

export function PasswordChanged() {
  const navigate = useNavigate()

  return (
    <LoginSplitShell
      heroTitle="Sua loja, do jeito que os dados mandam."
      heroSub="Reposição na hora certa, coleção com o mix que mais gira, e um radar que trabalha por você todo santo dia."
      center
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--positive-dim)',
          border: '1px solid var(--positive)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          color: 'var(--positive)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="loginhead" style={{ textAlign: 'center', marginTop: 18 }}>
        <h2>Senha alterada</h2>
        <div className="sub" style={{ margin: '8px auto 0' }}>
          Sua senha foi atualizada com sucesso. Use a nova senha no seu próximo login.
        </div>
      </div>
      <div className="fieldgroup" style={{ padding: 0, marginTop: 26 }}>
        <div className="btn-primary" style={{ cursor: 'pointer' }} onClick={() => navigate('/login/lojista')}>
          Ir para o login
        </div>
      </div>
    </LoginSplitShell>
  )
}
