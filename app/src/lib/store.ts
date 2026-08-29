import { create } from 'zustand'
import type { Persona, User, Carrinho, PedidoItem } from './types'
import { users, products, initialCarrinhos } from './data'

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

  /** Carrinhos de verdade (Meus Carrinhos) — cada um com N pedidos. Mutável: cresce quando o
   * lojista fecha o pedido em montagem no drawer (ver commitCartToCarrinho). */
  carrinhos: Carrinho[]
  /**
   * Em qual carrinho o próximo "Ir para o carrinho" do drawer deve entrar como pedido novo.
   * `null` = cria um carrinho novo no próximo commit. Setado por "Criar novo pedido neste
   * carrinho" (aponta pro carrinho atual) e limpo por "+ Novo carrinho" (força criar um novo).
   */
  activeCarrinhoId: string | null
  setActiveCarrinho: (id: string | null) => void
  /**
   * Converte o `cartItems` atual (o pedido que o lojista está montando) num `Pedido` de
   * verdade dentro do carrinho ativo — cria um carrinho novo se não houver um ativo — e limpa
   * o `cartItems` pra começar o próximo pedido do zero. Retorna o id do carrinho de destino, ou
   * `null` se não havia nenhum item pra enviar (não faz sentido commitar um pedido vazio).
   */
  commitCartToCarrinho: () => string | null
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

  carrinhos: initialCarrinhos,
  activeCarrinhoId: null,
  setActiveCarrinho: (id) => set({ activeCarrinhoId: id }),
  commitCartToCarrinho: () => {
    const s = get()
    const { lines, totalItems, totalValue } = cartSummary(s.cartItems)
    if (totalItems === 0) return null

    const items: PedidoItem[] = lines.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      qty: l.qty,
      grade: gradeRangeLabel(l.product.suggestedSizes),
      value: l.value,
    }))
    const pdvTotal = lines.reduce((sum, l) => sum + l.product.pricePdv * l.qty, 0)
    const marginPct = pdvTotal > 0 ? Math.round(((pdvTotal - totalValue) / pdvTotal) * 100) : 0

    let carrinhos = s.carrinhos
    let carrinho = carrinhos.find((c) => c.id === s.activeCarrinhoId)
    if (!carrinho) {
      carrinho = { id: `carrinho-${Date.now()}`, name: `Carrinho ${carrinhos.length + 1}`, representative: 'Ana', updatedAt: 'agora', pedidos: [] }
      carrinhos = [...carrinhos, carrinho]
    }
    const pedido = {
      id: `${carrinho.id}-p${carrinho.pedidos.length + 1}`,
      label: `Pedido ${carrinho.pedidos.length + 1}`,
      status: 'rascunho' as const,
      items,
      subtotal: totalValue,
      discount: 0,
      total: totalValue,
      marginPct,
      paymentCondition: '30' as const,
      deliveryEstimateDays: 15,
    }
    const carrinhoId = carrinho.id
    carrinhos = carrinhos.map((c) => (c.id === carrinhoId ? { ...c, updatedAt: 'agora', pedidos: [...c.pedidos, pedido] } : c))

    set({ carrinhos, cartItems: {}, activeCarrinhoId: carrinhoId })
    return carrinhoId
  },
}))

// Faixa de grade sugerida pro pedido gerado a partir do cartItems — deriva do miolo de
// `suggestedSizes` (as numerações centrais marcadas como sugeridas), mesma lógica visual do
// "Grade sugerida" na Ficha de Decisão do Catálogo.
function gradeRangeLabel(sizes: { size: string; suggested: boolean }[]) {
  const suggested = sizes.filter((s) => s.suggested)
  const pick = suggested.length > 0 ? suggested : sizes
  return `${pick[0].size}–${pick[pick.length - 1].size}`
}

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
