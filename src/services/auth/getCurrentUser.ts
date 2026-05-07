"use server";

import { getCookie } from "@/services/auth/tokenHandlers";
import type { AuthUser } from "@/hooks/useAuthStore";

interface TokenPayload {
  id?: string;
  userId?: string;
  role?: string;
  name?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

function decodePayload(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const accessToken = await getCookie("accessToken");
    if (!accessToken) return null;

    const payload = decodePayload(accessToken);
    if (!payload || !payload.role) return null;

    const apiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

    const res = await fetch(`${apiUrl}/user/me`, {
      headers: {
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      // Fallback: construct partial user from token only
      return {
        id: payload.id || payload.userId || "",
        name: payload.name || "User",
        email: payload.email || "",
        role: payload.role as AuthUser["role"],
        profilePhoto: null,
        storeName: null,
      };
    }

    const data = await res.json();
    if (!data.success || !data.data) {
      return {
        id: payload.id || payload.userId || "",
        name: payload.name || "User",
        email: payload.email || "",
        role: payload.role as AuthUser["role"],
      };
    }

    const u = data.data;
    return {
      id: u.id || payload.id || "",
      name: u.customer?.name || u.seller?.name || u.name || "User",
      email: u.email || u.customer?.email || u.seller?.email || "",
      role: u.role || (payload.role as AuthUser["role"]),
      profilePhoto:
        u.customer?.profilePhoto || u.seller?.profilePhoto || null,
      storeName: u.seller?.storeName || null,
    };
  } catch {
    return null;
  }
}
