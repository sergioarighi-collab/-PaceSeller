import type { Product } from '../../lib/types'
import { Button } from './Button'

export function ProductDetailContent({
  product,
  onBack,
  onPlan,
  onAddToCart,
}: {
  product: Product
  onBack?: () => void
  onPlan?: () => void
  onAddToCart?: () => void
}) {
  return (
    <div>
      <div className="h-[230px] md:h-[190px] md:rounded-[8px] bg-surface-2 relative flex items-center justify-center overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4" />
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-3.5 w-8.5 h-8.5 bg-white/90 border border-border rounded-full flex items-center justify-center text-text-primary md:hidden"
          >
            ←
          </button>
        )}
      </div>

      <div className="px-4.5 md:px-0 pt-4">
        <div className="eyebrow">{product.category}</div>
        <div className="flex items-center gap-2 mt-1">
          <h2 className="font-display text-xl font-bold text-text-primary">{product.name}</h2>
        </div>
        <div className="font-mono text-[11px] text-text-tertiary mt-0.5">SKU {product.sku}</div>

        <div className="mt-3.5 bg-surface border border-border rounded-[4px] p-3.5">
          <div className="eyebrow mb-2.5">Por que comprar este produto</div>
          {product.why.map((line) => (
            <div key={line} className="flex items-start gap-2 py-1.5 text-[12.5px] text-text-primary">
              <span className="w-[15px] h-[15px] rounded-full bg-black text-white flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                ✓
              </span>
              {line}
            </div>
          ))}
        </div>

        <div className="mt-3.5 bg-surface-2 border border-border rounded-[4px] px-3.5 py-3 text-[12.5px] font-medium text-text-primary flex items-center gap-2.5">
          📦 Reposição recomendada em {product.restockDays} dias
        </div>

        <div className="mt-4">
          <div className="eyebrow mb-2.5">Grade sugerida</div>
          <div className="flex gap-1.5 flex-wrap">
            {product.suggestedSizes.map((s) => (
              <div
                key={s.size}
                className={`w-9.5 h-9.5 rounded-[4px] border flex items-center justify-center font-mono text-xs ${
                  s.suggested
                    ? 'border-black bg-surface-2 text-text-primary font-semibold'
                    : 'border-border text-text-secondary'
                }`}
              >
                {s.size}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5 mt-6 pb-4">
          <Button variant="secondary" className="flex-1" onClick={onPlan}>
            Planejar
          </Button>
          <Button variant="primary" className="flex-1" onClick={onAddToCart}>
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </div>
  )
}
