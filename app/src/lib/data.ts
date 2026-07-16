import type { Client, InsightCardData, Product, CartOrder, User } from './types'

export const lojistaRadarInsights: InsightCardData[] = [
  {
    id: 'ins-1',
    severity: 'positive',
    opportunity: true,
    eyebrow: 'Alta demanda',
    title: 'Tênis Vulcanizado',
    text: '+34% de vendas na sua região neste mês',
    cta: 'Ver produto',
  },
  {
    id: 'ins-2',
    severity: 'risk',
    eyebrow: 'Estoque baixo',
    title: 'Linha Street',
    text: 'Vendendo mais rápido que a reposição atual',
    cta: 'Repor agora',
  },
  {
    id: 'ins-3',
    severity: 'info',
    eyebrow: 'Benchmark',
    title: 'Lojas parecidas venderam +30%',
    text: 'Modelo Street Pro, mesma faixa de porte',
    cta: 'Comparar',
  },
]

export const loyaltyInsights: InsightCardData[] = [
  {
    id: 'loy-1',
    severity: 'positive',
    opportunity: true,
    eyebrow: 'Datas especiais',
    title: '5 aniversários esta semana',
    text: 'Bom momento pra oferecer um cupom especial',
    cta: 'Ver clientes',
  },
  {
    id: 'loy-2',
    severity: 'risk',
    eyebrow: 'Sumidos',
    title: '8 clientes sem compra',
    text: 'Mais de 90 dias sem passar na loja',
    cta: 'Reativar',
  },
  {
    id: 'loy-3',
    severity: 'info',
    eyebrow: 'Mais recomprado',
    title: 'Tênis Street Pro',
    text: '72% dos clientes recompram em 60 dias',
    cta: 'Ver detalhes',
  },
]

export const dailyPanel = [
  { id: 'dp-1', tone: 'risk' as const, label: 'Reposição necessária', count: 3 },
  { id: 'dp-2', tone: 'info' as const, label: 'Lançamentos', count: 2 },
  { id: 'dp-3', tone: 'positive' as const, label: 'Produtos em alta', count: 6 },
  { id: 'dp-4', tone: 'risk' as const, label: 'Alertas', count: 1 },
]

export const loyaltyPanel = [
  { id: 'lp-1', tone: 'positive' as const, label: 'Aniversariantes', count: 5 },
  { id: 'lp-2', tone: 'risk' as const, label: 'Sem contato há 90+ dias', count: 8 },
  { id: 'lp-3', tone: 'info' as const, label: 'Alta chance de recompra', count: 6 },
  { id: 'lp-4', tone: 'neutral' as const, label: 'Avaliações pendentes', count: 4 },
]

interface RawProduct {
  sku: string
  colorway: string
  collection: 'COIL' | 'HERTZ' | 'HERTZ ART' | 'FLOW' | 'FLOW XL'
  growthPct: number
  restockDays: number
  marginPct: number
  premium?: boolean
  riskCallout?: string
}

const collectionMeta: Record<
  RawProduct['collection'],
  { category: string; line: string; blurb: string }
> = {
  COIL: {
    category: 'Calçados · Linha Coil',
    line: 'coil',
    blurb: 'perfil baixo, inspirado em skate street',
  },
  HERTZ: {
    category: 'Calçados · Linha Hertz',
    line: 'hertz',
    blurb: 'clássico atemporal, base de vulcanizado',
  },
  'HERTZ ART': {
    category: 'Calçados · Linha Hertz Art',
    line: 'hertz-art',
    blurb: 'edição gráfica com bordado grafitti exclusivo',
  },
  FLOW: {
    category: 'Calçados · Linha Flow',
    line: 'flow',
    blurb: 'perfil baixo, entressola leve',
  },
  'FLOW XL': {
    category: 'Calçados · Linha Flow XL',
    line: 'flow-xl',
    blurb: 'perfil alto, entressola reforçada',
  },
}

