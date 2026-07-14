import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  const base =
    'font-body font-semibold text-sm rounded-[4px] px-4 py-3 text-center transition-colors disabled:opacity-40'
  const styles = {
    primary: 'bg-black text-on-black hover:bg-black/90',
    secondary: 'bg-surface border border-border-strong text-text-primary font-medium hover:bg-surface-2',
    outline: 'bg-surface border border-border-strong text-text-primary font-medium hover:bg-surface-2',
  }[variant]
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  )
}
