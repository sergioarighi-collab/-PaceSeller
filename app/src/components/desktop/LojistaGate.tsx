import { useNavigate } from 'react-router-dom'
import { RepTopNav } from './RepTopNav'
import { SinalIcon } from './SinalIcon'
import { useAppStore, topLojistaSinal } from '../../lib/store'

// "Modo loja" (set/2026) — quando o representante entra no Catálogo sem vir de uma ação do Radar
// (que já escolhe o lojista automaticamente via `enterLojista`), ele precisa escolher qual loja vai
// atender antes de ver o catálogo. Pedido do usuário: a primeira versão (lista simples, reaproveitada
// do picker "Em qual carrinho?" do OrderDrawer) "não condizia com o que estávamos criando" — virou o
// mesmo card colorido por severidade que o Radar já usa (`.web-icard`/`SinalIcon`, o mesmo card do
// Radar do LOJISTA, ver `topLojistaSinal` em store.ts), pra entrar no catálogo já parecer parte do
// mesmo produto, e de brinde mostrar pra Ana o porquê de cada loja antes mesmo dela decidir. Clicar
// no card inteiro só escolhe a loja e entra no catálogo livre — diferente do Radar, aqui não executa
// a ação do sinal (ver guia-dev-frontend.md pra essa distinção: Radar executa, Gate só escolhe).
// `.gate-pick` é o único acréscimo por cima do `.web-icard` padrão: o card inteiro é clicável aqui
// (não só um link no rodapé), precisa de cursor/hover avisando isso.
export function LojistaGate() {
  const navigate = useNavigate()
  const lojistas = useAppStore((s) => s.lojistas)
  const enterLojista = useAppStore((s) => s.enterLojista)

  function escolherLoja(lojistaId: string) {
    enterLojista(lojistaId)
    navigate('/catalogo')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <RepTopNav />
      <div className="web-main">
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
          Qual loja você vai atender agora?
        </h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
          O catálogo, a grade mínima e o carrinho vão ser dessa loja até você trocar
        </div>

        <div className="radar-grid">
          {lojistas.map((lojista) => {
            const topSinal = topLojistaSinal(lojista)
            return (
              <div
                className={`web-icard gate-pick ${topSinal ? `tone-${topSinal.tone}` : 'tone-positive'}`}
                key={lojista.id}
                onClick={() => escolherLoja(lojista.id)}
              >
                <div className="kicon">
                  <SinalIcon kind={topSinal?.kind ?? 'empty'} />
                </div>
                <div className="eyebrow">
                  {lojista.city} · {lojista.contactName}
                </div>
                <h3>{lojista.name}</h3>
                <p>{topSinal ? topSinal.text : 'Tudo em dia — nenhuma pendência agora'}</p>
                <div className="cta">Entrar na loja →</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
