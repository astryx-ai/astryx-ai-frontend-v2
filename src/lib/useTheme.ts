import { useEffect } from "react";
import useThemeStore from "@/store/themeStore";

export const useTheme = () => {
  const { theme, isDarkMode, setTheme, toggleTheme, initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return {
    theme,
    isDarkMode,
    isLightMode: !isDarkMode,
    setTheme,
    toggleTheme,
    setLightMode: () => setTheme("light"),
    setDarkMode: () => setTheme("dark"),
  };
};

// Helper function for non-React contexts
export const getTheme = () => {
  const state = useThemeStore.getState();
  return {
    theme: state.theme,
    isDarkMode: state.isDarkMode,
    isLightMode: !state.isDarkMode,
  };
};
