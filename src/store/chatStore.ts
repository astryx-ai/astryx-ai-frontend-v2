import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message } from "@/types/chatType";

interface ChatStore {
  currentChatId: string | null;
  chatMessages: Record<string, Message[]>; // chatId -> messages array
  chatTitle: string | null;
  setCurrentChatId: (id: string | null) => void;
  setChatTitle: (title: string) => void;
  addMessageToChat: (chatId: string, message: Message) => void;
  setChatMessages: (chatId: string, messages: Message[]) => void;
  initializeChat: (chatId: string) => void;
  clearCurrentChat: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentChatId: null,
      chatMessages: {},
      chatTitle: null,

      setChatTitle: (title: string) => set({ chatTitle: title }),
      getChatTitle: () => get().chatTitle,
      setCurrentChatId: id => set({ currentChatId: id }),

      addMessageToChat: (chatId, message) => {
        const { chatMessages } = get();
        set({
          chatMessages: {
            ...chatMessages,
            [chatId]: [...(chatMessages[chatId] || []), message],
          },
        });
      },

      setChatMessages: (chatId, messages) => {
        const { chatMessages } = get();
        set({
          chatMessages: {
            ...chatMessages,
            [chatId]: messages,
          },
        });
      },

      initializeChat: chatId => {
        const { chatMessages } = get();
        if (!chatMessages[chatId]) {
          set({
            chatMessages: {
              ...chatMessages,
              [chatId]: [],
            },
          });
        }
      },

      clearCurrentChat: () => set({ currentChatId: null }),
    }),
    {
      name: "chat-store", // unique name for localStorage key
      partialize: (state) => ({
        chatMessages: state.chatMessages,
        currentChatId: state.currentChatId,
        chatTitle: state.chatTitle,
      }),
    }
  )
);
