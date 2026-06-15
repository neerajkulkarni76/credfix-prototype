import { create } from 'zustand'

interface FDEntry {
  amount: number
  date: string
  interestRate: number
}

interface FDState {
  activated: boolean
  deposits: FDEntry[]
  setActivated: (v: boolean) => void
  addDeposit: (amount: number) => void
}

export const useFDStore = create<FDState>((set) => ({
  activated: false,
  deposits: [],
  setActivated: (activated) => set({ activated }),
  addDeposit: (amount) =>
    set((state) => ({
      activated: true,
      deposits: [
        ...state.deposits,
        {
          amount,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
          interestRate: 7.5,
        },
      ],
    })),
}))
