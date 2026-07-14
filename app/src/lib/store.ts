import { create } from 'zustand'
import type { Persona, User } from './types'
import { users } from './data'

interface AppState {
  persona: Persona | null
  setPersona: (p: Persona) => void

  activeUser: User | null
  setActiveUser: (u: User) => void

  goalId: string
  setGoal: (id: string) => void

  focusOpen: boolean
  openFocus: () => void
  closeFocus: () => void

  activeOrderId: string
  setActiveOrderId: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  persona: null,
  setPersona: (p) => set({ persona: p }),

  activeUser: null,
  setActiveUser: (u) => set({ activeUser: u }),

  goalId: 'g1',
  setGoal: (id) => set({ goalId: id }),

  focusOpen: false,
  openFocus: () => set({ focusOpen: true }),
  closeFocus: () => set({ focusOpen: false }),

  activeOrderId: 'o1',
  setActiveOrderId: (id) => set({ activeOrderId: id }),
}))

export const defaultTitular = users[0]
