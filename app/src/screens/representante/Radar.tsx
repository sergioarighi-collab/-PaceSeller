import { useNavigate } from 'react-router-dom'
import { RepTopNav } from '../../components/desktop/RepTopNav'
import { useAppStore, lojistaSinais } from '../../lib/store'

// Radar do representante (set/2026) — diferente da Carteira (lista completa de lojistas), o Radar
// é só sobre priorização: cruza os carrinhos/pedidos de cada lojista com 3 sinais (pedido aguardando
// aprovação, loja sem visita recente, item de pedido aberto com estoque limitado — ver
// lojistaSinais em store.ts) e mostra só quem precisa de ação agora. Pedido do usuário: o Radar
// entra geral (carteira inteira), e é dali que ele escolhe o lojista específico — a entrada na
// "loja" (modo lojista, com Catálogo/carrinho no contexto dele) ainda não existe, ver
// guia-dev-frontend.md.
export function RepRadar() {
  const navigate = useNavigate()
  const lojistas = useAppStore((s) => s.lojistas)

  const comSinais = lojistas.map((lojista) => ({ lojista, sinais: lojistaSinais(lojista) })).filter((x) => x.sinais.length > 0)
  const totalSinais = comSinais.reduce((sum, x) => sum + x.sinais.length, 0)
  const aguardandoCount = comSinais.reduce((sum, x) => sum + x.sinais.filter((s) => s.kind === 'revisao').length, 0)
  const semVisitaCount = comSinais.reduce((sum, x) => sum + x.sinais.filter((s) => s.kind === 'visita').length, 0)
  const estoqueCount = comSinais.reduce((sum, x) => sum + x.sinais.filter((s) => s.kind === 'estoque').length, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <RepTopNav />

      <div className="web-hero-band">
        <div className="whgreet">Bom dia, Ana</div>
        <h1>{comSinais.length > 0 ? `${comSinais.length} loja${comSinais.length > 1 ? 's' : ''} precisam de atenção` : 'Sua carteira está em dia'}</h1>
        <div className="whsub">
          {totalSinais > 0
            ? `${totalSinais} pendências no total, priorizadas pra você agir hoje`
            : `${lojistas.length} lojas na carteira, nenhuma pendência agora`}
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

        {comSinais.length === 0 ? (
          <div style={{ marginTop: 32, padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            Nenhuma loja precisa de atenção agora — veja a carteira completa em "Carteira".
          </div>
        ) : (
          <div className="cartlist" style={{ maxWidth: 900, marginTop: 20 }}>
            {comSinais.map(({ lojista, sinais }) => (
              <div className="cart-card" key={lojista.id}>
                <div className="cc-top">
                  <div>
                    <div className="cc-name">{lojista.name}</div>
                    <div className="cc-meta">
                      {lojista.city} · {lojista.contactName}
                    </div>
                  </div>
                  <div className="btn-secondary" style={{ width: 140, cursor: 'pointer' }} onClick={() => navigate('/rep/carteira')}>
                    Ver na carteira
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {sinais.map((sinal, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-primary)' }}>
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
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
