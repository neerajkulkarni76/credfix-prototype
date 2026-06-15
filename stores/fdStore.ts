import { create } from 'zustand'

interface FDState {
  activated: boolean
  setActivated: (v: boolean) => void
}

export const useFDStore = create<FDState>((set) => ({
  activated: false,
  setActivated: (activated) => set({ activated }),
}))
