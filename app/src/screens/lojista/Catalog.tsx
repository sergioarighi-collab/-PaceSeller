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
  else if (filter === 'Boa margem') out = out.filter((p) => p.badges.some((b) => b.label.startsWith('Margem') && Number(b.label.replace(/\D/g, '')) >= 42))
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
  const [mobileSelected, setMobileSelected] = useState<string | null>(id ?? null)
  const filteredProducts = applyFilter(products, filter, query)
  const selectedId = id ?? mobileSelected ?? filteredProducts[0]?.id ?? products[0].id
  const selectedProduct = products.find((p) => p.id === selectedId) ?? products[0]

  const openProduct = (pid: string) => {
    setMobileSelected(pid)
    navigate(`/catalogo/${pid}`)
  }

  return (
    <AppShell>
      {/* Mobile: list OR detail */}
      <div className="md:hidden">
        {!mobileSelected ? (
          <div className="px-4.5 pt-4">
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
            <div className="pb-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center text-sm text-text-secondary py-10">Nenhum produto encontrado</div>
              )}
            </div>
          </div>
        ) : (
          <ProductDetailContent
            product={selectedProduct}
            onBack={() => {
              setMobileSelected(null)
              navigate('/catalogo')
            }}
            onPlan={() => navigate('/planejamento')}
            onAddToCart={() => navigate('/pedidos/o1')}
          />
        )}
      </div>

      {/* Tablet+: master-detail */}
      <div className="hidden md:flex h-screen">
        <div className="w-[360px] border-r border-border overflow-y-auto shrink-0">
          <div className="p-4 sticky top-0 bg-surface border-b border-border z-10">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos ou SKU"
              className="w-full bg-surface-2 border border-border rounded-[4px] px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none"
            />
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2.5">
              {filters.map((f) => (
                <Chip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />
              ))}
            </div>
          </div>
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/catalogo/${p.id}`)}
              className={`flex gap-3 p-3.5 border-b border-border-soft cursor-pointer ${
                selectedId === p.id ? 'bg-surface-2' : ''
              }`}
            >
              <div className="w-11.5 h-11.5 rounded-[4px] bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center">
                <img src={p.image} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-sm font-semibold text-text-primary truncate">{p.name}</div>
                <div className="text-xs text-text-secondary mt-0.5 truncate">{p.badges[0]?.label}</div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center text-sm text-text-secondary py-10">Nenhum produto encontrado</div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <ProductDetailContent
            product={selectedProduct}
            onPlan={() => navigate('/planejamento')}
            onAddToCart={() => navigate('/pedidos/o1')}
          />
        </div>
      </div>
    </AppShell>
  )
}
