import type { ReactNode } from 'react'

export function OptionCard({
  icon,
  title,
  sub,
  highlighted,
  chevron = true,
  onClick,
}: {
  icon: ReactNode
  title: string
  sub: string
  highlighted?: boolean
  chevron?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 bg-surface border rounded-[4px] p-3.5 ${
        highlighted ? 'border-black' : 'border-border-strong'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="w-9 h-9 rounded-[4px] bg-surface-2 flex items-center justify-center text-text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold text-text-primary">{title}</div>
        <div className="text-[11.5px] text-text-secondary mt-0.5">{sub}</div>
      </div>
      {chevron && (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-auto text-text-tertiary shrink-0"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      )}
    </div>
  )
}
