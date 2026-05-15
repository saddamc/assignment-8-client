/**
 * Client-side fetch wrapper that automatically attempts a token refresh
 * on 401 responses, then retries the original request once.
 *
 * All requests use credentials: "include" so the browser sends the
 * httpOnly accessToken / refreshToken cookies to the backend.
 */

import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

async function clearSessionAndRedirect(pathname: string) {
  try {
    // Clear httpOnly cookies on the backend so the proxy doesn't re-authenticate
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore errors — we still want to redirect
  }
  // Clear Zustand auth state so UI shows as logged out
  try {
    const { useAuthStore } = await import("@/hooks/useAuthStore");
    useAuthStore.getState().clearUser();
  } catch {
    // Ignore if store not available
  }
  const redirectPath = encodeURIComponent(pathname);
  window.location.href = `/login?redirect=${redirectPath}`;
}

let isRefreshing = false;
// Queue of resolvers waiting for the refresh to finish
let refreshQueue: Array<(ok: boolean) => void> = [];

const triggerRefresh = (): Promise<boolean> => {
  if (isRefreshing) {
    // Piggyback on the in-flight refresh
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  const refreshPromise = fetch(`${API}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false);

  refreshPromise.then((ok) => {
    isRefreshing = false;
    refreshQueue.forEach((resolve) => resolve(ok));
    refreshQueue = [];
  });

  return refreshPromise;
};

export const clientFetch = async (
  endpoint: string,
  init: RequestInit = {}
): Promise<Response> => {
  const res = await fetch(`${API}${endpoint}`, {
    ...init,
    credentials: "include",
  });

  if (res.status !== 401) return res;

  // Don't auto-refresh/redirect for checkout payment endpoints - let the component handle it
  if (endpoint === "/orders" || endpoint === "/payments/create-checkout-session") {
    return res;
  }

  // Try to refresh the access token
  const refreshed = await triggerRefresh();
  if (!refreshed) {
    if (typeof window !== "undefined") {
      toast.error("Session expired. Please log in again.");
      await clearSessionAndRedirect(window.location.pathname);
    }
    return res;
  }

  // Retry the original request with the new cookie
  const retryRes = await fetch(`${API}${endpoint}`, {
    ...init,
    credentials: "include",
  });

  if (retryRes.status === 401 && typeof window !== "undefined") {
    toast.error("Session expired. Please log in again.");
    await clearSessionAndRedirect(window.location.pathname);
  }

  return retryRes;
};
