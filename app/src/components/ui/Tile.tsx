export function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 bg-surface border border-border rounded-[4px] px-2.5 py-3">
      <div className="text-[10px] text-text-tertiary font-mono uppercase">{label}</div>
      <div className="font-mono text-base font-medium text-text-primary mt-1">{value}</div>
    </div>
  )
}
