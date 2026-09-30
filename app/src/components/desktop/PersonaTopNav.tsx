import { useAppStore } from '../../lib/store'
import { WebTopNav } from './WebTopNav'
import { RepTopNav } from './RepTopNav'

// Catálogo, Meus Carrinhos e Carrinho (screens/lojista/*) são reaproveitados pro representante em
// "modo loja" (ver enterLojista em store.ts, comLojistaSelecionada em App.tsx) — o topo precisa
// mudar conforme quem está usando, senão o representante veria o nav/avatar do lojista (ex:
// "Radical Skate · Porto Alegre, RS" fixo no WebTopNav) atendendo uma loja completamente diferente.
export function PersonaTopNav() {
  const persona = useAppStore((s) => s.persona)
  return persona === 'representante' ? <RepTopNav /> : <WebTopNav />
}
