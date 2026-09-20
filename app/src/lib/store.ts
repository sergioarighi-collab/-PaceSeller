import { create } from 'zustand'
import type { Persona, User, Carrinho, Pedido, PedidoItem, NotificationItem } from './types'
import { GRADE_MINIMA_PARES } from './types'
import { users, products, initialCarrinhos, initialNotifications, combos } from './data'
import { comboPrice, distributeSizesExact } from './productLines'

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

  /**
   * true depois que o lojista termina o onboarding uma vez (WizardStep2 "Ir para o meu radar")
   * ou usa o link "Já configurei, ir para o Radar" — controla se o login pula o onboarding direto
   * pro Radar. Diferente de `onboardingSkipped`: aquele é sobre a recomendação ainda ser genérica,
   * este é sobre precisar preencher o formulário de novo ou não.
   */
  profileCompleted: boolean
  completeProfile: () => void

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
   * Quantidade por numeração (34–44) do pedido em montagem — mapa esparso, nem todo `productId` de
   * `cartItems` tem entrada aqui (um item sem grade definida ainda não passou pelo "Definir grade
   * por numeração"/Ficha de Decisão). `setCartQty` (stepper genérico do drawer) **recalcula** essa
   * entrada pra nova quantidade em vez de apagar, sempre que ela já existir (ver
   * `distributeSizesExact`) — o lojista não perde uma grade já definida só por ajustar o total no
   * +/-.
   */
  cartItemSizes: Record<string, Record<string, number>>
  /** Define a quantidade por numeração de um produto — soma vira `cartItems[productId]`. Zerar
   * tudo remove o produto do pedido (mesmo comportamento de `setCartQty(id, 0)`). */
  setCartItemSizes: (productId: string, sizes: Record<string, number>) => void

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

  /** Carrinhos de verdade (Meus Carrinhos) — cada um com 1 pedido (ver `Carrinho.pedido`). Mutável:
   * o pedido cresce quando o lojista fecha o pedido em montagem no drawer (ver commitCartToCarrinho). */
  carrinhos: Carrinho[]
  /**
   * Em qual carrinho o próximo "Adicionar ao carrinho" do drawer entra, sem perguntar — `null`
   * cria um carrinho novo. Setado por "+ Adicionar itens"/"Continuar comprando" dentro de um
   * carrinho específico (aponta pra ele) e limpo por "+ Novo carrinho" (força criar um novo). O
   * drawer não interrompe o lojista pra perguntar isso — se o padrão errar, ainda dá pra trocar
   * manualmente no "trocar" do rótulo "Vai para" antes de confirmar.
   */
  activeCarrinhoId: string | null
  setActiveCarrinho: (id: string | null) => void
  /**
   * Converte o `cartItems` atual (o pedido que o lojista está montando) no `Pedido` do carrinho
   * escolhido, e limpa o `cartItems` pra começar o próximo do zero. `carrinhoId: null` cria um
   * carrinho novo (com o pedido já dentro). Se o carrinho de destino já tem um pedido em aberto
   * (`status !== 'pago'`), os itens novos são somados a esse pedido em vez de criar um segundo —
   * um carrinho só comporta 1 pedido (ver `Carrinho.pedido`). Se o pedido existente já foi pago,
   * abre um carrinho novo em vez de reabrir um histórico fechado. Retorna o id do carrinho de
   * destino, ou `null` se não havia nenhum item pra enviar.
   */
  commitCartToCarrinho: (targetCarrinhoId: string | null) => string | null

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

  profileCompleted: false,
  completeProfile: () => set({ profileCompleted: true }),

  focusOpen: false,
  openFocus: () => set({ focusOpen: true }),
  closeFocus: () => set({ focusOpen: false }),

  activeOrderId: 'o1',
  setActiveOrderId: (id) => set({ activeOrderId: id }),

  cartItems: {},
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
      const nextSizes = { ...s.cartItemSizes }
      delete nextSizes[productId]
      return { cartItems: next, cartItemSizes: nextSizes }
    }),
  toggleCart: (productId) => {
    const s = get()
    if (s.cartItems[productId]) s.removeFromCart(productId)
    else s.addToCart(productId, 12)
  },
  // Ajuste de quantidade de um item já no pedido em montagem (stepper do drawer) — diferente de
  // addToCart, não dispara peekOrderDrawer: o drawer já está aberto (é onde o stepper vive). Se o
  // produto já tinha uma grade definida (cartItemSizes), o stepper não apaga mais essa grade — ela
  // é recalculada pra nova quantidade (mesma distribuição por numeração de sempre, ver
  // distributeSizesExact), então o link continua "Editar grade" e o lojista sempre pode refinar a
  // distribuição de novo. Sem isso, um simples "+1" no stepper resetava a grade que o lojista tinha
  // acabado de montar, obrigando a redefinir do zero — friccão real reportada pelo usuário.
  setCartQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeFromCart(productId)
      return
    }
    set((s) => {
      const nextSizes = { ...s.cartItemSizes }
      const product = products.find((p) => p.id === productId)
      if (nextSizes[productId] && product) {
        nextSizes[productId] = distributeSizesExact(product, qty)
      } else {
        delete nextSizes[productId]
      }
      return { cartItems: { ...s.cartItems, [productId]: qty }, cartItemSizes: nextSizes }
    })
  },

  cartItemSizes: {},
  setCartItemSizes: (productId, sizes) => {
    const qty = Object.values(sizes).reduce((sum, n) => sum + n, 0)
    if (qty <= 0) {
      get().removeFromCart(productId)
      return
    }
    set((s) => ({
      cartItems: { ...s.cartItems, [productId]: qty },
      cartItemSizes: { ...s.cartItemSizes, [productId]: sizes },
    }))
    get().peekOrderDrawer()
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

    const items: PedidoItem[] = lines.map((l) => {
      const sizes = s.cartItemSizes[l.product.id]
      return {
        productId: l.product.id,
        name: l.product.name,
        qty: l.qty,
        grade: sizes ? gradeLabelFromSizes(sizes) : gradeRangeLabel(l.product.suggestedSizes),
        value: l.value,
        sizes,
      }
    })
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

    // Editando o Pedido existente: atualiza os itens/valores dele no lugar, mantendo id/label/
    // condição de pagamento — não cria um Pedido novo (edição sempre volta pro carrinho onde o
    // pedido já estava).
    const editing = s.editingPedido
    if (editing) {
      const carrinhos = s.carrinhos.map((c) => {
        if (c.id !== editing.carrinhoId) return c
        // Editar um pedido que já foi enviado pra aprovação ("aguardando" sem ser sugestão da
        // Ana) reabre a aprovação: volta pra rascunho, porque o conteúdo que ela estava avaliando
        // mudou (ver ConfirmModal em CarrinhoDetail/MeusCarrinhos, que avisa isso antes de deixar
        // editar). Sugestão da Ana (`suggestedBy === 'representante'`) não entra aqui — hoje não
        // tem CTA de editar pra esse caso (o lojista revisa/aprova, não edita direto).
        const baseStatus = c.pedido.status === 'aguardando' && !c.pedido.suggestedBy ? 'rascunho' : c.pedido.status
        const nextStatus = c.autoSendOnGradeMinima && baseStatus === 'rascunho' && totalItems >= GRADE_MINIMA_PARES ? 'aguardando' : baseStatus
        return {
          ...c,
          updatedAt: 'agora',
          daysSinceActivity: 0,
          pedido: { ...c.pedido, items: allItems, subtotal: totalValue, total: totalValue - c.pedido.discount, marginPct, status: nextStatus },
        }
      })
      set({ carrinhos, cartItems: {}, cartCombos: {}, cartItemSizes: {}, editingPedido: null })
      return editing.carrinhoId
    }

    const existing = targetCarrinhoId ? s.carrinhos.find((c) => c.id === targetCarrinhoId) : undefined

    // Carrinho de destino já tem um pedido em aberto: soma os itens novos nele em vez de criar um
    // segundo pedido (um carrinho só comporta 1 — ver Carrinho.pedido). Pedido já pago é histórico
    // fechado, não recebe itens novos; nesse caso cai pro branch abaixo e abre um carrinho novo.
    if (existing && existing.pedido.status !== 'pago') {
      const mergedItems = mergePedidoItems(existing.pedido.items, allItems)
      const mergedSubtotal = existing.pedido.subtotal + totalValue
      const mergedMarginPct =
        mergedSubtotal > 0 ? Math.round((existing.pedido.marginPct * existing.pedido.subtotal + marginPct * totalValue) / mergedSubtotal) : marginPct
      const mergedPares = mergedItems.reduce((sum, i) => sum + i.qty, 0)
      const nextStatus =
        existing.autoSendOnGradeMinima && existing.pedido.status === 'rascunho' && mergedPares >= GRADE_MINIMA_PARES ? 'aguardando' : existing.pedido.status
      const carrinhos = s.carrinhos.map((c) =>
        c.id === existing.id
          ? {
              ...c,
              updatedAt: 'agora',
              daysSinceActivity: 0,
              pedido: {
                ...c.pedido,
                items: mergedItems,
                subtotal: mergedSubtotal,
                total: mergedSubtotal - c.pedido.discount,
                marginPct: mergedMarginPct,
                status: nextStatus,
              },
            }
          : c,
      )
      set({ carrinhos, cartItems: {}, cartCombos: {}, cartItemSizes: {}, activeCarrinhoId: existing.id })
      return existing.id
    }

    // Carrinho novo nasce com autoSendOnGradeMinima desligado (só o lojista liga depois, ver
    // permswitch em CarrinhoDetail), então o pedido sempre começa como rascunho.
    const novoPedido: Pedido = {
      id: `pedido-${Date.now()}`,
      label: 'Pedido',
      status: 'rascunho',
      items: allItems,
      subtotal: totalValue,
      discount: 0,
      total: totalValue,
      marginPct,
      paymentCondition: '30',
      deliveryEstimateDays: 15,
    }
    const novoCarrinho: Carrinho = {
      id: `carrinho-${Date.now()}`,
      name: `Carrinho ${s.carrinhos.length + 1}`,
      representative: 'Ana',
      updatedAt: 'agora',
      daysSinceActivity: 0,
      repCanEdit: true,
      autoSendOnGradeMinima: false,
      pedido: novoPedido,
    }
    const carrinhos = [...s.carrinhos, novoCarrinho]

    set({ carrinhos, cartItems: {}, cartCombos: {}, cartItemSizes: {}, activeCarrinhoId: novoCarrinho.id })
    return novoCarrinho.id
  },

  startEditPedido: (carrinhoId, pedidoId) => {
    const s = get()
    const carrinho = s.carrinhos.find((c) => c.id === carrinhoId)
    if (!carrinho || carrinho.pedido.id !== pedidoId || carrinho.pedido.status === 'pago') return
    const pedido = carrinho.pedido

    const cartItems: Record<string, number> = {}
    const cartCombos: Record<string, number> = {}
    const cartItemSizes: Record<string, Record<string, number>> = {}
    for (const item of pedido.items) {
      if (combos.some((c) => c.id === item.productId)) cartCombos[item.productId] = 1
      else {
        cartItems[item.productId] = item.qty
        if (item.sizes) cartItemSizes[item.productId] = item.sizes
      }
    }
    set({
      cartItems,
      cartCombos,
      cartItemSizes,
      editingPedido: { carrinhoId, pedidoId },
      activeCarrinhoId: carrinhoId,
      orderDrawerOpen: true,
      orderDrawerAutoClose: false,
    })
  },
  cancelEditPedido: () => set({ cartItems: {}, cartCombos: {}, cartItemSizes: {}, editingPedido: null }),

  setRepCanEdit: (carrinhoId, value) =>
    set((s) => ({ carrinhos: s.carrinhos.map((c) => (c.id === carrinhoId ? { ...c, repCanEdit: value } : c)) })),
  sendPedidoToRepresentante: (carrinhoId, pedidoId) =>
    set((s) => ({
      carrinhos: s.carrinhos.map((c) => {
        if (c.id !== carrinhoId || c.pedido.id !== pedidoId || c.pedido.status !== 'rascunho') return c
        const pares = c.pedido.items.reduce((sum, i) => sum + i.qty, 0)
        if (pares < GRADE_MINIMA_PARES) return c
        return { ...c, updatedAt: 'agora', daysSinceActivity: 0, pedido: { ...c.pedido, status: 'aguardando' } }
      }),
    })),

  notifications: initialNotifications,
  notifOpen: false,
  toggleNotifications: () => set((s) => ({ notifOpen: !s.notifOpen })),
  closeNotifications: () => set({ notifOpen: false }),
  markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}))

