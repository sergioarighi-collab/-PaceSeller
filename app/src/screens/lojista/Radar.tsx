import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { WebModal } from '../../components/desktop/WebModal'
import { Toast } from '../../components/desktop/Toast'
import { useAppStore } from '../../lib/store'
import { lojistaRadarInsights, dailyPanel, goals } from '../../lib/data'
import type { Severity } from '../../lib/types'
import bannerImg from '../../assets/images/banner-destaque-semana.jpg'

const severityColor: Record<Severity, string> = {
  positive: 'var(--positive)',
  risk: 'var(--risk)',
  info: 'var(--info)',
  neutral: 'var(--border-strong)',
  premium: 'var(--gold, var(--positive))',
}

const listModalContent: Record<string, { title: string; sub: string; batchLabel?: string; rows: { name: string; meta: string; qty?: string; done?: boolean }[] }> = {
  'dp-1': {
    title: 'Reposição necessária',
    sub: '3 produtos estão vendendo mais rápido que sua reposição atual',
    batchLabel: 'Repor todos',
    rows: [
      { name: 'Linha Coil', meta: 'Cobertura atual: 12 dias', qty: 'Sugestão: 32 unidades' },
      { name: 'Tênis Tesla Coil Black White', meta: 'Cobertura atual: 8 dias', qty: 'Sugestão: 18 unidades', done: true },
      { name: 'Tênis Tesla TG II Black Reflect', meta: 'Cobertura atual: 15 dias', qty: 'Sugestão: 60 unidades' },
    ],
  },
  'dp-2': {
    title: 'Lançamentos',
    sub: '2 produtos novos ainda não chegaram no seu mix',
    rows: [
      { name: 'Linha Fusion', meta: 'Lançada há 12 dias' },
      { name: 'Tênis Tesla TG II Black Reflect', meta: 'Lançada há 28 dias' },
    ],
  },
  'dp-3': {
    title: 'Produtos em alta',
    sub: '6 produtos vendendo acima da média na sua região',
    batchLabel: 'Adicionar todos ao planejamento',
    rows: [
      { name: 'Tênis Tesla Fusion Black Red', meta: '+34% crescimento' },
      { name: 'Tênis Tesla Coil Black White', meta: '+16% crescimento' },
      { name: 'Tênis Tesla Hertz All Black Furta Cor', meta: '+21% crescimento' },
      { name: 'Tênis Tesla TG II Black Reflect', meta: '+10% crescimento' },
      { name: 'Tênis Tesla Fusion BW Pink', meta: '+25% crescimento' },
      { name: 'Tênis Tesla Coil Denim', meta: '+31% crescimento' },
    ],
  },
  'dp-4': {
    title: 'Alertas',
    sub: '1 pedido precisa da sua atenção',
    rows: [{ name: 'Pedido #4790-1 atrasou', meta: 'Previsão de entrega vencida há 2 dias' }],
  },
}

