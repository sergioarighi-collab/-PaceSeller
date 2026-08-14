import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { OrderSidebar } from '../../components/desktop/OrderSidebar'
import { useAppStore } from '../../lib/store'
import { products } from '../../lib/data'
import { formatBRL } from '../../lib/format'

const filters = ['Recomendado p/ você', 'Alto giro', 'Boa margem', 'Lançamentos']

function applyFilter(list: typeof products, filter: string, query: string) {
  let out = list
  if (filter === 'Alto giro') out = out.filter((p) => p.restockDays <= 32)
  else if (filter === 'Boa margem')
    out = out.filter((p) => p.badges.some((b) => b.label.startsWith('Margem') && Number(b.label.replace(/\D/g, '')) >= 42))
  else if (filter === 'Lançamentos') out = out.filter((p) => p.badges.some((b) => b.tone === 'premium'))

  if (query.trim()) {
    const q = query.trim().toLowerCase()
    out = out.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }
  return out
}

const badgeToneClass: Record<string, string> = {
  positive: 'pos',
  risk: 'risk',
  info: 'info',
  neutral: 'neutral',
  premium: 'info',
}

export function Catalog() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [filter, setFilter] = useState(filters[0])
  const [query, setQuery] = useState('')
  const toggleCart = useAppStore((s) => s.toggleCart)
  const isInCart = useAppStore((s) => s.isInCart)
  const addToCart = useAppStore((s) => s.addToCart)

  const selectedProduct = products.find((p) => p.id === id)

  if (selectedProduct) {
    const p = selectedProduct
    const inCart = isInCart(p.id)
    const margin = Math.round(((p.pricePdv - p.priceFactory) / p.pricePdv) * 100)
    return (
      <DesktopPage>
        <WebTopNav />
        <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: 'Catálogo', to: '/catalogo' }, { label: p.name }]} />
        <div className="web-app-layout">
          <div className="web-content" style={{ display: 'flex', gap: 40 }}>
            <div style={{ width: 420, flexShrink: 0 }}>
              <div
                style={{
                  height: 420,
                  background: 'linear-gradient(155deg,var(--surface-3),var(--surface-2))',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="#C7C9CF" strokeWidth="1.1">
                  <path d="M3 15c0-1 1-1.6 2-2l3-1.4c1-.5 1.6-1.4 2-2.3.4-1 1.2-1.3 2-1 .8.4 1.6 1.6 3 2.3 1.2.6 3 .7 4.4 1 1 .2 1.6.9 1.6 1.9v2.3c0 .7-.5 1.2-1.2 1.2H4.2C3.5 17 3 16.5 3 15.8Z" />
                </svg>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {p.category} · {p.reference}
              </div>
              <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>{p.name}</h1>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--text-primary)', fontWeight: 600 }}>
                  {formatBRL(p.priceFactory)}{' '}
                  <span style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 400 }}>fábrica</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--positive)', fontWeight: 500, marginTop: 2 }}>
                  PDV sugerido: {formatBRL(p.pricePdv)} (+{formatBRL(p.pricePdv - p.priceFactory)} · {margin}%)
                </div>
              </div>

              <div className="whybox" style={{ margin: '24px 0 0', maxWidth: 520 }}>
                <div className="title">Por que comprar este produto</div>
                {p.why.slice(0, 4).map((w, i) => (
                  <div className="checkline" key={i}>
                    <span className="ck">✓</span>
                    {w}
                  </div>
                ))}
              </div>

              <div className="repobanner" style={{ margin: '16px 0 0', maxWidth: 520 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
                  <path d="M3 8l9 5 9-5M12 13v8" />
                </svg>
                Reposição recomendada em {p.restockDays} dias
              </div>

              <div className="gradebox" style={{ margin: '24px 0 0' }}>
                <div className="title">Grade sugerida</div>
                <div className="sizerow">
                  {p.suggestedSizes.map((s) => (
                    <div className={`sizechip ${s.suggested ? 'on' : ''}`} key={s.size}>
                      {s.size}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', maxWidth: 520 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-tertiary)', marginBottom: 12 }}>
                  Como você quer seguir?
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div
                    className="btn-primary"
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => {
                      if (!inCart) addToCart(p.id, 12)
                      navigate('/carrinhos')
                    }}
                  >
                    {inCart ? 'No carrinho ✓ — ver carrinho' : 'Adicionar ao carrinho'}
                  </div>
                  <div className="btn-secondary" style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate('/planejamento')}>
                    Adicionar ao planejamento
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 10 }}>
                  Carrinho: compra imediata deste item · Planejamento: monta um mix completo antes de decidir quantidade
                </div>
              </div>
            </div>
          </div>

          <OrderSidebar nudges={[`Esse produto já tem <b>alta recompra</b> na sua loja — bom pra fechar o mix`]} />
        </div>
      </DesktopPage>
    )
  }

  const filteredProducts = applyFilter(products, filter, query)

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: 'Catálogo Inteligente' }]} />
      <div className="web-app-layout">
        <div className="web-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Catálogo Inteligente</h1>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                {products.length} produtos · ordenado por recomendado pra você
              </div>
            </div>
          </div>

          <div className="filterbar">
            <div className="searchbox">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos"
                style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', font: 'inherit', color: 'inherit' }}
              />
            </div>
            {filters.map((f) => (
              <div key={f} className={`chip ${filter === f ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter(f)}>
                {f}
              </div>
            ))}
          </div>

          <div className="catgrid-web">
            {filteredProducts.map((p) => {
              const inCart = isInCart(p.id)
              const margin = Math.round(((p.pricePdv - p.priceFactory) / p.pricePdv) * 100)
              const contextBadge = p.badges.find((b) => b.tone === 'premium')?.label ?? (p.restockDays <= 32 ? 'Alto giro' : null)
              return (
                <div className="pcard-web" key={p.id}>
                  <div className="pw-thumb" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalogo/${p.id}`)}>
                    {contextBadge && <div className="pw-instock">{contextBadge}</div>}
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
                      {p.badges.slice(0, 2).map((b, i) => (
                        <span className={`badge ${badgeToneClass[b.tone]}`} key={i}>
                          {b.label}
                        </span>
                      ))}
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
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', padding: '64px 0' }}>Nenhum produto encontrado</div>
          )}
        </div>

        <OrderSidebar />
      </div>
    </DesktopPage>
  )
}
