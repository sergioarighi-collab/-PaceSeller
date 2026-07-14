export function GoalCard({
  icon,
  title,
  sub,
  selected,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 bg-surface border rounded-[4px] p-4 mt-2.5 cursor-pointer ${
        selected ? 'border-black bg-surface-2' : 'border-border'
      }`}
    >
      <div
        className={`w-9.5 h-9.5 rounded-[4px] flex items-center justify-center shrink-0 ${
          selected ? 'bg-black text-on-black' : 'bg-surface-2 text-text-primary'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-display text-sm font-semibold text-text-primary">{title}</div>
        <div className="text-[11.5px] text-text-secondary mt-0.5 leading-snug">{sub}</div>
      </div>
      <div
        className={`w-[19px] h-[19px] rounded-full border shrink-0 ml-auto flex items-center justify-center text-[10px] ${
          selected ? 'bg-black border-black text-white' : 'border-border-strong'
        }`}
      >
        {selected ? '✓' : ''}
      </div>
    </div>
  )
}
