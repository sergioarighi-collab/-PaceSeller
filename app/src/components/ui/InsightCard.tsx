import type { InsightCardData } from '../../lib/types'

const borderTone: Record<string, string> = {
  risk: 'border-l-risk',
  positive: 'border-l-black',
  info: 'border-l-info',
  neutral: 'border-l-border-strong',
}

const eyebrowTone: Record<string, string> = {
  risk: 'text-risk',
  positive: 'text-text-tertiary',
  info: 'text-info',
  neutral: 'text-text-tertiary',
}

export function InsightCard({ data }: { data: InsightCardData }) {
  const isPositive = data.severity === 'positive'
  return (
    <div
      className={`shrink-0 w-[208px] md:w-auto bg-surface border rounded-[4px] p-3.5 border-l-[3px] ${
        borderTone[data.severity]
      } ${isPositive ? 'border border-black border-l-black' : 'border-border'}`}
    >
      {data.opportunity && (
        <span className="inline-block bg-black text-white font-mono text-[9.5px] uppercase tracking-wide px-1.5 py-0.5 rounded-[3px] mb-2">
          Oportunidade
        </span>
      )}
      <div className={`eyebrow ${eyebrowTone[data.severity]}`}>{data.eyebrow}</div>
      <h3 className="font-display text-[15px] font-semibold text-text-primary mt-1.5 leading-tight">
        {data.title}
      </h3>
      <p className="text-xs text-text-secondary mt-1.5 leading-snug">{data.text}</p>
      <div className={`mt-2.5 text-xs font-semibold text-text-primary ${isPositive ? 'font-bold' : ''}`}>
        {data.cta} →
      </div>
    </div>
  )
}
