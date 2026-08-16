import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { OrderSidebar } from '../../components/desktop/OrderSidebar'
import { useAppStore } from '../../lib/store'
import { products } from '../../lib/data'
import { formatBRL } from '../../lib/format'

const fusionProductIds = ['2601-02', '2601-03', '2601-04']

export function Colecao() {
  const navigate = useNavigate()
  const toggleCart = useAppStore((s) => s.toggleCart)
  const isInCart = useAppStore((s) => s.isInCart)
  const fusionProducts = fusionProductIds.map((id) => products.find((p) => p.id === id)).filter((p): p is (typeof products)[number] => Boolean(p))

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
          <div className="catgrid-web">
            {fusionProducts.map((p) => {
              const inCart = isInCart(p.id)
              const margin = Math.round(((p.pricePdv - p.priceFactory) / p.pricePdv) * 100)
              return (
                <div className="pcard-web" key={p.id}>
                  <div className="pw-thumb" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalogo/${p.id}`)}>
                    <div className="pw-instock">Lançamento</div>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#B0B3BA" strokeWidth="1.2">
                      <path d="M3 15c0-1 1-1.6 2-2l3-1.4c1-.5 1.6-1.4 2-2.3.4-1 1.2-1.3 2-1 .8.4 1.6 1.6 3 2.3 1.2.6 3 .7 4.4 1 1 .2 1.6.9 1.6 1.9v2.3c0 .7-.5 1.2-1.2 1.2H4.2C3.5 17 3 16.5 3 15.8Z" />
                    </svg>
                  </div>
                  <div className="pw-body">
                    <div className="pw-name" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalogo/${p.id}`)}>
                      {p.name}
                    </div>
                    <div className="pw-priceblock">
                      <div className="pw-pricemain">
                        {formatBRL(p.priceFactory)}
                        <span className="pw-tax-tag">fábrica</span>
                      </div>
                      <div className="pw-pricesub">
                        PDV sugerido: {formatBRL(p.pricePdv)} (+{formatBRL(p.pricePdv - p.priceFactory)} · {margin}%)
                      </div>
                    </div>
                    <div className="pw-badgerow">
                      <span className="badge info">Novo</span>
                    </div>
                    <div
                      className={`pw-addbtn ${inCart ? 'in-cart' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleCart(p.id)}
                    >
                      {inCart ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          No carrinho
                        </>
                      ) : (
                        'Adicionar ao carrinho'
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <OrderSidebar nudges={['Nenhum item dessa coleção está no seu pedido ainda']} />
      </div>
    </DesktopPage>
  )
}
