import { useNavigate } from 'react-router-dom'
import { LoginSplitShell } from '../../components/desktop/LoginSplitShell'
import { users } from '../../lib/data'
import { useAppStore } from '../../lib/store'

// Desktop (set/2026) — antes usava AuthShell (mobile, Tailwind). É a tela de "prepostos": o titular
// da conta do representante (Ana) mais os auxiliares que também usam a mesma conta — mesmo
// mecanismo de User.role já usado no protótipo mobile, só reconstruído com os componentes desktop
// (.optioncard, já usado no picker "Em qual carrinho?" do OrderDrawer). Ver guia-dev-frontend.md.
export function WhoIsUsing() {
  const navigate = useNavigate()
  const setActiveUser = useAppStore((s) => s.setActiveUser)
  const titular = users.find((u) => u.role === 'titular')!

  return (
    <LoginSplitShell heroTitle="Cada ação, com a assinatura certa." heroSub="Titular e auxiliares compartilham a mesma carteira — cada pedido, comentário e mensagem fica registrado em nome de quem realmente agiu.">
      <div className="loginhead">
        <div className="kicker">Conta: {titular.name}</div>
        <h2>Quem está usando agora?</h2>
        <div className="sub">Isso identifica cada ação feita dentro da conta — pedidos, comentários e mensagens</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
        {users.map((u) => (
          <div
            key={u.id}
            className="optioncard"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setActiveUser(u)
              if (u.role === 'titular') navigate('/rep/radar')
              else navigate(`/login/pin/${u.id}`)
            }}
          >
            <div
              className="oicon"
              style={{
                borderRadius: '50%',
                fontFamily: 'var(--mono)',
                fontWeight: 600,
                fontSize: 12,
                background: u.role === 'titular' ? 'var(--black)' : 'var(--surface-2)',
                color: u.role === 'titular' ? '#fff' : 'var(--text-primary)',
              }}
            >
              {u.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div className="otitle">{u.name}</div>
              <div className="osub">{u.role === 'titular' ? 'Titular da conta' : 'Auxiliar'}</div>
            </div>
            <span
              className="badge"
              style={
                u.role === 'titular'
                  ? { background: 'var(--black)', color: '#fff' }
                  : { background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
              }
            >
              {u.role === 'titular' ? 'TITULAR' : 'AUXILIAR'}
            </span>
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            border: '1px dashed var(--border-strong)',
            borderRadius: 4,
            padding: 14,
            fontSize: 13,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <span>+</span> Adicionar auxiliar
        </div>
      </div>
    </LoginSplitShell>
  )
}
