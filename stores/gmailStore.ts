import { create } from 'zustand'

interface GmailState {
  activated: boolean
  setActivated: (v: boolean) => void
}

export const useGmailStore = create<GmailState>((set) => ({
  activated: false,
  setActivated: (activated) => set({ activated }),
}))
