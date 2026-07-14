import { useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { users } from '../../lib/data'
import { useAppStore } from '../../lib/store'

export function WhoIsUsing() {
  const navigate = useNavigate()
  const setActiveUser = useAppStore((s) => s.setActiveUser)

  return (
    <AuthShell width={460}>
      <div className="text-center mb-6">
        <div className="eyebrow">Conta: Ana Silva</div>
        <h2 className="font-display text-xl font-bold text-text-primary mt-1">Quem está usando agora?</h2>
        <div className="text-[12.5px] text-text-secondary mt-2 max-w-[320px] mx-auto leading-relaxed">
          Isso identifica cada ação feita dentro da conta — pedidos, comentários e mensagens
        </div>
      </div>

      {users.map((u) => (
        <div
          key={u.id}
          onClick={() => {
            setActiveUser(u)
            if (u.role === 'titular') navigate('/rep/radar')
            else navigate(`/login/pin/${u.id}`)
          }}
          className="flex items-center gap-3 bg-surface border border-border-strong rounded-[4px] p-3.5 mb-2.5 cursor-pointer"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-semibold shrink-0 ${
              u.role === 'titular' ? 'bg-black text-white' : 'bg-surface-3 text-text-primary'
            }`}
          >
            {u.initials}
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-text-primary">{u.name}</div>
            <div className="text-[11.5px] text-text-secondary">
              {u.role === 'titular' ? 'Titular da conta' : 'Auxiliar'}
            </div>
          </div>
          <span
            className={`text-[10px] font-mono uppercase px-2 py-1 rounded-[4px] ${
              u.role === 'titular' ? 'bg-black text-white' : 'bg-surface-2 text-text-secondary border border-border'
            }`}
          >
            {u.role === 'titular' ? 'Titular' : 'Auxiliar'}
          </span>
        </div>
      ))}

      <div className="flex items-center justify-center gap-2 border border-dashed border-border-strong rounded-[4px] p-3.5 text-[13px] text-text-secondary cursor-pointer">
        <span>+</span> Adicionar auxiliar
      </div>
    </AuthShell>
  )
}
