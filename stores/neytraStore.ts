import { create } from 'zustand'

interface NeytraState {
  activated: boolean
  firstVisitDone: boolean
  setActivated: (v: boolean) => void
  setFirstVisitDone: () => void
}

export const useNeytraStore = create<NeytraState>((set) => ({
  activated: false,
  firstVisitDone: false,
  setActivated: (activated) => set({ activated }),
  setFirstVisitDone: () => set({ firstVisitDone: true }),
}))
