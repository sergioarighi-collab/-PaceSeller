import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Toast } from '../../components/desktop/Toast'
import { useAppStore } from '../../lib/store'
import { lojistaRadarInsights } from '../../lib/data'
import type { InsightCardData } from '../../lib/types'
import bannerImg from '../../assets/images/banner-destaque-semana.jpg'

type Timeframe = 'hoje' | '15dias' | '30dias'
const timeframeOrder: Timeframe[] = ['hoje', '15dias', '30dias']
const timeframeLabel: Record<Timeframe, string> = {
  hoje: 'Hoje',
  '15dias': 'Em 15 dias',
  '30dias': 'Nos próximos 30 dias',
}

type CardTone = 'black' | 'risk' | 'info' | 'positive'
type CardIcon = 'star' | 'warning' | 'compare' | 'plus' | 'check'

// Cor de severidade preenche o card inteiro (não só a barra lateral de antes) — ver .web-icard em
// mockup.css. "Resolvido" (ex: reposição já feita) sempre vira tone positive, independente da
// severidade original do card, pra confirmar visualmente que a ação foi concluída.
function cardVisual(card: InsightCardData, resolved: boolean): { tone: CardTone; icon: CardIcon } {
  if (resolved) return { tone: 'positive', icon: 'check' }
  if (card.opportunity) return { tone: 'black', icon: 'star' }
  if (card.severity === 'risk') return { tone: 'risk', icon: 'warning' }
  if (card.severity === 'info') return { tone: 'info', icon: 'compare' }
  return { tone: 'positive', icon: 'plus' }
}

function ToneIcon({ icon }: { icon: CardIcon }) {
  switch (icon) {
    case 'star':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.9 5.6 21.7l1.7-7.3-5.6-4.9 7.4-.6L12 2z" />
        </svg>
      )
    case 'warning':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      )
    case 'compare':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 3v18h18" />
          <path d="m7 14 4-4 4 4 5-6" />
        </svg>
      )
    case 'check':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 2v20M2 12h20" />
        </svg>
      )
  }
}

export function Radar() {
  const navigate = useNavigate()
  const addToCart = useAppStore((s) => s.addToCart)
  const onboardingSkipped = useAppStore((s) => s.onboardingSkipped)
  const dismissOnboardingNotice = useAppStore((s) => s.dismissOnboardingNotice)

  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('hoje')
  const [toast, setToast] = useState<{ title: string; sub: string } | null>(null)
  const [repostos, setRepostos] = useState<Set<string>>(new Set())

  function handleRepor(productLabel: string, qty: number) {
    setRepostos((s) => new Set(s).add(productLabel))
    setToast({ title: 'Reposição adicionada ao carrinho', sub: `${productLabel} · ${qty} unidades` })
  }

  const groups: Record<Timeframe, InsightCardData[]> = { hoje: [], '15dias': [], '30dias': [] }
  for (const card of lojistaRadarInsights) groups[card.timeframe ?? 'hoje'].push(card)

  function renderInsightCard(card: InsightCardData) {
    const resolved = card.cta === 'Repor agora' && repostos.has(card.title)
    const { tone, icon } = cardVisual(card, resolved)
    return (
      <div className={`web-icard tone-${tone}`} key={card.id}>
        <div className="kicon">
          <ToneIcon icon={icon} />
        </div>
        <div className="eyebrow">{card.opportunity ? `Oportunidade · ${card.eyebrow}` : card.eyebrow}</div>
        {card.stat && <div className="stat">{card.stat}</div>}
        <h3>{card.title}</h3>
        <p>{card.text}</p>
        {card.suggestedQty && !resolved && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, marginTop: 8 }}>
            Sugestão: repor {card.suggestedQty} unidades
          </div>
        )}
        {card.cta === 'Repor agora' ? (
          resolved ? (
            <div className="cta">✓ Reposto</div>
          ) : (
            <div
              className="cta"
              style={{ cursor: 'pointer' }}
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
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (card.cta === 'Ver produto' && card.productId) navigate(`/catalogo/${card.productId}`)
              else if (card.cta === 'Comparar') navigate('/catalogo?contexto=benchmark')
              else if (card.cta === 'Ver coleção') navigate('/colecoes/fusion')
              else if (card.cta === 'Ver pedido') navigate('/carrinhos/reposicao-rapida/4790-1/acompanhamento')
              else if (card.cta === 'Ver clientes') navigate('/fidelizacao')
              else if (card.cta === 'Ir pro Planejar') navigate('/planejamento')
              else navigate('/catalogo')
            }}
          >
            {card.cta} →
          </div>
        )}
      </div>
    )
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
        <div className="whgreet">Bom dia, Carlos</div>
        <h1>Sua loja está saudável</h1>
        <div className="whsub">{lojistaRadarInsights.length} pendências no total — filtre por prazo pra ver cada uma</div>
      </div>

      <div className="web-main">
        <div className="tl-filters">
          {timeframeOrder.map((tf) => (
            <div
              key={tf}
              className={`chip ${activeTimeframe === tf ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTimeframe(tf)}
            >
              {timeframeLabel[tf]} <span className="n">{groups[tf].length}</span>
            </div>
          ))}
        </div>
        <div className="grid4" style={{ marginTop: 20 }}>
          {groups[activeTimeframe].map(renderInsightCard)}
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
