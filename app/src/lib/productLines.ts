import type { Product, Combo } from './types'

export interface ProductLine {
  collection: string
  colors: Product[]
  bestSellerId: string
}

// Agrupa os SKUs (uma cor cada) em linhas de produto (uma linha = uma coleção) — usado tanto pelo
// grid normal do Catálogo quanto pela comparação de Planejar, que precisam do mesmo agrupamento.
export function buildProductLines(list: Product[]): ProductLine[] {
  const order: string[] = []
  const byCollection = new Map<string, Product[]>()
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

// Preço combinado de um combo — sempre calculado a partir do priceFactory de cada produto (mesma
// fonte que o Catálogo normal usa pra mostrar preço), nunca um valor fixo à parte. `products`
// deve ser o array `products` de `lib/data.ts` — devolve `null` se algum SKU do combo não existir.
export function comboPrice(combo: Combo, products: Product[]) {
  const items = combo.productIds.map((id) => products.find((p) => p.id === id))
  if (items.some((p) => !p)) return null
  const [p1, p2] = items as [Product, Product]
  const sumFactory = p1.priceFactory + p2.priceFactory
  const finalPrice = Math.round(sumFactory * (1 - combo.discountPct / 100) * 100) / 100
  return { p1, p2, sumFactory, finalPrice, savings: sumFactory - finalPrice }
}

export type DeltaTone = 'up' | 'down' | 'flat' | 'new'

// Compara uma quantidade "agora" com uma quantidade "antes" (ex: mesmo período do ano passado).
export function deltaInfo(prev: number, now: number): { tone: DeltaTone; text: string } {
  if (prev === 0) return { tone: 'new', text: 'Novo' }
  const pct = Math.round(((now - prev) / prev) * 100)
  if (pct > 0) return { tone: 'up', text: `+${pct}%` }
  if (pct < 0) return { tone: 'down', text: `${pct}%` }
  return { tone: 'flat', text: '0%' }
}
