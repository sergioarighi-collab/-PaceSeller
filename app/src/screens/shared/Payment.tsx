import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { OptionCard } from '../../components/ui/OptionCard'
import { FieldGroup, FieldRow2, SelectRow, ChipSelect } from '../../components/ui/Field'
import { Chip } from '../../components/ui/Chip'
import { Button } from '../../components/ui/Button'
import { OrdersIcon } from '../../components/layout/icons'
import { orders } from '../../lib/data'

export function Payment() {
  const navigate = useNavigate()
  const { id } = useParams()
  const order = orders.find((o) => o.id === id) ?? orders[0]
  const [condition, setCondition] = useState('30/60/90 dias')

  return (
    <AuthShell width={480}>
      <div className="eyebrow">Pedido: {order.name.toLowerCase()}</div>
      <h2 className="font-display text-xl font-bold text-text-primary mt-2">Pagamento e entrega</h2>
      <div className="text-[12.5px] text-text-secondary mt-1.5">Confira as condições antes de confirmar</div>

      <div className="mt-5">
        <OptionCard
          icon={<OrdersIcon />}
          title={`R$ ${order.total.toLocaleString('pt-BR')}`}
          sub="Valor total do pedido"
          highlighted
          chevron={false}
        />
      </div>

      <FieldGroup label="Condição de pagamento">
        <ChipSelect>
          {['30/60/90 dias', 'Boleto à vista −3%', 'Cartão'].map((c) => (
            <Chip key={c} label={c} selected={condition === c} onClick={() => setCondition(c)} />
          ))}
        </ChipSelect>
      </FieldGroup>

      <FieldRow2>
        <FieldGroup label="Endereço de entrega">
          <SelectRow value="Rua das Palmeiras, 210 · Porto Alegre, RS" />
        </FieldGroup>
        <FieldGroup label="Prazo estimado">
          <SelectRow value="Entrega em até 7 dias úteis" />
        </FieldGroup>
      </FieldRow2>

      <div className="mt-4">
        <OptionCard
          icon={<OrdersIcon />}
          title="Nota fiscal e contrato"
          sub="Gerados automaticamente na confirmação"
        />
      </div>

      <div className="flex gap-2.5 mt-7">
        <Button variant="secondary" className="w-[170px]" onClick={() => navigate(`/pedidos/${order.id}`)}>
          Voltar ao carrinho
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => navigate(`/pedidos/${order.id}/confirmado`)}>
          Confirmar pedido
        </Button>
      </div>
    </AuthShell>
  )
}
