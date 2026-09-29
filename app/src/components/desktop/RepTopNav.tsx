import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../lib/store'
import { Toast } from './Toast'

// Nav do representante (set/2026, primeiro passo do fluxo desktop dele — ver guia-dev-frontend.md).
// Deliberadamente mais simples que o WebTopNav do lojista: sem ícone de sacola/pedido em montagem
// (o representante ainda não tem um fluxo de montar pedido pra um lojista nesta leva) nem sino de
// notificação (não existe `notifications` do lado do representante ainda). "Catálogo" fica como
// link desabilitado com toast "em breve", mesmo padrão já usado no avatar do lojista pros itens
// que ainda não existem — evita link morto sem feedback nenhum ao clicar.
const navItems = [
  { to: '/rep/radar', label: 'Radar', enabled: true },
  { to: '/rep/carteira', label: 'Carteira', enabled: true },
  { to: '/rep/catalogo', label: 'Catálogo', enabled: false },
]

export function RepTopNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [comingSoon, setComingSoon] = useState<string | null>(null)
  const navigate = useNavigate()
  const activeUser = useAppStore((s) => s.activeUser)
  const initials = activeUser?.initials ?? 'AN'

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
        <div className="avatar-wrap">
          <div className="avatar-chip" style={{ cursor: 'pointer' }} onClick={() => setMenuOpen((o) => !o)}>
            {initials}
          </div>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setMenuOpen(false)} />
              <div className="avatar-menu">
                <div className="am-header">
                  <div className="am-name">{activeUser?.name ?? 'Ana Silva'}</div>
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