export function Radar() {
  const navigate = useNavigate()
  const addToCart = useAppStore((s) => s.addToCart)
  const goalId = useAppStore((s) => s.goalId)
  const setGoal = useAppStore((s) => s.setGoal)
  const onboardingSkipped = useAppStore((s) => s.onboardingSkipped)
  const dismissOnboardingNotice = useAppStore((s) => s.dismissOnboardingNotice)

  const [focusOpen, setFocusOpen] = useState(false)
  const [listModal, setListModal] = useState<string | null>(null)
  const [toast, setToast] = useState<{ title: string; sub: string } | null>(null)
  const [repostos, setRepostos] = useState<Set<string>>(new Set())

  function handleRepor(productLabel: string, qty: number) {
    setRepostos((s) => new Set(s).add(productLabel))
    setToast({ title: 'Reposição adicionada ao carrinho', sub: `${productLabel} · ${qty} unidades` })
  }

  return (
    <DesktopPage>
      <WebTopNav />

      {onboardingSkipped && (
        <div className="context-banner">
          <div className="cb-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
          </div>
          <div>
            <div className="cb-title">Complete seu perfil pra sugestões mais precisas</div>
            <div className="cb-sub">Você pulou o cadastro inicial — algumas recomendações do radar ainda são genéricas.</div>
          </div>
          <div className="cb-clear" style={{ cursor: 'pointer' }} onClick={() => navigate('/onboarding/loja')}>
            Completar perfil →
          </div>
          <div
            style={{ cursor: 'pointer', color: 'var(--text-tertiary)', marginLeft: 14, flexShrink: 0 }}
            onClick={() => dismissOnboardingNotice()}
          >
            ✕
          </div>
        </div>
      )}

      <div className="web-hero-band">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="whgreet">Bom dia, Carlos</div>
            <h1>Sua loja está saudável</h1>
            <div className="whsub">5 oportunidades identificadas hoje</div>
          </div>
          <div className="focuslink-desktop" style={{ cursor: 'pointer' }} onClick={() => setFocusOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Ajustar foco
          </div>
        </div>
      </div>

      <div className="web-main">
        <div className="web-section-title">Oportunidades de hoje</div>
        <div className="grid4">
          {lojistaRadarInsights.map((card) => (
            <div
              className={`web-icard ${card.opportunity ? 'opportunity' : ''}`}
              key={card.id}
              style={!card.opportunity ? { borderLeftColor: severityColor[card.severity] } : undefined}
            >
              {card.opportunity && <div className="tag-black">Oportunidade</div>}
              <div className="eyebrow" style={!card.opportunity ? { color: severityColor[card.severity] } : undefined}>
                {card.eyebrow}
              </div>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600, marginTop: 6 }}>{card.title}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 6 }}>{card.text}</p>
              {card.suggestedQty && !repostos.has(card.title) && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, marginTop: 8 }}>
                  Sugestão: repor {card.suggestedQty} unidades
                </div>
              )}
              {card.cta === 'Repor agora' ? (
                repostos.has(card.title) ? (
                  <div className="cta" style={{ marginTop: 10, color: 'var(--positive)', fontWeight: 700 }}>
                    ✓ Reposto
                  </div>
                ) : (
                  <div
                    className="cta"
                    style={{ marginTop: 10, cursor: 'pointer' }}
                    onClick={() => {
                      addToCart(card.productId ?? card.id, card.suggestedQty)
                      handleRepor(card.title, card.suggestedQty ?? 0)
                    }}
                  >
                    Repor agora →
                  </div>
                )
              ) : (
                <div
                  className="cta"
                  style={{ marginTop: card.opportunity ? 12 : 10, fontWeight: card.opportunity ? 700 : 400, cursor: 'pointer' }}
                  onClick={() => {
                    if (card.cta === 'Ver produto' && card.productId) navigate(`/catalogo/${card.productId}`)
                    else if (card.cta === 'Comparar') navigate('/catalogo?contexto=benchmark')
                    else if (card.cta === 'Ver coleção') navigate('/colecoes/fusion')
                    else navigate('/catalogo')
                  }}
                >
                  {card.cta} →
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="web-section-title">Todas as pendências — por categoria</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '-10px 0 12px' }}>
          As oportunidades acima já são a seleção mais urgente de cada uma destas — aqui está a lista completa, se quiser ver
          além do destaque
        </div>
        <div className="listgroup" style={{ maxWidth: 520 }}>
          {dailyPanel.map((row) => (
            <div className={`listrow ${row.tone}`} key={row.id} style={{ cursor: 'pointer' }} onClick={() => setListModal(row.id)}>
              <div className="left">
                <span className="swatch" />
                <span className="label">{row.label}</span>
              </div>
              <div className="left">
                <span className="count">{row.count}</span>
                <span className="chev">›</span>
              </div>
            </div>
          ))}
        </div>

        <div className="web-section-title">Destaque da semana</div>
        <div
          style={{
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            padding: '44px 36px',
            minHeight: 280,
            backgroundImage: `linear-gradient(90deg, rgba(22,22,24,0.85), rgba(22,22,24,0.35)), url(${bannerImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div style={{ maxWidth: 460, color: '#fff', position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', color: 'rgba(255,255,255,0.6)' }}>
              Recomendado pro seu perfil de loja
            </div>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700, marginTop: 8 }}>
              Tênis Tesla Hertz Black — reposição em 45 dias
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>
              72% dos seus clientes recompram esse modelo em até 60 dias. Margem estimada de 42% no seu perfil de loja.
            </p>
            <div
              className="btn-primary"
              style={{ width: 220, marginTop: 20, background: '#fff', color: 'var(--text-primary)', cursor: 'pointer' }}
              onClick={() => navigate('/planejamento')}
            >
              Adicionar ao planejamento
            </div>
          </div>
        </div>
      </div>

      {focusOpen && (
        <WebModal title="Ajustar seu foco" subtitle="Isso reordena o que aparece primeiro no seu radar hoje" onClose={() => setFocusOpen(false)} width={440}
          footer={
            <>
              <span />
              <div className="btn-primary" style={{ width: 120, cursor: 'pointer' }} onClick={() => setFocusOpen(false)}>
                Aplicar
              </div>
            </>
          }
        >
          <div style={{ padding: '8px 20px 4px' }}>
            {goals.map((g) => {
              const selected = goalId === g.id
              return (
                <div className={`goalcard ${selected ? 'selected' : ''}`} key={g.id} style={{ cursor: 'pointer' }} onClick={() => setGoal(g.id)}>
                  <div className="gicon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </div>
                  <div>
                    <div className="gtitle">{g.title}</div>
                    <div className="gsub">{g.sub}</div>
                  </div>
                  <div className="gcheck">{selected ? '✓' : ''}</div>
                </div>
              )
            })}
          </div>
        </WebModal>
      )}

      {listModal && listModalContent[listModal] && (
        <WebModal
          title={listModalContent[listModal].title}
          subtitle={listModalContent[listModal].sub}
          onClose={() => setListModal(null)}
          footer={
            <>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  const target = listModal === 'dp-1' ? '/catalogo?contexto=reposicao' : '/catalogo'
                  setListModal(null)
                  navigate(target)
                }}
              >
                Ver tudo no catálogo →
              </a>
              {listModalContent[listModal].batchLabel && (
                <div className="btn-primary" style={{ width: 200, cursor: 'pointer' }} onClick={() => setListModal(null)}>
                  {listModalContent[listModal].batchLabel}
                </div>
              )}
            </>
          }
        >
          <div className="wm-list">
            {listModalContent[listModal].rows.map((row, i) => (
              <div className="wm-row" key={i}>
                <div className="wm-thumb" />
                <div className="wm-info">
                  <div className="wm-name">{row.name}</div>
                  <div className="wm-meta">{row.meta}</div>
                  {row.qty && <div className="wm-qty">{row.qty}</div>}
                </div>
                {listModal === 'dp-1' ? (
                  <div className={`wm-action ${row.done ? 'done' : ''}`} style={{ cursor: 'pointer' }}>
                    {row.done ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        Reposto
                      </>
                    ) : (
                      'Repor'
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </WebModal>
      )}

      {toast && (
        <Toast
          title={toast.title}
          sub={toast.sub}
          onClose={() => setToast(null)}
          actions={[
            { label: 'Ver carrinho', onClick: () => navigate('/carrinhos') },
          ]}
        />
      )}
    </DesktopPage>
  )
}
