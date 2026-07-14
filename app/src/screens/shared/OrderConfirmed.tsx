import { useNavigate, useParams } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { Button } from '../../components/ui/Button'
import { orders } from '../../lib/data'

export function OrderConfirmed() {
  const navigate = useNavigate()
  const { id } = useParams()
  const order = orders.find((o) => o.id === id) ?? orders[0]

  return (
    <AuthShell width={400} center>
      <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-2xl mx-auto">
        ✓
      </div>
      <h2 className="font-display text-xl font-bold text-text-primary mt-4">Pedido confirmado</h2>
      <p className="text-[13px] text-text-secondary mt-2.5 leading-relaxed">
        Seu pedido foi enviado para produção. {order.representative} também foi avisada e vai acompanhar com
        você.
      </p>

      <div className="bg-surface border border-border rounded-[4px] p-4 mt-5 text-left">
        <div className="flex justify-between py-1.5 text-[13px] text-text-secondary">
          <span>Número do pedido</span>
          <span className="text-text-primary font-medium">#{order.id === 'o1' ? '4821' : order.id}</span>
        </div>
        <div className="flex justify-between py-1.5 text-[13px] text-text-secondary">
          <span>Valor total</span>
          <span className="text-text-primary font-medium">R$ {order.total.toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex justify-between py-1.5 text-[13px] text-text-secondary">
          <span>Prazo estimado</span>
          <span className="text-text-primary font-medium">7 dias úteis</span>
        </div>
      </div>

      <div className="flex gap-2.5 mt-6">
        <Button variant="secondary" className="flex-1" onClick={() => navigate('/radar')}>
          Voltar ao radar
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => navigate(`/pedidos/${order.id}/acompanhamento`)}>
          Acompanhar pedido
        </Button>
      </div>
    </AuthShell>
  )
}
