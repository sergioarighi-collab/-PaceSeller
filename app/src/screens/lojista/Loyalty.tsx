import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { Toast } from '../../components/desktop/Toast'
import { loyaltyInsights, loyaltyPanel } from '../../lib/data'

type CardTone = 'black' | 'risk' | 'info' | 'positive'

// Mesmo princípio de severidade do Radar do lojista (tone preenche o card inteiro, ver .web-icard
// em mockup.css) — simplificado aqui porque os cards de fidelização não têm o conceito de
// "resolvido"/`suggestedQty` que o Radar tem (nenhum deles é "Repor agora").
function cardTone(card: (typeof loyaltyInsights)[number]): CardTone {
  if (card.opportunity) return 'black'
  if (card.severity === 'risk') return 'risk'
  if (card.severity === 'info') return 'info'
  return 'positive'
}

function ToneIcon({ tone }: { tone: CardTone }) {
  if (tone === 'black') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.9 5.6 21.7l1.7-7.3-5.6-4.9 7.4-.6L12 2z" />
      </svg>
    )
  }
  if (tone === 'risk') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    )
  }
  if (tone === 'info') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 11h1v5h1" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 2v20M2 12h20" />
    </svg>
  )
}

const tileColor: Record<(typeof loyaltyPanel)[number]['tone'], string> = {
  positive: 'var(--positive)',
  risk: 'var(--risk)',
  info: 'var(--info)',
  neutral: 'var(--text-primary)',
}

// Migrada pro padrão desktop (nov/2026, ajuste de realismo da lista de melhorias do handoff) —
// era a única tela do app ainda na stack mobile antiga (`AppShell`/`components/ui`, classes
// Tailwind), herdada de antes da migração geral pro desktop e nunca atualizada. Alcançável de
// verdade pelo lojista via o card "Ver clientes" do Radar (`screens/lojista/Radar.tsx`) — não era
// uma tela morta, só visualmente destoante do resto do app.
export function Loyalty() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<{ title: string; sub: string } | null>(null)

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: 'Fidelização' }]} />
      <div className="web-main" style={{ paddingTop: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Seus clientes</div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            32 consumidores cadastrados
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            {loyaltyInsights.length} oportunidades de fidelização hoje
          </div>
        </div>

        <div className="radar-grid" style={{ marginTop: 20 }}>
          {loyaltyInsights.map((card) => {
            const tone = cardTone(card)
            return (
              <div className={`web-icard tone-${tone}`} key={card.id}>
                <div className="kicon">
                  <ToneIcon tone={tone} />
                </div>
                <div className="eyebrow">{card.opportunity ? `Oportunidade · ${card.eyebrow}` : card.eyebrow}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <div
                  className="cta"
                  style={{ cursor: 'pointer' }}
                  onClick={() => (card.cta === 'Ver clientes' ? navigate('/radar') : setToast({ title: `${card.cta} — em breve`, sub: 'Essa área ainda não existe neste protótipo' }))}
                >
                  {card.cta} →
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-tertiary)', marginTop: 28, marginBottom: 12 }}>
          Sua carteira de clientes
        </div>
        <div style={{ display: 'flex', gap: 10, maxWidth: 700 }}>
          {loyaltyPanel.map((p) => (
            <div className="tile" key={p.id}>
              <div className="tlabel">{p.label}</div>
              <div className="tval" style={{ color: tileColor[p.tone] }}>
                {p.count}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <div
            className="btn-primary"
            style={{ width: 260, cursor: 'pointer' }}
            onClick={() => setToast({ title: 'Campanha — em breve', sub: 'Essa área ainda não existe neste protótipo' })}
          >
            Enviar campanha personalizada
          </div>
        </div>
      </div>

      {toast && <Toast title={toast.title} sub={toast.sub} onClose={() => setToast(null)} />}
    </DesktopPage>
  )
}
