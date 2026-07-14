import { useNavigate } from 'react-router-dom'
import type { CartOrder } from '../../lib/types'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { orders } from '../../lib/data'
import { useAppStore } from '../../lib/store'

const statusLabel: Record<CartOrder['status'], string> = {
  rascunho: 'Rascunho',
  aguardando: 'Aguardando representante',
  aprovado: 'Aprovado',
}

export function CartContent({ order, showSidebar = true }: { order: CartOrder; showSidebar?: boolean }) {
  const navigate = useNavigate()
  const persona = useAppStore((s) => s.persona)
  const { activeOrderId, setActiveOrderId } = useAppStore()
  const isRep = persona === 'representante'

  return (
    <div className="flex flex-col md:flex-row">
      <div className="flex-1 px-4.5 md:px-8 pt-4 md:pt-8 pb-4 min-w-0">
        <h3 className="hidden md:block font-display text-lg font-semibold text-text-primary mb-4">
          Meus pedidos
        </h3>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {orders.map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setActiveOrderId(o.id)
                navigate(`/pedidos/${o.id}`)
              }}
              className={`text-xs px-3.5 py-2 rounded-[4px] border whitespace-nowrap shrink-0 ${
                activeOrderId === o.id
                  ? 'bg-surface border-black text-text-primary font-semibold'
                  : 'bg-surface-2 border-border text-text-secondary'
              }`}
            >
              {o.name} · {o.representative}
            </button>
          ))}
          <button className="text-xs px-3.5 py-2 rounded-[4px] border border-dashed border-border-strong text-text-tertiary whitespace-nowrap shrink-0">
            + Novo pedido
          </button>
        </div>

        <div className="flex items-center gap-2.5 bg-surface-2 border border-border rounded-[4px] px-3.5 py-2.5 mb-4 text-[12.5px] text-text-primary">
          <Avatar initials={order.representative.slice(0, 2).toUpperCase()} />
          Compartilhado com <b>{order.representative}</b> (representante) · ela pode ver e ajustar este pedido
        </div>

        {order.items.map((it) => (
          <div
            key={it.name}
            className="flex items-center justify-between bg-surface border border-border rounded-[4px] px-3.5 py-3 mb-2"
          >
            <div>
              <div className="text-[13px] text-text-primary font-medium">{it.name}</div>
              <div className="font-mono text-[11px] text-text-tertiary mt-0.5">
                qtd {it.qty} · grade {it.grade}
              </div>
            </div>
            <div className="font-mono text-[13px] text-text-primary">
              R$ {it.value.toLocaleString('pt-BR')}
            </div>
          </div>
        ))}

        <div className="flex gap-2.5 bg-surface border border-border rounded-[4px] p-3 my-3.5 text-[12.5px] text-text-primary leading-relaxed">
          <Avatar initials={order.representative.slice(0, 2).toUpperCase()} dark={false} />
          <div>
            <b>{order.representative}:</b> ajustei a grade da sandália pra cobrir os números que mais giram
            aí, confere?
            <div className="text-[10.5px] text-text-tertiary mt-1">há 40 min</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[4px] p-3.5 mb-3.5">
          <div className="eyebrow mb-2.5">Antes de fechar</div>
          <div className="flex items-center justify-between py-1.5 text-[12.5px] text-text-primary">
            <div className="flex items-center gap-2">
              <span className="text-positive">✓</span> Mix balanceado entre categorias
            </div>
          </div>
          <div className="flex items-center justify-between py-1.5 text-[12.5px] text-text-primary">
            <div className="flex items-center gap-2">
              <span className="text-risk">!</span> Categoria feminina sub-representada
            </div>
            <span className="text-[11.5px] font-semibold text-on-black bg-black px-2.5 py-1 rounded-[4px]">
              + Adicionar 4 itens
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[4px] p-4">
          <div className="flex justify-between py-1.5 text-[13px] text-text-secondary">
            <span>Subtotal</span>
            <span>R$ {order.subtotal.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[13px] text-positive">
            <span>Desconto por escala</span>
            <span>− R$ {order.discount.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between pt-3 mt-1.5 border-t border-border font-mono text-base font-semibold text-text-primary">
            <span>Total</span>
            <span>R$ {order.total.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div className="flex gap-2.5 mt-6 pb-4">
          {isRep && (
            <Button variant="secondary" className="flex-1">
              Comentar
            </Button>
          )}
          <Button
            variant={isRep ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={() => navigate(`/pedidos/${order.id}/pagamento`)}
          >
            {isRep ? 'Aprovar pedido' : 'Salvar como rascunho'}
          </Button>
          {!isRep && (
            <Button variant="primary" className="flex-1" onClick={() => navigate(`/pedidos/${order.id}/pagamento`)}>
              Ir para pagamento
            </Button>
          )}
        </div>
      </div>

      {showSidebar && (
        <div className="md:w-[296px] shrink-0 bg-surface-2 md:border-l border-border p-4.5 md:p-5.5 mx-4.5 md:mx-0 mb-4 md:mb-0 rounded-[4px] md:rounded-none">
          <div className="eyebrow">Pedido: {order.name.toLowerCase()}</div>
          <div className="font-display text-2xl font-bold text-text-primary mt-2">{order.items.length} itens</div>
          <div className="font-mono text-xs text-text-secondary mt-0.5">
            R$ {order.total.toLocaleString('pt-BR')} · margem {order.marginPct}%
          </div>
          <div className="text-[10.5px] font-mono uppercase text-text-tertiary mt-3">
            {statusLabel[order.status]}
          </div>
          <div className="bg-surface border border-border rounded-[4px] rounded-tl-[1px] p-3 mt-3.5 text-[12.5px] text-text-primary leading-relaxed">
            Pedido pronto para revisão do representante
          </div>
          <div className="bg-surface border border-border rounded-[4px] rounded-tl-[1px] p-3 mt-2.5 text-[12.5px] text-text-primary leading-relaxed">
            Prazo de entrega estimado: <b>7 dias úteis</b>
          </div>
        </div>
      )}
    </div>
  )
}
