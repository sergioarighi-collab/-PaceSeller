import { create } from 'zustand'
import type { Persona, User, Carrinho, Pedido, PedidoItem, NotificationItem } from './types'
import { GRADE_MINIMA_PARES } from './types'
import { users, products, initialCarrinhos, initialNotifications, combos } from './data'
import { comboPrice } from './productLines'

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

  /**
   * Itens do pedido em montagem (Catálogo / Ficha de Decisão / Planejamento). Pra saber se um
   * produto está no carrinho, leia `cartItems[productId]` direto onde for renderizar — não
   * exponha um helper tipo `isInCart(id)` selecionado via `useAppStore((s) => s.isInCart)`: a
   * referência da função nunca muda entre renders, então o componente nunca re-renderiza quando
   * o carrinho muda (bug real que já aconteceu aqui — ver `ProductLineCard.tsx`/`Catalog.tsx`).
   */
  cartItems: Record<string, number>
  addToCart: (productId: string, qty?: number) => void
  removeFromCart: (productId: string) => void
  toggleCart: (productId: string) => void
  setCartQty: (productId: string, qty: number) => void

  /**
   * Combos adicionados ao pedido em montagem — `1` = combo presente, ausente = não. Um combo tem
   * preço promocional sobre a soma dos dois produtos (ver `comboPrice` em `lib/productLines.ts`),
   * então **não é** dois produtos entrando em `cartItems` a preço cheio — é uma linha própria, com
   * seu próprio preço, que só existe combinada (por isso não tem `qty` livre por enquanto: ou o
   * combo está no pedido, ou não está — sem stepper de quantidade ainda).
   */
  cartCombos: Record<string, number>
  toggleCombo: (comboId: string) => void
  removeCombo: (comboId: string) => void

  /** Drawer "Seu pedido" (carrinho em construção) — trigger no header, disponível em qualquer tela do lojista. */
  orderDrawerOpen: boolean
  /**
   * `true` quando o drawer está aberto por causa de um "peek" (abriu sozinho ao adicionar algo,
   * não porque o lojista clicou no ícone) — só nesse caso o componente agenda o auto-fechamento.
   * Abrir manualmente (ícone do header, ou `toggleOrderDrawer`) desliga o auto-close: o lojista
   * pediu pra ver o pedido, não faz sentido sumir sozinho.
   */
  orderDrawerAutoClose: boolean
  /** Incrementa a cada `peekOrderDrawer()` — o componente do drawer observa esse número (não só
   * `orderDrawerOpen`) pra saber quando reiniciar o timer de auto-close, mesmo se o drawer já
   * estava aberto (ex: dois itens adicionados em sequência devem renovar os ~2s, não somar). */
  peekToken: number
  openOrderDrawer: () => void
  closeOrderDrawer: () => void
  toggleOrderDrawer: () => void
  /** "Prateleira enchendo": abre o drawer por alguns segundos a cada item adicionado, sem exigir
   * clique nenhum — ver `orderDrawerAutoClose`. Chamado de dentro de `addToCart`/`toggleCombo`,
   * não precisa ser chamado manualmente pelas telas. Não derruba um drawer aberto manualmente
   * pra modo auto-close — só "estende" um peek que já estava rolando. */
  peekOrderDrawer: () => void

  /** Carrinhos de verdade (Meus Carrinhos) — cada um com N pedidos. Mutável: cresce quando o
   * lojista fecha o pedido em montagem no drawer (ver commitCartToCarrinho). */
  carrinhos: Carrinho[]
  /**
   * Em qual carrinho o próximo "Adicionar ao carrinho" do drawer entra, sem perguntar — `null`
   * cria um carrinho novo. Setado por "Criar novo pedido neste carrinho"/"+ Adicionar itens"/
   * "Continuar comprando" dentro de um carrinho específico (aponta pra ele) e limpo por
   * "+ Novo carrinho" (força criar um novo). O drawer não interrompe o lojista pra perguntar
   * isso — se o padrão errar, dá pra mover o pedido depois (`movePedidoToCarrinho`).
   */
  activeCarrinhoId: string | null
  setActiveCarrinho: (id: string | null) => void
  /**
   * Converte o `cartItems` atual (o pedido que o lojista está montando) num `Pedido` de verdade
   * dentro do carrinho escolhido, e limpa o `cartItems` pra começar o próximo pedido do zero.
   * `carrinhoId: null` cria um carrinho novo. Retorna o id do carrinho de destino, ou `null` se
   * não havia nenhum item pra enviar (não faz sentido commitar um pedido vazio).
   */
  commitCartToCarrinho: (targetCarrinhoId: string | null) => string | null
  /**
   * Move um `Pedido` já existente de um carrinho pra outro (ou pra um carrinho novo, se
   * `targetCarrinhoId` for `null`) — a correção pontual pro caso do pedido ter caído no
   * carrinho errado. Retorna o id do carrinho de destino, ou `null` se o pedido não existe ou
   * o destino já é o próprio carrinho de origem (nada a mover).
   */
  movePedidoToCarrinho: (fromCarrinhoId: string, pedidoId: string, targetCarrinhoId: string | null) => string | null

  /**
   * Pedido em edição (aberto de volta no drawer) — `null` quando o drawer está montando um
   * pedido novo do zero. Enquanto setado, `commitCartToCarrinho` atualiza esse Pedido específico
   * em vez de criar um novo. Só pedidos com `status !== 'pago'` podem entrar aqui
   * (ver `startEditPedido`) — pago é histórico, não se edita.
   */
  editingPedido: { carrinhoId: string; pedidoId: string } | null
  /** Reidrata `cartItems`/`cartCombos` a partir de um Pedido já existente e abre o drawer pra
   * edição — substitui qualquer rascunho solto que estivesse no drawer (edição é uma sessão à
   * parte, não soma com o que já estava sendo montado). Não faz nada se o pedido já foi pago. */
  startEditPedido: (carrinhoId: string, pedidoId: string) => void
  /** Descarta a edição em andamento (não mexe no Pedido salvo) e limpa o drawer. */
  cancelEditPedido: () => void

  /** Toggle de permissão do lojista, por carrinho — simulado (ver `Carrinho.repCanEdit`). */
  setRepCanEdit: (carrinhoId: string, value: boolean) => void
  /**
   * Ação manual de "Enviar pro representante" — muda um Pedido rascunho pra "aguardando" sem
   * passar pelo drawer. Só age se a grade mínima (36 pares) já foi batida; senão não faz nada
   * (mesma trava que já existe em "Ir para pagamento" no CarrinhoDetail).
   */
  sendPedidoToRepresentante: (carrinhoId: string, pedidoId: string) => void

  /** Notificações do sino (WebTopNav) — comentário do representante, mudança de status, insight
   * do Radar. Gap mapeado desde `analise-ux-gaps-atrito-venda.md`, implementado ago/2026. */
  notifications: NotificationItem[]
  notifOpen: boolean
  toggleNotifications: () => void
  closeNotifications: () => void
  markAllNotificationsRead: () => void
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
  addToCart: (productId, qty) => {
    set((s) => {
      const nextQty = qty ?? (s.cartItems[productId] ? s.cartItems[productId] + 1 : 12)
      return { cartItems: { ...s.cartItems, [productId]: nextQty } }
    })
    get().peekOrderDrawer()
  },
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
  // Ajuste de quantidade de um item já no pedido em montagem (stepper do drawer) — diferente de
  // addToCart, não dispara peekOrderDrawer: o drawer já está aberto (é onde o stepper vive).
  setCartQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeFromCart(productId)
      return
    }
    set((s) => ({ cartItems: { ...s.cartItems, [productId]: qty } }))
  },

  cartCombos: {},
  removeCombo: (comboId) =>
    set((s) => {
      const next = { ...s.cartCombos }
      delete next[comboId]
      return { cartCombos: next }
    }),
  toggleCombo: (comboId) => {
    const s = get()
    if (s.cartCombos[comboId]) s.removeCombo(comboId)
    else {
      set({ cartCombos: { ...s.cartCombos, [comboId]: 1 } })
      s.peekOrderDrawer()
    }
  },

  orderDrawerOpen: false,
  orderDrawerAutoClose: false,
  peekToken: 0,
  openOrderDrawer: () => set({ orderDrawerOpen: true, orderDrawerAutoClose: false }),
  closeOrderDrawer: () => set({ orderDrawerOpen: false, orderDrawerAutoClose: false }),
  toggleOrderDrawer: () => set((s) => ({ orderDrawerOpen: !s.orderDrawerOpen, orderDrawerAutoClose: false })),
  peekOrderDrawer: () =>
    set((s) => ({
      orderDrawerOpen: true,
      // já aberto manualmente (autoClose:false) continua manual — peek nunca rebaixa isso.
      orderDrawerAutoClose: s.orderDrawerOpen && !s.orderDrawerAutoClose ? false : true,
      peekToken: s.peekToken + 1,
    })),

  carrinhos: initialCarrinhos,
  activeCarrinhoId: null,
  setActiveCarrinho: (id) => set({ activeCarrinhoId: id }),
  editingPedido: null,
  commitCartToCarrinho: (targetCarrinhoId) => {
    const s = get()
    const { lines, totalItems: itemsQty, totalValue: itemsValue } = cartSummary(s.cartItems)
    const { entries: comboLines, totalItems: combosQty, totalValue: combosValue } = comboSummary(s.cartCombos)
    const totalItems = itemsQty + combosQty
    if (totalItems === 0) return null

    const items: PedidoItem[] = lines.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      qty: l.qty,
      grade: gradeRangeLabel(l.product.suggestedSizes),
      value: l.value,
    }))
    // Combo vira um único PedidoItem sintético (productId = id do combo, não de um SKU real) —
    // é assim que "preço promocional = item único" se traduz pro modelo de Pedido, sem precisar
    // de um campo novo em PedidoItem. CarrinhoDetail's "Antes de fechar" simplesmente ignora esse
    // id na comparação com ano passado (não bate com nenhum SKU), o que é o comportamento certo.
    const comboItems: PedidoItem[] = comboLines.map(({ combo, cp }) => ({
      productId: combo.id,
      name: `Combo: ${cp.p1.name.replace('Tênis Tesla ', '')} + ${cp.p2.name.replace('Tênis Tesla ', '')}`,
      qty: COMBO_PARES_PER_PRODUCT * 2,
      grade: '—',
      value: cp.finalPrice,
    }))
    const allItems = [...items, ...comboItems]

    const totalValue = itemsValue + combosValue
    const pdvTotal =
      lines.reduce((sum, l) => sum + l.product.pricePdv * l.qty, 0) +
      comboLines.reduce((sum, { cp }) => sum + (cp.p1.pricePdv + cp.p2.pricePdv) * COMBO_PARES_PER_PRODUCT, 0)
    const marginPct = pdvTotal > 0 ? Math.round(((pdvTotal - totalValue) / pdvTotal) * 100) : 0

    // Editando um Pedido existente: atualiza os itens/valores dele no lugar, mantendo id/label/
    // condição de pagamento — não cria um Pedido novo nem mexe no carrinho de destino escolhido
    // no drawer (edição sempre volta pro carrinho onde o pedido já estava).
    const editing = s.editingPedido
    if (editing) {
      const carrinhos = s.carrinhos.map((c) => {
        if (c.id !== editing.carrinhoId) return c
        return {
          ...c,
          updatedAt: 'agora',
          daysSinceActivity: 0,
          pedidos: c.pedidos.map((p) => {
            if (p.id !== editing.pedidoId) return p
            const nextStatus = c.autoSendOnGradeMinima && p.status === 'rascunho' && totalItems >= GRADE_MINIMA_PARES ? 'aguardando' : p.status
            return { ...p, items: allItems, subtotal: totalValue, total: totalValue - p.discount, marginPct, status: nextStatus }
          }),
        }
      })
      set({ carrinhos, cartItems: {}, cartCombos: {}, editingPedido: null })
      return editing.carrinhoId
    }

    const { carrinhos: base, carrinho } = getOrCreateCarrinho(s.carrinhos, targetCarrinhoId)
    const status = carrinho.autoSendOnGradeMinima && totalItems >= GRADE_MINIMA_PARES ? 'aguardando' : 'rascunho'
    const pedido: Pedido = {
      id: `${carrinho.id}-p${carrinho.pedidos.length + 1}`,
      label: `Pedido ${carrinho.pedidos.length + 1}`,
      status,
      items: allItems,
      subtotal: totalValue,
      discount: 0,
      total: totalValue,
      marginPct,
      paymentCondition: '30',
      deliveryEstimateDays: 15,
    }
    const carrinhoId = carrinho.id
    const carrinhos = base.map((c) =>
      c.id === carrinhoId ? { ...c, updatedAt: 'agora', daysSinceActivity: 0, pedidos: [...c.pedidos, pedido] } : c,
    )

    set({ carrinhos, cartItems: {}, cartCombos: {}, activeCarrinhoId: carrinhoId })
    return carrinhoId
  },

  startEditPedido: (carrinhoId, pedidoId) => {
    const s = get()
    const carrinho = s.carrinhos.find((c) => c.id === carrinhoId)
    const pedido = carrinho?.pedidos.find((p) => p.id === pedidoId)
    if (!carrinho || !pedido || pedido.status === 'pago') return

    const cartItems: Record<string, number> = {}
    const cartCombos: Record<string, number> = {}
    for (const item of pedido.items) {
      if (combos.some((c) => c.id === item.productId)) cartCombos[item.productId] = 1
      else cartItems[item.productId] = item.qty
    }
    set({
      cartItems,
      cartCombos,
      editingPedido: { carrinhoId, pedidoId },
      activeCarrinhoId: carrinhoId,
      orderDrawerOpen: true,
      orderDrawerAutoClose: false,
    })
  },
  cancelEditPedido: () => set({ cartItems: {}, cartCombos: {}, editingPedido: null }),

  setRepCanEdit: (carrinhoId, value) =>
    set((s) => ({ carrinhos: s.carrinhos.map((c) => (c.id === carrinhoId ? { ...c, repCanEdit: value } : c)) })),
  sendPedidoToRepresentante: (carrinhoId, pedidoId) =>
    set((s) => ({
      carrinhos: s.carrinhos.map((c) => {
        if (c.id !== carrinhoId) return c
        return {
          ...c,
          updatedAt: 'agora',
          daysSinceActivity: 0,
          pedidos: c.pedidos.map((p) => {
            if (p.id !== pedidoId || p.status !== 'rascunho') return p
            const pares = p.items.reduce((sum, i) => sum + i.qty, 0)
            if (pares < GRADE_MINIMA_PARES) return p
            return { ...p, status: 'aguardando' }
          }),
        }
      }),
    })),

  movePedidoToCarrinho: (fromCarrinhoId, pedidoId, targetCarrinhoId) => {
    const s = get()
    const fromCarrinho = s.carrinhos.find((c) => c.id === fromCarrinhoId)
    const pedido = fromCarrinho?.pedidos.find((p) => p.id === pedidoId)
    if (!fromCarrinho || !pedido || targetCarrinhoId === fromCarrinhoId) return null

    const withoutPedido = s.carrinhos.map((c) =>
      c.id === fromCarrinhoId ? { ...c, updatedAt: 'agora', daysSinceActivity: 0, pedidos: c.pedidos.filter((p) => p.id !== pedidoId) } : c,
    )
    const { carrinhos: base, carrinho: targetCarrinho } = getOrCreateCarrinho(withoutPedido, targetCarrinhoId)
    // Renomeia id/label pro padrão do carrinho de destino — evita colidir com um pedido que já
    // exista lá com o mesmo id, e mantém "Pedido 1, 2, 3..." em ordem dentro de cada carrinho.
    const movedPedido: Pedido = {
      ...pedido,
      id: `${targetCarrinho.id}-p${targetCarrinho.pedidos.length + 1}`,
      label: `Pedido ${targetCarrinho.pedidos.length + 1}`,
    }
    const targetId = targetCarrinho.id
    const carrinhos = base.map((c) =>
      c.id === targetId ? { ...c, updatedAt: 'agora', daysSinceActivity: 0, pedidos: [...c.pedidos, movedPedido] } : c,
    )

    set({ carrinhos, activeCarrinhoId: targetId })
    return targetId
  },

  notifications: initialNotifications,
  notifOpen: false,
  toggleNotifications: () => set((s) => ({ notifOpen: !s.notifOpen })),
  closeNotifications: () => set({ notifOpen: false }),
  markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}))

