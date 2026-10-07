import type { LojistaSinal } from '../../lib/store'

// Um ícone por TIPO de sinal, não só por tom (set/2026) — relógio = aguardando decisão, triângulo =
// estoque em risco (mesmo path do ToneIcon "warning" do Radar do lojista), calendário = tempo sem
// visita, pausa = carrinho parado, check = sem pendência. Compartilhado entre `RepRadar.tsx` e
// `LojistaGate.tsx` (set/2026) — as duas telas mostram o mesmo card por loja, não faz sentido cada
// uma ter seu próprio desenho.
export function SinalIcon({ kind }: { kind: LojistaSinal['kind'] | 'empty' }) {
  switch (kind) {
    case 'revisao':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      )
    case 'estoque':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      )
    case 'visita':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      )
    case 'parado':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="7" y="5" width="3.5" height="14" rx="1" />
          <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
        </svg>
      )
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )
  }
}
