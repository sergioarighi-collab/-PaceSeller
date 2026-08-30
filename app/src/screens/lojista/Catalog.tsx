import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { ProductThumb } from '../../components/desktop/ProductThumb'
import { ProductLineCard } from '../../components/desktop/ProductLineCard'
import { useAppStore } from '../../lib/store'
import { products, collectionTitle, combos } from '../../lib/data'
import { formatBRL } from '../../lib/format'
import { buildProductLines, comboPrice } from '../../lib/productLines'

const categoryFilters = ['Alto giro', 'Boa margem', 'Lançamentos', 'Oportunidade perdida']
const priceFilters = ['Até R$250', 'R$250 – R$320', 'Acima de R$320']
const sizeFilters = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
// Ordem fixa (não alfabética) — cada linha nova entra no fim da lista, sem reordenar as que já
// existem; `collectionTitle` já é a fonte única do nome de exibição de cada coleção.
const collectionFilters = Object.keys(collectionTitle) as (keyof typeof collectionTitle)[]

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

// price em R$ de fábrica — os 3 baldes cobrem toda a faixa de preço do catálogo mock (R$145 a
// R$389,90), com corte nos R$250/R$320 (não é uma divisão perfeitamente equilibrada de SKUs,
// mas são valores redondos que fazem sentido pro lojista reconhecer de cabeça).
function matchesPriceFilter(p: (typeof products)[number], priceFilter: string | null) {
  if (priceFilter === 'Até R$250') return p.priceFactory <= 250
  if (priceFilter === 'R$250 – R$320') return p.priceFactory > 250 && p.priceFactory <= 320
  if (priceFilter === 'Acima de R$320') return p.priceFactory > 320
  return true
}

function matchesSizeFilter(p: (typeof products)[number], sizeFilter: string | null) {
  if (!sizeFilter) return true
  return p.suggestedSizes.some((s) => s.size === sizeFilter && s.suggested)
}

function applyFilter(
  list: typeof products,
  filter: string | null,
  priceFilter: string | null,
  sizeFilter: string | null,
  collectionFilter: string | null,
  query: string,
) {
  let out = list
  if (filter === 'Alto giro') out = out.filter((p) => p.restockDays <= 32)
  else if (filter === 'Boa margem')
    out = out.filter((p) => p.badges.some((b) => b.label.startsWith('Margem') && Number(b.label.replace(/\D/g, '')) >= 42))
  else if (filter === 'Lançamentos') out = out.filter((p) => p.badges.some((b) => b.tone === 'premium'))
  else if (filter === 'Oportunidade perdida') out = out.filter((p) => p.badges.some((b) => b.label === 'Oportunidade perdida'))

  out = out.filter((p) => matchesPriceFilter(p, priceFilter))
  out = out.filter((p) => matchesSizeFilter(p, sizeFilter))
  if (collectionFilter) out = out.filter((p) => p.collection === collectionFilter)

  if (query.trim()) {
    const q = query.trim().toLowerCase()
    out = out.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }
  return out
}

