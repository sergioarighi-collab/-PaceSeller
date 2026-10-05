import { useState } from 'react'
import { RepTopNav } from '../../components/desktop/RepTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { Toast } from '../../components/desktop/Toast'
import { useAppStore, pedidoPares, pedidoAguardandoAprovacaoRep, repStatusLabel } from '../../lib/store'
import { GRADE_MINIMA_PARES } from '../../lib/types'
import { formatBRL } from '../../lib/format'

// Carteira de lojistas (set/2026) — primeira tela do fluxo desktop do representante, equivalente a
// "Meus Carrinhos" do lojista, só que um nível acima: cada card é uma LOJA (ver `Lojista` em
// types.ts), não um carrinho — dentro dela, a lista de carrinhos reaproveita a mesma linha
// `.pedrow` já usada em MeusCarrinhos.tsx. Ações reais (aprovar, comentar, editar em nome do
// lojista) ainda não existem — cada linha abre um toast "em breve" por enquanto; ver
// guia-dev-frontend.md pra o que falta.
export function RepCarteira() {
  const lojistas = useAppStore((s) => s.lojistas)
  const [comingSoon, setComingSoon] = useState(false)

  const todosCarrinhos = lojistas.flatMap((l) => l.carrinhos)
  const aguardandoVoce = todosCarrinhos.filter((c) => pedidoAguardandoAprovacaoRep(c.pedido)).length
  const emAndamento = todosCarrinhos.filter((c) => c.pedido.status !== 'pago').reduce((sum, c) => sum + c.pedido.total, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <RepTopNav />
      <div className="web-main" style={{ paddingTop: 20 }}>
        <Breadcrumb items={[{ label: 'Carteira' }]} />
        <div style={{ marginTop: 12 }}>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Carteira</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            {lojistas.length} lojas · {todosCarrinhos.length} pedidos no total
          </div>
        </div>

        <div className="stattiles">
          <div className="tile">
            <div className="tlabel">Lojas na carteira</div>
            <div className="tval">{lojistas.length}</div>
          </div>
          <div className="tile">
            <div className="tlabel">Pedidos no total</div>
            <div className="tval">{todosCarrinhos.length}</div>
          </div>
          <div className="tile">
            <div className="tlabel">Aguardando você</div>
            <div className="tval" style={{ color: aguardandoVoce > 0 ? 'var(--info)' : undefined }}>
              {aguardandoVoce}
            </div>
          </div>
          <div className="tile">
            <div className="tlabel">Em andamento</div>
            <div className="tval">{formatBRL(emAndamento)}</div>
          </div>
        </div>

        <div className="cartlist" style={{ maxWidth: 900, marginTop: 20 }}>
          {lojistas.map((lojista) => (
            <div className="cart-card" key={lojista.id}>
              <div className="cc-top">
                <div>
                  <div className="cc-name">{lojista.name}</div>
                  <div className="cc-meta">
                    {lojista.city} · {lojista.contactName}
                  </div>
                </div>
              </div>

              {lojista.carrinhos.map((cart) => {
                const pedido = cart.pedido
                const pares = pedidoPares(pedido)
                const gradeOk = pares >= GRADE_MINIMA_PARES
                const gradePct = Math.min(100, Math.round((pares / GRADE_MINIMA_PARES) * 100))
                const status = repStatusLabel(pedido)
                return (
                  <div className="pedrow" key={cart.id}>
                    <span className="plabel">{cart.name}</span>
                    <span className={`pstatus tone-${status.tone}`}>{status.label}</span>
                    <div className="pgrade">
                      <div className={`bar ${gradeOk ? 'ok' : ''}`}>
                        <div style={{ width: `${gradePct}%` }} />
                      </div>
                      <span className="pgradetxt">
                        {pares}/{GRADE_MINIMA_PARES} pares
                      </span>
                    </div>
                    <span className="pval">{formatBRL(pedido.total)}</span>
                    <span className="pact" onClick={() => setComingSoon(true)}>
                      Abrir
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {comingSoon && (
        <Toast
          title="Detalhe do pedido — em breve"
          sub="Aprovar, comentar e editar em nome do lojista ainda não existem neste protótipo"
          onClose={() => setComingSoon(false)}
        />
      )}
    </div>
  )
}