// Acha o carrinho pelo id, ou cria um novo (nome sequencial "Carrinho N") se `targetId` for
// `null` ou não bater com nenhum carrinho existente — compartilhado por commitCartToCarrinho e
// movePedidoToCarrinho, os dois pontos que decidem "em qual carrinho isso entra".
function getOrCreateCarrinho(carrinhos: Carrinho[], targetId: string | null) {
  const existing = targetId ? carrinhos.find((c) => c.id === targetId) : undefined
  if (existing) return { carrinhos, carrinho: existing }
  const novo: Carrinho = {
    id: `carrinho-${Date.now()}`,
    name: `Carrinho ${carrinhos.length + 1}`,
    representative: 'Ana',
    updatedAt: 'agora',
    daysSinceActivity: 0,
    repCanEdit: true,
    autoSendOnGradeMinima: false,
    pedidos: [],
  }
  return { carrinhos: [...carrinhos, novo], carrinho: novo }
}

// Em qual carrinho o próximo "Adicionar ao carrinho" do drawer entra, sem perguntar — mesma regra
// usada por commitCartToCarrinho: o carrinho ativo (se ainda existir), senão o único que houver,
// senão `null` (cria um novo). Extraído pra cá porque tanto o OrderDrawer (rótulo "Vai para")
// quanto MeusCarrinhos (linha "ainda no drawer" no card certo) precisam do mesmo cálculo.
export function resolveTargetCarrinhoId(carrinhos: Carrinho[], activeCarrinhoId: string | null): string | null {
  if (activeCarrinhoId && carrinhos.some((c) => c.id === activeCarrinhoId)) return activeCarrinhoId
  if (carrinhos.length === 1) return carrinhos[0].id
  return null
}

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

// Pares de cada produto dentro de 1 combo (12 de cada = 24 pares no total) — fixo por enquanto,
// não tem stepper de quantidade pro combo ainda (ver cartCombos em AppState).
export const COMBO_PARES_PER_PRODUCT = 12

// Resolve cartCombos (comboId → 1) em linhas de verdade com preço calculado, na mesma forma que
// cartSummary faz pra cartItems — usado pelo drawer e pelo commitCartToCarrinho.
export function comboSummary(cartCombos: Record<string, number>) {
  const entries = Object.keys(cartCombos)
    .filter((id) => cartCombos[id] > 0)
    .map((id) => {
      const combo = combos.find((c) => c.id === id)
      if (!combo) return null
      const cp = comboPrice(combo, products)
      if (!cp) return null
      return { combo, cp }
    })
    .filter((e): e is { combo: (typeof combos)[number]; cp: NonNullable<ReturnType<typeof comboPrice>> } => e !== null)
  const totalItems = entries.length * COMBO_PARES_PER_PRODUCT * 2
  const totalValue = entries.reduce((sum, e) => sum + e.cp.finalPrice, 0)
  return { entries, totalItems, totalValue }
}

export const defaultTitular = users[0]
