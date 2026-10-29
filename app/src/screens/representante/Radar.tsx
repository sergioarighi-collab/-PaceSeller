import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RepTopNav } from '../../components/desktop/RepTopNav'
import { SinalIcon } from '../../components/desktop/SinalIcon'
import { Toast } from '../../components/desktop/Toast'
import { useAppStore, lojistaSinais, lojistasAoVivo, PESO_SINAL, carteiraOportunidade } from '../../lib/store'
import type { LojistaSinal, SinalTimeframe } from '../../lib/store'

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
  parado: 'Retomar carrinho',
}

// Radar do representante (set/2026) — pedido do usuário: precisa trazer a carteira INTEIRA (não só
// quem tem pendência), ranqueada por prioridade, em cards (não lista) com cor forte por severidade
// (mesmo princípio do Radar do lojista — fundo colorido chama mais atenção que um ícone pequeno) e
// um filtro por loja + por período (igual ao do lojista). Clicar na ação de um sinal já seleciona o
// lojista e entra direto no contexto dele (ver `enterLojista` em store.ts) — "modo loja". Sem
// clicar em nada, o lojista só é escolhido manualmente ao entrar no Catálogo pela nav (ver
// LojistaGate.tsx).
// Visão "Carrinhos" (Lista/Quadro/Links) REMOVIDA (out/2026, pedido do usuário: "vamos tirar o
// kanban... e retirar o carrinho do radar tb") — incluía um toggle Lojas/Carrinhos, um segundo
// toggle Lista/Quadro/Links dentro de "Carrinhos", um board kanban por etapa de pedido e a tabela
// de acompanhamento de links de pagamento. O Radar volta a mostrar só a carteira por LOJA; ver
// "compartilhado vs não compartilhado" em MeusCarrinhos.tsx pra onde a visão por carrinho migrou.
export function RepRadar() {
  const navigate = useNavigate()
  const lojistasRaw = useAppStore((s) => s.lojistas)
  const activeLojistaId = useAppStore((s) => s.activeLojistaId)
  const carrinhosAtivos = useAppStore((s) => s.carrinhos)
  // Reflete o que a Ana acabou de fazer em modo loja (aprovar, fechar, renomear...) mesmo antes de
  // trocar de loja de novo — ver `lojistasAoVivo` em store.ts pro porquê de `s.lojistas` sozinho
  // não bastar aqui.
  const lojistas = lojistasAoVivo(lojistasRaw, activeLojistaId, carrinhosAtivos)
  const enterLojista = useAppStore((s) => s.enterLojista)
  const sugerirReposicao = useAppStore((s) => s.sugerirReposicao)
  const sugerirParaCarteira = useAppStore((s) => s.sugerirParaCarteira)
  const [lojistaFiltro, setLojistaFiltro] = useState<string | null>(null)
  const [timeframeFiltro, setTimeframeFiltro] = useState<SinalTimeframe>('hoje')
  const [oportunidadeToast, setOportunidadeToast] = useState<string | null>(null)

  // Oportunidade de carteira (set/2026, pedido do usuário: "sugestões inteligentes de carrinhos
  // específicos para lojistas específicos") — recalculada a cada render a partir de `lojistas`, não
  // guardada em estado: depois de sugerir, os lojistas contemplados passam a ter o produto num
  // carrinho, então `carteiraOportunidade` naturalmente para de achar os 2+ sem o produto e o
  // banner some sozinho — não precisa de um "dispensado" manual.
  const oportunidade = carteiraOportunidade(lojistas)

  function sugerirOportunidadeParaCarteira() {
    if (!oportunidade) return
    const nomes = oportunidade.lojistasSemProduto.map((l) => l.name)
    sugerirParaCarteira(oportunidade.product.id, oportunidade.lojistasSemProduto.map((l) => l.id))
    setOportunidadeToast(`Enviado pra ${nomes.join(', ')}`)
  }
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

  // Cada sinal já executa a ação de verdade, não só abre uma tela pro representante fazer o resto
  // na mão (set/2026, pedido do usuário: "os cards de gatilho já devem levar o usuário para a
  // ação... até mesmo para jogar para o carrinho e encaminhar para o cliente"):
  // - 'revisao': o pedido já existe, só falta aprovar — vai direto pro CarrinhoDetail com o botão
  //   "Aprovar pedido" (ver aprovarPedido em store.ts).
  // - 'estoque': joga o produto num carrinho novo e já encaminha pro lojista (`sugerirReposicao`
  //   em store.ts — mesmo par `status: 'aguardando'` + `suggestedBy: 'representante'` que o lado do
  //   lojista já sabia exibir), e abre esse carrinho pra confirmar o que foi enviado.
  // - 'parado' (adaptado do inventário "Radar Integrado pro Varejista"): mesmo destino de 'revisao'
  //   — o carrinho já existe, só precisa de uma olhada/empurrão, não de uma ação de sistema nova.
  // - 'visita': não tem um carrinho/produto por trás, é um sinal sobre a loja como um todo — não dá
  //   pra "executar" sozinho, então abre a loja no catálogo pra o representante decidir o que levar.
  function executarSinal(lojistaId: string, sinal: LojistaSinal) {
    enterLojista(lojistaId)
    if ((sinal.kind === 'revisao' || sinal.kind === 'parado') && sinal.cartId) {
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
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

        {/* Oportunidade de carteira (set/2026) — banner de largura total, fora da grade de cards.
            Reaproveita a cor tone-black
            do Radar do lojista (mesma natureza "Oportunidade"), só em layout horizontal (ver
            .opp-banner em mockup.css). Um só por vez (o produto de maior crescimento que bate o
            critério — ver carteiraOportunidade em store.ts), não uma lista, pra não virar
            propaganda. Some sozinho depois de sugerir: os lojistas contemplados passam a ter o
            produto, então `carteiraOportunidade` para de encontrá-los como "sem produto". */}
        {oportunidade && (
          <div className="web-icard tone-black opp-banner">
            <div className="kicon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.9 5.6 21.7l1.7-7.3-5.6-4.9 7.4-.6L12 2z" />
              </svg>
            </div>
            <div>
              <div className="eyebrow">Oportunidade na carteira</div>
              <h3>{oportunidade.product.name}</h3>
              <p>
                Alta demanda — {oportunidade.lojistasSemProduto.length} loja{oportunidade.lojistasSemProduto.length > 1 ? 's' : ''} da sua carteira
                ainda não {oportunidade.lojistasSemProduto.length > 1 ? 'têm' : 'tem'} esse produto
              </p>
              <div className="opp-lojas">
                {oportunidade.lojistasSemProduto.map((l) => (
                  <span className="opp-lojapill" key={l.id}>
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="opp-cta" onClick={sugerirOportunidadeParaCarteira}>
              Sugerir pras {oportunidade.lojistasSemProduto.length} lojas →
            </div>
          </div>
        )}

        {/* Cards reaproveitam literalmente `.web-icard`/`.kicon`/`.eyebrow`/`.cta` do Radar do
            lojista (set/2026, pedido do usuário: "o radar do rep deveria estar mais parecido com o
            do lojista") — mesmo ritmo visual (ícone primeiro, depois um rótulo pequeno, título,
            descrição, link de texto colorido no rodapé em vez da pílula sólida que existia antes).
            `eyebrow` leva a info que só o representante precisa (de qual loja é — o lojista não
            precisa disso, só tem uma loja), `h3`/`p` carregam o que o card é "sobre" e o sinal. */}
        <div className="radar-grid">
            {visiveis.map(({ lojista, sinais, topSinal }) => (
              // Corpo do card abre a loja direto (set/2026, achado testando: clicar achando que ia
              // só "ver a loja" disparava a ação do sinal de estoque sem avisar — criava e já
              // enviava um carrinho de reposição). Agora só o `.cta`, com texto explícito do que vai
              // fazer ("Sugerir reposição →"), executa a ação; o resto do card é só navegação, sem
              // efeito colateral nenhum — mesmo padrão "linha abre, botão age" de listas clicáveis.
              <div
                className={`web-icard ${topSinal ? `tone-${topSinal.tone}` : 'tone-positive'}`}
                key={lojista.id}
                style={{ cursor: 'pointer' }}
                onClick={() => abrirLoja(lojista.id)}
              >
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
                <div
                  className="cta"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    topSinal ? executarSinal(lojista.id, topSinal) : abrirLoja(lojista.id)
                  }}
                >
                  {topSinal ? sinalCta[topSinal.kind] : 'Atender esta loja'} →
                </div>
              </div>
            ))}
          </div>
      </div>

      {oportunidadeToast && (
        <Toast title="Reposição sugerida" sub={oportunidadeToast} onClose={() => setOportunidadeToast(null)} />
      )}
    </div>
  )
}
