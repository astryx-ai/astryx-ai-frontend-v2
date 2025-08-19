import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const applyTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;

  const root = document.documentElement;

  // Remove existing theme classes
  root.classList.remove("light", "dark");

  // Add new theme class
  root.classList.add(theme);

  return theme === "dark";
};

const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      isDarkMode: false,

      setTheme: (theme: Theme) => {
        const isDark = applyTheme(theme);
        set({ theme, isDarkMode: isDark });
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === "dark" ? "light" : "dark";
        get().setTheme(newTheme);
      },

      initializeTheme: () => {
        const { theme } = get();
        const isDark = applyTheme(theme);
        set({ isDarkMode: isDark });
      },
    }),
    {
      name: "theme-storage",
      partialize: state => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;
