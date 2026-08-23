import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { ProductLineCard } from '../../components/desktop/ProductLineCard'
import { products, previousCollectionName, previousCollectionQty, collectionTitle } from '../../lib/data'
import { buildProductLines, deltaInfo } from '../../lib/productLines'
import { formatBRL } from '../../lib/format'

export function Planning() {
  const navigate = useNavigate()
  const lines = buildProductLines(products)
  const [qtyByCollection, setQtyByCollection] = useState<Record<string, number>>(
    Object.fromEntries(lines.map((l) => [l.collection, previousCollectionQty[l.collection] ?? 0])),
  )

  function changeQty(collection: string, delta: number) {
    setQtyByCollection((s) => ({ ...s, [collection]: Math.max(0, (s[collection] ?? 0) + delta) }))
  }

  function factoryPriceOf(line: (typeof lines)[number]) {
    return line.colors.find((c) => c.id === line.bestSellerId)?.priceFactory ?? line.colors[0].priceFactory
  }

  const prevTotalQty = lines.reduce((sum, l) => sum + (previousCollectionQty[l.collection] ?? 0), 0)
  const nowTotalQty = lines.reduce((sum, l) => sum + (qtyByCollection[l.collection] ?? 0), 0)
  const prevTotalVal = lines.reduce((sum, l) => sum + (previousCollectionQty[l.collection] ?? 0) * factoryPriceOf(l), 0)
  const nowTotalVal = lines.reduce((sum, l) => sum + (qtyByCollection[l.collection] ?? 0) * factoryPriceOf(l), 0)

  const qtyDelta = deltaInfo(prevTotalQty, nowTotalQty)
  const valDelta = deltaInfo(prevTotalVal, nowTotalVal)

  // Destaque no resumo: a linha que mais caiu vs. a coleção anterior, se a queda for relevante (>15%).
  const biggestDrop = lines
    .map((l) => {
      const prev = previousCollectionQty[l.collection] ?? 0
      const now = qtyByCollection[l.collection] ?? 0
      if (prev === 0) return null
      const pct = Math.round(((now - prev) / prev) * 100)
      return { collection: l.collection, pct }
    })
    .filter((x): x is { collection: string; pct: number } => x !== null && x.pct < -15)
    .sort((a, b) => a.pct - b.pct)[0]

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: 'Catálogo', to: '/catalogo' }, { label: 'Planejar coleção' }]} />

      <div className="context-banner">
        <div className="cb-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 4 4 5-6" />
          </svg>
        </div>
        <div>
          <div className="cb-title">Comparando com Coleção {previousCollectionName}</div>
          <div className="cb-sub">Última coleção fechada desta estação</div>
        </div>
      </div>

      <div className="web-app-layout">
        <div className="web-content">
          <div style={{ marginTop: 16 }}>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Planejar coleção</h1>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 580 }}>
              Cada linha mostra quanto você comprou na coleção anterior — ajuste a quantidade desta a partir daí, direto no card do
              catálogo.
            </div>
          </div>

          <div className="plan-summarybar" style={{ marginTop: 22 }}>
            <div className="cell">
              <div className="slabel">Pares — coleção anterior</div>
              <div className="sval">{prevTotalQty}</div>
            </div>
            <div className="cell">
              <div className="slabel">Pares — planejando agora</div>
              <div className="sval">{nowTotalQty}</div>
              {qtyDelta.tone !== 'new' && <div className={`sdelta ${qtyDelta.tone}`}>{qtyDelta.text} vs. anterior</div>}
            </div>
            <div className="cell">
              <div className="slabel">Investimento — anterior</div>
              <div className="sval" style={{ fontSize: 15.5 }}>
                {formatBRL(prevTotalVal)}
              </div>
            </div>
            <div className="cell">
              <div className="slabel">Investimento — agora</div>
              <div className="sval" style={{ fontSize: 15.5 }}>
                {formatBRL(nowTotalVal)}
              </div>
              {valDelta.tone !== 'new' && <div className={`sdelta ${valDelta.tone}`}>{valDelta.text} vs. anterior</div>}
            </div>
          </div>

          <div className="web-section-title">Linhas de produto</div>
          <div className="catgrid-web">
            {lines.map((line) => (
              <ProductLineCard
                key={line.collection}
                colors={line.colors}
                bestSellerId={line.bestSellerId}
                planning={{
                  prevQty: previousCollectionQty[line.collection] ?? 0,
                  qty: qtyByCollection[line.collection] ?? 0,
                  onChangeQty: (delta) => changeQty(line.collection, delta),
                }}
              />
            ))}
          </div>
        </div>

        <div className="web-sidebar">
          <div className="stitle">Resumo do plano</div>
          <div className="stotal">{formatBRL(nowTotalVal)}</div>
          <div className="ssub">
            {nowTotalQty} pares · {lines.length} linhas
          </div>
          {biggestDrop && (
            <div className="bubble">
              <b>{collectionTitle[biggestDrop.collection as keyof typeof collectionTitle]}</b> caiu {Math.abs(biggestDrop.pct)}% vs. a
              coleção anterior — vale conferir se foi intencional antes de enviar.
            </div>
          )}
          <div className="sbtns">
            <div className="btn-primary" style={{ cursor: 'pointer' }} onClick={() => navigate('/carrinhos')}>
              Enviar plano ao carrinho
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  )
}
