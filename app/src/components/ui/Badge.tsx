import type { Severity } from '../../lib/types'

const tones: Record<string, string> = {
  positive: 'bg-positive-dim text-positive',
  risk: 'bg-risk-dim text-risk',
  info: 'bg-info-dim text-info',
  neutral: 'bg-surface-2 text-text-secondary border border-border-soft',
}

export function Badge({ label, tone }: { label: string; tone: Severity }) {
  return <span className={`text-[10px] font-mono px-1.5 py-1 rounded-[4px] ${tones[tone]}`}>{label}</span>
}

export function ScoreBadge({ label, tone }: { label: string; tone: Severity }) {
  const map: Record<string, string> = {
    positive: 'bg-positive-dim text-positive',
    risk: 'bg-risk-dim text-risk',
    info: 'bg-info-dim text-info',
    neutral: 'bg-surface-2 text-text-secondary',
  }
  return (
    <span className={`font-mono text-[11px] font-medium px-2 py-1 rounded-[4px] ${map[tone]}`}>{label}</span>
  )
}
