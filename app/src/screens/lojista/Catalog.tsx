import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Chip } from '../../components/ui/Chip'
import { ProductCard } from '../../components/ui/ProductCard'
import { ProductDetailContent } from '../../components/ui/ProductDetail'
import { products } from '../../lib/data'

const filters = ['Recomendado p/ você', 'Alto giro', 'Boa margem', 'Lançamentos']

function applyFilter(list: typeof products, filter: string, query: string) {
  let out = list
  if (filter === 'Alto giro') out = out.filter((p) => p.restockDays <= 32)
  else if (filter === 'Boa margem')
    out = out.filter((p) => p.badges.some((b) => b.label.startsWith('Margem') && Number(b.label.replace(/\D/g, '')) >= 42))
  else if (filter === 'Lançamentos') out = out.filter((p) => p.badges.some((b) => b.tone === 'premium'))

  if (query.trim()) {
    const q = query.trim().toLowerCase()
    out = out.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }
  return out
}

export function Catalog() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [filter, setFilter] = useState(filters[0])
  const [query, setQuery] = useState('')
  const filteredProducts = applyFilter(products, filter, query)
  const selectedProduct = products.find((p) => p.id === id)

  if (selectedProduct) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto md:pt-8">
          <ProductDetailContent
            product={selectedProduct}
            onBack={() => navigate('/catalogo')}
            onPlan={() => navigate('/planejamento')}
            onAddToCart={() => navigate('/pedidos/o1')}
          />
          <button
            onClick={() => navigate('/catalogo')}
            className="hidden md:block text-sm text-text-secondary mt-2 mb-6"
          >
            ← Voltar ao catálogo
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4.5 md:px-8 pt-4 md:pt-8 pb-8">
        <h2 className="hidden md:block font-display text-lg font-bold text-text-primary mb-4">
          Catálogo Inteligente
        </h2>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produtos ou SKU"
            className="flex-1 bg-surface-2 border border-border rounded-[4px] px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none"
          />
          <div className="w-9.5 h-9.5 bg-surface-2 border border-border rounded-[4px] flex items-center justify-center text-text-secondary shrink-0">
            ⚙
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2.5">
          {filters.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-5">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => navigate(`/catalogo/${p.id}`)} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center text-sm text-text-secondary py-16">Nenhum produto encontrado</div>
        )}
      </div>
    </AppShell>
  )
}
