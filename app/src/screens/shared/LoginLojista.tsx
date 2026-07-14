import { useNavigate } from 'react-router-dom'
import { AuthShell, Logo } from '../../components/layout/AuthShell'
import { TextInput, FieldGroup } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../lib/store'

export function LoginLojista() {
  const navigate = useNavigate()
  const setPersona = useAppStore((s) => s.setPersona)

  return (
    <AuthShell width={440}>
      <div className="text-center mb-6">
        <div className="eyebrow">Lojista</div>
        <h2 className="font-display text-2xl font-bold text-text-primary mt-1">Entrar</h2>
        <div className="text-sm text-text-secondary mt-2">
          Acesse sua conta pra ver as oportunidades de hoje
        </div>
      </div>

      <FieldGroup label="E-mail">
        <TextInput value="carlos@radicalskate.com.br" placeholder />
      </FieldGroup>
      <FieldGroup label="Senha">
        <TextInput value="••••••••••" />
        <div className="text-right text-xs text-text-secondary mt-2">Esqueci minha senha</div>
      </FieldGroup>

      <Button
        variant="primary"
        className="w-full mt-5"
        onClick={() => {
          setPersona('lojista')
          navigate('/onboarding/loja')
        }}
      >
        Entrar
      </Button>

      <div className="flex items-center gap-2.5 my-4 text-[10.5px] text-text-tertiary font-mono uppercase">
        <div className="flex-1 h-px bg-border" />
        ou
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button variant="secondary" className="w-full">
        Entrar com Google
      </Button>

      <div className="text-center text-[12.5px] text-text-secondary mt-5">
        É representante?{' '}
        <b className="text-text-primary cursor-pointer" onClick={() => navigate('/login/representante')}>
          Entrar aqui
        </b>
      </div>

      <Logo />
    </AuthShell>
  )
}