const raw: RawProduct[] = [
  // COIL — 1901
  { sku: '1901-06', colorway: 'Black Reflect', collection: 'COIL', growthPct: 18, restockDays: 45, marginPct: 42 },
  { sku: '1901-10', colorway: 'All Black Reflect', collection: 'COIL', growthPct: 9, restockDays: 40, marginPct: 40 },
  { sku: '1901-16', colorway: 'Off White Furta Cor', collection: 'COIL', growthPct: -6, restockDays: 30, marginPct: 39, riskCallout: 'Oportunidade perdida — sua loja ainda não vende este modelo' },
  { sku: '1901-18', colorway: 'Black Purple', collection: 'COIL', growthPct: 14, restockDays: 35, marginPct: 41 },
  { sku: '1901-19', colorway: 'Black Reflect Mesclado', collection: 'COIL', growthPct: 22, restockDays: 32, marginPct: 43, premium: true },
  { sku: '1901-21', colorway: 'All White', collection: 'COIL', growthPct: 11, restockDays: 28, marginPct: 38 },
  { sku: '1901-30', colorway: 'Black Rose', collection: 'COIL', growthPct: 27, restockDays: 33, marginPct: 44 },
  { sku: '1901-66', colorway: 'Denim', collection: 'COIL', growthPct: 31, restockDays: 26, marginPct: 45, premium: true },
  { sku: '1901-67', colorway: 'Black White', collection: 'COIL', growthPct: 16, restockDays: 36, marginPct: 40 },
  { sku: '1901-68', colorway: 'Off White', collection: 'COIL', growthPct: 8, restockDays: 34, marginPct: 39 },
  // HERTZ — 2101
  { sku: '2101-02', colorway: 'Black Reflect', collection: 'HERTZ', growthPct: 12, restockDays: 48, marginPct: 37 },
  { sku: '2101-16', colorway: 'All White', collection: 'HERTZ', growthPct: 6, restockDays: 44, marginPct: 36 },
  { sku: '2101-25', colorway: 'Black Gold', collection: 'HERTZ', growthPct: 24, restockDays: 30, marginPct: 46, premium: true },
  { sku: '2101-30', colorway: 'Black', collection: 'HERTZ', growthPct: 10, restockDays: 42, marginPct: 37 },
  // HERTZ ART — 2101
  { sku: '2101-36', colorway: 'Black Art', collection: 'HERTZ ART', growthPct: 29, restockDays: 25, marginPct: 47, premium: true },
  { sku: '2101-39', colorway: 'White Art', collection: 'HERTZ ART', growthPct: 19, restockDays: 27, marginPct: 45, premium: true },
  { sku: '2101-40', colorway: 'Black Purple', collection: 'HERTZ ART', growthPct: 33, restockDays: 24, marginPct: 47, premium: true },
  // FLOW — 2502
  { sku: '2502-01', colorway: 'Black White', collection: 'FLOW', growthPct: 15, restockDays: 38, marginPct: 40 },
  { sku: '2502-03', colorway: 'All White', collection: 'FLOW', growthPct: 7, restockDays: 41, marginPct: 38 },
  { sku: '2502-05', colorway: 'Denim', collection: 'FLOW', growthPct: 26, restockDays: 29, marginPct: 43 },
  { sku: '2502-07', colorway: 'Black', collection: 'FLOW', growthPct: 13, restockDays: 39, marginPct: 39 },
  { sku: '2502-08', colorway: 'Black Gold', collection: 'FLOW', growthPct: 28, restockDays: 26, marginPct: 46, premium: true },
  // FLOW XL — 2502
  { sku: '2502-10', colorway: 'Black Reflect', collection: 'FLOW XL', growthPct: 17, restockDays: 37, marginPct: 41 },
  { sku: '2502-12', colorway: 'White Aqua', collection: 'FLOW XL', growthPct: 21, restockDays: 31, marginPct: 41 },
  { sku: '2502-13', colorway: 'Grey Tiffany', collection: 'FLOW XL', growthPct: 20, restockDays: 33, marginPct: 42 },
  { sku: '2502-14', colorway: 'Black Purple', collection: 'FLOW XL', growthPct: 23, restockDays: 30, marginPct: 42 },
  { sku: '2502-16', colorway: 'Black White', collection: 'FLOW XL', growthPct: 9, restockDays: 40, marginPct: 39 },
  { sku: '2502-17', colorway: 'Black', collection: 'FLOW XL', growthPct: 5, restockDays: 43, marginPct: 37, riskCallout: 'Estoque parado — sem giro nos últimos 30 dias' },
  { sku: '2502-18', colorway: 'All White', collection: 'FLOW XL', growthPct: 4, restockDays: 44, marginPct: 36 },
  { sku: '2502-19', colorway: 'Denim', collection: 'FLOW XL', growthPct: 25, restockDays: 28, marginPct: 43 },
  { sku: '2502-20', colorway: 'All Black Reflect', collection: 'FLOW XL', growthPct: 12, restockDays: 36, marginPct: 40 },
  { sku: '2502-21', colorway: 'Purple', collection: 'FLOW XL', growthPct: 30, restockDays: 27, marginPct: 45, premium: true },
  { sku: '2502-22', colorway: 'All Black Tiffany', collection: 'FLOW XL', growthPct: 18, restockDays: 34, marginPct: 41 },
]

