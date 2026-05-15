import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "./useCartStore";

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
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: async (user) => {
        set({ user, isAuthenticated: true });
        // Sync cart when customer logs in
        if (user.role === "CUSTOMER") {
          try {
            await useCartStore.getState().syncWithBackend();
          } catch (error) {
            console.error("Failed to sync cart on login:", error);
          }
        }
      },

      clearUser: () => {
        set({ user: null, isAuthenticated: false });
        // Don't clear cart on logout - it should persist on server
        // useCartStore.getState().clearCart();
      },
    }),
    {
      name: "luxecommerce-auth-storage",
    }
  )
);
