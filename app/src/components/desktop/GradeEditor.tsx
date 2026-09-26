import { useState } from 'react'
import type { Product } from '../../lib/types'
import { distributeSizesExact, suggestedGradeQty } from '../../lib/productLines'

interface GradeEditorProps {
  product: Product
  value: Record<string, number>
  onChange: (next: Record<string, number>) => void
}

// Grade por numeração (34–44) reutilizável — mesma UI usada na Ficha de Decisão do Catálogo
// (Catalog.tsx) e no modal de "Editar grade" aberto direto do carrinho/drawer (GradeEditModal.tsx),
// extraída pra cá pra não duplicar os dois lugares.
export function GradeEditor({ product: p, value, onChange }: GradeEditorProps) {
  // Sugestão baseada em dado real do produto (giro/restockDays — ver suggestedGradeQty), não um
  // número fixo igual pra todo mundo. Recalculada a cada produto (não guardada em state), já que
  // não é algo que o lojista edita — é só o ponto de partida do campo e o texto de "Preencher
  // sugestão".
  const suggestion = suggestedGradeQty(p)

  // Campo "quantidade geral" — atalho pra distribuir um total escolhido pelo lojista pelas
  // numerações sugeridas de uma vez, sem substituir a grade (que continua a única fonte de
  // verdade do total; ver distributeGeneralQty). Começa com a sugestão de dados já preenchida.
  // Puramente de preenchimento, não persiste em lugar nenhum, por isso fica local ao editor (não
  // em `value`).
  const [generalQty, setGeneralQty] = useState(String(suggestion.qty))
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

  // "Preencher sugestão" sempre volta pro número calculado a partir do giro do produto, não
  // importa o que estiver digitado no campo no momento — diferente de "Distribuir", que nunca
  // deveria decidir por conta própria um número diferente do que o lojista escreveu.
  function fillSuggestion() {
    setGeneralQty(String(suggestion.qty))
    onChange(distributeSizesExact(p, suggestion.qty))
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
          <div className="gradefill" style={{ cursor: 'pointer' }} onClick={fillSuggestion}>
            Preencher sugestão
          </div>
        </div>
      </div>
      <div className="gradehint">
        {suggestion.reason} — "Preencher sugestão" aplica esse número, ou digite outro total ao lado e clique "Distribuir".
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
