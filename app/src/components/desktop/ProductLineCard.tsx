import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product, Severity } from '../../lib/types'
import { useAppStore } from '../../lib/store'
import { formatBRL } from '../../lib/format'
import { ProductThumb } from './ProductThumb'

const SWATCH_SCROLL_STEP = 150 // ~3 swatches (44px + 6px de gap cada)

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
  const activeSwatchRef = useRef<HTMLDivElement>(null)
  // Setas de carrossel só aparecem quando a faixa de cores realmente não cabe inteira — medido de
  // verdade (scrollWidth > clientWidth), não um número fixo de cores: a largura do card muda
  // com o viewport, então um limite chutado (ex: "acima de 7 cores") ou fica arrow morta quando
  // cabe tudo, ou deixa de aparecer quando devia. .pw-swatch-overlay começa com opacity:0 (não
  // display:none), então dá pra medir mesmo sem o card estar em hover.
  const [hasOverflow, setHasOverflow] = useState(false)
  // Garante que o swatch selecionado sempre fique inteiro visível na faixa, nunca cortado na
  // borda do scroll — sem isso, a cor selecionada por padrão podia cair bem no limite da área
  // visível (scrollLeft inicial é sempre 0) e aparecer com a foto cortada pela metade, mesmo sem
  // nenhum bug de proporção envolvido (era só a faixa nunca rolar até o item ativo). Depende
  // também de hasOverflow: quando as setas aparecem/somem, a largura útil do track muda (elas
  // roubam espaço dele), então o scroll precisa ser recalculado — sem isso, o item podia ficar
  // visível na 1ª renderização (sem overflow detectado ainda) e cortado um instante depois,
  // quando as setas apareciam e encolhiam o track.
  useEffect(() => {
    activeSwatchRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  }, [selectedIdx, hasOverflow])
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

        {/* Faixa de miniaturas por cor — só aparece no hover do card (.pcard-web:hover), some ao
            tirar o mouse. Fica sobreposta à foto (position:absolute) em vez de empurrar o corpo
            do card, então o card não muda de altura entre hover/normal nem afeta a fileira do
            grid. Quando as cores não cabem todas numa linha só (hasOverflow), ganha setas de
            carrossel (scroll nativo por baixo, sem lib nova) — nunca quebra linha. */}
        {colors.length > 1 && (
          <div className="pw-swatch-overlay" onClick={(e) => e.stopPropagation()}>
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
                  ref={i === selectedIdx ? activeSwatchRef : undefined}
                  className={`pw-swatch ${i === selectedIdx ? 'active' : ''}`}
                  title={c.id === bestSellerId ? `${c.colorway} — mais vendida da linha` : c.colorway}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIdx(i)
                  }}
                >
                  <ProductThumb src={c.image} alt={c.colorway} iconSize={19} padding={2} />
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
        )}
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
