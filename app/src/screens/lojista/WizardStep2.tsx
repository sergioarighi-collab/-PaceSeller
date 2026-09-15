import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardShell } from '../../components/desktop/OnboardShell'
import { Toast } from '../../components/desktop/Toast'
import { useAppStore } from '../../lib/store'

export function WizardStep2() {
  const navigate = useNavigate()
  const dismissOnboardingNotice = useAppStore((s) => s.dismissOnboardingNotice)
  const completeProfile = useAppStore((s) => s.completeProfile)
  const [comingSoon, setComingSoon] = useState(false)

  return (
    <OnboardShell step={2}>
      <div className="omhead">
        <h2>Fale sobre sua loja</h2>
        <div className="omsub">Isso ajuda o Radar a te conhecer melhor. Dado de venda de verdade vem de uma das duas formas abaixo.</div>
      </div>
      <div className="onboard-form">
        <div className="block-label">Dado de vendas</div>
        <div className="data-block">
          <div className="optioncard" style={{ cursor: 'pointer' }} onClick={() => setComingSoon(true)}>
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
          <div className="divider-text" style={{ margin: '16px 0 12px' }}>
            ou continue sem conectar
          </div>
          <div className="risk-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--risk)" strokeWidth="2">
              <path d="M12 9v3M12 16h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
            <p>
              <b>Sem conectar, seu Radar começa sem dado de venda nenhum</b> — as recomendações ficam genéricas até você
              registrar pedidos suficientes aqui no Pace Seller, o que costuma levar alguns meses de uso.
            </p>
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
