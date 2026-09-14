import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product, Severity } from '../../lib/types'
import { useAppStore } from '../../lib/store'
import { formatBRL } from '../../lib/format'
import { ProductThumb } from './ProductThumb'

const SWATCH_SCROLL_STEP = 108 // ~3 swatches (30px + 6px de gap cada)

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
}: {
  colors: Product[]
  bestSellerId: string
  defaultId?: string
}) {
  const navigate = useNavigate()
  const toggleCart = useAppStore((s) => s.toggleCart)
  const cartItems = useAppStore((s) => s.cartItems)
  const initialIdx = Math.max(
    0,
    colors.findIndex((c) => c.id === (defaultId ?? bestSellerId)),
  )
  const [selectedIdx, setSelectedIdx] = useState(initialIdx)
  const trackRef = useRef<HTMLDivElement>(null)
  // Setas de carrossel só aparecem quando a faixa de cores realmente não cabe inteira — medido de
  // verdade (scrollWidth > clientWidth), não um número fixo de cores: a largura do card muda
  // com o viewport, então um limite chutado (ex: "acima de 7 cores") ou fica arrow morta quando
  // cabe tudo, ou deixa de aparecer quando devia. .pw-swatch-content começa com opacity:0 (não
  // display:none), então dá pra medir mesmo sem o card estar em hover.
  const [hasOverflow, setHasOverflow] = useState(false)
  useEffect(() => {
    function checkOverflow() {
      const el = trackRef.current
      if (el) setHasOverflow(el.scrollWidth > el.clientWidth + 1)
    }
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [colors])
  const p = colors[selectedIdx]
  const inCart = Boolean(cartItems[p.id])
  const margin = Math.round(((p.pricePdv - p.priceFactory) / p.pricePdv) * 100)
  const lineName = p.name.replace(` ${p.colorway}`, '')

  function scrollSwatches(dir: -1 | 1) {
    trackRef.current?.scrollBy({ left: dir * SWATCH_SCROLL_STEP, behavior: 'smooth' })
  }

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

        {/* flex-basis garante um respiro mínimo acima do botão mesmo quando este é o
            card mais alto da fileira (onde margin-top:auto sozinho colapsaria pra 0) */}
        <div style={{ flex: '1 0 14px' }} />

        {/* Faixa de miniaturas por cor, logo acima do botão — pedido do usuário (ficou "mais
            distribuído" que sobreposta na foto). Altura sempre reservada (.pw-swatchrow-inline
            tem height fixo), só o conteúdo (.pw-swatch-content) esconde/mostra via opacity no
            hover do card — mantém o pedido anterior de "só aparece no hover" sem o card mudar de
            altura entre os dois estados (o que bagunçaria a fileira inteira no CSS Grid). Quando
            as cores não cabem numa linha só (hasOverflow), ganha setas de carrossel. */}
        {colors.length > 1 && (
          <div className="pw-swatchrow-inline">
            <div className="pw-swatch-content" onClick={(e) => e.stopPropagation()}>
              {hasOverflow && (
                <div className="pw-swatch-arrow" onClick={() => scrollSwatches(-1)}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="m15 6-6 6 6 6" />
                  </svg>
                </div>
              )}
              <div className="pw-swatch-track" ref={trackRef}>
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
              {hasOverflow && (
                <div className="pw-swatch-arrow" onClick={() => scrollSwatches(1)}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

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
      </div>
    </div>
  )
}
