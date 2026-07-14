import { useNavigate } from 'react-router-dom'
import { AuthShell, Logo } from '../../components/layout/AuthShell'
import { TextInput, FieldGroup } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../lib/store'

export function LoginRepresentante() {
  const navigate = useNavigate()
  const setPersona = useAppStore((s) => s.setPersona)

  return (
    <AuthShell width={440}>
      <div className="text-center mb-6">
        <div className="eyebrow">Representante</div>
        <h2 className="font-display text-2xl font-bold text-text-primary mt-1">Entrar</h2>
        <div className="text-sm text-text-secondary mt-2">Acesse a conta da sua carteira de clientes</div>
      </div>

      <FieldGroup label="E-mail">
        <TextInput value="ana@vendasnorte.com.br" placeholder />
      </FieldGroup>
      <FieldGroup label="Senha">
        <TextInput value="••••••••••" />
        <div className="text-right text-xs text-text-secondary mt-2">Esqueci minha senha</div>
      </FieldGroup>

      <Button
        variant="primary"
        className="w-full mt-5"
        onClick={() => {
          setPersona('representante')
          navigate('/login/quem-esta-usando')
        }}
      >
        Entrar
      </Button>

      <div className="text-center text-[12.5px] text-text-secondary mt-5">
        É lojista?{' '}
        <b className="text-text-primary cursor-pointer" onClick={() => navigate('/login/lojista')}>
          Entrar aqui
        </b>
      </div>

      <Logo />
    </AuthShell>
  )
}
