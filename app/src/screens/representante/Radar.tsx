import { useNavigate } from 'react-router-dom'
import { RepTopNav } from '../../components/desktop/RepTopNav'
import { useAppStore, lojistaSinais } from '../../lib/store'
import type { LojistaSinal } from '../../lib/store'

// Peso de cada sinal pra ranquear a carteira (set/2026) — pedido aguardando aprovação é o mais
// urgente (trava uma venda), depois estoque (o produto pode acabar antes de agir), depois visita
// (importante, mas sem prazo tão apertado). Não é ciência exata, é só pra ordenar a lista de forma
// que o que mais importa apareça primeiro — ver "Radar vira a carteira inteira" no
// guia-dev-frontend.md.
const PESO_SINAL: Record<LojistaSinal['kind'], number> = { revisao: 3, estoque: 2, visita: 1 }

function pontuacao(sinais: LojistaSinal[]): number {
  return sinais.reduce((sum, s) => sum + PESO_SINAL[s.kind], 0)
}

// Radar do representante (set/2026) — pedido do usuário: precisa trazer a carteira INTEIRA (não só
// quem tem pendência, diferente da versão anterior), ranqueada por prioridade, com insights e uma
// ação de execução por sinal. Clicar numa ação já seleciona o lojista e entra direto no contexto
// dele (ver `enterLojista` em store.ts) — "modo loja". Sem clicar em nada, o lojista só é escolhido
// manualmente ao entrar no Catálogo pela nav (ver LojistaGate.tsx).
export function RepRadar() {
  const navigate = useNavigate()
  const lojistas = useAppStore((s) => s.lojistas)
  const enterLojista = useAppStore((s) => s.enterLojista)

  const ranqueada = lojistas
    .map((lojista) => ({ lojista, sinais: lojistaSinais(lojista) }))
    .sort((a, b) => pontuacao(b.sinais) - pontuacao(a.sinais))

  const comSinais = ranqueada.filter((x) => x.sinais.length > 0)
  const totalSinais = comSinais.reduce((sum, x) => sum + x.sinais.length, 0)
  const aguardandoCount = comSinais.reduce((sum, x) => sum + x.sinais.filter((s) => s.kind === 'revisao').length, 0)
  const semVisitaCount = comSinais.reduce((sum, x) => sum + x.sinais.filter((s) => s.kind === 'visita').length, 0)
  const estoqueCount = comSinais.reduce((sum, x) => sum + x.sinais.filter((s) => s.kind === 'estoque').length, 0)

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
        <div className="whsub">
          {lojistas.length} lojas na carteira
          {totalSinais > 0 ? ` · ${totalSinais} pendências priorizadas pra você agir hoje` : ', nenhuma pendência agora'}
        </div>
      </div>

      <div className="web-main">
        <div className="stattiles">
          <div className="tile">
            <div className="tlabel">Aguardando aprovação</div>
            <div className="tval" style={{ color: aguardandoCount > 0 ? 'var(--info)' : undefined }}>
              {aguardandoCount}
            </div>
          </div>
          <div className="tile">
            <div className="tlabel">Sem visita recente</div>
            <div className="tval" style={{ color: semVisitaCount > 0 ? 'var(--risk)' : undefined }}>
              {semVisitaCount}
            </div>
          </div>
          <div className="tile">
            <div className="tlabel">Estoque limitado</div>
            <div className="tval" style={{ color: estoqueCount > 0 ? 'var(--risk)' : undefined }}>
              {estoqueCount}
            </div>
          </div>
        </div>

        <div className="cartlist" style={{ maxWidth: 900, marginTop: 20 }}>
          {ranqueada.map(({ lojista, sinais }) => (
            <div className="cart-card" key={lojista.id}>
              <div className="cc-top">
                <div>
                  <div className="cc-name">{lojista.name}</div>
                  <div className="cc-meta">
                    {lojista.city} · {lojista.contactName}
                  </div>
                </div>
                <div className="btn-secondary" style={{ width: 140, cursor: 'pointer' }} onClick={() => abrirLoja(lojista.id)}>
                  Atender esta loja
                </div>
              </div>

              {sinais.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 12 }}>
                  <span className="ck" style={{ background: 'var(--positive-dim)', color: 'var(--positive)' }}>
                    ✓
                  </span>
                  Tudo em dia — nenhuma pendência agora
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {sinais.map((sinal, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-primary)' }}>
                        <span
                          className="ck"
                          style={{
                            background: sinal.tone === 'risk' ? 'var(--risk-dim)' : 'var(--info-dim)',
                            color: sinal.tone === 'risk' ? 'var(--risk)' : 'var(--info)',
                          }}
                        >
                          {sinal.tone === 'risk' ? '!' : 'i'}
                        </span>
                        {sinal.text}
                      </div>
                      <span
                        className="miniaction"
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => executarSinal(lojista.id, sinal)}
                      >
                        {sinal.kind === 'revisao' ? 'Revisar pedido' : sinal.kind === 'estoque' ? 'Falar agora' : 'Agendar visita'} →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
