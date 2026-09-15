import { useState } from 'react'
import type { Product } from '../../lib/types'
import { WebModal } from './WebModal'
import { GradeEditor } from './GradeEditor'

interface GradeEditModalProps {
  product: Product
  initialSizes: Record<string, number>
  onClose: () => void
  onSave: (sizes: Record<string, number>) => void
}

// Editar a grade por numeração de um item que já está no pedido em montagem sem sair pro Catálogo
// (antes o link "Editar grade" navegava pra Ficha de Decisão em /catalogo/:id — o lojista pediu
// pra resolver isso num modal, sem perder o contexto do carrinho/drawer que estava editando).
export function GradeEditModal({ product, initialSizes, onClose, onSave }: GradeEditModalProps) {
  const [sizeQty, setSizeQty] = useState(initialSizes)
  const totalPares = Object.values(sizeQty).reduce((sum, n) => sum + n, 0)

  return (
    <WebModal title={`Editar grade — ${product.name}`} onClose={onClose} width={560}
      footer={
        <>
          <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={onClose}>
            Cancelar
          </div>
          <div
            className="btn-primary"
            style={{ cursor: totalPares > 0 ? 'pointer' : 'not-allowed', opacity: totalPares > 0 ? 1 : 0.5 }}
            onClick={() => totalPares > 0 && onSave(sizeQty)}
          >
            Salvar grade
          </div>
        </>
      }
    >
      <div style={{ padding: '8px 20px 20px' }}>
        <GradeEditor product={product} value={sizeQty} onChange={setSizeQty} />
      </div>
    </WebModal>
  )
}
