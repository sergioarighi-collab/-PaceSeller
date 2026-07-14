import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppStore } from '../../lib/store'
import { RadarIcon, CatalogIcon, PlanIcon, OrdersIcon, ClientsIcon } from './icons'

const lojistaNav = [
  { to: '/radar', label: 'Radar', icon: RadarIcon },
  { to: '/catalogo', label: 'Catálogo', icon: CatalogIcon },
  { to: '/planejamento', label: 'Planejar', icon: PlanIcon },
  { to: '/pedidos', label: 'Pedidos', icon: OrdersIcon },
  { to: '/fidelizacao', label: 'Clientes', icon: ClientsIcon },
]

const repNav = [
  { to: '/rep/radar', label: 'Radar', icon: RadarIcon },
  { to: '/rep/carteira', label: 'Carteira', icon: ClientsIcon },
  { to: '/catalogo', label: 'Catálogo', icon: CatalogIcon },
  { to: '/pedidos', label: 'Pedidos', icon: OrdersIcon },
]

export function AppShell({ children }: { children: ReactNode }) {
  const persona = useAppStore((s) => s.persona)
  const items = persona === 'representante' ? repNav : lojistaNav

  return (
    <div className="min-h-screen bg-app flex md:flex-row flex-col">
      <nav className="hidden md:flex md:flex-col md:w-[76px] md:border-r md:border-border md:bg-surface-2 md:items-center md:gap-6 md:py-6 md:sticky md:top-0 md:h-screen shrink-0">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'text-black' : 'text-text-tertiary'}`
            }
          >
            <item.icon />
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">{children}</main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 flex justify-around items-center px-2 py-2.5 pb-4 border-t border-border bg-surface z-20">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'text-black' : 'text-text-tertiary'}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon />
                <span className={`text-[9px] ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
