import type { Product } from '../../lib/types'
import { Badge } from './Badge'

export function ProductCard({
  product,
  selected,
  onClick,
}: {
  product: Product
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex gap-3 bg-surface border rounded-[4px] p-3 mt-2.5 md:mt-0 cursor-pointer ${
        selected ? 'border-black' : 'border-border'
      }`}
    >
      <div className="w-[74px] h-[74px] rounded-[4px] shrink-0 bg-surface-2 overflow-hidden flex items-center justify-center">
        <img src={product.image} alt={product.name} className="w-full h-full object-contain" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm font-semibold text-text-primary">{product.name}</div>
        <div className="font-mono text-[10.5px] text-text-tertiary mt-0.5">{product.sku}</div>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {product.badges.map((b) => (
            <Badge key={b.label} label={b.label} tone={b.tone} />
          ))}
        </div>
      </div>
    </div>
  )
}
