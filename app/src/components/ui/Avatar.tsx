export function Avatar({ initials, dark = true }: { initials: string; dark?: boolean }) {
  return (
    <div
      className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-mono text-[10.5px] font-semibold shrink-0 ${
        dark ? 'bg-black text-white' : 'bg-surface-3 text-text-primary'
      }`}
    >
      {initials}
    </div>
  )
}

export function Stepper({ qty, onChange }: { qty: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={() => onChange?.(Math.max(0, qty - 1))}
        className="w-6 h-6 rounded-[4px] bg-surface-2 border border-border text-text-secondary flex items-center justify-center text-[13px]"
      >
        −
      </button>
      <span className="font-mono text-[13px] text-text-primary min-w-[18px] text-center">{qty}</span>
      <button
        onClick={() => onChange?.(qty + 1)}
        className="w-6 h-6 rounded-[4px] bg-surface-2 border border-border text-text-secondary flex items-center justify-center text-[13px]"
      >
        +
      </button>
    </div>
  )
}
