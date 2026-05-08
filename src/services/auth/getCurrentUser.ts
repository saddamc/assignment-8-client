"use server";

import { getCookie } from "@/services/auth/tokenHandlers";
import { getNewAccessToken } from "@/services/auth/auth.service";
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

async function refreshAccessToken() {
  const result = await getNewAccessToken();
  return result.tokenRefreshed;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    let accessToken = await getCookie("accessToken");

    if (!accessToken) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) return null;
      accessToken = await getCookie("accessToken");
      if (!accessToken) return null;
    }

    let payload = decodePayload(accessToken);
    if (!payload || !payload.role) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) return null;
      accessToken = await getCookie("accessToken");
      if (!accessToken) return null;
      payload = decodePayload(accessToken);
      if (!payload || !payload.role) return null;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

    const fetchMe = async (token: string) => {
      return await fetch(`${apiUrl}/user/me`, {
        headers: {
          Cookie: `accessToken=${token}`,
        },
        cache: "no-store",
      });
    };

    let res = await fetchMe(accessToken);
    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        accessToken = await getCookie("accessToken");
        if (accessToken) {
          payload = decodePayload(accessToken);
          if (!payload || !payload.role) return null;
          res = await fetchMe(accessToken);
        }
      }
    }

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
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
      }
    }

    return {
      id: payload.id || payload.userId || "",
      name: payload.name || "User",
      email: payload.email || "",
      role: payload.role as AuthUser["role"],
      profilePhoto: null,
      storeName: null,
    };
  } catch {
    return null;
  }
}
