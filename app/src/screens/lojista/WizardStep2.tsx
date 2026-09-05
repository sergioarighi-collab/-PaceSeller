import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardShell } from '../../components/desktop/OnboardShell'
import { Toast } from '../../components/desktop/Toast'
import { useAppStore } from '../../lib/store'

// Substituem ticket médio/categorias/sazonalidade (ago/2026) — esses três eram, na prática, um
// chute do lojista pra um dado que Pace Stock (conectado) ou o próprio histórico de pedidos no
// Pace Seller (acumulado com o uso) vão entregar de verdade e melhor. Perguntar aqui era pedir
// pro lojista adivinhar algo que em breve vira dado real — baixa qualidade e redundante ao mesmo
// tempo. No lugar, perfil qualitativo que nem Pace Stock nem histórico de vendas conseguem
// responder sozinhos, complementando o que a Etapa 1 já pergunta (segmento, porte, público-alvo).
const diferenciais = ['Atendimento especializado', 'Preço competitivo', 'Variedade de marcas', 'Localização', 'Presença digital forte']
const canaisVenda = ['Só loja física', 'Loja física + redes sociais', 'Loja física + e-commerce próprio', 'Também vendo em marketplace']

export function WizardStep2() {
  const navigate = useNavigate()
  const dismissOnboardingNotice = useAppStore((s) => s.dismissOnboardingNotice)
  const completeProfile = useAppStore((s) => s.completeProfile)
  const [diff, setDiff] = useState<string[]>(['Atendimento especializado'])
  const [canais, setCanais] = useState<string[]>(['Loja física + redes sociais'])
  const [comingSoon, setComingSoon] = useState(false)

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  return (
    <OnboardShell step={2}>
      <div className="omhead">
        <h2>Fale sobre sua loja</h2>
        <div className="omsub">Isso ajuda o Radar a te conhecer melhor. Dado de venda de verdade vem de uma das duas formas abaixo.</div>
      </div>
      <div className="onboard-form">
        <div className="fieldgroup" style={{ marginTop: 0 }}>
          <div className="optioncard" style={{ maxWidth: 520, cursor: 'pointer' }} onClick={() => setComingSoon(true)}>
            <div className="oicon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 4h16v4H4zM4 12h16v4H4zM8 8v4M16 8v4" />
              </svg>
            </div>
            <div>
              <div className="otitle">Conectar meu estoque via Pace Stock</div>
              <div className="osub">Radar com inteligência real desde o primeiro dia — sem esperar meses de histórico de vendas</div>
            </div>
            <div className="ochev">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </div>
          </div>
        </div>
        <div className="divider-text" style={{ maxWidth: 520, marginLeft: 0 }}>
          ou continue sem conectar por enquanto
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            maxWidth: 520,
            background: 'var(--risk-dim)',
            border: '1px solid var(--risk)',
            borderRadius: 6,
            padding: '13px 16px',
            marginBottom: 24,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--risk)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 9v3M12 16h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.55 }}>
            <b>Sem conectar, seu Radar começa sem dado de venda nenhum</b> — as recomendações ficam genéricas até você
            registrar pedidos suficientes aqui no Pace Seller, o que costuma levar alguns meses de uso.
          </div>
        </div>
        <div className="fieldgroup" style={{ marginTop: 0 }}>
          <div className="flabel">O que mais diferencia sua loja</div>
          <div className="chipselect">
            {diferenciais.map((d) => (
              <div
                key={d}
                className={`chip ${diff.includes(d) ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggle(diff, setDiff, d)}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
        <div className="fieldgroup">
          <div className="flabel">Como você vende hoje</div>
          <div className="chipselect">
            {canaisVenda.map((c) => (
              <div
                key={c}
                className={`chip ${canais.includes(c) ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggle(canais, setCanais, c)}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
          <div className="btn-secondary" style={{ width: 130, cursor: 'pointer' }} onClick={() => navigate('/onboarding/loja')}>
            Voltar
          </div>
          <div
            className="btn-primary"
            style={{ width: 180, cursor: 'pointer' }}
            onClick={() => {
              dismissOnboardingNotice()
              completeProfile()
              navigate('/radar')
            }}
          >
            Ir para o meu radar
          </div>
        </div>
      </div>

      {comingSoon && (
        <Toast
          title="Pace Stock — em breve"
          sub="A conexão de estoque com a indústria é um módulo separado, ainda não integrado aqui — continue sem conectar por enquanto"
          onClose={() => setComingSoon(false)}
        />
      )}
    </OnboardShell>
  )
}
