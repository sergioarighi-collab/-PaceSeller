import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RepTopNav } from '../../components/desktop/RepTopNav'
import { SinalIcon } from '../../components/desktop/SinalIcon'
import { useAppStore, lojistaSinais, PESO_SINAL, repStatusLabel, pedidoPares } from '../../lib/store'
import type { LojistaSinal, SinalTimeframe } from '../../lib/store'
import { GRADE_MINIMA_PARES } from '../../lib/types'

type ViewMode = 'lojas' | 'carrinhos'

const timeframeOrder: SinalTimeframe[] = ['hoje', '15dias', '30dias']
const timeframeLabel: Record<SinalTimeframe, string> = {
  hoje: 'Hoje',
  '15dias': 'Em 15 dias',
  '30dias': 'Nos próximos 30 dias',
}

const sinalCta: Record<LojistaSinal['kind'], string> = {
  revisao: 'Revisar pedido',
  estoque: 'Sugerir reposição',
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
  const sugerirReposicao = useAppStore((s) => s.sugerirReposicao)
  const [lojistaFiltro, setLojistaFiltro] = useState<string | null>(null)
  const [timeframeFiltro, setTimeframeFiltro] = useState<SinalTimeframe>('hoje')
  // Visão "Lojas" (default) vs "Carrinhos" (set/2026, pedido do usuário: "trazer por filtros...
  // mantemos os cards do radar original, mas trazemos um filtro por carrinhos dos lojistas") —
  // mesmo grid/card, só muda a granularidade: um card por LOJA ou um card por CARRINHO. Não é uma
  // tela nova nem funde com a Carteira — é um jeito de ver a mesma carteira com mais detalhe sem
  // trocar de tela. Ver `carrinhosRanqueados` abaixo.
  const [viewMode, setViewMode] = useState<ViewMode>('lojas')

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

  // Visão "Carrinhos": um card por carrinho (não por loja), carregando o sinal específico DAQUELE
  // carrinho quando existir (revisão/estoque sempre nascem com `cartId` — ver `lojistaSinais`).
  // Mesma regra de peso/precedência de filtro da visão "Lojas", só que no nível do carrinho em vez
  // da loja — um carrinho sem sinal não é "menos carrinho", só não tem nada puxando a atenção da
  // Ana agora (mesmo card "tudo em dia" que já existia, só que por carrinho).
  const carrinhosRanqueados = lojistas
    .flatMap((lojista) => {
      const sinais = lojistaSinais(lojista)
      return lojista.carrinhos.map((cart) => ({ lojista, cart, sinal: sinais.find((s) => s.cartId === cart.id) }))
    })
    .sort((a, b) => (b.sinal ? PESO_SINAL[b.sinal.kind] : 0) - (a.sinal ? PESO_SINAL[a.sinal.kind] : 0))

  const carrinhosComSinal = carrinhosRanqueados.filter((x) => x.sinal)
  const carrinhosPorPeriodo = (tf: SinalTimeframe) => carrinhosComSinal.filter((x) => x.sinal!.timeframe === tf)
  const carrinhosVisiveis = carrinhosRanqueados.filter((x) => {
    if (lojistaFiltro) return x.lojista.id === lojistaFiltro
    return !x.sinal || x.sinal.timeframe === timeframeFiltro
  })

  function abrirLoja(lojistaId: string) {
    enterLojista(lojistaId)
    navigate('/catalogo')
  }

  function abrirCarrinho(lojistaId: string, cartId: string) {
    enterLojista(lojistaId)
    navigate(`/carrinhos/${cartId}`)
  }

  // Cada sinal já executa a ação de verdade, não só abre uma tela pro representante fazer o resto
  // na mão (set/2026, pedido do usuário: "os cards de gatilho já devem levar o usuário para a
  // ação... até mesmo para jogar para o carrinho e encaminhar para o cliente"):
  // - 'revisao': o pedido já existe, só falta aprovar — vai direto pro CarrinhoDetail com o botão
  //   "Aprovar pedido" (ver aprovarPedido em store.ts).
  // - 'estoque': joga o produto num carrinho novo e já encaminha pro lojista (`sugerirReposicao`
  //   em store.ts — mesmo par `status: 'aguardando'` + `suggestedBy: 'representante'` que o lado do
  //   lojista já sabia exibir), e abre esse carrinho pra confirmar o que foi enviado.
  // - 'visita': não tem um carrinho/produto por trás, é um sinal sobre a loja como um todo — não dá
  //   pra "executar" sozinho, então abre a loja no catálogo pra o representante decidir o que levar.
  function executarSinal(lojistaId: string, sinal: LojistaSinal) {
    enterLojista(lojistaId)
    if (sinal.kind === 'revisao' && sinal.cartId) {
      navigate(`/carrinhos/${sinal.cartId}`)
      return
    }
    if (sinal.kind === 'estoque' && sinal.productId) {
      const novoCarrinhoId = sugerirReposicao(sinal.productId)
      if (novoCarrinhoId) {
        navigate(`/carrinhos/${novoCarrinhoId}`)
        return
      }
    }
    navigate('/catalogo')
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
              {timeframeLabel[tf]} <span className="n">{(viewMode === 'lojas' ? porPeriodo(tf) : carrinhosPorPeriodo(tf)).length}</span>
            </div>
          ))}
        </div>

        {/* Visão "Lojas" (1 card por loja, resume no sinal de maior peso) vs "Carrinhos" (1 card
            por carrinho, cada um com o sinal específico dele, se tiver) — mesmos filtros de loja/
            período acima valem pras duas, só muda o que populate o grid abaixo. */}
        <div className="radar-viewtoggle">
          <div className={`radar-viewchip ${viewMode === 'lojas' ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setViewMode('lojas')}>
            Lojas
          </div>
          <div
            className={`radar-viewchip ${viewMode === 'carrinhos' ? 'selected' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setViewMode('carrinhos')}
          >
            Carrinhos
          </div>
        </div>

        {/* Cards reaproveitam literalmente `.web-icard`/`.kicon`/`.eyebrow`/`.cta` do Radar do
            lojista (set/2026, pedido do usuário: "o radar do rep deveria estar mais parecido com o
            do lojista") — mesmo ritmo visual (ícone primeiro, depois um rótulo pequeno, título,
            descrição, link de texto colorido no rodapé em vez da pílula sólida que existia antes).
            `eyebrow` leva a info que só o representante precisa (de qual loja é — o lojista não
            precisa disso, só tem uma loja), `h3`/`p` carregam o que o card é "sobre" e o sinal. */}
        {viewMode === 'lojas' ? (
          <div className="radar-grid">
            {visiveis.map(({ lojista, sinais, topSinal }) => (
              <div className={`web-icard ${topSinal ? `tone-${topSinal.tone}` : 'tone-positive'}`} key={lojista.id}>
                <div className="kicon">
                  <SinalIcon kind={topSinal?.kind ?? 'empty'} />
                </div>
                <div className="eyebrow">
                  {lojista.city} · {lojista.contactName}
                </div>
                <h3>{lojista.name}</h3>
                <p>{topSinal ? topSinal.text : 'Tudo em dia — nenhuma pendência agora'}</p>
                {topSinal && sinais.length > 1 && (
                  <div className="radar-more">
                    + {sinais.length - 1} outra{sinais.length - 1 > 1 ? 's' : ''} pendência{sinais.length - 1 > 1 ? 's' : ''}
                  </div>
                )}
                <div className="cta" style={{ cursor: 'pointer' }} onClick={() => (topSinal ? executarSinal(lojista.id, topSinal) : abrirLoja(lojista.id))}>
                  {topSinal ? sinalCta[topSinal.kind] : 'Atender esta loja'} →
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="radar-grid">
            {carrinhosVisiveis.map(({ lojista, cart, sinal }) => {
              const status = repStatusLabel(cart.pedido)
              const pares = pedidoPares(cart.pedido)
              return (
                <div className={`web-icard ${sinal ? `tone-${sinal.tone}` : 'tone-positive'}`} key={cart.id}>
                  <div className="kicon">
                    <SinalIcon kind={sinal?.kind ?? 'empty'} />
                  </div>
                  <div className="eyebrow">{lojista.name}</div>
                  <h3>{cart.name}</h3>
                  <p>{sinal ? sinal.text : `${status.label} — ${pares}/${GRADE_MINIMA_PARES} pares`}</p>
                  <div
                    className="cta"
                    style={{ cursor: 'pointer' }}
                    onClick={() => (sinal ? executarSinal(lojista.id, sinal) : abrirCarrinho(lojista.id, cart.id))}
                  >
                    {sinal ? sinalCta[sinal.kind] : 'Abrir'} →
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
