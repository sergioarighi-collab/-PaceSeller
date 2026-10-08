import { BrowserRouter, Routes, Route } from 'react-router-dom'
import type { ComponentType } from 'react'
import { useAppStore } from './lib/store'
import { LojistaGate } from './components/desktop/LojistaGate'

import { ProfileSelect } from './screens/shared/ProfileSelect'
import { LoginLojista } from './screens/shared/LoginLojista'
import { LoginRepresentante } from './screens/shared/LoginRepresentante'
import { ForgotPassword } from './screens/shared/ForgotPassword'
import { ResetSent } from './screens/shared/ResetSent'
import { NewPassword } from './screens/shared/NewPassword'
import { PasswordChanged } from './screens/shared/PasswordChanged'

import { WizardStep1 } from './screens/lojista/WizardStep1'
import { WizardStep2 } from './screens/lojista/WizardStep2'
import { Radar } from './screens/lojista/Radar'
import { Catalog } from './screens/lojista/Catalog'
import { MeusCarrinhos } from './screens/lojista/MeusCarrinhos'
import { CarrinhoDetail } from './screens/lojista/CarrinhoDetail'
import { Payment } from './screens/lojista/Payment'
import { OrderConfirmed } from './screens/lojista/OrderConfirmed'
import { Tracking } from './screens/lojista/Tracking'
import { Chat } from './screens/lojista/Chat'
import { Colecao } from './screens/lojista/Colecao'
import { Loyalty } from './screens/lojista/Loyalty'

import { RepRadar } from './screens/representante/Radar'

// "Modo loja" (set/2026): Catálogo/Meus Carrinhos são as MESMAS telas do lojista, reaproveitadas
// pro representante (ver enterLojista em store.ts) — mas só fazem sentido com um lojista escolhido
// no contexto. Sem isso, o representante vê o gate de seleção em vez da tela. O lojista nunca vê
// esse gate (persona !== 'representante' pula direto). Ver guia-dev-frontend.md.
function comLojistaSelecionada<P extends object>(Component: ComponentType<P>) {
  return function Gated(props: P) {
    const persona = useAppStore((s) => s.persona)
    const activeLojistaId = useAppStore((s) => s.activeLojistaId)
    if (persona === 'representante' && !activeLojistaId) return <LojistaGate />
    return <Component {...props} />
  }
}

const GatedCatalog = comLojistaSelecionada(Catalog)
const GatedMeusCarrinhos = comLojistaSelecionada(MeusCarrinhos)
const GatedCarrinhoDetail = comLojistaSelecionada(CarrinhoDetail)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileSelect />} />
        <Route path="/login/lojista" element={<LoginLojista />} />
        <Route path="/login/representante" element={<LoginRepresentante />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/recuperar-senha/enviado" element={<ResetSent />} />
        <Route path="/recuperar-senha/nova" element={<NewPassword />} />
        <Route path="/recuperar-senha/sucesso" element={<PasswordChanged />} />

        <Route path="/onboarding/loja" element={<WizardStep1 />} />
        <Route path="/onboarding/vendas" element={<WizardStep2 />} />

        <Route path="/radar" element={<Radar />} />
        <Route path="/catalogo" element={<GatedCatalog />} />
        <Route path="/catalogo/:id" element={<GatedCatalog />} />
        <Route path="/fidelizacao" element={<Loyalty />} />
        <Route path="/colecoes/fusion" element={<Colecao />} />

        <Route path="/carrinhos" element={<GatedMeusCarrinhos />} />
        <Route path="/carrinhos/:cartId" element={<GatedCarrinhoDetail />} />
        <Route path="/carrinhos/:cartId/:pedidoId/pagamento" element={<Payment />} />
        <Route path="/carrinhos/:cartId/:pedidoId/confirmado" element={<OrderConfirmed />} />
        <Route path="/carrinhos/:cartId/:pedidoId/acompanhamento" element={<Tracking />} />
        <Route path="/carrinhos/:cartId/:pedidoId/chat" element={<Chat />} />

        <Route path="/rep/radar" element={<RepRadar />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
