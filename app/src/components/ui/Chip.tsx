interface Props {
  label: string
  selected?: boolean
  onClick?: () => void
}

export function Chip({ label, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11.5px] px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
        selected
          ? 'bg-surface border-black text-text-primary font-semibold'
          : 'bg-surface-2 border-border text-text-secondary'
      }`}
    >
      {label}
    </button>
  )
}
