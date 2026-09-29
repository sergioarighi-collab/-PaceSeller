import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { LoginSplitShell } from '../../components/desktop/LoginSplitShell'
import { users } from '../../lib/data'
import { useAppStore } from '../../lib/store'

// Desktop (set/2026) — antes usava AuthShell + teclado numérico touch (padrão de celular). Pra
// desktop, um campo de texto de 4 dígitos com confirmação por botão/Enter é o equivalente natural
// (mesmo princípio de outros apps com PIN/código de verificação em tela grande). Ver
// guia-dev-frontend.md.
export function ConfirmPin() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const setActiveUser = useAppStore((s) => s.setActiveUser)
  const user = users.find((u) => u.id === userId) ?? users[1]
  const titular = users.find((u) => u.role === 'titular')!
  const [pin, setPin] = useState('')

  function confirm() {
    if (pin.length === 4) navigate('/rep/radar')
  }

  return (
    <LoginSplitShell heroTitle="Cada ação, com a assinatura certa." heroSub="Titular e auxiliares compartilham a mesma carteira — cada pedido, comentário e mensagem fica registrado em nome de quem realmente agiu." center>
      <div className="loginhead" style={{ textAlign: 'center' }}>
        <div
          className="oicon"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            fontFamily: 'var(--mono)',
            fontWeight: 600,
            fontSize: 14,
            background: 'var(--surface-2)',
            color: 'var(--text-primary)',
            margin: '0 auto',
          }}
        >
          {user.initials}
        </div>
        <h2 style={{ marginTop: 14 }}>Oi, {user.name.split(' ')[0]}</h2>
        <div className="sub" style={{ margin: '7px auto 0', maxWidth: 280 }}>
          Confirme seu PIN de 4 dígitos pra continuar como auxiliar de {titular.name.split(' ')[0]}
        </div>
      </div>

      <div className="fieldgroup" style={{ padding: 0, marginTop: 22 }}>
        <input
          className="textinput"
          style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 22, letterSpacing: '0.5em', paddingLeft: 22 }}
          value={pin}
          maxLength={4}
          inputMode="numeric"
          autoFocus
          placeholder="••••"
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={(e) => e.key === 'Enter' && confirm()}
        />
      </div>

      <div
        className="btn-primary"
        style={{ marginTop: 18, cursor: pin.length === 4 ? 'pointer' : 'not-allowed', opacity: pin.length === 4 ? 1 : 0.5 }}
        onClick={confirm}
      >
        Confirmar
      </div>

      <div
        className="switchlink"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setActiveUser(titular)
          navigate('/rep/radar')
        }}
      >
        Esqueceu o PIN? <b>Entrar como {titular.name.split(' ')[0]}</b>
      </div>
    </LoginSplitShell>
  )
}