// Agrupa as cores de uma mesma linha (ex: as 10 cores de Coil) num único card com seletor de
// cor, marcando a de melhor performance — em vez de um card por cor no grid.
function applyLineFilter(
  lines: ReturnType<typeof buildProductLines>,
  filter: string | null,
  priceFilter: string | null,
  sizeFilter: string | null,
  collectionFilter: string | null,
  query: string,
) {
  return lines
    .map((line) => {
      const matching = applyFilter(line.colors, filter, priceFilter, sizeFilter, collectionFilter, query)
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
  const [filter, setFilter] = useState<string | null>(null)
  const [priceFilter, setPriceFilter] = useState<string | null>(null)
  const [sizeFilter, setSizeFilter] = useState<string | null>(null)
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const toggleCart = useAppStore((s) => s.toggleCart)
  const cartItems = useAppStore((s) => s.cartItems)
  const addToCart = useAppStore((s) => s.addToCart)
  const cartCombos = useAppStore((s) => s.cartCombos)
  const toggleCombo = useAppStore((s) => s.toggleCombo)

  const selectedProduct = products.find((p) => p.id === id)

  if (selectedProduct) {
    const p = selectedProduct
    const inCart = Boolean(cartItems[p.id])
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
                  <div className="checkline" key={i} style={i === 0 ? { fontWeight: 600 } : undefined}>
                    <span className="ck" style={i === 0 ? { background: 'var(--positive)' } : undefined}>✓</span>
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
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 10 }}>
                  Antes de fechar o carrinho, você vê como esse pedido se compara ao mesmo período do ano passado
                </div>
              </div>
            </div>
          </div>
        </div>
      </DesktopPage>
    )
  }

  const filteredProducts = context
    ? context.productIds.map((pid) => products.find((p) => p.id === pid)).filter((p): p is (typeof products)[number] => Boolean(p))
    : []
  const productLines = context ? [] : applyLineFilter(buildProductLines(products), filter, priceFilter, sizeFilter, collectionFilter, query)

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
                {context
                  ? context.heading
                  : `${productLines.length} linhas de produto${filter || priceFilter || sizeFilter || collectionFilter ? ' · filtrado' : ''}`}
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
              <>
                {categoryFilters.map((f) => (
                  <div
                    key={f}
                    className={`chip ${filter === f ? 'selected' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setFilter(filter === f ? null : f)}
                  >
                    {f}
                  </div>
                ))}
                <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
                {priceFilters.map((f) => (
                  <div
                    key={f}
                    className={`chip ${priceFilter === f ? 'selected' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPriceFilter(priceFilter === f ? null : f)}
                  >
                    {f}
                  </div>
                ))}
                <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
                {(Object.keys(contextConfig) as ContextKey[]).map((key) => (
                  <div
                    key={key}
                    className="chip"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      searchParams.set('contexto', key)
                      setSearchParams(searchParams)
                    }}
                  >
                    {contextConfig[key].chip}
                  </div>
                ))}
              </>
            )}
            {context && <div className="chip">Alto giro</div>}
            {context && <div className="chip">Boa margem</div>}
          </div>

          {!context && (
            <div className="gradebox" style={{ margin: '14px 0 0' }}>
              <div className="title">Coleção</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {collectionFilters.map((c) => (
                  <div
                    key={c}
                    className={`chip ${collectionFilter === c ? 'selected' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setCollectionFilter(collectionFilter === c ? null : c)}
                  >
                    {collectionTitle[c]}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!context && (
            <div className="gradebox" style={{ margin: '14px 0 0' }}>
              <div className="title">Numeração</div>
              <div className="sizerow">
                {sizeFilters.map((size) => (
                  <div
                    key={size}
                    className={`sizechip ${sizeFilter === size ? 'selected' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSizeFilter(sizeFilter === size ? null : size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="catgrid-web">
            {context
              ? filteredProducts.map((p) => {
                  const inCart = Boolean(cartItems[p.id])
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

          {!context && (
            <>
              <div className="web-section-title">Combos sugeridos</div>
              <div className="combogrid">
                {combos.map((combo) => {
                  const cp = comboPrice(combo, products)
                  if (!cp) return null
                  const { p1, p2, sumFactory, finalPrice, savings } = cp
                  const inCart = Boolean(cartCombos[combo.id])
                  return (
                    <div className="combocard" key={combo.id}>
                      <div className={`combo-reason ${combo.reasonTone}`}>
                        {combo.reasonTone === 'clear' ? '↕' : '★'} {combo.reason}
                      </div>
                      <div className="combo-products">
                        <div className="combo-p" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalogo/${p1.id}`)}>
                          <div className="pw-thumb">
                            <ProductThumb src={p1.image} alt={p1.name} />
                          </div>
                          <div className="cpname">{p1.name.replace('Tênis Tesla ', '')}</div>
                          <div className="cpcolor">{p1.colorway}</div>
                        </div>
                        <div className="combo-plus">+</div>
                        <div className="combo-p" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalogo/${p2.id}`)}>
                          <div className="pw-thumb">
                            <ProductThumb src={p2.image} alt={p2.name} />
                          </div>
                          <div className="cpname">{p2.name.replace('Tênis Tesla ', '')}</div>
                          <div className="cpcolor">{p2.colorway}</div>
                        </div>
                      </div>
                      <div className="combo-pricing">
                        <div className="combo-pricerow">
                          <span className="combo-was">{formatBRL(sumFactory)}</span>
                          <span className="combo-now">{formatBRL(finalPrice)}</span>
                        </div>
                        <div className="combo-save">
                          Economia de {formatBRL(savings)} ({combo.discountPct}%)
                        </div>
                        <div
                          className={`pw-addbtn ${inCart ? 'in-cart' : ''}`}
                          style={{ cursor: 'pointer', marginTop: 10 }}
                          onClick={() => toggleCombo(combo.id)}
                        >
                          {inCart ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                              No carrinho
                            </>
                          ) : (
                            'Adicionar combo ao carrinho'
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </DesktopPage>
  )
}
