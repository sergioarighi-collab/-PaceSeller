import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { StepBar } from '../../components/ui/StepBar'
import { TextInput, FieldGroup, FieldRow2, SelectRow, ChipSelect } from '../../components/ui/Field'
import { Chip } from '../../components/ui/Chip'
import { Button } from '../../components/ui/Button'

export function WizardStep1() {
  const navigate = useNavigate()
  const [segment, setSegment] = useState('Streetwear')
  const [size, setSize] = useState('Média')
  const [audience, setAudience] = useState<string[]>(['Jovem adulto', 'Teen'])

  const toggleAudience = (v: string) =>
    setAudience((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]))

  return (
    <AuthShell width={560}>
      <StepBar step={1} />
      <div className="eyebrow">Configuração de perfil</div>
      <h2 className="font-display text-xl font-bold text-text-primary mt-2">Conte sobre sua loja</h2>
      <div className="text-[12.5px] text-text-secondary mt-1.5 leading-relaxed max-w-[420px]">
        Isso ajuda o radar a trazer oportunidades mais precisas pra você
      </div>

      <FieldGroup label="Nome da loja">
        <TextInput value="Radical Skate" />
      </FieldGroup>

      <FieldRow2>
        <FieldGroup label="Segmento">
          <ChipSelect>
            {['Streetwear', 'Casual', 'Esportivo', 'Feminino', 'Infantil'].map((s) => (
              <Chip key={s} label={s} selected={segment === s} onClick={() => setSegment(s)} />
            ))}
          </ChipSelect>
        </FieldGroup>
        <FieldGroup label="Porte da loja">
          <ChipSelect>
            {['Pequena', 'Média', 'Grande'].map((s) => (
              <Chip key={s} label={s} selected={size === s} onClick={() => setSize(s)} />
            ))}
          </ChipSelect>
        </FieldGroup>
      </FieldRow2>

      <FieldGroup label="Região">
        <SelectRow value="Porto Alegre, RS · Rua de comércio" />
      </FieldGroup>

      <FieldGroup label="Público-alvo">
        <ChipSelect>
          {['Jovem adulto', 'Teen', 'Adulto', 'Família'].map((s) => (
            <Chip key={s} label={s} selected={audience.includes(s)} onClick={() => toggleAudience(s)} />
          ))}
        </ChipSelect>
      </FieldGroup>

      <div className="flex gap-2.5 mt-7">
        <Button variant="secondary" className="w-[170px]" onClick={() => navigate('/onboarding/vendas')}>
          Pular por agora
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => navigate('/onboarding/vendas')}>
          Continuar
        </Button>
      </div>
    </AuthShell>
  )
}
