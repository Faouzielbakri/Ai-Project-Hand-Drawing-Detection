import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false, 'setUser'),
        logout: () =>
          set({ user: null, isAuthenticated: false }, false, 'logout'),
      }),
      {
        name: 'app-storage',
      }
    )
  )
);