function buildSizes(): { size: string; suggested: boolean }[] {
  const sizes = ['36', '37', '38', '39', '40', '41', '42']
  return sizes.map((size, i) => ({ size, suggested: i > 0 && i < sizes.length - 1 }))
}

export const products: Product[] = raw.map((r) => {
  const meta = collectionMeta[r.collection]
  const badges: Product['badges'] = []
  if (r.riskCallout) {
    badges.push({ label: 'Oportunidade perdida', tone: 'risk' })
  } else if (r.growthPct >= 20) {
    badges.push({ label: `+${r.growthPct}% crescimento`, tone: 'positive' })
  } else if (r.growthPct >= 0) {
    badges.push({ label: `+${r.growthPct}% crescimento`, tone: 'neutral' })
  } else {
    badges.push({ label: `${r.growthPct}% no período`, tone: 'risk' })
  }
  if (r.premium) badges.push({ label: 'Lançamento', tone: 'premium' })
  badges.push({ label: `Margem ${r.marginPct}%`, tone: 'neutral' })

  const why = [
    r.growthPct >= 0
      ? `Vendendo acima da média — crescimento de ${r.growthPct}% no trimestre na coleção ${r.collection}`
      : `Queda de ${Math.abs(r.growthPct)}% no período — candidato a ação de reativação`,
    `Margem estimada de ${r.marginPct}% no seu perfil de loja`,
    `Modelo ${meta.blurb}`,
    r.premium
      ? 'Peça de lançamento — estoque ainda limitado nos representantes'
      : `Giro previsto de ${r.restockDays} dias, dentro do padrão da linha ${r.collection}`,
  ]
  if (r.riskCallout) why.unshift(r.riskCallout)

  return {
    id: r.sku,
    sku: r.sku,
    collection: r.collection,
    name: `${r.collection} — ${r.colorway}`,
    category: meta.category,
    line: meta.line,
    image: `/products/${r.sku}.jpg`,
    badges,
    why,
    restockDays: r.restockDays,
    suggestedSizes: buildSizes(),
  }
})

