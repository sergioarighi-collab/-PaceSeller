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
      <div className="w-[74px] h-[74px] rounded-[4px] shrink-0 bg-gradient-to-br from-surface-3 to-surface-2" />
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm font-semibold text-text-primary">{product.name}</div>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {product.badges.map((b) => (
            <Badge key={b.label} label={b.label} tone={b.tone} />
          ))}
        </div>
      </div>
    </div>
  )
}
