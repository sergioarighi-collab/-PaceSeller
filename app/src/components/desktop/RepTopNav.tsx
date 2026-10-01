import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../lib/store'
import { Toast } from './Toast'

// Nav do representante (set/2026, primeiro passo do fluxo desktop dele — ver guia-dev-frontend.md).
// Deliberadamente mais simples que o WebTopNav do lojista: sem ícone de sacola/pedido em montagem
// próprio (o "Seu pedido" do drawer só faz sentido depois de entrar numa loja — ver OrderDrawer
// dentro do próprio Catálogo) nem sino de notificação (não existe `notifications` do lado do
// representante ainda).
// "Catálogo" aponta pra rota /catalogo (a mesma do lojista, reaproveitada — ver "modo loja" em
// guia-dev-frontend.md), não uma rota própria do representante.
const navItems = [
  { to: '/rep/radar', label: 'Radar', enabled: true },
  { to: '/rep/carteira', label: 'Carteira', enabled: true },
  { to: '/catalogo', label: 'Catálogo', enabled: true },
]

export function RepTopNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [comingSoon, setComingSoon] = useState<string | null>(null)
  const navigate = useNavigate()
  const lojistas = useAppStore((s) => s.lojistas)
  const activeLojistaId = useAppStore((s) => s.activeLojistaId)
  const exitLojista = useAppStore((s) => s.exitLojista)
  const lojistaAtiva = lojistas.find((l) => l.id === activeLojistaId)

  return (
    <div className="web-topnav">
      <div className="navleft">
        <span className="weblogo" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          Tesla Skate
        </span>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.05em',
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border-strong)',
            borderRadius: 4,
            padding: '2px 6px',
          }}
        >
          REPRESENTANTE
        </span>
        <div className="navlinks">
          {navItems.map((item) =>
            item.enabled ? (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {item.label}
              </NavLink>
            ) : (
              <span
                key={item.to}
                style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }}
                onClick={() => setComingSoon(item.label)}
              >
                {item.label}
              </span>
            ),
          )}
        </div>
      </div>
      <div className="navright">
        {lojistaAtiva && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, marginRight: 4 }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Atendendo: <b style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{lojistaAtiva.name}</b>
            </span>
            {/* Volta pra tela de escolher loja (`LojistaGate.tsx`), não pro Radar (set/2026, pedido
                do usuário: "deixar um botão no catálogo que o usuário poderá voltar... e escolher
                outra loja") — `/catalogo` sem lojista ativa já mostra essa tela (mesmo gate que
                aparece ao clicar "Catálogo" na nav pela primeira vez), que é o que a Ana quer aqui:
                trocar de loja, não voltar pro dashboard inteiro. */}
            <span
              style={{ color: 'var(--info)', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => {
                exitLojista()
                navigate('/catalogo')
              }}
            >
              Trocar loja
            </span>
          </div>
        )}
        <div className="avatar-wrap">
          <div className="avatar-chip" style={{ cursor: 'pointer' }} onClick={() => setMenuOpen((o) => !o)}>
            AN
          </div>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setMenuOpen(false)} />
              <div className="avatar-menu">
                <div className="am-header">
                  <div className="am-name">Ana Silva</div>
                  <div className="am-store">Representante · Tesla Skate</div>
                </div>
                <div
                  className="am-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setMenuOpen(false)
                    setComingSoon('Meu perfil')
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="3.4" />
                    <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
                  </svg>
                  Meu perfil
                </div>
                <div className="am-divider" />
                <div className="am-item danger" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Sair
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {comingSoon && (
        <Toast title={`${comingSoon} — em breve`} sub="Essa área ainda não existe neste protótipo" onClose={() => setComingSoon(null)} />
      )}
    </div>
  )
}
