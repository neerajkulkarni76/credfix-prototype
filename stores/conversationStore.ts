import { create } from 'zustand'

export interface ThreadState {
  step: number
  legalChoice: string
  selectedProofs: string[]
}

export interface Conversation {
  id: number
  title: string
  subtitle: string
  status: string
  date: string
  icon: string
  path: string
  threadState?: ThreadState
}

const defaultConversations: Conversation[] = [
  {
    id: 1,
    title: 'Bajaj Finserv — Settlement',
    subtitle: 'Lender offered ₹50,000 · Save ₹36,200',
    status: 'Action Required',
    date: 'Today',
    icon: '🤝',
    path: 'chat/settlement',
  },
  {
    id: 2,
    title: 'HDFC Bank — Legal Notice',
    subtitle: 'Sec 25 notice · Reply needed in 4 days',
    status: 'Action Required',
    date: 'Today',
    icon: '⚖️',
    path: 'chat/legal',
  },
]

interface ConversationState {
  conversations: Conversation[]
  addConversation: (title: string, subtitle: string, icon: string, path: string) => void
  updateThreadState: (path: string, threadState: Partial<ThreadState>) => void
  getThreadState: (path: string) => ThreadState | undefined
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [...defaultConversations],
  addConversation: (title, subtitle, icon, path) =>
    set((state) => ({
      conversations: [
        {
          id: Date.now(),
          title,
          subtitle,
          status: 'Active',
          date: 'Just now',
          icon,
          path,
          threadState: { step: 0, legalChoice: '', selectedProofs: [] },
        },
        ...state.conversations,
      ],
    })),
  updateThreadState: (path, partial) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.path === path
          ? { ...c, threadState: { ...(c.threadState || { step: 0, legalChoice: '', selectedProofs: [] }), ...partial } }
          : c
      ),
    })),
  getThreadState: (path) => {
    const conv = get().conversations.find((c) => c.path === path)
    return conv?.threadState
  },
}))
