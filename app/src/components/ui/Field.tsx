import type { ReactNode } from 'react'

export function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <div className="eyebrow mb-2">{label}</div>
      {children}
    </div>
  )
}

export function FieldRow2({ children }: { children: ReactNode }) {
  return <div className="flex gap-2.5">{children}</div>
}

export function TextInput({ value, placeholder }: { value?: string; placeholder?: boolean }) {
  return (
    <div
      className={`w-full bg-surface border border-border-strong rounded-[4px] px-3.5 py-3 text-[13.5px] ${
        placeholder ? 'text-text-tertiary' : 'text-text-primary'
      }`}
    >
      {value}
    </div>
  )
}

export function SelectRow({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between w-full bg-surface border border-border-strong rounded-[4px] px-3.5 py-3 text-[13.5px] text-text-primary">
      <span>{value}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

export function ChipSelect({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}
