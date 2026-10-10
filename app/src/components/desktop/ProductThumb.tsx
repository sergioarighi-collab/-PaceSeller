const SHOE_PATH =
  'M3 15c0-1 1-1.6 2-2l3-1.4c1-.5 1.6-1.4 2-2.3.4-1 1.2-1.3 2-1 .8.4 1.6 1.6 3 2.3 1.2.6 3 .7 4.4 1 1 .2 1.6.9 1.6 1.9v2.3c0 .7-.5 1.2-1.2 1.2H4.2C3.5 17 3 16.5 3 15.8Z'

export function ProductThumb({
  src,
  alt,
  iconSize = 60,
  padding = 14,
}: {
  src: string
  alt: string
  iconSize?: number
  padding?: number
}) {
  return (
    <>
      <img
        src={src}
        alt={alt}
        // `mixBlendMode:'multiply'` (set/2026, pedido do usuário: "conseguimos tirar o fundo das
        // imagens... para não ficar o retângulo branco") — as fotos são .jpg com fundo de estúdio
        // branco, sem canal alpha (não dá pra simplesmente "remover o fundo" sem reprocessar as 39
        // imagens em `public/products/`). Multiply contra um fundo claro (ex: `.pline-thumb`, que
        // virou cinza nesse mesmo pedido) faz o branco da foto se fundir no fundo do card — mesma
        // técnica que `.pline-dot > img` (miniaturas de cor do carrossel) já usava em `mockup.css`,
        // só que agora no componente compartilhado em vez de regra de CSS por tela. Contra um fundo
        // branco de verdade o efeito é nulo (branco × branco = branco, visualmente idêntico a sem
        // blend), então é seguro pros outros lugares que usam `ProductThumb` hoje.
        style={{ width: '100%', height: '100%', objectFit: 'contain', padding, boxSizing: 'border-box', mixBlendMode: 'multiply' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null
          if (fallback) fallback.style.display = 'block'
        }}
      />
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#B0B3BA"
        strokeWidth="1.2"
        style={{ display: 'none' }}
      >
        <path d={SHOE_PATH} />
      </svg>
    </>
  )
}
