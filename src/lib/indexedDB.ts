export interface SavedChat {
  id: string;
  title: string;
  chatId: string;
  savedAt: string;
  userId: string;
}

class IndexedDBManager {
  private dbName = "astryx-ai-saved-chats";
  private dbVersion = 1;
  private storeName = "savedChats";

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });
          store.createIndex("userId", "userId", { unique: false });
          store.createIndex("chatId", "chatId", { unique: false });
        }
      };
    });
  }

  async saveChatToIndexedDB(savedChat: SavedChat): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.put(savedChat);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSavedChatsFromIndexedDB(userId: string): Promise<SavedChat[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], "readonly");
    const store = transaction.objectStore(this.storeName);
    const index = store.index("userId");

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const chats = request.result.sort(
          (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
        resolve(chats);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeSavedChatFromIndexedDB(chatId: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    const index = store.index("chatId");

    return new Promise((resolve, reject) => {
      const request = index.getKey(chatId);
      request.onsuccess = () => {
        if (request.result) {
          const deleteRequest = store.delete(request.result);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          resolve(); // Chat not found, consider it already removed
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async isChatSaved(chatId: string): Promise<boolean> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], "readonly");
    const store = transaction.objectStore(this.storeName);
    const index = store.index("chatId");

    return new Promise((resolve, reject) => {
      const request = index.getKey(chatId);
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBManager = new IndexedDBManager();
