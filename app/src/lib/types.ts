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
}

export interface Product {
  id: string
  sku: string
  collection: string
  name: string
  category: string
  line: string
  image: string
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

export interface CartOrder {
  id: string
  name: string
  status: 'rascunho' | 'aguardando' | 'aprovado'
  representative: string
  updatedAt: string
  items: { name: string; qty: number; grade: string; value: number }[]
  subtotal: number
  discount: number
  total: number
  marginPct: number
}

export interface User {
  id: string
  name: string
  initials: string
  role: 'titular' | 'auxiliar'
}
