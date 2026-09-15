import { useState } from 'react'
import type { Product } from '../../lib/types'

// Quantidade default de um "Preencher sugestão" na grade em folha — mesmo valor usado há tempos
// pelo "Adicionar ao carrinho" rápido do card do Catálogo (addToCart(id, 12)), só que agora
// distribuído pelas numerações sugeridas do produto em vez de ir tudo pra uma linha só.
const GRADE_AUTOFILL_PARES = 12

interface GradeEditorProps {
  product: Product
  value: Record<string, number>
  onChange: (next: Record<string, number>) => void
}

// Grade por numeração (34–44) reutilizável — mesma UI usada na Ficha de Decisão do Catálogo
// (Catalog.tsx) e no modal de "Editar grade" aberto direto do carrinho/drawer (GradeEditModal.tsx),
// extraída pra cá pra não duplicar os dois lugares.
export function GradeEditor({ product: p, value, onChange }: GradeEditorProps) {
  // Campo "quantidade geral" — atalho pra distribuir um total escolhido pelo lojista pelas
  // numerações sugeridas de uma vez, sem substituir a grade (que continua a única fonte de
  // verdade do total; ver distributeGrade). Puramente de preenchimento, não persiste em lugar
  // nenhum, por isso fica local ao editor (não em `value`).
  const [generalQty, setGeneralQty] = useState('')
  const totalPares = Object.values(value).reduce((sum, n) => sum + n, 0)

  function setSize(size: string, v: number) {
    const qty = Math.max(0, Math.min(999, v))
    onChange({ ...value, [size]: qty })
  }

  // Distribui `total` igualmente pelas numerações sugeridas do produto — usado tanto pelo
  // "Preencher sugestão" (total fixo, GRADE_AUTOFILL_PARES) quanto pela "Quantidade geral"
  // (total escolhido pelo lojista). Substitui a grade inteira, não soma com o que já tinha.
  function distributeGrade(total: number) {
    const suggested = p.suggestedSizes.filter((s) => s.suggested)
    const perSize = Math.ceil(total / suggested.length)
    const next: Record<string, number> = {}
    suggested.forEach((s) => {
      next[s.size] = perSize
    })
    onChange(next)
  }

  function autofillGrade() {
    distributeGrade(GRADE_AUTOFILL_PARES)
  }

  function distributeGeneralQty() {
    const n = parseInt(generalQty || '0', 10)
    if (n > 0) distributeGrade(n)
  }

  return (
    <div className="gradebox">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10, gap: 12, flexWrap: 'wrap' }}>
        <div className="title" style={{ marginBottom: 0 }}>
          Grade por numeração
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Qtd. geral"
            value={generalQty}
            onChange={(e) => setGeneralQty(e.target.value)}
            className="generalqty-input"
          />
          <div className="gradefill" style={{ cursor: 'pointer' }} onClick={distributeGeneralQty}>
            Distribuir
          </div>
          <div className="gradefill" style={{ cursor: 'pointer' }} onClick={autofillGrade}>
            Preencher sugestão
          </div>
        </div>
      </div>
      <div className="sheet">
        {p.suggestedSizes.map((s) => (
          <div className={`sheetcol ${s.suggested ? 'suggested' : ''}`} key={s.size}>
            <div className="sz">{s.size}</div>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={value[s.size] || ''}
              placeholder="0"
              onChange={(e) => setSize(s.size, parseInt(e.target.value || '0', 10))}
            />
          </div>
        ))}
      </div>
      <div className="gradetotal">
        <span className="n">{totalPares}</span> {totalPares === 1 ? 'par selecionado' : 'pares selecionados'}
      </div>
    </div>
  )
}
