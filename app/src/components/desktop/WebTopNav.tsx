import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../lib/store'

const navItems = [
  { to: '/radar', label: 'Radar' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/carrinhos', label: 'Meus carrinhos' },
]

export function WebTopNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const activeUser = useAppStore((s) => s.activeUser)
  const toggleOrderDrawer = useAppStore((s) => s.toggleOrderDrawer)
  const navigate = useNavigate()
  const initials = activeUser?.initials ?? 'CA'

  return (
    <div className="web-topnav">
      <div className="navleft">
        <span className="weblogo" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          Tesla Skate
        </span>
        <div className="navlinks">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
          <span style={{ color: 'var(--text-tertiary)', cursor: 'default' }}>Clientes</span>
        </div>
      </div>
      <div className="navright">
        <div className="navicon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div className="navicon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </div>
        <div className="navicon" style={{ cursor: 'pointer' }} onClick={toggleOrderDrawer} title="Seu pedido">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6h15l-1.5 9h-12L6 6Zm0 0-1-3H2" />
            <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div className="avatar-wrap">
          <div className="avatar-chip" style={{ cursor: 'pointer' }} onClick={() => setMenuOpen((o) => !o)}>
            {initials}
          </div>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setMenuOpen(false)} />
              <div className="avatar-menu">
                <div className="am-header">
                  <div className="am-name">{activeUser?.name ?? 'Carlos Andrade'}</div>
                  <div className="am-store">Radical Skate · Porto Alegre, RS</div>
                </div>
                <div className="am-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="3.4" />
                    <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
                  </svg>
                  Meu perfil
                </div>
                <div className="am-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
                  </svg>
                  Configurações
                </div>
                <div className="am-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 7h16l-1.4 10.3a2 2 0 0 1-2 1.7H7.4a2 2 0 0 1-2-1.7L4 7Z" />
                    <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
                  </svg>
                  Minha loja
                </div>
                <div className="am-divider" />
                <div
                  className="am-item danger"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/')}
                >
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
    </div>
  )
}
