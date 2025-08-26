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
  updateMessageById: (
    chatId: string,
    messageId: string,
    updater: Partial<Message> | ((message: Message) => Message)
  ) => void;
  appendToMessageContent: (chatId: string, messageId: string, delta: string) => void;
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

      updateMessageById: (chatId, messageId, updater) => {
        const { chatMessages } = get();
        const messages = chatMessages[chatId] || [];
        const updated = messages.map(m => {
          if (m.id !== messageId) return m;
          if (typeof updater === "function") {
            return (updater as (message: Message) => Message)(m);
          }
          return { ...m, ...(updater as Partial<Message>) } as Message;
        });
        set({
          chatMessages: {
            ...chatMessages,
            [chatId]: updated,
          },
        });
      },

      appendToMessageContent: (chatId, messageId, delta) => {
        const { chatMessages } = get();
        const messages = chatMessages[chatId] || [];
        const updated = messages.map(m =>
          m.id === messageId ? { ...m, content: `${m.content}${delta}` } : m
        );
        set({
          chatMessages: {
            ...chatMessages,
            [chatId]: updated,
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

      clearCurrentChat: () => {
        const { currentChatId, chatMessages } = get();
        if (currentChatId && chatMessages[currentChatId]) {
          const remaining = { ...chatMessages };
          delete remaining[currentChatId];
          set({
            currentChatId: null,
            chatTitle: null,
            chatMessages: remaining,
          });
        } else {
          set({
            currentChatId: null,
            chatTitle: null,
          });
        }
      },
    }),
    { name: "chat-store" }
  )
);
