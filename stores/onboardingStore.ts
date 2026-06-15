import { create } from 'zustand'

interface OnboardingState {
  phone: string
  q1Answer: string
  q2Answer: string
  q3Answer: string
  firstName: string
  lastName: string
  email: string
  setPhone: (phone: string) => void
  setQ1: (a: string) => void
  setQ2: (a: string) => void
  setQ3: (a: string) => void
  setProfile: (f: string, l: string, e: string) => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  phone: '', q1Answer: '', q2Answer: '', q3Answer: '', firstName: '', lastName: '', email: '',
  setPhone: (phone) => set({ phone }),
  setQ1: (q1Answer) => set({ q1Answer }),
  setQ2: (q2Answer) => set({ q2Answer }),
  setQ3: (q3Answer) => set({ q3Answer }),
  setProfile: (firstName, lastName, email) => set({ firstName, lastName, email }),
}))
