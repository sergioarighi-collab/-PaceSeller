import { create } from 'zustand'
import type { Persona, User } from './types'
import { users, products } from './data'

interface AppState {
  persona: Persona | null
  setPersona: (p: Persona) => void

  activeUser: User | null
  setActiveUser: (u: User) => void

  goalId: string
  setGoal: (id: string) => void

  /** true quando o lojista pulou o onboarding (perfil incompleto). */
  onboardingSkipped: boolean
  skipOnboarding: () => void
  dismissOnboardingNotice: () => void

  focusOpen: boolean
  openFocus: () => void
  closeFocus: () => void

  activeOrderId: string
  setActiveOrderId: (id: string) => void

  /** Itens do pedido em montagem (Catálogo / Ficha de Decisão / Planejamento). */
  cartItems: Record<string, number>
  addToCart: (productId: string, qty?: number) => void
  removeFromCart: (productId: string) => void
  toggleCart: (productId: string) => void
  isInCart: (productId: string) => boolean

  /** Drawer "Seu pedido" (carrinho em construção) — trigger no header, disponível em qualquer tela do lojista. */
  orderDrawerOpen: boolean
  openOrderDrawer: () => void
  closeOrderDrawer: () => void
  toggleOrderDrawer: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  persona: null,
  setPersona: (p) => set({ persona: p }),

  activeUser: null,
  setActiveUser: (u) => set({ activeUser: u }),

  goalId: 'g1',
  setGoal: (id) => set({ goalId: id }),

  onboardingSkipped: false,
  skipOnboarding: () => set({ onboardingSkipped: true }),
  dismissOnboardingNotice: () => set({ onboardingSkipped: false }),

  focusOpen: false,
  openFocus: () => set({ focusOpen: true }),
  closeFocus: () => set({ focusOpen: false }),

  activeOrderId: 'o1',
  setActiveOrderId: (id) => set({ activeOrderId: id }),

  cartItems: { '2101-30': 24, '1901-67': 12, '2304-01': 4 },
  addToCart: (productId, qty) =>
    set((s) => {
      const nextQty = qty ?? (s.cartItems[productId] ? s.cartItems[productId] + 1 : 12)
      return { cartItems: { ...s.cartItems, [productId]: nextQty } }
    }),
  removeFromCart: (productId) =>
    set((s) => {
      const next = { ...s.cartItems }
      delete next[productId]
      return { cartItems: next }
    }),
  toggleCart: (productId) => {
    const s = get()
    if (s.cartItems[productId]) s.removeFromCart(productId)
    else s.addToCart(productId, 12)
  },
  isInCart: (productId) => Boolean(get().cartItems[productId]),

  orderDrawerOpen: false,
  openOrderDrawer: () => set({ orderDrawerOpen: true }),
  closeOrderDrawer: () => set({ orderDrawerOpen: false }),
  toggleOrderDrawer: () => set((s) => ({ orderDrawerOpen: !s.orderDrawerOpen })),
}))

export function cartSummary(cartItems: Record<string, number>) {
  const lines = Object.entries(cartItems)
    .map(([productId, qty]) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return null
      return { product, qty, value: product.priceFactory * qty }
    })
    .filter((l): l is { product: (typeof products)[number]; qty: number; value: number } => l !== null)
  const totalItems = lines.reduce((sum, l) => sum + l.qty, 0)
  const totalValue = lines.reduce((sum, l) => sum + l.value, 0)
  return { lines, totalItems, totalValue }
}

export const defaultTitular = users[0]
