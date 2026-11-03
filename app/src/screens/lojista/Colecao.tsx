import { useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { ProductLineCard } from '../../components/desktop/ProductLineCard'
import { products, collectionTitle, collectionMeta } from '../../lib/data'

// Slug da URL <-> chave da coleção (ex: 'tg-ii' <-> 'TG II') derivado de `collectionTitle`, não uma
// 2ª lista mantida à mão — cobre qualquer coleção nova adicionada em `data.ts` de graça.
function collectionSlug(key: string): string {
  return key.toLowerCase().replace(/\s+/g, '-')
}

// Página de uma coleção, genérica por `:collectionId` (nov/2026, ajuste de realismo da lista do
// handoff — antes era hardcoded pra Fusion: productIds fixos, rota fixa `/colecoes/fusion`, texto
// de lançamento sempre presente mesmo que a coleção não fosse um lançamento de verdade). O único
// link que leva aqui hoje (`screens/lojista/Radar.tsx`, CTA "Ver coleção") continua apontando pra
// Fusion — é a única coleção com o badge "Lançamento" no mock —, mas a página em si não assume mais
// isso: funciona pra qualquer `collectionId` de `collectionTitle`.
export function Colecao() {
  const { collectionId } = useParams()
  const collectionKey = Object.keys(collectionTitle).find((k) => collectionSlug(k) === collectionId) as keyof typeof collectionTitle | undefined
  const collectionProducts = collectionKey ? products.filter((p) => p.collection === collectionKey) : []
  // `isNewLaunch` é da LINHA inteira (collectionMeta), não do badge "Lançamento" por produto (esse
  // marca uma cor/peça específica como edição limitada — várias linhas têm, não só a recém-lançada).
  const isLaunch = collectionKey ? Boolean(collectionMeta[collectionKey].isNewLaunch) : false
  const growthMedio =
    collectionProducts.length > 0 ? Math.round(collectionProducts.reduce((sum, p) => sum + p.growthPct, 0) / collectionProducts.length) : 0
  const bestSellerId = collectionProducts.length > 0 ? collectionProducts.reduce((a, b) => (b.growthPct > a.growthPct ? b : a)).id : undefined

  const title = collectionKey ? `Linha ${collectionTitle[collectionKey]}` : 'Coleção'

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: title }]} />
      <div className="web-app-layout">
        <div className="web-content">
          {collectionProducts.length === 0 ? (
            <div style={{ marginTop: 40, fontSize: 13.5, color: 'var(--text-secondary)' }}>Coleção não encontrada.</div>
          ) : (
            <>
              {isLaunch && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
                  <span className="tag-black">Lançamento</span>
                </div>
              )}
              <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginTop: isLaunch ? 10 : 16 }}>
                {title}
              </h1>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 8, maxWidth: 520, lineHeight: 1.6 }}>
                {isLaunch
                  ? 'Ainda não chegou no seu mix — a linha está performando acima da média em regiões similares à sua.'
                  : `${collectionProducts.length} produto${collectionProducts.length > 1 ? 's' : ''} dessa linha no catálogo.`}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 22, maxWidth: 440 }}>
                <div className="tile">
                  <div className="tlabel">Produtos</div>
                  <div className="tval">{collectionProducts.length}</div>
                </div>
                <div className="tile">
                  <div className="tlabel">Crescimento médio</div>
                  <div className="tval" style={{ color: growthMedio >= 0 ? 'var(--positive)' : 'var(--risk)' }}>
                    {growthMedio >= 0 ? '+' : ''}
                    {growthMedio}%
                  </div>
                </div>
              </div>

              <div className="web-section-title">Produtos da linha</div>
              <div style={{ background: 'var(--surface-2)', padding: 20, borderRadius: 8, maxWidth: 340 }}>
                {bestSellerId && <ProductLineCard colors={collectionProducts} bestSellerId={bestSellerId} />}
              </div>
            </>
          )}
        </div>
      </div>
    </DesktopPage>
  )
}
