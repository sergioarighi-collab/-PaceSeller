import type { Client } from '../../lib/types'
import { ScoreBadge } from './Badge'

export function ClientCard({ client, onAction }: { client: Client; onAction?: () => void }) {
  return (
    <div
      className={`bg-surface border rounded-[4px] p-3.5 mt-2.5 md:mt-0 ${
        client.opportunity ? 'border-black border-[1.5px]' : 'border-border'
      }`}
    >
      {client.opportunity && (
        <span className="inline-block bg-black text-white font-mono text-[9.5px] uppercase tracking-wide px-1.5 py-0.5 rounded-[3px] mb-2">
          Oportunidade
        </span>
      )}
      <div className="flex justify-between items-start gap-2">
        <div className="font-display text-[15px] font-semibold text-text-primary">{client.name}</div>
        <ScoreBadge label={client.scoreLabel} tone={client.scoreTone} />
      </div>
      <p className="text-xs text-text-secondary mt-2 leading-snug">{client.suggestion}</p>
      <button
        onClick={onAction}
        className={`mt-2.5 inline-block text-xs font-semibold px-3.5 py-2 rounded-[4px] ${
          client.actionStyle === 'primary'
            ? 'bg-black text-on-black'
            : 'bg-surface border border-border-strong text-text-primary'
        }`}
      >
        {client.actionLabel}
      </button>
    </div>
  )
}
