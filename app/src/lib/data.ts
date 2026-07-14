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

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Tênis Street Pro',
    category: 'Calçados · Linha Street',
    line: 'street',
    badges: [
      { label: '+18% crescimento', tone: 'positive' },
      { label: 'Alta recompra', tone: 'neutral' },
      { label: 'Reposição 45d', tone: 'info' },
    ],
    why: [
      'Vendendo acima da média — crescimento de 18% no trimestre',
      'Alta recompra — 72% dos clientes recompram em 60 dias',
      'Indicado para lojas especializadas em streetwear',
      'Margem estimada de 42% no seu perfil de loja',
    ],
    restockDays: 45,
    suggestedSizes: [
      { size: '36', suggested: false },
      { size: '37', suggested: true },
      { size: '38', suggested: true },
      { size: '39', suggested: true },
      { size: '40', suggested: true },
      { size: '41', suggested: true },
      { size: '42', suggested: false },
    ],
  },
  {
    id: 'p2',
    name: 'Sandália Feminina X',
    category: 'Calçados · Linha Feminina',
    line: 'feminina',
    badges: [
      { label: 'Oportunidade perdida', tone: 'risk' },
      { label: 'Categoria feminina', tone: 'neutral' },
    ],
    why: [
      'Sua loja ainda não vende este modelo',
      'Lojas parecidas venderam 30% mais deste item',
      'Categoria feminina sub-representada no seu mix',
    ],
    restockDays: 30,
    suggestedSizes: [
      { size: '34', suggested: false },
      { size: '35', suggested: true },
      { size: '36', suggested: true },
      { size: '37', suggested: true },
      { size: '38', suggested: true },
      { size: '39', suggested: true },
      { size: '40', suggested: false },
    ],
  },
  {
    id: 'p3',
    name: 'Bota Urban Trail',
    category: 'Calçados · Linha Urban',
    line: 'urban',
    badges: [
      { label: 'Alto giro', tone: 'positive' },
      { label: 'Margem 44%', tone: 'neutral' },
    ],
    why: [
      'Giro previsto de 38 dias, acima da média da categoria',
      'Margem estimada de 44% no seu perfil de loja',
      'Recomendado para reposição contínua',
    ],
    restockDays: 38,
    suggestedSizes: [
      { size: '37', suggested: false },
      { size: '38', suggested: true },
      { size: '39', suggested: true },
      { size: '40', suggested: true },
      { size: '41', suggested: true },
      { size: '42', suggested: true },
      { size: '43', suggested: false },
    ],
  },
  {
    id: 'p4',
    name: 'Meia Cano Alto',
    category: 'Acessórios',
    line: 'acessorios',
    badges: [{ label: 'Margem 48%', tone: 'neutral' }],
    why: [
      'Item complementar de alta margem',
      'Combina com o mix atual da sua loja',
      'Baixo investimento, alto giro',
    ],
    restockDays: 20,
    suggestedSizes: [
      { size: 'Único', suggested: true },
    ],
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
