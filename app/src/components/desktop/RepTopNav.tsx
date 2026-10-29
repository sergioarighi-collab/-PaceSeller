import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppStore, cartSummary, comboSummary } from '../../lib/store'
import { Toast } from './Toast'

// Nav do representante (set/2026, primeiro passo do fluxo desktop dele — ver guia-dev-frontend.md).
// Deliberadamente mais simples que o WebTopNav do lojista: sem sino de notificação (não existe
// `notifications` do lado do representante ainda). O ícone de sacola/pedido em montagem (abaixo,
// "Acesso ao drawer") só aparece em modo loja — fora disso não tem pedido em montagem nenhum pra
// mostrar (ver `enterLojista`/`exitLojista` em store.ts: `cartItems`/`cartCombos` sempre zeram ao
// trocar de loja ou sair dela).
// "Catálogo" aponta pra rota /catalogo (a mesma do lojista, reaproveitada — ver "modo loja" em
// guia-dev-frontend.md), não uma rota própria do representante.
// "Carrinhos" só aparece com uma loja ativa (out/2026, pedido do usuário: "vamos retirar o
// carrinho do radar tb" — a visão "Carrinhos" do Radar, que existia pra ver o portfólio inteiro
// fora de modo loja, foi removida de propósito, ver RepRadar). Sem isso não sobra nenhuma tela de
// "carrinhos" fora de modo loja pra esse item apontar — por isso ele some do nav em vez de apontar
// pra algum lugar sem sentido. Dentro de uma loja continua indo pra `/carrinhos` — o mesmo
// `MeusCarrinhos.tsx` que o lojista usa, já escopado sozinho pra loja ativa.
export function RepTopNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [comingSoon, setComingSoon] = useState<string | null>(null)
  const navigate = useNavigate()
  const lojistas = useAppStore((s) => s.lojistas)
  const activeLojistaId = useAppStore((s) => s.activeLojistaId)
  const exitLojista = useAppStore((s) => s.exitLojista)
  const toggleOrderDrawer = useAppStore((s) => s.toggleOrderDrawer)
  const cartItems = useAppStore((s) => s.cartItems)
  const cartCombos = useAppStore((s) => s.cartCombos)
  const lojistaAtiva = lojistas.find((l) => l.id === activeLojistaId)
  const { totalItems: itemsQty } = cartSummary(cartItems)
  const { totalItems: combosQty } = comboSummary(cartCombos)
  const bagCount = itemsQty + combosQty
  const navItems = [
    { to: '/rep/radar', label: 'Radar', enabled: true },
    { to: '/catalogo', label: 'Catálogo', enabled: true },
    ...(lojistaAtiva ? [{ to: '/carrinhos', label: 'Carrinhos', enabled: true }] : []),
  ]

  return (
    <div className="web-topnav">
      <div className="navleft">
        <span className="weblogo" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          Tesla Skate
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
        {/* Acesso ao drawer (set/2026, pedido do usuário: "faltou o acesso ao drawer no header
            igual ao lojista") — mesmo ícone/badge do WebTopNav, mesmo `toggleOrderDrawer`. Só
            aparece em modo loja (`lojistaAtiva`): fora de uma loja não existe pedido em montagem
            (`cartItems`/`cartCombos` zeram ao entrar/sair — ver `enterLojista`/`exitLojista`), não
            tem drawer nenhum pra abrir. O drawer em si (`<OrderDrawer/>`) já é montado pelo
            `DesktopPage` dentro do Catálogo/Carrinho — só faltava o atalho pra abrir/fechar daqui. */}
        {lojistaAtiva && (
          <div className="navicon" style={{ cursor: 'pointer', position: 'relative' }} onClick={toggleOrderDrawer} title="Seu pedido">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6h15l-1.5 9h-12L6 6Zm0 0-1-3H2" />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
            </svg>
            {bagCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  padding: '0 3px',
                  borderRadius: 8,
                  background: 'var(--info)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  lineHeight: '16px',
                  textAlign: 'center',
                }}
              >
                {bagCount}
              </span>
            )}
          </div>
        )}
        {/* Movido do canto esquerdo pra cá (set/2026, pedido do usuário: "pode ficar em outro lugar
            aquela indicação... talvez no canto direito") — interrompia o fluxo logo→nav do lado
            esquerdo; aqui agrupa com a identidade de quem está logada (o menu do avatar já mostra
            "Ana Silva · Representante" por completo, isso aqui é só o resumo sempre visível). */}
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