export const clients: Client[] = [
  {
    id: 'c1',
    name: 'Radical Skate',
    score: 92,
    scoreTone: 'positive',
    scoreLabel: '92% recompra',
    suggestion: 'Sugestão: pedido de R$ 4.200, com base no histórico de inverno',
    actionLabel: 'Montar pedido sugerido',
    actionStyle: 'primary',
    opportunity: true,
  },
  {
    id: 'c2',
    name: 'Loja Vertex',
    score: -22,
    scoreTone: 'risk',
    scoreLabel: '-22% volume',
    suggestion: 'Queda de compra nos últimos 30 dias. Sugestão: ligar hoje',
    actionLabel: 'Ligar agora',
    actionStyle: 'outline',
  },
  {
    id: 'c3',
    name: 'Casa Esporte',
    score: 0,
    scoreTone: 'info',
    scoreLabel: 'Sem nova coleção',
    suggestion: 'Ainda não visualizou o lançamento Urban Winter',
    actionLabel: 'Enviar coleção',
    actionStyle: 'outline',
  },
]

export const users: User[] = [
  { id: 'u1', name: 'Ana Silva', initials: 'AN', role: 'titular' },
  { id: 'u2', name: 'Bruno Costa', initials: 'BR', role: 'auxiliar' },
  { id: 'u3', name: 'Carla Nunes', initials: 'CA', role: 'auxiliar' },
]

export const orders: CartOrder[] = [
  {
    id: 'o1',
    name: 'Coleção Inverno',
    status: 'aguardando',
    representative: 'Ana',
    updatedAt: 'há 2h',
    items: [
      { name: 'Tênis Street Pro', qty: 24, grade: '37–41', value: 6480 },
      { name: 'Bota Urban Trail', qty: 12, grade: '38–42', value: 4320 },
      { name: 'Sandália Feminina X', qty: 18, grade: '35–39', value: 3400 },
    ],
    subtotal: 14200,
    discount: 320,
    total: 13880,
    marginPct: 38,
  },
  {
    id: 'o2',
    name: 'Reposição rápida',
    status: 'rascunho',
    representative: 'Ana',
    updatedAt: 'ontem',
    items: [{ name: 'Tênis Street Pro', qty: 6, grade: '38–40', value: 2140 }],
    subtotal: 2140,
    discount: 0,
    total: 2140,
    marginPct: 41,
  },
  {
    id: 'o3',
    name: 'Lançamento Urban',
    status: 'aprovado',
    representative: 'Marcos',
    updatedAt: 'há 3 dias',
    items: [{ name: 'Bota Urban Trail', qty: 24, grade: '38–43', value: 9760 }],
    subtotal: 9760,
    discount: 0,
    total: 9760,
    marginPct: 44,
  },
]

export const mixPlan = {
  planName: 'Coleção de Inverno',
  investment: 18000,
  mix: [
    { label: 'Calçados', pct: 60 },
    { label: 'Acessórios', pct: 25 },
    { label: 'Vestuário', pct: 15 },
  ],
  turnoverDays: 42,
  marginPct: 39,
  coveragePct: 92,
  items: [
    { productId: 'p1', name: 'Tênis Street Pro', qty: 24 },
    { productId: 'p3', name: 'Bota Urban Trail', qty: 12 },
    { productId: 'p2', name: 'Sandália Feminina X', qty: 18 },
  ],
}

export const trackingSteps = [
  { id: 't1', status: 'done' as const, title: 'Pedido confirmado', date: '12 jul, 09:40' },
  {
    id: 't2',
    status: 'current' as const,
    title: 'Em produção',
    date: 'Previsão: 15 jul',
    desc: 'Fábrica está separando e produzindo os itens do pedido',
  },
  { id: 't3', status: 'pending' as const, title: 'Enviado', date: 'Previsão: 17 jul' },
  { id: 't4', status: 'pending' as const, title: 'Entregue na loja', date: 'Previsão: 19 jul' },
]

export const goals = [
  { id: 'g1', title: 'Repor estoque', sub: 'Focar em produtos que estão acabando' },
  { id: 'g2', title: 'Planejar a próxima coleção', sub: 'Montar um mix novo com orçamento definido' },
  { id: 'g3', title: 'Recuperar clientes parados', sub: 'Reativar quem reduziu ou parou de comprar' },
  { id: 'g4', title: 'Só dar uma olhada geral', sub: 'Entender como está meu negócio hoje' },
]
