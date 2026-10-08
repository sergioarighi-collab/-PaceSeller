// Ícone de carrinho (set/2026, pedido do usuário: "na aba carrinhos... podemos trazer ícones de
// carrinhos, no lugar dos itens atuais") — usado só na visão "Carrinhos" do Radar do representante
// (`RepRadar.tsx`), no lugar do `SinalIcon` (que varia a FORMA por tipo de sinal). Aqui a forma é
// sempre a mesma — reforça que o card é sobre um carrinho — e quem comunica a situação é só a cor
// do `.kicon`/`.web-icard` ao redor (ver `tone` em `LojistaSinal`, store.ts).
export function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
