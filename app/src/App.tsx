import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ProfileSelect } from './screens/shared/ProfileSelect'
import { LoginLojista } from './screens/shared/LoginLojista'
import { LoginRepresentante } from './screens/shared/LoginRepresentante'
import { ForgotPassword } from './screens/shared/ForgotPassword'
import { ResetSent } from './screens/shared/ResetSent'
import { NewPassword } from './screens/shared/NewPassword'
import { PasswordChanged } from './screens/shared/PasswordChanged'
import { WhoIsUsing } from './screens/shared/WhoIsUsing'
import { ConfirmPin } from './screens/shared/ConfirmPin'

import { WizardStep1 } from './screens/lojista/WizardStep1'
import { WizardStep2 } from './screens/lojista/WizardStep2'
import { GoalSelect } from './screens/lojista/GoalSelect'
import { Radar } from './screens/lojista/Radar'
import { Catalog } from './screens/lojista/Catalog'
import { Planning } from './screens/lojista/Planning'
import { MeusCarrinhos } from './screens/lojista/MeusCarrinhos'
import { CarrinhoDetail } from './screens/lojista/CarrinhoDetail'
import { Payment } from './screens/lojista/Payment'
import { OrderConfirmed } from './screens/lojista/OrderConfirmed'
import { Loyalty } from './screens/lojista/Loyalty'

import { RepRadar } from './screens/representante/Radar'
import { Wallet } from './screens/representante/Wallet'
import { SuggestedOrder } from './screens/representante/SuggestedOrder'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileSelect />} />
        <Route path="/login/lojista" element={<LoginLojista />} />
        <Route path="/login/representante" element={<LoginRepresentante />} />
        <Route path="/login/quem-esta-usando" element={<WhoIsUsing />} />
        <Route path="/login/pin/:userId" element={<ConfirmPin />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/recuperar-senha/enviado" element={<ResetSent />} />
        <Route path="/recuperar-senha/nova" element={<NewPassword />} />
        <Route path="/recuperar-senha/sucesso" element={<PasswordChanged />} />

        <Route path="/onboarding/loja" element={<WizardStep1 />} />
        <Route path="/onboarding/vendas" element={<WizardStep2 />} />
        <Route path="/onboarding/objetivo" element={<GoalSelect />} />

        <Route path="/radar" element={<Radar />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/catalogo/:id" element={<Catalog />} />
        <Route path="/planejamento" element={<Planning />} />
        <Route path="/fidelizacao" element={<Loyalty />} />

        <Route path="/carrinhos" element={<MeusCarrinhos />} />
        <Route path="/carrinhos/:cartId" element={<CarrinhoDetail />} />
        <Route path="/carrinhos/:cartId/:pedidoId/pagamento" element={<Payment />} />
        <Route path="/carrinhos/:cartId/:pedidoId/confirmado" element={<OrderConfirmed />} />

        <Route path="/rep/radar" element={<RepRadar />} />
        <Route path="/rep/carteira" element={<Wallet />} />
        <Route path="/rep/carteira/:clientId/pedido" element={<SuggestedOrder />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
