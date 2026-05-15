"use client";

import { useEffect, useRef } from "react";
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
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const newId = user?.id ?? null;
    // Skip if the user ID hasn't changed — prevents repeated cart syncs on re-renders
    if (newId === prevUserIdRef.current) return;
    prevUserIdRef.current = newId;

    if (user) {
      setUser(user);
    } else {
      clearUser();
    }
  }, [user, setUser, clearUser]);

  return null;
}
