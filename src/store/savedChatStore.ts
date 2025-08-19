import { create } from "zustand";
import { indexedDBManager, type SavedChat } from "@/lib/indexedDB";
import { toast } from "sonner";

interface SavedChatStore {
  savedChats: SavedChat[];
  isLoading: boolean;
  loadSavedChats: (userId: string) => Promise<void>;
  saveChat: (chatId: string, title: string, userId: string) => Promise<void>;
  removeSavedChat: (chatId: string) => Promise<void>;
  isChatSaved: (chatId: string) => boolean;
}

export const useSavedChatStore = create<SavedChatStore>((set, get) => ({
  savedChats: [],
  isLoading: false,

  loadSavedChats: async (userId: string) => {
    set({ isLoading: true });
    try {
      const savedChats = await indexedDBManager.getSavedChatsFromIndexedDB(userId);
      set({ savedChats, isLoading: false });
    } catch (error) {
      console.error("Failed to load saved chats:", error);
      toast.error("Failed to load saved chats");
      set({ isLoading: false });
    }
  },

  saveChat: async (chatId: string, title: string, userId: string) => {
    try {
      // Check if chat is already saved
      const isAlreadySaved = await indexedDBManager.isChatSaved(chatId);
      if (isAlreadySaved) {
        toast.info("Chat is already saved");
        return;
      }

      const savedChat: SavedChat = {
        id: `saved-${chatId}-${Date.now()}`,
        chatId,
        title,
        userId,
        savedAt: new Date().toISOString(),
      };

      await indexedDBManager.saveChatToIndexedDB(savedChat);

      const { savedChats } = get();
      set({ savedChats: [savedChat, ...savedChats] });

      toast.success("Chat saved successfully");
    } catch (error) {
      console.error("Failed to save chat:", error);
      toast.error("Failed to save chat");
    }
  },

  removeSavedChat: async (chatId: string) => {
    try {
      await indexedDBManager.removeSavedChatFromIndexedDB(chatId);

      const { savedChats } = get();
      set({
        savedChats: savedChats.filter(chat => chat.chatId !== chatId),
      });
    } catch (error) {
      console.error("Failed to remove saved chat:", error);
    }
  },

  isChatSaved: (chatId: string) => {
    const { savedChats } = get();
    return savedChats.some(chat => chat.chatId === chatId);
  },
}));
