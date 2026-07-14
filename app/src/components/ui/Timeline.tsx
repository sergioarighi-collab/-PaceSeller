export interface TStep {
  id: string
  status: 'done' | 'current' | 'pending'
  title: string
  date: string
  desc?: string
}

export function Timeline({ steps }: { steps: TStep[] }) {
  return (
    <div className="mt-1">
      {steps.map((s, i) => (
        <div key={s.id} className="flex gap-3.5 pb-5.5 relative">
          {i < steps.length - 1 && (
            <div className="absolute left-[9px] top-5 bottom-0 w-px bg-border" />
          )}
          <div
            className={`w-[19px] h-[19px] rounded-full border-[1.5px] shrink-0 flex items-center justify-center text-[9px] z-10 ${
              s.status === 'done'
                ? 'bg-black border-black text-white'
                : s.status === 'current'
                  ? 'border-black text-black'
                  : 'border-border-strong text-text-tertiary bg-surface'
            }`}
          >
            {s.status === 'done' ? '✓' : s.status === 'current' ? '●' : ''}
          </div>
          <div>
            <div className="text-[13.5px] font-semibold text-text-primary">{s.title}</div>
            <div className="font-mono text-[11px] text-text-tertiary mt-0.5">{s.date}</div>
            {s.desc && <div className="text-xs text-text-secondary mt-1 leading-snug max-w-[240px]">{s.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
