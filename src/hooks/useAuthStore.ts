import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePhoto?: string | null;
  storeName?: string | null;
  storeDescription?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  bio?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "luxecommerce-auth-storage",
    }
  )
);
