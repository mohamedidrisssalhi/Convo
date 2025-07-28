
import { create } from "zustand";

// Zustand store for managing the application's theme.
// Persists the selected theme in localStorage and provides a setter.
export const useThemeStore = create((set) => ({
  // Current theme (defaults to 'coffee' if not set)
  theme: localStorage.getItem("chat-theme") || "coffee",
  // Function to update the theme and persist it
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
