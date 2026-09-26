import { useState } from 'react'
import type { Product } from '../../lib/types'
import { WebModal } from './WebModal'

interface GradeEditAllModalProps {
  lines: { product: Product; qty: number }[]
  initialSizesByProduct: Record<string, Record<string, number>>
  onClose: () => void
  onSave: (sizesByProduct: Record<string, Record<string, number>>) => void
}

// Alternativa ao "Editar grade" item a item (GradeEditModal, um produto por vez): edita a
// numeração de todos os itens do pedido numa tabela só, pra quem prefere ajustar tudo de uma vez
// em vez de abrir um modal por produto. Mesma faixa de numeração pra todo produto (34–44, ver
// buildSizes em data.ts), então a lista de colunas vem só do primeiro item — não muda por linha.
export function GradeEditAllModal({ lines, initialSizesByProduct, onClose, onSave }: GradeEditAllModalProps) {
  const [sizesByProduct, setSizesByProduct] = useState(initialSizesByProduct)
  const sizes = lines[0]?.product.suggestedSizes.map((s) => s.size) ?? []

  function setSize(productId: string, size: string, v: number) {
    const qty = Math.max(0, Math.min(999, v))
    setSizesByProduct((prev) => ({ ...prev, [productId]: { ...prev[productId], [size]: qty } }))
  }

  function rowTotal(productId: string) {
    return Object.values(sizesByProduct[productId] ?? {}).reduce((sum, n) => sum + n, 0)
  }
  const grandTotal = lines.reduce((sum, { product }) => sum + rowTotal(product.id), 0)
  const canSave = lines.every(({ product }) => rowTotal(product.id) > 0)

  return (
    <WebModal
      title="Editar grades de todos os itens"
      subtitle="Ajuste a numeração de cada produto na mesma tela"
      onClose={onClose}
      width={820}
      footer={
        <>
          <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={onClose}>
            Cancelar
          </div>
          <div
            className="btn-primary"
            style={{ cursor: canSave ? 'pointer' : 'not-allowed', opacity: canSave ? 1 : 0.5 }}
            onClick={() => canSave && onSave(sizesByProduct)}
          >
            Salvar grades
          </div>
        </>
      }
    >
      <div className="gradeall-body">
        <div className="gradeall-row gradeall-head">
          <div className="gradeall-name" />
          {sizes.map((size) => (
            <div className="gradeall-cell gradeall-sz" key={size}>
              {size}
            </div>
          ))}
          <div className="gradeall-total" />
        </div>
        {lines.map(({ product }) => (
          <div className="gradeall-row" key={product.id}>
            <div className="gradeall-name">{product.name}</div>
            {product.suggestedSizes.map((s) => (
              <div className={`gradeall-cell ${s.suggested ? 'suggested' : ''}`} key={s.size}>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={sizesByProduct[product.id]?.[s.size] || ''}
                  placeholder="0"
                  onChange={(e) => setSize(product.id, s.size, parseInt(e.target.value || '0', 10))}
                />
              </div>
            ))}
            <div className="gradeall-total">{rowTotal(product.id)}</div>
          </div>
        ))}
      </div>
      <div className="gradetotal" style={{ padding: '10px 20px 16px' }}>
        <span className="n">{grandTotal}</span> {grandTotal === 1 ? 'par selecionado' : 'pares selecionados'} no total
      </div>
    </WebModal>
  )
}
