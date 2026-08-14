import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { WebModal } from '../../components/desktop/WebModal'
import { mixPlan, products } from '../../lib/data'
import { formatBRL } from '../../lib/format'

const segClass = ['mixseg-a', 'mixseg-b', 'mixseg-c']
const swClass = ['a', 'b', 'c']

export function Planning() {
  const navigate = useNavigate()
  const [qty, setQty] = useState<Record<string, number>>(
    Object.fromEntries(mixPlan.items.map((i) => [i.productId, i.qty]))
  )
  const [mixModalOpen, setMixModalOpen] = useState(false)
  const [mixPct, setMixPct] = useState(mixPlan.mix.map((m) => m.pct))

  function updateQty(id: string, delta: number) {
    setQty((s) => ({ ...s, [id]: Math.max(0, (s[id] ?? 0) + delta) }))
  }

  const totalPct = mixPct.reduce((a, b) => a + b, 0)
  const spent = Object.entries(qty).reduce((sum, [id, q]) => {
    const product = products.find((p) => p.id === id)
    return sum + (product ? q * product.priceFactory : 0)
  }, 0)

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: `Planejamento — ${mixPlan.planName}` }]} />
      <div className="web-app-layout">
        <div className="web-content">
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Plano de compra
            </div>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>{mixPlan.planName}</h1>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, marginTop: 6 }}>
              Investimento: {formatBRL(mixPlan.investment)}
            </div>
          </div>

          <div className="mixbar" style={{ margin: '20px 0 8px', maxWidth: 640 }}>
            {mixPlan.mix.map((m, i) => (
              <div className={segClass[i]} key={m.label} style={{ width: `${m.pct}%` }} />
            ))}
          </div>
          <div className="legend">
            {mixPlan.mix.map((m, i) => (
              <div className="item" key={m.label}>
                <span className={`sw ${swClass[i]}`} />
                {m.label} {m.pct}%
              </div>
            ))}
          </div>

          <div className="stattiles" style={{ maxWidth: 640, marginTop: 22 }}>
            <div className="tile">
              <div className="tlabel">Giro previsto</div>
              <div className="tval">{mixPlan.turnoverDays} dias</div>
            </div>
            <div className="tile">
              <div className="tlabel">Margem est.</div>
              <div className="tval">{mixPlan.marginPct}%</div>
            </div>
            <div className="tile">
              <div className="tlabel">Cobertura</div>
              <div className="tval">{mixPlan.coveragePct}%</div>
            </div>
          </div>

          <div className="web-section-title">Itens do mix</div>
          <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mixPlan.items.map((item) => (
              <div className="mixitem" style={{ marginTop: 0 }} key={item.productId}>
                <div className="mname">{item.name}</div>
                <div className="stepper">
                  <div className="stepbtn" style={{ cursor: 'pointer' }} onClick={() => updateQty(item.productId, -1)}>
                    −
                  </div>
                  <div className="qty">{qty[item.productId]}</div>
                  <div className="stepbtn" style={{ cursor: 'pointer' }} onClick={() => updateQty(item.productId, 1)}>
                    +
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28, maxWidth: 640 }}>
            <div className="btn-secondary" style={{ width: 160, cursor: 'pointer' }} onClick={() => setMixModalOpen(true)}>
              Ajustar mix
            </div>
            <div className="btn-primary" style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate('/carrinhos')}>
              Enviar ao carrinho
            </div>
          </div>
        </div>

        <div className="web-sidebar">
          <div className="stitle">Resumo do plano</div>
          <div className="stotal">{formatBRL(spent)}</div>
          <div className="ssub">de {formatBRL(mixPlan.investment)} disponíveis</div>
          <div className="nudge-progress">
            <div className="np-label">
              <span>Mix ideal pro seu perfil</span>
              <span style={{ fontFamily: 'var(--mono)' }}>88%</span>
            </div>
            <div className="nudge-bar">
              <div className="nudge-bar-fill" style={{ width: '88%' }} />
            </div>
          </div>
          <div className="bubble">
            Seu mix está <b>{mixPlan.mix.map((m) => m.pct).join('/')}</b> — alinhado com o padrão de inverno da sua loja
          </div>
          <div className="bubble">
            {spent > mixPlan.investment ? (
              <>
                Orçamento estourado em <b style={{ color: 'var(--risk)' }}>{formatBRL(spent - mixPlan.investment)}</b>
              </>
            ) : (
              <>
                Ainda restam <b>{formatBRL(mixPlan.investment - spent)}</b> pra usar no orçamento
              </>
            )}
          </div>
          <div className="sbtns">
            <div className="btn-secondary" style={{ cursor: 'pointer' }}>
              Salvar como rascunho
            </div>
          </div>
        </div>
      </div>

      {mixModalOpen && (
        <WebModal
          title="Ajustar mix"
          subtitle="O investimento total não muda — só a proporção entre linhas"
          onClose={() => setMixModalOpen(false)}
          width={440}
          footer={
            <>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: totalPct === 100 ? 'var(--positive)' : 'var(--risk)' }}>
                Total: {totalPct}%
              </span>
              <div className="btn-primary" style={{ width: 120, cursor: 'pointer' }} onClick={() => setMixModalOpen(false)}>
                Aplicar
              </div>
            </>
          }
        >
          <div style={{ padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mixPlan.mix.map((m, i) => (
              <div className="mixitem" style={{ marginTop: 0 }} key={m.label}>
                <div className="mname">{m.label}</div>
                <div className="stepper">
                  <div
                    className="stepbtn"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setMixPct((s) => s.map((v, idx) => (idx === i ? Math.max(0, v - 5) : v)))}
                  >
                    −
                  </div>
                  <div className="qty">{mixPct[i]}%</div>
                  <div
                    className="stepbtn"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setMixPct((s) => s.map((v, idx) => (idx === i ? v + 5 : v)))}
                  >
                    +
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WebModal>
      )}
    </DesktopPage>
  )
}
