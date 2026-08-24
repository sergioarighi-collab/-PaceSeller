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
}

export interface Carrinho {
  id: string
  name: string
  representative: string
  updatedAt: string
  pedidos: Pedido[]
}

export interface User {
  id: string
  name: string
  initials: string
  role: 'titular' | 'auxiliar'
}
