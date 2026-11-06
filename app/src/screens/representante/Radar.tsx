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

// "Agendar visita" (até nov/2026) prometia uma agenda/calendário que não existe nesse protótipo —
// o clique só abria o catálogo da loja, igual a qualquer outro sinal sem ação de sistema por trás.
// Renomeado pra "Preparar visita": mesmo destino, rótulo honesto sobre o que de fato acontece
// (pedido do usuário: todo botão do Radar precisa levar pra algum lugar que faça sentido com o que
// promete).
const sinalCta: Record<LojistaSinal['kind'], string> = {
  revisao: 'Revisar pedido',
  estoque: 'Sugerir reposição',
  visita: 'Preparar visita',
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
  const aprovarPedidosEmLote = useAppStore((s) => s.aprovarPedidosEmLote)
  // 'todas' (nov/2026, "Radar em widgets") é o padrão agora — sem o filtro de loja de antes (a
  // lista inteira já fica visível no próprio widget "Carteira", pivotar por 1 loja específica é só
  // clicar na linha dela), um período sozinho (ex: só "Hoje") escondia lojas com pendência pra
  // depois sem necessidade; "Todas" mostra a carteira inteira de cara, os outros filtram por prazo.
  const [timeframeFiltro, setTimeframeFiltro] = useState<SinalTimeframe | 'todas'>('todas')
  const [oportunidadeToast, setOportunidadeToast] = useState<string | null>(null)
  const [aprovarToast, setAprovarToast] = useState<string | null>(null)

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

  // Ação em lote pra carteira INTEIRA (nov/2026, pedido do usuário: "levar as ações em lote pra
  // carteira inteira" — antes esse banner só existia dentro de Meus Carrinhos de UMA loja já
  // aberta; pra aprovar pedidos de lojas diferentes ela precisava entrar em cada uma). Achatado a
  // partir de `ranqueada` (já calculado ao vivo acima) — cada item carrega o `lojista` junto porque
  // `aprovarPedidosEmLote` precisa saber de qual loja é cada `cartId` (carrinhos de lojas
  // diferentes convivem em coleções separadas do store, ver nota em store.ts).
  const pendenciasAprovacao = ranqueada.flatMap(({ lojista, sinais }) =>
    sinais.filter((sinal) => sinal.kind === 'revisao' && sinal.cartId).map((sinal) => ({ lojista, sinal })),
  )

  function aprovarTodasPendencias() {
    if (pendenciasAprovacao.length === 0) return
    aprovarPedidosEmLote(pendenciasAprovacao.map((p) => ({ lojistaId: p.lojista.id, carrinhoId: p.sinal.cartId! })))
    setAprovarToast(
      pendenciasAprovacao.length > 1 ? `${pendenciasAprovacao.length} pedidos aprovados` : '1 pedido aprovado',
    )
  }

  const visiveis = ranqueada.filter((x) => {
    if (timeframeFiltro === 'todas') return true
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
  // - 'estoque': joga o produto num carrinho novo (`sugerirReposicao` em store.ts) e abre esse
  //   carrinho — nasce `rascunho` (nov/2026: antes nascia já `aguardando`, enviada sem ela ver;
  //   pedido do usuário, "levar para o carrinho... para revisar e encaminhar para o lojista"), ela
  //   revisa e só então compartilha de fato pelo toggle "Compartilhar com {lojista}" que já existe
  //   ali (ver `compartilharCarrinho`).
  // - 'parado' (adaptado do inventário "Radar Integrado pro Varejista"): mesmo destino de 'revisao'
  //   — o carrinho já existe, só precisa de uma olhada/empurrão, não de uma ação de sistema nova.
  // - 'visita': não tem um carrinho/produto por trás, é um sinal sobre a loja como um todo — não dá
  //   pra "executar" sozinho, então abre a loja no catálogo pra o representante decidir o que levar
  //   (CTA "Preparar visita", não "Agendar" — não existe agenda/calendário nesse protótipo).
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
        {/* "Aguardando você" + "Oportunidade na carteira" (nov/2026, "Radar em widgets" — testado
            antes como protótipo visual, pedido do usuário, aprovado) — substituem os banners de
            largura total de antes (`.bulkbar`/`.opp-banner`) por 2 widgets lado a lado, mais
            contidos. Só 1 coluna quando só 1 dos dois existe, pra não esticar sozinho numa grade de
            2 colunas. */}
        {(pendenciasAprovacao.length > 0 || oportunidade) && (
          <div
            className={`radar-widgets ${pendenciasAprovacao.length > 0 && oportunidade ? 'two-col' : ''}`}
            style={!(pendenciasAprovacao.length > 0 && oportunidade) ? { gridTemplateColumns: '1fr' } : undefined}
          >
            {pendenciasAprovacao.length > 0 && (
              <div className="radar-widget">
                <div className="radar-widget-head">
                  <span className="rw-title">Aguardando você</span>
                  <span className="rw-count tone-info">{pendenciasAprovacao.length}</span>
                </div>
                {/* Ação por linha LEVA pro carrinho (mesma coisa que o corpo da linha já faz, ver
                    `executarSinal`), não aprova direto — ela só deve aprovar sem olhar o pedido
                    pelo atalho explícito de baixo ("Aprovar todos", em lote, pensado pra quando ela
                    já confia e só quer liberar tudo de uma vez). Aprovar 1 de cada vez sem entrar no
                    pedido não fazia sentido como ação individual (nov/2026, pedido do usuário). */}
                {pendenciasAprovacao.map(({ lojista, sinal }) => (
                  <div className="radar-widget-row" key={sinal.cartId} onClick={() => executarSinal(lojista.id, sinal)}>
                    <div className="radar-widget-icon tone-info" style={{ width: 30, height: 30, borderRadius: 7 }}>
                      <SinalIcon kind="revisao" />
                    </div>
                    <div className="rw-info">
                      <div className="rw-name">{sinal.text}</div>
                      <div className="rw-meta">{lojista.name}</div>
                    </div>
                    <span
                      className="rw-action"
                      onClick={(e) => {
                        e.stopPropagation()
                        executarSinal(lojista.id, sinal)
                      }}
                    >
                      Revisar pedido →
                    </span>
                  </div>
                ))}
                <div className="radar-widget-footer-cta" onClick={aprovarTodasPendencias}>
                  Aprovar tod{pendenciasAprovacao.length > 1 ? 'os' : 'o'} →
                </div>
              </div>
            )}

            {/* Produto de maior crescimento que bate o critério (ver `carteiraOportunidade` em
                store.ts) — some sozinho depois de sugerir, os lojistas contemplados passam a ter o
                produto num carrinho. */}
            {oportunidade && (
              <div className="radar-widget tone-black">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff">
                    <path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.9 5.6 21.7l1.7-7.3-5.6-4.9 7.4-.6L12 2z" />
                  </svg>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', color: 'rgba(255,255,255,.6)' }}>
                    Oportunidade na carteira
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 700 }}>{oportunidade.product.name}</div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.72)', marginTop: 6 }}>
                  Alta demanda — {oportunidade.lojistasSemProduto.length} loja{oportunidade.lojistasSemProduto.length > 1 ? 's' : ''} da sua carteira
                  ainda não {oportunidade.lojistasSemProduto.length > 1 ? 'têm' : 'tem'} esse produto
                </p>
                <div className="opp-lojas" style={{ marginTop: 12 }}>
                  {oportunidade.lojistasSemProduto.map((l) => (
                    <span className="opp-lojapill" key={l.id}>
                      {l.name}
                    </span>
                  ))}
                </div>
                <div className="radar-widget-footer-cta" style={{ color: '#fff' }} onClick={sugerirOportunidadeParaCarteira}>
                  Sugerir pras {oportunidade.lojistasSemProduto.length} lojas →
                </div>
              </div>
            )}
          </div>
        )}

        {/* Widget "Carteira" — a lista inteira de lojas, filtro de período embutido no próprio
            cabeçalho em vez de uma barra de filtro à parte (nov/2026, "Radar em widgets"). Cada
            linha reaproveita `SinalIcon` (mesmo ícone por tipo de sinal que `LojistaGate.tsx` já
            usava) — mesma informação dos cards cheios de antes, só compacta. */}
        <div className="radar-widget" style={{ marginTop: 16 }}>
          <div className="radar-widget-head">
            <span className="rw-title">Carteira</span>
            <div className="rw-filters">
              <span
                className={`chip ${timeframeFiltro === 'todas' ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setTimeframeFiltro('todas')}
              >
                Todas
              </span>
              {timeframeOrder.map((tf) => (
                <span
                  key={tf}
                  className={`chip ${timeframeFiltro === tf ? 'selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTimeframeFiltro(tf)}
                >
                  {timeframeLabel[tf]} <span className="n">{porPeriodo(tf).length}</span>
                </span>
              ))}
            </div>
          </div>

          {visiveis.map(({ lojista, topSinal }) => (
            // Linha abre a loja direto, botão de ação executa o sinal (set/2026, achado testando:
            // clicar achando que ia só "ver a loja" disparava a ação do sinal de estoque sem avisar)
            // — mesmo padrão "linha abre, botão age" de sempre.
            <div className="radar-widget-row" key={lojista.id} onClick={() => abrirLoja(lojista.id)}>
              <div className={`radar-widget-icon tone-${topSinal ? topSinal.tone : 'positive'}`} style={{ width: 30, height: 30, borderRadius: 7 }}>
                <SinalIcon kind={topSinal?.kind ?? 'empty'} />
              </div>
              <div className="rw-info">
                <div className="rw-name">{lojista.name}</div>
                <div className="rw-meta">
                  {lojista.city} · {topSinal ? topSinal.text : 'Tudo em dia — nenhuma pendência agora'}
                </div>
              </div>
              <span
                className="rw-action"
                onClick={(e) => {
                  e.stopPropagation()
                  topSinal ? executarSinal(lojista.id, topSinal) : abrirLoja(lojista.id)
                }}
              >
                {topSinal ? sinalCta[topSinal.kind] : 'Atender esta loja'} →
              </span>
            </div>
          ))}
        </div>
      </div>

      {oportunidadeToast && (
        <Toast title="Reposição sugerida" sub={oportunidadeToast} onClose={() => setOportunidadeToast(null)} />
      )}
      {aprovarToast && <Toast title={aprovarToast} sub="O lojista já pode pagar quando quiser" onClose={() => setAprovarToast(null)} />}
    </div>
  )
}
