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
      className={`flex flex-col bg-surface border rounded-[4px] overflow-hidden cursor-pointer transition-colors ${
        selected ? 'border-black' : 'border-border hover:border-border-strong'
      }`}
    >
      <div className="aspect-[4/3] bg-surface-2 flex items-center justify-center overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-3" loading="lazy" />
      </div>
      <div className="p-3.5">
        <div className="font-display text-sm font-semibold text-text-primary leading-snug">{product.name}</div>
        <div className="font-mono text-[10.5px] text-text-tertiary mt-0.5">{product.sku}</div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {product.badges.map((b) => (
            <Badge key={b.label} label={b.label} tone={b.tone} />
          ))}
        </div>
      </div>
    </div>
  )
}
