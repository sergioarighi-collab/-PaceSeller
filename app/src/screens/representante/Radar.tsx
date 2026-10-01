import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RepTopNav } from '../../components/desktop/RepTopNav'
import { useAppStore, lojistaSinais } from '../../lib/store'
import type { LojistaSinal, SinalTimeframe } from '../../lib/store'

// Peso de cada sinal pra ranquear a carteira (set/2026) — pedido aguardando aprovação é o mais
// urgente (trava uma venda), depois estoque (o produto pode acabar antes de agir), depois visita
// (importante, mas sem prazo tão apertado). Não é ciência exata, é só pra ordenar a lista de forma
// que o que mais importa apareça primeiro — ver "Radar vira a carteira inteira" no
// guia-dev-frontend.md.
const PESO_SINAL: Record<LojistaSinal['kind'], number> = { revisao: 3, estoque: 2, visita: 1 }

const timeframeOrder: SinalTimeframe[] = ['hoje', '15dias', '30dias']
const timeframeLabel: Record<SinalTimeframe, string> = {
  hoje: 'Hoje',
  '15dias': 'Em 15 dias',
  '30dias': 'Nos próximos 30 dias',
}

// Mesmo conjunto de ícones de severidade do Radar do lojista (ToneIcon em screens/lojista/Radar.tsx
// — "warning" é literalmente o mesmo path), só que um por TIPO de sinal (não só por tom), pra cada
// um comunicar o que é sem precisar ler o texto: relógio = aguardando decisão, triângulo = estoque
// em risco, calendário = tempo sem visita. Resolve também a dúvida do usuário sobre o "i" solto que
// tinha antes — não era um ícone de verdade, era só a letra "i".
function SinalIcon({ kind }: { kind: LojistaSinal['kind'] | 'empty' }) {
  switch (kind) {
    case 'revisao':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      )
    case 'estoque':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      )
    case 'visita':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      )
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )
  }
}

const sinalCta: Record<LojistaSinal['kind'], string> = {
  revisao: 'Revisar pedido',
  estoque: 'Falar agora',
  visita: 'Agendar visita',
}

