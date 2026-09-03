export type Persona = 'lojista' | 'representante'

export type Severity = 'positive' | 'risk' | 'info' | 'neutral' | 'premium'

export interface InsightCardData {
  id: string
  severity: Severity
  opportunity?: boolean
  eyebrow: string
  title: string
  text: string
  cta: string
  productId?: string
  suggestedQty?: number
  // Número/métrica central do card (ex: "+34%", "32 un.") — puxado em destaque tipográfico
  // grande no card do Radar desktop. Opcional porque nem todo insight tem uma métrica única e limpa.
  stat?: string
  // Prazo pra agir (Radar desktop, ago/2026) — agrupa os cards em 3 seções em vez de um grid só.
  // Opcional porque só o Radar do lojista desktop usa isso hoje (loyaltyInsights não precisa).
  timeframe?: 'hoje' | '15dias' | '30dias'
}

export interface Product {
  id: string
  sku: string
  reference: string
  collection: string
  name: string
  colorway: string
  category: string
  line: string
  image: string
  priceFactory: number
  pricePdv: number
  growthPct: number
  badges: { label: string; tone: Severity }[]
  why: string[]
  restockDays: number
  suggestedSizes: { size: string; suggested: boolean }[]
}

export interface Client {
  id: string
  name: string
  score: number
  scoreTone: Severity
  scoreLabel: string
  suggestion: string
  actionLabel: string
  actionStyle: 'primary' | 'outline'
  opportunity?: boolean
}

export interface MixItem {
  productId: string
  name: string
  qty: number
}

// "Combos sugeridos" no Catálogo — dois produtos vendidos juntos com desconto sobre a soma dos
// preços de fábrica. `reasonTone` só controla a cor do rótulo (ver Catalog.tsx), não é uma regra
// de negócio própria.
export interface Combo {
  id: string
  productIds: [string, string]
  discountPct: number
  reason: string
  reasonTone: 'clear' | 'pair'
}

export const GRADE_MINIMA_PARES = 36

export type PaymentCondition = '30' | '60' | '90' | 'a-vista'
export type PaymentMethod = 'pix' | 'cartao' | 'boleto'

export interface PedidoItem {
  productId: string
  name: string
  qty: number
  grade: string
  value: number
}

export interface Pedido {
  id: string
  label: string
  status: 'rascunho' | 'aguardando' | 'aprovado' | 'pago'
  items: PedidoItem[]
  subtotal: number
  discount: number
  total: number
  marginPct: number
  paymentCondition?: PaymentCondition
  paymentMethod?: PaymentMethod
  deliveryEstimateDays: number
  // Presente quando o pedido nasceu do lado do representante ("Montar Pedido Sugerido", validado
  // em reunião com o cliente) em vez do lojista — hoje só simulado do lado do lojista, não existe
  // desktop do representante ainda (ver docs/guia-dev-frontend.md).
  suggestedBy?: 'representante'
}

export interface Carrinho {
  id: string
  name: string
  representative: string
  // Texto relativo pra exibição ("há 2h", "ontem") — mantido solto de propósito, mesmo padrão já
  // usado no resto do app. `daysSinceActivity` é o campo numérico paralelo usado pra cálculo
  // (aviso de expiração de rascunho); os dois precisam ser atualizados juntos.
  updatedAt: string
  daysSinceActivity: number
  pedidos: Pedido[]
  // Toggle de permissão do lojista — simulado: não existe desktop do representante pra aplicar
  // essa permissão de verdade ainda, é só o que aparece do lado do lojista (ver guia-dev-frontend.md).
  repCanEdit: boolean
  // Quando ligado, um Pedido "rascunho" que bate a grade mínima muda sozinho pro status
  // "aguardando" (aprovação da Ana) ao ser salvo — não pula a aprovação humana, só tira o clique
  // manual de "Enviar pro representante".
  autoSendOnGradeMinima: boolean
  lastComment?: { author: string; text: string; timeLabel: string }
}

export interface User {
  id: string
  name: string
  initials: string
  role: 'titular' | 'auxiliar'
}

// Dropdown do sino no WebTopNav (ago/2026) — 3 tipos de evento mapeados desde
// `analise-ux-gaps-atrito-venda.md`, nunca implementados até agora.
export interface NotificationItem {
  id: string
  kind: 'comment' | 'status' | 'insight'
  text: string
  timeLabel: string
  read: boolean
  carrinhoId?: string
}