// Soma um `sizes` (mapa numeração→qtd) da grade em folha em outro — usado quando o mesmo produto
// já estava no pedido do carrinho e o lojista adiciona mais dele numa sessão nova do drawer.
function mergeSizeMaps(a: Record<string, number> | undefined, b: Record<string, number> | undefined) {
  if (!a && !b) return undefined
  const out: Record<string, number> = { ...(a ?? {}) }
  for (const [size, qty] of Object.entries(b ?? {})) out[size] = (out[size] ?? 0) + qty
  return out
}

// Junta os itens de um pedido já existente no carrinho com os itens do `cartItems` que acabou de
// ser commitado — mesmo productId soma qty/value (e a grade em folha, se houver dos dois lados);
// productId novo só entra na lista. Usado quando "Continuar comprando"/"+ Adicionar itens" manda
// mais coisa pro mesmo carrinho: como um carrinho só tem 1 pedido, isso vira um merge, não um
// pedido novo (ver comitCartToCarrinho).
function mergePedidoItems(existing: PedidoItem[], incoming: PedidoItem[]): PedidoItem[] {
  const merged = existing.map((i) => ({ ...i }))
  for (const inc of incoming) {
    const found = merged.find((i) => i.productId === inc.productId)
    if (!found) {
      merged.push({ ...inc })
      continue
    }
    const sizes = mergeSizeMaps(found.sizes, inc.sizes)
    found.qty += inc.qty
    found.value += inc.value
    found.sizes = sizes
    found.grade = sizes ? gradeLabelFromSizes(sizes) : inc.grade
  }
  return merged
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

export function pedidoPares(pedido: Pedido): number {
  return pedido.items.reduce((sum, i) => sum + i.qty, 0)
}

// Qual ação faz sentido oferecer pra esse Pedido — usado tanto em MeusCarrinhos (linha condensada)
// quanto em CarrinhoDetail (og-head), pra não duplicar a mesma árvore de decisão nos dois lugares.
export type PedidoActionKind = 'acompanhar' | 'revisar' | 'enviar' | 'editar'
export function pedidoActionKind(pedido: Pedido): PedidoActionKind {
  if (pedido.status === 'pago') return 'acompanhar'
  if (pedido.status === 'aguardando' && pedido.suggestedBy === 'representante') return 'revisar'
  if (pedido.status === 'rascunho' && pedidoPares(pedido) >= GRADE_MINIMA_PARES) return 'enviar'
  return 'editar'
}

export interface PedidoStatusBadge {
  label: string
  tone: 'neutral' | 'info' | 'positive'
}

// Rótulo/tom do badge de status pensado em "de quem é a vez agora" — os dois casos de
// `status === 'aguardando'` mostravam o mesmo texto genérico ("Aguardando aprovação"), mas são
// exatamente opostos: o lojista mandou o pedido e está esperando a Ana aprovar (bola com ela,
// nada pro lojista fazer agora — tom neutro/quieto) vs. a Ana sugeriu/editou um pedido e está
// esperando o lojista revisar (bola com o lojista — tom de atenção, mesmo azul já usado no
// bulkrow.review de MeusCarrinhos pra "Ana sugeriu X pedido(s)"). `representativeName` (normalmente
// `cart.representative`) entra no rótulo pra ficar concreto ("Aguardando Ana") em vez de genérico.
export function pedidoStatusBadge(pedido: Pedido, representativeName: string): PedidoStatusBadge {
  // "Com a Tesla" (não "Confirmado" nem "Enviado") — pago já saiu da mão do lojista e da
  // representante, mas ainda tem processo interno de fábrica antes de virar produção de verdade
  // (ver trackingSteps em data.ts: confirmado → em produção → enviado → entregue). "Confirmado"
  // soava igual ao botão "Confirmar pedido" do pagamento; "Enviado" colidiria com a etapa de
  // tracking que já significa "saiu da fábrica pra loja" — daí um rótulo neutro sobre posse, não
  // sobre etapa de produção.
  if (pedido.status === 'pago') return { label: 'Com a Tesla', tone: 'positive' }
  if (pedido.status === 'aguardando') {
    if (pedido.suggestedBy === 'representante') return { label: 'Aguardando você — revisar', tone: 'info' }
    return { label: `Aguardando ${representativeName}`, tone: 'neutral' }
  }
  if (pedido.status === 'rascunho' && pedidoPares(pedido) >= GRADE_MINIMA_PARES) return { label: 'Pronto pra enviar', tone: 'positive' }
  return { label: 'Rascunho', tone: 'neutral' }
}

// Faixa de grade sugerida pro pedido gerado a partir do cartItems — deriva do miolo de
// `suggestedSizes` (as numerações centrais marcadas como sugeridas), mesma lógica visual do
// "Grade sugerida" na Ficha de Decisão do Catálogo.
function gradeRangeLabel(sizes: { size: string; suggested: boolean }[]) {
  const suggested = sizes.filter((s) => s.suggested)
  const pick = suggested.length > 0 ? suggested : sizes
  return `${pick[0].size}–${pick[pick.length - 1].size}`
}

// Faixa de grade real, a partir da numeração que o lojista de fato escolheu na "grade em folha"
// da Ficha de Decisão — usada no lugar de gradeRangeLabel sempre que o item tem cartItemSizes.
export function gradeLabelFromSizes(sizes: Record<string, number>) {
  const active = Object.entries(sizes)
    .filter(([, qty]) => qty > 0)
    .map(([size]) => size)
    .sort()
  if (active.length === 0) return '—'
  return `${active[0]}–${active[active.length - 1]}`
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
