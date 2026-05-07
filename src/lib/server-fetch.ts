import { getCookie } from "@/services/auth/tokenHandlers";
import { getNewAccessToken } from "@/services/auth/auth.service";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

const serverFetchHelper = async (endpoint: string, options: RequestInit): Promise<Response> => {
    const { headers, ...restOptions } = options;

    // To stop recursion loop - refresh first, then read the (potentially new) token
    if (endpoint !== "/auth/refresh-token") {
        await getNewAccessToken();
    }

    const accessToken = await getCookie("accessToken");

    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
        headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "", // Added Authorization header
            Cookie: accessToken ? `accessToken=${accessToken}` : "",
            ...headers,
        },
        ...restOptions,
    });

    return response;
};

export const serverFetch = {
    get: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "GET" }),
    post: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "POST" }),
    put: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "PUT" }),
    patch: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "PATCH" }),
    delete: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "DELETE" }),
};
