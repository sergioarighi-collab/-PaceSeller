import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginSplitShell } from '../../components/desktop/LoginSplitShell'

export function ResetSent() {
  const navigate = useNavigate()
  const [cooldown, setCooldown] = useState(0)

  function resend() {
    setCooldown(60)
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(id)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

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
          background: 'var(--surface-2)',
          border: '1px solid var(--border-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </div>
      <div className="loginhead" style={{ textAlign: 'center', marginTop: 18 }}>
        <h2>Verifique seu e-mail</h2>
        <div className="sub" style={{ margin: '8px auto 0' }}>
          Enviamos um link de recuperação pra <b style={{ color: 'var(--text-primary)' }}>carlos@radicalskate.com.br</b>. Ele
          expira em 30 minutos.
        </div>
      </div>
      <div className="fieldgroup" style={{ padding: 0, marginTop: 26 }}>
        <div
          className="btn-secondary"
          style={{ cursor: cooldown ? 'default' : 'pointer', opacity: cooldown ? 0.5 : 1 }}
          onClick={() => !cooldown && resend()}
        >
          {cooldown ? `Reenviar em ${cooldown}s` : 'Reenviar e-mail'}
        </div>
      </div>
      <div className="switchlink">
        Voltar para <b style={{ cursor: 'pointer' }} onClick={() => navigate('/login/lojista')}>o login</b>
      </div>
    </LoginSplitShell>
  )
}
