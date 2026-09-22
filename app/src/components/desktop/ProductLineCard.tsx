import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product, Severity } from '../../lib/types'
import { useAppStore } from '../../lib/store'
import { formatBRL } from '../../lib/format'
import { ProductThumb } from './ProductThumb'

const DOT_SCROLL_STEP = 108 // ~3 miniaturas (30px + 6px de gap cada)

const badgeToneClass: Record<Severity, string> = {
  positive: 'pos',
  risk: 'risk',
  info: 'info',
  neutral: 'neutral',
  premium: 'info',
}

// Card vertical/minimalista (set/2026) — testado antes como protótipo (Artifact "Vitrine do
// Catálogo") e aprovado pelo usuário com dois ajustes: botão de adicionar sempre preto com a cruz
// branca (não só no hover) e miniaturas de cor 25% maiores que a versão testada (24px → 30px). Ver
// guia-dev-frontend.md pra decisão completa, incluindo o que foi deliberadamente tirado do card
// (giro/estoque, "+X% sobre a fábrica", "Mais vendida" na foto) em troca de foto grande e menos
// dado empilhado.
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
  const activeDotRef = useRef<HTMLDivElement>(null)
  // Mesma lógica de carrossel do card antigo (ver histórico) — as miniaturas de cor ficam sempre
  // visíveis agora (não só no hover), mas continuam podendo passar de uma linha só quando a linha
  // de produto tem cores demais (ex: COIL com 16 cores de teste), daí manter setas + auto-scroll
  // até a miniatura selecionada.
  const [hasOverflow, setHasOverflow] = useState(false)
  useEffect(() => {
    activeDotRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
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
  const lineName = p.name.replace(` ${p.colorway}`, '')

  // Só 1 selo em destaque na foto (em vez dos 2-3 empilhados do card antigo): risco > lançamento >
  // crescimento forte. Crescimento fraco/moderado (<20%) fica sem selo — some do card, mas
  // continua disponível na Ficha de Decisão do produto (clique na foto/nome).
  const riskBadge = p.badges.find((b) => b.tone === 'risk')
  const premiumBadge = p.badges.find((b) => b.tone === 'premium')
  const growthBadge = p.badges.find((b) => b.tone === 'positive')
  const topTag = riskBadge ?? premiumBadge ?? growthBadge
  const marginBadge = p.badges.find((b) => b.label.startsWith('Margem estimada'))

  function scrollDots(dir: -1 | 1) {
    trackRef.current?.scrollBy({ left: dir * DOT_SCROLL_STEP, behavior: 'smooth' })
  }

  return (
    <div className="pline-card">
      <div className="pline-thumb" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalogo/${p.id}`)}>
        {topTag && <span className={`pline-tag ${badgeToneClass[topTag.tone]}`}>{topTag.label}</span>}
        <ProductThumb src={p.image} alt={p.name} padding={22} />
      </div>

      {colors.length > 1 && (
        <div className="pline-dots-row">
          {hasOverflow && (
            <div className="pline-dots-arrow" onClick={() => scrollDots(-1)}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </div>
          )}
          <div className="pline-dots" ref={trackRef}>
            {colors.map((c, i) => (
              <div
                key={c.id}
                ref={i === selectedIdx ? activeDotRef : undefined}
                className={`pline-dot ${i === selectedIdx ? 'active' : ''}`}
                title={c.id === bestSellerId ? `${c.colorway} — mais vendida da linha` : c.colorway}
                onClick={() => setSelectedIdx(i)}
              >
                <ProductThumb src={c.image} alt={c.colorway} iconSize={13} padding={2} />
                {c.id === bestSellerId && (
                  <span className="pline-dot-star">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.9 5.6 21.7l1.7-7.3-5.6-4.9 7.4-.6L12 2z" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
          {hasOverflow && (
            <div className="pline-dots-arrow" onClick={() => scrollDots(1)}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </div>
          )}
        </div>
      )}

      <div className="pline-info">
        <div>
          <div className="pline-eyebrow">{p.collection}</div>
          <div className="pline-name" style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalogo/${p.id}`)}>
            {lineName}
          </div>
          <div className="pline-colorway">{p.colorway}</div>
        </div>
        <div
          className={`pline-addbtn ${inCart ? 'in-cart' : ''}`}
          style={{ cursor: 'pointer' }}
          title={inCart ? 'No carrinho' : 'Adicionar ao carrinho'}
          onClick={() => toggleCart(p.id)}
        >
          {inCart ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </div>
      </div>

      <div className="pline-priceline">
        <span className="pline-pricemain">{formatBRL(p.priceFactory)}</span>
        <span className="pline-pdv">PDV sugerido {formatBRL(p.pricePdv)}</span>
      </div>
      {marginBadge && <span className={`pline-badge ${badgeToneClass[marginBadge.tone]}`}>{marginBadge.label}</span>}
    </div>
  )
}
