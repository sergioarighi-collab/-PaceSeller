import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product, Severity } from '../../lib/types'
import { useAppStore } from '../../lib/store'
import { formatBRL } from '../../lib/format'
import { deltaInfo } from '../../lib/productLines'
import { ProductThumb } from './ProductThumb'

const badgeToneClass: Record<Severity, string> = {
  positive: 'pos',
  risk: 'risk',
  info: 'info',
  neutral: 'neutral',
  premium: 'info',
}

export function ProductLineCard({
  colors,
  bestSellerId,
  defaultId,
  planning,
}: {
  colors: Product[]
  bestSellerId: string
  defaultId?: string
  // Presente só na tela "Planejar" — troca o botão "Adicionar ao carrinho" pela comparação
  // com a coleção anterior (mesmo card, mesma foto, ver docs/guia-dev-frontend.md).
  planning?: { prevQty: number; qty: number; onChangeQty: (delta: number) => void }
}) {
  const navigate = useNavigate()
  const toggleCart = useAppStore((s) => s.toggleCart)
  const isInCart = useAppStore((s) => s.isInCart)
  const initialIdx = Math.max(
    0,
    colors.findIndex((c) => c.id === (defaultId ?? bestSellerId)),
  )
  const [selectedIdx, setSelectedIdx] = useState(initialIdx)
  const p = colors[selectedIdx]
  const inCart = isInCart(p.id)
  const margin = Math.round(((p.pricePdv - p.priceFactory) / p.pricePdv) * 100)
  const lineName = p.name.replace(` ${p.colorway}`, '')

  return (
    <div className="pcard-web">
      <div className="pw-thumb" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalogo/${p.id}`)}>
        {p.id === bestSellerId && (
          <div className="pw-instock" style={{ background: 'var(--black)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.9 5.6 21.7l1.7-7.3-5.6-4.9 7.4-.6L12 2z" />
            </svg>
            Mais vendida
          </div>
        )}
        <ProductThumb src={p.image} alt={p.name} />
      </div>
      <div className="pw-body">
        <div className="pw-name" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalogo/${p.id}`)}>
          {lineName}
        </div>
        <div className="pw-colorway">{p.colorway}</div>
        <div className="pw-priceblock">
          <div className="pw-pricemain">
            {formatBRL(p.priceFactory)}
            <span className="pw-tax-tag">fábrica</span>
          </div>
          <div className="pw-pdvrow">
            <span className="pw-pdvlabel">PDV sugerido {formatBRL(p.pricePdv)}</span>
            <span className="pw-margintag">+{margin}% sobre a fábrica</span>
          </div>
        </div>
        <div className="pw-badgerow">
          {p.badges.slice(0, 2).map((b, i) => (
            <span className={`badge ${badgeToneClass[b.tone]}`} key={i}>
              {b.label}
            </span>
          ))}
        </div>

        {colors.length > 1 && (
          <div className="pw-swatchrow">
            {colors.map((c, i) => (
              <div
                key={c.id}
                className={`pw-swatch ${i === selectedIdx ? 'active' : ''}`}
                title={c.id === bestSellerId ? `${c.colorway} — mais vendida da linha` : c.colorway}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIdx(i)
                }}
              >
                <ProductThumb src={c.image} alt={c.colorway} iconSize={13} padding={2} />
                {c.id === bestSellerId && (
                  <span className="pw-swatch-star">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.9 5.6 21.7l1.7-7.3-5.6-4.9 7.4-.6L12 2z" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* flex-basis garante um respiro mínimo acima do botão/comparação mesmo quando este é o
            card mais alto da fileira (onde margin-top:auto sozinho colapsaria pra 0) */}
        <div style={{ flex: '1 0 14px' }} />

        {planning ? (
          <div className="pw-compare">
            <div className="pw-compare-prev">
              Coleção anterior: <b>{planning.prevQty > 0 ? `${planning.prevQty} pares` : 'não comprou'}</b>
            </div>
            <div className="pw-compare-now">
              <span className="pw-compare-label">Planejando agora</span>
              <div className="stepper">
                <div className="stepbtn" style={{ cursor: 'pointer' }} onClick={() => planning.onChangeQty(-1)}>
                  −
                </div>
                <div className="qty">{planning.qty}</div>
                <div className="stepbtn" style={{ cursor: 'pointer' }} onClick={() => planning.onChangeQty(1)}>
                  +
                </div>
              </div>
              {(() => {
                const d = deltaInfo(planning.prevQty, planning.qty)
                return <span className={`deltabadge ${d.tone}`}>{d.text}</span>
              })()}
            </div>
          </div>
        ) : (
          <div className={`pw-addbtn ${inCart ? 'in-cart' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleCart(p.id)}>
            {inCart ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                No carrinho
              </>
            ) : (
              'Adicionar ao carrinho'
            )}
          </div>
        )}
      </div>
    </div>
  )
}
