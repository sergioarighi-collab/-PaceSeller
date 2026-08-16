import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { OrderSidebar } from '../../components/desktop/OrderSidebar'
import { ProductThumb } from '../../components/desktop/ProductThumb'
import { ProductLineCard } from '../../components/desktop/ProductLineCard'
import { useAppStore } from '../../lib/store'
import { products } from '../../lib/data'
import { formatBRL } from '../../lib/format'

const filters = ['Recomendado p/ você', 'Alto giro', 'Boa margem', 'Lançamentos']

const contextConfig = {
  benchmark: {
    chip: 'Benchmark: lojas parecidas',
    bannerIcon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 4 5-6" />
      </svg>
    ),
    bannerTitle: 'Comparando com lojas parecidas com a sua',
    bannerSub: 'Mesma faixa de porte e região — essas lojas venderam 30% mais destes produtos no último mês',
    heading: '6 produtos em alta entre lojas parecidas com a sua',
    productIds: ['2101-30', '1901-67', '2601-01'],
    cardBadge: '+30% nessas lojas',
    sidebarNudge: 'Essas lojas parecidas com a sua já compraram esses itens — pode ser um bom sinal pra você também',
  },
  reposicao: {
    chip: 'Reposição necessária',
    bannerIcon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19V10M11 19V5M18 19v-6" />
      </svg>
    ),
    bannerTitle: 'Produtos com reposição necessária',
    bannerSub: '3 produtos vendendo mais rápido que a reposição atual — quantidade sugerida já calculada por item',
    heading: '3 produtos precisam de reposição',
    productIds: ['1901-06', '1901-67', '2304-01'],
    cardBadge: null,
    sidebarNudge: 'Adicionar esses itens de reposição resolve o alerta do seu radar de hoje',
    coverage: { '1901-06': '12 dias', '1901-67': '8 dias', '2304-01': '15 dias' } as Record<string, string>,
    suggestion: { '1901-06': '32 unidades', '1901-67': '18 unidades', '2304-01': '60 unidades' } as Record<string, string>,
  },
} as const

type ContextKey = keyof typeof contextConfig

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

// Agrupa as cores de uma mesma linha (ex: as 10 cores de Coil) num único card com seletor de
// cor, marcando a de melhor performance — em vez de um card por cor no grid.
function buildProductLines(list: typeof products) {
  const order: string[] = []
  const byCollection = new Map<string, typeof products>()
  for (const p of list) {
    if (!byCollection.has(p.collection)) {
      byCollection.set(p.collection, [])
      order.push(p.collection)
    }
    byCollection.get(p.collection)!.push(p)
  }
  return order.map((collection) => {
    const colors = byCollection.get(collection)!
    const bestSellerId = colors.reduce((a, b) => (b.growthPct > a.growthPct ? b : a)).id
    return { collection, colors, bestSellerId }
  })
}

function applyLineFilter(lines: ReturnType<typeof buildProductLines>, filter: string, query: string) {
  return lines
    .map((line) => {
      const matching = applyFilter(line.colors, filter, query)
      if (matching.length === 0) return null
      const defaultId = matching.some((c) => c.id === line.bestSellerId) ? line.bestSellerId : matching[0].id
      return { ...line, defaultId }
    })
    .filter((l): l is NonNullable<typeof l> => l !== null)
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
  const [searchParams, setSearchParams] = useSearchParams()
  const contextKey = searchParams.get('contexto') as ContextKey | null
  const context = contextKey && contextConfig[contextKey] ? contextConfig[contextKey] : null
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
                  background: 'var(--surface-2)',
                  padding: 16,
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--surface)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <ProductThumb src={p.image} alt={p.name} iconSize={140} />
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                    PDV sugerido {formatBRL(p.pricePdv)}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--positive)',
                      background: 'var(--positive-dim)',
                      padding: '3px 9px',
                      borderRadius: 4,
                    }}
                  >
                    +{margin}% sobre a fábrica
                  </span>
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

  const filteredProducts = context
    ? context.productIds.map((pid) => products.find((p) => p.id === pid)).filter((p): p is (typeof products)[number] => Boolean(p))
    : []
  const productLines = context ? [] : applyLineFilter(buildProductLines(products), filter, query)

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: 'Catálogo Inteligente' }]} />

      {context && (
        <div className="context-banner">
          <div className="cb-icon" style={contextKey === 'reposicao' ? { background: 'var(--risk-dim)', color: 'var(--risk)' } : undefined}>
            {context.bannerIcon}
          </div>
          <div>
            <div className="cb-title">{context.bannerTitle}</div>
            <div className="cb-sub">{context.bannerSub}</div>
          </div>
          <div
            className="cb-clear"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              searchParams.delete('contexto')
              setSearchParams(searchParams)
            }}
          >
            Limpar filtro ×
          </div>
        </div>
      )}

      <div className="web-app-layout">
        <div className="web-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Catálogo Inteligente</h1>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                {context ? context.heading : `${productLines.length} linhas de produto · ordenado por recomendado pra você`}
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
            {context ? (
              <div className="chip selected">{context.chip}</div>
            ) : (
              filters.map((f) => (
                <div key={f} className={`chip ${filter === f ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter(f)}>
                  {f}
                </div>
              ))
            )}
            {context && <div className="chip">Alto giro</div>}
            {context && <div className="chip">Boa margem</div>}
          </div>

          <div className="catgrid-web">
            {context
              ? filteredProducts.map((p) => {
                  const inCart = isInCart(p.id)
                  const margin = Math.round(((p.pricePdv - p.priceFactory) / p.pricePdv) * 100)
                  const contextBadge =
                    context?.cardBadge ??
                    p.badges.find((b) => b.tone === 'premium')?.label ??
                    (p.restockDays <= 32 ? 'Alto giro' : null)
                  const coverage = contextKey === 'reposicao' ? contextConfig.reposicao.coverage[p.id] : null
                  const suggestion = contextKey === 'reposicao' ? contextConfig.reposicao.suggestion[p.id] : null
                  return (
                    <div className="pcard-web" key={p.id}>
                      <div className="pw-thumb" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalogo/${p.id}`)}>
                        {coverage ? (
                          <div className="pw-instock" style={{ background: 'var(--risk)' }}>
                            Cobertura {coverage}
                          </div>
                        ) : (
                          contextBadge && <div className="pw-instock">{contextBadge}</div>
                        )}
                        <ProductThumb src={p.image} alt={p.name} />
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
                          <div className="pw-pdvrow">
                            <span className="pw-pdvlabel">PDV sugerido {formatBRL(p.pricePdv)}</span>
                            <span className="pw-margintag">+{margin}% sobre a fábrica</span>
                          </div>
                        </div>
                        <div className="pw-badgerow">
                          {suggestion ? (
                            <span className="badge risk">Sugestão: {suggestion}</span>
                          ) : (
                            p.badges.slice(0, 2).map((b, i) => (
                              <span className={`badge ${badgeToneClass[b.tone]}`} key={i}>
                                {b.label}
                              </span>
                            ))
                          )}
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
                })
              : productLines.map((line) => (
                  <ProductLineCard key={line.collection} colors={line.colors} bestSellerId={line.bestSellerId} defaultId={line.defaultId} />
                ))}
          </div>
          {(context ? filteredProducts.length === 0 : productLines.length === 0) && (
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', padding: '64px 0' }}>Nenhum produto encontrado</div>
          )}
        </div>

        <OrderSidebar nudges={context ? [context.sidebarNudge] : undefined} />
      </div>
    </DesktopPage>
  )
}
