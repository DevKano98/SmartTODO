import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: false,
      
      toggleDarkMode: () => {
        set(state => {
          const newDarkMode = !state.darkMode;
          
          // Update the DOM
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          return { darkMode: newDarkMode };
        });
      },
      
      setDarkMode: (value) => {
        set({ darkMode: value });
        
        // Update the DOM
        if (value) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      initializeTheme: () => {
        set(state => {
          // Check system preference if no stored preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const shouldBeDark = state.darkMode !== undefined ? state.darkMode : prefersDark;
          
          // Update the DOM
          if (shouldBeDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          return { darkMode: shouldBeDark };
        });
      }
    }),
    {
      name: 'theme-storage'
    }
  )
);

export default useThemeStore;
