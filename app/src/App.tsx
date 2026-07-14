import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ProfileSelect } from './screens/shared/ProfileSelect'
import { LoginLojista } from './screens/shared/LoginLojista'
import { LoginRepresentante } from './screens/shared/LoginRepresentante'
import { WhoIsUsing } from './screens/shared/WhoIsUsing'
import { ConfirmPin } from './screens/shared/ConfirmPin'
import { Orders } from './screens/shared/Orders'
import { Payment } from './screens/shared/Payment'
import { OrderConfirmed } from './screens/shared/OrderConfirmed'
import { Tracking } from './screens/shared/Tracking'

import { WizardStep1 } from './screens/lojista/WizardStep1'
import { WizardStep2 } from './screens/lojista/WizardStep2'
import { GoalSelect } from './screens/lojista/GoalSelect'
import { Radar } from './screens/lojista/Radar'
import { Catalog } from './screens/lojista/Catalog'
import { Planning } from './screens/lojista/Planning'
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

        <Route path="/onboarding/loja" element={<WizardStep1 />} />
        <Route path="/onboarding/vendas" element={<WizardStep2 />} />
        <Route path="/onboarding/objetivo" element={<GoalSelect />} />

        <Route path="/radar" element={<Radar />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/catalogo/:id" element={<Catalog />} />
        <Route path="/planejamento" element={<Planning />} />
        <Route path="/fidelizacao" element={<Loyalty />} />

        <Route path="/rep/radar" element={<RepRadar />} />
        <Route path="/rep/carteira" element={<Wallet />} />
        <Route path="/rep/carteira/:clientId/pedido" element={<SuggestedOrder />} />

        <Route path="/pedidos" element={<Orders />} />
        <Route path="/pedidos/:id" element={<Orders />} />
        <Route path="/pedidos/:id/pagamento" element={<Payment />} />
        <Route path="/pedidos/:id/confirmado" element={<OrderConfirmed />} />
        <Route path="/pedidos/:id/acompanhamento" element={<Tracking />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
