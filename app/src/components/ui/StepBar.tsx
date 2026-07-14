export function StepBar({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="flex gap-1.5 mb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`flex-1 h-[3px] rounded-full ${i < step ? 'bg-black' : 'bg-border-strong'}`} />
      ))}
    </div>
  )
}
