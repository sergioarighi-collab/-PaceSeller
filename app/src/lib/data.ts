import type { Client, InsightCardData, Product, User, Carrinho, Combo } from './types'

// Todas as pendências do lojista, agrupadas por prazo pra agir (ago/2026, substitui os 4 cards
// soltos + a lista "por categoria" escondida atrás de um clique — ver docs/guia-dev-frontend.md).
// Nenhum dado novo foi inventado: são os mesmos itens que já existiam espalhados entre os cards
// de oportunidade antigos e o listModalContent que ficava atrás do modal de cada categoria.
export const lojistaRadarInsights: InsightCardData[] = [
  // Hoje
  {
    id: 'ins-1',
    timeframe: 'hoje',
    severity: 'positive',
    opportunity: true,
    eyebrow: 'Alta demanda',
    title: 'Tênis Tesla Fusion Black Red',
    text: 'Vendas na sua região neste mês',
    cta: 'Ver produto',
    productId: '2601-01',
    stat: '+34%',
  },
  {
    id: 'ins-2',
    timeframe: 'hoje',
    severity: 'risk',
    eyebrow: 'Estoque baixo · 12 dias',
    title: 'Linha Coil',
    text: 'Vendendo mais rápido que a reposição atual',
    cta: 'Repor agora',
    productId: '1901-67',
    suggestedQty: 32,
    stat: '32 un.',
  },
  {
    id: 'ins-3',
    timeframe: 'hoje',
    severity: 'risk',
    eyebrow: 'Alerta',
    title: 'Pedido #4790-1 atrasou',
    text: 'Previsão de entrega vencida',
    cta: 'Ver pedido',
    stat: '2 dias',
  },
  // Em 15 dias
  {
    id: 'ins-4',
    timeframe: '15dias',
    severity: 'risk',
    eyebrow: 'Estoque baixo · 15 dias',
    title: 'Tênis Tesla TG II Black Reflect',
    text: 'Sugestão de reposição antes de faltar',
    cta: 'Repor agora',
    productId: '2304-01',
    suggestedQty: 60,
    stat: '60 un.',
  },
  {
    id: 'ins-5',
    timeframe: '15dias',
    severity: 'positive',
    eyebrow: 'Lançamento · 12 dias',
    title: 'Linha Fusion',
    text: 'Ainda não chegou no seu mix — lojas parecidas já compram',
    cta: 'Ver coleção',
    stat: '6 lojas',
  },
  {
    id: 'ins-6',
    timeframe: '15dias',
    severity: 'positive',
    eyebrow: 'Lançamento · 28 dias',
    title: 'Tênis Tesla TG II Black Reflect',
    text: 'Ainda com giro abaixo do esperado desde o lançamento',
    cta: 'Ver produto',
    productId: '2304-01',
    stat: 'Giro baixo',
  },
  {
    id: 'ins-7',
    timeframe: '15dias',
    severity: 'info',
    eyebrow: 'Benchmark',
    title: 'Lojas parecidas venderam mais',
    text: 'Modelo Coil Black White, mesma faixa de porte',
    cta: 'Comparar',
    stat: '+30%',
  },
  // Nos próximos 30 dias
  {
    id: 'ins-8',
    timeframe: '30dias',
    severity: 'risk',
    eyebrow: 'Recuperar clientes',
    title: 'Sem contato há 90+ dias',
    text: 'Bom momento pra reativar antes que esfrie de vez',
    cta: 'Ver clientes',
    stat: '8 clientes',
  },
  {
    id: 'ins-11',
    timeframe: '30dias',
    severity: 'risk',
    eyebrow: 'Baixo giro',
    title: 'Tênis Tesla Flow XL Black',
    text: 'Sem giro nos últimos 30 dias — bom candidato pra impulsionar com campanha',
    cta: 'Ver produto',
    productId: '2502-17',
    stat: 'Sem giro',
  },
  {
    id: 'ins-9',
    timeframe: '30dias',
    severity: 'positive',
    eyebrow: 'Produtos em alta',
    title: 'Vendendo acima da média',
    text: 'Coil Black White, Denim, Hertz All Black Furta Cor e mais 3',
    cta: 'Ver todos',
    stat: '6 SKUs',
  },
  {
    id: 'ins-10',
    timeframe: '30dias',
    severity: 'info',
    eyebrow: 'Fechamento',
    title: 'Feche seu pedido com o histórico em mãos',
    text: 'Compare com o que sua loja comprou no mesmo período do ano passado antes de fechar',
    cta: 'Ver carrinhos',
    stat: '2 carrinhos',
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

export const loyaltyPanel = [
  { id: 'lp-1', tone: 'positive' as const, label: 'Aniversariantes', count: 5 },
  { id: 'lp-2', tone: 'risk' as const, label: 'Sem contato há 90+ dias', count: 8 },
  { id: 'lp-3', tone: 'info' as const, label: 'Alta chance de recompra', count: 6 },
  { id: 'lp-4', tone: 'neutral' as const, label: 'Avaliações pendentes', count: 4 },
]

interface RawProduct {
  sku: string
  colorway: string
  collection: 'COIL' | 'HERTZ' | 'HERTZ ART' | 'FLOW' | 'FLOW XL' | 'FUSION' | 'TG II'
  growthPct: number
  restockDays: number
  marginPct: number
  premium?: boolean
  riskCallout?: string
  /** Preço fábrica (o que o lojista paga). Quando ausente, é calculado a partir da base da coleção. */
  priceFactory?: number
  /** PDV sugerido explícito (quando o mockup mostra um valor específico, não a fórmula genérica). */
  pricePdv?: number
}

const collectionMeta: Record<
  RawProduct['collection'],
  { category: string; line: string; blurb: string; baseFactory: number }
> = {
  COIL: {
    category: 'Calçados · Linha Coil',
    line: 'coil',
    blurb: 'perfil baixo, inspirado em skate street',
    baseFactory: 280,
  },
  HERTZ: {
    category: 'Calçados · Linha Hertz',
    line: 'hertz',
    blurb: 'clássico atemporal, base de vulcanizado',
    baseFactory: 220,
  },
  'HERTZ ART': {
    category: 'Calçados · Linha Hertz Art',
    line: 'hertz-art',
    blurb: 'edição gráfica com bordado grafitti exclusivo',
    baseFactory: 320,
  },
  FLOW: {
    category: 'Calçados · Linha Flow',
    line: 'flow',
    blurb: 'perfil baixo, entressola leve',
    baseFactory: 260,
  },
  'FLOW XL': {
    category: 'Calçados · Linha Flow XL',
    line: 'flow-xl',
    blurb: 'perfil alto, entressola reforçada',
    baseFactory: 290,
  },
  FUSION: {
    category: 'Calçados · Linha Fusion',
    line: 'fusion',
    blurb: 'lançamento mais recente, entressola tecnológica',
    baseFactory: 300,
  },
  'TG II': {
    category: 'Calçados · Linha TG II',
    line: 'tg-ii',
    blurb: 'perfil técnico, base reforçada',
    baseFactory: 300,
  },
}

/** PDV sugerido = fábrica × 1,65 (fórmula ilustrativa do mockup — a fórmula real de precificação precisa vir do cliente). */
function calcPdv(factory: number): number {
  const raw = factory * 1.65
  const hasNinetyCents = Math.round(factory * 100) % 100 === 90
  const rounded = Math.round(raw / 10) * 10
  return hasNinetyCents ? rounded - 0.1 : rounded
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
  { sku: '1901-67', colorway: 'Black White', collection: 'COIL', growthPct: 16, restockDays: 36, marginPct: 40, priceFactory: 310, pricePdv: 510 },
  { sku: '1901-68', colorway: 'Off White', collection: 'COIL', growthPct: 8, restockDays: 34, marginPct: 39 },
  // HERTZ — 2101
  { sku: '2101-02', colorway: 'Black Reflect', collection: 'HERTZ', growthPct: 12, restockDays: 48, marginPct: 37 },
  { sku: '2101-16', colorway: 'All White', collection: 'HERTZ', growthPct: 6, restockDays: 44, marginPct: 36 },
  { sku: '2101-25', colorway: 'Black Gold', collection: 'HERTZ', growthPct: 24, restockDays: 30, marginPct: 46, premium: true },
  { sku: '2101-30', colorway: 'Black', collection: 'HERTZ', growthPct: 10, restockDays: 42, marginPct: 37, priceFactory: 270, pricePdv: 450 },
  { sku: '2101-31', colorway: 'Rose', collection: 'HERTZ', growthPct: -4, restockDays: 50, marginPct: 40, priceFactory: 145, pricePdv: 240, riskCallout: 'Oportunidade perdida — sua loja ainda não vende este modelo' },
  { sku: '2101-33', colorway: 'All Black Furta Cor', collection: 'HERTZ', growthPct: 21, restockDays: 34, marginPct: 40, premium: true, priceFactory: 329.9 },
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
  // FUSION — 2601 (linha mais recente)
  { sku: '2601-01', colorway: 'Black Red', collection: 'FUSION', growthPct: 34, restockDays: 22, marginPct: 40, premium: true, priceFactory: 339.9 },
  { sku: '2601-02', colorway: 'All White', collection: 'FUSION', growthPct: 20, restockDays: 30, marginPct: 39, priceFactory: 389.9 },
  { sku: '2601-03', colorway: 'Off White Tiffany', collection: 'FUSION', growthPct: 15, restockDays: 33, marginPct: 39, priceFactory: 299.9 },
  { sku: '2601-04', colorway: 'BW Pink', collection: 'FUSION', growthPct: 25, restockDays: 27, marginPct: 40, priceFactory: 379.9 },
  // TG II — 2304
  { sku: '2304-01', colorway: 'Black Reflect', collection: 'TG II', growthPct: 10, restockDays: 41, marginPct: 40, priceFactory: 299.9, pricePdv: 499.9 },
  { sku: '2304-02', colorway: 'All White', collection: 'TG II', growthPct: 7, restockDays: 45, marginPct: 38, priceFactory: 279.9 },
]

// Grade real confirmada com o cliente: numeração 34 a 44. A faixa sugerida por SKU é ilustrativa
// (não é dado real do cliente) — varia de forma determinística a partir do SKU, com um núcleo
// 37–40 sempre coberto (quase todo tênis tem essas numerações) e as pontas variando por produto,
// pra imitar como grade de estoque funciona de verdade (números centrais quase sempre disponíveis,
// extremos nem sempre). Existe pra dar variação real ao filtro de numeração do Catálogo — antes
// disso a faixa sugerida era idêntica (36–42) pra todo produto, o que tornaria o filtro decorativo.
const ALL_SIZES = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44']

function buildSizes(sku: string): { size: string; suggested: boolean }[] {
  let hash = 0
  for (const ch of sku) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  const belowCore = hash % 4 // 0..3 numerações abaixo do 37 (até o 34)
  const aboveCore = Math.floor(hash / 4) % 5 // 0..4 numerações acima do 40 (até o 44)
  const minIdx = ALL_SIZES.indexOf('37') - belowCore
  const maxIdx = ALL_SIZES.indexOf('40') + aboveCore
  return ALL_SIZES.map((size, i) => ({ size, suggested: i >= minIdx && i <= maxIdx }))
}

export const collectionTitle: Record<RawProduct['collection'], string> = {
  COIL: 'Coil',
  HERTZ: 'Hertz',
  'HERTZ ART': 'Hertz Art',
  FLOW: 'Flow',
  'FLOW XL': 'Flow XL',
  FUSION: 'Fusion',
  'TG II': 'TG II',
}

const collectionCounters: Partial<Record<RawProduct['collection'], number>> = {}

export const products: Product[] = raw.map((r) => {
  const meta = collectionMeta[r.collection]
  const priceFactory = r.priceFactory ?? meta.baseFactory
  const pricePdv = r.pricePdv ?? calcPdv(priceFactory)

  // Referência no formato Linha-Ano-NúmeroDeLançamentoNoAno-Cor (ex: Fusion-2026-3-01), confirmado com o cliente:
  // lançamento e cor são eixos diferentes (uma linha pode ter dezenas de cores dentro do mesmo lançamento).
  // Nosso catálogo mock só tem um lançamento por linha em 2026, então o número de lançamento fica fixo em 1
  // e a cor é o índice sequencial do produto dentro da linha.
  const corSeq = (collectionCounters[r.collection] = (collectionCounters[r.collection] ?? 0) + 1)
  const reference = `${collectionTitle[r.collection].replace(/\s+/g, '')}-2026-1-${String(corSeq).padStart(2, '0')}`

  const badges: Product['badges'] = []
  if (r.riskCallout) {
    // O texto do riskCallout tem dois sentidos diferentes — "loja ainda não vende" (oportunidade
    // de entrada) vs. "sem giro" (item parado que já está no mix) — o badge precisa refletir qual é.
    const label = r.riskCallout.startsWith('Oportunidade perdida') ? 'Oportunidade perdida' : 'Estoque parado'
    badges.push({ label, tone: 'risk' })
  } else if (r.growthPct >= 20) {
    badges.push({ label: `+${r.growthPct}% crescimento`, tone: 'positive' })
  } else if (r.growthPct >= 0) {
    badges.push({ label: `+${r.growthPct}% crescimento`, tone: 'neutral' })
  } else {
    badges.push({ label: `${r.growthPct}% no período`, tone: 'risk' })
  }
  if (r.premium) badges.push({ label: 'Lançamento', tone: 'premium' })
  // "Margem estimada" = rentabilidade esperada da loja com este produto (varia por SKU, alimenta o
  // filtro "Boa margem" do catálogo) — diferente do badge "+X% sobre a fábrica" no preço, que é o
  // cálculo real fábrica→PDV sugerido (quase constante, é regra de precificação, não estimativa).
  badges.push({ label: `Margem estimada ${r.marginPct}%`, tone: 'neutral' })

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
    reference,
    collection: r.collection,
    name: `Tênis Tesla ${collectionTitle[r.collection]} ${r.colorway}`,
    colorway: r.colorway,
    category: meta.category,
    line: meta.line,
    image: `/products/${r.sku}.jpg`,
    priceFactory,
    pricePdv,
    growthPct: r.growthPct,
    badges,
    why,
    restockDays: r.restockDays,
    suggestedSizes: buildSizes(r.sku),
  }
})

// "Combos sugeridos" do Catálogo (ago/2026) — fora do MVP confirmado em
// docs/cruzamento-reuniao-cliente.md ("evolução futura, não requisito desta fase"), mas o
// cliente pediu pra simular mesmo assim, como vantagem de venda pra próxima fase. Curados à mão
// (não é um algoritmo de verdade) a partir de dado que já existe: o combo "clear" usa o único SKU
// com riskCallout de estoque parado que a loja já vende (Flow XL Black — Fusion/TG II também têm
// riskCallout mas nem têm foto real, ficariam estranhos aqui); o combo "pair" junta duas linhas
// de alto crescimento sem nenhuma relação de negócio simulada além de "ambas vendem bem".
export const combos: Combo[] = [
  {
    id: 'combo-1',
    productIds: ['2502-17', '2101-25'],
    discountPct: 10,
    reason: 'Ajuda a girar o estoque parado',
    reasonTone: 'clear',
  },
  {
    id: 'combo-2',
    productIds: ['1901-66', '2502-21'],
    discountPct: 8,
    reason: 'Comprados juntos com frequência',
    reasonTone: 'pair',
  },
]

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

// Carrinho → Pedido: um carrinho é compartilhado com o representante fixo da loja (Ana)
// e pode ter 1+ pedidos, cada um com prazo/condição de pagamento próprios (confirmado em reunião real).
// Seed inicial do store (useAppStore.carrinhos) — a partir daqui a lista é mutável (novos pedidos
// entram quando o lojista fecha "Seu pedido" no drawer, ver commitCartToCarrinho em lib/store.ts).
// Não importar direto de telas — usar sempre useAppStore((s) => s.carrinhos).
export const initialCarrinhos: Carrinho[] = [
  {
    id: 'colecao-inverno',
    name: 'Coleção Inverno',
    representative: 'Ana',
    updatedAt: 'há 2h',
    pedidos: [
      {
        id: '4821-1',
        label: 'Pedido 1',
        status: 'rascunho',
        items: [
          { productId: '2101-30', name: 'Tênis Tesla Hertz Black', qty: 24, grade: '37–41', value: 6480 },
          { productId: '1901-67', name: 'Tênis Tesla Coil Black White', qty: 12, grade: '38–42', value: 4320 },
        ],
        subtotal: 10800,
        discount: 0,
        total: 10800,
        marginPct: 38,
        paymentCondition: '30',
        deliveryEstimateDays: 15,
      },
      {
        id: '4821-2',
        label: 'Pedido 2',
        status: 'rascunho',
        items: [{ productId: '2101-31', name: 'Tênis Tesla Hertz Rose', qty: 18, grade: '35–39', value: 3400 }],
        subtotal: 3400,
        discount: 102,
        total: 3298,
        marginPct: 40,
        paymentCondition: 'a-vista',
        deliveryEstimateDays: 0,
      },
    ],
  },
  {
    id: 'reposicao-rapida',
    name: 'Giro Hertz Black',
    representative: 'Ana',
    updatedAt: 'ontem',
    pedidos: [
      {
        id: '4790-1',
        label: 'Pedido 1',
        status: 'pago',
        items: [{ productId: '2101-30', name: 'Tênis Tesla Hertz Black', qty: 6, grade: '38–40', value: 2140 }],
        subtotal: 2140,
        discount: 0,
        total: 2140,
        marginPct: 41,
        paymentCondition: '30',
        paymentMethod: 'boleto',
        deliveryEstimateDays: 2,
      },
    ],
  },
]

// Quanto a loja comprou de cada SKU no mesmo período do ano passado — usado no checklist
// "Antes de fechar" do carrinho (ago/2026) pra comparar o pedido de agora com o histórico da
// própria loja, em vez de depender de import manual de planilha (ver docs/guia-dev-frontend.md).
// Cobre só os SKUs que aparecem nos carrinhos mock hoje; SKU sem entrada aqui = sem dado
// histórico suficiente, e o item correspondente simplesmente não entra na comparação.
export const samePeriodLastYearQty: Record<string, number> = {
  '2101-30': 34, // Tênis Tesla Hertz Black
  '1901-67': 12, // Tênis Tesla Coil Black White
  '2101-31': 14, // Tênis Tesla Hertz Rose
}

// @deprecated (lojista desktop) — mantido só porque o fluxo mobile do representante
// (screens/representante/SuggestedOrder.tsx) ainda usa esse formato de mix por %.
// A tela "Planejar" do lojista desktop não usa mais este objeto.
export const mixPlan = {
  planName: 'Coleção de Inverno',
  investment: 18000,
  mix: [
    { label: 'Coil', pct: 60 },
    { label: 'Hertz', pct: 25 },
    { label: 'Flow', pct: 15 },
  ],
  turnoverDays: 42,
  marginPct: 39,
  coveragePct: 92,
  items: [
    { productId: '2101-30', name: 'Tênis Tesla Hertz Black', qty: 24 },
    { productId: '1901-67', name: 'Tênis Tesla Coil Black White', qty: 12 },
    { productId: '2101-31', name: 'Tênis Tesla Hertz Rose', qty: 18 },
    { productId: '2304-01', name: 'Tênis Tesla TG II Black Reflect', qty: 40 },
  ],
}

// Prazo real confirmado com o cliente: ~15 dias corridos até a entrega (não 7).
export const trackingSteps = [
  { id: 't1', status: 'done' as const, title: 'Pedido confirmado', date: '12 jul, 09:40' },
  {
    id: 't2',
    status: 'current' as const,
    title: 'Em produção',
    date: 'Previsão: 18 jul',
    desc: 'Fábrica está separando e produzindo os itens do pedido',
  },
  { id: 't3', status: 'pending' as const, title: 'Enviado', date: 'Previsão: 24 jul' },
  { id: 't4', status: 'pending' as const, title: 'Entregue na loja', date: 'Previsão: 27 jul' },
]

export const goals = [
  { id: 'g1', title: 'Repor estoque', sub: 'Focar em produtos acabando' },
  { id: 'g2', title: 'Planejar a coleção', sub: 'Montar mix com orçamento' },
  { id: 'g3', title: 'Recuperar clientes', sub: 'Reativar quem parou de comprar' },
  { id: 'g4', title: 'Só olhar geral', sub: 'Entender como está o negócio' },
]
