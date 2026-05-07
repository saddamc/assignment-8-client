/**
 * Client-side fetch wrapper that automatically attempts a token refresh
 * on 401 responses, then retries the original request once.
 *
 * All requests use credentials: "include" so the browser sends the
 * httpOnly accessToken / refreshToken cookies to the backend.
 */

const API = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

let isRefreshing = false;
// Queue of resolvers waiting for the refresh to finish
let refreshQueue: Array<(ok: boolean) => void> = [];

const triggerRefresh = (): Promise<boolean> => {
  if (isRefreshing) {
    // Piggyback on the in-flight refresh
    return new Promise((resolve) => { refreshQueue.push(resolve); });
  }

  isRefreshing = true;

  return fetch(`${API}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally((ok?: boolean) => {
      isRefreshing = false;
      const result = ok ?? false;
      refreshQueue.forEach((resolve) => resolve(result));
      refreshQueue = [];
      return result;
    }) as Promise<boolean>;
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

  // Try to refresh the access token
  const refreshed = await triggerRefresh();
  if (!refreshed) return res; // refresh failed, return the 401

  // Retry the original request with the new cookie
  return fetch(`${API}${endpoint}`, {
    ...init,
    credentials: "include",
  });
};
