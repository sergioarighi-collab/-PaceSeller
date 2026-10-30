import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { PersonaTopNav } from '../../components/desktop/PersonaTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { ProductThumb } from '../../components/desktop/ProductThumb'
import { CartIcon } from '../../components/desktop/CartIcon'
import { useAppStore, pedidoPares } from '../../lib/store'
import { products } from '../../lib/data'
import { formatBRL } from '../../lib/format'

// Módulo "Enviados" (out/2026, pedido do usuário: "um módulo de enviados... página que dá acesso
// pra ele verificar todos os carrinhos enviados e finalizados pelo cliente, podendo reenviar o
// carrinho para refazer o pedido"). Tela própria, não mais uma aba dentro de Meus Carrinhos — só
// os carrinhos `pago` (finalizados de verdade, não "compartilhados" em geral, que ainda têm coisa
// em aberto). Mesmo `.cr-list`/`.cr-row` de Meus Carrinhos (consistência visual), só trocando a
// ação do slot: aqui não tem "Enviar"/"Acompanhar"/"Aprovar", só "Reenviar" — reaproveita o botão
// pra todo mundo, sem distinção de persona (reenviar não depende de quem é a vez, é só duplicar
// o pedido pra começar de novo).
export function Enviados() {
  const navigate = useNavigate()
  const carrinhos = useAppStore((s) => s.carrinhos)
  const persona = useAppStore((s) => s.persona)
  const lojistas = useAppStore((s) => s.lojistas)
  const activeLojistaId = useAppStore((s) => s.activeLojistaId)
  const lojistaAtiva = lojistas.find((l) => l.id === activeLojistaId)
  const reenviarCarrinho = useAppStore((s) => s.reenviarCarrinho)

  const enviados = carrinhos.filter((c) => c.pedido.status === 'pago')

  function handleReenviar(carrinhoId: string) {
    const novoId = reenviarCarrinho(carrinhoId)
    if (novoId) navigate(`/carrinhos/${novoId}`)
  }

  return (
    <DesktopPage>
      <PersonaTopNav />
      <Breadcrumb
        items={
          persona === 'representante'
            ? [{ label: 'Radar', to: '/rep/radar' }, { label: lojistaAtiva?.name ?? '', to: '/carrinhos' }, { label: 'Enviados' }]
            : [{ label: 'Radar', to: '/radar' }, { label: 'Meus Carrinhos', to: '/carrinhos' }, { label: 'Enviados' }]
        }
      />
      <div className="web-main" style={{ paddingTop: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Enviados</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            {persona === 'representante' ? (
              <>{enviados.length} carrinhos finalizados nessa loja</>
            ) : (
              <>{enviados.length} carrinhos finalizados · com Ana, sua representante</>
            )}
          </div>
        </div>

        {enviados.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--text-secondary)',
              padding: '32px 0',
              background: 'var(--surface-2)',
              borderRadius: 12,
              marginTop: 20,
              maxWidth: 900,
            }}
          >
            Nenhum carrinho finalizado ainda.
          </div>
        ) : (
          <div className="cr-list" style={{ maxWidth: 900, marginTop: 20 }}>
            {enviados.map((cart) => {
              const pedido = cart.pedido
              const thumbIds = Array.from(new Set(pedido.items.map((i) => i.productId).filter((id) => products.some((pr) => pr.id === id))))
              const pares = pedidoPares(pedido)

              return (
                <div className="cr-row" key={cart.id} onClick={() => navigate(`/carrinhos/${cart.id}/${pedido.id}/acompanhamento`)}>
                  <div className="cr-main">
                    <div className="cr-icon tone-positive">
                      <CartIcon />
                    </div>
                    <div className="cr-info">
                      <div className="cr-nameline">
                        <span className="cr-name">{cart.name}</span>
                        <span className="cr-badge tone-positive">Com a Tesla</span>
                      </div>
                      <div className="cr-meta">
                        {pares} pares · Representante: {cart.representative} · Atualizado {cart.updatedAt}
                      </div>
                    </div>
                    <div className="cr-value">{formatBRL(pedido.total)}</div>
                    <div className="cr-actionslot">
                      <span
                        className="cr-action primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReenviar(cart.id)
                        }}
                      >
                        Reenviar
                      </span>
                    </div>
                    <svg className="cr-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.4">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </div>

                  {thumbIds.length > 0 && (
                    <div className="cr-thumbs">
                      {thumbIds.slice(0, 5).map((id) => {
                        const product = products.find((p) => p.id === id)
                        if (!product) return null
                        return (
                          <div className="thumb" key={id}>
                            <ProductThumb src={product.image} alt={product.name} iconSize={16} padding={2} />
                          </div>
                        )
                      })}
                      {thumbIds.length > 5 && (
                        <div className="thumb" style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>
                          +{thumbIds.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DesktopPage>
  )
}
