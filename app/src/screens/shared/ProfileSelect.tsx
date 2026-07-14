import { useNavigate } from 'react-router-dom'
import { AuthShell, Logo } from '../../components/layout/AuthShell'
import { useAppStore } from '../../lib/store'

export function ProfileSelect() {
  const navigate = useNavigate()
  const setPersona = useAppStore((s) => s.setPersona)

  return (
    <AuthShell width={440}>
      <div className="text-center mb-7">
        <h2 className="font-display text-2xl font-bold text-text-primary">Bem-vindo</h2>
        <div className="text-sm text-text-secondary mt-2">Como você acessa a plataforma?</div>
      </div>

      <div
        onClick={() => {
          setPersona('lojista')
          navigate('/login/lojista')
        }}
        className="flex items-center gap-3 bg-surface border border-border-strong rounded-[4px] p-4 cursor-pointer mb-3"
      >
        <div className="w-9 h-9 rounded-[4px] bg-surface-2 flex items-center justify-center text-text-primary shrink-0">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16l-1.4 10.3a2 2 0 0 1-2 1.7H7.4a2 2 0 0 1-2-1.7L4 7Z" />
            <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
          </svg>
        </div>
        <div>
          <div className="text-[13.5px] font-semibold text-text-primary">Sou lojista</div>
          <div className="text-[11.5px] text-text-secondary mt-0.5">Comprar, planejar e acompanhar pedidos</div>
        </div>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-auto text-text-tertiary shrink-0"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </div>

      <div
        onClick={() => {
          setPersona('representante')
          navigate('/login/representante')
        }}
        className="flex items-center gap-3 bg-surface border border-border-strong rounded-[4px] p-4 cursor-pointer"
      >
        <div className="w-9 h-9 rounded-[4px] bg-surface-2 flex items-center justify-center text-text-primary shrink-0">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="8" r="3" />
            <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
            <circle cx="17" cy="8" r="2.4" />
            <path d="M15.5 14c2.6.3 4.5 2 4.5 5" />
          </svg>
        </div>
        <div>
          <div className="text-[13.5px] font-semibold text-text-primary">Sou representante</div>
          <div className="text-[11.5px] text-text-secondary mt-0.5">
            Gerenciar carteira de clientes e pedidos
          </div>
        </div>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-auto text-text-tertiary shrink-0"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </div>

      <div className="text-center text-[12.5px] text-text-secondary mt-5">
        Ainda não tem conta? <b className="text-text-primary">Fale com a indústria</b>
      </div>

      <Logo />
    </AuthShell>
  )
}