// Radar do representante (set/2026) — pedido do usuário: precisa trazer a carteira INTEIRA (não só
// quem tem pendência), ranqueada por prioridade, em cards (não lista) com cor forte por severidade
// (mesmo princípio do Radar do lojista — fundo colorido chama mais atenção que um ícone pequeno) e
// um filtro por loja + por período (igual ao do lojista). Clicar na ação de um sinal já seleciona o
// lojista e entra direto no contexto dele (ver `enterLojista` em store.ts) — "modo loja". Sem
// clicar em nada, o lojista só é escolhido manualmente ao entrar no Catálogo pela nav (ver
// LojistaGate.tsx).
export function RepRadar() {
  const navigate = useNavigate()
  const lojistas = useAppStore((s) => s.lojistas)
  const enterLojista = useAppStore((s) => s.enterLojista)
  const [lojistaFiltro, setLojistaFiltro] = useState<string | null>(null)
  const [timeframeFiltro, setTimeframeFiltro] = useState<SinalTimeframe>('hoje')

  // Cada card só mostra o sinal de maior peso daquela loja (os outros viram "+N outras
  // pendências") — `topSinal`/`timeframe` do card vêm desse sinal específico, não de uma mistura
  // dos vários sinais que a loja possa ter.
  const ranqueada = lojistas
    .map((lojista) => {
      const sinais = [...lojistaSinais(lojista)].sort((a, b) => PESO_SINAL[b.kind] - PESO_SINAL[a.kind])
      return { lojista, sinais, topSinal: sinais[0] as LojistaSinal | undefined }
    })
    .sort((a, b) => (b.topSinal ? PESO_SINAL[b.topSinal.kind] : 0) - (a.topSinal ? PESO_SINAL[a.topSinal.kind] : 0))

  const comSinais = ranqueada.filter((x) => x.topSinal)
  const porPeriodo = (tf: SinalTimeframe) => comSinais.filter((x) => x.topSinal!.timeframe === tf)

  // Selecionar uma loja específica é um filtro mais forte que o período — faz sentido ela aparecer
  // mesmo que o sinal principal dela não seja "de hoje", já que o pedido foi por ela especificamente.
  const visiveis = ranqueada.filter((x) => {
    if (lojistaFiltro) return x.lojista.id === lojistaFiltro
    return !x.topSinal || x.topSinal.timeframe === timeframeFiltro
  })

  function abrirLoja(lojistaId: string) {
    enterLojista(lojistaId)
    navigate('/catalogo')
  }

  // "Revisar pedido" leva direto pro pedido específico (não só o catálogo) — é a ação mais pronta
  // pra virar execução real: reaproveita CarrinhoDetail.tsx com o botão "Aprovar pedido" (ver
  // aprovarPedido em store.ts). "Falar agora"/"Agendar visita" ainda não têm uma ação de sistema
  // própria, então abrem a loja no catálogo por enquanto — ver guia-dev-frontend.md.
  function executarSinal(lojistaId: string, sinal: LojistaSinal) {
    enterLojista(lojistaId)
    navigate(sinal.kind === 'revisao' && sinal.cartId ? `/carrinhos/${sinal.cartId}` : '/catalogo')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <RepTopNav />

      <div className="web-hero-band">
        <div className="whgreet">Bom dia, Ana</div>
        <h1>{comSinais.length > 0 ? `${comSinais.length} loja${comSinais.length > 1 ? 's' : ''} precisam de atenção` : 'Sua carteira está em dia'}</h1>
        <div className="whsub">{lojistas.length} lojas na carteira</div>
      </div>

      <div className="web-main">
        {/* Hierarquia entre os dois filtros (set/2026, pedido do usuário): loja é o filtro
            primário — chip maior, preenchido quando selecionado — porque escolher uma loja
            específica tem precedência sobre o período (ver `visiveis` acima: selecionar uma loja
            ignora a aba de período ativa). Período fica como filtro secundário, só links de texto
            sem fundo, pra não competir visualmente com o filtro que realmente manda. */}
        <div className="radar-filterlabel">Loja</div>
        <div className="tl-filters radar-filter-primary">
          <div className={`chip ${!lojistaFiltro ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setLojistaFiltro(null)}>
            Todas
          </div>
          {lojistas.map((l) => (
            <div
              key={l.id}
              className={`chip ${lojistaFiltro === l.id ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setLojistaFiltro(l.id)}
            >
              {l.name}
            </div>
          ))}
        </div>
        <div className="radar-filterlabel" style={{ marginTop: 16 }}>
          Período
        </div>
        <div className="tl-filters radar-filter-secondary">
          {timeframeOrder.map((tf) => (
            <div
              key={tf}
              className={`chip ${timeframeFiltro === tf && !lojistaFiltro ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setLojistaFiltro(null)
                setTimeframeFiltro(tf)
              }}
            >
              {timeframeLabel[tf]} <span className="n">{porPeriodo(tf).length}</span>
            </div>
          ))}
        </div>

        <div className="radar-grid">
          {visiveis.map(({ lojista, sinais, topSinal }) => (
            <div className={`radar-card ${topSinal ? `tone-${topSinal.tone}` : 'tone-positive'}`} key={lojista.id}>
              <div className="cc-name">{lojista.name}</div>
              <div className="cc-meta">
                {lojista.city} · {lojista.contactName}
              </div>
              <div className="radar-kicon">
                <SinalIcon kind={topSinal?.kind ?? 'empty'} />
              </div>
              <div className="radar-body">
                {topSinal ? (
                  <>
                    <div className="radar-signal">{topSinal.text}</div>
                    {sinais.length > 1 && (
                      <div className="radar-more">
                        + {sinais.length - 1} outra{sinais.length - 1 > 1 ? 's' : ''} pendência{sinais.length - 1 > 1 ? 's' : ''}
                      </div>
                    )}
                    <span className="radar-cta" style={{ cursor: 'pointer' }} onClick={() => executarSinal(lojista.id, topSinal)}>
                      {sinalCta[topSinal.kind]} →
                    </span>
                  </>
                ) : (
                  <>
                    <div className="radar-signal">Tudo em dia — nenhuma pendência agora</div>
                    <div
                      className="radar-empty"
                      style={{ cursor: 'pointer', color: 'var(--positive)', fontWeight: 600 }}
                      onClick={() => abrirLoja(lojista.id)}
                    >
                      Atender esta loja →
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
