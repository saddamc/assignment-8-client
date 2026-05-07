"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/hooks/useAuthStore";
import type { AuthUser } from "@/hooks/useAuthStore";

interface Props {
  user: AuthUser | null;
}

/**
 * Syncs the server-fetched user into the Zustand store on the client.
 * Rendered at the layout level so every page gets auth state.
 */
export default function AuthSync({ user }: Props) {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    if (user) {
      setUser(user);
    } else {
      clearUser();
    }
  }, [user, setUser, clearUser]);

  return null;
}
