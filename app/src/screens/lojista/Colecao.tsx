import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { ProductLineCard } from '../../components/desktop/ProductLineCard'
import { products } from '../../lib/data'

const fusionProductIds = ['2601-02', '2601-03', '2601-04']

export function Colecao() {
  const fusionProducts = fusionProductIds.map((id) => products.find((p) => p.id === id)).filter((p): p is (typeof products)[number] => Boolean(p))
  const bestSellerId = fusionProducts.reduce((a, b) => (b.growthPct > a.growthPct ? b : a)).id

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: 'Linha Fusion' }]} />
      <div className="web-app-layout">
        <div className="web-content">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
            <span className="tag-black">Lançamento</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-tertiary)' }}>Disponível desde 2 de julho</span>
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginTop: 10 }}>Linha Fusion</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 8, maxWidth: 520, lineHeight: 1.6 }}>
            Ainda não chegou no seu mix. 6 lojas com perfil parecido com o seu já compraram — a linha está performando acima
            da média em regiões similares à sua.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 22, maxWidth: 640 }}>
            <div className="tile">
              <div className="tlabel">Produtos</div>
              <div className="tval">8</div>
            </div>
            <div className="tile">
              <div className="tlabel">Lojas parecidas compraram</div>
              <div className="tval">6</div>
            </div>
            <div className="tile">
              <div className="tlabel">Margem média</div>
              <div className="tval">41%</div>
            </div>
          </div>

          <div className="web-section-title">Produtos da linha</div>
          <div style={{ background: 'var(--surface-2)', padding: 20, borderRadius: 8, maxWidth: 340 }}>
            <ProductLineCard colors={fusionProducts} bestSellerId={bestSellerId} />
          </div>
        </div>
      </div>
    </DesktopPage>
  )
}
