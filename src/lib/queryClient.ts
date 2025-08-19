import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time of 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache time of 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay that will exponentially back off
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Simple IndexedDB wrapper with synchronous interface for persistence
class IndexedDBStorage {
  private dbName = "AstryxQueryCache";
  private storeName = "queryCache";
  private version = 1;
  private cache = new Map<string, string>();

  constructor() {
    // Initialize the cache on construction
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return;
    }

    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      const request = store.getAll();
      request.onsuccess = () => {
        request.result.forEach((item: { key: string; value: string }) => {
          this.cache.set(item.key, item.value);
        });
      };
      request.onerror = () => {
        console.warn("Failed to load IndexedDB cache");
      };
    } catch (error) {
      console.warn("Failed to initialize IndexedDB:", error);
    }
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };
    });
  }

  getItem(key: string): string | null {
    return this.cache.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.cache.set(key, value);
    // Async save to IndexedDB (fire and forget)
    this.saveToIndexedDB(key, value);
  }

  removeItem(key: string): void {
    this.cache.delete(key);
    // Async remove from IndexedDB (fire and forget)
    this.removeFromIndexedDB(key);
  }

  private async saveToIndexedDB(key: string, value: string): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) return;

    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      store.put({ key, value });
    } catch (error) {
      console.warn("Failed to save to IndexedDB:", error);
    }
  }

  private async removeFromIndexedDB(key: string): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) return;

    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      store.delete(key);
    } catch (error) {
      console.warn("Failed to remove from IndexedDB:", error);
    }
  }
}

// Create storage instance
const createStorage = () => {
  if (typeof window !== "undefined") {
    try {
      if (window.indexedDB) {
        return new IndexedDBStorage();
      }
    } catch (error) {
      console.warn("IndexedDB not available, falling back to localStorage:", error);
    }
    // Fallback to localStorage
    return window.localStorage;
  }
  // Server-side fallback
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

// Create a persister
const persister = createSyncStoragePersister({
  storage: createStorage(),
  key: "ASTRYX_QUERY_CACHE",
});

// Set up persistence
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  buster: "1.0.0", // Change this when you want to invalidate all cached data
});

export { persister };
