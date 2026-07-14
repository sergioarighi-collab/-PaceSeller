import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { StepBar } from '../../components/ui/StepBar'
import { OptionCard } from '../../components/ui/OptionCard'
import { TextInput, FieldGroup, FieldRow2, ChipSelect } from '../../components/ui/Field'
import { Chip } from '../../components/ui/Chip'
import { Button } from '../../components/ui/Button'
import { OrdersIcon } from '../../components/layout/icons'

export function WizardStep2() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<string[]>(['Calçados', 'Acessórios'])
  const [season, setSeason] = useState('Inverno')

  const toggleCat = (v: string) =>
    setCategories((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]))

  return (
    <AuthShell width={560}>
      <StepBar step={2} />
      <div className="eyebrow">Configuração de perfil</div>
      <h2 className="font-display text-xl font-bold text-text-primary mt-2">Fale sobre suas vendas</h2>
      <div className="text-[12.5px] text-text-secondary mt-1.5 leading-relaxed max-w-[420px]">
        Quanto mais dados, mais preciso fica o seu radar
      </div>

      <div className="mt-5">
        <OptionCard
          icon={<OrdersIcon />}
          title="Conectar meu sistema de vendas"
          sub="Importa e atualiza os dados automaticamente"
          highlighted
        />
      </div>

      <div className="flex items-center gap-2.5 my-5 text-[10.5px] text-text-tertiary font-mono uppercase">
        <div className="flex-1 h-px bg-border" />
        ou preencha manualmente
        <div className="flex-1 h-px bg-border" />
      </div>

      <FieldRow2>
        <FieldGroup label="Ticket médio">
          <TextInput value="R$ 180,00" />
        </FieldGroup>
        <FieldGroup label="Categorias mais vendidas">
          <ChipSelect>
            {['Calçados', 'Acessórios', 'Vestuário', 'Meias'].map((s) => (
              <Chip key={s} label={s} selected={categories.includes(s)} onClick={() => toggleCat(s)} />
            ))}
          </ChipSelect>
        </FieldGroup>
      </FieldRow2>

      <FieldGroup label="Sazonalidade forte">
        <ChipSelect>
          {['Inverno', 'Verão', 'Volta às aulas', 'Black Friday'].map((s) => (
            <Chip key={s} label={s} selected={season === s} onClick={() => setSeason(s)} />
          ))}
        </ChipSelect>
      </FieldGroup>

      <div className="flex gap-2.5 mt-7">
        <Button variant="secondary" className="w-[130px]" onClick={() => navigate('/onboarding/loja')}>
          Voltar
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => navigate('/onboarding/objetivo')}>
          Continuar
        </Button>
      </div>
    </AuthShell>
  )
}
