import { useState } from 'react'
import type { Product } from '../../lib/types'
import { distributeSizesExact } from '../../lib/productLines'

// Quantidade geral default — mesmo valor histórico do "Adicionar ao carrinho" rápido do card do
// Catálogo (addToCart(id, 12), uma grade fechada de fábrica) e do antigo "Preencher sugestão",
// que foi removido daqui: eram dois botões fazendo quase a mesma coisa (distribuir pelas
// numerações sugeridas), um com total fixo e outro variável — pré-preencher o campo com 12 dá o
// mesmo resultado de um clique só, sem precisar de um segundo botão.
const GRADE_PADRAO_PARES = 12

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
  // verdade do total; ver distributeGeneralQty). Pré-preenchido com a grade padrão (12) pra
  // "Distribuir" sem mexer em nada já dar o resultado mais comum. Puramente de preenchimento, não
  // persiste em lugar nenhum, por isso fica local ao editor (não em `value`).
  const [generalQty, setGeneralQty] = useState(String(GRADE_PADRAO_PARES))
  const totalPares = Object.values(value).reduce((sum, n) => sum + n, 0)

  function setSize(size: string, v: number) {
    const qty = Math.max(0, Math.min(999, v))
    onChange({ ...value, [size]: qty })
  }

  // Distribui exatamente o número digitado pelas numerações sugeridas do produto — substitui a
  // grade inteira, não soma com o que já tinha. Sem arredondar pra nenhum múltiplo: uma tentativa
  // anterior de sempre fechar em dúzias (arredondando pra cima) foi abandonada porque o número que
  // o lojista digitava não era respeitado (digitar 9 virava 12 sem aviso nenhum) — "Distribuir" só
  // faz sentido se confirma o que está escrito no campo.
  function distributeGeneralQty() {
    const n = parseInt(generalQty || '0', 10)
    if (n > 0) onChange(distributeSizesExact(p, n))
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
        </div>
      </div>
      <div className="gradehint">
        Distribui o total ao lado igualmente pelas numerações sugeridas (destacadas), substituindo a grade atual — ajuste os campos abaixo se quiser algo diferente.
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
