import { RepTopNav } from './RepTopNav'
import { useAppStore } from '../../lib/store'

// "Modo loja" (set/2026) — quando o representante entra no Catálogo sem vir de uma ação do Radar
// (que já escolhe o lojista automaticamente via `enterLojista`), ele precisa escolher qual loja vai
// atender antes de ver o catálogo — pedido do usuário. Reaproveita o padrão visual do picker "Em
// qual carrinho?" do OrderDrawer (`.optioncard`). Ver guia-dev-frontend.md.
export function LojistaGate() {
  const lojistas = useAppStore((s) => s.lojistas)
  const enterLojista = useAppStore((s) => s.enterLojista)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <RepTopNav />
      <div className="web-main" style={{ paddingTop: 20, maxWidth: 560 }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
          Qual loja você vai atender agora?
        </h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
          O catálogo, a grade mínima e o carrinho vão ser dessa loja até você trocar
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          {lojistas.map((l) => (
            <div key={l.id} className="optioncard" style={{ cursor: 'pointer' }} onClick={() => enterLojista(l.id)}>
              <div className="oicon" style={{ borderRadius: '50%', fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 12 }}>
                {l.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div className="otitle">{l.name}</div>
                <div className="osub">
                  {l.city} · {l.contactName}
                </div>
              </div>
              <span className="ochev">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
