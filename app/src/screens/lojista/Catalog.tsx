import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Chip } from '../../components/ui/Chip'
import { ProductCard } from '../../components/ui/ProductCard'
import { ProductDetailContent } from '../../components/ui/ProductDetail'
import { products } from '../../lib/data'

const filters = ['Recomendado p/ você', 'Alto giro', 'Boa margem', 'Lançamentos']

export function Catalog() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [filter, setFilter] = useState(filters[0])
  const [mobileSelected, setMobileSelected] = useState<string | null>(id ?? null)
  const selectedId = id ?? mobileSelected ?? products[0].id
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
              <div className="flex-1 bg-surface-2 border border-border rounded-[4px] px-3 py-2.5 text-[13px] text-text-tertiary">
                Buscar produtos
              </div>
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
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
              ))}
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
          <div className="p-4 sticky top-0 bg-surface border-b border-border">
            <div className="bg-surface-2 border border-border rounded-[4px] px-3 py-2.5 text-[13px] text-text-tertiary">
              Buscar produtos
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2.5">
              {filters.map((f) => (
                <Chip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />
              ))}
            </div>
          </div>
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/catalogo/${p.id}`)}
              className={`flex gap-3 p-3.5 border-b border-border-soft cursor-pointer ${
                selectedId === p.id ? 'bg-surface-2' : ''
              }`}
            >
              <div className="w-11.5 h-11.5 rounded-[4px] bg-gradient-to-br from-surface-3 to-surface-2 shrink-0" />
              <div className="min-w-0">
                <div className="font-display text-sm font-semibold text-text-primary truncate">{p.name}</div>
                <div className="text-xs text-text-secondary mt-0.5 truncate">{p.badges[0]?.label}</div>
              </div>
            </div>
          ))}
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
