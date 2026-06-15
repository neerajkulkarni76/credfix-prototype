import { create } from 'zustand'
import { recentConversations } from '@/data/mockData'

export interface Conversation {
  id: number
  title: string
  subtitle: string
  status: string
  date: string
  icon: string
  path: string
}

interface ConversationState {
  conversations: Conversation[]
  addConversation: (title: string, subtitle: string, icon: string, path: string) => void
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [...recentConversations] as Conversation[],
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
        },
        ...state.conversations,
      ],
    })),
}))
